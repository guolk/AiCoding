const API_BASE = '/api';
let currentModule = 'dashboard';
let currentRidesPage = 1;
let charts = {};
let maps = {};
let heatmapLayer = null;

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span class="toast-message">${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function showLoading(btn) {
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> 处理中...';
    btn.dataset.originalText = originalText;
}

function hideLoading(btn) {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText;
}

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initStatsTabs();
    initFilters();
    loadDashboard();
});

function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const module = item.dataset.module;
            switchModule(module);
        });
    });
}

function initStatsTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchStatsTab(tab);
        });
    });
}

function initFilters() {
    const currentYear = new Date().getFullYear();
    const yearSelect = document.getElementById('ride-year-filter');
    const monthSelect = document.getElementById('ride-month-filter');
    const statsYearSelect = document.getElementById('stats-year');
    
    for (let y = currentYear; y >= currentYear - 5; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y + '年';
        yearSelect.appendChild(opt.cloneNode(true));
        statsYearSelect.appendChild(opt.cloneNode(true));
    }
    
    for (let m = 1; m <= 12; m++) {
        const opt = document.createElement('option');
        opt.value = m.toString().padStart(2, '0');
        opt.textContent = m + '月';
        monthSelect.appendChild(opt);
    }
    
    statsYearSelect.value = currentYear;
}

function switchModule(module) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.module === module);
    });
    
    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`module-${module}`).classList.add('active');
    
    const titles = {
        dashboard: '数据概览',
        rides: '骑行记录',
        statistics: '统计分析',
        equipment: '装备管理',
        routes: '路线规划',
        goals: '骑行目标'
    };
    document.getElementById('page-title').textContent = titles[module];
    
    currentModule = module;
    
    switch(module) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'rides':
            loadRides();
            break;
        case 'statistics':
            loadMonthlyStats();
            loadYearlyStats();
            loadRecords();
            break;
        case 'equipment':
            loadEquipment();
            loadMaintenance();
            break;
        case 'routes':
            loadRoutes();
            break;
        case 'goals':
            loadYearlyGoals();
            loadChallenges();
            break;
    }
}

function switchStatsTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`stats-${tab}`).classList.add('active');
    
    if (tab === 'heatmap') {
        setTimeout(() => loadFullHeatmap(), 100);
    }
}

async function fetchAPI(url, options = {}) {
    try {
        const response = await fetch(API_BASE + url, options);
        return await response.json();
    } catch (err) {
        console.error('API Error:', err);
        return null;
    }
}

function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatNumber(num, decimals = 1) {
    return num ? num.toFixed(decimals) : '0';
}

function renderStars(rating) {
    return '★'.repeat(rating || 0) + '☆'.repeat(5 - (rating || 0));
}

// ==================== 数据概览 ====================

async function loadDashboard() {
    const records = await fetchAPI('/statistics/records');
    if (records) {
        document.getElementById('total-rides').textContent = records.totals.total_rides || 0;
        document.getElementById('total-distance').textContent = formatNumber(records.totals.total_distance);
        document.getElementById('total-elevation').textContent = formatNumber(records.totals.total_elevation, 0);
        document.getElementById('total-duration').textContent = formatNumber((records.totals.total_duration || 0) / 60, 1);
        
        document.getElementById('record-speed').textContent = formatNumber(records.records.fastest_speed.value) + ' km/h';
        document.getElementById('record-distance').textContent = formatNumber(records.records.longest_distance.value) + ' km';
        document.getElementById('record-elevation').textContent = formatNumber(records.records.highest_elevation.value, 0) + ' m';
        document.getElementById('record-duration').textContent = formatDuration(records.records.longest_duration.value);
    }
    
    loadMonthlyChart();
    loadYearlyGoalsProgress();
    loadMaintenanceAlerts();
    
    setTimeout(() => loadDashboardHeatmap(), 100);
}

function loadMonthlyChart() {
    const ctx = document.getElementById('monthly-chart');
    if (!ctx) return;
    
    const year = new Date().getFullYear();
    
    fetchAPI(`/statistics/monthly?year=${year}`).then(data => {
        if (!data) return;
        
        const labels = data.months.map(m => m.month.slice(-2) + '月');
        const distances = data.months.map(m => m.total_distance);
        const elevations = data.months.map(m => m.total_elevation);
        
        if (charts.monthly) {
            charts.monthly.destroy();
        }
        
        charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: '里程 (km)',
                        data: distances,
                        backgroundColor: 'rgba(76, 175, 80, 0.7)',
                        borderColor: '#4CAF50',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: '爬升 (m)',
                        data: elevations,
                        type: 'line',
                        borderColor: '#FF9800',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        yAxisID: 'y1',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: '里程 (km)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: '爬升 (m)' },
                        grid: { drawOnChartArea: false }
                    }
                },
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });
    });
}

async function loadYearlyGoalsProgress() {
    const goals = await fetchAPI('/goals/yearly');
    const container = document.getElementById('yearly-goals-progress');
    
    if (!goals || goals.goals.length === 0) {
        container.innerHTML = '<p style="color: #718096;">暂无年度目标</p>';
        return;
    }
    
    container.innerHTML = goals.goals.map(goal => `
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 500;">${goal.year}年目标</span>
                <span>${formatNumber(goal.progress.distance)} / ${goal.target_distance} km (${formatNumber(goal.progress.distance_percentage)}%)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${goal.progress.distance_percentage >= 100 ? 'good' : goal.progress.distance_percentage >= 50 ? 'warning' : 'danger'}" 
                     style="width: ${Math.min(goal.progress.distance_percentage, 100)}%;"></div>
            </div>
        </div>
    `).join('');
}

async function loadMaintenanceAlerts() {
    const data = await fetchAPI('/maintenance/upcoming');
    const container = document.getElementById('maintenance-alerts');
    
    if (!data || data.upcoming.length === 0) {
        container.innerHTML = '<p style="color: #48bb78;">✓ 所有装备状态良好</p>';
        return;
    }
    
    container.innerHTML = data.upcoming.slice(0, 5).map(item => `
        <div style="padding: 12px; background: ${item.status === 'due' ? '#fff5f5' : '#fffaf0'}; border-radius: 8px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 500;">${item.equipment_name} - ${item.component_name}</div>
                    <div style="font-size: 12px; color: #718096;">
                        剩余 ${formatNumber(Math.max(0, item.remaining_mileage))} km
                    </div>
                </div>
                <span class="badge ${item.status === 'due' ? 'badge-danger' : 'badge-warning'}">
                    ${item.status === 'due' ? '需更换' : '即将到期'}
                </span>
            </div>
        </div>
    `).join('');
}

