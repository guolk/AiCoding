const AppState = {
    layers: [],
    currentLayerId: null,
    markers: {},
    destinations: [],
    currentDestinationId: null,
    trips: [],
    currentTripId: null,
    itinerary: {
        name: '',
        startDate: null,
        endDate: null,
        days: []
    },
    currentDayIndex: null,
    categoryFilters: {
        want: true,
        visited: true,
        recommend: true,
        avoid: true
    },
    addingMarker: false,
    prefillMarker: null
};

let map, planningMap, footprintMap;
let yearlyChart;
let mapMarkers = {};
let planningMarkers = [];
let planningPolyline = null;

const CATEGORY_ICONS = {
    want: '⭐',
    visited: '✅',
    recommend: '💎',
    avoid: '⚠️'
};

const CATEGORY_LABELS = {
    want: '想去',
    visited: '已去',
    recommend: '推荐',
    avoid: '避开'
};

const LAYER_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

const STORAGE_KEYS = {
    LAYERS: 'travel_layers',
    MARKERS: 'travel_markers',
    DESTINATIONS: 'travel_destinations',
    TRIPS: 'travel_trips',
    ITINERARY: 'travel_itinerary'
};

function init() {
    loadFromStorage();
    initTabs();
    initMaps();
    initEventListeners();
    renderAll();
    initDemoData();
}

function loadFromStorage() {
    try {
        AppState.layers = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAYERS)) || [];
        AppState.markers = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKERS)) || {};
        AppState.destinations = JSON.parse(localStorage.getItem(STORAGE_KEYS.DESTINATIONS)) || [];
        AppState.trips = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRIPS)) || [];
        AppState.itinerary = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITINERARY)) || {
            name: '',
            startDate: null,
            endDate: null,
            days: []
        };
        
        if (AppState.layers.length > 0) {
            AppState.currentLayerId = AppState.layers[0].id;
        }
    } catch (e) {
        console.error('Error loading from storage:', e);
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEYS.LAYERS, JSON.stringify(AppState.layers));
    localStorage.setItem(STORAGE_KEYS.MARKERS, JSON.stringify(AppState.markers));
    localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(AppState.destinations));
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(AppState.trips));
    localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(AppState.itinerary));
}

function initDemoData() {
    if (AppState.layers.length === 0) {
        generateMockData();
    }
}

