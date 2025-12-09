// admin.js (replace)
import { db, ref, push, set, onValue } from './firebase-config.js';

const inputBase = document.getElementById('baseName');
const btnAddBase = document.getElementById('btnAddBase');
const listBases = document.getElementById('basesList');

function renderBaseItem(baseId, baseData) {
  const div = document.createElement('div');
  div.className = 'base-item';
  div.innerHTML = `
    <div><strong>${baseData.name}</strong></div>
    <div class="base-meta">Tầng: ${baseData.floors ? Object.keys(baseData.floors).length : 0}</div>
    <div style="margin-top:8px">
      <button class="btn small" data-id="${baseId}" data-action="open">Quản lý tầng</button>
      <button class="btn small danger" data-id="${baseId}" data-action="del">Xóa</button>
    </div>
  `;
  // event delegation after append
  return div;
}

btnAddBase?.addEventListener('click', async () => {
  const name = inputBase.value?.trim();
  if (!name) { alert('Nhập tên cơ sở'); return; }
  try {
    const newRef = push(ref(db, 'bases'));
    await set(newRef, { name, createdAt: Date.now() });
    inputBase.value = '';
  } catch (e) {
    console.error(e); alert('Lỗi khi tạo cơ sở');
  }
});

// realtime load
onValue(ref(db, 'bases'), (snapshot) => {
  listBases.innerHTML = '';
  const data = snapshot.val() || {};
  Object.entries(data).forEach(([baseId, baseData]) => {
    const item = renderBaseItem(baseId, baseData);
    listBases.appendChild(item);
  });
});

// delegate clicks (open/delete)
listBases.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  const baseId = btn.dataset.id;
  if (action === 'open') {
    localStorage.setItem('selectedBuilding', baseId);
    window.location.href = 'tang.html';
  } else if (action === 'del') {
    if (!confirm('Xác nhận xóa cơ sở này?')) return;
    // delete node
    set(ref(db, `bases/${baseId}`), null).then(()=>{}).catch(console.error);
  }
});
