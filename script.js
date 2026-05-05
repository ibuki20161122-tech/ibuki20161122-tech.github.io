const VERSION = "v1.1.0";
document.getElementById("version").textContent = VERSION;

const words = [
 "ねこ","いぬ","りんご","しゅくだい","えんぴつ","ぷろぐらみんぐ"
];

// シンプルローマ字（安定）
const roma = {
 "ねこ":"neko",
 "いぬ":"inu",
 "りんご":"ringo",
 "しゅくだい":"shukudai",
 "えんぴつ":"enpitsu",
 "ぷろぐらみんぐ":"puroguramingu"
};

let current="",score=0,combo=0,time=30,timer;

const input = document.getElementById("input");
const jp = document.getElementById("jpWord");
const romaEl = document.getElementById("romaWord");

// スペース開始
document.addEventListener("keydown",e=>{
 if(e.code==="Space") startGame();
});

function startGame(){
 score=0; combo=0; time=30;
 input.disabled=false;
 input.value="";
 input.focus();
 nextWord();
 updateUI();
 clearInterval(timer);
 timer=setInterval(updateTime,1000);
}

function nextWord(){
 current = words[Math.floor(Math.random()*words.length)];
 jp.textContent = current;
 showColored("", roma[current]);
}

// 入力
input.addEventListener("input",()=>{
 let val = input.value.toLowerCase();
 let correct = roma[current];

 if(correct.startsWith(val)){
   showColored(val, correct);

   if(val === correct){
     combo++;
     score += 10 + combo * 2;
     input.value="";
     nextWord();
   }
 }else{
   combo=0;
   input.value = val.slice(0,-1);
 }

 updateUI();
});

// 光る表示
function showColored(inputStr, correct){
 let html="";
 let gold = combo >= 10;

 for(let i=0;i<correct.length;i++){
  let cls="remaining";

  if(i < inputStr.length){
    if(inputStr[i] === correct[i]){
      cls = gold ? "gold" : "correct";
    }else{
      cls = "wrong";
    }
  }

  html += `<span class="${cls}">${correct[i]}</span>`;
 }

 romaEl.innerHTML = html;
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
 alert("スコア: "+score+" / "+VERSION);
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

// 波紋
document.addEventListener("click",(e)=>{
 let r=document.createElement("div");
 r.className="ripple";
 r.style.left=e.clientX+"px";
 r.style.top=e.clientY+"px";
 document.body.appendChild(r);
 setTimeout(()=>r.remove(),600);
});
