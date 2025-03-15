// 角色資訊列表
const characters = [
    { img: "/images/goodpeople1.png", info: " 工程師<br>可檢查一位玩家的資源卡<br>確認其為成功或失敗。" },
    { img: "/images/goodpeople2.png", info: " 醫護兵<br>可保護一名玩家<br>使其不受道具或事件影響。" },
    { img: "/images/goodpeople3.png", info: " 指揮官<br>可更換探索隊伍成員<br>但不能連續選擇相同的人。" },
    { img: "/images/goodpeople4.png", info: " 普通倖存者<br>無特殊能力<br>透過推理與投票影響遊戲。" },
    { img: "/images/badpeople1.png", info: " 潛伏者<br>可偷偷更改提交的資源卡。" },
    { img: "/images/badpeople2.png", info: " 破壞者<br>可使一張資源卡失效<br>限用兩次。" },
    { img: "/images/badpeople3.png", info: " 影武者<br>可偽裝身份並並展示假身份。" },
    { img: "/images/goodpeople1.png", info: " 邪惡平民<br>無特殊能力<br>但可協助邪惡方勝利。" }
];

// ✅ 確保變數先定義，避免 `window.onload` 時 `currentIndex` 未定義
let currentIndex = 0;

// ✅ `window.onload` 內部先檢查 `#character-info` 是否存在，避免 `null` 錯誤
window.onload = function () {
    const characterInfo = document.querySelector("#character-info");
    const characterImg = document.querySelector("#character-card img");

    if (characterInfo && characterImg) {
        characterInfo.innerHTML = characters[currentIndex].info;
        characterImg.src = characters[currentIndex].img;
    }

    // 綁定按鈕事件，確保 DOM 載入後才執行
    document.querySelector(".left-btn").addEventListener("click", prevCard);
    document.querySelector(".right-btn").addEventListener("click", nextCard);
};

// 更新角色卡片
function updateCard() {
    const card = document.getElementById("character-card");
    card.style.transform = "scale(0.8)"; // 縮小
    setTimeout(() => {
        document.querySelector("#character-card img").src = characters[currentIndex].img;
        document.querySelector("#character-info").innerHTML = characters[currentIndex].info; // 使用 innerHTML 解析 <br>
        card.style.transform = "scale(1)"; // 放大
    }, 300);
}

// 切換到下一個角色
function nextCard() {
    currentIndex = (currentIndex + 1) % characters.length;
    updateCard();
}

// 切換到上一個角色
function prevCard() {
    currentIndex = (currentIndex - 1 + characters.length) % characters.length;
    updateCard();
}
