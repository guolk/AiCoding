const Learning = {
    editingNoteId: null,
    editingPlanId: null,
    currentNoteFilter: 'all',

    init() {
        this.renderNotes();
        this.renderPlans();
    },

    openNoteEditor(noteId = null) {
        this.editingNoteId = noteId;
        document.getElementById('noteModalTitle').textContent = noteId ? '编辑笔记' : '新建笔记';

        if (noteId) {
            const note = Storage.getNotes().find(n => n.id === noteId);
            if (note) {
                document.getElementById('noteTitle').value = note.title || '';
                document.getElementById('noteCategory').value = note.category || '对焦';
                document.getElementById('noteLevel').value = note.level || '入门';
                document.getElementById('noteKeyPoints').value = (note.keyPoints || []).join('\n');
                document.getElementById('noteContent').value = note.content || '';
            }
        } else {
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteCategory').value = '对焦';
            document.getElementById('noteLevel').value = '入门';
            document.getElementById('noteKeyPoints').value = '';
            document.getElementById('noteContent').value = '';
        }

        document.getElementById('noteModal').classList.remove('hidden');
    },

    closeNoteEditor() {
        document.getElementById('noteModal').classList.add('hidden');
        this.editingNoteId = null;
    },

    saveNote() {
        const title = document.getElementById('noteTitle').value.trim();
        if (!title) {
            showToast('请输入笔记标题');
            return;
        }

        const note = {
            id: this.editingNoteId,
            title,
            category: document.getElementById('noteCategory').value,
            level: document.getElementById('noteLevel').value,
            keyPoints: document.getElementById('noteKeyPoints').value.split('\n').filter(p => p.trim()),
            content: document.getElementById('noteContent').value
        };

        Storage.saveNote(note);
        this.closeNoteEditor();
        this.renderNotes();
        showToast('笔记已保存');
    },

    deleteNote(noteId) {
        if (!confirm('确定要删除这条笔记吗？')) return;
        Storage.deleteNote(noteId);
        this.renderNotes();
        showToast('笔记已删除');
    },

    filterNotes(category) {
        this.currentNoteFilter = category;
        
        document.querySelectorAll('.note-filter-btn').forEach(btn => {
            if (btn.dataset.filter === category) {
                btn.classList.remove('bg-gray-700');
                btn.classList.add('bg-blue-600');
            } else {
                btn.classList.remove('bg-blue-600');
                btn.classList.add('bg-gray-700');
            }
        });

        this.renderNotes();
    },

    renderNotes() {
        const grid = document.getElementById('notesGrid');
        let notes = Storage.getNotes();

        if (this.currentNoteFilter !== 'all') {
            notes = notes.filter(n => n.category === this.currentNoteFilter);
        }

        if (notes.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="text-4xl mb-2">📝</div>
                    <p class="text-gray-400">还没有学习笔记</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = notes.map(note => this.createNoteCard(note)).join('');
    },

    createNoteCard(note) {
        const keyPoints = (note.keyPoints || []).slice(0, 3).map(p => `<li class="text-sm text-gray-400">${p}</li>`).join('');

        return `
            <div class="note-card">
                <div class="flex justify-between items-start mb-2">
                    <span class="category ${note.category}">${note.category}</span>
                    <span class="text-xs text-gray-500">${note.level}</span>
                </div>
                <h4 class="font-semibold mb-2">${note.title}</h4>
                ${keyPoints ? `<ul class="list-disc list-inside mb-2">${keyPoints}</ul>` : ''}
                ${note.content ? `<p class="text-sm text-gray-400 line-clamp-2">${note.content.substring(0, 100)}...</p>` : ''}
                <div class="flex justify-end space-x-2 mt-3">
                    <button onclick="Learning.openNoteEditor('${note.id}')" class="text-blue-400 hover:text-blue-300 text-sm">编辑</button>
                    <button onclick="Learning.deleteNote('${note.id}')" class="text-red-400 hover:text-red-300 text-sm">删除</button>
                </div>
            </div>
        `;
    },

    openPlanEditor(planId = null) {
        this.editingPlanId = planId;
        document.getElementById('planModalTitle').textContent = planId ? '编辑计划' : '新建拍摄计划';

        if (planId) {
            const plan = Storage.getPlans().find(p => p.id === planId);
            if (plan) {
                document.getElementById('planTitle').value = plan.title || '';
                document.getElementById('planDate').value = plan.date || '';
                document.getElementById('planStatus').value = plan.status || 'planned';
                document.getElementById('planSkill').value = plan.skill || '';
                document.getElementById('planLocation').value = plan.location || '';
                document.getElementById('planNotes').value = plan.notes || '';
            }
        } else {
            document.getElementById('planTitle').value = '';
            document.getElementById('planDate').value = '';
            document.getElementById('planStatus').value = 'planned';
            document.getElementById('planSkill').value = '';
            document.getElementById('planLocation').value = '';
            document.getElementById('planNotes').value = '';
        }

        document.getElementById('planModal').classList.remove('hidden');
    },

    closePlanEditor() {
        document.getElementById('planModal').classList.add('hidden');
        this.editingPlanId = null;
    },

    savePlan() {
        const title = document.getElementById('planTitle').value.trim();
        if (!title) {
            showToast('请输入计划标题');
            return;
        }

        const plan = {
            id: this.editingPlanId,
            title,
            date: document.getElementById('planDate').value,
            status: document.getElementById('planStatus').value,
            skill: document.getElementById('planSkill').value,
            location: document.getElementById('planLocation').value,
            notes: document.getElementById('planNotes').value
        };

        Storage.savePlan(plan);
        this.closePlanEditor();
        this.renderPlans();
        showToast('计划已保存');
    },

    deletePlan(planId) {
        if (!confirm('确定要删除这个计划吗？')) return;
        Storage.deletePlan(planId);
        this.renderPlans();
        showToast('计划已删除');
    },

    renderPlans() {
        const container = document.getElementById('plansList');
        let plans = Storage.getPlans();

        plans.sort((a, b) => {
            const dateA = a.date || '9999-12-31';
            const dateB = b.date || '9999-12-31';
            return dateA.localeCompare(dateB);
        });

        if (plans.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-4xl mb-2">📋</div>
                    <p class="text-gray-400">还没有拍摄计划</p>
                </div>
            `;
            return;
        }

        const statusLabels = {
            planned: '计划中',
            completed: '已完成',
            cancelled: '已取消'
        };

        const statusColors = {
            planned: 'bg-blue-500',
            completed: 'bg-green-500',
            cancelled: 'bg-gray-500'
        };

        container.innerHTML = plans.map(plan => `
            <div class="plan-card ${plan.status}">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-semibold mb-1">${plan.title}</h4>
                        <div class="flex items-center space-x-4 text-sm text-gray-400">
                            ${plan.date ? `<span>📅 ${plan.date}</span>` : ''}
                            ${plan.skill ? `<span>🎯 ${plan.skill}</span>` : ''}
                            ${plan.location ? `<span>📍 ${plan.location}</span>` : ''}
                        </div>
                        ${plan.notes ? `<p class="text-sm text-gray-500 mt-2">${plan.notes}</p>` : ''}
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs px-2 py-1 rounded ${statusColors[plan.status]}">${statusLabels[plan.status]}</span>
                        <button onclick="Learning.openPlanEditor('${plan.id}')" class="text-blue-400 hover:text-blue-300 text-sm">编辑</button>
                        <button onclick="Learning.deletePlan('${plan.id}')" class="text-red-400 hover:text-red-300 text-sm">删除</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
};
