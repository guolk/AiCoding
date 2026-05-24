// ==================== 数据存储管理 ====================
const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    }
};

// ==================== 应用状态管理 ====================
const AppState = {
    projects: Storage.get('projects', []),
    characters: Storage.get('characters', []),
    worldSettings: Storage.get('worldSettings', []),
    plotboards: Storage.get('plotboards', []),
    savedPrompts: Storage.get('savedPrompts', []),
    writingSessions: Storage.get('writingSessions', []),
    currentProject: null,
    currentEditorProject: null,
    editorContent: '',
    sessionStartWords: 0,
    typewriterMode: false,
    immersionMode: false,
    currentSound: 'none',
    soundVolume: 50,
    editingCharacterId: null,
    editingWorldId: null,
    editingSceneId: null,
    currentWorldCategory: 'geography',
    currentPlotProject: null,
    generatedPrompt: null,
    audioContext: null,
    audioNode: null,
    audioGain: null
};

// ==================== 工具函数 ====================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateShort(date) {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getProjectTypeLabel(type) {
    const types = {
        novel: '长篇小说',
        short: '短篇小说',
        script: '剧本',
        essay: '随笔',
        poem: '诗歌',
        other: '其他'
    };
    return types[type] || type;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function countWords(text) {
    if (!text) return 0;
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
}

function countParagraphs(text) {
    if (!text) return 0;
    return text.split(/\n\s*\n/).filter(p => p.trim()).length;
}

function countSentences(text) {
    if (!text) return 0;
    const sentences = text.split(/[。！？.!?]+/).filter(s => s.trim());
    return sentences.length;
}

// ==================== 主题切换 ====================
function initTheme() {
    const savedTheme = Storage.get('theme', 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    document.getElementById('themeToggle').addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        Storage.set('theme', newTheme);
    });
}

// ==================== 全屏功能 ====================
function initFullscreen() {
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
}

// ==================== 模块导航 ====================
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const modules = document.querySelectorAll('.module');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const moduleName = btn.dataset.module;
            
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            modules.forEach(m => m.classList.remove('active'));
            document.getElementById(`${moduleName}-module`).classList.add('active');
        });
    });

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            const parentSection = btn.closest('.module');
            
            parentSection.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            parentSection.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            parentSection.querySelector(`#${tabName}-tab`).classList.add('active');
        });
    });

    const analysisBtns = document.querySelectorAll('.analysis-nav-btn');
    analysisBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const analysisName = btn.dataset.analysis;
            
            analysisBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.analysis-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`${analysisName}-analysis`).classList.add('active');
        });
    });
}

// ==================== 模态框管理 ====================
function initModals() {
    const closeBtns = document.querySelectorAll('[data-close]');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.close;
            document.getElementById(modalId).classList.remove('active');
        });
    });

    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ==================== 项目管理模块 ====================
function initProjectModule() {
    try {
        renderProjects();
        updateProjectSelects();

        const addProjectBtn = document.getElementById('addProjectBtn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => {
                try {
                    AppState.currentProject = null;
                    document.getElementById('projectModalTitle').textContent = '新建项目';
                    document.getElementById('projectForm').reset();
                    document.getElementById('deadline').value = '';
                    document.getElementById('projectModal').classList.add('active');
                    console.log('📝 打开新建项目模态框');
                } catch (e) {
                    console.error('打开新建项目模态框失败:', e);
                    showToast('操作失败，请重试', 'error');
                }
            });
        } else {
            console.error('未找到 addProjectBtn 元素');
        }

        const saveProjectBtn = document.getElementById('saveProjectBtn');
        if (saveProjectBtn) {
            saveProjectBtn.addEventListener('click', saveProject);
        }

        const startWritingBtn = document.getElementById('startWritingBtn');
        if (startWritingBtn) {
            startWritingBtn.addEventListener('click', () => {
                if (AppState.currentProject) {
                    AppState.currentEditorProject = AppState.currentProject;
                    document.getElementById('editorProjectSelect').value = AppState.currentProject.id;
                    loadProjectContent();
                    document.querySelector('[data-module="editor"]').click();
                    document.getElementById('projectDetailModal').classList.remove('active');
                }
            });
        }

        const editProjectBtn = document.getElementById('editProjectBtn');
        if (editProjectBtn) {
            editProjectBtn.addEventListener('click', () => {
                if (AppState.currentProject) {
                    fillProjectForm(AppState.currentProject);
                    document.getElementById('projectModalTitle').textContent = '编辑项目';
                    document.getElementById('projectDetailModal').classList.remove('active');
                    document.getElementById('projectModal').classList.add('active');
                }
            });
        }

        const deleteProjectBtn = document.getElementById('deleteProjectBtn');
        if (deleteProjectBtn) {
            deleteProjectBtn.addEventListener('click', () => {
                if (AppState.currentProject && confirm('确定要删除这个项目吗？相关的角色、设定和情节板也会被删除。')) {
                    deleteProject(AppState.currentProject.id);
                    document.getElementById('projectDetailModal').classList.remove('active');
                }
            });
        }
    } catch (e) {
        console.error('项目管理模块初始化失败:', e);
        throw e;
    }
}