function generateMockData() {
    const layer1 = {
        id: generateId(),
        name: '2024欧洲之旅',
        color: LAYER_COLORS[0],
        createdAt: new Date().toISOString()
    };
    const layer2 = {
        id: generateId(),
        name: '日本旅行计划',
        color: LAYER_COLORS[1],
        createdAt: new Date().toISOString()
    };
    const layer3 = {
        id: generateId(),
        name: '国内游足迹',
        color: LAYER_COLORS[2],
        createdAt: new Date().toISOString()
    };
    AppState.layers = [layer1, layer2, layer3];
    AppState.currentLayerId = layer1.id;

    AppState.markers[layer1.id] = [
        {
            id: generateId(),
            name: '巴黎埃菲尔铁塔',
            lat: 48.8584,
            lng: 2.2945,
            category: 'visited',
            type: '景点',
            country: 'France',
            city: '巴黎',
            image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400',
            notes: '建议傍晚时分登塔，可以同时看到白天和夜晚的巴黎景色。',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '罗马斗兽场',
            lat: 41.8902,
            lng: 12.4922,
            category: 'visited',
            type: '古迹',
            country: 'Italy',
            city: '罗马',
            image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400',
            notes: '古罗马文明的象征，建议提前网上购票避免排长队。',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '瑞士少女峰',
            lat: 46.5456,
            lng: 7.9857,
            category: 'visited',
            type: '自然风光',
            country: 'Switzerland',
            city: '因特拉肯',
            image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400',
            notes: '欧洲之巅，火车之旅非常值得体验。',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '巴塞罗那圣家堂',
            lat: 41.4036,
            lng: 2.1744,
            category: 'recommend',
            type: '建筑',
            country: 'Spain',
            city: '巴塞罗那',
            image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400',
            notes: '高迪的杰作，预计2026年完工。',
            createdAt: new Date().toISOString()
        }
    ];

    AppState.markers[layer2.id] = [
        {
            id: generateId(),
            name: '东京浅草寺',
            lat: 35.7148,
            lng: 139.7967,
            category: 'want',
            type: '寺庙',
            country: 'Japan',
            city: '东京',
            image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
            notes: '东京最古老的寺庙，仲见世商业街可以买到特色纪念品。',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '京都伏见稻荷大社',
            lat: 34.9671,
            lng: 135.7727,
            category: 'want',
            type: '神社',
            country: 'Japan',
            city: '京都',
            image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
            notes: '千本鸟居非常震撼，建议清晨前往人少。',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '富士山',
            lat: 35.3606,
            lng: 138.7274,
            category: 'want',
            type: '自然风光',
            country: 'Japan',
            city: '山梨县',
            image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400',
            notes: '建议在河口湖观赏，1-2月能见度最高。',
            createdAt: new Date().toISOString()
        }
    ];

    AppState.markers[layer3.id] = [
        {
            id: generateId(),
            name: '北京故宫',
            lat: 39.9163,
            lng: 116.3972,
            category: 'visited',
            type: '古迹',
            country: 'China',
            city: '北京',
            image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400',
            notes: '建议提前10天网上预约，周一闭馆。',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '上海外滩',
            lat: 31.2304,
            lng: 121.4737,
            category: 'visited',
            type: '地标',
            country: 'China',
            city: '上海',
            image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=400',
            notes: '夜景非常漂亮，建议傍晚来。',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '成都大熊猫基地',
            lat: 30.7209,
            lng: 104.1058,
            category: 'recommend',
            type: '动物园',
            country: 'China',
            city: '成都',
            image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400',
            notes: '早上9点前到，熊猫最活跃。',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '西安兵马俑',
            lat: 34.3861,
            lng: 109.2786,
            category: 'visited',
            type: '古迹',
            country: 'China',
            city: '西安',
            image: 'https://images.unsplash.com/photo-1591018653367-4e9a57e7db8c?w=400',
            notes: '世界第八大奇迹，一定要请讲解。',
            createdAt: new Date().toISOString()
        }
    ];

    AppState.destinations = [
        {
            id: generateId(),
            name: '东京',
            country: '日本',
            priority: 'high',
            bestSeason: '3-5月樱花季，11月红叶季',
            transportation: '国内直飞东京羽田或成田机场，市内交通推荐购买JR Pass',
            accommodation: '推荐住在新宿或涩谷，交通便利',
            mustVisit: '浅草寺、涩谷十字路口、东京塔、明治神宫、台场',
            notes: '交通比较复杂，建议提前下载Google地图，地铁有女性专用车厢',
            budget: {
                transport: 3500,
                accommodation: 4000,
                food: 2500,
                activities: 1500,
                other: 1000,
                total: 12500
            },
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '巴黎',
            country: '法国',
            priority: 'high',
            bestSeason: '4-6月和9-10月，气候宜人',
            transportation: '直飞戴高乐机场，市内地铁方便，建议买Navigo卡',
            accommodation: '建议住在塞纳河沿岸或玛莱区',
            mustVisit: '埃菲尔铁塔、卢浮宫、凡尔赛宫、巴黎圣母院、蒙马特高地',
            notes: '注意小偷，特别是在地铁和景点附近，餐厅小费约10%',
            budget: {
                transport: 6000,
                accommodation: 8000,
                food: 4000,
                activities: 2000,
                other: 2000,
                total: 22000
            },
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '新西兰',
            country: '新西兰',
            priority: 'medium',
            bestSeason: '11-3月是夏季，适合户外活动',
            transportation: '需要转机，建议自驾环岛游',
            accommodation: '房车旅行很受欢迎，也有很多特色民宿',
            mustVisit: '米尔福德峡湾、皇后镇、霍比特人村庄、怀托摩萤火虫洞',
            notes: '需要提前申请签证，紫外线强注意防晒',
            budget: {
                transport: 8000,
                accommodation: 10000,
                food: 5000,
                activities: 6000,
                other: 3000,
                total: 32000
            },
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '冰岛',
            country: '冰岛',
            priority: 'low',
            bestSeason: '6-8月看午夜阳光，12-3月看极光',
            transportation: '直飞雷克雅未克，建议租车环岛',
            accommodation: '雷克雅未克酒店较多，郊区可以住极光小屋',
            mustVisit: '蓝湖温泉、黄金圈、冰川徒步、黑沙滩、极光',
            notes: '物价很高，建议提前预订行程和住宿，天气多变',
            budget: {
                transport: 8000,
                accommodation: 12000,
                food: 6000,
                activities: 8000,
                other: 4000,
                total: 38000
            },
            createdAt: new Date().toISOString()
        }
    ];

    AppState.trips = [
        {
            id: generateId(),
            name: '欧洲四国15日游',
            startDate: '2024-07-10',
            endDate: '2024-07-24',
            locations: ['巴黎', '罗马', '瑞士', '巴塞罗那'],
            plannedBudget: 35000,
            actualBudget: 38000,
            plannedDays: 15,
            actualDays: 15,
            plannedSites: 20,
            actualSites: 18,
            summary: '这次欧洲之旅非常精彩，参观了很多梦寐以求的景点。巴黎的浪漫、罗马的古老、瑞士的纯净、巴塞罗那的热情都给我留下了深刻印象。唯一遗憾是时间太赶，有些地方没能深入体验。下次再来一定要放慢脚步。',
            destinations: [
                { name: '巴黎埃菲尔铁塔', expectedRating: 5, actualRating: 5 },
                { name: '罗马斗兽场', expectedRating: 5, actualRating: 5 },
                { name: '瑞士少女峰', expectedRating: 4, actualRating: 5 },
                { name: '巴塞罗那圣家堂', expectedRating: 4, actualRating: 4 },
                { name: '卢浮宫', expectedRating: 5, actualRating: 4 }
            ],
            photos: [
                { url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400', location: '巴黎埃菲尔铁塔', date: '2024-07-11' },
                { url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400', location: '罗马斗兽场', date: '2024-07-15' },
                { url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400', location: '瑞士少女峰', date: '2024-07-18' },
                { url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400', location: '巴塞罗那圣家堂', date: '2024-07-22' }
            ],
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '成都重庆美食之旅',
            startDate: '2024-05-01',
            endDate: '2024-05-05',
            locations: ['成都', '重庆'],
            plannedBudget: 4000,
            actualBudget: 3500,
            plannedDays: 5,
            actualDays: 5,
            plannedSites: 8,
            actualSites: 10,
            summary: '完美的美食之旅！成都的火锅和串串香让人回味无穷，重庆的夜景和小面也超赞。熊猫基地的大熊猫太可爱了，洪崖洞的夜景真的像千与千寻的场景。性价比很高，推荐！',
            destinations: [
                { name: '成都大熊猫基地', expectedRating: 5, actualRating: 5 },
                { name: '宽窄巷子', expectedRating: 3, actualRating: 4 },
                { name: '重庆洪崖洞', expectedRating: 4, actualRating: 5 },
                { name: '磁器口古镇', expectedRating: 3, actualRating: 3 }
            ],
            photos: [
                { url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400', location: '成都大熊猫基地', date: '2024-05-02' },
                { url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400', location: '成都火锅', date: '2024-05-03' },
                { url: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=400', location: '重庆洪崖洞', date: '2024-05-04' }
            ],
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '北京故宫深度游',
            startDate: '2023-10-01',
            endDate: '2023-10-04',
            locations: ['北京'],
            plannedBudget: 3000,
            actualBudget: 2800,
            plannedDays: 4,
            actualDays: 4,
            plannedSites: 6,
            actualSites: 8,
            summary: '国庆期间的北京秋高气爽，故宫的银杏叶开始变黄，景色很美。虽然人多，但提前预约很顺利。除了故宫，还去了景山公园看故宫全景，以及南锣鼓巷体验老北京风情。',
            destinations: [
                { name: '故宫博物院', expectedRating: 5, actualRating: 5 },
                { name: '天安门广场', expectedRating: 4, actualRating: 4 },
                { name: '景山公园', expectedRating: 3, actualRating: 4 },
                { name: '南锣鼓巷', expectedRating: 3, actualRating: 3 }
            ],
            photos: [
                { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400', location: '故宫角楼', date: '2023-10-02' },
                { url: 'https://images.unsplash.com/photo-1529451505866-d0284a4f9527?w=400', location: '天安门广场', date: '2023-10-01' }
            ],
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            name: '三亚海边度假',
            startDate: '2023-02-10',
            endDate: '2023-02-15',
            locations: ['三亚'],
            plannedBudget: 6000,
            actualBudget: 6500,
            plannedDays: 6,
            actualDays: 6,
            plannedSites: 5,
            actualSites: 7,
            summary: '冬天去三亚避寒太舒服了！亚龙湾的沙滩很软，蜈支洲岛的海水很清。就是春节期间人有点多，价格也贵。下次应该11月或3月去。',
            destinations: [
                { name: '亚龙湾', expectedRating: 4, actualRating: 5 },
                { name: '蜈支洲岛', expectedRating: 4, actualRating: 4 },
                { name: '南山文化旅游区', expectedRating: 3, actualRating: 4 },
                { name: '第一市场海鲜', expectedRating: 4, actualRating: 4 }
            ],
            photos: [
                { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', location: '亚龙湾沙滩', date: '2023-02-11' },
                { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', location: '蜈支洲岛', date: '2023-02-13' }
            ],
            createdAt: new Date().toISOString()
        }
    ];

    saveToStorage();
}

function initTabs() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tab}`);
    });

    if (tab === 'planning' && planningMap) {
        setTimeout(() => planningMap.invalidateSize(), 100);
    }
    if (tab === 'stats') {
        setTimeout(() => {
            if (footprintMap) footprintMap.invalidateSize();
            updateStats();
        }, 100);
    }
}

function initMaps() {
    map = L.map('map').setView([35.8617, 104.1954], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', (e) => {
        if (AppState.addingMarker) {
            showAddMarkerModal(e.latlng.lat, e.latlng.lng);
            AppState.addingMarker = false;
            document.getElementById('addMarkerBtn').style.background = '';
        }
    });

    planningMap = L.map('planningMap').setView([35.8617, 104.1954], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(planningMap);

    planningMap.on('click', (e) => {
        if (AppState.currentDayIndex !== null) {
            showAddStopModal(e.latlng.lat, e.latlng.lng);
        } else {
            showToast('请先选择一个行程日', 'warning');
        }
    });

    footprintMap = L.map('footprintMap').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(footprintMap);
}

function initEventListeners() {
    document.getElementById('addMarkerBtn').addEventListener('click', () => {
        AppState.addingMarker = !AppState.addingMarker;
        const btn = document.getElementById('addMarkerBtn');
        if (AppState.addingMarker) {
            btn.style.background = 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';
            showToast('点击地图添加标注', 'info');
        } else {
            btn.style.background = '';
        }
    });

    document.getElementById('clearMarkersBtn').addEventListener('click', () => {
        if (confirm('确定要清空当前图层的所有标注吗？')) {
            const layerMarkers = AppState.markers[AppState.currentLayerId] || [];
            layerMarkers.forEach(m => {
                if (mapMarkers[m.id]) {
                    map.removeLayer(mapMarkers[m.id]);
                    delete mapMarkers[m.id];
                }
            });
            AppState.markers[AppState.currentLayerId] = [];
            saveToStorage();
            renderMarkerList();
            showToast('已清空当前图层', 'success');
        }
    });

    document.getElementById('addLayerBtn').addEventListener('click', () => {
        showAddLayerModal();
    });

    document.querySelectorAll('.category-filter').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const category = e.target.dataset.category;
            AppState.categoryFilters[category] = e.target.checked;
            renderMarkers();
        });
    });

    document.getElementById('addDestinationBtn').addEventListener('click', () => {
        showAddDestinationModal();
    });

    document.getElementById('prioritySort').addEventListener('change', () => {
        renderWishList();
    });

    document.getElementById('generateDaysBtn').addEventListener('click', () => {
        generateItineraryDays();
    });

    document.getElementById('checkTimingBtn').addEventListener('click', () => {
        checkTiming();
    });

    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        exportToPDF();
    });

    document.getElementById('addTripBtn').addEventListener('click', () => {
        showAddTripModal();
    });

    document.getElementById('resetDemoBtn').addEventListener('click', () => {
        if (confirm('确定要重置所有数据为演示数据吗？当前的所有数据将被清除。')) {
            localStorage.clear();
            AppState.layers = [];
            AppState.markers = {};
            AppState.destinations = [];
            AppState.trips = [];
            AppState.itinerary = { name: '', startDate: null, endDate: null, days: [] };
            AppState.currentLayerId = null;
            AppState.currentDestinationId = null;
            AppState.currentTripId = null;
            AppState.currentDayIndex = null;
            
            Object.values(mapMarkers).forEach(m => map.removeLayer(m));
            mapMarkers = {};
            
            generateMockData();
            renderAll();
            showToast('演示数据已重置', 'success');
        }
    });
}

function renderAll() {
    renderLayers();
    renderMarkers();
    renderMarkerList();
    renderWishList();
    renderDayList();
    renderTripList();
    updateStats();
}

function renderLayers() {
    const container = document.getElementById('layerList');
    container.innerHTML = '';

    AppState.layers.forEach(layer => {
        const div = document.createElement('div');
        div.className = `layer-item ${layer.id === AppState.currentLayerId ? 'active' : ''}`;
        div.innerHTML = `
            <span class="layer-color" style="background: ${layer.color}"></span>
            <span class="layer-name">${escapeHtml(layer.name)}</span>
            <div class="layer-actions">
                <button class="edit-btn" title="编辑图层"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" title="删除图层"><i class="fas fa-trash"></i></button>
            </div>
        `;
        div.addEventListener('click', (e) => {
            if (!e.target.closest('.layer-actions')) {
                AppState.currentLayerId = layer.id;
                renderLayers();
                renderMarkers();
                renderMarkerList();
            }
        });
        div.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showEditLayerModal(layer);
        });
        div.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`确定要删除图层"${layer.name}"吗？所有标注也将被删除。`)) {
                const layerMarkers = AppState.markers[layer.id] || [];
                layerMarkers.forEach(m => {
                    if (mapMarkers[m.id]) {
                        map.removeLayer(mapMarkers[m.id]);
                        delete mapMarkers[m.id];
                    }
                });
                delete AppState.markers[layer.id];
                AppState.layers = AppState.layers.filter(l => l.id !== layer.id);
                if (AppState.currentLayerId === layer.id) {
                    AppState.currentLayerId = AppState.layers[0]?.id || null;
                }
                saveToStorage();
                renderLayers();
                renderMarkers();
                renderMarkerList();
            }
        });
        container.appendChild(div);
    });
}

function renderMarkers() {
    Object.values(mapMarkers).forEach(marker => map.removeLayer(marker));
    mapMarkers = {};

    if (!AppState.currentLayerId) return;

    const layerMarkers = AppState.markers[AppState.currentLayerId] || [];
    
    layerMarkers.forEach(marker => {
        if (!AppState.categoryFilters[marker.category]) return;

        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `<span>${CATEGORY_ICONS[marker.category]}</span>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });

        const mapMarker = L.marker([marker.lat, marker.lng], { icon }).addTo(map);
        
        let popupContent = `
            <div class="marker-popup">
                <h4>${escapeHtml(marker.name)}</h4>
                <div class="popup-type">${CATEGORY_LABELS[marker.category]} · ${escapeHtml(marker.type || '未分类')}</div>
        `;
        
        if (marker.image) {
            popupContent += `<img src="${marker.image}" alt="${escapeHtml(marker.name)}">`;
        }
        
        if (marker.notes) {
            popupContent += `<div class="popup-notes">${escapeHtml(marker.notes)}</div>`;
        }
        
        popupContent += `
            <div style="margin-top: 12px; display: flex; gap: 8px;">
                <button class="btn btn-primary" style="padding: 6px 12px; font-size: 12px;" onclick="editMarker('${marker.id}')">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" onclick="deleteMarker('${marker.id}')">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
            </div>
        `;
        
        mapMarker.bindPopup(popupContent);
        mapMarkers[marker.id] = mapMarker;
    });
}

function renderMarkerList() {
    const container = document.getElementById('markerList');
    container.innerHTML = '';

    if (!AppState.currentLayerId) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">请先创建图层</p>';
        return;
    }

    const layerMarkers = AppState.markers[AppState.currentLayerId] || [];
    
    if (layerMarkers.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无标注，点击"添加标注"开始</p>';
        return;
    }

    layerMarkers.forEach(marker => {
        if (!AppState.categoryFilters[marker.category]) return;

        const div = document.createElement('div');
        div.className = `marker-item ${marker.category}`;
        div.innerHTML = `
            <div class="marker-name">${CATEGORY_ICONS[marker.category]} ${escapeHtml(marker.name)}</div>
            <div class="marker-type">${escapeHtml(marker.type || '未分类')}</div>
        `;
        div.addEventListener('click', () => {
            if (mapMarkers[marker.id]) {
                map.setView([marker.lat, marker.lng], 12);
                mapMarkers[marker.id].openPopup();
            }
        });
        container.appendChild(div);
    });
}

function renderWishList() {
    const container = document.getElementById('wishList');
    container.innerHTML = '';

    if (AppState.destinations.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无目的地，点击"添加目的地"开始</p>';
        return;
    }

    const sortBy = document.getElementById('prioritySort').value;
    let sorted = [...AppState.destinations];
    
    if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === 'name') {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'budget') {
        sorted.sort((a, b) => (a.budget?.total || 0) - (b.budget?.total || 0));
    }

    sorted.forEach(dest => {
        const div = document.createElement('div');
        div.className = `wish-item ${dest.priority}`;
        div.innerHTML = `
            <div class="wish-name">${escapeHtml(dest.name)}</div>
            <div class="wish-meta">
                <span>${getPriorityLabel(dest.priority)}</span>
                <span class="wish-budget">¥${(dest.budget?.total || 0).toLocaleString()}</span>
            </div>
            <div class="wish-actions">
                <button onclick="event.stopPropagation(); editDestination('${dest.id}')"><i class="fas fa-edit"></i></button>
                <button onclick="event.stopPropagation(); deleteDestination('${dest.id}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
        div.addEventListener('click', () => {
            AppState.currentDestinationId = dest.id;
            renderResearchDetail();
        });
        container.appendChild(div);
    });
}

function renderResearchDetail() {
    const container = document.getElementById('researchDetail');
    const dest = AppState.destinations.find(d => d.id === AppState.currentDestinationId);

    if (!dest) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <p>从左侧选择一个目的地查看详情，或点击"添加目的地"开始研究</p>
            </div>
        `;
        return;
    }

    const budget = dest.budget || {};
    const totalBudget = (budget.transport || 0) + (budget.accommodation || 0) + 
                        (budget.food || 0) + (budget.activities || 0) + (budget.other || 0);

    container.innerHTML = `
        <h2>${escapeHtml(dest.name)}</h2>
        <div class="trip-meta">
            <span><i class="fas fa-flag"></i> ${escapeHtml(dest.country || '未知')}</span>
            <span><i class="fas fa-star"></i> ${getPriorityLabel(dest.priority)} 想去</span>
            <span><i class="fas fa-coins"></i> 预算: ¥${totalBudget.toLocaleString()}</span>
        </div>

        <div class="research-section">
            <h4><i class="fas fa-calendar-check"></i> 最佳季节</h4>
            <div class="section-content">${escapeHtml(dest.bestSeason || '暂无记录')}</div>
        </div>

        <div class="research-section">
            <h4><i class="fas fa-plane"></i> 交通方式</h4>
            <div class="section-content">${escapeHtml(dest.transportation || '暂无记录')}</div>
        </div>

        <div class="research-section">
            <h4><i class="fas fa-hotel"></i> 住宿推荐</h4>
            <div class="section-content">${escapeHtml(dest.accommodation || '暂无记录')}</div>
        </div>

        <div class="research-section">
            <h4><i class="fas fa-camera"></i> 必打卡景点</h4>
            <div class="section-content">${escapeHtml(dest.mustVisit || '暂无记录')}</div>
        </div>

        <div class="research-section">
            <h4><i class="fas fa-exclamation-triangle"></i> 注意事项</h4>
            <div class="section-content">${escapeHtml(dest.notes || '暂无记录')}</div>
        </div>

        <div class="research-section">
            <h4><i class="fas fa-coins"></i> 预算估算</h4>
            <div class="budget-breakdown">
                <div class="budget-item">
                    <div class="budget-label">交通</div>
                    <div class="budget-amount">¥${(budget.transport || 0).toLocaleString()}</div>
                </div>
                <div class="budget-item">
                    <div class="budget-label">住宿</div>
                    <div class="budget-amount">¥${(budget.accommodation || 0).toLocaleString()}</div>
                </div>
                <div class="budget-item">
                    <div class="budget-label">餐饮</div>
                    <div class="budget-amount">¥${(budget.food || 0).toLocaleString()}</div>
                </div>
                <div class="budget-item">
                    <div class="budget-label">活动</div>
                    <div class="budget-amount">¥${(budget.activities || 0).toLocaleString()}</div>
                </div>
                <div class="budget-item">
                    <div class="budget-label">其他</div>
                    <div class="budget-amount">¥${(budget.other || 0).toLocaleString()}</div>
                </div>
                <div class="budget-item budget-total">
                    <div class="budget-label">总计</div>
                    <div class="budget-amount">¥${totalBudget.toLocaleString()}</div>
                </div>
            </div>
        </div>

        <div style="margin-top: 30px; display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="editDestination('${dest.id}')">
                <i class="fas fa-edit"></i> 编辑研究笔记
            </button>
            <button class="btn btn-success" onclick="addMarkerFromDestination('${dest.id}')">
                <i class="fas fa-map-marker-alt"></i> 添加到地图
            </button>
        </div>
    `;
}

function renderDayList() {
    const container = document.getElementById('dayList');
    container.innerHTML = '';

    if (AppState.itinerary.days.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">设置行程日期后点击"生成行程日"</p>';
        return;
    }

    AppState.itinerary.days.forEach((day, index) => {
        const div = document.createElement('div');
        div.className = `day-item ${index === AppState.currentDayIndex ? 'active' : ''}`;
        div.innerHTML = `
            <div class="day-number">第 ${index + 1} 天</div>
            <div class="day-date">${formatDate(day.date)}</div>
        `;
        div.addEventListener('click', () => {
            AppState.currentDayIndex = index;
            document.getElementById('currentDayTitle').textContent = `第 ${index + 1} 天 - ${formatDate(day.date)}`;
            renderDayList();
            renderItineraryStops();
            renderPlanningMarkers();
        });
        container.appendChild(div);
    });
}

function renderItineraryStops() {
    const container = document.getElementById('itineraryStops');
    const day = AppState.itinerary.days[AppState.currentDayIndex];

    if (!day || day.stops.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-route"></i>
                <p>在地图上点击添加停留点</p>
            </div>
        `;
        return;
    }

    let html = '';
    day.stops.forEach((stop, index) => {
        html += `
            <div class="stop-item">
                <div class="stop-number">${index + 1}</div>
                <div class="stop-info">
                    <div class="stop-name">${escapeHtml(stop.name)}</div>
                    <div class="stop-time">
                        <span><i class="fas fa-clock"></i> ${stop.arrivalTime || '--:--'} - ${stop.departureTime || '--:--'}</span>
                        <span><i class="fas fa-hourglass-half"></i> ${stop.duration || 0} 小时</span>
                    </div>
                </div>
                <div class="stop-actions">
                    <button class="edit-btn" onclick="editStop(${index})"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteStop(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        if (index < day.stops.length - 1) {
            html += '<div class="stop-connector"></div>';
        }
    });

    container.innerHTML = html;
}

function renderPlanningMarkers() {
    planningMarkers.forEach(m => planningMap.removeLayer(m));
    planningMarkers = [];
    
    if (planningPolyline) {
        planningMap.removeLayer(planningPolyline);
        planningPolyline = null;
    }

    const day = AppState.itinerary.days[AppState.currentDayIndex];
    if (!day || day.stops.length === 0) return;

    const latlngs = [];

    day.stops.forEach((stop, index) => {
        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${index + 1}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });

        const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(planningMap);
        marker.bindPopup(`
            <b>${escapeHtml(stop.name)}</b><br>
            ${stop.arrivalTime || '--:--'} - ${stop.departureTime || '--:--'}<br>
            停留 ${stop.duration || 0} 小时
        `);
        planningMarkers.push(marker);
        latlngs.push([stop.lat, stop.lng]);
    });

    if (latlngs.length > 1) {
        planningPolyline = L.polyline(latlngs, {
            color: '#667eea',
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 10'
        }).addTo(planningMap);
        
        planningMap.fitBounds(planningPolyline.getBounds(), { padding: [50, 50] });
    } else if (latlngs.length === 1) {
        planningMap.setView(latlngs[0], 12);
    }
}

function renderTripList() {
    const container = document.getElementById('tripList');
    container.innerHTML = '';

    if (AppState.trips.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无旅行记录，点击"添加旅行记录"开始</p>';
        return;
    }

    AppState.trips.forEach(trip => {
        const div = document.createElement('div');
        div.className = 'trip-item';
        const avgRating = getAverageRating(trip);
        div.innerHTML = `
            <div class="trip-name">${escapeHtml(trip.name)}</div>
            <div class="trip-dates">${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</div>
            <div class="trip-rating">${renderStars(avgRating)}</div>
        `;
        div.addEventListener('click', () => {
            AppState.currentTripId = trip.id;
            renderTripDetail();
        });
        container.appendChild(div);
    });
}

function renderTripDetail() {
    const container = document.getElementById('tripDetail');
    const trip = AppState.trips.find(t => t.id === AppState.currentTripId);

    if (!trip) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>从左侧选择一个旅行记录查看详情，或点击"添加旅行记录"开始回顾</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <h2>${escapeHtml(trip.name)}</h2>
        <div class="trip-meta">
            <span><i class="fas fa-calendar"></i> ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(trip.locations?.join(', ') || '多个目的地')}</span>
            <span><i class="fas fa-star"></i> ${renderStars(getAverageRating(trip))} ${getAverageRating(trip).toFixed(1)}</span>
        </div>

        <div class="comparison-section">
            <h4><i class="fas fa-exchange-alt"></i> 计划 vs 实际行程对比</h4>
            <div class="comparison-table">
                <div class="header">项目</div>
                <div class="header">计划</div>
                <div class="header">实际</div>
                <div>预算</div>
                <div>¥${(trip.plannedBudget || 0).toLocaleString()}</div>
                <div>¥${(trip.actualBudget || 0).toLocaleString()}</div>
                <div>天数</div>
                <div>${trip.plannedDays || 0} 天</div>
                <div>${trip.actualDays || 0} 天</div>
                <div>景点数量</div>
                <div>${trip.plannedSites || 0} 个</div>
                <div>${trip.actualSites || 0} 个</div>
            </div>
        </div>

        <div class="destination-ratings">
            <h4><i class="fas fa-star"></i> 目的地真实评分</h4>
            ${(trip.destinations || []).map((dest, i) => `
                <div class="rating-item">
                    <span class="destination-name">${escapeHtml(dest.name)}</span>
                    <div class="rating-stars">
                        ${[1,2,3,4,5].map(s => `<span class="star ${s <= dest.expectedRating ? 'filled' : ''}">★</span>`).join('')}
                    </div>
                    <span>→</span>
                    <div class="rating-stars">
                        ${[1,2,3,4,5].map(s => `<span class="star ${s <= dest.actualRating ? 'filled' : ''}">★</span>`).join('')}
                    </div>
                    <span class="rating-diff ${dest.actualRating >= dest.expectedRating ? 'positive' : 'negative'}">
                        ${dest.actualRating >= dest.expectedRating ? '超预期' : '低于预期'}
                    </span>
                </div>
            `).join('')}
        </div>

        <div class="research-section">
            <h4><i class="fas fa-book"></i> 旅行总结</h4>
            <div class="section-content">${escapeHtml(trip.summary || '暂无总结')}</div>
        </div>

        <div class="research-section">
            <h4><i class="fas fa-camera"></i> 旅行照片</h4>
            <div class="photo-gallery">
                ${(trip.photos || []).map(photo => `
                    <div class="photo-item" onclick="viewPhoto('${photo.url}')">
                        <img src="${photo.url}" alt="${escapeHtml(photo.location || '')}">
                        <div class="photo-info">
                            ${escapeHtml(photo.location || '')}<br>
                            <small>${formatDate(photo.date)}</small>
                        </div>
                    </div>
                `).join('')}
                ${(trip.photos || []).length === 0 ? '<p style="color: #999; grid-column: 1/-1; text-align: center; padding: 20px;">暂无照片</p>' : ''}
            </div>
        </div>

        <div style="margin-top: 30px; display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="editTrip('${trip.id}')">
                <i class="fas fa-edit"></i> 编辑旅行记录
            </button>
            <button class="btn btn-danger" onclick="deleteTrip('${trip.id}')">
                <i class="fas fa-trash"></i> 删除旅行记录
            </button>
        </div>
    `;
}

function updateStats() {
    const visitedMarkers = Object.values(AppState.markers).flat().filter(m => m.category === 'visited');
    const countries = new Set(visitedMarkers.map(m => m.country).filter(Boolean));
    const cities = new Set(visitedMarkers.map(m => m.city).filter(Boolean));
    const allMarkers = Object.values(AppState.markers).flat();
    const totalPhotos = AppState.trips.reduce((sum, t) => sum + (t.photos?.length || 0), 0);
    const totalBudget = AppState.trips.reduce((sum, t) => sum + (t.actualBudget || 0), 0);

    document.getElementById('statCountries').textContent = countries.size;
    document.getElementById('statCities').textContent = cities.size;
    document.getElementById('statMarkers').textContent = allMarkers.length;
    document.getElementById('statPhotos').textContent = totalPhotos;
    document.getElementById('statTrips').textContent = AppState.trips.length;
    document.getElementById('statBudget').textContent = `¥${totalBudget.toLocaleString()}`;

    renderFootprintMap(countries);
    renderYearlyChart();
}

function renderFootprintMap(countries) {
    if (!footprintMap) return;

    footprintMap.eachLayer(layer => {
        if (layer instanceof L.GeoJSON) {
            footprintMap.removeLayer(layer);
        }
    });

    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
        .then(response => response.json())
        .then(data => {
            const visitedCountries = Array.from(countries);
            
            L.geoJSON(data, {
                style: function(feature) {
                    const isVisited = visitedCountries.some(c => 
                        feature.properties.ADMIN.includes(c) || c.includes(feature.properties.ADMIN)
                    );
                    return {
                        fillColor: isVisited ? '#667eea' : '#ddd',
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: isVisited ? 0.7 : 0.3
                    };
                },
                onEachFeature: function(feature, layer) {
                    const isVisited = visitedCountries.some(c => 
                        feature.properties.ADMIN.includes(c) || c.includes(feature.properties.ADMIN)
                    );
                    layer.bindPopup(`
                        <b>${feature.properties.ADMIN}</b><br>
                        ${isVisited ? '<span style="color: #28a745;">✅ 已访问</span>' : '<span style="color: #999;">❌ 未访问</span>'}
                    `);
                }
            }).addTo(footprintMap);
        })
        .catch(err => {
            console.error('Error loading country data:', err);
            visitedMarkers.forEach(marker => {
                L.circleMarker([marker.lat, marker.lng], {
                    radius: 8,
                    fillColor: '#667eea',
                    color: 'white',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(footprintMap).bindPopup(marker.name);
            });
        });
}

function renderYearlyChart() {
    const ctx = document.getElementById('yearlyChart').getContext('2d');
    
    if (yearlyChart) {
        yearlyChart.destroy();
    }

    const yearData = {};
    const currentYear = new Date().getFullYear();
    
    for (let i = currentYear - 4; i <= currentYear; i++) {
        yearData[i] = { trips: 0, days: 0 };
    }

    AppState.trips.forEach(trip => {
        const year = new Date(trip.startDate).getFullYear();
        if (yearData[year] !== undefined) {
            yearData[year].trips++;
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            yearData[year].days += days;
        }
    });

    yearlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(yearData),
            datasets: [
                {
                    label: '旅行次数',
                    data: Object.values(yearData).map(d => d.trips),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                },
                {
                    label: '旅行天数',
                    data: Object.values(yearData).map(d => d.days),
                    backgroundColor: 'rgba(118, 75, 162, 0.8)',
                    borderColor: 'rgba(118, 75, 162, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function showModal(options) {
    const container = document.getElementById('modalContainer');
    container.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(event)">
            <div class="modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>${escapeHtml(options.title)}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${options.body}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                    <button class="btn btn-primary" onclick="confirmModal()">确定</button>
                </div>
            </div>
        </div>
    `;

    window.currentModalOptions = options;

    if (options.onShow) {
        setTimeout(options.onShow, 100);
    }
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modalContainer').innerHTML = '';
    window.currentModalOptions = null;
}

