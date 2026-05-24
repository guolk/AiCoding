const Storage = {
    PREFIX: 'family_emergency_',

    KEYS: {
        CERTIFICATES: 'certificates',
        CONTACTS: 'contacts',
        MEMBERS: 'members',
        RALLY_POINTS: 'rallyPoints',
        MEDICINES: 'medicines',
        MEDICATION_RECORDS: 'medicationRecords',
        CHECKLIST: 'checklist',
        SUPPLIES: 'supplies',
        QUIZ_RESULTS: 'quizResults'
    },

    get(key) {
        try {
            const item = localStorage.getItem(this.PREFIX + key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(this.PREFIX + key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    getAll() {
        const data = {};
        Object.values(this.KEYS).forEach(key => {
            data[key] = this.get(key);
        });
        return data;
    },

    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            this.remove(key);
        });
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

const Utils = {
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return date;
        return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    formatDateTime(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return date;
        return d.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    daysUntil(date) {
        if (!date) return Infinity;
        const target = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        const diffTime = target - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    isExpired(date) {
        return this.daysUntil(date) < 0;
    },

    isExpiringSoon(date, days = 30) {
        const daysLeft = this.daysUntil(date);
        return daysLeft >= 0 && daysLeft <= days;
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'times-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    showModal(content, title = '') {
        const container = document.getElementById('modalContainer');
        container.innerHTML = `
            <div class="modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="Utils.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">${content}</div>
                </div>
            </div>
        `;
        
        container.querySelector('.modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                Utils.closeModal();
            }
        });
    },

    showModalWithFooter(content, footerActions, title = '') {
        const container = document.getElementById('modalContainer');
        let footerHtml = '';
        footerActions.forEach(action => {
            footerHtml += `<button class="btn ${action.class || 'btn-secondary'}" onclick="${action.onClick}">${action.text}</button>`;
        });
        
        container.innerHTML = `
            <div class="modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="Utils.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">${content}</div>
                    <div class="modal-footer">${footerHtml}</div>
                </div>
            </div>
        `;
        
        container.querySelector('.modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                Utils.closeModal();
            }
        });
    },

    closeModal() {
        document.getElementById('modalContainer').innerHTML = '';
    },

    confirmDialog(message, onConfirm) {
        this.showModalWithFooter(
            `<p>${message}</p>`,
            [
                { text: '取消', onClick: 'Utils.closeModal()' },
                { text: '确定', class: 'btn-danger', onClick: `${onConfirm}; Utils.closeModal();` }
            ],
            '确认操作'
        );
    },

    getDateInputValue(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    },

    getTodayDateInput() {
        return new Date().toISOString().split('T')[0];
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    getAlertsCount() {
        let count = 0;
        
        const certificates = Storage.get(Storage.KEYS.CERTIFICATES) || [];
        certificates.forEach(cert => {
            if (this.isExpiringSoon(cert.expiryDate, 90) || this.isExpired(cert.expiryDate)) {
                count++;
            }
        });
        
        const medicines = Storage.get(Storage.KEYS.MEDICINES) || [];
        medicines.forEach(med => {
            if (this.isExpiringSoon(med.expiryDate, 30) || this.isExpired(med.expiryDate) || med.quantity <= med.minStock) {
                count++;
            }
        });
        
        const supplies = Storage.get(Storage.KEYS.SUPPLIES) || [];
        supplies.forEach(supply => {
            if (supply.quantity <= supply.minStock) {
                count++;
            }
        });
        
        return count;
    },

    updateAlertCount() {
        const count = this.getAlertsCount();
        const indicator = document.getElementById('statusIndicator');
        const countSpan = document.getElementById('alertCount');
        
        countSpan.textContent = count;
        
        if (count > 0) {
            indicator.classList.add('has-alerts');
        } else {
            indicator.classList.remove('has-alerts');
        }
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