function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) {
        console.error('未找到 projectsGrid 元素');
        return;
    }
    
    if (AppState.projects.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📁</div>
                <h3>还没有写作项目</h3>
                <p>点击上方"新建项目"按钮开始你的创作之旅</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = AppState.projects.map(project => {
        const progress = project.content ? countWords(project.content) : 0;
        const goal = project.wordGoal || 50000;
        const percent = Math.min(100, Math.round((progress / goal) * 100));
        
        return `
            <div class="project-card" data-id="${project.id}">
                <span class="project-type-badge">${getProjectTypeLabel(project.type)}</span>
                <h3>${project.name}</h3>
                <p class="project-desc">${project.description || '暂无描述'}</p>
                <div class="project-meta">
                    <span>创建于 ${formatDate(project.createdAt)}</span>
                    <span>${progress} / ${goal.toLocaleString()} 字</span>
                </div>
                <div class="project-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${percent}%"></div>
                    </div>
                    <div class="progress-info">
                        <span>${percent}% 完成</span>
                        <span>每日目标: ${project.dailyGoal || 1000} 字</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.dataset.id;
            const project = AppState.projects.find(p => p.id === projectId);
            if (project) {
                AppState.currentProject = project;
                showProjectDetail(project);
            }
        });
    });
}

function showProjectDetail(project) {
    const progress = project.content ? countWords(project.content) : 0;
    const goal = project.wordGoal || 50000;
    const percent = Math.min(100, Math.round((progress / goal) * 100));

    document.getElementById('detailProjectTitle').textContent = project.name;
    document.getElementById('detailType').textContent = getProjectTypeLabel(project.type);
    document.getElementById('detailCreated').textContent = formatDate(project.createdAt);
    document.getElementById('detailDeadline').textContent = project.deadline ? formatDate(project.deadline) : '未设置';
    document.getElementById('detailGoal').textContent = goal.toLocaleString() + ' 字';
    document.getElementById('detailDaily').textContent = (project.dailyGoal || 1000) + ' 字';
    document.getElementById('detailCurrentWords').textContent = progress.toLocaleString();
    document.getElementById('detailGoalWords').textContent = goal.toLocaleString();
    document.getElementById('detailProgressBar').style.width = percent + '%';
    document.getElementById('detailProgressPercent').textContent = percent + '%';

    renderCalendarHeatmap(project);
    renderDailyChart(project);

    document.getElementById('projectDetailModal').classList.add('active');
}

function renderCalendarHeatmap(project) {
    const container = document.getElementById('calendarHeatmap');
    const writingHistory = project.writingHistory || {};
    
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);
    
    let html = '';
    let currentDate = new Date(startDate);
    
    while (currentDate <= today) {
        const dateKey = getDateKey(currentDate);
        const words = writingHistory[dateKey] || 0;
        
        let level = 0;
        if (words > 0) level = 1;
        if (words >= 500) level = 2;
        if (words >= 1500) level = 3;
        if (words >= 3000) level = 4;
        
        html += `<div class="heatmap-day level-${level}" title="${dateKey}: ${words} 字"></div>`;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    container.innerHTML = html;
}

function renderDailyChart(project) {
    const container = document.getElementById('dailyChart');
    const writingHistory = project.writingHistory || {};
    
    const today = new Date();
    const days = [];
    
    for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = getDateKey(date);
        days.push({
            date: dateKey,
            label: formatDateShort(date),
            words: writingHistory[dateKey] || 0
        });
    }
    
    const maxWords = Math.max(...days.map(d => d.words), 100);
    
    container.innerHTML = days.map(day => {
        const height = (day.words / maxWords) * 100;
        return `<div class="daily-bar" style="height: ${height}%" data-date="${day.label}" title="${day.date}: ${day.words} 字"></div>`;
    }).join('');
}

function fillProjectForm(project) {
    document.getElementById('projectName').value = project.name;
    document.getElementById('projectType').value = project.type;
    document.getElementById('projectDesc').value = project.description || '';
    document.getElementById('wordGoal').value = project.wordGoal || 50000;
    document.getElementById('deadline').value = project.deadline || '';
    document.getElementById('dailyGoal').value = project.dailyGoal || 1000;
}

function saveProject() {
    try {
        const name = document.getElementById('projectName').value.trim();
        if (!name) {
            showToast('请输入项目名称', 'error');
            return;
        }

        const projectData = {
            name,
            type: document.getElementById('projectType').value,
            description: document.getElementById('projectDesc').value.trim(),
            wordGoal: parseInt(document.getElementById('wordGoal').value) || 50000,
            deadline: document.getElementById('deadline').value || null,
            dailyGoal: parseInt(document.getElementById('dailyGoal').value) || 1000
        };

        if (AppState.currentProject) {
            const index = AppState.projects.findIndex(p => p.id === AppState.currentProject.id);
            if (index !== -1) {
                AppState.projects[index] = { ...AppState.projects[index], ...projectData };
                showToast('项目已更新', 'success');
                console.log('✓ 项目已更新:', projectData.name);
            }
        } else {
            const newProject = {
                id: generateId(),
                ...projectData,
                content: '',
                createdAt: new Date().toISOString(),
                writingHistory: {}
            };
            AppState.projects.push(newProject);
            showToast('项目创建成功', 'success');
            console.log('✓ 新项目已创建:', projectData.name);
        }

        Storage.set('projects', AppState.projects);
        renderProjects();
        updateProjectSelects();
        document.getElementById('projectModal').classList.remove('active');
    } catch (e) {
        console.error('保存项目失败:', e);
        showToast('保存失败，请重试', 'error');
    }
}

function deleteProject(projectId) {
    AppState.projects = AppState.projects.filter(p => p.id !== projectId);
    AppState.characters = AppState.characters.filter(c => c.projectId !== projectId);
    AppState.worldSettings = AppState.worldSettings.filter(w => w.projectId !== projectId);
    AppState.plotboards = AppState.plotboards.filter(p => p.projectId !== projectId);
    
    Storage.set('projects', AppState.projects);
    Storage.set('characters', AppState.characters);
    Storage.set('worldSettings', AppState.worldSettings);
    Storage.set('plotboards', AppState.plotboards);
    
    renderProjects();
    updateProjectSelects();
    showToast('项目已删除', 'success');
}

function updateProjectSelects() {
    const selects = [
        'editorProjectSelect',
        'characterProject',
        'characterProjectFilter',
        'worldProject',
        'worldProjectFilter',
        'sceneProject',
        'plotProjectFilter',
        'analysisProjectSelect'
    ];

    const options = AppState.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            const firstOption = select.querySelector('option[value=""]');
            select.innerHTML = (firstOption ? firstOption.outerHTML : '') + options;
        }
    });
}

// ==================== 写作环境模块 ====================
function initEditorModule() {
    const editor = document.getElementById('mainEditor');
    
    document.getElementById('editorProjectSelect').addEventListener('change', (e) => {
        const projectId = e.target.value;
        if (projectId) {
            AppState.currentEditorProject = AppState.projects.find(p => p.id === projectId);
            loadProjectContent();
        } else {
            AppState.currentEditorProject = null;
            editor.value = '';
            AppState.sessionStartWords = 0;
        }
        updateWordCount();
    });

    editor.addEventListener('input', () => {
        updateWordCount();
        updateSaveStatus(false);
        
        if (AppState.typewriterMode) {
            adjustTypewriterScroll();
        }
        
        recordWritingSession();
    });

    editor.addEventListener('keyup', () => {
        if (AppState.typewriterMode) {
            adjustTypewriterScroll();
        }
    });

    editor.addEventListener('click', () => {
        if (AppState.typewriterMode) {
            adjustTypewriterScroll();
        }
    });

    document.getElementById('saveBtn').addEventListener('click', saveEditorContent);

    document.getElementById('typewriterBtn').addEventListener('click', toggleTypewriterMode);
    document.getElementById('immersionBtn').addEventListener('click', toggleImmersionMode);
    document.getElementById('exitImmersionBtn').addEventListener('click', exitImmersionMode);

    document.getElementById('soundBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('soundMenu').classList.toggle('active');
    });

    document.addEventListener('click', () => {
        document.getElementById('soundMenu').classList.remove('active');
    });

    document.querySelectorAll('.sound-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const sound = option.dataset.sound;
            setBackgroundSound(sound);
        });
    });

    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        AppState.soundVolume = parseInt(e.target.value);
        if (AppState.audioGain) {
            AppState.audioGain.gain.value = AppState.soundVolume / 100;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && AppState.immersionMode) {
            exitImmersionMode();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveEditorContent();
        }
    });

    setInterval(() => {
        if (editor.value && AppState.currentEditorProject) {
            saveEditorContent(true);
        }
    }, 30000);

    updateTime();
    setInterval(updateTime, 1000);
}

function loadProjectContent() {
    if (AppState.currentEditorProject) {
        document.getElementById('mainEditor').value = AppState.currentEditorProject.content || '';
        AppState.sessionStartWords = countWords(AppState.currentEditorProject.content);
        document.getElementById('statusProject').textContent = AppState.currentEditorProject.name;
        updateWordCount();
    }
}

function updateWordCount() {
    const text = document.getElementById('mainEditor').value;
    const totalWords = countWords(text);
    const sessionWords = totalWords - AppState.sessionStartWords;
    
    document.getElementById('editorWordCount').textContent = `${totalWords.toLocaleString()} 字`;
    document.getElementById('sessionWordCount').textContent = `本次: ${sessionWords > 0 ? '+' : ''}${sessionWords} 字`;
}

function updateSaveStatus(saved) {
    const status = document.getElementById('statusSaved');
    if (saved) {
        status.textContent = '✓ 已保存';
        status.style.color = 'var(--success-color)';
    } else {
        status.textContent = '● 未保存';
        status.style.color = 'var(--warning-color)';
    }
}

function updateTime() {
    const now = new Date();
    document.getElementById('statusTime').textContent = 
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function saveEditorContent(silent = false) {
    const content = document.getElementById('mainEditor').value;
    
    if (AppState.currentEditorProject) {
        const projectIndex = AppState.projects.findIndex(p => p.id === AppState.currentEditorProject.id);
        if (projectIndex !== -1) {
            AppState.projects[projectIndex].content = content;
            
            const words = countWords(content);
            const dateKey = getDateKey(new Date());
            if (!AppState.projects[projectIndex].writingHistory) {
                AppState.projects[projectIndex].writingHistory = {};
            }
            AppState.projects[projectIndex].writingHistory[dateKey] = words;
            
            Storage.set('projects', AppState.projects);
            AppState.currentEditorProject = AppState.projects[projectIndex];
            updateSaveStatus(true);
            
            if (!silent) {
                showToast('内容已保存', 'success');
            }
        }
    } else if (!silent) {
        showToast('请先选择一个项目', 'error');
    }
}

function recordWritingSession() {
    const text = document.getElementById('mainEditor').value;
    const words = countWords(text);
    
    const session = {
        timestamp: new Date().toISOString(),
        words: words,
        projectId: AppState.currentEditorProject ? AppState.currentEditorProject.id : null
    };
    
    AppState.writingSessions.push(session);
    if (AppState.writingSessions.length > 1000) {
        AppState.writingSessions = AppState.writingSessions.slice(-1000);
    }
    Storage.set('writingSessions', AppState.writingSessions);
}

function toggleTypewriterMode() {
    AppState.typewriterMode = !AppState.typewriterMode;
    const editor = document.getElementById('mainEditor');
    const btn = document.getElementById('typewriterBtn');
    
    editor.classList.toggle('typewriter-mode', AppState.typewriterMode);
    btn.classList.toggle('active', AppState.typewriterMode);
    
    if (AppState.typewriterMode) {
        adjustTypewriterScroll();
        showToast('Typewriter模式已开启', 'info');
    } else {
        editor.scrollTop = 0;
        showToast('Typewriter模式已关闭', 'info');
    }
}

function adjustTypewriterScroll() {
    const editor = document.getElementById('mainEditor');
    const lineHeight = parseFloat(getComputedStyle(editor).lineHeight);
    const cursorPosition = editor.selectionStart;
    const textBeforeCursor = editor.value.substring(0, cursorPosition);
    const linesBeforeCursor = textBeforeCursor.split('\n').length;
    
    const targetScrollTop = (linesBeforeCursor * lineHeight) - (editor.clientHeight / 2);
    editor.scrollTop = Math.max(0, targetScrollTop);
}

function toggleImmersionMode() {
    if (AppState.immersionMode) {
        exitImmersionMode();
    } else {
        enterImmersionMode();
    }
}

function enterImmersionMode() {
    AppState.immersionMode = true;
    document.body.classList.add('immersion-mode');
    document.getElementById('immersionOverlay').classList.add('active');
    document.getElementById('immersionBtn').classList.add('active');
    
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
    
    showToast('沉浸式模式已开启，按 ESC 退出', 'info');
}

function exitImmersionMode() {
    AppState.immersionMode = false;
    document.body.classList.remove('immersion-mode');
    document.getElementById('immersionOverlay').classList.remove('active');
    document.getElementById('immersionBtn').classList.remove('active');
    
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
}

function setBackgroundSound(sound) {
    AppState.currentSound = sound;
    
    document.querySelectorAll('.sound-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.sound === sound);
    });
    
    document.getElementById('soundMenu').classList.remove('active');
    
    if (AppState.audioNode) {
        AppState.audioNode.stop();
        AppState.audioNode = null;
    }
    
    if (sound === 'none') {
        showToast('已关闭背景音效', 'info');
        return;
    }
    
    try {
        if (!AppState.audioContext) {
            AppState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (!AppState.audioGain) {
            AppState.audioGain = AppState.audioContext.createGain();
            AppState.audioGain.connect(AppState.audioContext.destination);
            AppState.audioGain.gain.value = AppState.soundVolume / 100;
        }
        
        const noiseBuffer = createNoiseBuffer(sound);
        AppState.audioNode = AppState.audioContext.createBufferSource();
        AppState.audioNode.buffer = noiseBuffer;
        AppState.audioNode.loop = true;
        AppState.audioNode.connect(AppState.audioGain);
        AppState.audioNode.start();
        
        const soundNames = {
            cafe: '咖啡馆',
            rain: '雨天',
            white: '白噪音'
        };
        showToast(`正在播放: ${soundNames[sound]}`, 'info');
        
    } catch (e) {
        console.error('Audio error:', e);
        showToast('音效播放失败，请检查浏览器设置', 'error');
    }
}

function createNoiseBuffer(type) {
    const audioContext = AppState.audioContext;
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        if (type === 'rain') {
            output[i] = (Math.random() * 2 - 1) * 0.3;
            if (Math.random() < 0.001) {
                output[i] *= 3;
            }
        } else if (type === 'cafe') {
            output[i] = (Math.random() * 2 - 1) * 0.15;
            if (Math.random() < 0.0005) {
                output[i] = (Math.random() * 2 - 1) * 0.5;
            }
        } else {
            output[i] = (Math.random() * 2 - 1) * 0.2;
        }
    }
    
    return noiseBuffer;
}

// ==================== 创作辅助模块 - 角色卡 ====================
function initCharacterModule() {
    try {
        renderCharacters();
        
        const addCharacterBtn = document.getElementById('addCharacterBtn');
        if (addCharacterBtn) {
            addCharacterBtn.addEventListener('click', () => {
                try {
                    AppState.editingCharacterId = null;
                    document.getElementById('characterModalTitle').textContent = '新建角色';
                    document.getElementById('characterForm').reset();
                    
                    const projectSelect = document.getElementById('characterProject');
                    if (projectSelect && AppState.projects.length > 0) {
                        projectSelect.value = AppState.projects[0].id;
                    }
                    
                    document.getElementById('characterModal').classList.add('active');
                    console.log('👤 打开新建角色模态框');
                } catch (e) {
                    console.error('打开新建角色模态框失败:', e);
                    showToast('操作失败，请重试', 'error');
                }
            });
        } else {
            console.error('未找到 addCharacterBtn 元素');
        }

        const saveCharacterBtn = document.getElementById('saveCharacterBtn');
        if (saveCharacterBtn) {
            saveCharacterBtn.addEventListener('click', saveCharacter);
        }

        const editCharacterBtn = document.getElementById('editCharacterBtn');
        if (editCharacterBtn) {
            editCharacterBtn.addEventListener('click', editCharacter);
        }

        const characterProjectFilter = document.getElementById('characterProjectFilter');
        if (characterProjectFilter) {
            characterProjectFilter.addEventListener('change', renderCharacters);
        }
    } catch (e) {
        console.error('角色管理模块初始化失败:', e);
        throw e;
    }
}

function renderCharacters() {
    const grid = document.getElementById('charactersGrid');
    if (!grid) {
        console.error('未找到 charactersGrid 元素');
        return;
    }
    
    const filterElement = document.getElementById('characterProjectFilter');
    const projectFilter = filterElement ? filterElement.value : '';
    
    let characters = AppState.characters;
    if (projectFilter) {
        characters = characters.filter(c => c.projectId === projectFilter);
    }
    
    if (characters.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">👤</div>
                <h3>还没有角色</h3>
                <p>点击"新建角色"创建你的第一个角色</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = characters.map(char => {
        const project = AppState.projects.find(p => p.id === char.projectId);
        const tags = char.tags ? char.tags.split(',').map(t => t.trim()).filter(t => t) : [];
        const initial = char.name ? char.name.charAt(0) : '?';
        
        return `
            <div class="character-card" data-id="${char.id}">
                <div class="character-avatar">${initial}</div>
                <h4>${char.name}</h4>
                ${char.nickname ? `<p class="character-nickname">"${char.nickname}"</p>` : ''}
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
                    ${char.age || '年龄未设'} · ${char.gender === 'male' ? '男' : char.gender === 'female' ? '女' : '性别未设'}
                </p>
                <p style="font-size: 13px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${char.personality || char.background || '暂无描述'}
                </p>
                ${tags.length > 0 ? `
                    <div class="character-tags">
                        ${tags.map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="character-project">
                    📁 ${project ? project.name : '未关联项目'}
                </div>
            </div>
        `;
    }).join('');
    
    grid.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            const charId = card.dataset.id;
            const character = AppState.characters.find(c => c.id === charId);
            if (character) {
                showCharacterDetail(character);
            }
        });
    });
}

