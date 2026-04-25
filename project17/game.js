(function() {
    'use strict';
    
    console.log('物理沙盒游戏脚本开始加载...');
    
    var SandboxGame = function() {
        console.log('SandboxGame 构造函数被调用');
        
        try {
            this.canvas = document.getElementById('canvas');
            if (!this.canvas) {
                console.error('错误：找不到canvas元素！');
                alert('错误：找不到canvas元素！');
                return;
            }
            console.log('找到canvas元素');
            
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                console.error('错误：无法获取canvas上下文！');
                alert('错误：无法获取canvas上下文！');
                return;
            }
            console.log('获取到canvas上下文');
            
            this.cellSize = 4;
            this.width = 600;
            this.height = 400;
            this.cols = Math.floor(this.width / this.cellSize);
            this.rows = Math.floor(this.height / this.cellSize);
            
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            console.log('Canvas尺寸设置为: ' + this.width + 'x' + this.height);
            
            this.grid = [];
            this.updated = [];
            
            this.selectedElement = 'sand';
            this.isPlaying = true;
            this.speed = 10;
            this.brushSize = 5;
            this.isMouseDown = false;
            this.isRightMouseDown = false;
            this.mouseX = 0;
            this.mouseY = 0;
            
            this.elements = {
                empty: { color: '#000000', density: 0, flammable: false },
                sand: { color: '#e6c229', density: 3, flammable: false },
                water: { color: '#3498db', density: 2, flammable: false },
                fire: { color: '#e74c3c', density: 0, flammable: false, life: 50 },
                stone: { color: '#7f8c8d', density: 10, flammable: false },
                wood: { color: '#8b4513', density: 4, flammable: true, burnTime: 100 },
                tnt: { color: '#f39c12', density: 4, flammable: true, explosive: true }
            };
            
            console.log('开始初始化游戏...');
            this.init();
            console.log('游戏初始化完成！');
            
        } catch (error) {
            console.error('SandboxGame 构造函数错误:', error);
            alert('游戏初始化失败: ' + error.message);
        }
    };
    
    SandboxGame.prototype.init = function() {
        try {
            console.log('创建网格...');
            this.createGrid();
            console.log('绑定事件...');
            this.bindEvents();
            console.log('启动游戏循环...');
            this.gameLoop();
        } catch (error) {
            console.error('init 方法错误:', error);
            alert('游戏初始化失败: ' + error.message);
        }
    };
    
    SandboxGame.prototype.createGrid = function() {
        this.grid = [];
        this.updated = [];
        
        for (var i = 0; i < this.rows; i++) {
            this.grid[i] = [];
            this.updated[i] = [];
            for (var j = 0; j < this.cols; j++) {
                this.grid[i][j] = {
                    type: 'empty',
                    color: this.elements.empty.color,
                    life: 0,
                    velocity: { x: 0, y: 0 }
                };
                this.updated[i][j] = false;
            }
        }
        console.log('网格创建完成: ' + this.rows + '行 x ' + this.cols + '列');
    };
    
    SandboxGame.prototype.bindEvents = function() {
        var self = this;
        
        console.log('开始绑定事件...');
        
        try {
            var elementBtns = document.querySelectorAll('.element-btn');
            console.log('找到 ' + elementBtns.length + ' 个元素按钮');
            
            elementBtns.forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    console.log('按钮被点击: ' + e.target.textContent);
                    try {
                        elementBtns.forEach(function(b) {
                            b.classList.remove('active');
                        });
                        e.target.classList.add('active');
                        self.selectedElement = e.target.dataset.element;
                        console.log('选中元素: ' + self.selectedElement);
                    } catch (error) {
                        console.error('元素按钮点击错误:', error);
                    }
                });
            });
            
            var playPauseBtn = document.getElementById('playPause');
            if (playPauseBtn) {
                playPauseBtn.addEventListener('click', function(e) {
                    console.log('暂停/继续按钮被点击');
                    try {
                        self.isPlaying = !self.isPlaying;
                        e.target.textContent = self.isPlaying ? '暂停' : '继续';
                        e.target.classList.toggle('playing', self.isPlaying);
                        e.target.classList.toggle('paused', !self.isPlaying);
                        console.log('游戏状态: ' + (self.isPlaying ? '运行中' : '已暂停'));
                    } catch (error) {
                        console.error('暂停/继续按钮错误:', error);
                    }
                });
            } else {
                console.error('找不到playPause按钮');
            }
            
            var clearBtn = document.getElementById('clear');
            if (clearBtn) {
                clearBtn.addEventListener('click', function() {
                    console.log('清空按钮被点击');
                    try {
                        self.createGrid();
                        console.log('画布已清空');
                    } catch (error) {
                        console.error('清空按钮错误:', error);
                    }
                });
            } else {
                console.error('找不到clear按钮');
            }
            
            var speedSlider = document.getElementById('speed');
            if (speedSlider) {
                speedSlider.addEventListener('input', function(e) {
                    try {
                        self.speed = parseInt(e.target.value);
                        var speedValue = document.getElementById('speedValue');
                        if (speedValue) {
                            speedValue.textContent = (self.speed / 10).toFixed(1) + 'x';
                        }
                        console.log('速度设置为: ' + self.speed);
                    } catch (error) {
                        console.error('速度滑块错误:', error);
                    }
                });
            }
            
            var brushSizeSlider = document.getElementById('brushSize');
            if (brushSizeSlider) {
                brushSizeSlider.addEventListener('input', function(e) {
                    try {
                        self.brushSize = parseInt(e.target.value);
                        var brushValue = document.getElementById('brushValue');
                        if (brushValue) {
                            brushValue.textContent = self.brushSize;
                        }
                        console.log('画笔大小设置为: ' + self.brushSize);
                    } catch (error) {
                        console.error('画笔大小滑块错误:', error);
                    }
                });
            }
            
            var saveBtn = document.getElementById('save');
            if (saveBtn) {
                saveBtn.addEventListener('click', function() {
                    console.log('保存按钮被点击');
                    try {
                        self.saveState();
                    } catch (error) {
                        console.error('保存按钮错误:', error);
                    }
                });
            }
            
            var loadBtn = document.getElementById('load');
            if (loadBtn) {
                loadBtn.addEventListener('click', function() {
                    console.log('加载按钮被点击');
                    try {
                        self.loadState();
                    } catch (error) {
                        console.error('加载按钮错误:', error);
                    }
                });
            }
            
            this.canvas.addEventListener('mousedown', function(e) {
                console.log('鼠标按下, 按钮: ' + e.button);
                try {
                    if (e.button === 0) {
                        self.isMouseDown = true;
                    } else if (e.button === 2) {
                        self.isRightMouseDown = true;
                    }
                    self.updateMousePosition(e);
                    self.placeElements();
                } catch (error) {
                    console.error('鼠标按下错误:', error);
                }
            });
            
            this.canvas.addEventListener('mouseup', function(e) {
                try {
                    if (e.button === 0) {
                        self.isMouseDown = false;
                    } else if (e.button === 2) {
                        self.isRightMouseDown = false;
                    }
                } catch (error) {
                    console.error('鼠标抬起错误:', error);
                }
            });
            
            this.canvas.addEventListener('mousemove', function(e) {
                try {
                    self.updateMousePosition(e);
                    if (self.isMouseDown || self.isRightMouseDown) {
                        self.placeElements();
                    }
                } catch (error) {
                    console.error('鼠标移动错误:', error);
                }
            });
            
            this.canvas.addEventListener('mouseleave', function() {
                self.isMouseDown = false;
                self.isRightMouseDown = false;
            });
            
            this.canvas.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });
            
            console.log('所有事件绑定完成！');
            
        } catch (error) {
            console.error('bindEvents 方法错误:', error);
            alert('事件绑定失败: ' + error.message);
        }
    };
    
    SandboxGame.prototype.updateMousePosition = function(e) {
        var rect = this.canvas.getBoundingClientRect();
        this.mouseX = Math.floor((e.clientX - rect.left) / this.cellSize);
        this.mouseY = Math.floor((e.clientY - rect.top) / this.cellSize);
    };
    
    SandboxGame.prototype.placeElements = function() {
        var element = this.isRightMouseDown ? 'empty' : this.selectedElement;
        
        for (var dy = -this.brushSize + 1; dy < this.brushSize; dy++) {
            for (var dx = -this.brushSize + 1; dx < this.brushSize; dx++) {
                if (dx * dx + dy * dy < this.brushSize * this.brushSize) {
                    var x = this.mouseX + dx;
                    var y = this.mouseY + dy;
                    
                    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                        if (element === 'empty') {
                            this.setCell(x, y, 'empty');
                        } else if (this.grid[y][x].type === 'empty') {
                            this.setCell(x, y, element);
                        }
                    }
                }
            }
        }
    };
    
    SandboxGame.prototype.setCell = function(x, y, type) {
        var element = this.elements[type];
        this.grid[y][x] = {
            type: type,
            color: element.color,
            life: element.life || 0,
            velocity: { x: 0, y: 0 }
        };
        this.updated[y][x] = true;
    };
    
    SandboxGame.prototype.isEmpty = function(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
            return false;
        }
        return this.grid[y][x].type === 'empty';
    };
    
    SandboxGame.prototype.getCell = function(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
            return null;
        }
        return this.grid[y][x];
    };
    
    SandboxGame.prototype.swapCells = function(x1, y1, x2, y2) {
        var temp = this.grid[y1][x1];
        this.grid[y1][x1] = this.grid[y2][x2];
        this.grid[y2][x2] = temp;
        
        this.updated[y1][x1] = true;
        this.updated[y2][x2] = true;
    };
    
    SandboxGame.prototype.updateSand = function(x, y) {
        if (this.isEmpty(x, y + 1)) {
            this.swapCells(x, y, x, y + 1);
            return;
        }
        
        var below = this.getCell(x, y + 1);
        if (below && below.type === 'water') {
            this.swapCells(x, y, x, y + 1);
            return;
        }
        
        var dir = Math.random() < 0.5 ? -1 : 1;
        if (this.isEmpty(x + dir, y + 1)) {
            this.swapCells(x, y, x + dir, y + 1);
        } else if (this.isEmpty(x - dir, y + 1)) {
            this.swapCells(x, y, x - dir, y + 1);
        }
    };
    
    SandboxGame.prototype.updateWater = function(x, y) {
        if (this.isEmpty(x, y + 1)) {
            this.swapCells(x, y, x, y + 1);
            return;
        }
        
        var dir = Math.random() < 0.5 ? -1 : 1;
        if (this.isEmpty(x + dir, y + 1)) {
            this.swapCells(x, y, x + dir, y + 1);
        } else if (this.isEmpty(x - dir, y + 1)) {
            this.swapCells(x, y, x - dir, y + 1);
        } else {
            if (this.isEmpty(x + dir, y)) {
                this.swapCells(x, y, x + dir, y);
            } else if (this.isEmpty(x - dir, y)) {
                this.swapCells(x, y, x - dir, y);
            }
        }
    };
    
    SandboxGame.prototype.updateFire = function(x, y) {
        var cell = this.grid[y][x];
        cell.life--;
        
        if (cell.life <= 0) {
            this.setCell(x, y, 'empty');
            return;
        }
        
        var variation = Math.floor(Math.random() * 100);
        if (variation < 30) {
            cell.color = '#ff6b35';
        } else if (variation < 60) {
            cell.color = '#ffd700';
        } else {
            cell.color = '#e74c3c';
        }
        
        var neighbors = [
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 1, dy: -1 },
            { dx: -1, dy: -1 }
        ];
        
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];
            var nx = x + neighbor.dx;
            var ny = y + neighbor.dy;
            var neighborCell = this.getCell(nx, ny);
            
            if (neighborCell) {
                if (neighborCell.type === 'wood' && Math.random() < 0.05) {
                    this.setCell(nx, ny, 'fire');
                } else if (neighborCell.type === 'tnt' && Math.random() < 0.1) {
                    this.explode(nx, ny);
                } else if (neighborCell.type === 'water') {
                    this.setCell(x, y, 'empty');
                    if (Math.random() < 0.3) {
                        this.setCell(nx, ny, 'empty');
                    }
                    return;
                }
            }
        }
        
        if (this.isEmpty(x, y - 1) && Math.random() < 0.3) {
            this.swapCells(x, y, x, y - 1);
        } else if (Math.random() < 0.1) {
            var dir = Math.random() < 0.5 ? -1 : 1;
            if (this.isEmpty(x + dir, y - 1)) {
                this.swapCells(x, y, x + dir, y - 1);
            }
        }
    };
    
    SandboxGame.prototype.explode = function(x, y) {
        var radius = 8;
        var self = this;
        
        for (var dy = -radius; dy <= radius; dy++) {
            for (var dx = -radius; dx <= radius; dx++) {
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= radius) {
                    var nx = x + dx;
                    var ny = y + dy;
                    
                    if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
                        var cell = this.getCell(nx, ny);
                        
                        if (cell.type === 'stone') {
                            continue;
                        }
                        
                        if (dist < radius * 0.7) {
                            if (Math.random() < 0.7) {
                                this.setCell(nx, ny, 'empty');
                            }
                        } else {
                            if (Math.random() < 0.3) {
                                this.setCell(nx, ny, 'fire');
                            } else if (Math.random() < 0.5) {
                                this.setCell(nx, ny, 'empty');
                            }
                        }
                        
                        if (cell.type === 'tnt' && !(dx === 0 && dy === 0)) {
                            (function(nx, ny) {
                                setTimeout(function() {
                                    self.explode(nx, ny);
                                }, Math.random() * 100);
                            })(nx, ny);
                        }
                    }
                }
            }
        }
    };
    
    SandboxGame.prototype.update = function() {
        if (!this.isPlaying) return;
        
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                this.updated[i][j] = false;
            }
        }
        
        var leftToRight = Math.random() < 0.5;
        
        for (var y = this.rows - 1; y >= 0; y--) {
            if (leftToRight) {
                for (var x = 0; x < this.cols; x++) {
                    this.updateCell(x, y);
                }
            } else {
                for (var x = this.cols - 1; x >= 0; x--) {
                    this.updateCell(x, y);
                }
            }
        }
    };
    
    SandboxGame.prototype.updateCell = function(x, y) {
        if (this.updated[y][x]) return;
        
        var cell = this.grid[y][x];
        if (cell.type === 'empty') return;
        
        this.updated[y][x] = true;
        
        switch (cell.type) {
            case 'sand':
                this.updateSand(x, y);
                break;
            case 'water':
                this.updateWater(x, y);
                break;
            case 'fire':
                this.updateFire(x, y);
                break;
            case 'wood':
            case 'stone':
            case 'tnt':
                break;
        }
    };
    
    SandboxGame.prototype.render = function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        for (var y = 0; y < this.rows; y++) {
            for (var x = 0; x < this.cols; x++) {
                var cell = this.grid[y][x];
                if (cell.type !== 'empty') {
                    this.ctx.fillStyle = cell.color;
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }
    };
    
    SandboxGame.prototype.gameLoop = function() {
        var self = this;
        
        try {
            for (var i = 0; i < Math.ceil(this.speed / 5); i++) {
                this.update();
            }
            this.render();
        } catch (error) {
            console.error('游戏循环错误:', error);
        }
        
        requestAnimationFrame(function() {
            self.gameLoop();
        });
    };
    
    SandboxGame.prototype.saveState = function() {
        try {
            var state = {
                cols: this.cols,
                rows: this.rows,
                grid: []
            };
            
            for (var y = 0; y < this.rows; y++) {
                state.grid[y] = [];
                for (var x = 0; x < this.cols; x++) {
                    var cell = this.grid[y][x];
                    state.grid[y][x] = {
                        type: cell.type,
                        color: cell.color,
                        life: cell.life
                    };
                }
            }
            
            localStorage.setItem('sandboxGameState', JSON.stringify(state));
            alert('游戏状态已保存！');
            console.log('游戏状态已保存到localStorage');
        } catch (error) {
            console.error('保存状态错误:', error);
            alert('保存失败: ' + error.message);
        }
    };
    
    SandboxGame.prototype.loadState = function() {
        try {
            var savedState = localStorage.getItem('sandboxGameState');
            
            if (!savedState) {
                alert('没有找到保存的游戏状态！');
                return;
            }
            
            var state = JSON.parse(savedState);
            
            if (state.cols !== this.cols || state.rows !== this.rows) {
                alert('保存的游戏状态与当前画布大小不兼容！');
                return;
            }
            
            for (var y = 0; y < this.rows; y++) {
                for (var x = 0; x < this.cols; x++) {
                    var savedCell = state.grid[y][x];
                    this.grid[y][x] = {
                        type: savedCell.type,
                        color: savedCell.color,
                        life: savedCell.life,
                        velocity: { x: 0, y: 0 }
                    };
                    this.updated[y][x] = true;
                }
            }
            
            alert('游戏状态已加载！');
            console.log('游戏状态已从localStorage加载');
        } catch (error) {
            console.error('加载状态错误:', error);
            alert('加载失败: ' + error.message);
        }
    };
    
    console.log('等待DOM加载完成...');
    
    function initGame() {
        console.log('DOM已加载，开始初始化游戏...');
        try {
            window.gameInstance = new SandboxGame();
            console.log('游戏实例创建成功！');
        } catch (error) {
            console.error('游戏初始化失败:', error);
            alert('游戏初始化失败: ' + error.message);
        }
    }
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('DOM已经加载完成，立即初始化游戏');
        setTimeout(initGame, 1);
    } else {
        console.log('等待DOMContentLoaded事件...');
        document.addEventListener('DOMContentLoaded', initGame);
    }
    
    window.addEventListener('load', function() {
        console.log('window load事件触发');
        if (!window.gameInstance) {
            console.log('游戏实例还未创建，现在创建...');
            initGame();
        }
    });
    
})();
