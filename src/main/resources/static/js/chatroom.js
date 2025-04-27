let stompClient = null;

document.addEventListener('DOMContentLoaded', () => {
  const chatOverlay = document.getElementById('chat-overlay');
  const closeBtn = document.getElementById('close-btn');
  const sendBtn = document.getElementById('send-btn');
  const messageInput = document.getElementById('message-input');
  const chatMessages = document.getElementById('chat-messages');
  const chatIcon = document.querySelector('.bottom-right .icon');

  const playerName = sessionStorage.getItem('playerName'); // 🔥 正確抓回登入帳號

  function openChatroom() {
    chatOverlay.classList.remove('hidden');
  }

  function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText !== "" && stompClient && stompClient.connected) {
      const chatMessage = {
        sender: playerName, // ✅ 這裡用玩家帳號名稱 (1、2、3、4、5)
        content: messageText
      };
      stompClient.send("/app/chat/" + localStorage.getItem('roomId'), {}, JSON.stringify(chatMessage));
      messageInput.value = "";
    }
  }

  function showMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${message.sender}:</strong> ${message.content}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (chatIcon) {
    chatIcon.addEventListener('click', openChatroom);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatOverlay.classList.add('hidden');
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }

  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  const socket = new SockJS('/ws');
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/room/${localStorage.getItem('roomId')}/chat`, (messageOutput) => {
      const message = JSON.parse(messageOutput.body);
      showMessage(message);
    });
  });
});
