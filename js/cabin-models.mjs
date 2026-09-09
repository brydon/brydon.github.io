import * as THREE from './vendor/three.module.min.js';

const cache=new Map();
function material(color,metal=false){const key=color+metal;if(!cache.has(key))cache.set(key,new THREE.MeshStandardMaterial({color,roughness:metal?.34:.9,metalness:metal?.78:0,flatShading:true}));return cache.get(key);}
function mesh(parent,geometry,color,position,metal=false){const object=new THREE.Mesh(geometry,material(color,metal));object.position.set(...position);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;}
function box(parent,size,position,color){return mesh(parent,new THREE.BoxGeometry(...size),color,position);}
function ellipsoid(parent,size,position,color){const object=mesh(parent,new THREE.SphereGeometry(1,12,8),color,position);object.scale.set(...size);return object;}
function rod(parent,a,b,radius,color,metal=false){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);const object=mesh(parent,new THREE.CylinderGeometry(radius,radius,delta.length(),8),color,start.add(end).multiplyScalar(.5).toArray(),metal);object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return object;}
function pipe(parent,points,radius,color,metal=false){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(parent,new THREE.TubeGeometry(curve,24,radius,7,false),color,[0,0,0],metal);}

/** Brydon in his green flannel, glasses, worn jeans and riding boots. */
export function createBrydon(){
  const person=new THREE.Group();person.name='Brydon in green plaid';
  const skin='#d4a076',hair='#68412a',darkHair='#493325',green='#3e5341',olive='#85815a',ink='#273a31';
  function tailored(size,position,color,parent=person,r=.025){
    const[w,h,d]=size,shape=new THREE.Shape();shape.moveTo(-w/2+r,-h/2+r);shape.lineTo(w/2-r,-h/2+r);shape.lineTo(w/2-r,h/2-r);shape.lineTo(-w/2+r,h/2-r);shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:d-r*2,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:1,steps:1});geometry.translate(0,0,-d/2+r);
    return mesh(parent,geometry,color,position);
  }
  // Slightly relaxed legs, cuffs, stitching, laces and solid boot soles.
  for(const side of [-1,1]){
    const x=side*.14;
    tailored([.235,.4,.25],[x,.65,-.025],'#344e60');
    const shin=tailored([.185,.35,.21],[x+side*.015,.32,0],'#3d5869');shin.rotation.z=side*.025;
    box(person,[.014,.48,.014],[x+side*.091,.45,.111],'#67808a');
    tailored([.20,.055,.22],[x+side*.015,.18,.008],'#74838a',person,.009);
    tailored([.23,.145,.36],[x+side*.015,.087,.075],'#795233');
    tailored([.235,.036,.375],[x+side*.015,.025,.075],'#302e27',person,.009);
    tailored([.18,.16,.19],[x+side*.015,.15,-.008],'#90653e');
    for(let i=0;i<4;i++)rod(person,[x-.068,.18-i*.018,.035+i*.022],[x+.068,.18-i*.018,.035+i*.022],.008,'#c3a577');
    const knee=box(person,[.13,.023,.008],[x,.47,.127],'#69808a');knee.rotation.z=side*.15;
  }
  tailored([.49,.16,.28],[0,.84,-.018],'#344b5a');
  box(person,[.48,.035,.29],[0,.883,-.015],'#594434');box(person,[.055,.05,.015],[0,.884,.139],'#9e9b7e');
  // The flannel has thickness and a wraparound plaid pattern, over a dark tee.
  tailored([.575,.57,.34],[0,1.13,0],green);
  for(const side of [-1,1]){
    for(const x of [-.22,-.105,.105,.22])box(person,[.043,.54,.008],[x,1.13,side*.173],olive);
    for(let i=0;i<5;i++)box(person,[.55,.045,.012],[0,.91+i*.105,side*.18],ink);
    for(const x of [-.289,.289])for(let i=0;i<5;i++)box(person,[.008,.045,.31],[x,.91+i*.105,0],ink);
  }
  tailored([.175,.5,.017],[0,1.155,.19],'#242f2b',person,.005);
  for(const x of [-.107,.107])box(person,[.016,.5,.014],[x,1.135,.203],'#b4ac79');
  for(const x of [-.193,.193]){
    tailored([.105,.115,.018],[x,1.235,.201],green,person,.009);
    box(person,[.103,.025,.011],[x,1.267,.215],olive);
    ellipsoid(person,[.009,.009,.006],[x,1.26,.223],'#c5baa0');
    const collar=tailored([.096,.125,.033],[x*.48,1.392,.152],'#697653',person,.008);collar.rotation.z=Math.sign(x)*.38;
  }
  for(let i=0;i<5;i++)ellipsoid(person,[.009,.009,.006],[.102,.95+i*.08,.218],'#c9bea2');
  rod(person,[0,1.36,0],[0,1.47,0],.092,skin);
  const arms=[];
  for(const side of [-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.325,1.35,0);arm.rotation.z=side*.06;person.add(arm);arms.push(arm);
    tailored([.2,.29,.24],[side*.012,-.12,-.008],green,arm);
    tailored([.177,.25,.205],[side*.027,-.36,.018],green,arm);
    for(let i=0;i<5;i++)box(arm,[.18,.034,.008],[side*.021,-.04-i*.095,.127],ink);
    box(arm,[.04,.43,.012],[side*.04,-.22,.13],olive);
    tailored([.19,.06,.216],[side*.027,-.48,.023],'#78805b',arm,.009);
    ellipsoid(arm,[.074,.104,.069],[side*.035,-.59,.035],skin);
    ellipsoid(arm,[.035,.062,.032],[-side*.025,-.57,.083],'#dcae83');
    for(let i=0;i<3;i++)box(arm,[.008,.052,.006],[side*.035-.032+i*.025,-.62,.097],'#ac7956');
  }
  // Faceted cheekbones, ears, a shaped beard, and swept, tousled brown hair.
  ellipsoid(person,[.196,.242,.179],[0,1.645,0],skin);
  for(const x of [-.196,.196]){
    ellipsoid(person,[.039,.069,.03],[x,1.64,-.006],skin);
    ellipsoid(person,[.016,.039,.012],[x*1.055,1.641,.017],'#b98361');
    ellipsoid(person,[.038,.092,.075],[x*.88,1.59,.026],darkHair);
  }
  ellipsoid(person,[.169,.125,.145],[0,1.5,.054],darkHair);
  ellipsoid(person,[.123,.093,.057],[0,1.484,.172],hair);
  for(const x of [-.092,.092])ellipsoid(person,[.064,.066,.049],[x,1.558,.143],hair);
  ellipsoid(person,[.039,.051,.046],[0,1.624,.187],'#dca980');
  ellipsoid(person,[.047,.026,.04],[0,1.598,.204],'#d7a075');
  for(const x of [-.039,.039]){const moustache=ellipsoid(person,[.047,.023,.022],[x,1.565,.207],darkHair);moustache.rotation.z=x<0?.15:-.15;}
  box(person,[.058,.009,.008],[0,1.542,.214],'#b58465');
  ellipsoid(person,[.2,.165,.17],[0,1.763,-.065],darkHair);
  // Asymmetric curls are individual low-poly volumes, so the silhouette reads.
  for(let i=0;i<22;i++){
    const a=i*2.399,r=.045+(i%4)*.035;
    const tuft=mesh(person,new THREE.IcosahedronGeometry(.057+(i%3)*.01,0),['#68412a','#7e4f2e','#986239'][i%3],[Math.cos(a)*r,1.823+(i%3)*.023+Math.cos(a)*.017,Math.sin(a)*r-.012]);
    tuft.scale.set(1.16,.8,1);tuft.rotation.set(i*.5,i*.7,i*.2);
  }
  for(const x of [-.085,.085]){
    ellipsoid(person,[.04,.026,.013],[x,1.685,.157],'#eee0c7');
    ellipsoid(person,[.013,.02,.009],[x+.005,1.685,.17],'#3a4335');
    ellipsoid(person,[.006,.014,.005],[x+.006,1.685,.179],'#222b27');
    const brow=ellipsoid(person,[.06,.014,.016],[x,1.738,.149],hair);brow.rotation.z=x<0?-.08:.08;
  }
  // Thick rounded rectangular frames, with actual temples extending to the ears.
  for(const side of [-1,1]){
    const center=side*.09,points=[];
    const corners=[[-.052,-.035],[.052,-.035],[.052,.035],[-.052,.035]];
    for(const[x,y]of corners)points.push([center+x,1.683+y,.192]);
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),true,'catmullrom',.18);
    mesh(person,new THREE.TubeGeometry(curve,24,.010,6,true),'#252e2b',[0,0,0]);
    rod(person,[side*.154,1.7,.184],[side*.195,1.687,-.05],.011,'#252e2b');
  }
  rod(person,[-.03,1.692,.196],[.03,1.692,.196],.009,'#252e2b');
  person.userData.arms=arms;
  return person;
}

