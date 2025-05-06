/* ========= 參數與全域變數 ========= */
const urlParams  = new URLSearchParams(window.location.search);
const roomId     = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName");

let players     = [];      // 後端 /players 取得
let myRole      = null;    // 自己角色
let leaderId    = null;    // 本回合領袖 (playerName)

/* 🔥 新增：選人流程狀態 */
let currentRound  = 1;     // 1~n，由後端或 WS 更新
let selectedOrder = [];    // 按順序存放被選玩家 name

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

/* ========= 選人彈窗 ========= */
function openSelectModal() {
  const maxPick = currentRound <= 3 ? 1 : 2;
  const candidates = players.filter(p => p.name !== leaderId);

  const listEl = document.getElementById('candidate-list');
  listEl.innerHTML = '';
  selectedOrder = [];

  candidates.forEach(p => {
    const li = document.createElement('li');
    li.dataset.name = p.name;
    li.innerHTML = `
      <span class="order"></span>
      <span>${p.name}</span>
    `;
    li.addEventListener('click', () => toggleSelect(li, maxPick));
    listEl.appendChild(li);
  });

  document.getElementById('select-title').textContent =
    `請選擇 ${maxPick} 名出戰人員 (剩 ${maxPick})`;

  document.getElementById('select-modal').classList.remove('hidden');
}

function toggleSelect(li, maxPick) {
  const name = li.dataset.name;
  const idx  = selectedOrder.indexOf(name);

  if (idx === -1) {                      // 新增
    if (selectedOrder.length >= maxPick) return;
    selectedOrder.push(name);
  } else {                               // 取消
    selectedOrder.splice(idx, 1);
  }

  document.querySelectorAll('#candidate-list li').forEach(li2 => {
    const orderEl = li2.querySelector('.order');
    const i = selectedOrder.indexOf(li2.dataset.name);
    if (i === -1) {
      li2.classList.remove('selected');
      orderEl.textContent = '';
    } else {
      li2.classList.add('selected');
      orderEl.textContent = i + 1;
    }
  });

  const remain = maxPick - selectedOrder.length;
  document.getElementById('select-title').textContent =
    `請選擇 ${maxPick} 名出戰人員 (剩 ${remain})`;
}

function closeSelectModal() {
  document.getElementById('select-modal').classList.add('hidden');
}

/* ========= 確認選人 → 呼叫後端 start‑vote ========= */
/* 🔥 更新：改為單一 async 函式 */
async function confirmSelection() {
  const maxPick = currentRound <= 3 ? 1 : 2;
  if (selectedOrder.length !== maxPick) {
    alert(`請選滿 ${maxPick} 人！`);
    return;
  }

  try {
    // 1. 通知後端：領袖 + 被選人
    await fetch(`/api/room/${roomId}/start-vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leader: playerName,
        expedition: selectedOrder
      })
    });

    // 2. 關閉彈窗並跳轉投票頁
    closeSelectModal();
    window.location.href = `/vote?roomId=${roomId}`;
  } catch (err) {
    console.error("❌ 無法開始投票", err);
    alert("後端連線失敗，請稍後再試！");
  }
}

/* ========= 將角色貼回 players 陣列並渲染 ========= */
function applyRolesToPlayers(roleMap) {
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
    window.players = players;
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
    leaderId = currentLeader;
    applyRolesToPlayers(assignedRoles);
  } catch (err) {
    console.error("❌ 無法取得角色資料", err);
  }
}

/* ========= WebSocket ========= */
function connectWebSocket() {
  if (!window.stompClient) {
    const socket = new SockJS('/ws');
    window.stompClient = Stomp.over(socket);
  }
  const stompClient = window.stompClient;
  if (stompClient.connected) return;

  stompClient.connect({}, () => {

    // ① 房間廣播：開始正式遊戲
    stompClient.subscribe(`/topic/room/${roomId}`, async msg => {
      if (msg.body.trim() === "startRealGame") await fetchAssignedRoles();
    });
  
    // ② 領袖廣播
    stompClient.subscribe(`/topic/leader/${roomId}`, msg => {
      leaderId = msg.body;
      renderPlayers(players);
    });
  
    // ③ 🔥 投票開始 → 非領袖玩家自動跳轉
    stompClient.subscribe(`/topic/vote/${roomId}`, () => {
      if (!location.pathname.startsWith("/vote")) {
        window.location.href = `/vote?roomId=${roomId}`;
      }
    });
  });
  
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetch(`/api/room/${roomId}/assign-roles`, { method: 'POST' });
  await fetchPlayers();
  await fetchAssignedRoles();
  connectWebSocket();
});

/* ========= 聊天室圖示 ========= */
function bindChatIcon() {
  const icon     = document.querySelector('.bottom-right .icon, img.icon[alt="聊天室"]');
  const overlay  = document.getElementById('chat-overlay');
  const closeBtn = document.getElementById('close-btn');

  if (!icon || !overlay) return;
  icon.addEventListener('click', () => overlay.classList.remove('hidden'));
  closeBtn?.addEventListener('click', () => overlay.classList.add('hidden'));
}
document.addEventListener('DOMContentLoaded', bindChatIcon);
