let growthChart = null;
let currentChartType = 'height';

function renderChildBasicInfo() {
    const child = getCurrentChild();
    const container = document.getElementById('childBasicInfo');
    const age = calculateAge(child.birthday);
    const months = calculateMonths(child.birthday);
    const lastGrowth = child.growthData[child.growthData.length - 1];
    
    container.innerHTML = `
        <div class="info-item">
            <div class="info-label">姓名</div>
            <div class="info-value">${child.avatar} ${child.name}</div>
        </div>
        <div class="info-item">
            <div class="info-label">性别</div>
            <div class="info-value">${child.gender === 'boy' ? '男孩' : '女孩'}</div>
        </div>
        <div class="info-item">
            <div class="info-label">出生日期</div>
            <div class="info-value">${formatDateCN(child.birthday)}</div>
        </div>
        <div class="info-item">
            <div class="info-label">当前年龄</div>
            <div class="info-value">${age} (${months}个月)</div>
        </div>
        <div class="info-item">
            <div class="info-label">出生体重</div>
            <div class="info-value">${child.birthWeight} kg</div>
        </div>
        <div class="info-item">
            <div class="info-label">出生身高</div>
            <div class="info-value">${child.birthHeight} cm</div>
        </div>
        <div class="info-item">
            <div class="info-label">当前身高</div>
            <div class="info-value">${lastGrowth.height} cm</div>
        </div>
        <div class="info-item">
            <div class="info-label">当前体重</div>
            <div class="info-value">${lastGrowth.weight} kg</div>
        </div>
        <div class="info-item">
            <div class="info-label">当前头围</div>
            <div class="info-value">${lastGrowth.head} cm</div>
        </div>
        <div class="info-item">
            <div class="info-label">血型</div>
            <div class="info-value">${child.bloodType || '未记录'}</div>
        </div>
        <div class="info-item">
            <div class="info-label">过敏史</div>
            <div class="info-value">${child.allergy || '无'}</div>
        </div>
        <div class="info-item">
            <div class="info-label">出生医院</div>
            <div class="info-value">市妇幼保健院</div>
        </div>
    `;
}

function initGrowthChart() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '生长发育曲线 (WHO标准对比)'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '月龄'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: ''
                    }
                }
            }
        }
    });
}

function updateGrowthChart(type) {
    const child = getCurrentChild();
    const standard = whoStandards[child.gender][type];
    
    const labels = child.growthData.map(d => calculateMonths(child.birthday, d.date));
    const childData = child.growthData.map(d => d[type === 'height' ? 'height' : type === 'weight' ? 'weight' : 'head']);
    
    const yLabel = type === 'height' ? '身高 (cm)' : type === 'weight' ? '体重 (kg)' : '头围 (cm)';
    
    growthChart.data.labels = labels;
    growthChart.data.datasets = [
        {
            label: 'P3 (3%分位)',
            data: standard.months.map((m, i) => ({ x: m, y: standard.p3[i] })),
            borderColor: 'rgba(239, 68, 68, 0.5)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
        },
        {
            label: 'P50 (50%分位)',
            data: standard.months.map((m, i) => ({ x: m, y: standard.p50[i] })),
            borderColor: 'rgba(34, 197, 94, 0.5)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
        },
        {
            label: 'P97 (97%分位)',
            data: standard.months.map((m, i) => ({ x: m, y: standard.p97[i] })),
            borderColor: 'rgba(239, 68, 68, 0.5)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
        },
        {
            label: child.name,
            data: labels.map((m, i) => ({ x: m, y: childData[i] })),
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderWidth: 3,
            fill: true,
            tension: 0.3,
            pointRadius: 6,
            pointHoverRadius: 8
        }
    ];
    
    growthChart.options.scales.y.title.text = yLabel;
    growthChart.options.plugins.title.text = `${type === 'height' ? '身高' : type === 'weight' ? '体重' : '头围'}发育曲线 (WHO标准对比)`;
    growthChart.update();
}

