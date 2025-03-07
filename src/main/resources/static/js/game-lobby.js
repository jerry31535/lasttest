document.addEventListener('DOMContentLoaded', function() {
    // 獲取用戶名稱並顯示在頁面上
    const usernameDisplay = document.getElementById('user-info').querySelector('p');
    const username = sessionStorage.getItem('username'); // 假設用戶名儲存在 sessionStorage
    if (username) {
        usernameDisplay.textContent = `歡迎，${username}！`;
    }
});

// 登出功能
function logout() {
    sessionStorage.removeItem('username');
    window.location.href = '/';
}

// 禁用進入房間和創建房間按鈕
function joinGameRoom() {
    // 顯示 alert 訊息
    alert("進入房間功能尚未開啟");
}

function createGameRoom() {
    // 顯示 alert 訊息
    alert("創建遊戲房間功能尚未開啟");
}