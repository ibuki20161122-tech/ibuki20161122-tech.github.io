const title=document.getElementById("titleScreen");
const game=document.getElementById("gameScreen");
const result=document.getElementById("result");

const jp=document.getElementById("jpWord");
const roma=document.getElementById("romaWord");
const input=document.getElementById("input");

let score=0,combo=0,time=30;
let timer;
let level=1;
let lastWord="";

/* 単語 */
const words=[
["ねこ","いぬ","すし","そら","やま"],
["りんご","でんしゃ","がっこう"],
["しゅくだい","せんせい"],
["ぷろぐらみんぐ","こんぴゅーたー"]
];

/* スペース開始 */
document.addEventListener("keydown",(e)=>{
 if(e.code==="Space" && title.classList.contains("hidden")===false){
  startGame();
 }
});

/* ゲーム開始 */
function startGame(){

 title.classList.add("hidden");
 game.classList.remove("hidden");

 score=0;
 combo=0;
 time=30;
 level=1;

 input.disabled=false;
 input.value="";
 input.focus();

 nextWord();

 clearInterval(timer);
 timer=setInterval(updateTime,100);
}

/* 単語 */
function nextWord(){

 let pool=words[Math.min(level-1,words.length-1)];
 let w;

 do{
  w=pool[Math.floor(Math.random()*pool.length)];
 }while(w===lastWord);

 lastWord=w;

 jp.textContent=w;
 roma.textContent="type...";
}

/* 入力 */
input.addEventListener("input",()=>{

 let val=input.value;

 if(val.length>0){

  combo++;
  score+=10+combo;

  input.value="";

  nextWord();

  flash();
 }else{
  combo=0;
 }

 updateUI();
});

/* UI */
function updateUI(){
 document.getElementById("score").textContent=score;
 document.getElementById("combo").textContent=combo;
 document.getElementById("time").textContent=time.toFixed(1);

 updateBg();
}

/* タイマー */
function updateTime(){
 time-=0.1;

 if(time<=0){
  endGame();
 }

 updateUI();
}

/* 背景変化 */
function updateBg(){
 document.body.classList.remove("bg1","bg2","bg3","bg4","bg5");

 let b="bg1";

 if(combo>5) b="bg2";
 if(combo>10) b="bg3";
 if(combo>15) b="bg4";
 if(combo>20) b="bg5";

 document.body.classList.add(b);
}

/* フラッシュ */
function flash(){
 input.style.transform="scale(1.05)";
 setTimeout(()=>{
  input.style.transform="scale(1)";
 },80);
}

/* 終了 */
function endGame(){
 clearInterval(timer);

 game.classList.add("hidden");
 result.classList.remove("hidden");

 document.getElementById("finalScore").textContent="Score: "+score;
}
