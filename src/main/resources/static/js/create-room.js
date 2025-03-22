async function createRoom() {
    const roomName = document.getElementById("room-name").value;
    const roomType = document.getElementById("room-type").value;
    const roomPassword = document.getElementById("room-password").value;
    const playerCount = parseInt(document.getElementById("player-count").value, 10);

    if (!roomName) {
        alert("請輸入房間名稱！");
        return;
    }
    if (roomType === "private" && !roomPassword) {
        alert("私人房間需要輸入密碼！");
        return;
    }
    if (isNaN(playerCount) || playerCount < 5 || playerCount > 10) {
        alert("玩家人數應在 5 到 10 之間！");
        return;
    }

    const roomData = {
        roomName,
        roomType,
        roomPassword: roomType === "private" ? roomPassword : null,
        playerCount,
    };

    try {
        const response = await fetch("/api/create-room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(roomData),
        });

        const result = await response.json();  // 改用 json() 解析回應

        if (response.ok) {
            // 成功創建房間，跳轉到房間頁面
            window.location.href = `/room/${result.id}`;
        } else {
            alert(result.message || "創建房間失敗，請稍後再試！");
        }
    } catch (error) {
        console.error("創建房間時發生錯誤:", error);
        alert("系統錯誤，請稍後再試！");
    }
}