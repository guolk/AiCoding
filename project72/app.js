// ==================== 数据存储 ====================
const STORAGE_KEYS = {
    BEANS: 'coffee_beans',
    BREWS: 'coffee_brews',
    CAFES: 'coffee_cafes',
    CHECKINS: 'coffee_checkins'
};

let state = {
    beans: [],
    brews: [],
    cafes: [],
    checkins: [],
    selectedFlavors: [],
    compareBeans: [],
    showFavoritesOnly: false,
    timer: {
        interval: null,
        currentTime: 0,
        currentStage: 0,
        stages: [],
        totalTime: 0,
        totalWater: 0,
        isRunning: false,
        isPaused: false
    }
};

// ==================== 初始化 ====================
function loadData() {
    state.beans = JSON.parse(localStorage.getItem(STORAGE_KEYS.BEANS) || '[]');
    state.brews = JSON.parse(localStorage.getItem(STORAGE_KEYS.BREWS) || '[]');
    state.cafes = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAFES) || '[]');
    state.checkins = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKINS) || '[]');
    
    if (state.beans.length === 0 && state.brews.length === 0 && state.cafes.length === 0) {
        // 示例数据将在后面的初始化代码中加载
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEYS.BEANS, JSON.stringify(state.beans));
    localStorage.setItem(STORAGE_KEYS.BREWS, JSON.stringify(state.brews));
    localStorage.setItem(STORAGE_KEYS.CAFES, JSON.stringify(state.cafes));
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(state.checkins));
}

function updateCurrentDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('zh-CN', options);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-amber-500';
    toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 toast`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getRelativeDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

function resetTestData() {
    if (confirm('确定要重置所有数据并加载测试数据吗？所有现有数据将被清除。')) {
        localStorage.clear();
        state.beans = [];
        state.brews = [];
        state.cafes = [];
        state.checkins = [];
        loadSampleData();
        
        initRatingStars();
        renderBeans();
        renderBrews();
        renderCafes();
        updateCurrentDate();
        populateBeanSelects();
        populateRecipeSelects();
        updateConvergenceAnalysis();
        calculateExtraction();
        
        setTimeout(() => {
            if (state.brews.length > 0) {
                document.getElementById('shareRecipe').value = state.brews[0].id;
                previewShareCard();
            }
        }, 100);
        
        showToast('测试数据已重置');
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
}

function getDaysUntil(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
}

function addSampleData() {
    const today = new Date();
    const daysAgo = (days) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    state.beans = [
        {
            id: generateId(),
            name: '埃塞俄比亚 耶加雪菲',
            origin: '埃塞俄比亚',
            process: '水洗',
            roast: '中浅烘',
            weight: 200,
            purchaseDate: daysAgo(7),
            roastDate: daysAgo(10),
            shelfLife: 30,
            flavors: ['花香', '柑橘'],
            notes: '来自耶加雪菲产区的精品咖啡豆，具有明亮的柑橘酸质',
            isOpened: true,
            openDate: daysAgo(3),
            createdAt: daysAgo(7)
        },
        {
            id: generateId(),
            name: '哥伦比亚 薇拉',
            origin: '哥伦比亚',
            process: '水洗',
            roast: '中烘',
            weight: 227,
            purchaseDate: daysAgo(14),
            roastDate: daysAgo(18),
            shelfLife: 30,
            flavors: ['焦糖', '坚果'],
            notes: '平衡醇厚，适合日常饮用',
            isOpened: false,
            openDate: null,
            createdAt: daysAgo(14)
        },
        {
            id: generateId(),
            name: '肯尼亚 AA',
            origin: '肯尼亚',
            process: '水洗',
            roast: '中烘',
            weight: 200,
            purchaseDate: daysAgo(2),
            roastDate: daysAgo(5),
            shelfLife: 30,
            flavors: ['莓果', '柑橘'],
            notes: '黑醋栗和番茄的复杂风味',
            isOpened: false,
            openDate: null,
            createdAt: daysAgo(2)
        }
    ];
    
    state.brews = [
        {
            id: generateId(),
            beanId: state.beans[0].id,
            equipment: 'V60',
            beanAmount: 15,
            waterAmount: 225,
            waterTemp: 92,
            grindSize: '中细',
            pourMethod: '分段注水',
            brewTime: 150,
            acidity: 4,
            sweetness: 5,
            bitterness: 2,
            body: 3,
            aftertaste: 4,
            notes: '非常完美的一杯，花香明显，柑橘酸质明亮',
            flavorNotes: '茉莉、柠檬、蜂蜜',
            isFavorite: true,
            createdAt: daysAgo(2)
        },
        {
            id: generateId(),
            beanId: state.beans[0].id,
            equipment: 'V60',
            beanAmount: 15,
            waterAmount: 240,
            waterTemp: 90,
            grindSize: '中细',
            pourMethod: '分段注水',
            brewTime: 160,
            acidity: 3,
            sweetness: 4,
            bitterness: 2,
            body: 3,
            aftertaste: 4,
            notes: '水温稍低，酸质更柔和',
            flavorNotes: '橙花、焦糖',
            isFavorite: false,
            createdAt: daysAgo(1)
        }
    ];
    
    state.cafes = [
        {
            id: generateId(),
            name: 'Seesaw Coffee',
            address: '淮海中路333号',
            city: '上海',
            rating: 5,
            specialty: '手冲、冷萃',
            notes: '环境安静，适合工作',
            createdAt: daysAgo(30)
        },
        {
            id: generateId(),
            name: 'Manner Coffee',
            address: '南京西路1266号',
            city: '上海',
            rating: 4,
            specialty: '意式、燕麦拿铁',
            notes: '性价比高，出餐快',
            createdAt: daysAgo(15)
        }
    ];
    
    state.checkins = [
        { id: generateId(), cafeId: state.cafes[0].id, date: daysAgo(7), notes: '喝了耶加雪菲手冲' },
        { id: generateId(), cafeId: state.cafes[0].id, date: daysAgo(3), notes: '尝试了新品特调' },
        { id: generateId(), cafeId: state.cafes[1].id, date: daysAgo(5), notes: '早餐搭配可颂' }
    ];
    
    saveData();
}

// ==================== 标签页切换 ====================
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('tab-active');
    });
    
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-${tabName}`).classList.add('fade-in');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('tab-active');
    
    if (tabName === 'assistant') {
        updateTimerWaterGoal();
    }
}

