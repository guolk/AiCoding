const Progress = {
    skillChart: null,

    init() {
        this.initSkillRadar();
        this.renderTopFeatures();
        this.initMonthSelectors();
    },

    initSkillRadar() {
        const skills = Storage.getSkills();
        const ctx = document.getElementById('skillRadarChart').getContext('2d');

        if (this.skillChart) {
            this.skillChart.destroy();
        }

        this.skillChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(skills),
                datasets: [{
                    label: '掌握程度',
                    data: Object.values(skills),
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(59, 130, 246)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        angleLines: { color: '#374151' },
                        grid: { color: '#374151' },
                        pointLabels: { color: '#9ca3af', font: { size: 12 } },
                        ticks: { display: false },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },

    openSkillEditor() {
        const skills = Storage.getSkills();
        const container = document.getElementById('skillInputs');

        container.innerHTML = Object.keys(skills).map(skill => `
            <div class="flex items-center justify-between">
                <label class="text-sm text-gray-300">${skill}</label>
                <div class="flex items-center space-x-3">
                    <input type="range" id="skill-${skill}" min="0" max="100" value="${skills[skill]}" 
                           oninput="document.getElementById('skill-${skill}-value').textContent = this.value + '%'"
                           class="w-32">
                    <span id="skill-${skill}-value" class="text-sm text-gray-400 w-12">${skills[skill]}%</span>
                </div>
            </div>
        `).join('');

        document.getElementById('skillModal').classList.remove('hidden');
    },

    closeSkillEditor() {
        document.getElementById('skillModal').classList.add('hidden');
    },

    saveSkills() {
        const skills = Storage.getSkills();
        Object.keys(skills).forEach(skill => {
            const input = document.getElementById(`skill-${skill}`);
            if (input) {
                skills[skill] = parseInt(input.value);
            }
        });
        Storage.saveSkills(skills);
        this.closeSkillEditor();
        this.initSkillRadar();
        showToast('技能自评已保存');
    },

    renderTopFeatures() {
        const container = document.getElementById('topFeatures');
        const photos = Storage.getPhotos();

        if (photos.length === 0) {
            container.innerHTML = '<p class="text-gray-400">导入照片后可查看分析结果</p>';
            return;
        }

        const highRatedPhotos = photos.filter(p => p.rating >= 4);

        if (highRatedPhotos.length === 0) {
            container.innerHTML = '<p class="text-gray-400">还没有4星及以上的作品</p>';
            return;
        }

        const tagCount = {};
        const apertureCount = {};
        const focalCount = {};

        highRatedPhotos.forEach(photo => {
            (photo.tags || []).forEach(tagId => {
                const tag = Storage.getTags().find(t => t.id === tagId);
                if (tag) {
                    tagCount[tag.name] = (tagCount[tag.name] || 0) + 1;
                }
            });

            if (photo.exif?.aperture) {
                const ap = `f/${photo.exif.aperture}`;
                apertureCount[ap] = (apertureCount[ap] || 0) + 1;
            }

            if (photo.exif?.focalLength) {
                const focal = `${Math.round(photo.exif.focalLength)}mm`;
                focalCount[focal] = (focalCount[focal] || 0) + 1;
            }
        });

        const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const topApertures = Object.entries(apertureCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const topFocals = Object.entries(focalCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

        let html = `
            <div class="mb-4">
                <h4 class="text-sm font-medium text-gray-400 mb-2">热门标签</h4>
                <div class="flex flex-wrap gap-2">
                    ${topTags.map(([name, count]) => `
                        <span class="bg-gray-700 px-3 py-1 rounded-full text-sm">
                            ${name} <span class="text-blue-400">${count}</span>
                        </span>
                    `).join('') || '<span class="text-gray-500 text-sm">暂无数据</span>'}
                </div>
            </div>
            <div class="mb-4">
                <h4 class="text-sm font-medium text-gray-400 mb-2">常用光圈</h4>
                <div class="flex flex-wrap gap-2">
                    ${topApertures.map(([name, count]) => `
                        <span class="bg-gray-700 px-3 py-1 rounded-full text-sm">
                            ${name} <span class="text-green-400">${count}</span>
                        </span>
                    `).join('') || '<span class="text-gray-500 text-sm">暂无数据</span>'}
                </div>
            </div>
            <div>
                <h4 class="text-sm font-medium text-gray-400 mb-2">常用焦距</h4>
                <div class="flex flex-wrap gap-2">
                    ${topFocals.map(([name, count]) => `
                        <span class="bg-gray-700 px-3 py-1 rounded-full text-sm">
                            ${name} <span class="text-purple-400">${count}</span>
                        </span>
                    `).join('') || '<span class="text-gray-500 text-sm">暂无数据</span>'}
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    initMonthSelectors() {
        const photos = Storage.getPhotos();
        const months = new Set();

        photos.forEach(photo => {
            if (photo.exif?.dateTime) {
                const date = new Date(photo.exif.dateTime);
                const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                months.add(monthStr);
            }
        });

        const sortedMonths = Array.from(months).sort().reverse();
        const options = sortedMonths.map(m => `<option value="${m}">${m}</option>`).join('');

        document.getElementById('compareMonth1').innerHTML = options;
        document.getElementById('compareMonth2').innerHTML = options;

        if (sortedMonths.length >= 2) {
            document.getElementById('compareMonth1').value = sortedMonths[0];
            document.getElementById('compareMonth2').value = sortedMonths[1];
            this.updateMonthlyCompare();
        }
    },

    updateMonthlyCompare() {
        const month1 = document.getElementById('compareMonth1').value;
        const month2 = document.getElementById('compareMonth2').value;

        if (!month1 || !month2) return;

        const photos = Storage.getPhotos();

        const photos1 = photos.filter(p => {
            if (!p.exif?.dateTime) return false;
            const date = new Date(p.exif.dateTime);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return monthStr === month1;
        });

        const photos2 = photos.filter(p => {
            if (!p.exif?.dateTime) return false;
            const date = new Date(p.exif.dateTime);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return monthStr === month2;
        });

        const container = document.getElementById('monthlyCompare');
        container.innerHTML = `
            <div>
                <h4 class="font-semibold mb-3">${month1} (${photos1.length}张)</h4>
                ${this.renderMonthPhotos(photos1)}
            </div>
            <div>
                <h4 class="font-semibold mb-3">${month2} (${photos2.length}张)</h4>
                ${this.renderMonthPhotos(photos2)}
            </div>
        `;
    },

    renderMonthPhotos(photos) {
        if (photos.length === 0) {
            return '<p class="text-gray-400 text-sm">该月没有照片</p>';
        }

        const sorted = [...photos].sort((a, b) => b.rating - a.rating);
        const topPhotos = sorted.slice(0, 4);

        return `
            <div class="grid grid-cols-2 gap-2">
                ${topPhotos.map(photo => `
                    <div class="relative group">
                        <img src="${photo.dataUrl}" class="w-full h-32 object-cover rounded" alt="">
                        <div class="absolute top-1 right-1 bg-black bg-opacity-70 px-1 rounded text-xs">
                            ${'★'.repeat(photo.rating)}${'☆'.repeat(5 - photo.rating)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    refresh() {
        this.initSkillRadar();
        this.renderTopFeatures();
        this.initMonthSelectors();
    }
};
