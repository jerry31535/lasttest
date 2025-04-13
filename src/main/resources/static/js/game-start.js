const avatarImages = document.querySelectorAll('.avatar-option');
const startButton = document.querySelector('.start-button');
const roomId = window.location.pathname.split("/").pop();
let stompClient = null;
let allPlayersSelected = false;

// 🧠 玩家選擇頭像，儲存並通知後端
avatarImages.forEach(img => {
  img.addEventListener('click', async () => {
    avatarImages.forEach(i => i.classList.remove('selected'));
    img.classList.add('selected');

    const selectedAvatar = img.getAttribute('data-avatar');
    localStorage.setItem('selectedAvatar', selectedAvatar);

    const playerName = sessionStorage.getItem("playerName");
    if (!playerName) return;

    try {
      await fetch(`/api/room/${roomId}/select-avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, avatar: selectedAvatar })
      });
    } catch (err) {
      console.error("❌ 選擇頭像失敗:", err);
    }
  });
});

// 🧠 房主手動觸發開始遊戲
function startGameNow() {
  if (!allPlayersSelected) {
    alert("還有玩家尚未選擇頭貼！");
    return;
  }

  const playerName = sessionStorage.getItem("playerName");
  fetch(`/api/start-real-game?roomId=${roomId}&playerName=${playerName}`, {
    method: "POST"
  });
}

// 🧠 連接 WebSocket，監聽頭貼選擇進度與遊戲開始訊號
function connectWebSocket() {
  const socket = new SockJS('/ws');
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
      const msg = message.body.trim();
      console.log("🛰️ 收到 WebSocket 訊息:", msg);

      if (msg === "allAvatarSelected") {
        allPlayersSelected = true;
        console.log("✅ 所有玩家已選好，跳轉正式遊戲");
        window.location.href = `/game-play/${roomId}`;
      }

      if (msg === "startRealGame") {
        console.log("✅ 房主已觸發正式開始");
        window.location.href = `/game-play/${roomId}`;
      }

      if (msg.startsWith("avatarSelected:")) {
        const name = msg.split(":")[1];
        console.log(`✅ ${name} 已選擇頭貼`);
      }
    });
  }, function (error) {
    console.error("❌ WebSocket 連線失敗:", error);
  });
}

// 🧠 頁面載入時初始化
document.addEventListener("DOMContentLoaded", () => {
  connectWebSocket();
  startButton.textContent = "等待其他玩家選擇頭貼...";
  startButton.disabled = true;
});
