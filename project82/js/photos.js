const PhotoManager = {
    currentPhotoId: null,

    async init() {
        this.setupPhotoInput();
        this.renderPhotos();
        this.updateFilterOptions();
    },

    setupPhotoInput() {
        const input = document.getElementById('photoInput');
        input.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            for (const file of files) {
                await this.importPhoto(file);
            }
            this.renderPhotos();
            this.updateFilterOptions();
            showToast(`成功导入 ${files.length} 张照片`);
            input.value = '';
        });
    },

    async importPhoto(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const photo = {
                    id: Storage.generateId(),
                    dataUrl: e.target.result,
                    filename: file.name,
                    importedAt: new Date().toISOString(),
                    rating: 0,
                    tags: [],
                    noteIds: [],
                    exif: {}
                };

                try {
                    const exifData = await exifr.parse(file, [
                        'DateTimeOriginal', 'Make', 'Model', 'LensModel',
                        'FNumber', 'ExposureTime', 'ISO', 'FocalLength'
                    ]);
                    
                    if (exifData) {
                        photo.exif = {
                            dateTime: exifData.DateTimeOriginal ? exifData.DateTimeOriginal.toISOString() : null,
                            make: exifData.Make || null,
                            model: exifData.Model || null,
                            lens: exifData.LensModel || null,
                            aperture: exifData.FNumber || null,
                            shutterSpeed: exifData.ExposureTime || null,
                            iso: exifData.ISO || null,
                            focalLength: exifData.FocalLength || null
                        };
                    }
                } catch (err) {
                    console.warn('EXIF解析失败:', err);
                }

                if (!photo.exif.dateTime) {
                    photo.exif.dateTime = new Date(file.lastModified).toISOString();
                }

                Storage.savePhoto(photo);
                resolve(photo);
            };
            reader.readAsDataURL(file);
        });
    },

    getFilteredPhotos() {
        const photos = Storage.getPhotos();
        const tagFilter = document.getElementById('filterTag').value;
        const ratingFilter = document.getElementById('filterRating').value;
        const sortBy = document.getElementById('sortBy').value;

        let filtered = photos.filter(p => {
            if (tagFilter && !p.tags.includes(tagFilter)) return false;
            if (ratingFilter && p.rating !== parseInt(ratingFilter)) return false;
            return true;
        });

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.exif?.dateTime || 0) - new Date(a.exif?.dateTime || 0);
                case 'date-asc':
                    return new Date(a.exif?.dateTime || 0) - new Date(b.exif?.dateTime || 0);
                case 'rating-desc':
                    return b.rating - a.rating;
                case 'rating-asc':
                    return a.rating - b.rating;
                default:
                    return 0;
            }
        });

        return filtered;
    },

    renderPhotos() {
        const grid = document.getElementById('photoGrid');
        const emptyState = document.getElementById('emptyState');
        const photos = this.getFilteredPhotos();

        document.getElementById('photoCount').textContent = photos.length;

        if (photos.length === 0) {
            grid.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        grid.innerHTML = photos.map(photo => this.createPhotoCard(photo)).join('');
    },

    createPhotoCard(photo) {
        const stars = this.renderStars(photo.rating);
        const tags = this.getPhotoTags(photo);
        const date = photo.exif?.dateTime ? new Date(photo.exif.dateTime).toLocaleDateString('zh-CN') : '未知日期';

        return `
            <div class="photo-card bg-gray-800" onclick="PhotoManager.openPhotoModal('${photo.id}')">
                <img src="${photo.dataUrl}" alt="${photo.filename}">
                ${photo.rating > 0 ? `<div class="rating">${stars}</div>` : ''}
                <div class="overlay">
                    <div class="text-sm text-gray-300 mb-1">${date}</div>
                    ${tags.length > 0 ? `<div class="tags">${tags.map(t => `<span class="tag-badge ${t.type}">${t.name}</span>`).join('')}</div>` : ''}
                </div>
            </div>
        `;
    },

    getPhotoTags(photo) {
        if (!photo.tags || photo.tags.length === 0) return [];
        const allTags = Storage.getTags();
        return photo.tags.map(tagId => allTags.find(t => t.id === tagId)).filter(Boolean);
    },

    renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? '★' : '☆';
        }
        return stars;
    },

    openPhotoModal(photoId) {
        this.currentPhotoId = photoId;
        const photo = Storage.getPhotos().find(p => p.id === photoId);
        if (!photo) return;

        document.getElementById('modalImage').src = photo.dataUrl;
        document.getElementById('modalTitle').textContent = photo.filename;

        this.renderModalRating(photo.rating);
        this.renderModalTags(photo);
        this.renderModalNotes(photo);
        this.renderModalExif(photo.exif);

        document.getElementById('photoModal').classList.remove('hidden');
    },

    renderModalRating(rating) {
        const container = document.getElementById('modalRating');
        container.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'cursor-pointer transition-colors';
            star.textContent = i <= rating ? '★' : '☆';
            star.style.color = i <= rating ? '#fbbf24' : '#6b7280';
            star.onclick = () => this.setRating(i);
            container.appendChild(star);
        }
    },

    setRating(rating) {
        if (!this.currentPhotoId) return;
        Storage.updatePhoto(this.currentPhotoId, { rating });
        const photo = Storage.getPhotos().find(p => p.id === this.currentPhotoId);
        this.renderModalRating(rating);
        this.renderPhotos();
    },

    renderModalTags(photo) {
        const container = document.getElementById('modalTags');
        const select = document.getElementById('modalTagSelect');
        const allTags = Storage.getTags();
        const photoTags = this.getPhotoTags(photo);

        container.innerHTML = photoTags.map(tag => `
            <span class="tag-badge ${tag.type}">
                ${tag.name}
                <button onclick="PhotoManager.removeTagFromPhoto('${tag.id}')" class="ml-1 text-gray-400 hover:text-white">&times;</button>
            </span>
        `).join('');

        const availableTags = allTags.filter(t => !photo.tags.includes(t.id));
        select.innerHTML = '<option value="">选择标签...</option>' +
            availableTags.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    },

    addTagToPhoto() {
        const select = document.getElementById('modalTagSelect');
        const tagId = select.value;
        if (!tagId || !this.currentPhotoId) return;

        const photo = Storage.getPhotos().find(p => p.id === this.currentPhotoId);
        if (!photo.tags) photo.tags = [];
        photo.tags.push(tagId);
        Storage.updatePhoto(this.currentPhotoId, { tags: photo.tags });

        this.renderModalTags(photo);
        this.renderPhotos();
    },

    removeTagFromPhoto(tagId) {
        if (!this.currentPhotoId) return;

        const photo = Storage.getPhotos().find(p => p.id === this.currentPhotoId);
        photo.tags = photo.tags.filter(t => t !== tagId);
        Storage.updatePhoto(this.currentPhotoId, { tags: photo.tags });

        this.renderModalTags(photo);
        this.renderPhotos();
    },

    renderModalNotes(photo) {
        const container = document.getElementById('modalNotes');
        const select = document.getElementById('modalNoteSelect');
        const allNotes = Storage.getNotes();
        const photoNotes = (photo.noteIds || []).map(nid => allNotes.find(n => n.id === nid)).filter(Boolean);

        container.innerHTML = photoNotes.map(note => `
            <span class="tag-badge theme">
                📝 ${note.title}
                <button onclick="PhotoManager.removeNoteFromPhoto('${note.id}')" class="ml-1 text-gray-400 hover:text-white">&times;</button>
            </span>
        `).join('');

        const availableNotes = allNotes.filter(n => !photo.noteIds?.includes(n.id));
        select.innerHTML = '<option value="">选择笔记...</option>' +
            availableNotes.map(n => `<option value="${n.id}">${n.title}</option>`).join('');
    },

    addNoteToPhoto() {
        const select = document.getElementById('modalNoteSelect');
        const noteId = select.value;
        if (!noteId || !this.currentPhotoId) return;

        const photo = Storage.getPhotos().find(p => p.id === this.currentPhotoId);
        if (!photo.noteIds) photo.noteIds = [];
        photo.noteIds.push(noteId);
        Storage.updatePhoto(this.currentPhotoId, { noteIds: photo.noteIds });

        this.renderModalNotes(photo);
    },

    removeNoteFromPhoto(noteId) {
        if (!this.currentPhotoId) return;

        const photo = Storage.getPhotos().find(p => p.id === this.currentPhotoId);
        photo.noteIds = (photo.noteIds || []).filter(n => n !== noteId);
        Storage.updatePhoto(this.currentPhotoId, { noteIds: photo.noteIds });

        this.renderModalNotes(photo);
    },

    renderModalExif(exif) {
        const container = document.getElementById('modalExif');
        if (!exif || Object.keys(exif).length === 0) {
            container.innerHTML = '<p class="text-gray-500">无EXIF数据</p>';
            return;
        }

        const fields = [
            { key: 'dateTime', label: '拍摄时间', format: v => v ? new Date(v).toLocaleString('zh-CN') : '未知' },
            { key: 'make', label: '相机厂商' },
            { key: 'model', label: '相机型号' },
            { key: 'lens', label: '镜头' },
            { key: 'aperture', label: '光圈', format: v => v ? `f/${v}` : null },
            { key: 'shutterSpeed', label: '快门速度', format: v => v ? `${v}s` : null },
            { key: 'iso', label: 'ISO', format: v => v ? `ISO ${v}` : null },
            { key: 'focalLength', label: '焦距', format: v => v ? `${v}mm` : null }
        ];

        container.innerHTML = fields.map(field => {
            const value = exif[field.key];
            const displayValue = field.format ? field.format(value) : value;
            if (!displayValue) return '';
            return `<div><span class="text-gray-500">${field.label}:</span> ${displayValue}</div>`;
        }).join('');
    },

    deletePhoto() {
        if (!this.currentPhotoId) return;
        if (!confirm('确定要删除这张照片吗？')) return;

        Storage.deletePhoto(this.currentPhotoId);
        this.closePhotoModal();
        this.renderPhotos();
        showToast('照片已删除');
    },

    closePhotoModal() {
        document.getElementById('photoModal').classList.add('hidden');
        this.currentPhotoId = null;
    },

    updateFilterOptions() {
        const select = document.getElementById('filterTag');
        const tags = Storage.getTags();
        select.innerHTML = '<option value="">全部标签</option>' +
            tags.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    },

    filterPhotos() {
        this.renderPhotos();
    }
};
