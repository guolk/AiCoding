const Storage = {
    KEYS: {
        PHOTOS: 'photo_app_photos',
        TAGS: 'photo_app_tags',
        NOTES: 'photo_app_notes',
        PLANS: 'photo_app_plans',
        SKILLS: 'photo_app_skills',
        CAMERAS: 'photo_app_cameras',
        LENSES: 'photo_app_lenses'
    },

    init() {
        if (!localStorage.getItem(this.KEYS.TAGS)) {
            const defaultTags = [
                { id: this.generateId(), name: '人像', type: 'theme' },
                { id: this.generateId(), name: '风光', type: 'theme' },
                { id: this.generateId(), name: '街头', type: 'theme' },
                { id: this.generateId(), name: '静物', type: 'theme' },
                { id: this.generateId(), name: '建筑', type: 'theme' },
                { id: this.generateId(), name: '纪实', type: 'theme' },
                { id: this.generateId(), name: '黑白', type: 'style' },
                { id: this.generateId(), name: '日系', type: 'style' },
                { id: this.generateId(), name: '胶片', type: 'style' },
                { id: this.generateId(), name: '高对比', type: 'style' },
                { id: this.generateId(), name: '低饱和', type: 'style' },
                { id: this.generateId(), name: 'HDR', type: 'style' }
            ];
            localStorage.setItem(this.KEYS.TAGS, JSON.stringify(defaultTags));
        }

        if (!localStorage.getItem(this.KEYS.SKILLS)) {
            const defaultSkills = {
                对焦: 50,
                曝光: 50,
                构图: 50,
                用光: 50,
                后期: 50
            };
            localStorage.setItem(this.KEYS.SKILLS, JSON.stringify(defaultSkills));
        }

        ['PHOTOS', 'NOTES', 'PLANS', 'CAMERAS', 'LENSES'].forEach(key => {
            if (!localStorage.getItem(this.KEYS[key])) {
                localStorage.setItem(this.KEYS[key], '[]');
            }
        });
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    get(key) {
        const data = localStorage.getItem(this.KEYS[key]);
        return data ? JSON.parse(data) : null;
    },

    set(key, data) {
        localStorage.setItem(this.KEYS[key], JSON.stringify(data));
    },

    getPhotos() {
        return this.get('PHOTOS') || [];
    },

    savePhoto(photo) {
        const photos = this.getPhotos();
        photos.push(photo);
        this.set('PHOTOS', photos);
    },

    updatePhoto(photoId, updates) {
        const photos = this.getPhotos();
        const index = photos.findIndex(p => p.id === photoId);
        if (index !== -1) {
            photos[index] = { ...photos[index], ...updates };
            this.set('PHOTOS', photos);
            return photos[index];
        }
        return null;
    },

    deletePhoto(photoId) {
        const photos = this.getPhotos();
        const filtered = photos.filter(p => p.id !== photoId);
        this.set('PHOTOS', filtered);
    },

    getTags() {
        return this.get('TAGS') || [];
    },

    saveTag(tag) {
        const tags = this.getTags();
        tags.push(tag);
        this.set('TAGS', tags);
    },

    deleteTag(tagId) {
        const tags = this.getTags();
        this.set('TAGS', tags.filter(t => t.id !== tagId));
        
        const photos = this.getPhotos();
        photos.forEach(photo => {
            if (photo.tags) {
                photo.tags = photo.tags.filter(t => t !== tagId);
            }
        });
        this.set('PHOTOS', photos);
    },

    getNotes() {
        return this.get('NOTES') || [];
    },

    saveNote(note) {
        const notes = this.getNotes();
        if (note.id) {
            const index = notes.findIndex(n => n.id === note.id);
            if (index !== -1) {
                notes[index] = note;
            } else {
                notes.push(note);
            }
        } else {
            note.id = this.generateId();
            note.createdAt = new Date().toISOString();
            notes.push(note);
        }
        this.set('NOTES', notes);
    },

    deleteNote(noteId) {
        const notes = this.getNotes();
        this.set('NOTES', notes.filter(n => n.id !== noteId));
        
        const photos = this.getPhotos();
        photos.forEach(photo => {
            if (photo.noteIds) {
                photo.noteIds = photo.noteIds.filter(n => n !== noteId);
            }
        });
        this.set('PHOTOS', photos);
    },

    getPlans() {
        return this.get('PLANS') || [];
    },

    savePlan(plan) {
        const plans = this.getPlans();
        if (plan.id) {
            const index = plans.findIndex(p => p.id === plan.id);
            if (index !== -1) {
                plans[index] = plan;
            } else {
                plans.push(plan);
            }
        } else {
            plan.id = this.generateId();
            plan.createdAt = new Date().toISOString();
            plans.push(plan);
        }
        this.set('PLANS', plans);
    },

    deletePlan(planId) {
        const plans = this.getPlans();
        this.set('PLANS', plans.filter(p => p.id !== planId));
    },

    getSkills() {
        return this.get('SKILLS') || { 对焦: 50, 曝光: 50, 构图: 50, 用光: 50, 后期: 50 };
    },

    saveSkills(skills) {
        this.set('SKILLS', skills);
    },

    getCameras() {
        return this.get('CAMERAS') || [];
    },

    saveCamera(camera) {
        const cameras = this.getCameras();
        if (camera.id) {
            const index = cameras.findIndex(c => c.id === camera.id);
            if (index !== -1) {
                cameras[index] = camera;
            } else {
                cameras.push(camera);
            }
        } else {
            camera.id = this.generateId();
            cameras.push(camera);
        }
        this.set('CAMERAS', cameras);
    },

    deleteCamera(cameraId) {
        const cameras = this.getCameras();
        this.set('CAMERAS', cameras.filter(c => c.id !== cameraId));
    },

    getLenses() {
        return this.get('LENSES') || [];
    },

    saveLens(lens) {
        const lenses = this.getLenses();
        if (lens.id) {
            const index = lenses.findIndex(l => l.id === lens.id);
            if (index !== -1) {
                lenses[index] = lens;
            } else {
                lenses.push(lens);
            }
        } else {
            lens.id = this.generateId();
            lenses.push(lens);
        }
        this.set('LENSES', lenses);
    },

    deleteLens(lensId) {
        const lenses = this.getLenses();
        this.set('LENSES', lenses.filter(l => l.id !== lensId));
    }
};
