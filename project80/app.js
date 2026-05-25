// ==================== 写作马拉松应用 ====================
const Storage = {
    KEY: 'writing-marathon-data',
    load() {
        try {
            const data = localStorage.getItem(this.KEY);
            return data ? JSON.parse(data) : this.defaultData();
        } catch (e) {
            return this.defaultData();
        }
    },
    save(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
    },
    defaultData() {
        return {
            challenges: [],
            sessions: [],
            badges: [],
            settings: {
                darkMode: true,
                volume: 50
            },
            milestones: []
        };
    }
};

let appData = Storage.load();

let musicState = {
    currentTrack: null,
    isPlaying: false
};

// ==================== 工具函数 ====================
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

function formatDate(date) {
    if (!date) return '—';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateTime(date) {
    if (!date) return '—';
    const d = new Date(date);
    return `${formatDate(date)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function today() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
}

function todayStr() {
    return formatDate(new Date());
}

function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function getWords(text) {
    if (!text) return 0;
    const nonSpaceChars = text.replace(/\s/g, '');
    return nonSpaceChars.length;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function save() {
    Storage.save(appData);
}

// ==================== 徽章定义 ====================
const BADGE_DEFINITIONS = [
    { id: 'first-challenge', name: '初次挑战', icon: '🎯', desc: '完成第一个写作挑战' },
    { id: 'nanowrimo-complete', name: 'NaNoWriMo 完成者', icon: '🏆', desc: '完成一次 NaNoWriMo 挑战' },
    { id: 'daily-30', name: '每日坚持', icon: '📅', desc: '完成30天每日挑战' },
    { id: 'word-10k', name: '万字达人', icon: '📝', desc: '累计写作达到1万字' },
    { id: 'word-50k', name: '半程马拉松', icon: '🏅', desc: '累计写作达到5万字' },
    { id: 'word-100k', name: '百字长征', icon: '🎖️', desc: '累计写作达到10万字' },
    { id: 'word-500k', name: '写作大师', icon: '👑', desc: '累计写作达到50万字' },
    { id: 'session-10', name: '初露锋芒', icon: '✨', desc: '完成10次写作会话' },
    { id: 'session-50', name: '笔耕不辍', icon: '🖋️', desc: '完成50次写作会话' },
    { id: 'session-100', name: '写作狂人', icon: '🔥', desc: '完成100次写作会话' },
    { id: 'speed-50', name: '快手作家', icon: '⚡', desc: '单次写作速度达到50字/分' },
    { id: 'speed-100', name: '飞速写作', icon: '🚀', desc: '单次写作速度达到100字/分' }
];

const STREAK_BADGES = [
    { id: 'streak-3', name: '连续3天', icon: '🔥', desc: '连续写作3天', days: 3 },
    { id: 'streak-7', name: '连续7天', icon: '⭐', desc: '连续写作7天', days: 7 },
    { id: 'streak-30', name: '连续30天', icon: '🌟', desc: '连续写作30天', days: 30 },
    { id: 'streak-100', name: '连续100天', icon: '💫', desc: '连续写作100天', days: 100 },
    { id: 'streak-365', name: '连续一年', icon: '🎇', desc: '连续写作365天', days: 365 }
];

// ==================== 导航控制 ====================
function initNavigation() {
    $$('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const moduleId = item.dataset.module;
            $$('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            $$('.module').forEach(m => m.classList.remove('active'));
            $(`#module-${moduleId}`).classList.add('active');
            refreshModule(moduleId);
        });
    });
}

function refreshModule(moduleId) {
    switch (moduleId) {
        case 'challenge': renderChallenges(); renderBadges(); break;
        case 'stats': renderStats(); renderSessions(); renderTimeDistribution(); renderSpeedChart(); break;
        case 'motivation': renderStreak(); renderStreakBadges(); renderRecords(); renderComparisons(); break;
        case 'insights': renderQualityAnalysis(); renderEfficientDays(); renderAnnualReport(); renderSuggestions(); break;
    }
}

// ==================== 写作挑战模块 ====================
function initChallengeModule() {
    const todayDate = new Date().toISOString().split('T')[0];
    $('#challengeStart').value = todayDate;
    $('#dailyStart').value = todayDate;

    $$('.challenge-type-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.challenge-type-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.dataset.type;
            $('#nanowrimoConfig').classList.toggle('hidden', type !== 'nanowrimo');
            $('#dailyConfig').classList.toggle('hidden', type !== 'daily');
        });
    });

    $('#startChallengeBtn').addEventListener('click', startChallenge);
}

function startChallenge() {
    const activeTab = $('.challenge-type-tabs .tab-btn.active').dataset.type;
    let challenge;

    if (activeTab === 'nanowrimo') {
        challenge = {
            id: Date.now(),
            name: $('#challengeName').value || 'NaNoWriMo 挑战',
            type: 'nanowrimo',
            goalWords: parseInt($('#challengeGoal').value) || 100000,
            currentWords: 0,
            startDate: $('#challengeStart').value,
            days: parseInt($('#challengeDays').value) || 30,
            dailyLog: {},
            status: 'active',
            createdAt: new Date().toISOString()
        };
    } else {
        challenge = {
            id: Date.now(),
            name: $('#dailyChallengeName').value || '每日写作挑战',
            type: 'daily',
            goalWords: parseInt($('#dailyGoal').value) || 500,
            currentWords: 0,
            startDate: $('#dailyStart').value,
            days: parseInt($('#dailyDays').value) || 100,
            dailyLog: {},
            status: 'active',
            createdAt: new Date().toISOString()
        };
    }

    appData.challenges.push(challenge);
    save();
    renderChallenges();
    showToast('挑战已创建！开始你的写作之旅吧 🚀', 'success');
}

