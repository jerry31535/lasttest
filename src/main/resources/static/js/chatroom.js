/* chatroom.js – 改為 LINE 風格訊息排版 */
let stompClient = null;

document.addEventListener('DOMContentLoaded', () => {
  /* ====== DOM ====== */
  const chatOverlay   = document.getElementById('chat-overlay');
  const closeBtn      = document.getElementById('close-btn');
  const sendBtn       = document.getElementById('send-btn');
  const messageInput  = document.getElementById('message-input');
  const chatMessages  = document.getElementById('chat-messages');
  const chatIcon      = document.querySelector('.bottom-right .icon');

  /* ====== 目前玩家資料 ====== */
  const playerName   = sessionStorage.getItem('playerName');
  const playerAvatar = sessionStorage.getItem('playerAvatar')        // 先從 sessionStorage 讀
                       || '/images/headshot1.png';                   // 找不到就放預設

  /* 方便收到訊息時查到對方頭貼 */
  let roomPlayers = []; // 由 5player-front-page.js 在全域 window.players 帶進來

  /* ====== UI 動作 ====== */
  function openChatroom () { chatOverlay.classList.remove('hidden'); }
  function closeChatroom() { chatOverlay.classList.add   ('hidden'); }

  /* 送出訊息 */
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

  /* 畫出單一訊息 */
  function drawMessage({ sender, avatar, content }) {
    const isSelf = sender === playerName;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSelf ? 'self' : 'other'}`;

    /* 頭貼 */
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    const img = document.createElement('img');
    img.src = avatar || findAvatarByName(sender) || '/images/headshot1.png';
    avatarDiv.appendChild(img);

    /* 文字區 */
    const textWrap = document.createElement('div');

    const nameSpan = document.createElement('div');
    nameSpan.className = 'name';
    nameSpan.textContent = sender;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = content;

    /* 排序：自己訊息 = [bubble, avatar]，別人 = [avatar, bubble]*/
    if (isSelf) {
      textWrap.appendChild(nameSpan);
      textWrap.appendChild(bubble);
      messageDiv.appendChild(textWrap);
      messageDiv.appendChild(avatarDiv);  // ✅ 自己訊息頭貼會跑到右邊
    }
    else {
      messageDiv.appendChild(avatarDiv);
      textWrap.appendChild(nameSpan);
      textWrap.appendChild(bubble);
      messageDiv.appendChild(textWrap);
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // 捲到最底
  }

  /* 從全域 players 陣列抓對應頭貼 */
  function findAvatarByName(name) {
    if (window.players && window.players.length) {
      const p = window.players.find(p => p.name === name);
      return p?.avatar ? `/images/${p.avatar}` : null;
    }
    return null;
  }

  /* ====== 事件綁定 ====== */
  chatIcon ?.addEventListener('click', openChatroom);
  closeBtn ?.addEventListener('click', closeChatroom);
  sendBtn  ?.addEventListener('click', sendMessage);
  messageInput?.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  /* ====== WebSocket 連線 ====== */
  const socket = new SockJS('/ws');
  stompClient  = Stomp.over(socket);

  stompClient.connect({}, () => {
    /* 訂閱聊天室頻道 */
    stompClient.subscribe(`/topic/room/${localStorage.getItem('roomId')}/chat`, msg => {
      const body = JSON.parse(msg.body);
      drawMessage(body);
    });
  });

  /* ====== 把 players 陣列存到全域方便查頭貼 ====== */
  if (window.players) roomPlayers = window.players;
  else window.addEventListener('playersLoaded', e => (roomPlayers = e.detail));
});
