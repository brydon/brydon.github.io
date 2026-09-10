import * as THREE from './vendor/three.module.min.js';
import {createD20} from './cabin-shelf-props.mjs';
import {rollD20,dinerFrame,DINER_BEATS} from './d20-state.mjs';

export function createDiceGame(dialog,{onRoll,onResult,onDim,onStatic,random=Math.random}){
  const $=selector=>dialog.querySelector(selector),canvas=$('#dice-canvas'),stage=$('.dice-stage'),roll=$('#dice-roll'),status=$('#dice-status');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),model=createD20(),world=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.01,10);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  world.add(model,new THREE.HemisphereLight('#fff3da','#727e91',2.4));
  const key=new THREE.DirectionalLight('#ffe9c4',3);key.position.set(-2,4,5);world.add(key);
  const fill=new THREE.DirectionalLight('#d3c4ff',1.5);fill.position.set(3,1,-2);world.add(fill);
  let raf=0,last=0,motion=null,story=null,shown=false,lost=false,cancelSound=()=>{},lastGrain=-1;
  const target=new THREE.Quaternion(),noise=$('#diner-static'),grain=noise.getContext('2d'),pixels=grain.createImageData(160,90);
  noise.width=160;noise.height=90;
  function resize(){
    const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.set(0,0,.36/Math.min(1,camera.aspect));camera.lookAt(0,0,0);camera.updateProjectionMatrix();render();
  }
  function render(){if(shown&&!lost&&!story)renderer.render(world,camera);}
  const observer=new ResizeObserver(resize);
  function result(value){
    model.quaternion.copy(model.userData.faces.find(face=>face.value===value).orientation);model.position.set(0,0,0);
    status.textContent=value===20?'Natural 20.':'You rolled a '+value+'.';canvas.setAttribute('aria-label','Roll the twenty-sided die. Last roll: '+value);onResult?.(value);
  }
  function beginStory(){
    story={elapsed:0,static:false,announced:-1};lastGrain=-1;dialog.classList.add('diner-mode');dialog.setAttribute('aria-labelledby','diner-title');
    $('#dice-content').hidden=true;$('#diner-scene').hidden=false;$('#diner-return').focus({preventScroll:true});
    $('#diner-text').replaceChildren();$('#diner-announcement').textContent='';onDim?.(0);
  }
  function paintStory(){
    const frame=dinerFrame(story.elapsed,reduced.matches);onDim?.(Math.min(1,story.elapsed/900));
    const container=$('#diner-text');
    frame.segments.forEach((segment,i)=>{
      let span=container.children[i];
      if(!span){span=document.createElement(segment.conclusion?'strong':'span');if(segment.paragraph)span.className='diner-paragraph';container.append(span);}
      if(span.textContent!==segment.text)span.textContent=segment.text;
    });
    const completed=frame.segments.findLastIndex((segment,i)=>segment.text.length===DINER_BEATS[i].text.length);
    if(completed>story.announced){$('#diner-announcement').textContent=DINER_BEATS.slice(story.announced+1,completed+1).map(beat=>beat.text).join('');story.announced=completed;}
    noise.hidden=!frame.static;
    if(frame.static&&!story.static){story.static=true;cancelSound();cancelSound=onStatic?.()||(()=>{});}
    if(frame.static&&(!reduced.matches||lastGrain===-1)&&Math.floor(story.elapsed/100)!==lastGrain){
      lastGrain=Math.floor(story.elapsed/100);
      // Low-contrast grain, with no full-screen light/dark flashes.
      for(let i=0;i<pixels.data.length;i+=4){const value=55+Math.floor(Math.random()*65);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value;pixels.data[i+3]=255;}
      grain.putImageData(pixels,0,0);noise.classList.toggle('still-grain',reduced.matches);
    }
    if(frame.done)close();
  }
  function frame(now){
    raf=0;if(!shown||document.hidden||lost)return;
    const dt=last?Math.min(100,now-last):0;last=now;
    if(motion){
      motion.elapsed+=dt;const t=Math.min(1,motion.elapsed/1650),ease=1-Math.pow(1-t,3);
      const tumble=new THREE.Quaternion().setFromEuler(new THREE.Euler(t*15,t*11,t*8));
      model.quaternion.copy(motion.from).multiply(tumble).slerp(target,Math.pow(t,4));
      model.position.set(Math.sin(t*19)*.035*(1-ease),Math.abs(Math.sin(t*18))*.045*(1-ease),0);
      if(t===1&&!motion.settled){result(motion.value);motion.settled=true;}
      if(t===1&&(motion.value!==20||motion.elapsed>=2350)){const value=motion.value;motion=null;roll.disabled=false;if(value===20)beginStory();}
      render();
    }
    if(story){story.elapsed+=dt;paintStory();}
    if(shown&&(motion||story))raf=requestAnimationFrame(frame);
  }
  function resume(){last=0;if(shown&&!document.hidden&&!lost&&!raf&&(motion||story))raf=requestAnimationFrame(frame);}
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;cancelSound();cancelSound=()=>{};}
  function cleanup(){
    shown=false;stop();observer.disconnect();if(motion)result(motion.value);motion=null;story=null;roll.disabled=false;onDim?.(0);
    dialog.classList.remove('diner-mode');dialog.setAttribute('aria-labelledby','dice-title');$('#dice-content').hidden=false;$('#diner-scene').hidden=true;noise.hidden=true;
  }
  function close(){cleanup();if(dialog.open)dialog.close();}
  roll.addEventListener('click',()=>{
    if(motion||story||lost||!shown)return;
    const value=rollD20(random);target.copy(model.userData.faces.find(face=>face.value===value).orientation);
    cancelSound();cancelSound=onRoll?.()||(()=>{});roll.disabled=true;status.textContent='Rolling…';
    motion={value,elapsed:reduced.matches?1650:0,from:model.quaternion.clone()};resume();
  });
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  canvas.addEventListener('click',event=>{
    if(motion||story||lost)return;const box=canvas.getBoundingClientRect();
    pointer.set((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);
    world.updateMatrixWorld(true);raycaster.setFromCamera(pointer,camera);
    if(raycaster.intersectObject(model.children[0],false).length)roll.click();
  });
  canvas.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!event.repeat)roll.click();}});
  $('#dice-close').addEventListener('click',close);$('#diner-return').addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.addEventListener('close',cleanup);
  dialog.addEventListener('click',event=>{if(event.target!==dialog||story)return;const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)close();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else{render();resume();}});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;close();});
  canvas.addEventListener('webglcontextrestored',()=>{lost=false;});
  return {open(){shown=true;dialog.showModal();observer.observe(stage);resize();roll.focus({preventScroll:true});}};
}