function renderGrowthDataTable() {
    const child = getCurrentChild();
    const tbody = document.getElementById('growthDataTable');
    
    tbody.innerHTML = child.growthData.slice().reverse().map(d => {
        const months = calculateMonths(child.birthday, d.date);
        const heightPercentile = getGrowthPercentile(d.height, months, child.gender, 'height');
        const weightPercentile = getGrowthPercentile(d.weight, months, child.gender, 'weight');
        const headPercentile = getGrowthPercentile(d.head, months, child.gender, 'head');
        
        return `
            <tr>
                <td>${formatDateCN(d.date)}</td>
                <td>${months}个月</td>
                <td>${d.height} <small style="color:#718096">(${heightPercentile})</small></td>
                <td>${d.weight} <small style="color:#718096">(${weightPercentile})</small></td>
                <td>${d.head} <small style="color:#718096">(${headPercentile})</small></td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteGrowthData('${d.date}')">删除</button>
                </td>
            </tr>
        `;
    }).join('');
}

function deleteGrowthData(date) {
    if (confirm('确定要删除这条记录吗？')) {
        const child = getCurrentChild();
        child.growthData = child.growthData.filter(d => d.date !== date);
        saveData();
        renderGrowthDataTable();
        updateGrowthChart(currentChartType);
        renderChildBasicInfo();
        showToast('删除成功');
    }
}

function renderMilestones() {
    const child = getCurrentChild();
    const container = document.getElementById('milestonesList');
    
    const sortedMilestones = [...child.milestones].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedMilestones.map(m => `
        <div class="milestone-item">
            <div class="milestone-icon">${m.icon}</div>
            <div class="milestone-content">
                <div class="milestone-title">${m.title}</div>
                <div class="milestone-date">${formatDateCN(m.date)} · ${calculateAgeAtDate(child.birthday, m.date)}</div>
                <div class="milestone-desc">${m.description}</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteMilestone('${m.id}')">删除</button>
        </div>
    `).join('');
}

function deleteMilestone(id) {
    if (confirm('确定要删除这条里程碑记录吗？')) {
        const child = getCurrentChild();
        child.milestones = child.milestones.filter(m => m.id !== id);
        saveData();
        renderMilestones();
        showToast('删除成功');
    }
}