function renderChallenges() {
    const container = $('#challengesList');
    const activeChallenges = appData.challenges.filter(c => c.status === 'active');

    if (activeChallenges.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>还没有进行中的挑战</p>
                <p class="empty-hint">创建一个挑战开始你的写作之旅吧！</p>
            </div>
        `;
        return;
    }

    container.innerHTML = activeChallenges.map(c => {
        const progress = c.type === 'nanowrimo'
            ? Math.min(100, (c.currentWords / c.goalWords) * 100)
            : Math.min(100, (getCompletedDaysCount(c) / c.days) * 100);

        const endDate = new Date(c.startDate);
        endDate.setDate(endDate.getDate() + c.days);
        const daysRemaining = Math.max(0, daysBetween(new Date(), endDate));
        const todayStrVal = todayStr();
        const todayWords = c.dailyLog[todayStrVal] || 0;

        return `
            <div class="challenge-card">
                <div class="challenge-card-header">
                    <div class="challenge-card-title">${c.name}</div>
                    <div class="challenge-card-status status-active">进行中</div>
                </div>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-info">
                        <span>${c.type === 'nanowrimo' ? `${c.currentWords.toLocaleString()} / ${c.goalWords.toLocaleString()} 字` : `${getCompletedDaysCount(c)} / ${c.days} 天`}</span>
                        <span>${progress.toFixed(1)}%</span>
                    </div>
                </div>
                <div class="challenge-meta">
                    <span>📅 截止: ${formatDate(endDate)}</span>
                    <span>⏳ 剩余: ${daysRemaining} 天</span>
                    ${c.type === 'daily' ? `<span>📝 今日: ${todayWords} 字</span>` : ''}
                </div>
                <div class="challenge-card-actions">
                    <button class="btn-secondary" onclick="viewChallengeDetail(${c.id})">查看详情</button>
                    <button class="btn-secondary" onclick="completeChallenge(${c.id})">标记完成</button>
                    <button class="btn-secondary" onclick="deleteChallenge(${c.id})" style="color: var(--danger)">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

function getCompletedDaysCount(challenge) {
    return Object.values(challenge.dailyLog).filter(w => w >= challenge.goalWords).length;
}

function viewChallengeDetail(id) {
    const challenge = appData.challenges.find(c => c.id === id);
    if (!challenge) return;

    const endDate = new Date(challenge.startDate);
    endDate.setDate(endDate.getDate() + challenge.days);

    let dailyGrid = '';
    for (let i = 0; i < challenge.days; i++) {
        const d = new Date(challenge.startDate);
        d.setDate(d.getDate() + i);
        const dateStr = formatDate(d);
        const words = challenge.dailyLog[dateStr] || 0;
        const completed = words >= challenge.goalWords;
        const isToday = dateStr === todayStr();
        dailyGrid += `<div class="daily-day ${completed ? 'completed' : ''} ${isToday ? 'today' : ''}" title="${dateStr}: ${words}字">${completed ? '✓' : ''}</div>`;
    }

    showModal(`
        <div class="challenge-detail-modal">
            <h3>${challenge.name}</h3>
            <div class="detail-row">
                <span class="detail-label">挑战类型</span>
                <span class="detail-value">${challenge.type === 'nanowrimo' ? 'NaNoWriMo 模式' : '每日挑战模式'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">${challenge.type === 'nanowrimo' ? '目标字数' : '每日目标'}</span>
                <span class="detail-value">${challenge.goalWords.toLocaleString()} 字</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">持续天数</span>
                <span class="detail-value">${challenge.days} 天</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">开始日期</span>
                <span class="detail-value">${formatDate(challenge.startDate)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">当前进度</span>
                <span class="detail-value">${challenge.currentWords.toLocaleString()} 字</span>
            </div>
            <h4 style="margin-top: 16px;">每日进度</h4>
            <div class="daily-progress-grid">${dailyGrid}</div>
        </div>
    `);
}

function completeChallenge(id) {
    const challenge = appData.challenges.find(c => c.id === id);
    if (!challenge) return;
    challenge.status = 'completed';
    save();
    renderChallenges();
    checkBadges();
    showToast('挑战已完成！恭喜你 🎉', 'success');
    showCelebration('挑战完成！', `恭喜完成「${challenge.name}」挑战！`);
}

function deleteChallenge(id) {
    if (!confirm('确定要删除这个挑战吗？')) return;
    appData.challenges = appData.challenges.filter(c => c.id !== id);
    save();
    renderChallenges();
    showToast('挑战已删除', 'info');
}

function renderBadges() {
    const container = $('#badgesGrid');
    const earnedBadgeIds = appData.badges.map(b => b.id);

    container.innerHTML = BADGE_DEFINITIONS.map(badge => {
        const earned = earnedBadgeIds.includes(badge.id);
        const earnedDate = earned ? appData.badges.find(b => b.id === badge.id).date : null;
        return `
            <div class="badge-card ${earned ? 'earned' : 'locked'}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-desc">${badge.desc}</div>
                ${earned ? `<div class="badge-date">${formatDate(earnedDate)}</div>` : ''}
            </div>
        `;
    }).join('');
}

function checkBadges() {
    const totalWords = appData.sessions.reduce((sum, s) => sum + (s.wordCount || 0), 0);
    const totalSessions = appData.sessions.length;
    const completedChallenges = appData.challenges.filter(c => c.status === 'completed');

    const checks = [
        { id: 'first-challenge', condition: completedChallenges.length >= 1 },
        { id: 'nanowrimo-complete', condition: completedChallenges.some(c => c.type === 'nanowrimo') },
        { id: 'daily-30', condition: completedChallenges.some(c => c.type === 'daily' && c.days >= 30) },
        { id: 'word-10k', condition: totalWords >= 10000 },
        { id: 'word-50k', condition: totalWords >= 50000 },
        { id: 'word-100k', condition: totalWords >= 100000 },
        { id: 'word-500k', condition: totalWords >= 500000 },
        { id: 'session-10', condition: totalSessions >= 10 },
        { id: 'session-50', condition: totalSessions >= 50 },
        { id: 'session-100', condition: totalSessions >= 100 },
        { id: 'speed-50', condition: appData.sessions.some(s => s.speed >= 50) },
        { id: 'speed-100', condition: appData.sessions.some(s => s.speed >= 100) }
    ];

    checks.forEach(check => {
        if (check.condition && !appData.badges.some(b => b.id === check.id)) {
            const badge = BADGE_DEFINITIONS.find(b => b.id === check.id);
            if (badge) {
                appData.badges.push({ id: check.id, date: new Date().toISOString() });
                showToast(`🎉 获得新徽章：${badge.name}`, 'success');
            }
        }
    });

    checkStreakBadges();
    save();
    renderBadges();
}

// ==================== 写作统计模块 ====================
function initStatsModule() {
    $('#exportSessionsBtn').addEventListener('click', exportSessions);
}

function exportSessions() {
    const data = JSON.stringify(appData.sessions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `writing-sessions-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('数据已导出', 'success');
}

function renderStats() {
    const totalWords = appData.sessions.reduce((sum, s) => sum + (s.wordCount || 0), 0);
    const totalTime = appData.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgSpeed = totalTime > 0 ? Math.round(totalWords / totalTime * 60) : 0;

    $('#totalSessions').textContent = appData.sessions.length;
    $('#totalWords').textContent = totalWords.toLocaleString();
    $('#totalTime').textContent = Math.round(totalTime);
    $('#avgSpeed').textContent = avgSpeed;
}

function renderSessions() {
    const container = $('#sessionsList');

    if (appData.sessions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>还没有写作记录</p>
                <p class="empty-hint">开始写作后，这里会显示你的记录</p>
            </div>
        `;
        return;
    }

    const sorted = [...appData.sessions].sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
    container.innerHTML = sorted.slice(0, 50).map(s => {
        const stars = s.quality ? '⭐'.repeat(s.quality) + '☆'.repeat(10 - s.quality) : '—';
        return `
            <div class="session-card">
                <div class="session-date">${formatDateTime(s.endTime)}</div>
                <div class="session-stats">
                    <div class="session-stat">
                        <div class="session-stat-label">字数</div>
                        <div class="session-stat-value">${s.wordCount}</div>
                    </div>
                    <div class="session-stat">
                        <div class="session-stat-label">时长</div>
                        <div class="session-stat-value">${s.duration}分</div>
                    </div>
                    <div class="session-stat">
                        <div class="session-stat-label">速度</div>
                        <div class="session-stat-value">${s.speed}字/分</div>
                    </div>
                </div>
                <div class="session-quality">
                    <span class="quality-stars">${stars}</span>
                </div>
                <button class="session-delete" onclick="deleteSession(${s.id})" title="删除">🗑️</button>
            </div>
        `;
    }).join('');
}

function deleteSession(id) {
    if (!confirm('确定要删除这条记录吗？')) return;
    appData.sessions = appData.sessions.filter(s => s.id !== id);
    save();
    renderStats();
    renderSessions();
    renderTimeDistribution();
    renderSpeedChart();
    updateChallengeProgress();
}

function renderTimeDistribution() {
    const container = $('#timeChart');
    const hourCounts = new Array(24).fill(0);

    appData.sessions.forEach(s => {
        if (s.startTime) {
            const hour = new Date(s.startTime).getHours();
            hourCounts[hour]++;
        }
    });

    const maxCount = Math.max(...hourCounts, 1);

    container.innerHTML = hourCounts.map((count, hour) => {
        const height = (count / maxCount) * 100;
        return `
            <div class="time-bar ${count > 0 ? 'active' : ''}" style="height: ${Math.max(height, 2)}%" title="${hour}:00 - ${count}次">
                <div class="time-bar-label">${hour}</div>
            </div>
        `;
    }).join('');

    const bestHour = hourCounts.indexOf(Math.max(...hourCounts));
    const insight = maxCount > 0
        ? `你最常在 <strong>${bestHour}:00 - ${bestHour + 1}:00</strong> 时段写作，共完成 ${Math.max(...hourCounts)} 次写作`
        : '开始写作后，这里会显示你的最佳写作时段';
    $('#timeInsight').innerHTML = insight;
}

function renderSpeedChart() {
    const container = $('#speedChart');
    const sorted = [...appData.sessions].sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
    const recent = sorted.slice(-20);

    if (recent.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>暂无数据</p></div>';
        return;
    }

    const maxSpeed = Math.max(...recent.map(s => s.speed), 1);

    container.innerHTML = recent.map((s, i) => {
        const height = (s.speed / maxSpeed) * 100;
        const date = formatDate(s.endTime);
        return `
            <div class="speed-bar" style="height: ${Math.max(height, 2)}%" title="${date}: ${s.speed}字/分">
                <div class="speed-bar-label">${i + 1}</div>
            </div>
        `;
    }).join('');
}

// ==================== 激励系统模块 ====================
function calculateStreak() {
    if (appData.sessions.length === 0) return 0;

    const dates = [...new Set(appData.sessions.map(s => formatDate(s.endTime)))];
    dates.sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const dateStr of dates) {
        const sessionDate = new Date(dateStr);
        sessionDate.setHours(0, 0, 0, 0);
        const diff = daysBetween(sessionDate, currentDate);

        if (diff === 0 || diff === 1) {
            streak++;
            currentDate = sessionDate;
        } else if (diff > 1) {
            break;
        }
    }

    return streak;
}

function getMaxStreak() {
    if (appData.sessions.length === 0) return 0;

    const dates = [...new Set(appData.sessions.map(s => formatDate(s.endTime)))];
    dates.sort();

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < dates.length; i++) {
        const diff = daysBetween(dates[i - 1], dates[i]);
        if (diff === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }

    return maxStreak;
}

function renderStreak() {
    const currentStreak = calculateStreak();
    const maxStreak = getMaxStreak();

    $('#currentStreak').textContent = currentStreak;
    $('#streakCurrent').textContent = `${currentStreak} 天`;
    $('#streakMax').textContent = `${maxStreak} 天`;

    const sortedSessions = [...appData.sessions].sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
    $('#streakLast').textContent = sortedSessions.length > 0 ? formatDateTime(sortedSessions[0].endTime) : '—';
    $('#sidebarStreak').textContent = currentStreak;
}

function checkStreakBadges() {
    const currentStreak = calculateStreak();
    STREAK_BADGES.forEach(badge => {
        if (currentStreak >= badge.days && !appData.badges.some(b => b.id === badge.id)) {
            appData.badges.push({ id: badge.id, date: new Date().toISOString() });
            showToast(`🔥 获得 Streak 徽章：${badge.name}！`, 'success');
        }
    });
}

function renderStreakBadges() {
    const container = $('#streakBadges');
    const currentStreak = calculateStreak();

    container.innerHTML = STREAK_BADGES.map(badge => {
        const earned = currentStreak >= badge.days || appData.badges.some(b => b.id === badge.id);
        return `
            <div class="streak-badge ${earned ? 'earned' : 'locked'}">
                <div class="streak-badge-icon">${badge.icon}</div>
                <div class="streak-badge-name">${badge.name}</div>
            </div>
        `;
    }).join('');
}

function renderRecords() {
    if (appData.sessions.length === 0) {
        $('#maxDailyWords').textContent = '0';
        $('#maxSessionSpeed').textContent = '0';
        $('#maxSessionDuration').textContent = '0';
        $('#maxSessionWords').textContent = '0';
        return;
    }

    const dailyWords = {};
    appData.sessions.forEach(s => {
        const date = formatDate(s.endTime);
        dailyWords[date] = (dailyWords[date] || 0) + s.wordCount;
    });

    const maxDailyEntry = Object.entries(dailyWords).sort((a, b) => b[1] - a[1])[0];
    const maxSpeedSession = appData.sessions.reduce((max, s) => s.speed > max.speed ? s : max, appData.sessions[0]);
    const maxDurationSession = appData.sessions.reduce((max, s) => s.duration > max.duration ? s : max, appData.sessions[0]);
    const maxWordsSession = appData.sessions.reduce((max, s) => s.wordCount > max.wordCount ? s : max, appData.sessions[0]);

    $('#maxDailyWords').textContent = maxDailyEntry ? maxDailyEntry[1] : '0';
    $('#maxDailyWordsDate').textContent = maxDailyEntry ? maxDailyEntry[0] : '—';
    $('#maxSessionSpeed').textContent = maxSpeedSession.speed;
    $('#maxSessionSpeedDate').textContent = formatDateTime(maxSpeedSession.endTime);
    $('#maxSessionDuration').textContent = maxDurationSession.duration;
    $('#maxSessionDurationDate').textContent = formatDateTime(maxDurationSession.endTime);
    $('#maxSessionWords').textContent = maxWordsSession.wordCount;
    $('#maxSessionWordsDate').textContent = formatDateTime(maxWordsSession.endTime);
}

function renderComparisons() {
    const dailyWords = {};
    appData.sessions.forEach(s => {
        const date = formatDate(s.endTime);
        dailyWords[date] = (dailyWords[date] || 0) + s.wordCount;
    });

    const todayStrVal = todayStr();
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    const todayWords = dailyWords[todayStrVal] || 0;
    const yesterdayWords = dailyWords[yesterdayStr] || 0;

    updateComparison('Yesterday', todayWords, yesterdayWords, '字');

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    let thisWeekWords = 0;
    let lastWeekWords = 0;

    Object.entries(dailyWords).forEach(([date, words]) => {
        const d = new Date(date);
        if (d >= weekStart) thisWeekWords += words;
        else if (d >= lastWeekStart) lastWeekWords += words;
    });

    updateComparison('LastWeek', thisWeekWords, lastWeekWords, '字');

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    let thisMonthWords = 0;
    let lastMonthWords = 0;

    Object.entries(dailyWords).forEach(([date, words]) => {
        const d = new Date(date);
        if (d >= monthStart) thisMonthWords += words;
        else if (d >= lastMonthStart) lastMonthWords += words;
    });

    updateComparison('LastMonth', thisMonthWords, lastMonthWords, '字');
}

function updateComparison(type, current, previous, unit) {
    const maxVal = Math.max(current, previous, 1);
    const currentPct = (current / maxVal) * 100;
    const previousPct = (previous / maxVal) * 100;

    $(`#bar${type}`).style.width = `${previousPct}%`;
    $(`#val${type}`).textContent = `${previous}${unit}`;

    if (type === 'Yesterday') {
        $('#barToday').style.width = `${currentPct}%`;
        $('#valToday').textContent = `${current}${unit}`;
    } else if (type === 'LastWeek') {
        $('#barThisWeek').style.width = `${currentPct}%`;
        $('#valThisWeek').textContent = `${current}${unit}`;
    } else if (type === 'LastMonth') {
        $('#barThisMonth').style.width = `${currentPct}%`;
        $('#valThisMonth').textContent = `${current}${unit}`;
    }

    const diff = current - previous;
    const cmpEl = $(`#cmp${type}`);
    if (previous === 0 && current === 0) {
        cmpEl.textContent = '—';
        cmpEl.className = 'comparison-value neutral';
    } else if (diff > 0) {
        cmpEl.textContent = `+${diff}${unit} ↑`;
        cmpEl.className = 'comparison-value positive';
    } else if (diff < 0) {
        cmpEl.textContent = `${diff}${unit} ↓`;
        cmpEl.className = 'comparison-value negative';
    } else {
        cmpEl.textContent = `持平`;
        cmpEl.className = 'comparison-value neutral';
    }
}

// ==================== 写作环境模块 ====================
let editorState = {
    startTime: null,
    timerInterval: null,
    initialWords: 0,
    currentWords: 0,
    isPaused: false,
    pauseStartTime: null,
    totalPauseTime: 0,
    lastMilestone: 0
};

function initEnvironmentModule() {
    const editor = $('#writingEditor');

    editor.addEventListener('input', () => {
        const words = getWords(editor.value);
        editorState.currentWords = words;
        $('#editorWordCount').textContent = words;
        checkMilestone(words);
    });

    $('#finishSessionBtn').addEventListener('click', finishSession);
    $('#clearEditorBtn').addEventListener('click', () => {
        if (confirm('确定要清空编辑器吗？')) {
            editor.value = '';
            editorState.initialWords = 0;
            editorState.currentWords = 0;
            editorState.lastMilestone = 0;
            $('#editorWordCount').textContent = '0';
        }
    });

    $('#pauseTimerBtn').addEventListener('click', togglePause);

    $('#toggleMusicBtn').addEventListener('click', () => {
        $('#musicPlayer').classList.toggle('show');
    });

    $('#closeMusicBtn').addEventListener('click', () => {
        $('#musicPlayer').classList.remove('show');
    });

    $('#fullscreenBtn').addEventListener('click', toggleFullscreen);
    $('#darkModeBtn').addEventListener('click', toggleDarkMode);

    initMusicPlayer();

    $('#volumeSlider').addEventListener('input', (e) => {
        const audio = $('#bgAudio');
        audio.volume = e.target.value / 100;
        appData.settings.volume = e.target.value;
        save();
    });

    $('#volumeSlider').value = appData.settings.volume || 50;

    startTimer();
}

function startTimer() {
    if (editorState.timerInterval) clearInterval(editorState.timerInterval);
    editorState.startTime = Date.now();
    editorState.isPaused = false;
    editorState.totalPauseTime = 0;

    editorState.timerInterval = setInterval(() => {
        if (editorState.isPaused) return;

        const elapsed = Math.floor((Date.now() - editorState.startTime - editorState.totalPauseTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        $('#editorTimer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (editorState.currentWords > 0 && elapsed > 0) {
            const speed = Math.round(editorState.currentWords / (elapsed / 60));
            $('#editorSpeed').textContent = speed;
        }
    }, 1000);
}

function togglePause() {
    editorState.isPaused = !editorState.isPaused;
    const btn = $('#pauseTimerBtn');

    if (editorState.isPaused) {
        editorState.pauseStartTime = Date.now();
        btn.textContent = '▶ 继续计时';
    } else {
        editorState.totalPauseTime += Date.now() - editorState.pauseStartTime;
        btn.textContent = '⏸ 暂停计时';
    }
}

function checkMilestone(words) {
    const milestone = Math.floor(words / 10000);
    if (milestone > editorState.lastMilestone && milestone > 0) {
        editorState.lastMilestone = milestone;
        showMilestoneCelebration(milestone * 10000);
    }
}

function showMilestoneCelebration(words) {
    const overlay = $('#milestoneOverlay');
    $('#milestoneText').textContent = `恭喜完成 ${words.toLocaleString()} 字！`;
    $('#milestoneSub').textContent = '继续加油，创造更多精彩！';
    overlay.classList.add('show');

    setTimeout(() => {
        overlay.classList.remove('show');
    }, 2000);

    showCelebration('里程碑达成！', `你已经写作了 ${words.toLocaleString()} 字！`);
}

function finishSession() {
    const editor = $('#writingEditor');
    const words = getWords(editor.value);

    if (words === 0) {
        showToast('请先写一些内容再完成会话', 'warning');
        return;
    }

    if (editorState.timerInterval) clearInterval(editorState.timerInterval);

    const duration = Math.max(1, Math.floor((Date.now() - editorState.startTime - editorState.totalPauseTime) / 60000));
    const speed = Math.round(words / duration);

    const session = {
        id: Date.now(),
        startTime: new Date(editorState.startTime).toISOString(),
        endTime: new Date().toISOString(),
        wordCount: words,
        duration: duration,
        speed: speed,
        content: editor.value.substring(0, 500),
        quality: null,
        note: ''
    };

    appData.sessions.push(session);
    save();

    updateChallengeProgress();
    checkBadges();

    showQualityModal(session.id);

    editor.value = '';
    editorState.initialWords = 0;
    editorState.currentWords = 0;
    editorState.lastMilestone = 0;
    $('#editorWordCount').textContent = '0';
    $('#editorTimer').textContent = '00:00';
    $('#editorSpeed').textContent = '0';

    startTimer();
    showToast('会话已记录！本次写作：' + words + '字，' + duration + '分钟，' + speed + '字/分', 'success');
}

function updateChallengeProgress() {
    const todayStrVal = todayStr();
    const dailyWords = {};
    appData.sessions.forEach(s => {
        const date = formatDate(s.endTime);
        dailyWords[date] = (dailyWords[date] || 0) + s.wordCount;
    });

    appData.challenges.forEach(challenge => {
        if (challenge.status !== 'active') return;

        const startDate = new Date(challenge.startDate);
        const endDate = new Date(challenge.startDate);
        endDate.setDate(endDate.getDate() + challenge.days);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let totalWords = 0;
        challenge.dailyLog = {};

        Object.entries(dailyWords).forEach(([date, words]) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            if (d >= startDate && d <= endDate) {
                totalWords += words;
                challenge.dailyLog[date] = words;
            }
        });

        challenge.currentWords = totalWords;

        if (today > endDate) {
            if (challenge.type === 'nanowrimo' && totalWords >= challenge.goalWords) {
                challenge.status = 'completed';
            } else if (challenge.type === 'daily') {
                const completedDays = getCompletedDaysCount(challenge);
                if (completedDays >= challenge.days) {
                    challenge.status = 'completed';
                }
            }
        }
    });

    save();
}

function showQualityModal(sessionId) {
    const modal = $('#qualityModal');
    modal.classList.add('show');

    const slider = $('#qualityRating');
    const valueDisplay = $('#qualityRatingValue');
    slider.value = 5;
    valueDisplay.textContent = '5';

    slider.oninput = () => {
        valueDisplay.textContent = slider.value;
    };

    $('#qualityNote').value = '';

    $('#qualitySaveBtn').onclick = () => {
        const session = appData.sessions.find(s => s.id === sessionId);
        if (session) {
            session.quality = parseInt(slider.value);
            session.note = $('#qualityNote').value;
            save();
        }
        modal.classList.remove('show');
        refreshAll();
    };

    $('#qualitySkipBtn').onclick = () => {
        modal.classList.remove('show');
        refreshAll();
    };
}

function initMusicPlayer() {
    $$('.play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const track = btn.dataset.track;
            playMusicTrack(track);
        });
    });

    $$('.music-track').forEach(track => {
        track.addEventListener('click', () => {
            const trackName = track.dataset.track;
            playMusicTrack(trackName);
        });
    });
}

