// ===== 要素 =====
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("result");
const input = document.getElementById("input");

const jp = document.getElementById("jpWord");
const roma = document.getElementById("romaWord");

// ===== 初期 =====
window.onload = ()=>{
  input.blur();
  gameScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
};

// ===== スマホ判定 =====
const isMobile = /iPhone|Android/i.test(navigator.userAgent);

// ===== 単語 =====
const wordLevels=[
 ["ねこ","いぬ","すし"],
 ["りんご","えんぴつ"],
 ["しゅくだい","せんせい"],
 ["ぷろぐらみんぐ","こんぴゅーたー"]
];

// ===== ローマ字 =====
const romaMap={
 "あ":["a"],"い":["i"],"う":["u"],"え":["e"],"お":["o"],
 "か":["ka"],"き":["ki"],"く":["ku"],"け":["ke"],"こ":["ko"],
 "さ":["sa"],"し":["shi","si"],"す":["su"],"せ":["se"],"そ":["so"],
 "た":["ta"],"ち":["chi","ti"],"つ":["tsu","tu"],"て":["te"],"と":["to"],
 "な":["na"],"に":["ni"],"ぬ":["nu"],"ね":["ne"],"の":["no"],
 "は":["ha"],"ひ":["hi"],"ふ":["fu"],"へ":["he"],"ほ":["ho"],
 "ま":["ma"],"み":["mi"],"む":["mu"],"め":["me"],"も":["mo"],
 "や":["ya"],"ゆ":["yu"],"よ":["yo"],
 "ら":["ra"],"り":["ri"],"る":["ru"],"れ":["re"],"ろ":["ro"],
 "わ":["wa"],"を":["wo"],
 "ん":["n","nn"],
 "ぱ":["pa"],"ぴ":["pi"],"ぷ":["pu"],"ぺ":["pe"],"ぽ":["po"]
};

function kanaToRoma(k){
 let res=[""];
 for(let c of k){
  let next=[];
  res.forEach(r=>{
    (romaMap[c]||[""]).forEach(x=>next.push(r+x));
  });
  res=next;
 }
 res.sort((a,b)=>a.length-b.length);
 return res;
}

// ===== 音 =====
const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
function playTypeSound(){
 const o=audioCtx.createOscillator();
 const g=audioCtx.createGain();
 o.frequency.value=400+Math.random()*200;
 g.gain.value=0.05;
 o.connect(g); g.connect(audioCtx.destination);
 o.start(); o.stop(audioCtx.currentTime+0.05);
}

// ===== ゲーム =====
let score=0,combo=0,time=30,level=1;
let current={},display="",timer,lastWord="";

// ===== 共通開始 =====
function startGameUI(){
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  startGame();

  setTimeout(()=>input.focus(),100);

  if(audioCtx.state==="suspended") audioCtx.resume();
}

// ===== PC（スペース）=====
document.addEventListener("keydown",(e)=>{
  if(document.activeElement===input) return;

  if(e.code==="Space"){
    e.preventDefault();
    if(!titleScreen.classList.contains("hidden")){
      startGameUI();
    }
  }
});

// ===== スマホ（ボタン）=====
document.getElementById("startBtn").onclick=()=>{
  startGameUI();
};

// ===== 開始 =====
function startGame(){
 score=0; combo=0; time=30; level=1;
 input.disabled=false;
 input.value="";
 nextWord();

 clearInterval(timer);
 timer=setInterval(()=>{
  time--;
  if(time<=0) endGame();
  updateUI();
 },1000);
}

// ===== 次の単語 =====
function nextWord(){
 level=Math.min(4,Math.floor(score/50)+1);

 let pool=wordLevels[level-1];
 let w;
 do{
  w=pool[Math.floor(Math.random()*pool.length)];
 }while(w===lastWord);
 lastWord=w;

 let patterns=kanaToRoma(w);
 current={patterns:patterns};
 display=patterns[0];

 jp.textContent=w;
 show("",display);
}

// ===== 入力 =====
input.addEventListener("input",()=>{
 playTypeSound();

 let val=input.value.toLowerCase();
 let valid=current.patterns.filter(p=>p.startsWith(val));

 if(valid.length){
   display=valid[0];
   show(val,display);

   if(valid.includes(val)){
     combo++;
     score+=10+combo*2;

     showCombo();

     if(navigator.vibrate) navigator.vibrate(30);

     input.value="";
     nextWord();
   }
 }else{
   combo=0;
   input.value=val.slice(0,-1);
 }

 updateUI();
});

// ===== 表示 =====
function show(val,correct){
 let html="";
 let gold=combo>=10;

 for(let i=0;i<correct.length;i++){
  let cls="remaining";
  if(i<val.length) cls=gold?"gold":"correct";
  html+=`<span class="${cls}">${correct[i]}</span>`;
 }
 roma.innerHTML=html;
}

// ===== コンボ =====
function showCombo(){
 if(combo<2) return;
 let el=document.createElement("div");
 el.className="comboText";
 el.textContent=combo+" COMBO!";
 document.getElementById("comboEffect").appendChild(el);
 setTimeout(()=>el.remove(),600);
}

// ===== 終了 =====
function endGame(){
 clearInterval(timer);
 input.disabled=true;

 document.getElementById("finalScore").textContent="Score: "+score;
 resultScreen.classList.remove("hidden");
}

// ===== 戻る =====
function closeResult(){
 resultScreen.classList.add("hidden");
 titleScreen.classList.remove("hidden");
 gameScreen.classList.add("hidden");
}

// ===== UI =====
function updateUI(){
 document.getElementById("score").textContent=score;
 document.getElementById("combo").textContent=combo;
 document.getElementById("time").textContent=time;
 document.getElementById("level").textContent=level;
}