async function loadDashboardHeatmap() {
    const data = await fetchAPI('/statistics/heatmap');
    if (!data) return;
    
    const container = document.getElementById('heatmap-container');
    if (!container || maps.heatmap) return;
    
    maps.heatmap = L.map('heatmap-container').setView([39.9042, 116.4074], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(maps.heatmap);
    
    if (data.heatmapPoints.length > 0) {
        if (typeof L.heatLayer === 'function' && !window.heatmapUnavailable) {
            heatmapLayer = L.heatLayer(data.heatmapPoints, {
                radius: 20,
                blur: 15,
                maxZoom: 15,
                gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
            }).addTo(maps.heatmap);
        } else {
            data.heatmapPoints.forEach(p => {
                L.circleMarker([p[0], p[1]], {
                    radius: 5,
                    fillColor: '#4CAF50',
                    color: '#4CAF50',
                    weight: 1,
                    opacity: 0.6,
                    fillOpacity: 0.4
                }).addTo(maps.heatmap);
            });
        }
    }
}

// ==================== 骑行记录 ====================

async function loadRides(page = 1) {
    const year = document.getElementById('ride-year-filter').value;
    const month = document.getElementById('ride-month-filter').value;
    
    let url = `/rides?page=${page}&limit=10`;
    if (year) url += `&year=${year}`;
    if (month) url += `&month=${month}`;
    
    const data = await fetchAPI(url);
    if (!data) return;
    
    currentRidesPage = page;
    
    const tbody = document.getElementById('rides-table-body');
    tbody.innerHTML = data.rides.map(ride => `
        <tr>
            <td>${ride.date}</td>
            <td>${formatNumber(ride.distance)} km</td>
            <td>${formatDuration(ride.duration)}</td>
            <td>${formatNumber(ride.elevation, 0)} m</td>
            <td>${formatNumber(ride.avg_speed)} km/h</td>
            <td>${ride.avg_heart_rate || '-'}</td>
            <td><span class="badge badge-info">${ride.ride_type || '-'}</span></td>
            <td>${ride.gpx_data ? '<span style="color: #48bb78;">✓ 有</span>' : '<span style="color: #a0aec0;">-</span>'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="showRidePhotos(${ride.id})">📷</button>
            </td>
            <td class="action-btns">
                <button class="btn btn-sm btn-secondary" onclick="showRideDetail(${ride.id})">查看</button>
                <button class="btn btn-sm btn-danger" onclick="deleteRide(${ride.id})">删除</button>
            </td>
        </tr>
    `).join('');
    
    const totalPages = Math.ceil(data.total / data.limit);
    const pagination = document.getElementById('rides-pagination');
    let paginationHtml = '';
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<button class="${i === page ? 'active' : ''}" onclick="loadRides(${i})">${i}</button>`;
    }
    pagination.innerHTML = paginationHtml;
}

function showAddRideModal() {
    const today = new Date().toISOString().split('T')[0];
    showModal(`
        <div class="modal-header">
            <h3>添加骑行记录</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <form id="ride-form" class="modal-body">
            <div class="form-grid">
                <div class="form-group">
                    <label>日期 *</label>
                    <input type="date" name="date" value="${today}" required>
                </div>
                <div class="form-group">
                    <label>骑行类型</label>
                    <select name="ride_type">
                        <option value="">请选择</option>
                        <option value="通勤">通勤</option>
                        <option value="休闲骑">休闲骑</option>
                        <option value="训练">训练</option>
                        <option value="挑战">挑战</option>
                        <option value="比赛">比赛</option>
                    </select>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>距离 (公里) *</label>
                    <input type="number" name="distance" step="0.1" required>
                </div>
                <div class="form-group">
                    <label>时长 (分钟) *</label>
                    <input type="number" name="duration" required>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>爬升 (米)</label>
                    <input type="number" name="elevation" step="1">
                </div>
                <div class="form-group">
                    <label>平均速度 (km/h)</label>
                    <input type="number" name="avg_speed" step="0.1">
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>最高速度 (km/h)</label>
                    <input type="number" name="max_speed" step="0.1">
                </div>
                <div class="form-group">
                    <label>平均心率</label>
                    <input type="number" name="avg_heart_rate">
                </div>
            </div>
            <div class="form-group">
                <label>GPX轨迹文件</label>
                <input type="file" name="gpx" accept=".gpx">
            </div>
            <div class="form-group">
                <label>备注</label>
                <textarea name="notes" rows="3"></textarea>
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="submitRide()">保存</button>
        </div>
    `);
}

async function submitRide() {
    const form = document.getElementById('ride-form');
    const date = form.querySelector('[name="date"]').value;
    const distance = form.querySelector('[name="distance"]').value;
    const duration = form.querySelector('[name="duration"]').value;
    
    if (!date) {
        showToast('请选择骑行日期', 'error');
        return;
    }
    if (!distance || distance <= 0) {
        showToast('请输入有效的骑行距离', 'error');
        return;
    }
    if (!duration || duration <= 0) {
        showToast('请输入有效的骑行时间', 'error');
        return;
    }
    
    const submitBtn = event.target.closest('.modal-footer').querySelector('.btn-primary');
    showLoading(submitBtn);
    
    const formData = new FormData(form);
    
    try {
        const response = await fetch(API_BASE + '/rides', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.id) {
            closeModal();
            loadRides(currentRidesPage);
            if (currentModule === 'dashboard') {
                loadDashboard();
            }
            showToast('骑行记录已添加成功！', 'success');
        } else {
            showToast('添加失败: ' + (result.error || '未知错误'), 'error');
        }
    } catch (err) {
        showToast('添加失败: ' + err.message, 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

async function showRideDetail(id) {
    const ride = await fetchAPI(`/rides/${id}`);
    if (!ride) return;
    
    let gpxContent = '';
    let slopeContent = '';
    
    if (ride.gpx_data && ride.gpx_data.points) {
        gpxContent = `
            <div class="form-group">
                <label>轨迹地图</label>
                <div id="ride-map" class="map-container"></div>
            </div>
            ${ride.gpx_data.slopeData ? `
            <div class="form-group">
                <label>坡度分布</label>
                <div class="slope-chart-container">
                    <canvas id="slope-chart"></canvas>
                </div>
            </div>
            ` : ''}
        `;
    }
    
    showModal(`
        <div class="modal-header">
            <h3>骑行详情 - ${ride.date}</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
            <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 20px;">
                <div class="stat-card" style="padding: 16px;">
                    <div class="stat-info">
                        <h3 style="font-size: 20px;">${formatNumber(ride.distance)}</h3>
                        <p>里程 (km)</p>
                    </div>
                </div>
                <div class="stat-card" style="padding: 16px;">
                    <div class="stat-info">
                        <h3 style="font-size: 20px;">${formatDuration(ride.duration)}</h3>
                        <p>时长</p>
                    </div>
                </div>
                <div class="stat-card" style="padding: 16px;">
                    <div class="stat-info">
                        <h3 style="font-size: 20px;">${formatNumber(ride.elevation, 0)}</h3>
                        <p>爬升 (m)</p>
                    </div>
                </div>
                <div class="stat-card" style="padding: 16px;">
                    <div class="stat-info">
                        <h3 style="font-size: 20px;">${formatNumber(ride.avg_speed)}</h3>
                        <p>均速 (km/h)</p>
                    </div>
                </div>
            </div>
            
            ${gpxContent}
            
            <div class="form-group">
                <label>上传照片</label>
                <input type="file" id="photo-upload" accept="image/*" multiple onchange="uploadPhotos(${ride.id})">
            </div>
            
            ${ride.photos && ride.photos.length > 0 ? `
            <div class="form-group">
                <label>照片相册</label>
                <div class="photo-gallery">
                    ${ride.photos.map(p => `<div class="photo-item"><img src="${p.filepath}" alt="${p.filename}"></div>`).join('')}
                </div>
            </div>
            ` : ''}
            
            ${ride.notes ? `
            <div class="form-group">
                <label>备注</label>
                <p style="padding: 12px; background: #f7fafc; border-radius: 8px;">${ride.notes}</p>
            </div>
            ` : ''}
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
        </div>
    `);
    
    setTimeout(() => {
        if (ride.gpx_data && ride.gpx_data.points) {
            renderRideMap(ride.gpx_data);
            if (ride.gpx_data.slopeData) {
                renderSlopeChart(ride.gpx_data.slopeData);
            }
        }
    }, 100);
}

function renderRideMap(gpxData) {
    if (!document.getElementById('ride-map')) return;
    
    const map = L.map('ride-map').setView(gpxData.bounds.center, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
    
    const latlngs = gpxData.points.map(p => [p.lat, p.lon]);
    L.polyline(latlngs, { color: '#4CAF50', weight: 4, opacity: 0.8 }).addTo(map);
    
    map.fitBounds([
        [gpxData.bounds.south, gpxData.bounds.west],
        [gpxData.bounds.north, gpxData.bounds.east]
    ]);
}

function renderSlopeChart(slopeData) {
    const ctx = document.getElementById('slope-chart');
    if (!ctx || slopeData.length === 0) return;
    
    const labels = slopeData.map(s => formatNumber(s.distance) + 'km');
    const slopes = slopeData.map(s => s.slope);
    const elevations = slopeData.map(s => s.elevation);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: '坡度 (%)',
                    data: slopes,
                    backgroundColor: slopes.map(s => 
                        s > 8 ? '#f56565' : s > 4 ? '#ed8936' : s > 0 ? '#48bb78' : '#4299e1'
                    ),
                    yAxisID: 'y'
                },
                {
                    label: '海拔 (m)',
                    data: elevations,
                    type: 'line',
                    borderColor: '#805ad5',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    yAxisID: 'y1',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: '坡度 (%)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: '海拔 (m)' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

async function uploadPhotos(rideId) {
    const input = document.getElementById('photo-upload');
    const formData = new FormData();
    
    Array.from(input.files).forEach(file => {
        formData.append('photo', file);
    });
    
    try {
        const response = await fetch(API_BASE + `/rides/${rideId}/photos`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.photos) {
            showToast('照片上传成功！', 'success');
            showRideDetail(rideId);
        } else {
            showToast('上传失败', 'error');
        }
    } catch (err) {
        showToast('上传失败: ' + err.message, 'error');
    }
}

async function showRidePhotos(id) {
    const ride = await fetchAPI(`/rides/${id}`);
    if (!ride) return;
    
    if (!ride.photos || ride.photos.length === 0) {
        showToast('暂无照片', 'info');
        return;
    }
    
    showModal(`
        <div class="modal-header">
            <h3>骑行照片 - ${ride.date}</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
            <div class="photo-gallery">
                ${ride.photos.map(p => `
                    <div class="photo-item">
                        <img src="${p.filepath}" alt="${p.filename}" onclick="window.open('${p.filepath}', '_blank')">
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
        </div>
    `);
}

async function deleteRide(id) {
    const confirmed = await showConfirm('确定要删除这条骑行记录吗？此操作不可撤销。', null, '删除骑行记录');
    if (!confirmed) return;
    
    try {
        const result = await fetchAPI(`/rides/${id}`, { method: 'DELETE' });
        if (result) {
            loadRides(currentRidesPage);
            if (currentModule === 'dashboard') {
                loadDashboard();
            }
            showToast('骑行记录已删除', 'success');
        } else {
            showToast('删除失败', 'error');
        }
    } catch (err) {
        showToast('删除失败: ' + err.message, 'error');
    }
}

// ==================== 统计分析 ====================

async function loadMonthlyStats() {
    const year = document.getElementById('stats-year').value;
    const data = await fetchAPI(`/statistics/monthly?year=${year}`);
    if (!data) return;
    
    const totalDistance = data.months.reduce((sum, m) => sum + m.total_distance, 0);
    const totalElevation = data.months.reduce((sum, m) => sum + m.total_elevation, 0);
    const totalRides = data.months.reduce((sum, m) => sum + m.ride_count, 0);
    
    document.getElementById('monthly-total-distance').textContent = formatNumber(totalDistance);
    document.getElementById('monthly-total-elevation').textContent = formatNumber(totalElevation, 0);
    document.getElementById('monthly-total-rides').textContent = totalRides;
    document.getElementById('monthly-avg-distance').textContent = formatNumber(totalRides > 0 ? totalDistance / totalRides : 0);
    
    const labels = data.months.map(m => m.month.slice(-2) + '月');
    const distances = data.months.map(m => m.total_distance);
    const elevations = data.months.map(m => m.total_elevation);
    const rideCounts = data.months.map(m => m.ride_count);
    
    const distCtx = document.getElementById('monthly-distance-chart');
    if (distCtx) {
        if (charts.distance) charts.distance.destroy();
        charts.distance = new Chart(distCtx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: '里程 (km)',
                    data: distances,
                    backgroundColor: 'rgba(76, 175, 80, 0.7)',
                    borderColor: '#4CAF50'
                }]
            },
            options: { responsive: true }
        });
    }
    
    const eleCtx = document.getElementById('monthly-elevation-chart');
    if (eleCtx) {
        if (charts.elevation) charts.elevation.destroy();
        charts.elevation = new Chart(eleCtx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: '爬升 (m)',
                    data: elevations,
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true }
        });
    }
}

