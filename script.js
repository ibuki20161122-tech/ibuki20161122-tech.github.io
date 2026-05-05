const title=document.getElementById("titleScreen");
const game=document.getElementById("gameScreen");
const input=document.getElementById("input");
const jp=document.getElementById("jpWord");
const roma=document.getElementById("romaWord");
const bgm=document.getElementById("bgm");

let score=0,combo=0,time=30,level=1;
let miss=0,typed=0,correct=0;
let lastWord="";
let timer;

/* 単語 */
const words=[
["ねこ","いぬ","すし","そら","やま"],
["りんご","でんしゃ","がっこう"],
["しゅくだい","せんせい"],
["ぷろぐらみんぐ","こんぴゅーたー"]
];

const romaMap={
"あ":["a"],"い":["i"],"う":["u"],"え":["e"],"お":["o"],
"か":["ka"],"き":["ki"],"く":["ku"],"け":["ke"],"こ":["ko"],
"ん":["nn","n"]
};

/* スタート */
document.addEventListener("keydown",(e)=>{
 if(e.code==="Space" && !title.classList.contains("hidden")){
   startGame();
 }
});

function startGame(){
 title.classList.add("hidden");
 game.classList.remove("hidden");

 score=0;combo=0;time=30;
 miss=0;typed=0;correct=0;

 input.disabled=false;
 input.value="";

 bgm.play();

 nextWord();
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
 roma.textContent="typing...";
}

/* 入力 */
input.addEventListener("input",()=>{
 typed++;

 let val=input.value;

 correct++;

 if(val.length>0){
  combo++;
  score+=10+combo*3;

  explode();

  input.value="";
  nextWord();
 }else{
  combo=0;
  miss++;
 }

 updateUI();
});

/* UI */
function updateUI(){
 document.getElementById("score").textContent=score;
 document.getElementById("combo").textContent=combo;
 document.getElementById("time").textContent=time.toFixed(1);

 let acc=typed?Math.floor((correct/typed)*100):100;
 document.getElementById("accuracy").textContent=acc;
}

/* タイマー */
function updateTime(){
 time-=0.1;
 if(time<=0) end();
 updateUI();
}

/* 終了 */
function end(){
 clearInterval(timer);
 input.disabled=true;

 document.getElementById("finalScore").textContent=score;
 document.getElementById("result").classList.remove("hidden");
}

/* 爆発 */
function explode(){
 for(let i=0;i<10;i++){
  let p=document.createElement("div");
  p.className="particle";

  let a=Math.random()*Math.PI*2;
  let d=50;

  p.style.left="50%";
  p.style.top="50%";
  p.style.setProperty("--x",Math.cos(a)*d+"px");
  p.style.setProperty("--y",Math.sin(a)*d+"px");

  document.body.appendChild(p);
  setTimeout(()=>p.remove(),600);
 }
}

/* 閉じる */
function closeResult(){
 location.reload();
}
