const MedicineModule = {
    medicineCategories: [
        { value: 'cold', label: '感冒药' },
        { value: 'fever', label: '退烧药' },
        { value: 'painkiller', label: '止痛药' },
        { value: 'stomach', label: '肠胃药' },
        { value: 'allergy', label: '抗过敏药' },
        { value: 'antibiotic', label: '抗生素' },
        { value: 'cardiovascular', label: '心血管药' },
        { value: 'diabetes', label: '糖尿病药' },
        { value: 'hypertension', label: '高血压药' },
        { value: 'external', label: '外用药' },
        { value: 'supplement', label: '保健品' },
        { value: 'other', label: '其他' }
    ],

    init() {
        this.renderWarnings();
        this.renderMedicines();
        this.renderRecords();
    },

    getCategoryName(category) {
        const cat = this.medicineCategories.find(c => c.value === category);
        return cat ? cat.label : '其他';
    },

    renderWarnings() {
        const container = document.getElementById('warningsSection');
        const medicines = Storage.get(Storage.KEYS.MEDICINES) || [];
        const warnings = [];

        medicines.forEach(med => {
            const daysLeft = Utils.daysUntil(med.expiryDate);
            const isExpired = Utils.isExpired(med.expiryDate);
            const isExpiring = Utils.isExpiringSoon(med.expiryDate, 30);
            const isLowStock = parseInt(med.quantity) <= parseInt(med.minStock || 0);

            if (isExpired) {
                warnings.push({
                    type: 'expired',
                    medicine: med,
                    message: `${med.name} 已过期 ${Math.abs(daysLeft)} 天`
                });
            } else if (isExpiring) {
                warnings.push({
                    type: 'expiring',
                    medicine: med,
                    message: `${med.name} 将在 ${daysLeft} 天后过期`
                });
            }

            if (isLowStock && !isExpired) {
                warnings.push({
                    type: 'lowStock',
                    medicine: med,
                    message: `${med.name} 库存不足 (当前: ${med.quantity}${med.unit || ''})`
                });
            }
        });

        if (warnings.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <h3 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-exclamation-triangle" style="color: var(--warning-color);"></i>
                    提醒事项 (${warnings.length})
                </h3>
            </div>
            ${warnings.map(warning => `
                <div class="warning-item ${warning.type === 'expired' ? 'expired' : ''}">
                    <i class="fas ${warning.type === 'expired' ? 'fa-times-circle' : 'fa-exclamation-triangle'}"></i>
                    <div class="warning-content">
                        <strong>${warning.message}</strong>
                        <span>${this.getCategoryName(warning.medicine.category)} · ${warning.medicine.specification || ''}</span>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="MedicineModule.editMedicine('${warning.medicine.id}')">
                        <i class="fas fa-edit"></i> 处理
                    </button>
                </div>
            `).join('')}
        `;
    },

    renderMedicines() {
        const grid = document.getElementById('medicineGrid');
        let medicines = Storage.get(Storage.KEYS.MEDICINES) || [];

        if (medicines.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-pills"></i>
                    <p>暂无药品记录</p>
                    <p style="font-size: 0.875rem;">点击上方按钮添加家庭常备药品</p>
                </div>
            `;
            return;
        }

        medicines.sort((a, b) => {
            const aExpired = Utils.isExpired(a.expiryDate);
            const bExpired = Utils.isExpired(b.expiryDate);
            if (aExpired !== bExpired) return aExpired ? -1 : 1;
            
            const aExpiring = Utils.isExpiringSoon(a.expiryDate, 30);
            const bExpiring = Utils.isExpiringSoon(b.expiryDate, 30);
            if (aExpiring !== bExpiring) return aExpiring ? -1 : 1;
            
            return new Date(a.expiryDate) - new Date(b.expiryDate);
        });

        grid.innerHTML = medicines.map(med => {
            const daysLeft = Utils.daysUntil(med.expiryDate);
            const isExpired = Utils.isExpired(med.expiryDate);
            const isExpiring = Utils.isExpiringSoon(med.expiryDate, 30);
            const isLowStock = parseInt(med.quantity) <= parseInt(med.minStock || 0);
            
            let cardClass = '';
            if (isExpired) cardClass = 'expired';
            else if (isExpiring || isLowStock) cardClass = isExpiring ? 'expiring' : 'low-stock';

            const stockPercent = med.totalQuantity 
                ? Math.min(100, (parseInt(med.quantity) / parseInt(med.totalQuantity)) * 100) 
                : 100;

            return `
                <div class="card medicine-card ${cardClass}">
                    <h3><i class="fas fa-capsules"></i> ${Utils.escapeHtml(med.name)}</h3>
                    <p class="symptoms">${this.getCategoryName(med.category)} · ${Utils.escapeHtml(med.specification || '')}</p>
                    
                    <div class="medicine-details">
                        <div class="info-item">
                            <div class="label">适用症状</div>
                            <div class="value">${Utils.escapeHtml(med.symptoms || '未填写')}</div>
                        </div>
                        <div class="info-item">
                            <div class="label">有效期至</div>
                            <div class="value">
                                ${Utils.formatDate(med.expiryDate)}
                                ${isExpired ? '<span style="color: var(--danger-color);"> (已过期)</span>' : 
                                  isExpiring ? `<span style="color: var(--warning-color);"> (${daysLeft}天后)</span>` : ''}
                            </div>
                        </div>
                    </div>

                    <div class="dosage">
                        <div class="label">用法用量</div>
                        <div>${Utils.escapeHtml(med.dosage || '请遵医嘱')}</div>
                    </div>

                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span style="font-size: 0.875rem; color: var(--dark-gray);">库存</span>
                            <span style="font-weight: 500;">${med.quantity}${med.unit || ''} / ${med.totalQuantity || '∞'}${med.unit || ''}</span>
                        </div>
                        <div class="stock-bar">
                            <div class="stock-fill" style="width: ${stockPercent}%;"></div>
                        </div>
                        ${isLowStock ? '<p style="color: var(--warning-color); font-size: 0.75rem; margin-top: 0.25rem;"><i class="fas fa-exclamation-triangle"></i> 库存不足，请及时补充</p>' : ''}
                    </div>

                    ${med.notes ? `<p style="margin-top: 1rem; color: var(--dark-gray); font-size: 0.875rem;">${Utils.escapeHtml(med.notes)}</p>` : ''}

                    <div class="card-actions">
                        <button class="btn btn-sm btn-success" onclick="MedicineModule.updateStock('${med.id}', 1)">
                            <i class="fas fa-plus"></i> 使用
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="MedicineModule.editMedicine('${med.id}')">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="MedicineModule.deleteMedicine('${med.id}')">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        Utils.updateAlertCount();
    },

    showAddMedicineModal() {
        const categoryOptions = this.medicineCategories.map(cat => 
            `<option value="${cat.value}">${cat.label}</option>`
        ).join('');

        const content = `
            <form id="medicineForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>药品名称 *</label>
                        <input type="text" name="name" required placeholder="如：布洛芬缓释胶囊">
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
                        <input type="text" name="specification" placeholder="如：0.3g*20粒">
                    </div>
                    <div class="form-group">
                        <label>有效期至 *</label>
                        <input type="date" name="expiryDate" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>适用症状</label>
                    <input type="text" name="symptoms" placeholder="如：头痛、发热、牙痛">
                </div>
                <div class="form-group">
                    <label>用法用量</label>
                    <textarea name="dosage" rows="2" placeholder="如：口服，一次1粒，一日2次"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>当前数量 *</label>
                        <input type="number" name="quantity" required min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label>单位</label>
                        <input type="text" name="unit" placeholder="如：粒、盒、片">
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
                    <label>是否处方药</label>
                    <select name="isPrescription">
                        <option value="false">否</option>
                        <option value="true">是</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea name="notes" rows="2" placeholder="存储条件、注意事项等"></textarea>
                </div>
            </form>
        `;

        Utils.showModalWithFooter(content, [
            { text: '取消', onClick: 'Utils.closeModal()' },
            { text: '保存', class: 'btn-primary', onClick: 'MedicineModule.saveMedicine()' }
        ], '添加药品');
    },

    editMedicine(id) {
        const medicines = Storage.get(Storage.KEYS.MEDICINES) || [];
        const medicine = medicines.find(m => m.id === id);
        if (!medicine) return;

        const categoryOptions = this.medicineCategories.map(cat => 
            `<option value="${cat.value}" ${medicine.category === cat.value ? 'selected' : ''}>${cat.label}</option>`
        ).join('');

        const content = `
            <form id="medicineForm">
                <input type="hidden" name="id" value="${medicine.id}">
                <div class="form-row">
                    <div class="form-group">
                        <label>药品名称 *</label>
                        <input type="text" name="name" required value="${Utils.escapeHtml(medicine.name)}">
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
                        <input type="text" name="specification" value="${Utils.escapeHtml(medicine.specification || '')}">
                    </div>
                    <div class="form-group">
                        <label>有效期至 *</label>
                        <input type="date" name="expiryDate" required value="${Utils.getDateInputValue(medicine.expiryDate)}">
                    </div>
                </div>
                <div class="form-group">
                    <label>适用症状</label>
                    <input type="text" name="symptoms" value="${Utils.escapeHtml(medicine.symptoms || '')}">
                </div>
                <div class="form-group">
                    <label>用法用量</label>
                    <textarea name="dosage" rows="2">${Utils.escapeHtml(medicine.dosage || '')}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>当前数量 *</label>
                        <input type="number" name="quantity" required min="0" value="${medicine.quantity}">
                    </div>
                    <div class="form-group">
                        <label>单位</label>
                        <input type="text" name="unit" value="${Utils.escapeHtml(medicine.unit || '')}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>总数量</label>
                        <input type="number" name="totalQuantity" min="0" value="${medicine.totalQuantity || ''}" placeholder="用于显示库存百分比">
                    </div>
                    <div class="form-group">
                        <label>最低库存提醒</label>
                        <input type="number" name="minStock" min="0" value="${medicine.minStock || 0}" placeholder="低于此数量时提醒">
                    </div>
                </div>
                <div class="form-group">
                    <label>是否处方药</label>
                    <select name="isPrescription">
                        <option value="false" ${medicine.isPrescription === 'true' ? '' : 'selected'}>否</option>
                        <option value="true" ${medicine.isPrescription === 'true' ? 'selected' : ''}>是</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea name="notes" rows="2">${Utils.escapeHtml(medicine.notes || '')}</textarea>
                </div>
            </form>
        `;

        Utils.showModalWithFooter(content, [
            { text: '取消', onClick: 'Utils.closeModal()' },
            { text: '保存', class: 'btn-primary', onClick: 'MedicineModule.saveMedicine()' }
        ], '编辑药品');
    },

    saveMedicine() {
        const form = document.getElementById('medicineForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.name || !data.category || !data.expiryDate || data.quantity === '') {
            Utils.showToast('请填写所有必填项', 'error');
            return;
        }

        let medicines = Storage.get(Storage.KEYS.MEDICINES) || [];

        if (data.id) {
            const index = medicines.findIndex(m => m.id === data.id);
            if (index !== -1) {
                medicines[index] = { ...medicines[index], ...data };
                Utils.showToast('药品信息更新成功', 'success');
            }
        } else {
            data.id = Storage.generateId();
            data.createdAt = new Date().toISOString();
            medicines.push(data);
            Utils.showToast('药品添加成功', 'success');
        }

        Storage.set(Storage.KEYS.MEDICINES, medicines);
        Utils.closeModal();
        this.renderWarnings();
        this.renderMedicines();
    },

    updateStock(id, amount) {
        let medicines = Storage.get(Storage.KEYS.MEDICINES) || [];
        const index = medicines.findIndex(m => m.id === id);
        if (index === -1) return;

        const medicine = medicines[index];
        const newQuantity = parseInt(medicine.quantity) - parseInt(amount);
        
        if (newQuantity < 0) {
            Utils.showToast('库存不足', 'error');
            return;
        }

        medicines[index].quantity = newQuantity.toString();
        Storage.set(Storage.KEYS.MEDICINES, medicines);
        
        Utils.showToast(`已记录使用 ${amount} ${medicine.unit || '单位'}`, 'success');
        this.renderWarnings();
        this.renderMedicines();
    },

    deleteMedicine(id) {
        Utils.confirmDialog('确定要删除这个药品吗？', `MedicineModule.confirmDeleteMedicine('${id}')`);
    },

    confirmDeleteMedicine(id) {
        let medicines = Storage.get(Storage.KEYS.MEDICINES) || [];
        medicines = medicines.filter(m => m.id !== id);
        Storage.set(Storage.KEYS.MEDICINES, medicines);
        this.renderWarnings();
        this.renderMedicines();
        Utils.showToast('药品已删除', 'success');
    },

    renderRecords() {
        const list = document.getElementById('recordsList');
        let records = Storage.get(Storage.KEYS.MEDICATION_RECORDS) || [];
        const members = Storage.get(Storage.KEYS.MEMBERS) || [];
        const medicines = Storage.get(Storage.KEYS.MEDICINES) || [];

        if (records.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-clipboard-list"></i>
                    <p>暂无用药记录</p>
                    <p style="font-size: 0.875rem;">点击上方按钮记录服药情况</p>
                </div>
            `;
            return;
        }

        records.sort((a, b) => new Date(b.time) - new Date(a.time));

        list.innerHTML = records.map(record => {
            const member = members.find(m => m.id === record.memberId);
            const medicine = medicines.find(m => m.id === record.medicineId);
            
            return `
                <div class="card record-card">
                    <div class="record-info">
                        <div class="icon">
                            <i class="fas fa-pills"></i>
                        </div>
                        <div>
                            <h4>${medicine ? Utils.escapeHtml(medicine.name) : '未知药品'}</h4>
                            <p class="time">
                                <i class="far fa-clock"></i>
                                ${Utils.formatDateTime(record.time)}
                            </p>
                        </div>
                    </div>
                    <div class="record-details">
                        <div class="dosage">${record.dosage || '未记录'}</div>
                        <div class="member">${member ? Utils.escapeHtml(member.name) : '未记录成员'}</div>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="MedicineModule.deleteRecord('${record.id}')" style="margin-left: 1rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
    },

    showAddRecordModal() {
        const members = Storage.get(Storage.KEYS.MEMBERS) || [];
        const medicines = Storage.get(Storage.KEYS.MEDICINES) || [];

        const memberOptions = members.map(m => 
            `<option value="${m.id}">${Utils.escapeHtml(m.name)}</option>`
        ).join('');

        const medicineOptions = medicines.map(m => 
            `<option value="${m.id}">${Utils.escapeHtml(m.name)}</option>`
        ).join('');

        const now = new Date();
        const nowStr = now.toISOString().slice(0, 16);

        const content = `
            <form id="recordForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>服药成员 *</label>
                        <select name="memberId" required>
                            <option value="">请选择成员</option>
                            ${memberOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>药品 *</label>
                        <select name="medicineId" required>
                            <option value="">请选择药品</option>
                            ${medicineOptions}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>服药时间 *</label>
                        <input type="datetime-local" name="time" required value="${nowStr}">
                    </div>
                    <div class="form-group">
                        <label>剂量 *</label>
                        <input type="text" name="dosage" required placeholder="如：1粒、50mg">
                    </div>
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea name="notes" rows="2" placeholder="服药原因、反应等"></textarea>
                </div>
            </form>
        `;

        Utils.showModalWithFooter(content, [
            { text: '取消', onClick: 'Utils.closeModal()' },
            { text: '保存', class: 'btn-primary', onClick: 'MedicineModule.saveRecord()' }
        ], '记录服药');
    },

    saveRecord() {
        const form = document.getElementById('recordForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.memberId || !data.medicineId || !data.time || !data.dosage) {
            Utils.showToast('请填写所有必填项', 'error');
            return;
        }

        let records = Storage.get(Storage.KEYS.MEDICATION_RECORDS) || [];
        
        data.id = Storage.generateId();
        records.push(data);

        Storage.set(Storage.KEYS.MEDICATION_RECORDS, records);
        Utils.closeModal();
        this.renderRecords();
        Utils.showToast('服药记录已保存', 'success');
    },

    deleteRecord(id) {
        Utils.confirmDialog('确定要删除这条服药记录吗？', `MedicineModule.confirmDeleteRecord('${id}')`);
    },

    confirmDeleteRecord(id) {
        let records = Storage.get(Storage.KEYS.MEDICATION_RECORDS) || [];
        records = records.filter(r => r.id !== id);
        Storage.set(Storage.KEYS.MEDICATION_RECORDS, records);
        this.renderRecords();
        Utils.showToast('记录已删除', 'success');
    }
};

function showAddMedicineModal() {
    MedicineModule.showAddMedicineModal();
}

function showAddRecordModal() {
    MedicineModule.showAddRecordModal();
}