function showCharacterDetail(character) {
    AppState.editingCharacterId = character.id;
    const project = AppState.projects.find(p => p.id === character.projectId);
    
    const genderText = character.gender === 'male' ? '男' : character.gender === 'female' ? '女' : '未设定';
    const tags = character.tags ? character.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    
    document.getElementById('detailCharName').textContent = character.name;
    
    document.getElementById('characterDetailContent').innerHTML = `
        <div class="character-detail-header">
            <div class="character-avatar">${character.name.charAt(0)}</div>
            <div>
                <h3>${character.name}${character.nickname ? ` <span style="color: var(--text-muted); font-weight: normal; font-size: 16px;">"${character.nickname}"</span>` : ''}</h3>
                <div class="character-detail-meta">
                    <span>${character.age || '年龄未设'}</span>
                    <span>${genderText}</span>
                    <span>📁 ${project ? project.name : '未关联项目'}</span>
                </div>
                ${tags.length > 0 ? `
                    <div class="character-tags" style="margin-top: 12px;">
                        ${tags.map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
        
        ${character.appearance ? `
            <div class="character-detail-section">
                <h4>外貌特征</h4>
                <p>${character.appearance}</p>
            </div>
        ` : ''}
        
        ${character.personality ? `
            <div class="character-detail-section">
                <h4>性格特点</h4>
                <p>${character.personality}</p>
            </div>
        ` : ''}
        
        ${character.background ? `
            <div class="character-detail-section">
                <h4>背景故事</h4>
                <p>${character.background}</p>
            </div>
        ` : ''}
        
        ${character.relations ? `
            <div class="character-detail-section">
                <h4>与其他角色的关系</h4>
                <p>${character.relations}</p>
            </div>
        ` : ''}
        
        ${!character.appearance && !character.personality && !character.background && !character.relations ? `
            <p style="text-align: center; color: var(--text-muted); padding: 40px 0;">暂无详细信息</p>
        ` : ''}
    `;
    
    document.getElementById('characterDetailModal').classList.add('active');
}

function editCharacter() {
    const character = AppState.characters.find(c => c.id === AppState.editingCharacterId);
    if (!character) return;
    
    document.getElementById('characterProject').value = character.projectId;
    document.getElementById('charName').value = character.name;
    document.getElementById('charNickname').value = character.nickname || '';
    document.getElementById('charAge').value = character.age || '';
    document.getElementById('charGender').value = character.gender || '';
    document.getElementById('charAppearance').value = character.appearance || '';
    document.getElementById('charPersonality').value = character.personality || '';
    document.getElementById('charBackground').value = character.background || '';
    document.getElementById('charRelations').value = character.relations || '';
    document.getElementById('charTags').value = character.tags || '';
    
    document.getElementById('characterModalTitle').textContent = '编辑角色';
    document.getElementById('characterDetailModal').classList.remove('active');
    document.getElementById('characterModal').classList.add('active');
}

function saveCharacter() {
    try {
        const projectId = document.getElementById('characterProject').value;
        const name = document.getElementById('charName').value.trim();
        
        if (!projectId) {
            showToast('请选择所属项目', 'error');
            return;
        }
        if (!name) {
            showToast('请输入角色姓名', 'error');
            return;
        }
        
        const characterData = {
            projectId,
            name,
            nickname: document.getElementById('charNickname').value.trim(),
            age: document.getElementById('charAge').value.trim(),
            gender: document.getElementById('charGender').value,
            appearance: document.getElementById('charAppearance').value.trim(),
            personality: document.getElementById('charPersonality').value.trim(),
            background: document.getElementById('charBackground').value.trim(),
            relations: document.getElementById('charRelations').value.trim(),
            tags: document.getElementById('charTags').value.trim()
        };
        
        if (AppState.editingCharacterId) {
            const index = AppState.characters.findIndex(c => c.id === AppState.editingCharacterId);
            if (index !== -1) {
                AppState.characters[index] = { ...AppState.characters[index], ...characterData };
                showToast('角色已更新', 'success');
                console.log('✓ 角色已更新:', characterData.name);
            }
        } else {
            const newCharacter = {
                id: generateId(),
                ...characterData,
                createdAt: new Date().toISOString()
            };
            AppState.characters.push(newCharacter);
            showToast('角色创建成功', 'success');
            console.log('✓ 新角色已创建:', characterData.name);
        }
        
        Storage.set('characters', AppState.characters);
        renderCharacters();
        document.getElementById('characterModal').classList.remove('active');
    } catch (e) {
        console.error('保存角色失败:', e);
        showToast('保存失败，请重试', 'error');
    }
}

// ==================== 创作辅助模块 - 世界观设定 ====================
function initWorldModule() {
    renderWorldEntries();
    
    document.getElementById('addWorldEntryBtn').addEventListener('click', () => {
        AppState.editingWorldId = null;
        document.getElementById('worldModalTitle').textContent = '新建设定';
        document.getElementById('worldForm').reset();
        document.getElementById('worldCategory').value = AppState.currentWorldCategory;
        document.getElementById('worldModal').classList.add('active');
    });
    
    document.getElementById('saveWorldBtn').addEventListener('click', saveWorldEntry);
    
    document.getElementById('worldProjectFilter').addEventListener('change', renderWorldEntries);
    
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            AppState.currentWorldCategory = item.dataset.category;
            renderWorldEntries();
        });
    });
}

function renderWorldEntries() {
    const container = document.getElementById('worldEntries');
    const projectFilter = document.getElementById('worldProjectFilter').value;
    
    let entries = AppState.worldSettings.filter(w => w.category === AppState.currentWorldCategory);
    if (projectFilter) {
        entries = entries.filter(w => w.projectId === projectFilter);
    }
    
    if (entries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🌍</div>
                <h3>暂无${getCategoryLabel(AppState.currentWorldCategory)}设定</h3>
                <p>点击"新建设定"添加${getCategoryLabel(AppState.currentWorldCategory)}相关内容</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = entries.map(entry => {
        const project = AppState.projects.find(p => p.id === entry.projectId);
        const related = entry.related ? entry.related.split(',').map(r => r.trim()).filter(r => r) : [];
        
        return `
            <div class="world-entry-card" data-id="${entry.id}">
                <h4>${entry.name}</h4>
                <p>${entry.content}</p>
                <div class="world-entry-meta">
                    <span>📁 ${project ? project.name : '未关联项目'}</span>
                    <div class="world-entry-actions">
                        <button class="entry-action-btn" data-action="edit">编辑</button>
                        <button class="entry-action-btn delete" data-action="delete">删除</button>
                    </div>
                </div>
                ${related.length > 0 ? `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                        <span style="font-size: 12px; color: var(--text-muted);">关联设定: </span>
                        ${related.map(r => `<span class="tag">${r}</span>`).join(' ')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    container.querySelectorAll('.world-entry-card').forEach(card => {
        const entryId = card.dataset.id;
        
        card.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
            e.stopPropagation();
            editWorldEntry(entryId);
        });
        
        card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteWorldEntry(entryId);
        });
    });
}

function getCategoryLabel(category) {
    const labels = {
        geography: '地理',
        history: '历史',
        rules: '规则',
        culture: '文化',
        other: '其他'
    };
    return labels[category] || category;
}

function editWorldEntry(entryId) {
    const entry = AppState.worldSettings.find(w => w.id === entryId);
    if (!entry) return;
    
    AppState.editingWorldId = entryId;
    document.getElementById('worldProject').value = entry.projectId;
    document.getElementById('worldCategory').value = entry.category;
    document.getElementById('worldName').value = entry.name;
    document.getElementById('worldContent').value = entry.content;
    document.getElementById('worldRelated').value = entry.related || '';
    
    document.getElementById('worldModalTitle').textContent = '编辑设定';
    document.getElementById('worldModal').classList.add('active');
}

function deleteWorldEntry(entryId) {
    if (confirm('确定要删除这个设定吗？')) {
        AppState.worldSettings = AppState.worldSettings.filter(w => w.id !== entryId);
        Storage.set('worldSettings', AppState.worldSettings);
        renderWorldEntries();
        showToast('设定已删除', 'success');
    }
}

function saveWorldEntry() {
    const projectId = document.getElementById('worldProject').value;
    const name = document.getElementById('worldName').value.trim();
    const content = document.getElementById('worldContent').value.trim();
    
    if (!projectId) {
        showToast('请选择所属项目', 'error');
        return;
    }
    if (!name) {
        showToast('请输入设定名称', 'error');
        return;
    }
    if (!content) {
        showToast('请输入设定内容', 'error');
        return;
    }
    
    const worldData = {
        projectId,
        category: document.getElementById('worldCategory').value,
        name,
        content,
        related: document.getElementById('worldRelated').value.trim()
    };
    
    if (AppState.editingWorldId) {
        const index = AppState.worldSettings.findIndex(w => w.id === AppState.editingWorldId);
        if (index !== -1) {
            AppState.worldSettings[index] = { ...AppState.worldSettings[index], ...worldData };
            showToast('设定已更新', 'success');
        }
    } else {
        const newEntry = {
            id: generateId(),
            ...worldData,
            createdAt: new Date().toISOString()
        };
        AppState.worldSettings.push(newEntry);
        showToast('设定创建成功', 'success');
    }
    
    Storage.set('worldSettings', AppState.worldSettings);
    AppState.currentWorldCategory = worldData.category;
    document.querySelector(`[data-category="${worldData.category}"]`).click();
    document.getElementById('worldModal').classList.remove('active');
}

// ==================== 创作辅助模块 - 情节板 ====================
function initPlotboardModule() {
    document.getElementById('plotProjectFilter').addEventListener('change', (e) => {
        AppState.currentPlotProject = e.target.value;
        renderPlotboard();
    });
    
    document.getElementById('addActBtn').addEventListener('click', () => {
        if (!AppState.currentPlotProject) {
            showToast('请先选择一个项目', 'error');
            return;
        }
        document.getElementById('actForm').reset();
        document.getElementById('actModal').classList.add('active');
    });
    
    document.getElementById('saveActBtn').addEventListener('click', saveAct);
    
    document.getElementById('addSceneBtn').addEventListener('click', () => {
        if (!AppState.currentPlotProject) {
            showToast('请先选择一个项目', 'error');
            return;
        }
        AppState.editingSceneId = null;
        document.getElementById('sceneModalTitle').textContent = '新建场景';
        document.getElementById('sceneForm').reset();
        document.getElementById('sceneProject').value = AppState.currentPlotProject;
        updateSceneActSelect();
        document.getElementById('sceneModal').classList.add('active');
    });
    
    document.getElementById('saveSceneBtn').addEventListener('click', saveScene);
    
    document.getElementById('sceneProject').addEventListener('change', updateSceneActSelect);
}

function updateSceneActSelect() {
    const projectId = document.getElementById('sceneProject').value;
    const select = document.getElementById('sceneAct');
    
    if (!projectId) {
        select.innerHTML = '<option value="">-- 先选择项目 --</option>';
        return;
    }
    
    const plotboard = AppState.plotboards.find(p => p.projectId === projectId);
    if (!plotboard || plotboard.acts.length === 0) {
        select.innerHTML = '<option value="">-- 请先添加幕 --</option>';
        return;
    }
    
    select.innerHTML = plotboard.acts.map((act, index) => 
        `<option value="${act.id}">第${index + 1}幕: ${act.name}</option>`
    ).join('');
}

function renderPlotboard() {
    const container = document.getElementById('plotboardContainer');
    
    if (!AppState.currentPlotProject) {
        container.innerHTML = `
            <div class="empty-plotboard">
                <div class="empty-icon">🎬</div>
                <h3>选择一个项目</h3>
                <p>从上方下拉框选择要编辑情节板的项目</p>
            </div>
        `;
        return;
    }
    
    let plotboard = AppState.plotboards.find(p => p.projectId === AppState.currentPlotProject);
    if (!plotboard) {
        plotboard = {
            projectId: AppState.currentPlotProject,
            acts: []
        };
        AppState.plotboards.push(plotboard);
        Storage.set('plotboards', AppState.plotboards);
    }
    
    if (plotboard.acts.length === 0) {
        container.innerHTML = `
            <div class="empty-plotboard">
                <div class="empty-icon">🎬</div>
                <h3>开始构建你的故事结构</h3>
                <p>点击"添加幕"按钮创建第一幕</p>
                <p class="hint">提示：你可以拖拽场景卡片来调整顺序</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = plotboard.acts.map((act, actIndex) => {
        const scenes = act.scenes || [];
        return `
            <div class="act-section" data-act-id="${act.id}">
                <div class="act-header">
                    <h4>第${actIndex + 1}幕: ${act.name}</h4>
                    <div class="act-actions">
                        <button class="act-action-btn" data-act-action="edit" title="编辑">✏️</button>
                        <button class="act-action-btn" data-act-action="delete" title="删除">🗑️</button>
                    </div>
                </div>
                ${act.description ? `<p style="color: var(--text-muted); margin-bottom: 12px; padding: 0 8px;">${act.description}</p>` : ''}
                <div class="scenes-container" data-act-id="${act.id}">
                    ${scenes.length === 0 ? `
                        <p style="color: var(--text-muted); padding: 40px; text-align: center; width: 100%;">
                            暂无场景，点击"场景卡片"添加
                        </p>
                    ` : scenes.map((scene, sceneIndex) => {
                        const tags = scene.tags ? scene.tags.split(',').map(t => t.trim()).filter(t => t) : [];
                        return `
                            <div class="scene-card" 
                                 draggable="true" 
                                 data-scene-id="${scene.id}"
                                 data-act-id="${act.id}"
                                 data-index="${sceneIndex}">
                                <h5>${scene.title}</h5>
                                <div class="scene-meta">
                                    ${scene.location ? `📍 ${scene.location}` : ''}
                                    ${scene.characters ? ` · 👤 ${scene.characters}` : ''}
                                </div>
                                <p class="scene-summary">${scene.summary || '暂无概要'}</p>
                                ${tags.length > 0 ? `
                                    <div class="scene-tags">
                                        ${tags.map(t => `<span class="tag">${t}</span>`).join('')}
                                    </div>
                                ` : ''}
                                <div style="margin-top: 12px; display: flex; gap: 8px;">
                                    <button class="entry-action-btn" data-scene-action="edit">编辑</button>
                                    <button class="entry-action-btn delete" data-scene-action="delete">删除</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    initSceneDragAndDrop();
    initSceneActions();
    initActActions();
}

function initActActions() {
    document.querySelectorAll('[data-act-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.actAction;
            const actSection = btn.closest('.act-section');
            const actId = actSection.dataset.actId;
            
            if (action === 'edit') {
                editAct(actId);
            } else if (action === 'delete') {
                deleteAct(actId);
            }
        });
    });
}

function initSceneActions() {
    document.querySelectorAll('[data-scene-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.sceneAction;
            const sceneCard = btn.closest('.scene-card');
            const sceneId = sceneCard.dataset.sceneId;
            
            if (action === 'edit') {
                editScene(sceneId);
            } else if (action === 'delete') {
                deleteScene(sceneId);
            }
        });
    });
}

