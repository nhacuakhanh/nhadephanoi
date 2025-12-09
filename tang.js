// tang.js – Quản lý TẦNG

import {
  db,
  ref,
  onValue,
  update,
  remove,
  getSession,
  clearSession,
  saveSession
} from "./firebase-config.js";

const session = getSession();
if (session.role !== "admin") {
  alert("Bạn không có quyền truy cập.");
  window.location.href = "index.html";
}

const baseId = session.baseId;
if (!baseId) {
  alert("Chưa chọn cơ sở.");
  window.location.href = "admin.html";
}

document.getElementById("backBtn").onclick = () => {
  window.location.href = "admin.html";
};
document.getElementById("logoutBtn").onclick = () => {
  clearSession();
  window.location.href = "index.html";
};

document.getElementById("title").textContent = "Tầng – " + baseId;

document.getElementById("generateFloorsBtn").onclick = async () => {
  const count = Number(
    document.getElementById("floorCount").value.trim()
  );
  if (!count || count <= 0) {
    alert("Nhập số tầng > 0.");
    return;
  }

  const updates = {};
  for (let i = 1; i <= count; i++) {
    const floorId = "floor" + i;
    updates[`bases/${baseId}/floors/${floorId}`] = {
      name: `Tầng ${i}`
    };
  }

  await update(ref(db), updates);
  document.getElementById("floorCount").value = "";
};

const listEl = document.getElementById("floorList");

onValue(ref(db, `bases/${baseId}/floors`), (snap) => {
  listEl.innerHTML = "";
  if (!snap.exists()) {
    listEl.innerHTML =
      '<div style="font-size:13px;color:#94a3b8">Chưa có tầng nào.</div>';
    return;
  }
  snap.forEach((child) => {
    const id = child.key;
    const val = child.val();
    const div = document.createElement("div");
    div.className = "item-card";
    div.innerHTML = `
      <div class="item-main">
        <div class="item-title">${val.name}</div>
        <div class="item-sub">Nhấn để quản lý phòng</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-small btn-outline js-open">Phòng</button>
        <button class="btn btn-small btn-danger js-del">Xóa</button>
      </div>
    `;
    div.querySelector(".js-open").onclick = () => {
      saveSession({ floorId: id });
      window.location.href = "phong.html";
    };
    div.querySelector(".js-del").onclick = async () => {
      if (confirm(`Xóa ${val.name}?`)) {
        await remove(ref(db, `bases/${baseId}/floors/${id}`));
      }
    };
    listEl.appendChild(div);
  });
});
