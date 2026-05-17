const appData = {
    courses: [
        {
            id: 1,
            title: '手语入门基础',
            description: '学习手语的基本概念和常用手势',
            icon: '✋',
            level: '初级',
            duration: '5小时',
            lessons: 20,
            progress: 75,
            category: '基础'
        },
        {
            id: 2,
            title: '日常问候篇',
            description: '掌握常用问候语和礼貌用语',
            icon: '👋',
            level: '初级',
            duration: '3小时',
            lessons: 15,
            progress: 100,
            category: '问候'
        },
        {
            id: 3,
            title: '数字表达法',
            description: '学习数字、日期、时间的表达',
            icon: '🔢',
            level: '初级',
            duration: '2小时',
            lessons: 10,
            progress: 40,
            category: '数字'
        },
        {
            id: 4,
            title: '家庭称谓',
            description: '掌握家庭成员的称呼方式',
            icon: '👨‍👩‍👧‍👦',
            level: '初级',
            duration: '2.5小时',
            lessons: 12,
            progress: 0,
            category: '家庭'
        },
        {
            id: 5,
            title: '美食天地',
            description: '学习食物和餐厅相关词汇',
            icon: '🍽️',
            level: '初级',
            duration: '3小时',
            lessons: 18,
            progress: 30,
            category: '食物'
        },
        {
            id: 6,
            title: '日常动作',
            description: '常用动词和动作表达',
            icon: '🏃',
            level: '初级',
            duration: '4小时',
            lessons: 22,
            progress: 20,
            category: '动作'
        },
        {
            id: 7,
            title: '情感表达',
            description: '学习情感和情绪的手语表达',
            icon: '😊',
            level: '中级',
            duration: '3小时',
            lessons: 15,
            progress: 0,
            category: '情感'
        },
        {
            id: 8,
            title: '购物达人',
            description: '商场购物和讨价还价',
            icon: '🛒',
            level: '中级',
            duration: '3.5小时',
            lessons: 16,
            progress: 0,
            category: '日常'
        },
        {
            id: 9,
            title: '就医问诊',
            description: '医院和健康相关表达',
            icon: '🏥',
            level: '中级',
            duration: '4小时',
            lessons: 20,
            progress: 0,
            category: '日常'
        }
    ],

    vocabulary: {
        greetings: [
            { word: '你好', pinyin: 'nǐ hǎo', icon: '👋', description: '手掌伸直，上下挥动' },
            { word: '谢谢', pinyin: 'xiè xie', icon: '🙏', description: '拇指竖起，轻点下巴' },
            { word: '再见', pinyin: 'zài jiàn', icon: '👋', description: '手掌向外，左右挥动' },
            { word: '对不起', pinyin: 'duì bù qǐ', icon: '🙇', description: '握拳轻点额头' },
            { word: '没关系', pinyin: 'méi guān xì', icon: '👌', description: '手掌向外摆动' },
            { word: '请', pinyin: 'qǐng', icon: '🙏', description: '手掌向上，向外伸出' },
            { word: '早上好', pinyin: 'zǎo shang hǎo', icon: '🌅', description: '太阳升起+你好' },
            { word: '晚安', pinyin: 'wǎn ān', icon: '🌙', description: '月亮+睡觉手势' },
            { word: '欢迎', pinyin: 'huān yíng', icon: '🤗', description: '双臂张开' }
        ],
        numbers: [
            { word: '一', pinyin: 'yī', icon: '☝️', description: '伸出食指' },
            { word: '二', pinyin: 'èr', icon: '✌️', description: '伸出食指和中指' },
            { word: '三', pinyin: 'sān', icon: '🤞', description: '伸出中、无、小三指' },
            { word: '四', pinyin: 'sì', icon: '🖖', description: '伸出除拇指外四指' },
            { word: '五', pinyin: 'wǔ', icon: '🖐️', description: '五指张开' },
            { word: '六', pinyin: 'liù', icon: '🤙', description: '拇指和小指伸出' },
            { word: '七', pinyin: 'qī', icon: '👌', description: '拇、食、中指捏合' },
            { word: '八', pinyin: 'bā', icon: '👍', description: '拇指和食指伸直' },
            { word: '九', pinyin: 'jiǔ', icon: '👆', description: '食指弯曲成钩状' },
            { word: '十', pinyin: 'shí', icon: '✊', description: '握拳，拇指翘起' }
        ],
        family: [
            { word: '爸爸', pinyin: 'bà ba', icon: '👨', description: '拇指贴紧嘴唇' },
            { word: '妈妈', pinyin: 'mā ma', icon: '👩', description: '拇指贴紧下巴' },
            { word: '哥哥', pinyin: 'gē ge', icon: '👦', description: '先指自己，然后手向上移动' },
            { word: '姐姐', pinyin: 'jiě jie', icon: '👧', description: '先指自己，然后手向上移动' },
            { word: '弟弟', pinyin: 'dì di', icon: '👶', description: '先指自己，然后手向下移动' },
            { word: '妹妹', pinyin: 'mèi mei', icon: '👧', description: '先指自己，然后手向下移动' },
            { word: '爷爷', pinyin: 'yé ye', icon: '👴', description: '拇指贴紧太阳穴' },
            { word: '奶奶', pinyin: 'nǎi nai', icon: '👵', description: '拇指贴紧脸颊' },
            { word: '孩子', pinyin: 'hái zi', icon: '👶', description: '手比孩子身高' }
        ],
        food: [
            { word: '吃饭', pinyin: 'chī fàn', icon: '🍚', description: '拇指和食指捏合，靠近嘴' },
            { word: '喝水', pinyin: 'hē shuǐ', icon: '💧', description: '手呈杯状，靠近嘴' },
            { word: '米饭', pinyin: 'mǐ fàn', icon: '🍚', description: '手在嘴边做扒饭动作' },
            { word: '面条', pinyin: 'miàn tiáo', icon: '🍜', description: '手做拉面动作' },
            { word: '苹果', pinyin: 'píng guǒ', icon: '🍎', description: '手捏苹果形状' },
            { word: '香蕉', pinyin: 'xiāng jiāo', icon: '🍌', description: '手比香蕉形状' },
            { word: '鸡蛋', pinyin: 'jī dàn', icon: '🥚', description: '手捏鸡蛋形状' },
            { word: '牛奶', pinyin: 'niú nǎi', icon: '🥛', description: '模仿挤牛奶动作' },
            { word: '面包', pinyin: 'miàn bāo', icon: '🍞', description: '手比面包形状' }
        ],
        actions: [
            { word: '走', pinyin: 'zǒu', icon: '🚶', description: '双手交替前后摆动' },
            { word: '跑', pinyin: 'pǎo', icon: '🏃', description: '双手快速交替摆动' },
            { word: '吃', pinyin: 'chī', icon: '🍴', description: '手靠近嘴做吃东西动作' },
            { word: '喝', pinyin: 'hē', icon: '🥤', description: '手呈杯状靠近嘴' },
            { word: '睡觉', pinyin: 'shuì jiào', icon: '😴', description: '双手合十贴脸' },
            { word: '看书', pinyin: 'kàn shū', icon: '📖', description: '双手呈书状' },
            { word: '写字', pinyin: 'xiě zì', icon: '✍️', description: '手做写字动作' },
            { word: '开门', pinyin: 'kāi mén', icon: '🚪', description: '手做开门动作' },
            { word: '坐下', pinyin: 'zuò xià', icon: '🪑', description: '手向下压' }
        ],
        emotions: [
            { word: '开心', pinyin: 'kāi xīn', icon: '😊', description: '双手在胸前向上抬起' },
            { word: '难过', pinyin: 'nán guò', icon: '😢', description: '双手在胸前向下落' },
            { word: '生气', pinyin: 'shēng qì', icon: '😠', description: '双手握拳在胸前抖动' },
            { word: '害怕', pinyin: 'hài pà', icon: '😨', description: '双手抱肩' },
            { word: '喜欢', pinyin: 'xǐ huan', icon: '❤️', description: '拇指贴在胸前' },
            { word: '讨厌', pinyin: 'tǎo yàn', icon: '🤢', description: '手掌向外推开' },
            { word: '惊讶', pinyin: 'jīng yà', icon: '😮', description: '双手捂嘴' },
            { word: '担心', pinyin: 'dān xīn', icon: '😟', description: '双手搓扭' }
        ]
    },

    scenes: [
        {
            id: 1,
            title: '问路',
            icon: '🗺️',
            description: '学习如何用手语询问路线和方向',
            duration: '8分钟',
            difficulty: '初级'
        },
        {
            id: 2,
            title: '购物',
            icon: '🛒',
            description: '商场购物、询问价格和讨价还价',
            duration: '12分钟',
            difficulty: '初级'
        },
        {
            id: 3,
            title: '就医',
            icon: '🏥',
            description: '描述病情、问诊取药',
            duration: '15分钟',
            difficulty: '中级'
        },
        {
            id: 4,
            title: '餐厅点餐',
            icon: '🍽️',
            description: '餐厅用餐、点餐结账',
            duration: '10分钟',
            difficulty: '初级'
        },
        {
            id: 5,
            title: '乘坐公交',
            icon: '🚌',
            description: '乘车问路、报站换乘',
            duration: '10分钟',
            difficulty: '初级'
        },
        {
            id: 6,
            title: '图书馆借书',
            icon: '📚',
            description: '查找书籍、办理借阅',
            duration: '8分钟',
            difficulty: '初级'
        }
    ],

    checkinFeed: [
        { name: '小明', avatar: '👨', time: '10分钟前', text: '今天学习了数字手势，终于记住了1-10的表达！', streak: 15, likes: 24 },
        { name: '小红', avatar: '👩', time: '30分钟前', text: '连续打卡第20天，开始学习中级课程了💪', streak: 20, likes: 45 },
        { name: '小刚', avatar: '👦', time: '1小时前', text: '今天的速度挑战好难，但是完成了！', streak: 8, likes: 18 },
        { name: '小丽', avatar: '👧', time: '2小时前', text: '第一次上传练习视频，欢迎大家指点~', streak: 5, likes: 32 },
        { name: '老王', avatar: '👴', time: '3小时前', text: '跟孙女一起学手语，很有意义的活动', streak: 30, likes: 67 }
    ],

    communityVideos: [
        { title: '我的数字手势练习', author: '小明', authorAvatar: '👨', views: 156, likes: 24, comments: 8 },
        { title: '日常问候-打卡第20天', author: '小红', authorAvatar: '👩', views: 234, likes: 45, comments: 12 },
        { title: '家庭称谓学习分享', author: '小刚', authorAvatar: '👦', views: 89, likes: 18, comments: 5 },
        { title: '食物词汇大挑战', author: '小丽', authorAvatar: '👧', views: 312, likes: 67, comments: 15 },
        { title: '动作表达练习', author: '老王', authorAvatar: '👴', views: 178, likes: 34, comments: 9 },
        { title: '情感表达练习', author: '小李', authorAvatar: '🧑', views: 145, likes: 28, comments: 7 }
    ],

    submissions: [
        { name: '小红', avatar: '👩', desc: '完整准确地翻译了整个句子，动作流畅自然', rank: 'gold' },
        { name: '小明', avatar: '👨', desc: '翻译准确，个别手势可以更标准', rank: 'silver' },
        { name: '小刚', avatar: '👦', desc: '完成了翻译，继续加油哦', rank: 'bronze' }
    ],

    quizQuestions: [
        {
            video: '👋',
            question: '这个手势表达的是什么意思？',
            options: ['你好', '谢谢', '再见', '请'],
            answer: 0
        },
        {
            video: '🙏',
            question: '这个手势表达的是什么意思？',
            options: ['你好', '谢谢', '对不起', '欢迎'],
            answer: 1
        },
        {
            video: '☝️',
            question: '这个手势表达的是什么数字？',
            options: ['一', '二', '三', '四'],
            answer: 0
        },
        {
            video: '✌️',
            question: '这个手势表达的是什么数字？',
            options: ['一', '二', '三', '五'],
            answer: 1
        },
        {
            video: '🖐️',
            question: '这个手势表达的是什么数字？',
            options: ['三', '四', '五', '六'],
            answer: 2
        }
    ],

    translationPhrases: [
        '你好，很高兴认识你',
        '谢谢，再见',
        '今天天气真好',
        '我想喝水',
        '我喜欢吃苹果',
        '爸爸和妈妈',
        '我要去睡觉了',
        '这本书很好看'
    ],

    speedSentences: [
        '你好，我是小明，很高兴认识你。',
        '今天天气很好，我们一起去公园玩吧。',
        '我想点一份米饭和一杯牛奶。',
        '请问图书馆怎么走？',
        '我身体不舒服，想去医院看病。',
        '爸爸，妈妈，我回来了。'
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initTabs();
    renderCourses();
    renderVocabList('greetings');
    renderVocabDetailGrid();
    renderScenes();
    renderCheckinFeed();
    renderVideoGrid();
    renderSubmissions();
    initCategoryCards();
    initPracticeModes();
    initCheckin();
    initVocabTags();
    initModals();
    initCourseFilters();
});

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const moduleSections = document.querySelectorAll('.module-section');
    const seeMoreLinks = document.querySelectorAll('.see-more');
    const continueBtn = document.querySelector('.welcome-banner .btn-primary');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const module = item.dataset.module;
            switchModule(module);
        });
    });

    seeMoreLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const module = link.dataset.module;
            switchModule(module);
        });
    });

    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            switchModule('courses');
        });
    }

    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    performSearch(query);
                }
            }
        });

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                showSearchSuggestions(query);
            }
        });
    }

    const vocabSearchInput = document.getElementById('vocabSearch');
    if (vocabSearchInput) {
        vocabSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            filterVocabList(query);
        });
    }

    function performSearch(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();

        appData.courses.forEach(course => {
            if (course.title.toLowerCase().includes(lowerQuery) || 
                course.description.toLowerCase().includes(lowerQuery) ||
                course.category.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: '课程',
                    title: course.title,
                    desc: course.description,
                    icon: course.icon,
                    id: course.id,
                    action: 'course'
                });
            }
        });

        Object.values(appData.vocabulary).forEach(words => {
            words.forEach(word => {
                if (word.word.includes(query) || 
                    word.pinyin.toLowerCase().includes(lowerQuery) ||
                    word.description.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        type: '词汇',
                        title: word.word,
                        desc: word.pinyin + ' - ' + word.description,
                        icon: word.icon,
                        wordData: word,
                        action: 'vocab'
                    });
                }
            });
        });

        appData.scenes.forEach(scene => {
            if (scene.title.includes(query) || scene.description.includes(query)) {
                results.push({
                    type: '场景',
                    title: scene.title,
                    desc: scene.description,
                    icon: scene.icon,
                    id: scene.id,
                    action: 'scene'
                });
            }
        });

        const modal = document.getElementById('courseModal');
        const body = document.getElementById('courseModalBody');

        if (results.length > 0) {
            let resultsHtml = results.map((r, index) => `
                <div class="search-result-item" data-index="${index}" style="display: flex; gap: 16px; padding: 16px; background: var(--bg-primary); border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: var(--transition); border: 2px solid transparent;" onmouseover="this.style.background='var(--bg-tertiary)'; this.style.borderColor='var(--primary-color)';" onmouseout="this.style.background='var(--bg-primary)'; this.style.borderColor='transparent';">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, var(--primary-light), var(--primary-color)); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0;">${r.icon}</div>
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                            <span style="font-weight: 600; font-size: 16px;">${r.title}</span>
                            <span style="padding: 3px 10px; background: var(--primary-color); color: white; border-radius: 12px; font-size: 12px; font-weight: 500;">${r.type}</span>
                        </div>
                        <p style="color: var(--text-secondary); font-size: 14px; margin: 0; line-height: 1.5;">${r.desc}</p>
                    </div>
                    <div style="display: flex; align-items: center; color: var(--text-muted); font-size: 20px;">
                        →
                    </div>
                </div>
            `).join('');

            body.innerHTML = `
                <div style="margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--primary-light), var(--primary-color)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🔍</div>
                        <div>
                            <h2 style="font-size: 24px; margin: 0;">搜索结果</h2>
                            <p style="color: var(--text-secondary); margin: 4px 0 0 0;">关键词："${query}" · 找到 ${results.length} 条结果</p>
                        </div>
                    </div>
                </div>
                <div style="max-height: 500px; overflow-y: auto;">
                    ${resultsHtml}
                </div>
            `;

            modal.classList.add('active');

            const resultItems = body.querySelectorAll('.search-result-item');
            resultItems.forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.index);
                    const result = results[index];
                    modal.classList.remove('active');

                    if (result.action === 'course') {
                        openCourseModal(result.id);
                    } else if (result.action === 'vocab') {
                        openVocabModal(result.wordData);
                    } else if (result.action === 'scene') {
                        openSceneModal(result.id);
                    }
                });
            });
        } else {
            body.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 80px; margin-bottom: 20px;">🔍</div>
                    <h2 style="font-size: 24px; margin-bottom: 12px;">未找到相关结果</h2>
                    <p style="color: var(--text-secondary); font-size: 16px; margin-bottom: 8px;">没有找到包含"${query}"的内容</p>
                    <p style="color: var(--text-muted); font-size: 14px;">请尝试其他关键词，或检查拼写是否正确</p>
                    <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: center;">
                        <button class="btn-outline" onclick="document.getElementById('courseModal').classList.remove('active')">关闭</button>
                    </div>
                </div>
            `;
            modal.classList.add('active');
        }
    }

    function showSearchSuggestions(query) {
        const suggestions = [];
        const lowerQuery = query.toLowerCase();

        Object.values(appData.vocabulary).forEach(words => {
            words.forEach(word => {
                if (word.word.includes(query) || word.pinyin.toLowerCase().includes(lowerQuery)) {
                    suggestions.push(`${word.icon} ${word.word} (${word.pinyin})`);
                }
            });
        });

        appData.courses.forEach(course => {
            if (course.title.toLowerCase().includes(lowerQuery)) {
                suggestions.push(`${course.icon} ${course.title} - 课程`);
            }
        });

        if (suggestions.length > 0) {
            console.log('搜索建议:', suggestions.slice(0, 5));
        }
    }

    function filterVocabList(query) {
        const grid = document.getElementById('vocabDetailGrid');
        if (!grid) return;

        const lowerQuery = query.toLowerCase();
        let filteredWords = [];

        Object.values(appData.vocabulary).forEach(words => {
            words.forEach(word => {
                if (word.word.includes(query) || 
                    word.pinyin.toLowerCase().includes(lowerQuery) ||
                    word.description.toLowerCase().includes(lowerQuery)) {
                    filteredWords.push(word);
                }
            });
        });

        if (filteredWords.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: var(--text-secondary);">
                    <div style="font-size: 64px; margin-bottom: 16px;">🔍</div>
                    <p>未找到包含"${query}"的词汇</p>
                    <p style="font-size: 14px; margin-top: 8px;">请尝试其他关键词</p>
                </div>
            `;
        } else {
            grid.innerHTML = filteredWords.slice(0, 8).map(word => `
                <div class="vocab-detail-card">
                    <div class="vocab-detail-header">
                        <div class="vocab-detail-icon">${word.icon}</div>
                        <div class="vocab-detail-text">
                            <h3>${word.word}</h3>
                            <p>${word.pinyin}</p>
                        </div>
                    </div>
                    <div class="vocab-detail-body">
                        <div class="video-placeholder">
                            <div class="play-btn">▶</div>
                            <p>点击播放演示</p>
                        </div>
                        <div class="video-controls">
                            <button class="control-btn active">🔄 循环</button>
                            <button class="control-btn">🐢 慢速</button>
                            <button class="control-btn">👁️ 多角度</button>
                        </div>
                        <p style="color: var(--text-secondary); font-size: 14px;">
                            <strong>动作要点：</strong>${word.description}
                        </p>
                    </div>
                </div>
            `).join('');

            bindVideoPlayButtons();
        }
    }

    function switchModule(moduleName) {
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.module === moduleName) {
                item.classList.add('active');
            }
        });

        moduleSections.forEach(section => {
            section.classList.remove('active');
            const sectionId = moduleName === 'vocabulary' ? 'vocabulary-section' : moduleName;
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });

        window.scrollTo(0, 0);
    }
}

