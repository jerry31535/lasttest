const urlParams  = new URLSearchParams(window.location.search);
const roomId     = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName");
const myRole     = localStorage.getItem("myRole");

const skillZone  = document.getElementById("skill-action-zone");
const roleDesc   = document.getElementById("role-skill-description");
const waitingMsg = document.getElementById("waiting-msg");

let stompClient;

function showWaiting() {
  skillZone.innerHTML = "";
  waitingMsg.classList.remove("hidden");
}

function connectWebSocket() {
  const socket = new SockJS('/ws');
  stompClient = Stomp.over(socket);
  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/room/${roomId}`, msg => {
      if (msg.body === "allSkillUsed") {
        window.location.href = `/result.html?roomId=${roomId}`;
      }
    });
  });
}

function sendSkillUsed() {
  fetch(`/api/room/${roomId}/use-skill?playerName=${encodeURIComponent(playerName)}`, {
    method: "POST"
  }).then(showWaiting);
}

function renderSkillUI(role) {
  roleDesc.textContent = `你是【${role}】，請執行你的技能效果。`;

  if (role === "指揮官") {
    fetch(`/api/room/${roomId}/players`)
      .then(res => res.json())
      .then(data => {
        const select = document.createElement("select");
        data.forEach(p => {
          if (p.name !== playerName) {
            const opt = document.createElement("option");
            opt.value = p.name;
            opt.textContent = p.name;
            select.appendChild(opt);
          }
        });

        const btn = document.createElement("button");
        btn.textContent = "查看陣營";
        btn.onclick = async () => {
          const target = select.value;
          const res = await fetch(`/api/skill/commander-check?roomId=${roomId}&target=${target}`);
          const { camp } = await res.json();
          alert(`${target} 的陣營是：${camp}`);
          sendSkillUsed();
        };

        skillZone.appendChild(select);
        skillZone.appendChild(btn);
      });
  }

  else if (role === "工程師") {
    fetch(`/api/room/${roomId}/players`)
      .then(res => res.json())
      .then(data => {
        const select = document.createElement("select");
        data.forEach(p => {
          if (p.name !== playerName) {
            const opt = document.createElement("option");
            opt.value = p.name;
            opt.textContent = p.name;
            select.appendChild(opt);
          }
        });

        const btn = document.createElement("button");
        btn.textContent = "偵測是否為邪惡方";
        btn.onclick = async () => {
          const target = select.value;
          const res = await fetch(`/api/skill/engineer-scan?roomId=${roomId}&target=${target}`);
          const { isEvil } = await res.json();
          alert(`${target} 是 ${isEvil ? "邪惡方" : "正義方"}！`);
          sendSkillUsed();
        };

        skillZone.appendChild(select);
        skillZone.appendChild(btn);
      });
  }

  else if (role === "普通倖存者" || role === "邪惡平民") {
    const btn = document.createElement("button");
    btn.textContent = "我已完成";
    btn.onclick = sendSkillUsed;
    skillZone.appendChild(btn);
  }

  else {
    const btn = document.createElement("button");
    btn.textContent = `使用 ${role} 技能`;
    btn.onclick = sendSkillUsed;
    skillZone.appendChild(btn);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderSkillUI(myRole);
  connectWebSocket();
});
