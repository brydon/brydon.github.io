import * as THREE from './vendor/three.module.min.js';
import {createBookNoteState} from './book-note-state.mjs';
import {propArea} from './cabin-shelf-props.mjs';

const WIDTH=.384,HEIGHT=.176,FLOOR=.470;
const ease=t=>t*t*(3-2*t),clamp=t=>Math.max(0,Math.min(1,t));

/** A loose sheet in a bottom-shelf Feynman, released onto clear floorboards. */
export function createBookNote(cabin,book,{loadTexture=url=>new THREE.TextureLoader().load(url)}={}){
  const state=createBookNoteState(),home=book.position.clone(),rotation=book.quaternion.clone();
  const map=loadTexture('/images/switchback/service-064.png');map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;
  const geometry=new THREE.PlaneGeometry(WIDTH,HEIGHT,8,3);
  const paper=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map,roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
  paper.name='Loose printed scrap from Feynman volume II';paper.castShadow=paper.receiveShadow=true;paper.visible=false;cabin.add(paper);
  const original=geometry.attributes.position.array.slice();
  book.updateWorldMatrix(true,false);cabin.updateWorldMatrix(true,false);
  const origin=cabin.worldToLocal(book.localToWorld(new THREE.Vector3(0,0,.13)));
  // Beyond the bookcase lip, just behind the rug: the paper never sits on fringe.
  const landing=new THREE.Vector3(-1.49,FLOOR,-.565),cleared=new THREE.Vector3(-1.66,origin.y+.016,origin.z-.035);
  const initial=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,Math.PI/2));
  const settled=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,-.12));
  const flutter=new THREE.Quaternion(),vertex=new THREE.Vector3(),tilt=new THREE.Quaternion();

  function sync(){
    const t=state.elapsed;
    const tug=!state.disabled&&state.phase==='falling'?Math.sin(clamp(t/.8)*Math.PI):0;
    book.position.copy(home);book.position.z+=tug*.105;book.position.y+=tug*.018;
    tilt.setFromAxisAngle(new THREE.Vector3(1,0,0),-tug*.085);book.quaternion.copy(rotation).multiply(tilt);
    paper.visible=!state.disabled&&(state.phase==='landed'||state.phase==='falling'&&t>.13);
    if(!paper.visible)return;
    const slide=ease(clamp((t-.13)/.40)),fall=ease(clamp((t-.43)/1.22));
    paper.position.lerpVectors(origin,cleared,slide).lerp(landing,fall);
    paper.quaternion.slerpQuaternions(initial,settled,fall);
    const flutterAmount=Math.sin(fall*Math.PI)*(1-fall);
    flutter.setFromEuler(new THREE.Euler(Math.sin(t*15)*.19*flutterAmount,Math.sin(t*11)*.22*flutterAmount,Math.sin(t*9)*.13*flutterAmount));
    paper.quaternion.multiply(flutter);
    const positions=geometry.attributes.position;let bottom=Infinity;
    for(let i=0;i<positions.count;i++){
      const x=original[i*3],y=original[i*3+1];
      const bend=Math.sin((x/WIDTH+.5)*Math.PI)*Math.sin(t*13)*.012*flutterAmount;
      positions.setXYZ(i,x,y,bend);
      vertex.set(x,y,bend).applyQuaternion(paper.quaternion);bottom=Math.min(bottom,vertex.y);
    }
    // Even a corner of the curling sheet stays above the real floor surface.
    paper.position.y=Math.max(paper.position.y,FLOOR-bottom);
    positions.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
    if(state.phase==='landed'){
      paper.position.copy(landing);paper.quaternion.copy(settled);
    }
  }
  return {
    get phase(){return state.phase;},
    release(reducedMotion=false){const accepted=state.release(reducedMotion);if(accepted)sync();return accepted;},
    bookArea(){return state.canRelease?propArea(book):[];},
    paperArea(){
      if(!state.canRead)return [];
      paper.updateWorldMatrix(true,false);
      return [[-WIDTH/2,HEIGHT/2,0],[WIDTH/2,HEIGHT/2,0],[WIDTH/2,-HEIGHT/2,0],[-WIDTH/2,-HEIGHT/2,0]].map(p=>paper.localToWorld(new THREE.Vector3(...p)).toArray());
    },
    canRead(){return state.canRead;},
    animate(seconds,reducedMotion=false,burning=false,paused=false){
      const before=state.phase,elapsed=state.elapsed;
      state.advance(seconds,{reducedMotion,burning,paused});
      if(burning||state.phase!==before||state.elapsed!==elapsed)sync();
    }
  };
}