function confirmModal() {
    if (window.currentModalOptions?.onConfirm) {
        const result = window.currentModalOptions.onConfirm();
        if (result !== false) {
            closeModal();
        }
    } else {
        closeModal();
    }
}

function initRatingInputs() {
    document.querySelectorAll('.rating-input').forEach(container => {
        const stars = container.querySelectorAll('.star');
        let currentValue = 0;

        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const value = parseInt(star.dataset.value);
                stars.forEach((s, i) => s.classList.toggle('active', i < value));
            });

            star.addEventListener('mouseleave', () => {
                stars.forEach((s, i) => s.classList.toggle('active', i < currentValue));
            });

            star.addEventListener('click', () => {
                currentValue = parseInt(star.dataset.value);
                stars.forEach((s, i) => s.classList.toggle('active', i < currentValue));
            });
        });
    });
}

function addRatingRow() {
    const container = document.getElementById('ratingInputs');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'rating-dest-row';
    div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-end;';
    div.innerHTML = `
        <div style="flex: 1;">
            <label>目的地名称</label>
            <input type="text" class="form-control rating-dest-name" placeholder="例如：浅草寺">
        </div>
        <div style="width: 150px;">
            <label>预期评分</label>
            <div class="rating-input" data-type="expected">
                ${[1,2,3,4,5].map(s => `<span class="star" data-value="${s}">★</span>`).join('')}
            </div>
        </div>
        <div style="width: 150px;">
            <label>实际评分</label>
            <div class="rating-input" data-type="actual">
                ${[1,2,3,4,5].map(s => `<span class="star" data-value="${s}">★</span>`).join('')}
            </div>
        </div>
        <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()" style="padding: 8px 12px;">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
    initRatingInputs();
}

function addEditRatingRow() {
    const container = document.getElementById('editRatingInputs');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'rating-dest-row';
    div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-end;';
    div.innerHTML = `
        <div style="flex: 1;">
            <label>目的地名称</label>
            <input type="text" class="form-control rating-dest-name" placeholder="例如：浅草寺">
        </div>
        <div style="width: 150px;">
            <label>预期评分</label>
            <div class="rating-input" data-type="expected">
                ${[1,2,3,4,5].map(s => `<span class="star" data-value="${s}">★</span>`).join('')}
            </div>
        </div>
        <div style="width: 150px;">
            <label>实际评分</label>
            <div class="rating-input" data-type="actual">
                ${[1,2,3,4,5].map(s => `<span class="star" data-value="${s}">★</span>`).join('')}
            </div>
        </div>
        <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()" style="padding: 8px 12px;">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
    initRatingInputs();
}

