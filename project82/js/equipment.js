const Equipment = {
    editingType: null,
    editingId: null,
    usageChart: null,

    init() {
        this.renderCameras();
        this.renderLenses();
        this.initLensUsageChart();
    },

    openCameraEditor(cameraId = null) {
        this.editingType = 'camera';
        this.editingId = cameraId;
        document.getElementById('equipmentModalTitle').textContent = cameraId ? '编辑相机' : '添加相机';

        const form = document.getElementById('equipmentForm');
        let camera = {};
        if (cameraId) {
            camera = Storage.getCameras().find(c => c.id === cameraId) || {};
        }

        form.innerHTML = `
            <div>
                <label class="text-sm text-gray-400 block mb-1">品牌</label>
                <input type="text" id="equipBrand" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full" value="${camera.brand || ''}">
            </div>
            <div>
                <label class="text-sm text-gray-400 block mb-1">型号</label>
                <input type="text" id="equipModel" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full" value="${camera.model || ''}">
            </div>
            <div>
                <label class="text-sm text-gray-400 block mb-1">购买日期</label>
                <input type="date" id="equipDate" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full" value="${camera.purchaseDate || ''}">
            </div>
            <div>
                <label class="text-sm text-gray-400 block mb-1">传感器类型</label>
                <input type="text" id="equipSensor" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full" placeholder="如：全画幅、APS-C" value="${camera.sensor || ''}">
            </div>
            <div>
                <label class="text-sm text-gray-400 block mb-1">备注</label>
                <textarea id="equipNotes" rows="2" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full">${camera.notes || ''}</textarea>
            </div>
        `;

        document.getElementById('equipmentModal').classList.remove('hidden');
    },

    openLensEditor(lensId = null) {
        this.editingType = 'lens';
        this.editingId = lensId;
        document.getElementById('equipmentModalTitle').textContent = lensId ? '编辑镜头' : '添加镜头';

        const form = document.getElementById('equipmentForm');
        let lens = {};
        if (lensId) {
            lens = Storage.getLenses().find(l => l.id === lensId) || {};
        }

        form.innerHTML = `
            <div>
                <label class="text-sm text-gray-400 block mb-1">品牌</label>
                <input type="text" id="equipBrand" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full" value="${lens.brand || ''}">
            </div>
            <div>
                <label class="text-sm text-gray-400 block mb-1">型号</label>
                <input type="text" id="equipModel" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full" value="${lens.model || ''}">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-sm text-gray-400 block mb-1">最小焦距(mm)</label>
                    <input type="number" id="equipFocalMin" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full" value="${lens.focalMin || ''}">
                </div>
                <div>
                    <label class="text-sm text-gray-400 block mb-1">最大焦距(mm)</label>
                    <input type="number" id="equipFocalMax" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full" value="${lens.focalMax || ''}">
                </div>
            </div>
            <div>
                <label class="text-sm text-gray-400 block mb-1">最大光圈</label>
                <input type="text" id="equipAperture" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full" placeholder="如：f/2.8" value="${lens.aperture || ''}">
            </div>
            <div>
                <label class="text-sm text-gray-400 block mb-1">购买日期</label>
                <input type="date" id="equipDate" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full" value="${lens.purchaseDate || ''}">
            </div>
            <div>
                <label class="text-sm text-gray-400 block mb-1">备注</label>
                <textarea id="equipNotes" rows="2" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full">${lens.notes || ''}</textarea>
            </div>
        `;

        document.getElementById('equipmentModal').classList.remove('hidden');
    },

    closeEquipmentEditor() {
        document.getElementById('equipmentModal').classList.add('hidden');
        this.editingType = null;
        this.editingId = null;
    },

    saveEquipment() {
        const brand = document.getElementById('equipBrand').value.trim();
        const model = document.getElementById('equipModel').value.trim();

        if (!brand || !model) {
            showToast('请填写品牌和型号');
            return;
        }

        if (this.editingType === 'camera') {
            const camera = {
                id: this.editingId,
                brand,
                model,
                purchaseDate: document.getElementById('equipDate').value,
                sensor: document.getElementById('equipSensor').value,
                notes: document.getElementById('equipNotes').value
            };
            Storage.saveCamera(camera);
            this.renderCameras();
        } else if (this.editingType === 'lens') {
            const lens = {
                id: this.editingId,
                brand,
                model,
                focalMin: document.getElementById('equipFocalMin').value,
                focalMax: document.getElementById('equipFocalMax').value,
                aperture: document.getElementById('equipAperture').value,
                purchaseDate: document.getElementById('equipDate').value,
                notes: document.getElementById('equipNotes').value
            };
            Storage.saveLens(lens);
            this.renderLenses();
        }

        this.closeEquipmentEditor();
        showToast('器材已保存');
    },

    deleteCamera(cameraId) {
        if (!confirm('确定要删除这个相机吗？')) return;
        Storage.deleteCamera(cameraId);
        this.renderCameras();
        showToast('相机已删除');
    },

    deleteLens(lensId) {
        if (!confirm('确定要删除这个镜头吗？')) return;
        Storage.deleteLens(lensId);
        this.renderLenses();
        this.initLensUsageChart();
        showToast('镜头已删除');
    },

    renderCameras() {
        const container = document.getElementById('cameraList');
        const cameras = Storage.getCameras();

        if (cameras.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-4xl mb-2">📷</div>
                    <p class="text-gray-400">还没有相机档案</p>
                </div>
            `;
            return;
        }

        container.innerHTML = cameras.map(camera => `
            <div class="equipment-card">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-semibold">${camera.brand} ${camera.model}</h4>
                        <div class="text-sm text-gray-400 mt-1">
                            ${camera.sensor ? `<span>${camera.sensor}</span>` : ''}
                            ${camera.purchaseDate ? `<span class="ml-2">📅 ${camera.purchaseDate}</span>` : ''}
                        </div>
                        ${camera.notes ? `<p class="text-sm text-gray-500 mt-2">${camera.notes}</p>` : ''}
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="Equipment.openCameraEditor('${camera.id}')" class="text-blue-400 hover:text-blue-300 text-sm">编辑</button>
                        <button onclick="Equipment.deleteCamera('${camera.id}')" class="text-red-400 hover:text-red-300 text-sm">删除</button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderLenses() {
        const container = document.getElementById('lensList');
        const lenses = Storage.getLenses();

        if (lenses.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-4xl mb-2">🔍</div>
                    <p class="text-gray-400">还没有镜头档案</p>
                </div>
            `;
            return;
        }

        container.innerHTML = lenses.map(lens => {
            const focalRange = lens.focalMin && lens.focalMax ? 
                (lens.focalMin === lens.focalMax ? `${lens.focalMin}mm` : `${lens.focalMin}-${lens.focalMax}mm`) : 
                '';

            return `
                <div class="equipment-card">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-semibold">${lens.brand} ${lens.model}</h4>
                            <div class="text-sm text-gray-400 mt-1">
                                ${focalRange ? `<span>${focalRange}</span>` : ''}
                                ${lens.aperture ? `<span class="ml-2">${lens.aperture}</span>` : ''}
                                ${lens.purchaseDate ? `<span class="ml-2">📅 ${lens.purchaseDate}</span>` : ''}
                            </div>
                            ${lens.notes ? `<p class="text-sm text-gray-500 mt-2">${lens.notes}</p>` : ''}
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="Equipment.openLensEditor('${lens.id}')" class="text-blue-400 hover:text-blue-300 text-sm">编辑</button>
                            <button onclick="Equipment.deleteLens('${lens.id}')" class="text-red-400 hover:text-red-300 text-sm">删除</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    initLensUsageChart() {
        const photos = Storage.getPhotos();
        const lenses = Storage.getLenses();

        if (photos.length === 0 || lenses.length === 0) return;

        const lensUsage = {};
        lenses.forEach(lens => {
            const lensName = `${lens.brand} ${lens.model}`.toLowerCase();
            lensUsage[lensName] = 0;
        });

        photos.forEach(photo => {
            if (photo.exif?.lens) {
                const lensName = photo.exif.lens.toLowerCase();
                for (const key of Object.keys(lensUsage)) {
                    if (lensName.includes(key.split(' ').pop()) || key.includes(lensName)) {
                        lensUsage[key]++;
                        break;
                    }
                }
            }
        });

        const labels = Object.keys(lensUsage).map(k => k.split(' ').slice(-2).join(' '));
        const data = Object.values(lensUsage);

        const ctx = document.getElementById('lensUsageChart').getContext('2d');
        
        if (this.usageChart) {
            this.usageChart.destroy();
        }

        this.usageChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: '使用次数',
                    data,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.6)',
                        'rgba(34, 197, 94, 0.6)',
                        'rgba(249, 115, 22, 0.6)',
                        'rgba(168, 85, 247, 0.6)',
                        'rgba(234, 179, 8, 0.6)'
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(34, 197, 94)',
                        'rgb(249, 115, 22)',
                        'rgb(168, 85, 247)',
                        'rgb(234, 179, 8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                }
            }
        });
    },

    refresh() {
        this.renderCameras();
        this.renderLenses();
        this.initLensUsageChart();
    }
};
