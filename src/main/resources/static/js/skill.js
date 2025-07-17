const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName");

const waitingPanel = document.getElementById("waiting-panel");
const skillPanel = document.getElementById("my-skill-panel");
const skillMsg = document.getElementById("skill-message");
const skillRoleLabel = document.getElementById("skill-role-label");

const engineerPanel = document.getElementById("engineer-panel");
const successCountEl = document.getElementById("success-count");
const failCountEl = document.getElementById("fail-count");

const lurkerPanel = document.getElementById("lurker-panel");
const lurkerSelect = document.getElementById("lurker-target-select");
const lurkerBtn = document.getElementById("use-lurker-skill-btn");
const lurkerStatus = document.getElementById("lurker-status-msg");

let myRole = null;

// ✅ 初始化
document.addEventListener("DOMContentLoaded", async () => {
  myRole = await fetchMyRole();
  if (!myRole) {
    alert("無法取得你的角色，請重新進入遊戲");
    return;
  }

  if (myRole === "潛伏者") {
    await fetchLurkerTargets(); // 初始化選項
  }

  connectSkillPhase();
  startCountdown(20);
});

// ✅ 取得自己的角色
async function fetchMyRole() {
  const res = await fetch(`/api/room/${roomId}/roles`);
  const data = await res.json();
  return data.assignedRoles[playerName]?.name || null;
}

// ✅ WebSocket 連線 + 技能流程啟動
function connectSkillPhase() {
  const socket = new SockJS('/ws');
  const stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/skill/${roomId}`, msg => {
      const body = msg.body.trim();
      console.log("🧠 技能廣播：", body);

      if (body === "allSkillUsed") {
        skillMsg.textContent = "所有技能發動完畢，返回遊戲畫面...";
        setTimeout(() => {
          window.location.href = `/game-front-page.html?roomId=${roomId}`;
        }, 2000);
      }
    });

    // 取得目前輪到的技能角色列表
    fetch(`/api/room/${roomId}/skill-state`)
      .then(res => res.json())
      .then(data => {
        const skillRoles = data.remainingRoles || [];
        console.log("技能角色列表：", skillRoles);
        console.log("我的角色：", myRole);

        if (skillRoles.includes(myRole)) {
          skillRoleLabel.textContent = `角色：${myRole}`;
          waitingPanel.classList.add("hidden");
          skillPanel.classList.remove("hidden");

          if (myRole === "工程師") {
            showEngineerResult();
          }

          if (myRole === "潛伏者") {
            lurkerPanel.classList.remove("hidden");
          }
        } else {
          skillMsg.textContent = "你不是技能角色，請等待技能階段結束...";
          waitingPanel.classList.remove("hidden");
          skillPanel.classList.add("hidden");
        }
      });
  });
}

// ✅ 工程師：顯示任務卡成功/失敗數量
async function showEngineerResult() {
  try {
    const res = await fetch(`/api/room/${roomId}`);
    const room = await res.json();
    const round = room.currentRound;
    const result = room.missionResults?.[round];

    engineerPanel.classList.remove("hidden");

    if (result) {
      successCountEl.textContent = result.successCount;
      failCountEl.textContent = result.failCount;
    } else {
      successCountEl.textContent = "尚未送出";
      failCountEl.textContent = "尚未送出";
    }
  } catch (err) {
    console.error("❌ 工程師任務結果讀取失敗", err);
  }
}

// ✅ 潛伏者：載入當回合所有出戰玩家（不能選自己）
async function fetchLurkerTargets() {
  try {
    const res = await fetch(`/api/room/${roomId}/mission-submissions`);
    const data = await res.json(); // { playerName: "SUCCESS" | "FAIL" }

    lurkerSelect.innerHTML = `<option value="">-- 選擇要反轉的玩家 --</option>`;
    Object.keys(data).forEach(player => {
      if (player !== playerName) {
        const option = document.createElement("option");
        option.value = player;
        option.textContent = `${player}（已提交）`;
        lurkerSelect.appendChild(option);
      }
    });
  } catch (err) {
    console.error("❌ 潛伏者無法取得出戰任務列表", err);
  }
}

// ✅ 潛伏者：點擊技能按鈕
lurkerBtn.addEventListener("click", async () => {
  const selected = lurkerSelect.value;
  lurkerStatus.textContent = "";

  if (!selected) {
    lurkerStatus.textContent = "請選擇要反轉的玩家。";
    return;
  }

  try {
    const res = await fetch(`/api/skill/lurker-toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        playerName,
        targetName: selected
      })
    });

    if (res.ok) {
      lurkerStatus.textContent = "✅ 技能使用成功，該玩家卡片屬性已反轉";
      lurkerBtn.disabled = true;
    } else {
      const errMsg = await res.text();
      lurkerStatus.textContent = "❌ 使用失敗：" + errMsg;
    }
  } catch (err) {
    lurkerStatus.textContent = "❌ 發送請求錯誤：" + err;
  }
});

// ✅ 倒數計時器
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
        console.error("❌ 無法通知技能階段結束", err);
      }
      window.location.href = `/game-front-page.html?roomId=${roomId}`;
    }
  }, 1000);
}
