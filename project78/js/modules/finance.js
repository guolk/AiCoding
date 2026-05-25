const FinanceModule = {
    activeTab: 'overview',
    selectedYear: new Date().getFullYear(),
    selectedQuarter: Helpers.getQuarter().quarter,

    render() {
        const settings = Storage.getSettings();
        const invoices = Storage.get(Storage.KEYS.INVOICES);
        const payments = Storage.get(Storage.KEYS.PAYMENTS);
        const expenses = Storage.get(Storage.KEYS.EXPENSES);

        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const netIncome = totalRevenue - totalExpenses;

        const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
        const totalReceivable = pendingInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0) - 
                                payments.filter(p => pendingInvoices.some(i => i.id === p.invoiceId))
                                    .reduce((sum, p) => sum + Number(p.amount), 0);

        const overdueInvoices = invoices.filter(i => {
            if (i.status === 'paid' || i.status === 'cancelled') return false;
            return new Date(i.dueDate) < new Date();
        });
        const totalOverdue = overdueInvoices.reduce((sum, i) => {
            const paid = payments.filter(p => p.invoiceId === i.id).reduce((s, p) => s + Number(p.amount), 0);
            return sum + (Number(i.totalAmount) - paid);
        }, 0);

        const quarterData = this.getQuarterFinancialData(this.selectedYear, this.selectedQuarter, payments, expenses);

        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-bold text-gray-800">财务追踪</h3>
                    <button onclick="FinanceModule.openSettingsModal()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-2">
                        <i class="fas fa-cog"></i>
                        财务设置
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-2">
                            <p class="text-gray-500 text-sm">总收入</p>
                            <i class="fas fa-arrow-up text-green-500"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-800">${Helpers.formatCurrency(totalRevenue, settings.currency)}</p>
                        <p class="text-sm text-gray-500 mt-2">${payments.length} 笔收款记录</p>
                    </div>

                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-2">
                            <p class="text-gray-500 text-sm">总支出</p>
                            <i class="fas fa-arrow-down text-red-500"></i>
                        </div>
                        <p class="text-3xl font-bold text-red-500">${Helpers.formatCurrency(totalExpenses, settings.currency)}</p>
                        <p class="text-sm text-gray-500 mt-2">${expenses.length} 笔支出记录</p>
                    </div>

                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-2">
                            <p class="text-gray-500 text-sm">净收入</p>
                            <i class="fas fa-balance-scale text-blue-500"></i>
                        </div>
                        <p class="text-3xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-500'}">${Helpers.formatCurrency(netIncome, settings.currency)}</p>
                        <p class="text-sm text-gray-500 mt-2">利润率: ${totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0}%</p>
                    </div>

                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-2">
                            <p class="text-gray-500 text-sm">应收账款</p>
                            <i class="fas fa-file-invoice text-yellow-500"></i>
                        </div>
                        <p class="text-3xl font-bold text-yellow-600">${Helpers.formatCurrency(totalReceivable, settings.currency)}</p>
                        <p class="text-sm ${totalOverdue > 0 ? 'text-red-500' : 'text-gray-500'} mt-2">
                            ${totalOverdue > 0 ? `逾期: ${Helpers.formatCurrency(totalOverdue, settings.currency)}` : '暂无逾期'}
                        </p>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm">
                    <div class="border-b px-6 py-4">
                        <div class="flex gap-4">
                            <button onclick="FinanceModule.setTab('overview')" 
                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all ${this.activeTab === 'overview' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}">
                                财务概览
                            </button>
                            <button onclick="FinanceModule.setTab('payments')" 
                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all ${this.activeTab === 'payments' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}">
                                收款记录
                            </button>
                            <button onclick="FinanceModule.setTab('expenses')" 
                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all ${this.activeTab === 'expenses' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}">
                                支出记录
                            </button>
                            <button onclick="FinanceModule.setTab('receivables')" 
                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all ${this.activeTab === 'receivables' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}">
                                应收账款
                            </button>
                            <button onclick="FinanceModule.setTab('tax')" 
                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all ${this.activeTab === 'tax' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}">
                                税务预估
                            </button>
                        </div>
                    </div>

                    <div class="p-6">
                        ${this.activeTab === 'overview' ? this.renderOverview(quarterData, settings) : ''}
                        ${this.activeTab === 'payments' ? this.renderPayments(payments, settings) : ''}
                        ${this.activeTab === 'expenses' ? this.renderExpenses(expenses, settings) : ''}
                        ${this.activeTab === 'receivables' ? this.renderReceivables(invoices, payments, settings) : ''}
                        ${this.activeTab === 'tax' ? this.renderTax(payments, expenses, settings) : ''}
                    </div>
                </div>
            </div>
        `;
    },

    setTab(tab) {
        this.activeTab = tab;
        App.refresh();
    },

    getQuarterFinancialData(year, quarter, payments, expenses) {
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

    renderOverview(quarterData, settings) {
        const years = [];
        const currentYear = new Date().getFullYear();
        for (let y = currentYear - 2; y <= currentYear; y++) {
            years.push(y);
        }

        return `
            <div class="space-y-6">
                <div class="flex items-center gap-4">
                    <select onchange="FinanceModule.selectedYear = parseInt(this.value); App.refresh()" 
                            class="px-3 py-2 border border-gray-300 rounded-lg">
                        ${years.map(y => `
                            <option value="${y}" ${this.selectedYear === y ? 'selected' : ''}>${y}年</option>
                        `).join('')}
                    </select>
                    <select onchange="FinanceModule.selectedQuarter = parseInt(this.value); App.refresh()" 
                            class="px-3 py-2 border border-gray-300 rounded-lg">
                        ${[1, 2, 3, 4].map(q => `
                            <option value="${q}" ${this.selectedQuarter === q ? 'selected' : ''}>Q${q}</option>
                        `).join('')}
                    </select>
                    <span class="text-gray-500">季度收支分析</span>
                </div>

                <div class="h-64 flex items-end justify-around gap-4 px-4">
                    ${quarterData.months.map((month, i) => `
                        <div class="flex-1 flex flex-col items-center">
                            <div class="w-full flex gap-1 items-end" style="height: 200px;">
                                <div class="flex-1 bg-green-400 rounded-t-lg chart-bar" 
                                     style="height: ${quarterData.maxValue > 0 ? (quarterData.monthlyRevenue[i] / quarterData.maxValue * 100) : 0}%"
                                     title="收入: ${Helpers.formatCurrency(quarterData.monthlyRevenue[i], settings.currency)}"></div>
                                <div class="flex-1 bg-red-400 rounded-t-lg chart-bar" 
                                     style="height: ${quarterData.maxValue > 0 ? (quarterData.monthlyExpenses[i] / quarterData.maxValue * 100) : 0}%"
                                     title="支出: ${Helpers.formatCurrency(quarterData.monthlyExpenses[i], settings.currency)}"></div>
                            </div>
                            <p class="text-sm text-gray-500 mt-2">${month}月</p>
                            <p class="text-xs text-green-600">${Helpers.formatCurrency(quarterData.monthlyRevenue[i], settings.currency)}</p>
                            <p class="text-xs text-red-500">-${Helpers.formatCurrency(quarterData.monthlyExpenses[i], settings.currency)}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="flex justify-center gap-6">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-green-400 rounded"></div>
                        <span class="text-sm text-gray-600">收入</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-red-400 rounded"></div>
                        <span class="text-sm text-gray-600">支出</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div class="p-4 bg-green-50 rounded-lg">
                        <p class="text-sm text-green-600">季度总收入</p>
                        <p class="text-2xl font-bold text-green-700">${Helpers.formatCurrency(quarterData.totalRevenue, settings.currency)}</p>
                    </div>
                    <div class="p-4 bg-red-50 rounded-lg">
                        <p class="text-sm text-red-600">季度总支出</p>
                        <p class="text-2xl font-bold text-red-700">${Helpers.formatCurrency(quarterData.totalExpenses, settings.currency)}</p>
                    </div>
                    <div class="p-4 bg-yellow-50 rounded-lg">
                        <p class="text-sm text-yellow-600">预估税额 (${(settings.taxRate * 100).toFixed(0)}%)</p>
                        <p class="text-2xl font-bold text-yellow-700">${Helpers.formatCurrency(quarterData.estimatedTax, settings.currency)}</p>
                    </div>
                </div>

                <div class="flex gap-4 justify-center">
                    <button onclick="FinanceModule.openAddPaymentModal()" class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2">
                        <i class="fas fa-plus"></i>
                        记录收款
                    </button>
                    <button onclick="FinanceModule.openAddExpenseModal()" class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2">
                        <i class="fas fa-plus"></i>
                        记录支出
                    </button>
                </div>
            </div>
        `;
    },

    renderPayments(payments, settings) {
        const sortedPayments = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));

        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <p class="text-gray-500">共 ${payments.length} 笔收款记录</p>
                    <button onclick="FinanceModule.openAddPaymentModal()" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm flex items-center gap-2">
                        <i class="fas fa-plus"></i>
                        记录收款
                    </button>
                </div>

                ${sortedPayments.length === 0 ? `
                    <div class="text-center py-12">
                        <i class="fas fa-money-bill-wave text-5xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">暂无收款记录</p>
                    </div>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">日期</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">发票</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">金额</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">方式</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">备注</th>
                                    <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">操作</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${sortedPayments.map(payment => {
                                    const invoice = payment.invoiceId ? Storage.find(Storage.KEYS.INVOICES, payment.invoiceId) : null;
                                    const methodLabels = {
                                        bank_transfer: '银行转账',
                                        alipay: '支付宝',
                                        wechat: '微信',
                                        cash: '现金',
                                        other: '其他'
                                    };

                                    return `
                                        <tr class="table-row">
                                            <td class="px-4 py-4 text-gray-600">${Helpers.formatDate(payment.date)}</td>
                                            <td class="px-4 py-4 text-gray-800">${invoice ? `#${invoice.invoiceNumber}` : '无关联'}</td>
                                            <td class="px-4 py-4 font-medium text-green-600">${Helpers.formatCurrency(payment.amount, settings.currency)}</td>
                                            <td class="px-4 py-4 text-gray-600">${methodLabels[payment.method] || payment.method}</td>
                                            <td class="px-4 py-4 text-gray-600">${Helpers.escapeHtml(payment.notes || '-')}</td>
                                            <td class="px-4 py-4 text-right">
                                                <button onclick="FinanceModule.editPayment('${payment.id}')" class="text-primary hover:text-blue-600 mr-3">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="FinanceModule.deletePayment('${payment.id}')" class="text-danger hover:text-red-600">
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

    renderExpenses(expenses, settings) {
        const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        const categoryLabels = {
            software: '软件订阅',
            equipment: '设备采购',
            learning: '学习培训',
            marketing: '市场营销',
            office: '办公费用',
            travel: '差旅费用',
            other: '其他'
        };

        const categoryStats = {};
        expenses.forEach(e => {
            const cat = e.category || 'other';
            categoryStats[cat] = (categoryStats[cat] || 0) + Number(e.amount);
        });

        return `
            <div class="space-y-6">
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    ${Object.entries(categoryLabels).map(([key, label]) => {
                        const amount = categoryStats[key] || 0;
                        return `
                            <div class="p-3 bg-gray-50 rounded-lg text-center">
                                <p class="text-xs text-gray-500">${label}</p>
                                <p class="font-bold text-sm text-gray-800">${Helpers.formatCurrency(amount, settings.currency)}</p>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="flex justify-between items-center">
                    <p class="text-gray-500">共 ${expenses.length} 笔支出记录</p>
                    <button onclick="FinanceModule.openAddExpenseModal()" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm flex items-center gap-2">
                        <i class="fas fa-plus"></i>
                        记录支出
                    </button>
                </div>

                ${sortedExpenses.length === 0 ? `
                    <div class="text-center py-12">
                        <i class="fas fa-receipt text-5xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">暂无支出记录</p>
                    </div>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">日期</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">类别</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">描述</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">金额</th>
                                    <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">操作</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${sortedExpenses.map(expense => `
                                    <tr class="table-row">
                                        <td class="px-4 py-4 text-gray-600">${Helpers.formatDate(expense.date)}</td>
                                        <td class="px-4 py-4">
                                            <span class="status-badge bg-purple-100 text-purple-800">${categoryLabels[expense.category] || '其他'}</span>
                                        </td>
                                        <td class="px-4 py-4 text-gray-800">${Helpers.escapeHtml(expense.description || '-')}</td>
                                        <td class="px-4 py-4 font-medium text-red-500">${Helpers.formatCurrency(expense.amount, settings.currency)}</td>
                                        <td class="px-4 py-4 text-right">
                                            <button onclick="FinanceModule.editExpense('${expense.id}')" class="text-primary hover:text-blue-600 mr-3">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="FinanceModule.deleteExpense('${expense.id}')" class="text-danger hover:text-red-600">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    },

    renderReceivables(invoices, payments, settings) {
        const receivableInvoices = invoices.filter(i => {
            if (i.status === 'paid' || i.status === 'cancelled') return false;
            const paid = payments.filter(p => p.invoiceId === i.id).reduce((s, p) => s + Number(p.amount), 0);
            return paid < Number(i.totalAmount);
        }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        return `
            <div class="space-y-4">
                <p class="text-gray-500">共 ${receivableInvoices.length} 张待收款发票</p>

                ${receivableInvoices.length === 0 ? `
                    <div class="text-center py-12">
                        <i class="fas fa-check-circle text-5xl text-green-300 mb-4"></i>
                        <p class="text-gray-500">太棒了！没有应收账款</p>
                    </div>
                ` : `
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">发票编号</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">客户</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">开票日期</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">到期日期</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">总金额</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">已收款</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">待收款</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                                    <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">操作</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${receivableInvoices.map(invoice => {
                                    const client = Storage.find(Storage.KEYS.CLIENTS, invoice.clientId);
                                    const paid = payments.filter(p => p.invoiceId === invoice.id).reduce((s, p) => s + Number(p.amount), 0);
                                    const remaining = Number(invoice.totalAmount) - paid;
                                    const isOverdue = new Date(invoice.dueDate) < new Date();
                                    const status = Helpers.getInvoiceStatus(isOverdue ? 'overdue' : invoice.status);

                                    return `
                                        <tr class="table-row ${isOverdue ? 'bg-red-50' : ''}">
                                            <td class="px-4 py-4 font-medium text-gray-800">#${invoice.invoiceNumber}</td>
                                            <td class="px-4 py-4 text-gray-600">${client ? Helpers.escapeHtml(client.name) : '未关联'}</td>
                                            <td class="px-4 py-4 text-gray-600">${Helpers.formatDate(invoice.invoiceDate)}</td>
                                            <td class="px-4 py-4 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-600'}">${Helpers.formatDate(invoice.dueDate)}</td>
                                            <td class="px-4 py-4 text-gray-800">${Helpers.formatCurrency(invoice.totalAmount, settings.currency)}</td>
                                            <td class="px-4 py-4 text-green-600">${Helpers.formatCurrency(paid, settings.currency)}</td>
                                            <td class="px-4 py-4 font-medium ${isOverdue ? 'text-red-500' : 'text-yellow-600'}">${Helpers.formatCurrency(remaining, settings.currency)}</td>
                                            <td class="px-4 py-4">
                                                <span class="status-badge ${status.class}">${status.label}</span>
                                            </td>
                                            <td class="px-4 py-4 text-right">
                                                <button onclick="TimeModule.recordPayment('${invoice.id}')" class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm">
                                                    收款
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

    renderTax(payments, expenses, settings) {
        const currentQuarter = Helpers.getQuarter();
        const quarters = [];
        for (let y = currentQuarter.year - 1; y <= currentQuarter.year; y++) {
            for (let q = 1; q <= 4; q++) {
                if (y === currentQuarter.year && q > currentQuarter.quarter) break;
                quarters.push({ year: y, quarter: q });
            }
        }

        const taxData = quarters.reverse().map(q => {
            const data = this.getQuarterFinancialData(q.year, q.quarter, payments, expenses);
            return { ...q, ...data };
        });

        return `
            <div class="space-y-6">
                <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-info-circle text-yellow-500 text-xl mt-1"></i>
                        <div>
                            <h4 class="font-medium text-yellow-800">税务预估说明</h4>
                            <p class="text-sm text-yellow-700 mt-1">
                                以下税务预估基于您设置的税率 (${(settings.taxRate * 100).toFixed(0)}%) 和实际收支数据计算。
                                实际应缴税额请以当地税务机关规定为准，建议咨询专业税务顾问。
                            </p>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    ${taxData.map(q => `
                        <div class="border rounded-lg p-4 ${q.year === currentQuarter.year && q.quarter === currentQuarter.quarter ? 'border-primary bg-blue-50' : ''}">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="font-bold text-lg text-gray-800">
                                    ${q.year}年 Q${q.quarter}
                                    ${q.year === currentQuarter.year && q.quarter === currentQuarter.quarter ? 
                                        '<span class="ml-2 text-sm font-normal text-primary">(当前季度)</span>' : ''}
                                </h4>
                            </div>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p class="text-sm text-gray-500">总收入</p>
                                    <p class="text-xl font-bold text-green-600">${Helpers.formatCurrency(q.totalRevenue, settings.currency)}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">总支出</p>
                                    <p class="text-xl font-bold text-red-500">${Helpers.formatCurrency(q.totalExpenses, settings.currency)}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">应纳税所得额</p>
                                    <p class="text-xl font-bold text-blue-600">${Helpers.formatCurrency(q.taxableIncome, settings.currency)}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">预估税额</p>
                                    <p class="text-xl font-bold text-yellow-600">${Helpers.formatCurrency(q.estimatedTax, settings.currency)}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="p-4 bg-gray-50 rounded-lg">
                    <h4 class="font-bold text-gray-800 mb-3">年度预估汇总</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${[currentQuarter.year - 1, currentQuarter.year].map(year => {
                            const yearData = taxData.filter(q => q.year === year);
                            const totalRevenue = yearData.reduce((sum, q) => sum + q.totalRevenue, 0);
                            const totalExpenses = yearData.reduce((sum, q) => sum + q.totalExpenses, 0);
                            const totalTax = yearData.reduce((sum, q) => sum + q.estimatedTax, 0);
                            const netIncome = totalRevenue - totalExpenses - totalTax;

                            return `
                                <div class="p-3 bg-white rounded-lg">
                                    <p class="text-sm font-medium text-gray-500">${year}年</p>
                                    <p class="text-sm text-green-600">收入: ${Helpers.formatCurrency(totalRevenue, settings.currency)}</p>
                                    <p class="text-sm text-red-500">支出: ${Helpers.formatCurrency(totalExpenses, settings.currency)}</p>
                                    <p class="text-sm text-yellow-600">税额: ${Helpers.formatCurrency(totalTax, settings.currency)}</p>
                                    <p class="text-sm font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-500'}">
                                        净收入: ${Helpers.formatCurrency(netIncome, settings.currency)}
                                    </p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    openAddPaymentModal() {
        const invoices = Storage.get(Storage.KEYS.INVOICES).filter(i => i.status !== 'paid' && i.status !== 'cancelled');
        const formHtml = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">关联发票</label>
                    <select name="invoiceId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">无关联（独立收款）</option>
                        ${invoices.map(i => `
                            <option value="${i.id}">#${i.invoiceNumber} - ${Helpers.formatCurrency(i.totalAmount)}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">收款金额 *</label>
                        <input type="number" name="amount" step="0.01" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">收款日期</label>
                        <input type="date" name="date" value="${Helpers.formatDate(new Date())}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
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
        Helpers.showFormModal('记录收款', formHtml, 'FinanceModule.savePayment()');
    },

    editPayment(paymentId) {
        const payment = Storage.find(Storage.KEYS.PAYMENTS, paymentId);
        const invoices = Storage.get(Storage.KEYS.INVOICES);
        const formHtml = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">关联发票</label>
                    <select name="invoiceId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">无关联（独立收款）</option>
                        ${invoices.map(i => `
                            <option value="${i.id}" ${payment.invoiceId === i.id ? 'selected' : ''}>#${i.invoiceNumber} - ${Helpers.formatCurrency(i.totalAmount)}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">收款金额 *</label>
                        <input type="number" name="amount" step="0.01" value="${payment.amount}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">收款日期</label>
                        <input type="date" name="date" value="${Helpers.formatDate(payment.date)}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">收款方式</label>
                    <select name="method" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="bank_transfer" ${payment.method === 'bank_transfer' ? 'selected' : ''}>银行转账</option>
                        <option value="alipay" ${payment.method === 'alipay' ? 'selected' : ''}>支付宝</option>
                        <option value="wechat" ${payment.method === 'wechat' ? 'selected' : ''}>微信</option>
                        <option value="cash" ${payment.method === 'cash' ? 'selected' : ''}>现金</option>
                        <option value="other" ${payment.method === 'other' ? 'selected' : ''}>其他</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                    <input type="text" name="notes" value="${Helpers.escapeHtml(payment.notes || '')}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
            </div>
        `;
        Helpers.showFormModal('编辑收款', formHtml, `FinanceModule.savePayment('${paymentId}')`);
    },

    savePayment(paymentId = null) {
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.amount || parseFloat(data.amount) <= 0) {
            Helpers.toast('请输入有效的收款金额', 'error');
            return;
        }

        data.amount = parseFloat(data.amount);
        data.date = data.date ? new Date(data.date).toISOString() : new Date().toISOString();

        if (paymentId) {
            Storage.update(Storage.KEYS.PAYMENTS, paymentId, data);
            Helpers.toast('收款记录已更新');
        } else {
            Storage.add(Storage.KEYS.PAYMENTS, data);
            Helpers.toast('收款已记录');
        }

        if (data.invoiceId) {
            const invoice = Storage.find(Storage.KEYS.INVOICES, data.invoiceId);
            const payments = Storage.filter(Storage.KEYS.PAYMENTS, p => p.invoiceId === data.invoiceId);
            const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
            if (paidAmount >= invoice.totalAmount) {
                Storage.update(Storage.KEYS.INVOICES, data.invoiceId, { status: 'paid' });
            }
        }

        Helpers.closeModal();
        App.refresh();
    },

    deletePayment(paymentId) {
        Helpers.confirm('确定要删除此收款记录吗？', () => {
            const payment = Storage.find(Storage.KEYS.PAYMENTS, paymentId);
            Storage.delete(Storage.KEYS.PAYMENTS, paymentId);
            
            if (payment.invoiceId) {
                const invoice = Storage.find(Storage.KEYS.INVOICES, payment.invoiceId);
                if (invoice && invoice.status === 'paid') {
                    const remainingPayments = Storage.filter(Storage.KEYS.PAYMENTS, p => p.invoiceId === payment.invoiceId);
                    const paidAmount = remainingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
                    if (paidAmount < invoice.totalAmount) {
                        Storage.update(Storage.KEYS.INVOICES, payment.invoiceId, { status: 'sent' });
                    }
                }
            }

            Helpers.closeModal();
            Helpers.toast('收款记录已删除');
            App.refresh();
        });
    },

    openAddExpenseModal() {
        const formHtml = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">支出类别 *</label>
                        <select name="category" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                            <option value="software">软件订阅</option>
                            <option value="equipment">设备采购</option>
                            <option value="learning">学习培训</option>
                            <option value="marketing">市场营销</option>
                            <option value="office">办公费用</option>
                            <option value="travel">差旅费用</option>
                            <option value="other">其他</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">金额 *</label>
                        <input type="number" name="amount" step="0.01" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">支出日期</label>
                    <input type="date" name="date" value="${Helpers.formatDate(new Date())}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <input type="text" name="description" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                    <textarea name="notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                </div>
            </div>
        `;
        Helpers.showFormModal('记录支出', formHtml, 'FinanceModule.saveExpense()');
    },

    editExpense(expenseId) {
        const expense = Storage.find(Storage.KEYS.EXPENSES, expenseId);
        const formHtml = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">支出类别 *</label>
                        <select name="category" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                            <option value="software" ${expense.category === 'software' ? 'selected' : ''}>软件订阅</option>
                            <option value="equipment" ${expense.category === 'equipment' ? 'selected' : ''}>设备采购</option>
                            <option value="learning" ${expense.category === 'learning' ? 'selected' : ''}>学习培训</option>
                            <option value="marketing" ${expense.category === 'marketing' ? 'selected' : ''}>市场营销</option>
                            <option value="office" ${expense.category === 'office' ? 'selected' : ''}>办公费用</option>
                            <option value="travel" ${expense.category === 'travel' ? 'selected' : ''}>差旅费用</option>
                            <option value="other" ${expense.category === 'other' ? 'selected' : ''}>其他</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">金额 *</label>
                        <input type="number" name="amount" step="0.01" value="${expense.amount}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" required>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">支出日期</label>
                    <input type="date" name="date" value="${Helpers.formatDate(expense.date)}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <input type="text" name="description" value="${Helpers.escapeHtml(expense.description || '')}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                    <textarea name="notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">${Helpers.escapeHtml(expense.notes || '')}</textarea>
                </div>
            </div>
        `;
        Helpers.showFormModal('编辑支出', formHtml, `FinanceModule.saveExpense('${expenseId}')`);
    },

    saveExpense(expenseId = null) {
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.amount || parseFloat(data.amount) <= 0) {
            Helpers.toast('请输入有效的支出金额', 'error');
            return;
        }

        data.amount = parseFloat(data.amount);
        data.date = data.date ? new Date(data.date).toISOString() : new Date().toISOString();

        if (expenseId) {
            Storage.update(Storage.KEYS.EXPENSES, expenseId, data);
            Helpers.toast('支出记录已更新');
        } else {
            Storage.add(Storage.KEYS.EXPENSES, data);
            Helpers.toast('支出已记录');
        }

        Helpers.closeModal();
        App.refresh();
    },

    deleteExpense(expenseId) {
        Helpers.confirm('确定要删除此支出记录吗？', () => {
            Storage.delete(Storage.KEYS.EXPENSES, expenseId);
            Helpers.closeModal();
            Helpers.toast('支出记录已删除');
            App.refresh();
        });
    },

    openSettingsModal() {
        const settings = Storage.getSettings();
        const formHtml = `
            <div class="space-y-4">
                <h4 class="font-bold text-gray-800">业务信息</h4>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">工作室/公司名称</label>
                        <input type="text" name="businessName" value="${Helpers.escapeHtml(settings.businessName || '')}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">联系邮箱</label>
                        <input type="email" name="businessEmail" value="${Helpers.escapeHtml(settings.businessEmail || '')}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                        <input type="text" name="businessPhone" value="${Helpers.escapeHtml(settings.businessPhone || '')}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">地址</label>
                        <input type="text" name="businessAddress" value="${Helpers.escapeHtml(settings.businessAddress || '')}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                </div>

                <h4 class="font-bold text-gray-800 pt-4 border-t">财务设置</h4>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">默认小时费率</label>
                        <input type="number" name="hourlyRate" step="0.01" value="${settings.hourlyRate || 150}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">预估税率 (%)</label>
                        <input type="number" name="taxRate" step="0.01" value="${(settings.taxRate || 0.25) * 100}" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">货币</label>
                    <select name="currency" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="CNY" ${settings.currency === 'CNY' ? 'selected' : ''}>人民币 (CNY ¥)</option>
                        <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>美元 (USD $)</option>
                        <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>欧元 (EUR €)</option>
                    </select>
                </div>
            </div>
        `;
        Helpers.showFormModal('财务设置', formHtml, 'FinanceModule.saveSettings()');
    },

    saveSettings() {
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        data.hourlyRate = parseFloat(data.hourlyRate) || 150;
        data.taxRate = (parseFloat(data.taxRate) || 25) / 100;

        Storage.updateSettings(data);
        Helpers.closeModal();
        Helpers.toast('设置已保存');
        App.refresh();
    }
};
