const Editor = {
    editorDisplay: null,
    editorCanvas: null,
    canvasCtx: null,
    
    currentTool: 'select',
    drawChar: '#',
    textColor: '#ff0000',
    useColor: true,
    
    defaultCols: 80,
    defaultRows: 40,
    
    grid: [],
    colors: [],
    colorSet: [],
    
    history: [],
    historyIndex: -1,
    maxHistory: 50,
    
    clipboard: null,
    clipboardColors: null,
    clipboardColorSet: null,
    
    selectionStart: null,
    selectionEnd: null,
    isSelecting: false,
    isDrawing: false,
    lineStart: null,
    rectStart: null,
    
    cursorRow: 0,
    cursorCol: 0,
    
    fontSize: 14,
    fontFamily: 'Courier New, Courier, monospace',
    defaultColor: '#ffffff',
    backgroundColor: '#0a0a14',
    
    init: function() {
        this.editorDisplay = document.getElementById('editorDisplay');
        this.editorCanvas = document.getElementById('editorCanvas');
        
        if (this.editorCanvas) {
            this.canvasCtx = this.editorCanvas.getContext('2d');
        }
        
        this.initGrid();
        this.bindEvents();
        this.initUIFromControls();
        this.render();
        this.saveState();
    },

    initUIFromControls: function() {
        const useColorCheckbox = document.getElementById('useColor');
        if (useColorCheckbox) {
            this.useColor = useColorCheckbox.checked;
        }
        
        const textColorInput = document.getElementById('textColor');
        if (textColorInput) {
            this.textColor = textColorInput.value;
        }
        
        const drawCharInput = document.getElementById('drawChar');
        if (drawCharInput && drawCharInput.value.length > 0) {
            this.drawChar = drawCharInput.value.charAt(0);
        }
    },

    initGrid: function() {
        this.grid = [];
        this.colors = [];
        this.colorSet = [];
        
        for (let row = 0; row < this.defaultRows; row++) {
            const rowData = [];
            const rowColors = [];
            const rowColorSet = [];
            for (let col = 0; col < this.defaultCols; col++) {
                rowData.push(' ');
                rowColors.push(this.defaultColor);
                rowColorSet.push(false);
            }
            this.grid.push(rowData);
            this.colors.push(rowColors);
            this.colorSet.push(rowColorSet);
        }
    },

    bindEvents: function() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setTool(e.target.dataset.tool));
        });

        const drawCharInput = document.getElementById('drawChar');
        if (drawCharInput) {
            drawCharInput.addEventListener('input', (e) => {
                if (e.target.value.length > 0) {
                    this.drawChar = e.target.value.charAt(0);
                    e.target.value = this.drawChar;
                }
            });
        }

        const textColorInput = document.getElementById('textColor');
        if (textColorInput) {
            const updateColor = (e) => {
                this.textColor = e.target.value;
            };
            textColorInput.addEventListener('input', updateColor);
            textColorInput.addEventListener('change', updateColor);
        }

        const useColorCheckbox = document.getElementById('useColor');
        if (useColorCheckbox) {
            useColorCheckbox.addEventListener('change', (e) => {
                this.useColor = e.target.checked;
            });
        }

        const clearBtn = document.getElementById('clearEditorBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clear());
        }

        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }

        const redoBtn = document.getElementById('redoBtn');
        if (redoBtn) {
            redoBtn.addEventListener('click', () => this.redo());
        }

        const copyBtn = document.getElementById('copySelectionBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copySelection());
        }

        const pasteBtn = document.getElementById('pasteBtn');
        if (pasteBtn) {
            pasteBtn.addEventListener('click', () => this.paste());
        }

        const cutBtn = document.getElementById('cutSelectionBtn');
        if (cutBtn) {
            cutBtn.addEventListener('click', () => this.cutSelection());
        }

        if (this.editorDisplay) {
            this.editorDisplay.addEventListener('click', (e) => this.handleClick(e));
            this.editorDisplay.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            this.editorDisplay.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.editorDisplay.addEventListener('mouseup', (e) => this.handleMouseUp(e));
            this.editorDisplay.addEventListener('keydown', (e) => this.handleKeydown(e));
            this.editorDisplay.addEventListener('focus', () => this.showCursor());
            this.editorDisplay.addEventListener('blur', () => this.hideCursor());
        }
    },

    setTool: function(tool) {
        this.currentTool = tool;
        
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tool === tool) {
                btn.classList.add('active');
            }
        });
    },

    getGridPosition: function(e) {
        const rect = this.editorDisplay.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const charWidth = this.fontSize * 0.6;
        const lineHeight = this.fontSize * 1.2;
        
        const col = Math.floor(x / charWidth);
        const row = Math.floor(y / lineHeight);
        
        return { 
            row: Math.max(0, Math.min(row, this.grid.length - 1)), 
            col: Math.max(0, Math.min(col, this.grid[0] ? this.grid[0].length - 1 : 0)) 
        };
    },

    handleClick: function(e) {
        const pos = this.getGridPosition(e);
        this.cursorRow = pos.row;
        this.cursorCol = pos.col;
        
        if (this.currentTool === 'draw') {
            this.setChar(pos.row, pos.col, this.drawChar, this.useColor ? this.textColor : null);
            this.render();
            this.saveState();
        } else if (this.currentTool === 'fill') {
            this.fillAtPosition(pos.row, pos.col);
        }
        
        this.updateCursor();
    },

    handleMouseDown: function(e) {
        const pos = this.getGridPosition(e);
        this.cursorRow = pos.row;
        this.cursorCol = pos.col;

        if (this.currentTool === 'select') {
            this.isSelecting = true;
            this.selectionStart = { row: pos.row, col: pos.col };
            this.selectionEnd = { row: pos.row, col: pos.col };
        } else if (this.currentTool === 'line') {
            this.isDrawing = true;
            this.lineStart = { row: pos.row, col: pos.col };
        } else if (this.currentTool === 'rect') {
            this.isDrawing = true;
            this.rectStart = { row: pos.row, col: pos.col };
        } else if (this.currentTool === 'draw') {
            this.isDrawing = true;
            this.setChar(pos.row, pos.col, this.drawChar, this.useColor ? this.textColor : null);
            this.render();
            this.saveState();
        }
        
        this.updateCursor();
    },

    handleMouseMove: function(e) {
        const pos = this.getGridPosition(e);
        
        if (this.isSelecting && this.currentTool === 'select') {
            this.selectionEnd = pos;
            this.render();
        } else if (this.isDrawing && this.currentTool === 'draw') {
            this.setChar(pos.row, pos.col, this.drawChar, this.useColor ? this.textColor : null);
            this.render();
        }
        
        this.cursorRow = pos.row;
        this.cursorCol = pos.col;
        this.updateCursor();
    },

    handleMouseUp: function(e) {
        const pos = this.getGridPosition(e);
        
        if (this.currentTool === 'select' && this.isSelecting) {
            this.selectionEnd = pos;
            this.isSelecting = false;
        } else if (this.currentTool === 'line' && this.lineStart) {
            this.drawLine(this.lineStart.row, this.lineStart.col, pos.row, pos.col);
            this.lineStart = null;
            this.isDrawing = false;
            this.saveState();
        } else if (this.currentTool === 'rect' && this.rectStart) {
            this.drawRect(this.rectStart.row, this.rectStart.col, pos.row, pos.col);
            this.rectStart = null;
            this.isDrawing = false;
            this.saveState();
        } else {
            if (this.isDrawing) {
                this.saveState();
            }
            this.isSelecting = false;
            this.isDrawing = false;
        }
    },

    handleKeydown: function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    return;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    return;
                case 'c':
                    e.preventDefault();
                    this.copySelection();
                    return;
                case 'v':
                    e.preventDefault();
                    this.paste();
                    return;
                case 'x':
                    e.preventDefault();
                    this.cutSelection();
                    return;
            }
        }

        e.preventDefault();
        
        switch (e.key) {
            case 'ArrowUp':
                this.cursorRow = Math.max(0, this.cursorRow - 1);
                break;
            case 'ArrowDown':
                this.cursorRow = Math.min(this.grid.length - 1, this.cursorRow + 1);
                break;
            case 'ArrowLeft':
                this.cursorCol = Math.max(0, this.cursorCol - 1);
                break;
            case 'ArrowRight':
                const maxCol = this.grid[this.cursorRow] ? this.grid[this.cursorRow].length - 1 : 0;
                this.cursorCol = Math.min(maxCol, this.cursorCol + 1);
                break;
            case 'Backspace':
            case 'Delete':
                if (this.currentTool === 'draw' || this.currentTool === 'select') {
                    this.setChar(this.cursorRow, this.cursorCol, ' ', null);
                    this.render();
                    this.saveState();
                }
                break;
            default:
                if (e.key.length === 1) {
                    const color = this.useColor ? this.textColor : null;
                    this.setChar(this.cursorRow, this.cursorCol, e.key, color);
                    
                    const maxCol = this.grid[this.cursorRow] ? this.grid[this.cursorRow].length - 1 : 0;
                    if (this.cursorCol < maxCol) {
                        this.cursorCol++;
                    }
                    
                    this.render();
                    this.saveState();
                }
        }
        
        this.updateCursor();
    },

    setChar: function(row, col, char, color) {
        this.ensureGridSize(row, col);
        
        if (row >= 0 && row < this.grid.length && col >= 0 && col < this.grid[row].length) {
            this.grid[row][col] = char;
            if (color) {
                this.colors[row][col] = color;
                this.colorSet[row][col] = true;
            }
        }
    },

    getChar: function(row, col) {
        if (row >= 0 && row < this.grid.length && col >= 0 && col < this.grid[row].length) {
            return this.grid[row][col];
        }
        return ' ';
    },

    getColor: function(row, col) {
        if (row >= 0 && row < this.colors.length && col >= 0 && col < this.colors[row].length) {
            return this.colors[row][col];
        }
        return this.defaultColor;
    },

    ensureGridSize: function(row, col) {
        while (this.grid.length <= row) {
            const newRow = [];
            const newColors = [];
            const newColorSet = [];
            for (let c = 0; c < (this.grid[0] ? this.grid[0].length : this.defaultCols); c++) {
                newRow.push(' ');
                newColors.push(this.defaultColor);
                newColorSet.push(false);
            }
            this.grid.push(newRow);
            this.colors.push(newColors);
            this.colorSet.push(newColorSet);
        }

        for (let r = 0; r < this.grid.length; r++) {
            while (this.grid[r].length <= col) {
                this.grid[r].push(' ');
                this.colors[r].push(this.defaultColor);
                this.colorSet[r].push(false);
            }
        }
    },

    fillAtPosition: function(startRow, startCol) {
        const targetChar = this.getChar(startRow, startCol);
        const replaceChar = this.drawChar;
        const replaceColor = this.useColor ? this.textColor : null;
        
        if (targetChar === replaceChar && !replaceColor) return;

        const visited = new Set();
        const queue = [{ row: startRow, col: startCol }];

        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.row},${current.col}`;
            
            if (visited.has(key)) continue;
            if (current.row < 0 || current.row >= this.grid.length) continue;
            if (current.col < 0 || current.col >= this.grid[current.row].length) continue;
            if (this.grid[current.row][current.col] !== targetChar) continue;

            visited.add(key);
            this.setChar(current.row, current.col, replaceChar, replaceColor);

            queue.push({ row: current.row - 1, col: current.col });
            queue.push({ row: current.row + 1, col: current.col });
            queue.push({ row: current.row, col: current.col - 1 });
            queue.push({ row: current.row, col: current.col + 1 });
        }

        this.render();
        this.saveState();
    },

    drawLine: function(r1, c1, r2, c2) {
        const dr = Math.abs(r2 - r1);
        const dc = Math.abs(c2 - c1);
        const sr = r1 < r2 ? 1 : -1;
        const sc = c1 < c2 ? 1 : -1;
        let err = dr - dc;

        let r = r1;
        let c = c1;
        const color = this.useColor ? this.textColor : null;

        while (true) {
            this.setChar(r, c, this.drawChar, color);
            
            if (r === r2 && c === c2) break;
            
            const e2 = 2 * err;
            if (e2 > -dc) {
                err -= dc;
                r += sr;
            }
            if (e2 < dr) {
                err += dr;
                c += sc;
            }
        }

        this.render();
    },

    drawRect: function(r1, c1, r2, c2) {
        const minR = Math.min(r1, r2);
        const maxR = Math.max(r1, r2);
        const minC = Math.min(c1, c2);
        const maxC = Math.max(c1, c2);
        const color = this.useColor ? this.textColor : null;

        for (let c = minC; c <= maxC; c++) {
            this.setChar(minR, c, this.drawChar, color);
            this.setChar(maxR, c, this.drawChar, color);
        }

        for (let r = minR + 1; r < maxR; r++) {
            this.setChar(r, minC, this.drawChar, color);
            this.setChar(r, maxC, this.drawChar, color);
        }

        this.render();
    },

    isInSelection: function(row, col) {
        if (!this.selectionStart || !this.selectionEnd) return false;
        
        const minR = Math.min(this.selectionStart.row, this.selectionEnd.row);
        const maxR = Math.max(this.selectionStart.row, this.selectionEnd.row);
        const minC = Math.min(this.selectionStart.col, this.selectionEnd.col);
        const maxC = Math.max(this.selectionStart.col, this.selectionEnd.col);
        
        return row >= minR && row <= maxR && col >= minC && col <= maxC;
    },

    render: function() {
        if (!this.editorDisplay) return;
        
        let html = '';
        
        for (let r = 0; r < this.grid.length; r++) {
            const row = this.grid[r];
            const rowColors = this.colors[r];
            const rowColorSet = this.colorSet[r] || [];
            let rowHtml = '';
            
            for (let c = 0; c < row.length; c++) {
                const char = row[c];
                const color = rowColors[c] || this.defaultColor;
                const isColorSet = rowColorSet[c] || false;
                const inSelection = this.isInSelection(r, c);
                
                let style = '';
                if (inSelection) {
                    style = 'background-color: rgba(0, 212, 255, 0.3);';
                }
                if (isColorSet) {
                    style += `color: ${color};`;
                }
                
                const displayChar = char === ' ' ? '&nbsp;' : char;
                
                if (style) {
                    rowHtml += `<span style="${style}">${displayChar}</span>`;
                } else {
                    rowHtml += displayChar;
                }
            }
            
            html += rowHtml + '<br>';
        }
        
        this.editorDisplay.innerHTML = html;
        this.updateEditorInfo();
    },

    showCursor: function() {
        this.render();
    },

    hideCursor: function() {
    },

    updateCursor: function() {
        this.updateEditorInfo();
    },

    updateEditorInfo: function() {
        const maxLength = Math.max(...this.grid.map(row => row.length), 0);
        const rowCount = this.grid.length;

        const sizeElement = document.getElementById('editorSize');
        if (sizeElement) {
            sizeElement.textContent = `${maxLength} x ${rowCount}`;
        }

        const posElement = document.getElementById('cursorPos');
        if (posElement) {
            posElement.textContent = `${this.cursorCol}, ${this.cursorRow}`;
        }
    },

    copySelection: function() {
        if (!this.selectionStart || !this.selectionEnd) {
            return;
        }

        const minR = Math.min(this.selectionStart.row, this.selectionEnd.row);
        const maxR = Math.max(this.selectionStart.row, this.selectionEnd.row);
        const minC = Math.min(this.selectionStart.col, this.selectionEnd.col);
        const maxC = Math.max(this.selectionStart.col, this.selectionEnd.col);

        const selectionLines = [];
        const selectionColors = [];

        for (let r = minR; r <= maxR && r < this.grid.length; r++) {
            const line = [];
            const lineColors = [];
            for (let c = minC; c <= maxC && c < this.grid[r].length; c++) {
                line.push(this.grid[r][c]);
                lineColors.push(this.colors[r][c]);
            }
            selectionLines.push(line.join(''));
            selectionColors.push(lineColors);
        }

        this.clipboard = selectionLines.join('\n');
        this.clipboardColors = selectionColors;
    },

    paste: function() {
        if (!this.clipboard) return;

        const clipboardLines = this.clipboard.split('\n');
        
        clipboardLines.forEach((clipLine, i) => {
            const r = this.cursorRow + i;
            
            for (let c = 0; c < clipLine.length; c++) {
                const col = this.cursorCol + c;
                let color = null;
                
                if (this.clipboardColors && this.clipboardColors[i] && this.clipboardColors[i][c]) {
                    color = this.clipboardColors[i][c];
                }
                
                this.setChar(r, col, clipLine[c], color);
            }
        });

        this.render();
        this.saveState();
    },

    cutSelection: function() {
        this.copySelection();
        
        if (!this.selectionStart || !this.selectionEnd) {
            return;
        }

        const minR = Math.min(this.selectionStart.row, this.selectionEnd.row);
        const maxR = Math.max(this.selectionStart.row, this.selectionEnd.row);
        const minC = Math.min(this.selectionStart.col, this.selectionEnd.col);
        const maxC = Math.max(this.selectionStart.col, this.selectionEnd.col);

        for (let r = minR; r <= maxR && r < this.grid.length; r++) {
            for (let c = minC; c <= maxC && c < this.grid[r].length; c++) {
                this.grid[r][c] = ' ';
            }
        }

        this.selectionStart = null;
        this.selectionEnd = null;
        
        this.render();
        this.saveState();
    },

    clear: function() {
        this.initGrid();
        this.render();
        this.saveState();
    },

    setText: function(text) {
        const lines = text.split('\n');
        const maxLength = Math.max(...lines.map(l => l.length), this.defaultCols);
        
        this.grid = [];
        this.colors = [];
        this.colorSet = [];

        for (let r = 0; r < Math.max(lines.length, this.defaultRows); r++) {
            const rowData = [];
            const rowColors = [];
            const rowColorSet = [];
            const line = lines[r] || '';
            
            for (let c = 0; c < maxLength; c++) {
                rowData.push(line[c] || ' ');
                rowColors.push(this.defaultColor);
                rowColorSet.push(false);
            }
            
            this.grid.push(rowData);
            this.colors.push(rowColors);
            this.colorSet.push(rowColorSet);
        }

        this.cursorRow = 0;
        this.cursorCol = 0;
        this.render();
        this.saveState();
    },

    getText: function() {
        const lines = this.grid.map(row => row.join(''));
        return lines.join('\n');
    },

    getColors: function() {
        return this.colors;
    },

    hasColors: function() {
        for (let r = 0; r < this.colorSet.length; r++) {
            for (let c = 0; c < this.colorSet[r].length; c++) {
                if (this.colorSet[r][c]) {
                    return true;
                }
            }
        }
        return false;
    },

    saveState: function() {
        const state = {
            grid: JSON.parse(JSON.stringify(this.grid)),
            colors: JSON.parse(JSON.stringify(this.colors)),
            colorSet: JSON.parse(JSON.stringify(this.colorSet))
        };
        
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        if (this.history.length >= this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        
        this.history.push(state);
    },

    undo: function() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.grid = JSON.parse(JSON.stringify(state.grid));
            this.colors = JSON.parse(JSON.stringify(state.colors));
            this.colorSet = JSON.parse(JSON.stringify(state.colorSet));
            this.render();
        }
    },

    redo: function() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.grid = JSON.parse(JSON.stringify(state.grid));
            this.colors = JSON.parse(JSON.stringify(state.colors));
            this.colorSet = JSON.parse(JSON.stringify(state.colorSet));
            this.render();
        }
    }
};

window.Editor = Editor;
