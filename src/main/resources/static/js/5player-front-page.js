const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName");

const positions = [
  { top: '3%', left: '55%' },
  { top: '3%', right: '55%' },
  { top: '40%', left: '20%' },
  { top: '40%', right: '20%' },
  { bottom: '30px', left: '50%', transform: 'translateX(-50%)' }
];

let myRole = null;

async function fetchPlayers() {
  try {
    const response = await fetch(`/api/room/${roomId}/players`);
    const players = await response.json();
    assignRoles(players);
  } catch (err) {
    console.error("❌ 無法載入玩家資料", err);
  }
}

function assignRoles(players) {
  const roles = [
    { name: "工程師", image: "goodpeople1.png" },
    { name: "普通倖存者", image: "goodpeople4.png" },
    { name: "普通倖存者", image: "goodpeople4.png" },
    { name: "潛伏者", image: "badpeople1.png" },
    { name: "邪惡平民", image: "badpeople4.png" }
  ];

  // 🔀 把角色與玩家都打亂
  shuffle(roles);
  shuffle(players);

  const assigned = players.map((p, i) => ({
    ...p,
    role: roles[i]
  }));

  renderPlayers(assigned);

  const self = assigned.find(p => p.name === playerName);
  if (self) {
    myRole = self.role;
    setTimeout(showRolePopup, 5000);
  }
}


function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function renderPlayers(players) {
  const container = document.getElementById("player-container");
  container.innerHTML = "";

  players.forEach((player, index) => {
    const card = document.createElement("div");
    const isSelf = player.name === playerName;
    card.className = isSelf ? "player-self" : "player-card";

    Object.entries(positions[index] || {}).forEach(([key, value]) => {
      card.style[key] = value;
    });

    card.innerHTML = `
      <div class="avatar">
        <img src="/images/${player.avatar}" alt="${player.name}">
      </div>
      <div class="name">${player.name}</div>
      ${isSelf ? `<div class="role-label" id="my-role-label"></div>` : ""}
    `;

    container.appendChild(card);
  });
}

function showRolePopup() {
  document.getElementById("role-title").textContent = `你是 ${myRole.name}`;
  document.getElementById("role-image").src = `/images/${myRole.image}`;
  document.getElementById("role-popup").classList.remove("hidden");
}

function closeRolePopup() {
  document.getElementById("role-popup").classList.add("hidden");
  const label = document.getElementById("my-role-label");
  if (label && myRole) {
    label.textContent = `角色：${myRole.name}`;
  }
}

document.addEventListener("DOMContentLoaded", fetchPlayers);
