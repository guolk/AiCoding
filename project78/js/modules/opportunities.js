const OpportunitiesModule = {
    activeTab: 'opportunities',
    currentFilter: 'all',
    selectedOpportunity: null,
    selectedQuote: null,

    render() {
        return `
            <div class="space-y-6">
                <div class="bg-white rounded-xl shadow-sm">
                    <div class="border-b px-6 py-4">
                        <div class="flex gap-4">
                            <button onclick="OpportunitiesModule.setTab('opportunities')" 
                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all ${this.activeTab === 'opportunities' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}">
                                <i class="fas fa-rocket mr-2"></i>商机管理
                            </button>
                            <button onclick="OpportunitiesModule.setTab('quotes')" 
                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all ${this.activeTab === 'quotes' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}">
                                <i class="fas fa-file-contract mr-2"></i>报价单管理
                            </button>
                        </div>
                    </div>

                    <div class="p-6">
                        ${this.activeTab === 'opportunities' ? this.renderOpportunities() : ''}
                        ${this.activeTab === 'quotes' ? this.renderQuotes() : ''}
                    </div>
                </div>
            </div>
        `;
    },

    setTab(tab) {
        this.activeTab = tab;
        this.selectedOpportunity = null;
        this.selectedQuote = null;
        App.refresh();
    },

    renderOpportunities() {
        const opportunities = Storage.get(Storage.KEYS.OPPORTUNITIES);
        const filteredOps = this.filterOpportunities(opportunities, this.currentFilter);
        const stats = this.getOpportunityStats(opportunities);
        const settings = Storage.getSettings();

        const totalPotential = opportunities
            .filter(o => o.status !== 'won' && o.status !== 'lost')
            .reduce((sum, o) => sum + Number(o.estimatedAmount) * (Number(o.winRate) / 100), 0);

        const totalWon = opportunities
            .filter(o => o.status === 'won')
            .reduce((sum, o) => sum + Number(o.estimatedAmount), 0);

        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        ${this.renderOpportunityFilters()}
                    </div>
                    <button onclick="OpportunitiesModule.openAddOpportunityModal()" class="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all">
                        <i class="fas fa-plus"></i>
                        新增商机
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-gray-50 rounded-xl p-4">
                        <p class="text-gray-500 text-sm">商机总数</p>
                        <p class="text-2xl font-bold text-gray-800">${opportunities.length}</p>
                    </div>
                    <div class="bg-blue-50 rounded-xl p-4">
                        <p class="text-blue-600 text-sm">预估总金额</p>
                        <p class="text-2xl font-bold text-blue-700">${Helpers.formatCurrency(totalPotential, settings.currency)}</p>
                        <p class="text-xs text-blue-500 mt-1">按赢率加权计算</p>
                    </div>
                    <div class="bg-green-50 rounded-xl p-4">
                        <p class="text-green-600 text-sm">已成交金额</p>
                        <p class="text-2xl font-bold text-green-700">${Helpers.formatCurrency(totalWon, settings.currency)}</p>
                        <p class="text-xs text-green-500 mt-1">${stats.won} 个商机成交</p>
                    </div>
                    <div class="bg-purple-50 rounded-xl p-4">
                        <p class="text-purple-600 text-sm">平均赢率</p>
                        <p class="text-2xl font-bold text-purple-700">${stats.avgWinRate}%</p>
                        <p class="text-xs text-purple-500 mt-1">成交率: ${stats.winRatePercent}%</p>
                    </div>
                </div>

                ${this.selectedOpportunity ? this.renderOpportunityDetail() : this.renderOpportunityList(filteredOps)}
            </div>
        `;
    },

    renderOpportunityFilters() {
        const filters = [
            { key: 'all', label: '全部' },
            { key: 'lead', label: '线索' },
            { key: 'qualified', label: '已确认' },
            { key: 'proposal', label: '报价中' },
            { key: 'negotiation', label: '谈判中' },
            { key: 'won', label: '已成交' },
            { key: 'lost', label: '已流失' }
        ];

        return `
            <div class="flex bg-white rounded-lg p-1 shadow-sm border">
                ${filters.map(f => `
                    <button onclick="OpportunitiesModule.setOpportunityFilter('${f.key}')" 
                            class="px-3 py-2 rounded-md text-sm transition-all ${this.currentFilter === f.key ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}">
                        ${f.label}
                    </button>
                `).join('')}
            </div>
        `;
    },

    setOpportunityFilter(filter) {
        this.currentFilter = filter;
        this.selectedOpportunity = null;
        App.refresh();
    },

    filterOpportunities(opportunities, filter) {
        if (filter === 'all') return opportunities;
        return opportunities.filter(o => o.status === filter);
    },

    getOpportunityStats(opportunities) {
        const activeOps = opportunities.filter(o => o.status !== 'won' && o.status !== 'lost');
        const won = opportunities.filter(o => o.status === 'won');
        const total = opportunities.length;
        
        const avgWinRate = activeOps.length > 0 
            ? Math.round(activeOps.reduce((sum, o) => sum + Number(o.winRate || 0), 0) / activeOps.length)
            : 0;
        
        const winRatePercent = total > 0 ? Math.round((won.length / total) * 100) : 0;

        return {
            won: won.length,
            avgWinRate,
            winRatePercent
        };
    },

    renderOpportunityList(opportunities) {
        const settings = Storage.getSettings();
        const sortedOps = [...opportunities].sort((a, b) => new Date(b.expectedCloseDate) - new Date(a.expectedCloseDate));

        if (sortedOps.length === 0) {
            return `
                <div class="text-center py-12">
                    <i class="fas fa-rocket text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 mb-4">暂无商机数据</p>
                    <button onclick="OpportunitiesModule.openAddOpportunityModal()" class="px-4 py-2 bg-primary text-white rounded-lg">
                        添加第一个商机
                    </button>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${sortedOps.map(op => {
                    const status = Helpers.getOpportunityStatus(op.status);
                    const client = op.clientId ? Storage.find(Storage.KEYS.CLIENTS, op.clientId) : null;
                    const daysToClose = Helpers.getDaysDiff(new Date(), op.expectedCloseDate);
                    
                    return `
                        <div class="bg-gray-50 rounded-xl p-5 card-hover cursor-pointer" onclick="OpportunitiesModule.viewOpportunity('${op.id}')">
                            <div class="flex justify-between items-start mb-3">
                                <div class="flex-1">
                                    <h4 class="font-bold text-gray-800">${Helpers.escapeHtml(op.title)}</h4>
                                    <p class="text-sm text-gray-500">${client ? Helpers.escapeHtml(client.name) : '未关联客户'}</p>
                                </div>
                                <span class="status-badge ${status.class}">${status.label}</span>
                            </div>
                            
                            <div class="space-y-2">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500">预估金额</span>
                                    <span class="font-medium text-gray-800">${Helpers.formatCurrency(op.estimatedAmount, settings.currency)}</span>
                                </div>
                                
                                <div>
                                    <div class="flex justify-between text-sm mb-1">
                                        <span class="text-gray-500">赢率</span>
                                        <span class="font-medium ${Number(op.winRate) >= 70 ? 'text-green-600' : Number(op.winRate) >= 40 ? 'text-yellow-600' : 'text-red-600'}">${op.winRate}%</span>
                                    </div>
                                    <div class="win-rate-bar">
                                        <div class="win-rate-fill ${Number(op.winRate) >= 70 ? 'bg-green-500' : Number(op.winRate) >= 40 ? 'bg-yellow-500' : 'bg-red-500'}" 
                                             style="width: ${op.winRate}%"></div>
                                    </div>
                                </div>
                                
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500">预计签约</span>
                                    <span class="${daysToClose < 7 ? 'text-red-500 font-medium' : 'text-gray-600'}">${Helpers.formatDate(op.expectedCloseDate)}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderOpportunityDetail() {
        const op = this.selectedOpportunity;
        const status = Helpers.getOpportunityStatus(op.status);
        const client = op.clientId ? Storage.find(Storage.KEYS.CLIENTS, op.clientId) : null;
        const quotes = Storage.filter(Storage.KEYS.QUOTES, q => q.opportunityId === op.id);
        const settings = Storage.getSettings();

        return `
            <div class="space-y-6">
                <div class="flex items-center gap-4">
                    <button onclick="OpportunitiesModule.backToList()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h3 class="text-xl font-bold text-gray-800">${Helpers.escapeHtml(op.title)}</h3>
                    <span class="status-badge ${status.class}">${status.label}</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="md:col-span-2 space-y-6">
                        <div class="bg-white rounded-xl p-5 border">
                            <h4 class="font-bold text-gray-800 mb-4">商机详情</h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p class="text-sm text-gray-500">关联客户</p>
                                    <p class="font-medium text-gray-800">${client ? Helpers.escapeHtml(client.name) : '未关联'}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">预估金额</p>
                                    <p class="font-medium text-gray-800">${Helpers.formatCurrency(op.estimatedAmount, settings.currency)}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">赢率</p>
                                    <p class="font-medium ${Number(op.winRate) >= 70 ? 'text-green-600' : Number(op.winRate) >= 40 ? 'text-yellow-600' : 'text-red-600'}">${op.winRate}%</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">预计签约日期</p>
                                    <p class="font-medium text-gray-800">${Helpers.formatDate(op.expectedCloseDate)}</p>
                                </div>
                            </div>
                            <div class="mt-4">
                                <p class="text-sm text-gray-500 mb-1">商机描述</p>
                                <p class="text-gray-600">${Helpers.escapeHtml(op.description || '无描述')}</p>
                            </div>
                        </div>

                        <div class="bg-white rounded-xl p-5 border">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="font-bold text-gray-800">报价单 (${quotes.length})</h4>
                                <button onclick="OpportunitiesModule.openAddQuoteModal('${op.id}')" class="text-sm text-primary hover:text-blue-600">
                                    <i class="fas fa-plus mr-1"></i>新增报价
                                </button>
                            </div>
                            ${quotes.length === 0 ? `
                                <p class="text-gray-500 text-center py-4">暂无报价单</p>
                            ` : `
                                <div class="space-y-2">
                                    ${quotes.map(q => `
                                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p class="font-medium text-gray-800">#${q.quoteNumber}</p>
                                                <p class="text-sm text-gray-500">${Helpers.formatDate(q.issueDate)}</p>
                                            </div>
                                            <div class="text-right">
                                                <p class="font-medium text-gray-800">${Helpers.formatCurrency(q.totalAmount, settings.currency)}</p>
                                                <span class="status-badge ${q.status === 'accepted' ? 'bg-green-100 text-green-800' : q.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                                                    ${q.status === 'accepted' ? '已接受' : q.status === 'rejected' ? '已拒绝' : '待确认'}
                                                </span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="bg-white rounded-xl p-5 border">
                            <h4 class="font-bold text-gray-800 mb-4">状态更新</h4>
                            <div class="space-y-2">
                                ${['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map(s => {
                                    const sStatus = Helpers.getOpportunityStatus(s);
                                    return `
                                        <button onclick="OpportunitiesModule.updateStatus('${op.id}', '${s}')" 
                                                class="w-full text-left px-3 py-2 rounded-lg transition-all ${op.status === s ? 'bg-primary text-white' : 'bg-gray-50 hover:bg-gray-100'}">
                                            <span class="${op.status === s ? '' : sStatus.class}">${sStatus.label}</span>
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <div class="bg-white rounded-xl p-5 border">
                            <h4 class="font-bold text-gray-800 mb-4">操作</h4>
                            <div class="space-y-2">
                                <button onclick="OpportunitiesModule.editOpportunity('${op.id}')" class="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-left">
                                    <i class="fas fa-edit mr-2"></i>编辑商机
                                </button>
                                <button onclick="OpportunitiesModule.convertToProject('${op.id}')" class="w-full px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-left ${op.status !== 'won' ? 'opacity-50 cursor-not-allowed' : ''}" ${op.status !== 'won' ? 'disabled' : ''}>
                                    <i class="fas fa-project-diagram mr-2"></i>转化为项目
                                </button>
                                <button onclick="OpportunitiesModule.deleteOpportunity('${op.id}')" class="w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-left">
                                    <i class="fas fa-trash mr-2"></i>删除商机
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    viewOpportunity(id) {
        this.selectedOpportunity = Storage.find(Storage.KEYS.OPPORTUNITIES, id);
        App.refresh();
    },

    backToList() {
        this.selectedOpportunity = null;
        App.refresh();
    },

    openAddOpportunityModal() {
        const clients = Storage.get(Storage.KEYS.CLIENTS);
        const formHtml = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">商机标题 *</label>
                    <input type="text" name="title" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">关联客户</label>
                    <select name="clientId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">选择客户（可选）</option>
                        ${clients.map(c => `
                            <option value="${c.id}">${Helpers.escapeHtml(c.name)}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">预估金额 *</label>
                        <input type="number" name="estimatedAmount" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">赢率 (%) *</label>
                        <input type="number" name="winRate" min="0" max="100" value="50" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">预计签约日期</label>
                        <input type="date" name="expectedCloseDate" value="${Helpers.formatDate(new Date())}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
                        <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            <option value="lead">线索</option>
                            <option value="qualified">已确认</option>
                            <option value="proposal">报价中</option>
                            <option value="negotiation">谈判中</option>
                            <option value="won">已成交</option>
                            <option value="lost">已流失</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">商机描述</label>
                    <textarea name="description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                </div>
            </div>
        `;
        Helpers.showFormModal('新增商机', formHtml, 'OpportunitiesModule.saveOpportunity()');
    },

    editOpportunity(id) {
        const op = Storage.find(Storage.KEYS.OPPORTUNITIES, id);
        const clients = Storage.get(Storage.KEYS.CLIENTS);
        const formHtml = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">商机标题 *</label>
                    <input type="text" name="title" value="${Helpers.escapeHtml(op.title)}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">关联客户</label>
                    <select name="clientId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">选择客户（可选）</option>
                        ${clients.map(c => `
                            <option value="${c.id}" ${op.clientId === c.id ? 'selected' : ''}>${Helpers.escapeHtml(c.name)}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">预估金额 *</label>
                        <input type="number" name="estimatedAmount" step="0.01" value="${op.estimatedAmount}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">赢率 (%) *</label>
                        <input type="number" name="winRate" min="0" max="100" value="${op.winRate}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">预计签约日期</label>
                        <input type="date" name="expectedCloseDate" value="${Helpers.formatDate(op.expectedCloseDate)}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
                        <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            <option value="lead" ${op.status === 'lead' ? 'selected' : ''}>线索</option>
                            <option value="qualified" ${op.status === 'qualified' ? 'selected' : ''}>已确认</option>
                            <option value="proposal" ${op.status === 'proposal' ? 'selected' : ''}>报价中</option>
                            <option value="negotiation" ${op.status === 'negotiation' ? 'selected' : ''}>谈判中</option>
                            <option value="won" ${op.status === 'won' ? 'selected' : ''}>已成交</option>
                            <option value="lost" ${op.status === 'lost' ? 'selected' : ''}>已流失</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">商机描述</label>
                    <textarea name="description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">${Helpers.escapeHtml(op.description || '')}</textarea>
                </div>
            </div>
        `;
        Helpers.showFormModal('编辑商机', formHtml, `OpportunitiesModule.saveOpportunity('${id}')`);
    },

    saveOpportunity(id = null) {
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.title || !data.estimatedAmount) {
            Helpers.toast('请填写必填字段', 'error');
            return;
        }

        data.estimatedAmount = parseFloat(data.estimatedAmount);
        data.winRate = parseInt(data.winRate) || 0;
        data.expectedCloseDate = data.expectedCloseDate ? new Date(data.expectedCloseDate).toISOString() : new Date().toISOString();

        if (id) {
            Storage.update(Storage.KEYS.OPPORTUNITIES, id, data);
            Helpers.toast('商机已更新');
        } else {
            Storage.add(Storage.KEYS.OPPORTUNITIES, data);
            Helpers.toast('商机已创建');
        }

        Helpers.closeModal();
        App.refresh();
    },

    updateStatus(id, status) {
        const op = Storage.find(Storage.KEYS.OPPORTUNITIES, id);
        if (op.status === status) return;

        Storage.update(Storage.KEYS.OPPORTUNITIES, id, { status });
        this.selectedOpportunity = Storage.find(Storage.KEYS.OPPORTUNITIES, id);
        
        const statusLabel = Helpers.getOpportunityStatus(status).label;
        Helpers.toast(`状态已更新为: ${statusLabel}`);
        App.refresh();
    },

    convertToProject(id) {
        const op = Storage.find(Storage.KEYS.OPPORTUNITIES, id);
        if (op.status !== 'won') {
            Helpers.toast('只有已成交的商机才能转化为项目', 'error');
            return;
        }

        const project = {
            name: op.title,
            clientId: op.clientId || '',
            description: op.description || '',
            scope: op.description || '',
            deliverables: '',
            startDate: new Date().toISOString(),
            endDate: op.expectedCloseDate,
            contractAmount: op.estimatedAmount,
            billingType: 'fixed',
            status: 'planning'
        };

        const newProject = Storage.add(Storage.KEYS.PROJECTS, project);
        
        if (op.clientId) {
            Storage.update(Storage.KEYS.CLIENTS, op.clientId, { lifecycleStage: 'active' });
        }

        Helpers.toast('项目已创建');
        this.selectedOpportunity = null;
        App.switchModule('projects');
    },

    deleteOpportunity(id) {
        Helpers.confirm('确定要删除此商机吗？相关报价单也将被删除。', () => {
            const quotes = Storage.filter(Storage.KEYS.QUOTES, q => q.opportunityId === id);
            quotes.forEach(q => Storage.delete(Storage.KEYS.QUOTES, q.id));
            
            Storage.delete(Storage.KEYS.OPPORTUNITIES, id);
            Helpers.closeModal();
            Helpers.toast('商机已删除');
            this.selectedOpportunity = null;
            App.refresh();
        });
    },

    renderQuotes() {
        const quotes = Storage.get(Storage.KEYS.QUOTES);
        const settings = Storage.getSettings();
        const sortedQuotes = [...quotes].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

        const stats = {
            total: quotes.length,
            pending: quotes.filter(q => q.status === 'pending').length,
            accepted: quotes.filter(q => q.status === 'accepted').length,
            rejected: quotes.filter(q => q.status === 'rejected').length,
            totalAmount: quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + Number(q.totalAmount), 0)
        };

        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <p class="text-gray-500">共 ${quotes.length} 份报价单</p>
                    <button onclick="OpportunitiesModule.openAddQuoteModal()" class="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all">
                        <i class="fas fa-plus"></i>
                        新增报价单
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-gray-50 rounded-xl p-4">
                        <p class="text-gray-500 text-sm">报价单总数</p>
                        <p class="text-2xl font-bold text-gray-800">${stats.total}</p>
                    </div>
                    <div class="bg-yellow-50 rounded-xl p-4">
                        <p class="text-yellow-600 text-sm">待确认</p>
                        <p class="text-2xl font-bold text-yellow-700">${stats.pending}</p>
                    </div>
                    <div class="bg-green-50 rounded-xl p-4">
                        <p class="text-green-600 text-sm">已接受</p>
                        <p class="text-2xl font-bold text-green-700">${stats.accepted}</p>
                        <p class="text-xs text-green-500 mt-1">${Helpers.formatCurrency(stats.totalAmount, settings.currency)}</p>
                    </div>
                    <div class="bg-red-50 rounded-xl p-4">
                        <p class="text-red-600 text-sm">已拒绝</p>
                        <p class="text-2xl font-bold text-red-700">${stats.rejected}</p>
                    </div>
                </div>

                ${sortedQuotes.length === 0 ? `
                    <div class="text-center py-12">
                        <i class="fas fa-file-contract text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500 mb-4">暂无报价单</p>
                        <button onclick="OpportunitiesModule.openAddQuoteModal()" class="px-4 py-2 bg-primary text-white rounded-lg">
                            创建第一份报价单
                        </button>
                    </div>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">报价单编号</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">商机</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">客户</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">金额</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">日期</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                                    <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">操作</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${sortedQuotes.map(quote => {
                                    const opportunity = quote.opportunityId ? Storage.find(Storage.KEYS.OPPORTUNITIES, quote.opportunityId) : null;
                                    const client = opportunity && opportunity.clientId ? Storage.find(Storage.KEYS.CLIENTS, opportunity.clientId) : null;
                                    
                                    const statusClass = quote.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                                       quote.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                                       'bg-yellow-100 text-yellow-800';
                                    const statusLabel = quote.status === 'accepted' ? '已接受' : 
                                                       quote.status === 'rejected' ? '已拒绝' : 
                                                       '待确认';

                                    return `
                                        <tr class="table-row">
                                            <td class="px-4 py-4 font-medium text-gray-800">#${quote.quoteNumber}</td>
                                            <td class="px-4 py-4 text-gray-600">${opportunity ? Helpers.escapeHtml(opportunity.title) : '-'}</td>
                                            <td class="px-4 py-4 text-gray-600">${client ? Helpers.escapeHtml(client.name) : '-'}</td>
                                            <td class="px-4 py-4 font-medium text-gray-800">${Helpers.formatCurrency(quote.totalAmount, settings.currency)}</td>
                                            <td class="px-4 py-4 text-gray-600">${Helpers.formatDate(quote.issueDate)}</td>
                                            <td class="px-4 py-4">
                                                <span class="status-badge ${statusClass}">${statusLabel}</span>
                                            </td>
                                            <td class="px-4 py-4 text-right">
                                                <button onclick="OpportunitiesModule.viewQuote('${quote.id}')" class="text-primary hover:text-blue-600 mr-3">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button onclick="OpportunitiesModule.editQuote('${quote.id}')" class="text-primary hover:text-blue-600 mr-3">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="OpportunitiesModule.deleteQuote('${quote.id}')" class="text-danger hover:text-red-600">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    },

    openAddQuoteModal(opportunityId = null) {
        const opportunities = Storage.get(Storage.KEYS.OPPORTUNITIES).filter(o => o.status !== 'won' && o.status !== 'lost');
        const settings = Storage.getSettings();
        const nextQuoteNumber = this.generateQuoteNumber();

        const formHtml = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">报价单编号</label>
                        <input type="text" name="quoteNumber" value="${nextQuoteNumber}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">关联商机</label>
                        <select name="opportunityId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            <option value="">选择商机（可选）</option>
                            ${opportunities.map(o => `
                                <option value="${o.id}" ${opportunityId === o.id ? 'selected' : ''}>${Helpers.escapeHtml(o.title)}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">总金额 *</label>
                        <input type="number" name="totalAmount" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">开票日期</label>
                        <input type="date" name="issueDate" value="${Helpers.formatDate(new Date())}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">有效期</label>
                    <input type="date" name="validUntil" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">报价说明</label>
                    <textarea name="description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
                    <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="pending">待确认</option>
                        <option value="accepted">已接受</option>
                        <option value="rejected">已拒绝</option>
                    </select>
                </div>
            </div>
        `;
        Helpers.showFormModal('新增报价单', formHtml, 'OpportunitiesModule.saveQuote()');
    },

    editQuote(id) {
        const quote = Storage.find(Storage.KEYS.QUOTES, id);
        const opportunities = Storage.get(Storage.KEYS.OPPORTUNITIES);

        const formHtml = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">报价单编号</label>
                        <input type="text" name="quoteNumber" value="${quote.quoteNumber}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">关联商机</label>
                        <select name="opportunityId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            <option value="">选择商机（可选）</option>
                            ${opportunities.map(o => `
                                <option value="${o.id}" ${quote.opportunityId === o.id ? 'selected' : ''}>${Helpers.escapeHtml(o.title)}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">总金额 *</label>
                        <input type="number" name="totalAmount" step="0.01" value="${quote.totalAmount}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">开票日期</label>
                        <input type="date" name="issueDate" value="${Helpers.formatDate(quote.issueDate)}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">有效期</label>
                    <input type="date" name="validUntil" value="${quote.validUntil ? Helpers.formatDate(quote.validUntil) : ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">报价说明</label>
                    <textarea name="description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">${Helpers.escapeHtml(quote.description || '')}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
                    <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="pending" ${quote.status === 'pending' ? 'selected' : ''}>待确认</option>
                        <option value="accepted" ${quote.status === 'accepted' ? 'selected' : ''}>已接受</option>
                        <option value="rejected" ${quote.status === 'rejected' ? 'selected' : ''}>已拒绝</option>
                    </select>
                </div>
            </div>
        `;
        Helpers.showFormModal('编辑报价单', formHtml, `OpportunitiesModule.saveQuote('${id}')`);
    },

    saveQuote(id = null) {
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.quoteNumber || !data.totalAmount) {
            Helpers.toast('请填写必填字段', 'error');
            return;
        }

        data.totalAmount = parseFloat(data.totalAmount);
        data.issueDate = data.issueDate ? new Date(data.issueDate).toISOString() : new Date().toISOString();
        if (data.validUntil) {
            data.validUntil = new Date(data.validUntil).toISOString();
        }

        if (id) {
            Storage.update(Storage.KEYS.QUOTES, id, data);
            Helpers.toast('报价单已更新');
        } else {
            Storage.add(Storage.KEYS.QUOTES, data);
            Helpers.toast('报价单已创建');
        }

        Helpers.closeModal();
        App.refresh();
    },

    viewQuote(id) {
        const quote = Storage.find(Storage.KEYS.QUOTES, id);
        const opportunity = quote.opportunityId ? Storage.find(Storage.KEYS.OPPORTUNITIES, quote.opportunityId) : null;
        const client = opportunity && opportunity.clientId ? Storage.find(Storage.KEYS.CLIENTS, opportunity.clientId) : null;
        const settings = Storage.getSettings();

        const statusClass = quote.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                           quote.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                           'bg-yellow-100 text-yellow-800';
        const statusLabel = quote.status === 'accepted' ? '已接受' : 
                           quote.status === 'rejected' ? '已拒绝' : 
                           '待确认';

        const content = `
            <div class="invoice-preview">
                <div class="invoice-header flex justify-between">
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">报价单 #${quote.quoteNumber}</h3>
                        <p class="text-gray-500">${Helpers.formatDate(quote.issueDate)}</p>
                    </div>
                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                </div>
                
                <div class="grid grid-cols-2 gap-8 mb-6">
                    <div>
                        <h4 class="font-bold text-gray-800 mb-2">我方信息</h4>
                        <p class="text-gray-600">${settings.businessName || '我的工作室'}</p>
                        <p class="text-gray-600">${settings.businessEmail || ''}</p>
                        <p class="text-gray-600">${settings.businessPhone || ''}</p>
                        <p class="text-gray-600">${settings.businessAddress || ''}</p>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-800 mb-2">客户信息</h4>
                        ${client ? `
                            <p class="text-gray-600">${Helpers.escapeHtml(client.name)}</p>
                            <p class="text-gray-600">${client.contactPerson || ''}</p>
                            <p class="text-gray-600">${client.email || ''}</p>
                            <p class="text-gray-600">${client.phone || ''}</p>
                        ` : `
                            <p class="text-gray-500">未关联客户</p>
                        `}
                    </div>
                </div>

                <div class="mb-6">
                    <h4 class="font-bold text-gray-800 mb-2">关联商机</h4>
                    <p class="text-gray-600">${opportunity ? Helpers.escapeHtml(opportunity.title) : '无'}</p>
                </div>

                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>描述</th>
                            <th class="text-right">金额</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${Helpers.escapeHtml(quote.description || '项目服务费用')}</td>
                            <td class="text-right">${Helpers.formatCurrency(quote.totalAmount, settings.currency)}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="invoice-total">
                    总计: ${Helpers.formatCurrency(quote.totalAmount, settings.currency)}
                </div>

                ${quote.validUntil ? `
                    <p class="text-sm text-gray-500 mt-4 text-right">此报价有效期至: ${Helpers.formatDate(quote.validUntil)}</p>
                ` : ''}
            </div>
        `;

        const actions = [
            { label: '关闭', onclick: 'Helpers.closeModal()' },
            { label: '接受报价', onclick: `OpportunitiesModule.updateQuoteStatus('${quote.id}', 'accepted')`, class: 'px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg' },
            { label: '拒绝报价', onclick: `OpportunitiesModule.updateQuoteStatus('${quote.id}', 'rejected')`, class: 'px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg' }
        ];

        Helpers.showModal('报价单详情', content, actions);
    },

    updateQuoteStatus(id, status) {
        Storage.update(Storage.KEYS.QUOTES, id, { status });
        Helpers.closeModal();
        const statusLabel = status === 'accepted' ? '已接受' : status === 'rejected' ? '已拒绝' : '待确认';
        Helpers.toast(`报价单状态已更新为: ${statusLabel}`);
        App.refresh();
    },

    deleteQuote(id) {
        Helpers.confirm('确定要删除此报价单吗？', () => {
            Storage.delete(Storage.KEYS.QUOTES, id);
            Helpers.closeModal();
            Helpers.toast('报价单已删除');
            App.refresh();
        });
    },

    generateQuoteNumber() {
        const quotes = Storage.get(Storage.KEYS.QUOTES);
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const count = quotes.filter(q => {
            const date = new Date(q.createdAt);
            return date.getFullYear() === year && date.getMonth() === new Date().getMonth();
        }).length + 1;
        return `Q${year}${month}${String(count).padStart(3, '0')}`;
    }
};
