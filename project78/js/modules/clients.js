const ClientsModule = {
    currentFilter: 'all',
    selectedClient: null,

    render() {
        const clients = Storage.get(Storage.KEYS.CLIENTS);
        const filteredClients = this.filterClients(clients, this.currentFilter);
        const stats = this.getStats(clients);

        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        ${this.renderFilters()}
                    </div>
                    <button onclick="ClientsModule.openAddModal()" class="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all">
                        <i class="fas fa-plus"></i>
                        新增客户
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <p class="text-gray-500 text-sm">总客户数</p>
                        <p class="text-2xl font-bold text-gray-800">${clients.length}</p>
                    </div>
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <p class="text-gray-500 text-sm">合作中</p>
                        <p class="text-2xl font-bold text-green-600">${stats.active}</p>
                    </div>
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <p class="text-gray-500 text-sm">谈判中</p>
                        <p class="text-2xl font-bold text-blue-600">${stats.negotiation}</p>
                    </div>
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <p class="text-gray-500 text-sm">潜在客户</p>
                        <p class="text-2xl font-bold text-yellow-600">${stats.potential}</p>
                    </div>
                </div>

                ${this.selectedClient ? this.renderClientDetail() : this.renderClientList(filteredClients)}
            </div>
        `;
    },

    renderFilters() {
        const filters = [
            { key: 'all', label: '全部' },
            { key: 'potential', label: '潜在客户' },
            { key: 'negotiation', label: '谈判中' },
            { key: 'active', label: '合作中' },
            { key: 'completed', label: '已完成' },
            { key: 'repeat', label: '复购客户' }
        ];

        return `
            <div class="flex bg-white rounded-lg p-1 shadow-sm">
                ${filters.map(f => `
                    <button onclick="ClientsModule.setFilter('${f.key}')" 
                            class="px-4 py-2 rounded-md text-sm transition-all ${this.currentFilter === f.key ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}">
                        ${f.label}
                    </button>
                `).join('')}
            </div>
        `;
    },

    filterClients(clients, filter) {
        if (filter === 'all') return clients;
        return clients.filter(c => c.lifecycleStage === filter);
    },

    setFilter(filter) {
        this.currentFilter = filter;
        this.selectedClient = null;
        App.refresh();
    },

    getStats(clients) {
        return {
            active: clients.filter(c => c.lifecycleStage === 'active').length,
            negotiation: clients.filter(c => c.lifecycleStage === 'negotiation').length,
            potential: clients.filter(c => c.lifecycleStage === 'potential').length,
            completed: clients.filter(c => c.lifecycleStage === 'completed').length,
            repeat: clients.filter(c => c.lifecycleStage === 'repeat').length
        };
    },

    renderClientList(clients) {
        if (clients.length === 0) {
            return `
                <div class="bg-white rounded-xl shadow-sm p-12 text-center">
                    <i class="fas fa-users text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 mb-4">暂无客户数据</p>
                    <button onclick="ClientsModule.openAddModal()" class="px-4 py-2 bg-primary text-white rounded-lg">
                        添加第一个客户
                    </button>
                </div>
            `;
        }

        return `
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">客户名称</th>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">联系方式</th>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">行业</th>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">生命周期</th>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">最近沟通</th>
                            <th class="px-6 py-4 text-right text-sm font-medium text-gray-500">操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${clients.map(client => this.renderClientRow(client)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderClientRow(client) {
        const status = Helpers.getClientLifecycleStatus(client.lifecycleStage);
        const communications = Storage.filter(Storage.KEYS.COMMUNICATIONS, c => c.clientId === client.id);
        const lastComm = communications.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        return `
            <tr class="table-row cursor-pointer" onclick="ClientsModule.viewClient('${client.id}')">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-primary"></i>
                        </div>
                        <div>
                            <p class="font-medium text-gray-800">${Helpers.escapeHtml(client.name)}</p>
                            <p class="text-sm text-gray-500">${Helpers.escapeHtml(client.contactPerson || '')}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <p class="text-gray-600">${Helpers.escapeHtml(client.email || '-')}</p>
                    <p class="text-sm text-gray-500">${Helpers.escapeHtml(client.phone || '-')}</p>
                </td>
                <td class="px-6 py-4 text-gray-600">${Helpers.escapeHtml(client.industry || '-')}</td>
                <td class="px-6 py-4">
                    <span class="status-badge ${status.class}">${status.label}</span>
                </td>
                <td class="px-6 py-4 text-gray-600">
                    ${lastComm ? Helpers.formatDate(lastComm.date) : '-'}
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="event.stopPropagation(); ClientsModule.editClient('${client.id}')" 
                            class="text-primary hover:text-blue-600 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="event.stopPropagation(); ClientsModule.deleteClient('${client.id}')" 
                            class="text-danger hover:text-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    },

    renderClientDetail() {
        const client = this.selectedClient;
        const status = Helpers.getClientLifecycleStatus(client.lifecycleStage);
        const communications = Storage.filter(Storage.KEYS.COMMUNICATIONS, c => c.clientId === client.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        const projects = Storage.filter(Storage.KEYS.PROJECTS, p => p.clientId === client.id);

        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-1 space-y-6">
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <div class="flex justify-between items-start mb-4">
                            <button onclick="ClientsModule.backToList()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-arrow-left mr-2"></i>返回列表
                            </button>
                            <div class="flex gap-2">
                                <button onclick="ClientsModule.editClient('${client.id}')" class="text-primary hover:text-blue-600">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="ClientsModule.deleteClient('${client.id}')" class="text-danger hover:text-red-600">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>

                        <div class="text-center mb-6">
                            <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-building text-3xl text-primary"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800">${Helpers.escapeHtml(client.name)}</h3>
                            <span class="status-badge ${status.class} mt-2">${status.label}</span>
                        </div>

                        <div class="space-y-4">
                            <div class="flex items-center gap-3">
                                <i class="fas fa-user text-gray-400 w-5"></i>
                                <div>
                                    <p class="text-sm text-gray-500">联系人</p>
                                    <p class="text-gray-800">${Helpers.escapeHtml(client.contactPerson || '未设置')}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="fas fa-envelope text-gray-400 w-5"></i>
                                <div>
                                    <p class="text-sm text-gray-500">邮箱</p>
                                    <p class="text-gray-800">${Helpers.escapeHtml(client.email || '未设置')}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="fas fa-phone text-gray-400 w-5"></i>
                                <div>
                                    <p class="text-sm text-gray-500">电话</p>
                                    <p class="text-gray-800">${Helpers.escapeHtml(client.phone || '未设置')}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="fas fa-building text-gray-400 w-5"></i>
                                <div>
                                    <p class="text-sm text-gray-500">行业</p>
                                    <p class="text-gray-800">${Helpers.escapeHtml(client.industry || '未设置')}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="fas fa-comments text-gray-400 w-5"></i>
                                <div>
                                    <p class="text-sm text-gray-500">沟通偏好</p>
                                    <p class="text-gray-800">${Helpers.escapeHtml(client.communicationPreference || '未设置')}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="fas fa-map-marker-alt text-gray-400 w-5"></i>
                                <div>
                                    <p class="text-sm text-gray-500">地址</p>
                                    <p class="text-gray-800">${Helpers.escapeHtml(client.address || '未设置')}</p>
                                </div>
                            </div>
                        </div>

                        ${client.notes ? `
                            <div class="mt-6 p-4 bg-yellow-50 rounded-lg">
                                <p class="text-sm font-medium text-yellow-800 mb-2"><i class="fas fa-sticky-note mr-2"></i>重要备注</p>
                                <p class="text-yellow-700">${Helpers.escapeHtml(client.notes)}</p>
                            </div>
                        ` : ''}
                    </div>

                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h4 class="font-bold text-gray-800 mb-4">客户生命周期</h4>
                        <div class="space-y-2">
                            ${['potential', 'negotiation', 'active', 'completed', 'repeat'].map((stage, i) => {
                                const stageInfo = Helpers.getClientLifecycleStatus(stage);
                                const isActive = client.lifecycleStage === stage;
                                const isPast = ['potential', 'negotiation', 'active', 'completed', 'repeat']
                                    .indexOf(client.lifecycleStage) > i;
                                return `
                                    <div class="flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 border border-primary/30' : isPast ? 'bg-gray-50' : ''}">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-white' : isPast ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}">
                                            <i class="fas ${isPast ? 'fa-check' : 'fa-' + (i + 1)} text-sm"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="font-medium ${isActive ? 'text-primary' : 'text-gray-800'}">${stageInfo.label}</p>
                                        </div>
                                        ${isActive ? '' : `
                                            <button onclick="ClientsModule.updateLifecycle('${client.id}', '${stage}')" 
                                                    class="text-sm text-gray-400 hover:text-primary">
                                                切换至此
                                            </button>
                                        `}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h4 class="font-bold text-gray-800 mb-4">关联项目 (${projects.length})</h4>
                        <div class="space-y-3">
                            ${projects.length > 0 ? projects.slice(0, 5).map(p => {
                                const pStatus = Helpers.getProjectStatus(p.status);
                                return `
                                    <div class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100" 
                                         onclick="App.switchModule('projects'); ProjectsModule.viewProject('${p.id}')">
                                        <p class="font-medium text-gray-800">${Helpers.escapeHtml(p.name)}</p>
                                        <div class="flex justify-between items-center mt-1">
                                            <span class="status-badge ${pStatus.class}">${pStatus.label}</span>
                                            <span class="text-sm text-gray-500">${Helpers.formatCurrency(p.contractAmount || 0)}</span>
                                        </div>
                                    </div>
                                `;
                            }).join('') : '<p class="text-gray-500 text-center py-4">暂无项目</p>'}
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="font-bold text-gray-800">沟通历史 (${communications.length})</h4>
                            <button onclick="ClientsModule.openCommunicationModal('${client.id}')" 
                                    class="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2">
                                <i class="fas fa-plus"></i>
                                记录沟通
                            </button>
                        </div>

                        ${communications.length > 0 ? `
                            <div class="space-y-4">
                                ${communications.map(comm => this.renderCommunicationItem(comm)).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-12">
                                <i class="fas fa-comments text-5xl text-gray-300 mb-4"></i>
                                <p class="text-gray-500">暂无沟通记录</p>
                                <p class="text-sm text-gray-400 mt-1">点击右上角按钮记录第一次沟通</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    renderCommunicationItem(comm) {
        const typeIcons = {
            email: 'fa-envelope text-blue-500',
            phone: 'fa-phone text-green-500',
            meeting: 'fa-users text-purple-500',
            other: 'fa-comment text-gray-500'
        };
        const typeLabels = {
            email: '邮件',
            phone: '电话',
            meeting: '会议',
            other: '其他'
        };

        return `
            <div class="timeline-item pb-4">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <i class="fas ${typeIcons[comm.type] || typeIcons.other}"></i>
                        <span class="font-medium text-gray-800">${typeLabels[comm.type] || '其他'}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-500">${Helpers.formatDateTime(comm.date)}</span>
                        <button onclick="ClientsModule.editCommunication('${comm.id}')" class="text-gray-400 hover:text-primary">
                            <i class="fas fa-edit text-sm"></i>
                        </button>
                        <button onclick="ClientsModule.deleteCommunication('${comm.id}')" class="text-gray-400 hover:text-danger">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
                ${comm.title ? `<p class="font-medium text-gray-700 mb-1">${Helpers.escapeHtml(comm.title)}</p>` : ''}
                <p class="text-gray-600 whitespace-pre-wrap">${Helpers.escapeHtml(comm.content || '')}</p>
            </div>
        `;
    },

    viewClient(clientId) {
        this.selectedClient = Storage.find(Storage.KEYS.CLIENTS, clientId);
        App.refresh();
    },

    backToList() {
        this.selectedClient = null;
        App.refresh();
    },

    openAddModal() {
        const formHtml = this.getClientForm();
        Helpers.showFormModal('新增客户', formHtml, 'ClientsModule.saveClient()');
    },

    editClient(clientId) {
        const client = Storage.find(Storage.KEYS.CLIENTS, clientId);
        const formHtml = this.getClientForm(client);
        Helpers.showFormModal('编辑客户', formHtml, `ClientsModule.saveClient('${clientId}')`);
    },

    getClientForm(client = {}) {
        return `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">客户名称 *</label>
                        <input type="text" name="name" value="${Helpers.escapeHtml(client.name || '')}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">联系人</label>
                        <input type="text" name="contactPerson" value="${Helpers.escapeHtml(client.contactPerson || '')}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                        <input type="email" name="email" value="${Helpers.escapeHtml(client.email || '')}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">电话</label>
                        <input type="tel" name="phone" value="${Helpers.escapeHtml(client.phone || '')}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">行业</label>
                        <select name="industry" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            <option value="">请选择</option>
                            <option value="科技/互联网" ${client.industry === '科技/互联网' ? 'selected' : ''}>科技/互联网</option>
                            <option value="金融/银行" ${client.industry === '金融/银行' ? 'selected' : ''}>金融/银行</option>
                            <option value="教育/培训" ${client.industry === '教育/培训' ? 'selected' : ''}>教育/培训</option>
                            <option value="医疗/健康" ${client.industry === '医疗/健康' ? 'selected' : ''}>医疗/健康</option>
                            <option value="零售/电商" ${client.industry === '零售/电商' ? 'selected' : ''}>零售/电商</option>
                            <option value="制造/工业" ${client.industry === '制造/工业' ? 'selected' : ''}>制造/工业</option>
                            <option value="传媒/广告" ${client.industry === '传媒/广告' ? 'selected' : ''}>传媒/广告</option>
                            <option value="其他" ${client.industry === '其他' ? 'selected' : ''}>其他</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">生命周期阶段</label>
                        <select name="lifecycleStage" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            <option value="potential" ${client.lifecycleStage === 'potential' ? 'selected' : ''}>潜在客户</option>
                            <option value="negotiation" ${client.lifecycleStage === 'negotiation' ? 'selected' : ''}>谈判中</option>
                            <option value="active" ${client.lifecycleStage === 'active' ? 'selected' : ''}>合作中</option>
                            <option value="completed" ${client.lifecycleStage === 'completed' ? 'selected' : ''}>已完成</option>
                            <option value="repeat" ${client.lifecycleStage === 'repeat' ? 'selected' : ''}>复购客户</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">沟通偏好</label>
                    <select name="communicationPreference" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">请选择</option>
                        <option value="邮件优先" ${client.communicationPreference === '邮件优先' ? 'selected' : ''}>邮件优先</option>
                        <option value="电话优先" ${client.communicationPreference === '电话优先' ? 'selected' : ''}>电话优先</option>
                        <option value="微信优先" ${client.communicationPreference === '微信优先' ? 'selected' : ''}>微信优先</option>
                        <option value="会议优先" ${client.communicationPreference === '会议优先' ? 'selected' : ''}>会议优先</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">地址</label>
                    <input type="text" name="address" value="${Helpers.escapeHtml(client.address || '')}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">重要备注</label>
                    <textarea name="notes" rows="3" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">${Helpers.escapeHtml(client.notes || '')}</textarea>
                </div>
            </div>
        `;
    },

    saveClient(clientId = null) {
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.name.trim()) {
            Helpers.toast('请输入客户名称', 'error');
            return;
        }

        if (clientId) {
            Storage.update(Storage.KEYS.CLIENTS, clientId, data);
            Helpers.toast('客户信息已更新');
        } else {
            data.lifecycleStage = data.lifecycleStage || 'potential';
            Storage.add(Storage.KEYS.CLIENTS, data);
            Helpers.toast('客户添加成功');
        }

        Helpers.closeModal();
        App.refresh();
    },

    deleteClient(clientId) {
        Helpers.confirm('确定要删除此客户吗？相关的沟通记录也会被删除。', () => {
            Storage.delete(Storage.KEYS.CLIENTS, clientId);
            const comms = Storage.filter(Storage.KEYS.COMMUNICATIONS, c => c.clientId === clientId);
            comms.forEach(c => Storage.delete(Storage.KEYS.COMMUNICATIONS, c.id));
            this.selectedClient = null;
            Helpers.closeModal();
            Helpers.toast('客户已删除');
            App.refresh();
        });
    },

    updateLifecycle(clientId, stage) {
        Storage.update(Storage.KEYS.CLIENTS, clientId, { lifecycleStage: stage });
        if (this.selectedClient && this.selectedClient.id === clientId) {
            this.selectedClient = Storage.find(Storage.KEYS.CLIENTS, clientId);
        }
        Helpers.toast('生命周期已更新');
        App.refresh();
    },

    openCommunicationModal(clientId, commId = null) {
        const comm = commId ? Storage.find(Storage.KEYS.COMMUNICATIONS, commId) : {};
        const formHtml = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">沟通类型 *</label>
                        <select name="type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                            <option value="email" ${comm.type === 'email' ? 'selected' : ''}>邮件</option>
                            <option value="phone" ${comm.type === 'phone' ? 'selected' : ''}>电话</option>
                            <option value="meeting" ${comm.type === 'meeting' ? 'selected' : ''}>会议</option>
                            <option value="other" ${comm.type === 'other' ? 'selected' : ''}>其他</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">沟通时间</label>
                        <input type="datetime-local" name="date" 
                               value="${comm.date ? Helpers.formatDate(comm.date, 'YYYY-MM-DD') + 'T' + Helpers.formatDate(comm.date, 'HH:mm') : Helpers.formatDate(new Date(), 'YYYY-MM-DD') + 'T' + Helpers.formatDate(new Date(), 'HH:mm')}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">沟通主题</label>
                    <input type="text" name="title" value="${Helpers.escapeHtml(comm.title || '')}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">沟通内容 *</label>
                    <textarea name="content" rows="5" required
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="请记录沟通要点...">${Helpers.escapeHtml(comm.content || '')}</textarea>
                </div>
            </div>
        `;

        Helpers.showFormModal(
            commId ? '编辑沟通记录' : '记录沟通', 
            formHtml, 
            `ClientsModule.saveCommunication('${clientId}'${commId ? `, '${commId}'` : ''})`
        );
    },

    editCommunication(commId) {
        const comm = Storage.find(Storage.KEYS.COMMUNICATIONS, commId);
        this.openCommunicationModal(comm.clientId, commId);
    },

    saveCommunication(clientId, commId = null) {
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.content.trim()) {
            Helpers.toast('请输入沟通内容', 'error');
            return;
        }

        data.clientId = clientId;
        data.date = data.date ? new Date(data.date).toISOString() : new Date().toISOString();

        if (commId) {
            Storage.update(Storage.KEYS.COMMUNICATIONS, commId, data);
            Helpers.toast('沟通记录已更新');
        } else {
            Storage.add(Storage.KEYS.COMMUNICATIONS, data);
            Helpers.toast('沟通记录已保存');
        }

        Helpers.closeModal();
        if (this.selectedClient && this.selectedClient.id === clientId) {
            this.selectedClient = Storage.find(Storage.KEYS.CLIENTS, clientId);
        }
        App.refresh();
    },

    deleteCommunication(commId) {
        Helpers.confirm('确定要删除此沟通记录吗？', () => {
            const comm = Storage.find(Storage.KEYS.COMMUNICATIONS, commId);
            Storage.delete(Storage.KEYS.COMMUNICATIONS, commId);
            Helpers.closeModal();
            Helpers.toast('沟通记录已删除');
            if (this.selectedClient && comm && this.selectedClient.id === comm.clientId) {
                this.selectedClient = Storage.find(Storage.KEYS.CLIENTS, comm.clientId);
            }
            App.refresh();
        });
    }
};
