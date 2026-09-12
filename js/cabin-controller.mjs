import {isEvening} from './lighting.mjs';
import {createCabinAudio} from './cabin-audio.mjs';
import {prepareAudioSamples} from './audio-preload.mjs';
import {createSoundPreference,isSoundRestoreGesture} from './sound-preference.mjs';
import {CABIN_NOTES} from './cabin-notes.mjs';
import {projectedVolumeBounds} from './hit-area.mjs';
import {REWARD_CODE} from './cabin-reward.mjs';
import {RED_HERRING_FACT,RED_HERRING_ASIDE} from './poster-history.mjs';
const $=id=>document.getElementById(id);
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let scene,view='outside',computerRequested=false,audio,melting=false,engaged=false,replacementQueued=false;
let audioContext,audioReady;
const soundWorld={inside:false,boiling:false,burning:false,aurora:false,coffee:'idle',coffeeWater:'empty'};
function soundState(values){
  Object.assign(soundWorld,values);audio?.setWorld(values);
  if(values.coffee||values.coffeeWater){
    const description={idle:'The grinder and filter are empty.',grinding:'The hand grinder is turning.',ground:'Ground coffee fills the catch cup.',loading:'Ground coffee is falling into the filter.',ready:'18 grams of fresh grounds are in the filter.',filling:'Hot water is filling the gooseneck.',hot:'Steam rises from the filled gooseneck.',pouring:'Water is pouring into the V60.',bloom:'The wet grounds are blooming.',brewed:'300 grams of coffee brewed. Steam rises from the server.',carrying:'The coffee server is being carried to or from the desk.',serving:'Fresh coffee is pouring into the desk mug.',served:'The mug is full. Warm lettering has appeared on its glaze.',broken:'The coffee equipment is out of service.'}[values.coffee];
    for(const object of ['grinder','v60','gooseneck'])$('coffee-'+object).setAttribute('aria-description',description);
    const waterDescription={empty:'The gooseneck is empty. Either kettle can fill it once the hearth water has boiled.',filling:'Hot water is being transferred into the gooseneck.',hot:'The gooseneck is full of hot water.',spent:'The brew water has been poured.'}[soundWorld.coffeeWater];
    $('coffee-gooseneck').setAttribute('aria-description',waterDescription+' '+description);
    $('coffee-gooseneck').setAttribute('aria-label',soundWorld.coffeeWater==='empty'?'Fill the gooseneck with hot water':'Pour from the gooseneck');
    $('coffee-v60').setAttribute('aria-label',soundWorld.coffee==='brewed'?'Pour coffee into the desk mug':soundWorld.coffee==='hot'?'Begin the pour-over':'Use the V60 dripper');
    const serving=['carrying','serving'].includes(values.coffee);
    $('receipt').disabled=serving;
    $('receipt').setAttribute('aria-label',values.coffee==='served'?'Read the warm coffee mug':'Inspect the desk mug');
    $('receipt').setAttribute('aria-description',serving||values.coffee==='served'?description:'A ceramic coffee mug on the desk.');
  }
}
const storage={get(key){try{return localStorage.getItem('switchback:'+key);}catch{return null;}},set(key,value){try{localStorage.setItem('switchback:'+key,value);}catch{/* Preferences are optional. */}}};
const pages=new Set(['home','research','code','about','teaching','blog','contact','terminal']);
function engage(){if(engaged)return;engaged=true;document.body.classList.add('has-arrived');setTimeout(()=>$('cabin-intro').hidden=true,450);}
function enter(){if(melting)return;if(!scene){location.href='/home.html';return;}if(view!=='outside')return;engage();view='entering';document.body.classList.add('is-entering');$('enter-cabin').disabled=true;$('cabin-location').textContent='';scene.enter();}
function outside(){
  soundState({inside:false});
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
$('wall-poster').addEventListener('click',()=>{
  if(view==='inside'&&!melting&&scene?.posterTap()==='note')discover('A fish fact',`<p>${RED_HERRING_FACT}</p><p>${RED_HERRING_ASIDE}</p><p><small><a href="https://fishbase.se/glossary/Glossary.php?language=english&q=Red+herring&sc=is" target="_blank" rel="noopener noreferrer">FishBase</a></small></p>`);
});
$('wall-poster').addEventListener('keydown',event=>{if(event.repeat&&(event.key==='Enter'||event.key===' '))event.preventDefault();});
$('pet-dog').addEventListener('click',()=>{if(view==='inside'){scene?.pet();audio?.pet();}});
$('hearth-kettle').addEventListener('click',()=>{if(view==='inside'&&!melting)scene?.coffeeAction('kettle');});
for(const object of ['grinder','v60','gooseneck'])$('coffee-'+object).addEventListener('click',()=>{if(view==='inside'&&!melting)scene?.coffeeAction(object);});
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
function evening(on,persist=true){scene?.night(on);document.body.classList.toggle('afterglow',on&&storage.get('overlook')==='found');$('night-toggle').setAttribute('aria-pressed',String(on));$('night-toggle').textContent=on?'Evening':'Daylight';$('night-toggle').setAttribute('aria-label',on?'Switch to daylight':'Switch to evening');if(persist)storage.set('eveningOverride',String(on));}
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
const soundPreference=createSoundPreference({
  read:()=>storage.get('sound'),write:value=>storage.set('sound',value),
  prepare:prepareSound,resume:()=>audioContext.resume(),
  disable:()=>audio?audio.setEnabled(false):audioContext?.suspend(),
  hidden:()=>document.hidden,
  onChange:on=>{
    const button=$('sound-toggle');
    button.setAttribute('aria-pressed',String(on));button.textContent=on?'Sound on':'Sound off';
    button.setAttribute('aria-label',on?'Turn ambient sound off':'Turn ambient sound on');
  },
  onError:()=>{$('toast').textContent='Ambient sound isn’t available in this browser.';$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,4000);}
});
$('sound-toggle').addEventListener('click',()=>{soundPreference.toggle();});
// Restoring a preference never attempts autoplay. Unlock from a real gesture;
// the sound button handles its own gesture so an Off click cannot also restore.
for(const type of ['pointerdown','keydown'])document.addEventListener(type,event=>{
  if(isSoundRestoreGesture(event))soundPreference.gesture();
},{capture:true});
document.addEventListener('visibilitychange',()=>{scene?.clearKeys();audio?.visibility(!document.hidden).catch(()=>{});});
function discover(title,copy){scene?.clearKeys();$('discovery').classList.remove('chalkboard-discovery','bitmap-discovery','recipe-discovery','portrait-discovery','notebook-discovery');$('discovery-title').textContent=title;$('discovery-copy').innerHTML=copy;if(!$('discovery').open)$('discovery').showModal();}
for(const note of CABIN_NOTES)$(note.id).addEventListener('click',()=>{if(view==='inside'&&!melting){discover(note.title,note.copy);if(note.id==='coffee-recipe')$('discovery').classList.add('recipe-discovery');}});
$('chalkboard').addEventListener('click',()=>{
  if(view!=='inside'||!scene)return;
  discover('Working notes','');$('discovery').classList.add('chalkboard-discovery');
  const board=document.createElement('img');board.className='chalkboard-study';board.src=scene.chalkboardImage();board.width=1536;board.height=1220;
  board.alt='Chalk diagrams of Delaney chambers and a hexagonal tiling, the circulant C12(1,3,4), a sparse companion matrix with its matching intercyclic digraph, and a schematic supercritical Hopf bifurcation for the chemostat.';
  $('discovery-copy').append(board);
});
$('wedding-ring').addEventListener('click',()=>{
  if(view==='inside'&&!melting)discover('A most precious item','<p>You have the overwhelming sense that this is a most precious item. That you should keep it secret, and keep it safe.</p>');
});
$('couple-portrait').addEventListener('click',()=>{
  if(view!=='inside'||melting||!scene)return;
  discover('A Lovely Coufle','');$('discovery').classList.add('portrait-discovery');
  const portrait=document.createElement('img');portrait.className='couple-portrait';
  portrait.src='/images/switchback/brydon-and-wife.png';portrait.width=1448;portrait.height=1086;
  portrait.alt='Pixel-art selfie of Brydon and his wife at sunset in front of the Toronto skyline and the CN Tower.';
  $('discovery-copy').append(portrait);
});
$('desk-notebook').addEventListener('click',()=>{
  if(view!=='inside'||melting||!scene)return;
  discover('Drawing hands','');$('discovery').classList.add('notebook-discovery');
  const sketch=document.createElement('img');sketch.className='notebook-study';
  sketch.src='/images/switchback/robot-drawing-hands.png';
  sketch.alt='A graphite sketch of two robot hands drawing one another, with articulated fingers and unfinished pencil lines fading into the paper.';
  $('discovery-copy').append(sketch);
});
let cubeGame,cubeLoading=false;
$('bookshelf-cube').addEventListener('click',async()=>{
  if(view!=='inside'||melting||!scene||cubeLoading)return;
  scene.clearKeys();cubeLoading=true;
  try{
    if(!cubeGame){const {createCubeGame}=await import('./cube-game.mjs');cubeGame=createCubeGame($('cube-game'),{initialState:scene.cubeState(),onChange:state=>scene.setCubeState(state)});}
    if(view==='inside'&&!melting&&!document.querySelector('dialog[open]')){scene.clearKeys();cubeGame.open();}
  }catch(error){
    console.error('Cube failed to load:',error);$('toast').textContent='The cube couldn’t load. Please try again.';$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,4000);
  }finally{cubeLoading=false;}
});
let diceGame,diceLoading=false;
$('bookshelf-die').addEventListener('click',async()=>{
  if(view!=='inside'||melting||!scene||diceLoading)return;
  scene.clearKeys();diceLoading=true;
  try{
    if(!diceGame){
      const {createDiceGame}=await import('./dice-game.mjs');
      diceGame=createDiceGame($('dice-game'),{onRoll:()=>audio?.dice(),onResult:value=>scene.setDieResult(value),onDim:amount=>scene.dramaticDim(amount),onStatic:()=>audio?.static()});
    }
    if(view==='inside'&&!melting&&!document.querySelector('dialog[open]'))diceGame.open();
  }catch(error){console.error('Die failed to load:',error);$('toast').textContent='The die couldn’t load. Please try again.';$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,4000);}
  finally{diceLoading=false;}
});
$('shelf-cradle').addEventListener('click',()=>{if(view==='inside'&&!melting)scene?.releaseCradle();});
function readMug(){discover('The warm mug','<p>Letters have appeared in the glaze:</p><p><code>take the</code></p>');}
$('receipt').addEventListener('click',()=>{
  if(view!=='inside'||melting||!scene)return;
  if(scene.coffeeClueRevealed())readMug();
  else if(!scene.coffeeAction('mug'))discover('The desk mug','<p>An empty mug. The glaze feels cool.</p>');
});
function visit(place,title,copy){if(!scene||view!=='outside'||melting)return;engage();view='walking';scene.visit(place,()=>{view='outside';discover(title,copy);});}
$('bridge-note').addEventListener('click',()=>visit('bike','The luggage tag','<p>Pressed into the leather:</p><p><code>long way</code></p>'));
$('camp-note').addEventListener('click',()=>visit('fire','A carving in the stone','<p><code>home</code></p>'));
$('reward-sign').addEventListener('click',()=>{
  if(!scene?.rewardVisible())return;
  visit('sign','The long way home',`<p><code style="overflow-wrap:anywhere">${REWARD_CODE}</code></p><p><a href="/contact.html" target="_blank" rel="noopener noreferrer">Contact me</a> with this code and thanks for taking the time to look around!</p>`);
});
$('feynman-book').addEventListener('click',()=>{
  if(view==='inside'&&!melting&&scene){scene.clearKeys();scene.releaseBookNote();}
});
$('service-note').addEventListener('click',()=>{
  if(view!=='inside'||melting||!scene?.canReadFallenNote())return;
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
    scene=await createCabinScene($('cabin-canvas'),{reducedMotion,onEnter:entered,onExit:outside,onComputer:computerChanged,onError:sceneError,onCradle:strength=>audio?.cradle(strength),onKettle:boiling=>soundState({boiling}),onCoffee:(coffee,coffeeWater)=>{soundState({coffee,coffeeWater});if(coffee==='served'&&view==='inside'&&!melting)readMug();}});
    $('scene-loading').hidden=true;if(storage.get('overlook')==='found')scene.unlock();if(storage.get('administrator')==='found')scene.administrator();const preference=storage.get('eveningOverride');evening(preference===null?isEvening():preference==='true',false);
    function area(id,vertices,enabled,volume=false){
      const button=$(id);button.hidden=!enabled;if(!enabled)return;
      const corners=vertices.map(p=>scene.project(...p));if(corners.some(p=>!p.visible)){button.hidden=true;return;}
      if(volume){
        const bounds=projectedVolumeBounds(corners);if(!bounds){button.hidden=true;return;}
        Object.assign(button.style,{left:bounds.left+'px',top:bounds.top+'px',width:bounds.width+'px',height:bounds.height+'px',clipPath:'none'});return;
      }
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
      area('reward-sign',scene.rewardArea(),outside&&scene.rewardVisible());
      area('blue-jay',[[5.14,2.30,2.41],[5.75,2.30,2.41],[5.75,1.60,2.41],[5.14,1.60,2.41]],outside);
      const poster=scene.posterArea();
      area('wall-poster',poster?.vertices??[],inside&&!melting&&!!poster);
      $('wall-poster').disabled=!!poster?.disabled;
      if(poster)$('wall-poster').setAttribute('aria-label',poster.kind==='note'?'Read the sticky note':'Touch the '+poster.name+' poster');
      area('pet-dog',[[-.2,1.25,.69],[1.5,1.25,.69],[1.5,.53,.69],[-.2,.53,.69]],inside);
      area('hearth-kettle',scene.kettleArea(),inside&&(soundWorld.boiling||scene.kettleOffHeat())&&!melting,true);
      $('hearth-kettle').setAttribute('aria-label','Fill the gooseneck from the hearth kettle');
      for(const [object,vertices]of Object.entries(scene.coffeeAreas()))area('coffee-'+object,vertices,inside&&!melting);
      area('feynman-book',scene.feynmanBookArea(),inside&&!melting,true);
      area('service-note',scene.fallenNoteArea(),inside&&!melting,true);
      area('chalkboard',[[-1.56,2.645,-1.70],[-.34,2.645,-1.70],[-.34,1.675,-1.70],[-1.56,1.675,-1.70]],inside);
      area('couple-portrait',scene.portraitArea(),inside&&!melting);
      area('desk-notebook',inside&&!melting?scene.notebookArea():[],inside&&!melting,true);
      area('bookshelf-cube',scene.cubeArea(),inside&&!melting,true);
      area('wedding-ring',scene.ringArea(),inside&&!melting,true);
      area('bookshelf-die',scene.dieArea(),inside&&!melting,true);
      area('shelf-cradle',scene.cradleArea(),inside&&!melting,true);
      area('receipt',[[-.25,1.46,-.91],[.13,1.46,-.91],[.13,1.18,-.91],[-.25,1.18,-.91]],inside&&!melting);
      for(const note of CABIN_NOTES)area(note.id,note.vertices,inside&&!melting);
      requestAnimationFrame(updateHotspots);
    }
    updateHotspots();
    const warmSound=()=>{Promise.resolve().then(prepareSound).catch(()=>{});};
    if('requestIdleCallback' in window)window.requestIdleCallback(warmSound,{timeout:2000});else setTimeout(warmSound,250);
    const page=new URLSearchParams(location.hash.slice(1)).get('place');if(pages.has(page))computer(page);
  }catch(error){console.error('Cabin failed to load:',error);sceneError();}
}
init();
