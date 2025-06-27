const urlParams = new URLSearchParams(window.location.search);
const roomId    = urlParams.get("roomId");

const statusEl  = document.getElementById("mission-status");
const successEl = document.getElementById("success-count");
const failEl    = document.getElementById("fail-count");

async function fetchResult() {
  try {
    const res = await fetch(`/api/room/${roomId}/mission-result`, { method: "POST" });
    if (!res.ok) throw new Error();
    const data = await res.json();

    successEl.textContent = data.successCount;
    failEl.textContent    = data.failCount;
    statusEl.textContent  = data.success ? "🎉 任務成功！" : "❌ 任務失敗！";

    // ⏳ 延遲幾秒跳回下一輪遊戲頁（可自訂）
    setTimeout(() => {
      window.location.href = `/game-front-page.html?roomId=${roomId}`;
    }, 4000);

  } catch {
    statusEl.textContent = "❗ 結算失敗，請稍後重試";
  }
}

document.addEventListener("DOMContentLoaded", fetchResult);
