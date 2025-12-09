// firebase-config.js (SDK v9 module, chạy trên browser)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  onValue,
  child,
  push
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// CẤU HÌNH CỦA MÀY
const firebaseConfig = {
  apiKey: "AIzaSyACDGasGgZN6Wn1zTP5_SnuDkgHzwNm5nA",
  authDomain: "quanlyphongtro-7943c.firebaseapp.com",
  databaseURL:
    "https://quanlyphongtro-7943c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quanlyphongtro-7943c",
  storageBucket: "quanlyphongtro-7943c.firebasestorage.app",
  messagingSenderId: "69438529718",
  appId: "1:69438529718:web:71598e18a22b932e52c617",
  measurementId: "G-1NNRS86QPH"
};

// INIT
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Đăng nhập ẩn danh để được phép ghi/đọc DB
signInAnonymously(auth).catch((err) => {
  console.error("Lỗi đăng nhập ẩn danh Firebase:", err);
});

// Helper tiền Việt Nam
function vnd(n) {
  return (Number(n) || 0).toLocaleString("vi-VN") + " đ";
}

// Helper session (lưu role, baseId, floorId, roomId, phone)
const SESSION_KEY = "nhatro_session";

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveSession(partial) {
  const current = getSession();
  const next = { ...current, ...partial };
  localStorage.setItem(SESSION_KEY, JSON.stringify(next));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export {
  db,
  ref,
  get,
  set,
  update,
  remove,
  onValue,
  child,
  push,
  vnd,
  getSession,
  saveSession,
  clearSession
};
