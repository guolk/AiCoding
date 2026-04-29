const Share = {
    storageKey: 'ascii_art_shares',
    currentShareId: null,

    init: function() {
        this.bindEvents();
        this.checkURLForShare();
    },

    bindEvents: function() {
        const generateBtn = document.getElementById('generateShareLinkBtn');
        const copyBtn = document.getElementById('copyShareLinkBtn');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateShareLink());
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyShareLink());
        }

        window.addEventListener('hashchange', () => this.checkURLForShare());
    },

    generateShareLink: function() {
        const content = this.getCurrentContent();
        
        if (!content || content.trim() === '') {
            alert('没有可分享的内容');
            return;
        }

        const shareData = {
            id: this.generateUniqueId(),
            content: content,
            timestamp: Date.now(),
            version: 1
        };

        this.saveToLocalStorage(shareData);

        const encodedContent = this.encodeContent(content);
        const shareUrl = `${window.location.origin}${window.location.pathname}#share=${encodedContent}`;

        const shareLinkInput = document.getElementById('shareLink');
        const shareLinkDisplay = document.getElementById('shareLinkDisplay');

        if (shareLinkInput) {
            shareLinkInput.value = shareUrl;
        }

        if (shareLinkDisplay) {
            shareLinkDisplay.style.display = 'flex';
        }

        this.currentShareId = shareData.id;
    },

    getCurrentContent: function() {
        const activeTab = this.getActiveTab();
        
        switch (activeTab) {
            case 'converter':
                if (window.ASCIIConverter) {
                    return window.ASCIIConverter.getCurrentAscii();
                }
                break;
            case 'editor':
                if (window.Editor) {
                    return window.Editor.getText();
                }
                break;
            case 'font':
                if (window.FontRenderer) {
                    return window.FontRenderer.getCurrentOutput();
                }
                break;
        }

        if (window.Editor) {
            const editorText = window.Editor.getText();
            if (editorText && editorText.trim() !== '') {
                return editorText;
            }
        }

        return null;
    },

    getActiveTab: function() {
        const activeTabContent = document.querySelector('.tab-content.active');
        return activeTabContent ? activeTabContent.id : 'editor';
    },

    generateUniqueId: function() {
        return 'ascii_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    encodeContent: function(content) {
        try {
            const compressed = this.compressContent(content);
            return btoa(encodeURIComponent(compressed));
        } catch (e) {
            return btoa(encodeURIComponent(content));
        }
    },

    decodeContent: function(encoded) {
        try {
            const decoded = decodeURIComponent(atob(encoded));
            const decompressed = this.decompressContent(decoded);
            return decompressed;
        } catch (e) {
            try {
                return decodeURIComponent(atob(encoded));
            } catch (e2) {
                return null;
            }
        }
    },

    compressContent: function(content) {
        const words = content.split(/(\s+)/);
        const dict = {};
        let result = [];
        let currentCode = 0;

        for (const word of words) {
            if (!dict.hasOwnProperty(word)) {
                dict[word] = currentCode++;
            }
            result.push(dict[word]);
        }

        return JSON.stringify({
            dict: Object.keys(dict),
            codes: result
        });
    },

    decompressContent: function(compressed) {
        try {
            const data = JSON.parse(compressed);
            if (!data.dict || !data.codes) {
                return compressed;
            }
            
            return data.codes.map(code => data.dict[code]).join('');
        } catch (e) {
            return compressed;
        }
    },

    saveToLocalStorage: function(shareData) {
        try {
            let shares = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            
            if (shares.length > 100) {
                shares = shares.slice(-50);
            }

            shares.push(shareData);
            localStorage.setItem(this.storageKey, JSON.stringify(shares));
        } catch (e) {
            console.warn('无法保存到本地存储:', e);
        }
    },

    loadFromLocalStorage: function(id) {
        try {
            const shares = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            return shares.find(s => s.id === id);
        } catch (e) {
            return null;
        }
    },

    checkURLForShare: function() {
        const hash = window.location.hash;
        if (!hash) return;

        const shareMatch = hash.match(/share=([^&]+)/);
        if (shareMatch && shareMatch[1]) {
            const encodedContent = shareMatch[1];
            const content = this.decodeContent(encodedContent);
            
            if (content) {
                this.loadSharedContent(content);
            }
        }

        const forkMatch = hash.match(/fork=([^&]+)/);
        if (forkMatch && forkMatch[1]) {
            const shareId = forkMatch[1];
            const shareData = this.loadFromLocalStorage(shareId);
            
            if (shareData && shareData.content) {
                this.loadSharedContent(shareData.content);
            }
        }
    },

    loadSharedContent: function(content) {
        if (window.Editor && window.Editor.setText) {
            window.Editor.setText(content);
            
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

            this.showForkNotification();
        }
    },

    showForkNotification: function() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #00d4ff;
            color: #1a1a2e;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 1em;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        notification.textContent = '已加载分享的ASCII艺术作品，您可以自由编辑！';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transition = 'opacity 0.3s ease';
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    },

    copyShareLink: function() {
        const shareLinkInput = document.getElementById('shareLink');
        if (!shareLinkInput) return;

        shareLinkInput.select();
        shareLinkInput.setSelectionRange(0, 99999);

        try {
            document.execCommand('copy');
            this.showCopyNotification();
        } catch (e) {
            navigator.clipboard.writeText(shareLinkInput.value).then(() => {
                this.showCopyNotification();
            }).catch(() => {
                alert('复制失败，请手动复制链接');
            });
        }
    },

    showCopyNotification: function() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #16213e;
            color: #00d4ff;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 0.9em;
            z-index: 1000;
            border: 1px solid #00d4ff;
        `;
        notification.textContent = '✓ 链接已复制到剪贴板';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transition = 'opacity 0.3s ease';
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 2000);
    },

    createForkLink: function(shareId) {
        return `${window.location.origin}${window.location.pathname}#fork=${shareId}`;
    }
};

window.Share = Share;
