/* ====== 參數 ====== */
const urlParams  = new URLSearchParams(window.location.search);
const roomId     = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName");

/* ====== DOM ====== */
const agreeCountEl  = document.getElementById("agree-count");
const rejectCountEl = document.getElementById("reject-count");
const resultBox     = document.getElementById("vote-result");
const btnBox        = document.getElementById("vote-buttons");
const agreeBtn      = document.getElementById("agree-btn");
const rejectBtn     = document.getElementById("reject-btn");
const statusEl      = document.getElementById("status");

/* ====== 狀態 ====== */
let canVote   = false;
let hasVoted  = false;
let agree     = 0;
let reject    = 0;
let total     = 0;

/* ====== 初始化 ====== */
async function init() {
  try{
    const res = await fetch(`/api/room/${roomId}/vote-state?player=${encodeURIComponent(playerName)}`);
    if(!res.ok) throw new Error("vote‑state 取得失敗");

    const data = await res.json();
    agree     = data.agree;
    reject    = data.reject;
    total     = data.total;          // 總玩家數
    canVote   = data.canVote;        // 我是否能投票
    hasVoted  = data.hasVoted;       // 是否已投

    updateUI();
    connectWS();
  }catch(err){
    console.error(err);
    statusEl.textContent = "無法取得投票資訊";
  }
}

/* ====== 更新畫面 ====== */
function updateUI() {
  agreeCountEl.textContent  = agree;
  rejectCountEl.textContent = reject;

  if (canVote) {
    btnBox.classList.remove("hidden");
    resultBox.classList.add("hidden");
    if (hasVoted) {
      disableButtons();
      statusEl.textContent = "已投票，請等待其他玩家...";
    }
  } else {
    resultBox.classList.remove("hidden");
    btnBox.classList.add("hidden");
  }
}

/* ====== 送出投票 ====== */
async function sendVote(value) {
  if (hasVoted) return;
  disableButtons();
  statusEl.textContent = "送出中...";

  try{
    const res = await fetch(`/api/room/${roomId}/vote`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ voter:playerName, agree:value })
    });
    if(!res.ok) throw new Error("投票失敗");
    hasVoted = true;
    statusEl.textContent = "已送出，等待其他玩家...";
  }catch(err){
    console.error(err);
    statusEl.textContent = "投票失敗，請重新整理再試";
  }
}

/* ====== 按鈕狀態 ====== */
function disableButtons(){
  agreeBtn.disabled = true;
  rejectBtn.disabled = true;
}

/* ====== WebSocket ====== */
function connectWS(){
  const socket = new SockJS("/ws");
  const stomp  = Stomp.over(socket);

  stomp.connect({}, ()=>{
    stomp.subscribe(`/topic/vote/${roomId}`, msg=>{
      const data = JSON.parse(msg.body);
      agree  = data.agree;
      reject = data.reject;
      updateUI();

      if (data.finished){
        const target =
          agree >= reject
            ? `/expedition?roomId=${encodeURIComponent(roomId)}`
            : `/5player-front-page.html?roomId=${encodeURIComponent(roomId)}`;
            window.location.replace(target);   // replace() 可避免多一層返回紀錄
      }
      
    });
  });
}

/* ====== 綁定按鈕 ====== */
agreeBtn.addEventListener("click", ()=> sendVote(true));
rejectBtn.addEventListener("click",()=> sendVote(false));

/* ====== go! ====== */
document.addEventListener("DOMContentLoaded", init);