function playMusicTrack(track) {
    const audio = $('#bgAudio');
    const trackUrls = {
        lofi: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
        rain: 'https://cdn.pixabay.com/download/audio/2021/10/07/audio_94b6a3f5b6.mp3',
        forest: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
        cafe: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946bc1e4d1.mp3',
        waves: 'https://cdn.pixabay.com/download/audio/2021/10/07/audio_94b6a3f5b6.mp3'
    };

    if (!trackUrls[track]) return;

    if (musicState.currentTrack === track) {
        if (musicState.isPlaying) {
            audio.pause();
            musicState.isPlaying = false;
            const activeBtn = document.querySelector(`.play-btn[data-track="${track}"]`);
            if (activeBtn) activeBtn.textContent = '▶';
        } else {
            audio.play().catch(() => {
                showToast('音乐加载中，请稍候...', 'info');
            });
            musicState.isPlaying = true;
            const activeBtn = document.querySelector(`.play-btn[data-track="${track}"]`);
            if (activeBtn) activeBtn.textContent = '⏸';
        }
        return;
    }

    audio.src = trackUrls[track];
    audio.volume = appData.settings.volume / 100;
    audio.play().catch(() => {
        showToast('音乐加载中，请稍候...', 'info');
    });
    musicState.currentTrack = track;
    musicState.isPlaying = true;

    $$('.music-track').forEach(t => t.classList.remove('active'));
    const trackEl = document.querySelector(`.music-track[data-track="${track}"]`);
    if (trackEl) trackEl.classList.add('active');

    $$('.play-btn').forEach(b => b.textContent = '▶');
    const activeBtn = document.querySelector(`.play-btn[data-track="${track}"]`);
    if (activeBtn) activeBtn.textContent = '⏸';
}

