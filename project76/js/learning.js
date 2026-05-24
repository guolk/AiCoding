let scoreChart = null;

function initScoreChart() {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    scoreChart = new Chart(ctx, {
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
                    text: '成绩趋势图'
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: '分数'
                    }
                }
            }
        }
    });
}

function updateScoreChart() {
    const child = getCurrentChild();
    const subject = document.getElementById('subjectSelector').value;
    
    let scores = child.scores.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    if (subject !== 'all') {
        scores = scores.filter(s => s.subject === subject);
    }
    
    const uniqueDates = [...new Set(scores.map(s => s.date))].sort();
    const subjects = [...new Set(scores.map(s => s.subject))];
    
    const colors = {
        '语文': 'rgba(239, 68, 68, 1)',
        '数学': 'rgba(59, 130, 246, 1)',
        '英语': 'rgba(16, 185, 129, 1)',
        '科学': 'rgba(245, 158, 11, 1)'
    };
    
    const datasets = subjects.map(sub => ({
        label: sub,
        data: uniqueDates.map(date => {
            const score = scores.find(s => s.date === date && s.subject === sub);
            return score ? score.score : null;
        }),
        borderColor: colors[sub] || 'rgba(102, 126, 234, 1)',
        backgroundColor: colors[sub] || 'rgba(102, 126, 234, 0.1)',
        tension: 0.3,
        fill: false,
        pointRadius: 6,
        pointHoverRadius: 8
    }));
    
    scoreChart.data.labels = uniqueDates.map(d => formatDateCN(d));
    scoreChart.data.datasets = datasets;
    scoreChart.update();
}

function renderScoreTable() {
    const child = getCurrentChild();
    const tbody = document.getElementById('scoreTable');
    
    const scores = child.scores.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = scores.map(s => `
        <tr>
            <td>${formatDateCN(s.date)}</td>
            <td>${s.subject}</td>
            <td>${s.type}</td>
            <td>
                <span style="font-weight:600;color:${s.score >= 90 ? '#10b981' : s.score >= 80 ? '#f59e0b' : '#ef4444'}">${s.score}</span>
            </td>
            <td>第${s.rank}名</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteScore('${s.id}')">删除</button>
            </td>
        </tr>
    `).join('');
}

function deleteScore(id) {
    if (confirm('确定要删除这条成绩记录吗？')) {
        const child = getCurrentChild();
        child.scores = child.scores.filter(s => s.id !== id);
        saveData();
        renderScoreTable();
        updateScoreChart();
        showToast('删除成功');
    }
}

function renderActivities() {
    const child = getCurrentChild();
    const container = document.getElementById('activitiesList');
    
    container.innerHTML = child.activities.map(a => `
        <div class="activity-card">
            <span class="activity-type">${a.type}</span>
            <div class="activity-name">${a.name}</div>
            <div class="activity-meta">
                <span>累计 ${a.hours} 小时</span>
                <span>开始于 ${formatDateCN(a.startDate)}</span>
            </div>
            <div class="activity-progress">
                <div class="activity-progress-bar" style="width: ${a.progress}%"></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.75rem;">
                <span style="font-size:0.85rem;color:#718096;">进度: ${a.progress}%</span>
                <div>
                    <button class="btn btn-secondary btn-sm" onclick="editActivity('${a.id}')">编辑</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteActivity('${a.id}')">删除</button>
                </div>
            </div>
            ${a.note ? `<p style="margin-top:0.75rem;font-size:0.85rem;color:#64748b;">${a.note}</p>` : ''}
        </div>
    `).join('');
}

function deleteActivity(id) {
    if (confirm('确定要删除这条活动记录吗？')) {
        const child = getCurrentChild();
        child.activities = child.activities.filter(a => a.id !== id);
        saveData();
        renderActivities();
        showToast('删除成功');
    }
}