function showAddMarkerModal(lat, lng) {
    const prefill = AppState.prefillMarker || {};
    AppState.prefillMarker = null;

    showModal({
        title: '添加标注',
        body: `
            <div class="form-group">
                <label>名称</label>
                <input type="text" id="markerName" class="form-control" placeholder="例如：故宫博物院" value="${escapeHtml(prefill.name || '')}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>纬度</label>
                    <input type="number" step="any" id="markerLat" class="form-control" value="${lat.toFixed(6)}">
                </div>
                <div class="form-group">
                    <label>经度</label>
                    <input type="number" step="any" id="markerLng" class="form-control" value="${lng.toFixed(6)}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>分类</label>
                    <select id="markerCategory" class="form-control">
                        <option value="want" ${prefill.category === 'want' ? 'selected' : ''}>⭐ 想去</option>
                        <option value="visited" ${prefill.category === 'visited' ? 'selected' : ''}>✅ 已去</option>
                        <option value="recommend" ${prefill.category === 'recommend' ? 'selected' : ''}>💎 推荐</option>
                        <option value="avoid" ${prefill.category === 'avoid' ? 'selected' : ''}>⚠️ 避开</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>类型</label>
                    <input type="text" id="markerType" class="form-control" placeholder="例如：景点/美食/购物" value="${escapeHtml(prefill.type || '')}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>国家</label>
                    <input type="text" id="markerCountry" class="form-control" placeholder="例如：中国" value="${escapeHtml(prefill.country || '')}">
                </div>
                <div class="form-group">
                    <label>城市</label>
                    <input type="text" id="markerCity" class="form-control" placeholder="例如：北京">
                </div>
            </div>
            <div class="form-group">
                <label>图片URL</label>
                <input type="url" id="markerImage" class="form-control" placeholder="https://...">
            </div>
            <div class="form-group">
                <label>备注</label>
                <textarea id="markerNotes" class="form-control" placeholder="记录一些重要信息..."></textarea>
            </div>
        `,
        onConfirm: () => {
            const marker = {
                id: generateId(),
                name: document.getElementById('markerName').value,
                lat: parseFloat(document.getElementById('markerLat').value),
                lng: parseFloat(document.getElementById('markerLng').value),
                category: document.getElementById('markerCategory').value,
                type: document.getElementById('markerType').value,
                country: document.getElementById('markerCountry').value,
                city: document.getElementById('markerCity').value,
                image: document.getElementById('markerImage').value,
                notes: document.getElementById('markerNotes').value,
                createdAt: new Date().toISOString()
            };

            if (!marker.name) {
                showToast('请输入标注名称', 'error');
                return false;
            }

            if (!AppState.markers[AppState.currentLayerId]) {
                AppState.markers[AppState.currentLayerId] = [];
            }
            AppState.markers[AppState.currentLayerId].push(marker);
            saveToStorage();
            renderMarkers();
            renderMarkerList();
            updateStats();
            showToast('标注添加成功', 'success');
            return true;
        }
    });
}

