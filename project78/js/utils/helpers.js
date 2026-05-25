const Helpers = {
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    formatDateTime(date) {
        return this.formatDate(date, 'YYYY-MM-DD HH:mm');
    },

    formatCurrency(amount, currency = 'CNY') {
        const symbols = { CNY: '¥', USD: '$', EUR: '€', GBP: '£' };
        const symbol = symbols[currency] || '¥';
        return `${symbol}${Number(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
        }
        return `${mins}分钟`;
    },

    formatDurationDecimal(minutes) {
        return (minutes / 60).toFixed(2);
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    getClientLifecycleStatus(status) {
        const statusMap = {
            potential: { label: '潜在客户', class: 'status-potential' },
            negotiation: { label: '谈判中', class: 'status-negotiation' },
            active: { label: '合作中', class: 'status-active' },
            completed: { label: '已完成', class: 'status-completed' },
            repeat: { label: '复购客户', class: 'status-repeat' }
        };
        return statusMap[status] || statusMap.potential;
    },

    getProjectStatus(status) {
        const statusMap = {
            planning: { label: '规划中', class: 'bg-blue-100 text-blue-800' },
            active: { label: '进行中', class: 'bg-green-100 text-green-800' },
            on_hold: { label: '暂停', class: 'bg-yellow-100 text-yellow-800' },
            completed: { label: '已完成', class: 'bg-gray-100 text-gray-800' },
            cancelled: { label: '已取消', class: 'bg-red-100 text-red-800' }
        };
        return statusMap[status] || statusMap.planning;
    },

    getInvoiceStatus(status) {
        const statusMap = {
            draft: { label: '草稿', class: 'bg-gray-100 text-gray-800' },
            sent: { label: '已发送', class: 'bg-blue-100 text-blue-800' },
            paid: { label: '已付款', class: 'bg-green-100 text-green-800' },
            overdue: { label: '已逾期', class: 'bg-red-100 text-red-800' },
            cancelled: { label: '已取消', class: 'bg-gray-100 text-gray-800' }
        };
        return statusMap[status] || statusMap.draft;
    },

    getOpportunityStatus(status) {
        const statusMap = {
            lead: { label: '线索', class: 'bg-gray-100 text-gray-800' },
            qualified: { label: '已确认', class: 'bg-blue-100 text-blue-800' },
            proposal: { label: '报价中', class: 'bg-yellow-100 text-yellow-800' },
            negotiation: { label: '谈判中', class: 'bg-purple-100 text-purple-800' },
            won: { label: '已成交', class: 'bg-green-100 text-green-800' },
            lost: { label: '已流失', class: 'bg-red-100 text-red-800' }
        };
        return statusMap[status] || statusMap.lead;
    },

    getBillingType(type) {
        const typeMap = {
            hourly: { label: '按小时计费', icon: 'fa-clock' },
            fixed: { label: '按项目计费', icon: 'fa-project-diagram' }
        };
        return typeMap[type] || typeMap.hourly;
    },

    showModal(title, content, actions = []) {
        const container = document.getElementById('modal-container');
        const modalHtml = `
            <div class="modal-overlay" onclick="if(event.target === this) Helpers.closeModal()">
                <div class="modal-content w-full max-w-2xl">
                    <div class="flex justify-between items-center px-6 py-4 border-b">
                        <h3 class="text-xl font-bold text-gray-800">${title}</h3>
                        <button onclick="Helpers.closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="p-6">${content}</div>
                    ${actions.length > 0 ? `
                        <div class="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                            ${actions.map(action => `
                                <button onclick="${action.onclick}" class="${action.class || 'px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg'}">
                                    ${action.label}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        container.innerHTML = modalHtml;
    },

    closeModal() {
        document.getElementById('modal-container').innerHTML = '';
    },

    showFormModal(title, formHtml, onSubmit) {
        const content = `
            <form id="modal-form" onsubmit="event.preventDefault(); ${onSubmit}">
                ${formHtml}
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" onclick="Helpers.closeModal()" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
                        取消
                    </button>
                    <button type="submit" class="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg">
                        保存
                    </button>
                </div>
            </form>
        `;
        this.showModal(title, content, []);
    },

    confirm(message, onConfirm) {
        const callbackId = 'confirm_callback_' + Date.now();
        window[callbackId] = () => {
            onConfirm();
            delete window[callbackId];
        };
        const content = `<p class="text-gray-600">${message}</p>`;
        const actions = [
            { label: '取消', onclick: 'Helpers.closeModal()' },
            { label: '确认', onclick: `window['${callbackId}']()`, class: 'px-4 py-2 bg-danger hover:bg-red-600 text-white rounded-lg' }
        ];
        this.showModal('确认操作', content, actions);
    },

    toast(message, type = 'success') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn`;
        toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>${message}`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    getQuarter(date = new Date()) {
        const month = date.getMonth();
        const year = date.getFullYear();
        const quarter = Math.floor(month / 3) + 1;
        return { year, quarter, label: `${year}年Q${quarter}` };
    },

    getQuarterMonths(quarter, year) {
        const startMonth = (quarter - 1) * 3;
        return [
            new Date(year, startMonth, 1),
            new Date(year, startMonth + 1, 1),
            new Date(year, startMonth + 2, 1)
        ];
    },

    calculateProgress(completed, total) {
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    },

    getDaysDiff(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            pdf: 'fa-file-pdf text-red-500',
            doc: 'fa-file-word text-blue-500',
            docx: 'fa-file-word text-blue-500',
            xls: 'fa-file-excel text-green-500',
            xlsx: 'fa-file-excel text-green-500',
            ppt: 'fa-file-powerpoint text-orange-500',
            pptx: 'fa-file-powerpoint text-orange-500',
            jpg: 'fa-file-image text-purple-500',
            jpeg: 'fa-file-image text-purple-500',
            png: 'fa-file-image text-purple-500',
            gif: 'fa-file-image text-purple-500',
            zip: 'fa-file-archive text-yellow-500',
            rar: 'fa-file-archive text-yellow-500',
            txt: 'fa-file-alt text-gray-500',
            md: 'fa-file-code text-gray-500'
        };
        return icons[ext] || 'fa-file text-gray-400';
    }
};

function exportData() {
    const data = Storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freelance-data-${Helpers.formatDate(new Date(), 'YYYYMMDD')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Helpers.toast('数据导出成功！');
}

function importData() {
    document.getElementById('import-file').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                Helpers.confirm('导入将覆盖现有数据，确定继续吗？', () => {
                    Storage.importAll(data);
                    Helpers.closeModal();
                    location.reload();
                });
            } catch (err) {
                Helpers.toast('文件格式错误', 'error');
            }
        };
        reader.readAsText(file);
    }
    event.target.value = '';
}
