const App = {
    init() {
        SeedData.init();
        this.bindEvents();
        this.renderModels();
        this.renderDecisions();
        this.renderTracking();
        this.renderLearning();
    },

    bindEvents() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        document.getElementById('addModelBtn').addEventListener('click', () => this.showModelForm());
        document.getElementById('newDecisionBtn').addEventListener('click', () => this.showDecisionForm());
        document.getElementById('addCaseBtn').addEventListener('click', () => this.showCaseForm());
        document.getElementById('addEvolutionBtn').addEventListener('click', () => this.showEvolutionForm());

        document.getElementById('modelSearch').addEventListener('input', () => this.renderModels());
        document.getElementById('modelCategory').addEventListener('change', () => this.renderModels());

        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });

        document.getElementById('decisionsList').addEventListener('click', (e) => {
            const editBtn = e.target.closest('.btn-edit-decision');
            const trackBtn = e.target.closest('.btn-track-decision');
            const deleteBtn = e.target.closest('.btn-delete-decision');

            if (editBtn) {
                this.showDecisionForm(editBtn.dataset.id);
            } else if (trackBtn) {
                this.moveToTracking(trackBtn.dataset.id);
            } else if (deleteBtn) {
                this.deleteDecision(deleteBtn.dataset.id);
            }
        });
    },

    switchTab(tabName) {
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    },

    showModal(content) {
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').classList.add('show');
    },

    closeModal() {
        document.getElementById('modal').classList.remove('show');
    },

    getCategoryLabel(category) {
        const labels = {
            thinking: '思维方式',
            decision: '决策模型',
            analysis: '分析工具',
            psychology: '心理学'
        };
        return labels[category] || category;
    },

    renderModels() {
        const query = document.getElementById('modelSearch').value;
        const category = document.getElementById('modelCategory').value;
        const models = ModelStore.search(query, category);
        const grid = document.getElementById('modelsGrid');

        if (models.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">📚</div>
                    <p>${query || category ? '没有找到匹配的模型' : '还没有添加任何思维模型'}</p>
                    <button class="btn btn-primary" style="margin-top: 15px;" onclick="App.showModelForm()">添加第一个模型</button>
                </div>
            `;
            return;
        }

        grid.innerHTML = models.map(model => `
            <div class="model-card">
                <h3>${model.name}</h3>
                <span class="category-tag">${this.getCategoryLabel(model.category)}</span>
                <p class="source">来源：${model.source}</p>
                <p class="concept">${model.coreConcept}</p>
                <p class="scenarios"><strong>应用场景：</strong>${model.scenarios}</p>
                ${model.personalNotes ? `
                    <div class="personal-notes">
                        <h4>📝 个人理解</h4>
                        <p>${model.personalNotes}</p>
                    </div>
                ` : ''}
                <div class="model-actions">
                    <button class="btn btn-secondary btn-sm" onclick="App.showModelDetail('${model.id}')">查看详情</button>
                    <button class="btn btn-primary btn-sm" onclick="App.showModelForm('${model.id}')">编辑</button>
                    <button class="btn btn-danger btn-sm" onclick="App.deleteModel('${model.id}')">删除</button>
                </div>
            </div>
        `).join('');
    },

    showModelForm(modelId = null) {
        const model = modelId ? ModelStore.getById(modelId) : null;
        const allModels = ModelStore.getAll().filter(m => m.id !== modelId);
        
        const content = `
            <h2 style="margin-bottom: 25px;">${model ? '编辑思维模型' : '添加思维模型'}</h2>
            <form id="modelForm">
                <div class="form-group">
                    <label>模型名称 *</label>
                    <input type="text" name="name" value="${model?.name || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>来源</label>
                        <input type="text" name="source" value="${model?.source || ''}">
                    </div>
                    <div class="form-group">
                        <label>分类</label>
                        <select name="category">
                            <option value="thinking" ${model?.category === 'thinking' ? 'selected' : ''}>思维方式</option>
                            <option value="decision" ${model?.category === 'decision' ? 'selected' : ''}>决策模型</option>
                            <option value="analysis" ${model?.category === 'analysis' ? 'selected' : ''}>分析工具</option>
                            <option value="psychology" ${model?.category === 'psychology' ? 'selected' : ''}>心理学</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>核心概念 *</label>
                    <textarea name="coreConcept" required>${model?.coreConcept || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>应用场景</label>
                    <textarea name="scenarios">${model?.scenarios || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>关键词（用逗号分隔）</label>
                    <input type="text" name="keywords" value="${model?.keywords?.join(', ') || ''}">
                </div>
                <div class="model-relations">
                    <div class="relation-section complements">
                        <h4>互补模型</h4>
                        <div class="checkbox-group">
                            ${allModels.map(m => `
                                <label class="checkbox-item">
                                    <input type="checkbox" name="complements" value="${m.name}" 
                                        ${model?.complements?.includes(m.name) ? 'checked' : ''}>
                                    ${m.name}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <div class="relation-section opposites">
                        <h4>对立模型</h4>
                        <div class="checkbox-group">
                            ${allModels.map(m => `
                                <label class="checkbox-item">
                                    <input type="checkbox" name="opposites" value="${m.name}" 
                                        ${model?.opposites?.includes(m.name) ? 'checked' : ''}>
                                    ${m.name}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="form-group" style="margin-top: 20px;">
                    <label>📝 个人理解笔记</label>
                    <textarea name="personalNotes" placeholder="用自己的话解释这个模型...">${model?.personalNotes || ''}</textarea>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">保存</button>
                    <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="App.closeModal()">取消</button>
                </div>
            </form>
        `;

        this.showModal(content);

        document.getElementById('modelForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                name: formData.get('name'),
                source: formData.get('source'),
                category: formData.get('category'),
                coreConcept: formData.get('coreConcept'),
                scenarios: formData.get('scenarios'),
                keywords: formData.get('keywords').split(',').map(k => k.trim()).filter(k => k),
                complements: formData.getAll('complements'),
                opposites: formData.getAll('opposites'),
                personalNotes: formData.get('personalNotes')
            };

            if (modelId) {
                ModelStore.update(modelId, data);
            } else {
                ModelStore.add(data);
            }

            this.closeModal();
            this.renderModels();
        });
    },

    showModelDetail(modelId) {
        const model = ModelStore.getById(modelId);
        const evolutions = EvolutionStore.getByModelId(modelId);
        const cases = CaseStore.getByModelId(modelId);

        const content = `
            <h2 style="margin-bottom: 20px;">${model.name}</h2>
            <span class="category-tag">${this.getCategoryLabel(model.category)}</span>
            <p style="color: #64748b; margin: 15px 0;">来源：${model.source}</p>
            
            <h3 style="margin: 20px 0 10px;">核心概念</h3>
            <p style="line-height: 1.8;">${model.coreConcept}</p>
            
            <h3 style="margin: 20px 0 10px;">应用场景</h3>
            <p>${model.scenarios}</p>

            ${model.complements?.length > 0 ? `
                <h3 style="margin: 20px 0 10px;">🔗 互补模型</h3>
                <div class="decision-models">
                    ${model.complements.map(name => `<span class="model-tag">${name}</span>`).join('')}
                </div>
            ` : ''}

            ${model.opposites?.length > 0 ? `
                <h3 style="margin: 20px 0 10px;">⚔️ 对立模型</h3>
                <div class="decision-models">
                    ${model.opposites.map(name => `<span class="model-tag">${name}</span>`).join('')}
                </div>
            ` : ''}

            ${model.personalNotes ? `
                <div class="personal-notes" style="margin: 20px 0;">
                    <h4>📝 个人理解</h4>
                    <p>${model.personalNotes}</p>
                </div>
            ` : ''}

            <h3 style="margin: 20px 0 10px; display: flex; justify-content: space-between; align-items: center;">
                🌱 理解进化记录
                <button class="btn btn-sm btn-primary" onclick="App.showEvolutionForm('${modelId}')" style="font-size: 0.8rem; padding: 6px 12px;">+ 记录</button>
            </h3>
            ${evolutions.length > 0 ? `
                <div style="max-height: 200px; overflow-y: auto;">
                    ${evolutions.map(e => `
                        <div style="padding: 10px; background: #f8fafc; margin-bottom: 10px; border-radius: 8px;">
                            <div style="font-size: 0.85rem; color: #64748b;">${Storage.formatDate(e.createdAt)}</div>
                            <p style="margin-top: 5px;">${e.content}</p>
                        </div>
                    `).join('')}
                </div>
            ` : `<p style="color: #64748b; font-size: 0.9rem;">还没有进化记录，点击上方按钮记录你对这个模型的理解变化</p>`}

            ${cases.length > 0 ? `
                <h3 style="margin: 20px 0 10px;">💼 应用案例</h3>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${cases.map(c => `
                        <div style="padding: 10px; background: #f8fafc; margin-bottom: 10px; border-radius: 8px;">
                            <div style="font-size: 0.85rem; color: #64748b;">${Storage.formatDate(c.createdAt)}</div>
                            <div style="font-weight: 500; margin: 5px 0;">${c.context}</div>
                            <p style="font-size: 0.9rem;">${c.outcome}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div style="display: flex; gap: 10px; margin-top: 25px;">
                <button class="btn btn-primary" style="flex: 1;" onclick="App.showModelForm('${modelId}')">编辑</button>
                <button class="btn btn-secondary" style="flex: 1;" onclick="App.closeModal()">关闭</button>
            </div>
        `;

        this.showModal(content);
    },

    deleteModel(modelId) {
        if (confirm('确定要删除这个思维模型吗？')) {
            ModelStore.delete(modelId);
            this.renderModels();
        }
    },

    renderDecisions() {
        const decisions = DecisionStore.getAll().sort((a, b) => b.createdAt - a.createdAt);
        const list = document.getElementById('decisionsList');

        if (decisions.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🤔</div>
                    <p>还没有记录任何决策</p>
                    <button class="btn btn-primary" style="margin-top: 15px;" onclick="App.showDecisionForm()">开始第一个决策</button>
                </div>
            `;
            return;
        }

        list.innerHTML = decisions.map(decision => {
            const recommended = DecisionStore.recommendModels(decision);
            return `
                <div class="decision-card">
                    <div class="decision-header">
                        <h3>${decision.whatToDecide}</h3>
                        <span class="status-badge status-${decision.status}">
                            ${decision.status === 'pending' ? '待决定' : decision.status === 'in-progress' ? '进行中' : '已完成'}
                        </span>
                    </div>
                    <div class="decision-meta">
                        <span>📅 ${Storage.formatDate(decision.createdAt)}</span>
                        ${decision.timeLimit ? `<span>⏰ 截止：${decision.timeLimit}</span>` : ''}
                    </div>
                    <p style="margin-bottom: 15px; color: #475569;">${decision.background}</p>
                    
                    ${recommended.length > 0 ? `
                        <div class="recommended-models">
                            <h4>💡 推荐适用模型</h4>
                            <div class="decision-models">
                                ${recommended.map(m => `<span class="model-tag">${m.name}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${decision.selectedModels?.length > 0 ? `
                        <div style="margin-bottom: 15px;">
                            <div style="font-weight: 500; margin-bottom: 8px;">已选分析模型：</div>
                            <div class="decision-models">
                                ${decision.selectedModels.map(name => `<span class="model-tag">${name}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${decision.analysis ? `
                        <div class="decision-comparison">
                            <h4>📊 多模型分析对比</h4>
                            <p style="white-space: pre-wrap; font-size: 0.9rem;">${decision.analysis}</p>
                        </div>
                    ` : ''}

                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="btn btn-primary btn-sm btn-edit-decision" data-id="${decision.id}">编辑</button>
                        <button class="btn btn-success btn-sm btn-track-decision" data-id="${decision.id}">转为追踪</button>
                        <button class="btn btn-danger btn-sm btn-delete-decision" data-id="${decision.id}">删除</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    showDecisionForm(decisionId = null) {
        const decision = decisionId ? DecisionStore.getById(decisionId) : null;
        const models = ModelStore.getAll();

        const content = `
            <h2 style="margin-bottom: 25px;">${decision ? '编辑决策' : '新决策记录'}</h2>
            <form id="decisionForm">
                <div class="form-group">
                    <label>要做什么决定？ *</label>
                    <input type="text" name="whatToDecide" value="${decision?.whatToDecide || ''}" 
                        placeholder="例如：是否要辞职创业" required>
                </div>
                <div class="form-group">
                    <label>背景信息</label>
                    <textarea name="background" placeholder="描述决策的背景情况和相关信息...">${decision?.background || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>时间限制</label>
                    <input type="date" name="timeLimit" value="${decision?.timeLimit || ''}">
                </div>
                <div class="form-group">
                    <label>选择适用的思维模型（可多选）</label>
                    <div class="checkbox-group">
                        ${models.map(m => `
                            <label class="checkbox-item">
                                <input type="checkbox" name="selectedModels" value="${m.name}"
                                    ${decision?.selectedModels?.includes(m.name) ? 'checked' : ''}>
                                ${m.name}
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label>📊 多模型分析对比记录</label>
                    <textarea name="analysis" placeholder="记录使用不同模型分析的过程和结论对比...">${decision?.analysis || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>状态</label>
                    <select name="status">
                        <option value="pending" ${decision?.status === 'pending' ? 'selected' : ''}>待决定</option>
                        <option value="in-progress" ${decision?.status === 'in-progress' ? 'selected' : ''}>进行中</option>
                        <option value="completed" ${decision?.status === 'completed' ? 'selected' : ''}>已完成</option>
                    </select>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">保存</button>
                    <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="App.closeModal()">取消</button>
                </div>
            </form>
        `;

        this.showModal(content);

        document.getElementById('decisionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                whatToDecide: formData.get('whatToDecide'),
                background: formData.get('background'),
                timeLimit: formData.get('timeLimit'),
                selectedModels: formData.getAll('selectedModels'),
                analysis: formData.get('analysis'),
                status: formData.get('status')
            };

            if (decisionId) {
                DecisionStore.update(decisionId, data);
            } else {
                DecisionStore.add(data);
            }

            this.closeModal();
            this.renderDecisions();
        });
    },

    moveToTracking(decisionId) {
        const decision = DecisionStore.getById(decisionId);
        this.showTrackingForm(null, decision);
    },

    deleteDecision(decisionId) {
        if (confirm('确定要删除这个决策吗？')) {
            try {
                DecisionStore.delete(decisionId);
                this.renderDecisions();
                alert('决策记录已成功删除！');
            } catch (error) {
                console.error('删除失败:', error);
                alert('删除失败，请重试！');
            }
        }
    },

    renderTracking() {
        const stats = TrackingStore.getStats();
        const statsEl = document.getElementById('trackingStats');
        
        statsEl.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">总决策数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.avgQuality}</div>
                <div class="stat-label">平均决策质量</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalBiases}</div>
                <div class="stat-label">识别偏差数</div>
            </div>
        `;

        const records = TrackingStore.getAll().sort((a, b) => b.createdAt - a.createdAt);
        const list = document.getElementById('trackingList');

        if (records.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📈</div>
                    <p>还没有决策追踪记录</p>
                    <button class="btn btn-primary" style="margin-top: 15px;" onclick="App.showTrackingForm()">添加第一条记录</button>
                </div>
            `;
            return;
        }

        list.innerHTML = records.map(record => `
            <div class="tracking-card">
                <div class="tracking-header">
                    <h3>${record.decision}</h3>
                    <div class="quality-score" style="margin: 0;">
                        <span class="score-value">${record.qualityScore || '-'}</span>
                        <span class="score-label">决策质量</span>
                    </div>
                </div>
                <div class="tracking-meta">
                    <span>📅 ${Storage.formatDate(record.createdAt)}</span>
                    ${record.resultDate ? `<span>🎯 结果：${record.resultDate}</span>` : ''}
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div style="font-weight: 500; margin-bottom: 5px;">最终决策：</div>
                    <p style="color: #475569;">${record.finalDecision}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div style="font-weight: 500; margin-bottom: 5px;">决策理由：</div>
                    <p style="color: #475569;">${record.reasoning}</p>
                </div>
                
                ${record.result ? `
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: 500; margin-bottom: 5px;">实际结果：</div>
                        <p style="color: #475569;">${record.result}</p>
                    </div>
                ` : ''}

                ${record.qualityEvaluation ? `
                    <div class="evaluation-section">
                        <h4>🎯 决策质量评估</h4>
                        <p>${record.qualityEvaluation}</p>
                    </div>
                ` : ''}

                ${record.biases?.length > 0 ? `
                    <div style="margin-top: 15px;">
                        <div style="font-weight: 500; margin-bottom: 8px;">⚠️ 识别的偏差：</div>
                        <div class="bias-tags">
                            ${record.biases.map(b => `<span class="bias-tag">${b}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn btn-primary btn-sm" onclick="App.showTrackingForm('${record.id}')">编辑</button>
                    <button class="btn btn-danger btn-sm" onclick="App.deleteTracking('${record.id}')">删除</button>
                </div>
            </div>
        `).join('');
    },

    showTrackingForm(recordId = null, fromDecision = null) {
        const record = recordId ? TrackingStore.getById(recordId) : null;
        const biases = ['确认偏差', '沉没成本谬误', '锚定效应', '损失厌恶', '过度自信', '后见之明偏差', '从众效应'];

        const content = `
            <h2 style="margin-bottom: 25px;">${record ? '编辑决策追踪' : '决策追踪记录'}</h2>
            <form id="trackingForm">
                <div class="form-group">
                    <label>决策内容 *</label>
                    <input type="text" name="decision" value="${fromDecision?.whatToDecide || record?.decision || ''}" required>
                </div>
                <div class="form-group">
                    <label>最终决策</label>
                    <textarea name="finalDecision" placeholder="最终做出了什么决定...">${record?.finalDecision || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>决策理由</label>
                    <textarea name="reasoning" placeholder="基于什么理由做出这个决定...">${record?.reasoning || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>结果日期</label>
                        <input type="date" name="resultDate" value="${record?.resultDate || ''}">
                    </div>
                    <div class="form-group">
                        <label>决策质量评分 (1-10)</label>
                        <input type="number" name="qualityScore" min="1" max="10" value="${record?.qualityScore || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>实际结果</label>
                    <textarea name="result" placeholder="这个决策的实际结果如何...">${record?.result || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>🎯 决策质量评估（好的决策流程 vs 坏的结果）</label>
                    <textarea name="qualityEvaluation" placeholder="反思决策过程的质量，区分过程和结果...">${record?.qualityEvaluation || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>⚠️ 识别的决策偏差</label>
                    <div class="checkbox-group">
                        ${biases.map(b => `
                            <label class="checkbox-item">
                                <input type="checkbox" name="biases" value="${b}"
                                    ${record?.biases?.includes(b) ? 'checked' : ''}>
                                ${b}
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">保存</button>
                    <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="App.closeModal()">取消</button>
                </div>
            </form>
        `;

        this.showModal(content);

        document.getElementById('trackingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                decision: formData.get('decision'),
                finalDecision: formData.get('finalDecision'),
                reasoning: formData.get('reasoning'),
                resultDate: formData.get('resultDate'),
                qualityScore: parseInt(formData.get('qualityScore')) || 0,
                result: formData.get('result'),
                qualityEvaluation: formData.get('qualityEvaluation'),
                biases: formData.getAll('biases')
            };

            if (recordId) {
                TrackingStore.update(recordId, data);
            } else {
                TrackingStore.add(data);
            }

            this.closeModal();
            this.renderTracking();
        });
    },

    deleteTracking(recordId) {
        if (confirm('确定要删除这条追踪记录吗？')) {
            TrackingStore.delete(recordId);
            this.renderTracking();
        }
    },

    renderLearning() {
        const models = ModelStore.getAll();
        const cases = CaseStore.getAll();
        const evolutions = EvolutionStore.getAll();

        const statsEl = document.getElementById('learningStats');
        statsEl.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${models.length}</div>
                <div class="stat-label">收录模型</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${cases.length}</div>
                <div class="stat-label">应用案例</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${evolutions.length}</div>
                <div class="stat-label">理解进化</div>
            </div>
        `;

        const casesList = document.getElementById('casesList');
        const sortedCases = cases.sort((a, b) => b.createdAt - a.createdAt);

        if (sortedCases.length === 0) {
            casesList.innerHTML = `
                <div class="empty-state" style="padding: 30px 20px;">
                    <div class="empty-state-icon" style="font-size: 2.5rem;">💼</div>
                    <p>还没有应用案例</p>
                </div>
            `;
        } else {
            casesList.innerHTML = sortedCases.map(c => {
                const model = ModelStore.getById(c.modelId);
                return `
                    <div class="case-item">
                        <h4>${model?.name || '未知模型'} - ${c.context}</h4>
                        <p style="font-size: 0.9rem; margin: 8px 0;">${c.outcome}</p>
                        <div class="case-date">${Storage.formatDate(c.createdAt)}</div>
                    </div>
                `;
            }).join('');
        }

        const evolutionList = document.getElementById('evolutionList');
        const sortedEvolutions = evolutions.sort((a, b) => b.createdAt - a.createdAt);

        if (sortedEvolutions.length === 0) {
            evolutionList.innerHTML = `
                <div class="empty-state" style="padding: 30px 20px;">
                    <div class="empty-state-icon" style="font-size: 2.5rem;">🌱</div>
                    <p>还没有理解进化记录</p>
                </div>
            `;
        } else {
            evolutionList.innerHTML = sortedEvolutions.map(e => {
                const model = ModelStore.getById(e.modelId);
                return `
                    <div class="evolution-item">
                        <h4>${model?.name || '未知模型'}</h4>
                        <p style="font-size: 0.9rem; margin: 8px 0;">${e.content}</p>
                        <div class="evolution-date">${Storage.formatDate(e.createdAt)}</div>
                    </div>
                `;
            }).join('');
        }
    },

    showCaseForm() {
        const models = ModelStore.getAll();

        const content = `
            <h2 style="margin-bottom: 25px;">记录应用案例</h2>
            <form id="caseForm">
                <div class="form-group">
                    <label>应用的思维模型 *</label>
                    <select name="modelId" required>
                        <option value="">请选择...</option>
                        ${models.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>应用情境 *</label>
                    <input type="text" name="context" placeholder="在什么情况下应用了这个模型" required>
                </div>
                <div class="form-group">
                    <label>应用结果</label>
                    <textarea name="outcome" placeholder="应用后的结果和感受..."></textarea>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">保存</button>
                    <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="App.closeModal()">取消</button>
                </div>
            </form>
        `;

        this.showModal(content);

        document.getElementById('caseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                modelId: formData.get('modelId'),
                context: formData.get('context'),
                outcome: formData.get('outcome')
            };

            CaseStore.add(data);
            this.closeModal();
            this.renderLearning();
        });
    },

    showEvolutionForm(modelId = null) {
        const models = ModelStore.getAll();
        const selectedModel = modelId ? ModelStore.getById(modelId) : null;

        const content = `
            <h2 style="margin-bottom: 25px;">记录理解进化</h2>
            <form id="evolutionForm">
                <div class="form-group">
                    <label>思维模型 *</label>
                    <select name="modelId" required ${modelId ? 'disabled' : ''}>
                        <option value="">请选择...</option>
                        ${models.map(m => `<option value="${m.id}" ${m.id === modelId ? 'selected' : ''}>${m.name}</option>`).join('')}
                    </select>
                    ${modelId ? `<input type="hidden" name="modelId" value="${modelId}">` : ''}
                </div>
                <div class="form-group">
                    <label>新的理解/感悟 *</label>
                    <textarea name="content" placeholder="记录你对这个模型的新理解，以及是什么触发了这个认知变化..." required></textarea>
                </div>
                <div class="form-group">
                    <label>触发因素</label>
                    <input type="text" name="trigger" placeholder="是什么让你对这个模型有了更深的理解？">
                </div>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">保存</button>
                    <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="App.closeModal()">取消</button>
                </div>
            </form>
        `;

        this.showModal(content);

        document.getElementById('evolutionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                modelId: formData.get('modelId'),
                content: formData.get('content'),
                trigger: formData.get('trigger')
            };

            EvolutionStore.add(data);
            this.closeModal();
            this.renderLearning();
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});