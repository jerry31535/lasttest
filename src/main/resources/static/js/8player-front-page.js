/* ========= 參數 & 全域狀態 ========= */
const urlParams    = new URLSearchParams(window.location.search);
const roomId       = urlParams.get("roomId");
const playerName   = sessionStorage.getItem("playerName");
let players = [], myRole = null, leaderId = null, currentRound = 1, selectedOrder = [];

if (!window.stompClient) window.stompClient = null;

/* ========= 7 人版固定座標 ========= */
const positions = [
  { top: '3%',   left: '50%', transform: 'translateX(-50%)' }, //0
  { top: '10%',  right: '10%' },                              //1
  { top: '40%',  right: '3%' },                               //2
  { bottom:'10%', right: '10%' },                             //3
  { bottom:'3%',  left: '50%', transform: 'translateX(-50%)'},//4
  { bottom:'10%', left: '10%' },                              //5
  { top: '40%',  left: '3%' },                                //6
  { top: '10%',  left: '10%' }                                //7
]

/* ========= 出戰人數依回合 ========= */
function getMaxPick(round){ return round <= 3 ? 2 : 3; }

/* ========= 玩家排序 & 渲染 ========= */
function reorderPlayers(arr){
  const idx = arr.findIndex(p => p.name === playerName);
  if (idx < 0) return arr;
  const out = [];
  for (let i = 1; i < arr.length; i++) out.push(arr[(idx + i) % arr.length]);
  out.push(arr[idx]);
  return out;
}
function renderPlayers(arr){
  const c = document.getElementById("player-container");
  c.innerHTML = "";
  reorderPlayers(arr).forEach((p, i) => {
    const isSelf = p.name === playerName,
          isLeader = p.name === leaderId;
    const card = document.createElement("div");
    card.className = `player-card${isLeader?" leader":""}${isSelf?" player-self":""}`;
    Object.entries(positions[i]||{}).forEach(([k,v])=>card.style[k]=v);
    card.innerHTML = `
      <div class="avatar"><img src="/images/${p.avatar}" alt="${p.name}"></div>
      <div class="name">${p.name}</div>
      ${isSelf&&p.role?`<div class="role-label">角色：${p.role}</div>`:""}
      ${isSelf&&isLeader?`<button class="action-btn" onclick="openSelectModal()">選擇出戰人員</button>`:""}
    `;
    c.appendChild(card);
  });
  document.getElementById("leader-action")
          .classList.toggle("hidden", leaderId !== playerName);
}

/* ========= 選人彈窗 ========= */
function openSelectModal(){
  const max = getMaxPick(currentRound),
        list = document.getElementById("candidate-list");
  list.innerHTML = ""; selectedOrder = [];
  players.forEach(p => {
    const li = document.createElement("li");
    li.dataset.name = p.name;
    li.innerHTML = `<span class="order"></span><span>${p.name}</span>`;
    li.onclick = () => toggleSelect(li, max);
    list.appendChild(li);
  });
  document.getElementById("select-title")
          .textContent = `請選擇 ${max} 名出戰人員 (剩 ${max})`;
  document.getElementById("select-modal").classList.remove("hidden");
}
function toggleSelect(li, max){
  const name = li.dataset.name,
        idx = selectedOrder.indexOf(name);
  if (idx === -1) {
    if (selectedOrder.length >= max) return;
    selectedOrder.push(name);
  } else {
    selectedOrder.splice(idx, 1);
  }
  document.querySelectorAll("#candidate-list li").forEach(el => {
    const o = selectedOrder.indexOf(el.dataset.name);
    el.classList.toggle("selected", o !== -1);
    el.querySelector(".order").textContent = o === -1 ? "" : (o + 1);
  });
  const rem = max - selectedOrder.length;
  document.getElementById("select-title")
          .textContent = `請選擇 ${max} 名出戰人員 (剩 ${rem})`;
}
function closeSelectModal(){
  document.getElementById("select-modal").classList.add("hidden");
}
async function confirmSelection(){
  if (selectedOrder.length !== getMaxPick(currentRound)) {
    alert(`請選滿 ${getMaxPick(currentRound)} 人！`);
    return;
  }
  try {
    await fetch(`/api/room/${roomId}/start-vote`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ leader: playerName, expedition: selectedOrder })
    });
    closeSelectModal();
  } catch(e){
    console.error(e);
    alert("無法開始投票，請稍後再試！");
  }
}

/* ========= 角色 & WS ========= */
function applyRolesToPlayers(map){
  players = players.map(p => ({ ...p, role: map[p.name]?.name }));
  renderPlayers(players);
  const self = players.find(p => p.name === playerName);
  if (self) {
    myRole = self.role;
    localStorage.setItem("myRole", myRole);
  }
}
async function fetchPlayers(){
  const res = await fetch(`/api/room/${roomId}/players`);
  players = await res.json();
  renderPlayers(players);
}
async function fetchAssignedRoles(){
  const res = await fetch(`/api/room/${roomId}/roles`);
  if (!res.ok) throw new Error("角色 API 失敗");
  const { assignedRoles, currentLeader } = await res.json();
  leaderId = currentLeader;
  applyRolesToPlayers(assignedRoles);
}
function connectWebSocket(){
  if (!window.stompClient) {
    window.stompClient = Stomp.over(new SockJS('/ws'));
  }
  const cli = window.stompClient;
  if (cli.connected) return;
  cli.connect({}, () => {
    cli.subscribe(`/topic/room/${roomId}`, async msg => {
      if (msg.body.trim() === "startRealGame") {
        await fetchAssignedRoles();
      }
    });
    cli.subscribe(`/topic/leader/${roomId}`, msg => {
      leaderId = msg.body;
      renderPlayers(players);
    });
    cli.subscribe(`/topic/vote/${roomId}`, () => {
      window.location.href = `/vote?roomId=${roomId}`;
    });
  });
}

/* ========= 聊天室切換 ========= */
function bindChatIcon(){
  const icon = document.querySelector(".bottom-right .icon"),
        overlay = document.getElementById("chat-overlay"),
        closeBtn = document.getElementById("close-btn");
  icon?.addEventListener("click", () => overlay.classList.remove("hidden"));
  closeBtn?.addEventListener("click", () => overlay.classList.add("hidden"));
}

/* ========= 啟動 ========= */
document.addEventListener("DOMContentLoaded", async () => {
  await fetch(`/api/room/${roomId}/assign-roles`, { method: 'POST' });
  await fetchPlayers();
  await fetchAssignedRoles();
  document.getElementById("select-expedition-btn")
          .addEventListener("click", openSelectModal);
  connectWebSocket();
  bindChatIcon();
});
