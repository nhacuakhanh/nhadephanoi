// guest.js – Khách xem & tự tính tiền (chỉ sửa điện phòng)

import {
  db,
  ref,
  get,
  onValue,
  vnd,
  getSession,
  clearSession
} from "./firebase-config.js";

const session = getSession();
if (session.role !== "guest" || !session.baseId) {
  alert("Bạn chưa đăng nhập với tài khoản khách.");
  window.location.href = "index.html";
}

const { baseId, floorId, roomId, phone } = session;

document.getElementById("logoutBtn").onclick = () => {
  clearSession();
  window.location.href = "index.html";
};

function el(id) {
  return document.getElementById(id);
}

const guestRef = ref(db, `guests/${baseId}/${floorId}/${roomId}`);
const baseRef = ref(db, `bases/${baseId}`);
const guestBox = el("resultBox");

let guestData = null;
let buildingGuests = null;

// Load thông tin khách
get(guestRef).then((snap) => {
  if (!snap.exists()) {
    alert("Chủ nhà chưa tạo thông tin phòng cho bạn.");
    window.location.href = "index.html";
    return;
  }
  guestData = snap.val();
  el("gFullName").value = guestData.fullName || "";
  el("gRent").value = vnd(guestData.rent || 0);
  el("gPeople").value = guestData.people ?? "";
  el("roomOld").value = guestData.electricity?.roomOld ?? "";
  el("roomNew").value = guestData.electricity?.roomNew ?? "";
});

// Load tên phòng / cơ sở / tầng
get(baseRef).then((snap) => {
  if (snap.exists()) {
    const base = snap.val();
    const floor = base.floors?.[floorId];
    const room = floor?.rooms?.[roomId];
    el("gRoom").value = room ? "Phòng " + room.name : roomId;
    el("gBaseFloor").value = (base.name || baseId) + " / " + (floor?.name || floorId);
    document.getElementById("title").textContent =
      "Phòng " + (room?.name || roomId);
  }
});

// Lấy tổng điện phòng cơ sở + tổng người
onValue(ref(db, `guests/${baseId}`), (snap) => {
  buildingGuests = {};
  if (snap.exists()) {
    snap.forEach((fSnap) => {
      fSnap.forEach((rSnap) => {
        const k = fSnap.key + "/" + rSnap.key;
        buildingGuests[k] = rSnap.val();
      });
    });
  }
});

function num(v) {
  if (typeof v === "string") v = v.replace(/,/g, "");
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

el("calcBtn").onclick = () => {
  if (!guestData) {
    alert("Chưa có dữ liệu khách.");
    return;
  }
  const people = num(guestData.people);
  const roomOld = num(el("roomOld").value);
  const roomNew = num(el("roomNew").value);
  const roomPrice = num(guestData.electricity?.roomPrice);
  const mainOld = num(guestData.electricity?.mainOld);
  const mainNew = num(guestData.electricity?.mainNew);
  const sharedPrice = num(guestData.electricity?.sharedPrice);

  const roomKwh = Math.max(roomNew - roomOld, 0);
  const roomMoney = roomKwh * roomPrice;

  // Tổng điện phòng + người trong toàn cơ sở
  let totalKwh = 0;
  let totalPeople = 0;
  if (buildingGuests) {
    Object.values(buildingGuests).forEach((g) => {
      if (!g.electricity) return;
      const ro = num(g.electricity.roomOld);
      const rn = num(g.electricity.roomNew);
      const p = num(g.people);
      totalKwh += Math.max(rn - ro, 0);
      totalPeople += p;
    });
  }

  // cập nhật phòng hiện tại theo giá trị khách nhập
  totalKwh += Math.max(roomKwh, 0) - Math.max(
    num(guestData.electricity?.roomNew) - num(guestData.electricity?.roomOld),
    0
  );
  totalPeople += people - num(guestData.people);

  const mainKwh = Math.max(mainNew - mainOld, 0);
  let sharedMoney = 0;
  if (totalPeople > 0) {
    const sharedKwh = Math.max(mainKwh - totalKwh, 0);
    const sharedTotalAll = shared
