document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/room/123") // 替換成真正的房間 ID
        .then(response => response.json())
        .then(data => {
            if (data.roomName) {
                document.getElementById("room-name").textContent = `房間名稱：${data.roomName}`;
            }
        })
        .catch(error => console.error("Error fetching room data:", error));
});

