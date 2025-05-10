// /js/mission-5.js
const urlParams   = new URLSearchParams(window.location.search);
const roomId      = urlParams.get("roomId");
const playerName  = sessionStorage.getItem("playerName");

const choicePanel  = document.getElementById("choice-panel");
const waitingPanel = document.getElementById("waiting-panel");
const successBtn   = document.getElementById("success-btn");
const failBtn      = document.getElementById("fail-btn");
const confirmBtn   = document.getElementById("confirm-btn");

let expedition = [];

// 取得當前 expedi​​tion 名單
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

// 顯示對應面板
function showPanel() {
  if (expedition.includes(playerName)) {
    // 出戰玩家
    choicePanel.classList.remove("hidden");
    waitingPanel.classList.add("hidden");
  } else {
    // 非出戰玩家
    waitingPanel.classList.remove("hidden");
    choicePanel.classList.add("hidden");
  }
}

// 按鈕互動
let selected = null;
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
  // 鎖定後不可再改
  successBtn.disabled = failBtn.disabled = confirmBtn.disabled = true;
  // TODO: 可以在這裡呼叫後端 API 提交卡片結果
  // await fetch(`/api/room/${roomId}/mission-result`, { method: "POST", body: JSON.stringify({ player: playerName, result: selected }) });
  confirmBtn.textContent = "已確認";
});

document.addEventListener("DOMContentLoaded", fetchExpedition);