export function createHelmet(){
  const helmet=new THREE.Group();helmet.name='Riding helmet on the porch';
  ellipsoid(helmet,[.192,.204,.18],[0,0,0],'#252e2c');
  box(helmet,[.27,.088,.032],[0,.012,.17],'#151f1c');
  const rim=mesh(helmet,new THREE.TorusGeometry(.142,.019,6,18),'#647169',[0,-.04,.13]);rim.scale.y=.75;
  ellipsoid(helmet,[.051,.025,.027],[.025,.141,.13],'#81897d');
  return helmet;
}

/** A resting Bernese mountain dog, modelled from volumes rather than a billboard. */
export function createDog(){
  const dog=new THREE.Group();dog.name='Sleeping Bernese mountain dog';
  const black='#282827',tan='#956133',white='#e4ddc5';
  ellipsoid(dog,[.65,.31,.37],[.17,.35,0],black);
  ellipsoid(dog,[.43,.27,.32],[.61,.3,.035],black);
  ellipsoid(dog,[.37,.28,.3],[-.3,.31,.045],black);
  ellipsoid(dog,[.43,.16,.24],[.12,.19,.19],tan);
  // Forelegs and pale paws tuck in front of the muzzle.
  for(const x of [-.68,-.23]){
    ellipsoid(dog,[.14,.105,.31],[x,.105,.33],tan);
    ellipsoid(dog,[.14,.09,.15],[x,.087,.55],white);
    for(let i=0;i<3;i++)box(dog,[.012,.025,.045],[x-.065+i*.061,.124,.66],'#b3ab97');
  }
  ellipsoid(dog,[.25,.11,.2],[.64,.11,.31],tan);
  ellipsoid(dog,[.16,.09,.12],[.68,.085,.46],white);
  const headStart=dog.children.length;
  ellipsoid(dog,[.29,.23,.26],[-.46,.31,.27],black);
  ellipsoid(dog,[.18,.14,.16],[-.46,.19,.465],white);
  // The broad white blaze, russet cheeks, and hanging dark ears.
  ellipsoid(dog,[.065,.19,.065],[-.46,.34,.494],white);
  ellipsoid(dog,[.1,.065,.045],[-.615,.325,.468],tan);
  ellipsoid(dog,[.1,.065,.045],[-.305,.325,.468],tan);
  for(const x of [-.75,-.17]){
    const ear=ellipsoid(dog,[.115,.255,.17],[x,.255,.285],black);ear.rotation.z=x<-.4?-.3:.3;
    ellipsoid(dog,[.07,.15,.11],[x,.145,.32],'#463a2b');
  }
  ellipsoid(dog,[.088,.055,.055],[-.46,.198,.617],'#171e1c');
  for(const x of [-.59,-.33]){const eye=box(dog,[.085,.016,.022],[x,.31,.517],'#171e1c');eye.rotation.z=x<-.4?-.12:.12;}
  const head=new THREE.Group(),pivot=new THREE.Vector3(-.46,.2,.3),headParts=dog.children.slice(headStart);
  head.position.copy(pivot);dog.add(head);headParts.forEach(part=>{part.position.sub(pivot);head.add(part);});
  const tail=new THREE.Group();tail.position.set(.66,.23,-.18);dog.add(tail);
  pipe(tail,[[0,0,0],[.3,-.06,0],[.41,-.11,.22],[.34,-.15,.42]],.10,black);
  pipe(tail,[[.37,-.14,.34],[.34,-.15,.45],[.25,-.15,.49]],.092,white);
  dog.userData.head=head;dog.userData.tail=tail;
  // Coarse fur facets around the ruff and spine give the silhouette texture.
  for(let i=0;i<9;i++){
    const tuft=mesh(dog,new THREE.IcosahedronGeometry(.10,0),i<3?white:black,[-.32+i*.12,.57+Math.sin(i)*.025,-.02]);
    tuft.scale.set(1,.5,.85);
  }
  return dog;
}

