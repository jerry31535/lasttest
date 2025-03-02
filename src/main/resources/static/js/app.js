// 確保 JavaScript 在 DOM 載入後執行
document.addEventListener('DOMContentLoaded', function() {
    // 取得圖片元素
    const peopleImage = document.getElementById('people');

    // 當滑鼠進入圖片時放大
    peopleImage.addEventListener('mouseover', function() {
        peopleImage.style.transform = 'rotate(-20deg) scale(1.2)'; // 放大 1.2 倍
    });

    // 當滑鼠移出圖片時恢復原狀
    peopleImage.addEventListener('mouseout', function() {
        peopleImage.style.transform = 'rotate(-20deg) scale(1)'; // 恢復原始大小
    });
});
