// -------------- src/main/resources/static/js/5player-front-page.js --------------

const urlParams = new URLSearchParams(window.location.search);  
const roomId = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName");

let players = [];
let myRole = null;

// 位置陣列：前四格環繞＋最後一格下方中央
const positions = [
  { top: '3%',    left: '55%' },
  { top: '3%',    right: '55%' },
  { top: '40%',   left: '20%' },
  { top: '40%',   right: '20%' },
  { bottom: '30px', left: '50%', transform: 'translateX(-50%)' }
];

/**
 * 將當前玩家排到陣列最後面，其餘玩家依原始順序填滿前四格
 */
function reorderPlayers(players) {
  const meIndex = players.findIndex(p => p.name === playerName);
  if (meIndex === -1) return players;
  const ordered = [];
  for (let i = 1; i < players.length; i++) {
    ordered.push(players[(meIndex + i) % players.length]);
  }
  ordered.push(players[meIndex]);
  return ordered;
}

async function fetchPlayers() {
  try {
    const response = await fetch(`/api/room/${roomId}/players`);
    players = await response.json();
    renderPlayers(players);
  } catch (err) {
    console.error("❌ 無法載入玩家資料", err);
  }
}

async function fetchAssignedRoles() {
  try {
    // 重新抓一次玩家（確保 avatar 資料最新）
    const respPlayers = await fetch(`/api/room/${roomId}/players`);
    players = await respPlayers.json();

    // 抓角色對應表
    const roleRes = await fetch(`/api/room/${roomId}/roles`);
    if (!roleRes.ok) throw new Error("角色 API 失敗");
    const rolesMap = await roleRes.json();
    console.log("🎭 從資料庫取得角色資訊", rolesMap);

    applyRolesToPlayers(rolesMap);
  } catch (err) {
    console.error("❌ 無法取得角色資料", err);
  }
}

function applyRolesToPlayers(rolesMap) {
  // **只**在每個 player 物件上新增 role，不修改 avatar
  const assigned = players.map(p => ({
    ...p,
    role: rolesMap[p.name]?.name  // 角色名稱字串
  }));

  renderPlayers(assigned);

  const self = assigned.find(p => p.name === playerName);
  if (self) {
    myRole = self.role;
    console.log("👤 我的角色是：", myRole);
  }
}

function renderPlayers(players) {
  const container = document.getElementById("player-container");
  container.innerHTML = "";

  // 先排好順序：把自己移到最後 (positions[4])
  const orderedPlayers = reorderPlayers(players);

  orderedPlayers.forEach((player, index) => {
    const card = document.createElement("div");
    const isSelf = player.name === playerName;
    card.className = isSelf ? "player-self" : "player-card";

    // 套用位置
    Object.entries(positions[index] || {}).forEach(([key, value]) => {
      card.style[key] = value;
    });

    card.innerHTML = `
      <div class="avatar">
        <!-- 這裡的 avatar 永遠是 headshot，不被覆寫 -->
        <img src="/images/${player.avatar}" alt="${player.name}">
      </div>
      <div class="name">${player.name}</div>
      ${
        isSelf && player.role
          ? `<div class="role-label">角色：${player.role}</div>`
          : ""
      }
    `;
    container.appendChild(card);
  });
}

function connectWebSocket() {
  const socket = new SockJS('/ws');
  const stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/room/${roomId}`, async (message) => {
      if (message.body.trim() === "startRealGame") {
        await fetchAssignedRoles();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchPlayers();
  await fetchAssignedRoles();
  connectWebSocket();
});
