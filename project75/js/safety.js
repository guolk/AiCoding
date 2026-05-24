const SafetyModule = {
    defaultChecklist: [
        {
            id: 'gas',
            category: '燃气安全',
            icon: 'flame',
            items: [
                {
                    id: 'gas-1',
                    title: '检查燃气管道和阀门是否有泄漏',
                    description: '定期用肥皂水检查燃气管道接口、阀门处是否有气泡冒出，或使用专业检测仪检查。',
                    frequency: '每月检查'
                },
                {
                    id: 'gas-2',
                    title: '确认燃气报警器工作正常',
                    description: '按下燃气报警器的测试按钮，确认报警功能正常，电池电量充足。',
                    frequency: '每月测试'
                },
                {
                    id: 'gas-3',
                    title: '保持厨房通风良好',
                    description: '使用燃气时确保开窗或开启排气扇，避免一氧化碳积聚。',
                    frequency: '每次使用'
                },
                {
                    id: 'gas-4',
                    title: '检查燃气胶管是否老化',
                    description: '检查燃气胶管是否有裂纹、老化、变硬等情况，建议每18个月更换一次。',
                    frequency: '每季度检查'
                },
                {
                    id: 'gas-5',
                    title: '确认燃气具周围无易燃物',
                    description: '燃气灶、热水器周围不要堆放纸张、塑料、食用油等易燃物品。',
                    frequency: '每周检查'
                }
            ]
        },
        {
            id: 'electrical',
            category: '电路安全',
            icon: 'bolt',
            items: [
                {
                    id: 'elec-1',
                    title: '检查插座和开关是否过热',
                    description: '触摸常用插座和开关，检查是否有异常发热、烧焦异味等情况。',
                    frequency: '每月检查'
                },
                {
                    id: 'elec-2',
                    title: '清理电箱周围杂物',
                    description: '确保配电箱周围无杂物遮挡，便于紧急情况下快速断电。',
                    frequency: '每月检查'
                },
                {
                    id: 'elec-3',
                    title: '检查电线是否破损',
                    description: '检查外露电线是否有破损、裸露，避免老鼠咬噬造成短路。',
                    frequency: '每季度检查'
                },
                {
                    id: 'elec-4',
                    title: '避免插座超负荷使用',
                    description: '不要在一个插座上连接多个大功率电器，使用正规插线板。',
                    frequency: '每周检查'
                },
                {
                    id: 'elec-5',
                    title: '确认漏电保护器工作正常',
                    description: '按漏电保护器上的测试按钮，确认跳闸功能正常。',
                    frequency: '每半年测试'
                }
            ]
        },
        {
            id: 'fall',
            category: '高空坠落防护',
            icon: 'person-falling',
            items: [
                {
                    id: 'fall-1',
                    title: '检查阳台和窗台防护设施',
                    description: '检查阳台护栏、防盗网是否牢固，窗台是否放置容易攀爬的物品。',
                    frequency: '每月检查'
                },
                {
                    id: 'fall-2',
                    title: '清理地面杂物和水渍',
                    description: '保持地面整洁，及时清理水渍、油污，防止滑倒。',
                    frequency: '每日检查'
                },
                {
                    id: 'fall-3',
                    title: '确保楼梯扶手牢固',
                    description: '检查楼梯扶手是否松动，台阶是否有破损、凸起。',
                    frequency: '每月检查'
                },
                {
                    id: 'fall-4',
                    title: '浴室安装防滑垫和扶手',
                    description: '浴室地面铺设防滑垫，马桶旁、淋浴区安装安全扶手。',
                    frequency: '每季度检查'
                },
                {
                    id: 'fall-5',
                    title: '窗户安装限位器',
                    description: '窗户开启角度不要过大，安装限位器防止儿童攀爬坠落。',
                    frequency: '每季度检查'
                }
            ]
        },
        {
            id: 'security',
            category: '防盗安全',
            icon: 'lock',
            items: [
                {
                    id: 'sec-1',
                    title: '检查门窗锁具是否完好',
                    description: '检查入户门、窗户的锁具是否正常工作，有无损坏。',
                    frequency: '每月检查'
                },
                {
                    id: 'sec-2',
                    title: '确认防盗报警系统正常',
                    description: '测试防盗报警器、摄像头、门禁系统等是否正常工作。',
                    frequency: '每月测试'
                },
                {
                    id: 'sec-3',
                    title: '清理门口和阳台杂物',
                    description: '不要在门口、阳台堆放贵重物品或大量杂物，避免引起盗窃注意。',
                    frequency: '每周检查'
                },
                {
                    id: 'sec-4',
                    title: '检查猫眼和门铃',
                    description: '确保入户门猫眼清晰，门铃工作正常，便于识别访客。',
                    frequency: '每月检查'
                },
                {
                    id: 'sec-5',
                    title: '妥善保管钥匙和门禁卡',
                    description: '不要将钥匙、门禁卡随意放置，丢失后及时更换锁具或注销卡片。',
                    frequency: '定期提醒'
                }
            ]
        },
        {
            id: 'fire',
            category: '消防安全',
            icon: 'fire-extinguisher',
            items: [
                {
                    id: 'fire-1',
                    title: '检查灭火器压力和有效期',
                    description: '查看灭火器压力表指针是否在绿色区域，确认在有效期内。',
                    frequency: '每月检查'
                },
                {
                    id: 'fire-2',
                    title: '测试烟雾报警器',
                    description: '按下烟雾报警器测试按钮，确认报警功能正常，电池电量充足。',
                    frequency: '每月测试'
                },
                {
                    id: 'fire-3',
                    title: '保持消防通道畅通',
                    description: '确保疏散通道、安全出口不被杂物堵塞，灭火器放置位置明显易取。',
                    frequency: '每周检查'
                },
                {
                    id: 'fire-4',
                    title: '检查家中大功率电器',
                    description: '空调、电热水器、电磁炉等大功率电器使用后及时断电，避免长时间待机。',
                    frequency: '每日检查'
                },
                {
                    id: 'fire-5',
                    title: '确认应急照明设备',
                    description: '检查手电筒、应急灯是否能正常工作，电池电量充足。',
                    frequency: '每月检查'
                }
            ]
        }
    ],

    supplyCategories: [
        { value: 'firstaid', label: '急救用品' },
        { value: 'light', label: '照明设备' },
        { value: 'water', label: '饮用水' },
        { value: 'food', label: '应急食品' },
        { value: 'tool', label: '应急工具' },
        { value: 'hygiene', label: '卫生用品' },
        { value: 'communication', label: '通讯设备' },
        { value: 'other', label: '其他' }
    ],

    init() {
        this.renderChecklist();
        this.renderSupplies();
    },

    getCategoryName(category) {
        const cat = this.supplyCategories.find(c => c.value === category);
        return cat ? cat.label : '其他';
    },

    getChecklistData() {
        let checklist = Storage.get(Storage.KEYS.CHECKLIST);
        if (!checklist) {
            checklist = this.initializeChecklist();
            Storage.set(Storage.KEYS.CHECKLIST, checklist);
        }
        return checklist;
    },

    initializeChecklist() {
        return this.defaultChecklist.map(category => ({
            ...category,
            items: category.items.map(item => ({
                ...item,
                checked: false,
                lastChecked: null
            }))
        }));
    },

    renderChecklist() {
        const container = document.getElementById('checklistContainer');
        const checklist = this.getChecklistData();

        let totalItems = 0;
        let checkedItems = 0;

        checklist.forEach(category => {
            category.items.forEach(item => {
                totalItems++;
                if (item.checked) checkedItems++;
            });
        });

        const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

        let html = `
            <div class="checklist-progress">
                <div class="progress-info">
                    <span>安全检查进度</span>
                    <span>${checkedItems} / ${totalItems} 项已完成 (${progress}%)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%;"></div>
                </div>
                <div style="margin-top: 1rem; text-align: right;">
                    <button class="btn btn-sm btn-secondary" onclick="SafetyModule.resetChecklist()">
                        <i class="fas fa-redo"></i> 重置所有检查
                    </button>
                </div>
            </div>
        `;

        checklist.forEach(category => {
            const checkedInCategory = category.items.filter(i => i.checked).length;
            
            html += `
                <div class="checklist-category">
                    <h3>
                        <i class="fas fa-${category.icon}"></i>
                        ${category.category}
                        <span style="font-size: 0.875rem; color: var(--dark-gray); margin-left: auto;">
                            ${checkedInCategory} / ${category.items.length}
                        </span>
                    </h3>
                    <div class="checklist-items">
                        ${category.items.map(item => `
                            <div class="checklist-item ${item.checked ? 'checked' : ''}">
                                <input type="checkbox" ${item.checked ? 'checked' : ''} 
                                    onchange="SafetyModule.toggleCheckItem('${category.id}', '${item.id}')">
                                <div class="checklist-item-content">
                                    <h4>${item.title}</h4>
                                    <p>${item.description}</p>
                                    <div class="last-checked">
                                        <i class="far fa-clock"></i>
                                        建议：${item.frequency}
                                        ${item.lastChecked ? ` · 上次检查：${Utils.formatDate(item.lastChecked)}` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    toggleCheckItem(categoryId, itemId) {
        const checklist = this.getChecklistData();
        const category = checklist.find(c => c.id === categoryId);
        if (!category) return;

        const item = category.items.find(i => i.id === itemId);
        if (!item) return;

        item.checked = !item.checked;
        item.lastChecked = item.checked ? new Date().toISOString() : null;

        Storage.set(Storage.KEYS.CHECKLIST, checklist);
        this.renderChecklist();

        if (item.checked) {
            Utils.showToast('检查项已标记为完成', 'success');
        }
    },

    resetChecklist() {
        Utils.confirmDialog('确定要重置所有检查项吗？这将清除所有已完成的记录。', 'SafetyModule.confirmResetChecklist()');
    },

    confirmResetChecklist() {
        const checklist = this.initializeChecklist();
        Storage.set(Storage.KEYS.CHECKLIST, checklist);
        this.renderChecklist();
        Utils.showToast('所有检查项已重置', 'success');
    },

    renderSupplies() {
        const list = document.getElementById('suppliesList');
        let supplies = Storage.get(Storage.KEYS.SUPPLIES) || [];

        if (supplies.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-boxes"></i>
                    <p>暂无应急物资记录</p>
                    <p style="font-size: 0.875rem;">点击上方按钮添加家庭应急物资</p>
                </div>
            `;
            return;
        }

        supplies.sort((a, b) => {
            const aLow = parseInt(a.quantity) <= parseInt(a.minStock || 0);
            const bLow = parseInt(b.quantity) <= parseInt(b.minStock || 0);
            if (aLow !== bLow) return aLow ? -1 : 1;
            
            const aExpired = a.expiryDate && Utils.isExpired(a.expiryDate);
            const bExpired = b.expiryDate && Utils.isExpired(b.expiryDate);
            if (aExpired !== bExpired) return aExpired ? -1 : 1;
            
            const aExpiring = a.expiryDate && Utils.isExpiringSoon(a.expiryDate, 90);
            const bExpiring = b.expiryDate && Utils.isExpiringSoon(b.expiryDate, 90);
            if (aExpiring !== bExpiring) return aExpiring ? -1 : 1;
            
            return 0;
        });

        list.innerHTML = supplies.map(supply => {
            const isLow = parseInt(supply.quantity) <= parseInt(supply.minStock || 0);
            const isEmpty = parseInt(supply.quantity) === 0;
            const isExpired = supply.expiryDate && Utils.isExpired(supply.expiryDate);
            const isExpiring = supply.expiryDate && Utils.isExpiringSoon(supply.expiryDate, 90);
            const daysLeft = supply.expiryDate ? Utils.daysUntil(supply.expiryDate) : null;
            
            let cardClass = '';
            if (isEmpty) cardClass = 'empty';
            else if (isLow) cardClass = 'low';

            const stockPercent = supply.totalQuantity 
                ? Math.min(100, (parseInt(supply.quantity) / parseInt(supply.totalQuantity)) * 100) 
                : 100;

            return `
                <div class="card supply-card ${cardClass} ${isExpired ? 'expired' : ''} ${isExpiring ? 'expiring' : ''}">
                    <h3><i class="fas fa-box"></i> ${Utils.escapeHtml(supply.name)}</h3>
                    <p class="category">${this.getCategoryName(supply.category)} · ${Utils.escapeHtml(supply.specification || '')}</p>
                    
                    <div class="supply-stock">
                        <div class="stock-info">
                            <span style="font-size: 0.875rem; color: var(--dark-gray);">库存</span>
                            <span style="font-weight: 500;">${supply.quantity}${supply.unit || ''} / ${supply.totalQuantity || '∞'}${supply.unit || ''}</span>
                        </div>
                        <div class="stock-bar">
                            <div class="stock-fill" style="width: ${stockPercent}%;"></div>
                        </div>
                        ${isLow ? `<p style="color: var(--warning-color); font-size: 0.75rem; margin-top: 0.25rem;"><i class="fas fa-exclamation-triangle"></i> 库存不足，请及时补充</p>` : ''}
                    </div>

                    ${supply.expiryDate ? `
                        <div class="expiry">
                            <i class="far fa-calendar"></i>
                            有效期至：${Utils.formatDate(supply.expiryDate)}
                            ${isExpired ? '<span style="color: var(--danger-color);"> (已过期)</span>' : 
                              isExpiring ? `<span style="color: var(--warning-color);"> (${daysLeft}天后)</span>` : ''}
                        </div>
                    ` : ''}

                    ${supply.location ? `
                        <div style="font-size: 0.875rem; color: var(--dark-gray); margin-bottom: 1rem;">
                            <i class="fas fa-map-marker-alt"></i> 存放位置：${Utils.escapeHtml(supply.location)}
                        </div>
                    ` : ''}

                    ${supply.notes ? `<p style="color: var(--dark-gray); font-size: 0.875rem; margin-bottom: 1rem;">${Utils.escapeHtml(supply.notes)}</p>` : ''}

                    <div class="card-actions">
                        <button class="btn btn-sm btn-success" onclick="SafetyModule.updateSupplyStock('${supply.id}', 1)">
                            <i class="fas fa-minus"></i> 使用
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="SafetyModule.editSupply('${supply.id}')">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="SafetyModule.deleteSupply('${supply.id}')">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        Utils.updateAlertCount();
    },

    showAddSupplyModal() {
        const categoryOptions = this.supplyCategories.map(cat => 
            `<option value="${cat.value}">${cat.label}</option>`
        ).join('');

        const content = `
            <form id="supplyForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>物资名称 *</label>
                        <input type="text" name="name" required placeholder="如：创可贴">
                    </div>
                    <div class="form-group">
                        <label>类别 *</label>
                        <select name="category" required>
                            <option value="">请选择类别</option>
                            ${categoryOptions}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>规格</label>
                        <input type="text" name="specification" placeholder="如：100片/盒">
                    </div>
                    <div class="form-group">
                        <label>有效期至</label>
                        <input type="date" name="expiryDate">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>当前数量 *</label>
                        <input type="number" name="quantity" required min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label>单位</label>
                        <input type="text" name="unit" placeholder="如：盒、个、瓶">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>总数量</label>
                        <input type="number" name="totalQuantity" min="0" placeholder="用于显示库存百分比">
                    </div>
                    <div class="form-group">
                        <label>最低库存提醒</label>
                        <input type="number" name="minStock" min="0" value="0" placeholder="低于此数量时提醒">
                    </div>
                </div>
                <div class="form-group">
                    <label>存放位置</label>
                    <input type="text" name="location" placeholder="如：客厅急救箱、储物间">
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea name="notes" rows="2" placeholder="使用说明、注意事项等"></textarea>
                </div>
            </form>
        `;

        Utils.showModalWithFooter(content, [
            { text: '取消', onClick: 'Utils.closeModal()' },
            { text: '保存', class: 'btn-primary', onClick: 'SafetyModule.saveSupply()' }
        ], '添加应急物资');
    },

    editSupply(id) {
        const supplies = Storage.get(Storage.KEYS.SUPPLIES) || [];
        const supply = supplies.find(s => s.id === id);
        if (!supply) return;

        const categoryOptions = this.supplyCategories.map(cat => 
            `<option value="${cat.value}" ${supply.category === cat.value ? 'selected' : ''}>${cat.label}</option>`
        ).join('');

        const content = `
            <form id="supplyForm">
                <input type="hidden" name="id" value="${supply.id}">
                <div class="form-row">
                    <div class="form-group">
                        <label>物资名称 *</label>
                        <input type="text" name="name" required value="${Utils.escapeHtml(supply.name)}">
                    </div>
                    <div class="form-group">
                        <label>类别 *</label>
                        <select name="category" required>
                            <option value="">请选择类别</option>
                            ${categoryOptions}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>规格</label>
                        <input type="text" name="specification" value="${Utils.escapeHtml(supply.specification || '')}">
                    </div>
                    <div class="form-group">
                        <label>有效期至</label>
                        <input type="date" name="expiryDate" value="${Utils.getDateInputValue(supply.expiryDate)}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>当前数量 *</label>
                        <input type="number" name="quantity" required min="0" value="${supply.quantity}">
                    </div>
                    <div class="form-group">
                        <label>单位</label>
                        <input type="text" name="unit" value="${Utils.escapeHtml(supply.unit || '')}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>总数量</label>
                        <input type="number" name="totalQuantity" min="0" value="${supply.totalQuantity || ''}" placeholder="用于显示库存百分比">
                    </div>
                    <div class="form-group">
                        <label>最低库存提醒</label>
                        <input type="number" name="minStock" min="0" value="${supply.minStock || 0}" placeholder="低于此数量时提醒">
                    </div>
                </div>
                <div class="form-group">
                    <label>存放位置</label>
                    <input type="text" name="location" value="${Utils.escapeHtml(supply.location || '')}" placeholder="如：客厅急救箱、储物间">
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea name="notes" rows="2">${Utils.escapeHtml(supply.notes || '')}</textarea>
                </div>
            </form>
        `;

        Utils.showModalWithFooter(content, [
            { text: '取消', onClick: 'Utils.closeModal()' },
            { text: '保存', class: 'btn-primary', onClick: 'SafetyModule.saveSupply()' }
        ], '编辑应急物资');
    },

    saveSupply() {
        const form = document.getElementById('supplyForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.name || !data.category || data.quantity === '') {
            Utils.showToast('请填写所有必填项', 'error');
            return;
        }

        let supplies = Storage.get(Storage.KEYS.SUPPLIES) || [];

        if (data.id) {
            const index = supplies.findIndex(s => s.id === data.id);
            if (index !== -1) {
                supplies[index] = { ...supplies[index], ...data };
                Utils.showToast('物资信息更新成功', 'success');
            }
        } else {
            data.id = Storage.generateId();
            data.createdAt = new Date().toISOString();
            supplies.push(data);
            Utils.showToast('物资添加成功', 'success');
        }

        Storage.set(Storage.KEYS.SUPPLIES, supplies);
        Utils.closeModal();
        this.renderSupplies();
    },

    updateSupplyStock(id, amount) {
        let supplies = Storage.get(Storage.KEYS.SUPPLIES) || [];
        const index = supplies.findIndex(s => s.id === id);
        if (index === -1) return;

        const supply = supplies[index];
        const newQuantity = parseInt(supply.quantity) - parseInt(amount);
        
        if (newQuantity < 0) {
            Utils.showToast('库存不足', 'error');
            return;
        }

        supplies[index].quantity = newQuantity.toString();
        Storage.set(Storage.KEYS.SUPPLIES, supplies);
        
        Utils.showToast(`已记录使用 ${amount} ${supply.unit || '单位'}`, 'success');
        this.renderSupplies();
    },

    deleteSupply(id) {
        Utils.confirmDialog('确定要删除这个物资吗？', `SafetyModule.confirmDeleteSupply('${id}')`);
    },

    confirmDeleteSupply(id) {
        let supplies = Storage.get(Storage.KEYS.SUPPLIES) || [];
        supplies = supplies.filter(s => s.id !== id);
        Storage.set(Storage.KEYS.SUPPLIES, supplies);
        this.renderSupplies();
        Utils.showToast('物资已删除', 'success');
    }
};

function showAddSupplyModal() {
    SafetyModule.showAddSupplyModal();
}
