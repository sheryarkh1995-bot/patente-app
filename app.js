
const APP_VERSION='v1.0.0';
const STORAGE='patente-b-v1-state';
let quiz=null;
let state=loadState();
let currentQ=state.currentQ||0;
let currentPage=state.currentPage||1;
let touchStartX=null;

function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE))||{answers:{},difficult:{},currentQ:0,currentPage:1}}catch(e){return {answers:{},difficult:{},currentQ:0,currentPage:1}}}
function saveState(){state.currentQ=currentQ;state.currentPage=currentPage;localStorage.setItem(STORAGE,JSON.stringify(state))}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function init(){quiz=window.QUIZ_DATA||await fetch('data/quiz-001.json').then(r=>r.json()); renderHome(); if('serviceWorker' in navigator && location.protocol!=='file:') navigator.serviceWorker.register('sw.js').catch(()=>{});}
function answeredCount(){return Object.keys(state.answers||{}).filter(k=>state.answers[k]).length}
function correctCount(){return quiz.questions.filter(q=>state.answers[q.id]===q.ans).length}
function renderHome(){
 const done=answeredCount(); const pct=Math.round(done/quiz.questions.length*100);
 document.getElementById('app').innerHTML=`<div class="screen safe-top"><div class="home">
 <div class="hero"><div class="tiny">PATENTE B · ITALIAN COURSE</div><h1>Learn the quiz.<br/>Learn the Italian.</h1><p>One question. Three phone screens. Progress stays on this device.</p></div>
 <div class="quiz-card"><div class="quiz-title">${quiz.title}</div><div class="quiz-meta">${quiz.subtitle}</div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><div class="quiz-meta">${done}/30 questions answered${done?` · ${correctCount()} correct`:''}</div>
 <button class="primary" onclick="openQuiz()">${done?'Continue Quiz':'Start Quiz'}</button>${done?'<button class="secondary" onclick="resetQuiz()">Reset Quiz 01</button>':''}</div>
 <div class="small-note">V1 works offline after the first hosted load. Your answers, difficult-question marks and current position are stored locally on your phone.</div>
 </div></div>`;
}
function resetQuiz(){if(confirm('Reset Quiz 01 progress on this device?')){state={answers:{},difficult:{},currentQ:0,currentPage:1};currentQ=0;currentPage=1;saveState();renderHome()}}
function openQuiz(){currentQ=Math.min(state.currentQ||0,quiz.questions.length-1);currentPage=state.currentPage||1;renderQuestion()}
function q(){return quiz.questions[currentQ]}
function pagePct(){return ((currentQ*3+(currentPage-1))/(quiz.questions.length*3))*100}
function renderShell(content){
 document.getElementById('app').innerHTML=`<div class="screen safe-top" id="quizScreen"><div class="pagehead"><button class="icon-btn" onclick="goHome()">‹</button><div><div class="qcount">QUIZ 01 · ${String(currentQ+1).padStart(2,'0')}/30</div><div class="pcount">PAGE ${currentPage} / 3</div></div><div class="spacer"></div></div><div class="page-progress"><div style="width:${pagePct()}%"></div></div>${content}${bottomNav()}</div>`;
 attachSwipe();
}
function renderQuestion(){
 const item=q(); const selected=state.answers[item.id];
 if(currentPage===1){
   let img=item.image?`<div class="sign-wrap"><img src="${item.image}" alt="Traffic sign for question ${item.number}"/></div>`:'';
   let btnClass=v=>selected?(selected===v?'vf selected':'vf'):'vf';
   renderShell(`<main class="page question-page">${img}<div class="question-card">${esc(item.q)}</div><div class="answer-grid"><button class="${btnClass('VERO')}" onclick="choose('VERO')">VERO</button><button class="${btnClass('FALSO')}" onclick="choose('FALSO')">FALSO</button></div></main>`);
 } else if(currentPage===2){
   const ans=item.ans; const correct=state.answers[item.id]===ans;
   const cells=item.wb.map(([it,en])=>`<div class="word-cell"><b>${esc(it)}</b><span>${esc(en)}</span></div>`).join('');
   renderShell(`<main class="page"><div class="answer-banner ${ans==='VERO'?'true':'false'}">${ans}</div><div class="selection-note">Your answer: <strong class="${correct?'good':'bad'}">${state.answers[item.id]||'—'}${state.answers[item.id]?` · ${correct?'correct':'incorrect'}`:''}</strong></div><div class="section-title">WORD BY WORD</div><div class="word-grid">${cells}</div><div class="section-title">PROPER ENGLISH</div><div class="proper">${esc(item.proper)}</div><div class="section-title">THEORY RULE</div><div class="rule">${esc(item.rule)}</div></main>`);
 } else {
   const f=(item.focus||[]).map(([a,b])=>`<div class="focus-card"><div class="focus-it">${esc(a)}</div><div class="focus-en">${esc(b)}</div></div>`).join('');
   renderShell(`<main class="page"><div class="section-title">ITALIAN LINGUISTICS</div><div class="italian-intro">${item.ling}</div>${f}<div class="tip"><b>Exam habit:</b> read the small words carefully. Patente questions often become false because of one word such as <i>sempre</i>, <i>solo</i>, <i>mai</i>, <i>anche</i> or <i>esclusivamente</i>.</div></main>`);
 }
 saveState();
}
function choose(v){state.answers[q().id]=v;saveState();renderQuestion()}
function bottomNav(){
 const answered=!!state.answers[q().id]; const prevDisabled=(currentQ===0&&currentPage===1);
 const nextDisabled=(currentPage===1&&!answered);
 const star=!!state.difficult[q().id];
 const nextLabel=(currentQ===quiz.questions.length-1&&currentPage===3)?'Finish':(currentPage===3?'Next question':'Next page');
 return `<div class="bottomnav"><button class="navbtn" ${prevDisabled?'disabled':''} onclick="prev()">‹</button><button class="navbtn difficult ${star?'on':''}" onclick="toggleDifficult()">★</button><button class="navbtn next" ${nextDisabled?'disabled':''} onclick="next()">${nextLabel} ›</button></div>`;
}
function next(){
 if(currentPage===1&&!state.answers[q().id])return;
 if(currentPage<3){currentPage++;renderQuestion();return}
 if(currentQ<quiz.questions.length-1){currentQ++;currentPage=1;renderQuestion();return}
 renderSummary();
}
function prev(){if(currentPage>1){currentPage--;renderQuestion();return} if(currentQ>0){currentQ--;currentPage=3;renderQuestion()}}
function toggleDifficult(){state.difficult[q().id]=!state.difficult[q().id];saveState();renderQuestion()}
function goHome(){saveState();renderHome()}
function renderSummary(){
 const correct=correctCount(), answered=answeredCount(), difficult=Object.values(state.difficult||{}).filter(Boolean).length;
 document.getElementById('app').innerHTML=`<div class="screen safe-top"><div class="topbar"><button class="icon-btn" onclick="renderHome()">‹</button><div class="brand">Quiz 01 complete</div></div><main class="summary"><div class="muted">RESULT</div><div class="score">${correct}/30</div><div class="statrow"><div class="stat"><b>${answered}</b><span>answered</span></div><div class="stat"><b>${difficult}</b><span>marked difficult</span></div></div><button class="primary" onclick="reviewDifficult()">Review difficult questions</button><button class="secondary" onclick="renderHome()">Back to home</button></main></div>`;
}
function reviewDifficult(){const idx=quiz.questions.findIndex(x=>state.difficult[x.id]); if(idx<0){alert('No difficult questions marked yet.');return} currentQ=idx;currentPage=1;renderQuestion()}
function attachSwipe(){
 const el=document.getElementById('quizScreen'); if(!el)return;
 el.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].screenX},{passive:true});
 el.addEventListener('touchend',e=>{if(touchStartX===null)return; const dx=e.changedTouches[0].screenX-touchStartX; touchStartX=null; if(Math.abs(dx)<55)return; if(dx<0) next(); else prev();},{passive:true});
}
init();
