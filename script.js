const configs={
classic:{coords:[{x:55,y:55},{x:300,y:55},{x:545,y:55},{x:545,y:300},{x:545,y:545},{x:300,y:545},{x:55,y:545},{x:55,y:300},{x:130,y:130},{x:300,y:130},{x:470,y:130},{x:470,y:300},{x:470,y:470},{x:300,y:470},{x:130,y:470},{x:130,y:300},{x:205,y:205},{x:300,y:205},{x:395,y:205},{x:395,y:300},{x:395,y:395},{x:300,y:395},{x:205,y:395},{x:205,y:300}],lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,8],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23],[23,16],[1,9],[9,17],[3,11],[11,19],[5,13],[13,21],[7,15],[15,23]],mills:[[0,1,2],[2,3,4],[4,5,6],[6,7,0],[8,9,10],[10,11,12],[12,13,14],[14,15,8],[16,17,18],[18,19,20],[20,21,22],[22,23,16],[1,9,17],[3,11,19],[5,13,21],[7,15,23]]},
diagonal:{coords:[{x:55,y:55},{x:300,y:55},{x:545,y:55},{x:545,y:300},{x:545,y:545},{x:300,y:545},{x:55,y:545},{x:55,y:300},{x:130,y:130},{x:300,y:130},{x:470,y:130},{x:470,y:300},{x:470,y:470},{x:300,y:470},{x:130,y:470},{x:130,y:300},{x:205,y:205},{x:300,y:205},{x:395,y:205},{x:395,y:300},{x:395,y:395},{x:300,y:395},{x:205,y:395},{x:205,y:300},{x:300,y:300}],lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,8],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23],[23,16],[1,9],[9,17],[17,24],[24,21],[21,13],[13,5],[7,15],[15,23],[23,24],[24,19],[19,11],[11,3],[0,8],[8,16],[16,24],[24,20],[20,12],[12,4],[2,10],[10,18],[18,24],[24,22],[22,14],[14,6]],mills:[[0,1,2],[2,3,4],[4,5,6],[6,7,0],[8,9,10],[10,11,12],[12,13,14],[14,15,8],[16,17,18],[18,19,20],[20,21,22],[22,23,16],[1,9,17],[9,17,24],[17,24,21],[24,21,13],[21,13,5],[7,15,23],[15,23,24],[23,24,19],[24,19,11],[19,11,3],[0,8,16],[8,16,24],[16,24,20],[24,20,12],[20,12,4],[2,10,18],[10,18,24],[18,24,22],[24,22,14],[22,14,6]]}}
for(const c of Object.values(configs)){c.adj=Array.from({length:c.coords.length},()=>[]);c.lines.forEach(([a,b])=>{c.adj[a].push(b);c.adj[b].push(a)})}
let audioCtx=null;let settings={sound:'on',difficulty:'medium',millHighlight:'on',p1:'Joueur Rouge',p2:'Joueur Jaune',boardType:'classic'};let state={mode:'local',board:[],turn:1,reserve:[0,12,12],onBoard:[0,0,0],selected:null,capture:false,gameOver:false,aiBusy:false};
function cfg(){return configs[settings.boardType]}
function toggleBurger(){document.getElementById('drawer').classList.toggle('show');document.getElementById('drawerBackdrop').classList.toggle('show')}function closeBurger(){document.getElementById('drawer').classList.remove('show');document.getElementById('drawerBackdrop').classList.remove('show')}
function showScreen(id){closeBurger();document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active')}function goHome(){closeModal();showScreen('home-screen')}
function syncSettings(){settings.sound=document.getElementById('sound-setting').value;settings.difficulty=document.getElementById('ai-level').value;settings.boardType=document.getElementById('board-setting').value;settings.millHighlight=document.getElementById('mill-highlight-setting').value;document.getElementById('setup-board').value=settings.boardType;document.getElementById('online-board').value=settings.boardType}
document.getElementById('board-setting').addEventListener('change',syncSettings);
function sound(type){try{syncSettings();if(settings.sound!=='on')return;audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.frequency.value=type==='capture'?180:type==='mill'?760:type==='move'?360:500;g.gain.setValueAtTime(.15,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.2);o.start();o.stop(audioCtx.currentTime+.21)}catch(e){}}
function prepareGame(mode){state.mode=mode;document.getElementById('p2-label').textContent=mode==='ai'?'IA Jaune — capsule à l’endroit':'Joueur Jaune — capsule à l’endroit';document.getElementById('p2-name').value=mode==='ai'?'IA Morabaraba':'Joueur Jaune';document.getElementById('setup-board').value=document.getElementById('board-setting').value;showScreen('setup-screen')}
function freshState(mode=state.mode){return {mode,board:Array(cfg().coords.length).fill(0),turn:1,reserve:[0,12,12],onBoard:[0,0,0],selected:null,capture:false,gameOver:false,aiBusy:false}}
function startGame(){settings.p1=document.getElementById('p1-name').value.trim()||'Joueur Rouge';settings.p2=document.getElementById('p2-name').value.trim()||(state.mode==='ai'?'IA Morabaraba':'Joueur Jaune');settings.boardType=document.getElementById('setup-board').value;document.getElementById('board-setting').value=settings.boardType;state=freshState(state.mode);showScreen('game-screen');render();updateHUD()}
function currentName(){return state.turn===1?settings.p1:settings.p2}function playerName(p){return p===1?settings.p1:settings.p2}function isMillAt(i,p,b=state.board){return cfg().mills.some(m=>m.includes(i)&&m.every(n=>b[n]===p))}function pieceInMill(i,p,b=state.board){return cfg().mills.some(m=>m.includes(i)&&m.every(n=>b[n]===p))}
function capturableIndices(victim){const pieces=state.board.map((v,i)=>v===victim?i:-1).filter(i=>i>=0),free=pieces.filter(i=>!pieceInMill(i,victim));return free.length?free:pieces}function phaseForPlayer(p){if(state.reserve[1]>0||state.reserve[2]>0)return'placement';return state.onBoard[p]===3?'flying':'movement'}function validMovesFrom(i,p){if(state.onBoard[p]===3&&state.reserve[1]===0&&state.reserve[2]===0)return state.board.map((v,k)=>v===0?k:-1).filter(k=>k>=0);return cfg().adj[i].filter(k=>state.board[k]===0)}function hasAnyMove(p){if(state.reserve[1]>0||state.reserve[2]>0)return true;if(state.onBoard[p]===3)return state.board.some(v=>v===0);return state.board.some((v,i)=>v===p&&cfg().adj[i].some(n=>state.board[n]===0))}
function canLocalAct(){return state.mode!=='online'||seat===state.turn}
function placeAt(i){if(!canLocalAct()||state.board[i]!==0||state.reserve[state.turn]<=0)return;state.board[i]=state.turn;state.reserve[state.turn]--;state.onBoard[state.turn]++;sound('place');if(isMillAt(i,state.turn)){state.capture=true;sound('mill');afterAction();return}nextTurn()}
function movePiece(from,to){if(!canLocalAct()||state.board[from]!==state.turn||state.board[to]!==0||!validMovesFrom(from,state.turn).includes(to))return;state.board[from]=0;state.board[to]=state.turn;state.selected=null;sound('move');if(isMillAt(to,state.turn)){state.capture=true;sound('mill');afterAction();return}nextTurn()}
function captureAt(i){if(!canLocalAct())return;const victim=state.turn===1?2:1,valid=capturableIndices(victim);if(!valid.includes(i))return;state.board[i]=0;state.onBoard[victim]--;sound('capture');if(state.reserve[1]===0&&state.reserve[2]===0&&state.onBoard[victim]<3){endGame(state.turn,`${playerName(victim)} n’a plus assez de vaches.`);return}nextTurn()}
function nextTurn(){state.selected=null;state.capture=false;state.turn=state.turn===1?2:1;if(state.reserve[1]===0&&state.reserve[2]===0&&!hasAnyMove(state.turn)){endGame(state.turn===1?2:1,`${playerName(state.turn)} est bloqué.`);return}afterAction();maybeAI()}
function afterAction(){render();updateHUD();pushOnlineState()}
function onNode(i){if(state.gameOver||state.aiBusy||!canLocalAct())return;if(state.capture){captureAt(i);return}const ph=phaseForPlayer(state.turn);if(ph==='placement'){placeAt(i);return}if(state.selected===null){if(state.board[i]===state.turn&&validMovesFrom(i,state.turn).length){state.selected=i;render();updateHUD()}return}if(i===state.selected){state.selected=null;render();return}if(state.board[i]===state.turn){if(validMovesFrom(i,state.turn).length){state.selected=i;render()}return}if(state.board[i]===0)movePiece(state.selected,i)}
function capSVG(x,y,p,sel=false){if(p===2)return`<g class="piece-group" pointer-events="none"><circle class="cap-shadow" cx="${x+4}" cy="${y+6}" r="29"/><circle class="cap-yellow-main" cx="${x}" cy="${y}" r="27"/><circle class="cap-yellow-rim" cx="${x}" cy="${y}" r="27"/>${sel?`<circle class="selection" cx="${x}" cy="${y}" r="34"/>`:''}</g>`;return`<g class="piece-group" pointer-events="none"><circle class="cap-shadow" cx="${x+4}" cy="${y+6}" r="29"/><circle class="cap-red-metal" cx="${x}" cy="${y}" r="29"/><circle class="cap-red-inner" cx="${x}" cy="${y}" r="21"/><circle class="cap-red-ring" cx="${x}" cy="${y}" r="28"/>${sel?`<circle class="selection" cx="${x}" cy="${y}" r="35"/>`:''}</g>`}
function activeMills(){const c=cfg(),out=[];for(const m of c.mills){const p=state.board[m[0]];if(p&&m.every(i=>state.board[i]===p))out.push({mill:m,player:p})}return out}
function render(){const c=cfg(),svg=document.getElementById('board');let s=`<defs><radialGradient id="yellowCap" cx="35%" cy="30%"><stop offset="0" stop-color="#fff783"/><stop offset=".18" stop-color="#ffe82b"/><stop offset=".68" stop-color="#f2c400"/><stop offset="1" stop-color="#a87900"/></radialGradient><radialGradient id="metalCap"><stop offset="0" stop-color="#f2eee3"/><stop offset=".55" stop-color="#c8c0ad"/><stop offset=".78" stop-color="#7d776d"/><stop offset="1" stop-color="#ded5c0"/></radialGradient><radialGradient id="redInside" cx="35%" cy="30%"><stop offset="0" stop-color="#d75443"/><stop offset=".55" stop-color="#ad2a1e"/><stop offset="1" stop-color="#67150f"/></radialGradient></defs>`;if(settings.millHighlight==='on'){for(const am of activeMills()){const a=c.coords[am.mill[0]],z=c.coords[am.mill[2]];s+=`<line class="mill-highlight" x1="${a.x}" y1="${a.y}" x2="${z.x}" y2="${z.y}"/>`;for(const ni of am.mill){const q=c.coords[ni];s+=`<circle class="mill-node-highlight" cx="${q.x}" cy="${q.y}" r="34"/>`}}}c.lines.forEach(([a,b])=>s+=`<line class="board-line" x1="${c.coords[a].x}" y1="${c.coords[a].y}" x2="${c.coords[b].x}" y2="${c.coords[b].y}"/>`);let valid=state.selected!==null&&!state.capture?validMovesFrom(state.selected,state.turn):[],captures=state.capture?capturableIndices(state.turn===1?2:1):[];c.coords.forEach((p,i)=>{let cl='node-dot';if(valid.includes(i))cl+=' valid';if(captures.includes(i))cl+=' capture';s+=`<circle class="${cl}" cx="${p.x}" cy="${p.y}" r="7" pointer-events="none"/><circle class="node-hit" cx="${p.x}" cy="${p.y}" r="31" data-i="${i}"/>`;if(state.board[i])s+=capSVG(p.x,p.y,state.board[i],state.selected===i)});svg.innerHTML=s;svg.querySelectorAll('[data-i]').forEach(el=>el.addEventListener('click',()=>onNode(+el.dataset.i)))}
function updateHUD(){document.getElementById('name1').textContent=settings.p1;document.getElementById('name2').textContent=settings.p2;document.getElementById('reserve1').textContent=state.reserve[1];document.getElementById('reserve2').textContent=state.reserve[2];document.getElementById('board1').textContent=state.onBoard[1];document.getElementById('board2').textContent=state.onBoard[2];document.getElementById('card1').classList.toggle('active',state.turn===1&&!state.gameOver);document.getElementById('card2').classList.toggle('active',state.turn===2&&!state.gameOver);const st=document.getElementById('status');if(state.gameOver)return;if(state.mode==='online'&&seat!==state.turn){st.innerHTML=`<span class="phase-badge">EN LIGNE</span>Tour de ${currentName()}`;return}if(state.aiBusy){st.innerHTML=`<span class="phase-badge">IA</span>${settings.p2} réfléchit…`;return}if(state.capture){st.innerHTML=`<span class="phase-badge">MOULIN</span>${currentName()} : retirez une vache adverse`;return}const ph=phaseForPlayer(state.turn),label=ph==='placement'?'PLACEMENT':ph==='flying'?'VOL':'DÉPLACEMENT',act=ph==='placement'?'posez une vache':ph==='flying'?'déplacez vers n’importe quelle intersection libre':'déplacez le long d’une ligne';st.innerHTML=`<span class="phase-badge">${label}</span>${currentName()} : ${act}`}
function endGame(w,reason){state.gameOver=true;state.aiBusy=false;afterAction();document.getElementById('end-title').textContent=`${playerName(w)} gagne !`;document.getElementById('end-text').textContent=reason;sound('mill');document.getElementById('end-modal').classList.add('show')}function closeModal(){document.getElementById('end-modal').classList.remove('show')}function restartFromModal(){closeModal();if(state.mode==='online'){if(seat===1)onlineRestart();else alert('Seul le créateur du salon peut relancer la partie.')}else startGame()}function confirmRestart(){if(state.mode==='online'){if(seat!==1){alert('Seul le créateur du salon peut recommencer.');return}if(confirm('Recommencer la partie ?'))onlineRestart()}else if(confirm('Recommencer la partie ?'))startGame()}function confirmQuit(){if(confirm('Quitter la partie ?')){if(state.mode==='online')leaveOnlineRoom();goHome()}}
function maybeAI(){
  if(state.mode!=='ai'||state.turn!==2||state.gameOver||state.aiBusy)return;
  state.aiBusy=true;updateHUD();
  setTimeout(()=>aiTurn(),650)
}
function scorePosition(b,p){let score=0;for(const m of cfg().mills){const vals=m.map(i=>b[i]),pc=vals.filter(v=>v===p).length,ec=vals.filter(v=>v===0).length;if(pc===3)score+=100;if(pc===2&&ec===1)score+=16;if(pc===1&&ec===2)score+=3}return score}
function choose(a){return a[Math.floor(Math.random()*a.length)]}
function isMillBoard(i,p,b){return cfg().mills.some(m=>m.includes(i)&&m.every(n=>b[n]===p))}
function chooseAiCapture(){
  const valid=capturableIndices(1);if(!valid.length)return null;
  if(settings.difficulty==='easy')return choose(valid);
  let pick=valid[0],best=-1e9;
  for(const i of valid){const b=[...state.board];b[i]=0;let sc=-scorePosition(b,1);const threats=cfg().mills.filter(m=>m.includes(i)&&m.filter(n=>b[n]===1).length>=1).length;sc+=threats*4;if(sc>best){best=sc;pick=i}}
  return pick
}
function finishAiTurn(){state.aiBusy=false;if(!state.gameOver){render();updateHUD()}}
function aiCaptureAfterMill(){
  const pick=chooseAiCapture();
  if(pick===null){finishAiTurn();return}
  setTimeout(()=>{captureAt(pick);if(state.turn!==2||state.gameOver)finishAiTurn()},420)
}
function aiTurn(){
  if(state.gameOver||state.turn!==2){finishAiTurn();return}
  if(state.capture){aiCaptureAfterMill();return}
  const ph=phaseForPlayer(2);
  if(ph==='placement'){
    const empty=state.board.map((v,i)=>v===0?i:-1).filter(i=>i>=0);let pick=choose(empty),best=-1e9;
    if(settings.difficulty!=='easy')for(const i of empty){const b=[...state.board];b[i]=2;let sc=scorePosition(b,2)*2-scorePosition(b,1);if(isMillBoard(i,2,b))sc+=120;if(sc>best){best=sc;pick=i}}
    placeAt(pick);
    if(state.capture&&state.turn===2&&!state.gameOver)aiCaptureAfterMill();else finishAiTurn();
    return
  }
  let moves=[];state.board.forEach((v,i)=>{if(v===2)validMovesFrom(i,2).forEach(to=>moves.push({from:i,to}))});
  if(!moves.length){endGame(1,`${settings.p2} est bloquée.`);finishAiTurn();return}
  let pick=choose(moves),best=-1e9;
  if(settings.difficulty!=='easy')for(const m of moves){const b=[...state.board];b[m.from]=0;b[m.to]=2;let sc=scorePosition(b,2)*2-scorePosition(b,1);if(isMillBoard(m.to,2,b))sc+=120;if(sc>best){best=sc;pick=m}}
  movePiece(pick.from,pick.to);
  if(state.capture&&state.turn===2&&!state.gameOver)aiCaptureAfterMill();else finishAiTurn()
}
function roomCodeGen(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join('')}
function onlinePayload(){return {boardType:settings.boardType,names:{1:settings.p1,2:settings.p2},state:{board:state.board,turn:state.turn,reserve:state.reserve,onBoard:state.onBoard,selected:null,capture:state.capture,gameOver:state.gameOver},updatedAt:firebase.database.ServerValue.TIMESTAMP}}
async function createRoom(){
  if(!fbReady){alert(fbError?`Firebase : ${fbError}

Vérifie que l’authentification anonyme est activée.`:'Connexion Firebase en cours. Réessayez dans un instant.');return}
  const name=document.getElementById('online-name').value.trim()||'Joueur Rouge';settings.boardType=document.getElementById('online-board').value;settings.p1=name;settings.p2='En attente…';seat=1;state=freshState('online');
  try{
    for(let tries=0;tries<8;tries++){roomCode=roomCodeGen();const candidate=db.ref('morabarabaRooms/'+roomCode);const exists=await candidate.once('value');if(!exists.exists()){roomRef=candidate;break}}
    if(!roomRef)throw new Error('Impossible de générer un code de salon libre.');
    const roomData={hostUid:currentUid,boardType:settings.boardType,status:'waiting',createdAt:firebase.database.ServerValue.TIMESTAMP,players:{[currentUid]:{name,seat:1,connected:true}},game:onlinePayload()};
    await roomRef.set(roomData);attachRoom();showRoomCard();updateURL();showScreen('online-screen')
  }catch(e){console.error('Création salon',e);roomRef=null;roomCode=null;seat=null;alert(`Impossible de créer le salon.

${e.code||e.message||e}

Si le message contient PERMISSION_DENIED, publie aussi le fichier firebase-rules.json fourni avec la V3.`)}
}
async function joinRoom(codeArg){
  if(!fbReady){alert(fbError?`Firebase : ${fbError}`:'Connexion Firebase en cours.');return}
  const code=(codeArg||document.getElementById('room-code-input').value).trim().toUpperCase();if(!code){alert('Entre le code du salon.');return}
  const name=document.getElementById('online-name').value.trim()||'Joueur Jaune';
  try{
    roomRef=db.ref('morabarabaRooms/'+code);const snap=await roomRef.once('value');if(!snap.exists()){roomRef=null;alert('Salon introuvable.');return}
    const data=snap.val(),players=data.players||{};if(Object.keys(players).length>=2&&!players[currentUid]){roomRef=null;alert('Ce salon est complet.');return}
    roomCode=code;seat=players[currentUid]?.seat||2;
    await roomRef.child('players/'+currentUid).set({name,seat,connected:true});await roomRef.update({status:'playing'});attachRoom();showRoomCard();updateURL();showScreen('online-screen')
  }catch(e){console.error('Rejoindre salon',e);roomRef=null;roomCode=null;seat=null;alert(`Impossible de rejoindre le salon.

${e.code||e.message||e}`)}
}
function attachRoom(){if(!roomRef)return;roomRef.off();roomRef.on('value',snap=>{if(!snap.exists()){if(state.mode==='online')alert('Le salon a été fermé.');roomRef=null;roomCode=null;seat=null;goHome();return}const d=snap.val(),pls=Object.values(d.players||{}),p1=pls.find(p=>p.seat===1),p2=pls.find(p=>p.seat===2);if(p1)settings.p1=p1.name;if(p2)settings.p2=p2.name;if(d.boardType)settings.boardType=d.boardType;document.getElementById('room-status').textContent=p2?'Adversaire connecté. Partie en cours.':'En attente d’un adversaire…';if(d.game&&d.game.state){remoteApplying=true;state={...state,...d.game.state,mode:'online',aiBusy:false,selected:null};remoteApplying=false;if(p2){showScreen('game-screen');render();updateHUD()}}})}
function pushOnlineState(){if(state.mode!=='online'||!roomRef||remoteApplying)return;roomRef.child('game').set(onlinePayload())}
function showRoomCard(){document.getElementById('room-card').style.display='block';document.getElementById('room-code-view').textContent=roomCode}
function shareRoom(){const url=new URL(location.href);url.searchParams.set('room',roomCode);if(navigator.share)navigator.share({title:'Morabaraba',text:`Rejoins mon salon Morabaraba : ${roomCode}`,url:url.toString()});else navigator.clipboard.writeText(url.toString()).then(()=>alert('Lien copié.'))}
function updateURL(){const u=new URL(location.href);u.searchParams.set('room',roomCode);history.replaceState({},'',u)}
function autoJoinFromURL(){const c=new URL(location.href).searchParams.get('room');if(c&&!roomCode){document.getElementById('room-code-input').value=c.toUpperCase();showScreen('online-screen')}}
async function leaveOnlineRoom(){if(roomRef&&currentUid){try{if(seat===1)await roomRef.remove();else await roomRef.child('players/'+currentUid).remove()}catch(e){}}roomRef=null;roomCode=null;seat=null;const u=new URL(location.href);u.searchParams.delete('room');history.replaceState({},'',u)}
function onlineRestart(){if(state.mode!=='online'||seat!==1)return;state=freshState('online');pushOnlineState();render();updateHUD()}
window.addEventListener('beforeunload',()=>{if(roomRef&&currentUid&&seat===2)roomRef.child('players/'+currentUid).remove()});
syncSettings();state=freshState('local');render();updateHUD();
