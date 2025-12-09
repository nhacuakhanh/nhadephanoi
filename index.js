// index.js  (replace)
import { db, ref, get, child } from './firebase-config.js';

// Admin credentials (kept in code; not printed in UI)
const ADMIN_USER = 'khanhchunha';
const ADMIN_PASS = 'khanh0311';

const elUser = document.getElementById('username');
const elPass = document.getElementById('password');
const btnLogin = document.getElementById('btnLogin');

async function login() {
  const username = elUser?.value?.trim();
  const password = elPass?.value?.trim();
  if (!username || !password) { alert('Nhập đầy đủ tài khoản và mật khẩu'); return; }

  // Admin login
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // set session
    localStorage.setItem('role', 'admin');
    // redirect
    window.location.href = 'admin.html';
    return;
  }

  // Guest login -> look up in guestsIndex
  try {
    const dbRef = ref(db);
    const snap = await get(child(dbRef, `guestsIndex/${username}`));
    if (!snap.exists()) {
      alert('Tài khoản khách không tồn tại hoặc chưa được tạo bởi Admin.');
      return;
    }
    const guest = snap.val();
    if (guest.password !== password) {
      alert('Sai mật khẩu.');
      return;
    }

    // Save session: role + location
    localStorage.setItem('role', 'guest');
    localStorage.setItem('selectedBuilding', guest.baseId || '');
    localStorage.setItem('selectedFloor', guest.floorId || '');
    localStorage.setItem('selectedRoom', guest.roomId || '');
    localStorage.setItem('selectedGuestPhone', username);

    // go to khach page
    window.location.href = 'guest.html';
    return;
  } catch (err) {
    console.error(err);
    alert('Lỗi khi kiểm tra tài khoản. Kiểm tra kết nối Firebase.');
  }
}

btnLogin?.addEventListener('click', login);

// allow Enter key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') login();
});
