import * as THREE from './vendor/three.module.min.js';
import {CUBE_FACES,FACE_KEYS,createCubeSession,faceGrid,moveLabel} from './cube-state.mjs';
import {createCubeModel} from './cube-model.mjs';
import {createCubeTurn} from './cube-turn.mjs';

export function createCubeGame(dialog,{initialState,onChange}){
  const $=selector=>dialog.querySelector(selector),canvas=$('canvas'),stage=$('.cube-stage');
  const session=createCubeSession(initialState),model=createCubeModel(session.state,{labels:true});
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});}
  catch(error){model.dispose();throw error;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  const world=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,50);
  world.add(model.group,new THREE.HemisphereLight('#fff9e8','#728b80',3));
  const key=new THREE.DirectionalLight('#fff2d7',3);key.position.set(4,7,5);world.add(key);
  const fill=new THREE.DirectionalLight('#c7e6ff',1.8);fill.position.set(-4,1,-4);world.add(fill);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let yaw=.63,pitch=.47,animation=null,raf=0,lastFrame=0,drag=null,shown=false,contextLost=false,clockText='',needsRender=true;
  const faceButtons=[],grids=new Map(),colorNames={U:'white',R:'red',F:'green',D:'yellow',L:'orange',B:'blue'};
  for(const face of FACE_KEYS){
    const {name,color}=CUBE_FACES[face],row=document.createElement('div');row.className='cube-face';
    const label=document.createElement('span');label.className='cube-face-label';label.style.setProperty('--face',color);
    label.textContent=face+' · '+name;row.append(label);
    for(const amount of [-1,1]){
      const button=document.createElement('button');button.type='button';button.textContent=amount===1?'↻':'↺';
      button.setAttribute('aria-label',`Turn ${name.toLowerCase()} ${amount===1?'clockwise':'counterclockwise'} (${face}${amount===-1?' prime':''})`);
      button.addEventListener('click',()=>turn(face,amount));row.append(button);faceButtons.push(button);
    }
    $('.cube-faces').append(row);
    const side=document.createElement('div'),heading=document.createElement('span'),grid=document.createElement('div');
    heading.textContent=face+' · '+name;grid.className='cube-map-face';grid.setAttribute('role','img');
    for(let i=0;i<9;i++){const tile=document.createElement('span');tile.setAttribute('aria-hidden','true');grid.append(tile);}
    side.append(heading,grid);$('.cube-map').append(side);grids.set(face,grid);
  }
  function update(){
    const solved=session.solved&&session.started&&!animation;
    dialog.classList.toggle('cube-solved',solved);
    $('#cube-status').textContent=animation?'Turning…':solved?'Solved. Nicely done.':session.solved?'A clean slate. Try a few turns.':'Six colours. A little patience.';
    $('#cube-moves').textContent=session.history.length+' '+(session.history.length===1?'turn':'turns');
    $('#cube-history').textContent=session.history.length?'Last turns: '+session.history.slice(-9).map(moveLabel).join('  '):'Your turns will appear here.';
    $('#cube-undo').setAttribute('aria-disabled',String(!session.history.length||!!animation||contextLost));
    for(const button of faceButtons)button.setAttribute('aria-disabled',String(!!animation||contextLost));
    for(const face of FACE_KEYS){
      const cells=faceGrid(session.state,face),grid=grids.get(face);
      grid.setAttribute('aria-label',CUBE_FACES[face].name+' face, rows from top: '+[0,3,6].map(start=>cells.slice(start,start+3).map(color=>colorNames[color]).join(', ')).join('; '));
      cells.forEach((color,i)=>{grid.children[i].style.background=CUBE_FACES[color].color;grid.children[i].textContent=color;});
    }
    canvas.setAttribute('aria-label',solved?'Solved Rubik’s cube. All six faces match.':'Interactive Rubik’s cube. Use the face buttons or keyboard to turn it; the sticker map describes all six faces.');
  }
  function finishTurn(){if(!animation)return;animation.turn.finish();animation=null;needsRender=true;onChange(session.state);update();}
  function animate(before,move){
    animation={turn:createCubeTurn(model,before,session.state,move),start:performance.now()};
    if(reduced.matches)finishTurn();else update();
  }
  function turn(face,amount){
    if(!shown||animation||contextLost)return;
    const before=session.state;session.turn(face,amount);animate(before,{face,amount});
  }
  function undo(){
    if(!shown||animation||contextLost)return;
    const before=session.state,move=session.undo();if(move)animate(before,move);
  }
  function reset(practice){
    if(contextLost)return;finishTurn();session.reset(practice);model.sync(session.state);needsRender=true;onChange(session.state);update();
  }
  function orbit(){
    // Keep the cube within view even in the narrow portrait layout.
    const distance=8.6/Math.min(1,camera.aspect);
    camera.position.set(distance*Math.cos(pitch)*Math.sin(yaw),distance*Math.sin(pitch),distance*Math.cos(pitch)*Math.cos(yaw));camera.lookAt(0,0,0);needsRender=true;
  }
  function resize(){
    const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();orbit();
  }
  const observer=new ResizeObserver(resize);
  function frame(now){
    raf=0;if(!shown||document.hidden||contextLost)return;
    session.tick(Math.min(.1,lastFrame?(now-lastFrame)/1000:0));lastFrame=now;
    if(animation){const t=Math.min(1,(now-animation.start)/210);animation.turn.sample(t*t*(3-2*t));needsRender=true;if(t===1)finishTurn();}
    const seconds=Math.floor(session.elapsed),text=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
    if(clockText!==text){clockText=text;$('#cube-time').textContent=text;}
    if(needsRender){renderer.render(world,camera);needsRender=false;}raf=requestAnimationFrame(frame);
  }
  function resume(){lastFrame=0;if(!raf&&shown&&!document.hidden&&!contextLost)raf=requestAnimationFrame(frame);}
  function pause(){if(raf)cancelAnimationFrame(raf);raf=0;lastFrame=0;drag=null;finishTurn();}
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0||drag||contextLost)return;
    canvas.focus({preventScroll:true});drag={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,moved:false};canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if(drag?.id!==event.pointerId)return;
    if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>6)drag.moved=true;
    if(drag.moved){yaw-=(event.clientX-drag.lastX)*.008;pitch=THREE.MathUtils.clamp(pitch+(event.clientY-drag.lastY)*.008,-1.4,1.4);orbit();}
    drag.lastX=event.clientX;drag.lastY=event.clientY;
  });
  canvas.addEventListener('pointerup',event=>{
    if(drag?.id!==event.pointerId)return;const tapped=!drag.moved;drag=null;canvas.releasePointerCapture(event.pointerId);
    if(!tapped||animation||contextLost)return;
    const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    world.updateMatrixWorld(true);raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObjects(model.stickers,false)[0];if(hit)turn(hit.object.userData.face,event.shiftKey?-1:1);
  });
  for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>drag=null);
  dialog.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,textarea,select'))return;
    const key=event.key.toUpperCase();
    if(FACE_KEYS.includes(key)){event.preventDefault();if(!event.repeat)turn(key,event.shiftKey?-1:1);}
    else if(key==='Z'){event.preventDefault();if(!event.repeat)undo();}
    else if(key.startsWith('ARROW')){
      event.preventDefault();yaw+=key==='ARROWLEFT'?-.16:key==='ARROWRIGHT'?.16:0;
      pitch=THREE.MathUtils.clamp(pitch+(key==='ARROWUP'?.13:key==='ARROWDOWN'?-.13:0),-1.4,1.4);orbit();
    }
  });
  $('#cube-undo').addEventListener('click',undo);$('#cube-scramble').addEventListener('click',()=>reset(false));$('#cube-practice').addEventListener('click',()=>reset(true));
  $('#cube-view').addEventListener('click',()=>{yaw=.63;pitch=.47;orbit();});
  $('#cube-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{shown=false;pause();observer.disconnect();});
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;const b=dialog.getBoundingClientRect();
    if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else resume();});
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();contextLost=true;pause();update();$('#cube-status').textContent='Your puzzle is safe. Waiting for graphics to recover.';
  });
  canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;update();resize();resume();});
  update();
  return {open(){shown=true;dialog.showModal();observer.observe(stage);resize();resume();canvas.focus({preventScroll:true});}};
}
