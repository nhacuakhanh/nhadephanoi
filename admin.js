// admin.js – Quản lý CƠ SỞ

import {
  db,
  ref,
  onValue,
  push,
  set,
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

document.getElementById("logoutBtn").onclick = () => {
  clearSession();
  window.location.href = "index.html";
};

document.getElementById("addBuildingBtn").onclick = async () => {
  const name = document.getElementById("buildingName").value.trim();
  if (!name) {
    alert("Nhập tên cơ sở.");
    return;
  }
  const newRef = push(ref(db, "bases"));
  await set(newRef, { name });
  document.getElementById("buildingName").value = "";
};

const listEl = document.getElementById("buildingList");

onValue(ref(db, "bases"), (snap) => {
  listEl.innerHTML = "";
  if (!snap.exists()) {
    listEl.innerHTML =
      '<div style="font-size:13px;color:#94a3b8">Chưa có cơ sở nào.</div>';
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
        <div class="item-sub">Nhấn để quản lý tầng</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-small btn-outline js-open">Tầng</button>
        <button class="btn btn-small btn-danger js-del">Xóa</button>
      </div>
    `;
    div.querySelector(".js-open").onclick = () => {
      saveSession({ baseId: id });
      window.location.href = "tang.html";
    };
    div.querySelector(".js-del").onclick = async () => {
      if (confirm(`Xóa cơ sở "${val.name}"?`)) {
        await remove(ref(db, "bases/" + id));
      }
    };
    listEl.appendChild(div);
  });
});