function toggleFullscreen() {
    document.body.classList.toggle('fullscreen-active');
}

function toggleDarkMode() {
    appData.settings.darkMode = !appData.settings.darkMode;
    document.documentElement.setAttribute('data-theme', appData.settings.darkMode ? 'dark' : 'light');
    save();
}

// ==================== 分析洞察模块 ====================
function initInsightsModule() {
}

function renderQualityAnalysis() {
    const container = $('#qualityChart');
    const insightContainer = $('#qualityInsight');

    const qualityData = new Array(10).fill(0);
    const qualitySpeed = new Array(10).fill(0);

    appData.sessions.forEach(s => {
        if (s.quality) {
            const idx = Math.min(s.quality - 1, 9);
            qualityData[idx]++;
            qualitySpeed[idx] += s.speed || 0;
        }
    });

    const maxCount = Math.max(...qualityData, 1);

    container.innerHTML = qualityData.map((count, i) => {
        const height = (count / maxCount) * 100;
        const avgSpeed = count > 0 ? Math.round(qualitySpeed[i] / count) : 0;
        return `
            <div class="quality-bar ${count > 0 ? 'active' : ''}" style="height: ${Math.max(height, 5)}%" title="评分 ${i + 1}: ${count}次, 平均速度 ${avgSpeed}字/分">
                ${i + 1}
            </div>
        `;
    }).join('');

    const ratedSessions = appData.sessions.filter(s => s.quality);
    if (ratedSessions.length > 0) {
        const highQuality = ratedSessions.filter(s => s.quality >= 8);
        const lowQuality = ratedSessions.filter(s => s.quality <= 3);

        const avgSpeedHigh = highQuality.length > 0
            ? Math.round(highQuality.reduce((sum, s) => sum + (s.speed || 0), 0) / highQuality.length)
            : 0;
        const avgSpeedLow = lowQuality.length > 0
            ? Math.round(lowQuality.reduce((sum, s) => sum + (s.speed || 0), 0) / lowQuality.length)
            : 0;

        let insight = `<p>你共有 <strong>${ratedSessions.length}</strong> 次评分记录</p>`;
        if (highQuality.length > 0) {
            insight += `<p>高质量写作（8-10分）：<strong>${highQuality.length}</strong> 次，平均速度 <strong>${avgSpeedHigh}</strong> 字/分</p>`;
        }
        if (lowQuality.length > 0) {
            insight += `<p>低质量写作（1-3分）：<strong>${lowQuality.length}</strong> 次，平均速度 <strong>${avgSpeedLow}</strong> 字/分</p>`;
        }

        const speedDiff = avgSpeedHigh - avgSpeedLow;
        if (Math.abs(speedDiff) > 10) {
            insight += `<p style="margin-top: 12px; color: ${speedDiff > 0 ? 'var(--success)' : 'var(--warning)'}">
                💡 ${speedDiff > 0 ? '你在高质量写作时速度更快' : '你在低质量写作时速度更快'}，差异约 <strong>${Math.abs(speedDiff)}</strong> 字/分
            </p>`;
        }

        insightContainer.innerHTML = insight;
    }
}

