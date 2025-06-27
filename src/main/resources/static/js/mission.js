const urlParams  = new URLSearchParams(window.location.search);
const roomId     = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName");
const myRole     = localStorage.getItem("myRole");

const choicePanel  = document.getElementById("choice-panel");
const waitingPanel = document.getElementById("waiting-panel");
const successBtn   = document.getElementById("success-btn");
const failBtn      = document.getElementById("fail-btn");
const confirmBtn   = document.getElementById("confirm-btn");
const roleInfo     = document.getElementById("role-info");

let selected = null;
let stompClient = null;

if (!roomId || !playerName) {
  alert("錯誤：缺少 roomId 或 playerName，請重新進入房間");
  throw new Error("缺少必要資訊");
}

async function showRole() {
  const res = await fetch(`/api/room/${roomId}/roles`);
  const { assignedRoles } = await res.json();
  const role = assignedRoles[playerName]?.name;
  roleInfo.textContent = `你的角色：${role}`;
}

function renderButtons() {
  successBtn.textContent = "✔️ 成功";
  failBtn.textContent = "❌ 失敗";
  failBtn.disabled = false;
}

function connectWebSocket() {
  const socket = new SockJS('/ws');
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    console.log("✅ WebSocket 已連線");
    stompClient.subscribe(`/topic/room/${roomId}`, msg => {
      console.log("📩 收到訊息：", msg.body);
      if (msg.body === "allMissionCardsSubmitted") {
        console.log("🎯 準備跳轉 skill.html");
        window.location.href = `/skill.html?roomId=${roomId}`;
      }
    });
  }, err => {
    console.error("❌ WebSocket 連線失敗：", err);
  });
}

async function pollIfAllSubmitted() {
  try {
    const res = await fetch(`/api/room/${roomId}`);
    const data = await res.json();
    console.log("輪詢結果：", data); // ⬅️ 加這行
    if (data.missionSubmitted === true) {
      console.log("🔄 輪詢偵測到任務卡已全數提交");
      window.location.href = `/skill.html?roomId=${roomId}`;
    }
  } catch (err) {
    console.error("🔁 輪詢錯誤", err);
  }
}

function sendMissionCard(value) {
  if (!value) {
    alert("請先選擇一張卡片！");
    return;
  }

  fetch(`/api/room/${roomId}/submit-mission`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName, result: value })
  }).then(() => {
    choicePanel.classList.add("hidden");
    waitingPanel.classList.remove("hidden");
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await showRole();
  renderButtons();
  choicePanel.classList.remove("hidden");
  connectWebSocket();
});

successBtn.onclick = () => {
  selected = "success";
  successBtn.classList.add("selected");
  failBtn.classList.remove("selected");
  confirmBtn.disabled = false;
};

failBtn.onclick = () => {
  selected = "fail";
  failBtn.classList.add("selected");
  successBtn.classList.remove("selected");
  confirmBtn.disabled = false;
};

confirmBtn.onclick = () => {
  sendMissionCard(selected);
};

// Fallback 輪詢機制，每 3 秒一次
setInterval(pollIfAllSubmitted, 3000);