function renderBooks() {
    const child = getCurrentChild();
    const container = document.getElementById('booksList');
    
    document.getElementById('totalBooks').textContent = child.books.filter(b => b.status === '已读').length;
    document.getElementById('readingNow').textContent = child.books.filter(b => b.status === '正在读').length;
    document.getElementById('totalPages').textContent = child.books.reduce((sum, b) => sum + (b.pages || 0), 0);
    
    const bookColors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];
    
    container.innerHTML = child.books.map((b, i) => `
        <div class="book-card">
            <div class="book-cover" style="background: ${bookColors[i % bookColors.length]}">
                📖
            </div>
            <div class="book-info">
                <div class="book-title">${b.title}</div>
                <div class="book-author">${b.author}</div>
                <div class="book-rating">${renderStars(b.rating)}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;">
                    <span style="font-size:0.75rem;padding:0.2rem 0.5rem;background:${b.status === '已读' ? '#dcfce7' : b.status === '正在读' ? '#fef9c3' : '#f1f5f9'};color:${b.status === '已读' ? '#166534' : b.status === '正在读' ? '#854d0e' : '#475569'};border-radius:12px;">${b.status}</span>
                    <span style="font-size:0.75rem;color:#94a3b8;">${b.pages}页</span>
                </div>
                ${b.review ? `<div class="book-review">${b.review}</div>` : ''}
                <div style="margin-top:0.75rem;text-align:right;">
                    <button class="btn btn-danger btn-sm" onclick="deleteBook('${b.id}')">删除</button>
                </div>
            </div>
        </div>
    `).join('');
}

function deleteBook(id) {
    if (confirm('确定要删除这本书吗？')) {
        const child = getCurrentChild();
        child.books = child.books.filter(b => b.id !== id);
        saveData();
        renderBooks();
        showToast('删除成功');
    }
}

function showAddScore() {
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>添加成绩记录</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>日期</label>
                    <input type="date" id="scoreDate" value="${formatDate(new Date())}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>科目</label>
                        <select id="scoreSubject">
                            <option value="语文">语文</option>
                            <option value="数学">数学</option>
                            <option value="英语">英语</option>
                            <option value="科学">科学</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>考试类型</label>
                        <select id="scoreType">
                            <option value="单元测试">单元测试</option>
                            <option value="期中考试">期中考试</option>
                            <option value="期末考试">期末考试</option>
                            <option value="月考">月考</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>分数</label>
                        <input type="number" id="scoreValue" min="0" max="100" placeholder="95">
                    </div>
                    <div class="form-group">
                        <label>班级排名</label>
                        <input type="number" id="scoreRank" placeholder="5">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveScore()">保存</button>
            </div>
        </div>
    `);
}

function saveScore() {
    const child = getCurrentChild();
    const date = document.getElementById('scoreDate').value;
    const subject = document.getElementById('scoreSubject').value;
    const type = document.getElementById('scoreType').value;
    const score = parseFloat(document.getElementById('scoreValue').value);
    const rank = parseInt(document.getElementById('scoreRank').value);
    
    if (!score || !rank) {
        showToast('请填写完整信息', 'error');
        return;
    }
    
    child.scores.push({
        id: generateId(),
        date,
        subject,
        type,
        score,
        rank
    });
    
    saveData();
    closeModal();
    renderScoreTable();
    updateScoreChart();
    showToast('保存成功');
}

function showAddActivity() {
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>添加课外活动</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>活动类型</label>
                        <select id="activityType">
                            <option value="兴趣班">兴趣班</option>
                            <option value="运动">运动</option>
                            <option value="阅读">阅读</option>
                            <option value="音乐">音乐</option>
                            <option value="美术">美术</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>活动名称</label>
                        <input type="text" id="activityName" placeholder="绘画班">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>开始日期</label>
                        <input type="date" id="activityStartDate" value="${formatDate(new Date())}">
                    </div>
                    <div class="form-group">
                        <label>累计时长(小时)</label>
                        <input type="number" id="activityHours" placeholder="10">
                    </div>
                </div>
                <div class="form-group">
                    <label>进度 (%)</label>
                    <input type="range" id="activityProgress" min="0" max="100" value="0" oninput="document.getElementById('progressValue').textContent = this.value + '%'">
                    <span id="progressValue">0%</span>
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea id="activityNote" placeholder="记录活动效果和进展..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveActivity()">保存</button>
            </div>
        </div>
    `);
}

function saveActivity() {
    const child = getCurrentChild();
    const type = document.getElementById('activityType').value;
    const name = document.getElementById('activityName').value;
    const startDate = document.getElementById('activityStartDate').value;
    const hours = parseFloat(document.getElementById('activityHours').value);
    const progress = parseInt(document.getElementById('activityProgress').value);
    const note = document.getElementById('activityNote').value;
    
    if (!name) {
        showToast('请输入活动名称', 'error');
        return;
    }
    
    child.activities.push({
        id: generateId(),
        type,
        name,
        startDate,
        hours: hours || 0,
        progress,
        note
    });
    
    saveData();
    closeModal();
    renderActivities();
    showToast('保存成功');
}