function renderEfficientDays() {
    const container = $('#efficientDays');

    if (appData.sessions.length < 5) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <p>积累更多写作数据后，这里将显示你的高效写作日特征</p>
            </div>
        `;
        return;
    }

    const dayStats = {};
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    appData.sessions.forEach(s => {
        const day = new Date(s.endTime).getDay();
        if (!dayStats[day]) dayStats[day] = { count: 0, words: 0, speed: 0 };
        dayStats[day].count++;
        dayStats[day].words += s.wordCount || 0;
        dayStats[day].speed += s.speed || 0;
    });

    const sortedDays = Object.entries(dayStats)
        .map(([day, stats]) => ({
            day: parseInt(day),
            name: dayNames[day],
            avgWords: Math.round(stats.words / stats.count),
            avgSpeed: Math.round(stats.speed / stats.count),
            count: stats.count
        }))
        .sort((a, b) => b.avgWords - a.avgWords);

    const bestDay = sortedDays[0];
    const worstDay = sortedDays[sortedDays.length - 1];

    container.innerHTML = `
        <div class="efficient-item">
            <div class="efficient-label">最高效日</div>
            <div class="efficient-value">${bestDay.name} <span>均${bestDay.avgWords}字</span></div>
        </div>
        <div class="efficient-item">
            <div class="efficient-label">最佳速度日</div>
            <div class="efficient-value">${sortedDays.sort((a, b) => b.avgSpeed - a.avgSpeed)[0].name} <span>${sortedDays.sort((a, b) => b.avgSpeed - a.avgSpeed)[0].avgSpeed}字/分</span></div>
        </div>
        <div class="efficient-item">
            <div class="efficient-label">最低效日</div>
            <div class="efficient-value">${worstDay.name} <span>均${worstDay.avgWords}字</span></div>
        </div>
        <div class="efficient-item">
            <div class="efficient-label">最活跃日</div>
            <div class="efficient-value">${sortedDays.sort((a, b) => b.count - a.count)[0].name} <span>${sortedDays.sort((a, b) => b.count - a.count)[0].count}次</span></div>
        </div>
    `;
}

function renderAnnualReport() {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const yearSessions = appData.sessions.filter(s => {
        const d = new Date(s.endTime);
        return d >= yearStart && d <= yearEnd;
    });

    const totalWords = yearSessions.reduce((sum, s) => sum + (s.wordCount || 0), 0);
    const writingDates = [...new Set(yearSessions.map(s => formatDate(s.endTime)))];
    const maxStreak = getMaxStreak();
    const avgDaily = writingDates.length > 0 ? Math.round(totalWords / writingDates.length) : 0;

    $('#annualTotalWords').textContent = totalWords.toLocaleString();
    $('#annualWritingDays').textContent = writingDates.length;
    $('#annualMaxStreak').textContent = maxStreak;
    $('#annualAvgDaily').textContent = avgDaily.toLocaleString();

    const monthlyWords = new Array(12).fill(0);
    yearSessions.forEach(s => {
        const month = new Date(s.endTime).getMonth();
        monthlyWords[month] += s.wordCount || 0;
    });

    const maxMonthWords = Math.max(...monthlyWords, 1);
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    $('#annualChart').innerHTML = monthlyWords.map((words, i) => {
        const height = (words / maxMonthWords) * 100;
        return `
            <div class="report-bar" style="height: ${Math.max(height, 2)}%" title="${monthNames[i]}: ${words.toLocaleString()}字">
            </div>
        `;
    }).join('');

    if (yearSessions.length > 0) {
        const bestMonth = monthlyWords.indexOf(Math.max(...monthlyWords));
        const summary = `
            ${currentYear}年，你共完成了 <strong>${yearSessions.length}</strong> 次写作会话，
            写作了 <strong>${totalWords.toLocaleString()}</strong> 字，
            覆盖了 <strong>${writingDates.length}</strong> 天。
            最活跃的月份是 <strong>${monthNames[bestMonth]}</strong>，
            写作了 <strong>${monthlyWords[bestMonth].toLocaleString()}</strong> 字。
            ${maxStreak >= 7 ? `最长连续写作记录是 <strong>${maxStreak}</strong> 天，非常棒！` : ''}
            继续保持，明年会更好！
        `;
        $('#annualSummary').innerHTML = summary;
    }
}

function renderSuggestions() {
    const container = $('#suggestionsCard');

    if (appData.sessions.length < 10) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✨</div>
                <p>继续写作，获取个性化建议</p>
            </div>
        `;
        return;
    }

    const suggestions = [];
    const totalWords = appData.sessions.reduce((sum, s) => sum + (s.wordCount || 0), 0);
    const avgDuration = appData.sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / appData.sessions.length;
    const avgSpeed = appData.sessions.reduce((sum, s) => sum + (s.speed || 0), 0) / appData.sessions.length;
    const currentStreak = calculateStreak();

    if (avgDuration < 15) {
        suggestions.push({ icon: '⏰', text: '尝试延长每次写作时间到30分钟以上，有助于进入深度写作状态' });
    }

    if (avgSpeed < 20) {
        suggestions.push({ icon: '⚡', text: '写作速度可以提升。试试自由写作练习，不必过多修改，先完成再完美' });
    }

    if (currentStreak < 3) {
        suggestions.push({ icon: '🔥', text: '保持连续写作很重要。即使每天只写100字，也比间隔几天写很多更有效' });
    }

    if (totalWords < 10000) {
        suggestions.push({ icon: '🎯', text: '设定一个短期目标，比如先写完1万字，这会让你更有动力' });
    }

    const hourCounts = new Array(24).fill(0);
    appData.sessions.forEach(s => {
        if (s.startTime) hourCounts[new Date(s.startTime).getHours()]++;
    });
    const bestHour = hourCounts.indexOf(Math.max(...hourCounts));
    suggestions.push({ icon: '⏰', text: `你最常在 ${bestHour}:00 写作，建议固定这个时段作为专属写作时间` });

    if (appData.sessions.length > 50) {
        suggestions.push({ icon: '📊', text: '你已经有丰富的写作数据了！回顾一下你的作品，也许能发现独特的写作风格' });
    }

    if (suggestions.length === 0) {
        suggestions.push({ icon: '🌟', text: '你做得很棒！继续保持现有的写作习惯' });
    }

    container.innerHTML = `<div class="suggestion-list">${suggestions.map(s => `
        <div class="suggestion-item">
            <div class="suggestion-icon">${s.icon}</div>
            <div class="suggestion-text">${s.text}</div>
        </div>
    `).join('')}</div>`;
}

