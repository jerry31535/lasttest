document.addEventListener('DOMContentLoaded', function() {
    // 獲取用戶名稱並顯示在頁面上
    const usernameDisplay = document.getElementById('username-display');
    const username = sessionStorage.getItem('username'); // 假設用戶名儲存在 sessionStorage
    if (username) {
        usernameDisplay.textContent = username;
    }

    // 獲取並顯示遊戲房間列表
    fetch('/game/rooms')
        .then(response => response.json())
        .then(data => {
            const roomList = document.getElementById('game-room-list');
            data.rooms.forEach(room => {
                const listItem = document.createElement('li');
                listItem.textContent = room.name;
                roomList.appendChild(listItem);
            });
        })
        .catch(error => console.error("獲取遊戲房間列表錯誤:", error));
});

// 創建遊戲房間
function createGameRoom() {
    const roomName = prompt("請輸入遊戲房間名稱：");
    if (roomName) {
        fetch('/game/create-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: roomName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("遊戲房間創建成功！");
                window.location.reload(); // 重新加載頁面以更新遊戲房間列表
            } else {
                alert("創建遊戲房間失敗！");
            }
        })
        .catch(error => console.error("創建遊戲房間錯誤:", error));
    }
}

// 登出功能
function logout() {
    sessionStorage.removeItem('username');
    window.location.href = '/';
}
