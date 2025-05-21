// /js/mission.js
const urlParams   = new URLSearchParams(window.location.search);
const roomId      = urlParams.get("roomId");
const playerName  = sessionStorage.getItem("playerName");

const choicePanel  = document.getElementById("choice-panel");
const waitingPanel = document.getElementById("waiting-panel");
const successBtn   = document.getElementById("success-btn");
const failBtn      = document.getElementById("fail-btn");
const confirmBtn   = document.getElementById("confirm-btn");

let expedition = [];
let selected = null;

async function fetchExpedition() {
  try {
    const res = await fetch(`/api/room/${roomId}/vote-state?player=${encodeURIComponent(playerName)}`);
    const data = await res.json();
    expedition = data.expedition || [];
    showPanel();
  } catch {
    alert("無法取得任務資訊");
  }
}

function showPanel() {
  if (expedition.includes(playerName)) {
    choicePanel.classList.remove("hidden");
    waitingPanel.classList.add("hidden");
  } else {
    waitingPanel.classList.remove("hidden");
    choicePanel.classList.add("hidden");
  }
}

successBtn.addEventListener("click", () => {
  selected = "SUCCESS";
  successBtn.classList.add("selected");
  failBtn.classList.remove("selected");
  confirmBtn.disabled = false;
});

failBtn.addEventListener("click", () => {
  selected = "FAIL";
  failBtn.classList.add("selected");
  successBtn.classList.remove("selected");
  confirmBtn.disabled = false;
});

confirmBtn.addEventListener("click", async () => {
  if (!selected) return;
  successBtn.disabled = failBtn.disabled = confirmBtn.disabled = true;
  try {
    await fetch(`/api/room/${roomId}/mission-result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player: playerName, result: selected })
    });
    confirmBtn.textContent = "已確認";
  } catch {
    alert("提交失敗，請稍後再試");
  }
});

document.addEventListener("DOMContentLoaded", fetchExpedition);
