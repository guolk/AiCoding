function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const moduleName = item.dataset.module;
            switchModule(moduleName);
        });
    });
}

function switchModule(moduleName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-module="${moduleName}"]`).classList.add('active');
    
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
    });
    document.getElementById(`${moduleName}-module`).classList.add('active');
    
    if (moduleName === 'growth') {
        initGrowthModule();
    } else if (moduleName === 'learning') {
        initLearningModule();
    } else if (moduleName === 'resources') {
        initResourcesModule();
    } else if (moduleName === 'activities') {
        initParentActivitiesModule();
    } else if (moduleName === 'health') {
        initHealthModule();
    } else if (moduleName === 'report') {
        initReportModule();
    }
}

function renderAllModules() {
    initGrowthModule();
    initLearningModule();
    initResourcesModule();
    initParentActivitiesModule();
    initHealthModule();
}

function initChildSelector() {
    document.getElementById('childSelector').addEventListener('change', (e) => {
        appData.currentChildId = parseInt(e.target.value);
        saveData();
        renderAllModules();
        showToast('已切换孩子');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initNavigation();
    initChildSelector();
    renderAllModules();
    
    const today = new Date();
    const child = getCurrentChild();
    const upcomingVaccines = child.vaccines.filter(v => 
        v.status === 'upcoming' && 
        new Date(v.date) >= today && 
        new Date(v.date) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    );
    
    if (upcomingVaccines.length > 0) {
        setTimeout(() => {
            showToast(`提醒：本周有${upcomingVaccines.length}个疫苗待接种`, 'warning');
        }, 1000);
    }
});
