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

function createGameRoom() {
    window.location.href = "/create-room";
}

function joinGameRoom() {
    window.location.href = "/join-room";
}
