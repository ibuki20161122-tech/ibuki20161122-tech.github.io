const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("result");
const input = document.getElementById("input");

const jp = document.getElementById("jpWord");
const roma = document.getElementById("romaWord");

const bgm = document.getElementById("bgm");

// 状態
let score=0,combo=0,time=30,level=1;
let miss=0,typed=0,correctTyped=0;
let startTime=Date.now();
let timer;
let current={};

// 単語
const wordLevels=[
["ねこ","いぬ","すし"],
["りんご","えんぴつ"],
["しゅくだい","せんせい"],
["ぷろぐらみんぐ","こんぴゅーたー"]
];

// ローマ字
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
"ん":["nn","n"]
};

const digraph={
"しゃ":["sha","sya"],"しゅ":["shu","syu"],"しょ":["sho","syo"],
"きゃ":["kya"],"きゅ":["kyu"],"きょ":["kyo"]
};

// 変換
function kanaToRoma(k){
 let res=[""];
 for(let i=0;i<k.length;i++){
  let c=k[i];
  let pair=k[i]+k[i+1];

  if(digraph[pair]){
    res=combine(res,digraph[pair]);
    i++;
    continue;
  }

  res=combine(res,romaMap[c]||[""]);
 }
 return res.filter(v=>v!=="");
}

function combine(a,b){
 let r=[];
 a.forEach(x=>b.forEach(y=>r.push(x+y)));
 return r;
}

// スタート
document.addEventListener("keydown",(e)=>{
 if(e.code==="Space" && titleScreen.classList.contains("hidden")===false){
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  startGame();
  setTimeout(()=>input.focus(),100);
 }
});

function startGame(){
 score=0;combo=0;time=30;level=1;
 miss=0;typed=0;correctTyped=0;
 startTime=Date.now();

 input.disabled=false;
 input.value="";

 bgm.volume=0.3;
 bgm.play();

 nextWord();

 clearInterval(timer);
 timer=setInterval(updateTime,1000);
}

// 単語
function nextWord(){
 let pool=wordLevels[Math.min(level-1,wordLevels.length-1)];
 let w=pool[Math.floor(Math.random()*pool.length)];

 current={kana:w,patterns:kanaToRoma(w)};

 jp.textContent=w;
 roma.textContent=current.patterns[0];
}

// 入力
input.addEventListener("input",()=>{

 let val=input.value.toLowerCase();
 typed++;

 let valid=current.patterns.filter(p=>p.startsWith(val));

 if(valid.length>0){
  correctTyped++;

  roma.innerHTML=highlight(val,valid[0]);

  if(valid.includes(val)){
    combo++;
    score+=10+combo*3;

    explode(window.innerWidth/2,window.innerHeight/2);

    input.value="";
    nextWord();
  }

 }else{
  combo=0;
  miss++;
  input.value=val.slice(0,-1);
 }

 updateUI();
});

// 表示
function highlight(val,text){
 let h="";
 for(let i=0;i<text.length;i++){
  h+=`<span style="color:${i<val.length?'#0f0':'#555'}">${text[i]}</span>`;
 }
 return h;
}

// UI
function updateUI(){
 document.getElementById("score").textContent=score;
 document.getElementById("combo").textContent=combo;
 document.getElementById("time").textContent=time;
 document.getElementById("level").textContent=level;

 let acc=typed?Math.floor((correctTyped/typed)*100):100;
 document.getElementById("accuracy").textContent=acc;

 let wpm=Math.floor((correctTyped/5)/((Date.now()-startTime)/60000));
 document.getElementById("wpm").textContent=isFinite(wpm)?wpm:0;

 document.getElementById("miss").textContent=miss;
}

// タイマー
function updateTime(){
 time-=1+level*0.1;
 if(time<=0) endGame();
 updateUI();
}

// 終了
function endGame(){
 clearInterval(timer);
 input.disabled=true;

 document.getElementById("finalScore").textContent="Score:"+score;

 resultScreen.classList.remove("hidden");
}

// 閉じる
function closeResult(){
 resultScreen.classList.add("hidden");
 titleScreen.classList.remove("hidden");
 gameScreen.classList.add("hidden");
}

// 爆発
function explode(x,y){
 for(let i=0;i<12;i++){
  let p=document.createElement("div");
  p.className="particle";

  let angle=Math.random()*Math.PI*2;
  let dist=60+Math.random()*40;

  p.style.left=x+"px";
  p.style.top=y+"px";
  p.style.setProperty("--x",Math.cos(angle)*dist+"px");
  p.style.setProperty("--y",Math.sin(angle)*dist+"px");

  document.body.appendChild(p);
  setTimeout(()=>p.remove(),600);
 }
}
