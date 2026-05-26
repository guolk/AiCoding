const Analysis = {
    charts: {},

    init() {
        this.initCharts();
    },

    initCharts() {
        this.createApertureChart();
        this.createShutterChart();
        this.createIsoChart();
        this.createFocalChart();
        this.createTimeHeatmap();
    },

    getPhotoData() {
        const photos = Storage.getPhotos();
        return photos.filter(p => p.exif && Object.keys(p.exif).length > 0);
    },

    createApertureChart() {
        const ctx = document.getElementById('apertureChart').getContext('2d');
        const photos = this.getPhotoData();
        const apertures = photos.map(p => p.exif.aperture).filter(a => a !== null);

        const apertureRanges = [
            { min: 1, max: 2, label: 'f/1-f/2' },
            { min: 2, max: 2.8, label: 'f/2-f/2.8' },
            { min: 2.8, max: 4, label: 'f/2.8-f/4' },
            { min: 4, max: 5.6, label: 'f/4-f/5.6' },
            { min: 5.6, max: 8, label: 'f/5.6-f/8' },
            { min: 8, max: 11, label: 'f/8-f/11' },
            { min: 11, max: 16, label: 'f/11-f/16' },
            { min: 16, max: 22, label: 'f/16-f/22' }
        ];

        const counts = apertureRanges.map(range =>
            apertures.filter(a => a >= range.min && a < range.max).length
        );

        if (this.charts.aperture) {
            this.charts.aperture.destroy();
        }

        this.charts.aperture = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: apertureRanges.map(r => r.label),
                datasets: [{
                    label: '照片数量',
                    data: counts,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgb(59, 130, 246)',
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

    createShutterChart() {
        const ctx = document.getElementById('shutterChart').getContext('2d');
        const photos = this.getPhotoData();
        const shutters = photos.map(p => p.exif.shutterSpeed).filter(s => s !== null);

        const shutterRanges = [
            { min: 0, max: 1/1000, label: '<1/1000s' },
            { min: 1/1000, max: 1/500, label: '1/1000-1/500s' },
            { min: 1/500, max: 1/250, label: '1/500-1/250s' },
            { min: 1/250, max: 1/125, label: '1/250-1/125s' },
            { min: 1/125, max: 1/60, label: '1/125-1/60s' },
            { min: 1/60, max: 1/30, label: '1/60-1/30s' },
            { min: 1/30, max: 1/15, label: '1/30-1/15s' },
            { min: 1/15, max: 1/4, label: '1/15-1/4s' },
            { min: 1/4, max: 1, label: '1/4-1s' },
            { min: 1, max: Infinity, label: '>1s' }
        ];

        const counts = shutterRanges.map(range =>
            shutters.filter(s => s >= range.min && s < range.max).length
        );

        if (this.charts.shutter) {
            this.charts.shutter.destroy();
        }

        this.charts.shutter = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: shutterRanges.map(r => r.label),
                datasets: [{
                    label: '照片数量',
                    data: counts,
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 }, grid: { color: '#374151' } }
                }
            }
        });
    },

    createIsoChart() {
        const ctx = document.getElementById('isoChart').getContext('2d');
        const photos = this.getPhotoData();
        const isos = photos.map(p => p.exif.iso).filter(i => i !== null);

        const isoRanges = [
            { min: 0, max: 200, label: 'ISO 100-200' },
            { min: 200, max: 400, label: 'ISO 200-400' },
            { min: 400, max: 800, label: 'ISO 400-800' },
            { min: 800, max: 1600, label: 'ISO 800-1600' },
            { min: 1600, max: 3200, label: 'ISO 1600-3200' },
            { min: 3200, max: 6400, label: 'ISO 3200-6400' },
            { min: 6400, max: 12800, label: 'ISO 6400-12800' },
            { min: 12800, max: Infinity, label: '>ISO 12800' }
        ];

        const counts = isoRanges.map(range =>
            isos.filter(i => i >= range.min && i < range.max).length
        );

        if (this.charts.iso) {
            this.charts.iso.destroy();
        }

        this.charts.iso = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: isoRanges.map(r => r.label),
                datasets: [{
                    label: '照片数量',
                    data: counts,
                    backgroundColor: 'rgba(249, 115, 22, 0.6)',
                    borderColor: 'rgb(249, 115, 22)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 }, grid: { color: '#374151' } }
                }
            }
        });
    },

    createFocalChart() {
        const ctx = document.getElementById('focalChart').getContext('2d');
        const photos = this.getPhotoData();
        const focals = photos.map(p => p.exif.focalLength).filter(f => f !== null);

        const focalRanges = [
            { min: 0, max: 16, label: '超广角(8-16mm)' },
            { min: 16, max: 24, label: '广角(16-24mm)' },
            { min: 24, max: 35, label: '人文(24-35mm)' },
            { min: 35, max: 50, label: '标准(35-50mm)' },
            { min: 50, max: 70, label: '中焦(50-70mm)' },
            { min: 70, max: 135, label: '中长焦(70-135mm)' },
            { min: 135, max: 300, label: '长焦(135-300mm)' },
            { min: 300, max: Infinity, label: '超长焦(>300mm)' }
        ];

        const counts = focalRanges.map(range =>
            focals.filter(f => f >= range.min && f < range.max).length
        );

        if (this.charts.focal) {
            this.charts.focal.destroy();
        }

        this.charts.focal = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: focalRanges.map(r => r.label),
                datasets: [{
                    label: '照片数量',
                    data: counts,
                    backgroundColor: 'rgba(168, 85, 247, 0.6)',
                    borderColor: 'rgb(168, 85, 247)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 45 }, grid: { color: '#374151' } }
                }
            }
        });
    },

    createTimeHeatmap() {
        const container = document.getElementById('timeHeatmap');
        const photos = this.getPhotoData();

        const timeData = {};
        for (let h = 0; h < 24; h++) {
            for (let d = 0; d < 7; d++) {
                timeData[`${d}-${h}`] = 0;
            }
        }

        photos.forEach(photo => {
            if (photo.exif.dateTime) {
                const date = new Date(photo.exif.dateTime);
                const day = date.getDay();
                const hour = date.getHours();
                const key = `${day}-${hour}`;
                timeData[key]++;
            }
        });

        const maxCount = Math.max(...Object.values(timeData), 1);

        const days = ['日', '一', '二', '三', '四', '五', '六'];

        let html = '<div class="heatmap-container">';
        html += '<div class="flex"><div class="w-8"></div>';
        for (let h = 0; h < 24; h++) {
            html += `<div class="text-xs text-gray-500 text-center" style="width:20px">${h}</div>`;
        }
        html += '</div>';

        for (let d = 0; d < 7; d++) {
            html += `<div class="flex items-center"><div class="w-8 text-xs text-gray-500">${days[d]}</div>`;
            html += '<div class="heatmap-grid flex-1">';
            for (let h = 0; h < 24; h++) {
                const count = timeData[`${d}-${h}`];
                const intensity = count / maxCount;
                const bgColor = count === 0 ? '#374151' :
                    `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`;
                html += `<div class="heatmap-cell" style="background-color:${bgColor}" title="${days[d]} ${h}:00 - ${count}张照片"></div>`;
            }
            html += '</div></div>';
        }
        html += '</div>';

        html += '<div class="flex items-center justify-end mt-4 space-x-2">';
        html += '<span class="text-xs text-gray-500">少</span>';
        html += '<div class="heatmap-cell" style="width:16px;height:16px;background-color:#374151"></div>';
        html += '<div class="heatmap-cell" style="width:16px;height:16px;background-color:rgba(59, 130, 246, 0.2)"></div>';
        html += '<div class="heatmap-cell" style="width:16px;height:16px;background-color:rgba(59, 130, 246, 0.5)"></div>';
        html += '<div class="heatmap-cell" style="width:16px;height:16px;background-color:rgba(59, 130, 246, 0.8)"></div>';
        html += '<div class="heatmap-cell" style="width:16px;height:16px;background-color:rgba(59, 130, 246, 1)"></div>';
        html += '<span class="text-xs text-gray-500">多</span>';
        html += '</div>';

        container.innerHTML = html;
    },

    refresh() {
        this.initCharts();
    }
};
