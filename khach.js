// khach.js – Admin nhập khách + tính tiền + lưu Firebase

import {
  db,
  ref,
  get,
  set,
  update,
  onValue,
  vnd,
  getSession,
  clearSession
} from "./firebase-config.js";

const session = getSession();
if (session.role !== "admin") {
  alert("Bạn không có quyền truy cập trang này.");
  window.location.href = "index.html";
}

const baseId = session.baseId;
const floorId = session.floorId;
const roomId = session.roomId;
const roomName = session.roomName || "";

if (!baseId || !floorId || !roomId) {
  alert("Thiếu thông tin phòng.");
  window.location.href = "phong.html";
}

document.getElementById("title").textContent =
  `Phòng ${roomName} – ${floorId}`;

document.getElementById("backBtn").onclick = () => {
  window.location.href = "phong.html";
};
document.getElementById("logoutBtn").onclick = () => {
  clearSession();
  window.location.href = "index.html";
};

function el(id) {
  return document.getElementById(id);
}

const guestRef = ref(db, `guests/${baseId}/${floorId}/${roomId}`);
const roomRef = ref(db, `bases/${baseId}/floors/${floorId}/rooms/${roomId}`);

// Load dữ liệu khách nếu có
get(guestRef).then((snap) => {
  if (snap.exists()) {
    const g = snap.val();
    el("fullName").value = g.fullName || "";
    el("phone").value = g.phone || "";
    el("people").value = g.people ?? "";
    el("vehicles").value = g.vehicles ?? "";
    el("rent").value = g.rent ?? "";
    el("deposit").value = g.deposit ?? "";
    el("contractMonths").value = g.contractMonths ?? "";
    el("contractStart").value = g.contractStart || "";
    el("contractEnd").value = g.contractEnd || "";

    const e = g.electricity || {};
    el("roomOld").value = e.roomOld ?? "";
    el("roomNew").value = e.roomNew ?? "";
    el("roomPrice").value = e.roomPrice ?? "";
    el("mainOld").value = e.mainOld ?? "";
    el("mainNew").value = e.mainNew ?? "";
    el("sharedPrice").value = e.sharedPrice ?? "";

    const s = g.services || {};
    el("svcWater").value = s.water ?? "";
    el("svcTrash").value = s.trash ?? "";
    el("svcFilter").value = s.filter ?? "";
    el("svcLaundry").value = s.laundry ?? "";
    el("svcDryer").value = s.dryer ?? "";
    el("svcClean").value = s.clean ?? "";
    el("svcWifi").value = s.wifi ?? "";

    if (g.totals) {
      el("roomMoney").value = vnd(g.totals.roomMoney || 0);
      el("sharedMoney").value = vnd(g.totals.sharedMoney || 0);
      el("svcTotal").value = vnd(g.totals.svcTotal || 0);
      updateSummary(g.totals);
    }
  }
});

// Tính ngày kết thúc hợp đồng
function calcContractEnd() {
  const start = el("contractStart").value.trim(); // dd/mm/yyyy
  const months = Number(el("contractMonths").value) || 0;
  if (!start || !months) {
    el("contractEnd").value = "";
    return;
  }
  const [d, m, y] = start.split("/").map((x) => parseInt(x, 10));
  if (!d || !m || !y) return;
  const date = new Date(y, m - 1, d);
  date.setMonth(date.getMonth() + months);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = date.getFullYear();
  el("contractEnd").value = `${dd}/${mm}/${yy}`;
}

el("contractStart").addEventListener("change", calcContractEnd);
el("contractMonths").addEventListener("input", calcContractEnd);

