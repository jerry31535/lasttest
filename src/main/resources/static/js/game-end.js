// /js/game-end.js
document.addEventListener("DOMContentLoaded", async () => {
  const roomId = new URLSearchParams(window.location.search).get("roomId");
  const resultEl = document.getElementById("result-message");

  if (!roomId) {
    resultEl.textContent = "無法取得房間 ID";
    return;
  }

  try {
    const res = await fetch(`/api/room/${roomId}`);
    const room = await res.json();
    const success = room.successCount || 0;
    const fail = room.failCount || 0;

    if (success > fail) {
      resultEl.textContent = `✅ 正方勝利！成功卡 ${success}，失敗卡 ${fail}`;
    } else if (fail > success) {
      resultEl.textContent = `❌ 反方勝利！失敗卡 ${fail}，成功卡 ${success}`;
    } else {
      resultEl.textContent = `⚖️ 雙方平手！成功 ${success}、失敗 ${fail}`;
    }
  } catch (err) {
    console.error("❌ 無法載入結局資料", err);
    resultEl.textContent = "無法取得遊戲結果，請稍後再試";
  }
});
