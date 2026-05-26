let currentTab = 'photos';

function switchTab(tab) {
    currentTab = tab;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`tab-${tab}`).classList.remove('hidden');

    switch (tab) {
        case 'photos':
            PhotoManager.renderPhotos();
            PhotoManager.updateFilterOptions();
            break;
        case 'analysis':
            Analysis.refresh();
            break;
        case 'learning':
            Learning.renderNotes();
            Learning.renderPlans();
            break;
        case 'progress':
            Progress.refresh();
            break;
        case 'equipment':
            Equipment.refresh();
            break;
    }
}

function openTagManager() {
    renderTagManager();
    document.getElementById('tagModal').classList.remove('hidden');
}

function closeTagManager() {
    document.getElementById('tagModal').classList.add('hidden');
}

function renderTagManager() {
    const tags = Storage.getTags();
    const themeTags = tags.filter(t => t.type === 'theme');
    const styleTags = tags.filter(t => t.type === 'style');

    document.getElementById('themeTags').innerHTML = themeTags.map(tag => `
        <span class="tag-badge ${tag.type}">
            ${tag.name}
            <button onclick="deleteTag('${tag.id}')" class="ml-1 text-gray-400 hover:text-white">&times;</button>
        </span>
    `).join('') || '<span class="text-gray-500 text-sm">暂无主题标签</span>';

    document.getElementById('styleTags').innerHTML = styleTags.map(tag => `
        <span class="tag-badge ${tag.type}">
            ${tag.name}
            <button onclick="deleteTag('${tag.id}')" class="ml-1 text-gray-400 hover:text-white">&times;</button>
        </span>
    `).join('') || '<span class="text-gray-500 text-sm">暂无风格标签</span>';
}

function addNewTag() {
    const name = document.getElementById('newTagName').value.trim();
    const type = document.getElementById('newTagType').value;

    if (!name) {
        showToast('请输入标签名称');
        return;
    }

    const tag = {
        id: Storage.generateId(),
        name,
        type
    };

    Storage.saveTag(tag);
    document.getElementById('newTagName').value = '';
    renderTagManager();
    PhotoManager.updateFilterOptions();
    showToast('标签已添加');
}

function deleteTag(tagId) {
    if (!confirm('确定要删除这个标签吗？')) return;
    Storage.deleteTag(tagId);
    renderTagManager();
    PhotoManager.updateFilterOptions();
    PhotoManager.renderPhotos();
    showToast('标签已删除');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('toast-show');

    setTimeout(() => {
        toast.classList.remove('toast-show');
    }, 3000);
}

function openNoteEditor(noteId) {
    Learning.openNoteEditor(noteId);
}

function openPlanEditor(planId) {
    Learning.openPlanEditor(planId);
}

function openSkillEditor() {
    Progress.openSkillEditor();
}

function openCameraEditor(cameraId) {
    Equipment.openCameraEditor(cameraId);
}

function openLensEditor(lensId) {
    Equipment.openLensEditor(lensId);
}

function closePhotoModal() {
    PhotoManager.closePhotoModal();
}

function closeNoteEditor() {
    Learning.closeNoteEditor();
}

function closePlanEditor() {
    Learning.closePlanEditor();
}

function closeSkillEditor() {
    Progress.closeSkillEditor();
}

function closeEquipmentEditor() {
    Equipment.closeEquipmentEditor();
}

function filterPhotos() {
    PhotoManager.filterPhotos();
}

function filterNotes(category) {
    Learning.filterNotes(category);
}

function addTagToPhoto() {
    PhotoManager.addTagToPhoto();
}

function addNoteToPhoto() {
    PhotoManager.addNoteToPhoto();
}

function deletePhoto() {
    PhotoManager.deletePhoto();
}

function saveNote() {
    Learning.saveNote();
}

function savePlan() {
    Learning.savePlan();
}

function saveSkills() {
    Progress.saveSkills();
}

function saveEquipment() {
    Equipment.saveEquipment();
}

function updateMonthlyCompare() {
    Progress.updateMonthlyCompare();
}

document.addEventListener('DOMContentLoaded', () => {
    Storage.init();

    const loaded = MockData.loadMockData();
    if (loaded) {
        showToast('已加载模拟数据用于演示');
    }

    PhotoManager.init();
    Analysis.init();
    Learning.init();
    Progress.init();
    Equipment.init();

    switchTab('photos');
});
