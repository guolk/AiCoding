const Storage = {
    KEYS: {
        CLIENTS: 'freelance_clients',
        COMMUNICATIONS: 'freelance_communications',
        PROJECTS: 'freelance_projects',
        MILESTONES: 'freelance_milestones',
        FILES: 'freelance_files',
        TIME_ENTRIES: 'freelance_time_entries',
        INVOICES: 'freelance_invoices',
        PAYMENTS: 'freelance_payments',
        EXPENSES: 'freelance_expenses',
        OPPORTUNITIES: 'freelance_opportunities',
        QUOTES: 'freelance_quotes',
        SETTINGS: 'freelance_settings'
    },

    init() {
        Object.values(this.KEYS).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
        
        if (!localStorage.getItem(this.KEYS.SETTINGS)) {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify({
                hourlyRate: 150,
                taxRate: 0.25,
                currency: 'CNY',
                businessName: '我的工作室',
                businessEmail: 'contact@example.com',
                businessPhone: '138-0000-0000',
                businessAddress: '北京市朝阳区'
            }));
        }
    },

    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    add(key, item) {
        const data = this.get(key);
        item.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        item.createdAt = new Date().toISOString();
        item.updatedAt = new Date().toISOString();
        data.push(item);
        this.set(key, data);
        return item;
    },

    update(key, id, updates) {
        const data = this.get(key);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
            this.set(key, data);
            return data[index];
        }
        return null;
    },

    delete(key, id) {
        const data = this.get(key);
        const filtered = data.filter(item => item.id !== id);
        this.set(key, filtered);
        return filtered.length !== data.length;
    },

    find(key, id) {
        const data = this.get(key);
        return data.find(item => item.id === id);
    },

    filter(key, predicate) {
        const data = this.get(key);
        return data.filter(predicate);
    },

    getSettings() {
        const data = localStorage.getItem(this.KEYS.SETTINGS);
        return data ? JSON.parse(data) : {};
    },

    updateSettings(updates) {
        const settings = this.getSettings();
        const newSettings = { ...settings, ...updates };
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(newSettings));
        return newSettings;
    },

    exportAll() {
        const exportData = {};
        Object.values(this.KEYS).forEach(key => {
            exportData[key] = this.get(key);
        });
        return exportData;
    },

    importAll(data) {
        Object.keys(data).forEach(key => {
            localStorage.setItem(key, JSON.stringify(data[key]));
        });
    },

    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.init();
    }
};

Storage.init();
