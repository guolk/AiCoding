// ============================================================
//  家庭维修与房屋管理工具 - 主逻辑
//  数据持久化：LocalStorage
//  数据结构：house, valuations, floorplan, repairs, maintenances,
//            appliances, bills, budgets, activities
// ============================================================

'use strict';

// ---------- 工具函数 ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function fmtMoney(n) {
  if (n == null || isNaN(n)) return '—';
  return '¥' + Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d) {
  if (!d) return '—';
  const t = new Date(d);
  return t.toLocaleDateString('zh-CN');
}

function showToast(msg, type = 'info') {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  t.style.background = type === 'error' ? 'var(--danger)' : 'var(--primary)';
  setTimeout(() => t.classList.add('hidden'), 2000);
}

// ---------- 数据层 ----------
const STORAGE_KEY = 'home_manager_data_v1';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('加载数据失败', e);
  }
  return {
    house: null,
    valuations: [],
    floorplan: { image: null, annotations: [] },
    repairs: [],
    maintenances: [],
    appliances: [],
    bills: [],
    budgets: [],
    activities: []
  };
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
  } catch (e) {
    console.error('保存失败', e);
    showToast('保存失败: ' + e.message, 'error');
  }
}

function addActivity(text) {
  DB.activities.unshift({ id: uid(), text, time: new Date().toISOString() });
  if (DB.activities.length > 50) DB.activities = DB.activities.slice(0, 50);
  saveData();
}

let DB = loadData();

// ---------- 模态框 ----------
function openModal(html) {
  const body = $('#modal-body');
  const modal = $('#modal');
  if (!body || !modal) {
    console.error('openModal: 找不到模态框元素');
    showToast('界面初始化失败，请刷新页面', 'error');
    return;
  }
  body.innerHTML = html;
  modal.classList.remove('hidden');
}
function closeModal() {
  const modal = $('#modal');
  if (modal) modal.classList.add('hidden');
  const body = $('#modal-body');
  if (body) body.innerHTML = '';
}
$('.modal-close').addEventListener('click', closeModal);
$('#modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});

// ---------- 全局错误捕获 ----------
window.addEventListener('error', (e) => {
  console.error('全局错误:', e.error || e.message);
  showToast('发生错误: ' + (e.message || '未知错误'), 'error');
});

// ---------- 导航 ----------
$$('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    $$('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    $(`#tab-${tab}`).classList.add('active');
    if (tab === 'dashboard') renderDashboard();
    if (tab === 'house') renderHouse();
    if (tab === 'repair') renderRepairs();
    if (tab === 'maintenance') renderMaintenances();
    if (tab === 'appliance') renderAppliances();
    if (tab === 'cost') renderCost();
  });
});

// ============================================================
//  1. 房屋档案
// ============================================================
function renderHouse() {
  if (DB.house) {
    const f = $('#house-form');
    Object.entries(DB.house).forEach(([k, v]) => {
      const el = f.elements[k];
      if (el) el.value = v ?? '';
    });
  }
  renderValuations();
  renderFloorplan();
}

$('#house-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  DB.house = Object.fromEntries(fd.entries());
  saveData();
  addActivity('更新了房屋基本信息');
  showToast('已保存房屋基本信息');
});

function renderValuations() {
  const tbody = $('#valuation-table tbody');
  if (!DB.valuations.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">暂无估值记录</td></tr>';
    return;
  }
  const sorted = [...DB.valuations].sort((a, b) => new Date(b.date) - new Date(a.date));
  tbody.innerHTML = sorted.map((v, i, arr) => {
    const prev = arr[i + 1];
    let diffCell = '—';
    if (prev) {
      const diff = v.value - prev.value;
      const pct = prev.value ? ((diff / prev.value) * 100).toFixed(1) : '0';
      diffCell = `<span style="color:${diff >= 0 ? 'var(--success)' : 'var(--danger)'}">${diff >= 0 ? '+' : ''}${fmtMoney(diff)} (${diff >= 0 ? '+' : ''}${pct}%)</span>`;
    }
    return `<tr>
      <td>${fmtDate(v.date)}</td>
      <td>${fmtMoney(v.value)}</td>
      <td>${diffCell}</td>
      <td>${v.note || ''}</td>
      <td><button class="btn-danger" data-del-valuation="${v.id}">删除</button></td>
    </tr>`;
  }).join('');
  tbody.querySelectorAll('[data-del-valuation]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('确认删除该估值记录？')) return;
      DB.valuations = DB.valuations.filter(x => x.id !== btn.dataset.delValuation);
      saveData();
      renderValuations();
    });
  });
}

$('#valuation-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const entry = {
    id: uid(),
    date: fd.get('date'),
    value: Number(fd.get('value')),
    note: fd.get('note')
  };
  DB.valuations.push(entry);
  saveData();
  addActivity('新增了房屋估值记录');
  e.target.reset();
  renderValuations();
  showToast('已添加估值记录');
});

// ---------- 平面图 ----------
const ANNOTATE_COLORS = {
  water: '#3498db',
  electric: '#f1c40f',
  gas: '#e74c3c',
  wall: '#2c3e50'
};
let annotateMode = null;

