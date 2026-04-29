const App = {
    init: function() {
        this.initTabs();
        this.initModules();
    },

    initTabs: function() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    },

    switchTab: function(tabId) {
        const navButtons = document.querySelectorAll('.nav-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });

        tabContents.forEach(tab => {
            tab.classList.remove('active');
            if (tab.id === tabId) {
                tab.classList.add('active');
            }
        });

        window.location.hash = tabId;
    },

    initModules: function() {
        if (window.ASCIIConverter) {
            window.ASCIIConverter.init();
        }

        if (window.Editor) {
            window.Editor.init();
        }

        if (window.FontRenderer) {
            window.FontRenderer.init();
        }

        if (window.Exporter) {
            window.Exporter.init();
        }

        if (window.Share) {
            window.Share.init();
        }

        this.checkHashOnLoad();
    },

    checkHashOnLoad: function() {
        const hash = window.location.hash;
        
        if (hash) {
            if (hash.includes('share=') || hash.includes('fork=')) {
                return;
            }

            const tabId = hash.substring(1);
            const validTabs = ['converter', 'editor', 'font'];
            
            if (validTabs.includes(tabId)) {
                this.switchTab(tabId);
            }
        }
    },

    getActiveTab: function() {
        const activeTab = document.querySelector('.nav-btn.active');
        return activeTab ? activeTab.dataset.tab : 'editor';
    },

    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        
        const colors = {
            info: { bg: '#00d4ff', text: '#1a1a2e' },
            success: { bg: '#4CAF50', text: '#ffffff' },
            error: { bg: '#f44336', text: '#ffffff' },
            warning: { bg: '#ff9800', text: '#ffffff' }
        };

        const color = colors[type] || colors.info;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color.bg};
            color: ${color.text};
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 0.95em;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transform: translateX(120%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    confirm: function(message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: #16213e;
            border: 1px solid #0f3460;
            border-radius: 10px;
            padding: 25px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;

        dialog.innerHTML = `
            <p style="color: #eee; margin-bottom: 20px; font-size: 1em;">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="cancel-btn" style="padding: 10px 20px; background: #0f3460; border: 1px solid #16213e; color: #eee; border-radius: 5px; cursor: pointer;">取消</button>
                <button class="confirm-btn" style="padding: 10px 20px; background: #00d4ff; border: none; color: #1a1a2e; border-radius: 5px; cursor: pointer;">确定</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const closeDialog = () => {
            document.body.removeChild(overlay);
        };

        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            closeDialog();
            if (onCancel) onCancel();
        });

        dialog.querySelector('.confirm-btn').addEventListener('click', () => {
            closeDialog();
            if (onConfirm) onConfirm();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeDialog();
                if (onCancel) onCancel();
            }
        });
    },

    prompt: function(message, defaultValue, onSubmit, onCancel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: #16213e;
            border: 1px solid #0f3460;
            border-radius: 10px;
            padding: 25px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;

        dialog.innerHTML = `
            <p style="color: #eee; margin-bottom: 15px; font-size: 1em;">${message}</p>
            <input type="text" class="prompt-input" value="${defaultValue || ''}" style="width: 100%; padding: 10px; background: #0f3460; border: 1px solid #16213e; color: #eee; border-radius: 5px; margin-bottom: 20px; box-sizing: border-box;">
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="cancel-btn" style="padding: 10px 20px; background: #0f3460; border: 1px solid #16213e; color: #eee; border-radius: 5px; cursor: pointer;">取消</button>
                <button class="submit-btn" style="padding: 10px 20px; background: #00d4ff; border: none; color: #1a1a2e; border-radius: 5px; cursor: pointer;">确定</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const input = dialog.querySelector('.prompt-input');
        input.focus();
        input.select();

        const closeDialog = () => {
            document.body.removeChild(overlay);
        };

        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            closeDialog();
            if (onCancel) onCancel();
        });

        dialog.querySelector('.submit-btn').addEventListener('click', () => {
            const value = input.value;
            closeDialog();
            if (onSubmit) onSubmit(value);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const value = input.value;
                closeDialog();
                if (onSubmit) onSubmit(value);
            } else if (e.key === 'Escape') {
                closeDialog();
                if (onCancel) onCancel();
            }
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeDialog();
                if (onCancel) onCancel();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.App = App;
