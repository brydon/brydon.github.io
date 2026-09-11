import * as THREE from './vendor/three.module.min.js';

/** The printed number and an upright, camera-facing orientation for each face. */
export function d20Faces(geometry){
  const p=geometry.attributes.position;
  const faces=Array.from({length:20},(_,i)=>{
    const a=new THREE.Vector3().fromBufferAttribute(p,i*3),b=new THREE.Vector3().fromBufferAttribute(p,i*3+1),c=new THREE.Vector3().fromBufferAttribute(p,i*3+2);
    const center=a.clone().add(b).add(c).divideScalar(3),normal=center.clone().normalize(),up=c.clone().sub(center).normalize(),right=new THREE.Vector3().crossVectors(up,normal).normalize();
    return {normal,up,orientation:new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,up,normal)).invert(),value:0};
  });
  let value=1;
  for(const face of [...faces].sort((a,b)=>(b.normal.z+b.normal.y*.4)-(a.normal.z+a.normal.y*.4))){
    if(face.value)continue;
    const opposite=faces.reduce((best,candidate)=>candidate.normal.dot(face.normal)<best.normal.dot(face.normal)?candidate:best);
    face.value=21-value;opposite.value=value++;
  }
  return faces;
}

export function rollD20(random=Math.random){return 1+Math.floor(random()*20);}

export const DINER_BEATS=[
  {text:'You find yourself in a diner,',pause:950},
  {text:' all evidence of a meal having taken place is before you,',pause:1000},
  {text:' but you do not remember eating it.',pause:1100},
  {text:' You don\'t remember how you got here.',pause:900},
  {text:' You don\'t remember who you are.',pause:1500},
  {text:' All you remember, is:',pause:1100,paragraph:true},
  {text:' get fast,',pause:950,conclusion:true},
  {text:' get safe.',pause:2300,conclusion:true}
];

/** One clock for typing, pauses and static, so cancelling never leaves timers behind. */
export function dinerFrame(elapsed,reduced=false){
  let cursor=900;
  const segments=[];
  for(const beat of DINER_BEATS){
    const duration=reduced?0:beat.text.length*(beat.conclusion?78:36);
    const count=reduced?(elapsed>=cursor?beat.text.length:0):Math.min(beat.text.length,Math.max(0,Math.floor((elapsed-cursor)/ (beat.conclusion?78:36))));
    segments.push({...beat,text:beat.text.slice(0,count)});
    cursor+=duration+beat.pause;
  }
  return {segments,static:elapsed>=cursor,done:elapsed>=cursor+1000};
}

export function cradlePose(seconds){
  if(seconds>=14)return {left:0,right:0,impact:-1,done:true};
  const amplitude=.55*Math.exp(-seconds/4.5),swing=Math.cos(seconds*Math.PI/.7);
  return {left:swing>0?-swing*amplitude:0,right:Math.max(0,-swing)*amplitude,impact:Math.floor((seconds+.35)/.7),done:false};
}
