const EmergencyModule = {
    quickContacts: [
        { type: 'ambulance', name: '急救中心', phone: '120', icon: 'ambulance' },
        { type: 'police', name: '报警电话', phone: '110', icon: 'shield-alt' },
        { type: 'fire', name: '火警电话', phone: '119', icon: 'fire' },
        { type: 'gas', name: '燃气抢修', phone: '95598', icon: 'flame' },
        { type: 'power', name: '电力抢修', phone: '95598', icon: 'bolt' },
        { type: 'property', name: '物业电话', phone: '请设置', icon: 'building' }
    ],

    bloodTypes: ['A型', 'B型', 'AB型', 'O型', 'Rh阳性', 'Rh阴性', '不详'],

    init() {
        this.renderQuickContacts();
        this.renderCustomContacts();
        this.renderMembers();
        this.renderRallyPoints();
    },

    renderQuickContacts() {
        const container = document.getElementById('quickContacts');
        const customContacts = Storage.get(Storage.KEYS.CONTACTS) || [];
        
        const propertyContact = customContacts.find(c => c.type === 'property');
        const contacts = this.quickContacts.map(c => {
            if (c.type === 'property' && propertyContact) {
                return { ...c, phone: propertyContact.phone };
            }
            return c;
        });

        container.innerHTML = contacts.map(contact => `
            <div class="card quick-contact-card" data-type="${contact.type}" onclick="EmergencyModule.callQuickContact('${contact.phone}', '${contact.name}')">
                <div class="icon">
                    <i class="fas fa-${contact.icon}"></i>
                </div>
                <h4>${contact.name}</h4>
                <div class="phone">${contact.phone}</div>
            </div>
        `).join('');
    },

    callQuickContact(phone, name) {
        if (phone === '请设置') {
            Utils.showToast(`请先设置${name}电话`, 'warning');
            return;
        }
        if (/^1\d{10}$/.test(phone) || /^\d{3,4}$/.test(phone)) {
            window.location.href = `tel:${phone}`;
            Utils.showToast(`正在拨打${name}...`, 'info');
        } else {
            Utils.showToast(`电话号码格式不正确`, 'error');
        }
    },

    renderCustomContacts() {
        const list = document.getElementById('customContactsList');
        let contacts = Storage.get(Storage.KEYS.CONTACTS) || [];
        contacts = contacts.filter(c => c.type !== 'property');

        if (contacts.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-address-book"></i>
                    <p>暂无自定义联系人</p>
                    <p style="font-size: 0.875rem;">点击上方按钮添加紧急联系人</p>
                </div>
            `;
            return;
        }

        list.innerHTML = contacts.map(contact => `
            <div class="card contact-card">
                <div class="contact-info">
                    <h4>${Utils.escapeHtml(contact.name)}</h4>
                    <p class="relation">${Utils.escapeHtml(contact.relation || '')}</p>
                    <div class="phone" onclick="EmergencyModule.callQuickContact('${contact.phone}', '${Utils.escapeHtml(contact.name)}')">
                        <i class="fas fa-phone"></i>
                        ${contact.phone}
                    </div>
                </div>
                <div class="contact-actions">
                    <button class="btn btn-sm btn-primary" onclick="EmergencyModule.callQuickContact('${contact.phone}', '${Utils.escapeHtml(contact.name)}')">
                        <i class="fas fa-phone"></i> 拨打
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="EmergencyModule.editContact('${contact.id}')">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="EmergencyModule.deleteContact('${contact.id}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `).join('');
    },

    showAddContactModal() {
        const content = `
            <form id="contactForm">
                <div class="form-group">
                    <label>姓名 *</label>
                    <input type="text" name="name" required placeholder="请输入联系人姓名">
                </div>
                <div class="form-group">
                    <label>关系</label>
                    <input type="text" name="relation" placeholder="如：父亲、母亲、医生等">
                </div>
                <div class="form-group">
                    <label>电话号码 *</label>
                    <input type="tel" name="phone" required placeholder="请输入电话号码">
                </div>
                <div class="form-group">
                    <label>类型</label>
                    <select name="type">
                        <option value="family">家人</option>
                        <option value="friend">朋友</option>
                        <option value="doctor">家庭医生</option>
                        <option value="hospital">医院</option>
                        <option value="property">物业</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea name="notes" rows="2" placeholder="其他备注信息"></textarea>
                </div>
            </form>
        `;

        Utils.showModalWithFooter(content, [
            { text: '取消', onClick: 'Utils.closeModal()' },
            { text: '保存', class: 'btn-primary', onClick: 'EmergencyModule.saveContact()' }
        ], '添加联系人');
    },

    editContact(id) {
        const contacts = Storage.get(Storage.KEYS.CONTACTS) || [];
        const contact = contacts.find(c => c.id === id);
        if (!contact) return;

        const content = `
            <form id="contactForm">
                <input type="hidden" name="id" value="${contact.id}">
                <div class="form-group">
                    <label>姓名 *</label>
                    <input type="text" name="name" required value="${Utils.escapeHtml(contact.name)}">
                </div>
                <div class="form-group">
                    <label>关系</label>
                    <input type="text" name="relation" value="${Utils.escapeHtml(contact.relation || '')}">
                </div>
                <div class="form-group">
                    <label>电话号码 *</label>
                    <input type="tel" name="phone" required value="${contact.phone}">
                </div>
                <div class="form-group">
                    <label>类型</label>
                    <select name="type">
                        <option value="family" ${contact.type === 'family' ? 'selected' : ''}>家人</option>
                        <option value="friend" ${contact.type === 'friend' ? 'selected' : ''}>朋友</option>
                        <option value="doctor" ${contact.type === 'doctor' ? 'selected' : ''}>家庭医生</option>
                        <option value="hospital" ${contact.type === 'hospital' ? 'selected' : ''}>医院</option>
                        <option value="property" ${contact.type === 'property' ? 'selected' : ''}>物业</option>
                        <option value="other" ${contact.type === 'other' ? 'selected' : ''}>其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea name="notes" rows="2">${Utils.escapeHtml(contact.notes || '')}</textarea>
                </div>
            </form>
        `;

        Utils.showModalWithFooter(content, [
            { text: '取消', onClick: 'Utils.closeModal()' },
            { text: '保存', class: 'btn-primary', onClick: 'EmergencyModule.saveContact()' }
        ], '编辑联系人');
    },

    saveContact() {
        const form = document.getElementById('contactForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.name || !data.phone) {
            Utils.showToast('请填写姓名和电话号码', 'error');
            return;
        }

        let contacts = Storage.get(Storage.KEYS.CONTACTS) || [];

        if (data.id) {
            const index = contacts.findIndex(c => c.id === data.id);
            if (index !== -1) {
                contacts[index] = { ...contacts[index], ...data };
                Utils.showToast('联系人更新成功', 'success');
            }
        } else {
            data.id = Storage.generateId();
            contacts.push(data);
            Utils.showToast('联系人添加成功', 'success');
        }

        Storage.set(Storage.KEYS.CONTACTS, contacts);
        Utils.closeModal();
        this.renderQuickContacts();
        this.renderCustomContacts();
    },

    deleteContact(id) {
        Utils.confirmDialog('确定要删除这个联系人吗？', `EmergencyModule.confirmDeleteContact('${id}')`);
    },

    confirmDeleteContact(id) {
        let contacts = Storage.get(Storage.KEYS.CONTACTS) || [];
        contacts = contacts.filter(c => c.id !== id);
        Storage.set(Storage.KEYS.CONTACTS, contacts);
        this.renderQuickContacts();
        this.renderCustomContacts();
        Utils.showToast('联系人已删除', 'success');
    },

    renderMembers() {
        const list = document.getElementById('membersList');
        const members = Storage.get(Storage.KEYS.MEMBERS) || [];

        if (members.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-users"></i>
                    <p>暂无家庭成员信息</p>
                    <p style="font-size: 0.875rem;">点击上方按钮添加家庭成员医疗信息</p>
                </div>
            `;
            return;
        }

        list.innerHTML = members.map(member => `
            <div class="card member-card">
                <div class="member-header">
                    <div class="avatar">${member.name.charAt(0)}</div>
                    <div>
                        <h3>${Utils.escapeHtml(member.name)}</h3>
                        <p class="relation">${Utils.escapeHtml(member.relation || '')} ${member.birthDate ? `(${this.calculateAge(member.birthDate)}岁)` : ''}</p>
                    </div>
                </div>
                <div class="medical-info">
                    <div class="info-item">
                        <div class="label">血型</div>
                        <div class="value">${Utils.escapeHtml(member.bloodType || '未填写')}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">身高/体重</div>
                        <div class="value">${member.height ? member.height + 'cm' : '-'} / ${member.weight ? member.weight + 'kg' : '-'}</div>
                    </div>
                    <div class="info-item full-width">
                        <div class="label">过敏史</div>
                        <div class="value">${Utils.escapeHtml(member.allergies || '无')}</div>
                    </div>
                    <div class="info-item full-width">
                        <div class="label">慢性病史</div>
                        <div class="value">${Utils.escapeHtml(member.chronicDiseases || '无')}</div>
                    </div>
                    <div class="info-item full-width">
                        <div class="label">长期用药</div>
                        <div class="value">${Utils.escapeHtml(member.medications || '无')}</div>
                    </div>
                    <div class="info-item full-width">
                        <div class="label">医保信息</div>
                        <div class="value">${Utils.escapeHtml(member.insurance || '未填写')}</div>
                    </div>
                </div>
                ${member.notes ? `
                    <div class="info-item full-width" style="margin-top: 0.75rem;">
                        <div class="label">其他备注</div>
                        <div class="value">${Utils.escapeHtml(member.notes)}</div>
                    </div>
                ` : ''}
                <div class="card-actions">
                    <button class="btn btn-sm btn-primary" onclick="EmergencyModule.exportMedicalCard('${member.id}')">
                        <i class="fas fa-download"></i> 导出信息卡
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="EmergencyModule.editMember('${member.id}')">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="EmergencyModule.deleteMember('${member.id}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `).join('');
    },

    calculateAge(birthDate) {
        if (!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    showAddMemberModal() {
        const bloodOptions = this.bloodTypes.map(type => 
            `<option value="${type}">${type}</option>`
        ).join('');

        const content = `
            <form id="memberForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>姓名 *</label>
                        <input type="text" name="name" required placeholder="请输入姓名">
                    </div>
                    <div class="form-group">
                        <label>关系 *</label>
                        <input type="text" name="relation" required placeholder="如：本人、父亲、母亲等">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>出生日期</label>
                        <input type="date" name="birthDate" max="${Utils.getTodayDateInput()}">
                    </div>
                    <div class="form-group">
                        <label>血型</label>
                        <select name="bloodType">
                            <option value="">请选择</option>
                            ${bloodOptions}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>身高 (cm)</label>
                        <input type="number" name="height" placeholder="如：170">
                    </div>
                    <div class="form-group">
                        <label>体重 (kg)</label>
                        <input type="number" name="weight" placeholder="如：65">
                    </div>
                </div>
                <div class="form-group">
                    <label>过敏史</label>
                    <textarea name="allergies" rows="2" placeholder="如：青霉素、花生、海鲜等"></textarea>
                </div>
                <div class="form-group">
                    <label>慢性病史</label>
                    <textarea name="chronicDiseases" rows="2" placeholder="如：高血压、糖尿病等"></textarea>
                </div>
                <div class="form-group">
                    <label>长期用药</label>
                    <textarea name="medications" rows="2" placeholder="如：降压药、胰岛素等"></textarea>
                </div>
                <div class="form-group">
                    <label>医保信息</label>
                    <input type="text" name="insurance" placeholder="医保卡号、定点医院等">
                </div>
                <div class="form-group">
                    <label>其他备注</label>
                    <textarea name="notes" rows="2" placeholder="其他需要注意的医疗信息"></textarea>
                </div>
            </form>
        `;

        Utils.showModalWithFooter(content, [
            { text: '取消', onClick: 'Utils.closeModal()' },
            { text: '保存', class: 'btn-primary', onClick: 'EmergencyModule.saveMember()' }
        ], '添加家庭成员');
    },

    editMember(id) {
        const members = Storage.get(Storage.KEYS.MEMBERS) || [];
        const member = members.find(m => m.id === id);
        if (!member) return;

        const bloodOptions = this.bloodTypes.map(type => 
            `<option value="${type}" ${member.bloodType === type ? 'selected' : ''}>${type}</option>`
        ).join('');

        const content = `
            <form id="memberForm">
                <input type="hidden" name="id" value="${member.id}">
                <div class="form-row">
                    <div class="form-group">
                        <label>姓名 *</label>
                        <input type="text" name="name" required value="${Utils.escapeHtml(member.name)}">
                    </div>
                    <div class="form-group">
                        <label>关系 *</label>
                        <input type="text" name="relation" required value="${Utils.escapeHtml(member.relation)}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>出生日期</label>
                        <input type="date" name="birthDate" value="${Utils.getDateInputValue(member.birthDate)}" max="${Utils.getTodayDateInput()}">
                    </div>
                    <div class="form-group">
                        <label>血型</label>
                        <select name="bloodType">
                            <option value="">请选择</option>
                            ${bloodOptions}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>身高 (cm)</label>
                        <input type="number" name="height" value="${member.height || ''}" placeholder="如：170">
                    </div>
                    <div class="form-group">
                        <label>体重 (kg)</label>
                        <input type="number" name="weight" value="${member.weight || ''}" placeholder="如：65">
                    </div>
                </div>
                <div class="form-group">
                    <label>过敏史</label>
                    <textarea name="allergies" rows="2">${Utils.escapeHtml(member.allergies || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>慢性病史</label>
                    <textarea name="chronicDiseases" rows="2">${Utils.escapeHtml(member.chronicDiseases || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>长期用药</label>
                    <textarea name="medications" rows="2">${Utils.escapeHtml(member.medications || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>医保信息</label>
                    <input type="text" name="insurance" value="${Utils.escapeHtml(member.insurance || '')}" placeholder="医保卡号、定点医院等">
                </div>
                <div class="form-group">
                    <label>其他备注</label>
                    <textarea name="notes" rows="2">${Utils.escapeHtml(member.notes || '')}</textarea>
                </div>
            </form>
        `;

        Utils.showModalWithFooter(content, [
            { text: '取消', onClick: 'Utils.closeModal()' },
            { text: '保存', class: 'btn-primary', onClick: 'EmergencyModule.saveMember()' }
        ], '编辑家庭成员');
    },

    saveMember() {
        const form = document.getElementById('memberForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.name || !data.relation) {
            Utils.showToast('请填写姓名和关系', 'error');
            return;
        }

        let members = Storage.get(Storage.KEYS.MEMBERS) || [];

        if (data.id) {
            const index = members.findIndex(m => m.id === data.id);
            if (index !== -1) {
                members[index] = { ...members[index], ...data };
                Utils.showToast('成员信息更新成功', 'success');
            }
        } else {
            data.id = Storage.generateId();
            members.push(data);
            Utils.showToast('成员信息添加成功', 'success');
        }

        Storage.set(Storage.KEYS.MEMBERS, members);
        Utils.closeModal();
        this.renderMembers();
    },

    deleteMember(id) {
        Utils.confirmDialog('确定要删除这个家庭成员吗？', `EmergencyModule.confirmDeleteMember('${id}')`);
    },

    confirmDeleteMember(id) {
        let members = Storage.get(Storage.KEYS.MEMBERS) || [];
        members = members.filter(m => m.id !== id);
        Storage.set(Storage.KEYS.MEMBERS, members);
        this.renderMembers();
        Utils.showToast('成员信息已删除', 'success');
    },

    exportMedicalCard(id) {
        const members = Storage.get(Storage.KEYS.MEMBERS) || [];
        const member = members.find(m => m.id === id);
        if (!member) return;

        const age = this.calculateAge(member.birthDate);
        const content = `
            <div style="padding: 1rem;">
                <h3 style="margin-bottom: 1rem; color: var(--primary-color);">
                    <i class="fas fa-id-card"></i> 家庭医疗信息卡
                </h3>
                <div style="margin-bottom: 1.5rem;">
                    <p style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.25rem;">${member.name}</p>
                    <p style="color: var(--dark-gray);">${member.relation} ${age ? `(${age}岁)` : ''}</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <p style="font-size: 0.875rem; color: var(--dark-gray); margin-bottom: 0.25rem;">血型</p>
                        <p style="font-weight: bold;">${member.bloodType || '未填写'}</p>
                    </div>
                    <div>
                        <p style="font-size: 0.875rem; color: var(--dark-gray); margin-bottom: 0.25rem;">身高/体重</p>
                        <p style="font-weight: bold;">${member.height ? member.height + 'cm' : '-'} / ${member.weight ? member.weight + 'kg' : '-'}</p>
                    </div>
                </div>
                <div style="margin-bottom: 1rem;">
                    <p style="font-size: 0.875rem; color: var(--dark-gray); margin-bottom: 0.25rem;">过敏史</p>
                    <p style="font-weight: bold;">${member.allergies || '无'}</p>
                </div>
                <div style="margin-bottom: 1rem;">
                    <p style="font-size: 0.875rem; color: var(--dark-gray); margin-bottom: 0.25rem;">慢性病史</p>
                    <p style="font-weight: bold;">${member.chronicDiseases || '无'}</p>
                </div>
                <div style="margin-bottom: 1rem;">
                    <p style="font-size: 0.875rem; color: var(--dark-gray); margin-bottom: 0.25rem;">长期用药</p>
                    <p style="font-weight: bold;">${member.medications || '无'}</p>
                </div>
                <div style="margin-bottom: 1rem;">
                    <p style="font-size: 0.875rem; color: var(--dark-gray); margin-bottom: 0.25rem;">医保信息</p>
                    <p style="font-weight: bold;">${member.insurance || '未填写'}</p>
                </div>
                ${member.notes ? `
                    <div style="margin-bottom: 1rem;">
                        <p style="font-size: 0.875rem; color: var(--dark-gray); margin-bottom: 0.25rem;">其他备注</p>
                        <p style="font-weight: bold;">${member.notes}</p>
                    </div>
                ` : ''}
                <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--medium-gray); text-align: center;">
                    <p style="font-size: 0.875rem; color: var(--dark-gray);">
                        <i class="fas fa-heartbeat"></i> 如有紧急情况，请拨打120并出示此卡
                    </p>
                </div>
            </div>
        `;

        Utils.showModal(content, `医疗信息卡 - ${member.name}`);
    },

    renderRallyPoints() {
        const list = document.getElementById('rallyPointsList');
        const rallyPoints = Storage.get(Storage.KEYS.RALLY_POINTS) || [];

        if (rallyPoints.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-map-marker-alt"></i>
                    <p>暂无紧急集合点</p>
                    <p style="font-size: 0.875rem;">点击上方按钮添加不同场景的紧急集合点</p>
                </div>
            `;
            return;
        }

        const scenarioIcons = {
            'fire': 'fire',
            'earthquake': 'house-damage',
            'typhoon': 'wind',
            'flood': 'water',
            'other': 'map-marker-alt'
        };

        list.innerHTML = rallyPoints.map(point => {
            const icon = scenarioIcons[point.scenario] || 'map-marker-alt';
            return `
                <div class="card rally-card">
                    <span class="scenario-badge">${this.getScenarioName(point.scenario)}</span>
                    <h3><i class="fas fa-${icon}"></i> ${Utils.escapeHtml(point.name)}</h3>
                    <div class="location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${Utils.escapeHtml(point.location)}
                    </div>
                    <div class="description">${Utils.escapeHtml(point.description || '')}</div>
                    <div class="route-map">
                        <i class="fas fa-route"></i>
                        <span style="margin-left: 0.5rem;">疏散路线示意</span>
                    </div>
                    ${point.notes ? `<p style="color: var(--dark-gray); font-size: 0.875rem; margin-bottom: 1rem;">${Utils.escapeHtml(point.notes)}</p>` : ''}
                    <div class="card-actions">
                        <button class="btn btn-sm btn-primary" onclick="EmergencyModule.showRallyDetail('${point.id}')">
                            <i class="fas fa-eye"></i> 查看详情
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="EmergencyModule.editRallyPoint('${point.id}')">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="EmergencyModule.deleteRallyPoint('${point.id}')">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    getScenarioName(scenario) {
        const names = {
            'fire': '火灾',
            'earthquake': '地震',
            'typhoon': '台风',
            'flood': '洪水',
            'other': '其他'
        };
        return names[scenario] || '其他';
    },

    showAddRallyPointModal() {
        const content = `
            <form id="rallyForm">
                <div class="form-group">
                    <label>场景类型 *</label>
                    <select name="scenario" required>
                        <option value="">请选择场景</option>
                        <option value="fire">火灾</option>
                        <option value="earthquake">地震</option>
                        <option value="typhoon">台风</option>
                        <option value="flood">洪水</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>集合点名称 *</label>
                    <input type="text" name="name" required placeholder="如：小区东门广场">
                </div>
                <div class="form-group">
                    <label>具体位置 *</label>
                    <input type="text" name="location" required placeholder="详细地址或位置描述">
                </div>
                <div class="form-group">
                    <label>疏散路线</label>
                    <textarea name="description" rows="3" placeholder="从家中到集合点的详细路线说明"></textarea>
                </div>
                <div class="form-group">
                    <label>注意事项</label>
                    <textarea name="notes" rows="2" placeholder="集合时需要注意的事项"></textarea>
                </div>
            </form>
        `;

        Utils.showModalWithFooter(content, [
            { text: '取消', onClick: 'Utils.closeModal()' },
            { text: '保存', class: 'btn-primary', onClick: 'EmergencyModule.saveRallyPoint()' }
        ], '添加紧急集合点');
    },

    editRallyPoint(id) {
        const rallyPoints = Storage.get(Storage.KEYS.RALLY_POINTS) || [];
        const point = rallyPoints.find(p => p.id === id);
        if (!point) return;

        const content = `
            <form id="rallyForm">
                <input type="hidden" name="id" value="${point.id}">
                <div class="form-group">
                    <label>场景类型 *</label>
                    <select name="scenario" required>
                        <option value="">请选择场景</option>
                        <option value="fire" ${point.scenario === 'fire' ? 'selected' : ''}>火灾</option>
                        <option value="earthquake" ${point.scenario === 'earthquake' ? 'selected' : ''}>地震</option>
                        <option value="typhoon" ${point.scenario === 'typhoon' ? 'selected' : ''}>台风</option>
                        <option value="flood" ${point.scenario === 'flood' ? 'selected' : ''}>洪水</option>
                        <option value="other" ${point.scenario === 'other' ? 'selected' : ''}>其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>集合点名称 *</label>
                    <input type="text" name="name" required value="${Utils.escapeHtml(point.name)}">
                </div>
                <div class="form-group">
                    <label>具体位置 *</label>
                    <input type="text" name="location" required value="${Utils.escapeHtml(point.location)}">
                </div>
                <div class="form-group">
                    <label>疏散路线</label>
                    <textarea name="description" rows="3">${Utils.escapeHtml(point.description || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>注意事项</label>
                    <textarea name="notes" rows="2">${Utils.escapeHtml(point.notes || '')}</textarea>
                </div>
            </form>
        `;

        Utils.showModalWithFooter(content, [
            { text: '取消', onClick: 'Utils.closeModal()' },
            { text: '保存', class: 'btn-primary', onClick: 'EmergencyModule.saveRallyPoint()' }
        ], '编辑紧急集合点');
    },

    saveRallyPoint() {
        const form = document.getElementById('rallyForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.scenario || !data.name || !data.location) {
            Utils.showToast('请填写所有必填项', 'error');
            return;
        }

        let rallyPoints = Storage.get(Storage.KEYS.RALLY_POINTS) || [];

        if (data.id) {
            const index = rallyPoints.findIndex(p => p.id === data.id);
            if (index !== -1) {
                rallyPoints[index] = { ...rallyPoints[index], ...data };
                Utils.showToast('集合点更新成功', 'success');
            }
        } else {
            data.id = Storage.generateId();
            rallyPoints.push(data);
            Utils.showToast('集合点添加成功', 'success');
        }

        Storage.set(Storage.KEYS.RALLY_POINTS, rallyPoints);
        Utils.closeModal();
        this.renderRallyPoints();
    },

    deleteRallyPoint(id) {
        Utils.confirmDialog('确定要删除这个紧急集合点吗？', `EmergencyModule.confirmDeleteRallyPoint('${id}')`);
    },

    confirmDeleteRallyPoint(id) {
        let rallyPoints = Storage.get(Storage.KEYS.RALLY_POINTS) || [];
        rallyPoints = rallyPoints.filter(p => p.id !== id);
        Storage.set(Storage.KEYS.RALLY_POINTS, rallyPoints);
        this.renderRallyPoints();
        Utils.showToast('集合点已删除', 'success');
    },

    showRallyDetail(id) {
        const rallyPoints = Storage.get(Storage.KEYS.RALLY_POINTS) || [];
        const point = rallyPoints.find(p => p.id === id);
        if (!point) return;

        const scenarioIcons = {
            'fire': 'fire',
            'earthquake': 'house-damage',
            'typhoon': 'wind',
            'flood': 'water',
            'other': 'map-marker-alt'
        };

        const icon = scenarioIcons[point.scenario] || 'map-marker-alt';

        const content = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--info-color), var(--secondary-color)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; margin: 0 auto 1rem;">
                    <i class="fas fa-${icon}"></i>
                </div>
                <span class="scenario-badge">${this.getScenarioName(point.scenario)}</span>
                <h2 style="margin-top: 0.5rem;">${Utils.escapeHtml(point.name)}</h2>
            </div>

            <div style="padding: 1rem; background: var(--light-gray); border-radius: 8px; margin-bottom: 1rem;">
                <p style="font-size: 0.875rem; color: var(--dark-gray); margin-bottom: 0.25rem;">
                    <i class="fas fa-map-marker-alt" style="color: var(--primary-color);"></i> 具体位置
                </p>
                <p style="font-weight: bold;">${Utils.escapeHtml(point.location)}</p>
            </div>

            ${point.description ? `
                <div style="margin-bottom: 1rem;">
                    <p style="font-size: 0.875rem; color: var(--dark-gray); margin-bottom: 0.5rem;">
                        <i class="fas fa-route"></i> 疏散路线
                    </p>
                    <p>${Utils.escapeHtml(point.description)}</p>
                </div>
            ` : ''}

            <div style="height: 200px; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--dark-gray); margin-bottom: 1rem;">
                <i class="fas fa-map-marked-alt" style="font-size: 3rem;"></i>
            </div>

            ${point.notes ? `
                <div style="padding: 1rem; background: #fff3cd; border-left: 4px solid var(--warning-color); border-radius: 6px;">
                    <p style="font-weight: bold; margin-bottom: 0.25rem;">
                        <i class="fas fa-exclamation-triangle" style="color: var(--warning-color);"></i> 注意事项
                    </p>
                    <p>${Utils.escapeHtml(point.notes)}</p>
                </div>
            ` : ''}

            <div style="margin-top: 2rem; text-align: center;">
                <p style="color: var(--dark-gray); font-size: 0.875rem;">
                    <i class="fas fa-users"></i> 请确保所有家庭成员都知晓此集合点
                </p>
            </div>
        `;

        Utils.showModal(content, `紧急集合点 - ${point.name}`);
    }
};

function showAddContactModal() {
    EmergencyModule.showAddContactModal();
}

function showAddMemberModal() {
    EmergencyModule.showAddMemberModal();
}

function showAddRallyPointModal() {
    EmergencyModule.showAddRallyPointModal();
}