function editActivity(id) {
    const child = getCurrentChild();
    const activity = child.activities.find(a => a.id === id);
    if (!activity) return;
    
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>编辑活动</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>活动类型</label>
                        <select id="editActivityType">
                            <option value="兴趣班" ${activity.type === '兴趣班' ? 'selected' : ''}>兴趣班</option>
                            <option value="运动" ${activity.type === '运动' ? 'selected' : ''}>运动</option>
                            <option value="阅读" ${activity.type === '阅读' ? 'selected' : ''}>阅读</option>
                            <option value="音乐" ${activity.type === '音乐' ? 'selected' : ''}>音乐</option>
                            <option value="美术" ${activity.type === '美术' ? 'selected' : ''}>美术</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>活动名称</label>
                        <input type="text" id="editActivityName" value="${activity.name}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>开始日期</label>
                        <input type="date" id="editActivityStartDate" value="${activity.startDate}">
                    </div>
                    <div class="form-group">
                        <label>累计时长(小时)</label>
                        <input type="number" id="editActivityHours" value="${activity.hours}">
                    </div>
                </div>
                <div class="form-group">
                    <label>进度 (%)</label>
                    <input type="range" id="editActivityProgress" min="0" max="100" value="${activity.progress}" oninput="document.getElementById('editProgressValue').textContent = this.value + '%'">
                    <span id="editProgressValue">${activity.progress}%</span>
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea id="editActivityNote">${activity.note || ''}</textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="updateActivity(${id})">保存</button>
            </div>
        </div>
    `);
}

function updateActivity(id) {
    const child = getCurrentChild();
    const activity = child.activities.find(a => a.id === id);
    if (!activity) return;
    
    activity.type = document.getElementById('editActivityType').value;
    activity.name = document.getElementById('editActivityName').value;
    activity.startDate = document.getElementById('editActivityStartDate').value;
    activity.hours = parseFloat(document.getElementById('editActivityHours').value) || 0;
    activity.progress = parseInt(document.getElementById('editActivityProgress').value);
    activity.note = document.getElementById('editActivityNote').value;
    
    saveData();
    closeModal();
    renderActivities();
    showToast('保存成功');
}

function showAddBook() {
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>添加书籍记录</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>书名</label>
                    <input type="text" id="bookTitle" placeholder="猜猜我有多爱你">
                </div>
                <div class="form-group">
                    <label>作者</label>
                    <input type="text" id="bookAuthor" placeholder="山姆·麦克布雷尼">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>阅读状态</label>
                        <select id="bookStatus">
                            <option value="想读">想读</option>
                            <option value="正在读">正在读</option>
                            <option value="已读">已读</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>页数</label>
                        <input type="number" id="bookPages" placeholder="32">
                    </div>
                </div>
                <div class="form-group">
                    <label>评分</label>
                    <div id="starRating" style="font-size:1.5rem;cursor:pointer;">
                        ${[1,2,3,4,5].map(i => `<span class="star" onclick="selectBookRating(${i})" style="color:#d1d5db;">★</span>`).join('')}
                    </div>
                    <input type="hidden" id="bookRating" value="0">
                </div>
                <div class="form-group">
                    <label>简单评价</label>
                    <textarea id="bookReview" placeholder="写下孩子的阅读感受..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveBook()">保存</button>
            </div>
        </div>
    `);
}

function selectBookRating(rating) {
    document.getElementById('bookRating').value = rating;
    const stars = document.querySelectorAll('#starRating .star');
    stars.forEach((star, i) => {
        star.style.color = i < rating ? '#f59e0b' : '#d1d5db';
    });
}

function saveBook() {
    const child = getCurrentChild();
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const status = document.getElementById('bookStatus').value;
    const pages = parseInt(document.getElementById('bookPages').value);
    const rating = parseInt(document.getElementById('bookRating').value);
    const review = document.getElementById('bookReview').value;
    
    if (!title) {
        showToast('请输入书名', 'error');
        return;
    }
    
    child.books.push({
        id: generateId(),
        title,
        author: author || '未知',
        status,
        pages: pages || 0,
        rating,
        review
    });
    
    saveData();
    closeModal();
    renderBooks();
    showToast('保存成功');
}

function initLearningModule() {
    initScoreChart();
    updateScoreChart();
    renderScoreTable();
    renderActivities();
    renderBooks();
}
