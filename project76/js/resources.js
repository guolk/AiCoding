function filterResources() {
    const typeFilter = document.getElementById('resourceTypeFilter').value;
    const ageFilter = document.getElementById('resourceAgeFilter').value;
    renderResources(typeFilter, ageFilter);
}

function renderResources(typeFilter = 'all', ageFilter = 'all') {
    const child = getCurrentChild();
    const container = document.getElementById('resourcesList');
    
    let resources = child.resources;
    
    if (typeFilter !== 'all') {
        resources = resources.filter(r => r.type === typeFilter);
    }
    if (ageFilter !== 'all') {
        resources = resources.filter(r => r.age === ageFilter);
    }
    
    container.innerHTML = resources.map(r => `
        <div class="resource-card">
            <div class="resource-header">
                <div class="resource-icon">${r.icon}</div>
                <div style="flex:1;">
                    <div class="resource-title">${r.title}</div>
                    <div class="resource-tags">
                        <span class="resource-tag">${r.type}</span>
                        <span class="resource-tag">${r.age}岁</span>
                        <span class="resource-tag">${r.subject}</span>
                    </div>
                </div>
            </div>
            <p style="color:#64748b;font-size:0.9rem;margin-bottom:1rem;">${r.description}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                ${r.url ? `<a href="${r.url}" target="_blank" style="color:#667eea;text-decoration:none;font-size:0.85rem;">🔗 查看资源</a>` : '<span></span>'}
                <button class="btn btn-danger btn-sm" onclick="deleteResource('${r.id}')">删除</button>
            </div>
        </div>
    `).join('');
    
    if (resources.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:3rem;color:#94a3b8;">暂无符合条件的资源</div>';
    }
}

function deleteResource(id) {
    if (confirm('确定要删除这个资源吗？')) {
        const child = getCurrentChild();
        child.resources = child.resources.filter(r => r.id !== id);
        saveData();
        filterResources();
        showToast('删除成功');
    }
}

function renderTrials() {
    const child = getCurrentChild();
    const container = document.getElementById('trialsList');
    
    const trials = child.trials.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = trials.map(t => `
        <div class="trial-item">
            <div style="font-size:2rem;">⭐</div>
            <div class="trial-content">
                <div class="trial-title">${t.title}</div>
                <div style="font-size:0.8rem;color:#718096;margin-bottom:0.5rem;">试用日期：${formatDateCN(t.date)}</div>
                <div class="trial-rating">${renderStars(t.rating)}</div>
                <div class="trial-feedback">${t.feedback}</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteTrial('${t.id}')">删除</button>
        </div>
    `).join('');
}

function deleteTrial(id) {
    if (confirm('确定要删除这条试用记录吗？')) {
        const child = getCurrentChild();
        child.trials = child.trials.filter(t => t.id !== id);
        saveData();
        renderTrials();
        showToast('删除成功');
    }
}

