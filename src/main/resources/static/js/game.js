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

// 註冊功能（使用 POST）
function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (!username || !password) {
        alert("請輸入帳號和密碼！");
        return;
    }

    fetch('/auth/do-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('網路錯誤或伺服器錯誤');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert("註冊成功！");
            showLoginForm(); // 顯示登入表單
        } else {
            alert(data.message || "註冊失敗！");
        }
    })
    .catch(error => {
        console.error("註冊錯誤:", error);
        alert("註冊過程出錯");
    });
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert("請輸入帳號和密碼！");
        return;
    }

    fetch('/auth/do-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("伺服器錯誤");
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // 將玩家名稱存入 sessionStorage
            localStorage.setItem("username", username);  // ✅ 必加
            sessionStorage.setItem("username", username); // ⬅ 可選，若你有使用
            alert("登入成功！");
            window.location.href = '/game-lobby';
        } else {
            alert(data.message || "登入失敗！");
        }
    })
    .catch(error => {
        console.error("登入錯誤:", error);
        alert("登入過程出錯");
    });
    sessionStorage.setItem("playerName", username); // 👈 這行是關鍵

}
