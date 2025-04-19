const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName"); // 🟢 加上這行！

const positions = [
  { top: '3%', left: '55%' },
  { top: '3%', right: '55%' },
  { top: '40%', left: '20%' },
  { top: '40%', right: '20%' },
  { bottom: '30px', left: '50%', transform: 'translateX(-50%)' }
];

async function fetchPlayers() {
  try {
    const response = await fetch(`/api/room/${roomId}/players`);
    const players = await response.json();
    console.log("✅ 載入玩家資料：", players); // 🟢 debug log
    renderPlayers(players);
  } catch (err) {
    console.error("❌ 無法載入玩家資料", err);
  }
}

function renderPlayers(players) {
  const container = document.getElementById("player-container");

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
    `;

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", fetchPlayers);