function showAddResource() {
    const icons = ['📚', '📱', '🎬', '🌐', '🧮', '🎤', '🎨', '🔬', '🎵'];
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>添加教育资源</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>图标</label>
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                        ${icons.map((icon, i) => `
                            <button type="button" class="resource-icon-btn" style="padding:0.5rem;font-size:1.5rem;border:2px solid #e2e8f0;border-radius:8px;background:white;cursor:pointer;"
                                onclick="selectResourceIcon('${icon}', this)">${icon}</button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="resourceIcon" value="📚">
                </div>
                <div class="form-group">
                    <label>资源名称</label>
                    <input type="text" id="resourceTitle" placeholder="资源名称">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>类型</label>
                        <select id="resourceType">
                            <option value="书籍">书籍</option>
                            <option value="视频">视频</option>
                            <option value="APP">APP</option>
                            <option value="网站">网站</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>适合年龄</label>
                        <select id="resourceAge">
                            <option value="0-3">0-3岁</option>
                            <option value="3-6">3-6岁</option>
                            <option value="6-9">6-9岁</option>
                            <option value="9-12">9-12岁</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>学科分类</label>
                    <select id="resourceSubject">
                        <option value="语言">语言</option>
                        <option value="数学">数学</option>
                        <option value="英语">英语</option>
                        <option value="科学">科学</option>
                        <option value="艺术">艺术</option>
                        <option value="综合">综合</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>链接（可选）</label>
                    <input type="url" id="resourceUrl" placeholder="https://">
                </div>
                <div class="form-group">
                    <label>描述</label>
                    <textarea id="resourceDesc" placeholder="资源简介..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveResource()">保存</button>
            </div>
        </div>
    `);
}

function selectResourceIcon(icon, btn) {
    document.getElementById('resourceIcon').value = icon;
    document.querySelectorAll('.resource-icon-btn').forEach(b => {
        b.style.borderColor = '#e2e8f0';
        b.style.background = 'white';
    });
    btn.style.borderColor = '#667eea';
    btn.style.background = '#f0f4ff';
}

function saveResource() {
    const child = getCurrentChild();
    const icon = document.getElementById('resourceIcon').value;
    const title = document.getElementById('resourceTitle').value;
    const type = document.getElementById('resourceType').value;
    const age = document.getElementById('resourceAge').value;
    const subject = document.getElementById('resourceSubject').value;
    const url = document.getElementById('resourceUrl').value;
    const description = document.getElementById('resourceDesc').value;
    
    if (!title) {
        showToast('请输入资源名称', 'error');
        return;
    }
    
    child.resources.push({
        id: generateId(),
        type,
        title,
        age,
        subject,
        url,
        icon,
        description
    });
    
    saveData();
    closeModal();
    filterResources();
    showToast('保存成功');
}

function showAddTrial() {
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>添加试用记录</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>资源名称</label>
                    <input type="text" id="trialTitle" placeholder="资源名称">
                </div>
                <div class="form-group">
                    <label>试用日期</label>
                    <input type="date" id="trialDate" value="${formatDate(new Date())}">
                </div>
                <div class="form-group">
                    <label>接受度评分</label>
                    <div id="trialRating" style="font-size:1.5rem;cursor:pointer;">
                        ${[1,2,3,4,5].map(i => `<span class="trial-star" onclick="selectTrialRating(${i})" style="color:#d1d5db;">★</span>`).join('')}
                    </div>
                    <input type="hidden" id="trialRatingValue" value="0">
                </div>
                <div class="form-group">
                    <label>效果评估</label>
                    <textarea id="trialFeedback" placeholder="记录孩子的接受度和使用效果..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveTrial()">保存</button>
            </div>
        </div>
    `);
}

function selectTrialRating(rating) {
    document.getElementById('trialRatingValue').value = rating;
    const stars = document.querySelectorAll('#trialRating .trial-star');
    stars.forEach((star, i) => {
        star.style.color = i < rating ? '#f59e0b' : '#d1d5db';
    });
}

function saveTrial() {
    const child = getCurrentChild();
    const title = document.getElementById('trialTitle').value;
    const date = document.getElementById('trialDate').value;
    const rating = parseInt(document.getElementById('trialRatingValue').value);
    const feedback = document.getElementById('trialFeedback').value;
    
    if (!title) {
        showToast('请输入资源名称', 'error');
        return;
    }
    
    child.trials.push({
        id: generateId(),
        title,
        date,
        rating,
        feedback
    });
    
    saveData();
    closeModal();
    renderTrials();
    showToast('保存成功');
}

function generateMathWorksheet() {
    const problems = [];
    for (let i = 0; i < 30; i++) {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const isAdd = Math.random() > 0.5;
        if (isAdd) {
            problems.push(`${a} + ${b} =`);
        } else {
            const bigger = Math.max(a, b);
            const smaller = Math.min(a, b);
            problems.push(`${bigger} - ${smaller} =`);
        }
    }
    
    const html = `
        <div class="worksheet">
            <h2>数学练习 - 20以内加减法</h2>
            <p style="text-align:center;margin-bottom:20px;">姓名：__________  日期：__________  得分：__________</p>
            <div class="math-grid">
                ${problems.map(p => `<div class="math-problem">${p}</div>`).join('')}
            </div>
        </div>
    `;
    
    showPrintModal(html);
}

function generateChineseWorksheet() {
    const characters = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
                       '大', '小', '上', '下', '中', '人', '口', '日', '月', '水',
                       '火', '山', '石', '田', '土', '天', '地', '王', '子', '女'];
    
    const selectedChars = characters.slice(0, 30);
    
    const html = `
        <div class="worksheet">
            <h2>汉字描红练习</h2>
            <p style="text-align:center;margin-bottom:20px;">姓名：__________  日期：__________</p>
            <div class="tian-zi-ge">
                ${selectedChars.map(c => `<div class="tian-zi-ge-cell" style="color:#ccc;">${c}</div>`).join('')}
            </div>
        </div>
    `;
    
    showPrintModal(html);
}

function generateEnglishWorksheet() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const words = [
        { en: 'Apple', zh: '苹果' },
        { en: 'Banana', zh: '香蕉' },
        { en: 'Cat', zh: '猫' },
        { en: 'Dog', zh: '狗' },
        { en: 'Egg', zh: '鸡蛋' },
        { en: 'Fish', zh: '鱼' },
        { en: 'Girl', zh: '女孩' },
        { en: 'Hand', zh: '手' },
        { en: 'Ice', zh: '冰' },
        { en: 'Juice', zh: '果汁' }
    ];
    
    const html = `
        <div class="worksheet">
            <h2>英语字母与单词练习</h2>
            <p style="text-align:center;margin-bottom:20px;">姓名：__________  日期：__________</p>
            
            <h3 style="margin:20px 0 10px;">字母书写</h3>
            <div class="tian-zi-ge">
                ${letters.split('').map(c => `<div class="tian-zi-ge-cell" style="color:#ccc;font-size:20px;">${c}</div>`).join('')}
            </div>
            
            <h3 style="margin:30px 0 10px;">单词抄写</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                ${words.map(w => `
                    <div style="padding:10px;border:1px solid #ccc;border-radius:8px;">
                        <div style="font-size:18px;margin-bottom:5px;">${w.en}</div>
                        <div style="color:#666;">${w.zh}</div>
                        <div style="margin-top:10px;border-bottom:1px solid #ccc;height:24px;"></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    showPrintModal(html);
}

function generateDrawingPaper() {
    const html = `
        <div class="worksheet">
            <h2>创意绘画纸</h2>
            <p style="text-align:center;margin-bottom:20px;">姓名：__________  日期：__________  主题：__________</p>
            
            <div style="border:2px solid #333;aspect-ratio:4/3;margin-bottom:20px;">
                <div style="width:100%;height:100%;background-image:
                    linear-gradient(#ddd 1px, transparent 1px),
                    linear-gradient(90deg, #ddd 1px, transparent 1px);
                    background-size:20px 20px;">
                </div>
            </div>
            
            <h3 style="margin:20px 0 10px;">田字格练习区</h3>
            <div class="tian-zi-ge">
                ${Array(20).fill('').map(() => `<div class="tian-zi-ge-cell"></div>`).join('')}
            </div>
        </div>
    `;
    
    showPrintModal(html);
}

function showPrintModal(html) {
    showModal(`
        <div class="modal" style="max-width:900px;">
            <div class="modal-header">
                <h3>打印预览</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div id="printPreview" style="max-height:60vh;overflow:auto;border:1px solid #e2e8f0;padding:20px;">
                    ${html}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="doPrint()">🖨️ 打印</button>
            </div>
        </div>
    `);
    
    window.printHtml = html;
}

function doPrint() {
    const printContainer = document.getElementById('printContainer');
    printContainer.innerHTML = window.printHtml;
    window.print();
    closeModal();
}

function initResourcesModule() {
    renderResources();
    renderTrials();
}
