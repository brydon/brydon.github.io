import * as THREE from './vendor/three.module.min.js';

// Import the detailed motorcycle under a different name,
// so it does not conflict with our cabin factory below.
import {
  createIron883 as createDetailedIron883,
} from './iron883.js';

// Allow the scene to import these controls from cabin-module.mjs too.
export {
  setIron883Mirrors,
  setIron883Steering,
  disposeIron883,
} from './iron883.js';

const cache=new Map();
function material(color,metal=false){const key=color+metal;if(!cache.has(key))cache.set(key,new THREE.MeshStandardMaterial({color,roughness:metal?.34:.9,metalness:metal?.78:0,flatShading:true}));return cache.get(key);}
function mesh(parent,geometry,color,position,metal=false){const object=new THREE.Mesh(geometry,material(color,metal));object.position.set(...position);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;}
function box(parent,size,position,color){return mesh(parent,new THREE.BoxGeometry(...size),color,position);}
function ellipsoid(parent,size,position,color){const object=mesh(parent,new THREE.SphereGeometry(1,12,8),color,position);object.scale.set(...size);return object;}
function rod(parent,a,b,radius,color,metal=false){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);const object=mesh(parent,new THREE.CylinderGeometry(radius,radius,delta.length(),8),color,start.add(end).multiplyScalar(.5).toArray(),metal);object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return object;}
function pipe(parent,points,radius,color,metal=false){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(parent,new THREE.TubeGeometry(curve,24,radius,7,false),color,[0,0,0],metal);}

