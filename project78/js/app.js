const App = {
    currentModule: 'dashboard',
    modules: {
        dashboard: DashboardModule,
        clients: ClientsModule,
        projects: ProjectsModule,
        time: TimeModule,
        finance: FinanceModule,
        opportunities: OpportunitiesModule
    },
    moduleTitles: {
        dashboard: '数据概览',
        clients: '客户关系',
        projects: '项目管理',
        time: '时间计费',
        finance: '财务追踪',
        opportunities: '商机管理'
    },

    init() {
        this.bindEvents();
        this.updateCurrentDate();
        this.render();
        setInterval(() => this.updateCurrentDate(), 60000);
    },

    bindEvents() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const module = item.dataset.module;
                this.switchModule(module);
            });
        });
    },

    switchModule(module) {
        if (this.modules[module]) {
            this.currentModule = module;
            this.updateNav();
            this.render();
        }
    },

    updateNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.module === this.currentModule) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    updateCurrentDate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('zh-CN', options);
        }
    },

    render() {
        const content = document.getElementById('content');
        const title = document.getElementById('page-title');
        
        if (this.modules[this.currentModule]) {
            title.textContent = this.moduleTitles[this.currentModule] || '';
            content.innerHTML = this.modules[this.currentModule].render();
        }
    },

    refresh() {
        this.render();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
