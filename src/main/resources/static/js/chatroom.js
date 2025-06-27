/* 
 * chatroom.js – 改為 LINE 風格訊息排版
 *
 * ✅ 功能概述：
 *   - 設定聊天室開關與傳送行為
 *   - 與後端 WebSocket 建立連線並接收訊息
 *   - 將訊息繪製為 LINE 風格的氣泡 + 頭貼
 *   - 支援自動對照玩家名稱取得頭貼
 *
 * ✅ 依賴條件：
 *   - 前端已設定 roomId 至 localStorage
 *   - 玩家名稱與頭像已存在於 sessionStorage
 *   - `window.players` 陣列已包含所有玩家與頭像（從其他 JS 帶入）
 */

let stompClient = null;

document.addEventListener('DOMContentLoaded', () => {

  /* ====== DOM 物件抓取 ====== */
  const chatOverlay   = document.getElementById('chat-overlay');  // 聊天視窗容器
  const closeBtn      = document.getElementById('close-btn');     // 關閉按鈕
  const sendBtn       = document.getElementById('send-btn');      // 傳送按鈕
  const messageInput  = document.getElementById('message-input'); // 輸入欄位
  const chatMessages  = document.getElementById('chat-messages'); // 聊天訊息區域
  const chatIcon      = document.querySelector('.bottom-right .icon'); // 開啟按鈕

  /* ====== 玩家資料從 sessionStorage 取得 ====== */
  const playerName   = sessionStorage.getItem('playerName');
  const playerAvatar = sessionStorage.getItem('playerAvatar') 
                    || '/images/headshot1.png'; // 沒有選擇就用預設

  let roomPlayers = []; // 存所有玩家資料，幫助找頭像（由外部傳進）

  /* ====== UI 顯示與關閉聊天視窗 ====== */
  function openChatroom () { chatOverlay.classList.remove('hidden'); }
  function closeChatroom() { chatOverlay.classList.add('hidden'); }

  /* ====== 傳送訊息至 WebSocket ====== */
  function sendMessage() {
    const msg = messageInput.value.trim();
    if (!msg) return;
    if (stompClient?.connected) {
      stompClient.send(
        `/app/chat/${localStorage.getItem('roomId')}`,
        {},
        JSON.stringify({
          sender:  playerName,
          avatar:  playerAvatar,
          content: msg
        })
      );
      messageInput.value = '';
    }
  }

  /* ====== 接收訊息並渲染到畫面 ====== */
  function drawMessage({ sender, avatar, content }) {
    const isSelf = sender === playerName;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSelf ? 'self' : 'other'}`; // 根據是否本人設定 class

    // 頭像區塊
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    const img = document.createElement('img');
    img.src = avatar || findAvatarByName(sender) || '/images/headshot1.png'; // 找不到就預設
    avatarDiv.appendChild(img);

    // 名稱與文字區塊（含氣泡）
    const textWrap = document.createElement('div');
    textWrap.className = 'text-wrap';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'name';
    nameSpan.textContent = sender;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = content;

    textWrap.appendChild(nameSpan);
    textWrap.appendChild(bubble);

    // 加入訊息框中
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(textWrap);

    chatMessages.prepend(messageDiv); // 插在最上方
  }

  /* ====== 根據玩家名稱找對應頭像（從 players 陣列） ====== */
  function findAvatarByName(name) {
    if (window.players && window.players.length) {
      const p = window.players.find(p => p.name === name);
      return p?.avatar ? `/images/${p.avatar}` : null;
    }
    return null;
  }

  /* ====== 事件註冊 ====== */
  chatIcon ?.addEventListener('click', openChatroom);
  closeBtn ?.addEventListener('click', closeChatroom);
  sendBtn  ?.addEventListener('click', sendMessage);
  messageInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });

  /* ====== 建立 WebSocket 連線並訂閱頻道 ====== */
  const socket = new SockJS('/ws');
  stompClient  = Stomp.over(socket);

  stompClient.connect({}, () => {
    // 訂閱該房間的聊天頻道
    stompClient.subscribe(`/topic/room/${localStorage.getItem('roomId')}/chat`, msg => {
      const body = JSON.parse(msg.body);
      drawMessage(body);
    });
  });

  /* ====== 把 players 陣列存進變數供內部查詢使用 ====== */
  if (window.players) {
    roomPlayers = window.players;
  } else {
    // 等其他腳本觸發事件再取得
    window.addEventListener('playersLoaded', e => (roomPlayers = e.detail));
  }
});
