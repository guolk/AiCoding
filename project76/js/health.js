function renderVaccines() {
    const child = getCurrentChild();
    const container = document.getElementById('vaccinesList');
    
    document.getElementById('vaccinatedCount').textContent = child.vaccines.filter(v => v.status === 'completed').length;
    document.getElementById('upcomingCount').textContent = child.vaccines.filter(v => v.status === 'upcoming').length;
    document.getElementById('totalVaccines').textContent = child.vaccines.length;
    
    const vaccines = child.vaccines.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    
    container.innerHTML = vaccines.map(v => `
        <div class="vaccine-item ${v.status}">
            <div class="vaccine-status ${v.status === 'completed' ? 'completed' : 'pending'}">
                ${v.status === 'completed' ? '✓' : '⏰'}
            </div>
            <div class="vaccine-info">
                <div class="vaccine-name">${v.name}</div>
                <div class="vaccine-date">${formatDateCN(v.date)}</div>
                <div class="vaccine-location">📍 ${v.location}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.5rem;">
                ${v.status === 'upcoming' ? 
                    `<button class="btn btn-primary btn-sm" onclick="markVaccineCompleted('${v.id}')">✓ 标记已接种</button>` :
                    `<span style="font-size:0.75rem;color:#10b981;">已完成</span>`
                }
                <button class="btn btn-danger btn-sm" onclick="deleteVaccine(${v.id})">删除</button>
            </div>
        </div>
    `).join('');
}

function markVaccineCompleted(id) {
    const child = getCurrentChild();
    const vaccine = child.vaccines.find(v => v.id === id);
    if (vaccine) {
        vaccine.status = 'completed';
        saveData();
        renderVaccines();
        showToast('已标记为已接种');
    }
}

function deleteVaccine(id) {
    if (confirm('确定要删除这条疫苗记录吗？')) {
        const child = getCurrentChild();
        child.vaccines = child.vaccines.filter(v => v.id !== id);
        saveData();
        renderVaccines();
        showToast('删除成功');
    }
}

function renderMedicalRecords() {
    const child = getCurrentChild();
    const container = document.getElementById('medicalList');
    
    const records = child.medicalRecords.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = records.map(r => `
        <div class="medical-item">
            <div class="medical-header">
                <div class="medical-illness">🏥 ${r.illness}</div>
                <div class="medical-date">${formatDateCN(r.date)}</div>
            </div>
            <div class="medical-details">
                <div>
                    <span>症状</span>
                    <span>${r.symptoms}</span>
                </div>
                <div>
                    <span>诊断</span>
                    <span>${r.diagnosis}</span>
                </div>
                <div>
                    <span>用药</span>
                    <span>${r.medication}</span>
                </div>
                <div>
                    <span>医院/医生</span>
                    <span>${r.hospital} - ${r.doctor}</span>
                </div>
            </div>
            <div style="margin-top:1rem;text-align:right;">
                <button class="btn btn-danger btn-sm" onclick="deleteMedicalRecord('${r.id}')">删除</button>
            </div>
        </div>
    `).join('');
    
    if (records.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:3rem;color:#94a3b8;">暂无就医记录</div>';
    }
}

function deleteMedicalRecord(id) {
    if (confirm('确定要删除这条就医记录吗？')) {
        const child = getCurrentChild();
        child.medicalRecords = child.medicalRecords.filter(r => r.id !== id);
        saveData();
        renderMedicalRecords();
        showToast('删除成功');
    }
}

function showAddVaccine() {
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>添加疫苗接种</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>疫苗名称</label>
                    <input type="text" id="vaccineName" placeholder="乙肝疫苗">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>接种日期</label>
                        <input type="date" id="vaccineDate" value="${formatDate(new Date())}">
                    </div>
                    <div class="form-group">
                        <label>状态</label>
                        <select id="vaccineStatus">
                            <option value="upcoming">待接种</option>
                            <option value="completed">已接种</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>接种地点</label>
                    <input type="text" id="vaccineLocation" placeholder="社区卫生服务中心">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveVaccine()">保存</button>
            </div>
        </div>
    `);
}

function saveVaccine() {
    const child = getCurrentChild();
    const name = document.getElementById('vaccineName').value;
    const date = document.getElementById('vaccineDate').value;
    const status = document.getElementById('vaccineStatus').value;
    const location = document.getElementById('vaccineLocation').value;
    
    if (!name) {
        showToast('请输入疫苗名称', 'error');
        return;
    }
    
    child.vaccines.push({
        id: generateId(),
        name,
        date,
        status,
        location: location || '社区卫生服务中心'
    });
    
    saveData();
    closeModal();
    renderVaccines();
    showToast('保存成功');
}

function showAddMedical() {
    showModal(`
        <div class="modal">
            <div class="modal-header">
                <h3>添加就医记录</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>病症</label>
                    <input type="text" id="medicalIllness" placeholder="感冒发热">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>日期</label>
                        <input type="date" id="medicalDate" value="${formatDate(new Date())}">
                    </div>
                    <div class="form-group">
                        <label>医院</label>
                        <input type="text" id="medicalHospital" placeholder="市妇幼保健院">
                    </div>
                </div>
                <div class="form-group">
                    <label>症状</label>
                    <input type="text" id="medicalSymptoms" placeholder="发热38.5°C，咳嗽">
                </div>
                <div class="form-group">
                    <label>诊断</label>
                    <input type="text" id="medicalDiagnosis" placeholder="上呼吸道感染">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>用药</label>
                        <input type="text" id="medicalMedication" placeholder="小儿氨酚黄那敏颗粒">
                    </div>
                    <div class="form-group">
                        <label>医生</label>
                        <input type="text" id="medicalDoctor" placeholder="张医生">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="saveMedical()">保存</button>
            </div>
        </div>
    `);
}

function saveMedical() {
    const child = getCurrentChild();
    const illness = document.getElementById('medicalIllness').value;
    const date = document.getElementById('medicalDate').value;
    const hospital = document.getElementById('medicalHospital').value;
    const symptoms = document.getElementById('medicalSymptoms').value;
    const diagnosis = document.getElementById('medicalDiagnosis').value;
    const medication = document.getElementById('medicalMedication').value;
    const doctor = document.getElementById('medicalDoctor').value;
    
    if (!illness) {
        showToast('请输入病症', 'error');
        return;
    }
    
    child.medicalRecords.push({
        id: generateId(),
        illness,
        date,
        symptoms,
        diagnosis,
        medication,
        doctor: doctor || '医生',
        hospital: hospital || '医院'
    });
    
    saveData();
    closeModal();
    renderMedicalRecords();
    showToast('保存成功');
}

function initHealthModule() {
    renderVaccines();
    renderMedicalRecords();
}
