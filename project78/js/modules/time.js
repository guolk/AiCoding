const TimeModule = {
    currentTimer: null,
    timerStartTime: null,
    timerInterval: null,
    projectFilter: null,
    activeTab: 'entries',

    render() {
        const timeEntries = Storage.get(Storage.KEYS.TIME_ENTRIES);
        const filteredEntries = this.projectFilter 
            ? timeEntries.filter(t => t.projectId === this.projectFilter)
            : timeEntries;
        
        const invoices = Storage.get(Storage.KEYS.INVOICES);
        const settings = Storage.getSettings();
        
        const today = new Date().toDateString();
        const todayMinutes = filteredEntries
            .filter(t => new Date(t.startTime).toDateString() === today)
            .reduce((sum, t) => sum + Number(t.duration || 0), 0);
        
        const weekMinutes = this.getWeekMinutes(filteredEntries);
        const totalMinutes = filteredEntries.reduce((sum, t) => sum + Number(t.duration || 0), 0);
        const totalEarnings = this.calculateEarnings(filteredEntries);

        return `
            <div class="space-y-6">
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800 mb-1">工时追踪</h3>
                            <p class="text-gray-500 text-sm">记录您的工作时间，支持按小时或项目计费</p>
                        </div>
                        <div class="flex items-center gap-3">
                            ${this.projectFilter ? `
                                <button onclick="TimeModule.setProjectFilter(null)" class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
                                    <i class="fas fa-times mr-1"></i>清除筛选
                                </button>
                            ` : ''}
                            <button onclick="TimeModule.openAddEntryModal()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-2">
                                <i class="fas fa-plus"></i>
                                手动添加
                            </button>
                        </div>
                    </div>

                    ${this.renderTimer()}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <p class="text-gray-500 text-sm">今日工时</p>
                        <p class="text-2xl font-bold text-gray-800">${Helpers.formatDuration(todayMinutes)}</p>
                    </div>
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <p class="text-gray-500 text-sm">本周工时</p>
                        <p class="text-2xl font-bold text-blue-600">${Helpers.formatDuration(weekMinutes)}</p>
                    </div>
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <p class="text-gray-500 text-sm">总工时</p>
                        <p class="text-2xl font-bold text-gray-800">${Helpers.formatDuration(totalMinutes)}</p>
                    </div>
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <p class="text-gray-500 text-sm">预估收入</p>
                        <p class="text-2xl font-bold text-green-600">${Helpers.formatCurrency(totalEarnings, settings.currency)}</p>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm">
                    <div class="border-b px-6 py-4">
                        <div class="flex gap-4">
                            <button onclick="TimeModule.setTab('entries')" 
                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all ${this.activeTab === 'entries' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}">
                                工时记录
                            </button>
                            <button onclick="TimeModule.setTab('invoices')" 
                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all ${this.activeTab === 'invoices' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}">
                                发票管理
                            </button>
                        </div>
                    </div>

                    <div class="p-6">
                        ${this.activeTab === 'entries' ? this.renderTimeEntries(filteredEntries) : this.renderInvoices(invoices)}
                    </div>
                </div>
            </div>
        `;
    },

    renderTimer() {
        const projects = Storage.get(Storage.KEYS.PROJECTS).filter(p => p.status === 'active' || p.status === 'planning');
        const isRunning = this.currentTimer !== null;

        return `
            <div class="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div class="flex flex-col md:flex-row md:items-center gap-6">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-2">选择项目</label>
                        <select id="timer-project" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${isRunning ? 'bg-gray-100' : ''}" ${isRunning ? 'disabled' : ''}>
                            <option value="">请选择项目</option>
                            ${projects.map(p => `
                                <option value="${p.id}" ${this.currentTimer && this.currentTimer.projectId === p.id ? 'selected' : ''}>${Helpers.escapeHtml(p.name)}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-2">工作描述</label>
                        <input type="text" id="timer-description" placeholder="正在做什么工作？" 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${isRunning ? 'bg-gray-100' : ''}" ${isRunning ? 'disabled' : ''}>
                    </div>
                    <div class="flex items-end gap-3">
                        ${isRunning ? `
                            <div class="text-center">
                                <div id="timer-display" class="text-4xl font-bold text-gray-800 font-mono timer-active">
                                    ${this.getTimerDisplay()}
                                </div>
                                <p class="text-sm text-gray-500 mt-1">正在计时...</p>
                            </div>
                            <button onclick="TimeModule.stopTimer()" class="px-6 py-3 bg-danger hover:bg-red-600 text-white rounded-lg font-medium flex items-center gap-2">
                                <i class="fas fa-stop"></i>
                                停止
                            </button>
                        ` : `
                            <button onclick="TimeModule.startTimer()" class="px-8 py-3 bg-secondary hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-2">
                                <i class="fas fa-play"></i>
                                开始计时
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    getTimerDisplay() {
        if (!this.timerStartTime) return '00:00:00';
        const elapsed = Math.floor((Date.now() - this.timerStartTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },

    startTimer() {
        const projectId = document.getElementById('timer-project').value;
        const description = document.getElementById('timer-description').value;

        if (!projectId) {
            Helpers.toast('请选择项目', 'error');
            return;
        }

        this.currentTimer = {
            projectId,
            description,
            startTime: new Date().toISOString()
        };
        this.timerStartTime = Date.now();

        this.timerInterval = setInterval(() => {
            const display = document.getElementById('timer-display');
            if (display) {
                display.textContent = this.getTimerDisplay();
            }
        }, 1000);

        App.refresh();
        Helpers.toast('计时已开始');
    },

    stopTimer() {
        if (!this.currentTimer) return;

        const duration = Math.round((Date.now() - this.timerStartTime) / 1000 / 60);

        if (duration < 1) {
            Helpers.toast('工作时间太短，请至少记录1分钟', 'warning');
            this.clearTimer();
            App.refresh();
            return;
        }

        const entry = {
            projectId: this.currentTimer.projectId,
            description: this.currentTimer.description,
            startTime: this.currentTimer.startTime,
            endTime: new Date().toISOString(),
            duration: duration,
            billable: true
        };

        Storage.add(Storage.KEYS.TIME_ENTRIES, entry);
        this.clearTimer();
        App.refresh();
        Helpers.toast(`已记录 ${Helpers.formatDuration(duration)}`);
    },

    clearTimer() {
        this.currentTimer = null;
        this.timerStartTime = null;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    setProjectFilter(projectId) {
        this.projectFilter = projectId;
        App.refresh();
    },

    setTab(tab) {
        this.activeTab = tab;
        App.refresh();
    },

    getWeekMinutes(entries) {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        weekStart.setHours(0, 0, 0, 0);
        
        return entries
            .filter(t => new Date(t.startTime) >= weekStart)
            .reduce((sum, t) => sum + Number(t.duration || 0), 0);
    },

    calculateEarnings(entries) {
        const settings = Storage.getSettings();
        return entries.reduce((sum, t) => {
            const project = Storage.find(Storage.KEYS.PROJECTS, t.projectId);
            if (project && project.billingType === 'hourly') {
                const rate = Number(project.hourlyRate || settings.hourlyRate);
                return sum + (t.duration / 60) * rate;
            }
            return sum;
        }, 0);
    },

    renderTimeEntries(entries) {
        const sortedEntries = [...entries].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

        if (sortedEntries.length === 0) {
            return `
                <div class="text-center py-12">
                    <i class="fas fa-clock text-5xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">暂无工时记录</p>
                    <p class="text-sm text-gray-400 mt-1">点击上方开始计时或手动添加</p>
                </div>
            `;
        }

        return `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">日期</th>
                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">项目</th>
                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">描述</th>
                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">时长</th>
                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">金额</th>
                            <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${sortedEntries.map(entry => {
                            const project = Storage.find(Storage.KEYS.PROJECTS, entry.projectId);
                            const settings = Storage.getSettings();
                            let amount = 0;
                            if (project && project.billingType === 'hourly') {
                                const rate = Number(project.hourlyRate || settings.hourlyRate);
                                amount = (entry.duration / 60) * rate;
                            }

                            return `
                                <tr class="table-row">
                                    <td class="px-4 py-4 text-gray-600">${Helpers.formatDateTime(entry.startTime)}</td>
                                    <td class="px-4 py-4 text-gray-800">${project ? Helpers.escapeHtml(project.name) : '未关联'}</td>
                                    <td class="px-4 py-4 text-gray-600">${Helpers.escapeHtml(entry.description || '-')}</td>
                                    <td class="px-4 py-4 font-medium text-gray-800">${Helpers.formatDuration(entry.duration || 0)}</td>
                                    <td class="px-4 py-4 text-green-600 font-medium">${amount > 0 ? Helpers.formatCurrency(amount, settings.currency) : '-'}</td>
                                    <td class="px-4 py-4 text-right">
                                        <button onclick="TimeModule.editEntry('${entry.id}')" class="text-primary hover:text-blue-600 mr-3">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="TimeModule.deleteEntry('${entry.id}')" class="text-danger hover:text-red-600">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderInvoices(invoices) {
        const sortedInvoices = [...invoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const settings = Storage.getSettings();

        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center mb-4">
                    <p class="text-gray-500">共 ${invoices.length} 张发票</p>
                    <button onclick="TimeModule.openCreateInvoiceModal()" class="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2">
                        <i class="fas fa-file-invoice"></i>
                        创建发票
                    </button>
                </div>

                ${sortedInvoices.length === 0 ? `
                    <div class="text-center py-12">
                        <i class="fas fa-file-invoice text-5xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">暂无发票</p>
                        <p class="text-sm text-gray-400 mt-1">点击右上角创建第一张发票</p>
                    </div>
                ` : `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${sortedInvoices.map(invoice => {
                            const status = Helpers.getInvoiceStatus(invoice.status);
                            const client = Storage.find(Storage.KEYS.CLIENTS, invoice.clientId);
                            const payments = Storage.filter(Storage.KEYS.PAYMENTS, p => p.invoiceId === invoice.id);
                            const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
                            const remaining = Number(invoice.totalAmount) - paidAmount;

                            return `
                                <div class="border rounded-xl p-4 hover:shadow-md transition-all">
                                    <div class="flex justify-between items-start mb-3">
                                        <div>
                                            <p class="text-sm text-gray-500">发票 #${invoice.invoiceNumber}</p>
                                            <p class="font-bold text-lg text-gray-800">${Helpers.formatCurrency(invoice.totalAmount, settings.currency)}</p>
                                        </div>
                                        <span class="status-badge ${status.class}">${status.label}</span>
                                    </div>
                                    <div class="space-y-2 text-sm">
                                        <p class="text-gray-600">客户: ${client ? Helpers.escapeHtml(client.name) : '未关联'}</p>
                                        <p class="text-gray-600">创建日期: ${Helpers.formatDate(invoice.createdAt)}</p>
                                        <p class="text-gray-600">到期日期: ${Helpers.formatDate(invoice.dueDate)}</p>
                                        ${paidAmount > 0 ? `<p class="text-green-600">已收款: ${Helpers.formatCurrency(paidAmount, settings.currency)}</p>` : ''}
                                        ${remaining > 0 && invoice.status !== 'paid' ? `<p class="text-red-500">待收款: ${Helpers.formatCurrency(remaining, settings.currency)}</p>` : ''}
                                    </div>
                                    <div class="flex gap-2 mt-4 pt-4 border-t">
                                        <button onclick="TimeModule.viewInvoice('${invoice.id}')" class="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
                                            查看
                                        </button>
                                        <button onclick="TimeModule.downloadInvoicePDF('${invoice.id}')" class="flex-1 px-3 py-2 text-sm bg-primary hover:bg-blue-600 text-white rounded-lg">
                                            <i class="fas fa-download mr-1"></i>PDF
                                        </button>
                                        ${invoice.status !== 'paid' && invoice.status !== 'cancelled' ? `
                                            <button onclick="TimeModule.recordPayment('${invoice.id}')" class="flex-1 px-3 py-2 text-sm bg-secondary hover:bg-green-600 text-white rounded-lg">
                                                收款
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        `;
    },

    openAddEntryModal() {
        const projects = Storage.get(Storage.KEYS.PROJECTS);
        const formHtml = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">选择项目 *</label>
                    <select name="projectId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                        <option value="">请选择项目</option>
                        ${projects.map(p => `
                            <option value="${p.id}">${Helpers.escapeHtml(p.name)}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">开始时间 *</label>
                        <input type="datetime-local" name="startTime" 
                               value="${Helpers.formatDate(new Date(), 'YYYY-MM-DD') + 'T09:00'}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">结束时间 *</label>
                        <input type="datetime-local" name="endTime" 
                               value="${Helpers.formatDate(new Date(), 'YYYY-MM-DD') + 'T12:00'}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">工作描述</label>
                    <input type="text" name="description" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="billable" name="billable" checked class="w-4 h-4 text-primary rounded focus:ring-primary">
                    <label for="billable" class="text-sm text-gray-700">可计费</label>
                </div>
            </div>
        `;
        Helpers.showFormModal('添加工时记录', formHtml, 'TimeModule.saveEntry()');
    },

    editEntry(entryId) {
        const entry = Storage.find(Storage.KEYS.TIME_ENTRIES, entryId);
        const projects = Storage.get(Storage.KEYS.PROJECTS);
        const formHtml = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">选择项目 *</label>
                    <select name="projectId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                        <option value="">请选择项目</option>
                        ${projects.map(p => `
                            <option value="${p.id}" ${entry.projectId === p.id ? 'selected' : ''}>${Helpers.escapeHtml(p.name)}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">开始时间 *</label>
                        <input type="datetime-local" name="startTime" 
                               value="${Helpers.formatDate(entry.startTime, 'YYYY-MM-DD') + 'T' + Helpers.formatDate(entry.startTime, 'HH:mm')}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">结束时间 *</label>
                        <input type="datetime-local" name="endTime" 
                               value="${entry.endTime ? Helpers.formatDate(entry.endTime, 'YYYY-MM-DD') + 'T' + Helpers.formatDate(entry.endTime, 'HH:mm') : ''}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">工作描述</label>
                    <input type="text" name="description" value="${Helpers.escapeHtml(entry.description || '')}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="billable" name="billable" ${entry.billable ? 'checked' : ''} class="w-4 h-4 text-primary rounded focus:ring-primary">
                    <label for="billable" class="text-sm text-gray-700">可计费</label>
                </div>
            </div>
        `;
        Helpers.showFormModal('编辑工时记录', formHtml, `TimeModule.saveEntry('${entryId}')`);
    },

    saveEntry(entryId = null) {
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        data.billable = data.billable === 'on';

        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const duration = Math.round((endTime - startTime) / 1000 / 60);

        if (duration <= 0) {
            Helpers.toast('结束时间必须晚于开始时间', 'error');
            return;
        }

        data.duration = duration;
        data.endTime = data.endTime ? new Date(data.endTime).toISOString() : null;
        data.startTime = new Date(data.startTime).toISOString();

        if (entryId) {
            Storage.update(Storage.KEYS.TIME_ENTRIES, entryId, data);
            Helpers.toast('工时记录已更新');
        } else {
            Storage.add(Storage.KEYS.TIME_ENTRIES, data);
            Helpers.toast('工时记录已添加');
        }

        Helpers.closeModal();
        App.refresh();
    },

    deleteEntry(entryId) {
        Helpers.confirm('确定要删除此时长记录吗？', () => {
            Storage.delete(Storage.KEYS.TIME_ENTRIES, entryId);
            Helpers.closeModal();
            Helpers.toast('工时记录已删除');
            App.refresh();
        });
    },

    openCreateInvoiceModal() {
        const clients = Storage.get(Storage.KEYS.CLIENTS);
        const projects = Storage.get(Storage.KEYS.PROJECTS);
        const settings = Storage.getSettings();
        const lastInvoice = Storage.get(Storage.KEYS.INVOICES).sort((a, b) => b.invoiceNumber - a.invoiceNumber)[0];
        const nextInvoiceNumber = lastInvoice ? (parseInt(lastInvoice.invoiceNumber) + 1).toString().padStart(4, '0') : '0001';

        const today = new Date();
        const dueDate = new Date(today.setDate(today.getDate() + 30));

        const formHtml = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">发票编号</label>
                        <input type="text" name="invoiceNumber" value="${nextInvoiceNumber}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">客户 *</label>
                        <select name="clientId" id="invoice-client" onchange="TimeModule.updateInvoiceProjects()" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                            <option value="">请选择客户</option>
                            ${clients.map(c => `
                                <option value="${c.id}">${Helpers.escapeHtml(c.name)}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">开票日期</label>
                        <input type="date" name="invoiceDate" value="${Helpers.formatDate(new Date())}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">到期日期</label>
                        <input type="date" name="dueDate" value="${Helpers.formatDate(dueDate)}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">项目</label>
                    <select name="projectId" id="invoice-project" onchange="TimeModule.updateInvoiceItems()"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">请先选择客户</option>
                    </select>
                </div>
                <div id="invoice-items-container">
                    <label class="block text-sm font-medium text-gray-700 mb-1">发票项目</label>
                    <p class="text-gray-500 text-sm">选择项目后可导入未开票的工时记录</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                    <textarea name="notes" rows="2" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                </div>
            </div>
        `;

        Helpers.showFormModal('创建发票', formHtml, 'TimeModule.saveInvoice()');
    },

    updateInvoiceProjects() {
        const clientId = document.getElementById('invoice-client').value;
        const projectSelect = document.getElementById('invoice-project');
        const projects = Storage.filter(Storage.KEYS.PROJECTS, p => p.clientId === clientId);

        projectSelect.innerHTML = `
            <option value="">选择项目（可选）</option>
            ${projects.map(p => `
                <option value="${p.id}">${Helpers.escapeHtml(p.name)}</option>
            `).join('')}
        `;
    },

    updateInvoiceItems() {
        const projectId = document.getElementById('invoice-project').value;
        const container = document.getElementById('invoice-items-container');
        const settings = Storage.getSettings();

        if (!projectId) {
            container.innerHTML = `
                <div id="manual-items">
                    <div class="flex gap-2 mb-2">
                        <input type="text" name="itemDescription[]" placeholder="项目描述" 
                               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg">
                        <input type="number" name="itemQuantity[]" placeholder="数量" value="1" min="0.5" step="0.5"
                               class="w-24 px-3 py-2 border border-gray-300 rounded-lg">
                        <input type="number" name="itemPrice[]" placeholder="单价" step="0.01"
                               class="w-32 px-3 py-2 border border-gray-300 rounded-lg">
                        <button type="button" onclick="TimeModule.addInvoiceItem()" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        const project = Storage.find(Storage.KEYS.PROJECTS, projectId);
        const timeEntries = Storage.filter(Storage.KEYS.TIME_ENTRIES, t => 
            t.projectId === projectId && !t.invoiced && t.billable
        );

        let itemsHtml = '';
        if (timeEntries.length > 0) {
            itemsHtml += `
                <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p class="text-sm text-blue-700 mb-2">发现 ${timeEntries.length} 条未开票工时记录</p>
                    <button type="button" onclick="TimeModule.importTimeEntries('${projectId}')" 
                            class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded">
                        导入工时
                    </button>
                </div>
            `;
        }

        itemsHtml += `
            <div id="manual-items">
                <div class="flex gap-2 mb-2">
                    <input type="text" name="itemDescription[]" placeholder="项目描述" 
                           class="flex-1 px-3 py-2 border border-gray-300 rounded-lg">
                    <input type="number" name="itemQuantity[]" placeholder="数量" value="1" min="0.5" step="0.5"
                           class="w-24 px-3 py-2 border border-gray-300 rounded-lg">
                    <input type="number" name="itemPrice[]" placeholder="单价" step="0.01"
                           class="w-32 px-3 py-2 border border-gray-300 rounded-lg">
                    <button type="button" onclick="TimeModule.addInvoiceItem()" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = itemsHtml;
    },

    addInvoiceItem() {
        const container = document.getElementById('manual-items');
        const itemHtml = `
            <div class="flex gap-2 mb-2">
                <input type="text" name="itemDescription[]" placeholder="项目描述" 
                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg">
                <input type="number" name="itemQuantity[]" placeholder="数量" value="1" min="0.5" step="0.5"
                       class="w-24 px-3 py-2 border border-gray-300 rounded-lg">
                <input type="number" name="itemPrice[]" placeholder="单价" step="0.01"
                       class="w-32 px-3 py-2 border border-gray-300 rounded-lg">
                <button type="button" onclick="this.parentElement.remove()" class="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg">
                    <i class="fas fa-minus"></i>
                </button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHtml);
    },

    importTimeEntries(projectId) {
        const project = Storage.find(Storage.KEYS.PROJECTS, projectId);
        const timeEntries = Storage.filter(Storage.KEYS.TIME_ENTRIES, t => 
            t.projectId === projectId && !t.invoiced && t.billable
        );
        const settings = Storage.getSettings();
        const rate = Number(project.hourlyRate || settings.hourlyRate);

        const container = document.getElementById('manual-items');
        container.innerHTML = '';

        timeEntries.forEach(entry => {
            const hours = (entry.duration / 60).toFixed(2);
            const itemHtml = `
                <div class="flex gap-2 mb-2">
                    <input type="text" name="itemDescription[]" value="${Helpers.escapeHtml(entry.description || '咨询服务')}" 
                           class="flex-1 px-3 py-2 border border-gray-300 rounded-lg">
                    <input type="number" name="itemQuantity[]" value="${hours}" min="0.5" step="0.5"
                           class="w-24 px-3 py-2 border border-gray-300 rounded-lg">
                    <input type="number" name="itemPrice[]" value="${rate}" step="0.01"
                           class="w-32 px-3 py-2 border border-gray-300 rounded-lg">
                    <button type="button" onclick="this.parentElement.remove()" class="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', itemHtml);
        });

        Helpers.toast(`已导入 ${timeEntries.length} 条工时记录`);
    },

    saveInvoice() {
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        
        const descriptions = formData.getAll('itemDescription[]');
        const quantities = formData.getAll('itemQuantity[]');
        const prices = formData.getAll('itemPrice[]');

        const items = [];
        let subtotal = 0;

        descriptions.forEach((desc, i) => {
            if (desc.trim() && quantities[i] && prices[i]) {
                const qty = parseFloat(quantities[i]);
                const price = parseFloat(prices[i]);
                const amount = qty * price;
                items.push({
                    description: desc,
                    quantity: qty,
                    price: price,
                    amount: amount
                });
                subtotal += amount;
            }
        });

        if (items.length === 0) {
            Helpers.toast('请至少添加一个发票项目', 'error');
            return;
        }

        const settings = Storage.getSettings();
        const invoiceData = {
            invoiceNumber: formData.get('invoiceNumber'),
            clientId: formData.get('clientId'),
            projectId: formData.get('projectId'),
            invoiceDate: formData.get('invoiceDate') || new Date().toISOString(),
            dueDate: formData.get('dueDate'),
            items: items,
            subtotal: subtotal,
            taxRate: settings.taxRate,
            taxAmount: subtotal * settings.taxRate,
            totalAmount: subtotal * (1 + settings.taxRate),
            notes: formData.get('notes'),
            status: 'draft',
            currency: settings.currency
        };

        const invoice = Storage.add(Storage.KEYS.INVOICES, invoiceData);

        const projectId = formData.get('projectId');
        if (projectId) {
            const timeEntries = Storage.filter(Storage.KEYS.TIME_ENTRIES, t => 
                t.projectId === projectId && !t.invoiced && t.billable
            );
            timeEntries.forEach(entry => {
                Storage.update(Storage.KEYS.TIME_ENTRIES, entry.id, { invoiced: true, invoiceId: invoice.id });
            });
        }

        Helpers.closeModal();
        Helpers.toast('发票创建成功');
        App.refresh();
    },

    viewInvoice(invoiceId) {
        const invoice = Storage.find(Storage.KEYS.INVOICES, invoiceId);
        const client = Storage.find(Storage.KEYS.CLIENTS, invoice.clientId);
        const project = invoice.projectId ? Storage.find(Storage.KEYS.PROJECTS, invoice.projectId) : null;
        const settings = Storage.getSettings();
        const payments = Storage.filter(Storage.KEYS.PAYMENTS, p => p.invoiceId === invoiceId);
        const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        const status = Helpers.getInvoiceStatus(invoice.status);

        const content = `
            <div id="invoice-preview" class="invoice-preview max-w-3xl mx-auto">
                <div class="invoice-header flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">${settings.businessName}</h2>
                        <p class="text-gray-600">${settings.businessAddress}</p>
                        <p class="text-gray-600">${settings.businessEmail}</p>
                        <p class="text-gray-600">${settings.businessPhone}</p>
                    </div>
                    <div class="text-right">
                        <h3 class="text-3xl font-bold text-primary">发票</h3>
                        <p class="text-xl font-bold text-gray-800">#${invoice.invoiceNumber}</p>
                        <p class="text-gray-600">状态: <span class="status-badge ${status.class}">${status.label}</span></p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-8 my-8">
                    <div>
                        <h4 class="font-bold text-gray-800 mb-2">账单收件人</h4>
                        <p class="font-medium text-gray-800">${client ? Helpers.escapeHtml(client.name) : '未关联客户'}</p>
                        ${client ? `
                            <p class="text-gray-600">${Helpers.escapeHtml(client.contactPerson || '')}</p>
                            <p class="text-gray-600">${Helpers.escapeHtml(client.email || '')}</p>
                            <p class="text-gray-600">${Helpers.escapeHtml(client.phone || '')}</p>
                            <p class="text-gray-600">${Helpers.escapeHtml(client.address || '')}</p>
                        ` : ''}
                    </div>
                    <div class="text-right">
                        <p class="text-gray-600"><span class="font-medium">开票日期:</span> ${Helpers.formatDate(invoice.invoiceDate)}</p>
                        <p class="text-gray-600"><span class="font-medium">到期日期:</span> ${Helpers.formatDate(invoice.dueDate)}</p>
                        ${project ? `<p class="text-gray-600"><span class="font-medium">项目:</span> ${Helpers.escapeHtml(project.name)}</p>` : ''}
                    </div>
                </div>

                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>描述</th>
                            <th class="text-right">数量</th>
                            <th class="text-right">单价</th>
                            <th class="text-right">金额</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => `
                            <tr>
                                <td>${Helpers.escapeHtml(item.description)}</td>
                                <td class="text-right">${item.quantity}</td>
                                <td class="text-right">${Helpers.formatCurrency(item.price, invoice.currency)}</td>
                                <td class="text-right">${Helpers.formatCurrency(item.amount, invoice.currency)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="flex justify-end">
                    <div class="w-64 space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-600">小计</span>
                            <span>${Helpers.formatCurrency(invoice.subtotal, invoice.currency)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">税额 (${(invoice.taxRate * 100).toFixed(0)}%)</span>
                            <span>${Helpers.formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                        </div>
                        <div class="invoice-total">
                            总计: ${Helpers.formatCurrency(invoice.totalAmount, invoice.currency)}
                        </div>
                    </div>
                </div>

                ${paidAmount > 0 ? `
                    <div class="mt-6 p-4 bg-green-50 rounded-lg">
                        <p class="text-green-800 font-medium">已收款: ${Helpers.formatCurrency(paidAmount, invoice.currency)}</p>
                        ${paidAmount < invoice.totalAmount ? `
                            <p class="text-green-700">待收款: ${Helpers.formatCurrency(invoice.totalAmount - paidAmount, invoice.currency)}</p>
                        ` : '<p class="text-green-700">发票已全额支付</p>'}
                    </div>
                ` : ''}

                ${invoice.notes ? `
                    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 class="font-medium text-gray-800 mb-2">备注</h4>
                        <p class="text-gray-600">${Helpers.escapeHtml(invoice.notes)}</p>
                    </div>
                ` : ''}

                <div class="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
                    <p>感谢您的合作！</p>
                </div>
            </div>

            <div class="flex justify-center gap-4 mt-6">
                <button onclick="TimeModule.updateInvoiceStatus('${invoiceId}', 'sent')" 
                        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                    <i class="fas fa-paper-plane mr-2"></i>标记为已发送
                </button>
                <button onclick="TimeModule.downloadInvoicePDF('${invoiceId}')" 
                        class="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg">
                    <i class="fas fa-download mr-2"></i>下载PDF
                </button>
                ${invoice.status !== 'paid' ? `
                    <button onclick="TimeModule.recordPayment('${invoiceId}')" 
                            class="px-4 py-2 bg-secondary hover:bg-green-600 text-white rounded-lg">
                        <i class="fas fa-money-bill mr-2"></i>记录收款
                    </button>
                ` : ''}
                ${invoice.status !== 'cancelled' ? `
                    <button onclick="TimeModule.updateInvoiceStatus('${invoiceId}', 'cancelled')" 
                            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">
                        <i class="fas fa-times mr-2"></i>取消
                    </button>
                ` : ''}
            </div>
        `;

        Helpers.showModal('发票详情', content, []);
    },

    updateInvoiceStatus(invoiceId, status) {
        Storage.update(Storage.KEYS.INVOICES, invoiceId, { status });
        Helpers.closeModal();
        Helpers.toast('发票状态已更新');
        App.refresh();
    },

    recordPayment(invoiceId) {
        const invoice = Storage.find(Storage.KEYS.INVOICES, invoiceId);
        const payments = Storage.filter(Storage.KEYS.PAYMENTS, p => p.invoiceId === invoiceId);
        const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const remaining = Number(invoice.totalAmount) - paidAmount;

        const formHtml = `
            <div class="space-y-4">
                <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-gray-600">发票总金额: <span class="font-bold">${Helpers.formatCurrency(invoice.totalAmount, invoice.currency)}</span></p>
                    <p class="text-gray-600">已收款: <span class="font-bold text-green-600">${Helpers.formatCurrency(paidAmount, invoice.currency)}</span></p>
                    <p class="text-gray-600">待收款: <span class="font-bold text-red-500">${Helpers.formatCurrency(remaining, invoice.currency)}</span></p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">收款金额 *</label>
                    <input type="number" name="amount" step="0.01" value="${remaining}" max="${remaining}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">收款日期</label>
                    <input type="date" name="date" value="${Helpers.formatDate(new Date())}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">收款方式</label>
                    <select name="method" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="bank_transfer">银行转账</option>
                        <option value="alipay">支付宝</option>
                        <option value="wechat">微信</option>
                        <option value="cash">现金</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                    <input type="text" name="notes" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
            </div>
        `;

        Helpers.showFormModal('记录收款', formHtml, `TimeModule.savePayment('${invoiceId}')`);
    },

    savePayment(invoiceId) {
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.amount || parseFloat(data.amount) <= 0) {
            Helpers.toast('请输入有效的收款金额', 'error');
            return;
        }

        data.invoiceId = invoiceId;
        data.amount = parseFloat(data.amount);
        data.date = data.date ? new Date(data.date).toISOString() : new Date().toISOString();

        Storage.add(Storage.KEYS.PAYMENTS, data);

        const invoice = Storage.find(Storage.KEYS.INVOICES, invoiceId);
        const payments = Storage.filter(Storage.KEYS.PAYMENTS, p => p.invoiceId === invoiceId);
        const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        if (paidAmount >= invoice.totalAmount) {
            Storage.update(Storage.KEYS.INVOICES, invoiceId, { status: 'paid' });
        }

        Helpers.closeModal();
        Helpers.toast('收款已记录');
        App.refresh();
    },

    async downloadInvoicePDF(invoiceId) {
        const invoice = Storage.find(Storage.KEYS.INVOICES, invoiceId);
        const client = Storage.find(Storage.KEYS.CLIENTS, invoice.clientId);
        const project = invoice.projectId ? Storage.find(Storage.KEYS.PROJECTS, invoice.projectId) : null;
        const settings = Storage.getSettings();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(settings.businessName, 20, 25);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(settings.businessAddress, 20, 35);
        doc.text(settings.businessEmail, 20, 42);
        doc.text(settings.businessPhone, 20, 49);

        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text('INVOICE', 170, 30, { align: 'right' });
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`#${invoice.invoiceNumber}`, 170, 40, { align: 'right' });

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`开票日期: ${Helpers.formatDate(invoice.invoiceDate)}`, 170, 50, { align: 'right' });
        doc.text(`到期日期: ${Helpers.formatDate(invoice.dueDate)}`, 170, 57, { align: 'right' });

        doc.setLineWidth(0.5);
        doc.line(20, 65, 190, 65);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('账单收件人:', 20, 78);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(client ? client.name : '未关联客户', 20, 86);
        if (client) {
            if (client.contactPerson) doc.text(client.contactPerson, 20, 93);
            if (client.email) doc.text(client.email, 20, 100);
            if (client.phone) doc.text(client.phone, 20, 107);
        }

        if (project) {
            doc.text(`项目: ${project.name}`, 120, 78);
        }

        doc.setLineWidth(0.3);
        doc.rect(20, 120, 170, 10);
        doc.setFont('helvetica', 'bold');
        doc.text('描述', 25, 127);
        doc.text('数量', 100, 127);
        doc.text('单价', 130, 127);
        doc.text('金额', 165, 127);

        let yPos = 140;
        doc.setFont('helvetica', 'normal');
        invoice.items.forEach(item => {
            doc.text(item.description.substring(0, 40), 25, yPos);
            doc.text(String(item.quantity), 100, yPos);
            doc.text(Helpers.formatCurrency(item.price, invoice.currency), 130, yPos);
            doc.text(Helpers.formatCurrency(item.amount, invoice.currency), 165, yPos);
            yPos += 10;
        });

        const tableEnd = yPos;
        doc.line(20, tableEnd, 190, tableEnd);

        yPos += 15;
        doc.setFontSize(11);
        doc.text(`小计:`, 140, yPos);
        doc.text(Helpers.formatCurrency(invoice.subtotal, invoice.currency), 170, yPos, { align: 'right' });
        
        yPos += 8;
        doc.text(`税额 (${(invoice.taxRate * 100).toFixed(0)}%):`, 140, yPos);
        doc.text(Helpers.formatCurrency(invoice.taxAmount, invoice.currency), 170, yPos, { align: 'right' });

        yPos += 10;
        doc.setLineWidth(0.5);
        doc.line(140, yPos - 5, 190, yPos - 5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`总计:`, 140, yPos + 3);
        doc.setTextColor(59, 130, 246);
        doc.text(Helpers.formatCurrency(invoice.totalAmount, invoice.currency), 170, yPos + 3, { align: 'right' });

        if (invoice.notes) {
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('备注:', 20, yPos + 20);
            doc.text(invoice.notes.substring(0, 80), 20, yPos + 28);
        }

        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text('感谢您的合作！', 105, 270, { align: 'center' });

        doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
        Helpers.toast('PDF已下载');
    }
};
