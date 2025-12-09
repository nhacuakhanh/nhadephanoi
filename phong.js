// phong.js – Quản lý PHÒNG

import {
  db,
  ref,
  onValue,
  push,
  set,
  remove,
  get,
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
const floorId = session.floorId;
if (!baseId || !floorId) {
  alert("Thiếu thông tin cơ sở / tầng.");
  window.location.href = "tang.html";
}

document.getElementById("backBtn").onclick = () => {
  window.location.href = "tang.html";
};
document.getElementById("logoutBtn").onclick = () => {
  clearSession();
  window.location.href = "index.html";
};

document.getElementById("title").textContent = "Phòng – " + floorId;

document.getElementById("addRoomBtn").onclick = async () => {
  const name = document.getElementById("roomName").value.trim();
  if (!name) {
    alert("Nhập tên phòng.");
    return;
  }
  const newRef = push(ref(db, `bases/${baseId}/floors/${floorId}/rooms`));
  await set(newRef, { name, hasGuest: false });
  document.getElementById("roomName").value = "";
};

const listEl = document.getElementById("roomList");

onValue(
  ref(db, `bases/${baseId}/floors/${floorId}/rooms`),
  async (snap) => {
    listEl.innerHTML = "";
    if (!snap.exists()) {
      listEl.innerHTML =
        '<div style="font-size:13px;color:#94a3b8">Chưa có phòng nào.</div>';
      return;
    }
    snap.forEach((child) => {
      const roomId = child.key;
      const val = child.val();
      const hasGuest = !!val.hasGuest;
      const div = document.createElement("div");
      div.className = "item-card";
      div.innerHTML = `
        <div class="item-main">
          <div class="item-title">Phòng ${val.name}</div>
          <div class="item-sub">${hasGuest ? "Đã có khách" : "Phòng trống"}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-small btn-outline js-cust">Khách</button>
          <button class="btn btn-small btn-danger js-del">Xóa</button>
        </div>
      `;
      div.querySelector(".js-cust").onclick = () => {
        saveSession({ roomId, roomName: val.name });
        window.location.href = "khach.html";
      };
      div.querySelector(".js-del").onclick = async () => {
        if (confirm(`Xóa phòng ${val.name}?`)) {
          await remove(
            ref(db, `bases/${baseId}/floors/${floorId}/rooms/${roomId}`)
          );
          // Xóa luôn khách tương ứng nếu có
          await remove(
            ref(db, `guests/${baseId}/${floorId}/${roomId}`)
          );
        }
      };
      listEl.appendChild(div);
    });
  }
);