function showAddLayerModal() {
    showModal({
        title: '新建图层',
        body: `
            <div class="form-group">
                <label>图层名称</label>
                <input type="text" id="layerName" class="form-control" placeholder="例如：欧洲之旅">
            </div>
            <div class="form-group">
                <label>颜色</label>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${LAYER_COLORS.map((color, i) => `
                        <label style="cursor: pointer;">
                            <input type="radio" name="layerColor" value="${color}" ${i === 0 ? 'checked' : ''} style="display: none;">
                            <div style="width: 30px; height: 30px; border-radius: 50%; background: ${color}; border: 3px solid ${i === 0 ? '#333' : 'transparent'}; transition: all 0.2s ease;" 
                                 onclick="this.previousElementSibling.checked = true; document.querySelectorAll('[name=layerColor]').forEach(r => r.nextElementSibling.style.borderColor = r.checked ? '#333' : 'transparent');"></div>
                        </label>
                    `).join('')}
                </div>
            </div>
        `,
        onConfirm: () => {
            const name = document.getElementById('layerName').value;
            const color = document.querySelector('input[name="layerColor"]:checked').value;

            if (!name) {
                showToast('请输入图层名称', 'error');
                return false;
            }

            const layer = {
                id: generateId(),
                name,
                color,
                createdAt: new Date().toISOString()
            };

            AppState.layers.push(layer);
            AppState.currentLayerId = layer.id;
            saveToStorage();
            renderLayers();
            renderMarkers();
            renderMarkerList();
            showToast('图层创建成功', 'success');
            return true;
        }
    });
}

function showEditLayerModal(layer) {
    showModal({
        title: '编辑图层',
        body: `
            <div class="form-group">
                <label>图层名称</label>
                <input type="text" id="layerName" class="form-control" value="${escapeHtml(layer.name)}">
            </div>
            <div class="form-group">
                <label>颜色</label>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${LAYER_COLORS.map((color, i) => `
                        <label style="cursor: pointer;">
                            <input type="radio" name="layerColor" value="${color}" ${color === layer.color ? 'checked' : ''} style="display: none;">
                            <div style="width: 30px; height: 30px; border-radius: 50%; background: ${color}; border: 3px solid ${color === layer.color ? '#333' : 'transparent'}; transition: all 0.2s ease;" 
                                 onclick="this.previousElementSibling.checked = true; document.querySelectorAll('[name=layerColor]').forEach(r => r.nextElementSibling.style.borderColor = r.checked ? '#333' : 'transparent');"></div>
                        </label>
                    `).join('')}
                </div>
            </div>
        `,
        onConfirm: () => {
            layer.name = document.getElementById('layerName').value;
            layer.color = document.querySelector('input[name="layerColor"]:checked').value;
            saveToStorage();
            renderLayers();
            showToast('图层更新成功', 'success');
            return true;
        }
    });
}

function showAddDestinationModal() {
    showModal({
        title: '添加目的地',
        body: `
            <div class="form-row">
                <div class="form-group">
                    <label>目的地名称</label>
                    <input type="text" id="destName" class="form-control" placeholder="例如：东京">
                </div>
                <div class="form-group">
                    <label>国家</label>
                    <input type="text" id="destCountry" class="form-control" placeholder="例如：日本">
                </div>
            </div>
            <div class="form-group">
                <label>迫切程度</label>
                <select id="destPriority" class="form-control">
                    <option value="high">🔥 非常想去</option>
                    <option value="medium">⭐ 想去</option>
                    <option value="low">📋 以后再说</option>
                </select>
            </div>
            <div class="form-group">
                <label>最佳季节</label>
                <input type="text" id="destSeason" class="form-control" placeholder="例如：3-5月樱花季">
            </div>
            <div class="form-group">
                <label>交通方式</label>
                <textarea id="destTransport" class="form-control" placeholder="如何到达，当地交通..."></textarea>
            </div>
            <div class="form-group">
                <label>住宿推荐</label>
                <textarea id="destAccom" class="form-control" placeholder="推荐的酒店/民宿..."></textarea>
            </div>
            <div class="form-group">
                <label>必打卡景点</label>
                <textarea id="destMustVisit" class="form-control" placeholder="不能错过的景点..."></textarea>
            </div>
            <div class="form-group">
                <label>注意事项</label>
                <textarea id="destNotes" class="form-control" placeholder="签证、货币、礼仪..."></textarea>
            </div>
            <h4 style="margin: 20px 0 15px; color: #667eea;"><i class="fas fa-coins"></i> 预算估算 (元)</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>交通</label>
                    <input type="number" id="budgetTransport" class="form-control" value="0">
                </div>
                <div class="form-group">
                    <label>住宿</label>
                    <input type="number" id="budgetAccom" class="form-control" value="0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>餐饮</label>
                    <input type="number" id="budgetFood" class="form-control" value="0">
                </div>
                <div class="form-group">
                    <label>活动</label>
                    <input type="number" id="budgetActivities" class="form-control" value="0">
                </div>
                <div class="form-group">
                    <label>其他</label>
                    <input type="number" id="budgetOther" class="form-control" value="0">
                </div>
            </div>
        `,
        onConfirm: () => {
            const dest = {
                id: generateId(),
                name: document.getElementById('destName').value,
                country: document.getElementById('destCountry').value,
                priority: document.getElementById('destPriority').value,
                bestSeason: document.getElementById('destSeason').value,
                transportation: document.getElementById('destTransport').value,
                accommodation: document.getElementById('destAccom').value,
                mustVisit: document.getElementById('destMustVisit').value,
                notes: document.getElementById('destNotes').value,
                budget: {
                    transport: parseInt(document.getElementById('budgetTransport').value) || 0,
                    accommodation: parseInt(document.getElementById('budgetAccom').value) || 0,
                    food: parseInt(document.getElementById('budgetFood').value) || 0,
                    activities: parseInt(document.getElementById('budgetActivities').value) || 0,
                    other: parseInt(document.getElementById('budgetOther').value) || 0,
                    total: 0
                },
                createdAt: new Date().toISOString()
            };
            dest.budget.total = dest.budget.transport + dest.budget.accommodation + 
                               dest.budget.food + dest.budget.activities + dest.budget.other;

            if (!dest.name) {
                showToast('请输入目的地名称', 'error');
                return false;
            }

            AppState.destinations.push(dest);
            saveToStorage();
            renderWishList();
            showToast('目的地添加成功', 'success');
            return true;
        }
    });
}

