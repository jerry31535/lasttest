const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName");

const waitingPanel = document.getElementById("waiting-panel");
const skillPanel = document.getElementById("my-skill-panel");
const skillMsg = document.getElementById("skill-message");
const skillRoleLabel = document.getElementById("skill-role-label");
const nextSkillBtn = document.getElementById("next-skill-btn");

let myRole = null;

// ✅ 取得自己的角色
async function fetchMyRole() {
  const res = await fetch(`/api/room/${roomId}/roles`);
  const data = await res.json();
  return data.assignedRoles[playerName]?.name || null;
}

// ✅ WebSocket + 初始 skillState 判斷
function connectSkillPhase() {
  const socket = new SockJS('/ws');
  const stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/skill/${roomId}`, msg => {
      const body = msg.body.trim();
      console.log("🧠 技能階段接收到：", body);

      if (body === "allSkillUsed") {
        skillMsg.textContent = "所有技能發動完畢，返回遊戲畫面...";
        setTimeout(() => {
          window.location.href = `/game-front-page.html?roomId=${roomId}`;
        }, 2000);
      }
    });

    // ✅ 一開始抓目前技能角色清單
    fetch(`/api/room/${roomId}/skill-state`)
      .then(res => res.json())
      .then(data => {
        const skillRoles = data.remainingRoles || [];

        console.log("🧠 技能角色列表：", skillRoles);
        console.log("🧠 我的角色：", myRole);

        if (skillRoles.includes(myRole)) {
          skillRoleLabel.textContent = `角色：${myRole}`;
          waitingPanel.classList.add("hidden");
          skillPanel.classList.remove("hidden");
        } else {
          skillMsg.textContent = `你不是技能角色，請等待技能階段結束...`;
          waitingPanel.classList.remove("hidden");
          skillPanel.classList.add("hidden");
        }
      });
  });
}

// ✅ 20 秒倒數計時 + 結束跳轉
async function startCountdown(seconds) {
  const timerDisplay = document.getElementById("timer-value");
  let remaining = seconds;

  const interval = setInterval(async () => {
    timerDisplay.textContent = remaining;
    remaining--;

    if (remaining < 0) {
      clearInterval(interval);
      try {
        await fetch(`/api/room/${roomId}/skill-finish`, { method: "POST" });
      } catch (err) {
        console.error("❌ 無法通知技能結束", err);
      }
      window.location.href = `/game-front-page.html?roomId=${roomId}`;
    }
  }, 1000);
}

nextSkillBtn.addEventListener("click", () => {
  // ✅ 切換畫面至等待中
  skillPanel.classList.add("hidden");
  waitingPanel.classList.remove("hidden");
  skillMsg.textContent = "技能已使用，等待其他玩家結束...";
});

// ✅ 初始化
document.addEventListener("DOMContentLoaded", async () => {
  myRole = await fetchMyRole();
  if (!myRole) {
    alert("無法取得你的角色，請重新進入遊戲");
    return;
  }
  connectSkillPhase();
  startCountdown(20); // ⏱️ 開始倒數
});
