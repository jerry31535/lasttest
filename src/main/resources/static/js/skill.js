const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName");

const waitingPanel = document.getElementById("waiting-panel");
const skillPanel = document.getElementById("my-skill-panel");
const skillMsg = document.getElementById("skill-message");
const skillRoleLabel = document.getElementById("skill-role-label");
const nextSkillBtn = document.getElementById("next-skill-btn");

let myRole = null; // ✅ 不再從 localStorage 拿

// ✅ 從後端取得自己的角色名稱
async function fetchMyRole() {
  const res = await fetch(`/api/room/${roomId}/roles`);
  const data = await res.json();
  return data.assignedRoles[playerName]?.name || null;
}
function connectSkillPhase() {
  const socket = new SockJS('/ws');
  const stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/skill/${roomId}`, msg => {
      const body = msg.body.trim();
      console.log("🧠 技能階段接收到：", body);

      if (body.startsWith("next:")) {
        const nextRole = body.split(":")[1];

        if (myRole === nextRole) {
          skillRoleLabel.textContent = `角色：${myRole}`;
          waitingPanel.classList.add("hidden");
          skillPanel.classList.remove("hidden");
        } else {
          skillMsg.textContent = `等待 ${nextRole} 使用技能...`;
          waitingPanel.classList.remove("hidden");
          skillPanel.classList.add("hidden");
        }
      }

      if (body === "allSkillUsed") {
        skillMsg.textContent = "所有技能發動完畢，返回遊戲畫面...";
        setTimeout(() => {
          window.location.href = `/game-front-page.html?roomId=${roomId}`;
        }, 2000);
      }
    });

    // 初次進入時抓目前輪到誰
    fetch(`/api/room/${roomId}/skill-state`)
      .then(res => res.json())
      .then(data => {
        const current = data.currentSkillRole;
        if (myRole === current) {
          skillRoleLabel.textContent = `角色：${myRole}`;
          waitingPanel.classList.add("hidden");
          skillPanel.classList.remove("hidden");
        } else {
          skillMsg.textContent = `等待 ${current} 使用技能...`;
          waitingPanel.classList.remove("hidden");
          skillPanel.classList.add("hidden");
        }
      });
  });
}

// ✅ 當玩家按下「下一位」，通知後端輪替
nextSkillBtn.addEventListener("click", async () => {
  nextSkillBtn.disabled = true;
  await fetch(`api/room/${roomId}/next-skill`, { method: "POST" });
});

// ✅ 初始化（不使用 localStorage 判斷角色）
document.addEventListener("DOMContentLoaded", async () => {
  myRole = await fetchMyRole();
  if (!myRole) {
    alert("無法取得你的角色，請重新進入遊戲");
    return;
  }
  connectSkillPhase();
});