async function loadYearlyStats() {
    const data = await fetchAPI('/statistics/yearly');
    if (!data) return;
    
    const tbody = document.getElementById('yearly-stats-body');
    tbody.innerHTML = data.years.map(y => `
        <tr>
            <td style="font-weight: 600;">${y.year}</td>
            <td>${y.ride_count}</td>
            <td>${formatNumber(y.total_distance)} km</td>
            <td>${formatNumber(y.total_elevation, 0)} m</td>
            <td>${formatDuration(y.total_duration)}</td>
            <td>${formatNumber(y.ride_count > 0 ? y.total_distance / y.ride_count : 0)} km</td>
        </tr>
    `).join('');
}

async function loadRecords() {
    const data = await fetchAPI('/statistics/records');
    if (!data) return;
    
    document.getElementById('detail-record-speed').textContent = formatNumber(data.records.fastest_speed.value) + ' km/h';
    document.getElementById('detail-record-speed-date').textContent = data.records.fastest_speed.ride?.date || '-';
    
    document.getElementById('detail-record-distance').textContent = formatNumber(data.records.longest_distance.value) + ' km';
    document.getElementById('detail-record-distance-date').textContent = data.records.longest_distance.ride?.date || '-';
    
    document.getElementById('detail-record-elevation').textContent = formatNumber(data.records.highest_elevation.value, 0) + ' m';
    document.getElementById('detail-record-elevation-date').textContent = data.records.highest_elevation.ride?.date || '-';
    
    document.getElementById('detail-record-duration').textContent = formatDuration(data.records.longest_duration.value);
}

