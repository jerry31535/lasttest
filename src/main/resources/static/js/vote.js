// /js/vote.js
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

let players    = [];
let expedition = [];
let canVote    = false;
let hasVoted   = false;
let agree      = 0;
let reject     = 0;
let selectedVote = null;

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
  if (canVote && !hasVoted) {
    btnBox.classList.remove("hidden");
    resultBox.classList.add("hidden");
  } else {
    resultBox.classList.remove("hidden");
    btnBox.classList.add("hidden");
  }
}

async function sendVote(value) {
  if (hasVoted) return;
  disableButtons();
  statusEl.textContent = "送出中...";
  try {
    const res = await fetch(`/api/room/${roomId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voter: playerName, agree: value })
    });
    if (!res.ok) throw new Error();
    hasVoted = true;
    statusEl.textContent = "已送出，等待其他玩家...";
  } catch {
    statusEl.textContent = "投票失敗，請重新整理再試";
  }
}

function disableButtons() {
  agreeBtn.disabled = rejectBtn.disabled = confirmBtn.disabled = true;
}

function connectWS() {
  const stomp = Stomp.over(new SockJS("/ws"));
  stomp.connect({}, () => {
    stomp.subscribe(`/topic/vote/${roomId}`, msg => {
      const data = JSON.parse(msg.body);
      agree      = data.agree;
      reject     = data.reject;
      expedition = data.expedition || expedition;
      renderExpedition(expedition);
      updateUI();

      if (data.finished) {
        resultBox.classList.remove("hidden");
        btnBox.classList.add("hidden");
        statusEl.textContent = "投票結束，結果：" + (agree > reject ? "通過" : "失敗");
        setTimeout(() => {
          if (agree > reject) {
            window.location.replace(`/mission.html?roomId=${encodeURIComponent(roomId)}`);
          } else {
            window.location.replace(`/game-front-page.html?roomId=${encodeURIComponent(roomId)}`);
          }
        }, 1500);
      }
    });
  });
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
    connectWS();
  } catch {
    statusEl.textContent = "無法取得投票資訊";
  }
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

document.addEventListener("DOMContentLoaded", init);
