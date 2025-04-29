/* ========= 參數與全域變數 ========= */
const urlParams  = new URLSearchParams(window.location.search);
const roomId     = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName");

let players  = [];        // 後端 /players 取得
let myRole   = null;      // 自己角色
let leaderId = null;      // ★ 本回合領袖 (playerName)

/* ★ 修改：採用 window 全域唯一連線物件 */
if (!window.stompClient) window.stompClient = null;

/* 固定座標 */
const positions = [
  { top: '3%',  left: '55%' },
  { top: '3%',  right: '55%' },
  { top: '40%', left: '20%' },
  { top: '40%', right: '20%' },
  { bottom: '30px', left: '50%', transform: 'translateX(-50%)' }
];

/* ========= 依自己視角排序 ========= */
function reorderPlayers(arr) {
  const meIdx = arr.findIndex(p => p.name === playerName);
  if (meIdx === -1) return arr;
  const ordered = [];
  for (let i = 1; i < arr.length; i++) ordered.push(arr[(meIdx + i) % arr.length]);
  ordered.push(arr[meIdx]);
  return ordered;
}

/* ========= 重新渲染卡片 ========= */
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

    Object.entries(positions[idx] || {}).forEach(([k, v]) => card.style[k] = v);

    card.innerHTML = `
      <div class="avatar"><img src="/images/${p.avatar}" alt="${p.name}"></div>
      <div class="name">${p.name}</div>
      ${isSelf && p.role ? `<div class="role-label">角色：${p.role}</div>` : ""}
      ${isSelf && isLeader ? `<button class="action-btn" onclick="openSelectModal()">選擇出戰人員</button>` : ""}
    `;
    container.appendChild(card);
  });
}

/* ========= 將角色貼回 players 陣列並渲染 ========= */
function applyRolesToPlayers(roleMap){
  players = players.map(p => ({ ...p, role: roleMap[p.name]?.name }));
  renderPlayers(players);

  const self = players.find(p => p.name === playerName);
  if (self) {
    myRole = self.role;
    localStorage.setItem('myRole', myRole || "");
  }
}

/* ========= 取得玩家清單 ========= */
async function fetchPlayers() {
  try {
    const res = await fetch(`/api/room/${roomId}/players`);
    players   = await res.json();
    window.players = players; // 供其他腳本使用
    renderPlayers(players);
  } catch (err) {
    console.error("❌ 無法載入玩家資料", err);
  }
}

/* ========= 取得角色 + 領袖 ========= */
async function fetchAssignedRoles() {
  try {
    const res = await fetch(`/api/room/${roomId}/roles`);
    if (!res.ok) throw new Error("角色 API 失敗");

    const { assignedRoles, currentLeader } = await res.json();
    leaderId = currentLeader;              // ★ 儲存領袖
    applyRolesToPlayers(assignedRoles);
  } catch (err) {
    console.error("❌ 無法取得角色資料", err);
  }
}

/* ========= WebSocket ========= */
function connectWebSocket() {

  /* ★ 修改：只建立一次連線，並重用全域物件 */
  if (!window.stompClient) {
    const socket = new SockJS('/ws');
    window.stompClient = Stomp.over(socket);
  }
  const stompClient = window.stompClient;
  if (stompClient.connected) return;      // 避免重複 connect

  stompClient.connect({}, () => {

    /* 收到房間事件：開始正式遊戲 */
    stompClient.subscribe(`/topic/room/${roomId}`, async msg => {
      if (msg.body.trim() === "startRealGame") await fetchAssignedRoles();
    });

    /* ★ 新增：收到領袖廣播即時更新 */
    stompClient.subscribe(`/topic/leader/${roomId}`, msg => {
      leaderId = msg.body;
      console.log('[leader update] new leaderId =', leaderId);   // ★ 修改：移除未定義變數
      renderPlayers(players);
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetch(`/api/room/${roomId}/assign-roles`, { method: 'POST' }); // ★
  await fetchPlayers();        // 基本資料
  await fetchAssignedRoles();  // 若已分派過角色/領袖
  connectWebSocket();
});

/* ========= 領袖按鈕範例行為 ========= */
function openSelectModal(){
  alert("這裡彈出『選擇出戰人員』介面，依你的實際需求實作！");
}

/* ---- 綁定聊天室圖示 ---- */
function bindChatIcon(){
  const icon     = document.querySelector('.bottom-right .icon, img.icon[alt="聊天室"]');
  const overlay  = document.getElementById('chat-overlay');
  const closeBtn = document.getElementById('close-btn');

  if(!icon || !overlay) return;   // DOM 尚未渲染

  icon.addEventListener('click', () => overlay.classList.remove('hidden'));
  closeBtn?.addEventListener('click',()=> overlay.classList.add('hidden'));
}
document.addEventListener('DOMContentLoaded', bindChatIcon);
