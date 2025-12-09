// firebase-config.js
// (save under project root; use module import in pages: <script type="module" src="firebase-config.js"></script>)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  get,
  child,
  update
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyACDGasGgZN6Wn1zTP5_SnuDkgHzwNm5nA",
  authDomain: "quanlyphongtro-7943c.firebaseapp.com",
  databaseURL: "https://quanlyphongtro-7943c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quanlyphongtro-7943c",
  storageBucket: "quanlyphongtro-7943c.firebasestorage.app",
  messagingSenderId: "69438529718",
  appId: "1:69438529718:web:71598e18a22b932e52c617",
  measurementId: "G-1NNRS86QPH"
};

const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch(e) { /* analytics optional */ }
const db = getDatabase(app);

// export functions & db helpers so other modules can import
export { db, ref, push, set, onValue, get, child, update };
