document.addEventListener("DOMContentLoaded", function () {
    const roomTypeSelect = document.getElementById("room-type");
    const passwordContainer = document.getElementById("password-container");

    // 監聽房間類型選擇，切換密碼輸入框
    roomTypeSelect.addEventListener("change", function () {
        if (roomTypeSelect.value === "private") {
            passwordContainer.style.display = "block";
        } else {
            passwordContainer.style.display = "none";
        }
    });
});

// 創建房間（暫時只顯示 Alert，下一步再連接後端）
function createRoom() {
    const roomName = document.getElementById("room-name").value;
    const roomType = document.getElementById("room-type").value;
    const roomPassword = document.getElementById("room-password").value;
    const playerCount = document.getElementById("player-count").value;

    if (!roomName) {
        alert("請輸入房間名稱！");
        return;
    }
    
    if (roomType === "private" && !roomPassword) {
        alert("私人房間需要輸入密碼！");
        return;
    }

    alert(`房間創建成功！\n名稱: ${roomName}\n類型: ${roomType === "private" ? "私人（密碼：" + roomPassword + "）" : "公開"}\n人數: ${playerCount}`);

    // TODO: 將房間資訊傳送到後端
}

// 返回遊戲大廳
function goBack() {
    window.location.href = "/game-lobby";
}
