const FontRenderer = {
    currentOutput: '',

    standardFont: {
        'A': ['  ██  ', ' ████ ', '██  ██', '██████', '██  ██', '██  ██'],
        'B': ['█████ ', '██  ██', '█████ ', '██  ██', '██  ██', '█████ '],
        'C': [' █████', '██    ', '██    ', '██    ', '██    ', ' █████'],
        'D': ['█████ ', '██  ██', '██  ██', '██  ██', '██  ██', '█████ '],
        'E': ['██████', '██    ', '█████ ', '██    ', '██    ', '██████'],
        'F': ['██████', '██    ', '█████ ', '██    ', '██    ', '██    '],
        'G': [' █████', '██    ', '██  ██', '██  ██', '██  ██', ' █████'],
        'H': ['██  ██', '██  ██', '██████', '██  ██', '██  ██', '██  ██'],
        'I': ['  ██  ', '  ██  ', '  ██  ', '  ██  ', '  ██  ', '  ██  '],
        'J': ['    ██', '    ██', '    ██', '    ██', '██  ██', ' ████ '],
        'K': ['██  ██', '██ ██ ', '████  ', '██ ██ ', '██  ██', '██  ██'],
        'L': ['██    ', '██    ', '██    ', '██    ', '██    ', '██████'],
        'M': ['██  ██', '███ ██', '██████', '██ ███', '██  ██', '██  ██'],
        'N': ['██  ██', '███ ██', '██ ███', '██  ██', '██  ██', '██  ██'],
        'O': [' █████', '██  ██', '██  ██', '██  ██', '██  ██', ' █████'],
        'P': ['█████ ', '██  ██', '██  ██', '█████ ', '██    ', '██    '],
        'Q': [' █████', '██  ██', '██  ██', '██ ███', '██  ██', ' ████▓'],
        'R': ['█████ ', '██  ██', '██  ██', '█████ ', '██ ██ ', '██  ██'],
        'S': [' █████', '██    ', '██    ', ' █████', '    ██', ' █████'],
        'T': ['██████', '  ██  ', '  ██  ', '  ██  ', '  ██  ', '  ██  '],
        'U': ['██  ██', '██  ██', '██  ██', '██  ██', '██  ██', ' █████'],
        'V': ['██  ██', '██  ██', '██  ██', '██  ██', ' ████ ', '  ██  '],
        'W': ['██  ██', '██  ██', '██ ███', '██████', '███ ██', '██  ██'],
        'X': ['██  ██', ' ████ ', '  ██  ', '  ██  ', ' ████ ', '██  ██'],
        'Y': ['██  ██', '██  ██', ' ████ ', '  ██  ', '  ██  ', '  ██  '],
        'Z': ['██████', '    ██', '   ██ ', '  ██  ', ' ██   ', '██████'],
        '0': [' █████', '██  ██', '██  ██', '██  ██', '██  ██', ' █████'],
        '1': ['  ██  ', ' ███  ', '  ██  ', '  ██  ', '  ██  ', '██████'],
        '2': [' █████', '██  ██', '    ██', '   ██ ', '  ██  ', '██████'],
        '3': [' █████', '    ██', '  ███ ', '    ██', '██  ██', ' █████'],
        '4': ['   ██ ', '  ███ ', ' ██ ██', '██████', '    ██', '    ██'],
        '5': ['██████', '██    ', '█████ ', '    ██', '    ██', '█████ '],
        '6': ['  ███ ', ' ██   ', '██    ', '█████ ', '██  ██', ' █████'],
        '7': ['██████', '    ██', '   ██ ', '  ██  ', ' ██   ', ' ██   '],
        '8': [' █████', '██  ██', ' █████', '██  ██', '██  ██', ' █████'],
        '9': [' █████', '██  ██', ' █████', '    ██', '   ██ ', ' ███  '],
        ' ': ['      ', '      ', '      ', '      ', '      ', '      '],
        '.': ['      ', '      ', '      ', '      ', '  ██  ', '  ██  '],
        ',': ['      ', '      ', '      ', '  ██  ', '  ██  ', ' ██   '],
        '!': ['  ██  ', '  ██  ', '  ██  ', '  ██  ', '      ', '  ██  '],
        '?': [' █████', '██  ██', '    ██', '   ██ ', '      ', '   ██ '],
        '-': ['      ', '      ', '      ', '██████', '      ', '      '],
        '_': ['      ', '      ', '      ', '      ', '      ', '██████'],
        '+': ['      ', '  ██  ', '  ██  ', '██████', '  ██  ', '  ██  '],
        '=': ['      ', '██████', '      ', '██████', '      ', '      '],
        ':': ['      ', '  ██  ', '  ██  ', '      ', '  ██  ', '  ██  '],
        ';': ['      ', '  ██  ', '  ██  ', '      ', '  ██  ', ' ██   '],
        '"': [' ██ ██', ' ██ ██', '      ', '      ', '      ', '      '],
        "'": ['  ██  ', '  ██  ', '      ', '      ', '      ', '      '],
        '(': ['  ███ ', ' ██   ', '██    ', '██    ', ' ██   ', '  ███ '],
        ')': [' ███  ', '   ██ ', '    ██', '    ██', '   ██ ', ' ███  '],
        '[': [' █████', '██    ', '██    ', '██    ', '██    ', ' █████'],
        ']': [' █████', '    ██', '    ██', '    ██', '    ██', ' █████'],
        '{': ['   ██ ', '  ██  ', '██    ', '██    ', '  ██  ', '   ██ '],
        '}': [' ██   ', '  ██  ', '    ██', '    ██', '  ██  ', ' ██   '],
        '/': ['     █', '    █ ', '   █  ', '  █   ', ' █    ', '█     '],
        '\\': ['█     ', ' █    ', '  █   ', '   █  ', '    █ ', '     █'],
        '|': ['  ██  ', '  ██  ', '  ██  ', '  ██  ', '  ██  ', '  ██  '],
        '*': ['      ', '  ██  ', ' ████ ', ' ████ ', '  ██  ', '      '],
        '&': ['  ███ ', ' ██ ██', ' ██   ', ' ██ ██', ' ██ ██', '  ████'],
        '%': ['██  ██', '██  ██', '    ██', '   ██ ', '  ██  ', '██  ██'],
        '$': ['  ███ ', ' ██ ██', ' ██   ', ' ███  ', '   ██ ', ' ███  '],
        '#': [' ██ ██', ' ██ ██', '██████', ' ██ ██', ' ██ ██', '██████'],
        '@': ['  ███ ', ' ██ ██', '██ ███', '██ ███', ' ██  █', '  ███ '],
        '^': ['  ██  ', ' ████ ', '██  ██', '      ', '      ', '      '],
        '~': ['      ', '      ', ' ████ ', '██  ██', '      ', '      '],
        '<': ['   ██ ', '  ██  ', ' ██   ', ' ██   ', '  ██  ', '   ██ '],
        '>': [' ██   ', '  ██  ', '   ██ ', '   ██ ', '  ██  ', ' ██   ']
    },

    init: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        const generateBtn = document.getElementById('generateFontBtn');
        const fontInput = document.getElementById('fontInput');
        const fontToEditorBtn = document.getElementById('fontToEditorBtn');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generate());
        }

        if (fontInput) {
            fontInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.generate();
                }
            });
        }

        if (fontToEditorBtn) {
            fontToEditorBtn.addEventListener('click', () => this.sendToEditor());
        }
    },

    generate: function() {
        const input = document.getElementById('fontInput').value.toUpperCase();
        const style = document.getElementById('fontStyleSelect').value;

        if (!input) {
            alert('请输入文字');
            return;
        }

        switch (style) {
            case 'standard':
                this.currentOutput = this.renderStandard(input);
                break;
            case 'slant':
                this.currentOutput = this.renderSlant(input);
                break;
            case 'shadow':
                this.currentOutput = this.renderShadow(input);
                break;
            case 'block':
                this.currentOutput = this.renderBlock(input);
                break;
            case 'bubble':
                this.currentOutput = this.renderBubble(input);
                break;
            default:
                this.currentOutput = this.renderStandard(input);
        }

        this.displayOutput(this.currentOutput);
    },

    renderStandard: function(text) {
        const lines = ['', '', '', '', '', ''];
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charData = this.standardFont[char] || this.standardFont[' '];
            
            for (let j = 0; j < 6; j++) {
                lines[j] += charData[j] || '      ';
            }
        }
        
        return lines.join('\n');
    },

    renderSlant: function(text) {
        const lines = ['', '', '', '', '', ''];
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charData = this.standardFont[char] || this.standardFont[' '];
            const offset = i % 3;
            
            for (let j = 0; j < 6; j++) {
                const slantOffset = ' '.repeat(offset);
                lines[j] += slantOffset + (charData[j] || '      ');
            }
        }
        
        return lines.join('\n');
    },

    renderShadow: function(text) {
        const shadowLines = this.renderStandard(text).split('\n');
        const lines = [];
        
        for (let i = 0; i < shadowLines.length; i++) {
            const mainLine = shadowLines[i];
            const shadowLine = (i > 0 ? shadowLines[i - 1] : '').replace(/█/g, '░');
            
            let combined = '';
            for (let j = 0; j < mainLine.length; j++) {
                if (mainLine[j] === '█') {
                    combined += '█';
                } else if (j > 0 && shadowLine[j - 1] === '░') {
                    combined += '░';
                } else {
                    combined += ' ';
                }
            }
            lines.push(combined);
        }
        
        return lines.join('\n');
    },

    renderBlock: function(text) {
        const standardLines = this.renderStandard(text).split('\n');
        const lines = [];
        
        for (const line of standardLines) {
            const blockLine = line.replace(/█/g, '▓')
                                   .replace(/██/g, '██')
                                   .replace(/█/g, '█');
            lines.push(blockLine);
            lines.push(blockLine);
        }
        
        return lines.join('\n');
    },

    renderBubble: function(text) {
        const lines = [];
        const chars = text.split('');
        
        let topLine = '╔';
        let middleLines = ['║', '║', '║', '║', '║', '║'];
        let bottomLine = '╚';
        
        for (let i = 0; i < text.length; i++) {
            topLine += '══════╦';
            bottomLine += '══════╩';
            
            const char = text[i];
            const charData = this.standardFont[char] || this.standardFont[' '];
            
            for (let j = 0; j < 6; j++) {
                middleLines[j] += (charData[j] || '      ') + '║';
            }
        }
        
        topLine = topLine.slice(0, -1) + '╗';
        bottomLine = bottomLine.slice(0, -1) + '╝';
        
        lines.push(topLine);
        lines.push(...middleLines);
        lines.push(bottomLine);
        
        return lines.join('\n');
    },

    displayOutput: function(text) {
        const output = document.getElementById('fontOutput');
        if (output) {
            output.textContent = text;
        }
    },

    sendToEditor: function() {
        if (!this.currentOutput) {
            alert('请先生成字体');
            return;
        }

        if (typeof Editor !== 'undefined' && Editor.setText) {
            Editor.setText(this.currentOutput);
            
            const navButtons = document.querySelectorAll('.nav-btn');
            navButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tab === 'editor') {
                    btn.classList.add('active');
                }
            });

            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.id === 'editor') {
                    tab.classList.add('active');
                }
            });
        }
    },

    getCurrentOutput: function() {
        return this.currentOutput;
    }
};

window.FontRenderer = FontRenderer;
