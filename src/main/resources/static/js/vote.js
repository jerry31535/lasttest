const urlParams  = new URLSearchParams(window.location.search);
const roomId     = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName");

const agreeCountEl  = document.getElementById("agree-count");
const rejectCountEl = document.getElementById("reject-count");
const resultBox     = document.getElementById("vote-result");
const btnBox        = document.getElementById("vote-buttons");
const agreeBtn      = document.getElementById("agree-btn");
const rejectBtn     = document.getElementById("reject-btn");
const confirmBtn    = document.getElementById("confirm-btn");
const statusEl      = document.getElementById("status");
const expeditionBox = document.getElementById("expedition-container");
const countdownEl   = document.getElementById("countdown");

let players    = [];
let expedition = [];
let canVote    = false;
let hasVoted   = false;
let agree      = 0;
let reject     = 0;
let selectedVote = null;
let timer = null;
let stompClient = null;

async function fetchPlayers() {
  const res = await fetch(`/api/room/${roomId}/players`);
  players   = await res.json();
}

function renderExpedition(list) {
  expeditionBox.innerHTML = "";
  list.forEach(name => {
    const p = players.find(v => v.name === name);
    if (!p) return;
    expeditionBox.insertAdjacentHTML("beforeend", `
      <div class="exp-card">
        <div class="avatar-wrapper">
          <img src="/images/${p.avatar}" alt="${p.name}">
        </div>
        <div class="exp-name">${p.name}</div>
      </div>
    `);
  });
}

function updateUI() {
  agreeCountEl.textContent  = agree;
  rejectCountEl.textContent = reject;
}

async function sendVote(value) {
  if (hasVoted) return;
  disableButtons();
  btnBox.classList.add("hidden");
  statusEl.textContent = "送出中...";
  try {
    const res = await fetch(`/api/room/${roomId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voter: playerName, agree: value })
    });
    if (!res.ok) throw new Error();
    hasVoted = true;
    statusEl.textContent = "已送出";
  } catch {
    console.error("投票送出失敗");
  }
}

function disableButtons() {
  agreeBtn.disabled = rejectBtn.disabled = confirmBtn.disabled = true;
}

async function fetchAndShowResult() {
  try {
    const res = await fetch(`/api/room/${roomId}/vote-result`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    agree = data.agree;
    reject = data.reject;
    updateUI();
    resultBox.classList.remove("hidden");
    btnBox.classList.add("hidden");
    statusEl.textContent = "投票結束，結果：" + (agree > reject ? "通過" : "失敗");

    setTimeout(() => {
      const targetPage = agree > reject
        ? `/mission.html?roomId=${encodeURIComponent(roomId)}`
        : `/game-front-page.html?roomId=${encodeURIComponent(roomId)}`;
      window.location.replace(targetPage);
    }, 1500);
  } catch {
    statusEl.textContent = "無法取得投票結果，請稍後重試";
  }
}

function startCountdown(seconds) {
  let remaining = seconds;
  countdownEl.textContent = remaining;
  timer = setInterval(() => {
    remaining--;
    countdownEl.textContent = remaining;

    if (remaining <= 0) {
      clearInterval(timer);
      statusEl.textContent = "投票結束，正在統計結果...";
      if (!hasVoted) {
        sendVote(null); // 棄票
      }
      fetchAndShowResult();
    }
  }, 1000);
}

async function init() {
  await fetchPlayers();
  try {
    const res = await fetch(`/api/room/${roomId}/vote-state?player=${encodeURIComponent(playerName)}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    agree      = data.agree;
    reject     = data.reject;
    canVote    = data.canVote;
    hasVoted   = data.hasVoted;
    expedition = data.expedition || [];
    renderExpedition(expedition);
    updateUI();

    if (canVote && !hasVoted) {
      btnBox.classList.remove("hidden");
    }

    startCountdown(15);
  } catch {
    statusEl.textContent = "無法取得投票資訊";
  }
}

// ✅ 加入 WebSocket 監聽，預防投票後直接送任務卡造成錯過跳轉
function connectWebSocket() {
  const socket = new SockJS('/ws');
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    console.log("✅ vote.js WebSocket 已連線");
    stompClient.subscribe(`/topic/room/${roomId}`, msg => {
      console.log("📩 vote.js 收到訊息：", msg.body);
      if (msg.body === "allMissionCardsSubmitted") {
        console.log("🎯 vote.js 準備跳轉 skill.html（任務直接開始）");
        window.location.href = `/skill.html?roomId=${roomId}`;
      }
    });
  }, err => {
    console.error("❌ vote.js WebSocket 連線失敗", err);
  });
}

agreeBtn.addEventListener("click", () => {
  if (hasVoted) return;
  selectedVote = true;
  agreeBtn.classList.add("selected");
  rejectBtn.classList.remove("selected");
});

rejectBtn.addEventListener("click", () => {
  if (hasVoted) return;
  selectedVote = false;
  rejectBtn.classList.add("selected");
  agreeBtn.classList.remove("selected");
});

confirmBtn.addEventListener("click", () => {
  if (selectedVote === null || hasVoted) {
    alert("請先選擇同意或反對！");
    return;
  }
  sendVote(selectedVote);
});

document.addEventListener("DOMContentLoaded", () => {
  init();
  connectWebSocket(); // ✅ 初始化後連線 WebSocket
});
