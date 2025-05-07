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

let canVote   = false;
let hasVoted  = false;
let agree     = 0;
let reject    = 0;
let total     = 0;
let selectedVote = null; // 🔥 新增：記錄使用者的選擇

async function init() {
  try {
    const res = await fetch(`/api/room/${roomId}/vote-state?player=${encodeURIComponent(playerName)}`);
    if (!res.ok) throw new Error("vote‑state 取得失敗");

    const data = await res.json();
    agree     = data.agree;
    reject    = data.reject;
    total     = data.total;
    canVote   = data.canVote;
    hasVoted  = data.hasVoted;

    updateUI();
    connectWS();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "無法取得投票資訊";
  }
}

function updateUI() {
  agreeCountEl.textContent  = agree;
  rejectCountEl.textContent = reject;

  if (canVote) {
    btnBox.classList.remove("hidden");
    resultBox.classList.add("hidden");
    if (hasVoted) {
      disableButtons();
      statusEl.textContent = "已投票，請等待其他玩家...";
    }
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
    if (!res.ok) throw new Error("投票失敗");
    hasVoted = true;
    statusEl.textContent = "已送出，等待其他玩家...";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "投票失敗，請重新整理再試";
  }
}

function disableButtons() {
  agreeBtn.disabled = true;
  rejectBtn.disabled = true;
  confirmBtn.disabled = true;
}

function connectWS() {
  const socket = new SockJS("/ws");
  const stomp  = Stomp.over(socket);
  stomp.connect({}, () => {
    stomp.subscribe(`/topic/vote/${roomId}`, msg => {
      const data = JSON.parse(msg.body);
      agree  = data.agree;
      reject = data.reject;
      updateUI();
      if (data.finished) {
        const target = agree >= reject
          ? `/expedition?roomId=${encodeURIComponent(roomId)}`
          : `/5player-front-page.html?roomId=${encodeURIComponent(roomId)}`;
        window.location.replace(target);
      }
    });
  });
}

// 🔥 同意／反對選擇與視覺提示
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
