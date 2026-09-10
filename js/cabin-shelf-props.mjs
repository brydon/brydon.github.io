import * as THREE from './vendor/three.module.min.js';
import {d20Faces,cradlePose} from './d20-state.mjs';
import {finishGearMaterials} from './gear-materials.mjs';

export function createD20(){
  const die=new THREE.Group();die.name='Purple twenty-sided die';
  const geometry=new THREE.IcosahedronGeometry(.083,0),faces=d20Faces(geometry);
  die.userData.faces=faces;
  const values=faces.map(face=>face.value);
  const image=document.createElement('canvas');image.width=640;image.height=128;const c=image.getContext('2d');
  c.fillStyle='#57335e';c.fillRect(0,0,640,128);c.textAlign='center';c.fillStyle='#ecd390';c.font='bold 21px Georgia';
  const uv=[];for(let i=0;i<20;i++){
    const x=(i%10)*64,y=Math.floor(i/10)*64;c.fillText(String(values[i]),x+32,y+40);
    if(values[i]===6||values[i]===9)c.fillRect(x+27,y+44,10,1.5);
    uv.push((x+2)/640,1-(y+62)/128,(x+62)/640,1-(y+62)/128,(x+32)/640,1-(y+2)/128);
  }
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const map=new THREE.CanvasTexture(image);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  const solid=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map,roughness:.57}));solid.castShadow=solid.receiveShadow=true;die.add(solid);
  die.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:'#aa896c',transparent:true,opacity:.5})));
  die.rotation.set(.10,.22,-.07);return die;
}

export function createNewtonsCradle(){
  const cradle=new THREE.Group();cradle.name='Five-ball Newton’s cradle';
  const steel=new THREE.MeshStandardMaterial({color:'#9ba6a8',roughness:.2,metalness:.92}),wire=new THREE.MeshStandardMaterial({color:'#687476',roughness:.5,metalness:.65}),wood=new THREE.MeshStandardMaterial({color:'#51372c',roughness:.7});
  function add(geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);cradle.add(m);return m;}
  function rod(a,b,r,mat){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);const m=add(new THREE.CylinderGeometry(r,r,d.length(),6),mat);m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}
  add(new THREE.BoxGeometry(.30,.024,.19),wood,0,.012,0);
  for(const z of [-.073,.073]){
    for(const x of [-.128,.128])rod([x,.025,z],[x,.226,z],.0036,steel);
    rod([-.128,.226,z],[.128,.226,z],.0036,steel);
  }
  const pivots=[];
  for(let i=0;i<5;i++){
    const x=(i-2)*.038,pivot=new THREE.Group();pivot.position.set(x,.223,0);cradle.add(pivot);pivots.push(pivot);
    const ball=add(new THREE.SphereGeometry(.019,14,10),steel,0,-.155,0);pivot.add(ball);
    for(const z of [-.073,.073]){
      rod([0,0,z],[0,-.137,0],.00065,wire);pivot.add(cradle.children.at(-1));
    }
  }
  let elapsed=14,lastImpact=0;
  cradle.userData.release=(reduced=false)=>{elapsed=reduced?14:0;lastImpact=0;};
  cradle.userData.tick=(dt,reduced,onImpact)=>{
    if(reduced)elapsed=14;
    elapsed=Math.min(14,elapsed+dt);const pose=cradlePose(elapsed);
    pivots[0].rotation.z=pose.left;pivots[4].rotation.z=pose.right;
    if(!pose.done&&pose.impact>lastImpact){lastImpact=pose.impact;onImpact?.(Math.exp(-elapsed/4.5));}
  };
  return finishGearMaterials(cradle);
}

export function propArea(prop){
  prop.updateWorldMatrix(true,true);const bounds=new THREE.Box3().setFromObject(prop),points=[];
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])points.push([x,y,z]);
  return points;
}
