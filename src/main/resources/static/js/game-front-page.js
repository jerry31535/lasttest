// /js/game-front-page.js
const urlParams  = new URLSearchParams(window.location.search);
const roomId     = urlParams.get("roomId");
const playerName = sessionStorage.getItem("playerName");

let players = [];
let myRole  = null;
let leaderId = null;
let currentRound = 1;
let selectedOrder = [];

const positionMap = {
  5: [
    {top:'3%',left:'55%'},
    {top:'3%',right:'55%'},
    {top:'40%',left:'20%'},
    {top:'40%',right:'20%'},
    {bottom:'30px',left:'50%',transform:'translateX(-50%)'}
  ],
  6: [ 
    { top: '55%',  left: '15%' },
    { top: '15%',  left: '15%' },
    { top: '3%',   left: '50%', transform: 'translateX(-50%)' },
  { top: '15%',  right: '15%' },
  { top: '55%',  right: '15%' },
  { bottom:'5%', left: '50%', transform: 'translateX(-50%)' },
],
 7: [
  { top: '55%', left: '75%' },  // 4: 玩家5（右中）
  { top: '15%', left: '75%' },  // 5: 玩家6（右上）
  { top: '5%',  right:'55%'},  // 6: 玩家7（上方偏右
  { top: '5%',  left:'55%' },  // 0: 玩家1（上方偏左）
  { top: '15%', left: '10%' },  // 1: 玩家2（左上）
  { top: '55%', left: '10%' },  // 2: 玩家3（左中）
  { bottom: '30px', left: '50%', transform: 'translateX(-50%)' }, //自己
],

  8: [ 
  { bottom:'10%', left: '25%' },                              
  { top: '30%',  left: '10%' },                                
  { top: '10%',  left: '25%' },
  { top: '5%',   left: '50%', transform: 'translateX(-50%)' }, 
  { top: '10%',  right: '25%' },                              
  { top: '30%',  right: '10%' },                               
  { bottom:'10%', right: '25%' },                             
  { bottom:'5%',  left: '50%', transform: 'translateX(-50%)'},
 
],

  9: [
  { bottom:'8%', left: '30%' },                             
  { bottom:'15%',  left: '15%' },                               
  { bottom: '55%',  left: '20%' } ,
  { top: '5%',  left: '35%'},
  { top: '5%',  right: '35%' },                         
  { bottom: '55%',  right: '20%' },                              
  { bottom:'15%',  right: '15%' },                              
  { bottom:'8%', right: '30%' },                            
  { bottom:'5%',  left: '50%', transform: 'translateX(-50%)'},
  ],

  10: [{ top:'3%',   left:'50%', transform:'translateX(-50%)' }, 
  { top:'10%',  right:'15%' },                             
  { top:'30%',  right:'3%' },                              
  { top:'60%',  right:'3%' },                              
  { bottom:'10%',right:'15%' },                            
  { bottom:'3%', left:'50%', transform:'translateX(-50%)'},
  { bottom:'10%',left:'15%' },                             
  { top:'60%',  left:'3%' },                               
  { top:'30%',  left:'3%' },                               
  { top:'10%',  left:'15%' }]
};

function getMaxPick(round, count) {
  if (count <= 6) return round <= 3 ? 2 : 3;
  if (count <= 8) return round <= 2 ? 3 : 4;
  return round <= 2 ? 3 : 5;
}

function reorderPlayers(arr){
  const meIdx=arr.findIndex(p=>p.name===playerName);
  if(meIdx===-1)return arr;
  const ordered=[];
  for(let i=1;i<arr.length;i++)ordered.push(arr[(meIdx+i)%arr.length]);
  ordered.push(arr[meIdx]);
  return ordered;
}

function renderPlayers(arr){
  const container=document.getElementById("player-container");
  container.innerHTML="";

  const ordered=reorderPlayers(arr);
  const positions = positionMap[ordered.length] || [];

  ordered.forEach((p,idx)=>{
    const isSelf=p.name===playerName;
    const isLeader=p.name===leaderId;
    const card=document.createElement("div");
    card.className=`player-card${isLeader?" leader":""}${isSelf?" player-self":""}`;
    Object.entries(positions[idx]||{}).forEach(([k,v])=>card.style[k]=v);
    card.innerHTML=`
      <div class="avatar"><img src="/images/${p.avatar}" alt="${p.name}"></div>
      <div class="name">${p.name}</div>
      ${isSelf && p.role ? `<div class="role-label">角色：${p.role}</div>` : ""}
    `;
    container.appendChild(card);
  });

  document.getElementById("leader-action")?.classList.toggle("hidden", leaderId!==playerName);
}