function initTabs() {
    const tabContainers = document.querySelectorAll('.course-tabs, .dialogue-tabs, .community-tabs');

    tabContainers.forEach(container => {
        const tabs = container.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                const parentSection = container.closest('.module-section');
                const tabContents = parentSection.querySelectorAll('.tab-content');
                const allTabs = parentSection.querySelectorAll('.tab-btn');

                allTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabId) {
                        content.classList.add('active');
                    }
                });
            });
        });
    });
}

function renderCourses(levelFilter = '所有难度', categoryFilter = '所有分类') {
    const courseGrid = document.getElementById('courseGrid');
    if (!courseGrid) return;

    let filteredCourses = appData.courses.filter(course => {
        const levelMatch = levelFilter === '所有难度' || course.level === levelFilter;
        const categoryMatch = categoryFilter === '所有分类' || course.category === categoryFilter;
        return levelMatch && categoryMatch;
    });

    if (filteredCourses.length === 0) {
        courseGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: var(--text-secondary);">
                <div style="font-size: 64px; margin-bottom: 16px;">📭</div>
                <p>没有找到符合条件的课程</p>
                <p style="font-size: 14px; margin-top: 8px;">请尝试其他筛选条件</p>
            </div>
        `;
        return;
    }

    courseGrid.innerHTML = filteredCourses.map(course => `
        <div class="course-card" data-course-id="${course.id}">
            <div class="course-card-image">
                <span>${course.icon}</span>
                <span class="course-badge">${course.level}</span>
            </div>
            <div class="course-card-content">
                <h4>${course.title}</h4>
                <p>${course.description}</p>
                <div class="course-meta">
                    <span>⏱️ ${course.duration}</span>
                    <span>📚 ${course.lessons}课时</span>
                    <span>🏷️ ${course.category}</span>
                </div>
                <div class="course-progress">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">
                        <span>学习进度</span>
                        <span>${course.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.progress}%"></div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    const courseCards = courseGrid.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('click', () => {
            const courseId = parseInt(card.dataset.courseId);
            openCourseModal(courseId);
        });
    });
}