// ==================== 咖啡豆模块 ====================
function renderBeans() {
    const container = document.getElementById('beansList');
    const searchTerm = document.getElementById('beanSearch').value.toLowerCase();
    const filter = document.getElementById('beanFilter').value;
    
    let filteredBeans = state.beans.filter(bean => {
        const matchSearch = bean.name.toLowerCase().includes(searchTerm) || 
                           bean.origin.toLowerCase().includes(searchTerm);
        const status = getBeanStatus(bean);
        const matchFilter = filter === 'all' || status === filter;
        return matchSearch && matchFilter;
    });
    
    if (filteredBeans.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                <p class="text-gray-500">暂无咖啡豆记录</p>
                <button onclick="openBeanModal()" class="mt-4 text-amber-700 hover:text-amber-800 font-medium">
                    + 添加第一支咖啡豆
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredBeans.map(bean => {
        const status = getBeanStatus(bean);
        const statusClass = status === 'opened' ? 'bean-card-status-opened' : 
                          status === 'expired' ? 'bean-card-status-expired' : 'bean-card-status-unopened';
        const statusText = status === 'opened' ? '已开封' : status === 'expired' ? '已过期' : '未开封';
        const statusColor = status === 'opened' ? 'text-green-600 bg-green-50' : 
                           status === 'expired' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50';
        
        const countdown = getExpirationCountdown(bean);
        const countdownText = countdown !== null ? 
            (countdown > 0 ? `赏味期剩余 ${countdown} 天` : `已过期 ${Math.abs(countdown)} 天`) : '';
        const countdownColor = countdown > 7 ? 'text-green-600' : countdown > 0 ? 'text-yellow-600' : 'text-red-600';
        
        return `
            <div class="bg-white rounded-xl shadow-md overflow-hidden card-hover ${statusClass}">
                <div class="p-5">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h3 class="font-bold text-lg text-amber-900">${bean.name}</h3>
                            <p class="text-sm text-gray-500">${bean.origin} · ${bean.process}</p>
                        </div>
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">${statusText}</span>
                    </div>
                    
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">烘焙度</span>
                            <span class="text-gray-700">${bean.roast}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">重量</span>
                            <span class="text-gray-700">${bean.weight}g</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">烘焙日期</span>
                            <span class="text-gray-700">${formatDate(bean.roastDate)}</span>
                        </div>
                        ${countdownText ? `
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">赏味倒计时</span>
                            <span class="font-medium ${countdownColor}">${countdownText}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${bean.flavorNotes && bean.flavorNotes.length > 0 ? `
                    <div class="flex flex-wrap gap-1 mb-4">
                        ${bean.flavorNotes.map(f => `<span class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">${f}</span>`).join('')}
                    </div>
                    ` : ''}
                    
                    <div class="flex space-x-2">
                        ${!bean.isOpened && status !== 'expired' ? `
                        <button onclick="openBean('${bean.id}')" class="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-lg text-sm font-medium transition-colors">
                            开封
                        </button>
                        ` : ''}
                        <button onclick="editBean('${bean.id}')" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors">
                            编辑
                        </button>
                        <button onclick="deleteBean('${bean.id}')" class="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    updateBeanStats();
}

function getBeanStatus(bean) {
    const countdown = getExpirationCountdown(bean);
    if (countdown !== null && countdown <= 0) return 'expired';
    if (bean.isOpened) return 'opened';
    return 'unopened';
}

function getExpirationCountdown(bean) {
    if (!bean.roastDate || !bean.shelfLife) return null;
    
    const startDate = bean.isOpened && bean.openDate ? bean.openDate : bean.roastDate;
    const start = new Date(startDate);
    const expireDate = new Date(start.getTime() + bean.shelfLife * 24 * 60 * 60 * 1000);
    return getDaysUntil(expireDate.toISOString().split('T')[0]);
}

function filterBeans() {
    renderBeans();
}

function updateBeanStats() {
    document.getElementById('totalBeans').textContent = state.beans.length;
    document.getElementById('openedBeans').textContent = state.beans.filter(b => b.isOpened).length;
    document.getElementById('expiringBeans').textContent = state.beans.filter(b => {
        const countdown = getExpirationCountdown(b);
        return countdown !== null && countdown <= 7 && countdown > 0;
    }).length;
}

function updateBeanCountdowns() {
    renderBeans();
}

function openBeanModal(beanId = null) {
    state.selectedFlavors = [];
    document.querySelectorAll('.flavor-tag').forEach(tag => tag.classList.remove('selected'));
    document.getElementById('beanForm').reset();
    document.getElementById('beanId').value = '';
    document.getElementById('beanModalTitle').textContent = '添加咖啡豆';
    document.getElementById('beanFlavors').value = '';
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('beanPurchaseDate').value = today;
    document.getElementById('beanRoastDate').value = today;
    
    if (beanId) {
        const bean = state.beans.find(b => b.id === beanId);
        if (bean) {
            document.getElementById('beanId').value = bean.id;
            document.getElementById('beanName').value = bean.name;
            document.getElementById('beanOrigin').value = bean.origin;
            document.getElementById('beanProcess').value = bean.process;
            document.getElementById('beanRoast').value = bean.roast;
            document.getElementById('beanWeight').value = bean.weight;
            document.getElementById('beanPurchaseDate').value = bean.purchaseDate;
            document.getElementById('beanRoastDate').value = bean.roastDate;
            document.getElementById('beanShelfLife').value = bean.shelfLife;
            document.getElementById('beanNotes').value = bean.notes || '';
            document.getElementById('beanModalTitle').textContent = '编辑咖啡豆';
            
            if (bean.flavorNotes) {
                state.selectedFlavors = [...bean.flavorNotes];
                document.querySelectorAll('.flavor-tag').forEach(tag => {
                    const flavor = tag.textContent.split(' ')[1];
                    if (state.selectedFlavors.includes(flavor)) {
                        tag.classList.add('selected');
                    }
                });
                document.getElementById('beanFlavors').value = bean.flavorNotes.join(',');
            }
        }
    }
    
    document.getElementById('beanModal').classList.remove('hidden');
}

function closeBeanModal() {
    document.getElementById('beanModal').classList.add('hidden');
}

function editBean(beanId) {
    openBeanModal(beanId);
}

function openBean(beanId) {
    const bean = state.beans.find(b => b.id === beanId);
    if (bean) {
        bean.isOpened = true;
        bean.openDate = new Date().toISOString().split('T')[0];
        saveData();
        renderBeans();
        populateBeanSelects();
        showToast(`已开封：${bean.name}`);
    }
}

function deleteBean(beanId) {
    if (confirm('确定要删除这支咖啡豆吗？')) {
        state.beans = state.beans.filter(b => b.id !== beanId);
        saveData();
        renderBeans();
        populateBeanSelects();
        showToast('咖啡豆已删除');
    }
}

function toggleFlavor(element, flavor) {
    element.classList.toggle('selected');
    if (state.selectedFlavors.includes(flavor)) {
        state.selectedFlavors = state.selectedFlavors.filter(f => f !== flavor);
    } else {
        state.selectedFlavors.push(flavor);
    }
    document.getElementById('beanFlavors').value = state.selectedFlavors.join(',');
}

function handleBeanSubmit(e) {
    e.preventDefault();
    
    try {
        const name = document.getElementById('beanName').value.trim();
        const origin = document.getElementById('beanOrigin').value.trim();
        
        if (!name || !origin) {
            showToast('请填写咖啡豆名称和产地', 'error');
            return;
        }
        
        const beanId = document.getElementById('beanId').value;
        const beanData = {
            name: name,
            origin: origin,
            process: document.getElementById('beanProcess').value,
            roast: document.getElementById('beanRoast').value,
            weight: parseInt(document.getElementById('beanWeight').value) || 200,
            purchaseDate: document.getElementById('beanPurchaseDate').value || new Date().toISOString().split('T')[0],
            roastDate: document.getElementById('beanRoastDate').value || new Date().toISOString().split('T')[0],
            shelfLife: parseInt(document.getElementById('beanShelfLife').value) || 30,
            flavorNotes: state.selectedFlavors.length > 0 ? [...state.selectedFlavors] : [],
            notes: document.getElementById('beanNotes').value.trim()
        };
        
        if (beanId) {
            const index = state.beans.findIndex(b => b.id === beanId);
            if (index !== -1) {
                state.beans[index] = { ...state.beans[index], ...beanData };
                showToast('✓ 咖啡豆已更新');
            }
        } else {
            beanData.id = generateId();
            beanData.isOpened = false;
            beanData.openDate = null;
            beanData.createdAt = new Date().toISOString().split('T')[0];
            state.beans.push(beanData);
            showToast('✓ 咖啡豆已添加');
        }
        
        saveData();
        renderBeans();
        populateBeanSelects();
        closeBeanModal();
    } catch (error) {
        console.error('保存咖啡豆失败:', error);
        showToast('保存失败，请重试', 'error');
    }
}

// ==================== 风味对比 ====================
function openCompareModal() {
    state.compareBeans = [];
    const container = document.getElementById('compareSelect');
    
    if (state.beans.length < 2) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500 py-4">至少需要2支咖啡豆才能进行对比</p>';
        document.getElementById('startCompareBtn').disabled = true;
    } else {
        container.innerHTML = state.beans.map(bean => `
            <div class="compare-item p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-amber-400 transition-colors" onclick="toggleCompareBean('${bean.id}', this)">
                <p class="font-medium text-amber-900">${bean.name}</p>
                <p class="text-xs text-gray-500">${bean.origin} · ${bean.roast}</p>
            </div>
        `).join('');
    }
    
    document.getElementById('compareResult').classList.add('hidden');
    document.getElementById('compareModal').classList.remove('hidden');
}

function closeCompareModal() {
    document.getElementById('compareModal').classList.add('hidden');
}

function toggleCompareBean(beanId, element) {
    if (state.compareBeans.includes(beanId)) {
        state.compareBeans = state.compareBeans.filter(id => id !== beanId);
        element.classList.remove('border-amber-600', 'bg-amber-50');
        element.classList.add('border-gray-200');
    } else {
        if (state.compareBeans.length >= 3) {
            showToast('最多只能选择3款咖啡豆', 'warning');
            return;
        }
        state.compareBeans.push(beanId);
        element.classList.remove('border-gray-200');
        element.classList.add('border-amber-600', 'bg-amber-50');
    }
    document.getElementById('startCompareBtn').disabled = state.compareBeans.length < 2;
}

function startCompare() {
    const beansToCompare = state.compareBeans.map(id => state.beans.find(b => b.id === id)).filter(Boolean);
    const thead = document.querySelector('#compareResult thead tr');
    thead.innerHTML = `<th class="px-4 py-3 text-left text-sm font-semibold text-amber-800">对比项</th>` +
        beansToCompare.map(b => `<th class="px-4 py-3 text-center text-sm font-semibold text-amber-800">${b.name}</th>`).join('');
    
    const tbody = document.getElementById('compareTableBody');
    const compareItems = [
        { label: '产地', key: 'origin' },
        { label: '处理法', key: 'process' },
        { label: '烘焙度', key: 'roast' },
        { label: '重量', key: 'weight', format: v => v + 'g' },
        { label: '烘焙日期', key: 'roastDate', format: formatDate },
        { label: '状态', key: 'status', format: v => v === 'opened' ? '已开封' : v === 'expired' ? '已过期' : '未开封' },
        { label: '风味', key: 'flavors', format: v => v ? v.join('、') : '-' },
        { label: '冲煮次数', key: 'brewCount', format: v => v + ' 次' }
    ];
    
    tbody.innerHTML = compareItems.map(item => `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-medium text-gray-700">${item.label}</td>
            ${beansToCompare.map(bean => {
                let value;
                if (item.key === 'status') {
                    value = getBeanStatus(bean);
                } else if (item.key === 'brewCount') {
                    value = state.brews.filter(b => b.beanId === bean.id).length;
                } else {
                    value = bean[item.key];
                }
                const displayValue = item.format ? item.format(value) : (value || '-');
                return `<td class="px-4 py-3 text-sm text-gray-600 text-center">${displayValue}</td>`;
            }).join('')}
        </tr>
    `).join('');
    
    document.getElementById('compareResult').classList.remove('hidden');
}

// ==================== 冲煮记录模块 ====================
function initRatingStars() {
    const ratings = ['acidity', 'sweetness', 'bitterness', 'body', 'aftertaste'];
    ratings.forEach(rating => {
        const container = document.getElementById(`rating-${rating}`);
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<span class="rating-star text-2xl text-gray-300" data-value="${i}" onclick="setRating('${rating}', ${i})">★</span>`;
        }
        container.innerHTML = html;
    });
}

function setRating(type, value) {
    const container = document.getElementById(`rating-${type}`);
    const stars = container.querySelectorAll('.rating-star');
    const input = document.getElementById(`brew${type.charAt(0).toUpperCase() + type.slice(1)}`);
    const valueDisplay = document.getElementById(`${type}Value`);
    
    stars.forEach((star, index) => {
        if (index < value) {
            star.classList.remove('text-gray-300');
            star.classList.add('text-yellow-400');
        } else {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300');
        }
    });
    
    input.value = value;
    valueDisplay.textContent = value;
}

function populateBeanSelects() {
    const selects = ['brewBeanId'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        const currentValue = select.value;
        select.innerHTML = '<option value="">选择咖啡豆</option>' +
            state.beans.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
        select.value = currentValue;
    });
}

