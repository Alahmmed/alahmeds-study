/* Completion is a learner choice, stored only in this browser. No network calls. */
(() => {
'use strict';
const KEY='alahmeds-study-completion-v1';
const moduleNumber=value=>{const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=28?n:null;};
let completed=Object.create(null),storageAvailable=true,currentModule=null,isLast=false,finishPanel=null;
function load(){
 let raw;try{raw=localStorage.getItem(KEY);storageAvailable=true;}catch(error){storageAvailable=false;return;}
 let saved;try{saved=JSON.parse(raw);}catch(error){saved=null;}
 const next=Object.create(null);if(saved&&saved.version===1&&saved.completed&&typeof saved.completed==='object'){for(const [key,value] of Object.entries(saved.completed)){const n=moduleNumber(key);if(n!==null&&value===true)next[n]=true;}}completed=next;
}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({version:1,completed}));storageAvailable=true;}catch(error){storageAvailable=false;}}
function isComplete(value){const n=moduleNumber(value);return n!==null&&completed[n]===true;}
function renderCatalog(){
 const cards=[...document.querySelectorAll('[data-module][data-study-ready="true"]')];
 for(const card of cards){const n=moduleNumber(card.dataset.module),done=isComplete(n);card.classList.toggle('is-completed',done);const badge=card.querySelector('[data-study-completion]'),undo=card.querySelector('[data-study-reset]'),open=card.querySelector('[data-study-open]');if(badge)badge.hidden=!done;if(undo)undo.hidden=!done;if(open)open.textContent=(done?'Review':'Open')+' Midterm '+n+' →';}
 for(const node of document.querySelectorAll('[data-study-completed-count]'))node.textContent=String(cards.filter(card=>isComplete(card.dataset.module)).length);
 for(const node of document.querySelectorAll('[data-study-available-count]'))node.textContent=String(cards.length);
 for(const node of document.querySelectorAll('[data-study-storage-note]'))node.textContent=storageAvailable?'Progress is saved in this browser.':'Browser storage is unavailable. Completion lasts for this visit only.';
}
function ensureFinishPanel(){
 if(currentModule===null||finishPanel)return;
 finishPanel=document.createElement('section');finishPanel.id='study-finish';finishPanel.className='study-finish';finishPanel.hidden=true;finishPanel.setAttribute('aria-labelledby','study-finish-title');
 finishPanel.innerHTML='<h2 id="study-finish-title"></h2><p id="study-finish-description"></p><div class="study-finish-actions"><button type="button" id="study-mark-complete" class="study-complete-button">Mark complete</button><a class="study-finish-link" id="study-all-modules" href="macroeconomics.html">All modules</a><a class="study-finish-link study-next-module" id="study-next-module" hidden></a><button type="button" id="study-undo-complete" class="study-undo" hidden>Undo completion</button></div><p id="study-finish-status" class="study-finish-status" role="status" aria-live="polite"></p>';
 const slot=document.getElementById('study-completion-slot'),main=document.getElementById('main')||document.querySelector('main');if(slot)slot.append(finishPanel);else if(main)main.insertAdjacentElement('afterend',finishPanel);else document.body.append(finishPanel);
 finishPanel.querySelector('#study-mark-complete').addEventListener('click',()=>{markComplete(currentModule);const next=finishPanel.querySelector('#study-next-module');(next.hidden?finishPanel.querySelector('#study-all-modules'):next).focus();});
 finishPanel.querySelector('#study-undo-complete').addEventListener('click',()=>{markIncomplete(currentModule);finishPanel.querySelector('#study-mark-complete').focus();});
}
function renderFinish(){
 if(currentModule===null)return;ensureFinishPanel();finishPanel.hidden=!isLast;if(!isLast)return;
 const done=isComplete(currentModule),next=moduleNumber(document.body.dataset.studyNext),nextLink=finishPanel.querySelector('#study-next-module');
 finishPanel.querySelector('#study-finish-title').textContent=done?'✓ Midterm '+currentModule+' completed':'You reached the end of Midterm '+currentModule+'.';
 finishPanel.querySelector('#study-finish-description').textContent=done?(next!==null&&next!==currentModule?'You can return to all modules, continue to the next available lesson, or review this lesson again.':'You can return to all modules or review this lesson again.'):'Mark this module complete when you are ready. You can review it again any time.';
 finishPanel.querySelector('#study-mark-complete').hidden=done;finishPanel.querySelector('#study-undo-complete').hidden=!done;
 nextLink.hidden=!(done&&next!==null&&next!==currentModule);if(!nextLink.hidden){nextLink.href='midterm-'+next+'.html';nextLink.textContent='Next: Midterm '+next+' →';}
 finishPanel.querySelector('#study-finish-status').textContent=done?(storageAvailable?'Completion saved in this browser.':'Marked complete for this visit. Browser storage is unavailable.'):(storageAvailable?'Completion is your choice. It is saved only in this browser.':'Browser storage is unavailable. Completion will last for this visit only.');
}
function refresh(){renderCatalog();renderFinish();}
function markComplete(value){const n=moduleNumber(value);if(n===null)return false;completed[n]=true;persist();refresh();return true;}
function markIncomplete(value){const n=moduleNumber(value);if(n===null)return false;delete completed[n];persist();refresh();return true;}
function setStep(detail){if(!detail||typeof detail.isLast!=='boolean')return;const n=moduleNumber(detail.module);if(n===null||n!==moduleNumber(document.body.dataset.studyModule))return;currentModule=n;isLast=detail.isLast;renderFinish();}
function initialize(){
 load();currentModule=moduleNumber(document.body.dataset.studyModule);
 const marker=document.getElementById('lesson')||document.querySelector('[data-last-step]');isLast=!!marker&&marker.dataset.lastStep==='true';
 document.addEventListener('study:step',event=>setStep(event.detail));
 document.addEventListener('click',event=>{const button=event.target.closest?.('[data-study-reset]');if(!button)return;const n=moduleNumber(button.dataset.studyReset);if(n===null)return;markIncomplete(n);button.closest('[data-module]')?.querySelector('[data-study-open]')?.focus();});
 refresh();
}
window.StudyProgress=Object.freeze({setStep,isComplete,markComplete,markIncomplete,refresh});
window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){load();refresh();}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