function initSceneDragAndDrop() {
    let draggedScene = null;
    let draggedData = null;
    
    document.querySelectorAll('.scene-card').forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedScene = card;
            draggedData = {
                sceneId: card.dataset.sceneId,
                fromActId: card.dataset.actId,
                fromIndex: parseInt(card.dataset.index)
            };
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            document.querySelectorAll('.scene-card').forEach(c => c.classList.remove('drag-over'));
            draggedScene = null;
            draggedData = null;
        });
        
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            card.classList.add('drag-over');
        });
        
        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });
        
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            
            if (!draggedData || draggedData.sceneId === card.dataset.sceneId) return;
            
            const toActId = card.dataset.actId;
            const toIndex = parseInt(card.dataset.index);
            
            moveScene(draggedData, toActId, toIndex);
        });
    });
    
    document.querySelectorAll('.scenes-container').forEach(container => {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!draggedData) return;
            
            const toActId = container.dataset.actId;
            const toIndex = container.querySelectorAll('.scene-card').length;
            
            if (draggedData.fromActId !== toActId || draggedData.fromIndex !== toIndex) {
                moveScene(draggedData, toActId, toIndex);
            }
        });
    });
}

function moveScene(draggedData, toActId, toIndex) {
    const plotboard = AppState.plotboards.find(p => p.projectId === AppState.currentPlotProject);
    if (!plotboard) return;
    
    const fromAct = plotboard.acts.find(a => a.id === draggedData.fromActId);
    const toAct = plotboard.acts.find(a => a.id === toActId);
    
    if (!fromAct || !toAct) return;
    
    const [movedScene] = fromAct.scenes.splice(draggedData.fromIndex, 1);
    
    const actualToIndex = draggedData.fromActId === toActId && draggedData.fromIndex < toIndex 
        ? toIndex - 1 
        : toIndex;
    
    toAct.scenes.splice(actualToIndex, 0, movedScene);
    
    Storage.set('plotboards', AppState.plotboards);
    renderPlotboard();
    showToast('场景已移动', 'success');
}

function saveAct() {
    const name = document.getElementById('actName').value.trim();
    if (!name) {
        showToast('请输入幕名称', 'error');
        return;
    }
    
    const plotboard = AppState.plotboards.find(p => p.projectId === AppState.currentPlotProject);
    if (!plotboard) return;
    
    const newAct = {
        id: generateId(),
        name,
        description: document.getElementById('actDesc').value.trim(),
        scenes: []
    };
    
    plotboard.acts.push(newAct);
    Storage.set('plotboards', AppState.plotboards);
    renderPlotboard();
    document.getElementById('actModal').classList.remove('active');
    showToast('幕已添加', 'success');
}