function populateRecipeSelects() {
    const favorites = state.brews.filter(b => b.isFavorite);
    
    const baseRecipeSelect = document.getElementById('baseRecipe');
    if (baseRecipeSelect) {
        baseRecipeSelect.innerHTML = '<option value="">选择一个收藏的配方作为基准</option>' +
            favorites.map(b => {
                const bean = state.beans.find(bean => bean.id === b.beanId);
                return `<option value="${b.id}">${bean?.name || '未知'} - ${b.beanAmount}g/${b.waterAmount}ml</option>`;
            }).join('');
    }
    
    const shareRecipeSelect = document.getElementById('shareRecipe');
    if (shareRecipeSelect) {
        shareRecipeSelect.innerHTML = '<option value="">选择一个收藏的配方</option>' +
            favorites.map(b => {
                const bean = state.beans.find(bean => bean.id === b.beanId);
                return `<option value="${b.id}">${bean?.name || '未知'} - ${b.beanAmount}g/${b.waterAmount}ml</option>`;
            }).join('');
    }
}

function renderBrews() {
    const container = document.getElementById('brewingList');
    let brewsToShow = [...state.brews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (state.showFavoritesOnly) {
        brewsToShow = brewsToShow.filter(b => b.isFavorite);
    }
    
    if (brewsToShow.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21v.001a2 2 0 00-1.022.546"/>
                </svg>
                <p class="text-gray-500">${state.showFavoritesOnly ? '暂无收藏的配方' : '暂无冲煮记录'}</p>
                <button onclick="openBrewingModal()" class="mt-4 text-amber-700 hover:text-amber-800 font-medium">
                    + 记录第一次冲煮
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = brewsToShow.map(brew => {
        const bean = state.beans.find(b => b.id === brew.beanId);
        const totalScore = brew.acidity + brew.sweetness + brew.bitterness + brew.body + brew.aftertaste;
        const avgScore = (totalScore / 5).toFixed(1);
        const ratio = (brew.waterAmount / brew.beanAmount).toFixed(1);
        
        return `
            <div class="bg-white rounded-xl shadow-md overflow-hidden card-hover brew-card ${brew.isFavorite ? 'favorite' : ''}">
                <div class="p-5">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <div class="flex items-center space-x-2 mb-1">
                                <h3 class="font-bold text-lg text-amber-900">${bean?.name || '未知咖啡豆'}</h3>
                                ${brew.isFavorite ? '<span class="text-yellow-500 text-xl">★</span>' : ''}
                            </div>
                            <p class="text-sm text-gray-500">${formatDate(brew.createdAt)} · ${brew.equipment}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-2xl font-bold text-amber-800">${avgScore}</p>
                            <p class="text-xs text-gray-500">综合评分</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                        <div class="bg-amber-50 rounded-lg p-2 text-center">
                            <p class="text-xs text-gray-500">豆量</p>
                            <p class="font-semibold text-amber-800">${brew.beanAmount}g</p>
                        </div>
                        <div class="bg-amber-50 rounded-lg p-2 text-center">
                            <p class="text-xs text-gray-500">水量</p>
                            <p class="font-semibold text-amber-800">${brew.waterAmount}ml</p>
                        </div>
                        <div class="bg-amber-50 rounded-lg p-2 text-center">
                            <p class="text-xs text-gray-500">粉水比</p>
                            <p class="font-semibold text-amber-800">1:${ratio}</p>
                        </div>
                        <div class="bg-amber-50 rounded-lg p-2 text-center">
                            <p class="text-xs text-gray-500">水温</p>
                            <p class="font-semibold text-amber-800">${brew.waterTemp}°C</p>
                        </div>
                        <div class="bg-amber-50 rounded-lg p-2 text-center">
                            <p class="text-xs text-gray-500">研磨</p>
                            <p class="font-semibold text-amber-800">${brew.grindSize}</p>
                        </div>
                        <div class="bg-amber-50 rounded-lg p-2 text-center">
                            <p class="text-xs text-gray-500">时间</p>
                            <p class="font-semibold text-amber-800">${Math.floor(brew.brewTime/60)}:${(brew.brewTime%60).toString().padStart(2,'0')}</p>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-2 mb-4">
                        <div class="flex items-center space-x-1 text-sm">
                            <span class="text-gray-500">酸度</span>
                            <div class="flex">${'★'.repeat(brew.acidity)}${'☆'.repeat(5-brew.acidity)}</div>
                        </div>
                        <div class="flex items-center space-x-1 text-sm">
                            <span class="text-gray-500">甜度</span>
                            <div class="flex">${'★'.repeat(brew.sweetness)}${'☆'.repeat(5-brew.sweetness)}</div>
                        </div>
                        <div class="flex items-center space-x-1 text-sm">
                            <span class="text-gray-500">苦度</span>
                            <div class="flex">${'★'.repeat(brew.bitterness)}${'☆'.repeat(5-brew.bitterness)}</div>
                        </div>
                        <div class="flex items-center space-x-1 text-sm">
                            <span class="text-gray-500">醇厚度</span>
                            <div class="flex">${'★'.repeat(brew.body)}${'☆'.repeat(5-brew.body)}</div>
                        </div>
                        <div class="flex items-center space-x-1 text-sm">
                            <span class="text-gray-500">余韵</span>
                            <div class="flex">${'★'.repeat(brew.aftertaste)}${'☆'.repeat(5-brew.aftertaste)}</div>
                        </div>
                    </div>
                    
                    ${brew.flavorNotes ? `<p class="text-sm text-gray-600 mb-2"><span class="text-gray-500">风味：</span>${brew.flavorNotes}</p>` : ''}
                    ${brew.notes ? `<p class="text-sm text-gray-600"><span class="text-gray-500">备注：</span>${brew.notes}</p>` : ''}
                    
                    <div class="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                        <button onclick="toggleFavorite('${brew.id}')" class="flex-1 ${brew.isFavorite ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'} hover:opacity-80 py-2 rounded-lg text-sm font-medium transition-colors">
                            ${brew.isFavorite ? '★ 已收藏' : '☆ 收藏配方'}
                        </button>
                        <button onclick="editBrew('${brew.id}')" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors">
                            编辑
                        </button>
                        <button onclick="deleteBrew('${brew.id}')" class="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    updateBrewStats();
}

function updateBrewStats() {
    document.getElementById('totalBrews').textContent = state.brews.length;
    document.getElementById('favoriteRecipes').textContent = state.brews.filter(b => b.isFavorite).length;
    
    if (state.brews.length > 0) {
        const totalScore = state.brews.reduce((sum, b) => {
            return sum + (b.acidity + b.sweetness + b.bitterness + b.body + b.aftertaste) / 5;
        }, 0);
        document.getElementById('avgRating').textContent = (totalScore / state.brews.length).toFixed(1);
    }
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyCount = state.brews.filter(b => {
        const date = new Date(b.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
    document.getElementById('monthlyBrews').textContent = monthlyCount;
}

function showFavoritesOnly() {
    state.showFavoritesOnly = !state.showFavoritesOnly;
    const btn = document.getElementById('favoritesBtn');
    if (state.showFavoritesOnly) {
        btn.classList.add('bg-amber-700', 'text-white');
        btn.classList.remove('bg-amber-100', 'text-amber-800');
        btn.textContent = '查看全部';
    } else {
        btn.classList.remove('bg-amber-700', 'text-white');
        btn.classList.add('bg-amber-100', 'text-amber-800');
        btn.textContent = '查看收藏';
    }
    renderBrews();
}

function openBrewingModal(brewId = null) {
    document.getElementById('brewingForm').reset();
    document.getElementById('brewingId').value = '';
    
    ['acidity', 'sweetness', 'bitterness', 'body', 'aftertaste'].forEach(type => {
        setRating(type, 0);
    });
    
    if (brewId) {
        const brew = state.brews.find(b => b.id === brewId);
        if (brew) {
            document.getElementById('brewingId').value = brew.id;
            document.getElementById('brewBeanId').value = brew.beanId;
            document.getElementById('brewEquipment').value = brew.equipment;
            document.getElementById('brewBeanAmount').value = brew.beanAmount;
            document.getElementById('brewWaterAmount').value = brew.waterAmount;
            document.getElementById('brewWaterTemp').value = brew.waterTemp;
            document.getElementById('brewGrindSize').value = brew.grindSize;
            document.getElementById('brewPourMethod').value = brew.pourMethod;
            document.getElementById('brewTime').value = brew.brewTime;
            document.getElementById('brewNotes').value = brew.notes || '';
            document.getElementById('brewFlavorNotes').value = brew.flavorNotes || '';
            document.getElementById('brewFavorite').checked = brew.isFavorite;
            
            setRating('acidity', brew.acidity);
            setRating('sweetness', brew.sweetness);
            setRating('bitterness', brew.bitterness);
            setRating('body', brew.body);
            setRating('aftertaste', brew.aftertaste);
        }
    }
    
    document.getElementById('brewingModal').classList.remove('hidden');
}

function closeBrewingModal() {
    document.getElementById('brewingModal').classList.add('hidden');
}

function editBrew(brewId) {
    openBrewingModal(brewId);
}

function deleteBrew(brewId) {
    if (confirm('确定要删除这条冲煮记录吗？')) {
        state.brews = state.brews.filter(b => b.id !== brewId);
        saveData();
        renderBrews();
        populateRecipeSelects();
        updateConvergenceAnalysis();
        showToast('冲煮记录已删除');
    }
}

function toggleFavorite(brewId) {
    const brew = state.brews.find(b => b.id === brewId);
    if (brew) {
        brew.isFavorite = !brew.isFavorite;
        saveData();
        renderBrews();
        populateRecipeSelects();
        showToast(brew.isFavorite ? '已加入收藏' : '已取消收藏');
    }
}

function handleBrewSubmit(e) {
    e.preventDefault();
    
    try {
        const beanId = document.getElementById('brewBeanId').value;
        const beanAmount = parseFloat(document.getElementById('brewBeanAmount').value);
        const waterAmount = parseInt(document.getElementById('brewWaterAmount').value);
        const waterTemp = parseInt(document.getElementById('brewWaterTemp').value);
        const brewTime = parseInt(document.getElementById('brewTime').value);
        const acidity = parseInt(document.getElementById('brewAcidity').value);
        const sweetness = parseInt(document.getElementById('brewSweetness').value);
        const bitterness = parseInt(document.getElementById('brewBitterness').value);
        const body = parseInt(document.getElementById('brewBody').value);
        const aftertaste = parseInt(document.getElementById('brewAftertaste').value);
        
        if (!beanId) {
            showToast('请选择咖啡豆', 'error');
            return;
        }
        
        if (!beanAmount || beanAmount <= 0) {
            showToast('请输入有效的豆量', 'error');
            return;
        }
        
        if (!waterAmount || waterAmount <= 0) {
            showToast('请输入有效的水量', 'error');
            return;
        }
        
        if (acidity === 0 || sweetness === 0 || bitterness === 0 || body === 0 || aftertaste === 0) {
            showToast('请完成所有感官评分', 'error');
            return;
        }
        
        const brewId = document.getElementById('brewingId').value;
        const brewData = {
            beanId: beanId,
            equipment: document.getElementById('brewEquipment').value,
            beanAmount: beanAmount,
            waterAmount: waterAmount,
            waterTemp: waterTemp || 92,
            grindSize: document.getElementById('brewGrindSize').value,
            pourMethod: document.getElementById('brewPourMethod').value,
            brewTime: brewTime || 150,
            acidity: acidity,
            sweetness: sweetness,
            bitterness: bitterness,
            body: body,
            aftertaste: aftertaste,
            notes: document.getElementById('brewNotes').value.trim(),
            flavorNotes: document.getElementById('brewFlavorNotes').value.trim(),
            isFavorite: document.getElementById('brewFavorite').checked
        };
        
        if (brewId) {
            const index = state.brews.findIndex(b => b.id === brewId);
            if (index !== -1) {
                state.brews[index] = { ...state.brews[index], ...brewData };
                showToast('✓ 冲煮记录已更新');
            }
        } else {
            brewData.id = generateId();
            brewData.createdAt = new Date().toISOString().split('T')[0];
            state.brews.push(brewData);
            showToast('✓ 冲煮记录已保存');
        }
        
        saveData();
        renderBrews();
        populateRecipeSelects();
        updateConvergenceAnalysis();
        closeBrewingModal();
    } catch (error) {
        console.error('保存冲煮记录失败:', error);
        showToast('保存失败，请重试', 'error');
    }
}

// ==================== 参数优化模块 ====================
function calculateExtraction() {
    const dose = parseFloat(document.getElementById('calcDose').value);
    const yield_ = parseFloat(document.getElementById('calcYield').value);
    const tds = parseFloat(document.getElementById('calcTDS').value);
    
    document.getElementById('tdsValue').textContent = tds.toFixed(2) + '%';
    
    if (dose && yield_ && tds) {
        const extraction = (yield_ * tds / 100) / dose * 100;
        document.getElementById('extractionResult').textContent = extraction.toFixed(1) + '%';
        
        let advice, color;
        if (extraction < 18) {
            advice = '萃取不足，可能会有尖酸、咸味，可以尝试更细的研磨度或延长萃取时间';
            color = 'text-yellow-600';
        } else if (extraction > 22) {
            advice = '过度萃取，可能会有焦苦、干涩，可以尝试更粗的研磨度或缩短萃取时间';
            color = 'text-red-600';
        } else {
            advice = '萃取率处于理想范围，平衡感最佳！';
            color = 'text-green-600';
        }
        document.getElementById('extractionAdvice').textContent = advice;
        document.getElementById('extractionAdvice').className = `text-sm mt-2 ${color}`;
    }
}

function generateExperiment() {
    const baseRecipeId = document.getElementById('baseRecipe').value;
    const variable = document.getElementById('variableToChange').value;
    const startValue = parseFloat(document.getElementById('startValue').value);
    const endValue = parseFloat(document.getElementById('endValue').value);
    const steps = parseInt(document.getElementById('experimentSteps').value);
    
    if (!baseRecipeId) {
        showToast('请先选择一个基准配方', 'error');
        return;
    }
    if (isNaN(startValue) || isNaN(endValue) || startValue === endValue) {
        showToast('请输入有效的起始值和终止值', 'error');
        return;
    }
    
    const baseRecipe = state.brews.find(b => b.id === baseRecipeId);
    if (!baseRecipe) return;
    
    const variableLabels = {
        beanAmount: '豆量',
        waterAmount: '水量',
        waterTemp: '水温',
        grindSize: '研磨度',
        ratio: '粉水比',
        brewTime: '总萃取时间'
    };
    
    const variableUnits = {
        beanAmount: 'g',
        waterAmount: 'ml',
        waterTemp: '°C',
        grindSize: '',
        ratio: '',
        brewTime: '秒'
    };
    
    const stepSize = (endValue - startValue) / (steps - 1);
    const experiments = [];
    
    for (let i = 0; i < steps; i++) {
        const value = variable === 'grindSize' ? 
            ['极细', '细', '中细', '中', '中粗', '粗'][Math.round(startValue + i * stepSize)] :
            (startValue + i * stepSize).toFixed(1);
        
        experiments.push({
            index: i + 1,
            value: value + variableUnits[variable],
            variable: variableLabels[variable]
        });
    }
    
    const resultContainer = document.getElementById('experimentResult');
    const planContainer = document.getElementById('experimentPlan');
    
    planContainer.innerHTML = `
        <div class="bg-amber-50 rounded-lg p-4 mb-3">
            <p class="font-medium text-amber-800">基准配方参数</p>
            <p class="text-sm text-gray-600 mt-1">${baseRecipe.beanAmount}g / ${baseRecipe.waterAmount}ml / ${baseRecipe.waterTemp}°C / ${baseRecipe.grindSize} / ${baseRecipe.brewTime}秒</p>
        </div>
        <p class="text-sm font-medium text-gray-700 mb-2">实验计划（每次只调整 ${variableLabels[variable]}）：</p>
        ${experiments.map(exp => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="font-medium text-amber-800">实验 #${exp.index}</span>
                <span class="text-gray-600">${exp.variable}: ${exp.value}</span>
                <button onclick="quickAddBrew('${baseRecipeId}', '${variable}', '${exp.value}')" class="text-sm text-amber-700 hover:text-amber-800 font-medium">快速记录</button>
            </div>
        `).join('')}
    `;
    
    resultContainer.classList.remove('hidden');
}

function quickAddBrew(baseRecipeId, variable, value) {
    const baseRecipe = state.brews.find(b => b.id === baseRecipeId);
    if (!baseRecipe) return;
    
    openBrewingModal();
    
    setTimeout(() => {
        document.getElementById('brewBeanId').value = baseRecipe.beanId;
        document.getElementById('brewEquipment').value = baseRecipe.equipment;
        document.getElementById('brewBeanAmount').value = baseRecipe.beanAmount;
        document.getElementById('brewWaterAmount').value = baseRecipe.waterAmount;
        document.getElementById('brewWaterTemp').value = baseRecipe.waterTemp;
        document.getElementById('brewGrindSize').value = baseRecipe.grindSize;
        document.getElementById('brewPourMethod').value = baseRecipe.pourMethod;
        document.getElementById('brewTime').value = baseRecipe.brewTime;
        
        const numericValue = parseFloat(value);
        switch(variable) {
            case 'beanAmount':
                document.getElementById('brewBeanAmount').value = numericValue;
                break;
            case 'waterAmount':
                document.getElementById('brewWaterAmount').value = numericValue;
                break;
            case 'waterTemp':
                document.getElementById('brewWaterTemp').value = numericValue;
                break;
            case 'grindSize':
                document.getElementById('brewGrindSize').value = value.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '');
                break;
            case 'brewTime':
                document.getElementById('brewTime').value = numericValue;
                break;
        }
    }, 100);
}

function updateConvergenceAnalysis() {
    const highScoreBrews = state.brews.filter(b => {
        const avg = (b.acidity + b.sweetness + b.bitterness + b.body + b.aftertaste) / 5;
        return avg >= 4;
    });
    
    if (highScoreBrews.length === 0) {
        document.getElementById('bestRatio').textContent = '-';
        document.getElementById('bestTemp').textContent = '-';
        document.getElementById('bestTime').textContent = '-';
        document.getElementById('bestGrind').textContent = '-';
        return;
    }
    
    const avgRatio = highScoreBrews.reduce((sum, b) => sum + (b.waterAmount / b.beanAmount), 0) / highScoreBrews.length;
    const avgTemp = highScoreBrews.reduce((sum, b) => sum + b.waterTemp, 0) / highScoreBrews.length;
    const avgTime = highScoreBrews.reduce((sum, b) => sum + b.brewTime, 0) / highScoreBrews.length;
    
    const grindCounts = {};
    highScoreBrews.forEach(b => {
        grindCounts[b.grindSize] = (grindCounts[b.grindSize] || 0) + 1;
    });
    const bestGrind = Object.keys(grindCounts).reduce((a, b) => grindCounts[a] > grindCounts[b] ? a : b, '-');
    
    document.getElementById('bestRatio').textContent = '1:' + avgRatio.toFixed(1);
    document.getElementById('bestTemp').textContent = avgTemp.toFixed(0) + '°C';
    document.getElementById('bestTime').textContent = Math.floor(avgTime/60) + ':' + (Math.round(avgTime)%60).toString().padStart(2,'0');
    document.getElementById('bestGrind').textContent = bestGrind;
    
    renderConvergenceChart(highScoreBrews);
}

function renderConvergenceChart(brews) {
    const container = document.getElementById('convergenceChart');
    if (brews.length < 3) {
        container.innerHTML = '<p class="text-gray-400">需要更多高分配方来分析参数规律</p>';
        return;
    }
    
    const params = ['ratio', 'temp', 'time', 'grind'];
    const paramLabels = ['粉水比', '水温', '时间', '研磨度'];
    const data = params.map(param => {
        let values;
        if (param === 'ratio') {
            values = brews.map(b => b.waterAmount / b.beanAmount);
        } else if (param === 'temp') {
            values = brews.map(b => b.waterTemp);
        } else if (param === 'time') {
            values = brews.map(b => b.brewTime);
        } else {
            const grindMap = {'极细': 0, '细': 1, '中细': 2, '中': 3, '中粗': 4, '粗': 5};
            values = brews.map(b => grindMap[b.grindSize] ?? 2);
        }
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        return { param, label: paramLabels[params.indexOf(param)], avg, stdDev, values };
    });
    
    const maxStdDev = Math.max(...data.map(d => d.stdDev));
    const convergenceScores = data.map(d => ({
        ...d,
        convergence: maxStdDev > 0 ? (1 - d.stdDev / maxStdDev) * 100 : 100
    }));
    
    container.innerHTML = `
        <div class="w-full h-full flex items-center justify-center">
            <div class="w-full px-4">
                <p class="text-sm text-gray-500 mb-4 text-center">参数收敛度（数值越高表示高分记录的参数越一致）</p>
                <div class="space-y-4">
                    ${convergenceScores.map(d => `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-600">${d.label}</span>
                                <span class="text-amber-800 font-medium">${d.convergence.toFixed(0)}%</span>
                            </div>
                            <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-amber-400 to-amber-600 chart-bar" style="width: ${d.convergence}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// ==================== 冲煮辅助模块 ====================
function addPourStage() {
    const container = document.getElementById('pourStages');
    const stages = container.querySelectorAll('.pour-stage');
    const newStage = document.createElement('div');
    newStage.className = 'pour-stage flex items-center space-x-2 bg-gray-50 p-3 rounded-lg';
    newStage.innerHTML = `
        <span class="stage-num text-sm font-medium text-gray-500 w-6">${stages.length + 1}</span>
        <input type="number" class="pour-amount w-20 px-2 py-1 border border-gray-200 rounded text-sm" placeholder="水量ml" value="0">
        <span class="text-gray-400">ml</span>
        <input type="number" class="pour-time w-20 px-2 py-1 border border-gray-200 rounded text-sm" placeholder="时间s" value="30">
        <span class="text-gray-400">s</span>
        <button onclick="removePourStage(this)" class="text-red-500 hover:text-red-600 ml-auto">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    `;
    container.appendChild(newStage);
    updateTimerWaterGoal();
}

function removePourStage(button) {
    const stages = document.querySelectorAll('.pour-stage');
    if (stages.length <= 1) {
        showToast('至少保留一个注水阶段', 'warning');
        return;
    }
    button.closest('.pour-stage').remove();
    updateStageNumbers();
    updateTimerWaterGoal();
}

function updateStageNumbers() {
    document.querySelectorAll('.pour-stage').forEach((stage, index) => {
        stage.querySelector('.stage-num').textContent = index + 1;
    });
}

function updateTimerWaterGoal() {
    const stages = getPourStages();
    const totalWater = stages.reduce((sum, s) => sum + s.amount, 0);
    state.timer.totalWater = totalWater;
    state.timer.totalTime = stages.reduce((sum, s) => sum + s.time, 0);
    document.getElementById('timerWater').textContent = `目标: 0ml / ${totalWater}ml`;
}

function getPourStages() {
    const stageElements = document.querySelectorAll('.pour-stage');
    return Array.from(stageElements).map(el => ({
        amount: parseFloat(el.querySelector('.pour-amount').value) || 0,
        time: parseFloat(el.querySelector('.pour-time').value) || 0
    }));
}

function startTimer() {
    if (state.timer.isPaused) {
        state.timer.isPaused = false;
        state.timer.isRunning = true;
        runTimer();
        return;
    }
    
    state.timer.stages = getPourStages();
    state.timer.totalTime = state.timer.stages.reduce((sum, s) => sum + s.time, 0);
    state.timer.totalWater = state.timer.stages.reduce((sum, s) => sum + s.amount, 0);
    state.timer.currentTime = 0;
    state.timer.currentStage = 0;
    state.timer.isRunning = true;
    state.timer.isPaused = false;
    
    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('pauseBtn').classList.remove('hidden');
    
    runTimer();
}

function runTimer() {
    if (!state.timer.isRunning || state.timer.isPaused) return;
    
    state.timer.interval = setInterval(() => {
        if (state.timer.isPaused) return;
        
        state.timer.currentTime++;
        updateTimerDisplay();
        
        const elapsedStagesTime = state.timer.stages
            .slice(0, state.timer.currentStage)
            .reduce((sum, s) => sum + s.time, 0);
        const currentStageTime = state.timer.currentTime - elapsedStagesTime;
        
        if (currentStageTime >= state.timer.stages[state.timer.currentStage].time) {
            state.timer.currentStage++;
            if (state.timer.currentStage >= state.timer.stages.length) {
                stopTimer();
                return;
            }
        }
        
        const progress = (state.timer.currentTime / state.timer.totalTime) * 100;
        updateTimerProgress(progress);
        
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.timer.currentTime / 60);
    const seconds = state.timer.currentTime % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const currentStageNum = state.timer.currentStage + 1;
    const stageName = state.timer.currentStage === 0 ? '闷蒸' : `第${currentStageNum}段注水`;
    document.getElementById('timerStage').textContent = stageName;
    
    const accumulatedWater = state.timer.stages
        .slice(0, state.timer.currentStage)
        .reduce((sum, s) => sum + s.amount, 0);
    
    const currentStage = state.timer.stages[state.timer.currentStage];
    if (currentStage) {
        const elapsedInStage = state.timer.currentTime - 
            state.timer.stages.slice(0, state.timer.currentStage).reduce((sum, s) => sum + s.time, 0);
        const stageProgress = Math.min(elapsedInStage / currentStage.time, 1);
        const currentWater = accumulatedWater + (currentStage.amount * stageProgress);
        
        document.getElementById('timerWater').textContent = 
            `目标: ${Math.round(currentWater)}ml / ${state.timer.totalWater}ml`;
        
        const waterProgress = (currentWater / state.timer.totalWater) * 100;
        document.getElementById('waterProgress').style.width = waterProgress + '%';
        document.getElementById('waterProgressText').textContent = Math.round(waterProgress) + '%';
    }
}

function updateTimerProgress(progress) {
    const circle = document.getElementById('timerProgress');
    const circumference = 552.92;
    const offset = circumference - (progress / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

function pauseTimer() {
    state.timer.isPaused = true;
    clearInterval(state.timer.interval);
    
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('timerDisplay').classList.add('timer-paused');
}

function stopTimer() {
    state.timer.isRunning = false;
    state.timer.isPaused = false;
    clearInterval(state.timer.interval);
    
    document.getElementById('timerStage').textContent = '冲煮完成！';
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('timerDisplay').classList.add('pulse-timer');
    
    setTimeout(() => {
        document.getElementById('timerDisplay').classList.remove('pulse-timer');
    }, 3000);
    
    showToast('冲煮计时完成！');
}

function resetTimer() {
    clearInterval(state.timer.interval);
    state.timer.isRunning = false;
    state.timer.isPaused = false;
    state.timer.currentTime = 0;
    state.timer.currentStage = 0;
    
    document.getElementById('timerDisplay').textContent = '00:00';
    document.getElementById('timerDisplay').classList.remove('timer-paused', 'pulse-timer');
    document.getElementById('timerStage').textContent = '准备开始';
    document.getElementById('timerWater').textContent = `目标: 0ml / ${state.timer.totalWater}ml`;
    document.getElementById('waterProgress').style.width = '0%';
    document.getElementById('waterProgressText').textContent = '0%';
    updateTimerProgress(0);
    
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('pauseBtn').classList.add('hidden');
}

const equipmentParams = {
    v60: {
        name: 'Hario V60',
        ratio: '1:15',
        beanAmount: '15g',
        waterAmount: '225ml',
        temp: '90-93°C',
        grind: '中细研磨',
        time: '2:30-3:00',
        stages: [
            '45ml 水闷蒸 30秒',
            '注至 150ml',
            '注至 225ml'
        ]
    },
    chemex: {
        name: 'Chemex',
        ratio: '1:16',
        beanAmount: '20g',
        waterAmount: '320ml',
        temp: '93-96°C',
        grind: '中研磨',
        time: '4:00-5:00',
        stages: [
            '60ml 水闷蒸 45秒',
            '注至 200ml',
            '注至 320ml'
        ]
    },
    switch: {
        name: 'Hario Switch',
        ratio: '1:14',
        beanAmount: '15g',
        waterAmount: '210ml',
        temp: '92-95°C',
        grind: '中细研磨',
        time: '3:00-4:00',
        stages: [
            '注入 210ml 水，关闭开关',
            '浸泡 2分钟',
            '打开开关，滴滤完成'
        ]
    },
    origami: {
        name: 'Origami 折纸滤杯',
        ratio: '1:15',
        beanAmount: '15g',
        waterAmount: '225ml',
        temp: '90-93°C',
        grind: '中细研磨',
        time: '2:30-3:30',
        stages: [
            '45ml 水闷蒸 30秒',
            '注至 150ml，等待',
            '注至 225ml'
        ]
    }
};

function selectEquipment(type) {
    document.querySelectorAll('.equipment-btn').forEach(btn => {
        btn.classList.remove('border-amber-600', 'bg-amber-50');
        btn.classList.add('border-gray-200');
        btn.querySelector('p:first-of-type').classList.remove('text-amber-800');
        btn.querySelector('p:first-of-type').classList.add('text-gray-700');
    });
    
    const activeBtn = document.querySelector(`[onclick="selectEquipment('${type}')"]`);
    activeBtn.classList.remove('border-gray-200');
    activeBtn.classList.add('border-amber-600', 'bg-amber-50');
    activeBtn.querySelector('p:first-of-type').classList.remove('text-gray-700');
    activeBtn.querySelector('p:first-of-type').classList.add('text-amber-800');
    
    const params = equipmentParams[type];
    const container = document.getElementById('equipmentParams');
    container.innerHTML = `
        <h4 class="font-semibold text-amber-800 mb-3">${params.name} 推荐参数</h4>
        <div class="space-y-3">
            <div class="flex justify-between"><span class="text-gray-600">粉水比</span><span class="font-medium">${params.ratio}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">粉量</span><span class="font-medium">${params.beanAmount}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">水量</span><span class="font-medium">${params.waterAmount}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">水温</span><span class="font-medium">${params.temp}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">研磨度</span><span class="font-medium">${params.grind}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">总时间</span><span class="font-medium">${params.time}</span></div>
        </div>
        <div class="mt-4 pt-4 border-t border-amber-200">
            <p class="text-sm text-gray-600 mb-2">注水方案：</p>
            <ol class="text-sm text-gray-600 space-y-1">
                ${params.stages.map((s, i) => `<li>${i + 1}. ${s}</li>`).join('')}
            </ol>
        </div>
    `;
    
    const stagesContainer = document.getElementById('pourStages');
    if (stagesContainer && type === 'v60') {
        stagesContainer.innerHTML = `
            <div class="pour-stage flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                <span class="stage-num text-sm font-medium text-gray-500 w-6">1</span>
                <input type="number" class="pour-amount w-20 px-2 py-1 border border-gray-200 rounded text-sm" value="45">
                <span class="text-gray-400">ml</span>
                <input type="number" class="pour-time w-20 px-2 py-1 border border-gray-200 rounded text-sm" value="30">
                <span class="text-gray-400">s</span>
            </div>
            <div class="pour-stage flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                <span class="stage-num text-sm font-medium text-gray-500 w-6">2</span>
                <input type="number" class="pour-amount w-20 px-2 py-1 border border-gray-200 rounded text-sm" value="105">
                <span class="text-gray-400">ml</span>
                <input type="number" class="pour-time w-20 px-2 py-1 border border-gray-200 rounded text-sm" value="60">
                <span class="text-gray-400">s</span>
            </div>
            <div class="pour-stage flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                <span class="stage-num text-sm font-medium text-gray-500 w-6">3</span>
                <input type="number" class="pour-amount w-20 px-2 py-1 border border-gray-200 rounded text-sm" value="75">
                <span class="text-gray-400">ml</span>
                <input type="number" class="pour-time w-20 px-2 py-1 border border-gray-200 rounded text-sm" value="60">
                <span class="text-gray-400">s</span>
                <button onclick="removePourStage(this)" class="text-red-500 hover:text-red-600 ml-auto">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;
        updateTimerWaterGoal();
    }
}

// ==================== 社区功能模块 ====================
function renderCafes() {
    const container = document.getElementById('cafeList');
    
    if (state.cafes.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <p class="text-gray-500 text-sm">还没有咖啡馆记录</p>
                <button onclick="openCafeModal()" class="mt-2 text-amber-700 hover:text-amber-800 text-sm font-medium">
                    + 添加第一家
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.cafes.map(cafe => {
        const checkinCount = state.checkins.filter(c => c.cafeId === cafe.id).length;
        const lastCheckin = state.checkins.filter(c => c.cafeId === cafe.id).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        return `
            <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="flex items-center space-x-2">
                            <h4 class="font-semibold text-amber-900">${cafe.name}</h4>
                            <span class="text-yellow-500 text-sm">${'★'.repeat(cafe.rating)}${'☆'.repeat(5-cafe.rating)}</span>
                        </div>
                        ${cafe.city ? `<p class="text-xs text-gray-500">${cafe.city} · ${cafe.address || ''}</p>` : ''}
                        ${cafe.specialty ? `<p class="text-xs text-gray-600 mt-1">特色：${cafe.specialty}</p>` : ''}
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-amber-800">${checkinCount} 次打卡</p>
                        ${lastCheckin ? `<p class="text-xs text-gray-500">上次：${formatDate(lastCheckin.date)}</p>` : ''}
                    </div>
                </div>
                <div class="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                    <button onclick="checkinCafe('${cafe.id}')" class="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 py-1.5 rounded-lg text-xs font-medium transition-colors checkin-badge">
                        📍 打卡
                    </button>
                    <button onclick="editCafe('${cafe.id}')" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-1.5 rounded-lg text-xs font-medium transition-colors">
                        编辑
                    </button>
                    <button onclick="deleteCafe('${cafe.id}')" class="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                        删除
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    updateCafeStats();
}

function updateCafeStats() {
    document.getElementById('totalCafes').textContent = state.cafes.length;
    document.getElementById('totalCheckins').textContent = state.checkins.length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyCount = state.checkins.filter(c => {
        const date = new Date(c.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
    document.getElementById('monthlyCheckins').textContent = monthlyCount;
}

function openCafeModal(cafeId = null) {
    document.getElementById('cafeForm').reset();
    document.getElementById('cafeId').value = '';
    document.getElementById('cafeModalTitle').textContent = '添加咖啡馆';
    document.getElementById('cafeCheckinNow').checked = true;
    
    if (cafeId) {
        const cafe = state.cafes.find(c => c.id === cafeId);
        if (cafe) {
            document.getElementById('cafeId').value = cafe.id;
            document.getElementById('cafeName').value = cafe.name;
            document.getElementById('cafeAddress').value = cafe.address || '';
            document.getElementById('cafeCity').value = cafe.city || '';
            document.getElementById('cafeRating').value = cafe.rating;
            document.getElementById('cafeSpecialty').value = cafe.specialty || '';
            document.getElementById('cafeNotes').value = cafe.notes || '';
            document.getElementById('cafeModalTitle').textContent = '编辑咖啡馆';
            document.getElementById('cafeCheckinNow').checked = false;
        }
    }
    
    document.getElementById('cafeModal').classList.remove('hidden');
}

function closeCafeModal() {
    document.getElementById('cafeModal').classList.add('hidden');
}

function editCafe(cafeId) {
    openCafeModal(cafeId);
}

function deleteCafe(cafeId) {
    if (confirm('确定要删除这家咖啡馆吗？相关打卡记录也会被删除。')) {
        state.cafes = state.cafes.filter(c => c.id !== cafeId);
        state.checkins = state.checkins.filter(c => c.cafeId !== cafeId);
        saveData();
        renderCafes();
        showToast('咖啡馆已删除');
    }
}

function checkinCafe(cafeId) {
    const checkin = {
        id: generateId(),
        cafeId: cafeId,
        date: new Date().toISOString().split('T')[0],
        notes: ''
    };
    state.checkins.push(checkin);
    saveData();
    renderCafes();
    const cafe = state.cafes.find(c => c.id === cafeId);
    showToast(`已打卡：${cafe?.name}`);
}

function handleCafeSubmit(e) {
    e.preventDefault();
    
    const cafeId = document.getElementById('cafeId').value;
    const shouldCheckin = document.getElementById('cafeCheckinNow').checked;
    
    const cafeData = {
        name: document.getElementById('cafeName').value,
        address: document.getElementById('cafeAddress').value,
        city: document.getElementById('cafeCity').value,
        rating: parseInt(document.getElementById('cafeRating').value),
        specialty: document.getElementById('cafeSpecialty').value,
        notes: document.getElementById('cafeNotes').value
    };
    
    if (cafeId) {
        const index = state.cafes.findIndex(c => c.id === cafeId);
        if (index !== -1) {
            state.cafes[index] = { ...state.cafes[index], ...cafeData };
            showToast('咖啡馆信息已更新');
        }
    } else {
        cafeData.id = generateId();
        cafeData.createdAt = new Date().toISOString().split('T')[0];
        state.cafes.push(cafeData);
        showToast('咖啡馆已添加');
        
        if (shouldCheckin) {
            const checkin = {
                id: generateId(),
                cafeId: cafeData.id,
                date: new Date().toISOString().split('T')[0],
                notes: ''
            };
            state.checkins.push(checkin);
        }
    }
    
    saveData();
    renderCafes();
    closeCafeModal();
}

function previewShareCard() {
    const recipeId = document.getElementById('shareRecipe').value;
    if (!recipeId) return;
    
    const brew = state.brews.find(b => b.id === recipeId);
    if (!brew) return;
    
    const bean = state.beans.find(b => b.id === brew.beanId);
    const totalScore = brew.acidity + brew.sweetness + brew.bitterness + brew.body + brew.aftertaste;
    const avgScore = (totalScore / 5).toFixed(1);
    const ratio = (brew.waterAmount / brew.beanAmount).toFixed(1);
    
    const container = document.getElementById('shareCardPreview');
    container.innerHTML = `
        <div class="share-card rounded-xl p-6">
            <h4 class="text-xl font-bold text-amber-900 mb-1">${bean?.name || '未知咖啡豆'}</h4>
            <p class="text-sm text-amber-700 mb-4">${bean?.origin || ''} · ${bean?.process || ''} · ${bean?.roast || ''}</p>
            
            <div class="flex justify-center mb-4">
                <div class="text-center">
                    <p class="text-4xl font-bold text-amber-800">${avgScore}</p>
                    <p class="text-xs text-amber-600">综合评分</p>
                </div>
            </div>
            
            <div class="grid grid-cols-3 gap-2 mb-4 text-center">
                <div class="bg-white/50 rounded-lg p-2">
                    <p class="text-xs text-gray-500">豆量</p>
                    <p class="font-semibold text-amber-800">${brew.beanAmount}g</p>
                </div>
                <div class="bg-white/50 rounded-lg p-2">
                    <p class="text-xs text-gray-500">水量</p>
                    <p class="font-semibold text-amber-800">${brew.waterAmount}ml</p>
                </div>
                <div class="bg-white/50 rounded-lg p-2">
                    <p class="text-xs text-gray-500">粉水比</p>
                    <p class="font-semibold text-amber-800">1:${ratio}</p>
                </div>
                <div class="bg-white/50 rounded-lg p-2">
                    <p class="text-xs text-gray-500">水温</p>
                    <p class="font-semibold text-amber-800">${brew.waterTemp}°C</p>
                </div>
                <div class="bg-white/50 rounded-lg p-2">
                    <p class="text-xs text-gray-500">研磨</p>
                    <p class="font-semibold text-amber-800">${brew.grindSize}</p>
                </div>
                <div class="bg-white/50 rounded-lg p-2">
                    <p class="text-xs text-gray-500">时间</p>
                    <p class="font-semibold text-amber-800">${Math.floor(brew.brewTime/60)}:${(brew.brewTime%60).toString().padStart(2,'0')}</p>
                </div>
            </div>
            
            <div class="flex justify-center space-x-3 text-sm">
                <div class="flex items-center space-x-1">
                    <span class="text-gray-600 text-xs">酸</span>
                    <div class="flex text-yellow-500">${'★'.repeat(brew.acidity)}${'☆'.repeat(5-brew.acidity)}</div>
                </div>
                <div class="flex items-center space-x-1">
                    <span class="text-gray-600 text-xs">甜</span>
                    <div class="flex text-yellow-500">${'★'.repeat(brew.sweetness)}${'☆'.repeat(5-brew.sweetness)}</div>
                </div>
                <div class="flex items-center space-x-1">
                    <span class="text-gray-600 text-xs">苦</span>
                    <div class="flex text-yellow-500">${'★'.repeat(brew.bitterness)}${'☆'.repeat(5-brew.bitterness)}</div>
                </div>
                <div class="flex items-center space-x-1">
                    <span class="text-gray-600 text-xs">醇</span>
                    <div class="flex text-yellow-500">${'★'.repeat(brew.body)}${'☆'.repeat(5-brew.body)}</div>
                </div>
                <div class="flex items-center space-x-1">
                    <span class="text-gray-600 text-xs">韵</span>
                    <div class="flex text-yellow-500">${'★'.repeat(brew.aftertaste)}${'☆'.repeat(5-brew.aftertaste)}</div>
                </div>
            </div>
            
            ${brew.flavorNotes ? `<p class="mt-4 text-sm text-amber-700">🎨 ${brew.flavorNotes}</p>` : ''}
            
            <div class="mt-4 pt-4 border-t border-amber-300/50">
                <p class="text-xs text-amber-600">☕ 由咖啡日记生成 · ${formatDate(brew.createdAt)}</p>
            </div>
        </div>
    `;
}

function copyShareText() {
    const recipeId = document.getElementById('shareRecipe').value;
    if (!recipeId) {
        showToast('请先选择一个配方', 'warning');
        return;
    }
    
    const brew = state.brews.find(b => b.id === recipeId);
    if (!brew) return;
    
    const bean = state.beans.find(b => b.id === brew.beanId);
    const totalScore = brew.acidity + brew.sweetness + brew.bitterness + brew.body + brew.aftertaste;
    const avgScore = (totalScore / 5).toFixed(1);
    const ratio = (brew.waterAmount / brew.beanAmount).toFixed(1);
    
    const text = `☕ 我的手冲咖啡配方分享

【咖啡豆】${bean?.name || '未知'}
【产地】${bean?.origin || '-'} | 【处理法】${bean?.process || '-'} | 【烘焙度】${bean?.roast || '-'}

【冲煮参数】
📊 豆量: ${brew.beanAmount}g | 水量: ${brew.waterAmount}ml | 粉水比: 1:${ratio}
🌡️ 水温: ${brew.waterTemp}°C | ⚙️ 研磨: ${brew.grindSize}
⏱️ 时间: ${Math.floor(brew.brewTime/60)}分${brew.brewTime%60}秒 | 器具: ${brew.equipment}

【感官评分】
⭐ 综合评分: ${avgScore}/5
酸: ${brew.acidity}/5 | 甜: ${brew.sweetness}/5 | 苦: ${brew.bitterness}/5 | 醇: ${brew.body}/5 | 韵: ${brew.aftertaste}/5

${brew.flavorNotes ? `【风味】${brew.flavorNotes}` : ''}
${brew.notes ? `【备注】${brew.notes}` : ''}

—— 来自 咖啡日记App`;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('配方文字已复制到剪贴板');
    }).catch(() => {
        showToast('复制失败，请手动复制', 'error');
    });
}

function exportAsImage() {
    showToast('请使用截图工具保存配方卡片图片');
}

function loadSampleData() {
    state.beans = [
        {
            id: 'bean1',
            name: '埃塞俄比亚 耶加雪菲',
            origin: '埃塞俄比亚 · 耶加雪菲',
            process: '水洗',
            roast: '浅烘',
            weight: 200,
            purchaseDate: getRelativeDate(10),
            roastDate: getRelativeDate(12),
            shelfLife: 45,
            isOpened: true,
            openDate: getRelativeDate(5),
            flavorNotes: ['柑橘', '茉莉', '蜂蜜', '柠檬'],
            notes: '入口柔和，花香明显',
            createdAt: getRelativeDate(10)
        },
        {
            id: 'bean2',
            name: '哥伦比亚 薇拉',
            origin: '哥伦比亚 · 薇拉省',
            process: '水洗',
            roast: '中浅烘',
            weight: 227,
            purchaseDate: getRelativeDate(8),
            roastDate: getRelativeDate(10),
            shelfLife: 60,
            isOpened: false,
            openDate: null,
            flavorNotes: ['焦糖', '榛果', '巧克力'],
            notes: '',
            createdAt: getRelativeDate(8)
        },
        {
            id: 'bean3',
            name: '肯尼亚 AA TOP',
            origin: '肯尼亚 · 涅里',
            process: '水洗',
            roast: '中烘',
            weight: 200,
            purchaseDate: getRelativeDate(15),
            roastDate: getRelativeDate(17),
            shelfLife: 45,
            isOpened: true,
            openDate: getRelativeDate(12),
            flavorNotes: ['黑醋栗', '番茄', '红酒'],
            notes: '酸度明亮，层次丰富',
            createdAt: getRelativeDate(15)
        }
    ];
    
    state.brews = [
        {
            id: 'brew1',
            beanId: 'bean1',
            beanAmount: 15,
            waterAmount: 240,
            waterTemp: 92,
            grindSize: '中细',
            equipment: 'V60',
            pourMethod: '三段式',
            brewTime: 150,
            acidity: 4,
            sweetness: 5,
            bitterness: 2,
            body: 3,
            aftertaste: 4,
            flavorNotes: '茉莉花香，柑橘甜感，尾韵干净',
            notes: '水温可以再高1度试试',
            isFavorite: true,
            tds: 1.38,
            outputAmount: 200,
            extractionYield: 18.4,
            createdAt: getRelativeDate(3)
        },
        {
            id: 'brew2',
            beanId: 'bean1',
            beanAmount: 15,
            waterAmount: 240,
            waterTemp: 93,
            grindSize: '中细',
            equipment: 'V60',
            pourMethod: '三段式',
            brewTime: 145,
            acidity: 4,
            sweetness: 4,
            bitterness: 3,
            body: 3,
            aftertaste: 4,
            flavorNotes: '花香更明显，但稍微有点苦',
            notes: '研磨可以再粗一点',
            isFavorite: false,
            tds: null,
            outputAmount: null,
            extractionYield: null,
            createdAt: getRelativeDate(2)
        },
        {
            id: 'brew3',
            beanId: 'bean3',
            beanAmount: 15,
            waterAmount: 225,
            waterTemp: 94,
            grindSize: '中',
            equipment: 'Hario Switch',
            pourMethod: '浸泡法',
            brewTime: 240,
            acidity: 5,
            sweetness: 4,
            bitterness: 3,
            body: 4,
            aftertaste: 5,
            flavorNotes: '黑醋栗和番茄的酸甜感，红酒尾韵',
            notes: '完美！这个参数可以复现',
            isFavorite: true,
            tds: 1.45,
            outputAmount: 185,
            extractionYield: 17.9,
            createdAt: getRelativeDate(5)
        }
    ];
    
    state.cafes = [
        {
            id: 'cafe1',
            name: 'Seesaw Coffee',
            city: '上海',
            address: '静安区南京西路1788号',
            rating: 4,
            specialty: '创意特调，手冲精品豆',
            notes: '环境很好，适合办公',
            createdAt: getRelativeDate(8)
        },
        {
            id: 'cafe2',
            name: 'Manner Coffee',
            city: '上海',
            address: '黄浦区淮海中路333号',
            rating: 3,
            specialty: '高性价比意式咖啡',
            notes: '',
            createdAt: getRelativeDate(7)
        }
    ];
    
    state.checkins = [
        {
            id: 'checkin1',
            cafeId: 'cafe1',
            date: getRelativeDate(3),
            notes: '喝了耶加雪菲手冲'
        },
        {
            id: 'checkin2',
            cafeId: 'cafe1',
            date: getRelativeDate(5),
            notes: '下午茶'
        },
        {
            id: 'checkin3',
            cafeId: 'cafe2',
            date: getRelativeDate(4),
            notes: '早上来杯拿铁'
        }
    ];
    
    saveData();
}

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    
    if (state.beans.length === 0 && state.brews.length === 0 && state.cafes.length === 0) {
        loadSampleData();
    }
    
    initRatingStars();
    renderBeans();
    renderBrews();
    renderCafes();
    updateCurrentDate();
    populateBeanSelects();
    populateRecipeSelects();
    updateConvergenceAnalysis();
    
    setInterval(updateCurrentDate, 60000);
    setInterval(updateBeanCountdowns, 60000);
    
    selectEquipment('v60');
    updateTimerWaterGoal();
    
    document.getElementById('shareRecipe').addEventListener('change', previewShareCard);
    document.getElementById('beanForm').addEventListener('submit', handleBeanSubmit);
    document.getElementById('brewingForm').addEventListener('submit', handleBrewSubmit);
    document.getElementById('cafeForm').addEventListener('submit', handleCafeSubmit);
    
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal-overlay').classList.add('hidden');
        });
    });
    
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.add('hidden');
            }
        });
    });
    
    document.querySelectorAll('.pour-amount, .pour-time').forEach(input => {
        input.addEventListener('input', updateTimerWaterGoal);
    });
    
    calculateExtraction();
    
    setTimeout(() => {
        if (state.brews.length > 0) {
            document.getElementById('shareRecipe').value = state.brews[0].id;
            previewShareCard();
        }
    }, 100);
    
    console.log('☕ 咖啡日记应用已启动');
});
