// index.js – Đăng nhập admin / khách

import {
  db,
  ref,
  get,
  child,
  saveSession,
  clearSession
} from "./firebase-config.js";

const ADMIN_USER = "khanhchunha";
const ADMIN_PASS = "khanh0311";

document.getElementById("loginBtn").addEventListener("click", login);

async function login() {
  const uEl = document.getElementById("username");
  const pEl = document.getElementById("password");
  const username = uEl.value.trim();
  const password = pEl.value.trim();

  if (!username || !password) {
    alert("Vui lòng nhập đủ tài khoản và mật khẩu.");
    return;
  }

  // 1) Admin
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    clearSession();
    saveSession({ role: "admin" });
    window.location.href = "admin.html";
    return;
  }

  // 2) Khách – dùng SĐT
  try {
    const idxSnap = await get(child(ref(db), "guestIndex/" + username));
    if (!idxSnap.exists() || password !== username) {
      alert("Sai tài khoản hoặc mật khẩu.\nKhách dùng SĐT làm tài khoản + mật khẩu.");
      return;
    }
    const info = idxSnap.val();
    clearSession();
    saveSession({
      role: "guest",
      phone: username,
      baseId: info.baseId,
      floorId: info.floorId,
      roomId: info.roomId
    });
    window.location.href = "guest.html"; // Trang dành cho khách
  } catch (err) {
    console.error(err);
    alert("Có lỗi khi đăng nhập. Vui lòng thử lại.");
  }
}