function initCourseFilters() {
    const filterSelects = document.querySelectorAll('.filter-select');
    if (filterSelects.length < 2) return;

    const levelSelect = filterSelects[0];
    const categorySelect = filterSelects[1];

    levelSelect.addEventListener('change', () => {
        renderCourses(levelSelect.value, categorySelect.value);
    });

    categorySelect.addEventListener('change', () => {
        renderCourses(levelSelect.value, categorySelect.value);
    });
}

function initCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            renderVocabList(category);
            
            categoryCards.forEach(c => c.style.borderColor = 'transparent');
            card.style.borderColor = 'var(--primary-color)';
        });
    });
}

function renderVocabList(category) {
    const vocabList = document.getElementById('vocabList');
    if (!vocabList) return;

    const words = appData.vocabulary[category] || [];
    
    vocabList.innerHTML = words.map(word => `
        <div class="vocab-item" data-word="${word.word}">
            <div class="vocab-icon">${word.icon}</div>
            <div class="vocab-info">
                <h4>${word.word}</h4>
                <p>${word.pinyin}</p>
            </div>
        </div>
    `).join('');

    const vocabItems = vocabList.querySelectorAll('.vocab-item');
    vocabItems.forEach(item => {
        item.addEventListener('click', () => {
            const wordText = item.dataset.word;
            const word = words.find(w => w.word === wordText);
            if (word) {
                openVocabModal(word);
            }
        });
    });
}

