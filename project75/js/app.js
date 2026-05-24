const App = {
    currentModule: 'knowledge',

    init() {
        this.setupNavigation();
        this.setupTabs();
        this.initAllModules();
        Utils.updateAlertCount();
        
        setInterval(() => {
            Utils.updateAlertCount();
        }, 60000);
    },

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const module = item.dataset.module;
                this.switchModule(module);
            });
        });
    },

    switchModule(moduleName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.module === moduleName);
        });

        document.querySelectorAll('.module').forEach(module => {
            module.classList.toggle('active', module.id === `${moduleName}-module`);
        });

        this.currentModule = moduleName;
        this.refreshCurrentModule();
    },

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const moduleSection = btn.closest('.module');
                const tab = btn.dataset.tab;
                
                moduleSection.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.toggle('active', b === btn);
                });

                moduleSection.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.toggle('active', content.id === `${tab}-tab`);
                });

                this.refreshTabContent(moduleSection.id, tab);
            });
        });
    },

    refreshTabContent(moduleId, tab) {
        switch(moduleId) {
            case 'knowledge-module':
                if (tab === 'scenes') KnowledgeModule.renderScenes();
                else if (tab === 'certificates') KnowledgeModule.renderCertificates();
                break;
            case 'emergency-module':
                if (tab === 'contacts') {
                    EmergencyModule.renderQuickContacts();
                    EmergencyModule.renderCustomContacts();
                } else if (tab === 'medical') {
                    EmergencyModule.renderMembers();
                } else if (tab === 'rally') {
                    EmergencyModule.renderRallyPoints();
                }
                break;
            case 'medicine-module':
                if (tab === 'inventory') {
                    MedicineModule.renderWarnings();
                    MedicineModule.renderMedicines();
                } else if (tab === 'records') {
                    MedicineModule.renderRecords();
                }
                break;
            case 'safety-module':
                if (tab === 'checklist') {
                    SafetyModule.renderChecklist();
                } else if (tab === 'supplies') {
                    SafetyModule.renderSupplies();
                }
                break;
        }
    },

    refreshCurrentModule() {
        switch(this.currentModule) {
            case 'knowledge':
                KnowledgeModule.renderScenes();
                KnowledgeModule.renderCertificates();
                break;
            case 'emergency':
                EmergencyModule.renderQuickContacts();
                EmergencyModule.renderCustomContacts();
                EmergencyModule.renderMembers();
                EmergencyModule.renderRallyPoints();
                break;
            case 'medicine':
                MedicineModule.renderWarnings();
                MedicineModule.renderMedicines();
                MedicineModule.renderRecords();
                break;
            case 'safety':
                SafetyModule.renderChecklist();
                SafetyModule.renderSupplies();
                break;
        }
    },

    initAllModules() {
        KnowledgeModule.init();
        EmergencyModule.init();
        MedicineModule.init();
        SafetyModule.init();
    },

    exportAllData() {
        const data = Storage.getAll();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `家庭急救安全数据_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        Utils.showToast('数据导出成功', 'success');
    },

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                Utils.confirmDialog('导入数据将覆盖现有数据，确定要继续吗？', () => {
                    Object.keys(data).forEach(key => {
                        if (Storage.KEYS[key.toUpperCase()]) {
                            Storage.set(key, data[key]);
                        }
                    });
                    
                    this.refreshCurrentModule();
                    Utils.updateAlertCount();
                    Utils.showToast('数据导入成功', 'success');
                });
            } catch (err) {
                Utils.showToast('数据格式错误，导入失败', 'error');
            }
        };
        reader.readAsText(file);
    },

    clearAllData() {
        Utils.confirmDialog('确定要清除所有数据吗？此操作不可恢复！', () => {
            Storage.clearAll();
            this.refreshCurrentModule();
            Utils.updateAlertCount();
            Utils.showToast('所有数据已清除', 'success');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Utils.closeModal();
            document.getElementById('sceneModal').classList.remove('active');
        }
    });

    document.getElementById('sceneModal').addEventListener('click', (e) => {
        if (e.target.id === 'sceneModal') {
            closeSceneModal();
        }
    });
});
