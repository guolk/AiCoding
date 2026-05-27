let currentUser = { id: 1, nickname: '张小明', community: '阳光花园' };

const categoryLabels = {
    lost: '失物招领',
    found: '拾物告知',
    service: '便民服务',
    activity_info: '邻里活动',
    recommend: '好物推荐',
    exchange: '转让交换'
};

const helpTypeLabels = {
    offer: '技能提供',
    need: '需求帮助'
};

const conditionLabels = {
    new: '全新',
    like_new: '9成新',
    good: '8成新',
    used: '有使用痕迹',
    old: '较旧'
};

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadAllData();
    updateCurrentUser();
});

function initTabs() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${tab}-tab`).classList.add('active');
        });
    });
}

function updateCurrentUser() {
    document.getElementById('currentUser').textContent = `${currentUser.nickname} (${currentUser.community})`;
}

async function api(url, options = {}) {
    const res = await fetch(`/api${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    return res.json();
}

function loadAllData() {
    loadPosts();
    loadHelpPosts();
    loadThanks();
    loadItems();
    loadActivities();
    loadDeals();
    loadContacts();
}

async function loadPosts() {
    const category = document.getElementById('postCategoryFilter').value;
    const location = document.getElementById('postLocationFilter').value;
    const posts = await api(`/posts?category=${category}&location=${location}`);
    
    const container = document.getElementById('postsList');
    if (posts.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>暂无信息，来发布第一条吧！</p></div>';
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="card">
            <div class="card-header">
                <div>
                    <span class="badge badge-${post.category}">${categoryLabels[post.category] || post.category}</span>
                    <div class="card-title">${escapeHtml(post.title)}</div>
                </div>
                ${post.expires_at ? `<span class="badge badge-warning">有效期至 ${formatDate(post.expires_at)}</span>` : ''}
            </div>
            <div class="card-meta">
                <span class="card-user">
                    <img src="${post.avatar}" alt="">
                    ${escapeHtml(post.nickname)}
                </span>
                <span>📍 ${escapeHtml(post.location)}</span>
                <span>🕐 ${formatDate(post.created_at)}</span>
            </div>
            <div class="card-content">${escapeHtml(post.content)}</div>
            ${post.images.length > 0 ? `
                <div class="card-images">
                    ${post.images.map(img => `<img src="${img}" alt="" onclick="viewImage('${img}')">`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

async function loadHelpPosts() {
    const type = document.getElementById('helpTypeFilter').value;
    const posts = await api(`/help?type=${type}`);
    
    const container = document.getElementById('helpList');
    if (posts.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🤝</div><p>暂无互助信息，需要帮助就发布吧！</p></div>';
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="card ${post.is_urgent ? 'urgent-card' : ''}">
            <div class="card-header">
                <div>
                    ${post.is_urgent ? '<span class="badge badge-urgent">🚨 紧急求助</span>' : ''}
                    <span class="badge badge-${post.type}">${helpTypeLabels[post.type] || post.type}</span>
                    <div class="card-title">${escapeHtml(post.title)}</div>
                </div>
            </div>
            <div class="card-meta">
                <span class="card-user">
                    <img src="${post.avatar}" alt="">
                    ${escapeHtml(post.nickname)}
                </span>
                <span>📍 ${escapeHtml(post.location)}</span>
                <span>🕐 ${formatDate(post.created_at)}</span>
            </div>
            <div class="card-content">${escapeHtml(post.content)}</div>
            ${post.skill_tags.length > 0 ? `
                <div style="margin-bottom: 15px;">
                    ${post.skill_tags.map(tag => `<span class="badge badge-service" style="margin-right: 5px;">#${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="card-footer">
                <span style="color: ${post.status === 'open' ? '#10b981' : post.status === 'accepted' ? '#f59e0b' : '#6b7280'}">
                    ${post.status === 'open' ? '🟢 等待帮助' : post.status === 'accepted' ? '🟡 已有人接单' : '✅ 已完成'}
                </span>
                <div class="card-actions">
                    ${post.status === 'open' && post.user_id !== currentUser.id ? `
                        <button onclick="acceptHelp(${post.id})" class="btn btn-success btn-sm">我来帮忙</button>
                    ` : ''}
                    ${post.status === 'accepted' && post.user_id === currentUser.id ? `
                        <button onclick="completeHelp(${post.id})" class="btn btn-primary btn-sm">完成并感谢</button>
                    ` : ''}
                    ${post.user_id === currentUser.id ? `
                        <button onclick="deleteHelpPost(${post.id})" class="btn btn-secondary btn-sm">删除</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

async function loadThanks() {
    const thanks = await api('/thanks');
    const container = document.getElementById('thanksList');
    
    if (thanks.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💖</div><p>暂无感谢记录，帮助他人收获感谢吧！</p></div>';
        return;
    }
    
    container.innerHTML = thanks.map(t => `
        <div class="thank-card">
            <div class="thank-users">
                <img src="${t.from_avatar}" alt="">
                <span>${escapeHtml(t.from_nickname)}</span>
                <span class="thank-arrow">💝</span>
                <img src="${t.to_avatar}" alt="">
                <span>${escapeHtml(t.to_nickname)}</span>
            </div>
            <div style="font-size: 14px; color: #92400e; margin-bottom: 8px;">
                感谢帮助：<strong>${escapeHtml(t.help_title)}</strong>
            </div>
            ${t.message ? `<div style="font-size: 13px; color: #78350f;">"${escapeHtml(t.message)}"</div>` : ''}
            <div style="font-size: 12px; color: #b45309; margin-top: 8px;">${formatDate(t.created_at)}</div>
        </div>
    `).join('');
}

async function loadItems() {
    const category = document.getElementById('itemCategoryFilter').value;
    const items = await api(`/items?category=${category}`);
    
    const container = document.getElementById('itemsList');
    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🛒</div><p>暂无闲置物品，来发布吧！</p></div>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="card">
            ${item.images.length > 0 ? `
                <div class="card-images">
                    <img src="${item.images[0]}" alt="" style="width: 100%; height: 200px; object-fit: cover;">
                </div>
            ` : ''}
            <div class="card-header">
                <div class="card-title">${escapeHtml(item.title)}</div>
                <div class="price">¥${item.price}</div>
            </div>
            <div class="card-meta">
                <span class="card-user">
                    <img src="${item.avatar}" alt="">
                    ${escapeHtml(item.nickname)}
                </span>
                <span class="reputation">
                    <span class="star">★</span>
                    ${item.reputation}
                </span>
            </div>
            <div class="card-content">${escapeHtml(item.description.substring(0, 100))}${item.description.length > 100 ? '...' : ''}</div>
            <div class="card-footer">
                <div>
                    <span class="badge badge-service">${conditionLabels[item.condition] || item.condition}</span>
                    <span class="badge badge-recommend">${item.trade_method === 'pickup' ? '自提' : '可送达'}</span>
                </div>
                <div class="card-actions">
                    <button onclick="viewItem(${item.id})" class="btn btn-primary btn-sm">查看详情</button>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadActivities() {
    const activities = await api('/activities');
    const container = document.getElementById('activitiesList');
    
    if (activities.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎉</div><p>暂无活动，来发起一个吧！</p></div>';
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="card">
            <div class="card-header">
                <div>
                    ${activity.is_recurring ? '<span class="recurring-badge">🔄 常驻活动</span>' : ''}
                    <div class="card-title">${escapeHtml(activity.title)}</div>
                </div>
                <span class="signup-count">${activity.signup_count}人已报名${activity.max_participants ? ` / ${activity.max_participants}人` : ''}</span>
            </div>
            <div class="activity-info">
                <div class="activity-info-item">📅 ${formatDateTime(activity.activity_date)}</div>
                <div class="activity-info-item">📍 ${escapeHtml(activity.location)}</div>
                ${activity.recurring_pattern ? `<div class="activity-info-item">🔁 ${escapeHtml(activity.recurring_pattern)}</div>` : ''}
            </div>
            <div class="card-content">${escapeHtml(activity.description)}</div>
            ${activity.images.length > 0 ? `
                <div class="card-images">
                    ${activity.images.map(img => `<img src="${img}" alt="" onclick="viewImage('${img}')">`).join('')}
                </div>
            ` : ''}
            <div class="card-footer">
                <div style="color: ${activity.status === 'upcoming' ? '#10b981' : '#6b7280'}">
                    ${activity.status === 'upcoming' ? '🟢 即将开始' : '✅ 已结束'}
                </div>
                <div class="card-actions">
                    ${activity.status === 'upcoming' ? `
                        <button onclick="signupActivity(${activity.id})" class="btn btn-success btn-sm">我要报名</button>
                    ` : ''}
                    <button onclick="viewActivity(${activity.id})" class="btn btn-primary btn-sm">查看详情</button>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadDeals() {
    const deals = await api('/deals');
    const container = document.getElementById('dealsList');
    
    if (deals.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏪</div><p>暂无优惠信息，发现好价来分享！</p></div>';
        return;
    }
    
    container.innerHTML = deals.map(deal => `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${escapeHtml(deal.merchant_name)}</div>
                ${deal.valid_until ? `<span class="badge badge-warning">至 ${formatDate(deal.valid_until)}</span>` : ''}
            </div>
            <div class="card-meta">
                <span class="card-user">
                    <img src="${deal.avatar}" alt="">
                    ${escapeHtml(deal.nickname)} 分享
                </span>
                <span>📍 ${escapeHtml(deal.location)}</span>
            </div>
            <div class="card-content">${escapeHtml(deal.deal_content)}</div>
            ${deal.images.length > 0 ? `
                <div class="card-images">
                    ${deal.images.map(img => `<img src="${img}" alt="" onclick="viewImage('${img}')">`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

async function loadContacts() {
    const category = document.getElementById('contactCategoryFilter').value;
    const contacts = await api(`/contacts?category=${category}`);
    const container = document.getElementById('contactsList');
    
    container.innerHTML = contacts.map(contact => `
        <div class="contact-card">
            <h4>${escapeHtml(contact.name)}</h4>
            <div class="contact-phone"><a href="tel:${contact.phone}">${contact.phone}</a></div>
            <span class="badge badge-service">${escapeHtml(contact.category)}</span>
            ${contact.location ? `<div style="margin-top: 8px; font-size: 13px; color: #6b7280;">📍 ${escapeHtml(contact.location)}</div>` : ''}
            ${contact.description ? `<div style="margin-top: 4px; font-size: 13px; color: #6b7280;">${escapeHtml(contact.description)}</div>` : ''}
        </div>
    `).join('');
}

function showPostForm() {
    const html = `
        <h2 style="margin-bottom: 20px;">发布信息</h2>
        <form>
            <div class="form-group">
                <label>信息分类</label>
                <select name="category" required>
                    <option value="">请选择分类</option>
                    <option value="lost">失物招领</option>
                    <option value="found">拾物告知</option>
                    <option value="service">便民服务</option>
                    <option value="activity_info">邻里活动</option>
                    <option value="recommend">好物推荐</option>
                    <option value="exchange">转让交换</option>
                </select>
            </div>
            <div class="form-group">
                <label>标题</label>
                <input type="text" name="title" required placeholder="请输入标题">
            </div>
            <div class="form-group">
                <label>详细内容</label>
                <textarea name="content" required placeholder="请输入详细内容"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>所在位置</label>
                    <input type="text" name="location" required value="${currentUser.community}" placeholder="如：阳光花园1号楼">
                </div>
                <div class="form-group">
                    <label>可见范围</label>
                    <select name="location_range">
                        <option value="1">本小区</option>
                        <option value="2">周边1公里</option>
                        <option value="5">周边5公里</option>
                        <option value="10">周边10公里</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>有效期（选填）</label>
                <input type="datetime-local" name="expires_at">
            </div>
            <div class="form-group">
                <label>图片链接（多个用逗号分隔）</label>
                <input type="text" name="images" placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">发布信息</button>
        </form>
    `;
    showModal(html, 'post');
}

async function submitPost(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
        user_id: currentUser.id,
        category: form.get('category'),
        title: form.get('title'),
        content: form.get('content'),
        location: form.get('location'),
        location_range: parseInt(form.get('location_range')),
        expires_at: form.get('expires_at') || null,
        images: form.get('images') ? form.get('images').split(',').map(s => s.trim()).filter(Boolean) : []
    };
    
    await api('/posts', { method: 'POST', body: data });
    closeModal();
    loadPosts();
    alert('发布成功！');
}

function showHelpForm(type) {
    const isUrgent = type === 'urgent';
    const actualType = type === 'urgent' ? 'need' : type;
    const title = isUrgent ? '发布紧急求助' : type === 'offer' ? '我能提供帮助' : '我需要帮助';
    
    const html = `
        <h2 style="margin-bottom: 20px;">${title}</h2>
        <form>
            <input type="hidden" name="type" value="${actualType}">
            <input type="hidden" name="is_urgent" value="${isUrgent ? '1' : '0'}">
            ${isUrgent ? `<div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: #dc2626;">
                ⚠️ 紧急求助会以醒目样式显示，优先推送给更多邻居，请谨慎使用！
            </div>` : ''}
            <div class="form-group">
                <label>标题</label>
                <input type="text" name="title" required placeholder="请输入标题">
            </div>
            <div class="form-group">
                <label>详细描述</label>
                <textarea name="content" required placeholder="${type === 'offer' ? '描述你能提供的帮助，如：我会修电脑、可以帮忙接送孩子等' : '描述你需要的帮助，如：需要帮忙搬东西、需要借工具等'}"></textarea>
            </div>
            ${type === 'offer' ? `
            <div class="form-group">
                <label>技能标签（多个用逗号分隔）</label>
                <input type="text" name="skill_tags" placeholder="如：维修, 搬运, 家教">
            </div>
            ` : ''}
            <div class="form-group">
                <label>所在位置</label>
                <input type="text" name="location" required value="${currentUser.community}" placeholder="请输入位置">
            </div>
            <button type="submit" class="btn ${isUrgent ? 'btn-danger' : 'btn-primary'}" style="width: 100%;">
                ${isUrgent ? '发布紧急求助' : '发布'}
            </button>
        </form>
    `;
    showModal(html, 'help');
}

async function submitHelp(e, isUrgent) {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
        user_id: currentUser.id,
        type: form.get('type'),
        title: form.get('title'),
        content: form.get('content'),
        skill_tags: form.get('skill_tags') ? form.get('skill_tags').split(',').map(s => s.trim()).filter(Boolean) : [],
        is_urgent: isUrgent,
        location: form.get('location')
    };
    
    await api('/help', { method: 'POST', body: data });
    closeModal();
    loadHelpPosts();
    alert('发布成功！');
}

async function acceptHelp(id) {
    if (!confirm('确定要提供帮助吗？')) return;
    await api(`/help/${id}/accept`, { method: 'POST', body: { helper_id: currentUser.id } });
    loadHelpPosts();
    alert('接单成功！请尽快联系求助者。');
}

async function deleteHelpPost(id) {
    if (!confirm('确定要删除这条帖子吗？此操作不可撤销。')) return;
    await api(`/help/${id}`, { method: 'DELETE', body: { user_id: currentUser.id } });
    loadHelpPosts();
    alert('删除成功！');
}

function completeHelp(id) {
    const html = `
        <h2 style="margin-bottom: 20px;">完成帮助并感谢</h2>
        <form>
            <input type="hidden" name="help_id" value="${id}">
            <div class="form-group">
                <label>感谢留言（选填）</label>
                <textarea name="message" placeholder="写下你对帮助者的感谢..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">完成并发送感谢</button>
        </form>
    `;
    showModal(html, 'completeHelp');
}

async function submitCompleteHelp(e, id) {
    e.preventDefault();
    const form = new FormData(e.target);
    await api(`/help/${id}/complete`, { method: 'POST', body: { message: form.get('message') } });
    closeModal();
    loadHelpPosts();
    loadThanks();
    alert('感谢已发送！帮助者获得了5点信誉积分。');
}

function showItemForm() {
    const html = `
        <h2 style="margin-bottom: 20px;">发布闲置物品</h2>
        <form id="itemForm">
            <div class="form-row">
                <div class="form-group">
                    <label>物品分类</label>
                    <select name="category" required>
                        <option value="">请选择分类</option>
                        <option value="electronics">数码家电</option>
                        <option value="furniture">家具家居</option>
                        <option value="clothes">服装箱包</option>
                        <option value="books">图书文具</option>
                        <option value="sports">运动户外</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>成色</label>
                    <select name="condition" required>
                        <option value="new">全新</option>
                        <option value="like_new">9成新</option>
                        <option value="good">8成新</option>
                        <option value="used">有使用痕迹</option>
                        <option value="old">较旧</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>物品名称</label>
                <input type="text" name="title" required placeholder="如：小米空气净化器" oninput="checkPriceSuggest(this.value)">
                <div id="priceSuggest" style="font-size: 13px; color: #6b7280; margin-top: 5px;"></div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>期望价格（元）</label>
                    <input type="number" name="price" required min="0" step="0.01" placeholder="0.00">
                </div>
                <div class="form-group">
                    <label>交易方式</label>
                    <select name="trade_method" required>
                        <option value="pickup">仅自提</option>
                        <option value="delivery">可送达</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>详细描述</label>
                <textarea name="description" required placeholder="描述物品的使用情况、购买时间、转让原因等"></textarea>
            </div>
            <div class="form-group">
                <label>所在位置</label>
                <input type="text" name="location" required value="${currentUser.community}" placeholder="请输入位置">
            </div>
            <div class="form-group">
                <label>图片链接（多个用逗号分隔）</label>
                <input type="text" name="images" placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">发布闲置</button>
        </form>
    `;
    showModal(html, 'item');
}

async function checkPriceSuggest(keyword) {
    if (keyword.length < 2) {
        document.getElementById('priceSuggest').innerHTML = '';
        return;
    }
    const suggest = await api(`/price-suggest?keyword=${encodeURIComponent(keyword)}`);
    if (suggest.hasData) {
        document.getElementById('priceSuggest').innerHTML = `
            💡 同类物品历史成交价：均价 ¥${suggest.avgPrice}（¥${suggest.minPrice} - ¥${suggest.maxPrice}，基于${suggest.sampleCount}条数据）
        `;
    }
}

async function submitItem(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
        user_id: currentUser.id,
        title: form.get('title'),
        description: form.get('description'),
        price: parseFloat(form.get('price')),
        condition: form.get('condition'),
        trade_method: form.get('trade_method'),
        category: form.get('category'),
        location: form.get('location'),
        images: form.get('images') ? form.get('images').split(',').map(s => s.trim()).filter(Boolean) : []
    };
    
    await api('/items', { method: 'POST', body: data });
    closeModal();
    loadItems();
    alert('发布成功！');
}

async function viewItem(id) {
    const item = await api(`/items/${id}`);
    const reviews = await api(`/users/${item.user_id}/reviews`);
    
    const html = `
        <h2 style="margin-bottom: 20px;">${escapeHtml(item.title)}</h2>
        <div style="font-size: 32px; font-weight: 700; color: #ef4444; margin-bottom: 20px;">¥${item.price}</div>
        
        ${item.images.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px;">
                ${item.images.map(img => `<img src="${img}" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px;">`).join('')}
            </div>
        ` : ''}
        
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
            <img src="${item.avatar}" style="width: 50px; height: 50px; border-radius: 50%;">
            <div>
                <div style="font-weight: 600;">${escapeHtml(item.nickname)}</div>
                <div class="reputation"><span class="star">★</span> 信誉分: ${item.reputation}</div>
                ${item.phone ? `<div style="font-size: 14px; color: #6b7280; margin-top: 4px;">📞 ${item.phone}</div>` : ''}
            </div>
        </div>
        
        <div class="form-row" style="margin-bottom: 20px;">
            <div><span class="badge badge-service">${conditionLabels[item.condition]}</span></div>
            <div><span class="badge badge-recommend">${item.trade_method === 'pickup' ? '自提' : '可送达'}</span></div>
            <div>📍 ${escapeHtml(item.location)}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 10px;">物品描述</h4>
            <p style="color: #4b5563; line-height: 1.6;">${escapeHtml(item.description)}</p>
        </div>
        
        ${reviews.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 10px;">用户评价 (${reviews.length})</h4>
                ${reviews.map(r => `
                    <div style="padding: 10px; background: #f8fafc; border-radius: 8px; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                            <img src="${r.avatar}" style="width: 24px; height: 24px; border-radius: 50%;">
                            <span>${escapeHtml(r.nickname)}</span>
                            <span class="star">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                        </div>
                        <div style="font-size: 13px; color: #6b7280;">关于 ${escapeHtml(r.item_title)}</div>
                        ${r.comment ? `<div style="margin-top: 5px; color: #374151;">${escapeHtml(r.comment)}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${item.user_id !== currentUser.id ? `
            <button onclick="showReviewForm(${item.id}, ${item.user_id})" class="btn btn-primary" style="width: 100%; margin-bottom: 10px;">
                联系卖家并评价
            </button>
        ` : `
            <button onclick="markItemSold(${item.id})" class="btn btn-success" style="width: 100%; margin-bottom: 10px;">
                标记为已售出
            </button>
        `}
    `;
    showModal(html);
}

function showReviewForm(itemId, sellerId) {
    const html = `
        <h2 style="margin-bottom: 20px;">交易评价</h2>
        <form>
            <input type="hidden" name="item_id" value="${itemId}">
            <input type="hidden" name="seller_id" value="${sellerId}">
            <div class="form-group">
                <label>评分</label>
                <div style="font-size: 30px;" id="starContainer">
                    ${[1,2,3,4,5].map(i => `<span onclick="setModalRating(${i})" id="star${i}" style="cursor: pointer; color: #fbbf24;">★</span>`).join('')}
                </div>
                <input type="hidden" name="rating" id="ratingInput" value="5">
            </div>
            <div class="form-group">
                <label>评价内容</label>
                <textarea name="comment" placeholder="分享你的交易体验..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">提交评价</button>
        </form>
    `;
    showModal(html, 'review');
    
    setTimeout(() => {
        window.setModalRating = function(n) {
            document.getElementById('ratingInput').value = n;
            for (let i = 1; i <= 5; i++) {
                const star = document.getElementById('star' + i);
                if (star) star.style.color = i <= n ? '#fbbf24' : '#d1d5db';
            }
        };
    }, 100);
}

async function submitReview(e, itemId, sellerId) {
    e.preventDefault();
    const form = new FormData(e.target);
    await api('/reviews', {
        method: 'POST',
        body: {
            item_id: itemId,
            reviewer_id: currentUser.id,
            reviewee_id: sellerId,
            rating: parseInt(form.get('rating')),
            comment: form.get('comment')
        }
    });
    closeModal();
    alert('评价提交成功！');
}

async function markItemSold(id) {
    if (!confirm('确定标记为已售出吗？')) return;
    await api(`/items/${id}/sold`, { method: 'POST' });
    closeModal();
    loadItems();
    alert('已标记为售出！');
}

function showActivityForm() {
    const html = `
        <h2 style="margin-bottom: 20px;">发起活动</h2>
        <form>
            <div class="form-group">
                <label>活动名称</label>
                <input type="text" name="title" required placeholder="如：周末包饺子活动">
            </div>
            <div class="form-group">
                <label>活动描述</label>
                <textarea name="description" required placeholder="描述活动内容、注意事项等"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>活动时间</label>
                    <input type="datetime-local" name="activity_date" required>
                </div>
                <div class="form-group">
                    <label>活动地点</label>
                    <input type="text" name="location" required placeholder="如：小区活动中心">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>最大参与人数（选填）</label>
                    <input type="number" name="max_participants" min="1" placeholder="不限则留空">
                </div>
                <div class="form-group">
                    <label>是否为常驻活动</label>
                    <select name="is_recurring" onchange="toggleModalRecurring(this.value)">
                        <option value="0">否</option>
                        <option value="1">是</option>
                    </select>
                </div>
            </div>
            <div class="form-group" id="recurringPatternGroup" style="display: none;">
                <label>活动周期</label>
                <input type="text" name="recurring_pattern" placeholder="如：每周五晚7点">
            </div>
            <div class="form-group">
                <label>活动图片（多个用逗号分隔）</label>
                <input type="text" name="images" placeholder="https://example.com/img1.jpg">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">发起活动</button>
        </form>
    `;
    showModal(html, 'activity');
    
    setTimeout(() => {
        window.toggleModalRecurring = function(val) {
            document.getElementById('recurringPatternGroup').style.display = val === '1' ? 'block' : 'none';
        };
    }, 100);
}

async function submitActivity(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
        user_id: currentUser.id,
        title: form.get('title'),
        description: form.get('description'),
        activity_date: form.get('activity_date'),
        location: form.get('location'),
        max_participants: form.get('max_participants') ? parseInt(form.get('max_participants')) : null,
        is_recurring: form.get('is_recurring') === '1',
        recurring_pattern: form.get('recurring_pattern') || null,
        images: form.get('images') ? form.get('images').split(',').map(s => s.trim()).filter(Boolean) : []
    };
    
    await api('/activities', { method: 'POST', body: data });
    closeModal();
    loadActivities();
    alert('活动发布成功！');
}

async function signupActivity(id) {
    if (!confirm('确定要报名参加吗？')) return;
    try {
        await api(`/activities/${id}/signup`, { method: 'POST', body: { user_id: currentUser.id } });
        loadActivities();
        alert('报名成功！');
    } catch (e) {
        alert('报名失败，可能已满员或已报名过。');
    }
}

async function viewActivity(id) {
    const activity = await api(`/activities`).then(list => list.find(a => a.id === id));
    const signups = await api(`/activities/${id}/signups`);
    const photos = await api(`/activities/${id}/photos`);
    
    const html = `
        <h2 style="margin-bottom: 20px;">${escapeHtml(activity.title)}</h2>
        ${activity.is_recurring ? '<span class="recurring-badge" style="margin-bottom: 15px;">🔄 常驻活动</span>' : ''}
        
        <div class="activity-info" style="margin-bottom: 20px;">
            <div class="activity-info-item">📅 ${formatDateTime(activity.activity_date)}</div>
            <div class="activity-info-item">📍 ${escapeHtml(activity.location)}</div>
            <div class="activity-info-item">👥 ${signups.length}人已报名${activity.max_participants ? ` / ${activity.max_participants}人` : ''}</div>
            ${activity.recurring_pattern ? `<div class="activity-info-item">🔁 ${escapeHtml(activity.recurring_pattern)}</div>` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 10px;">活动介绍</h4>
            <p style="color: #4b5563; line-height: 1.6;">${escapeHtml(activity.description)}</p>
        </div>
        
        ${activity.images.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 10px;">活动图片</h4>
                <div class="photo-gallery">
                    ${activity.images.map(img => `<img src="${img}" alt="">`).join('')}
                </div>
            </div>
        ` : ''}
        
        ${signups.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 10px;">已报名 (${signups.length})</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${signups.map(s => `
                        <div style="display: flex; align-items: center; gap: 5px; background: #f8fafc; padding: 5px 10px; border-radius: 20px;">
                            <img src="${s.avatar}" style="width: 24px; height: 24px; border-radius: 50%;">
                            <span>${escapeHtml(s.nickname)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${photos.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 10px;">现场照片 (${photos.length})</h4>
                <div class="photo-gallery">
                    ${photos.map(p => `
                        <div>
                            <img src="${p.image_url}" alt="">
                            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                                ${escapeHtml(p.nickname)} 上传
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${activity.status === 'completed' ? `
            <button onclick="showPhotoUploadForm(${id})" class="btn btn-primary" style="width: 100%;">
                📷 上传活动照片
            </button>
        ` : ''}
    `;
    showModal(html);
}

function showPhotoUploadForm(activityId) {
    const html = `
        <h2 style="margin-bottom: 20px;">上传活动照片</h2>
        <form>
            <input type="hidden" name="activity_id" value="${activityId}">
            <div class="form-group">
                <label>照片链接</label>
                <input type="text" name="image_url" required placeholder="https://example.com/photo.jpg">
            </div>
            <div class="form-group">
                <label>描述（选填）</label>
                <input type="text" name="description" placeholder="简短描述这张照片">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">上传照片</button>
        </form>
    `;
    showModal(html, 'photo');
}

async function submitPhoto(e, activityId) {
    e.preventDefault();
    const form = new FormData(e.target);
    await api(`/activities/${activityId}/photos`, {
        method: 'POST',
        body: {
            user_id: currentUser.id,
            image_url: form.get('image_url'),
            description: form.get('description')
        }
    });
    closeModal();
    alert('照片上传成功！');
}

function showDealForm() {
    const html = `
        <h2 style="margin-bottom: 20px;">分享优惠信息</h2>
        <form>
            <div class="form-group">
                <label>商家名称</label>
                <input type="text" name="merchant_name" required placeholder="如：小区门口超市">
            </div>
            <div class="form-group">
                <label>优惠内容</label>
                <textarea name="deal_content" required placeholder="描述优惠信息，如：鸡蛋特价5元/斤"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>商家位置</label>
                    <input type="text" name="location" required placeholder="请输入位置">
                </div>
                <div class="form-group">
                    <label>有效期至（选填）</label>
                    <input type="datetime-local" name="valid_until">
                </div>
            </div>
            <div class="form-group">
                <label>相关图片（多个用逗号分隔）</label>
                <input type="text" name="images" placeholder="https://example.com/img1.jpg">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">分享优惠</button>
        </form>
    `;
    showModal(html, 'deal');
}

async function submitDeal(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
        user_id: currentUser.id,
        merchant_name: form.get('merchant_name'),
        deal_content: form.get('deal_content'),
        location: form.get('location'),
        valid_until: form.get('valid_until') || null,
        images: form.get('images') ? form.get('images').split(',').map(s => s.trim()).filter(Boolean) : []
    };
    
    await api('/deals', { method: 'POST', body: data });
    closeModal();
    loadDeals();
    alert('优惠分享成功！');
}

function showContactForm() {
    const html = `
        <h2 style="margin-bottom: 20px;">添加实用电话</h2>
        <form>
            <div class="form-group">
                <label>名称</label>
                <input type="text" name="name" required placeholder="如：张师傅开锁">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>电话</label>
                    <input type="tel" name="phone" required placeholder="请输入电话号码">
                </div>
                <div class="form-group">
                    <label>分类</label>
                    <select name="category" required>
                        <option value="快递">快递</option>
                        <option value="维修">维修</option>
                        <option value="外卖">外卖</option>
                        <option value="医疗">医疗</option>
                        <option value="警务">警务</option>
                        <option value="其他">其他</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>地址（选填）</label>
                <input type="text" name="location" placeholder="请输入地址">
            </div>
            <div class="form-group">
                <label>备注（选填）</label>
                <input type="text" name="description" placeholder="如：24小时服务">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">添加电话</button>
        </form>
    `;
    showModal(html, 'contact');
}

async function submitContact(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
        name: form.get('name'),
        phone: form.get('phone'),
        category: form.get('category'),
        location: form.get('location'),
        description: form.get('description')
    };
    
    await api('/contacts', { method: 'POST', body: data });
    closeModal();
    loadContacts();
    alert('电话添加成功！');
}

async function showUserSelector() {
    const users = await api('/users');
    const html = `
        <h2 style="margin-bottom: 20px;">选择用户</h2>
        <div style="display: grid; gap: 10px;">
            ${users.map(u => `
                <div onclick="selectUser(${u.id}, '${escapeHtml(u.nickname)}', '${escapeHtml(u.community)}')" 
                     style="display: flex; align-items: center; gap: 15px; padding: 15px; border: 2px solid ${u.id === currentUser.id ? '#667eea' : '#e5e7eb'}; border-radius: 12px; cursor: pointer; transition: all 0.3s;"
                     onmouseover="this.style.borderColor='#667eea'"
                     onmouseout="this.style.borderColor='${u.id === currentUser.id ? '#667eea' : '#e5e7eb'}'">
                    <img src="${u.avatar}" style="width: 50px; height: 50px; border-radius: 50%;">
                    <div>
                        <div style="font-weight: 600;">${escapeHtml(u.nickname)}</div>
                        <div style="font-size: 13px; color: #6b7280;">${escapeHtml(u.community)} · 信誉分 ${u.reputation}</div>
                    </div>
                    ${u.id === currentUser.id ? '<span style="color: #667eea; margin-left: auto;">✓</span>' : ''}
                </div>
            `).join('')}
        </div>
    `;
    showModal(html);
}

function selectUser(id, nickname, community) {
    currentUser = { id, nickname, community };
    updateCurrentUser();
    closeModal();
}

let currentFormType = null;

function showModal(html, formType = null) {
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modal').classList.add('active');
    currentFormType = formType;
    
    if (formType) {
        const form = document.querySelector('#modalBody form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.getElementById('modalBody').innerHTML = '';
    currentFormType = null;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (currentFormType === 'item') {
        await submitItem(e);
    } else if (currentFormType === 'post') {
        await submitPost(e);
    } else if (currentFormType === 'help') {
        const isUrgent = e.target.querySelector('[name="is_urgent"]')?.value === '1';
        await submitHelp(e, isUrgent);
    } else if (currentFormType === 'completeHelp') {
        const helpId = e.target.querySelector('[name="help_id"]').value;
        await submitCompleteHelp(e, parseInt(helpId));
    } else if (currentFormType === 'activity') {
        await submitActivity(e);
    } else if (currentFormType === 'photo') {
        const activityId = e.target.querySelector('[name="activity_id"]').value;
        await submitPhoto(e, parseInt(activityId));
    } else if (currentFormType === 'deal') {
        await submitDeal(e);
    } else if (currentFormType === 'contact') {
        await submitContact(e);
    } else if (currentFormType === 'review') {
        const itemId = e.target.querySelector('[name="item_id"]').value;
        const sellerId = e.target.querySelector('[name="seller_id"]').value;
        await submitReview(e, parseInt(itemId), parseInt(sellerId));
    }
}

function viewImage(src) {
    showModal(`<img src="${src}" style="width: 100%; border-radius: 8px;">`);
}

document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