/** Brydon in his grey plaid flannel over a dark tee, clear glasses, worn jeans and riding boots. */
export function createBrydon(){
  const person=new THREE.Group();person.name='Brydon in plaid flannel';
  const skin='#dfab85',hair='#7a5a3d',darkHair='#6a4b32',tee='#26282a';
  // A tiny pixel tartan: black and grey blocks crossed by charcoal and a thin cream line.
  const canvas=document.createElement('canvas');canvas.width=canvas.height=32;const context=canvas.getContext('2d');
  const sett=[['#1e2022',7],['#4a4e51',2],['#8f9493',6],['#4a4e51',1],['#e6e2d6',1],['#4a4e51',4],['#1e2022',6],['#8f9493',2],['#e6e2d6',1],['#4a4e51',2]];
  const stripes=sett.flatMap(([color,count])=>Array(count).fill(new THREE.Color(color)));
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){context.fillStyle='#'+stripes[x].clone().lerp(stripes[y],(x+y)%2?.35:.65).getHexString();context.fillRect(x,y,1,1);}
  const plaids=new Map();
  function plaid(rx,ry){
    const key=rx+','+ry;
    if(!plaids.has(key)){const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.magFilter=THREE.NearestFilter;map.repeat.set(rx,ry);plaids.set(key,new THREE.MeshStandardMaterial({map,roughness:.95,flatShading:true}));}
    return plaids.get(key);
  }
  function cloth(geometry,rx,ry,position,parent=person){const object=new THREE.Mesh(geometry,plaid(rx,ry));object.position.set(...position);object.castShadow=object.receiveShadow=true;parent.add(object);return object;}
  function tailored(size,position,color,parent=person,r=.025){
    const[w,h,d]=size,shape=new THREE.Shape();shape.moveTo(-w/2+r,-h/2+r);shape.lineTo(w/2-r,-h/2+r);shape.lineTo(w/2-r,h/2-r);shape.lineTo(-w/2+r,h/2-r);shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:d-r*2,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:1,steps:1});geometry.translate(0,0,-d/2+r);
    return mesh(parent,geometry,color,position);
  }
  // Tapered jeans over rolled cuffs, laced boots and solid soles.
  for(const side of [-1,1]){
    const x=side*.125;
    mesh(person,new THREE.CylinderGeometry(.118,.1,.42,10),'#3b5568',[x,.62,-.01]);
    mesh(person,new THREE.CylinderGeometry(.1,.092,.34,10),'#3b5568',[x+side*.01,.36,0]);
    tailored([.20,.055,.22],[x+side*.015,.18,.008],'#74838a',person,.009);
    tailored([.23,.145,.36],[x+side*.015,.087,.075],'#795233');
    tailored([.235,.036,.375],[x+side*.015,.025,.075],'#302e27',person,.009);
    tailored([.18,.16,.19],[x+side*.015,.15,-.008],'#90653e');
    for(let i=0;i<4;i++)rod(person,[x-.068,.18-i*.018,.035+i*.022],[x+.068,.18-i*.018,.035+i*.022],.008,'#c3a577');
  }
  mesh(person,new THREE.CylinderGeometry(.228,.228,.14,12),'#344b5a',[0,.85,-.005]).scale.z=.6;
  // The untucked flannel is turned on a lathe: soft sloped shoulders and a gentle taper.
  const profile=[[0,-.06],[.245,-.06],[.245,.06],[.25,.26],[.262,.4],[.25,.47],[.2,.52],[.11,.55],[0,.56]].map(([r,y])=>new THREE.Vector2(r,y));
  cloth(new THREE.LatheGeometry(profile,14),5,2.5,[0,.84,0]).scale.z=.64;
  mesh(person,new THREE.LatheGeometry(profile,6,-.3,.6),tee,[0,.84,.004]).scale.set(1.012,1,.65);
  for(const side of [-1,1]){
    cloth(new THREE.BoxGeometry(.035,.44,.02),.3,2.2,[side*.082,1.08,.157]).rotation.y=side*.32;
    cloth(new THREE.BoxGeometry(.1,.11,.016),.6,.7,[side*.155,1.2,.132]).rotation.y=side*.55;
    cloth(new THREE.BoxGeometry(.108,.032,.022),.6,.2,[side*.155,1.264,.136]).rotation.y=side*.55;
    cloth(new THREE.BoxGeometry(.1,.12,.025),.6,.6,[side*.085,1.4,.1]).rotation.set(-.35,side*.35,side*.55);
  }
  rod(person,[0,1.36,0],[0,1.47,0],.088,skin);
  // Rounded sleeves hang from the shoulder pivots used by the walk cycle.
  const arms=[];
  for(const side of [-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.27,1.33,0);arm.rotation.z=side*.1;person.add(arm);arms.push(arm);
    cloth(new THREE.CapsuleGeometry(.092,.2,3,10),2,1.4,[side*.01,-.13,0],arm);
    cloth(new THREE.CapsuleGeometry(.08,.2,3,10),2,1.4,[side*.02,-.35,.012],arm);
    cloth(new THREE.CylinderGeometry(.085,.085,.06,10),2,.3,[side*.022,-.47,.014],arm);
    ellipsoid(arm,[.068,.096,.064],[side*.024,-.56,.02],skin);
    ellipsoid(arm,[.03,.055,.03],[-side*.03,-.54,.06],'#e2b38c');
  }
  // A longer face, a short sandy beard that follows the jaw, and swept medium-brown hair.
  const beard='#9a6a42',moustache='#b98b5a',frame='#e1e4de';
  function cap(radii,position,color,phi,theta,tilt){const object=mesh(person,new THREE.SphereGeometry(1,28,16,phi[0],phi[1],theta[0],theta[1]),color,position);object.scale.set(...radii);object.rotation.x=tilt;return object;}
  mesh(person,new THREE.SphereGeometry(1,22,16),skin,[0,1.645,0]).scale.set(.182,.25,.182);
  for(const x of [-.182,.182]){
    ellipsoid(person,[.036,.066,.03],[x*1.02,1.645,-.01],skin);
    ellipsoid(person,[.015,.037,.012],[x*1.09,1.646,.012],'#b98361');
  }
  // The trimmed beard is a thin shell over the jaw, cut on a slight diagonal from
  // the sideburns to the mouth and fuller only at the chin.
  cap([.193,.262,.196],[0,1.645,.003],beard,[-.25,Math.PI+.5],[Math.PI*.56,Math.PI*.44],.2);
  ellipsoid(person,[.034,.06,.046],[0,1.63,.188],'#e2b08a');
  ellipsoid(person,[.04,.027,.04],[0,1.6,.205],'#d9a07a');
  for(const x of [-.036,.036]){const lip=ellipsoid(person,[.046,.017,.02],[x,1.568,.2],moustache);lip.rotation.z=x<0?.2:-.2;}
  box(person,[.05,.007,.008],[0,1.545,.199],'#6f4a39');
  ellipsoid(person,[.028,.01,.01],[0,1.532,.192],'#b77b5d');
  // Hair sits low at the nape and lifts off the forehead, swept to one side.
  cap([.197,.31,.192],[0,1.645,-.008],darkHair,[0,Math.PI*2],[0,Math.PI*.36],0);
  cap([.197,.31,.192],[0,1.645,-.008],darkHair,[Math.PI-.35,Math.PI+.7],[Math.PI*.36,Math.PI*.16],0);
  cap([.194,.262,.196],[0,1.645,-.004],darkHair,[Math.PI+.2,Math.PI-.4],[Math.PI*.3,Math.PI*.36],0);
  // The tall shell hugs the forehead at the hairline, so nothing reads as a brim;
  // small flat tufts give it a messy texture, and two lift off the front.
  for(let i=0;i<14;i++){
    const a=i*2.399,r=.03+(i%5)*.028,x=Math.cos(a)*r*.9,z=Math.sin(a)*r*.85+.01;
    const y=1.64+.31*Math.sqrt(Math.max(0,1-(x/.197)**2-((z+.008)/.192)**2));
    const tuft=mesh(person,new THREE.IcosahedronGeometry(.045,0),[hair,'#8a6647','#9e7a55'][i%3],[x,y,z]);
    tuft.scale.set(1.3,.55,1.1);tuft.rotation.set(-.3,i*.7,.25);
  }
  for(const[x,y,z]of[[-.03,1.835,.14],[.06,1.845,.125]]){
    const quiff=mesh(person,new THREE.IcosahedronGeometry(.05,0),'#957150',[x,y,z]);quiff.scale.set(1.4,.6,1);quiff.rotation.set(-.7,.2,.3);
  }
  // Light blue eyes under darker brows, so the face still reads from the yard.
  for(const x of [-.075,.075]){
    ellipsoid(person,[.036,.022,.011],[x,1.684,.161],'#f0e6d2');
    ellipsoid(person,[.014,.017,.008],[x+.003,1.684,.169],'#6b8ea3');
    ellipsoid(person,[.006,.009,.005],[x+.004,1.684,.175],'#1f2629');
    const brow=ellipsoid(person,[.052,.012,.015],[x,1.735,.156],'#74533a');brow.rotation.z=x<0?-.1:.1;
  }
  // Clear acrylic frames with a faint lens glint, temples running back over the ears.
  const glass=new THREE.MeshStandardMaterial({color:'#e8f2f2',transparent:true,opacity:.22,roughness:.15,metalness:.1});
  for(const side of [-1,1]){
    const center=side*.078,points=[];
    const corners=[[-.048,-.03],[.048,-.034],[.05,.036],[-.05,.036]];
    for(const[x,y]of corners)points.push([center+x,1.683+y,.186]);
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),true,'catmullrom',.25);
    mesh(person,new THREE.TubeGeometry(curve,24,.0095,6,true),frame,[0,0,0]);
    const lens=new THREE.Mesh(new THREE.CircleGeometry(1,12),glass);lens.scale.set(.049,.034,1);lens.position.set(center,1.685,.187);person.add(lens);
    rod(person,[side*.128,1.712,.178],[side*.185,1.698,-.04],.0085,frame);
  }
  rod(person,[-.03,1.702,.19],[.03,1.702,.19],.007,frame);
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
/*
                              ___
                             / _/
                    ____    / /
                 __/ __ \_____/|
                /_  /  \__   / |
              .-._\_/_____\_/_.-.
             ( (_) )       ( (_) )
              '---'         '---'

        883 cc. No particularly urgent destination.
*/

/** Detailed Iron 883, keeping the cabin module's existing factory name. */
export function createIron883(options = {}) {
  return createDetailedIron883({
    quality: 'high',
    finish: 'denim',
    optimize: true,
    mirrors: 'drop',

    // Explicit options passed by the scene override these defaults.
    ...options,
  });
}