function renderVocabDetailGrid() {
    const grid = document.getElementById('vocabDetailGrid');
    if (!grid) return;

    const allWords = [];
    Object.values(appData.vocabulary).forEach(words => {
        allWords.push(...words.slice(0, 3));
    });

    grid.innerHTML = allWords.slice(0, 6).map(word => `
        <div class="vocab-detail-card">
            <div class="vocab-detail-header">
                <div class="vocab-detail-icon">${word.icon}</div>
                <div class="vocab-detail-text">
                    <h3>${word.word}</h3>
                    <p>${word.pinyin}</p>
                </div>
            </div>
            <div class="vocab-detail-body">
                <div class="video-placeholder">
                    <div class="play-btn">▶</div>
                    <p>点击播放演示</p>
                </div>
                <div class="video-controls">
                    <button class="control-btn active">🔄 循环</button>
                    <button class="control-btn">🐢 慢速</button>
                    <button class="control-btn">👁️ 多角度</button>
                </div>
                <p style="color: var(--text-secondary); font-size: 14px;">
                    <strong>动作要点：</strong>${word.description}
                </p>
            </div>
        </div>
    `).join('');

    bindVideoPlayButtons();
}

function initVocabTags() {
    const tags = document.querySelectorAll('.vocab-tag');
    const grid = document.getElementById('vocabDetailGrid');
    
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            tags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');

            const tagText = tag.textContent;
            let filteredWords = [];
            
            if (tagText === '全部') {
                Object.values(appData.vocabulary).forEach(words => {
                    filteredWords.push(...words);
                });
            } else {
                const categoryMap = {
                    '问候': 'greetings',
                    '数字': 'numbers',
                    '家庭': 'family',
                    '食物': 'food',
                    '动作': 'actions',
                    '情感': 'emotions'
                };
                const category = categoryMap[tagText];
                if (category && appData.vocabulary[category]) {
                    filteredWords = appData.vocabulary[category];
                }
            }

            if (grid) {
                grid.innerHTML = filteredWords.slice(0, 8).map(word => `
                    <div class="vocab-detail-card">
                        <div class="vocab-detail-header">
                            <div class="vocab-detail-icon">${word.icon}</div>
                            <div class="vocab-detail-text">
                                <h3>${word.word}</h3>
                                <p>${word.pinyin}</p>
                            </div>
                        </div>
                        <div class="vocab-detail-body">
                            <div class="video-placeholder">
                                <div class="play-btn">▶</div>
                                <p>点击播放演示</p>
                            </div>
                            <div class="video-controls">
                                <button class="control-btn active">🔄 循环</button>
                                <button class="control-btn">🐢 慢速</button>
                                <button class="control-btn">👁️ 多角度</button>
                            </div>
                            <p style="color: var(--text-secondary); font-size: 14px;">
                                <strong>动作要点：</strong>${word.description}
                            </p>
                        </div>
                    </div>
                `).join('');
                
                bindVideoPlayButtons();
            }
        });
    });
}

function renderScenes() {
    const sceneGrid = document.getElementById('sceneGrid');
    if (!sceneGrid) return;

    sceneGrid.innerHTML = appData.scenes.map(scene => `
        <div class="scene-card" data-scene-id="${scene.id}">
            <div class="scene-image">${scene.icon}</div>
            <div class="scene-content">
                <h4>${scene.title}</h4>
                <p>${scene.description}</p>
                <div class="scene-meta">
                    <span>⏱️ ${scene.duration}</span>
                    <span class="practice-status">${scene.difficulty}</span>
                </div>
            </div>
        </div>
    `).join('');

    const sceneCards = sceneGrid.querySelectorAll('.scene-card');
    sceneCards.forEach(card => {
        card.addEventListener('click', () => {
            const sceneId = parseInt(card.dataset.sceneId);
            openSceneModal(sceneId);
        });
    });
}

function initPracticeModes() {
    const modeCards = document.querySelectorAll('.practice-mode-card');
    modeCards.forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            startPractice(mode);
        });

        const btn = card.querySelector('.btn-outline');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const mode = card.dataset.mode;
                startPractice(mode);
            });
        }
    });
}

function startPractice(mode) {
    const practiceArea = document.getElementById('practiceArea');
    if (!practiceArea) return;

    switch(mode) {
        case 'recognition':
            renderRecognitionQuiz();
            break;
        case 'translation':
            renderTranslationPractice();
            break;
        case 'speed':
            renderSpeedPractice();
            break;
    }
}

