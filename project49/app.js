const app = {
    state: {
        language: 'javascript',
        regex: '',
        testText: '',
        replaceTemplate: '',
        flags: {
            global: true,
            caseInsensitive: false,
            multiline: false,
            dotall: false
        },
        matches: []
    },

    templates: [
        { name: '邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', desc: '匹配电子邮件地址' },
        { name: '手机号', pattern: '1[3-9]\\d{9}', desc: '匹配中国大陆手机号' },
        { name: 'URL', pattern: 'https?://[\\w-]+(\\.[\\w-]+)+[\\w-.,@?^=%&:/~+#]*', desc: '匹配URL地址' },
        { name: 'IP地址', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', desc: '匹配IPv4地址' },
        { name: '日期', pattern: '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}', desc: '匹配日期格式' },
        { name: '时间', pattern: '\\d{1,2}:\\d{2}(:\\d{2})?', desc: '匹配时间格式' },
        { name: '身份证', pattern: '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]', desc: '匹配18位身份证号' },
        { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+', desc: '匹配中文字符' }
    ],

    syntaxInfo: {
        javascript: {
            categories: [
                {
                    name: '字符类',
                    items: [
                        { code: '.', desc: '匹配除换行符外任意字符' },
                        { code: '\\d', desc: '匹配数字 [0-9]' },
                        { code: '\\D', desc: '匹配非数字' },
                        { code: '\\w', desc: '匹配单词字符 [a-zA-Z0-9_]' },
                        { code: '\\W', desc: '匹配非单词字符' },
                        { code: '\\s', desc: '匹配空白字符' },
                        { code: '\\S', desc: '匹配非空白字符' },
                        { code: '[abc]', desc: '匹配字符集中任意字符' },
                        { code: '[^abc]', desc: '匹配不在字符集中的字符' },
                        { code: '[a-z]', desc: '匹配字符范围' }
                    ]
                },
                {
                    name: '锚点',
                    items: [
                        { code: '^', desc: '匹配字符串开头' },
                        { code: '$', desc: '匹配字符串结尾' },
                        { code: '\\b', desc: '匹配单词边界' },
                        { code: '\\B', desc: '匹配非单词边界' }
                    ]
                },
                {
                    name: '量词',
                    items: [
                        { code: '*', desc: '匹配 0 次或多次' },
                        { code: '+', desc: '匹配 1 次或多次' },
                        { code: '?', desc: '匹配 0 次或 1 次' },
                        { code: '{n}', desc: '匹配恰好 n 次' },
                        { code: '{n,}', desc: '匹配至少 n 次' },
                        { code: '{n,m}', desc: '匹配 n 到 m 次' },
                        { code: '*?', desc: '非贪婪匹配 0 次或多次' },
                        { code: '+?', desc: '非贪婪匹配 1 次或多次' },
                        { code: '??', desc: '非贪婪匹配 0 次或 1 次' }
                    ]
                },
                {
                    name: '分组与引用',
                    items: [
                        { code: '(abc)', desc: '捕获组' },
                        { code: '(?:abc)', desc: '非捕获组' },
                        { code: '(?<name>abc)', desc: '命名捕获组' },
                        { code: '\\1', desc: '反向引用第1组' },
                        { code: '\\k<name>', desc: '反向引用命名组' },
                        { code: 'a|b', desc: '或操作' }
                    ]
                },
                {
                    name: '先行断言',
                    items: [
                        { code: '(?=abc)', desc: '正向前行断言' },
                        { code: '(?!abc)', desc: '负向前行断言' },
                        { code: '(?<=abc)', desc: '正向后行断言' },
                        { code: '(?<!abc)', desc: '负向后行断言' }
                    ]
                }
            ],
            flags: [
                { code: 'g', desc: '全局匹配' },
                { code: 'i', desc: '忽略大小写' },
                { code: 'm', desc: '多行模式' },
                { code: 's', desc: '点号匹配换行符' },
                { code: 'u', desc: 'Unicode模式' },
                { code: 'y', desc: '粘性匹配' }
            ]
        },
        python: {
            categories: [
                {
                    name: '字符类',
                    items: [
                        { code: '.', desc: '匹配除换行符外任意字符' },
                        { code: '\\d', desc: '匹配数字 [0-9]' },
                        { code: '\\D', desc: '匹配非数字' },
                        { code: '\\w', desc: '匹配单词字符 [a-zA-Z0-9_]' },
                        { code: '\\W', desc: '匹配非单词字符' },
                        { code: '\\s', desc: '匹配空白字符' },
                        { code: '\\S', desc: '匹配非空白字符' },
                        { code: '[abc]', desc: '匹配字符集中任意字符' },
                        { code: '[^abc]', desc: '匹配不在字符集中的字符' }
                    ]
                },
                {
                    name: '锚点',
                    items: [
                        { code: '^', desc: '匹配字符串开头' },
                        { code: '$', desc: '匹配字符串结尾' },
                        { code: '\\b', desc: '匹配单词边界' },
                        { code: '\\A', desc: '匹配字符串开头' },
                        { code: '\\Z', desc: '匹配字符串结尾' }
                    ]
                },
                {
                    name: '量词',
                    items: [
                        { code: '*', desc: '匹配 0 次或多次' },
                        { code: '+', desc: '匹配 1 次或多次' },
                        { code: '?', desc: '匹配 0 次或 1 次' },
                        { code: '{n}', desc: '匹配恰好 n 次' },
                        { code: '{n,}', desc: '匹配至少 n 次' },
                        { code: '{n,m}', desc: '匹配 n 到 m 次' }
                    ]
                },
                {
                    name: '分组与引用',
                    items: [
                        { code: '(abc)', desc: '捕获组' },
                        { code: '(?:abc)', desc: '非捕获组' },
                        { code: '(?P<name>abc)', desc: '命名捕获组' },
                        { code: '\\1', desc: '反向引用第1组' },
                        { code: '(?P=name)', desc: '反向引用命名组' },
                        { code: 'a|b', desc: '或操作' }
                    ]
                }
            ],
            flags: [
                { code: 're.I', desc: '忽略大小写' },
                { code: 're.M', desc: '多行模式' },
                { code: 're.S', desc: '点号匹配换行符' },
                { code: 're.X', desc: 'verbose模式' }
            ],
            differences: [
                'Python 使用 re 模块进行正则匹配',
                '命名捕获组语法为 (?P<name>...)',
                '反向引用命名组使用 (?P=name)',
                '不支持 JavaScript 的先行断言语法'
            ]
        },
        go: {
            categories: [
                {
                    name: '字符类',
                    items: [
                        { code: '.', desc: '匹配除换行符外任意字符' },
                        { code: '\\d', desc: '匹配数字 [0-9]' },
                        { code: '\\D', desc: '匹配非数字' },
                        { code: '\\w', desc: '匹配单词字符 [a-zA-Z0-9_]' },
                        { code: '\\W', desc: '匹配非单词字符' },
                        { code: '\\s', desc: '匹配空白字符' },
                        { code: '\\S', desc: '匹配非空白字符' }
                    ]
                },
                {
                    name: '锚点',
                    items: [
                        { code: '^', desc: '匹配字符串开头' },
                        { code: '$', desc: '匹配字符串结尾' },
                        { code: '\\b', desc: '匹配单词边界' }
                    ]
                },
                {
                    name: '量词',
                    items: [
                        { code: '*', desc: '匹配 0 次或多次' },
                        { code: '+', desc: '匹配 1 次或多次' },
                        { code: '?', desc: '匹配 0 次或 1 次' },
                        { code: '{n}', desc: '匹配恰好 n 次' },
                        { code: '{n,}', desc: '匹配至少 n 次' },
                        { code: '{n,m}', desc: '匹配 n 到 m 次' }
                    ]
                },
                {
                    name: '分组',
                    items: [
                        { code: '(abc)', desc: '捕获组' },
                        { code: '(?:abc)', desc: '非捕获组' },
                        { code: '(?P<name>abc)', desc: '命名捕获组' },
                        { code: 'a|b', desc: '或操作' }
                    ]
                }
            ],
            flags: [
                { code: '(?i)', desc: '忽略大小写' },
                { code: '(?m)', desc: '多行模式' },
                { code: '(?s)', desc: '点号匹配换行符' }
            ],
            differences: [
                'Go 使用 regexp 标准库',
                '命名捕获组语法为 (?P<name>...)',
                '不支持反向引用',
                '不支持先行断言和后行断言',
                '使用 (?flags) 内嵌语法设置标志'
            ]
        }
    },

    init: function() {
        this.syncFlagsFromDOM();
        this.bindEvents();
        this.renderTemplates();
        this.renderSyntaxInfo();
        this.setupDebounce();
    },
    
    syncFlagsFromDOM: function() {
        const flagMap = {
            'flag-global': 'global',
            'flag-caseinsensitive': 'caseInsensitive',
            'flag-multiline': 'multiline',
            'flag-dotall': 'dotall'
        };
        
        Object.entries(flagMap).forEach(([id, stateKey]) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                this.state.flags[stateKey] = checkbox.checked;
            }
        });
    },

    bindEvents: function() {
        const regexInput = document.getElementById('regex-input');
        const testInput = document.getElementById('test-input');
        const replaceInput = document.getElementById('replace-input');
        const languageSelect = document.getElementById('language');
        
        regexInput.addEventListener('input', () => {
            this.state.regex = regexInput.value;
            this.updateResults();
        });
        
        testInput.addEventListener('input', () => {
            this.state.testText = testInput.value;
            this.updateResults();
        });
        
        replaceInput.addEventListener('input', () => {
            this.state.replaceTemplate = replaceInput.value;
            this.updateReplacePreview();
        });
        
        languageSelect.addEventListener('change', (e) => {
            this.state.language = e.target.value;
            this.renderSyntaxInfo();
            this.updateResults();
        });
        
        ['global', 'caseInsensitive', 'multiline', 'dotall'].forEach(flag => {
            const checkbox = document.getElementById(`flag-${flag}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.state.flags[flag] = e.target.checked;
                    this.updateResults();
                });
            }
        });
        
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });
        
        this.syncScroll();
    },

    setupDebounce: function() {
        let timeout;
        this.updateResults = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.executeMatch();
            }, 100);
        };
    },

    renderTemplates: function() {
        const grid = document.getElementById('template-grid');
        grid.innerHTML = this.templates.map(template => `
            <div class="template-item" title="${this.escapeHtml(template.desc)}" data-pattern="${this.escapeHtml(template.pattern)}">
                ${this.escapeHtml(template.name)}
            </div>
        `).join('');
        
        grid.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', () => {
                const pattern = item.dataset.pattern;
                document.getElementById('regex-input').value = pattern;
                this.state.regex = pattern;
                this.updateResults();
            });
        });
    },

    renderSyntaxInfo: function() {
        const syntaxInfo = document.getElementById('syntax-info');
        const language = this.state.language;
        const info = this.syntaxInfo[language];
        
        let html = '';
        
        if (info.differences && info.differences.length > 0) {
            html += `
                <div class="syntax-category" style="grid-column: 1 / -1;">
                    <h3>与JavaScript语法差异</h3>
                    <div style="padding: 15px;">
                        <ul style="list-style: disc; padding-left: 20px; color: var(--text-secondary);">
                            ${info.differences.map(d => `<li>${d}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        html += info.categories.map(category => `
            <div class="syntax-category">
                <h3>${category.name}</h3>
                <table class="syntax-table">
                    <tbody>
                        ${category.items.map(item => `
                            <tr>
                                <td class="syntax-code">${this.escapeHtml(item.code)}</td>
                                <td class="syntax-desc">${item.desc}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `).join('');
        
        syntaxInfo.innerHTML = html;
    },

    executeMatch: function() {
        const regexInput = document.getElementById('regex-input');
        const errorDiv = document.getElementById('regex-error');
        const testInput = document.getElementById('test-input');
        
        if (!this.state.regex) {
            errorDiv.classList.add('hidden');
            this.clearMatches();
            return;
        }
        
        let regex;
        let flags = '';
        
        if (this.state.flags.global) flags += 'g';
        if (this.state.flags.caseInsensitive) flags += 'i';
        if (this.state.flags.multiline) flags += 'm';
        if (this.state.flags.dotall) flags += 's';
        
        try {
            regex = new RegExp(this.state.regex, flags);
            errorDiv.classList.add('hidden');
            this.highlightRegex(this.state.regex);
        } catch (e) {
            errorDiv.textContent = `语法错误: ${e.message}`;
            errorDiv.classList.remove('hidden');
            this.clearMatches();
            return;
        }
        
        const matches = [];
        const testText = this.state.testText;
        
        if (flags.includes('g')) {
            let match;
            while ((match = regex.exec(testText)) !== null) {
                matches.push({
                    fullMatch: match[0],
                    index: match.index,
                    groups: match.slice(1),
                    namedGroups: match.groups || {}
                });
                
                if (match[0].length === 0) {
                    regex.lastIndex++;
                }
            }
        } else {
            const match = regex.exec(testText);
            if (match) {
                matches.push({
                    fullMatch: match[0],
                    index: match.index,
                    groups: match.slice(1),
                    namedGroups: match.groups || {}
                });
            }
        }
        
        this.state.matches = matches;
        this.renderMatches();
        this.highlightTestText(matches);
        this.updateReplacePreview();
        this.renderVisualization();
    },

    highlightRegex: function(pattern) {
        const highlightDiv = document.getElementById('regex-highlight');
        const input = document.getElementById('regex-input');
        
        let highlighted = '';
        let i = 0;
        
        while (i < pattern.length) {
            const char = pattern[i];
            
            if (char === '\\' && i + 1 < pattern.length) {
                const nextChar = pattern[i + 1];
                if ('dDwWsSbBnrtv0\\'.includes(nextChar)) {
                    highlighted += `<span style="color: #8b5cf6;">${this.escapeHtml('\\' + nextChar)}</span>`;
                    i += 2;
                    continue;
                }
                highlighted += `<span style="color: #ef4444;">${this.escapeHtml('\\' + nextChar)}</span>`;
                i += 2;
                continue;
            }
            
            if ('^$.*+?|(){}[]'.includes(char)) {
                highlighted += `<span style="color: #3b82f6; font-weight: bold;">${this.escapeHtml(char)}</span>`;
                i++;
                continue;
            }
            
            if (char === '[') {
                let end = i + 1;
                let depth = 1;
                while (end < pattern.length && depth > 0) {
                    if (pattern[end] === '[') depth++;
                    if (pattern[end] === ']') depth--;
                    end++;
                }
                highlighted += `<span style="color: #22c55e;">${this.escapeHtml(pattern.slice(i, end))}</span>`;
                i = end;
                continue;
            }
            
            highlighted += `<span style="color: var(--text-color);">${this.escapeHtml(char)}</span>`;
            i++;
        }
        
        highlightDiv.innerHTML = highlighted;
    },

    highlightTestText: function(matches) {
        const highlightDiv = document.getElementById('test-highlight');
        const testText = this.state.testText;
        
        if (matches.length === 0) {
            highlightDiv.innerHTML = this.escapeHtml(testText);
            return;
        }
        
        let allRanges = [];
        matches.forEach((match, matchIndex) => {
            const start = match.index;
            const end = start + match.fullMatch.length;
            
            allRanges.push({
                start,
                end,
                type: 'full',
                matchIndex,
                groupIndex: -1
            });
            
            let currentPos = start;
            const regex = new RegExp(this.state.regex, this.getFlagsString());
            const fullMatch = regex.exec(this.state.testText.substring(start, end));
            if (fullMatch && fullMatch.length > 1) {
                for (let g = 1; g < fullMatch.length; g++) {
                    if (fullMatch[g] !== undefined) {
                        const groupStart = start + fullMatch.index + fullMatch[0].indexOf(fullMatch[g]);
                        const groupEnd = groupStart + fullMatch[g].length;
                        if (groupStart >= 0 && groupEnd <= end) {
                            allRanges.push({
                                start: groupStart,
                                end: groupEnd,
                                type: 'group',
                                matchIndex,
                                groupIndex: g - 1
                            });
                        }
                    }
                }
            }
        });
        
        allRanges.sort((a, b) => {
            if (a.start !== b.start) return a.start - b.start;
            if (a.type === 'full') return -1;
            if (b.type === 'full') return 1;
            return 0;
        });
        
        let mergedRanges = [];
        let textPos = 0;
        
        allRanges.forEach(range => {
            if (range.start < textPos) return;
            
            if (range.start > textPos) {
                mergedRanges.push({
                    start: textPos,
                    end: range.start,
                    type: 'text'
                });
            }
            
            mergedRanges.push(range);
            textPos = range.end;
        });
        
        if (textPos < testText.length) {
            mergedRanges.push({
                start: textPos,
                end: testText.length,
                type: 'text'
            });
        }
        
        let result = '';
        mergedRanges.forEach(range => {
            const text = this.escapeHtml(testText.substring(range.start, range.end));
            
            if (range.type === 'text') {
                result += text;
            } else if (range.type === 'full') {
                result += `<span class="match-group-${range.matchIndex % 8}">${text}</span>`;
            } else if (range.type === 'group') {
                result += `<span class="match-group-${(range.groupIndex + 1) % 8}">${text}</span>`;
            }
        });
        
        highlightDiv.innerHTML = result;
    },

    renderMatches: function() {
        const summaryDiv = document.getElementById('matches-summary');
        const listDiv = document.getElementById('matches-list');
        const matches = this.state.matches;
        
        if (matches.length === 0) {
            summaryDiv.textContent = '未找到匹配';
            summaryDiv.style.color = 'var(--text-secondary)';
            listDiv.innerHTML = '';
            return;
        }
        
        summaryDiv.innerHTML = `找到 <strong>${matches.length}</strong> 个匹配`;
        summaryDiv.style.color = 'var(--text-color)';
        
        listDiv.innerHTML = matches.map((match, index) => `
            <div class="match-item">
                <div class="match-header">
                    匹配 #${index + 1} (位置: ${match.index})
                </div>
                <div class="match-details">
                    <div class="match-row">
                        <span class="match-label">完整匹配:</span>
                        <span class="match-value match-group-${index % 8}">${this.escapeHtml(match.fullMatch)}</span>
                    </div>
                    ${match.groups.length > 0 ? match.groups.map((group, gIndex) => `
                        <div class="match-row">
                            <span class="match-label">组 ${gIndex + 1}:</span>
                            <span class="match-value">
                                ${group !== undefined 
                                    ? `<span class="match-group-${(gIndex + 1) % 8}">${this.escapeHtml(group)}</span>`
                                    : '<span style="color: var(--text-secondary);">undefined</span>'
                                }
                            </span>
                        </div>
                    `).join('') : ''}
                    ${Object.keys(match.namedGroups).length > 0 ? Object.entries(match.namedGroups).map(([name, value]) => `
                        <div class="match-row">
                            <span class="match-label">组 "${name}":</span>
                            <span class="match-value">${this.escapeHtml(value)}</span>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `).join('');
    },

    updateReplacePreview: function() {
        const outputDiv = document.getElementById('replace-output');
        const matches = this.state.matches;
        
        if (!this.state.replaceTemplate) {
            outputDiv.innerHTML = '<span style="color: var(--text-secondary);">输入替换模板以预览结果</span>';
            return;
        }
        
        if (matches.length === 0) {
            outputDiv.innerHTML = this.escapeHtml(this.state.testText);
            return;
        }
        
        let result = this.state.testText;
        let offset = 0;
        
        for (let i = matches.length - 1; i >= 0; i--) {
            const match = matches[i];
            const replacement = this.applyReplaceTemplate(match, this.state.replaceTemplate);
            const start = match.index;
            const end = match.index + match.fullMatch.length;
            result = result.substring(0, start) + replacement + result.substring(end);
        }
        
        outputDiv.innerHTML = this.escapeHtml(result);
    },

    applyReplaceTemplate: function(match, template) {
        let result = template;
        
        result = result.replace(/\$(\d+)/g, (_, num) => {
            const index = parseInt(num);
            if (index === 0) return match.fullMatch;
            return match.groups[index - 1] || '';
        });
        
        result = result.replace(/\$&/g, match.fullMatch);
        result = result.replace(/\$`/g, this.state.testText.substring(0, match.index));
        result = result.replace(/\$'/g, this.state.testText.substring(match.index + match.fullMatch.length));
        result = result.replace(/\$\$/g, '$');
        
        return result;
    },

    renderVisualization: function() {
        const svg = document.getElementById('visualization-svg');
        
        if (!this.state.regex) {
            svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="var(--text-secondary)">输入正则表达式以查看可视化解析</text>';
            return;
        }
        
        try {
            new RegExp(this.state.regex);
        } catch (e) {
            svg.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="var(--error-color)">正则表达式语法错误</text>`;
            return;
        }
        
        const states = this.buildSimpleNFA(this.state.regex);
        this.drawNFA(svg, states);
    },

    buildSimpleNFA: function(pattern) {
        const states = [];
        let stateId = 0;
        
        const startState = {
            id: stateId++,
            label: 'Start',
            x: 50,
            y: 200,
            transitions: []
        };
        states.push(startState);
        
        let currentState = startState;
        let i = 0;
        
        while (i < pattern.length) {
            const char = pattern[i];
            
            if (char === '\\' && i + 1 < pattern.length) {
                const nextChar = pattern[i + 1];
                const label = '\\' + nextChar;
                const newState = {
                    id: stateId++,
                    label: `S${stateId - 1}`,
                    x: currentState.x + 120,
                    y: 200,
                    transitions: []
                };
                currentState.transitions.push({
                    target: newState.id,
                    label: label
                });
                states.push(newState);
                currentState = newState;
                i += 2;
                continue;
            }
            
            if (char === '(') {
                const newState = {
                    id: stateId++,
                    label: `(`,
                    x: currentState.x + 100,
                    y: 200,
                    transitions: []
                };
                currentState.transitions.push({
                    target: newState.id,
                    label: 'ε'
                });
                states.push(newState);
                currentState = newState;
                i++;
                continue;
            }
            
            if (char === ')') {
                const newState = {
                    id: stateId++,
                    label: `)`,
                    x: currentState.x + 100,
                    y: 200,
                    transitions: []
                };
                currentState.transitions.push({
                    target: newState.id,
                    label: 'ε'
                });
                states.push(newState);
                currentState = newState;
                i++;
                continue;
            }
            
            if (char === '|') {
                const newState = {
                    id: stateId++,
                    label: '|',
                    x: currentState.x + 80,
                    y: 200,
                    transitions: []
                };
                currentState.transitions.push({
                    target: newState.id,
                    label: '|'
                });
                states.push(newState);
                currentState = newState;
                i++;
                continue;
            }
            
            if (char === '[') {
                let end = i + 1;
                while (end < pattern.length && pattern[end] !== ']') {
                    end++;
                }
                const charClass = pattern.substring(i, end + 1);
                const newState = {
                    id: stateId++,
                    label: `S${stateId - 1}`,
                    x: currentState.x + 150,
                    y: 200,
                    transitions: []
                };
                currentState.transitions.push({
                    target: newState.id,
                    label: charClass
                });
                states.push(newState);
                currentState = newState;
                i = end + 1;
                continue;
            }
            
            if ('*+?'.includes(char)) {
                if (i + 1 < pattern.length && pattern[i + 1] === '?') {
                    currentState.transitions[currentState.transitions.length - 1].label += char + '?';
                    i += 2;
                } else {
                    if (currentState.transitions.length > 0) {
                        currentState.transitions[currentState.transitions.length - 1].label += char;
                    }
                    i++;
                }
                continue;
            }
            
            if (char === '{') {
                let end = i + 1;
                while (end < pattern.length && pattern[end] !== '}') {
                    end++;
                }
                if (end < pattern.length) {
                    const quantifier = pattern.substring(i, end + 1);
                    if (currentState.transitions.length > 0) {
                        currentState.transitions[currentState.transitions.length - 1].label += quantifier;
                    }
                    i = end + 1;
                } else {
                    i++;
                }
                continue;
            }
            
            if ('^$'.includes(char)) {
                const newState = {
                    id: stateId++,
                    label: `S${stateId - 1}`,
                    x: currentState.x + 100,
                    y: 200,
                    transitions: []
                };
                currentState.transitions.push({
                    target: newState.id,
                    label: char
                });
                states.push(newState);
                currentState = newState;
                i++;
                continue;
            }
            
            const newState = {
                id: stateId++,
                label: `S${stateId - 1}`,
                x: currentState.x + 100,
                y: 200,
                transitions: []
            };
            currentState.transitions.push({
                target: newState.id,
                label: char === '.' ? '.' : char
            });
            states.push(newState);
            currentState = newState;
            i++;
        }
        
        const endState = {
            id: stateId++,
            label: 'End',
            x: currentState.x + 100,
            y: 200,
            transitions: [],
            isEnd: true
        };
        currentState.transitions.push({
            target: endState.id,
            label: 'ε'
        });
        states.push(endState);
        
        return states;
    },

    drawNFA: function(svg, states) {
        const stateMap = new Map();
        states.forEach(state => stateMap.set(state.id, state));
        
        let maxX = 0;
        states.forEach(state => {
            maxX = Math.max(maxX, state.x);
        });
        
        const svgWidth = Math.max(maxX + 100, 600);
        svg.setAttribute('viewBox', `0 0 ${svgWidth} 400`);
        
        let html = '';
        
        states.forEach(state => {
            state.transitions.forEach(transition => {
                const targetState = stateMap.get(transition.target);
                if (targetState) {
                    const x1 = state.x + 30;
                    const y1 = state.y;
                    const x2 = targetState.x - 30;
                    const y2 = targetState.y;
                    
                    html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748b" stroke-width="2"/>`;
                    
                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2;
                    
                    const angle = Math.atan2(y2 - y1, x2 - x1);
                    const arrowSize = 8;
                    html += `<polygon points="${x2},${y2} ${x2 - arrowSize * Math.cos(angle - Math.PI/6)},${y2 - arrowSize * Math.sin(angle - Math.PI/6)} ${x2 - arrowSize * Math.cos(angle + Math.PI/6)},${y2 - arrowSize * Math.sin(angle + Math.PI/6)}" fill="#64748b"/>`;
                    
                    html += `<rect x="${midX - 15}" y="${midY - 12}" width="30" height="20" fill="white" rx="4"/>`;
                    html += `<text x="${midX}" y="${midY + 5}" text-anchor="middle" font-family="monospace" font-size="12" fill="#3b82f6">${this.escapeHtml(transition.label)}</text>`;
                }
            });
        });
        
        states.forEach(state => {
            const cx = state.x;
            const cy = state.y;
            const r = 25;
            
            if (state.isEnd) {
                html += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f8fafc" stroke="#22c55e" stroke-width="3"/>`;
                html += `<circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="none" stroke="#22c55e" stroke-width="2"/>`;
            } else if (state.label === 'Start') {
                html += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#dbeafe" stroke="#3b82f6" stroke-width="3"/>`;
                html += `<polygon points="${cx - 50},${cy} ${cx - 35},${cy - 8} ${cx - 35},${cy + 8}" fill="#3b82f6"/>`;
            } else {
                html += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>`;
            }
            
            html += `<text x="${cx}" y="${cy + 5}" text-anchor="middle" font-family="-apple-system" font-size="12" font-weight="500" fill="#1e293b">${this.escapeHtml(state.label)}</text>`;
        });
        
        svg.innerHTML = html;
    },

    switchTab: function(tabName) {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('hidden', !panel.id.includes(tabName));
            panel.classList.toggle('active', panel.id.includes(tabName));
        });
        
        if (tabName === 'visualization') {
            this.renderVisualization();
        }
    },

    syncScroll: function() {
        const testInput = document.getElementById('test-input');
        const testHighlight = document.getElementById('test-highlight');
        
        testInput.addEventListener('scroll', () => {
            testHighlight.scrollTop = testInput.scrollTop;
            testHighlight.scrollLeft = testInput.scrollLeft;
        });
    },

    clearMatches: function() {
        document.getElementById('matches-summary').innerHTML = '<span style="color: var(--text-secondary);">无匹配</span>';
        document.getElementById('matches-list').innerHTML = '';
        document.getElementById('test-highlight').innerHTML = this.escapeHtml(this.state.testText);
        document.getElementById('visualization-svg').innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="var(--text-secondary)">输入正则表达式以查看可视化解析</text>';
        
        const regexHighlight = document.getElementById('regex-highlight');
        if (this.state.regex) {
            regexHighlight.innerHTML = `<span style="color: var(--text-color);">${this.escapeHtml(this.state.regex)}</span>`;
        } else {
            regexHighlight.innerHTML = '';
        }
    },

    getFlagsString: function() {
        let flags = '';
        if (this.state.flags.global) flags += 'g';
        if (this.state.flags.caseInsensitive) flags += 'i';
        if (this.state.flags.multiline) flags += 'm';
        if (this.state.flags.dotall) flags += 's';
        return flags;
    },

    escapeHtml: function(text) {
        if (text === undefined || text === null) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
