import {isEvening} from './lighting.mjs';
import {createCabinAudio} from './cabin-audio.mjs';
import {prepareAudioSamples} from './audio-preload.mjs';
const $=id=>document.getElementById(id);
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let scene,view='outside',computerRequested=false,audio,melting=false,engaged=false,replacementQueued=false;
let audioContext,audioReady;
const soundWorld={inside:false,boiling:false,burning:false,aurora:false};
function soundState(values){Object.assign(soundWorld,values);audio?.setWorld(values);}
const storage={get(key){try{return localStorage.getItem('switchback:'+key);}catch{return null;}},set(key,value){try{localStorage.setItem('switchback:'+key,value);}catch{/* Preferences are optional. */}}};
const pages=new Set(['home','research','code','about','teaching','blog','contact','terminal']);
function engage(){if(engaged)return;engaged=true;document.body.classList.add('has-arrived');setTimeout(()=>$('cabin-intro').hidden=true,450);}
function enter(){if(melting)return;if(!scene){location.href='/home.html';return;}if(view!=='outside')return;engage();view='entering';document.body.classList.add('is-entering');$('enter-cabin').disabled=true;$('cabin-location').textContent='';scene.enter();}
function outside(){
  soundState({inside:false,boiling:false});
  const revealed=view==='revealing';view='outside';computerRequested=false;document.body.classList.remove('is-entering','is-inside','at-computer','is-revealing');
  $('cabin-intro').hidden=engaged||melting;$('enter-cabin').disabled=false;$('cabin-camera').hidden=false;$('leave-cabin').hidden=true;$('computer-back').hidden=true;
  $('cabin-location').textContent=melting?'DOG SAFE. CABIN WARRANTY VOID.':revealed?'THE LONG WAY HOME':'A LITTLE PLACE IN THE MOUNTAINS';
  if(melting){
    $('rebuild-cabin').hidden=false;
    if(!replacementQueued){replacementQueued=true;scene.evacuate(()=>setTimeout(()=>{
      window.open($('replacement-search').href,'_blank','noopener,noreferrer');$('replacement-search').hidden=false;
    },3000));}
  }
  else if(!engaged)$('enter-cabin').focus({preventScroll:true});
  if(revealed){$('toast').textContent='You took the long way. Welcome to the midnight valley.';$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,8000);}
}
function entered(){soundState({inside:true});view=computerRequested?'focusing':'inside';document.body.classList.add('is-inside');$('cabin-intro').hidden=true;$('cabin-camera').hidden=computerRequested;$('leave-cabin').hidden=false;$('leave-cabin').disabled=false;$('cabin-location').textContent='AFTER HOURS';}
function leave(){if(view==='computer'||view==='focusing'){room();return;}if(view!=='inside'||!scene)return;view='exiting';$('leave-cabin').disabled=true;document.body.classList.remove('is-inside');scene.exit();}
function computer(page){
  if(melting||view==='revealing'||(page!==undefined&&!pages.has(page)))return;
  if(!scene){location.href=`/${page==='terminal'?'code':page||'home'}.html`;return;}
  engage();
  computerRequested=true;
  if(view==='outside'){view='entering';document.body.classList.add('is-entering');$('enter-cabin').disabled=true;}
  else if(view!=='computer')view='focusing';
  $('cabin-camera').hidden=true;scene.computer(page);
}
function computerChanged(focused){
  if(view==='revealing'||melting)return;
  view=focused?'computer':'inside';computerRequested=focused;
  document.body.classList.toggle('at-computer',focused);$('cabin-camera').hidden=focused;$('computer-back').hidden=!focused;$('leave-cabin').hidden=focused;
  $('cabin-location').textContent=focused?'SWITCHBACK OS / ONLINE':'AFTER HOURS';
  if(!focused)$('desk-terminal').focus({preventScroll:true});
}
function room(){if(!scene)return;scene.room();computerRequested=false;view='unfocusing';}
$('enter-cabin').addEventListener('click',enter);$('leave-cabin').addEventListener('click',leave);$('computer-back').addEventListener('click',room);
$('rebuild-cabin').addEventListener('click',()=>location.assign('/'));
$('cabin-door').addEventListener('click',()=>view==='inside'?leave():enter());
$('pet-dog').addEventListener('click',()=>{if(view==='inside'){scene?.pet();audio?.pet();}});
$('hearth-kettle').addEventListener('click',()=>{if(view==='inside'&&!melting)scene?.takeKettleOff();});
$('desk-terminal').addEventListener('click',()=>computer());
$('blue-jay').addEventListener('click',engage);
for(const event of ['pointerenter','focus'])$('blue-jay').addEventListener(event,()=>{if(view==='outside'&&!melting)audio?.chirp();});
for(const[button,direction,axis]of[['look-left',-1,'x'],['look-right',1,'x'],['look-up',1,'y'],['look-down',-1,'y']])$(button).addEventListener('click',()=>scene?.turn(direction,axis));
$('menu-toggle').addEventListener('click',()=>{const show=$('mobile-menu').hidden;$('mobile-menu').hidden=!show;$('menu-toggle').setAttribute('aria-expanded',String(show));});
document.addEventListener('click',event=>{const link=event.target.closest('[data-place]');if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;event.preventDefault();$('mobile-menu').hidden=true;$('menu-toggle').setAttribute('aria-expanded','false');computer(link.dataset.place);});
const movement=new Set(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright']);
document.addEventListener('keydown',event=>{
  if(event.target.closest('input,textarea,select,[contenteditable=true]')||document.querySelector('dialog[open]')||event.metaKey||event.ctrlKey||event.altKey)return;
  const key=event.key.toLowerCase();
  if(movement.has(key)){event.preventDefault();scene?.key(key,true);}
  else if(!event.repeat&&key==='e'){event.preventDefault();if(view==='outside')enter();else if(view==='inside')computer();else if(view==='computer')room();}
  else if(!event.repeat&&key==='escape'){if(!$('mobile-menu').hidden){$('mobile-menu').hidden=true;$('menu-toggle').setAttribute('aria-expanded','false');}else if(view==='computer')room();else leave();}
});
document.addEventListener('keyup',event=>scene?.key(event.key.toLowerCase(),false));window.addEventListener('blur',()=>scene?.clearKeys());
function evening(on,persist=true){scene?.night(on);document.body.classList.toggle('afterglow',on&&storage.get('overlook')==='found');$('night-toggle').setAttribute('aria-pressed',String(on));$('night-toggle').textContent=on?'Daylight':'Evening';$('night-toggle').setAttribute('aria-label',on?'Switch to daylight':'Switch to evening');if(persist)storage.set('eveningOverride',String(on));}
$('night-toggle').addEventListener('click',()=>evening($('night-toggle').getAttribute('aria-pressed')!=='true'));
function prepareSound(){
  if(!audioReady){
    const context=new(window.AudioContext||window.webkitAudioContext)();audioContext=context;
    // Idle preparation remains silent, including in browsers allowing autoplay.
    audioReady=Promise.all([prepareAudioSamples(context.sampleRate),context.suspend()]).then(([samples])=>{
      audio=createCabinAudio(context,samples);audio.setWorld(soundWorld);return audio;
    }).catch(error=>{audio=null;audioReady=null;audioContext=null;context.close().catch(()=>{});throw error;});
  }
  return audioReady;
}
async function toggleSound(){
  const button=$('sound-toggle');if(button.disabled)return;button.disabled=true;
  const on=button.getAttribute('aria-pressed')!=='true';
  try{
    if(on&&!audio)button.textContent='Starting sound…';
    const ready=prepareSound();
    // Resume in the actual click handler so an early click keeps its user gesture.
    const resumed=on?audioContext.resume():Promise.resolve();
    const [prepared]=await Promise.all([ready,resumed]);await prepared.setEnabled(on);
    if(document.hidden)await prepared.visibility(false);
    button.setAttribute('aria-pressed',String(on));button.textContent=on?'Sound on':'Sound off';button.setAttribute('aria-label',on?'Turn ambient sound off':'Turn ambient sound on');
  }catch{$('toast').textContent='Ambient sound isn’t available in this browser.';$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,4000);}
  finally{button.disabled=false;button.textContent=button.getAttribute('aria-pressed')==='true'?'Sound on':'Sound off';}
}
$('sound-toggle').addEventListener('click',toggleSound);
document.addEventListener('visibilitychange',()=>{scene?.clearKeys();audio?.visibility(!document.hidden).catch(()=>{});});
function discover(title,copy){scene?.clearKeys();$('discovery').classList.remove('chalkboard-discovery','bitmap-discovery');$('discovery-title').textContent=title;$('discovery-copy').innerHTML=copy;if(!$('discovery').open)$('discovery').showModal();}
$('chalkboard').addEventListener('click',()=>{
  if(view!=='inside'||!scene)return;
  discover('Working notes','');$('discovery').classList.add('chalkboard-discovery');
  const board=document.createElement('img');board.className='chalkboard-study';board.src=scene.chalkboardImage();board.width=1536;board.height=1220;
  board.alt='Chalk diagrams of Delaney chambers and a hexagonal tiling, the circulant C12(1,3,4), a sparse companion matrix with its matching intercyclic digraph, and a schematic supercritical Hopf bifurcation for the chemostat.';
  $('discovery-copy').append(board);
});
$('receipt').addEventListener('click',()=>discover('Under the coffee mug','<p>On a coffee-stained scrap of paper:</p><p><code>take the</code></p>'));
function visit(place,title,copy){if(!scene||view!=='outside'||melting)return;engage();view='walking';scene.visit(place,()=>{view='outside';discover(title,copy);});}
$('bridge-note').addEventListener('click',()=>visit('bike','The luggage tag','<p>Pressed into the leather:</p><p><code>long way</code></p>'));
$('camp-note').addEventListener('click',()=>visit('fire','A carving in the stone','<p><code>home</code></p>'));
$('service-note').addEventListener('click',()=>{
  discover('A scrap of paper','<a href="/images/switchback/service-064.png" target="_blank" rel="noopener noreferrer"><img class="service-scan" src="/images/switchback/service-064.png" width="384" height="176" alt="A scrap of paper with printed characters"></a>');
  $('discovery').classList.add('bitmap-discovery');
});
document.querySelector('[data-close="discovery"]').addEventListener('click',()=>$('discovery').close());
$('discovery').addEventListener('click',event=>{const dialog=$('discovery');if(event.target!==dialog)return;const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();});
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==$('computer-frame')?.contentWindow||event.data?.source!=='switchback-desktop')return;
  if(event.data.type==='room')room();
  if(event.data.type==='key'&&view==='computer'&&!melting&&(event.data.value==='tap'||event.data.value==='enter'))audio?.key(event.data.value==='enter');
  if(event.data.type==='discovery'&&scene&&!melting){
    soundState({aurora:true});
    storage.set('overlook','found');scene.unlock();evening(true,false);view='revealing';computerRequested=false;document.body.classList.add('is-revealing');$('computer-back').hidden=true;$('leave-cabin').hidden=true;$('cabin-camera').hidden=true;$('cabin-location').textContent='THE VALLEY HAS ONE MORE THING TO SHOW YOU';scene.reveal();
  }
  if(event.data.type==='effect'&&scene&&!melting){
    if(event.data.value==='pet'){scene.pet();audio?.pet();}
    if(event.data.value==='administrator'){storage.set('administrator','found');scene.administrator();room();}
    if(event.data.value==='meltdown'){
      melting=true;view='burning';scene.clearKeys();$('computer-back').hidden=true;$('leave-cabin').hidden=true;$('cabin-camera').hidden=true;$('cabin-location').textContent='DOG EVACUATED. CABIN WARRANTY VOID.';
      setTimeout(()=>{soundState({burning:true,boiling:false});scene?.explode();audio?.explode();},650);
    }
  }
});
function sceneError(){$('scene-loading').hidden=true;$('scene-fallback').hidden=false;$('cabin-camera').hidden=true;$('enter-cabin').disabled=false;scene=null;}
async function init(){
  try{
    const {createCabinScene}=await import('./cabin-scene.mjs');
    scene=await createCabinScene($('cabin-canvas'),{reducedMotion,onEnter:entered,onExit:outside,onComputer:computerChanged,onError:sceneError,onKettle:boiling=>soundState({boiling})});
    $('scene-loading').hidden=true;if(storage.get('overlook')==='found')scene.unlock();if(storage.get('administrator')==='found')scene.administrator();const preference=storage.get('eveningOverride');evening(preference===null?isEvening():preference==='true',false);
    function area(id,vertices,enabled){
      const button=$(id);button.hidden=!enabled;if(!enabled)return;
      const corners=vertices.map(p=>scene.project(...p));if(corners.some(p=>!p.visible)){button.hidden=true;return;}
      const left=Math.min(...corners.map(p=>p.x)),top=Math.min(...corners.map(p=>p.y)),width=Math.max(...corners.map(p=>p.x))-left,height=Math.max(...corners.map(p=>p.y))-top;
      Object.assign(button.style,{left:left+'px',top:top+'px',width:width+'px',height:height+'px',clipPath:'polygon('+corners.map(p=>`${(p.x-left)/width*100}% ${(p.y-top)/height*100}%`).join(',')+')'});
    }
    function updateHotspots(){
      if(!scene)return;
      audio?.update();
      const inside=view==='inside',outside=view==='outside'&&!melting;
      area('desk-terminal',[[-.02,2.0025,-1.291],[1.14,2.0025,-1.291],[1.14,1.2775,-1.291],[-.02,1.2775,-1.291]],inside);
      area('cabin-door',[[-.15,2.62,2.18],[1.15,2.62,2.18],[1.15,.43,2.18],[-.15,.43,2.18]],inside||outside);
      area('bridge-note',[[3.91,1.47,-.6],[3.91,1.47,2.2],[3.91,.08,2.2],[3.91,.08,-.6]],outside);
      area('camp-note',[[-4.3,1.2,3.7],[-2.8,1.2,3.7],[-2.8,.1,3.7],[-4.3,.1,3.7]],outside);
      area('blue-jay',[[5.14,2.30,2.41],[5.75,2.30,2.41],[5.75,1.60,2.41],[5.14,1.60,2.41]],outside);
      area('pet-dog',[[-.2,1.25,.69],[1.5,1.25,.69],[1.5,.53,.69],[-.2,.53,.69]],inside);
      area('hearth-kettle',[[-1.60,1.43,1.31],[-1.60,1.43,.64],[-1.60,.92,.64],[-1.60,.92,1.31]],inside&&soundWorld.boiling&&!melting);
      area('service-note',[[-1.67,1.36,-1.78],[-1,1.36,-1.78],[-1,1.02,-1.78],[-1.67,1.02,-1.78]],inside);
      area('chalkboard',[[-1.56,2.645,-1.70],[-.34,2.645,-1.70],[-.34,1.675,-1.70],[-1.56,1.675,-1.70]],inside);
      area('receipt',[[-.15,1.46,-.96],[.14,1.46,-.96],[.14,1.2,-.96],[-.15,1.2,-.96]],inside);
      requestAnimationFrame(updateHotspots);
    }
    updateHotspots();
    const warmSound=()=>{Promise.resolve().then(prepareSound).catch(()=>{});};
    if('requestIdleCallback' in window)window.requestIdleCallback(warmSound,{timeout:2000});else setTimeout(warmSound,250);
    const page=new URLSearchParams(location.hash.slice(1)).get('place');if(pages.has(page))computer(page);
  }catch(error){console.error('Cabin failed to load:',error);sceneError();}
}
init();