function renderRecognitionQuiz() {
    const practiceArea = document.getElementById('practiceArea');
    if (!practiceArea) return;

    let currentQuestion = 0;
    let score = 0;

    function renderQuestion() {
        const question = appData.quizQuestions[currentQuestion];
        if (!question) {
            practiceArea.innerHTML = `
                <div class="recognition-quiz">
                    <h3>🎉 练习完成！</h3>
                    <p style="font-size: 24px; margin: 20px 0;">得分：${score} / ${appData.quizQuestions.length}</p>
                    <button class="btn-primary" onclick="renderRecognitionQuiz()">重新练习</button>
                </div>
            `;
            return;
        }

        practiceArea.innerHTML = `
            <div class="recognition-quiz">
                <div style="margin-bottom: 16px; color: var(--text-secondary);">
                    第 ${currentQuestion + 1} / ${appData.quizQuestions.length} 题
                </div>
                <div class="quiz-video">
                    <div class="play-btn">${question.video}</div>
                    <p>观看演示视频</p>
                </div>
                <div class="quiz-question">${question.question}</div>
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <button class="quiz-option" data-index="${index}">${option}</button>
                    `).join('')}
                </div>
                <div class="quiz-feedback" style="display: none;"></div>
                <div class="quiz-navigation" style="display: none;">
                    <button class="btn-primary" id="nextQuestion">下一题</button>
                </div>
            </div>
        `;

        const options = practiceArea.querySelectorAll('.quiz-option');
        const feedback = practiceArea.querySelector('.quiz-feedback');
        const nav = practiceArea.querySelector('.quiz-navigation');

        options.forEach(option => {
            option.addEventListener('click', () => {
                const selectedIndex = parseInt(option.dataset.index);
                options.forEach(opt => opt.disabled = true);

                if (selectedIndex === question.answer) {
                    option.classList.add('correct');
                    feedback.textContent = '✅ 回答正确！';
                    feedback.className = 'quiz-feedback correct';
                    score++;
                } else {
                    option.classList.add('wrong');
                    options[question.answer].classList.add('correct');
                    feedback.textContent = `❌ 回答错误，正确答案是：${question.options[question.answer]}`;
                    feedback.className = 'quiz-feedback wrong';
                }

                feedback.style.display = 'block';
                nav.style.display = 'flex';
            });
        });

        const nextBtn = practiceArea.querySelector('#nextQuestion');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentQuestion++;
                renderQuestion();
            });
        }
    }

    renderQuestion();
}

function renderTranslationPractice() {
    const practiceArea = document.getElementById('practiceArea');
    if (!practiceArea) return;

    const randomPhrase = appData.translationPhrases[Math.floor(Math.random() * appData.translationPhrases.length)];
    let isRecording = false;
    let recordingTime = 0;
    let recordingInterval = null;

    practiceArea.innerHTML = `
        <div class="translation-practice">
            <div class="translation-text">
                <h4>请用手语表达以下句子：</h4>
                <p>${randomPhrase}</p>
            </div>
            <div class="record-area">
                <button class="record-btn" id="recordBtn">🎥</button>
                <div class="record-timer" id="recordTimer">00:00</div>
            </div>
            <div style="margin-top: 20px;">
                <button class="btn-primary" id="stopBtn" style="display: none;">停止录制</button>
                <button class="btn-outline" id="showAnswerBtn">查看示范</button>
                <button class="btn-outline" id="nextPhraseBtn">下一题</button>
            </div>
        </div>
    `;

    const recordBtn = practiceArea.querySelector('#recordBtn');
    const stopBtn = practiceArea.querySelector('#stopBtn');
    const timer = practiceArea.querySelector('#recordTimer');
    const showAnswerBtn = practiceArea.querySelector('#showAnswerBtn');
    const nextPhraseBtn = practiceArea.querySelector('#nextPhraseBtn');

    recordBtn.addEventListener('click', () => {
        if (!isRecording) {
            isRecording = true;
            recordBtn.innerHTML = '⏹️';
            recordBtn.style.animation = 'pulse 2s infinite';
            stopBtn.style.display = 'inline-block';
            
            recordingInterval = setInterval(() => {
                recordingTime++;
                const minutes = Math.floor(recordingTime / 60).toString().padStart(2, '0');
                const seconds = (recordingTime % 60).toString().padStart(2, '0');
                timer.textContent = `${minutes}:${seconds}`;
            }, 1000);
        }
    });

    stopBtn.addEventListener('click', () => {
        isRecording = false;
        clearInterval(recordingInterval);
        recordBtn.innerHTML = '🎥';
        recordBtn.style.animation = 'none';
        stopBtn.style.display = 'none';
        recordingTime = 0;
        timer.textContent = '00:00';
        
        alert('录制完成！在实际应用中，视频将被上传并与参考示范进行对比分析。');
    });

    showAnswerBtn.addEventListener('click', () => {
        alert(`示范视频：${randomPhrase}\n\n在实际应用中，这里会显示标准的手语示范视频。`);
    });

    nextPhraseBtn.addEventListener('click', () => {
        renderTranslationPractice();
    });
}

function renderSpeedPractice() {
    const practiceArea = document.getElementById('practiceArea');
    if (!practiceArea) return;

    const randomSentence = appData.speedSentences[Math.floor(Math.random() * appData.speedSentences.length)];
    let timeLeft = 60;
    let timerInterval = null;
    let isStarted = false;

    practiceArea.innerHTML = `
        <div class="speed-practice">
            <div class="speed-timer" id="speedTimer">01:00</div>
            <div class="speed-sentence">
                <p>${randomSentence}</p>
            </div>
            <div class="speed-controls">
                <button class="btn-primary" id="startSpeedBtn">开始计时</button>
                <button class="btn-outline" id="nextSentenceBtn">换一句</button>
            </div>
            <div style="margin-top: 20px; color: var(--text-secondary); font-size: 14px;">
                <p>💡 提示：在倒计时内流畅地用手语表达整个句子</p>
            </div>
        </div>
    `;

    const timer = practiceArea.querySelector('#speedTimer');
    const startBtn = practiceArea.querySelector('#startSpeedBtn');
    const nextBtn = practiceArea.querySelector('#nextSentenceBtn');

    startBtn.addEventListener('click', () => {
        if (!isStarted) {
            isStarted = true;
            startBtn.disabled = true;
            startBtn.textContent = '进行中...';
            
            timerInterval = setInterval(() => {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                const seconds = (timeLeft % 60).toString().padStart(2, '0');
                timer.textContent = `${minutes}:${seconds}`;
                
                if (timeLeft <= 10) {
                    timer.style.color = 'var(--danger-color)';
                }
                
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    timer.textContent = '时间到！';
                    startBtn.disabled = false;
                    startBtn.textContent = '重新开始';
                    isStarted = false;
                    
                    if (confirm('时间到！你完成了吗？点击确定查看示范。')) {
                        alert('在实际应用中，这里会显示标准示范供你对比。');
                    }
                }
            }, 1000);
        } else {
            clearInterval(timerInterval);
            isStarted = false;
            startBtn.disabled = false;
            startBtn.textContent = '开始计时';
            timeLeft = 60;
            timer.textContent = '01:00';
            timer.style.color = 'var(--primary-color)';
        }
    });

    nextBtn.addEventListener('click', () => {
        if (timerInterval) clearInterval(timerInterval);
        renderSpeedPractice();
    });
}

function renderCheckinFeed() {
    const feed = document.getElementById('checkinFeed');
    if (!feed) return;

    const avatarColors = [
        'linear-gradient(135deg, #fbbf24, #f59e0b)',
        'linear-gradient(135deg, #ec4899, #be185d)',
        'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        'linear-gradient(135deg, #06b6d4, #0891b2)',
        'linear-gradient(135deg, #10b981, #059669)'
    ];

    feed.innerHTML = appData.checkinFeed.map((item, index) => `
        <div class="feed-item">
            <div class="feed-avatar" style="background: ${avatarColors[index % avatarColors.length]}">
                ${item.avatar}
            </div>
            <div class="feed-content">
                <div class="feed-header">
                    <span class="feed-name">${item.name}</span>
                    <span class="feed-time">${item.time}</span>
                </div>
                <p class="feed-text">${item.text}</p>
                <div class="feed-stats">
                    <span>🔥 连续${item.streak}天</span>
                    <span>❤️ ${item.likes}</span>
                    <span>💬 评论</span>
                </div>
            </div>
        </div>
    `).join('');
}

function initCheckin() {
    const checkinBtn = document.getElementById('checkinBtn');
    if (checkinBtn) {
        checkinBtn.addEventListener('click', () => {
            const todayEl = document.querySelector('.calendar-day.today');
            if (todayEl && !todayEl.classList.contains('completed')) {
                todayEl.classList.add('completed');
                todayEl.textContent = '✓';
                
                const streakCount = document.getElementById('streakCount');
                if (streakCount) {
                    const current = parseInt(streakCount.textContent);
                    streakCount.textContent = current + 1;
                }
                
                checkinBtn.textContent = '✓ 已打卡';
                checkinBtn.disabled = true;
                checkinBtn.style.opacity = '0.6';
                
                alert('🎉 打卡成功！继续保持学习的热情吧！');
            }
        });
    }
}

function renderVideoGrid() {
    const grid = document.getElementById('videoGrid');
    if (!grid) return;

    const avatarColors = [
        'linear-gradient(135deg, #fbbf24, #f59e0b)',
        'linear-gradient(135deg, #ec4899, #be185d)',
        'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        'linear-gradient(135deg, #06b6d4, #0891b2)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #f97316, #ea580c)'
    ];

    grid.innerHTML = appData.communityVideos.map((video, index) => `
        <div class="video-card">
            <div class="video-thumbnail">
                <div class="play-btn">▶</div>
            </div>
            <div class="video-info">
                <h4 class="video-title">${video.title}</h4>
                <div class="video-author">
                    <div class="video-author-avatar" style="background: ${avatarColors[index % avatarColors.length]}">
                        ${video.authorAvatar}
                    </div>
                    <span class="video-author-name">${video.author}</span>
                </div>
                <div class="video-stats">
                    <span>👁️ ${video.views}</span>
                    <span>❤️ ${video.likes}</span>
                    <span>💬 ${video.comments}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderSubmissions() {
    const list = document.getElementById('submissionList');
    if (!list) return;

    const avatarColors = [
        'linear-gradient(135deg, #fbbf24, #f59e0b)',
        'linear-gradient(135deg, #c0c0c0, #808080)',
        'linear-gradient(135deg, #cd7f32, #b87333)'
    ];

    list.innerHTML = appData.submissions.map((submission, index) => `
        <div class="submission-item">
            <div class="submission-avatar" style="background: ${avatarColors[index % avatarColors.length]}">
                ${submission.avatar}
            </div>
            <div class="submission-info">
                <h4 class="submission-name">${submission.name}</h4>
                <p class="submission-desc">${submission.desc}</p>
            </div>
            <div class="submission-rank ${submission.rank}">
                ${index + 1}
            </div>
        </div>
    `).join('');

    const startChallengeBtn = document.getElementById('startChallengeBtn');
    if (startChallengeBtn) {
        startChallengeBtn.addEventListener('click', () => {
            alert('🎬 在实际应用中，这里会打开摄像头录制你的手语翻译视频。');
        });
    }

    const uploadVideoBtn = document.getElementById('uploadVideoBtn');
    if (uploadVideoBtn) {
        uploadVideoBtn.addEventListener('click', () => {
            alert('📹 在实际应用中，这里会打开文件选择器或摄像头录制界面。');
        });
    }
}

