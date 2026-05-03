// ================= 単語 =================
const words = [
 "りんご","かんじ","てんき","ほん","ねこ",
 "すし","しゃしん","がっこう","きょう","しゅくだい"
];

// ================= ローマ字 =================
const romaMap = {
 "あ":["a"],"い":["i"],"う":["u"],"え":["e"],"お":["o"],
 "か":["ka"],"き":["ki"],"く":["ku"],"け":["ke"],"こ":["ko"],
 "さ":["sa"],"し":["shi","si"],"す":["su"],"せ":["se"],"そ":["so"],
 "た":["ta"],"ち":["chi","ti"],"つ":["tsu","tu"],"て":["te"],"と":["to"],
 "な":["na"],"に":["ni"],"ぬ":["nu"],"ね":["ne"],"の":["no"],
 "は":["ha"],"ひ":["hi"],"ふ":["fu","hu"],"へ":["he"],"ほ":["ho"],
 "ま":["ma"],"み":["mi"],"む":["mu"],"め":["me"],"も":["mo"],
 "や":["ya"],"ゆ":["yu"],"よ":["yo"],
 "ら":["ra"],"り":["ri"],"る":["ru"],"れ":["re"],"ろ":["ro"],
 "わ":["wa"],"を":["wo"],"ん":["n"],
 "が":["ga"],"ぎ":["gi"],"ぐ":["gu"],"げ":["ge"],"ご":["go"],
 "ざ":["za"],"じ":["ji","zi"],"ず":["zu"],"ぜ":["ze"],"ぞ":["zo"]
};

const digraph = {
 "しゃ":["sha","sya"],"しゅ":["shu","syu"],"しょ":["sho","syo"]
};

// ================= 変換 =================
function kanaToRoma(kana) {
 let res = [""];
 for (let i=0;i<kana.length;i++) {
   let c = kana[i];

   if (c==="っ") {
     let next = romaMap[kana[i+1]] || ["x"];
     let temp=[];
     res.forEach(r=>{
       next.forEach(n=>temp.push(r+n[0]));
       temp.push(r+"xtu");
     });
     res=temp;
     continue;
   }

   let pair = kana[i]+kana[i+1];
   if (digraph[pair]) {
     res = combine(res,digraph[pair]);
     i++;
     continue;
   }

   res = combine(res,romaMap[c]||[""]);
 }

 return expandN(res);
}

function combine(a,b){
 let r=[];
 a.forEach(x=>b.forEach(y=>r.push(x+y)));
 return r;
}

function expandN(list){
 let r=[];
 list.forEach(s=>{
   r.push(s);
   r.push(s.replace(/n/g,"nn"));
 });
 return [...new Set(r)];
}

// ================= ゲーム =================
let current={},score=0,time=30,level=1,combo=0;
let highScore = localStorage.getItem("highScore")||0;
let timer;

const jpWord = document.getElementById("jpWord");
const romaWord = document.getElementById("romaWord");
const input = document.getElementById("input");

document.getElementById("highScore").textContent = highScore;

// 🎵 音
const ctx = new AudioContext();
function typeSound(){
 let o=ctx.createOscillator();
 let g=ctx.createGain();
 o.frequency.value=600;
 g.gain.value=0.05;
 o.connect(g); g.connect(ctx.destination);
 o.start(); o.stop(ctx.currentTime+0.05);
}

// 💥 エフェクト
const effect = document.getElementById("effect");
function showEffect(t){
 effect.textContent=t;
 effect.style.opacity=1;
 setTimeout(()=>effect.style.opacity=0,300);
}

// ⌨️ スペース開始
document.addEventListener("keydown",e=>{
 if(e.code==="Space"){
   e.preventDefault();
   startGame();
 }
});

function startGame(){
 score=0;time=30;level=1;combo=0;
 input.disabled=false;
 input.value="";
 input.focus();
 nextWord();
 clearInterval(timer);
 timer=setInterval(updateTime,1000);
}

function nextWord(){
 let kana=words[Math.floor(Math.random()*words.length)];
 let patterns=kanaToRoma(kana);
 current={kana,patterns};
 jpWord.textContent=kana;
 romaWord.textContent=patterns[0];
}

input.addEventListener("input",()=>{
 let val=input.value;

 let ok=current.patterns.some(p=>p.startsWith(val));

 if(ok){
   if(current.patterns.includes(val)){
     combo++;
     score+=10+combo*2;
     typeSound();
     if(combo>=3) showEffect("🔥"+combo);

     input.value="";
     nextWord();
   }
 }else{
   combo=0;
   input.value="";
 }
 updateUI();
});

function updateTime(){
 time--;
 document.getElementById("time").textContent=time;
 if(time<=0) endGame();
}

function updateUI(){
 document.getElementById("score").textContent=score;
 document.getElementById("combo").textContent=combo;
 document.getElementById("level").textContent=level;
}

function endGame(){
 clearInterval(timer);
 input.disabled=true;
 jpWord.textContent="ゲーム終了！";

 if(score>highScore){
   localStorage.setItem("highScore",score);
 }
 saveScore(score);
}

// 🏆 ランキング
function saveScore(s){
 let r=JSON.parse(localStorage.getItem("rank"))||[];
 r.push(s);
 r.sort((a,b)=>b-a);
 r=r.slice(0,5);
 localStorage.setItem("rank",JSON.stringify(r));
}

function showRanking(){
 let r=JSON.parse(localStorage.getItem("rank"))||[];
 alert("ランキング\n"+r.map((s,i)=>`${i+1}位:${s}`).join("\n"));
}
