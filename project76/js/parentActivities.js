let currentActivityTab = 'planned';

function initActivityTabs() {
    document.querySelectorAll('.activity-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.activity-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentActivityTab = tab.dataset.status;
            renderParentActivities();
        });
    });
}

function renderParentActivities() {
    const child = getCurrentChild();
    const container = document.getElementById('parentActivitiesList');
    
    let activities = child.parentActivities.filter(a => a.status === currentActivityTab);
    activities.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (activities.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:3rem;color:#94a3b8;">暂无${currentActivityTab === 'planned' ? '待进行' : '已完成'}的活动</div>`;
        return;
    }
    
    container.innerHTML = activities.map(a => {
        const date = new Date(a.date);
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        
        return `
            <div class="parent-activity-item ${a.status === 'completed' ? 'completed' : ''}">
                <div class="activity-date-badge">
                    <span class="day">${date.getDate()}</span>
                    <span class="month">${monthNames[date.getMonth()]}</span>
                </div>
                <div class="activity-details">
                    <h4>${a.photo} ${a.title}</h4>
                    <p>${a.description}</p>
                    <div class="activity-tags">
                        ${a.tags.map(tag => `<span class="activity-tag">#${tag}</span>`).join('')}
                    </div>
                    <div style="margin-top:0.75rem;display:flex;gap:0.5rem;">
                        ${currentActivityTab === 'planned' ? 
                            `<button class="btn btn-primary btn-sm" onclick="completeActivity('${a.id}')">✓ 完成打卡</button>` : 
                            `<span style="color:#10b981;font-size:0.85rem;">✓ 已完成</span>`
                        }
                        <button class="btn btn-danger btn-sm" onclick="deleteParentActivity('${a.id}')">删除</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function completeActivity(id) {
    const child = getCurrentChild();
    const activity = child.parentActivities.find(a => a.id === id);
    if (activity) {
        activity.status = 'completed';
        saveData();
        renderParentActivities();
        showToast('打卡成功！');
    }
}

function deleteParentActivity(id) {
    if (confirm('确定要删除这个活动吗？')) {
        const child = getCurrentChild();
        child.parentActivities = child.parentActivities.filter(a => a.id !== id);
        saveData();
        renderParentActivities();
        showToast('删除成功');
    }
}

function renderWorks() {
    const child = getCurrentChild();
    const container = document.getElementById('worksList');
    
    const workColors = [
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    ];
    
    const works = child.works.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = works.map((w, i) => `
        <div class="work-card">
            <div class="work-image" style="background: ${workColors[i % workColors.length]}">
                ${w.photo}
            </div>
            <div class="work-info">
                <div class="work-title">${w.title}</div>
                <div class="work-date">${formatDateCN(w.date)} · ${w.type}</div>
                ${w.description ? `<p style="margin-top:0.5rem;font-size:0.85rem;color:#64748b;">${w.description}</p>` : ''}
                <div style="margin-top:0.75rem;text-align:right;">
                    <button class="btn btn-danger btn-sm" onclick="deleteWork('${w.id}')">删除</button>
                </div>
            </div>
        </div>
    `).join('');
}

function deleteWork(id) {
    if (confirm('确定要删除这个作品吗？')) {
        const child = getCurrentChild();
        child.works = child.works.filter(w => w.id !== id);
        saveData();
        renderWorks();
        showToast('删除成功');
    }
}

function renderDialogs() {
    const child = getCurrentChild();
    const container = document.getElementById('dialogsList');
    
    const dialogs = child.dialogs.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = dialogs.map(d => `
        <div class="dialog-item">
            <div class="dialog-date">📅 ${formatDateCN(d.date)}</div>
            <div class="dialog-question">👶: "${d.question}"</div>
            <div class="dialog-answer">👨‍👩‍👧: "${d.answer}"</div>
            <div style="margin-top:0.75rem;text-align:right;">
                <button class="btn btn-danger btn-sm" onclick="deleteDialog('${d.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

function deleteDialog(id) {
    if (confirm('确定要删除这条对话记录吗？')) {
        const child = getCurrentChild();
        child.dialogs = child.dialogs.filter(d => d.id !== id);
        saveData();
        renderDialogs();
        showToast('删除成功');
    }
}

function showAddParentActivity() {
    const types = ['科学实验', '手工制作', '户外探索', '烘焙', '节日活动', '游戏互动', '其他'];
    const icons = ['🧪', '🎨', '🌿', '🍪', '🎁', '🎮', '✨'];
    
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>添加亲子活动</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>活动图标</label>
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                        ${icons.map((icon, i) => `
                            <button type="button" class="pa-icon-btn" style="padding:0.5rem;font-size:1.5rem;border:2px solid #e2e8f0;border-radius:8px;background:white;cursor:pointer;"
                                onclick="selectPAIcon('${icon}', this)">${icon}</button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="paIcon" value="✨">
                </div>
                <div class="form-group">
                    <label>活动名称</label>
                    <input type="text" id="paTitle" placeholder="活动名称">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>活动类型</label>
                        <select id="paType">
                            ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>日期</label>
                        <input type="date" id="paDate" value="${formatDate(new Date())}">
                    </div>
                </div>
                <div class="form-group">
                    <label>标签（用逗号分隔）</label>
                    <input type="text" id="paTags" placeholder="科学,实验">
                </div>
                <div class="form-group">
                    <label>活动描述</label>
                    <textarea id="paDesc" placeholder="活动内容和计划..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveParentActivity()">保存</button>
            </div>
        </div>
    `);
}

function selectPAIcon(icon, btn) {
    document.getElementById('paIcon').value = icon;
    document.querySelectorAll('.pa-icon-btn').forEach(b => {
        b.style.borderColor = '#e2e8f0';
        b.style.background = 'white';
    });
    btn.style.borderColor = '#667eea';
    btn.style.background = '#f0f4ff';
}

function saveParentActivity() {
    const child = getCurrentChild();
    const icon = document.getElementById('paIcon').value;
    const title = document.getElementById('paTitle').value;
    const type = document.getElementById('paType').value;
    const date = document.getElementById('paDate').value;
    const tagsStr = document.getElementById('paTags').value;
    const description = document.getElementById('paDesc').value;
    
    if (!title) {
        showToast('请输入活动名称', 'error');
        return;
    }
    
    const tags = tagsStr.split(/[,，]/).map(t => t.trim()).filter(t => t);
    
    child.parentActivities.push({
        id: generateId(),
        title,
        date,
        status: 'planned',
        type,
        tags,
        description,
        photo: icon
    });
    
    saveData();
    closeModal();
    renderParentActivities();
    showToast('保存成功');
}

function showAddWork() {
    const types = ['绘画', '手工', '摄影', '作文', '其他'];
    const icons = ['🎨', '✂️', '📷', '✍️', '🎁'];
    
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>添加作品收藏</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>作品图标</label>
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                        ${icons.map((icon, i) => `
                            <button type="button" class="work-icon-btn" style="padding:0.5rem;font-size:1.5rem;border:2px solid #e2e8f0;border-radius:8px;background:white;cursor:pointer;"
                                onclick="selectWorkIcon('${icon}', this)">${icon}</button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="workIcon" value="🎨">
                </div>
                <div class="form-group">
                    <label>作品名称</label>
                    <input type="text" id="workTitle" placeholder="作品名称">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>作品类型</label>
                        <select id="workType">
                            ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>日期</label>
                        <input type="date" id="workDate" value="${formatDate(new Date())}">
                    </div>
                </div>
                <div class="form-group">
                    <label>作品描述</label>
                    <textarea id="workDesc" placeholder="记录作品的故事..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveWork()">保存</button>
            </div>
        </div>
    `);
}

function selectWorkIcon(icon, btn) {
    document.getElementById('workIcon').value = icon;
    document.querySelectorAll('.work-icon-btn').forEach(b => {
        b.style.borderColor = '#e2e8f0';
        b.style.background = 'white';
    });
    btn.style.borderColor = '#667eea';
    btn.style.background = '#f0f4ff';
}

function saveWork() {
    const child = getCurrentChild();
    const icon = document.getElementById('workIcon').value;
    const title = document.getElementById('workTitle').value;
    const type = document.getElementById('workType').value;
    const date = document.getElementById('workDate').value;
    const description = document.getElementById('workDesc').value;
    
    if (!title) {
        showToast('请输入作品名称', 'error');
        return;
    }
    
    child.works.push({
        id: generateId(),
        title,
        date,
        type,
        photo: icon,
        description
    });
    
    saveData();
    closeModal();
    renderWorks();
    showToast('保存成功');
}

function showAddDialog() {
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>记录亲子对话</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>日期</label>
                    <input type="date" id="dialogDate" value="${formatDate(new Date())}">
                </div>
                <div class="form-group">
                    <label>孩子的问题/话语</label>
                    <textarea id="dialogQuestion" placeholder="孩子问了什么有趣的问题？"></textarea>
                </div>
                <div class="form-group">
                    <label>家长的回答/对话</label>
                    <textarea id="dialogAnswer" placeholder="你是怎么回答的？"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveDialog()">保存</button>
            </div>
        </div>
    `);
}

function saveDialog() {
    const child = getCurrentChild();
    const date = document.getElementById('dialogDate').value;
    const question = document.getElementById('dialogQuestion').value;
    const answer = document.getElementById('dialogAnswer').value;
    
    if (!question || !answer) {
        showToast('请填写完整的对话内容', 'error');
        return;
    }
    
    child.dialogs.push({
        id: generateId(),
        date,
        question,
        answer
    });
    
    saveData();
    closeModal();
    renderDialogs();
    showToast('保存成功');
}

function initParentActivitiesModule() {
    initActivityTabs();
    renderParentActivities();
    renderWorks();
    renderDialogs();
}
