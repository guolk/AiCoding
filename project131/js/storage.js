const Storage = {
    KEYS: {
        MODELS: 'mental_models',
        DECISIONS: 'decisions',
        TRACKING: 'tracking',
        CASES: 'cases',
        EVOLUTIONS: 'evolutions'
    },

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    formatDate(date) {
        return new Date(date || Date.now()).toISOString().split('T')[0];
    }
};

const ModelStore = {
    getAll() {
        return Storage.get(Storage.KEYS.MODELS) || [];
    },

    getById(id) {
        const models = this.getAll();
        return models.find(m => m.id === id);
    },

    add(model) {
        const models = this.getAll();
        const newModel = {
            id: Storage.generateId(),
            ...model,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        models.push(newModel);
        Storage.set(Storage.KEYS.MODELS, models);
        return newModel;
    },

    update(id, updates) {
        const models = this.getAll();
        const index = models.findIndex(m => m.id === id);
        if (index !== -1) {
            models[index] = {
                ...models[index],
                ...updates,
                updatedAt: Date.now()
            };
            Storage.set(Storage.KEYS.MODELS, models);
            return models[index];
        }
        return null;
    },

    delete(id) {
        const models = this.getAll().filter(m => m.id !== id);
        Storage.set(Storage.KEYS.MODELS, models);
    },

    search(query, category) {
        let models = this.getAll();
        if (query) {
            const lowerQuery = query.toLowerCase();
            models = models.filter(m => 
                m.name.toLowerCase().includes(lowerQuery) ||
                m.coreConcept.toLowerCase().includes(lowerQuery) ||
                m.scenarios.toLowerCase().includes(lowerQuery)
            );
        }
        if (category) {
            models = models.filter(m => m.category === category);
        }
        return models;
    }
};

const DecisionStore = {
    getAll() {
        return Storage.get(Storage.KEYS.DECISIONS) || [];
    },

    getById(id) {
        const decisions = this.getAll();
        return decisions.find(d => d.id === id);
    },

    add(decision) {
        const decisions = this.getAll();
        const newDecision = {
            id: Storage.generateId(),
            ...decision,
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        decisions.push(newDecision);
        Storage.set(Storage.KEYS.DECISIONS, decisions);
        return newDecision;
    },

    update(id, updates) {
        const decisions = this.getAll();
        const index = decisions.findIndex(d => d.id === id);
        if (index !== -1) {
            decisions[index] = {
                ...decisions[index],
                ...updates,
                updatedAt: Date.now()
            };
            Storage.set(Storage.KEYS.DECISIONS, decisions);
            return decisions[index];
        }
        return null;
    },

    delete(id) {
        const decisions = this.getAll().filter(d => d.id !== id);
        Storage.set(Storage.KEYS.DECISIONS, decisions);
    },

    recommendModels(decision) {
        const models = ModelStore.getAll();
        const lowerContext = (decision.background + ' ' + decision.whatToDecide).toLowerCase();
        const recommended = [];

        models.forEach(model => {
            let score = 0;
            const modelText = (model.coreConcept + ' ' + model.scenarios + ' ' + model.name).toLowerCase();
            
            if (lowerContext.includes('投资') || lowerContext.includes('风险')) {
                if (modelText.includes('风险') || modelText.includes('成本') || modelText.includes('概率')) {
                    score += 3;
                }
            }
            if (lowerContext.includes('职业') || lowerContext.includes('工作')) {
                if (modelText.includes('机会') || modelText.includes('逆向') || modelText.includes('第一性')) {
                    score += 3;
                }
            }
            if (lowerContext.includes('创业') || lowerContext.includes('产品')) {
                if (modelText.includes('奥卡姆') || modelText.includes('第一性') || modelText.includes('反馈')) {
                    score += 3;
                }
            }
            
            model.keywords?.forEach(kw => {
                if (lowerContext.includes(kw.toLowerCase())) {
                    score += 2;
                }
            });

            if (score > 0) {
                recommended.push({ ...model, score });
            }
        });

        return recommended.sort((a, b) => b.score - a.score).slice(0, 5);
    }
};

const TrackingStore = {
    getAll() {
        return Storage.get(Storage.KEYS.TRACKING) || [];
    },

    getById(id) {
        const records = this.getAll();
        return records.find(r => r.id === id);
    },

    add(record) {
        const records = this.getAll();
        const newRecord = {
            id: Storage.generateId(),
            ...record,
            createdAt: Date.now()
        };
        records.push(newRecord);
        Storage.set(Storage.KEYS.TRACKING, records);
        return newRecord;
    },

    update(id, updates) {
        const records = this.getAll();
        const index = records.findIndex(r => r.id === id);
        if (index !== -1) {
            records[index] = {
                ...records[index],
                ...updates,
                updatedAt: Date.now()
            };
            Storage.set(Storage.KEYS.TRACKING, records);
            return records[index];
        }
        return null;
    },

    delete(id) {
        const records = this.getAll().filter(r => r.id !== id);
        Storage.set(Storage.KEYS.TRACKING, records);
    },

    getStats() {
        const records = this.getAll();
        const total = records.length;
        const avgQuality = total > 0 
            ? (records.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / total).toFixed(1)
            : 0;
        const totalBiases = records.reduce((sum, r) => sum + (r.biases?.length || 0), 0);
        
        return { total, avgQuality, totalBiases };
    }
};

const CaseStore = {
    getAll() {
        return Storage.get(Storage.KEYS.CASES) || [];
    },

    add(caseItem) {
        const cases = this.getAll();
        const newCase = {
            id: Storage.generateId(),
            ...caseItem,
            createdAt: Date.now()
        };
        cases.push(newCase);
        Storage.set(Storage.KEYS.CASES, cases);
        return newCase;
    },

    delete(id) {
        const cases = this.getAll().filter(c => c.id !== id);
        Storage.set(Storage.KEYS.CASES, cases);
    },

    getByModelId(modelId) {
        return this.getAll().filter(c => c.modelId === modelId);
    }
};

const EvolutionStore = {
    getAll() {
        return Storage.get(Storage.KEYS.EVOLUTIONS) || [];
    },

    add(evolution) {
        const evolutions = this.getAll();
        const newEvolution = {
            id: Storage.generateId(),
            ...evolution,
            createdAt: Date.now()
        };
        evolutions.push(newEvolution);
        Storage.set(Storage.KEYS.EVOLUTIONS, evolutions);
        return newEvolution;
    },

    delete(id) {
        const evolutions = this.getAll().filter(e => e.id !== id);
        Storage.set(Storage.KEYS.EVOLUTIONS, evolutions);
    },

    getByModelId(modelId) {
        return this.getAll()
            .filter(e => e.modelId === modelId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
};

const SeedData = {
    models: [
        {
            name: '一阶思维',
            source: '查理·芒格',
            coreConcept: '遇到问题时，基于直觉和经验快速得出结论的思维方式，只考虑最直接的因果关系。',
            scenarios: '简单决策、日常琐事、时间紧迫的情况',
            category: 'thinking',
            keywords: ['直觉', '经验', '直接', '快速'],
            complements: ['二阶思维'],
            opposites: [],
            personalNotes: ''
        },
        {
            name: '二阶思维',
            source: '查理·芒格',
            coreConcept: '不仅考虑直接结果，还要考虑后续的连锁反应和长期影响，即"结果的结果"。',
            scenarios: '重大决策、投资分析、政策制定、长期规划',
            category: 'thinking',
            keywords: ['长期', '连锁反应', '后果', '深度'],
            complements: ['逆向思考'],
            opposites: ['一阶思维'],
            personalNotes: ''
        },
        {
            name: '逆向思考',
            source: '卡尔·雅可比',
            coreConcept: '反过来想，总是反过来想。从想要的结果出发，逆向推导需要满足的条件，或从避免失败的角度思考。',
            scenarios: '复杂问题、创新思考、困境突破、风险规避',
            category: 'thinking',
            keywords: ['反向', '逆向', '避免失败', '倒推'],
            complements: ['第一性原理'],
            opposites: [],
            personalNotes: ''
        },
        {
            name: '奥卡姆剃刀',
            source: '奥卡姆的威廉',
            coreConcept: '如无必要，勿增实体。最简单的解释往往是正确的，应优先选择假设最少的方案。',
            scenarios: '问题诊断、理论选择、方案取舍、产品设计',
            category: 'analysis',
            keywords: ['简单', '简洁', '最少假设', '精简'],
            complements: ['第一性原理'],
            opposites: [],
            personalNotes: ''
        },
        {
            name: '第一性原理',
            source: '亚里士多德 / 埃隆·马斯克',
            coreConcept: '将问题分解到最基本的事实，然后从基础原理重新构建解决方案，而非类比推理。',
            scenarios: '突破性创新、创业、复杂问题分析、技术研发',
            category: 'thinking',
            keywords: ['基础', '本质', '创新', '分解'],
            complements: ['逆向思考', '奥卡姆剃刀'],
            opposites: [],
            personalNotes: ''
        },
        {
            name: '沉没成本谬误',
            source: '行为经济学',
            coreConcept: '因为已经投入了资源而继续错误的决策，忽视了沉没成本不应影响当前决策的事实。',
            scenarios: '投资决策、项目继续、关系维持、职业选择',
            category: 'psychology',
            keywords: ['沉没成本', '损失厌恶', '坚持', '放弃'],
            complements: [],
            opposites: [],
            personalNotes: ''
        },
        {
            name: '确认偏差',
            source: '心理学',
            coreConcept: '倾向于寻找、解释和记忆能证实自己既有观点的信息，而忽略相反的证据。',
            scenarios: '信息筛选、观点形成、决策验证',
            category: 'psychology',
            keywords: ['证实', '偏见', '信息筛选', '固有观念'],
            complements: [],
            opposites: [],
            personalNotes: ''
        },
        {
            name: '成本效益分析',
            source: '经济学',
            coreConcept: '系统地比较决策的潜在收益和成本，包括直接和间接、货币和非货币因素。',
            scenarios: '投资评估、项目选择、资源分配、商业决策',
            category: 'decision',
            keywords: ['成本', '收益', '权衡', 'ROI'],
            complements: ['二阶思维'],
            opposites: [],
            personalNotes: ''
        },
        {
            name: '概率思维',
            source: '概率论',
            coreConcept: '用概率来量化不确定性，评估不同结果发生的可能性，做出更理性的决策。',
            scenarios: '风险评估、投资、预测、不确定情况下的决策',
            category: 'decision',
            keywords: ['概率', '风险', '不确定性', '贝叶斯'],
            complements: ['成本效益分析'],
            opposites: [],
            personalNotes: ''
        },
        {
            name: '帕累托法则（80/20法则）',
            source: '维尔弗雷多·帕累托',
            coreConcept: '80%的结果来自20%的原因，应聚焦于能产生最大影响的关键因素。',
            scenarios: '时间管理、资源分配、优先级排序、问题分析',
            category: 'analysis',
            keywords: ['80/20', '关键少数', '重点', '效率'],
            complements: ['奥卡姆剃刀'],
            opposites: [],
            personalNotes: ''
        }
    ],

    init() {
        const existingModels = ModelStore.getAll();
        if (existingModels.length === 0) {
            this.models.forEach(model => {
                ModelStore.add(model);
            });
            console.log('Seed data initialized');
        }
    }
};