function initModals() {
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.modal-close');

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modals.forEach(modal => modal.classList.remove('active'));
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

function openCourseModal(courseId) {
    const course = appData.courses.find(c => c.id === courseId);
    if (!course) return;

    const modal = document.getElementById('courseModal');
    const body = document.getElementById('courseModalBody');

    body.innerHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 80px; margin-bottom: 16px;">${course.icon}</div>
            <h2 style="font-size: 28px; margin-bottom: 8px;">${course.title}</h2>
            <p style="color: var(--text-secondary);">${course.description}</p>
            <div style="display: flex; justify-content: center; gap: 16px; margin-top: 16px;">
                <span class="example-tag">${course.level}</span>
                <span class="example-tag">⏱️ ${course.duration}</span>
                <span class="example-tag">📚 ${course.lessons}课时</span>
            </div>
        </div>
        
        <div style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 16px; font-size: 18px;">课程进度</h3>
            <div class="progress-bar" style="height: 10px; margin-bottom: 8px;">
                <div class="progress-fill" style="width: ${course.progress}%"></div>
            </div>
            <p style="color: var(--text-secondary); text-align: right;">${course.progress}% 已完成</p>
        </div>
        
        <div style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 16px; font-size: 18px;">课程内容</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${Array.from({length: Math.min(5, course.lessons)}, (_, i) => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-primary); border-radius: 10px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${i < Math.floor(course.lessons * course.progress / 100) ? 'var(--secondary-color)' : 'var(--bg-tertiary)'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                            ${i < Math.floor(course.lessons * course.progress / 100) ? '✓' : i + 1}
                        </div>
                        <div style="flex: 1;">
                            <p style="font-weight: 500;">第${i + 1}课：基础手势 ${i + 1}</p>
                            <p style="font-size: 13px; color: var(--text-muted);">5分钟</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="display: flex; gap: 16px;">
            <button class="btn-primary" style="flex: 1;" id="continueLearningBtn">${course.progress > 0 ? '继续学习' : '开始学习'}</button>
            <button class="btn-outline" id="downloadCourseBtn">下载课程</button>
        </div>
    `;

    modal.classList.add('active');

    const continueBtn = body.querySelector('#continueLearningBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            openCoursePlayer(course);
        });
    }

    const downloadBtn = body.querySelector('#downloadCourseBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const courseLessons = Math.min(5, course.lessons);
            let downloadInfo = `📥 「${course.title}」下载信息\n\n`;
            downloadInfo += `共 ${courseLessons} 个视频文件\n`;
            downloadInfo += `总大小：约 ${courseLessons * 50} MB\n`;
            downloadInfo += `预计下载时间：${Math.ceil(courseLessons * 50 / 5)} 分钟（5MB/s）\n\n`;
            downloadInfo += `文件列表：\n`;
            for (let i = 1; i <= courseLessons; i++) {
                downloadInfo += `  ${i}. 第${i}课.mp4 (约50MB)\n`;
            }
            downloadInfo += `\n✅ 已添加到下载队列！`;
            alert(downloadInfo);
        });
    }
}

function openCoursePlayer(course) {
    const modal = document.getElementById('videoModal');
    const body = document.getElementById('videoModalBody');
    
    const currentLesson = Math.floor(course.lessons * course.progress / 100) + 1;
    const totalLessons = Math.min(10, course.lessons);
    
    let lessonsHtml = '';
    for (let i = 1; i <= totalLessons; i++) {
        const isCompleted = i < currentLesson;
        const isCurrent = i === currentLesson;
        lessonsHtml += `
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; cursor: pointer; transition: var(--transition); ${isCurrent ? 'background: rgba(99, 102, 241, 0.1); border: 1px solid var(--primary-color);' : 'background: var(--bg-primary);'}" 
                 onmouseover="this.style.background='var(--bg-tertiary)'" 
                 onmouseout="this.style.background='${isCurrent ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-primary)'}'">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: ${isCompleted ? 'var(--secondary-color)' : isCurrent ? 'var(--primary-color)' : 'var(--bg-tertiary)'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">
                    ${isCompleted ? '✓' : i}
                </div>
                <div style="flex: 1;">
                    <p style="font-weight: ${isCurrent ? '600' : '500'}; font-size: 14px; color: ${isCurrent ? 'var(--primary-color)' : 'var(--text-primary)'}">
                        第${i}课：${getLessonTitle(course.category, i)}
                    </p>
                    <p style="font-size: 12px; color: var(--text-muted);">约5分钟</p>
                </div>
                ${isCurrent ? '<span style="color: var(--primary-color); font-size: 12px; font-weight: 500;">播放中</span>' : ''}
            </div>
        `;
    }

    body.innerHTML = `
        <div style="display: flex; gap: 24px;">
            <div style="flex: 2;">
                <div style="background: linear-gradient(135deg, #1e293b, #334155); border-radius: 16px; height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; margin-bottom: 16px;">
                    <div style="font-size: 64px; margin-bottom: 16px;">${course.icon}</div>
                    <h3 style="font-size: 20px; margin-bottom: 8px;">${course.title} - 第${currentLesson}课</h3>
                    <p style="opacity: 0.8; margin-bottom: 20px;">${getLessonTitle(course.category, currentLesson)}</p>
                    <div style="display: flex; gap: 12px;">
                        <button id="playPauseBtn" style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary-color); border: none; color: white; font-size: 24px; cursor: pointer; transition: var(--transition);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">▶</button>
                    </div>
                    <div style="width: 80%; margin-top: 20px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; opacity: 0.8;">
                            <span id="currentTime">00:00</span>
                            <span>05:00</span>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden;">
                            <div id="progressFill" style="height: 100%; width: 0%; background: var(--primary-color); border-radius: 3px; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px; align-items: center;">
                    <button id="prevLesson" style="padding: 10px 20px; border: 1px solid var(--border-color); background: var(--bg-primary); border-radius: 8px; cursor: pointer; transition: var(--transition);" onmouseover="this.style.background='var(--bg-tertiary)'" ${currentLesson <= 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        ◀ 上一课
                    </button>
                    <button id="markCompleteBtn" style="flex: 1; padding: 12px; background: var(--secondary-color); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: var(--transition);" onmouseover="this.style.opacity='0.9'">
                        ✓ 标记为已完成
                    </button>
                    <button id="nextLesson" style="padding: 10px 20px; border: 1px solid var(--border-color); background: var(--bg-primary); border-radius: 8px; cursor: pointer; transition: var(--transition);" onmouseover="this.style.background='var(--bg-tertiary)'" ${currentLesson >= totalLessons ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        下一课 ▶
                    </button>
                </div>
            </div>
            
            <div style="width: 280px;">
                <h3 style="font-size: 18px; margin-bottom: 16px;">课程目录</h3>
                <div style="display: flex; flex-direction: column; gap: 8px; max-height: 480px; overflow-y: auto;">
                    ${lessonsHtml}
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');

    const playBtn = body.querySelector('#playPauseBtn');
    const progressFill = body.querySelector('#progressFill');
    const currentTimeEl = body.querySelector('#currentTime');
    let isPlaying = false;
    let playInterval = null;
    let currentSeconds = 0;
    const totalSeconds = 300;

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (!isPlaying) {
                isPlaying = true;
                playBtn.innerHTML = '⏸';
                playInterval = setInterval(() => {
                    currentSeconds++;
                    const minutes = Math.floor(currentSeconds / 60).toString().padStart(2, '0');
                    const seconds = (currentSeconds % 60).toString().padStart(2, '0');
                    currentTimeEl.textContent = `${minutes}:${seconds}`;
                    progressFill.style.width = `${(currentSeconds / totalSeconds) * 100}%`;
                    
                    if (currentSeconds >= totalSeconds) {
                        clearInterval(playInterval);
                        isPlaying = false;
                        playBtn.innerHTML = '▶';
                        alert('🎉 本课学习完成！\n\n你已完成第' + currentLesson + '课的学习。');
                    }
                }, 100);
            } else {
                isPlaying = false;
                clearInterval(playInterval);
                playBtn.innerHTML = '▶';
            }
        });
    }

    const markCompleteBtn = body.querySelector('#markCompleteBtn');
    if (markCompleteBtn) {
        markCompleteBtn.addEventListener('click', () => {
            if (playInterval) clearInterval(playInterval);
            alert(`✅ 课程学习完成！\n\n「${course.title}」- 第${currentLesson}课\n\n学习进度已更新，继续加油！`);
            modal.classList.remove('active');
        });
    }

    const prevBtn = body.querySelector('#prevLesson');
    const nextBtn = body.querySelector('#nextLesson');
    
    if (prevBtn && currentLesson > 1) {
        prevBtn.addEventListener('click', () => {
            if (playInterval) clearInterval(playInterval);
            alert(`⬅ 切换到第${currentLesson - 1}课`);
            modal.classList.remove('active');
        });
    }
    
    if (nextBtn && currentLesson < totalLessons) {
        nextBtn.addEventListener('click', () => {
            if (playInterval) clearInterval(playInterval);
            alert(`➡ 切换到第${currentLesson + 1}课`);
            modal.classList.remove('active');
        });
    }
}