function renderFloorplan() {
  const canvas = $('#floorplan-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (DB.floorplan.image) {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawAnnotations(ctx);
    };
    img.src = DB.floorplan.image;
  } else {
    ctx.fillStyle = '#f7f9fb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#95a5a6';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('请上传房屋平面图', canvas.width / 2, canvas.height / 2);
    drawAnnotations(ctx);
  }
}

function drawAnnotations(ctx) {
  DB.floorplan.annotations.forEach(a => {
    ctx.strokeStyle = ANNOTATE_COLORS[a.type];
    ctx.lineWidth = a.type === 'wall' ? 8 : 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x1, a.y1);
    ctx.lineTo(a.x2, a.y2);
    ctx.stroke();
  });
}

$('#floorplan-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    DB.floorplan.image = ev.target.result;
    saveData();
    renderFloorplan();
    showToast('平面图已上传');
  };
  reader.readAsDataURL(file);
});

$$('[data-annotate]').forEach(btn => {
  btn.addEventListener('click', () => {
    annotateMode = btn.dataset.annotate;
    $$('[data-annotate]').forEach(b => b.style.outline = '');
    btn.style.outline = '2px solid var(--accent)';
  });
});
$('#btn-annotate-none').addEventListener('click', () => {
  annotateMode = null;
  $$('[data-annotate]').forEach(b => b.style.outline = '');
});
$('#btn-clear-annotations').addEventListener('click', () => {
  if (!confirm('确认清除所有标注？')) return;
  DB.floorplan.annotations = [];
  saveData();
  renderFloorplan();
});

(function initFloorplanCanvas() {
  const canvas = $('#floorplan-canvas');
  let drawing = false, startX = 0, startY = 0;

  canvas.addEventListener('mousedown', (e) => {
    if (!annotateMode) return;
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = (e.clientX - rect.left) * (canvas.width / rect.width);
    startY = (e.clientY - rect.top) * (canvas.height / rect.height);
  });
  canvas.addEventListener('mouseup', (e) => {
    if (!drawing || !annotateMode) return;
    drawing = false;
    const rect = canvas.getBoundingClientRect();
    const x2 = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y2 = (e.clientY - rect.top) * (canvas.height / rect.height);
    DB.floorplan.annotations.push({
      id: uid(), type: annotateMode, x1: startX, y1: startY, x2, y2
    });
    saveData();
    renderFloorplan();
  });
})();