function renderPhotoTimeline() {
    const child = getCurrentChild();
    const container = document.getElementById('photoTimeline');
    
    const groupedPhotos = {};
    child.photos.forEach(photo => {
        const monthYear = getMonthYear(photo.date);
        if (!groupedPhotos[monthYear]) {
            groupedPhotos[monthYear] = [];
        }
        groupedPhotos[monthYear].push(photo);
    });
    
    const sortedMonths = Object.keys(groupedPhotos).sort((a, b) => {
        const [yearA, monthA] = a.split('年');
        const [yearB, monthB] = b.split('年');
        return (parseInt(yearA) * 12 + parseInt(monthA)) - (parseInt(yearB) * 12 + parseInt(monthB));
    }).reverse();
    
    container.innerHTML = sortedMonths.map(month => `
        <div class="photo-month-group">
            <div class="photo-month-header">${month}</div>
            <div class="photo-grid">
                ${groupedPhotos[month].map(photo => `
                    <div class="photo-item" onclick="viewPhoto('${photo.id}')">
                        <img src="${photo.url}" alt="${photo.caption}" loading="lazy">
                        <div class="photo-caption">${photo.caption}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function viewPhoto(id) {
    const child = getCurrentChild();
    const photo = child.photos.find(p => p.id === id);
    if (photo) {
        showModal(`
            <div class="modal">
                <div class="modal-header">
                <h3>${photo.caption}</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <img src="${photo.url}" style="width:100%;border-radius:12px;">
                <p style="margin-top:1rem;color:#718096;">拍摄日期：${formatDateCN(photo.date)}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" onclick="deletePhoto('${id}')">删除</button>
                <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
            </div>
        </div>
    `);
    }
}

function deletePhoto(id) {
    if (confirm('确定要删除这张照片吗？')) {
        const child = getCurrentChild();
        child.photos = child.photos.filter(p => p.id !== id);
        saveData();
        closeModal();
        renderPhotoTimeline();
        showToast('删除成功');
    }
}

function showAddChildModal() {
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>添加孩子</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>姓名</label>
                    <input type="text" id="newChildName" placeholder="请输入姓名">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>性别</label>
                        <select id="newChildGender">
                            <option value="boy">男孩</option>
                            <option value="girl">女孩</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>出生日期</label>
                        <input type="date" id="newChildBirthday" value="${formatDate(new Date())}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>出生体重(kg)</label>
                        <input type="number" id="newChildWeight" step="0.1" placeholder="3.5">
                    </div>
                    <div class="form-group">
                        <label>出生身高(cm)</label>
                        <input type="number" id="newChildHeight" placeholder="50">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="addChild()">保存</button>
            </div>
        </div>
    `);
}

function addChild() {
    const name = document.getElementById('newChildName').value;
    const gender = document.getElementById('newChildGender').value;
    const birthday = document.getElementById('newChildBirthday').value;
    const birthWeight = parseFloat(document.getElementById('newChildWeight').value);
    const birthHeight = parseFloat(document.getElementById('newChildHeight').value);
    
    if (!name) {
        showToast('请输入姓名', 'error');
        return;
    }
    
    const newChild = {
        id: generateId(),
        name,
        gender,
        birthday,
        birthWeight: birthWeight || 3.5,
        birthHeight: birthHeight || 50,
        birthHead: 34,
        bloodType: '',
        allergy: '',
        avatar: gender === 'boy' ? '👦' : '👧',
        growthData: [{
            date: birthday,
            height: birthHeight || 50,
            weight: birthWeight || 3.5,
            head: 34
        }],
        milestones: [{
            id: generateId(),
            icon: '👶',
            title: '出生',
            date: birthday,
            description: `${name}出生啦！体重${birthWeight || 3.5}kg，身高${birthHeight || 50}cm`
        }],
        photos: [],
        scores: [],
        activities: [],
        books: [],
        resources: [],
        trials: [],
        parentActivities: [],
        works: [],
        dialogs: [],
        vaccines: [],
        medicalRecords: []
    };
    
    appData.children.push(newChild);
    saveData();
    updateChildSelector();
    closeModal();
    showToast('添加成功');
    renderAllModules();
}

function showEditChildInfo() {
    const child = getCurrentChild();
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>编辑基本信息</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>姓名</label>
                    <input type="text" id="editChildName" value="${child.name}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>性别</label>
                        <select id="editChildGender">
                            <option value="boy" ${child.gender === 'boy' ? 'selected' : ''}>男孩</option>
                            <option value="girl" ${child.gender === 'girl' ? 'selected' : ''}>女孩</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>出生日期</label>
                        <input type="date" id="editChildBirthday" value="${child.birthday}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>血型</label>
                        <input type="text" id="editChildBloodType" value="${child.bloodType || ''}" placeholder="A型">
                    </div>
                    <div class="form-group">
                        <label>过敏史</label>
                        <input type="text" id="editChildAllergy" value="${child.allergy || ''}" placeholder="青霉素">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveChildInfo()">保存</button>
            </div>
        </div>
    `);
}

function saveChildInfo() {
    const child = getCurrentChild();
    child.name = document.getElementById('editChildName').value;
    child.gender = document.getElementById('editChildGender').value;
    child.birthday = document.getElementById('editChildBirthday').value;
    child.bloodType = document.getElementById('editChildBloodType').value;
    child.allergy = document.getElementById('editChildAllergy').value;
    child.avatar = child.gender === 'boy' ? '👦' : '👧';
    
    saveData();
    updateChildSelector();
    closeModal();
    renderChildBasicInfo();
    showToast('保存成功');
}

function showAddGrowthData() {
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>添加发育数据</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>日期</label>
                    <input type="date" id="growthDate" value="${formatDate(new Date())}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>身高(cm)</label>
                        <input type="number" id="growthHeight" step="0.1" placeholder="95.0">
                    </div>
                    <div class="form-group">
                        <label>体重(kg)</label>
                        <input type="number" id="growthWeight" step="0.1" placeholder="15.0">
                    </div>
                </div>
                <div class="form-group">
                    <label>头围(cm)</label>
                    <input type="number" id="growthHead" step="0.1" placeholder="50.0">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveGrowthData()">保存</button>
            </div>
        </div>
    `);
}

function saveGrowthData() {
    const child = getCurrentChild();
    const date = document.getElementById('growthDate').value;
    const height = parseFloat(document.getElementById('growthHeight').value);
    const weight = parseFloat(document.getElementById('growthWeight').value);
    const head = parseFloat(document.getElementById('growthHead').value);
    
    if (!height || !weight || !head) {
        showToast('请填写完整数据', 'error');
        return;
    }
    
    child.growthData.push({ date, height, weight, head });
    child.growthData.sort((a, b) => new Date(a.date) - new Date(b.date));
    saveData();
    closeModal();
    renderGrowthDataTable();
    updateGrowthChart(currentChartType);
    renderChildBasicInfo();
    showToast('保存成功');
}

function showAddMilestone() {
    const icons = ['👶', '😊', '🗣️', '🦶', '🦷', '🍚', '🚽', '🎒', '🎨', '⚽', '🎵', '📚', '🏆', '🎉', '❤️'];
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>添加里程碑</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>图标</label>
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                        ${icons.map((icon, i) => `
                        <button type="button" class="milestone-icon-btn" style="padding:0.5rem;font-size:1.5rem;border:2px solid #e2e8f0;border-radius:8px;background:white;cursor:pointer;" 
                            onclick="selectMilestoneIcon('${icon}', this)">${icon}</button>
                    `).join('')}
                    </div>
                    <input type="hidden" id="milestoneIcon" value="🏆">
                </div>
                <div class="form-group">
                    <label>事件名称</label>
                    <input type="text" id="milestoneTitle" placeholder="第一次...">
                </div>
                <div class="form-group">
                    <label>日期</label>
                    <input type="date" id="milestoneDate" value="${formatDate(new Date())}">
                </div>
                <div class="form-group">
                    <label>描述</label>
                    <textarea id="milestoneDesc" placeholder="记录这个难忘的时刻..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveMilestone()">保存</button>
            </div>
        </div>
    `);
}

