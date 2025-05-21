const avatarImages = document.querySelectorAll('.avatar-option');
const startButton = document.querySelector('.start-button');
const roomId = window.location.pathname.split("/").pop();
let stompClient = null;
let allPlayersSelected = false;
let players = [];

// 玩家選擇頭像
avatarImages.forEach(img => {
  img.addEventListener('click', () => {
    avatarImages.forEach(i => i.classList.remove('selected'));
    img.classList.add('selected');
    const selectedAvatar = img.getAttribute('data-avatar');
    localStorage.setItem('selectedAvatar', selectedAvatar);
  });
});

// 確認頭像選擇
function confirmAvatar() {
  const selectedAvatar = localStorage.getItem("selectedAvatar");
  const playerName = sessionStorage.getItem("playerName");
  const confirmBtn = document.querySelector(".confirm-button");

  if (!selectedAvatar) return alert("請先選擇頭貼！");
  if (!playerName) return alert("尚未登入！");

  confirmBtn.disabled = true;
  

  fetch(`/api/room/${roomId}/select-avatar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName, avatar: selectedAvatar })
  }).catch(err => {
    console.error("❌ 確認頭貼失敗:", err);
    confirmBtn.disabled = false;
    confirmBtn.textContent = "確認頭貼";
  });
}

// 角色分配後，撈玩家列表 + 角色資訊
async function fetchAssignedRoles() {
  try {
    const response = await fetch(`/api/room/${roomId}/players`);
    players = await response.json();

    const roleRes = await fetch(`/api/room/${roomId}/roles`);
    if (!roleRes.ok) throw new Error("角色 API 失敗");

    const rolesMap = await roleRes.json();
    console.log("🎭 取得角色資訊", rolesMap);

    applyRolesToPlayers(rolesMap);
  } catch (err) {
    console.error("❌ 無法取得角色資料", err);
  }
}

function applyRolesToPlayers(rolesMap) {
  const playerName = sessionStorage.getItem("playerName");
  const assigned = players.map(p => ({
    ...p,
    role: rolesMap[p.name]
  }));

  const self = assigned.find(p => p.name === playerName);
  if (self) {
    console.log("🎉 顯示角色彈窗", self.role);
    myRole = self.role;
    setTimeout(showRolePopup, 500);
  }
}

function showRolePopup() {
  document.getElementById("role-title").textContent = `你是 ${myRole.name}`;
  document.getElementById("role-image").src = `/images/${myRole.image}`;
  document.getElementById("role-popup").classList.remove("hidden");
}

// 建立 WebSocket
function connectWebSocket() {
  const socket = new SockJS('/ws');
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/room/${roomId}`, async (message) => {
      const msg = message.body.trim();
      console.log("🛰️ 收到 WebSocket 訊息:", msg);

      if (msg === "allAvatarSelected") {
        allPlayersSelected = true;
        console.log("✅ 所有玩家已選好頭貼");

        const playerName = sessionStorage.getItem("playerName");
        try {
          const res = await fetch(`/api/start-real-game?roomId=${roomId}&playerName=${playerName}`, {
            method: "POST"
          });

          if (res.status === 409) {
            console.log("⚠️ 角色已分配過，略過");
            return;
          }

          const rolesMap = await res.json();
          console.log("🎯 我觸發了角色分配，回傳資料：", rolesMap);
        } catch (err) {
          console.error("❌ 分配角色失敗:", err);
        }
      }

      if (msg === "startRealGame") {
        console.log("✅ 收到開始遊戲通知，跳轉中...");
      
        // 先確認房間人數再決定跳轉
        fetch(`/api/room/${roomId}`)
          .then(res => res.json())
          .then(roomData => {
            const playerCount = roomData.playerCount;
            window.location.href = `/game-front-page.html?roomId=${roomId}`;
          })
          .catch(err => {
            console.error("❌ 取得房間資訊失敗", err);
            
          });
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

// 初始執行
document.addEventListener("DOMContentLoaded", () => {
  connectWebSocket();
  startButton.textContent = "等待其他玩家選擇頭貼...";
  startButton.disabled = true;
  const confirmBtn = document.querySelector(".confirm-button");
  confirmBtn.addEventListener("click", confirmAvatar);
  
});
