const avatarImages = document.querySelectorAll('.avatar-option');

avatarImages.forEach(img => {
  img.addEventListener('click', () => {
    avatarImages.forEach(i => i.classList.remove('selected'));
    img.classList.add('selected');

    const selectedAvatar = img.getAttribute('data-avatar');
    localStorage.setItem('selectedAvatar', selectedAvatar);
  });
});

function startGameNow() {
  const avatar = localStorage.getItem('selectedAvatar');
  if (!avatar) {
    alert("請先選擇一個頭貼！");
    return;
  }
  alert("遊戲正式開始！");
  window.location.href = "/game";
}
