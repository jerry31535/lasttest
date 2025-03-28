document.addEventListener("DOMContentLoaded", () => {
    loadRoomList();
    const searchInput = document.getElementById("room-search");
    searchInput.addEventListener("input", filterRooms);
  });
  
  let allRooms = [];
  
  async function loadRoomList() {
    try {
      const response = await fetch('/api/rooms', { cache: "no-cache" });
      if (response.ok) {
        const rooms = await response.json();
        // 僅取私人房間
        allRooms = rooms.filter(room => room.roomType === "private");
        displayRooms(allRooms);
      } else {
        console.error("獲取房間列表失敗，狀態碼：", response.status);
      }
    } catch (error) {
      console.error("獲取房間列表發生錯誤：", error);
    }
  }
  
  function displayRooms(rooms) {
    const roomListElement = document.getElementById("room-list");
    if (rooms.length === 0) {
      roomListElement.innerHTML = `<p class="no-room">沒有找到符合的私人房間</p>`;
      return;
    }
    roomListElement.innerHTML = "";
    rooms.forEach(room => {
      const roomItem = document.createElement("div");
      roomItem.className = "room-item";
      roomItem.textContent = "房間名稱：" + room.roomName;
      roomItem.setAttribute("data-room-id", room.id);
      roomItem.addEventListener("click", () => {
        joinRoom(room.id);
      });
      roomListElement.appendChild(roomItem);
    });
  }
  
  function filterRooms() {
    const query = document.getElementById("room-search").value.toLowerCase();
    const filtered = allRooms.filter(room => room.roomName.toLowerCase().includes(query));
    displayRooms(filtered);
  }
  
  async function joinRoom(roomId) {
    // 私人房間需要輸入密碼
    const password = prompt("此房間為私人房間，請輸入密碼：");
    if (!password) {
      alert("必須輸入房間密碼！");
      return;
    }
    // 取得登入玩家的名稱，從 sessionStorage 中讀取
    const playerName = sessionStorage.getItem("playerName");
    if (!playerName) {
      alert("請先登入並設定玩家名稱！");
      return;
    }
    const joinUrl = `/api/join-room?roomId=${roomId}&playerName=${encodeURIComponent(playerName)}&roomPassword=${encodeURIComponent(password)}`;
    try {
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
  