// ============================================================
//  2. 维修记录
// ============================================================
function renderRepairs() {
  const list = $('#repair-list');
  if (!DB.repairs.length) {
    list.innerHTML = '<div class="empty-state">暂无维修记录，点击右上角按钮新增</div>';
    return;
  }
  const sorted = [...DB.repairs].sort((a, b) => new Date(b.date) - new Date(a.date));
  list.innerHTML = sorted.map(r => {
    const photos = (r.photos || []).slice(0, 4).map(p =>
      `<img src="${p}" alt="photo" />`
    ).join('');
    const reviewStars = r.review?.rating
      ? '<span class="stars" style="cursor:default">' +
        Array.from({ length: 5 }, (_, i) =>
          `<span class="star ${i < r.review.rating ? 'active' : ''}">★</span>`
        ).join('') + '</span>'
      : '<span style="color:var(--muted);font-size:13px">未评价</span>';
    return `<div class="record-item">
      <h4>${r.title}</h4>
      <div class="meta">
        <span>📅 ${fmtDate(r.date)}</span>
        <span style="margin-left:12px">👷 ${r.worker || '—'}</span>
        <span style="margin-left:12px">💰 ${fmtMoney(r.cost)}</span>
        <span style="margin-left:12px" class="tag ${r.category ? '' : ''}">${r.category || '维修'}</span>
      </div>
      <div class="content">${r.description || ''}</div>
      ${r.contract || r.invoice ? `<div class="file-list">
        ${r.contract ? `<div class="file-item">📄 合同: ${r.contract.name}</div>` : ''}
        ${r.invoice ? `<div class="file-item">🧾 发票: ${r.invoice.name}</div>` : ''}
      </div>` : ''}
      <div style="margin-top:8px">维修效果回访： ${reviewStars}
        ${r.review?.comment ? `<div style="font-size:13px;color:var(--muted);margin-top:4px">"${r.review.comment}"</div>` : ''}
      </div>
      <div class="photos">${photos}</div>
      <div class="actions" style="margin-top:10px">
        <button class="btn-secondary" data-view-repair="${r.id}">查看</button>
        <button class="btn-secondary" data-review-repair="${r.id}">回访评价</button>
        <button class="btn-secondary" data-edit-repair="${r.id}">编辑</button>
        <button class="btn-danger" data-del-repair="${r.id}">删除</button>
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('[data-del-repair]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('确认删除该维修记录？')) return;
      DB.repairs = DB.repairs.filter(x => x.id !== btn.dataset.delRepair);
      saveData();
      renderRepairs();
    });
  });
  list.querySelectorAll('[data-edit-repair]').forEach(btn => btn.addEventListener('click', () => editRepair(btn.dataset.editRepair)));
  list.querySelectorAll('[data-view-repair]').forEach(btn => btn.addEventListener('click', () => viewRepair(btn.dataset.viewRepair)));
  list.querySelectorAll('[data-review-repair]').forEach(btn => btn.addEventListener('click', () => reviewRepair(btn.dataset.reviewRepair)));
}

function repairFormHTML(repair = {}) {
  return `<h3>${repair.id ? '编辑' : '新增'}维修记录</h3>
    <form id="repair-modal-form">
      <label>维修项目 <input type="text" name="title" required value="${repair.title || ''}" /></label>
      <div class="form-row">
        <label>维修日期 <input type="date" name="date" required value="${repair.date || ''}" /></label>
        <label>负责工人 <input type="text" name="worker" value="${repair.worker || ''}" /></label>
      </div>
      <div class="form-row">
        <label>费用 <input type="number" step="0.01" name="cost" value="${repair.cost || ''}" /></label>
        <label>分类
          <select name="category">
            ${['维修','水电','门窗','墙体','厨卫','其他'].map(c =>
              `<option ${repair.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </label>
      </div>
      <label>维修内容 <textarea name="description">${repair.description || ''}</textarea></label>
      <label>现场照片 (可多选)
        <input type="file" name="photos" accept="image/*" multiple />
      </label>
      ${repair.photos?.length ? `<div class="photo-preview">${repair.photos.map(p => `<img src="${p}" />`).join('')}</div>` : ''}
      <label>维修合同 <input type="file" name="contract" /></label>
      ${repair.contract ? `<div class="file-item">当前: ${repair.contract.name}</div>` : ''}
      <label>维修发票 <input type="file" name="invoice" /></label>
      ${repair.invoice ? `<div class="file-item">当前: ${repair.invoice.name}</div>` : ''}
      <div class="form-actions">
        <button type="button" class="btn-secondary" data-close-modal>取消</button>
        <button type="submit" class="btn-primary">保存</button>
      </div>
    </form>`;
}

function editRepair(id) {
  try {
    const repair = DB.repairs.find(x => x.id === id) || {};
    if (id) repair.id = id;
    openModal(repairFormHTML(repair));
    const form = $('#repair-modal-form');
    if (!form) {
      console.error('editRepair: 找不到表单元素');
      showToast('表单初始化失败', 'error');
      return;
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const fd = new FormData(form);
        const data = Object.fromEntries(fd.entries());
        data.cost = Number(data.cost) || 0;

        const photos = [];
        const photoInput = form.elements['photos'];
        if (photoInput.files?.length) {
          for (const f of photoInput.files) {
            photos.push(await fileToDataURL(f));
          }
        }
        if (repair.photos) photos.unshift(...repair.photos);
        data.photos = photos;

        const contractFile = form.elements['contract'].files?.[0];
        const invoiceFile = form.elements['invoice'].files?.[0];
        data.contract = contractFile ? { name: contractFile.name, data: await fileToDataURL(contractFile) } : repair.contract;
        data.invoice = invoiceFile ? { name: invoiceFile.name, data: await fileToDataURL(invoiceFile) } : repair.invoice;

        if (id) {
          Object.assign(repair, data);
          addActivity(`编辑了维修记录: ${data.title}`);
        } else {
          data.id = uid();
          DB.repairs.push(data);
          addActivity(`新增了维修记录: ${data.title}`);
        }
        saveData();
        closeModal();
        renderRepairs();
        renderDashboard();
        showToast('已保存维修记录');
      } catch (err) {
        console.error('保存维修记录失败:', err);
        showToast('保存失败: ' + err.message, 'error');
      }
    });
    bindModalClose();
  } catch (err) {
    console.error('editRepair 错误:', err);
    showToast('出错了: ' + err.message, 'error');
  }
}

function viewRepair(id) {
  const r = DB.repairs.find(x => x.id === id);
  if (!r) return;
  const html = `<h3>${r.title}</h3>
    <div class="meta">📅 ${fmtDate(r.date)} &nbsp; 👷 ${r.worker || '—'} &nbsp; 💰 ${fmtMoney(r.cost)}</div>
    <div class="content" style="margin-top:10px">${r.description || ''}</div>
    ${r.photos?.length ? `<div class="photo-preview">${r.photos.map(p => `<img src="${p}" style="cursor:pointer" data-preview-img="${p}" />`).join('')}</div>` : ''}
    ${r.contract ? `<a href="${r.contract.data}" download="${r.contract.name}" class="btn-secondary" style="margin-top:10px;text-decoration:none">下载合同</a>` : ''}
    ${r.invoice ? `<a href="${r.invoice.data}" download="${r.invoice.name}" class="btn-secondary" style="margin-top:10px;margin-left:8px;text-decoration:none">下载发票</a>` : ''}
    <div class="form-actions"><button class="btn-secondary" data-close-modal>关闭</button></div>`;
  openModal(html);
  bindModalClose();
  $$('[data-preview-img]').forEach(img => {
    img.addEventListener('click', () => {
      window.open(img.dataset.previewImg, '_blank');
    });
  });
}

function reviewRepair(id) {
  const r = DB.repairs.find(x => x.id === id);
  if (!r) return;
  openModal(`<h3>回访评价 - ${r.title}</h3>
    <form id="review-form">
      <label>维修效果是否持久？
        <div class="stars" id="review-stars">
          ${Array.from({ length: 5 }, (_, i) => `<span class="star ${i < (r.review?.rating || 0) ? 'active' : ''}" data-star="${i + 1}">★</span>`).join('')}
        </div>
      </label>
      <label>评价内容 <textarea name="comment">${r.review?.comment || ''}</textarea></label>
      <div class="form-actions">
        <button type="button" class="btn-secondary" data-close-modal>取消</button>
        <button type="submit" class="btn-primary">提交评价</button>
      </div>
    </form>`);
  let rating = r.review?.rating || 0;
  $$('#review-stars .star').forEach(s => {
    s.addEventListener('click', () => {
      rating = Number(s.dataset.star);
      $$('#review-stars .star').forEach(x => {
        x.classList.toggle('active', Number(x.dataset.star) <= rating);
      });
    });
  });
  $('#review-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    r.review = { rating, comment: fd.get('comment') };
    saveData();
    addActivity(`评价了维修: ${r.title}`);
    closeModal();
    renderRepairs();
    showToast('已提交评价');
  });
  bindModalClose();
}

function bindModalClose() {
  const btn = $('[data-close-modal]', $('#modal-body'));
  if (btn) btn.addEventListener('click', closeModal);
}

$('#btn-add-repair').addEventListener('click', () => editRepair(null));

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ============================================================
//  3. 定期维护计划
// ============================================================
function computeNextDue(m) {
  if (!m.lastDate) return m.startDate || new Date().toISOString().slice(0, 10);
  const last = new Date(m.lastDate);
  const days = Number(m.intervalDays) || 30;
  last.setDate(last.getDate() + days);
  return last.toISOString().slice(0, 10);
}

function renderMaintenances() {
  const upcoming = [];
  DB.maintenances.forEach(m => {
    const next = computeNextDue(m);
    const daysLeft = Math.ceil((new Date(next) - new Date()) / 86400000);
    m._next = next;
    m._daysLeft = daysLeft;
    if (daysLeft <= 14) upcoming.push(m);
  });

  // 待办
  const u = $('#maintenance-upcoming');
  if (!upcoming.length) {
    u.innerHTML = '<div class="empty-state">暂无即将到期的维护任务 🎉</div>';
  } else {
    u.innerHTML = upcoming.sort((a, b) => a._daysLeft - b._daysLeft).map(m => {
      const cls = m._daysLeft < 0 ? 'overdue' : (m._daysLeft <= 7 ? 'soon' : '');
      const text = m._daysLeft < 0 ? `已逾期 ${-m._daysLeft} 天` : (m._daysLeft === 0 ? '今天到期' : `${m._daysLeft} 天后`);
      return `<div class="upcoming-item ${cls}">
        <div>
          <strong>${m.name}</strong>
          <span style="color:var(--muted);font-size:12px;margin-left:8px">${m.device || '—'}</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <span>${fmtDate(m._next)} (${text})</span>
          <button class="btn-primary" data-complete="${m.id}">完成</button>
        </div>
      </div>`;
    }).join('');
    u.querySelectorAll('[data-complete]').forEach(btn => {
      btn.addEventListener('click', () => completeMaintenance(btn.dataset.complete));
    });
  }

  // 列表
  const list = $('#maintenance-list');
  if (!DB.maintenances.length) {
    list.innerHTML = '<div class="empty-state">暂无维护任务，点击右上角新增</div>';
    return;
  }
  list.innerHTML = DB.maintenances.map(m => {
    return `<div class="record-item">
      <h4>${m.name}</h4>
      <div class="meta">
        <span>🔧 ${m.device || '—'}</span>
        <span style="margin-left:12px">周期: 每 ${m.intervalDays} 天</span>
        <span style="margin-left:12px">上次: ${fmtDate(m.lastDate) || '从未'}</span>
        <span style="margin-left:12px">下次: ${fmtDate(m._next)}</span>
      </div>
      ${m.description ? `<div class="content">${m.description}</div>` : ''}
      ${m.history?.length ? `<div class="file-list"><strong>历史记录:</strong>
        ${m.history.slice().reverse().slice(0, 5).map(h => `<div class="file-item">📌 ${fmtDate(h.date)} ${h.note ? ' - ' + h.note : ''}</div>`).join('')}
      </div>` : ''}
      <div class="actions" style="margin-top:10px">
        <button class="btn-secondary" data-edit-maintenance="${m.id}">编辑</button>
        <button class="btn-secondary" data-record-maintenance="${m.id}">记录完成</button>
        <button class="btn-danger" data-del-maintenance="${m.id}">删除</button>
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('[data-del-maintenance]').forEach(btn => btn.addEventListener('click', () => {
    if (!confirm('确认删除？')) return;
    DB.maintenances = DB.maintenances.filter(x => x.id !== btn.dataset.delMaintenance);
    saveData();
    renderMaintenances();
  }));
  list.querySelectorAll('[data-edit-maintenance]').forEach(btn => btn.addEventListener('click', () => editMaintenance(btn.dataset.editMaintenance)));
  list.querySelectorAll('[data-record-maintenance]').forEach(btn => btn.addEventListener('click', () => completeMaintenance(btn.dataset.recordMaintenance)));
}

function completeMaintenance(id) {
  const m = DB.maintenances.find(x => x.id === id);
  if (!m) return;
  openModal(`<h3>记录维护完成</h3>
    <form id="complete-form">
      <label>完成日期 <input type="date" name="date" required value="${new Date().toISOString().slice(0, 10)}" /></label>
      <label>备注 <textarea name="note" placeholder="例如: 更换了空调滤网"></textarea></label>
      <div class="form-actions">
        <button type="button" class="btn-secondary" data-close-modal>取消</button>
        <button type="submit" class="btn-primary">记录</button>
      </div>
    </form>`);
  bindModalClose();
  $('#complete-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    m.lastDate = fd.get('date');
    m.history = m.history || [];
    m.history.push({ date: fd.get('date'), note: fd.get('note') });
    saveData();
    addActivity(`完成了维护: ${m.name}`);
    closeModal();
    renderMaintenances();
    renderDashboard();
    showToast('已记录维护完成');
  });
}

function maintenanceFormHTML(m = {}) {
  return `<h3>${m.id ? '编辑' : '新增'}维护任务</h3>
    <form id="maintenance-form">
      <label>任务名称 <input type="text" name="name" required value="${m.name || ''}" placeholder="如 热水器清洗" /></label>
      <div class="form-row">
        <label>关联设备 <input type="text" name="device" value="${m.device || ''}" placeholder="如 海尔热水器" /></label>
        <label>周期(天) <input type="number" name="intervalDays" required value="${m.intervalDays || 90}" /></label>
      </div>
      <div class="form-row">
        <label>上次完成日期 <input type="date" name="lastDate" value="${m.lastDate || ''}" /></label>
        <label>首次开始日期 <input type="date" name="startDate" value="${m.startDate || ''}" /></label>
      </div>
      <label>备注/步骤 <textarea name="description">${m.description || ''}</textarea></label>
      <div class="form-actions">
        <button type="button" class="btn-secondary" data-close-modal>取消</button>
        <button type="submit" class="btn-primary">保存</button>
      </div>
    </form>`;
}

function editMaintenance(id) {
  try {
    const m = DB.maintenances.find(x => x.id === id) || {};
    if (id) m.id = id;
    openModal(maintenanceFormHTML(m));
    const form = $('#maintenance-form');
    if (!form) {
      console.error('editMaintenance: 找不到表单元素');
      showToast('表单初始化失败', 'error');
      return;
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        data.intervalDays = Number(data.intervalDays) || 0;
        if (id) {
          Object.assign(m, data);
          addActivity(`编辑了维护任务: ${data.name}`);
        } else {
          data.id = uid();
          data.history = [];
          DB.maintenances.push(data);
          addActivity(`新增了维护任务: ${data.name}`);
        }
        saveData();
        closeModal();
        renderMaintenances();
        renderDashboard();
        showToast('已保存维护任务');
      } catch (err) {
        console.error('保存维护任务失败:', err);
        showToast('保存失败: ' + err.message, 'error');
      }
    });
    bindModalClose();
  } catch (err) {
    console.error('editMaintenance 错误:', err);
    showToast('出错了: ' + err.message, 'error');
  }
}

$('#btn-add-maintenance').addEventListener('click', () => editMaintenance(null));

// ============================================================
//  4. 家电档案
// ============================================================
function renderAppliances() {
  const list = $('#appliance-list');
  if (!DB.appliances.length) {
    list.innerHTML = '<div class="empty-state">暂无家电档案，点击右上角新增</div>';
    return;
  }
  list.innerHTML = DB.appliances.map(a => {
    const daysLeft = a.warrantyEnd ? Math.ceil((new Date(a.warrantyEnd) - new Date()) / 86400000) : null;
    let warrantyTag = '';
    if (a.warrantyEnd) {
      if (daysLeft < 0) warrantyTag = '<span class="tag danger">已过保</span>';
      else if (daysLeft <= 60) warrantyTag = `<span class="tag warning">${daysLeft} 天后到期</span>`;
      else warrantyTag = `<span class="tag">${daysLeft} 天后到期</span>`;
    }
    const faults = (a.faults || []).slice(-3).reverse().map(f =>
      `<div class="file-item">📌 ${fmtDate(f.date)} - ${f.problem}${f.solution ? ' (处理: ' + f.solution + ')' : ''}</div>`
    ).join('');
    return `<div class="record-item">
      <h4>${a.brand || ''} ${a.model || ''} <span style="font-weight:400;font-size:13px;color:var(--muted)">${a.name || ''}</span></h4>
      <div class="meta">
        <span>类别: ${a.category || '—'}</span>
        <span style="margin-left:12px">购入: ${fmtDate(a.purchaseDate)}</span>
        <span style="margin-left:12px">保修至: ${fmtDate(a.warrantyEnd) || '—'}</span>
        ${warrantyTag}
      </div>
      <div class="content">${a.notes || ''}</div>
      ${a.warrantyCard ? `<div class="file-item">📷 保修卡: <a href="${a.warrantyCard.data}" target="_blank">${a.warrantyCard.name}</a></div>` : ''}
      ${a.faults?.length ? `<div class="file-list" style="margin-top:8px"><strong>故障记录:</strong>${faults}${a.faults.length > 3 ? `<div class="file-item" style="color:var(--muted)">...共 ${a.faults.length} 条</div>` : ''}</div>` : ''}
      <div class="actions" style="margin-top:10px">
        <button class="btn-secondary" data-view-appliance="${a.id}">查看详情</button>
        <button class="btn-secondary" data-fault-appliance="${a.id}">记录故障</button>
        <button class="btn-secondary" data-edit-appliance="${a.id}">编辑</button>
        <button class="btn-danger" data-del-appliance="${a.id}">删除</button>
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('[data-del-appliance]').forEach(btn => btn.addEventListener('click', () => {
    if (!confirm('确认删除该家电档案？')) return;
    DB.appliances = DB.appliances.filter(x => x.id !== btn.dataset.delAppliance);
    saveData();
    renderAppliances();
  }));
  list.querySelectorAll('[data-edit-appliance]').forEach(btn => btn.addEventListener('click', () => editAppliance(btn.dataset.editAppliance)));
  list.querySelectorAll('[data-view-appliance]').forEach(btn => btn.addEventListener('click', () => viewAppliance(btn.dataset.viewAppliance)));
  list.querySelectorAll('[data-fault-appliance]').forEach(btn => btn.addEventListener('click', () => recordFault(btn.dataset.faultAppliance)));
}

function applianceFormHTML(a = {}) {
  return `<h3>${a.id ? '编辑' : '新增'}家电档案</h3>
    <form id="appliance-form">
      <div class="form-row">
        <label>名称/类别 <input type="text" name="name" value="${a.name || ''}" placeholder="如 客厅空调" /></label>
        <label>类别
          <select name="category">
            ${['空调','冰箱','洗衣机','热水器','燃气灶','油烟机','电视','微波炉','其他'].map(c =>
              `<option ${a.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="form-row">
        <label>品牌 <input type="text" name="brand" value="${a.brand || ''}" /></label>
        <label>型号 <input type="text" name="model" value="${a.model || ''}" /></label>
      </div>
      <div class="form-row">
        <label>购入日期 <input type="date" name="purchaseDate" value="${a.purchaseDate || ''}" /></label>
        <label>保修到期 <input type="date" name="warrantyEnd" value="${a.warrantyEnd || ''}" /></label>
      </div>
      <label>保修卡照片 <input type="file" name="warrantyCard" accept="image/*" /></label>
      ${a.warrantyCard ? `<div class="file-item">当前: ${a.warrantyCard.name}</div>` : ''}
      <label>备注 <textarea name="notes">${a.notes || ''}</textarea></label>
      <div class="form-actions">
        <button type="button" class="btn-secondary" data-close-modal>取消</button>
        <button type="submit" class="btn-primary">保存</button>
      </div>
    </form>`;
}

function editAppliance(id) {
  try {
    const a = DB.appliances.find(x => x.id === id) || {};
    if (id) a.id = id;
    openModal(applianceFormHTML(a));
    const form = $('#appliance-form');
    if (!form) {
      console.error('editAppliance: 找不到表单元素');
      showToast('表单初始化失败', 'error');
      return;
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        const file = e.target.elements['warrantyCard'].files?.[0];
        data.warrantyCard = file ? { name: file.name, data: await fileToDataURL(file) } : a.warrantyCard;
        if (id) {
          Object.assign(a, data);
          addActivity(`编辑了家电: ${data.brand || ''} ${data.model || ''}`);
        } else {
          data.id = uid();
          data.faults = [];
          DB.appliances.push(data);
          addActivity(`新增了家电: ${data.brand || ''} ${data.model || ''}`);
        }
        saveData();
        closeModal();
        renderAppliances();
        renderDashboard();
        showToast('已保存家电档案');
      } catch (err) {
        console.error('保存家电档案失败:', err);
        showToast('保存失败: ' + err.message, 'error');
      }
    });
    bindModalClose();
  } catch (err) {
    console.error('editAppliance 错误:', err);
    showToast('出错了: ' + err.message, 'error');
  }
}

function viewAppliance(id) {
  const a = DB.appliances.find(x => x.id === id);
  if (!a) return;
  const faults = (a.faults || []).slice().reverse().map(f =>
    `<div class="file-item">📌 <strong>${fmtDate(f.date)}</strong> - 问题: ${f.problem}${f.solution ? `<br>处理: ${f.solution}` : ''}</div>`
  ).join('') || '<div class="file-item" style="color:var(--muted)">无故障记录</div>';
  openModal(`<h3>${a.brand || ''} ${a.model || ''}</h3>
    <div class="meta">类别: ${a.category} &nbsp; 购入: ${fmtDate(a.purchaseDate)} &nbsp; 保修至: ${fmtDate(a.warrantyEnd)}</div>
    <div class="content" style="margin-top:10px">${a.notes || ''}</div>
    ${a.warrantyCard ? `<a href="${a.warrantyCard.data}" target="_blank" class="btn-secondary" style="text-decoration:none">查看保修卡</a>` : ''}
    <div style="margin-top:14px"><h4>故障记录</h4><div class="file-list">${faults}</div></div>
    <div class="form-actions"><button class="btn-secondary" data-close-modal>关闭</button></div>`);
  bindModalClose();
}

function recordFault(id) {
  const a = DB.appliances.find(x => x.id === id);
  if (!a) return;
  openModal(`<h3>记录故障 - ${a.brand || ''} ${a.model || ''}</h3>
    <form id="fault-form">
      <label>故障日期 <input type="date" name="date" required value="${new Date().toISOString().slice(0, 10)}" /></label>
      <label>问题描述 <textarea name="problem" required></textarea></label>
      <label>解决方式 <textarea name="solution" placeholder="如 已联系售后，已自行修理"></textarea></label>
      <div class="form-actions">
        <button type="button" class="btn-secondary" data-close-modal>取消</button>
        <button type="submit" class="btn-primary">保存</button>
      </div>
    </form>`);
  bindModalClose();
  $('#fault-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    a.faults = a.faults || [];
    a.faults.push({ id: uid(), date: fd.get('date'), problem: fd.get('problem'), solution: fd.get('solution') });
    saveData();
    addActivity(`记录了家电故障: ${a.brand || ''} ${a.model || ''}`);
    closeModal();
    renderAppliances();
    showToast('已记录故障');
  });
}

$('#btn-add-appliance').addEventListener('click', () => editAppliance(null));

// ============================================================
//  5. 费用统计
// ============================================================
const BILL_TYPE_LABEL = {
  water: '水费', electric: '电费', gas: '燃气费', internet: '网络费', property: '物业费', other: '其他'
};

function renderCost() {
  renderBills();
  renderBudget();
  renderCostChart();
}

function renderBills() {
  const tbody = $('#bill-table tbody');
  if (!DB.bills.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">暂无账单</td></tr>';
    return;
  }
  const sorted = [...DB.bills].sort((a, b) => (b.month || '').localeCompare(a.month || ''));
  tbody.innerHTML = sorted.map(b => `<tr>
    <td>${b.month}</td>
    <td>${BILL_TYPE_LABEL[b.type] || b.type}</td>
    <td>${fmtMoney(b.amount)}</td>
    <td><button class="btn-danger" data-del-bill="${b.id}">删除</button></td>
  </tr>`).join('');
  tbody.querySelectorAll('[data-del-bill]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('确认删除？')) return;
      DB.bills = DB.bills.filter(x => x.id !== btn.dataset.delBill);
      saveData();
      renderCost();
    });
  });
}

$('#bill-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  DB.bills.push({
    id: uid(),
    month: fd.get('month'),
    type: fd.get('type'),
    amount: Number(fd.get('amount'))
  });
  saveData();
  addActivity('新增了月度账单');
  e.target.reset();
  renderCost();
  showToast('已添加账单');
});

function renderBudget() {
  const container = $('#budget-summary');
  if (!DB.budgets.length) {
    container.innerHTML = '<div class="empty-state">暂未设置年度预算</div>';
    return;
  }
  container.innerHTML = DB.budgets.map(b => {
    const yearStr = String(b.year);
    const yearBills = DB.bills.filter(x => (x.month || '').startsWith(yearStr));
    const yearRepairs = DB.repairs.filter(x => (x.date || '').startsWith(yearStr));
    const actualBills = yearBills.reduce((s, x) => s + (x.amount || 0), 0);
    const actualRepairs = yearRepairs.reduce((s, x) => s + (x.cost || 0), 0);
    const actual = actualBills + actualRepairs;
    const diff = b.budget - actual;
    const over = diff < 0;
    return `<div style="display:contents">
      <div class="budget-box"><h4>${b.year} 年预算</h4><div class="value">${fmtMoney(b.budget)}</div></div>
      <div class="budget-box"><h4>年度账单 (水电物业)</h4><div class="value">${fmtMoney(actualBills)}</div></div>
      <div class="budget-box"><h4>年度维修</h4><div class="value">${fmtMoney(actualRepairs)}</div></div>
      <div class="budget-box"><h4>实际总计</h4><div class="value ${over ? 'over' : ''}">${fmtMoney(actual)}</div></div>
      <div class="budget-box"><h4>预算余额</h4><div class="value ${over ? 'over' : ''}">${diff >= 0 ? '+' : ''}${fmtMoney(diff)}</div></div>
    </div>`;
  }).join('');
}

$('#budget-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const year = Number(fd.get('year'));
  const budget = Number(fd.get('budget'));
  const exist = DB.budgets.find(x => x.year === year);
  if (exist) exist.budget = budget;
  else DB.budgets.push({ id: uid(), year, budget });
  saveData();
  addActivity(`设置了 ${year} 年预算: ${fmtMoney(budget)}`);
  e.target.reset();
  renderBudget();
  showToast('已保存预算');
});

function renderCostChart() {
  const canvas = $('#cost-chart');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!DB.bills.length) {
    ctx.fillStyle = '#95a5a6';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('暂无账单数据', canvas.width / 2, canvas.height / 2);
    return;
  }

  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }

  const totals = months.map(m => DB.bills
    .filter(b => b.month === m)
    .reduce((s, b) => s + (b.amount || 0), 0));

  const max = Math.max(...totals, 1);
  const padding = { left: 60, right: 30, top: 20, bottom: 40 };
  const chartW = canvas.width - padding.left - padding.right;
  const chartH = canvas.height - padding.top - padding.bottom;

  ctx.strokeStyle = '#e1e8ed';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartH);
  ctx.lineTo(padding.left + chartW, padding.top + chartH);
  ctx.stroke();

  ctx.fillStyle = '#7f8c8d';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + chartH - (chartH / 4) * i;
    ctx.fillText(fmtMoney((max / 4) * i), padding.left - 6, y + 4);
    ctx.strokeStyle = '#f4f6f9';
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.stroke();
  }

  const barW = chartW / months.length * 0.6;
  const gap = chartW / months.length;
  totals.forEach((v, i) => {
    const h = (v / max) * chartH;
    const x = padding.left + gap * i + (gap - barW) / 2;
    const y = padding.top + chartH - h;
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, '#3498db');
    grad.addColorStop(1, '#5dade2');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barW, h);
    ctx.fillStyle = '#7f8c8d';
    ctx.textAlign = 'center';
    ctx.fillText(months[i].slice(2), x + barW / 2, padding.top + chartH + 16);
    if (h > 20) {
      ctx.fillStyle = '#fff';
      ctx.fillText(v.toFixed(0), x + barW / 2, y + 14);
    }
  });
}

// ============================================================
//  概览
// ============================================================
function renderDashboard() {
  // 房屋
  if (DB.house) {
    $('#dash-house').innerHTML = `${DB.house.area || '?'} ㎡ <div class="small">${DB.house.roomCount || '?'} 间房 · ${DB.house.material || ''}</div>`;
  } else {
    $('#dash-house').innerHTML = '<div class="small">尚未录入</div>';
  }

  // 待办维护
  const dueM = DB.maintenances.filter(m => {
    const next = computeNextDue(m);
    const d = Math.ceil((new Date(next) - new Date()) / 86400000);
    return d <= 7;
  });
  $('#dash-maintenance').innerHTML = `${dueM.length} 项<div class="small">7 天内到期</div>`;

  // 保修到期
  const expiring = DB.appliances.filter(a => {
    if (!a.warrantyEnd) return false;
    const d = Math.ceil((new Date(a.warrantyEnd) - new Date()) / 86400000);
    return d >= 0 && d <= 60;
  });
  $('#dash-warranty').innerHTML = `${expiring.length} 台<div class="small">60 天内到期</div>`;

  // 本月账单
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthTotal = DB.bills.filter(b => b.month === thisMonth).reduce((s, b) => s + (b.amount || 0), 0);
  $('#dash-cost').innerHTML = `${fmtMoney(monthTotal)}<div class="small">${thisMonth} 月</div>`;

  // 活动
  const list = $('#dash-activity');
  if (!DB.activities.length) {
    list.innerHTML = '<li>暂无活动记录</li>';
  } else {
    list.innerHTML = DB.activities.slice(0, 8).map(a =>
      `<li><span>${a.text}</span><span class="time">${new Date(a.time).toLocaleString('zh-CN')}</span></li>`
    ).join('');
  }
}

// ============================================================
//  初始化
// ============================================================
function seedIfEmpty() {
  if (DB.house) return;
  // 首次使用提供一些默认数据，方便演示
  DB.house = { buildYear: 2015, area: 110, roomCount: 3, material: '钢筋混凝土', address: '', owner: '' };
  DB.valuations = [
    { id: uid(), date: '2023-06-01', value: 2000000, note: '首次评估' },
    { id: uid(), date: '2024-06-01', value: 2150000, note: '市场上涨' },
    { id: uid(), date: '2025-06-01', value: 2100000, note: '调整' }
  ];
  DB.maintenances = [
    { id: uid(), name: '热水器清洗', device: '海尔热水器', intervalDays: 180, lastDate: '', startDate: '', description: '放水垢、清洗内胆', history: [] },
    { id: uid(), name: '空调滤网更换', device: '客厅空调', intervalDays: 90, lastDate: '', startDate: '', description: '清洗或更换滤网', history: [] }
  ];
  DB.appliances = [
    { id: uid(), name: '客厅空调', category: '空调', brand: '美的', model: 'KFR-35GW', purchaseDate: '2023-05-01', warrantyEnd: '2026-05-01', notes: '', warrantyCard: null, faults: [] },
    { id: uid(), name: '厨房冰箱', category: '冰箱', brand: '海尔', model: 'BCD-458', purchaseDate: '2022-10-01', warrantyEnd: '2025-10-01', notes: '', warrantyCard: null, faults: [] }
  ];
  DB.bills = [
    { id: uid(), month: '2026-03', type: 'electric', amount: 280 },
    { id: uid(), month: '2026-03', type: 'water', amount: 60 },
    { id: uid(), month: '2026-03', type: 'gas', amount: 80 },
    { id: uid(), month: '2026-04', type: 'electric', amount: 260 },
    { id: uid(), month: '2026-04', type: 'water', amount: 55 },
    { id: uid(), month: '2026-05', type: 'electric', amount: 310 }
  ];
  DB.budgets = [{ id: uid(), year: 2026, budget: 10000 }];
  DB.repairs = [
    { id: uid(), title: '厨房水管维修', date: '2026-04-10', worker: '王师傅', cost: 350, category: '水电', description: '更换厨房水龙头，修复漏水问题', photos: [], contract: null, invoice: null, review: { rating: 5, comment: '维修质量很好，至今未再漏水' } }
  ];
  DB.activities = [{ id: uid(), text: '欢迎使用家庭维修与房屋管理工具 👋', time: new Date().toISOString() }];
  saveData();
}

seedIfEmpty();
renderDashboard();
