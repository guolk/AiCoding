const ProjectsModule = {
    currentFilter: 'all',
    selectedProject: null,

    render() {
        const projects = Storage.get(Storage.KEYS.PROJECTS);
        const filteredProjects = this.filterProjects(projects, this.currentFilter);
        const stats = this.getStats(projects);

        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        ${this.renderFilters()}
                    </div>
                    <button onclick="ProjectsModule.openAddModal()" class="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all">
                        <i class="fas fa-plus"></i>
                        新增项目
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <p class="text-gray-500 text-sm">总项目数</p>
                        <p class="text-2xl font-bold text-gray-800">${projects.length}</p>
                    </div>
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <p class="text-gray-500 text-sm">进行中</p>
                        <p class="text-2xl font-bold text-green-600">${stats.active}</p>
                    </div>
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <p class="text-gray-500 text-sm">合同总金额</p>
                        <p class="text-2xl font-bold text-blue-600">${Helpers.formatCurrency(stats.totalAmount)}</p>
                    </div>
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <p class="text-gray-500 text-sm">已完成</p>
                        <p class="text-2xl font-bold text-gray-600">${stats.completed}</p>
                    </div>
                </div>

                ${this.selectedProject ? this.renderProjectDetail() : this.renderProjectList(filteredProjects)}
            </div>
        `;
    },

    renderFilters() {
        const filters = [
            { key: 'all', label: '全部' },
            { key: 'planning', label: '规划中' },
            { key: 'active', label: '进行中' },
            { key: 'on_hold', label: '暂停' },
            { key: 'completed', label: '已完成' },
            { key: 'cancelled', label: '已取消' }
        ];

        return `
            <div class="flex bg-white rounded-lg p-1 shadow-sm">
                ${filters.map(f => `
                    <button onclick="ProjectsModule.setFilter('${f.key}')" 
                            class="px-4 py-2 rounded-md text-sm transition-all ${this.currentFilter === f.key ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}">
                        ${f.label}
                    </button>
                `).join('')}
            </div>
        `;
    },

    filterProjects(projects, filter) {
        if (filter === 'all') return projects;
        return projects.filter(p => p.status === filter);
    },

    setFilter(filter) {
        this.currentFilter = filter;
        this.selectedProject = null;
        App.refresh();
    },

    getStats(projects) {
        return {
            active: projects.filter(p => p.status === 'active').length,
            completed: projects.filter(p => p.status === 'completed').length,
            totalAmount: projects.reduce((sum, p) => sum + Number(p.contractAmount || 0), 0)
        };
    },

    renderProjectList(projects) {
        if (projects.length === 0) {
            return `
                <div class="bg-white rounded-xl shadow-sm p-12 text-center">
                    <i class="fas fa-project-diagram text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 mb-4">暂无项目数据</p>
                    <button onclick="ProjectsModule.openAddModal()" class="px-4 py-2 bg-primary text-white rounded-lg">
                        添加第一个项目
                    </button>
                </div>
            `;
        }

        return `
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">项目名称</th>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">客户</th>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">合同金额</th>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">时间节点</th>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">进度</th>
                            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">状态</th>
                            <th class="px-6 py-4 text-right text-sm font-medium text-gray-500">操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${projects.map(project => this.renderProjectRow(project)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderProjectRow(project) {
        const status = Helpers.getProjectStatus(project.status);
        const client = Storage.find(Storage.KEYS.CLIENTS, project.clientId);
        const progress = this.getProjectProgress(project.id);

        return `
            <tr class="table-row cursor-pointer" onclick="ProjectsModule.viewProject('${project.id}')">
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-800">${Helpers.escapeHtml(project.name)}</div>
                    <div class="text-sm text-gray-500">${Helpers.escapeHtml(project.scope ? project.scope.substring(0, 30) + '...' : '暂无范围描述')}</div>
                </td>
                <td class="px-6 py-4 text-gray-600">${client ? Helpers.escapeHtml(client.name) : '未关联'}</td>
                <td class="px-6 py-4 font-medium text-gray-800">${Helpers.formatCurrency(project.contractAmount || 0)}</td>
                <td class="px-6 py-4 text-gray-600">
                    ${project.startDate ? Helpers.formatDate(project.startDate) : '-'} 
                    ${project.endDate ? '<br>至 ' + Helpers.formatDate(project.endDate) : ''}
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <div class="flex-1 w-24 progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="text-sm font-medium text-gray-600">${progress}%</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="status-badge ${status.class}">${status.label}</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="event.stopPropagation(); ProjectsModule.editProject('${project.id}')" 
                            class="text-primary hover:text-blue-600 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="event.stopPropagation(); ProjectsModule.deleteProject('${project.id}')" 
                            class="text-danger hover:text-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    },

    renderProjectDetail() {
        const project = this.selectedProject;
        const status = Helpers.getProjectStatus(project.status);
        const client = Storage.find(Storage.KEYS.CLIENTS, project.clientId);
        const milestones = Storage.filter(Storage.KEYS.MILESTONES, m => m.projectId === project.id)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        const files = Storage.filter(Storage.KEYS.FILES, f => f.projectId === project.id);
        const timeEntries = Storage.filter(Storage.KEYS.TIME_ENTRIES, t => t.projectId === project.id);
        const progress = this.getProjectProgress(project.id);
        const totalHours = timeEntries.reduce((sum, t) => sum + Number(t.duration || 0), 0);
        const billingType = Helpers.getBillingType(project.billingType || 'hourly');

        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-1 space-y-6">
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <div class="flex justify-between items-start mb-4">
                            <button onclick="ProjectsModule.backToList()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-arrow-left mr-2"></i>返回列表
                            </button>
                            <div class="flex gap-2">
                                <button onclick="ProjectsModule.editProject('${project.id}')" class="text-primary hover:text-blue-600">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="ProjectsModule.deleteProject('${project.id}')" class="text-danger hover:text-red-600">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>

                        <h3 class="text-xl font-bold text-gray-800 mb-2">${Helpers.escapeHtml(project.name)}</h3>
                        <span class="status-badge ${status.class}">${status.label}</span>

                        <div class="mt-6 space-y-4">
                            <div class="p-4 bg-gray-50 rounded-lg">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-gray-500">项目进度</span>
                                    <span class="font-bold text-primary">${progress}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progress}%"></div>
                                </div>
                            </div>

                            <div class="flex items-center gap-3">
                                <i class="fas fa-user text-gray-400 w-5"></i>
                                <div>
                                    <p class="text-sm text-gray-500">客户</p>
                                    <p class="text-gray-800">${client ? Helpers.escapeHtml(client.name) : '未关联客户'}</p>
                                </div>
                            </div>

                            <div class="flex items-center gap-3">
                                <i class="fas fa-coins text-gray-400 w-5"></i>
                                <div>
                                    <p class="text-sm text-gray-500">合同金额</p>
                                    <p class="text-gray-800 font-medium">${Helpers.formatCurrency(project.contractAmount || 0)}</p>
                                </div>
                            </div>

                            <div class="flex items-center gap-3">
                                <i class="fas ${billingType.icon} text-gray-400 w-5"></i>
                                <div>
                                    <p class="text-sm text-gray-500">计费模式</p>
                                    <p class="text-gray-800">${billingType.label}</p>
                                </div>
                            </div>

                            ${project.billingType === 'hourly' ? `
                                <div class="flex items-center gap-3">
                                    <i class="fas fa-dollar-sign text-gray-400 w-5"></i>
                                    <div>
                                        <p class="text-sm text-gray-500">小时费率</p>
                                        <p class="text-gray-800">${Helpers.formatCurrency(project.hourlyRate || Storage.getSettings().hourlyRate)}/小时</p>
                                    </div>
                                </div>
                            ` : ''}

                            <div class="flex items-center gap-3">
                                <i class="fas fa-calendar text-gray-400 w-5"></i>
                                <div>
                                    <p class="text-sm text-gray-500">时间周期</p>
                                    <p class="text-gray-800">
                                        ${project.startDate ? Helpers.formatDate(project.startDate) : '未设置'} 
                                        ${project.endDate ? ' 至 ' + Helpers.formatDate(project.endDate) : ''}
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-center gap-3">
                                <i class="fas fa-clock text-gray-400 w-5"></i>
                                <div>
                                    <p class="text-sm text-gray-500">已投入工时</p>
                                    <p class="text-gray-800">${Helpers.formatDuration(totalHours)}</p>
                                </div>
                            </div>
                        </div>

                        ${project.scope ? `
                            <div class="mt-6">
                                <p class="text-sm font-medium text-gray-700 mb-2">项目范围</p>
                                <p class="text-gray-600 whitespace-pre-wrap">${Helpers.escapeHtml(project.scope)}</p>
                            </div>
                        ` : ''}

                        ${project.deliverables ? `
                            <div class="mt-6">
                                <p class="text-sm font-medium text-gray-700 mb-2">交付物</p>
                                <p class="text-gray-600 whitespace-pre-wrap">${Helpers.escapeHtml(project.deliverables)}</p>
                            </div>
                        ` : ''}

                        ${project.notes ? `
                            <div class="mt-6 p-4 bg-yellow-50 rounded-lg">
                                <p class="text-sm font-medium text-yellow-800 mb-2"><i class="fas fa-sticky-note mr-2"></i>备注</p>
                                <p class="text-yellow-700">${Helpers.escapeHtml(project.notes)}</p>
                            </div>
                        ` : ''}
                    </div>

                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="font-bold text-gray-800">项目文件 (${files.length})</h4>
                            <button onclick="ProjectsModule.openFileModal('${project.id}')" 
                                    class="text-primary text-sm hover:underline">
                                <i class="fas fa-upload mr-1"></i>上传
                            </button>
                        </div>

                        ${files.length > 0 ? `
                            <div class="space-y-2">
                                ${files.map(file => `
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div class="flex items-center gap-3">
                                            <i class="fas ${Helpers.getFileIcon(file.name)} text-xl"></i>
                                            <div>
                                                <p class="font-medium text-gray-800 text-sm">${Helpers.escapeHtml(file.name)}</p>
                                                <p class="text-xs text-gray-500">${file.size ? (file.size / 1024).toFixed(1) + ' KB' : ''} · ${Helpers.formatDate(file.uploadDate)}</p>
                                            </div>
                                        </div>
                                        <div class="flex gap-2">
                                            ${file.dataUrl ? `
                                                <button onclick="ProjectsModule.downloadFile('${file.id}')" class="text-gray-400 hover:text-primary">
                                                    <i class="fas fa-download"></i>
                                                </button>
                                            ` : ''}
                                            <button onclick="ProjectsModule.deleteFile('${file.id}')" class="text-gray-400 hover:text-danger">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-6">
                                <i class="fas fa-folder-open text-3xl text-gray-300 mb-2"></i>
                                <p class="text-gray-500 text-sm">暂无文件</p>
                            </div>
                        `}

                        <input type="file" id="project-file-input" class="hidden" multiple 
                               onchange="ProjectsModule.handleFileUpload('${project.id}', event)">
                    </div>
                </div>

                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="font-bold text-gray-800">项目里程碑 (${milestones.length})</h4>
                            <button onclick="ProjectsModule.openMilestoneModal('${project.id}')" 
                                    class="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2">
                                <i class="fas fa-plus"></i>
                                添加里程碑
                            </button>
                        </div>

                        ${milestones.length > 0 ? `
                            <div class="space-y-4">
                                ${milestones.map(m => this.renderMilestoneItem(m)).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-12">
                                <i class="fas fa-flag text-5xl text-gray-300 mb-4"></i>
                                <p class="text-gray-500">暂无里程碑</p>
                                <p class="text-sm text-gray-400 mt-1">添加里程碑来追踪项目进度</p>
                            </div>
                        `}
                    </div>

                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="font-bold text-gray-800">最近工时记录</h4>
                            <button onclick="App.switchModule('time'); TimeModule.setProjectFilter('${project.id}')" 
                                    class="text-primary text-sm hover:underline">
                                查看全部 <i class="fas fa-arrow-right ml-1"></i>
                            </button>
                        </div>

                        ${timeEntries.length > 0 ? `
                            <div class="space-y-3">
                                ${timeEntries.slice(-5).reverse().map(t => {
                                    return `
                                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <i class="fas fa-clock text-purple-500"></i>
                                                </div>
                                                <div>
                                                    <p class="font-medium text-gray-800">${Helpers.escapeHtml(t.description || '未描述工作')}</p>
                                                    <p class="text-sm text-gray-500">${Helpers.formatDateTime(t.startTime)}</p>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <p class="font-medium text-gray-800">${Helpers.formatDuration(t.duration || 0)}</p>
                                                ${project.billingType === 'hourly' ? `
                                                    <p class="text-sm text-green-600">${Helpers.formatCurrency((t.duration / 60) * (project.hourlyRate || Storage.getSettings().hourlyRate))}</p>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-8">
                                <i class="fas fa-clock text-4xl text-gray-300 mb-3"></i>
                                <p class="text-gray-500">暂无工时记录</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    renderMilestoneItem(milestone) {
        const statusColors = {
            pending: 'bg-gray-100 text-gray-600',
            in_progress: 'bg-blue-100 text-blue-600',
            completed: 'bg-green-100 text-green-600',
            delayed: 'bg-red-100 text-red-600'
        };
        const statusLabels = {
            pending: '待开始',
            in_progress: '进行中',
            completed: '已完成',
            delayed: '已延期'
        };

        const isOverdue = milestone.dueDate && new Date(milestone.dueDate) < new Date() && milestone.status !== 'completed';

        return `
            <div class="p-4 border rounded-lg ${milestone.status === 'completed' ? 'bg-green-50 border-green-200' : isOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <button onclick="ProjectsModule.toggleMilestone('${milestone.id}')" 
                                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center ${milestone.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-primary'}">
                                ${milestone.status === 'completed' ? '<i class="fas fa-check text-xs"></i>' : ''}
                            </button>
                            <h5 class="font-medium text-gray-800 ${milestone.status === 'completed' ? 'line-through text-gray-400' : ''}">
                                ${Helpers.escapeHtml(milestone.title)}
                            </h5>
                            <span class="status-badge ${statusColors[milestone.status]}">${statusLabels[milestone.status]}</span>
                        </div>
                        ${milestone.description ? `<p class="text-sm text-gray-600 ml-9 mb-2">${Helpers.escapeHtml(milestone.description)}</p>` : ''}
                        <div class="flex items-center gap-4 ml-9 text-sm">
                            ${milestone.dueDate ? `
                                <span class="${isOverdue ? 'text-red-500' : 'text-gray-500'}">
                                    <i class="fas fa-calendar mr-1"></i>
                                    ${isOverdue ? '已逾期' : '截止'} ${Helpers.formatDate(milestone.dueDate)}
                                </span>
                            ` : ''}
                            ${milestone.completedDate ? `
                                <span class="text-green-600">
                                    <i class="fas fa-check-circle mr-1"></i>
                                    完成于 ${Helpers.formatDate(milestone.completedDate)}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="ProjectsModule.editMilestone('${milestone.id}')" class="text-gray-400 hover:text-primary">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="ProjectsModule.deleteMilestone('${milestone.id}')" class="text-gray-400 hover:text-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    getProjectProgress(projectId) {
        const milestones = Storage.filter(Storage.KEYS.MILESTONES, m => m.projectId === projectId);
        if (milestones.length === 0) return 0;
        const completed = milestones.filter(m => m.status === 'completed').length;
        return Math.round((completed / milestones.length) * 100);
    },

    viewProject(projectId) {
        this.selectedProject = Storage.find(Storage.KEYS.PROJECTS, projectId);
        App.refresh();
    },

    backToList() {
        this.selectedProject = null;
        App.refresh();
    },

    openAddModal() {
        const formHtml = this.getProjectForm();
        Helpers.showFormModal('新增项目', formHtml, 'ProjectsModule.saveProject()');
    },

    editProject(projectId) {
        const project = Storage.find(Storage.KEYS.PROJECTS, projectId);
        const formHtml = this.getProjectForm(project);
        Helpers.showFormModal('编辑项目', formHtml, `ProjectsModule.saveProject('${projectId}')`);
    },

    getProjectForm(project = {}) {
        const clients = Storage.get(Storage.KEYS.CLIENTS);
        const settings = Storage.getSettings();

        return `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">项目名称 *</label>
                    <input type="text" name="name" value="${Helpers.escapeHtml(project.name || '')}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">关联客户</label>
                        <select name="clientId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            <option value="">请选择客户</option>
                            ${clients.map(c => `
                                <option value="${c.id}" ${project.clientId === c.id ? 'selected' : ''}>${Helpers.escapeHtml(c.name)}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">项目状态</label>
                        <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            <option value="planning" ${project.status === 'planning' ? 'selected' : ''}>规划中</option>
                            <option value="active" ${project.status === 'active' ? 'selected' : ''}>进行中</option>
                            <option value="on_hold" ${project.status === 'on_hold' ? 'selected' : ''}>暂停</option>
                            <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>已完成</option>
                            <option value="cancelled" ${project.status === 'cancelled' ? 'selected' : ''}>已取消</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                        <input type="date" name="startDate" value="${project.startDate ? Helpers.formatDate(project.startDate) : ''}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                        <input type="date" name="endDate" value="${project.endDate ? Helpers.formatDate(project.endDate) : ''}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">合同金额</label>
                        <input type="number" name="contractAmount" step="0.01" value="${project.contractAmount || ''}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">计费模式</label>
                        <select name="billingType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                onchange="document.getElementById('hourly-rate-field').style.display = this.value === 'hourly' ? 'block' : 'none'">
                            <option value="hourly" ${project.billingType === 'hourly' ? 'selected' : ''}>按小时计费</option>
                            <option value="fixed" ${project.billingType === 'fixed' ? 'selected' : ''}>按项目计费</option>
                        </select>
                    </div>
                </div>
                <div id="hourly-rate-field" style="display: ${project.billingType === 'fixed' ? 'none' : 'block'}">
                    <label class="block text-sm font-medium text-gray-700 mb-1">小时费率 (${settings.currency}/小时)</label>
                    <input type="number" name="hourlyRate" step="0.01" value="${project.hourlyRate || settings.hourlyRate}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">项目范围</label>
                    <textarea name="scope" rows="3" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="描述项目的范围和边界...">${Helpers.escapeHtml(project.scope || '')}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">交付物</label>
                    <textarea name="deliverables" rows="3" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="列出需要交付的成果...">${Helpers.escapeHtml(project.deliverables || '')}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                    <textarea name="notes" rows="2" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">${Helpers.escapeHtml(project.notes || '')}</textarea>
                </div>
            </div>
        `;
    },

    saveProject(projectId = null) {
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.name.trim()) {
            Helpers.toast('请输入项目名称', 'error');
            return;
        }

        if (projectId) {
            Storage.update(Storage.KEYS.PROJECTS, projectId, data);
            Helpers.toast('项目信息已更新');
        } else {
            data.status = data.status || 'planning';
            Storage.add(Storage.KEYS.PROJECTS, data);
            Helpers.toast('项目添加成功');
        }

        Helpers.closeModal();
        App.refresh();
    },

    deleteProject(projectId) {
        Helpers.confirm('确定要删除此项目吗？相关的里程碑和文件也会被删除。', () => {
            Storage.delete(Storage.KEYS.PROJECTS, projectId);
            
            const milestones = Storage.filter(Storage.KEYS.MILESTONES, m => m.projectId === projectId);
            milestones.forEach(m => Storage.delete(Storage.KEYS.MILESTONES, m.id));
            
            const files = Storage.filter(Storage.KEYS.FILES, f => f.projectId === projectId);
            files.forEach(f => Storage.delete(Storage.KEYS.FILES, f.id));

            this.selectedProject = null;
            Helpers.closeModal();
            Helpers.toast('项目已删除');
            App.refresh();
        });
    },

    openMilestoneModal(projectId, milestoneId = null) {
        const milestone = milestoneId ? Storage.find(Storage.KEYS.MILESTONES, milestoneId) : {};
        const formHtml = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">里程碑名称 *</label>
                    <input type="text" name="title" value="${Helpers.escapeHtml(milestone.title || '')}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <textarea name="description" rows="3" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">${Helpers.escapeHtml(milestone.description || '')}</textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                        <input type="date" name="dueDate" value="${milestone.dueDate ? Helpers.formatDate(milestone.dueDate) : ''}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
                        <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            <option value="pending" ${milestone.status === 'pending' ? 'selected' : ''}>待开始</option>
                            <option value="in_progress" ${milestone.status === 'in_progress' ? 'selected' : ''}>进行中</option>
                            <option value="completed" ${milestone.status === 'completed' ? 'selected' : ''}>已完成</option>
                            <option value="delayed" ${milestone.status === 'delayed' ? 'selected' : ''}>已延期</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        Helpers.showFormModal(
            milestoneId ? '编辑里程碑' : '添加里程碑',
            formHtml,
            `ProjectsModule.saveMilestone('${projectId}'${milestoneId ? `, '${milestoneId}'` : ''})`
        );
    },

    editMilestone(milestoneId) {
        const milestone = Storage.find(Storage.KEYS.MILESTONES, milestoneId);
        this.openMilestoneModal(milestone.projectId, milestoneId);
    },

    saveMilestone(projectId, milestoneId = null) {
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.title.trim()) {
            Helpers.toast('请输入里程碑名称', 'error');
            return;
        }

        data.projectId = projectId;
        if (data.status === 'completed' && !data.completedDate) {
            data.completedDate = new Date().toISOString();
        }

        if (milestoneId) {
            Storage.update(Storage.KEYS.MILESTONES, milestoneId, data);
            Helpers.toast('里程碑已更新');
        } else {
            data.status = data.status || 'pending';
            Storage.add(Storage.KEYS.MILESTONES, data);
            Helpers.toast('里程碑已添加');
        }

        Helpers.closeModal();
        if (this.selectedProject && this.selectedProject.id === projectId) {
            this.selectedProject = Storage.find(Storage.KEYS.PROJECTS, projectId);
        }
        App.refresh();
    },

    toggleMilestone(milestoneId) {
        const milestone = Storage.find(Storage.KEYS.MILESTONES, milestoneId);
        const newStatus = milestone.status === 'completed' ? 'pending' : 'completed';
        const updates = {
            status: newStatus,
            completedDate: newStatus === 'completed' ? new Date().toISOString() : null
        };
        Storage.update(Storage.KEYS.MILESTONES, milestoneId, updates);
        
        if (this.selectedProject) {
            this.selectedProject = Storage.find(Storage.KEYS.PROJECTS, this.selectedProject.id);
        }
        
        Helpers.toast(newStatus === 'completed' ? '里程碑已完成' : '里程碑已重置');
        App.refresh();
    },

    deleteMilestone(milestoneId) {
        Helpers.confirm('确定要删除此里程碑吗？', () => {
            const milestone = Storage.find(Storage.KEYS.MILESTONES, milestoneId);
            Storage.delete(Storage.KEYS.MILESTONES, milestoneId);
            Helpers.closeModal();
            Helpers.toast('里程碑已删除');
            if (this.selectedProject && milestone && this.selectedProject.id === milestone.projectId) {
                this.selectedProject = Storage.find(Storage.KEYS.PROJECTS, milestone.projectId);
            }
            App.refresh();
        });
    },

    openFileModal(projectId) {
        document.getElementById('project-file-input').click();
    },

    handleFileUpload(projectId, event) {
        const files = event.target.files;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = {
                    projectId,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    dataUrl: e.target.result,
                    uploadDate: new Date().toISOString()
                };
                Storage.add(Storage.KEYS.FILES, fileData);
                
                if (this.selectedProject && this.selectedProject.id === projectId) {
                    this.selectedProject = Storage.find(Storage.KEYS.PROJECTS, projectId);
                }
                
                Helpers.toast(`文件 "${file.name}" 上传成功`);
                App.refresh();
            };
            reader.readAsDataURL(file);
        });
        event.target.value = '';
    },

    downloadFile(fileId) {
        const file = Storage.find(Storage.KEYS.FILES, fileId);
        if (file && file.dataUrl) {
            const a = document.createElement('a');
            a.href = file.dataUrl;
            a.download = file.name;
            a.click();
        }
    },

    deleteFile(fileId) {
        Helpers.confirm('确定要删除此文件吗？', () => {
            const file = Storage.find(Storage.KEYS.FILES, fileId);
            Storage.delete(Storage.KEYS.FILES, fileId);
            Helpers.closeModal();
            Helpers.toast('文件已删除');
            if (this.selectedProject && file && this.selectedProject.id === file.projectId) {
                this.selectedProject = Storage.find(Storage.KEYS.PROJECTS, file.projectId);
            }
            App.refresh();
        });
    }
};