function openSelectModal(){
  const maxPick=getMaxPick(currentRound, players.length);
  const candidates=players;
  const listEl=document.getElementById('candidate-list');
  listEl.innerHTML='';
  selectedOrder=[];

  candidates.forEach(p=>{
    const li=document.createElement('li');
    li.dataset.name=p.name;
    li.innerHTML=`<span class="order"></span><span>${p.name}</span>`;
    li.addEventListener('click',()=>toggleSelect(li,maxPick));
    listEl.appendChild(li);
  });

  document.getElementById('select-title').textContent=`請選擇 ${maxPick} 名出戰人員 (剩 ${maxPick})`;
  document.getElementById('select-modal').classList.remove('hidden');
}

function toggleSelect(li,maxPick){
  const name=li.dataset.name;
  const idx=selectedOrder.indexOf(name);
  if(idx===-1){
    if(selectedOrder.length>=maxPick)return;
    selectedOrder.push(name);
  }else{
    selectedOrder.splice(idx,1);
  }
  document.querySelectorAll('#candidate-list li').forEach(li2=>{
    const orderEl=li2.querySelector('.order');
    const i=selectedOrder.indexOf(li2.dataset.name);
    if(i===-1){
      li2.classList.remove('selected');orderEl.textContent='';
    }else{
      li2.classList.add('selected');orderEl.textContent=i+1;
    }
  });
  const remain=maxPick-selectedOrder.length;
  document.getElementById('select-title').textContent=`請選擇 ${maxPick} 名出戰人員 (剩 ${remain})`;
}

function closeSelectModal(){
  document.getElementById('select-modal').classList.add('hidden');
}

async function confirmSelection(){
  const maxPick=getMaxPick(currentRound, players.length);
  if(selectedOrder.length!==maxPick){
    alert(`請選滿 ${maxPick} 人！`);return;
  }
  try{
    await fetch(`/api/room/${roomId}/start-vote`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({leader:playerName,expedition:selectedOrder})
    });
    closeSelectModal();
    window.location.href=`/vote.html?roomId=${roomId}`;
  }catch(err){
    console.error("❌ 無法開始投票",err);
    alert("後端連線失敗，請稍後再試！");
  }
}

function applyRolesToPlayers(roleMap){
  players=players.map(p=>({...p,role:roleMap[p.name]?.name}));
  renderPlayers(players);
  const self=players.find(p=>p.name===playerName);
  if(self){myRole=self.role;localStorage.setItem('myRole',myRole||"");}
}

async function fetchPlayers(){
  try{
    const res=await fetch(`/api/room/${roomId}/players`);
    players=await res.json();renderPlayers(players);
  }catch(err){console.error("❌ 無法載入玩家資料",err);}
}

async function fetchAssignedRoles(){
  try{
    const res=await fetch(`/api/room/${roomId}/roles`);
    if(!res.ok) throw new Error();
    const {assignedRoles,currentLeader}=await res.json();
    leaderId=currentLeader;applyRolesToPlayers(assignedRoles);
  }catch(err){console.error("❌ 無法取得角色資料",err);}
}

function connectWebSocket(){
  if(!window.stompClient){
    const socket=new SockJS('/ws');
    window.stompClient=Stomp.over(socket);
  }
  const stompClient=window.stompClient;
  if(stompClient.connected)return;

  stompClient.connect({},()=>{
    stompClient.subscribe(`/topic/room/${roomId}`,async msg=>{
      if(msg.body.trim()==="startRealGame")await fetchAssignedRoles();
      window.location.href = `/game-front-page.html?roomId=${roomId}`;
    });
    stompClient.subscribe(`/topic/leader/${roomId}`,msg=>{
      leaderId=msg.body;renderPlayers(players);
    });
    stompClient.subscribe(`/topic/vote/${roomId}`,()=>{
      if(!location.pathname.startsWith("/vote")){
        window.location.href=`/vote.html?roomId=${roomId}`;
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchPlayers();

  // ✅ 僅由房主觸發一次 assign-roles（避免重複）
  if (players[0]?.name === playerName) {
    await fetch(`/api/start-real-game?roomId=${roomId}&playerName=${playerName}`, { method: 'POST' });

  await fetchAssignedRoles();
  document.getElementById("select-expedition-btn")?.addEventListener("click", openSelectModal);
  connectWebSocket();
}

});