function editAct(actId) {
    const plotboard = AppState.plotboards.find(p => p.projectId === AppState.currentPlotProject);
    if (!plotboard) return;
    
    const act = plotboard.acts.find(a => a.id === actId);
    if (!act) return;
    
    document.getElementById('actName').value = act.name;
    document.getElementById('actDesc').value = act.description || '';
    document.getElementById('actModal').classList.add('active');
    
    document.getElementById('saveActBtn').onclick = () => {
        const name = document.getElementById('actName').value.trim();
        if (!name) {
            showToast('请输入幕名称', 'error');
            return;
        }
        
        act.name = name;
        act.description = document.getElementById('actDesc').value.trim();
        Storage.set('plotboards', AppState.plotboards);
        renderPlotboard();
        document.getElementById('actModal').classList.remove('active');
        showToast('幕已更新', 'success');
        document.getElementById('saveActBtn').onclick = saveAct;
    };
}

function deleteAct(actId) {
    if (!confirm('确定要删除这一幕吗？其中的所有场景也会被删除。')) return;
    
    const plotboard = AppState.plotboards.find(p => p.projectId === AppState.currentPlotProject);
    if (!plotboard) return;
    
    plotboard.acts = plotboard.acts.filter(a => a.id !== actId);
    Storage.set('plotboards', AppState.plotboards);
    renderPlotboard();
    showToast('幕已删除', 'success');
}

function editScene(sceneId) {
    const plotboard = AppState.plotboards.find(p => p.projectId === AppState.currentPlotProject);
    if (!plotboard) return;
    
    let scene = null;
    let sceneActId = null;
    
    for (const act of plotboard.acts) {
        const found = act.scenes.find(s => s.id === sceneId);
        if (found) {
            scene = found;
            sceneActId = act.id;
            break;
        }
    }
    
    if (!scene) return;
    
    AppState.editingSceneId = sceneId;
    document.getElementById('sceneProject').value = AppState.currentPlotProject;
    updateSceneActSelect();
    document.getElementById('sceneAct').value = sceneActId;
    document.getElementById('sceneTitle').value = scene.title;
    document.getElementById('sceneOrder').value = scene.order || 1;
    document.getElementById('sceneLocation').value = scene.location || '';
    document.getElementById('sceneCharacters').value = scene.characters || '';
    document.getElementById('sceneSummary').value = scene.summary || '';
    document.getElementById('sceneConflict').value = scene.conflict || '';
    document.getElementById('scenePurpose').value = scene.purpose || '';
    document.getElementById('sceneTags').value = scene.tags || '';
    
    document.getElementById('sceneModalTitle').textContent = '编辑场景';
    document.getElementById('sceneModal').classList.add('active');
}

function deleteScene(sceneId) {
    if (!confirm('确定要删除这个场景吗？')) return;
    
    const plotboard = AppState.plotboards.find(p => p.projectId === AppState.currentPlotProject);
    if (!plotboard) return;
    
    for (const act of plotboard.acts) {
        act.scenes = act.scenes.filter(s => s.id !== sceneId);
    }
    
    Storage.set('plotboards', AppState.plotboards);
    renderPlotboard();
    showToast('场景已删除', 'success');
}

function saveScene() {
    const projectId = document.getElementById('sceneProject').value;
    const actId = document.getElementById('sceneAct').value;
    const title = document.getElementById('sceneTitle').value.trim();
    
    if (!projectId) {
        showToast('请选择所属项目', 'error');
        return;
    }
    if (!actId) {
        showToast('请选择所属幕', 'error');
        return;
    }
    if (!title) {
        showToast('请输入场景标题', 'error');
        return;
    }
    
    const sceneData = {
        title,
        order: parseInt(document.getElementById('sceneOrder').value) || 1,
        location: document.getElementById('sceneLocation').value.trim(),
        characters: document.getElementById('sceneCharacters').value.trim(),
        summary: document.getElementById('sceneSummary').value.trim(),
        conflict: document.getElementById('sceneConflict').value.trim(),
        purpose: document.getElementById('scenePurpose').value.trim(),
        tags: document.getElementById('sceneTags').value.trim()
    };
    
    const plotboard = AppState.plotboards.find(p => p.projectId === projectId);
    if (!plotboard) return;
    
    const act = plotboard.acts.find(a => a.id === actId);
    if (!act) return;
    
    if (AppState.editingSceneId) {
        for (const a of plotboard.acts) {
            const index = a.scenes.findIndex(s => s.id === AppState.editingSceneId);
            if (index !== -1) {
                a.scenes.splice(index, 1);
                break;
            }
        }
        act.scenes.push({ id: AppState.editingSceneId, ...sceneData });
        showToast('场景已更新', 'success');
    } else {
        const newScene = {
            id: generateId(),
            ...sceneData
        };
        act.scenes.push(newScene);
        showToast('场景创建成功', 'success');
    }
    
    Storage.set('plotboards', AppState.plotboards);
    renderPlotboard();
    document.getElementById('sceneModal').classList.remove('active');
}

// ==================== 写作分析模块 ====================
function initAnalysisModule() {
    document.getElementById('analysisProjectSelect').addEventListener('change', (e) => {
        const projectId = e.target.value;
        if (projectId) {
            const project = AppState.projects.find(p => p.id === projectId);
            if (project) {
                analyzeProject(project);
            }
        }
    });
}

function analyzeProject(project) {
    const text = project.content || '';
    
    analyzeStats(text);
    analyzeReadability(text);
    analyzeHabits(project);
}

