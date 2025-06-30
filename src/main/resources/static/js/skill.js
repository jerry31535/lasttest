const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName");

const waitingPanel = document.getElementById("waiting-panel");
const skillPanel = document.getElementById("my-skill-panel");
const skillMsg = document.getElementById("skill-message");
const useSkillBtn = document.getElementById("use-skill-btn");

// 監聽 skill 階段 WebSocket 廣播
function connectSkillPhase() {
  const socket = new SockJS('/ws');
  const stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/skill/${roomId}`, msg => {
      const body = msg.body.trim();
      console.log("🧠 收到技能階段消息：", body);

      if (body.startsWith("next:")) {
        const next = body.split(":")[1];
        if (next === playerName) {
          waitingPanel.classList.add("hidden");
          skillPanel.classList.remove("hidden");
        } else {
          skillMsg.textContent = `等待 ${next} 發動技能中...`;
        }
      }

      if (body === "allSkillUsed") {
        skillMsg.textContent = "所有技能已使用完，準備進入任務結算...";
        setTimeout(() => {
          window.location.href = `/result.html?roomId=${roomId}`;
        }, 2000);
      }
    });
  });
}

// 假發動技能 → 通知後端往下
useSkillBtn.addEventListener("click", async () => {
  useSkillBtn.disabled = true;
  await fetch(`/room/${roomId}/use-skill?player=${encodeURIComponent(playerName)}`, {
    method: "POST"
  });
});

document.addEventListener("DOMContentLoaded", () => {
  connectSkillPhase();
});
