/* ========= 全域變數 ========= */
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

let players   = [];         // 從後端 /players 取得的 {name, avatar}
let expedition = [];        // 目前被提名玩家名單
let canVote    = false;
let hasVoted   = false;
let agree      = 0;
let reject     = 0;
let selectedVote = null;

/* ========= 後端 API ========= */
async function fetchPlayers() {
  const res = await fetch(`/api/room/${roomId}/players`);
  players   = await res.json();  // [{name, avatar}, ...]
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

/* ========= UI 更新 ========= */
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

/* ========= 送出投票 ========= */
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

/* ========= WebSocket ========= */
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

          if (agree > reject) {
            // 任務通過 → 所有人跳到 mission
            setTimeout(() => {
              window.location.replace(
                `/mission-5.html?roomId=${encodeURIComponent(roomId)}`
              );
            }, 1000);
          } else {
            // 任務失敗 → 回主畫面
            setTimeout(() => {
              window.location.replace(
                `/5player-front-page.html?roomId=${encodeURIComponent(roomId)}`
              );
            }, 2000);
          }
        }

    });
  });
}

/* ========= 初始化 ========= */
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

/* ========= 事件繫結 ========= */
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
