document.addEventListener("DOMContentLoaded", () => {
    loadRoomList();
});

async function loadRoomList() {
    try {
        // 從後端 API 獲取所有房間資料
        const response = await fetch('/api/rooms', { cache: "no-cache" });
        if (response.ok) {
            const rooms = await response.json();
            displayRooms(rooms);
        } else {
            console.error("獲取房間列表失敗，狀態碼：", response.status);
        }
    } catch (error) {
        console.error("獲取房間列表發生錯誤：", error);
    }
}

function displayRooms(rooms) {
    const roomListElement = document.getElementById("room-list");
    // 如果房間數量為 0，則顯示提示文字
    if (rooms.length === 0) {
        roomListElement.innerHTML = `<p class="no-room">目前沒有遊戲房間QQ</p>`;
        return;
    }
    // 清空原有內容
    roomListElement.innerHTML = "";
    // 逐一將房間名稱加入到列表中，並加入點擊事件
    rooms.forEach(room => {
        const roomItem = document.createElement("div");
        roomItem.className = "room-item";
        roomItem.textContent = "房間名稱：" + room.roomName;
        // 將 data-room-id 設置為從 MongoDB 取得的房間 id
        roomItem.setAttribute("data-room-id", room.id);
        roomItem.addEventListener("click", () => {
            joinRoom(room.id);
        });
        roomListElement.appendChild(roomItem);
    });
}

async function joinRoom(roomId) {
    try {
        // 先取得房間資訊以確認是否為私人房間
        const roomResponse = await fetch(`/api/room/${roomId}`, { cache: "no-cache" });
        if (!roomResponse.ok) {
            throw new Error("無法獲取房間資訊");
        }
        const room = await roomResponse.json();
        
        let password = "";
        // 如果為私人房間，提示輸入密碼
        if (room.roomType === "private") {
            password = prompt("此房間為私人房間，請輸入密碼：");
            if (!password) {
                alert("必須輸入房間密碼！");
                return;
            }
        }
        
        // 提示玩家輸入名稱
        const playerName = prompt("請輸入您的玩家名稱：");
        if (!playerName) {
            alert("玩家名稱不能為空！");
            return;
        }
        
        // 構造加入房間的 URL，私人房間加入時帶上密碼參數
        let joinUrl = `/api/join-room?roomId=${roomId}&playerName=${encodeURIComponent(playerName)}`;
        if (room.roomType === "private") {
            joinUrl += `&roomPassword=${encodeURIComponent(password)}`;
        }
        
        // 呼叫後端加入房間 API
        const joinResponse = await fetch(joinUrl, { method: "POST" });
        const result = await joinResponse.json();
        if (joinResponse.ok && result.success) {
            alert("加入房間成功！");
            window.location.href = `/room/${roomId}`;
        } else {
            alert(result.message || "加入房間失敗！");
        }
    } catch (error) {
        console.error("加入房間時發生錯誤:", error);
        alert("系統錯誤，請稍後再試！");
    }
}