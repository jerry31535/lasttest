document.addEventListener('DOMContentLoaded', function() {
    // 取得圖片元素
    const peopleImage = document.getElementById('people');

    // 當滑鼠進入圖片時放大
    peopleImage.addEventListener('mouseover', function() {
        peopleImage.style.transform = 'rotate(-20deg) scale(1.2)';
    });

    // 當滑鼠移出圖片時恢復原狀
    peopleImage.addEventListener('mouseout', function() {
        peopleImage.style.transform = 'rotate(-20deg) scale(1)';
    });
});

// 顯示註冊表單
function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

// 顯示登入表單
function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

// 註冊功能
function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (!username || !password) {
        alert("請輸入帳號和密碼！");
        return;
    }

    // 發送註冊請求
    fetch('/auth/do-register?username=' + username + '&password=' + password)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("註冊成功！");
                showLoginForm(); // 顯示登入表單
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error("註冊錯誤:", error));
}

// 登入功能
function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert("請輸入帳號和密碼！");
        return;
    }

    // 發送登入請求
    fetch('/auth/do-login?username=' + username + '&password=' + password)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("登入成功！");
                window.location.href = '/game-lobby'; // 跳轉到遊戲大廳頁面
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error("登入錯誤:", error));
}
 