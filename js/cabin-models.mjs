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