class MusicScoreApp {
    constructor() {
        this.scoreModel = null;
        this.renderer = null;
        this.player = null;
        this.editor = null;
        this.api = scoreAPI;
        
        this.currentScoreId = null;
        
        this.init();
    }

    async init() {
        try {
            this.scoreModel = new ScoreModel();
            
            const canvas = document.getElementById('scoreCanvas');
            if (canvas) {
                this.resizeCanvas(canvas);
            }
            
            this.renderer = new VexFlowRenderer('scoreCanvas', this.scoreModel);
            this.player = new TonePlayer(this.scoreModel);
            this.editor = new ScoreEditor(this.scoreModel, this.renderer, this.player);
            
            this.setupEventListeners();
            this.render();
            
            console.log('Music Score Editor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Music Score Editor:', error);
            this.showError('初始化失败: ' + error.message);
        }
    }

    resizeCanvas(canvas) {
        const container = document.querySelector('.score-container');
        if (container) {
            canvas.width = Math.max(1200, container.clientWidth - 100);
            canvas.height = Math.max(800, container.clientHeight - 100);
        } else {
            canvas.width = 1200;
            canvas.height = 800;
        }
    }

    setupEventListeners() {
        document.getElementById('newBtn')?.addEventListener('click', () => this.newScore());
        document.getElementById('saveBtn')?.addEventListener('click', () => this.showSaveModal());
        document.getElementById('loadBtn')?.addEventListener('click', () => this.showLoadModal());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportPNG());
        
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeAllModals());
        });

        document.getElementById('confirmSaveBtn')?.addEventListener('click', () => this.saveScore());
        
        window.addEventListener('resize', Utils.debounce(() => {
            const canvas = document.getElementById('scoreCanvas');
            if (canvas) {
                this.resizeCanvas(canvas);
                if (this.renderer) {
                    this.renderer.resize(canvas.width, canvas.height);
                    this.render();
                }
            }
        }, 250));

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    this.showSaveModal();
                    break;
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.editor.redo();
                    } else {
                        this.editor.undo();
                    }
                    break;
                case 'n':
                    e.preventDefault();
                    this.newScore();
                    break;
            }
        }

        switch (e.key) {
            case 'Delete':
            case 'Backspace':
                if (this.editor.selectedNoteId) {
                    e.preventDefault();
                    this.editor.deleteSelected();
                }
                break;
            case 'Escape':
                this.editor.selectNote(null);
                this.closeAllModals();
                break;
            case ' ':
                e.preventDefault();
                this.editor.togglePlay();
                break;
            case '1':
                if (!e.ctrlKey && !e.metaKey) {
                    this.editor.setDuration('w');
                    this.editor.updateDurationButtons();
                }
                break;
            case '2':
                if (!e.ctrlKey && !e.metaKey) {
                    this.editor.setDuration('h');
                    this.editor.updateDurationButtons();
                }
                break;
            case '3':
                if (!e.ctrlKey && !e.metaKey) {
                    this.editor.setDuration('q');
                    this.editor.updateDurationButtons();
                }
                break;
            case '4':
                if (!e.ctrlKey && !e.metaKey) {
                    this.editor.setDuration('8');
                    this.editor.updateDurationButtons();
                }
                break;
            case '5':
                if (!e.ctrlKey && !e.metaKey) {
                    this.editor.setDuration('16');
                    this.editor.updateDurationButtons();
                }
                break;
        }
    }

    newScore() {
        if (confirm('确定要新建乐谱吗？当前未保存的更改将丢失。')) {
            this.scoreModel = new ScoreModel();
            this.currentScoreId = null;
            
            this.renderer.scoreModel = this.scoreModel;
            this.player.scoreModel = this.scoreModel;
            this.editor.scoreModel = this.scoreModel;
            
            this.player.initInstruments();
            
            document.getElementById('scoreTitle').value = '我的乐谱';
            document.getElementById('keySignature').value = 'C';
            document.getElementById('timeSignature').value = '4/4';
            
            this.editor.updateTrackList();
            this.render();
        }
    }

    showSaveModal() {
        const modal = document.getElementById('saveModal');
        const titleInput = document.getElementById('saveTitle');
        
        titleInput.value = this.scoreModel.title || '我的乐谱';
        modal.classList.add('show');
    }

    showLoadModal() {
        this.loadScoreList();
        const modal = document.getElementById('loadModal');
        modal.classList.add('show');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    async loadScoreList() {
        try {
            const result = await this.api.listScores();
            const scoreList = document.getElementById('scoreList');
            
            if (result.scores && result.scores.length > 0) {
                scoreList.innerHTML = '';
                
                for (const score of result.scores) {
                    const scoreItem = document.createElement('div');
                    scoreItem.className = 'score-item';
                    
                    const date = new Date(score.updatedAt);
                    const formattedDate = date.toLocaleString('zh-CN');
                    
                    scoreItem.innerHTML = `
                        <div class="score-item-info">
                            <h4>${score.title}</h4>
                            <p>更新于: ${formattedDate}</p>
                        </div>
                        <div class="score-item-actions">
                            <button class="btn btn-primary load-btn" data-id="${score.id}">加载</button>
                            <button class="btn btn-danger delete-btn" data-id="${score.id}">删除</button>
                        </div>
                    `;
                    
                    scoreItem.querySelector('.load-btn').addEventListener('click', () => {
                        this.loadScore(score.id);
                    });
                    
                    scoreItem.querySelector('.delete-btn').addEventListener('click', () => {
                        if (confirm(`确定要删除乐谱 "${score.title}" 吗？`)) {
                            this.deleteScore(score.id);
                        }
                    });
                    
                    scoreList.appendChild(scoreItem);
                }
            } else {
                scoreList.innerHTML = '<p>暂无保存的乐谱</p>';
            }
        } catch (error) {
            console.error('Failed to load score list:', error);
            this.showError('加载乐谱列表失败: ' + error.message);
        }
    }

    async saveScore() {
        try {
            const title = document.getElementById('saveTitle').value || '我的乐谱';
            const musicxml = this.scoreModel.toMusicXML();
            const data = this.scoreModel.toJSON();
            
            if (this.currentScoreId) {
                data.id = this.currentScoreId;
            }
            
            const result = await this.api.saveScore(title, musicxml, data);
            
            if (result.success) {
                this.currentScoreId = result.id;
                this.scoreModel.id = result.id;
                this.scoreModel.title = title;
                this.closeAllModals();
                this.showMessage('乐谱保存成功！');
            }
        } catch (error) {
            console.error('Failed to save score:', error);
            this.showError('保存失败: ' + error.message);
        }
    }

    async loadScore(id) {
        try {
            const result = await this.api.loadScore(id);
            
            if (result.success && result.data) {
                this.scoreModel = new ScoreModel();
                this.scoreModel.fromJSON(result.data.data);
                
                if (result.data.musicxml) {
                    console.log('MusicXML available:', result.data.musicxml.substring(0, 100) + '...');
                }
                
                this.currentScoreId = result.data.id;
                
                this.renderer.scoreModel = this.scoreModel;
                this.player.scoreModel = this.scoreModel;
                this.editor.scoreModel = this.scoreModel;
                
                this.player.dispose();
                this.player = new TonePlayer(this.scoreModel);
                this.editor.player = this.player;
                
                document.getElementById('scoreTitle').value = this.scoreModel.title;
                document.getElementById('keySignature').value = this.scoreModel.keySignature;
                document.getElementById('timeSignature').value = this.scoreModel.timeSignature;
                
                this.editor.updateTrackList();
                this.render();
                
                this.closeAllModals();
                this.showMessage('乐谱加载成功！');
            }
        } catch (error) {
            console.error('Failed to load score:', error);
            this.showError('加载失败: ' + error.message);
        }
    }

    async deleteScore(id) {
        try {
            await this.api.deleteScore(id);
            
            if (this.currentScoreId === id) {
                this.currentScoreId = null;
            }
            
            await this.loadScoreList();
            this.showMessage('乐谱删除成功！');
        } catch (error) {
            console.error('Failed to delete score:', error);
            this.showError('删除失败: ' + error.message);
        }
    }

    async exportPNG() {
        try {
            const canvas = document.getElementById('scoreCanvas');
            if (!canvas) {
                throw new Error('Canvas not found');
            }
            
            await this.api.exportPNGDirect(canvas);
            this.showMessage('PNG导出成功！');
        } catch (error) {
            console.error('Failed to export PNG:', error);
            this.showError('导出失败: ' + error.message);
        }
    }

    render() {
        if (this.renderer) {
            this.renderer.render();
        }
    }

    showMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background-color: #5cb85c;
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background-color: #d9534f;
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 5000);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    window.musicApp = new MusicScoreApp();
});