function showAddStopModal(lat, lng) {
    showModal({
        title: '添加停留点',
        body: `
            <div class="form-group">
                <label>地点名称</label>
                <input type="text" id="stopName" class="form-control" placeholder="例如：浅草寺">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>到达时间</label>
                    <input type="time" id="stopArrival" class="form-control" value="09:00">
                </div>
                <div class="form-group">
                    <label>离开时间</label>
                    <input type="time" id="stopDeparture" class="form-control" value="11:00">
                </div>
            </div>
            <div class="form-group">
                <label>预计停留时长 (小时)</label>
                <input type="number" step="0.5" id="stopDuration" class="form-control" value="2">
            </div>
            <div class="form-group">
                <label>备注</label>
                <textarea id="stopNotes" class="form-control" placeholder="门票预约、注意事项..."></textarea>
            </div>
        `,
        onConfirm: () => {
            const stop = {
                id: generateId(),
                name: document.getElementById('stopName').value,
                lat,
                lng,
                arrivalTime: document.getElementById('stopArrival').value,
                departureTime: document.getElementById('stopDeparture').value,
                duration: parseFloat(document.getElementById('stopDuration').value) || 0,
                notes: document.getElementById('stopNotes').value
            };

            if (!stop.name) {
                showToast('请输入地点名称', 'error');
                return false;
            }

            AppState.itinerary.days[AppState.currentDayIndex].stops.push(stop);
            saveToStorage();
            renderItineraryStops();
            renderPlanningMarkers();
            showToast('停留点添加成功', 'success');
            return true;
        }
    });
}