// ==================== 庆祝动画 ====================
function showCelebration(title, message) {
    const container = $('#celebrationContainer');
    $('#celebrationTitle').textContent = title;
    $('#celebrationMessage').textContent = message;
    container.classList.add('show');

    $('#celebrationCloseBtn').onclick = () => {
        container.classList.remove('show');
    };

    setTimeout(() => {
        container.classList.remove('show');
    }, 5000);
}

// ==================== 模态框 ====================
function showModal(content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.innerHTML = `<div class="modal">${content}<div class="modal-actions"><button class="btn-primary" onclick="this.closest('.modal-overlay').remove()">关闭</button></div></div>`;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
}

// ==================== 初始化 ====================
function refreshAll() {
    renderChallenges();
    renderBadges();
    renderStats();
    renderSessions();
    renderTimeDistribution();
    renderSpeedChart();
    renderStreak();
    renderStreakBadges();
    renderRecords();
    renderComparisons();
    renderQualityAnalysis();
    renderEfficientDays();
    renderAnnualReport();
    renderSuggestions();
}

function init() {
    initNavigation();
    initChallengeModule();
    initStatsModule();
    initEnvironmentModule();
    initInsightsModule();

    document.documentElement.setAttribute('data-theme', appData.settings.darkMode ? 'dark' : 'light');

    refreshAll();
    checkBadges();
    checkStreakBadges();

    setInterval(() => {
        updateChallengeProgress();
        renderChallenges();
    }, 60000);

    console.log('✍️ 写作马拉松应用已启动');
}

document.addEventListener('DOMContentLoaded', init);