function analyzeStats(text) {
    const totalWords = countWords(text);
    const paragraphs = countParagraphs(text);
    const sentences = countSentences(text);
    const avgSentenceLength = sentences > 0 ? Math.round(totalWords / sentences) : 0;
    
    const dialogueMatch = text.match(/[“"][^”"]*[”"]/g) || [];
    const dialogueWords = dialogueMatch.reduce((sum, d) => sum + countWords(d), 0);
    const dialogueRatio = totalWords > 0 ? Math.round((dialogueWords / totalWords) * 100) : 0;
    
    const words = text.match(/[\u4e00-\u9fa5]+|[a-zA-Z]+/g) || [];
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    
    const wordCount = {};
    words.forEach(w => {
        const lower = w.toLowerCase();
        if (lower.length > 1) {
            wordCount[lower] = (wordCount[lower] || 0) + 1;
        }
    });
    
    const commonWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);
    
    document.getElementById('totalWords').textContent = totalWords.toLocaleString();
    document.getElementById('totalParagraphs').textContent = paragraphs;
    document.getElementById('avgSentenceLength').textContent = avgSentenceLength;
    document.getElementById('dialogueRatio').textContent = dialogueRatio + '%';
    document.getElementById('vocabularyCount').textContent = uniqueWords.toLocaleString();
    document.getElementById('commonWords').innerHTML = commonWords.length > 0 
        ? commonWords.map(w => `<span class="tag">${w}</span>`).join('') 
        : '-';
    
    const paragraphLengths = text.split(/\n\s*\n/).filter(p => p.trim()).map(p => countWords(p));
    renderBarChart('paragraphChart', paragraphLengths.slice(0, 10), '段', '字');
    
    const sentenceLengths = text.split(/[。！？.!?]+/).filter(s => s.trim()).map(s => countWords(s));
    renderBarChart('sentenceChart', sentenceLengths.slice(0, 10), '句', '字');
}

function renderBarChart(containerId, data, labelPrefix, unit) {
    const container = document.getElementById(containerId);
    if (data.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px 0;">暂无数据</p>';
        return;
    }
    
    const max = Math.max(...data, 1);
    
    container.innerHTML = data.map((value, index) => {
        const height = (value / max) * 100;
        return `
            <div class="chart-bar" 
                 style="height: ${height}%" 
                 data-value="${value}${unit}" 
                 data-label="${labelPrefix}${index + 1}">
            </div>
        `;
    }).join('');
}

function analyzeReadability(text) {
    const sentences = countSentences(text);
    const words = countWords(text);
    
    if (words === 0) {
        document.getElementById('scoreValue').textContent = '--';
        document.getElementById('scoreLabel').textContent = '--';
        document.getElementById('scoreDescription').textContent = '请选择一个有内容的项目查看阅读难度分析';
        document.getElementById('sentenceLengthBar').style.width = '0%';
        document.getElementById('sentenceLengthDetail').textContent = '0 字';
        document.getElementById('vocabComplexityBar').style.width = '0%';
        document.getElementById('vocabComplexityDetail').textContent = '0%';
        document.getElementById('rareWordsBar').style.width = '0%';
        document.getElementById('rareWordsDetail').textContent = '0%';
        document.getElementById('coherenceBar').style.width = '0%';
        document.getElementById('coherenceDetail').textContent = '--';
        document.getElementById('suggestionsList').innerHTML = '<li>选择项目后将显示针对性建议</li>';
        return;
    }
    
    const avgSentenceLength = sentences > 0 ? words / sentences : 0;
    
    const wordList = text.match(/[\u4e00-\u9fa5]+/g) || [];
    const uniqueWords = new Set(wordList).size;
    const vocabComplexity = Math.min(100, (uniqueWords / wordList.length) * 100);
    
    const rareChars = (text.match(/[龘龖靐齉爩虇虆虈虉虊虋癵癴癳籲籱糶纚纙纛纜鑱鑲鑳鑴鑵鑶鑷鑸鑹鑺鑻鑼鑽鑾鑿钀钁钂钃钄]|[\u3400-\u4dbf]/g) || []).length;
    const rareWordsRatio = words > 0 ? (rareChars / words) * 100 : 0;
    
    let score = 100;
    if (avgSentenceLength > 25) score -= (avgSentenceLength - 25) * 2;
    if (avgSentenceLength < 8) score -= (8 - avgSentenceLength) * 2;
    score -= vocabComplexity * 0.3;
    score -= rareWordsRatio * 5;
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    let scoreLabel, scoreDesc;
    if (score >= 80) {
        scoreLabel = '通俗易懂';
        scoreDesc = '文本非常易于阅读，句子长度适中，词汇简单明了。适合大多数读者群体。';
    } else if (score >= 60) {
        scoreLabel = '中等难度';
        scoreDesc = '文本有一定的阅读难度，包含一些较长的句子和较复杂的词汇。适合有一定阅读基础的读者。';
    } else if (score >= 40) {
        scoreLabel = '较难阅读';
        scoreDesc = '文本阅读难度较高，句子偏长，词汇较为复杂。建议适当简化表达方式。';
    } else {
        scoreLabel = '阅读困难';
        scoreDesc = '文本阅读难度很高，可能会让读者感到吃力。建议大幅简化句子结构，使用更简单的词汇。';
    }
    
    document.getElementById('scoreCircle').style.setProperty('--score-percent', score + '%');
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('scoreLabel').textContent = scoreLabel;
    document.getElementById('scoreDescription').textContent = scoreDesc;
    
    const sentenceLengthPercent = Math.min(100, (avgSentenceLength / 40) * 100);
    document.getElementById('sentenceLengthBar').style.width = sentenceLengthPercent + '%';
    document.getElementById('sentenceLengthDetail').textContent = Math.round(avgSentenceLength) + ' 字';
    
    document.getElementById('vocabComplexityBar').style.width = vocabComplexity + '%';
    document.getElementById('vocabComplexityDetail').textContent = Math.round(vocabComplexity) + '%';
    
    const rareWordsPercent = Math.min(100, rareWordsRatio * 10);
    document.getElementById('rareWordsBar').style.width = rareWordsPercent + '%';
    document.getElementById('rareWordsDetail').textContent = rareWordsRatio.toFixed(2) + '%';
    
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    let coherenceScore = 0;
    if (paragraphs.length > 1) {
        const transitions = ['然后', '接着', '此外', '而且', '但是', '然而', '因此', '所以', '于是', '后来'];
        let transitionCount = 0;
        paragraphs.forEach(p => {
            transitions.forEach(t => {
                if (p.includes(t)) transitionCount++;
            });
        });
        coherenceScore = Math.min(100, (transitionCount / paragraphs.length) * 50);
    }
    
    document.getElementById('coherenceBar').style.width = coherenceScore + '%';
    document.getElementById('coherenceDetail').textContent = coherenceScore > 70 ? '优秀' : coherenceScore > 40 ? '良好' : coherenceScore > 20 ? '一般' : '待提升';
    
    const suggestions = [];
    if (avgSentenceLength > 25) {
        suggestions.push('句子偏长，建议将长句拆分为短句，提高可读性');
    }
    if (avgSentenceLength < 8) {
        suggestions.push('句子偏短，建议适当合并一些短句，使节奏更流畅');
    }
    if (vocabComplexity > 60) {
        suggestions.push('词汇较为复杂，建议使用更常用的词汇，让更多读者能理解');
    }
    if (rareWordsRatio > 1) {
        suggestions.push('生僻字较多，建议替换为常用字，降低阅读门槛');
    }
    if (dialogueRatio < 10 && totalWords > 1000) {
        suggestions.push('对话比例较低，建议增加更多人物对话，让故事更生动');
    }
    if (coherenceScore < 30) {
        suggestions.push('段落之间过渡不够自然，建议使用更多连接词提升连贯性');
    }
    if (suggestions.length === 0) {
        suggestions.push('文本质量很好，继续保持！');
    }
    
    document.getElementById('suggestionsList').innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
}

function analyzeHabits(project) {
    const writingHistory = project.writingHistory || {};
    const sessions = AppState.writingSessions.filter(s => s.projectId === project.id);
    
    const timeDistribution = {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
    };
    
    sessions.forEach(session => {
        const hour = new Date(session.timestamp).getHours();
        if (hour >= 6 && hour < 12) timeDistribution.morning++;
        else if (hour >= 12 && hour < 18) timeDistribution.afternoon++;
        else if (hour >= 18 && hour < 24) timeDistribution.evening++;
        else timeDistribution.night++;
    });
    
    const maxTime = Math.max(...Object.values(timeDistribution), 1);
    const timeLabels = {
        morning: { label: '早晨', range: '6:00-12:00' },
        afternoon: { label: '下午', range: '12:00-18:00' },
        evening: { label: '晚上', range: '18:00-24:00' },
        night: { label: '深夜', range: '0:00-6:00' }
    };
    
    let bestTime = '早晨';
    let bestCount = 0;
    Object.entries(timeDistribution).forEach(([key, value]) => {
        if (value > bestCount) {
            bestCount = value;
            bestTime = timeLabels[key].label;
        }
    });
    
    document.getElementById('timeDistribution').innerHTML = Object.entries(timeDistribution).map(([key, value]) => {
        const height = (value / maxTime) * 100;
        const isActive = value === bestCount && value > 0;
        return `
            <div class="time-slot ${isActive ? 'active' : ''}">
                <div class="time-label">${timeLabels[key].label}</div>
                <div class="time-value">${value}</div>
                <div class="time-unit">次</div>
            </div>
        `;
    }).join('');
    
    document.getElementById('bestTime').textContent = bestCount > 0 ? bestTime : '暂无数据';
    
    const today = new Date();
    const writingDays = Object.keys(writingHistory).filter(d => writingHistory[d] > 0);
    
    let streakDays = 0;
    let checkDate = new Date(today);
    while (true) {
        const dateKey = getDateKey(checkDate);
        if (writingHistory[dateKey] && writingHistory[dateKey] > 0) {
            streakDays++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    let weekDays = 0;
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateKey = getDateKey(d);
        if (writingHistory[dateKey] && writingHistory[dateKey] > 0) {
            weekDays++;
        }
    }
    
    let monthDays = 0;
    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateKey = getDateKey(d);
        if (writingHistory[dateKey] && writingHistory[dateKey] > 0) {
            monthDays++;
        }
    }
    
    document.getElementById('streakDays').textContent = streakDays + ' 天';
    document.getElementById('weekDays').textContent = weekDays + ' 天';
    document.getElementById('monthDays').textContent = monthDays + ' 天';
    
    const blockPointsContainer = document.getElementById('blockPoints');
    if (sessions.length < 10) {
        blockPointsContainer.innerHTML = '<p class="no-data">暂无足够数据分析</p>';
    } else {
        const hourBlocks = {};
        sessions.forEach(session => {
            const hour = new Date(session.timestamp).getHours();
            hourBlocks[hour] = (hourBlocks[hour] || 0) + 1;
        });
        
        const sortedBlocks = Object.entries(hourBlocks)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        if (sortedBlocks.length > 0) {
            blockPointsContainer.innerHTML = sortedBlocks.map(([hour, count], index) => {
                const hourInt = parseInt(hour);
                let period = '';
                if (hourInt >= 6 && hourInt < 12) period = '上午';
                else if (hourInt >= 12 && hourInt < 18) period = '下午';
                else if (hourInt >= 18 && hourInt < 24) period = '晚上';
                else period = '凌晨';
                
                return `
                    <div class="block-item">
                        <div class="block-rank">${index + 1}</div>
                        <div class="block-info">
                            <div class="block-name">${hour}:00 - ${period}</div>
                            <div class="block-count">卡文 ${count} 次</div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            blockPointsContainer.innerHTML = '<p class="no-data">暂无数据</p>';
        }
    }
    
    const efficiencyContainer = document.getElementById('efficiencyChart');
    const efficiencyDays = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateKey = getDateKey(d);
        efficiencyDays.push({
            date: formatDateShort(d),
            words: writingHistory[dateKey] || 0
        });
    }
    
    const maxEfficiency = Math.max(...efficiencyDays.map(d => d.words), 100);
    efficiencyContainer.innerHTML = efficiencyDays.map(day => {
        const height = (day.words / maxEfficiency) * 100;
        return `<div class="efficiency-bar" style="height: ${height}%" data-date="${day.date}" title="${day.date}: ${day.words} 字"></div>`;
    }).join('');
}

// ==================== 灵感工具模块 ====================
const PromptData = {
    characters: [
        '一个失忆的侦探', '一位退休的宇航员', '一名年轻的厨师', '一位孤独的守林人',
        '一个能听懂动物说话的孩子', '一位过气的明星', '一名神秘的图书管理员', '一位穿越时空的旅行者',
        '一个没有影子的人', '一位会算命的理发师', '一名夜间电台主持人', '一位收集声音的人',
        '一个害怕镜子的画家', '一位能预知死亡的护士', '一名迷失在沙漠的商人', '一位守护古老秘密的老人'
    ],
    scenes: [
        '深夜的24小时便利店', '被遗弃的游乐场', '暴风雨中的灯塔', '悬浮在空中的城市',
        '古老图书馆的地下密室', '行驶在雨夜的火车上', '开满樱花的日式庭院', '末日来临前的最后一天',
        '梦境中的白色房间', '海底的神秘遗迹', '冬季的山间小木屋', '未来世界的废品回收站',
        '二战时期的防空洞', '外星飞船的内部', '古代皇陵的入口', '镜子里的反向世界'
    ],
    conflicts: [
        '必须在24小时内找回丢失的记忆', '发现最好的朋友是机器人', '被困在同一天不断循环',
        '必须杀死一个无辜的人才能拯救世界', '发现自己是别人笔下的角色', '所有认识的人都开始忘记自己',
        '必须在爱情和使命之间做出选择', '发现父母一直在欺骗自己', '被困在别人的身体里',
        '一句话就可以改变世界，但不知道该说什么', '必须保守一个会毁掉亲人的秘密',
        '发现自己的人生是一场真人秀', '时间开始倒流，必须阻止一切消失',
        '唯一能拯救世界的人已经死了', '发现自己的梦是真实发生过的事'
    ],
    themes: [
        '自我认知与成长', '爱与牺牲', '正义与邪恶的边界', '时间的意义',
        '孤独与陪伴', '命运与选择', '记忆与遗忘', '希望与绝望',
        '科技与人性', '传统与变革', '勇气与恐惧', '真相与谎言'
    ]
};

const ThesaurusData = {
    '美丽': {
        pinyin: 'měi lì',
        meaning: '好看，使人看了产生快感的',
        synonyms: [
            { word: '绚丽', power: 'high' },
            { word: '瑰丽', power: 'high' },
            { word: '娇艳', power: 'medium' },
            { word: '秀美', power: 'medium' },
            { word: '清丽', power: 'medium' },
            { word: '绝美', power: 'high' },
            { word: '曼妙', power: 'high' },
            { word: '精致', power: 'medium' }
        ],
        examples: [
            '她有一双【绚丽】的眼眸，仿佛盛满了星空。',
            '那朵牡丹开得【娇艳】欲滴，引得众人驻足观赏。',
            '江南的山水【秀美】多姿，宛如一幅水墨画卷。'
        ]
    },
    '高兴': {
        pinyin: 'gāo xìng',
        meaning: '愉快而兴奋',
        synonyms: [
            { word: '欣喜', power: 'high' },
            { word: '雀跃', power: 'high' },
            { word: '欢欣', power: 'medium' },
            { word: '愉悦', power: 'medium' },
            { word: '狂喜', power: 'high' },
            { word: '惬意', power: 'medium' },
            { word: '陶然', power: 'high' },
            { word: '欢畅', power: 'medium' }
        ],
        examples: [
            '听到这个好消息，她【欣喜】若狂，泪水夺眶而出。',
            '孩子们在草地上【雀跃】奔跑，欢声笑语回荡在空气中。',
            '他【陶然】地闭上眼睛，享受着午后温暖的阳光。'
        ]
    },
    '快速': {
        pinyin: 'kuài sù',
        meaning: '速度快的',
        synonyms: [
            { word: '迅捷', power: 'high' },
            { word: '疾驰', power: 'high' },
            { word: '倏忽', power: 'high' },
            { word: '迅疾', power: 'high' },
            { word: '飞速', power: 'medium' },
            { word: '风驰电掣', power: 'high' },
            { word: '一蹴而就', power: 'high' },
            { word: '弹指之间', power: 'high' }
        ],
        examples: [
            '他【迅捷】地躲过了迎面而来的攻击。',
            '跑车在公路上【风驰电掣】，留下一道残影。',
            '【倏忽】之间，十年光阴已经过去。'
        ]
    },
    '悲伤': {
        pinyin: 'bēi shāng',
        meaning: '伤心难过',
        synonyms: [
            { word: '哀恸', power: 'high' },
            { word: '怆然', power: 'high' },
            { word: '悲戚', power: 'medium' },
            { word: '哀伤', power: 'medium' },
            { word: '肝肠寸断', power: 'high' },
            { word: '心如刀绞', power: 'high' },
            { word: '愁肠百结', power: 'high' },
            { word: '黯然神伤', power: 'high' }
        ],
        examples: [
            '失去亲人的她【哀恸】欲绝，整日以泪洗面。',
            '站在离别路口，他【怆然】泪下。',
            '那首【哀婉】的曲子，听得人【心如刀绞】。'
        ]
    },
    '想': {
        pinyin: 'xiǎng',
        meaning: '思考，思念，打算',
        synonyms: [
            { word: '思忖', power: 'high' },
            { word: '琢磨', power: 'medium' },
            { word: '惦念', power: 'medium' },
            { word: '憧憬', power: 'high' },
            { word: '冥思苦想', power: 'high' },
            { word: '朝思暮想', power: 'high' },
            { word: '魂牵梦萦', power: 'high' },
            { word: '心驰神往', power: 'high' }
        ],
        examples: [
            '他【思忖】了很久，终于做出了决定。',
            '远在他乡的游子，无时无刻不【惦念】着故乡的亲人。',
            '那是一个令人【心驰神往】的地方。'
        ]
    },
    '说': {
        pinyin: 'shuō',
        meaning: '用话来表达意思',
        synonyms: [
            { word: '呢喃', power: 'high' },
            { word: '倾诉', power: 'medium' },
            { word: '驳斥', power: 'medium' },
            { word: '调侃', power: 'medium' },
            { word: '振振有词', power: 'high' },
            { word: '娓娓道来', power: 'high' },
            { word: '吞吞吐吐', power: 'medium' },
            { word: '斩钉截铁', power: 'high' }
        ],
        examples: [
            '她在耳边【呢喃】细语，诉说着无尽的思念。',
            '老人【娓娓道来】，讲述着那段尘封的往事。',
            '他【斩钉截铁】地拒绝了这个提议。'
        ]
    },
    '走': {
        pinyin: 'zǒu',
        meaning: '人或鸟兽的脚交互向前移动',
        synonyms: [
            { word: '徜徉', power: 'high' },
            { word: '蹒跚', power: 'high' },
            { word: '疾步', power: 'medium' },
            { word: '蹑手蹑脚', power: 'high' },
            { word: '健步如飞', power: 'high' },
            { word: '步履蹒跚', power: 'high' },
            { word: '闲庭信步', power: 'high' },
            { word: '大步流星', power: 'medium' }
        ],
        examples: [
            '他们【徜徉】在江南的小巷中，感受着古韵悠悠。',
            '老人【步履蹒跚】地走在回家的路上。',
            '他【大步流星】地走进会议室，神情严肃。'
        ]
    },
    '看': {
        pinyin: 'kàn',
        meaning: '使视线接触人或物',
        synonyms: [
            { word: '凝视', power: 'high' },
            { word: '瞟', power: 'medium' },
            { word: '瞥', power: 'medium' },
            { word: '瞻仰', power: 'high' },
            { word: '目不转睛', power: 'high' },
            { word: '侧目而视', power: 'high' },
            { word: '含情脉脉', power: 'high' },
            { word: '望眼欲穿', power: 'high' }
        ],
        examples: [
            '她【凝视】着远方，眼中满是忧郁。',
            '他【目不转睛】地盯着屏幕，生怕错过任何细节。',
            '母亲【望眼欲穿】地盼着游子归来。'
        ]
    }
};

const CategoryWords = {
    emotion: {
        title: '情感表达',
        words: {
            '喜悦': ['欢欣鼓舞', '喜出望外', '心花怒放', '乐不可支', '喜气洋洋'],
            '悲伤': ['肝肠寸断', '心如刀绞', '悲痛欲绝', '泣不成声', '黯然神伤'],
            '愤怒': ['怒发冲冠', '暴跳如雷', '咬牙切齿', '义愤填膺', '怒火中烧'],
            '恐惧': ['心惊胆战', '毛骨悚然', '不寒而栗', '惶恐不安', '战战兢兢'],
            '爱慕': ['一见钟情', '一往情深', '朝思暮想', '魂牵梦萦', '含情脉脉']
        }
    },
    action: {
        title: '动作描写',
        words: {
            '行走': ['健步如飞', '步履蹒跚', '蹑手蹑脚', '闲庭信步', '大步流星'],
            '看': ['凝视', '瞥', '瞟', '瞻仰', '目不转睛', '侧目而视'],
            '说': ['呢喃', '倾诉', '驳斥', '调侃', '振振有词', '娓娓道来'],
            '笑': ['莞尔一笑', '嫣然一笑', '哄堂大笑', '捧腹大笑', '破涕为笑'],
            '哭': ['啜泣', '呜咽', '号啕大哭', '泣不成声', '潸然泪下']
        }
    },
    environment: {
        title: '环境描写',
        words: {
            '自然': ['山清水秀', '鸟语花香', '湖光山色', '风和日丽', '姹紫嫣红'],
            '天气': ['倾盆大雨', '鹅毛大雪', '晴空万里', '乌云密布', '风和日丽'],
            '建筑': ['雕梁画栋', '古色古香', '金碧辉煌', '富丽堂皇', '亭台楼阁'],
            '氛围': ['静谧', '喧嚣', '肃穆', '温馨', '神秘莫测', '阴森恐怖'],
            '四季': ['春暖花开', '夏日炎炎', '秋高气爽', '冰天雪地', '春意盎然']
        }
    },
    character: {
        title: '人物刻画',
        words: {
            '外貌': ['眉清目秀', '容光焕发', '英姿飒爽', '亭亭玉立', '鹤发童颜'],
            '性格': ['乐观开朗', '沉默寡言', '嫉恶如仇', '优柔寡断', '刚正不阿'],
            '神态': ['神采奕奕', '垂头丧气', '眉飞色舞', '目瞪口呆', '若有所思'],
            '气质': ['温文尔雅', '风度翩翩', '器宇轩昂', '雍容华贵', '英姿勃发'],
            '心理': ['忐忑不安', '心乱如麻', '七上八下', '心如止水', '心潮澎湃']
        }
    },
    dialogue: {
        title: '对话提示',
        words: {
            '说话方式': ['呢喃细语', '厉声呵斥', '婉转道来', '侃侃而谈', '支支吾吾'],
            '语气': ['斩钉截铁', '犹豫不决', '郑重其事', '轻描淡写', '意味深长'],
            '表情动作': ['皱眉道', '苦笑着说', '叹了口气', '耸耸肩', '抿抿嘴'],
            '情绪': ['兴奋地说', '悲伤地说', '愤怒地咆哮', '胆怯地说', '神秘地说'],
            '引用': ['常言道', '古话说得好', '正如某人所说', '记得有句话说']
        }
    },
    transition: {
        title: '过渡连接',
        words: {
            '时间': ['转瞬间', '刹那间', '须臾之间', '光阴似箭', '曾几何时'],
            '转折': ['然而', '但是', '不料', '出乎意料的是', '话虽如此'],
            '递进': ['不仅如此', '更有甚者', '除此之外', '而且', '况且'],
            '因果': ['因此', '于是', '由此可见', '之所以...是因为...', '结果'],
            '总结': ['总而言之', '综上所述', '一言以蔽之', '简而言之', '归根到底']
        }
    }
};

function initInspirationModule() {
    initPrompts();
    initThesaurus();
}

function initPrompts() {
    document.getElementById('generatePromptBtn').addEventListener('click', generatePrompt);
    document.getElementById('savePromptBtn').addEventListener('click', savePrompt);
    document.getElementById('copyPromptBtn').addEventListener('click', copyPrompt);
    
    renderSavedPrompts();
}

function generatePrompt() {
    const includeCharacter = document.getElementById('includeCharacter').checked;
    const includeScene = document.getElementById('includeScene').checked;
    const includeConflict = document.getElementById('includeConflict').checked;
    const includeTheme = document.getElementById('includeTheme').checked;
    
    if (!includeCharacter && !includeScene && !includeConflict && !includeTheme) {
        showToast('请至少选择一种提示类型', 'error');
        return;
    }
    
    let promptHtml = '<div class="prompt-content">';
    
    if (includeCharacter) {
        const character = PromptData.characters[Math.floor(Math.random() * PromptData.characters.length)];
        promptHtml += `
            <div class="prompt-part">
                <div class="prompt-label">👤 角色</div>
                <div class="prompt-text">${character}</div>
            </div>
        `;
    }
    
    if (includeScene) {
        const scene = PromptData.scenes[Math.floor(Math.random() * PromptData.scenes.length)];
        promptHtml += `
            <div class="prompt-part">
                <div class="prompt-label">🏞️ 场景</div>
                <div class="prompt-text">${scene}</div>
            </div>
        `;
    }
    
    if (includeConflict) {
        const conflict = PromptData.conflicts[Math.floor(Math.random() * PromptData.conflicts.length)];
        promptHtml += `
            <div class="prompt-part">
                <div class="prompt-label">⚔️ 冲突</div>
                <div class="prompt-text">${conflict}</div>
            </div>
        `;
    }
    
    if (includeTheme) {
        const theme = PromptData.themes[Math.floor(Math.random() * PromptData.themes.length)];
        promptHtml += `
            <div class="prompt-part">
                <div class="prompt-label">🎯 主题</div>
                <div class="prompt-text">${theme}</div>
            </div>
        `;
    }
    
    promptHtml += '</div>';
    
    const container = document.getElementById('generatedPrompt');
    container.innerHTML = promptHtml;
    container.classList.add('has-results');
    
    AppState.generatedPrompt = container.innerText;
    
    document.getElementById('savePromptBtn').disabled = false;
    document.getElementById('copyPromptBtn').disabled = false;
}

function savePrompt() {
    if (!AppState.generatedPrompt) return;
    
    const savedPrompt = {
        id: generateId(),
        content: AppState.generatedPrompt,
        createdAt: new Date().toISOString()
    };
    
    AppState.savedPrompts.unshift(savedPrompt);
    Storage.set('savedPrompts', AppState.savedPrompts);
    renderSavedPrompts();
    showToast('提示已保存', 'success');
}

function copyPrompt() {
    if (!AppState.generatedPrompt) return;
    
    navigator.clipboard.writeText(AppState.generatedPrompt).then(() => {
        showToast('已复制到剪贴板', 'success');
    }).catch(() => {
        showToast('复制失败，请手动复制', 'error');
    });
}

function renderSavedPrompts() {
    const container = document.getElementById('savedPromptsList');
    
    if (AppState.savedPrompts.length === 0) {
        container.innerHTML = '<p class="no-data">暂无保存的提示</p>';
        return;
    }
    
    container.innerHTML = AppState.savedPrompts.map(prompt => `
        <div class="saved-prompt-item">
            <p>${prompt.content.replace(/\n/g, '<br>')}</p>
            <div class="saved-prompt-meta">
                <span>${formatDate(prompt.createdAt)}</span>
                <div class="saved-prompt-actions">
                    <button class="entry-action-btn" onclick="useSavedPrompt('${prompt.id}')">使用</button>
                    <button class="entry-action-btn delete" onclick="deleteSavedPrompt('${prompt.id}')">删除</button>
                </div>
            </div>
        </div>
    `).join('');
}

function useSavedPrompt(id) {
    const prompt = AppState.savedPrompts.find(p => p.id === id);
    if (prompt) {
        AppState.generatedPrompt = prompt.content;
        document.getElementById('generatedPrompt').innerHTML = 
            '<div class="prompt-content">' + 
            prompt.content.split('\n').filter(line => line.trim()).map(line => 
                `<div class="prompt-part"><div class="prompt-text">${line}</div></div>`
            ).join('') + 
            '</div>';
        document.getElementById('generatedPrompt').classList.add('has-results');
        document.getElementById('savePromptBtn').disabled = false;
        document.getElementById('copyPromptBtn').disabled = false;
        showToast('已加载提示', 'success');
    }
}

function deleteSavedPrompt(id) {
    if (confirm('确定要删除这个提示吗？')) {
        AppState.savedPrompts = AppState.savedPrompts.filter(p => p.id !== id);
        Storage.set('savedPrompts', AppState.savedPrompts);
        renderSavedPrompts();
        showToast('已删除', 'success');
    }
}

function initThesaurus() {
    document.getElementById('searchWordBtn').addEventListener('click', searchWord);
    document.getElementById('wordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWord();
        }
    });
    
    document.querySelectorAll('.word-category').forEach(category => {
        category.addEventListener('click', () => {
            const cat = category.dataset.category;
            showCategoryDetail(cat);
        });
    });
}

function searchWord() {
    const word = document.getElementById('wordInput').value.trim();
    if (!word) {
        showToast('请输入要查询的词汇', 'error');
        return;
    }
    
    const wordData = ThesaurusData[word];
    const container = document.getElementById('wordResults');
    
    if (!wordData) {
        const suggestions = Object.keys(ThesaurusData).filter(w => w.includes(word) || word.includes(w));
        let html = `
            <div class="word-detail">
                <div class="word-detail-header">
                    <h3>${word}</h3>
                </div>
                <p style="color: var(--text-muted); text-align: center; padding: 40px 0;">
                    暂未收录该词汇的扩展建议
                </p>
        `;
        
        if (suggestions.length > 0) {
            html += `
                <p style="margin-bottom: 12px;">试试这些词：</p>
                <div class="synonyms-grid">
                    ${suggestions.map(s => `
                        <div class="synonym-item" onclick="document.getElementById('wordInput').value='${s}'; searchWord();">
                            <div class="synonym-word">${s}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    } else {
        container.innerHTML = `
            <div class="word-detail">
                <div class="word-detail-header">
                    <h3>${word}</h3>
                    <span class="word-pinyin">${wordData.pinyin}</span>
                </div>
                <div class="word-meaning">${wordData.meaning}</div>
                
                <div class="synonyms-section">
                    <h4>✨ 更有力量的同义词</h4>
                    <div class="synonyms-grid">
                        ${wordData.synonyms.map(s => `
                            <div class="synonym-item" onclick="document.getElementById('wordInput').value='${s.word}'; searchWord();">
                                <div class="synonym-word">${s.word}</div>
                                <div class="synonym-power ${s.power}">${s.power === 'high' ? '⭐ 强力推荐' : '💡 推荐'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="examples-section">
                    <h4>📝 例句参考</h4>
                    ${wordData.examples.map(ex => `
                        <div class="example-item">${ex.replace(/【(.*?)】/g, '<span class="highlight">$1</span>')}</div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    container.classList.add('has-results');
}

function showCategoryDetail(category) {
    const data = CategoryWords[category];
    if (!data) return;
    
    document.getElementById('wordDetailTitle').textContent = data.title;
    
    let content = '';
    Object.entries(data.words).forEach(([subCategory, words]) => {
        content += `
            <div class="synonyms-section">
                <h4>${subCategory}</h4>
                <div class="synonyms-grid">
                    ${words.map(word => `
                        <div class="synonym-item" onclick="document.getElementById('wordInput').value='${word}'; document.getElementById('wordDetailModal').classList.remove('active'); searchWord();">
                            <div class="synonym-word">${word}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    document.getElementById('wordDetailContent').innerHTML = content;
    document.getElementById('wordDetailModal').classList.add('active');
}

// ==================== 安全初始化包装器 ====================
function safeInit(fnName, fn) {
    try {
        fn();
        console.log(`✓ ${fnName} 初始化成功`);
    } catch (e) {
        console.error(`✗ ${fnName} 初始化失败:`, e);
        showToast(`${fnName} 初始化失败，请刷新页面重试`, 'error');
    }
}

// ==================== 初始化应用 ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 开始初始化创意写作工具箱...');
    
    safeInit('主题模块', initTheme);
    safeInit('全屏模块', initFullscreen);
    safeInit('导航模块', initNavigation);
    safeInit('模态框模块', initModals);
    safeInit('项目管理模块', initProjectModule);
    safeInit('写作环境模块', initEditorModule);
    safeInit('角色管理模块', initCharacterModule);
    safeInit('世界观设定模块', initWorldModule);
    safeInit('情节板模块', initPlotboardModule);
    safeInit('写作分析模块', initAnalysisModule);
    safeInit('灵感工具模块', initInspirationModule);
    
    if (AppState.projects.length === 0) {
        const sampleProject = {
            id: generateId(),
            name: '示例项目：我的第一部小说',
            type: 'novel',
            description: '这是一个示例项目，帮助你了解如何使用这个写作工具。你可以删除它，然后创建自己的项目。',
            wordGoal: 50000,
            deadline: null,
            dailyGoal: 1000,
            content: '第一章 启程\n\n清晨的阳光透过窗帘的缝隙，洒在李明的脸上。他睁开眼睛，看着陌生的天花板，过了好一会儿才想起自己身在何处。\n\n"这是新的开始。"他对自己说，嘴角微微上扬。\n\n今天，他要去一个从未去过的地方，开始一段全新的旅程。\n\n他收拾好简单的行囊，推开了旅馆的门。门外，阳光正好，微风拂面。街道上已经有了行人，每个人的脸上都带着不同的表情，或匆忙，或悠闲。\n\n李明深吸一口气，迈出了第一步。\n\n他不知道前方等待着他的是什么，但他知道，这一次，他不会再退缩了。',
            createdAt: new Date().toISOString(),
            writingHistory: {}
        };
        
        const today = getDateKey(new Date());
        sampleProject.writingHistory[today] = countWords(sampleProject.content);
        
        AppState.projects.push(sampleProject);
        Storage.set('projects', AppState.projects);
        
        const sampleCharacter = {
            id: generateId(),
            projectId: sampleProject.id,
            name: '李明',
            nickname: '明子',
            age: '25岁',
            gender: 'male',
            appearance: '中等身高，体型偏瘦，戴着一副黑框眼镜，眼神中透着一丝倔强。总是穿着简单的T恤和牛仔裤。',
            personality: '性格内向但内心坚韧，遇到困难从不轻易放弃。善良，有正义感，有时候会因为太较真而吃亏。',
            background: '从小在孤儿院长大，靠自己的努力考上了大学。毕业后在一家小公司工作，因为一次意外选择了辞职旅行。',
            relations: '张叔 - 孤儿院院长，如同父亲般的存在；小红 - 大学同学，暗恋的人',
            tags: '勇敢, 正直, 有些倔强, 内向',
            createdAt: new Date().toISOString()
        };
        
        AppState.characters.push(sampleCharacter);
        Storage.set('characters', AppState.characters);
        
        const sampleWorld = {
            id: generateId(),
            projectId: sampleProject.id,
            category: 'geography',
            name: '云雾山脉',
            content: '一座绵延千里的古老山脉，因为常年被云雾笼罩而得名。山中隐藏着许多古老的遗迹和传说。据说山脉深处有一座神秘的古城，但从未有人真正找到过。\n\n山脉中有许多珍稀的动植物，也是采药人的天堂。每年都有不少人慕名而来，但大多数人只在外围活动，很少有人敢深入山中。\n\n山中气候多变，刚才还是晴空万里，转眼就可能大雾弥漫，甚至下起暴雨。',
            related: '迷雾森林, 精灵王国',
            createdAt: new Date().toISOString()
        };
        
        AppState.worldSettings.push(sampleWorld);
        Storage.set('worldSettings', AppState.worldSettings);
        
        renderProjects();
        updateProjectSelects();
    }
    
    console.log('✍️ 创意写作工具箱已加载完成');
});