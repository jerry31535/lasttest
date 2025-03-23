// 從後端獲取房間資訊並顯示
async function loadRoomData() {
    const roomId = window.location.pathname.split("/").pop(); // 從 URL 獲取房間 ID
    try {
        const response = await fetch(`/api/room/${roomId}`);
        if (!response.ok) {
            throw new Error("無法獲取房間資料");
        }
        const room = await response.json();
        console.log(room); // 打印 room 物件，確認資料正確

        // 顯示房間名稱
        document.getElementById("room-name").textContent = room.roomName;

        // 顯示密碼（如果是私人房間）
        const roomPasswordElement = document.getElementById("room-password");
        if (room.roomPassword) {
            roomPasswordElement.textContent = `密碼：${room.roomPassword}`;
            roomPasswordElement.style.display = "block"; // 顯示密碼
        } else {
            roomPasswordElement.style.display = "none"; // 隱藏密碼
        }

        // 顯示玩家列表
        const playerList = document.getElementById("player-list");
        const players = room.players || []; // 如果 room.players 是 undefined 或 null，使用空陣列
        playerList.innerHTML = players.map((player, index) => 
            `<li>玩家 ${index + 1}: ${player || "等待加入"}</li>`
        ).join("");

        // 啟用開始遊戲按鈕（如果玩家數量足夠）
        const startGameBtn = document.getElementById("start-game-btn");
        if (players.length >= room.playerCount) {
            startGameBtn.disabled = false;
            startGameBtn.classList.add("active"); // 啟用開始遊戲按鈕
        }
    } catch (error) {
        console.error("加載房間資料時發生錯誤:", error);
        alert("無法加載房間資料，請稍後再試！");
    }
}

// 設置退出房間按鈕功能
function setupExitRoomButton() {
    const exitRoomBtn = document.getElementById("exit-room-btn");
    exitRoomBtn.addEventListener("click", () => {
        window.location.href = "/create-room";
    });
}

// 頁面加載時執行
document.addEventListener("DOMContentLoaded", () => {
    loadRoomData(); // 加載房間資料
    setupExitRoomButton(); // 設置退出房間按鈕功能
});