function getLessonTitle(category, lessonNum) {
    const titles = {
        '基础': ['认识手语', '基本手型', '手指字母', '基本姿势', '数字入门', '问候基础', '感谢用语', '道歉表达', '请求用语', '日常问候'],
        '问候': ['你好', '谢谢', '再见', '对不起', '请', '早上好', '晚安', '欢迎', '很高兴认识你', '最近怎么样'],
        '数字': ['1-5', '6-10', '11-20', '21-50', '51-100', '日期表达', '时间表达', '星期', '月份', '年份'],
        '家庭': ['爸爸', '妈妈', '哥哥', '姐姐', '弟弟', '妹妹', '爷爷', '奶奶', '孩子', '家人'],
        '食物': ['米饭', '面条', '馒头', '苹果', '香蕉', '鸡蛋', '牛奶', '面包', '喝水', '吃饭'],
        '动作': ['走', '跑', '吃', '喝', '睡觉', '看书', '写字', '开门', '坐下', '站起来'],
        '情感': ['开心', '难过', '生气', '害怕', '喜欢', '讨厌', '惊讶', '担心', '兴奋', '平静'],
        '日常': ['购物', '问路', '坐车', '吃饭', '看病', '学习', '工作', '运动', '娱乐', '休息']
    };
    
    const categoryTitles = titles[category] || titles['基础'];
    return categoryTitles[(lessonNum - 1) % categoryTitles.length];
}

