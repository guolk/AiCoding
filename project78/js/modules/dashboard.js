const DashboardModule = {
    render() {
        const clients = Storage.get(Storage.KEYS.CLIENTS);
        const projects = Storage.get(Storage.KEYS.PROJECTS);
        const invoices = Storage.get(Storage.KEYS.INVOICES);
        const timeEntries = Storage.get(Storage.KEYS.TIME_ENTRIES);
        const payments = Storage.get(Storage.KEYS.PAYMENTS);
        const expenses = Storage.get(Storage.KEYS.EXPENSES);
        const opportunities = Storage.get(Storage.KEYS.OPPORTUNITIES);
        const settings = Storage.getSettings();

        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const netIncome = totalRevenue - totalExpenses;
        const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
        const totalReceivable = pendingInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0) - 
                                payments.filter(p => pendingInvoices.some(i => i.id === p.invoiceId))
                                    .reduce((sum, p) => sum + Number(p.amount), 0);

        const activeProjects = projects.filter(p => p.status === 'active').length;
        const totalHours = timeEntries.reduce((sum, t) => sum + Number(t.duration || 0), 0);

        const currentQuarter = Helpers.getQuarter();
        const quarterData = this.getQuarterData(currentQuarter.year, currentQuarter.quarter, invoices, payments, expenses);

        const recentClients = clients.slice(-5).reverse();
        const recentProjects = projects.slice(-5).reverse();

        return `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm">本月收入</p>
                                <p class="text-2xl font-bold text-gray-800 mt-1">${Helpers.formatCurrency(quarterData.monthlyRevenue[2] || 0, settings.currency)}</p>
                            </div>
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-arrow-up text-green-500 text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-4 text-sm text-green-500">
                            <i class="fas fa-chart-line"></i> 较上月 ${quarterData.monthlyRevenue[2] && quarterData.monthlyRevenue[1] ? 
                                (((quarterData.monthlyRevenue[2] - quarterData.monthlyRevenue[1]) / quarterData.monthlyRevenue[1] * 100).toFixed(1) + '%') : '0%'}
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm">应收账款</p>
                                <p class="text-2xl font-bold text-gray-800 mt-1">${Helpers.formatCurrency(totalReceivable, settings.currency)}</p>
                            </div>
                            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-file-invoice text-yellow-500 text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-4 text-sm text-gray-500">
                            ${pendingInvoices.length} 张待收款发票
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm">进行中项目</p>
                                <p class="text-2xl font-bold text-gray-800 mt-1">${activeProjects}</p>
                            </div>
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-project-diagram text-blue-500 text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-4 text-sm text-gray-500">
                            共 ${projects.length} 个项目
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm">本月工时</p>
                                <p class="text-2xl font-bold text-gray-800 mt-1">${Helpers.formatDuration(this.getMonthHours(timeEntries))}</p>
                            </div>
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-clock text-purple-500 text-xl"></i>
                            </div>
                        </div>
                        <div class="mt-4 text-sm text-gray-500">
                            ${timeEntries.length} 条工时记录
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">本季度收支趋势</h3>
                        <div class="h-64 flex items-end justify-around gap-4">
                            ${quarterData.months.map((month, i) => `
                                <div class="flex-1 flex flex-col items-center">
                                    <div class="w-full flex gap-1 items-end" style="height: 180px;">
                                        <div class="flex-1 bg-green-400 rounded-t-lg chart-bar" 
                                             style="height: ${quarterData.maxValue > 0 ? (quarterData.monthlyRevenue[i] / quarterData.maxValue * 100) : 0}%"></div>
                                        <div class="flex-1 bg-red-400 rounded-t-lg chart-bar" 
                                             style="height: ${quarterData.maxValue > 0 ? (quarterData.monthlyExpenses[i] / quarterData.maxValue * 100) : 0}%"></div>
                                    </div>
                                    <p class="text-sm text-gray-500 mt-2">${month}月</p>
                                </div>
                            `).join('')}
                        </div>
                        <div class="flex justify-center gap-6 mt-4">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 bg-green-400 rounded"></div>
                                <span class="text-sm text-gray-600">收入</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 bg-red-400 rounded"></div>
                                <span class="text-sm text-gray-600">支出</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">客户生命周期分布</h3>
                        <div class="space-y-4">
                            ${this.getLifecycleStats(clients).map(stat => `
                                <div>
                                    <div class="flex justify-between text-sm mb-1">
                                        <span class="text-gray-600">${stat.label}</span>
                                        <span class="font-medium">${stat.count} (${stat.percentage}%)</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${stat.percentage}%; ${stat.color}"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">最近客户</h3>
                            <button onclick="App.switchModule('clients')" class="text-primary text-sm hover:underline">
                                查看全部 <i class="fas fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                        <div class="space-y-3">
                            ${recentClients.length > 0 ? recentClients.map(client => {
                                const status = Helpers.getClientLifecycleStatus(client.lifecycleStage);
                                return `
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <i class="fas fa-user text-primary"></i>
                                            </div>
                                            <div>
                                                <p class="font-medium text-gray-800">${Helpers.escapeHtml(client.name)}</p>
                                                <p class="text-sm text-gray-500">${Helpers.escapeHtml(client.industry || '未设置行业')}</p>
                                            </div>
                                        </div>
                                        <span class="status-badge ${status.class}">${status.label}</span>
                                    </div>
                                `;
                            }).join('') : '<p class="text-gray-500 text-center py-8">暂无客户数据</p>'}
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">商机漏斗</h3>
                            <button onclick="App.switchModule('opportunities')" class="text-primary text-sm hover:underline">
                                查看全部 <i class="fas fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                        <div class="space-y-3">
                            ${this.getOpportunityStats(opportunities).map((stat, i) => `
                                <div class="relative">
                                    <div class="flex items-center justify-between p-3 rounded-lg" 
                                         style="background: linear-gradient(90deg, ${stat.color}22, transparent); 
                                                margin-left: ${i * 15}px;
                                                width: ${100 - i * 10}%">
                                        <span class="font-medium text-gray-800">${stat.label}</span>
                                        <span class="text-sm text-gray-500">${stat.count} 个 · ${Helpers.formatCurrency(stat.value, settings.currency)}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">季度税务预估</h3>
                        </div>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <span class="text-gray-600">季度总收入</span>
                                <span class="font-bold text-lg">${Helpers.formatCurrency(quarterData.totalRevenue, settings.currency)}</span>
                            </div>
                            <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <span class="text-gray-600">季度总支出</span>
                                <span class="font-bold text-lg text-red-500">-${Helpers.formatCurrency(quarterData.totalExpenses, settings.currency)}</span>
                            </div>
                            <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                                <span class="text-gray-600">应纳税所得额</span>
                                <span class="font-bold text-lg">${Helpers.formatCurrency(quarterData.taxableIncome, settings.currency)}</span>
                            </div>
                            <div class="flex justify-between items-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                                <span class="font-medium text-gray-800">预估税额 (税率 ${(settings.taxRate * 100).toFixed(0)}%)</span>
                                <span class="font-bold text-xl text-yellow-600">${Helpers.formatCurrency(quarterData.estimatedTax, settings.currency)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">最近项目</h3>
                            <button onclick="App.switchModule('projects')" class="text-primary text-sm hover:underline">
                                查看全部 <i class="fas fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                        <div class="space-y-4">
                            ${recentProjects.length > 0 ? recentProjects.map(project => {
                                const status = Helpers.getProjectStatus(project.status);
                                const progress = this.getProjectProgress(project.id);
                                const client = Storage.find(Storage.KEYS.CLIENTS, project.clientId);
                                return `
                                    <div class="p-4 bg-gray-50 rounded-lg">
                                        <div class="flex justify-between items-start mb-2">
                                            <div>
                                                <p class="font-medium text-gray-800">${Helpers.escapeHtml(project.name)}</p>
                                                <p class="text-sm text-gray-500">${client ? Helpers.escapeHtml(client.name) : '未关联客户'}</p>
                                            </div>
                                            <span class="status-badge ${status.class}">${status.label}</span>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <div class="flex-1 progress-bar">
                                                <div class="progress-fill" style="width: ${progress}%"></div>
                                            </div>
                                            <span class="text-sm font-medium text-gray-600">${progress}%</span>
                                        </div>
                                    </div>
                                `;
                            }).join('') : '<p class="text-gray-500 text-center py-8">暂无项目数据</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getMonthHours(timeEntries) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return timeEntries
            .filter(t => new Date(t.startTime) >= monthStart)
            .reduce((sum, t) => sum + Number(t.duration || 0), 0);
    },

    getQuarterData(year, quarter, invoices, payments, expenses) {
        const months = Helpers.getQuarterMonths(quarter, year);
        const monthlyRevenue = [0, 0, 0];
        const monthlyExpenses = [0, 0, 0];

        payments.forEach(payment => {
            const date = new Date(payment.date);
            const monthIndex = months.findIndex(m => 
                date.getMonth() === m.getMonth() && date.getFullYear() === m.getFullYear()
            );
            if (monthIndex !== -1) {
                monthlyRevenue[monthIndex] += Number(payment.amount);
            }
        });

        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthIndex = months.findIndex(m => 
                date.getMonth() === m.getMonth() && date.getFullYear() === m.getFullYear()
            );
            if (monthIndex !== -1) {
                monthlyExpenses[monthIndex] += Number(expense.amount);
            }
        });

        const maxValue = Math.max(...monthlyRevenue, ...monthlyExpenses, 1);
        const totalRevenue = monthlyRevenue.reduce((a, b) => a + b, 0);
        const totalExpenses = monthlyExpenses.reduce((a, b) => a + b, 0);
        const taxableIncome = totalRevenue - totalExpenses;
        const settings = Storage.getSettings();
        const estimatedTax = Math.max(0, taxableIncome * settings.taxRate);

        return {
            months: months.map(m => m.getMonth() + 1),
            monthlyRevenue,
            monthlyExpenses,
            maxValue,
            totalRevenue,
            totalExpenses,
            taxableIncome,
            estimatedTax
        };
    },

    getLifecycleStats(clients) {
        const stages = [
            { key: 'potential', label: '潜在客户', color: 'background: #F59E0B;' },
            { key: 'negotiation', label: '谈判中', color: 'background: #3B82F6;' },
            { key: 'active', label: '合作中', color: 'background: #10B981;' },
            { key: 'completed', label: '已完成', color: 'background: #6B7280;' },
            { key: 'repeat', label: '复购客户', color: 'background: #EC4899;' }
        ];

        const total = clients.length || 1;
        return stages.map(stage => {
            const count = clients.filter(c => c.lifecycleStage === stage.key).length;
            return {
                ...stage,
                count,
                percentage: Math.round((count / total) * 100)
            };
        });
    },

    getOpportunityStats(opportunities) {
        const stages = [
            { key: 'lead', label: '线索', color: '#6B7280' },
            { key: 'qualified', label: '已确认', color: '#3B82F6' },
            { key: 'proposal', label: '报价中', color: '#F59E0B' },
            { key: 'negotiation', label: '谈判中', color: '#8B5CF6' },
            { key: 'won', label: '已成交', color: '#10B981' }
        ];

        return stages.map(stage => {
            const stageOpps = opportunities.filter(o => o.status === stage.key);
            const value = stageOpps.reduce((sum, o) => sum + Number(o.estimatedAmount || 0) * (Number(o.winRate || 0) / 100), 0);
            return {
                ...stage,
                count: stageOpps.length,
                value
            };
        });
    },

    getProjectProgress(projectId) {
        const milestones = Storage.filter(Storage.KEYS.MILESTONES, m => m.projectId === projectId);
        if (milestones.length === 0) return 0;
        const completed = milestones.filter(m => m.status === 'completed').length;
        return Math.round((completed / milestones.length) * 100);
    }
};