/** A low-poly 2015 Iron 883: peanut tank, V-twin, mag wheels, twin chrome pipes. */
export function createIron883(){
  const bike=new THREE.Group();bike.name='Black 2015 Iron 883';
  const black='#202825',rubber='#171e1c',chrome='#b3c2bd',steel='#677873';
  const wheelY=.42;
  for(const x of [-.94,.99]){
    mesh(bike,new THREE.TorusGeometry(.33,.082,8,24),rubber,[x,wheelY,0]);
    mesh(bike,new THREE.TorusGeometry(.268,.025,6,20),black,[x,wheelY,0]);
    const axle=mesh(bike,new THREE.CylinderGeometry(.075,.075,.29,10),steel,[x,wheelY,0],true);axle.rotation.x=Math.PI/2;
    for(let i=0;i<10;i++){
      const a=i*Math.PI/5;
      rod(bike,[x+Math.cos(a)*.064,wheelY+Math.sin(a)*.064,0],[x+Math.cos(a+.08)*.26,wheelY+Math.sin(a+.08)*.26,0],.024,black);
    }
    const disc=mesh(bike,new THREE.CylinderGeometry(.17,.17,.018,16),steel,[x,wheelY,.095],true);disc.rotation.x=Math.PI/2;
    for(let i=0;i<7;i++){
      const a=i*Math.PI/3.5;
      const hole=mesh(bike,new THREE.CylinderGeometry(.017,.017,.02,6),rubber,[x+Math.cos(a)*.135,wheelY+Math.sin(a)*.135,.108]);hole.rotation.x=Math.PI/2;
    }
  }
  // Tubular frame, rear swingarm, and the rake of the front suspension.
  for(const z of [-.14,.14]){
    for(const[a,b]of[[[-.94,.42,z],[-.43,.79,z]],[[-.94,.42,z],[.22,.3,z]],[[-.43,.79,z],[.48,1.02,z]],[[.48,1.02,z],[.35,.33,z]],[[.35,.33,z],[-.35,.3,z]],[[-.35,.3,z],[-.43,.79,z]]])rod(bike,a,b,.028,black);
    rod(bike,[.99,.42,z],[.51,1.16,z],.032,chrome,true);
    rod(bike,[.99,.42,z],[.78,.76,z],.052,black);
    for(let i=0;i<5;i++){
      const t=i/5;const ring=mesh(bike,new THREE.TorusGeometry(.051,.012,5,10),rubber,[.79-t*.13,.77+t*.2,z]);ring.rotation.x=Math.PI/2;ring.rotation.z=.54;
    }
    rod(bike,[-.87,.43,z],[-.62,.83,z],.029,chrome,true);
    for(let i=0;i<6;i++){
      const t=i/6;const ring=mesh(bike,new THREE.TorusGeometry(.053,.012,5,10),chrome,[-.84+t*.19,.47+t*.3,z],true);ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(.25,.4,0).normalize());
    }
  }
  // Fenders are extruded bands, not flat side silhouettes.
  function fender(x,r,start,end,depth){const shape=new THREE.Shape();shape.absarc(0,0,r,start,end,false);shape.absarc(0,0,r-.04,end,start,true);shape.closePath();const cover=mesh(bike,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:18}),black,[x,wheelY,-depth/2]);return cover;}
  fender(-.94,.437,.05,Math.PI-.05,.28);fender(.99,.435,.24,Math.PI-.18,.22);
  box(bike,[.24,.055,.3],[-1.25,.7,0],black);
  box(bike,[.05,.09,.16],[-1.38,.64,0],'#a62e25');
  // Low seat and the recognisable peanut tank.
  const seat=ellipsoid(bike,[.39,.07,.18],[-.55,.88,0],'#252823');seat.rotation.z=.07;
  const tank=ellipsoid(bike,[.37,.175,.215],[.035,1.005,0],black);tank.rotation.z=.11;
  tank.material=new THREE.MeshStandardMaterial({color:black,roughness:.44,metalness:.45,flatShading:true});
  mesh(bike,new THREE.CylinderGeometry(.045,.045,.025,8),chrome,[.15,1.169,0],true);
  // V-twin barrels with separate cooling fins.
  for(const sign of [-1,1]){
    const lower=new THREE.Vector3(.03,.37,0),upper=new THREE.Vector3(.03+sign*.20,.79,0),axis=upper.clone().sub(lower).normalize();
    rod(bike,lower.toArray(),upper.toArray(),.12,black);
    for(let i=0;i<7;i++){
      const center=lower.clone().lerp(upper,.24+i*.1);
      const fin=mesh(bike,new THREE.CylinderGeometry(.139,.139,.018,10),i%2?steel:chrome,center.toArray(),true);
      fin.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),axis);
    }
    const cap=mesh(bike,new THREE.CylinderGeometry(.146,.146,.075,8),steel,upper.toArray(),true);cap.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),axis);
  }
  const crank=mesh(bike,new THREE.CylinderGeometry(.24,.24,.33,12),black,[.025,.38,0]);crank.rotation.x=Math.PI/2;
  const filter=mesh(bike,new THREE.CylinderGeometry(.177,.177,.09,14),black,[.07,.62,.22]);filter.rotation.x=Math.PI/2;
  const filterRim=mesh(bike,new THREE.TorusGeometry(.157,.013,6,14),steel,[.07,.62,.269],true);
  for(let i=0;i<3;i++)box(bike,[.19,.016,.008],[.07,.56+i*.047,.273],steel);
  box(bike,[.29,.27,.2],[-.49,.63,.04],'#292e27');
  // Both polished exhausts are visible on the right side.
  pipe(bike,[[-.17,.78,.13],[-.27,.56,.24],[-.12,.29,.3],[-.42,.245,.31],[-1.10,.245,.31]],.037,chrome,true);
  pipe(bike,[[.25,.77,.12],[.48,.62,.22],[.46,.24,.37],[.18,.16,.37],[-1.1,.16,.37]],.037,chrome,true);
  for(const[y,z]of[[.245,.31],[.16,.37]]){
    rod(bike,[-1.12,y,z],[-.45,y,z],.057,chrome,true);
    const hole=mesh(bike,new THREE.CylinderGeometry(.038,.038,.012,8),rubber,[-1.125,y,z]);hole.rotation.z=Math.PI/2;
  }
  // Handlebars, round lamp, indicators and mirrors.
  pipe(bike,[[.5,1.15,-.31],[.44,1.23,-.15],[.44,1.23,.15],[.5,1.15,.31]],.021,chrome,true);
  for(const z of [-.32,.32]){
    rod(bike,[.48,1.15,z],[.65,1.15,z],.038,rubber);
    rod(bike,[.48,1.19,z],[.42,1.38,z],.01,steel,true);
    ellipsoid(bike,[.075,.045,.025],[.42,1.4,z],'#6f8480');
    const signal=mesh(bike,new THREE.SphereGeometry(.043,8,6),'#dc8a28',[.75,.99,z*.8]);signal.scale.x=1.15;
  }
  const lamp=mesh(bike,new THREE.CylinderGeometry(.13,.13,.13,12),black,[.71,1.065,0]);lamp.rotation.z=Math.PI/2;
  const lens=mesh(bike,new THREE.CylinderGeometry(.106,.106,.01,12),'#e9d49b',[.779,1.065,0]);lens.rotation.z=Math.PI/2;
  lens.material=new THREE.MeshStandardMaterial({color:'#f3d697',emissive:'#e9bf6f',emissiveIntensity:.3});
  rod(bike,[-.06,.34,-.38],[-.06,.34,.39],.029,steel,true);
  rod(bike,[-.5,.28,.08],[-.59,.01,.38],.02,steel,true);
  // Tank lettering is a texture on a model surface, not an image cutout.
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
  const c=canvas.getContext('2d');c.fillStyle='#202825';c.fillRect(0,0,256,128);c.fillStyle='#d0c9ae';c.textAlign='center';c.font='25px monospace';c.fillText('HARLEY-',128,53);c.fillText('DAVIDSON',128,87);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;
  for(const side of [-1,1]){const badge=new THREE.Mesh(new THREE.PlaneGeometry(.35,.175),new THREE.MeshStandardMaterial({map:texture,roughness:.7}));badge.position.set(.015,1.013,side*.212);badge.rotation.y=side<0?Math.PI:0;bike.add(badge);}
  return bike;
}
