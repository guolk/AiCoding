const ShoppingModule = {
    currentAisle: '全部',

    init() {
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        const btnGenerate = document.getElementById('btn-generate-list');
        if (btnGenerate) {
            btnGenerate.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('点击从餐单生成按钮');
                this.generateFromMealPlans();
            });
        } else {
            console.error('未找到btn-generate-list按钮');
        }

        const btnClear = document.getElementById('btn-clear-list');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                this.clearList();
            });
        }

        const btnExport = document.getElementById('btn-export-list');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                this.exportList();
            });
        }

        const btnAddInventory = document.getElementById('btn-add-inventory');
        if (btnAddInventory) {
            btnAddInventory.addEventListener('click', () => {
                this.addInventoryItem();
            });
        }

        const inventoryInput = document.getElementById('inventory-input');
        if (inventoryInput) {
            inventoryInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addInventoryItem();
                }
            });
        }
    },

    render() {
        this.renderInventory();
        this.renderAisleTabs();
        this.renderShoppingItems();
        this.renderStats();
    },

    renderInventory() {
        const container = document.getElementById('inventory-list');
        const items = AppState.inventory.items;

        if (items.length === 0) {
            container.innerHTML = `
                <div style="color: var(--text-muted); text-align: center; padding: 1rem; font-size: 0.875rem;">
                    暂无库存食材
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="inventory-item">
                <span>${item.name} ${item.quantity > 1 ? `×${item.quantity}` : ''}</span>
                <button class="remove" onclick="ShoppingModule.removeInventoryItem('${item.id}')">×</button>
            </div>
        `).join('');
    },

    addInventoryItem() {
        const input = document.getElementById('inventory-input');
        const name = input.value.trim();
        
        if (!name) {
            Toast.error('请输入食材名称');
            return;
        }

        AppState.inventory.addItem(name);
        AppState.saveToStorage();
        input.value = '';
        Toast.success(`已添加 ${name} 到库存`);
        this.render();
    },

    removeInventoryItem(itemId) {
        AppState.inventory.removeItem(itemId);
        AppState.saveToStorage();
        this.render();
    },

    renderAisleTabs() {
        const container = document.getElementById('aisle-tabs');
        const itemsByAisle = AppState.shoppingList.getItemsByAisle();
        const aisles = Object.keys(itemsByAisle);
        const allCount = AppState.shoppingList.items.length;

        let tabsHtml = `
            <button class="aisle-tab ${this.currentAisle === '全部' ? 'active' : ''}" 
                    onclick="ShoppingModule.setAisle('全部')">
                全部 <span class="count">${allCount}</span>
            </button>
        `;

        const aisleOrder = ['生鲜', '蔬菜', '水果', '主食', '调料', '冷冻', '干货', '饮品', '其他'];
        aisleOrder.forEach(aisle => {
            if (aisles.includes(aisle)) {
                const count = itemsByAisle[aisle].length;
                tabsHtml += `
                    <button class="aisle-tab ${this.currentAisle === aisle ? 'active' : ''}" 
                            onclick="ShoppingModule.setAisle('${aisle}')">
                        ${aisle} <span class="count">${count}</span>
                    </button>
                `;
            }
        });

        aisles.forEach(aisle => {
            if (!aisleOrder.includes(aisle)) {
                const count = itemsByAisle[aisle].length;
                tabsHtml += `
                    <button class="aisle-tab ${this.currentAisle === aisle ? 'active' : ''}" 
                            onclick="ShoppingModule.setAisle('${aisle}')">
                        ${aisle} <span class="count">${count}</span>
                    </button>
                `;
            }
        });

        container.innerHTML = tabsHtml;
    },

    setAisle(aisle) {
        this.currentAisle = aisle;
        this.renderAisleTabs();
        this.renderShoppingItems();
    },

    renderShoppingItems() {
        const container = document.getElementById('shopping-items');
        let items = AppState.shoppingList.items;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🛒</div>
                    <div class="empty-state-text">购物清单为空</div>
                    <div class="empty-state-hint">点击"从餐单生成"自动创建购物清单</div>
                </div>
            `;
            return;
        }

        if (this.currentAisle !== '全部') {
            items = items.filter(item => item.aisle === this.currentAisle);
        }

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-text">该分类暂无食材</div>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="shopping-item ${item.checked ? 'checked' : ''}">
                <input type="checkbox" class="item-checkbox" 
                       ${item.checked ? 'checked' : ''}
                       onchange="ShoppingModule.toggleChecked('${item.id}')">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">${item.amount}</span>
                <span class="item-unit">${item.unit}</span>
                ${item.inInventory ? '<span class="item-in-inventory">已有</span>' : ''}
                <button class="remove-item" onclick="ShoppingModule.removeItem('${item.id}')">×</button>
            </div>
        `).join('');
    },

    toggleChecked(itemId) {
        AppState.shoppingList.toggleChecked(itemId);
        AppState.saveToStorage();
        this.render();
    },

    toggleInventory(itemId) {
        AppState.shoppingList.toggleInventory(itemId);
        AppState.saveToStorage();
        this.render();
    },

    removeItem(itemId) {
        AppState.shoppingList.removeItem(itemId);
        AppState.saveToStorage();
        this.render();
    },

    renderStats() {
        const stats = AppState.shoppingList.getStats();
        document.getElementById('total-items').textContent = stats.total;
        document.getElementById('checked-items').textContent = stats.checked;
        document.getElementById('pending-items').textContent = stats.pending;
    },

    generateFromMealPlans() {
        console.log('开始生成购物清单...');
        
        // 先检查是否有餐单数据
        const weekPlans = AppState.getWeekMealPlans(AppState.currentWeekOffset);
        console.log('本周餐单数据:', weekPlans);
        
        let hasMeals = false;
        weekPlans.forEach(wp => {
            if (wp.plan && (wp.plan.breakfast || wp.plan.lunch || wp.plan.dinner || wp.plan.snacks.length > 0)) {
                hasMeals = true;
                console.log(`找到 ${wp.date} 的餐单:`, wp.plan);
            }
        });
        
        if (!hasMeals) {
            Toast.warning('餐单中还没有添加任何食谱，请先在餐饮计划中添加食谱！');
            console.warn('没有找到餐单数据，无法生成购物清单');
            return;
        }
        
        const shoppingList = AppState.generateShoppingList();
        console.log('生成的购物清单:', shoppingList);
        
        const itemCount = shoppingList.items ? shoppingList.items.length : 0;
        console.log('购物清单项数:', itemCount);
        
        if (itemCount === 0) {
            Toast.info('购物清单为空，可能所有食材都已在库存中');
        } else {
            Toast.success(`已生成购物清单，共 ${itemCount} 项食材`);
        }
        
        this.currentAisle = '全部';
        this.render();
    },

    clearList() {
        if (AppState.shoppingList.items.length === 0) {
            Toast.info('购物清单已经是空的');
            return;
        }

        const content = `
            <p>确定要清空购物清单吗？</p>
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.5rem;">
                当前清单有 ${AppState.shoppingList.items.length} 项食材
            </p>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="Modal.close()">取消</button>
            <button class="btn btn-primary" style="background: var(--danger-color);" onclick="ShoppingModule.confirmClear()">清空</button>
        `;

        Modal.open(content, { title: '确认清空', footer, width: '400px' });
    },

    confirmClear() {
        AppState.shoppingList.clear();
        AppState.saveToStorage();
        Modal.close();
        Toast.success('购物清单已清空');
        this.render();
    },

    exportList() {
        if (AppState.shoppingList.items.length === 0) {
            Toast.error('购物清单为空，无法导出');
            return;
        }

        const content = AppState.shoppingList.export();
        
        const textarea = document.createElement('textarea');
        textarea.value = content;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        Toast.success('购物清单已复制到剪贴板');

        const previewContent = `
            <p>购物清单已复制到剪贴板，内容预览：</p>
            <pre style="background: var(--surface-hover); padding: 1rem; border-radius: 8px; margin-top: 1rem; white-space: pre-wrap; font-size: 0.875rem; max-height: 300px; overflow-y: auto;">${content}</pre>
        `;

        const footer = `
            <button class="btn btn-primary" onclick="Modal.close()">确定</button>
        `;

        Modal.open(previewContent, { title: '导出购物清单', footer, width: '500px' });
    }
};
