/* ========= 參數與全域變數 ========= */
const urlParams   = new URLSearchParams(window.location.search);
const roomId      = urlParams.get("roomId");
const playerName  = sessionStorage.getItem("playerName");

let players   = [];   // 後端 /players 取得
let myRole    = null; // 自己的角色
let leaderId  = null; // 本回合領袖

// 只建立一次全域 STOMP 連線物件
if (!window.stompClient) window.stompClient = null;

/* ========= 6 人版固定座標（環形分佈） ========= */
const positions = [
  { top: '3%',   left: '50%', transform: 'translateX(-50%)' }, // 上方中
  { top: '20%',  right: '10%' },                              // 右上
  { top: '60%',  right: '10%' },                              // 右下
  { bottom: '3%', left: '50%', transform: 'translateX(-50%)' },// 下方中
  { top: '60%',  left: '10%' },                               // 左下
  { top: '20%',  left: '10%' }                                // 左上
];

/* ========= 依自己視角重新排序 ========= */
function reorderPlayers(arr) {
  const meIdx = arr.findIndex(p => p.name === playerName);
  if (meIdx === -1) return arr;
  const ordered = [];
  for (let i = 1; i < arr.length; i++) {
    ordered.push(arr[(meIdx + i) % arr.length]);
  }
  ordered.push(arr[meIdx]);
  return ordered;
}

/* ========= 渲染玩家卡片 ========= */
function renderPlayers(arr) {
  const container = document.getElementById("player-container");
  container.innerHTML = "";

  const ordered = reorderPlayers(arr);
  ordered.forEach((p, idx) => {
    const isSelf   = p.name === playerName;
    const isLeader = p.name === leaderId;

    const card = document.createElement("div");
    card.className =
      `player-card${isLeader ? " leader" : ""}${isSelf ? " player-self" : ""}`;

    // 套用第 idx 張卡的座標
    Object.entries(positions[idx] || {}).forEach(([k, v]) => {
      card.style[k] = v;
    });

    card.innerHTML = `
      <div class="avatar"><img src="/images/${p.avatar}" alt="${p.name}"></div>
      <div class="name">${p.name}</div>
      ${isSelf && p.role ? `<div class="role-label">角色：${p.role}</div>` : ""}
      ${isSelf && isLeader 
        ? `<button class="action-btn" onclick="openSelectModal()">選擇出戰人員</button>` 
        : ""}
    `;
    container.appendChild(card);
  });
}

/* ========= 將後端回傳的角色貼入 players 並重新渲染 ========= */
function applyRolesToPlayers(roleMap) {
  players = players.map(p => ({ ...p, role: roleMap[p.name]?.name }));
  renderPlayers(players);

  const self = players.find(p => p.name === playerName);
  if (self) {
    myRole = self.role;
    localStorage.setItem('myRole', myRole || "");
  }
}

/* ========= 從後端載入玩家列表 ========= */
async function fetchPlayers() {
  try {
    const res = await fetch(`/api/room/${roomId}/players`);
    players = await res.json();
    window.players = players; // 供 chatroom.js 查頭貼用
    renderPlayers(players);
  } catch (err) {
    console.error("❌ 無法載入玩家資料", err);
  }
}

/* ========= 從後端取得已分派的角色與領袖 ========= */
async function fetchAssignedRoles() {
  try {
    const res = await fetch(`/api/room/${roomId}/roles`);
    if (!res.ok) throw new Error("角色 API 失敗");

    const { assignedRoles, currentLeader } = await res.json();
    leaderId = currentLeader;
    applyRolesToPlayers(assignedRoles);
  } catch (err) {
    console.error("❌ 無法取得角色資料", err);
  }
}

/* ========= WebSocket 連線與訂閱 ========= */
function connectWebSocket() {
  if (!window.stompClient) {
    const socket = new SockJS('/ws');
    window.stompClient = Stomp.over(socket);
  }
  const stompClient = window.stompClient;
  if (stompClient.connected) return;

  stompClient.connect({}, () => {
    // 正式遊戲開始後，拉取分派結果
    stompClient.subscribe(`/topic/room/${roomId}`, async msg => {
      if (msg.body.trim() === "startRealGame") {
        await fetchAssignedRoles();
      }
    });
    // 領袖更新時即時重繪
    stompClient.subscribe(`/topic/leader/${roomId}`, msg => {
      leaderId = msg.body;
      renderPlayers(players);
    });
  });
}

/* ========= 領袖按鈕範例（可依需求改實作） ========= */
function openSelectModal() {
  alert("這裡彈出『選擇出戰人員』介面，請自行實作！");
}

/* ========= 綁定聊天室圖示開關 ========= */
function bindChatIcon(){
  const icon     = document.querySelector('.bottom-right .icon');
  const overlay  = document.getElementById('chat-overlay');
  const closeBtn = document.getElementById('close-btn');
  if (!icon || !overlay) return;
  icon.addEventListener('click', () => overlay.classList.remove('hidden'));
  closeBtn?.addEventListener('click', () => overlay.classList.add('hidden'));
}

/* ========= 初始化：分派角色 → 載入玩家 → 載入角色 → 連線 WS → 綁定聊天室 ========= */
document.addEventListener("DOMContentLoaded", async () => {
  await fetch(`/api/room/${roomId}/assign-roles`, { method: 'POST' });
  await fetchPlayers();
  await fetchAssignedRoles();
  connectWebSocket();
  bindChatIcon();
});