function num(v) {
  if (typeof v === "string") v = v.replace(/,/g, "");
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

// Tính tổng điện phòng cơ sở + tổng người
async function calcBuildingAggregates(currRoomKwh, currPeople) {
  const basesSnap = await get(ref(db, `guests/${baseId}`));
  let totalKwh = 0;
  let totalPeople = 0;

  if (basesSnap.exists()) {
    basesSnap.forEach((floorSnap) => {
      floorSnap.forEach((roomSnap) => {
        const rid = roomSnap.key;
        const g = roomSnap.val();
        if (!g.electricity) return;
        const ro = num(g.electricity.roomOld);
        const rn = num(g.electricity.roomNew);
        const people = num(g.people);
        totalKwh += Math.max(rn - ro, 0);
        totalPeople += people;
      });
    });
  }

  totalKwh += Math.max(currRoomKwh, 0);
  totalPeople += Math.max(currPeople, 0);

  return { totalKwh, totalPeople };
}

function updateSummary(totals) {
  el("rentDisplay").textContent = vnd(totals.rent || 0);
  el("roomDisplay").textContent = vnd(totals.roomMoney || 0);
  el("sharedDisplay").textContent = vnd(totals.sharedMoney || 0);
  el("svcDisplay").textContent = vnd(totals.svcTotal || 0);
  el("totalDisplay").textContent = vnd(totals.total || 0);
}

// TÍNH TIỀN
el("calcBtn").onclick = async () => {
  calcContractEnd();

  const people = num(el("people").value);
  const rent = num(el("rent").value);

  const roomOld = num(el("roomOld").value);
  const roomNew = num(el("roomNew").value);
  const roomPrice = num(el("roomPrice").value);
  const roomKwh = Math.max(roomNew - roomOld, 0);
  const roomMoney = roomKwh * roomPrice;
  el("roomMoney").value = vnd(roomMoney);

  const mainOld = num(el("mainOld").value);
  const mainNew = num(el("mainNew").value);
  const sharedPrice = num(el("sharedPrice").value);
  const mainKwh = Math.max(mainNew - mainOld, 0);

  const agg = await calcBuildingAggregates(roomKwh, people);
  el("totalRoomKwh").value = agg.totalKwh;
  el("totalPeople").value = agg.totalPeople;

  let sharedMoney = 0;
  if (agg.totalPeople > 0) {
    const sharedKwh = Math.max(mainKwh - agg.totalKwh, 0);
    const sharedTotalAll = sharedKwh * sharedPrice;
    const perPerson = sharedTotalAll / agg.totalPeople;
    sharedMoney = perPerson * people;
  }
  el("sharedMoney").value = vnd(sharedMoney);

  const svcWater = num(el("svcWater").value);
  const svcTrash = num(el("svcTrash").value);
  const svcFilter = num(el("svcFilter").value);
  const svcLaundry = num(el("svcLaundry").value);
  const svcDryer = num(el("svcDryer").value);
  const svcClean = num(el("svcClean").value);
  const svcWifi = num(el("svcWifi").value);

  const svcBase =
    svcWater + svcTrash + svcFilter + svcLaundry + svcDryer + svcClean;
  const svcTotal = svcBase * people + svcWifi;
  el("svcTotal").value = vnd(svcTotal);

  const total = rent + roomMoney + sharedMoney + svcTotal;

  const totals = {
    rent,
    roomMoney,
    sharedMoney,
    svcTotal,
    total
  };
  updateSummary(totals);

  alert("Đã tính tiền xong.");
};

// LƯU KHÁCH
el("saveBtn").onclick = async () => {
  const fullName = el("fullName").value.trim();
  const phone = el("phone").value.trim();
  if (!fullName || !phone) {
    alert("Nhập Họ tên và SĐT khách.");
    return;
  }

  // Tính lại để đảm bảo số mới
  el("calcBtn").click();

  const guestData = {
    fullName,
    phone,
    people: num(el("people").value),
    vehicles: num(el("vehicles").value),
    rent: num(el("rent").value),
    deposit: num(el("deposit").value),
    contractMonths: num(el("contractMonths").value),
    contractStart: el("contractStart").value.trim(),
    contractEnd: el("contractEnd").value.trim(),
    electricity: {
      roomOld: num(el("roomOld").value),
      roomNew: num(el("roomNew").value),
      roomPrice: num(el("roomPrice").value),
      mainOld: num(el("mainOld").value),
      mainNew: num(el("mainNew").value),
      sharedPrice: num(el("sharedPrice").value)
    },
    services: {
      water: num(el("svcWater").value),
      trash: num(el("svcTrash").value),
      filter: num(el("svcFilter").value),
      laundry: num(el("svcLaundry").value),
      dryer: num(el("svcDryer").value),
      clean: num(el("svcClean").value),
      wifi: num(el("svcWifi").value)
    },
    totals: {
      rent: num(el("rent").value),
      roomMoney: num(el("roomMoney").value),
      sharedMoney: num(el("sharedMoney").value),
      svcTotal: num(el("svcTotal").value),
      total: num(el("totalDisplay").textContent.replace(/[^\d]/g, ""))
    }
  };

  // Lưu vào /guests
  await set(guestRef, guestData);
  // Đánh dấu phòng đã có khách
  await update(roomRef, { hasGuest: true });
  // Lưu mapping SĐT -> phòng
  await set(ref(db, `guestIndex/${phone}`), {
    baseId,
    floorId,
    roomId
  });

  alert("Đã lưu thông tin khách & tài khoản đăng nhập.");
};