function showAddTripModal() {
    showModal({
        title: '添加旅行记录',
        body: `
            <div class="form-group">
                <label>旅行名称</label>
                <input type="text" id="tripName" class="form-control" placeholder="例如：日本东京7日游">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>开始日期</label>
                    <input type="date" id="tripStart" class="form-control">
                </div>
                <div class="form-group">
                    <label>结束日期</label>
                    <input type="date" id="tripEnd" class="form-control">
                </div>
            </div>
            <div class="form-group">
                <label>目的地 (用逗号分隔)</label>
                <input type="text" id="tripLocations" class="form-control" placeholder="东京,京都,大阪">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>计划预算 (元)</label>
                    <input type="number" id="tripPlanBudget" class="form-control" value="0">
                </div>
                <div class="form-group">
                    <label>实际花费 (元)</label>
                    <input type="number" id="tripActBudget" class="form-control" value="0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>计划天数</label>
                    <input type="number" id="tripPlanDays" class="form-control" value="0">
                </div>
                <div class="form-group">
                    <label>实际天数</label>
                    <input type="number" id="tripActDays" class="form-control" value="0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>计划景点数</label>
                    <input type="number" id="tripPlanSites" class="form-control" value="0">
                </div>
                <div class="form-group">
                    <label>实际景点数</label>
                    <input type="number" id="tripActSites" class="form-control" value="0">
                </div>
            </div>
            <div class="form-group">
                <label>旅行总结</label>
                <textarea id="tripSummary" class="form-control" placeholder="记录这次旅行的感受..."></textarea>
            </div>
            <h4 style="margin: 20px 0 15px; color: #667eea;"><i class="fas fa-map-marker-alt"></i> 目的地评分</h4>
            <div id="ratingInputs">
                <div class="rating-dest-row" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-end;">
                    <div style="flex: 1;">
                        <label>目的地名称</label>
                        <input type="text" class="form-control rating-dest-name" placeholder="例如：浅草寺">
                    </div>
                    <div style="width: 150px;">
                        <label>预期评分</label>
                        <div class="rating-input" data-type="expected">
                            ${[1,2,3,4,5].map(s => `<span class="star" data-value="${s}">★</span>`).join('')}
                        </div>
                    </div>
                    <div style="width: 150px;">
                        <label>实际评分</label>
                        <div class="rating-input" data-type="actual">
                            ${[1,2,3,4,5].map(s => `<span class="star" data-value="${s}">★</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" class="btn btn-secondary" onclick="addRatingRow()" style="margin-bottom: 15px;">
                <i class="fas fa-plus"></i> 添加目的地
            </button>
        `,
        onConfirm: () => {
            const locations = document.getElementById('tripLocations').value.split(',').map(s => s.trim()).filter(Boolean);
            
            const destinations = [];
            document.querySelectorAll('.rating-dest-row').forEach(row => {
                const name = row.querySelector('.rating-dest-name').value;
                if (name) {
                    const expectedStars = row.querySelectorAll('.rating-input[data-type="expected"] .star.active').length;
                    const actualStars = row.querySelectorAll('.rating-input[data-type="actual"] .star.active').length;
                    destinations.push({
                        name,
                        expectedRating: expectedStars,
                        actualRating: actualStars
                    });
                }
            });

            const trip = {
                id: generateId(),
                name: document.getElementById('tripName').value,
                startDate: document.getElementById('tripStart').value,
                endDate: document.getElementById('tripEnd').value,
                locations,
                plannedBudget: parseInt(document.getElementById('tripPlanBudget').value) || 0,
                actualBudget: parseInt(document.getElementById('tripActBudget').value) || 0,
                plannedDays: parseInt(document.getElementById('tripPlanDays').value) || 0,
                actualDays: parseInt(document.getElementById('tripActDays').value) || 0,
                plannedSites: parseInt(document.getElementById('tripPlanSites').value) || 0,
                actualSites: parseInt(document.getElementById('tripActSites').value) || 0,
                summary: document.getElementById('tripSummary').value,
                destinations,
                photos: [],
                createdAt: new Date().toISOString()
            };

            if (!trip.name) {
                showToast('请输入旅行名称', 'error');
                return false;
            }

            AppState.trips.push(trip);
            saveToStorage();
            renderTripList();
            updateStats();
            showToast('旅行记录添加成功', 'success');
            return true;
        },
        onShow: () => {
            initRatingInputs();
        }
    });
}

function editMarker(markerId) {
    const layerMarkers = AppState.markers[AppState.currentLayerId] || [];
    const marker = layerMarkers.find(m => m.id === markerId);
    if (!marker) return;

    showModal({
        title: '编辑标注',
        body: `
            <div class="form-group">
                <label>名称</label>
                <input type="text" id="markerName" class="form-control" value="${escapeHtml(marker.name)}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>分类</label>
                    <select id="markerCategory" class="form-control">
                        <option value="want" ${marker.category === 'want' ? 'selected' : ''}>⭐ 想去</option>
                        <option value="visited" ${marker.category === 'visited' ? 'selected' : ''}>✅ 已去</option>
                        <option value="recommend" ${marker.category === 'recommend' ? 'selected' : ''}>💎 推荐</option>
                        <option value="avoid" ${marker.category === 'avoid' ? 'selected' : ''}>⚠️ 避开</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>类型</label>
                    <input type="text" id="markerType" class="form-control" value="${escapeHtml(marker.type || '')}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>国家</label>
                    <input type="text" id="markerCountry" class="form-control" value="${escapeHtml(marker.country || '')}">
                </div>
                <div class="form-group">
                    <label>城市</label>
                    <input type="text" id="markerCity" class="form-control" value="${escapeHtml(marker.city || '')}">
                </div>
            </div>
            <div class="form-group">
                <label>图片URL</label>
                <input type="url" id="markerImage" class="form-control" value="${escapeHtml(marker.image || '')}">
            </div>
            <div class="form-group">
                <label>备注</label>
                <textarea id="markerNotes" class="form-control">${escapeHtml(marker.notes || '')}</textarea>
            </div>
        `,
        onConfirm: () => {
            marker.name = document.getElementById('markerName').value;
            marker.category = document.getElementById('markerCategory').value;
            marker.type = document.getElementById('markerType').value;
            marker.country = document.getElementById('markerCountry').value;
            marker.city = document.getElementById('markerCity').value;
            marker.image = document.getElementById('markerImage').value;
            marker.notes = document.getElementById('markerNotes').value;
            marker.updatedAt = new Date().toISOString();

            saveToStorage();
            renderMarkers();
            renderMarkerList();
            updateStats();
            showToast('标注更新成功', 'success');
            return true;
        }
    });
}

function deleteMarker(markerId) {
    if (!confirm('确定要删除这个标注吗？')) return;

    const layerMarkers = AppState.markers[AppState.currentLayerId] || [];
    AppState.markers[AppState.currentLayerId] = layerMarkers.filter(m => m.id !== markerId);
    
    if (mapMarkers[markerId]) {
        map.removeLayer(mapMarkers[markerId]);
        delete mapMarkers[markerId];
    }
    
    saveToStorage();
    renderMarkers();
    renderMarkerList();
    updateStats();
    showToast('标注已删除', 'success');
}

function editDestination(destId) {
    const dest = AppState.destinations.find(d => d.id === destId);
    if (!dest) return;

    showModal({
        title: '编辑目的地',
        body: `
            <div class="form-row">
                <div class="form-group">
                    <label>目的地名称</label>
                    <input type="text" id="destName" class="form-control" value="${escapeHtml(dest.name)}">
                </div>
                <div class="form-group">
                    <label>国家</label>
                    <input type="text" id="destCountry" class="form-control" value="${escapeHtml(dest.country || '')}">
                </div>
            </div>
            <div class="form-group">
                <label>迫切程度</label>
                <select id="destPriority" class="form-control">
                    <option value="high" ${dest.priority === 'high' ? 'selected' : ''}>🔥 非常想去</option>
                    <option value="medium" ${dest.priority === 'medium' ? 'selected' : ''}>⭐ 想去</option>
                    <option value="low" ${dest.priority === 'low' ? 'selected' : ''}>📋 以后再说</option>
                </select>
            </div>
            <div class="form-group">
                <label>最佳季节</label>
                <input type="text" id="destSeason" class="form-control" value="${escapeHtml(dest.bestSeason || '')}">
            </div>
            <div class="form-group">
                <label>交通方式</label>
                <textarea id="destTransport" class="form-control">${escapeHtml(dest.transportation || '')}</textarea>
            </div>
            <div class="form-group">
                <label>住宿推荐</label>
                <textarea id="destAccom" class="form-control">${escapeHtml(dest.accommodation || '')}</textarea>
            </div>
            <div class="form-group">
                <label>必打卡景点</label>
                <textarea id="destMustVisit" class="form-control">${escapeHtml(dest.mustVisit || '')}</textarea>
            </div>
            <div class="form-group">
                <label>注意事项</label>
                <textarea id="destNotes" class="form-control">${escapeHtml(dest.notes || '')}</textarea>
            </div>
            <h4 style="margin: 20px 0 15px; color: #667eea;"><i class="fas fa-coins"></i> 预算估算 (元)</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>交通</label>
                    <input type="number" id="budgetTransport" class="form-control" value="${dest.budget?.transport || 0}">
                </div>
                <div class="form-group">
                    <label>住宿</label>
                    <input type="number" id="budgetAccom" class="form-control" value="${dest.budget?.accommodation || 0}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>餐饮</label>
                    <input type="number" id="budgetFood" class="form-control" value="${dest.budget?.food || 0}">
                </div>
                <div class="form-group">
                    <label>活动</label>
                    <input type="number" id="budgetActivities" class="form-control" value="${dest.budget?.activities || 0}">
                </div>
                <div class="form-group">
                    <label>其他</label>
                    <input type="number" id="budgetOther" class="form-control" value="${dest.budget?.other || 0}">
                </div>
            </div>
        `,
        onConfirm: () => {
            dest.name = document.getElementById('destName').value;
            dest.country = document.getElementById('destCountry').value;
            dest.priority = document.getElementById('destPriority').value;
            dest.bestSeason = document.getElementById('destSeason').value;
            dest.transportation = document.getElementById('destTransport').value;
            dest.accommodation = document.getElementById('destAccom').value;
            dest.mustVisit = document.getElementById('destMustVisit').value;
            dest.notes = document.getElementById('destNotes').value;
            dest.budget = {
                transport: parseInt(document.getElementById('budgetTransport').value) || 0,
                accommodation: parseInt(document.getElementById('budgetAccom').value) || 0,
                food: parseInt(document.getElementById('budgetFood').value) || 0,
                activities: parseInt(document.getElementById('budgetActivities').value) || 0,
                other: parseInt(document.getElementById('budgetOther').value) || 0,
                total: 0
            };
            dest.budget.total = dest.budget.transport + dest.budget.accommodation + 
                               dest.budget.food + dest.budget.activities + dest.budget.other;
            dest.updatedAt = new Date().toISOString();

            if (!dest.name) {
                showToast('请输入目的地名称', 'error');
                return false;
            }

            saveToStorage();
            renderWishList();
            renderResearchDetail();
            showToast('目的地更新成功', 'success');
            return true;
        }
    });
}

function deleteDestination(destId) {
    if (!confirm('确定要删除这个目的地吗？')) return;

    AppState.destinations = AppState.destinations.filter(d => d.id !== destId);
    if (AppState.currentDestinationId === destId) {
        AppState.currentDestinationId = null;
    }
    
    saveToStorage();
    renderWishList();
    renderResearchDetail();
    showToast('目的地已删除', 'success');
}

function addMarkerFromDestination(destId) {
    const dest = AppState.destinations.find(d => d.id === destId);
    if (!dest) return;

    if (!AppState.currentLayerId) {
        showToast('请先创建一个图层', 'error');
        return;
    }

    showToast('请在地图上点击选择位置', 'info');
    AppState.addingMarker = true;
    AppState.prefillMarker = {
        name: dest.name,
        country: dest.country,
        type: '景点',
        category: 'want'
    };
    document.getElementById('addMarkerBtn').style.background = 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';
    
    switchTab('map');
}

function editStop(stopIndex) {
    const day = AppState.itinerary.days[AppState.currentDayIndex];
    const stop = day.stops[stopIndex];
    if (!stop) return;

    showModal({
        title: '编辑停留点',
        body: `
            <div class="form-group">
                <label>地点名称</label>
                <input type="text" id="stopName" class="form-control" value="${escapeHtml(stop.name)}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>到达时间</label>
                    <input type="time" id="stopArrival" class="form-control" value="${stop.arrivalTime || ''}">
                </div>
                <div class="form-group">
                    <label>离开时间</label>
                    <input type="time" id="stopDeparture" class="form-control" value="${stop.departureTime || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>预计停留时长 (小时)</label>
                <input type="number" step="0.5" id="stopDuration" class="form-control" value="${stop.duration || 0}">
            </div>
            <div class="form-group">
                <label>备注</label>
                <textarea id="stopNotes" class="form-control">${escapeHtml(stop.notes || '')}</textarea>
            </div>
        `,
        onConfirm: () => {
            stop.name = document.getElementById('stopName').value;
            stop.arrivalTime = document.getElementById('stopArrival').value;
            stop.departureTime = document.getElementById('stopDeparture').value;
            stop.duration = parseFloat(document.getElementById('stopDuration').value) || 0;
            stop.notes = document.getElementById('stopNotes').value;

            if (!stop.name) {
                showToast('请输入地点名称', 'error');
                return false;
            }

            saveToStorage();
            renderItineraryStops();
            renderPlanningMarkers();
            showToast('停留点更新成功', 'success');
            return true;
        }
    });
}

function deleteStop(stopIndex) {
    if (!confirm('确定要删除这个停留点吗？')) return;

    const day = AppState.itinerary.days[AppState.currentDayIndex];
    day.stops.splice(stopIndex, 1);
    
    saveToStorage();
    renderItineraryStops();
    renderPlanningMarkers();
    showToast('停留点已删除', 'success');
}

function generateItineraryDays() {
    const name = document.getElementById('tripName').value;
    const startDate = document.getElementById('tripStartDate').value;
    const endDate = document.getElementById('tripEndDate').value;

    if (!startDate || !endDate) {
        showToast('请选择开始和结束日期', 'error');
        return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
        showToast('结束日期不能早于开始日期', 'error');
        return;
    }

    const days = [];
    const current = new Date(start);
    while (current <= end) {
        days.push({
            date: current.toISOString().split('T')[0],
            stops: []
        });
        current.setDate(current.getDate() + 1);
    }

    AppState.itinerary = {
        name,
        startDate,
        endDate,
        days
    };
    AppState.currentDayIndex = 0;

    document.getElementById('currentDayTitle').textContent = `第 1 天 - ${formatDate(days[0].date)}`;
    
    saveToStorage();
    renderDayList();
    renderItineraryStops();
    renderPlanningMarkers();
    showToast(`已生成 ${days.length} 天行程`, 'success');
}

function checkTiming() {
    const day = AppState.itinerary.days[AppState.currentDayIndex];
    if (!day || day.stops.length === 0) {
        showToast('当前行程日没有停留点', 'warning');
        return;
    }

    const warningEl = document.getElementById('timingWarning');
    let warnings = [];
    let totalDuration = 0;
    let isTooTight = false;

    day.stops.forEach((stop, index) => {
        totalDuration += stop.duration || 0;
        
        if (index < day.stops.length - 1 && stop.departureTime && day.stops[index + 1].arrivalTime) {
            const dep = stop.departureTime.split(':').map(Number);
            const arr = day.stops[index + 1].arrivalTime.split(':').map(Number);
            const depMin = dep[0] * 60 + dep[1];
            const arrMin = arr[0] * 60 + arr[1];
            const gap = arrMin - depMin;
            
            if (gap < 30) {
                warnings.push(`"${stop.name}" 到 "${day.stops[index + 1].name}" 之间只有 ${gap} 分钟，时间过于紧张`);
                isTooTight = true;
            } else if (gap < 60) {
                warnings.push(`"${stop.name}" 到 "${day.stops[index + 1].name}" 之间只有 ${gap} 分钟，建议预留更多交通时间`);
            }
        }
    });

    if (totalDuration > 12) {
        warnings.push(`当天总活动时长 ${totalDuration} 小时，建议控制在 10 小时以内避免过于疲劳`);
        isTooTight = true;
    } else if (totalDuration > 10) {
        warnings.push(`当天总活动时长 ${totalDuration} 小时，行程较满，注意休息`);
    }

    if (warnings.length === 0) {
        warnings.push('时间安排合理，行程松紧适度！');
    }

    warningEl.style.display = 'block';
    warningEl.className = `timing-warning ${isTooTight ? 'warning' : 'success'}`;
    warningEl.innerHTML = `
        <h4><i class="fas ${isTooTight ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> 时间合理性评估</h4>
        <ul style="margin: 0; padding-left: 20px;">
            ${warnings.map(w => `<li>${w}</li>`).join('')}
        </ul>
    `;
}

async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const day = AppState.itinerary.days[AppState.currentDayIndex];
    
    if (!day) {
        showToast('请先选择行程日', 'error');
        return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = 20;

    pdf.setFontSize(20);
    pdf.setTextColor(102, 126, 234);
    pdf.text(AppState.itinerary.name || '行程单', pageWidth / 2, y, { align: 'center' });
    y += 10;

    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`第 ${AppState.currentDayIndex + 1} 天 - ${formatDate(day.date)}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    if (day.stops.length === 0) {
        pdf.setFontSize(12);
        pdf.setTextColor(128, 128, 128);
        pdf.text('暂无行程安排', pageWidth / 2, y, { align: 'center' });
    } else {
        day.stops.forEach((stop, index) => {
            if (y > pageHeight - 30) {
                pdf.addPage();
                y = 20;
            }

            pdf.setFillColor(102, 126, 234);
            pdf.roundedRect(15, y - 5, 25, 25, 3, 3, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(14);
            pdf.text(String(index + 1), 27.5, y + 10, { align: 'center' });

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(14);
            pdf.text(stop.name, 50, y);
            y += 7;

            pdf.setFontSize(10);
            pdf.setTextColor(128, 128, 128);
            const timeStr = `${stop.arrivalTime || '--:--'} - ${stop.departureTime || '--:--'} | 停留 ${stop.duration || 0} 小时`;
            pdf.text(timeStr, 50, y);
            y += 7;

            if (stop.notes) {
                pdf.setFontSize(9);
                pdf.setTextColor(100, 100, 100);
                const splitNotes = pdf.splitTextToSize(stop.notes, pageWidth - 60);
                pdf.text(splitNotes, 50, y);
                y += splitNotes.length * 5;
            }

            y += 10;

            if (index < day.stops.length - 1) {
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.5);
                pdf.line(27.5, y - 15, 27.5, y - 5);
            }
        });
    }

    pdf.setFontSize(8);
    pdf.setTextColor(180, 180, 180);
    pdf.text('生成时间: ' + new Date().toLocaleString('zh-CN'), pageWidth / 2, pageHeight - 10, { align: 'center' });

    const filename = `行程单_第${AppState.currentDayIndex + 1}天_${day.date}.pdf`;
    pdf.save(filename);
    
    showToast('PDF导出成功', 'success');
}

function editTrip(tripId) {
    const trip = AppState.trips.find(t => t.id === tripId);
    if (!trip) return;

    showModal({
        title: '编辑旅行记录',
        body: `
            <div class="form-group">
                <label>旅行名称</label>
                <input type="text" id="tripName" class="form-control" value="${escapeHtml(trip.name)}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>开始日期</label>
                    <input type="date" id="tripStart" class="form-control" value="${trip.startDate || ''}">
                </div>
                <div class="form-group">
                    <label>结束日期</label>
                    <input type="date" id="tripEnd" class="form-control" value="${trip.endDate || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>目的地 (用逗号分隔)</label>
                <input type="text" id="tripLocations" class="form-control" value="${escapeHtml(trip.locations?.join(', ') || '')}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>计划预算 (元)</label>
                    <input type="number" id="tripPlanBudget" class="form-control" value="${trip.plannedBudget || 0}">
                </div>
                <div class="form-group">
                    <label>实际花费 (元)</label>
                    <input type="number" id="tripActBudget" class="form-control" value="${trip.actualBudget || 0}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>计划天数</label>
                    <input type="number" id="tripPlanDays" class="form-control" value="${trip.plannedDays || 0}">
                </div>
                <div class="form-group">
                    <label>实际天数</label>
                    <input type="number" id="tripActDays" class="form-control" value="${trip.actualDays || 0}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>计划景点数</label>
                    <input type="number" id="tripPlanSites" class="form-control" value="${trip.plannedSites || 0}">
                </div>
                <div class="form-group">
                    <label>实际景点数</label>
                    <input type="number" id="tripActSites" class="form-control" value="${trip.actualSites || 0}">
                </div>
            </div>
            <div class="form-group">
                <label>旅行总结</label>
                <textarea id="tripSummary" class="form-control">${escapeHtml(trip.summary || '')}</textarea>
            </div>
            <h4 style="margin: 20px 0 15px; color: #667eea;"><i class="fas fa-map-marker-alt"></i> 目的地评分</h4>
            <div id="editRatingInputs">
                ${(trip.destinations || []).map((dest, i) => `
                    <div class="rating-dest-row" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-end;">
                        <div style="flex: 1;">
                            <label>目的地名称</label>
                            <input type="text" class="form-control rating-dest-name" value="${escapeHtml(dest.name)}">
                        </div>
                        <div style="width: 150px;">
                            <label>预期评分</label>
                            <div class="rating-input" data-type="expected" data-value="${dest.expectedRating}">
                                ${[1,2,3,4,5].map(s => `<span class="star ${s <= dest.expectedRating ? 'active' : ''}" data-value="${s}">★</span>`).join('')}
                            </div>
                        </div>
                        <div style="width: 150px;">
                            <label>实际评分</label>
                            <div class="rating-input" data-type="actual" data-value="${dest.actualRating}">
                                ${[1,2,3,4,5].map(s => `<span class="star ${s <= dest.actualRating ? 'active' : ''}" data-value="${s}">★</span>`).join('')}
                            </div>
                        </div>
                        <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()" style="padding: 8px 12px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <button type="button" class="btn btn-secondary" onclick="addEditRatingRow()" style="margin-bottom: 15px;">
                <i class="fas fa-plus"></i> 添加目的地
            </button>
        `,
        onConfirm: () => {
            trip.name = document.getElementById('tripName').value;
            trip.startDate = document.getElementById('tripStart').value;
            trip.endDate = document.getElementById('tripEnd').value;
            trip.locations = document.getElementById('tripLocations').value.split(',').map(s => s.trim()).filter(Boolean);
            trip.plannedBudget = parseInt(document.getElementById('tripPlanBudget').value) || 0;
            trip.actualBudget = parseInt(document.getElementById('tripActBudget').value) || 0;
            trip.plannedDays = parseInt(document.getElementById('tripPlanDays').value) || 0;
            trip.actualDays = parseInt(document.getElementById('tripActDays').value) || 0;
            trip.plannedSites = parseInt(document.getElementById('tripPlanSites').value) || 0;
            trip.actualSites = parseInt(document.getElementById('tripActSites').value) || 0;
            trip.summary = document.getElementById('tripSummary').value;

            const destinations = [];
            document.querySelectorAll('#editRatingInputs .rating-dest-row').forEach(row => {
                const name = row.querySelector('.rating-dest-name').value;
                if (name) {
                    const expectedStars = row.querySelectorAll('.rating-input[data-type="expected"] .star.active').length;
                    const actualStars = row.querySelectorAll('.rating-input[data-type="actual"] .star.active').length;
                    destinations.push({
                        name,
                        expectedRating: expectedStars,
                        actualRating: actualStars
                    });
                }
            });
            trip.destinations = destinations;
            trip.updatedAt = new Date().toISOString();

            if (!trip.name) {
                showToast('请输入旅行名称', 'error');
                return false;
            }

            saveToStorage();
            renderTripList();
            renderTripDetail();
            updateStats();
            showToast('旅行记录更新成功', 'success');
            return true;
        },
        onShow: () => {
            initRatingInputs();
        }
    });
}

function deleteTrip(tripId) {
    if (!confirm('确定要删除这个旅行记录吗？')) return;

    AppState.trips = AppState.trips.filter(t => t.id !== tripId);
    if (AppState.currentTripId === tripId) {
        AppState.currentTripId = null;
    }
    
    saveToStorage();
    renderTripList();
    renderTripDetail();
    updateStats();
    showToast('旅行记录已删除', 'success');
}

function viewPhoto(url) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4000;
        cursor: pointer;
    `;
    modal.innerHTML = `
        <img src="${url}" style="max-width: 90%; max-height: 90%; object-fit: contain;">
    `;
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
}

function getPriorityLabel(priority) {
    const labels = { high: '🔥 非常想去', medium: '⭐ 想去', low: '📋 以后再说' };
    return labels[priority] || priority;
}

function renderStars(count) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= Math.round(count) ? '<span style="color: #f39c12;">★</span>' : '<span style="color: #ddd;">★</span>';
    }
    return stars;
}

function getAverageRating(trip) {
    if (!trip.destinations || trip.destinations.length === 0) return 0;
    const sum = trip.destinations.reduce((acc, d) => acc + (d.actualRating || 0), 0);
    return sum / trip.destinations.length;
}

function showToast(message, type = 'info') {
    const colors = {
        success: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        error: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
        warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', init);