function openVocabModal(word) {
    const modal = document.getElementById('videoModal');
    const body = document.getElementById('videoModalBody');

    body.innerHTML = `
        <div style="display: flex; gap: 32px; align-items: flex-start;">
            <div style="flex: 1;">
                <div class="video-placeholder" style="height: 350px;">
                    <div class="play-btn" style="width: 80px; height: 80px; font-size: 32px;">▶</div>
                    <p style="font-size: 18px;">点击播放演示视频</p>
                </div>
                <div class="video-controls" style="margin-top: 16px;">
                    <button class="control-btn active">🔄 循环播放</button>
                    <button class="control-btn">🐢 慢速模式</button>
                    <button class="control-btn">👁️ 正面视角</button>
                    <button class="control-btn">👁️ 侧面视角</button>
                </div>
            </div>
            <div style="width: 300px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 64px; margin-bottom: 8px;">${word.icon}</div>
                    <h2 style="font-size: 32px; margin-bottom: 4px;">${word.word}</h2>
                    <p style="color: var(--text-secondary); font-size: 18px;">${word.pinyin}</p>
                </div>
                
                <div style="background: var(--bg-primary); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 12px; font-size: 16px;">📝 动作要点</h4>
                    <p style="color: var(--text-secondary); line-height: 1.8;">${word.description}</p>
                </div>
                
                <div style="background: var(--bg-primary); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 12px; font-size: 16px;">💡 记忆技巧</h4>
                    <p style="color: var(--text-secondary); line-height: 1.8;">想象这个动作的含义，将手势与实际场景联系起来，更容易记住。</p>
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button class="btn-primary" style="flex: 1;">加入收藏</button>
                    <button class="btn-outline">下一个</button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');

    const playBtn = body.querySelector('.play-btn');
    const videoPlaceholder = body.querySelector('.video-placeholder');
    const controlBtns = body.querySelectorAll('.control-btn');
    const favoriteBtn = body.querySelectorAll('.btn-primary')[0];
    const nextBtn = body.querySelectorAll('.btn-outline')[0];

    if (playBtn && videoPlaceholder) {
        let isPlaying = false;
        let playInterval = null;
        let currentFrame = 0;
        const frames = ['👉', '✋', '👆', '👇', '👈', '🤚', '✌️', '🤙'];

        playBtn.addEventListener('click', () => {
            if (!isPlaying) {
                isPlaying = true;
                playBtn.innerHTML = '⏸️';
                
                playInterval = setInterval(() => {
                    currentFrame = (currentFrame + 1) % frames.length;
                    playBtn.innerHTML = `<span style="font-size: 32px;">${frames[currentFrame]}</span>`;
                }, 500);

                setTimeout(() => {
                    if (isPlaying) {
                        clearInterval(playInterval);
                        playBtn.innerHTML = '▶';
                        isPlaying = false;
                        alert(`✅ 「${word.word}」演示完成！\n\n动作要点：${word.description}`);
                    }
                }, 4000);
            } else {
                isPlaying = false;
                clearInterval(playInterval);
                playBtn.innerHTML = '▶';
            }
        });
    }

    controlBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            controlBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const btnText = btn.textContent;
            if (btnText.includes('循环')) {
                alert('🔄 已开启循环播放模式');
            } else if (btnText.includes('慢速')) {
                alert('🐢 已开启慢速模式（0.5x速度）');
            } else if (btnText.includes('正面')) {
                alert('👁️ 已切换到正面视角');
            } else if (btnText.includes('侧面')) {
                alert('👁️ 已切换到侧面视角');
            }
        });
    });

    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', () => {
            alert(`❤️ 已将「${word.word}」加入收藏！`);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            alert('➡️ 下一个词汇功能开发中...');
        });
    }
}

function bindVideoPlayButtons() {
    const playBtns = document.querySelectorAll('.video-placeholder .play-btn');
    playBtns.forEach(btn => {
        if (btn.dataset.bound === 'true') return;
        btn.dataset.bound = 'true';

        btn.addEventListener('click', () => {
            const card = btn.closest('.vocab-detail-card');
            const wordTitle = card ? card.querySelector('h3').textContent : '这个词汇';
            
            let isPlaying = false;
            let playInterval = null;
            let currentFrame = 0;
            const frames = ['👉', '✋', '👆', '👇', '👈', '🤚', '✌️', '🤙'];
            
            if (!isPlaying) {
                isPlaying = true;
                btn.innerHTML = '⏸️';
                
                playInterval = setInterval(() => {
                    currentFrame = (currentFrame + 1) % frames.length;
                    btn.innerHTML = `<span style="font-size: 24px;">${frames[currentFrame]}</span>`;
                }, 500);

                setTimeout(() => {
                    if (isPlaying) {
                        clearInterval(playInterval);
                        btn.innerHTML = '▶';
                        isPlaying = false;
                        alert(`✅ 「${wordTitle}」演示完成！`);
                    }
                }, 4000);
            } else {
                isPlaying = false;
                clearInterval(playInterval);
                btn.innerHTML = '▶';
            }
        });
    });

    const controlBtns = document.querySelectorAll('.vocab-detail-card .control-btn');
    controlBtns.forEach(btn => {
        if (btn.dataset.bound === 'true') return;
        btn.dataset.bound = 'true';

        btn.addEventListener('click', () => {
            const card = btn.closest('.vocab-detail-card');
            const allBtns = card.querySelectorAll('.control-btn');
            allBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const btnText = btn.textContent;
            if (btnText.includes('循环')) {
                alert('🔄 已开启循环播放模式');
            } else if (btnText.includes('慢速')) {
                alert('🐢 已开启慢速模式（0.5x速度）');
            } else if (btnText.includes('多角度')) {
                alert('👁️ 多角度演示：正面、侧面、背面');
            }
        });
    });
}

function openSceneModal(sceneId) {
    const scene = appData.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const modal = document.getElementById('videoModal');
    const body = document.getElementById('videoModalBody');

    const dialogues = {
        1: [
            { speaker: 'A', text: '你好，请问图书馆怎么走？' },
            { speaker: 'B', text: '你好，一直往前走，在第二个路口右转就到了。' },
            { speaker: 'A', text: '谢谢，离这里远吗？' },
            { speaker: 'B', text: '不远，走路大概5分钟就到了。' },
            { speaker: 'A', text: '好的，非常感谢！' },
            { speaker: 'B', text: '不客气，再见！' }
        ],
        2: [
            { speaker: 'A', text: '你好，这件衣服多少钱？' },
            { speaker: 'B', text: '这件200元。' },
            { speaker: 'A', text: '能便宜一点吗？' },
            { speaker: 'B', text: '最低180元给你。' },
            { speaker: 'A', text: '好的，我买了。' },
            { speaker: 'B', text: '谢谢，欢迎下次光临！' }
        ],
        3: [
            { speaker: 'A', text: '医生，我头疼。' },
            { speaker: 'B', text: '这种情况有多久了？' },
            { speaker: 'A', text: '已经三天了。' },
            { speaker: 'B', text: '还有其他症状吗？' },
            { speaker: 'A', text: '还有点发烧。' },
            { speaker: 'B', text: '我给你开点药，按时吃，多休息。' }
        ]
    };

    const sceneDialogues = dialogues[sceneId] || [
        { speaker: 'A', text: '对话内容示例A' },
        { speaker: 'B', text: '对话内容示例B' }
    ];

    body.innerHTML = `
        <div style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
                <div style="width: 64px; height: 64px; background: linear-gradient(135deg, var(--primary-light), var(--primary-color)); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px;">${scene.icon}</div>
                <div>
                    <h2 style="font-size: 24px;">${scene.title}</h2>
                    <p style="color: var(--text-secondary);">${scene.description}</p>
                </div>
            </div>
            
            <div class="dialogue-video" style="height: 300px; border-radius: 12px; margin-bottom: 20px;">
                <div class="play-btn">▶</div>
            </div>
        </div>
        
        <div class="dialogue-script" style="padding: 0;">
            <h3 style="margin-bottom: 16px; font-size: 18px;">对话内容</h3>
            ${sceneDialogues.map(line => `
                <div class="dialogue-line ${line.speaker.toLowerCase()}">
                    <div>
                        <div class="speaker">角色${line.speaker}</div>
                        <div class="dialogue-text">${line.text}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="display: flex; gap: 16px; margin-top: 24px;">
            <button class="btn-primary" style="flex: 1;">开始练习对话</button>
            <button class="btn-outline">学习词汇</button>
        </div>
    `;

    modal.classList.add('active');
}
