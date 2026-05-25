const DemoData = {
    generate() {
        if (localStorage.getItem('demo_data_loaded')) {
            Helpers.toast('演示数据已存在，如需重新加载请清除浏览器数据', 'warning');
            return;
        }

        this.clearAll();
        
        this.generateClients();
        this.generateOpportunities();
        this.generateProjects();
        this.generateTimeEntries();
        this.generateInvoices();
        this.generatePayments();
        this.generateExpenses();
        this.generateCommunications();
        this.generateQuotes();

        localStorage.setItem('demo_data_loaded', 'true');
        Helpers.toast('演示数据生成成功！');
        App.refresh();
    },

    clearAll() {
        Object.values(Storage.KEYS).forEach(key => {
            if (key !== Storage.KEYS.SETTINGS) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
    },

    generateClients() {
        const clients = [
            {
                name: '北京创新科技有限公司',
                contactPerson: '张伟',
                email: 'zhangwei@innovtech.com',
                phone: '139-0001-0001',
                industry: '互联网',
                communicationPreference: 'email',
                lifecycleStage: 'active',
                notes: '长期合作客户，需求明确'
            },
            {
                name: '上海设计工作室',
                contactPerson: '李娜',
                email: 'lina@shdesign.com',
                phone: '138-0002-0002',
                industry: '设计',
                communicationPreference: 'phone',
                lifecycleStage: 'negotiation',
                notes: '正在洽谈新项目合作'
            },
            {
                name: '深圳智造科技',
                contactPerson: '王强',
                email: 'wangqiang@szsmart.com',
                phone: '137-0003-0003',
                industry: '制造业',
                communicationPreference: 'wechat',
                lifecycleStage: 'potential',
                notes: '初次接触，需求待确认'
            },
            {
                name: '广州电商集团',
                contactPerson: '陈芳',
                email: 'chenfang@gzec.com',
                phone: '136-0004-0004',
                industry: '电商',
                communicationPreference: 'email',
                lifecycleStage: 'active',
                notes: '高价值客户，支付及时'
            },
            {
                name: '杭州教育科技',
                contactPerson: '刘明',
                email: 'liuming@hzedutech.com',
                phone: '135-0005-0005',
                industry: '教育',
                communicationPreference: 'phone',
                lifecycleStage: 'repeat',
                notes: '复购客户，已合作3次'
            },
            {
                name: '成都文化传媒',
                contactPerson: '周杰',
                email: 'zhoujie@cdmedia.com',
                phone: '134-0006-0006',
                industry: '传媒',
                communicationPreference: 'email',
                lifecycleStage: 'completed',
                notes: '项目已完成，待复购'
            },
            {
                name: '武汉金融科技',
                contactPerson: '吴敏',
                email: 'wumin@whfintech.com',
                phone: '133-0007-0007',
                industry: '金融',
                communicationPreference: 'wechat',
                lifecycleStage: 'potential',
                notes: '金融行业对安全性要求高'
            },
            {
                name: '西安物流有限公司',
                contactPerson: '郑阳',
                email: 'zhengyang@xalogistics.com',
                phone: '132-0008-0008',
                industry: '物流',
                communicationPreference: 'phone',
                lifecycleStage: 'negotiation',
                notes: '物流系统开发需求'
            }
        ];

        clients.forEach(client => {
            Storage.add(Storage.KEYS.CLIENTS, client);
        });
    },

    generateOpportunities() {
        const clients = Storage.get(Storage.KEYS.CLIENTS);
        const opportunities = [
            {
                title: '企业官网改版项目',
                clientId: clients[0].id,
                estimatedAmount: 28000,
                winRate: 80,
                expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'negotiation',
                description: '客户需要对现有官网进行全面改版，提升用户体验和品牌形象'
            },
            {
                title: '移动端APP开发',
                clientId: clients[1].id,
                estimatedAmount: 85000,
                winRate: 60,
                expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'proposal',
                description: '设计工作室需要开发一款移动端展示APP'
            },
            {
                title: '智能设备后台系统',
                clientId: clients[2].id,
                estimatedAmount: 120000,
                winRate: 40,
                expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'qualified',
                description: '智能制造设备的后台管理系统开发'
            },
            {
                title: '电商平台优化',
                clientId: clients[3].id,
                estimatedAmount: 45000,
                winRate: 90,
                expectedCloseDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'won',
                description: '电商平台的性能优化和功能增强'
            },
            {
                title: '在线教育系统升级',
                clientId: clients[4].id,
                estimatedAmount: 68000,
                winRate: 75,
                expectedCloseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'negotiation',
                description: '在线教育平台的功能升级和移动端适配'
            },
            {
                title: '新媒体内容管理系统',
                clientId: clients[5].id,
                estimatedAmount: 35000,
                winRate: 50,
                expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'lead',
                description: '文化传媒公司的内容管理和发布系统'
            },
            {
                title: '金融数据可视化平台',
                clientId: clients[6].id,
                estimatedAmount: 150000,
                winRate: 30,
                expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'lead',
                description: '金融数据的可视化展示和分析平台'
            },
            {
                title: '物流追踪系统',
                clientId: clients[7].id,
                estimatedAmount: 92000,
                winRate: 55,
                expectedCloseDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'proposal',
                description: '物流实时追踪和管理系统'
            },
            {
                title: '小程序开发',
                clientId: clients[0].id,
                estimatedAmount: 18000,
                winRate: 85,
                expectedCloseDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'won',
                description: '微信小程序开发，用于产品展示'
            }
        ];

        opportunities.forEach(op => {
            Storage.add(Storage.KEYS.OPPORTUNITIES, op);
        });
    },

    generateProjects() {
        const clients = Storage.get(Storage.KEYS.CLIENTS);
        const projects = [
            {
                name: '企业官网改版项目',
                clientId: clients[0].id,
                description: '北京创新科技有限公司的官网全面改版',
                scope: '前端页面重新设计、后端CMS系统升级、响应式适配',
                deliverables: '设计稿、前端代码、后端接口、部署文档',
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                contractAmount: 28000,
                billingType: 'fixed',
                status: 'active'
            },
            {
                name: '电商平台性能优化',
                clientId: clients[3].id,
                description: '广州电商集团的平台性能优化项目',
                scope: '数据库优化、缓存策略、CDN集成',
                deliverables: '优化方案、性能测试报告、优化代码',
                startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                contractAmount: 45000,
                billingType: 'fixed',
                status: 'completed'
            },
            {
                name: '在线教育系统维护',
                clientId: clients[4].id,
                description: '杭州教育科技的系统维护和技术支持',
                scope: 'Bug修复、功能优化、技术支持',
                deliverables: '维护记录、问题解决方案',
                startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
                contractAmount: 150,
                billingType: 'hourly',
                status: 'active'
            },
            {
                name: '微信小程序开发',
                clientId: clients[0].id,
                description: '产品展示型微信小程序',
                scope: '小程序UI设计、功能开发、后台管理',
                deliverables: '设计稿、小程序代码、后台接口、上线文档',
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                contractAmount: 18000,
                billingType: 'fixed',
                status: 'active'
            }
        ];

        const projectIds = [];
        projects.forEach(project => {
            const saved = Storage.add(Storage.KEYS.PROJECTS, project);
            projectIds.push(saved.id);
        });

        this.generateMilestones(projectIds);
    },

    generateMilestones(projectIds) {
        const milestonesList = [
            [
                { title: '需求分析完成', dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
                { title: '设计稿确认', dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
                { title: '前端开发完成', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'in_progress' },
                { title: '测试验收', dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
                { title: '项目上线', dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' }
            ],
            [
                { title: '性能分析', dueDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
                { title: '优化方案设计', dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
                { title: '优化实施', dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
                { title: '效果验证', dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
                { title: '项目验收', dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' }
            ],
            [
                { title: '月度维护1', dueDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
                { title: '月度维护2', dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
                { title: '月度维护3', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' }
            ],
            [
                { title: 'UI设计稿', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
                { title: '小程序开发', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'in_progress' },
                { title: '后台接口', dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
                { title: '测试上线', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' }
            ]
        ];

        projectIds.forEach((projectId, index) => {
            if (milestonesList[index]) {
                milestonesList[index].forEach(milestone => {
                    Storage.add(Storage.KEYS.MILESTONES, {
                        projectId,
                        ...milestone
                    });
                });
            }
        });
    },

    generateTimeEntries() {
        const projects = Storage.get(Storage.KEYS.PROJECTS);
        const timeEntries = [];

        for (let i = 0; i < 35; i++) {
            const project = projects[Math.floor(Math.random() * projects.length)];
            const daysAgo = Math.floor(Math.random() * 60);
            const startHour = 9 + Math.floor(Math.random() * 8);
            const duration = 60 + Math.floor(Math.random() * 240);

            const startTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
            startTime.setHours(startHour, 0, 0, 0);

            const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

            timeEntries.push({
                projectId: project.id,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                duration: duration,
                description: this.getTimeEntryDescription(),
                billable: Math.random() > 0.1
            });
        }

        timeEntries.forEach(entry => {
            Storage.add(Storage.KEYS.TIME_ENTRIES, entry);
        });
    },

    getTimeEntryDescription() {
        const descriptions = [
            '需求分析与讨论',
            'UI界面设计',
            '前端页面开发',
            '后端接口开发',
            '数据库设计与优化',
            '代码审查与优化',
            'Bug修复与测试',
            '部署与配置',
            '文档编写',
            '客户沟通与反馈',
            '性能优化',
            '功能模块开发',
            '技术方案设计',
            '项目管理与协调'
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    },

    generateInvoices() {
        const projects = Storage.get(Storage.KEYS.PROJECTS);
        const clients = Storage.get(Storage.KEYS.CLIENTS);
        const invoices = [
            {
                invoiceNumber: 'INV202604001',
                clientId: clients[0].id,
                projectId: projects[0].id,
                invoiceDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                totalAmount: 14000,
                status: 'sent',
                items: [{ description: '官网改版项目预付款', amount: 14000 }]
            },
            {
                invoiceNumber: 'INV202603001',
                clientId: clients[3].id,
                projectId: projects[1].id,
                invoiceDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
                dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                totalAmount: 45000,
                status: 'paid',
                items: [{ description: '电商平台优化项目款', amount: 45000 }]
            },
            {
                invoiceNumber: 'INV202604002',
                clientId: clients[4].id,
                projectId: projects[2].id,
                invoiceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                totalAmount: 7500,
                status: 'sent',
                items: [{ description: '在线教育系统维护费（50小时）', amount: 7500 }]
            },
            {
                invoiceNumber: 'INV202605001',
                clientId: clients[0].id,
                projectId: projects[3].id,
                invoiceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
                totalAmount: 9000,
                status: 'sent',
                items: [{ description: '小程序开发项目预付款', amount: 9000 }]
            },
            {
                invoiceNumber: 'INV202603002',
                clientId: clients[3].id,
                projectId: projects[1].id,
                invoiceDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
                dueDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
                totalAmount: 22500,
                status: 'overdue',
                items: [{ description: '电商平台优化进度款', amount: 22500 }]
            }
        ];

        invoices.forEach(invoice => {
            Storage.add(Storage.KEYS.INVOICES, invoice);
        });
    },

    generatePayments() {
        const invoices = Storage.get(Storage.KEYS.INVOICES);
        const payments = [
            {
                invoiceId: invoices[1].id,
                amount: 22500,
                date: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
                method: 'bank_transfer',
                notes: '首付款'
            },
            {
                invoiceId: invoices[1].id,
                amount: 22500,
                date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
                method: 'bank_transfer',
                notes: '项目尾款'
            },
            {
                invoiceId: invoices[0].id,
                amount: 14000,
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                method: 'alipay',
                notes: '官网改版项目预付款已收到'
            }
        ];

        payments.forEach(payment => {
            Storage.add(Storage.KEYS.PAYMENTS, payment);
        });
    },

    generateExpenses() {
        const expenses = [
            { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), category: 'software', amount: 299, description: '代码编辑器订阅', notes: 'VS Code Pro' },
            { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), category: 'software', amount: 99, description: '设计工具订阅', notes: 'Figma专业版' },
            { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), category: 'software', amount: 199, description: '云服务器费用', notes: '阿里云ECS' },
            { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), category: 'software', amount: 68, description: '域名续费', notes: '年度域名费用' },
            { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), category: 'learning', amount: 599, description: '技术课程购买', notes: '前端进阶课程' },
            { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), category: 'learning', amount: 199, description: '技术书籍', notes: '《JavaScript高级程序设计》' },
            { date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), category: 'equipment', amount: 899, description: '外接显示器', notes: '提升开发效率' },
            { date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), category: 'equipment', amount: 299, description: '机械键盘', notes: '开发设备' },
            { date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), category: 'marketing', amount: 500, description: '网络推广费用', notes: '社交媒体推广' },
            { date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(), category: 'office', amount: 300, description: '办公用品', notes: '打印耗材' },
            { date: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(), category: 'travel', amount: 1200, description: '客户拜访差旅', notes: '上海客户现场沟通' },
            { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), category: 'other', amount: 150, description: '网络费用', notes: '家庭宽带月费' }
        ];

        expenses.forEach(expense => {
            Storage.add(Storage.KEYS.EXPENSES, expense);
        });
    },

    generateCommunications() {
        const clients = Storage.get(Storage.KEYS.CLIENTS);
        const communications = [
            { clientId: clients[0].id, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: 'meeting', summary: '项目进度讨论，确认下一阶段开发计划' },
            { clientId: clients[0].id, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), type: 'email', summary: '发送设计稿确认邮件，等待客户反馈' },
            { clientId: clients[1].id, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'phone', summary: '电话沟通APP需求，确认功能清单' },
            { clientId: clients[3].id, date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), type: 'meeting', summary: '项目验收会议，客户对交付物表示满意' },
            { clientId: clients[4].id, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'wechat', summary: '微信沟通维护需求，安排下月维护计划' },
            { clientId: clients[2].id, date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), type: 'email', summary: '发送需求收集问卷，等待客户回复' },
            { clientId: clients[5].id, date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), type: 'meeting', summary: '项目总结会议，讨论后续合作可能' },
            { clientId: clients[6].id, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), type: 'phone', summary: '初次电话沟通，了解客户需求' }
        ];

        communications.forEach(comm => {
            Storage.add(Storage.KEYS.COMMUNICATIONS, comm);
        });
    },

    generateQuotes() {
        const opportunities = Storage.get(Storage.KEYS.OPPORTUNITIES);
        const quotes = [
            {
                quoteNumber: 'Q202604001',
                opportunityId: opportunities[0].id,
                totalAmount: 28000,
                issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'accepted',
                description: '企业官网改版项目报价，包含设计、开发、测试全流程'
            },
            {
                quoteNumber: 'Q202604002',
                opportunityId: opportunities[1].id,
                totalAmount: 85000,
                issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'pending',
                description: '移动端APP开发项目报价'
            },
            {
                quoteNumber: 'Q202604003',
                opportunityId: opportunities[3].id,
                totalAmount: 45000,
                issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'accepted',
                description: '电商平台优化项目报价'
            },
            {
                quoteNumber: 'Q202605001',
                opportunityId: opportunities[8].id,
                totalAmount: 18000,
                issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                validUntil: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'accepted',
                description: '微信小程序开发项目报价'
            }
        ];

        quotes.forEach(quote => {
            Storage.add(Storage.KEYS.QUOTES, quote);
        });
    },

    reset() {
        Helpers.confirm('确定要清除所有数据并重新生成演示数据吗？', () => {
            localStorage.removeItem('demo_data_loaded');
            this.generate();
            Helpers.closeModal();
        });
    }
};