async function loadFullHeatmap() {
    const data = await fetchAPI('/statistics/heatmap');
    if (!data) return;
    
    if (maps.fullHeatmap) {
        maps.fullHeatmap.remove();
    }
    
    maps.fullHeatmap = L.map('full-heatmap').setView([39.9042, 116.4074], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(maps.fullHeatmap);
    
    if (data.heatmapPoints.length > 0) {
        if (typeof L.heatLayer === 'function' && !window.heatmapUnavailable) {
            L.heatLayer(data.heatmapPoints, {
                radius: 25,
                blur: 20,
                maxZoom: 15,
                gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
            }).addTo(maps.fullHeatmap);
        } else {
            data.heatmapPoints.forEach(p => {
                L.circleMarker([p[0], p[1]], {
                    radius: 6,
                    fillColor: '#4CAF50',
                    color: '#4CAF50',
                    weight: 1,
                    opacity: 0.6,
                    fillOpacity: 0.4
                }).addTo(maps.fullHeatmap);
            });
        }
    }
}

// ==================== 装备管理 ====================

async function loadEquipment() {
    const data = await fetchAPI('/equipment');
    if (!data) return;
    
    const container = document.getElementById('equipment-grid');
    container.innerHTML = data.equipment.map(item => `
        <div class="equipment-card">
            <div class="equipment-header">
                <div>
                    <div class="equipment-name">${item.name}</div>
                    <div class="equipment-type">${item.type} | ${item.brand || '-'} ${item.model || ''}</div>
                </div>
                <span class="badge badge-info">${item.type}</span>
            </div>
            <div class="equipment-stats">
                <div class="equipment-stat">
                    <div class="equipment-stat-label">总里程</div>
                    <div class="equipment-stat-value">${formatNumber(item.total_mileage)} km</div>
                </div>
                <div class="equipment-stat">
                    <div class="equipment-stat-label">重量</div>
                    <div class="equipment-stat-value">${item.weight ? item.weight + ' kg' : '-'}</div>
                </div>
                <div class="equipment-stat">
                    <div class="equipment-stat-label">购入日期</div>
                    <div class="equipment-stat-value" style="font-size: 13px;">${item.purchase_date || '-'}</div>
                </div>
                <div class="equipment-stat">
                    <div class="equipment-stat-label">购入价格</div>
                    <div class="equipment-stat-value">${item.purchase_price ? '¥' + item.purchase_price : '-'}</div>
                </div>
            </div>
            ${item.components && item.components.length > 0 ? `
            <div class="component-list">
                <div style="font-weight: 500; margin-bottom: 8px;">零件状态</div>
                ${item.components.map(comp => `
                    <div class="component-item">
                        <span>${comp.component_name}</span>
                        <span style="font-size: 12px;">
                            ${formatNumber(comp.used_mileage)} / ${comp.lifespan_mileage} km
                        </span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${comp.status}" 
                             style="width: ${Math.min((comp.used_mileage / comp.lifespan_mileage) * 100, 100)}%;"></div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-secondary" onclick="showAddComponentModal(${item.id})">添加零件</button>
                <button class="btn btn-sm btn-primary" onclick="showMaintenanceModal(${item.id})">记录保养</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEquipment(${item.id})">删除</button>
            </div>
        </div>
    `).join('');
}

async function deleteEquipment(id) {
    const confirmed = await showConfirm('确定要删除该装备吗？相关的零件和保养记录也会被删除，此操作不可撤销。', null, '删除装备');
    if (!confirmed) return;
    
    try {
        const result = await fetchAPI(`/equipment/${id}`, { method: 'DELETE' });
        if (result) {
            loadEquipment();
            loadMaintenance();
            showToast('装备已删除', 'success');
        } else {
            showToast('删除失败', 'error');
        }
    } catch (err) {
        showToast('删除失败: ' + err.message, 'error');
    }
}

async function loadMaintenance() {
    const data = await fetchAPI('/maintenance/upcoming');
    if (!data) return;
    
    const tbody = document.getElementById('maintenance-table-body');
    tbody.innerHTML = data.upcoming.map(item => `
        <tr>
            <td>${item.equipment_name}</td>
            <td>${item.component_name}</td>
            <td>${formatNumber(item.used_mileage)} km</td>
            <td>${formatNumber(Math.max(0, item.remaining_mileage))} km</td>
            <td>
                <span class="badge ${item.status === 'due' ? 'badge-danger' : item.status === 'warning' ? 'badge-warning' : 'badge-success'}">
                    ${item.status === 'due' ? '需更换' : item.status === 'warning' ? '即将到期' : '状态良好'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="showMaintenanceModal(${item.equipment_id}, ${item.id})">记录保养</button>
            </td>
        </tr>
    `).join('');
    
    if (data.upcoming.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #48bb78;">✓ 所有零件状态良好，暂无保养需求</td></tr>';
    }
}

function showAddEquipmentModal() {
    showModal(`
        <div class="modal-header">
            <h3>添加装备</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <form id="equipment-form" class="modal-body">
            <div class="form-grid">
                <div class="form-group">
                    <label>名称 *</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>类型 *</label>
                    <select name="type" required>
                        <option value="">请选择</option>
                        <option value="公路车">公路车</option>
                        <option value="山地车">山地车</option>
                        <option value="折叠车">折叠车</option>
                        <option value="配件">配件</option>
                        <option value="其他">其他</option>
                    </select>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>品牌</label>
                    <input type="text" name="brand">
                </div>
                <div class="form-group">
                    <label>型号</label>
                    <input type="text" name="model">
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>购入日期</label>
                    <input type="date" name="purchase_date">
                </div>
                <div class="form-group">
                    <label>购入价格 (元)</label>
                    <input type="number" name="purchase_price" step="0.01">
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>重量 (kg)</label>
                    <input type="number" name="weight" step="0.01">
                </div>
            </div>
            <div class="form-group">
                <label>备注</label>
                <textarea name="notes" rows="3"></textarea>
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="submitEquipment()">保存</button>
        </div>
    `);
}

async function submitEquipment() {
    const form = document.getElementById('equipment-form');
    const name = form.querySelector('[name="name"]').value;
    const type = form.querySelector('[name="type"]').value;
    
    if (!name || name.trim() === '') {
        showToast('请输入装备名称', 'error');
        return;
    }
    if (!type) {
        showToast('请选择装备类型', 'error');
        return;
    }
    
    const submitBtn = event.target.closest('.modal-footer').querySelector('.btn-primary');
    showLoading(submitBtn);
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        const result = await fetchAPI('/equipment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (result && result.id) {
            closeModal();
            loadEquipment();
            showToast('装备已添加成功！', 'success');
        } else {
            showToast('添加失败: ' + (result?.error || '未知错误'), 'error');
        }
    } catch (err) {
        showToast('添加失败: ' + err.message, 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

function showAddComponentModal(equipmentId) {
    showModal(`
        <div class="modal-header">
            <h3>添加零件</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <form id="component-form" class="modal-body">
            <input type="hidden" name="equipment_id" value="${equipmentId}">
            <div class="form-group">
                <label>零件名称 *</label>
                <input type="text" name="component_name" required placeholder="如：链条、外胎、刹车片">
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>安装日期</label>
                    <input type="date" name="installed_date">
                </div>
                <div class="form-group">
                    <label>使用寿命 (公里) *</label>
                    <input type="number" name="lifespan_mileage" required>
                </div>
            </div>
            <div class="form-group">
                <label>备注</label>
                <textarea name="notes" rows="2"></textarea>
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="submitComponent()">保存</button>
        </div>
    `);
}

async function submitComponent() {
    const form = document.getElementById('component-form');
    const componentName = form.querySelector('[name="component_name"]').value;
    const lifespan = form.querySelector('[name="lifespan_mileage"]').value;
    
    if (!componentName || componentName.trim() === '') {
        showToast('请输入零件名称', 'error');
        return;
    }
    if (!lifespan || lifespan <= 0) {
        showToast('请输入有效的使用寿命', 'error');
        return;
    }
    
    const submitBtn = event.target.closest('.modal-footer').querySelector('.btn-primary');
    showLoading(submitBtn);
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const equipmentId = data.equipment_id;
    delete data.equipment_id;
    
    try {
        const result = await fetchAPI(`/equipment/${equipmentId}/components`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (result) {
            closeModal();
            loadEquipment();
            loadMaintenance();
            showToast('零件已添加成功！', 'success');
        } else {
            showToast('添加失败', 'error');
        }
    } catch (err) {
        showToast('添加失败: ' + err.message, 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

function showMaintenanceModal(equipmentId, componentId = null) {
    const today = new Date().toISOString().split('T')[0];
    showModal(`
        <div class="modal-header">
            <h3>记录保养</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <form id="maintenance-form" class="modal-body">
            <input type="hidden" name="equipment_id" value="${equipmentId}">
            <input type="hidden" name="component_id" value="${componentId || ''}">
            <div class="form-grid">
                <div class="form-group">
                    <label>保养类型 *</label>
                    <select name="maintenance_type" required>
                        <option value="">请选择</option>
                        <option value="cleaning">清洁</option>
                        <option value="lubrication">润滑</option>
                        <option value="adjustment">调试</option>
                        <option value="replacement">更换零件</option>
                        <option value="repair">维修</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>日期 *</label>
                    <input type="date" name="date" value="${today}" required>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>当前里程 (km)</label>
                    <input type="number" name="mileage" step="0.1">
                </div>
                <div class="form-group">
                    <label>费用 (元)</label>
                    <input type="number" name="cost" step="0.01">
                </div>
            </div>
            <div class="form-group">
                <label>备注</label>
                <textarea name="notes" rows="3"></textarea>
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="submitMaintenance()">保存</button>
        </div>
    `);
}

async function submitMaintenance() {
    const form = document.getElementById('maintenance-form');
    const maintenanceType = form.querySelector('[name="maintenance_type"]').value;
    const date = form.querySelector('[name="maintenance_date"]').value;
    const mileage = form.querySelector('[name="current_mileage"]').value;
    
    if (!maintenanceType) {
        showToast('请选择保养类型', 'error');
        return;
    }
    if (!date) {
        showToast('请选择保养日期', 'error');
        return;
    }
    if (!mileage || mileage < 0) {
        showToast('请输入有效的当前里程', 'error');
        return;
    }
    
    const submitBtn = event.target.closest('.modal-footer').querySelector('.btn-primary');
    showLoading(submitBtn);
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    if (!data.component_id) delete data.component_id;
    
    try {
        const result = await fetchAPI('/maintenance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (result) {
            closeModal();
            loadEquipment();
            loadMaintenance();
            showToast('保养记录已保存成功！', 'success');
        } else {
            showToast('保存失败', 'error');
        }
    } catch (err) {
        showToast('保存失败: ' + err.message, 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

// ==================== 路线规划 ====================

async function loadRoutes() {
    const category = document.getElementById('route-category-filter').value;
    let url = '/routes';
    if (category) url += `?category=${category}`;
    
    const data = await fetchAPI(url);
    if (!data) return;
    
    const container = document.getElementById('routes-grid');
    container.innerHTML = data.routes.map(route => `
        <div class="route-card">
            <div class="route-map" id="route-map-${route.id}"></div>
            <div class="route-info">
                <div class="route-name">${route.name}</div>
                <span class="route-category">${route.category}</span>
                <div class="route-stats">
                    <div class="route-stat">
                        <div class="route-stat-value">${formatNumber(route.distance)}</div>
                        <div class="route-stat-label">里程 (km)</div>
                    </div>
                    <div class="route-stat">
                        <div class="route-stat-value">${formatNumber(route.elevation, 0)}</div>
                        <div class="route-stat-label">爬升 (m)</div>
                    </div>
                </div>
                <div class="route-ratings">
                    <span>难度: <span class="rating-stars">${renderStars(route.difficulty_rating)}</span></span>
                    <span>风景: <span class="rating-stars">${renderStars(route.scenery_rating)}</span></span>
                </div>
                <div style="margin-top: 16px; display: flex; gap: 8px;">
                    <button class="btn btn-sm btn-secondary" onclick="showRouteDetail(${route.id})">查看详情</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRoute(${route.id})">删除</button>
                </div>
            </div>
        </div>
    `).join('');
    
    setTimeout(() => {
        data.routes.forEach(route => {
            if (route.gpx_data && route.gpx_data.bounds) {
                renderRouteMiniMap(route.id, route.gpx_data);
            }
        });
    }, 100);
}

function renderRouteMiniMap(routeId, gpxData) {
    const container = document.getElementById(`route-map-${routeId}`);
    if (!container) return;
    
    const map = L.map(container, { zoomControl: false, attributionControl: false }).setView(gpxData.bounds.center, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    const latlngs = gpxData.points.map(p => [p.lat, p.lon]);
    L.polyline(latlngs, { color: '#667eea', weight: 3 }).addTo(map);
    
    map.fitBounds([
        [gpxData.bounds.south, gpxData.bounds.west],
        [gpxData.bounds.north, gpxData.bounds.east]
    ]);
}

function showAddRouteModal() {
    showModal(`
        <div class="modal-header">
            <h3>添加路线</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <form id="route-form" class="modal-body">
            <div class="form-grid">
                <div class="form-group">
                    <label>路线名称 *</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>分类 *</label>
                    <select name="category" required>
                        <option value="">请选择</option>
                        <option value="通勤">通勤路线</option>
                        <option value="休闲">休闲路线</option>
                        <option value="挑战">挑战路线</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>GPX文件 *</label>
                <input type="file" name="gpx" accept=".gpx" required>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>难度评分</label>
                    <select name="difficulty_rating">
                        <option value="">请选择</option>
                        ${[1,2,3,4,5].map(n => `<option value="${n}">${renderStars(n)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>风景评分</label>
                    <select name="scenery_rating">
                        <option value="">请选择</option>
                        ${[1,2,3,4,5].map(n => `<option value="${n}">${renderStars(n)}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>备注</label>
                <textarea name="notes" rows="3"></textarea>
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="submitRoute()">保存</button>
        </div>
    `);
}

async function submitRoute() {
    const form = document.getElementById('route-form');
    const name = form.querySelector('[name="name"]').value;
    const category = form.querySelector('[name="category"]').value;
    
    if (!name || name.trim() === '') {
        showToast('请输入路线名称', 'error');
        return;
    }
    if (!category) {
        showToast('请选择路线分类', 'error');
        return;
    }
    
    const submitBtn = event.target.closest('.modal-footer').querySelector('.btn-primary');
    showLoading(submitBtn);
    
    const formData = new FormData(form);
    
    try {
        const response = await fetch(API_BASE + '/routes', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.id) {
            closeModal();
            loadRoutes();
            showToast('路线已保存成功！', 'success');
        } else {
            showToast('保存失败: ' + (result.error || '未知错误'), 'error');
        }
    } catch (err) {
        showToast('保存失败: ' + err.message, 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

async function showRouteDetail(id) {
    const route = await fetchAPI(`/routes/${id}`);
    if (!route) return;
    
    let mapContent = '';
    let slopeContent = '';
    
    if (route.gpx_data && route.gpx_data.points) {
        mapContent = `
            <div class="form-group">
                <label>路线地图</label>
                <div id="route-detail-map" class="map-container"></div>
            </div>
            ${route.gpx_data.slopeData ? `
            <div class="form-group">
                <label>坡度分布</label>
                <div class="slope-chart-container">
                    <canvas id="route-slope-chart"></canvas>
                </div>
            </div>
            ` : ''}
        `;
    }
    
    showModal(`
        <div class="modal-header">
            <h3>${route.name}</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
            <div style="margin-bottom: 16px;">
                <span class="badge badge-info">${route.category}</span>
            </div>
            <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 20px;">
                <div class="stat-card" style="padding: 16px;">
                    <div class="stat-info">
                        <h3 style="font-size: 20px;">${formatNumber(route.distance)}</h3>
                        <p>里程 (km)</p>
                    </div>
                </div>
                <div class="stat-card" style="padding: 16px;">
                    <div class="stat-info">
                        <h3 style="font-size: 20px;">${formatNumber(route.elevation, 0)}</h3>
                        <p>爬升 (m)</p>
                    </div>
                </div>
                <div class="stat-card" style="padding: 16px;">
                    <div class="stat-info">
                        <h3 style="font-size: 20px;" class="rating-stars">${renderStars(route.difficulty_rating)}</h3>
                        <p>难度</p>
                    </div>
                </div>
                <div class="stat-card" style="padding: 16px;">
                    <div class="stat-info">
                        <h3 style="font-size: 20px;" class="rating-stars">${renderStars(route.scenery_rating)}</h3>
                        <p>风景</p>
                    </div>
                </div>
            </div>
            
            ${mapContent}
            
            ${route.notes ? `
            <div class="form-group">
                <label>备注</label>
                <p style="padding: 12px; background: #f7fafc; border-radius: 8px;">${route.notes}</p>
            </div>
            ` : ''}
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
        </div>
    `);
    
    setTimeout(() => {
        if (route.gpx_data && route.gpx_data.points) {
            const map = L.map('route-detail-map').setView(route.gpx_data.bounds.center, 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);
            
            const latlngs = route.gpx_data.points.map(p => [p.lat, p.lon]);
            L.polyline(latlngs, { color: '#667eea', weight: 4 }).addTo(map);
            
            map.fitBounds([
                [route.gpx_data.bounds.south, route.gpx_data.bounds.west],
                [route.gpx_data.bounds.north, route.gpx_data.bounds.east]
            ]);
            
            if (route.gpx_data.slopeData) {
                renderSlopeChart(route.gpx_data.slopeData);
            }
        }
    }, 100);
}

async function deleteRoute(id) {
    const confirmed = await showConfirm('确定要删除这条路线吗？此操作不可撤销。', null, '删除路线');
    if (!confirmed) return;
    
    try {
        const result = await fetchAPI(`/routes/${id}`, { method: 'DELETE' });
        if (result) {
            loadRoutes();
            showToast('路线已删除', 'success');
        } else {
            showToast('删除失败', 'error');
        }
    } catch (err) {
        showToast('删除失败: ' + err.message, 'error');
    }
}

// ==================== 骑行目标 ====================

async function loadYearlyGoals() {
    const data = await fetchAPI('/goals/yearly');
    if (!data) return;
    
    const container = document.getElementById('yearly-goals-list');
    container.innerHTML = data.goals.map(goal => `
        <div class="goal-card">
            <div class="goal-header">
                <div class="goal-year">${goal.year}年</div>
                <span class="badge ${goal.progress.distance_percentage >= 100 ? 'badge-success' : 'badge-info'}">
                    ${goal.progress.distance_percentage >= 100 ? '已完成' : '进行中'}
                </span>
            </div>
            <div class="goal-progress-item">
                <div class="goal-progress-header">
                    <span class="goal-progress-label">🎯 里程目标</span>
                    <span class="goal-progress-value">${formatNumber(goal.progress.distance)} / ${goal.target_distance} km</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${goal.progress.distance_percentage >= 100 ? 'good' : goal.progress.distance_percentage >= 50 ? 'warning' : 'danger'}" 
                         style="width: ${Math.min(goal.progress.distance_percentage, 100)}%;"></div>
                </div>
                <div style="text-align: right; font-size: 12px; color: #718096; margin-top: 4px;">
                    ${formatNumber(goal.progress.distance_percentage)}% 完成
                </div>
            </div>
            ${goal.target_elevation ? `
            <div class="goal-progress-item">
                <div class="goal-progress-header">
                    <span class="goal-progress-label">⛰️ 爬升目标</span>
                    <span class="goal-progress-value">${formatNumber(goal.progress.elevation, 0)} / ${goal.target_elevation} m</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${goal.progress.elevation_percentage >= 100 ? 'good' : goal.progress.elevation_percentage >= 50 ? 'warning' : 'danger'}" 
                         style="width: ${Math.min(goal.progress.elevation_percentage, 100)}%;"></div>
                </div>
                <div style="text-align: right; font-size: 12px; color: #718096; margin-top: 4px;">
                    ${formatNumber(goal.progress.elevation_percentage)}% 完成
                </div>
            </div>
            ` : ''}
            ${goal.target_rides ? `
            <div class="goal-progress-item">
                <div class="goal-progress-header">
                    <span class="goal-progress-label">🚴 骑行次数</span>
                    <span class="goal-progress-value">${goal.progress.rides} / ${goal.target_rides} 次</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${goal.progress.rides_percentage >= 100 ? 'good' : goal.progress.rides_percentage >= 50 ? 'warning' : 'danger'}" 
                         style="width: ${Math.min(goal.progress.rides_percentage, 100)}%;"></div>
                </div>
                <div style="text-align: right; font-size: 12px; color: #718096; margin-top: 4px;">
                    ${formatNumber(goal.progress.rides_percentage)}% 完成
                </div>
            </div>
            ` : ''}
        </div>
    `).join('');
    
    if (data.goals.length === 0) {
        container.innerHTML = '<p style="color: #718096; grid-column: 1 / -1; text-align: center; padding: 40px;">暂无年度目标，点击上方按钮设置</p>';
    }
}

async function loadChallenges() {
    const data = await fetchAPI('/challenges');
    if (!data) return;
    
    const container = document.getElementById('challenges-list');
    container.innerHTML = data.challenges.map(challenge => `
        <div class="challenge-card ${challenge.progress.completed ? 'completed' : ''}">
            <div class="challenge-header">
                <div>
                    <div class="challenge-name">${challenge.name}</div>
                    <div class="challenge-type">${challenge.type === 'streak' ? '连续骑行挑战' : '里程挑战'}</div>
                </div>
                <span class="badge ${challenge.progress.completed ? 'badge-success' : 'badge-info'}">
                    ${challenge.progress.completed ? '✓ 已完成' : '进行中'}
                </span>
            </div>
            <div class="challenge-dates">
                ${challenge.start_date} ~ ${challenge.end_date}
            </div>
            ${challenge.description ? `<p style="color: #718096; margin-bottom: 16px;">${challenge.description}</p>` : ''}
            <div class="challenge-progress">
                <div class="challenge-progress-text">
                    <span>进度</span>
                    <span>${formatNumber(challenge.progress.current)} / ${challenge.target_value} ${challenge.type === 'streak' ? '天' : 'km'}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${challenge.progress.completed ? 'good' : challenge.progress.percentage >= 50 ? 'warning' : 'danger'}" 
                         style="width: ${Math.min(challenge.progress.percentage, 100)}%;"></div>
                </div>
                <div style="text-align: right; font-size: 12px; color: #718096; margin-top: 4px;">
                    ${formatNumber(challenge.progress.percentage)}% 完成 · ${challenge.progress.ride_count} 次骑行
                </div>
            </div>
        </div>
    `).join('');
    
    if (data.challenges.length === 0) {
        container.innerHTML = '<p style="color: #718096; grid-column: 1 / -1; text-align: center; padding: 40px;">暂无挑战，点击上方按钮创建</p>';
    }
}

function showAddYearlyGoalModal() {
    const currentYear = new Date().getFullYear();
    showModal(`
        <div class="modal-header">
            <h3>设置年度目标</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <form id="yearly-goal-form" class="modal-body">
            <div class="form-grid">
                <div class="form-group">
                    <label>年份 *</label>
                    <input type="number" name="year" value="${currentYear}" min="2020" max="2030" required>
                </div>
                <div class="form-group">
                    <label>目标里程 (km) *</label>
                    <input type="number" name="target_distance" step="0.1" required>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>目标爬升 (m)</label>
                    <input type="number" name="target_elevation" step="1">
                </div>
                <div class="form-group">
                    <label>目标骑行次数</label>
                    <input type="number" name="target_rides">
                </div>
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="submitYearlyGoal()">保存</button>
        </div>
    `);
}

async function submitYearlyGoal() {
    const form = document.getElementById('yearly-goal-form');
    const year = form.querySelector('[name="year"]').value;
    const targetDistance = form.querySelector('[name="target_distance"]').value;
    
    if (!year) {
        showToast('请选择年份', 'error');
        return;
    }
    if (!targetDistance || targetDistance <= 0) {
        showToast('请输入有效的目标里程', 'error');
        return;
    }
    
    const submitBtn = event.target.closest('.modal-footer').querySelector('.btn-primary');
    showLoading(submitBtn);
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        const result = await fetchAPI('/goals/yearly', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (result) {
            closeModal();
            loadYearlyGoals();
            if (currentModule === 'dashboard') {
                loadDashboard();
            }
            showToast('年度目标已设置成功！', 'success');
        } else {
            showToast('保存失败', 'error');
        }
    } catch (err) {
        showToast('保存失败: ' + err.message, 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

function showAddChallengeModal() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    showModal(`
        <div class="modal-header">
            <h3>创建挑战</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <form id="challenge-form" class="modal-body">
            <div class="form-group">
                <label>挑战名称 *</label>
                <input type="text" name="name" required placeholder="如：连续30天骑行">
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>挑战类型 *</label>
                    <select name="type" required onchange="updateChallengeTargetLabel()">
                        <option value="">请选择</option>
                        <option value="streak">连续骑行天数</option>
                        <option value="monthly_distance">累计里程</option>
                    </select>
                </div>
                <div class="form-group">
                    <label id="target-label">目标值 *</label>
                    <input type="number" name="target_value" required>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>开始日期</label>
                    <input type="date" name="start_date" value="${monthStart}">
                </div>
                <div class="form-group">
                    <label>结束日期</label>
                    <input type="date" name="end_date" value="${monthEnd}">
                </div>
            </div>
            <div class="form-group">
                <label>描述</label>
                <textarea name="description" rows="3"></textarea>
            </div>
        </form>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="submitChallenge()">创建</button>
        </div>
    `);
}

function updateChallengeTargetLabel() {
    const type = document.querySelector('[name="type"]').value;
    const label = document.getElementById('target-label');
    if (type === 'streak') {
        label.textContent = '目标天数 *';
    } else if (type === 'monthly_distance') {
        label.textContent = '目标里程 (km) *';
    } else {
        label.textContent = '目标值 *';
    }
}

async function submitChallenge() {
    const form = document.getElementById('challenge-form');
    const name = form.querySelector('[name="name"]').value;
    const type = form.querySelector('[name="type"]').value;
    const targetValue = form.querySelector('[name="target_value"]').value;
    const startDate = form.querySelector('[name="start_date"]').value;
    const endDate = form.querySelector('[name="end_date"]').value;
    
    if (!name || name.trim() === '') {
        showToast('请输入挑战名称', 'error');
        return;
    }
    if (!type) {
        showToast('请选择挑战类型', 'error');
        return;
    }
    if (!targetValue || targetValue <= 0) {
        showToast('请输入有效的目标值', 'error');
        return;
    }
    if (!startDate) {
        showToast('请选择开始日期', 'error');
        return;
    }
    if (endDate && new Date(endDate) < new Date(startDate)) {
        showToast('结束日期不能早于开始日期', 'error');
        return;
    }
    
    const submitBtn = event.target.closest('.modal-footer').querySelector('.btn-primary');
    showLoading(submitBtn);
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        const result = await fetchAPI('/challenges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (result && result.id) {
            closeModal();
            loadChallenges();
            showToast('挑战已创建成功！', 'success');
        } else {
            showToast('创建失败: ' + (result?.error || '未知错误'), 'error');
        }
    } catch (err) {
        showToast('创建失败: ' + err.message, 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

// ==================== 模态框工具函数 ====================

function showModal(content) {
    const container = document.getElementById('modal-container');
    container.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(event)">
            <div class="modal" onclick="event.stopPropagation()">
                ${content}
            </div>
        </div>
    `;
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modal-container').innerHTML = '';
}

function showConfirm(message, onConfirm, title = '确认操作') {
    return new Promise((resolve) => {
        showModal(`
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <p style="font-size: 15px; color: #666;">${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal(); window.__confirmResult(false)">取消</button>
                <button class="btn btn-danger" onclick="closeModal(); window.__confirmResult(true)">确认</button>
            </div>
        `);
        
        window.__confirmResult = (result) => {
            if (result && onConfirm) onConfirm();
            resolve(result);
        };
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
