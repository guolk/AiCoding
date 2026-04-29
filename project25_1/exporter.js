const Exporter = {
    fontSize: 14,
    fontFamily: 'Courier New, Courier, monospace',
    backgroundColor: '#0a0a14',
    defaultTextColor: '#ffffff',

    init: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        const exportTxtBtn = document.getElementById('exportTxtBtn');
        const exportSvgBtn = document.getElementById('exportSvgBtn');
        const exportPngBtn = document.getElementById('exportPngBtn');

        if (exportTxtBtn) {
            exportTxtBtn.addEventListener('click', () => this.exportTxt());
        }

        if (exportSvgBtn) {
            exportSvgBtn.addEventListener('click', () => this.exportSvg());
        }

        if (exportPngBtn) {
            exportPngBtn.addEventListener('click', () => this.exportPng());
        }
    },

    hexToRgb: function(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    },

    getCurrentContent: function() {
        const activeTab = document.querySelector('.tab-content.active');
        let content = '';
        let colors = [];
        let isColorMode = false;

        if (activeTab) {
            const tabId = activeTab.id;
            
            switch (tabId) {
                case 'converter':
                    if (window.ASCIIConverter) {
                        content = window.ASCIIConverter.getCurrentAscii();
                        colors = window.ASCIIConverter.getCurrentColors();
                        isColorMode = window.ASCIIConverter.isColorEnabled();
                    }
                    break;
                case 'editor':
                    if (window.Editor) {
                        content = window.Editor.getText();
                        if (window.Editor.hasColors && window.Editor.hasColors()) {
                            const editorColors = window.Editor.getColors();
                            colors = editorColors.map(row => 
                                row.map(color => this.hexToRgb(color))
                            );
                            isColorMode = true;
                        }
                    }
                    break;
                case 'font':
                    if (window.FontRenderer) {
                        content = window.FontRenderer.getCurrentOutput();
                    }
                    break;
            }
        }

        if (!content && window.Editor) {
            content = window.Editor.getText();
            if (window.Editor.hasColors && window.Editor.hasColors()) {
                const editorColors = window.Editor.getColors();
                colors = editorColors.map(row => 
                    row.map(color => this.hexToRgb(color))
                );
                isColorMode = true;
            }
        }

        return { content, colors, isColorMode };
    },

    exportTxt: function() {
        const { content } = this.getCurrentContent();
        
        if (!content || content.trim() === '') {
            alert('没有可导出的内容');
            return;
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ascii_art_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    exportSvg: function() {
        const { content, colors, isColorMode } = this.getCurrentContent();
        
        if (!content || content.trim() === '') {
            alert('没有可导出的内容');
            return;
        }

        const lines = content.split('\n');
        const lineHeight = this.fontSize * 1.2;
        const charWidth = this.fontSize * 0.6;
        
        const maxLineLength = Math.max(...lines.map(l => l.length), 1);
        const width = maxLineLength * charWidth + 20;
        const height = lines.length * lineHeight + 20;

        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${this.backgroundColor}"/>
  <g font-family="${this.fontFamily}" font-size="${this.fontSize}" fill="${this.defaultTextColor}">`;

        lines.forEach((line, lineIndex) => {
            const y = lineIndex * lineHeight + lineHeight + 10;
            const lineColors = colors[lineIndex] || [];

            if (isColorMode && lineColors.length > 0) {
                for (let charIndex = 0; charIndex < line.length; charIndex++) {
                    const char = line[charIndex];
                    const x = charIndex * charWidth + 10;
                    const color = lineColors[charIndex] || { r: 255, g: 255, b: 255 };
                    const fill = `rgb(${color.r}, ${color.g}, ${color.b})`;
                    
                    if (char !== ' ') {
                        svgContent += `\n    <text x="${x}" y="${y}" fill="${fill}">${this.escapeXml(char)}</text>`;
                    }
                }
            } else {
                if (line.trim() !== '') {
                    svgContent += `\n    <text x="10" y="${y}">${this.escapeXml(line)}</text>`;
                }
            }
        });

        svgContent += `\n  </g>\n</svg>`;

        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ascii_art_${Date.now()}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    exportPng: function() {
        const { content, colors, isColorMode } = this.getCurrentContent();
        
        if (!content || content.trim() === '') {
            alert('没有可导出的内容');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const lines = content.split('\n');
        
        const lineHeight = this.fontSize * 1.2;
        const charWidth = this.fontSize * 0.6;
        
        const maxLineLength = Math.max(...lines.map(l => l.length), 1);
        const width = Math.max(maxLineLength * charWidth + 40, 100);
        const height = Math.max(lines.length * lineHeight + 40, 50);

        canvas.width = width * 2;
        canvas.height = height * 2;
        ctx.scale(2, 2);

        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.textBaseline = 'top';
        ctx.fillStyle = this.defaultTextColor;

        lines.forEach((line, lineIndex) => {
            const y = lineIndex * lineHeight + 20;
            const lineColors = colors[lineIndex] || [];

            if (isColorMode && lineColors.length > 0) {
                for (let charIndex = 0; charIndex < line.length; charIndex++) {
                    const char = line[charIndex];
                    const x = charIndex * charWidth + 20;
                    const color = lineColors[charIndex] || { r: 255, g: 255, b: 255 };
                    
                    if (char !== ' ') {
                        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                        ctx.fillText(char, x, y);
                    }
                }
            } else {
                if (line.trim() !== '') {
                    ctx.fillStyle = this.defaultTextColor;
                    ctx.fillText(line, 20, y);
                }
            }
        });

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ascii_art_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    },

    exportPngFromEditor: function(callback) {
        const { content, colors, isColorMode } = this.getCurrentContent();
        
        if (!content || content.trim() === '') {
            callback(null);
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const lines = content.split('\n');
        
        const lineHeight = this.fontSize * 1.2;
        const charWidth = this.fontSize * 0.6;
        
        const maxLineLength = Math.max(...lines.map(l => l.length), 1);
        const width = Math.max(maxLineLength * charWidth + 40, 100);
        const height = Math.max(lines.length * lineHeight + 40, 50);

        canvas.width = width * 2;
        canvas.height = height * 2;
        ctx.scale(2, 2);

        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.textBaseline = 'top';
        ctx.fillStyle = this.defaultTextColor;

        lines.forEach((line, lineIndex) => {
            const y = lineIndex * lineHeight + 20;
            const lineColors = colors[lineIndex] || [];

            if (isColorMode && lineColors.length > 0) {
                for (let charIndex = 0; charIndex < line.length; charIndex++) {
                    const char = line[charIndex];
                    const x = charIndex * charWidth + 20;
                    const color = lineColors[charIndex] || { r: 255, g: 255, b: 255 };
                    
                    if (char !== ' ') {
                        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                        ctx.fillText(char, x, y);
                    }
                }
            } else {
                if (line.trim() !== '') {
                    ctx.fillStyle = this.defaultTextColor;
                    ctx.fillText(line, 20, y);
                }
            }
        });

        canvas.toBlob((blob) => {
            callback(blob);
        }, 'image/png');
    },

    escapeXml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    },

    generateFileName: function(extension) {
        const timestamp = new Date().toISOString().slice(0, 10);
        return `ascii_art_${timestamp}.${extension}`;
    }
};

window.Exporter = Exporter;
