import * as THREE from './vendor/three.module.min.js';
import {POSTERS,createPosterHistory} from './poster-history.mjs';

const SCALE=.47,HALF_HEIGHT=.795,HOME=new THREE.Vector3(-1.05,1.82,1.90);
const ease=t=>t*t*(3-2*t);

/** A stack of framed prints on one hook, falling onto the floor beside the hearth. */
export function createPosterStack(cabin,{loadTexture=url=>new THREE.TextureLoader().load(url)}={}){
  const history=createPosterHistory();
  const wood=new THREE.MeshStandardMaterial({color:'#354037',roughness:.96});
  const frames=POSTERS.map((poster,index)=>{
    const pivot=new THREE.Group();pivot.name=poster.name+' poster';cabin.add(pivot);
    const frame=new THREE.Group();frame.position.y=-HALF_HEIGHT;pivot.add(frame);
    const box=(w,h,d,x,y,z)=>{
      const part=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wood);
      part.position.set(x,y,z);part.castShadow=true;part.receiveShadow=true;frame.add(part);
    };
    box(1.16,1.59,.025,0,0,0);
    const texture=loadTexture(poster.print);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
    const print=new THREE.Mesh(new THREE.PlaneGeometry(1.10,1.5125),new THREE.MeshStandardMaterial({map:texture,roughness:.96,metalness:0}));
    print.position.z=.017;print.receiveShadow=true;frame.add(print);
    for(const x of [-.567,.567])box(.034,1.59,.038,x,0,.013);
    for(const y of [-.778,.778])box(1.16,.034,.038,0,y,.013);
    pivot.scale.setScalar(SCALE);pivot.rotation.order='YXZ';pivot.rotation.y=Math.PI;
    pivot.position.copy(HOME);pivot.position.y+=HALF_HEIGHT*SCALE;
    // Only the two exposed layers need drawing. Small depth offsets prevent flicker.
    pivot.position.z+=index*.003;
    pivot.visible=index===0;
    return {pivot,frame};
  });
  const note=new THREE.Group();note.name='The last red herring';
  note.position.set(-1.03,1.80,1.923);note.rotation.set(0,Math.PI,.08);note.visible=false;cabin.add(note);
  const paper=new THREE.Mesh(new THREE.BoxGeometry(.29,.31,.003),new THREE.MeshStandardMaterial({color:'#f4da79',roughness:1}));
  paper.receiveShadow=true;paper.castShadow=true;note.add(paper);
  const noteTexture=loadTexture('/images/switchback/posters/red-herring.svg');noteTexture.colorSpace=THREE.SRGBColorSpace;noteTexture.anisotropy=8;
  const ink=new THREE.Mesh(new THREE.PlaneGeometry(.286,.306),new THREE.MeshStandardMaterial({map:noteTexture,roughness:1}));ink.position.z=.002;note.add(ink);
  let wobbleTime=10,wobbleSide=1;
  function floorPose(index){
    const {pivot,frame}=frames[index];
    pivot.rotation.set(-Math.PI/2,Math.PI+(index%3-1)*.08,0,'YXZ');
    // The rug is higher than the floorboards. The pile sits above both surfaces.
    const center=new THREE.Vector3(-.98+(index%3-1)*.022,.56+index*.022,1.33);
    pivot.position.copy(center).sub(frame.position.clone().multiplyScalar(SCALE).applyEuler(pivot.rotation));
  }
  return {
    tap(now){
      if(!history.current)return 'note';
      const result=history.tap(now);
      if(result){wobbleTime=0;wobbleSide*=-1;}
      if(result==='fall'){
        if(frames[history.index+1])frames[history.index+1].pivot.visible=true;
        else note.visible=true;
      }
      return result;
    },
    animate(seconds,reducedMotion=false){
      const index=history.index;if(index===frames.length)return;
      const {pivot}=frames[index];
      if(history.falling){
        const t=history.advance(seconds,reducedMotion);
        if(reducedMotion){pivot.visible=t===1;if(t===1){floorPose(index);wobbleTime=10;}return;}
        // Slide off the hook, pitch face-up, then make one small settling bounce.
        const flight=Math.min(1,t/.82),tilt=ease(flight);
        pivot.rotation.set(-Math.PI/2*tilt,Math.PI+(index%3-1)*.08*tilt,Math.sin(flight*Math.PI)*.10*wobbleSide,'YXZ');
        const landing=new THREE.Vector3(-.98+(index%3-1)*.022,.56+index*.022,1.33);
        const center=HOME.clone();center.z+=index*.003;
        center.x=THREE.MathUtils.lerp(center.x,landing.x,flight);
        center.y=THREE.MathUtils.lerp(center.y,landing.y,flight*flight);
        center.z=THREE.MathUtils.lerp(center.z,landing.z,tilt);
        if(t>.82)center.y+=Math.sin((t-.82)/.18*Math.PI)*.025;
        pivot.position.copy(center).sub(frames[index].frame.position.clone().multiplyScalar(SCALE).applyEuler(pivot.rotation));
        if(t===1){floorPose(index);wobbleTime=10;}
      }else{
        wobbleTime+=seconds;
        const wobble=reducedMotion?0:Math.sin(wobbleTime*24)*Math.exp(-wobbleTime*5)*.09*wobbleSide;
        pivot.rotation.z=wobble;
        pivot.rotation.x=reducedMotion?0:-Math.abs(wobble)*.28;
      }
    },
    hotspot(){
      if(!history.current){
        note.updateWorldMatrix(true,false);
        return {name:'sticky note',kind:'note',disabled:false,vertices:[[-.145,.155,.005],[.145,.155,.005],[.145,-.155,.005],[-.145,-.155,.005]].map(p=>note.localToWorld(new THREE.Vector3(...p)).toArray())};
      }
      const {frame}=frames[history.index];frame.updateWorldMatrix(true,false);
      const vertices=[[-.59,.80,.04],[.59,.80,.04],[.59,-.80,.04],[-.59,-.80,.04]].map(p=>frame.localToWorld(new THREE.Vector3(...p)).toArray());
      return {name:history.current.name,vertices,disabled:history.falling};
    }
  };
}
