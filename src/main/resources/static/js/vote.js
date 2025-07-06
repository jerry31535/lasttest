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

    const passed = agree > reject;
    statusEl.textContent = `投票結束，結果：${passed ? "通過" : "失敗"}`;

    // ✅ 廣播給其他人 votePassed / voteFailed
    if (stompClient && stompClient.connected) {
      stompClient.send(`/app/vote/${roomId}`, {}, passed ? "votePassed" : "voteFailed");
    }

    setTimeout(() => {
      if (passed) {
        window.location.href = `/mission.html?roomId=${encodeURIComponent(roomId)}`;
      } else {
        sessionStorage.setItem("skipMission", "true"); // ✅ 不顯示任務結果彈窗
        window.location.href = `/game-front-page.html?roomId=${encodeURIComponent(roomId)}`;
      }
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

// ✅ WebSocket：收後端投票結果 → 控制轉場
function connectWebSocket() {
  const socket = new SockJS('/ws');
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    console.log("✅ vote.js WebSocket 已連線");

    // 任務卡送完 → 跳 skill 階段
    stompClient.subscribe(`/topic/room/${roomId}`, msg => {
      if (msg.body === "allMissionCardsSubmitted") {
        window.location.href = `/skill.html?roomId=${roomId}`;
      }
    });

    // 投票結果廣播 → 跳轉任務或主畫面
    stompClient.subscribe(`/topic/vote/${roomId}`, msg => {
      const body = msg.body.trim();
      if (body === "votePassed") {
        window.location.href = `/mission.html?roomId=${roomId}`;
      } else if (body === "voteFailed") {
        sessionStorage.setItem("skipMission", "true");
        window.location.href = `/game-front-page.html?roomId=${roomId}`;
      }
    });
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
  connectWebSocket();
});
