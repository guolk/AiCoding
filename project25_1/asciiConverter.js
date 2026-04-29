const ASCIIConverter = {
    charsets: {
        standard: ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
        block: ' ░▒▓█',
        braille: '⠀⠁⠃⠉⠋⠙⠑⠓⠊⠚⠛⠘⠄⠅⠇⠍⠝⠕⠏⠟⠻⠾⠿⠶⠦⠲⠳⠴⠵⠷⠸⠹⠺⠼⠽⠾'
    },

    currentImage: null,
    currentAscii: '',
    currentColors: [],
    isColorMode: false,

    init: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        const imageUpload = document.getElementById('imageUpload');
        const convertBtn = document.getElementById('convertBtn');
        const charsetSelect = document.getElementById('charsetSelect');
        const densitySlider = document.getElementById('densitySlider');
        const contrastSlider = document.getElementById('contrastSlider');
        const colorCheckbox = document.getElementById('colorCheckbox');
        const sendToEditorBtn = document.getElementById('sendToEditorBtn');

        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        if (convertBtn) {
            convertBtn.addEventListener('click', () => this.convert());
        }

        if (densitySlider) {
            densitySlider.addEventListener('input', (e) => {
                document.getElementById('densityValue').textContent = e.target.value;
            });
        }

        if (contrastSlider) {
            contrastSlider.addEventListener('input', (e) => {
                document.getElementById('contrastValue').textContent = e.target.value;
            });
        }

        if (colorCheckbox) {
            colorCheckbox.addEventListener('change', (e) => {
                this.isColorMode = e.target.checked;
            });
        }

        if (sendToEditorBtn) {
            sendToEditorBtn.addEventListener('click', () => this.sendToEditor());
        }
    },

    handleImageUpload: function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                this.drawToCanvas(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    drawToCanvas: function(img) {
        const canvas = document.getElementById('originalCanvas');
        const ctx = canvas.getContext('2d');
        
        const maxWidth = 600;
        const maxHeight = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
        }
        if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
    },

    convert: function() {
        if (!this.currentImage) {
            alert('请先上传图片');
            return;
        }

        const charsetSelect = document.getElementById('charsetSelect');
        const densitySlider = document.getElementById('densitySlider');
        const contrastSlider = document.getElementById('contrastSlider');

        const charset = this.charsets[charsetSelect.value];
        const density = parseInt(densitySlider.value);
        const contrast = parseFloat(contrastSlider.value);

        if (charsetSelect.value === 'braille') {
            this.convertToBraille(charset, density, contrast);
        } else {
            this.convertToStandard(charset, density, contrast);
        }

        document.getElementById('sendToEditorBtn').style.display = 'block';
    },

    convertToStandard: function(charset, density, contrast) {
        const canvas = document.getElementById('originalCanvas');
        const ctx = canvas.getContext('2d');
        
        const cols = density;
        const scale = canvas.width / cols;
        const rows = Math.floor(canvas.height / (scale * 2));

        const result = [];
        const colors = [];

        for (let y = 0; y < rows; y++) {
            let line = '';
            let lineColors = [];

            for (let x = 0; x < cols; x++) {
                const px = Math.floor(x * scale);
                const py = Math.floor(y * scale * 2);
                const pw = Math.floor(scale);
                const ph = Math.floor(scale * 2);

                const imageData = ctx.getImageData(px, py, pw, ph);
                const data = imageData.data;

                let r = 0, g = 0, b = 0, a = 0;
                let brightness = 0;
                const pixelCount = data.length / 4;

                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    a += data[i + 3];
                }

                r = r / pixelCount;
                g = g / pixelCount;
                b = b / pixelCount;
                a = a / pixelCount;

                brightness = (0.299 * r + 0.587 * g + 0.114 * b);
                brightness = this.applyContrast(brightness, contrast);

                const charIndex = Math.floor((brightness / 255) * (charset.length - 1));
                line += charset[charIndex];

                lineColors.push({
                    r: Math.round(r),
                    g: Math.round(g),
                    b: Math.round(b)
                });
            }

            result.push(line);
            colors.push(lineColors);
        }

        this.currentAscii = result.join('\n');
        this.currentColors = colors;
        this.displayAscii(result, colors);
    },

    convertToBraille: function(charset, density, contrast) {
        const canvas = document.getElementById('originalCanvas');
        const ctx = canvas.getContext('2d');
        
        const cols = density;
        const cellWidth = canvas.width / cols;
        const cellHeight = cellWidth * 2;
        const rows = Math.floor(canvas.height / cellHeight);

        const result = [];

        for (let y = 0; y < rows; y++) {
            let line = '';

            for (let x = 0; x < cols; x++) {
                let braillePattern = 0;

                for (let dy = 0; dy < 4; dy++) {
                    for (let dx = 0; dx < 2; dx++) {
                        const px = Math.floor(x * cellWidth + dx * cellWidth / 2);
                        const py = Math.floor(y * cellHeight + dy * cellHeight / 4);
                        
                        const imageData = ctx.getImageData(px, py, 1, 1);
                        const data = imageData.data;
                        const brightness = (0.299 * data[0] + 0.587 * data[1] + 0.114 * data[2]);
                        const adjustedBrightness = this.applyContrast(brightness, contrast);

                        if (adjustedBrightness > 128) {
                            const index = dy * 2 + dx;
                            if (index < 8) {
                                braillePattern |= 1 << index;
                            }
                        }
                    }
                }

                line += String.fromCharCode(0x2800 + braillePattern);
            }

            result.push(line);
        }

        this.currentAscii = result.join('\n');
        this.currentColors = [];
        this.displayAscii(result, []);
    },

    applyContrast: function(value, contrast) {
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        const newValue = factor * (value - 128) + 128;
        return Math.max(0, Math.min(255, newValue));
    },

    displayAscii: function(lines, colors) {
        const output = document.getElementById('asciiOutput');
        
        if (this.isColorMode && colors.length > 0) {
            let html = '';
            for (let y = 0; y < lines.length; y++) {
                const line = lines[y];
                const lineColors = colors[y] || [];
                
                let lineHtml = '';
                for (let x = 0; x < line.length; x++) {
                    const char = line[x];
                    const color = lineColors[x] || { r: 255, g: 255, b: 255 };
                    lineHtml += `<span style="color: rgb(${color.r}, ${color.g}, ${color.b});">${char === ' ' ? '&nbsp;' : char}</span>`;
                }
                html += lineHtml + '\n';
            }
            output.innerHTML = html;
        } else {
            output.textContent = lines.join('\n');
        }
    },

    sendToEditor: function() {
        if (!this.currentAscii) return;

        if (typeof Editor !== 'undefined' && Editor.setText) {
            Editor.setText(this.currentAscii);
            
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

    getCurrentAscii: function() {
        return this.currentAscii;
    },

    getCurrentColors: function() {
        return this.currentColors;
    },

    isColorEnabled: function() {
        return this.isColorMode;
    }
};

window.ASCIIConverter = ASCIIConverter;
