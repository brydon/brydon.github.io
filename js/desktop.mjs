import {command} from './puzzles.mjs';
const $=id=>document.getElementById(id);
function send(type,value){if(parent!==window)parent.postMessage({source:'switchback-desktop',type,value},location.origin);}
function show(page){
  if(!document.querySelector(`[data-content="${page}"]`))return;
  for(const section of document.querySelectorAll('[data-content]'))section.hidden=section.dataset.content!==page;
  for(const button of document.querySelectorAll('.desktop-nav [data-page]')){
    if(button.dataset.page===page)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  }
  $('desktop-main').scrollTop=0;$('desktop-page-link').href=`/${page==='terminal'?'code':page}.html`;
  if(page==='terminal')$('desktop-terminal-input').focus();
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-page]');if(button)show(button.dataset.page);});
document.addEventListener('click',event=>{const control=event.target.closest('button,a');if(control&&!control.disabled)send('key',control.closest('#desktop-terminal-form')?'enter':'tap');});
document.addEventListener('input',event=>{if(event.target.matches('input,textarea')&&!event.isComposing)send('key','tap');});
$('back-to-room').addEventListener('click',()=>send('room'));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();send('room');}
  else if(!event.metaKey&&!event.ctrlKey&&!event.altKey&&!event.isComposing&&['Enter','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))send('key',event.key==='Enter'?'enter':'tap');
});
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==parent||event.data?.source!=='switchback-cabin')return;
  if(event.data.type==='page'&&typeof event.data.value==='string'&&/^[a-z]+$/.test(event.data.value))show(event.data.value);
});
let busy=false;
$('desktop-terminal-form').addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;busy=true;const input=$('desktop-terminal-input'),value=input.value;input.value='';
  const output=$('desktop-terminal-output');output.textContent+=`\n$ ${value}\n`;
  try{
    const result=await command(value);
    if(result.clear){output.textContent='';$('desktop-bitmap').hidden=true;}
    else if(result.exit)send('room');else output.textContent+=(result.text||'')+'\n';
    if(result.image)$('desktop-bitmap').hidden=false;
    if(result.unlocked)send('discovery');
    if(result.effect)send('effect',result.effect);
    if(result.effect==='meltdown'){
      document.body.classList.add('meltdown');input.disabled=true;
    }
  }
  catch{output.textContent+='This command needs HTTPS or localhost.\n';}
  finally{busy=false;output.textContent=output.textContent.slice(-16000);$('desktop-main').scrollTop=999999;}
});
send('ready');
