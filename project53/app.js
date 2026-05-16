class FamilyFinance {
    constructor() {
        this.data = {
            transactions: [],
            accounts: [],
            budgets: [],
            savingsGoals: [],
            categories: {
                income: ['工资', '奖金', '投资收益', '兼职', '礼金', '其他收入'],
                expense: ['餐饮', '交通', '购物', '娱乐', '教育', '医疗', '住房', '通讯', '服饰', '美容', '运动', '育儿', '养老', '其他支出']
            }
        };
        this.currentTransactionType = 'expense';
        this.charts = {};
        this.init();
    }

    init() {
        this.loadData();
        this.initDatePickers();
        this.renderCategories();
        this.renderAccounts();
        this.updateDashboard();
        this.bindEvents();
        
        if (this.data.accounts.length === 0) {
            this.addDefaultAccounts();
        }
    }

    loadData() {
        const saved = localStorage.getItem('familyFinanceData');
        if (saved) {
            try {
                this.data = { ...this.data, ...JSON.parse(saved) };
            } catch (e) {
                console.error('加载数据失败', e);
            }
        }
    }

    saveData() {
        localStorage.setItem('familyFinanceData', JSON.stringify(this.data));
    }

    addDefaultAccounts() {
        const defaultAccounts = [
            { id: Date.now() + 1, name: '现金', type: 'cash', balance: 0 },
            { id: Date.now() + 2, name: '工资卡', type: 'debit', balance: 0 },
            { id: Date.now() + 3, name: '信用卡', type: 'credit', balance: 0 },
            { id: Date.now() + 4, name: '投资账户', type: 'investment', balance: 0 }
        ];
        this.data.accounts = defaultAccounts;
        this.saveData();
        this.renderAccounts();
    }

    initDatePickers() {
        const today = new Date();
        document.getElementById('transaction-date').value = today.toISOString().split('T')[0];
        document.getElementById('budget-month-input').value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        
        const monthSelectors = ['dashboard-month', 'budget-month'];
        monthSelectors.forEach(id => {
            const select = document.getElementById(id);
            for (let i = 0; i < 12; i++) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const option = document.createElement('option');
                option.value = value;
                option.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月`;
                select.appendChild(option);
            }
        });
    }

    renderCategories() {
        const categorySelect = document.getElementById('transaction-category');
        const budgetCategorySelect = document.getElementById('budget-category');
        const filterCategorySelect = document.getElementById('filter-category');
        
        this.updateCategorySelect(categorySelect);
        this.updateCategorySelect(budgetCategorySelect, 'expense');
        
        filterCategorySelect.innerHTML = '<option value="all">全部分类</option>';
        this.data.categories.expense.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filterCategorySelect.appendChild(option);
        });
    }

    updateCategorySelect(select, type = null) {
        const t = type || this.currentTransactionType;
        select.innerHTML = '';
        this.data.categories[t].forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
    }

    renderAccounts() {
        const accountsList = document.getElementById('accounts-list');
        const accountSelect = document.getElementById('transaction-account');
        const filterAccountSelect = document.getElementById('filter-account');
        const manageList = document.getElementById('accounts-manage-list');

        const accountIcons = {
            cash: '💵',
            debit: '💳',
            credit: '💳',
            investment: '📈'
        };

        accountsList.innerHTML = this.data.accounts.map(acc => `
            <div class="account-item">
                <div class="account-info">
                    <div class="account-icon ${acc.type}">${accountIcons[acc.type]}</div>
                    <div>
                        <div class="account-name">${acc.name}</div>
                        <div class="account-type">${this.getAccountTypeName(acc.type)}</div>
                    </div>
                </div>
                <div class="account-balance">¥${acc.balance.toFixed(2)}</div>
            </div>
        `).join('');

        accountSelect.innerHTML = '';
        filterAccountSelect.innerHTML = '<option value="all">全部账户</option>';
        this.data.accounts.forEach(acc => {
            const option = document.createElement('option');
            option.value = acc.id;
            option.textContent = acc.name;
            accountSelect.appendChild(option);
            
            const filterOption = option.cloneNode(true);
            filterAccountSelect.appendChild(filterOption);
        });

        manageList.innerHTML = this.data.accounts.map(acc => `
            <div class="account-manage-item">
                <div class="account-info">
                    <div class="account-icon ${acc.type}">${accountIcons[acc.type]}</div>
                    <div>
                        <div class="account-name">${acc.name}</div>
                        <div class="account-type">¥${acc.balance.toFixed(2)}</div>
                    </div>
                </div>
                <button class="action-btn delete" onclick="app.deleteAccount(${acc.id})">删除</button>
            </div>
        `).join('');
    }

    getAccountTypeName(type) {
        const names = {
            cash: '现金',
            debit: '银行卡',
            credit: '信用卡',
            investment: '投资账户'
        };
        return names[type] || type;
    }

    addAccount() {
        const name = document.getElementById('account-name').value.trim();
        const type = document.getElementById('account-type').value;
        const balance = parseFloat(document.getElementById('account-balance').value) || 0;

        if (!name) {
            alert('请输入账户名称');
            return;
        }

        this.data.accounts.push({
            id: Date.now(),
            name,
            type,
            balance
        });

        this.saveData();
        this.renderAccounts();
        this.updateDashboard();

        document.getElementById('account-name').value = '';
        document.getElementById('account-balance').value = '';
    }

    deleteAccount(id) {
        if (this.data.accounts.length <= 1) {
            alert('至少保留一个账户');
            return;
        }
        if (confirm('确定删除此账户吗？相关交易记录不会被删除。')) {
            this.data.accounts = this.data.accounts.filter(a => a.id !== id);
            this.saveData();
            this.renderAccounts();
            this.updateDashboard();
        }
    }

    updateDashboard() {
        const selectedMonth = document.getElementById('dashboard-month').value;
        const [year, month] = selectedMonth.split('-').map(Number);

        const monthTransactions = this.data.transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === year && d.getMonth() + 1 === month;
        });

        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expense;
        const netWorth = this.data.accounts.reduce((sum, a) => sum + a.balance, 0);

        document.getElementById('monthly-income').textContent = `¥${income.toFixed(2)}`;
        document.getElementById('monthly-expense').textContent = `¥${expense.toFixed(2)}`;
        document.getElementById('monthly-balance').textContent = `¥${balance.toFixed(2)}`;
        document.getElementById('net-worth').textContent = `¥${netWorth.toFixed(2)}`;

        const recent = [...this.data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        document.getElementById('recent-transactions').innerHTML = recent.length ? recent.map(t => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-category">${this.getCategoryIcon(t.category)}</div>
                    <div class="transaction-details">
                        <h4>${t.category}</h4>
                        <p>${t.date} · ${this.getAccountName(t.accountId)}</p>
                    </div>
                </div>
                <div class="transaction-amount ${t.type}">
                    ${t.type === 'income' ? '+' : '-'}¥${t.amount.toFixed(2)}
                </div>
            </div>
        `).join('') : '<p style="text-align: center; color: var(--gray-400); padding: 20px;">暂无交易记录</p>';

        this.renderBudgetOverview(selectedMonth);
    }

    getCategoryIcon(category) {
        const icons = {
            '工资': '💼', '奖金': '🎁', '投资收益': '📈', '兼职': '💻', '礼金': '🎀',
            '餐饮': '🍜', '交通': '🚗', '购物': '🛒', '娱乐': '🎮', '教育': '📚',
            '医疗': '🏥', '住房': '🏠', '通讯': '📱', '服饰': '👔', '美容': '💄',
            '运动': '⚽', '育儿': '👶', '养老': '👴'
        };
        return icons[category] || '📝';
    }

    getAccountName(id) {
        const acc = this.data.accounts.find(a => a.id === id);
        return acc ? acc.name : '未知账户';
    }

    renderBudgetOverview(month) {
        const [year, m] = month.split('-').map(Number);
        const monthBudgets = this.data.budgets.filter(b => b.month === month);
        
        const monthTransactions = this.data.transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === year && d.getMonth() + 1 === m && t.type === 'expense';
        });

        const spendingByCategory = {};
        monthTransactions.forEach(t => {
            spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
        });

        const overviewEl = document.getElementById('budget-overview');
        if (monthBudgets.length === 0) {
            overviewEl.innerHTML = '<p style="text-align: center; color: var(--gray-400); padding: 20px;">暂无预算设置</p>';
            return;
        }

        overviewEl.innerHTML = monthBudgets.slice(0, 4).map(b => {
            const spent = spendingByCategory[b.category] || 0;
            const percent = Math.min((spent / b.amount) * 100, 100);
            let fillClass = '';
            if (percent > 90) fillClass = 'danger';
            else if (percent > 70) fillClass = 'warning';

            return `
                <div class="budget-item-small">
                    <div class="label">
                        <span>${b.category}</span>
                        <span>¥${spent.toFixed(0)} / ¥${b.amount.toFixed(0)}</span>
                    </div>
                    <div class="bar">
                        <div class="fill ${fillClass}" style="width: ${percent}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    openAccountModal() {
        document.getElementById('account-modal').classList.add('show');
    }

    openAddTransactionModal() {
        document.getElementById('transaction-modal-title').textContent = '添加收支记录';
        document.getElementById('transaction-id').value = '';
        document.getElementById('transaction-amount').value = '';
        document.getElementById('transaction-note').value = '';
        document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
        this.selectTransactionType('expense');
        document.getElementById('transaction-modal').classList.add('show');
    }

    selectTransactionType(type) {
        this.currentTransactionType = type;
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        this.updateCategorySelect(document.getElementById('transaction-category'), type);
    }

    saveTransaction(e) {
        e.preventDefault();
        const id = document.getElementById('transaction-id').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const category = document.getElementById('transaction-category').value;
        const accountId = parseInt(document.getElementById('transaction-account').value);
        const date = document.getElementById('transaction-date').value;
        const note = document.getElementById('transaction-note').value.trim();

        if (!amount || amount <= 0) {
            alert('请输入有效金额');
            return;
        }

        const account = this.data.accounts.find(a => a.id === accountId);
        if (!account) {
            alert('请选择有效账户');
            return;
        }

        if (id) {
            const oldTransaction = this.data.transactions.find(t => t.id === parseInt(id));
            if (oldTransaction) {
                if (oldTransaction.type === 'expense') {
                    account.balance += oldTransaction.amount;
                } else {
                    account.balance -= oldTransaction.amount;
                }
            }
        }

        if (this.currentTransactionType === 'expense') {
            account.balance -= amount;
        } else {
            account.balance += amount;
        }

        const transaction = {
            id: id ? parseInt(id) : Date.now(),
            type: this.currentTransactionType,
            amount,
            category,
            accountId,
            date,
            note
        };

        if (id) {
            const index = this.data.transactions.findIndex(t => t.id === parseInt(id));
            this.data.transactions[index] = transaction;
        } else {
            this.data.transactions.push(transaction);
        }

        this.saveData();
        this.closeModal('transaction-modal');
        this.updateDashboard();
        this.renderTransactionsTable();
    }

    editTransaction(id) {
        const transaction = this.data.transactions.find(t => t.id === id);
        if (!transaction) return;

        document.getElementById('transaction-modal-title').textContent = '编辑收支记录';
        document.getElementById('transaction-id').value = transaction.id;
        document.getElementById('transaction-amount').value = transaction.amount;
        document.getElementById('transaction-date').value = transaction.date;
        document.getElementById('transaction-note').value = transaction.note || '';
        document.getElementById('transaction-account').value = transaction.accountId;
        this.selectTransactionType(transaction.type);
        document.getElementById('transaction-category').value = transaction.category;
        document.getElementById('transaction-modal').classList.add('show');
    }

    deleteTransaction(id) {
        if (confirm('确定删除这条记录吗？')) {
            const transaction = this.data.transactions.find(t => t.id === id);
            if (transaction) {
                const account = this.data.accounts.find(a => a.id === transaction.accountId);
                if (account) {
                    if (transaction.type === 'expense') {
                        account.balance += transaction.amount;
                    } else {
                        account.balance -= transaction.amount;
                    }
                }
            }
            this.data.transactions = this.data.transactions.filter(t => t.id !== id);
            this.saveData();
            this.updateDashboard();
            this.renderTransactionsTable();
        }
    }

    renderTransactionsTable() {
        const tbody = document.getElementById('transactions-table-body');
        const filtered = this.getFilteredTransactions();

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--gray-400);">暂无交易记录</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(t => `
            <tr>
                <td>${t.date}</td>
                <td><span class="type-badge ${t.type}">${t.type === 'income' ? '收入' : '支出'}</span></td>
                <td>${this.getCategoryIcon(t.category)} ${t.category}</td>
                <td>${this.getAccountName(t.accountId)}</td>
                <td style="color: ${t.type === 'income' ? 'var(--success-color)' : 'var(--danger-color)'}; font-weight: 600;">
                    ${t.type === 'income' ? '+' : '-'}¥${t.amount.toFixed(2)}
                </td>
                <td>${t.note || '-'}</td>
                <td>
                    <button class="action-btn edit" onclick="app.editTransaction(${t.id})">编辑</button>
                    <button class="action-btn delete" onclick="app.deleteTransaction(${t.id})">删除</button>
                </td>
            </tr>
        `).join('');
    }

    getFilteredTransactions() {
        const search = document.getElementById('transaction-search').value.toLowerCase();
        const type = document.getElementById('filter-type').value;
        const category = document.getElementById('filter-category').value;
        const account = document.getElementById('filter-account').value;
        const startDate = document.getElementById('filter-date-start').value;
        const endDate = document.getElementById('filter-date-end').value;

        return this.data.transactions.filter(t => {
            if (search && !t.category.toLowerCase().includes(search) && !t.note?.toLowerCase().includes(search)) return false;
            if (type !== 'all' && t.type !== type) return false;
            if (category !== 'all' && t.category !== category) return false;
            if (account !== 'all' && t.accountId !== parseInt(account)) return false;
            if (startDate && t.date < startDate) return false;
            if (endDate && t.date > endDate) return false;
            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    filterTransactions() {
        this.renderTransactionsTable();
    }

    openBudgetModal() {
        document.getElementById('budget-amount').value = '';
        document.getElementById('budget-modal').classList.add('show');
    }

    saveBudget(e) {
        e.preventDefault();
        const month = document.getElementById('budget-month-input').value;
        const category = document.getElementById('budget-category').value;
        const amount = parseFloat(document.getElementById('budget-amount').value);

        if (!amount || amount <= 0) {
            alert('请输入有效金额');
            return;
        }

        const existingIndex = this.data.budgets.findIndex(b => b.month === month && b.category === category);
        if (existingIndex >= 0) {
            this.data.budgets[existingIndex].amount = amount;
        } else {
            this.data.budgets.push({ id: Date.now(), month, category, amount });
        }

        this.saveData();
        this.closeModal('budget-modal');
        this.updateBudgetView();
    }

    updateBudgetView() {
        const month = document.getElementById('budget-month').value;
        const [year, m] = month.split('-').map(Number);
        
        const monthBudgets = this.data.budgets.filter(b => b.month === month);
        const monthTransactions = this.data.transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === year && d.getMonth() + 1 === m && t.type === 'expense';
        });

        const spendingByCategory = {};
        monthTransactions.forEach(t => {
            spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
        });

        const totalBudget = monthBudgets.reduce((sum, b) => sum + b.amount, 0);
        const totalUsed = monthBudgets.reduce((sum, b) => sum + (spendingByCategory[b.category] || 0), 0);

        document.getElementById('total-budget').textContent = `¥${totalBudget.toFixed(2)}`;
        document.getElementById('budget-used').textContent = `¥${totalUsed.toFixed(2)}`;
        document.getElementById('budget-remaining').textContent = `¥${(totalBudget - totalUsed).toFixed(2)}`;

        const cardsEl = document.getElementById('budget-cards');
        if (monthBudgets.length === 0) {
            cardsEl.innerHTML = '<p style="text-align: center; color: var(--gray-400); padding: 40px; grid-column: 1 / -1;">暂无预算设置，请点击上方按钮添加</p>';
            return;
        }

        cardsEl.innerHTML = monthBudgets.map(b => {
            const spent = spendingByCategory[b.category] || 0;
            const percent = Math.min((spent / b.amount) * 100, 100);
            const remaining = b.amount - spent;
            
            let color = '#4f46e5';
            if (percent > 90) color = '#ef4444';
            else if (percent > 70) color = '#f59e0b';

            return `
                <div class="budget-card">
                    <div class="budget-card-header">
                        <h4>${this.getCategoryIcon(b.category)} ${b.category}</h4>
                        <button class="action-btn delete" onclick="app.deleteBudget(${b.id})">删除</button>
                    </div>
                    <div class="budget-progress-circle">
                        <div class="circular-progress" style="background: conic-gradient(${color} ${percent * 3.6}deg, var(--gray-200) 0deg);">
                            <div class="inner">
                                <span class="percentage">${percent.toFixed(0)}%</span>
                                <span class="label">已使用</span>
                            </div>
                        </div>
                    </div>
                    <div class="budget-stats">
                        <span class="used">已用: ¥${spent.toFixed(0)}</span>
                        <span class="remaining">剩余: ¥${remaining.toFixed(0)}</span>
                    </div>
                </div>
            `;
        }).join('');

        this.renderBudgetHistoryChart();
    }

    deleteBudget(id) {
        if (confirm('确定删除此预算吗？')) {
            this.data.budgets = this.data.budgets.filter(b => b.id !== id);
            this.saveData();
            this.updateBudgetView();
        }
    }

    renderBudgetHistoryChart() {
        const ctx = document.getElementById('budgetHistoryChart');
        if (!ctx) return;

        if (this.charts.budgetHistory) {
            this.charts.budgetHistory.destroy();
        }

        const today = new Date();
        const labels = [];
        const budgetData = [];
        const actualData = [];
        const averageData = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            labels.push(`${date.getMonth() + 1}月`);

            const monthBudget = this.data.budgets.filter(b => b.month === monthStr).reduce((sum, b) => sum + b.amount, 0);
            budgetData.push(monthBudget);

            const monthSpending = this.data.transactions.filter(t => {
                const d = new Date(t.date);
                return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && t.type === 'expense';
            }).reduce((sum, t) => sum + t.amount, 0);
            actualData.push(monthSpending);

            const avg = actualData.reduce((a, b) => a + b, 0) / actualData.length || 0;
            averageData.push(avg);
        }

        this.charts.budgetHistory = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: '预算',
                        data: budgetData,
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        tension: 0.3
                    },
                    {
                        label: '实际支出',
                        data: actualData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.3
                    },
                    {
                        label: '平均水平',
                        data: averageData,
                        borderColor: '#f59e0b',
                        borderDash: [5, 5],
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    openSavingsGoalModal() {
        document.getElementById('savings-name').value = '';
        document.getElementById('savings-target').value = '';
        document.getElementById('savings-current').value = '0';
        document.getElementById('savings-deadline').value = '';
        document.getElementById('savings-modal').classList.add('show');
    }

    saveSavingsGoal(e) {
        e.preventDefault();
        const name = document.getElementById('savings-name').value.trim();
        const target = parseFloat(document.getElementById('savings-target').value);
        const current = parseFloat(document.getElementById('savings-current').value) || 0;
        const deadline = document.getElementById('savings-deadline').value;

        if (!name || !target || !deadline) {
            alert('请填写完整信息');
            return;
        }

        this.data.savingsGoals.push({
            id: Date.now(),
            name,
            targetAmount: target,
            currentAmount: current,
            deadline
        });

        this.saveData();
        this.closeModal('savings-modal');
        this.renderSavingsGoals();
    }

    renderSavingsGoals() {
        const listEl = document.getElementById('savings-list');
        if (this.data.savingsGoals.length === 0) {
            listEl.innerHTML = '<p style="text-align: center; color: var(--gray-400); padding: 40px;">暂无储蓄目标</p>';
            return;
        }

        listEl.innerHTML = this.data.savingsGoals.map(goal => {
            const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const remaining = goal.targetAmount - goal.currentAmount;
            
            const today = new Date();
            const deadline = new Date(goal.deadline);
            const monthsLeft = Math.max(0, (deadline - today) / (1000 * 60 * 60 * 24 * 30));
            const monthlyNeed = monthsLeft > 0 ? remaining / monthsLeft : remaining;

            return `
                <div class="savings-item">
                    <div class="savings-item-header">
                        <h4>${goal.name}</h4>
                        <span class="savings-deadline">目标: ${goal.deadline}</span>
                    </div>
                    <div class="savings-progress">
                        <div class="bar">
                            <div class="fill" style="width: ${percent}%"></div>
                        </div>
                        <div class="savings-stats">
                            <span>已存: ¥${goal.currentAmount.toFixed(0)}</span>
                            <span>目标: ¥${goal.targetAmount.toFixed(0)}</span>
                        </div>
                    </div>
                    ${monthsLeft > 0 ? `
                    <div class="monthly-savings">
                        还需 <strong>¥${monthlyNeed.toFixed(0)}/月</strong> 可达成目标
                    </div>
                    ` : ''}
                    <button class="action-btn delete" style="margin-top: 10px;" onclick="app.deleteSavingsGoal(${goal.id})">删除</button>
                </div>
            `;
        }).join('');
    }

    deleteSavingsGoal(id) {
        if (confirm('确定删除此储蓄目标吗？')) {
            this.data.savingsGoals = this.data.savingsGoals.filter(g => g.id !== id);
            this.saveData();
            this.renderSavingsGoals();
        }
    }

    calculateLoan() {
        const principal = parseFloat(document.getElementById('loan-principal').value) || 0;
        const annualRate = parseFloat(document.getElementById('loan-rate').value) || 0;
        const months = parseInt(document.getElementById('loan-months').value) || 0;
        const type = document.getElementById('loan-type').value;

        const resultsEl = document.getElementById('loan-results');

        if (principal <= 0 || annualRate < 0 || months <= 0) {
            resultsEl.innerHTML = '';
            return;
        }

        const monthlyRate = annualRate / 100 / 12;
        let totalInterest = 0;
        let monthlyPayment = 0;
        let schedule = [];

        if (type === 'equal') {
            monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
            totalInterest = monthlyPayment * months - principal;

            let remaining = principal;
            for (let i = 1; i <= months; i++) {
                const interest = remaining * monthlyRate;
                const principalPart = monthlyPayment - interest;
                remaining -= principalPart;
                schedule.push({ month: i, payment: monthlyPayment, principal: principalPart, interest, remaining: Math.max(0, remaining) });
            }
        } else {
            const principalPerMonth = principal / months;
            let remaining = principal;
            for (let i = 1; i <= months; i++) {
                const interest = remaining * monthlyRate;
                const payment = principalPerMonth + interest;
                totalInterest += interest;
                remaining -= principalPerMonth;
                schedule.push({ month: i, payment, principal: principalPerMonth, interest, remaining: Math.max(0, remaining) });
                if (i === 1) monthlyPayment = payment;
            }
        }

        resultsEl.innerHTML = `
            <div class="result-item">
                <span class="result-label">月供金额</span>
                <span class="result-value highlight">¥${monthlyPayment.toFixed(2)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">还款总额</span>
                <span class="result-value">¥${(principal + totalInterest).toFixed(2)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">利息总额</span>
                <span class="result-value">¥${totalInterest.toFixed(2)}</span>
            </div>
            <div class="loan-schedule">
                <table>
                    <thead>
                        <tr><th>期数</th><th>月供</th><th>本金</th><th>利息</th><th>剩余</th></tr>
                    </thead>
                    <tbody>
                        ${schedule.slice(0, 12).map(s => `
                            <tr>
                                <td>${s.month}</td>
                                <td>¥${s.payment.toFixed(0)}</td>
                                <td>¥${s.principal.toFixed(0)}</td>
                                <td>¥${s.interest.toFixed(0)}</td>
                                <td>¥${s.remaining.toFixed(0)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    calculateFreedom() {
        const assets = parseFloat(document.getElementById('current-assets').value) || 0;
        const monthlySpending = parseFloat(document.getElementById('monthly-spending').value) || 0;
        const expectedReturn = parseFloat(document.getElementById('expected-return').value) || 0;
        const withdrawalRate = parseFloat(document.getElementById('withdrawal-rate').value) || 4;

        const resultsEl = document.getElementById('freedom-results');

        if (monthlySpending <= 0) {
            resultsEl.innerHTML = '';
            return;
        }

        const annualSpending = monthlySpending * 12;
        const fireNumber = annualSpending / (withdrawalRate / 100);
        const remaining = Math.max(0, fireNumber - assets);

        let yearsToFire = 0;
        if (assets < fireNumber) {
            let current = assets;
            const monthlyInvestment = 3000;
            const monthlyReturn = expectedReturn / 100 / 12;
            
            while (current < fireNumber && yearsToFire < 100) {
                for (let m = 0; m < 12 && current < fireNumber; m++) {
                    current = current * (1 + monthlyReturn) + monthlyInvestment;
                }
                yearsToFire++;
            }
        }

        const progress = Math.min((assets / fireNumber) * 100, 100);

        resultsEl.innerHTML = `
            <div class="result-item">
                <span class="result-label">财务自由数字</span>
                <span class="result-value highlight">¥${fireNumber.toFixed(0)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">当前进度</span>
                <span class="result-value">${progress.toFixed(1)}%</span>
            </div>
            <div class="result-item">
                <span class="result-label">还需积累</span>
                <span class="result-value">¥${remaining.toFixed(0)}</span>
            </div>
            ${yearsToFire > 0 ? `
            <div class="result-item">
                <span class="result-label">预计时间(按每月投3k)</span>
                <span class="result-value">${yearsToFire}年</span>
            </div>
            ` : ''}
        `;
    }

    renderInsightsCharts() {
        this.renderSpendingTrendChart();
        this.renderCategoryRadarChart();
        this.renderCategoryPieChart();
        this.detectAnomalies();
    }

    renderSpendingTrendChart() {
        const ctx = document.getElementById('spendingTrendChart');
        if (!ctx) return;

        if (this.charts.spendingTrend) {
            this.charts.spendingTrend.destroy();
        }

        const today = new Date();
        const labels = [];
        const data = [];

        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(`${date.getMonth() + 1}月`);

            const monthSpending = this.data.transactions.filter(t => {
                const d = new Date(t.date);
                return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && t.type === 'expense';
            }).reduce((sum, t) => sum + t.amount, 0);
            data.push(monthSpending);
        }

        this.charts.spendingTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: '月支出',
                    data,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderCategoryRadarChart() {
        const ctx = document.getElementById('categoryRadarChart');
        if (!ctx) return;

        if (this.charts.categoryRadar) {
            this.charts.categoryRadar.destroy();
        }

        const expenseCategories = this.data.categories.expense.slice(0, 8);
        const userSpending = [];
        const avgSpending = [];

        expenseCategories.forEach(cat => {
            const total = this.data.transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((sum, t) => sum + t.amount, 0);
            userSpending.push(total);
            avgSpending.push(total * (0.7 + Math.random() * 0.6));
        });

        this.charts.categoryRadar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: expenseCategories,
                datasets: [
                    {
                        label: '我的支出',
                        data: userSpending,
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.2)',
                        borderWidth: 2
                    },
                    {
                        label: '同类平均',
                        data: avgSpending,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderCategoryPieChart() {
        const ctx = document.getElementById('categoryPieChart');
        if (!ctx) return;

        if (this.charts.categoryPie) {
            this.charts.categoryPie.destroy();
        }

        const spendingByCategory = {};
        this.data.transactions.filter(t => t.type === 'expense').forEach(t => {
            spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
        });

        const sorted = Object.entries(spendingByCategory).sort((a, b) => b[1] - a[1]);
        const labels = sorted.slice(0, 8).map(s => s[0]);
        const data = sorted.slice(0, 8).map(s => s[1]);

        const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

        this.charts.categoryPie = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    detectAnomalies() {
        const anomalyList = document.getElementById('anomaly-list');
        const anomalies = [];

        const today = new Date();
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);

        this.data.categories.expense.forEach(cat => {
            const catTransactions = this.data.transactions.filter(t => t.type === 'expense' && t.category === cat);
            
            const monthlyTotals = {};
            catTransactions.forEach(t => {
                const d = new Date(t.date);
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                monthlyTotals[key] = (monthlyTotals[key] || 0) + t.amount;
            });

            const amounts = Object.values(monthlyTotals);
            if (amounts.length >= 3) {
                const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
                const std = Math.sqrt(amounts.reduce((sum, x) => sum + Math.pow(x - avg, 2), 0) / amounts.length);
                
                const currentMonthKey = `${today.getFullYear()}-${today.getMonth()}`;
                const currentMonthSpending = monthlyTotals[currentMonthKey] || 0;

                if (currentMonthSpending > avg + std * 1.5) {
                    anomalies.push({
                        category: cat,
                        current: currentMonthSpending,
                        average: avg,
                        type: 'warning'
                    });
                }
            }
        });

        if (anomalies.length === 0) {
            anomalyList.innerHTML = `
                <div class="anomaly-item normal">
                    <div class="anomaly-title">✅ 消费状况良好</div>
                    <div class="anomaly-desc">未检测到异常消费，各项支出稳定在正常水平</div>
                </div>
            `;
        } else {
            anomalyList.innerHTML = anomalies.map(a => `
                <div class="anomaly-item">
                    <div class="anomaly-title">⚠️ ${a.category}支出异常</div>
                    <div class="anomaly-desc">本月¥${a.current.toFixed(0)}，超出均值¥${a.average.toFixed(0)}约${((a.current - a.average) / a.average * 100).toFixed(0)}%</div>
                </div>
            `).join('');
        }
    }

    importAlipayBill(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            let imported = 0;

            lines.slice(4).forEach(line => {
                if (line.trim()) {
                    const parts = line.split(',');
                    if (parts.length >= 9) {
                        const dateStr = parts[0].replace(/"/g, '').trim();
                        const amount = parseFloat(parts[5].replace(/"/g, ''));
                        const type = parts[4].replace(/"/g, '').trim();
                        const category = parts[7].replace(/"/g, '').trim();
                        const note = parts[8].replace(/"/g, '').trim();

                        if (dateStr && amount && !isNaN(amount)) {
                            const date = dateStr.split(' ')[0];
                            const isExpense = type.includes('支出') || amount < 0;

                            this.data.transactions.push({
                                id: Date.now() + Math.random(),
                                type: isExpense ? 'expense' : 'income',
                                amount: Math.abs(amount),
                                category: this.data.categories[isExpense ? 'expense' : 'income'].includes(category) ? category : (isExpense ? '其他支出' : '其他收入'),
                                accountId: this.data.accounts[0]?.id || 0,
                                date,
                                note
                            });
                            imported++;
                        }
                    }
                }
            });

            this.saveData();
            alert(`成功导入 ${imported} 条记录`);
            this.updateDashboard();
            this.renderTransactionsTable();
        };
        reader.readAsText(file);
    }

    importWechatBill(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            let imported = 0;

            lines.slice(16).forEach(line => {
                if (line.trim()) {
                    const parts = line.split(',');
                    if (parts.length >= 8) {
                        const dateStr = parts[0].replace(/"/g, '').trim();
                        const type = parts[2].replace(/"/g, '').trim();
                        const category = parts[3].replace(/"/g, '').trim();
                        const amountStr = parts[5].replace(/"/g, '').replace('¥', '').trim();
                        const note = parts[7].replace(/"/g, '').trim();

                        const amount = parseFloat(amountStr);
                        if (dateStr && amount && !isNaN(amount)) {
                            const date = dateStr.split(' ')[0];
                            const isExpense = type.includes('支出');

                            this.data.transactions.push({
                                id: Date.now() + Math.random(),
                                type: isExpense ? 'expense' : 'income',
                                amount,
                                category: this.data.categories[isExpense ? 'expense' : 'income'].includes(category) ? category : (isExpense ? '其他支出' : '其他收入'),
                                accountId: this.data.accounts[0]?.id || 0,
                                date,
                                note
                            });
                            imported++;
                        }
                    }
                }
            });

            this.saveData();
            alert(`成功导入 ${imported} 条记录`);
            this.updateDashboard();
            this.renderTransactionsTable();
        };
        reader.readAsText(file);
    }

    exportToExcel() {
        const data = [
            ['日期', '类型', '分类', '账户', '金额', '备注']
        ];

        this.data.transactions.forEach(t => {
            data.push([
                t.date,
                t.type === 'income' ? '收入' : '支出',
                t.category,
                this.getAccountName(t.accountId),
                t.amount,
                t.note || ''
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '交易记录');
        XLSX.writeFile(wb, '家庭账本导出.xlsx');
    }

    exportToJSON() {
        const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '家庭账本数据.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    createEncryptedBackup() {
        const dataStr = JSON.stringify(this.data);
        const encrypted = btoa(encodeURIComponent(dataStr));
        localStorage.setItem('familyFinanceBackup', encrypted);
        localStorage.setItem('familyFinanceBackupTime', new Date().toLocaleString());
        document.getElementById('backup-time').textContent = `上次备份: ${new Date().toLocaleString()}`;
        alert('加密备份已创建！');
    }

    restoreBackup(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.transactions && data.accounts) {
                    if (confirm('确定要恢复备份吗？当前数据将被覆盖。')) {
                        this.data = data;
                        this.saveData();
                        alert('数据恢复成功！');
                        location.reload();
                    }
                }
            } catch (err) {
                alert('无效的备份文件');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
            localStorage.removeItem('familyFinanceData');
            localStorage.removeItem('familyFinanceBackup');
            alert('数据已清除');
            location.reload();
        }
    }

    loadDemoData() {
        if (!confirm('加载演示数据将覆盖现有数据，确定继续吗？')) {
            return;
        }

        const today = new Date();
        
        this.data.accounts = [
            { id: 1, name: '工商银行', type: 'debit', balance: 25680.50 },
            { id: 2, name: '建设银行', type: 'debit', balance: 12345.67 },
            { id: 3, name: '信用卡', type: 'credit', balance: -3200.00 },
            { id: 4, name: '现金', type: 'cash', balance: 850.00 },
            { id: 5, name: '投资账户', type: 'investment', balance: 85000.00 }
        ];

        this.data.transactions = [];
        
        const expenseCategories = [
            { name: '餐饮', min: 20, max: 200, frequency: 0.25 },
            { name: '交通', min: 5, max: 100, frequency: 0.15 },
            { name: '购物', min: 50, max: 1000, frequency: 0.15 },
            { name: '娱乐', min: 30, max: 500, frequency: 0.10 },
            { name: '教育', min: 100, max: 2000, frequency: 0.05 },
            { name: '医疗', min: 50, max: 500, frequency: 0.05 },
            { name: '住房', min: 2000, max: 4000, frequency: 0.05 },
            { name: '通讯', min: 50, max: 200, frequency: 0.05 },
            { name: '服饰', min: 100, max: 1000, frequency: 0.05 },
            { name: '美容', min: 100, max: 800, frequency: 0.03 },
            { name: '运动', min: 50, max: 300, frequency: 0.03 },
            { name: '育儿', min: 200, max: 1500, frequency: 0.04 }
        ];

        const incomeCategories = [
            { name: '工资', min: 15000, max: 20000, day: 15 },
            { name: '奖金', min: 5000, max: 15000, months: [3, 6, 9, 12] },
            { name: '投资收益', min: 500, max: 3000, frequency: 0.3 },
            { name: '兼职', min: 1000, max: 5000, frequency: 0.4 },
            { name: '礼金', min: 200, max: 2000, frequency: 0.2 }
        ];

        const notes = {
            '餐饮': ['午餐', '晚餐', '早餐', '外卖', '超市买菜', '朋友聚餐', '家庭聚餐'],
            '交通': ['地铁', '公交', '打车', '加油', '停车费', '过路费', '洗车'],
            '购物': ['淘宝', '京东', '超市', '便利店', '电子产品', '家居用品'],
            '娱乐': ['电影', 'KTV', '游戏充值', '旅游', '演唱会', '健身'],
            '教育': ['书籍', '培训课程', '在线课程', '学费', '文具'],
            '医疗': ['挂号', '药品', '体检', '牙科', '保健品'],
            '住房': ['房租', '水电费', '物业费', '燃气费', '维修'],
            '通讯': ['话费', '宽带', '流量包'],
            '服饰': ['衣服', '鞋子', '包包', '配饰'],
            '美容': ['护肤品', '化妆品', '美发', '美甲'],
            '运动': ['健身卡', '运动装备', '球赛门票'],
            '育儿': ['奶粉', '尿布', '玩具', '童装', '早教']
        };

        for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
            const year = today.getFullYear();
            const month = today.getMonth() - monthOffset;
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            incomeCategories.forEach(income => {
                if (income.day) {
                    const day = Math.min(income.day, daysInMonth);
                    const date = new Date(year, month, day);
                    if (date <= today) {
                        const amount = income.min + Math.floor(Math.random() * (income.max - income.min));
                        this.data.transactions.push({
                            id: Date.now() + Math.random(),
                            type: 'income',
                            amount: amount,
                            category: income.name,
                            accountId: 1,
                            date: date.toISOString().split('T')[0],
                            note: income.name
                        });
                    }
                } else if (income.months) {
                    if (income.months.includes(month + 1)) {
                        const date = new Date(year, month, 20);
                        if (date <= today) {
                            const amount = income.min + Math.floor(Math.random() * (income.max - income.min));
                            this.data.transactions.push({
                                id: Date.now() + Math.random(),
                                type: 'income',
                                amount: amount,
                                category: income.name,
                                accountId: 1,
                                date: date.toISOString().split('T')[0],
                                note: income.name
                            });
                        }
                    }
                } else if (Math.random() < income.frequency) {
                    const day = Math.floor(Math.random() * daysInMonth) + 1;
                    const date = new Date(year, month, day);
                    if (date <= today) {
                        const amount = income.min + Math.floor(Math.random() * (income.max - income.min));
                        this.data.transactions.push({
                            id: Date.now() + Math.random(),
                            type: 'income',
                            amount: amount,
                            category: income.name,
                            accountId: Math.random() > 0.5 ? 1 : 5,
                            date: date.toISOString().split('T')[0],
                            note: income.name
                        });
                    }
                }
            });

            expenseCategories.forEach(cat => {
                const numTransactions = Math.floor(cat.frequency * 30);
                for (let i = 0; i < numTransactions; i++) {
                    const day = Math.floor(Math.random() * daysInMonth) + 1;
                    const date = new Date(year, month, day);
                    if (date <= today) {
                        const amount = cat.min + Math.floor(Math.random() * (cat.max - cat.min));
                        const noteList = notes[cat.name] || [];
                        const note = noteList.length > 0 ? noteList[Math.floor(Math.random() * noteList.length)] : '';
                        
                        let accountId = 1;
                        if (cat.name === '餐饮' || cat.name === '交通') {
                            accountId = Math.random() > 0.5 ? 4 : 3;
                        } else if (cat.name === '购物') {
                            accountId = Math.random() > 0.3 ? 3 : 1;
                        }
                        
                        this.data.transactions.push({
                            id: Date.now() + Math.random(),
                            type: 'expense',
                            amount: amount,
                            category: cat.name,
                            accountId: accountId,
                            date: date.toISOString().split('T')[0],
                            note: note
                        });
                    }
                }
            });
        }

        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const prevMonth = `${today.getFullYear()}-${String(today.getMonth()).padStart(2, '0')}`;
        
        this.data.budgets = [
            { id: Date.now() + 1000, month: currentMonth, category: '餐饮', amount: 2500 },
            { id: Date.now() + 1001, month: currentMonth, category: '交通', amount: 1000 },
            { id: Date.now() + 1002, month: currentMonth, category: '购物', amount: 2000 },
            { id: Date.now() + 1003, month: currentMonth, category: '娱乐', amount: 1200 },
            { id: Date.now() + 1004, month: currentMonth, category: '教育', amount: 800 },
            { id: Date.now() + 1005, month: currentMonth, category: '住房', amount: 3500 },
            { id: Date.now() + 1006, month: prevMonth, category: '餐饮', amount: 2500 },
            { id: Date.now() + 1007, month: prevMonth, category: '交通', amount: 1000 },
            { id: Date.now() + 1008, month: prevMonth, category: '购物', amount: 2000 }
        ];

        this.data.savingsGoals = [
            { id: Date.now() + 2000, name: '买房首付', targetAmount: 500000, currentAmount: 185000, deadline: '2027-06-30' },
            { id: Date.now() + 2001, name: '新车', targetAmount: 180000, currentAmount: 95000, deadline: '2025-12-31' },
            { id: Date.now() + 2002, name: '旅游基金', targetAmount: 30000, currentAmount: 12000, deadline: '2025-08-15' },
            { id: Date.now() + 2003, name: '应急储备金', targetAmount: 100000, currentAmount: 65000, deadline: '2025-03-31' }
        ];

        this.saveData();
        alert(`演示数据已加载！\n\n共生成 ${this.data.transactions.length} 条交易记录\n涵盖过去12个月的收支数据\n包含4个储蓄目标和多组预算设置`);
        location.reload();
    }

    openOCRModal() {
        document.getElementById('ocr-modal').classList.add('show');
    }

    handleOCRUpload(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const extractedData = [
            { item: '模拟识别 - 超市购物', amount: Math.floor(Math.random() * 200) + 100 },
            { item: '蔬菜', amount: 35.5 },
            { item: '水果', amount: 42.0 },
            { item: '日用品', amount: 88.0 }
        ];

        const resultsEl = document.getElementById('ocr-extracted-data');
        resultsEl.innerHTML = extractedData.map(d => `
            <div class="ocr-extracted-item">
                <span>${d.item}</span>
                <span>¥${d.amount.toFixed(2)}</span>
            </div>
        `).join('');

        document.getElementById('ocr-results').style.display = 'block';
        
        this.ocrTotal = extractedData.reduce((sum, d) => sum + d.amount, 0);
    }

    confirmOCRData() {
        this.currentTransactionType = 'expense';
        document.getElementById('transaction-amount').value = this.ocrTotal.toFixed(2);
        document.getElementById('transaction-category').value = '购物';
        this.closeModal('ocr-modal');
        document.getElementById('transaction-modal').classList.add('show');
    }

    startVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('您的浏览器不支持语音识别，请手动输入');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.parseVoiceInput(transcript);
        };

        recognition.onerror = (event) => {
            alert('语音识别失败，请手动输入');
        };

        recognition.start();
        alert('正在聆听，请说话...例如："餐饮支出50元"');
    }

    parseVoiceInput(text) {
        const amountMatch = text.match(/(\d+(\.\d+)?)/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
        
        let type = 'expense';
        let category = '其他支出';

        if (text.includes('收入') || text.includes('工资')) {
            type = 'income';
            category = '工资';
        } else if (text.includes('餐饮') || text.includes('吃饭')) {
            category = '餐饮';
        } else if (text.includes('交通') || text.includes('车')) {
            category = '交通';
        } else if (text.includes('购物') || text.includes('买')) {
            category = '购物';
        }

        if (amount > 0) {
            this.currentTransactionType = type;
            document.getElementById('transaction-amount').value = amount;
            document.getElementById('transaction-category').value = this.data.categories[type].includes(category) ? category : this.data.categories[type][0];
            document.getElementById('transaction-note').value = text;
            document.getElementById('transaction-modal').classList.add('show');
        } else {
            alert(`识别到: "${text}"，但未能识别金额，请手动输入`);
        }
    }

    bindEvents() {
        document.getElementById('transaction-form').addEventListener('submit', (e) => this.saveTransaction(e));
        document.getElementById('budget-form').addEventListener('submit', (e) => this.saveBudget(e));
        document.getElementById('savings-form').addEventListener('submit', (e) => this.saveSavingsGoal(e));

        document.querySelectorAll('.modal .close').forEach(btn => {
            btn.onclick = () => {
                btn.closest('.modal').classList.remove('show');
            };
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            };
        });

        const backupTime = localStorage.getItem('familyFinanceBackupTime');
        if (backupTime) {
            document.getElementById('backup-time').textContent = `上次备份: ${backupTime}`;
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
}

function switchModule(moduleName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.module === moduleName);
    });

    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`module-${moduleName}`).classList.add('active');

    if (typeof app !== 'undefined' && app) {
        switch (moduleName) {
            case 'dashboard':
                app.updateDashboard();
                break;
            case 'transactions':
                app.renderTransactionsTable();
                break;
            case 'budget':
                app.updateBudgetView();
                break;
            case 'planning':
                app.renderSavingsGoals();
                break;
            case 'insights':
                app.renderInsightsCharts();
                break;
        }
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FamilyFinance();
});