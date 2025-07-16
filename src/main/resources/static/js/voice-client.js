let mediaRecorder;
let socket;
let username = localStorage.getItem("username") || "guest";

// 建立 WebSocket 連線
function connectWebSocket() {
  socket = new WebSocket("ws://localhost:8080/voice/" + username);

  socket.onopen = () => console.log("🎙 WebSocket 連線成功！");
  socket.onerror = (err) => console.error("WebSocket 錯誤", err);
  socket.onmessage = (event) => {
    // 你之後可以在這裡處理收到的音訊（播放）
    console.log("收到語音資料");
  };
}

// 開始錄音
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(e.data); // 傳送 blob 音訊資料
    }
  };

  mediaRecorder.start(250); // 每 250ms 傳送一次
  console.log("🎤 開始錄音...");
}

// 停止錄音
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("🛑 停止錄音");
  }
}

// 初始化 WebSocket
connectWebSocket();
