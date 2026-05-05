const VERSION = "v1.0.0";

document.getElementById("version").textContent = VERSION;

// 単語
const words=["ねこ","いぬ","りんご","しゅくだい","えんぴつ","ぷろぐらみんぐ"];

// 簡易ローマ字（安定版）
function kanaToRoma(k){
 return {
  "ねこ":"neko",
  "いぬ":"inu",
  "りんご":"ringo",
  "しゅくだい":"shukudai",
  "えんぴつ":"enpitsu",
  "ぷろぐらみんぐ":"puroguramingu"
 }[k];
}

// 変数
let current="";
let display="";
let score=0,combo=0,time=30,timer;

const input=document.getElementById("input");
const jp=document.getElementById("jpWord");
const roma=document.getElementById("romaWord");

// スタート
document.addEventListener("keydown",e=>{
 if(e.code==="Space") startGame();
});

function startGame(){
 score=0;combo=0;time=30;
 input.disabled=false;
 input.value="";
 input.focus();
 nextWord();
 clearInterval(timer);
 timer=setInterval(updateTime,1000);
}

// 次
function nextWord(){
 current=words[Math.floor(Math.random()*words.length)];
 display=kanaToRoma(current);
 jp.textContent=current;
 showColored("",display);
}

// 入力
input.addEventListener("input",()=>{
 let val=input.value.toLowerCase();

 input.classList.add("flash");
 setTimeout(()=>input.classList.remove("flash"),100);

 if(display.startsWith(val)){
   showColored(val,display);

   if(val===display){
     combo++;
     score+=10+combo*2;
     input.value="";
     nextWord();
   }
 }else{
   combo=0;
   input.value=val.slice(0,-1);
 }

 updateUI();
});

// 表示
function showColored(inputStr, correct){
 let html="";
 let gold=combo>=10;

 for(let i=0;i<correct.length;i++){
  if(i<inputStr.length){
    html+=`<span class="${gold?"gold":"correct"}">${correct[i]}</span>`;
  }else{
    html+=`<span class="remaining">${correct[i]}</span>`;
  }
 }

 roma.innerHTML=html;
}

// タイマー
function updateTime(){
 time--;
 if(time<=0){
   endGame();
 }
 updateUI();
}

function endGame(){
 clearInterval(timer);
 input.disabled=true;
 saveScore(score);
 alert("終了！スコア: "+score+" / "+VERSION);
}

// ランキング
function saveScore(s){
 let data=JSON.parse(localStorage.getItem("rank")||"[]");
 data.push(s);
 data.sort((a,b)=>b-a);
 data=data.slice(0,5);
 localStorage.setItem("rank",JSON.stringify(data));
 loadRanking();
}

function loadRanking(){
 let data=JSON.parse(localStorage.getItem("rank")||"[]");
 let list=document.getElementById("ranking");
 list.innerHTML="";
 data.forEach(d=>{
  let li=document.createElement("li");
  li.textContent=d;
  list.appendChild(li);
 });
}
loadRanking();

// UI
function updateUI(){
 document.getElementById("score").textContent=score;
 document.getElementById("combo").textContent=combo;
 document.getElementById("time").textContent=time;
}