function selectMilestoneIcon(icon, btn) {
    document.getElementById('milestoneIcon').value = icon;
    document.querySelectorAll('.milestone-icon-btn').forEach(b => {
        b.style.borderColor = '#e2e8f0';
        b.style.background = 'white';
    });
    btn.style.borderColor = '#667eea';
    btn.style.background = '#f0f4ff';
}

function saveMilestone() {
    const child = getCurrentChild();
    const icon = document.getElementById('milestoneIcon').value;
    const title = document.getElementById('milestoneTitle').value;
    const date = document.getElementById('milestoneDate').value;
    const description = document.getElementById('milestoneDesc').value;
    
    if (!title) {
        showToast('请输入事件名称', 'error');
        return;
    }
    
    child.milestones.push({
        id: generateId(),
        icon,
        title,
        date,
        description
    });
    
    saveData();
    closeModal();
    renderMilestones();
    showToast('保存成功');
}

function showAddPhoto() {
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>添加成长照片</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>照片描述</label>
                    <input type="text" id="photoCaption" placeholder="照片描述...">
                </div>
                <div class="form-group">
                    <label>拍摄日期</label>
                    <input type="date" id="photoDate" value="${formatDate(new Date())}">
                </div>
                <div class="form-group">
                    <label>照片主题（AI生成）</label>
                    <select id="photoTheme">
                        <option value="cute baby smiling">可爱宝宝</option>
                        <option value="child playing in park">在公园玩耍</option>
                        <option value="child drawing picture">画画</option>
                        <option value="child reading book">阅读</option>
                        <option value="child birthday party">生日</option>
                        <option value="child with family">和家人</option>
                        <option value="child eating food">吃东西</option>
                        <option value="child sleeping">睡觉</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="savePhoto()">保存</button>
            </div>
        </div>
    `);
}

function savePhoto() {
    const child = getCurrentChild();
    const caption = document.getElementById('photoCaption').value;
    const date = document.getElementById('photoDate').value;
    const theme = document.getElementById('photoTheme').value;
    
    if (!caption) {
        showToast('请输入照片描述', 'error');
        return;
    }
    
    const url = getImageUrl(theme);
    
    child.photos.push({
        id: generateId(),
        url,
        caption,
        date
    });
    
    saveData();
    closeModal();
    renderPhotoTimeline();
    showToast('保存成功');
}

function initGrowthModule() {
    renderChildBasicInfo();
    initGrowthChart();
    updateGrowthChart('height');
    renderGrowthDataTable();
    renderMilestones();
    renderPhotoTimeline();
    
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentChartType = tab.dataset.chart;
            updateGrowthChart(currentChartType);
        });
    });
}
