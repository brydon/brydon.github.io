import * as THREE from './vendor/three.module.min.js';
import {advanceEntrance} from './entrance.mjs';
import {createDog,createIron883,createBrydon,createHelmet} from './cabin-models.mjs';
import {furnishCabin} from './cabin-interior.mjs';
import {createCabinEffects} from './cabin-effects.mjs';
import {createWalk,advanceWalk,travelHeading} from './walk.mjs';
import {createGearWall} from './cabin-gear.mjs';
import {createCoffeeStation} from './cabin-coffee.mjs';
import {createHearthKettle,createBlueJay} from './cabin-life.mjs';
import {drawResearchBoard} from './chalkboard.mjs';
import {CSS3DObject,CSS3DRenderer} from './vendor/CSS3DRenderer.js';

const ease = t => t*t*(3-2*t);
const mix = (a,b,t) => a+(b-a)*t;

/** One small scene, with an authored entrance instead of a movement controller. */
export async function createCabinScene(canvas, {reducedMotion, onEnter, onExit, onError, onComputer, onKettle, onCoffee}) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias:false, alpha:true, powerPreference:'low-power'});
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const htmlScene=new THREE.Scene();
  const htmlRenderer=new CSS3DRenderer();
  htmlRenderer.domElement.className='computer-layer';
  Object.assign(htmlRenderer.domElement.style,{position:'absolute',inset:'0',pointerEvents:'none',zIndex:'0'});
  canvas.parentElement.prepend(htmlRenderer.domElement);
  canvas.style.pointerEvents='none';canvas.style.zIndex='1';
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#203a3c', 23, 55);
  const camera = new THREE.PerspectiveCamera(42, 1, .07, 100);
  const target = new THREE.Vector3(0,1.6,0);
  const look = new THREE.Vector3();
  const materials = new Map();
  function material(color, emissive=false) {
    const key=color+emissive;
    if(!materials.has(key)) materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.9,flatShading:true,...(emissive?{emissive:color,emissiveIntensity:.35}:{})}));
    return materials.get(key);
  }
  function mesh(geometry,color,parent=scene,emissive=false) {
    const object=new THREE.Mesh(geometry,material(color,emissive));
    object.castShadow=!emissive;object.receiveShadow=true;parent.add(object);return object;
  }
  function box(w,h,d,x,y,z,color,parent=scene,emissive=false) {
    const object=mesh(new THREE.BoxGeometry(w,h,d),color,parent,emissive);
    object.position.set(x,y,z);return object;
  }
  function cylinder(top,bottom,height,x,y,z,color,parent=scene,sides=8) {
    const object=mesh(new THREE.CylinderGeometry(top,bottom,height,sides),color,parent);
    object.position.set(x,y,z);return object;
  }
  const hemisphere=new THREE.HemisphereLight('#b8d5e1','#67502d',2.4);scene.add(hemisphere);
  const sun=new THREE.DirectionalLight('#ffd59e',3.4);sun.position.set(-7,12,9);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.normalBias=.05;scene.add(sun);
  const fill=new THREE.DirectionalLight('#7fafbc',1.1);fill.position.set(7,6,-8);scene.add(fill);

  // A faceted slice of the forest floor, with a stone path to the front steps.
  const island=cylinder(7.6,6.4,1.15,0,-.62,0,'#414c3b',scene,13);
  island.rotation.y=.17;
  const top=cylinder(7.6,7.6,.16,0,-.06,0,'#6f7951',scene,13);top.rotation.y=.17;
  const dirt=mesh(new THREE.CircleGeometry(2.25,14),'#968462');dirt.rotation.x=-Math.PI/2;dirt.position.set(-3.4,.035,3.05);dirt.scale.set(1.18,.88,1);
  const path=new THREE.CatmullRomCurve3([new THREE.Vector3(1.0,.04,7),new THREE.Vector3(2.1,.04,5.1),new THREE.Vector3(.6,.04,3.7)]);
  for(let i=0;i<16;i++) {const p=path.getPoint(i/15);const stone=box(.75,.055,.34,p.x,p.y,p.z,i%3?'#a79c7c':'#bab092');stone.rotation.y=Math.sin(i*2.1)*.3;}
  let seed=873;
  function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  for(let i=0;i<75;i++){
    const a=random()*Math.PI*2,r=4.3+random()*2.9,x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(z>3&&x>-.3&&x<3)continue;
    const stone=mesh(new THREE.DodecahedronGeometry(.08+random()*.22,0),i%3?'#889178':'#aaa388');stone.position.set(x,.08,z);stone.scale.y=.6;
  }
  function pine(x,z,height){
    const group=new THREE.Group();scene.add(group);group.position.set(x,0,z);
    cylinder(.13,.22,height*.73,0,height*.32,0,'#534631',group,6);
    for(let i=0;i<4;i++){const h=height*(.44-i*.035);const cone=mesh(new THREE.ConeGeometry(height*(.28-i*.055),h,6),['#244c3d','#2e5d45','#396b4b','#4b7950'][i],group);cone.position.y=height*(.32+i*.185);cone.rotation.y=i*.45;}
  }
  [[-5,-2,6.8],[-4.5,-4.8,5.9],[-2.8,-5.9,6.2],[.5,-6.1,5.7],[3.8,-5.5,6.9],[5.5,-3.2,5.7],[6.3,-.6,4.1],[-6.4,.9,4.1],[-6,3.9,2.6],[5.9,1,2.8]].forEach(p=>pine(...p));
  // Distant low-poly ridgelines retain the valley without another navigable world.
  for(let i=0;i<7;i++){
    const h=7+(i%3)*2.1,x=(i-3)*5.2,z=-18-(i%2)*4;
    const mountain=mesh(new THREE.ConeGeometry(5.5,h,5),['#3a5860','#486970','#56787c'][i%3]);mountain.position.set(x,h/2-1,z);mountain.rotation.y=i*.5;mountain.castShadow=false;
    const snow=mesh(new THREE.ConeGeometry(1.43,h*.246,5),'#bac5b6');snow.position.set(x,h-1-h*.123,z);snow.rotation.y=i*.5;snow.castShadow=false;
  }

  const cabin=new THREE.Group();scene.add(cabin);
  box(5,.35,4.5,0,.15,0,'#706958',cabin);
  box(4.6,.13,4.1,0,.36,0,'#a27443',cabin);
  const woods=['#875830','#926237','#9b6b3d','#86552f'];
  for(let i=0;i<13;i++){
    const y=.48+i*.21;
    box(4.8,.2,.18,0,y,-2,woods[i%4],cabin).userData.burnWall=true;
    box(.18,.2,4.25,-2.34,y,0,woods[(i+1)%4],cabin).userData.burnWall=true;
    if(y>1.42&&y<2.9){
      box(.18,.2,.525,2.34,y,-1.8625,woods[(i+2)%4],cabin).userData.burnWall=true;
      box(.18,.2,2.225,2.34,y,1.0125,woods[(i+2)%4],cabin).userData.burnWall=true;
    }else box(.18,.2,4.25,2.34,y,0,woods[(i+2)%4],cabin).userData.burnWall=true;
    // A real opening for the door, so the entrance passes through the facade.
    box(2.26,.2,.18,-1.3,y,2.02,woods[i%4],cabin).userData.burnWall=true;
    box(1.32,.2,.18,1.75,y,2.02,woods[(i+1)%4],cabin).userData.burnWall=true;
    if(y>2.57)box(1.22,.2,.18,.45,y,2.02,woods[i%4],cabin);
  }
  for(const x of [-2.36,2.36])for(const z of [-2.06,2.09])box(.23,2.83,.25,x,1.67,z,'#5b4129',cabin);
  // Pitched roof and individually stepped shingle strips.
  const rise=1.7,half=2.8,angle=Math.atan2(rise,half),slope=Math.hypot(rise,half);
  for(const side of [-1,1]){
    const roof=box(slope,.18,5,side*half/2,3.18+rise/2,0,'#283e3c',cabin);roof.rotation.z=-side*angle;
    roof.userData.burnRoof=true;
    for(let row=0;row<8;row++)for(let tile=0;tile<8;tile++){
      const along=(row+.5)/8,shingle=box(slope/8+.035,.075,.63,side*half*along,4.88-rise*along+.13,-2.18+tile*.625,['#354c49','#3e5651','#304541'][(row+tile)%3],cabin);
      shingle.rotation.z=-side*angle;
      shingle.userData.burnRoof=true;
    }
  }
  box(.2,.18,5.15,0,4.99,0,'#56706a',cabin).userData.burnRoof=true;
  function gable(z){const shape=new THREE.Shape();shape.moveTo(-2.35,3.02);shape.lineTo(0,4.6);shape.lineTo(2.35,3.02);shape.closePath();const m=mesh(new THREE.ShapeGeometry(shape),'#7b512e',cabin);m.position.z=z;m.material=new THREE.MeshStandardMaterial({color:'#7b512e',side:THREE.DoubleSide,roughness:1});}
  gable(2.05);gable(-2.07);
  for(const side of [-1,1]){const beam=box(2.9,.15,.2,side*1.15,3.83,2.22,'#bb8a4c',cabin);beam.rotation.z=-side*angle;}
  box(.22,1.6,.17,0,3.84,2.18,'#61442d',cabin);
  // Porch, stairs, and handrails.
  for(let i=0;i<13;i++)box(.38,.13,1.5,-2.28+i*.38,.37,2.78,i%2?'#a97d48':'#b38750',cabin);
  for(let i=0;i<3;i++)box(1.6,.13,.43,.48,.06+i*.1,4.0-i*.36,'#947a52',cabin);
  for(const x of [-2.3,2.3]){box(.14,1.1,.14,x,.87,3.37,'#d4ad73',cabin);box(.14,1.1,.14,x,.87,2.26,'#d4ad73',cabin);box(.16,.13,1.35,x,1.36,2.8,'#c09a64',cabin);}
  // A Muskoka chair: broad arms, a sloped seat, and a fan of tall back slats.
  const muskoka=new THREE.Group();muskoka.position.set(-1.39,.43,2.78);muskoka.rotation.y=.1;cabin.add(muskoka);
  for(let i=0;i<6;i++)box(.74,.055,.085,0,.4-i*.013,.26-i*.095,'#b9915b',muskoka);
  for(const x of [-.3,.3]){const rail=box(.07,.08,.88,x,.31,0,'#8a6942',muskoka);rail.rotation.x=-.12;box(.08,.62,.09,x,.29,.29,'#a37d4d',muskoka);const rear=box(.08,.58,.09,x,.23,-.29,'#8a6942',muskoka);rear.rotation.x=-.37;}
  for(let i=0;i<7;i++){const x=(i-3)*.108,h=.7-Math.abs(i-3)*.045,slat=box(.092,h,.055,x,.72+h*.11,-.35,'#bd965f',muskoka);slat.rotation.x=-.24;slat.rotation.z=-(i-3)*.045;}
  for(const x of [-.46,.46]){box(.22,.065,.86,x,.67,.015,'#ca9e62',muskoka);box(.055,.34,.06,x,.49,.3,'#9c7544',muskoka);}
  cylinder(.068,.06,.15,-.46,.78,.2,'#e0ceb0',muskoka,10);cylinder(.056,.056,.009,-.46,.859,.2,'#4a3022',muskoka,10);
  const coffeeHandle=mesh(new THREE.TorusGeometry(.044,.012,5,10),'#e0ceb0',muskoka);coffeeHandle.position.set(-.537,.79,.2);
  // Front and side windows: warm panes, dark mullions, deep timber trim.
  function frontWindow(x,y,z,w=1.25,h=1){
    box(w+.18,h+.18,.1,x,y,z,'#4d3926',cabin);
    box(w,h,.06,x,y,z+.065,'#f7ba62',cabin,true);
    box(.06,h,.06,x,y,z+.11,'#634627',cabin);box(w,.06,.06,x,y,z+.11,'#634627',cabin);
    box(w+.3,.12,.24,x,y-h/2-.09,z+.09,'#c6985c',cabin);
  }
  frontWindow(-1.36,1.85,2.15,1.2,1.02);
  frontWindow(1.73,1.92,2.15,.58,.85);
  // A real opening in the right wall, looking out into the night sky.
  const sideWindow=new THREE.Group();cabin.add(sideWindow);sideWindow.position.set(2.32,2.16,-.85);sideWindow.rotation.y=-Math.PI/2;
  for(const x of [-.795,.795])box(.10,1.50,.19,x,0,0,'#664c33',sideWindow);
  for(const y of [-.705,.705])box(1.69,.10,.19,0,y,0,'#a7814d',sideWindow);
  box(.052,1.33,.10,0,0,.07,'#78623f',sideWindow);box(1.5,.046,.10,0,-.02,.07,'#78623f',sideWindow);box(1.83,.095,.33,0,-.77,.1,'#bd965f',sideWindow);
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.3),new THREE.MeshBasicMaterial({color:'#93b6c0',transparent:true,opacity:.08,side:THREE.DoubleSide,depthWrite:false}));sideWindow.add(glass);
  // Put the sky beyond the ridgeline, with enough elevation to clear its peaks.
  // Scaling both distance and geometry keeps the moon's apparent size familiar.
  const windowNight=new THREE.Group();windowNight.name='Distant night sky';windowNight.scale.setScalar(3);windowNight.position.y=2;scene.add(windowNight);
  const windowMoon=new THREE.Mesh(new THREE.SphereGeometry(.72,16,12),new THREE.MeshBasicMaterial({color:'#ece8ca',toneMapped:false,fog:false}));windowMoon.position.set(13.5,3,-16.6);windowNight.add(windowMoon);
  for(let i=0;i<32;i++){
    const star=new THREE.Mesh(new THREE.IcosahedronGeometry(.025,0),new THREE.MeshBasicMaterial({color:'#dae6d7',toneMapped:false,fog:false}));star.position.set(10+Math.sin(i*18.2)*6,4+(Math.cos(i*13)*.5+.5)*8,-20+Math.sin(i*3.7)*2);windowNight.add(star);
  }
  // Hinged door and welcoming lamp.
  const door=new THREE.Group();door.position.set(-.13,.42,2.14);cabin.add(door);
  box(1.16,2.12,.1,.58,1.06,0,'#355853',door);
  for(let i=0;i<5;i++)box(.012,2.06,.01,.17+i*.2,1.06,.056,'#233d37',door);
  box(.43,.56,.02,.58,1.47,.06,'#dca952',door,true);
  cylinder(.05,.05,.055,1,1,.11,'#dbb576',door,8).rotation.x=Math.PI/2;
  box(.1,2.3,.16,-.19,1.48,2.17,'#d0a065',cabin);box(.1,2.3,.16,1.09,1.48,2.17,'#d0a065',cabin);box(1.38,.13,.17,.45,2.62,2.17,'#d0a065',cabin);
  box(.2,.29,.18,1.12,2.92,2.25,'#ffd28a',cabin,true);box(.3,.06,.3,1.12,3.1,2.25,'#333d30',cabin);
  const porchLight=new THREE.PointLight('#ffc276',18,7,2);porchLight.position.set(.4,2.6,2.8);scene.add(porchLight);
  // Chimney stones.
  for(let i=0;i<8;i++)for(let j=0;j<2;j++)box(.38,.23,.68,-2.3+j*.4,3.4+i*.23,.95,i%2?'#8c8b77':'#a4a28a',cabin);
  box(.94,.15,.9,-2.1,5.2,.95,'#bbb7a0',cabin);

  // The working desk and physical monitor anchor the interior.
  box(4.35,.025,3.85,0,.445,0,'#b1814d',cabin);
  for(let i=0;i<11;i++)box(.012,.008,3.85,-2.1+i*.4,.463,0,'#86603c',cabin);
  box(2.05,.15,.9,.8,1.12,-1.2,'#a97841',cabin);
  for(const x of [-.08,1.67])for(const z of [-1.53,-.86])box(.1,.71,.1,x,.72,z,'#6f4b2d',cabin);
  box(.95,.65,.6,1.35,.76,-1.23,'#8b5d31',cabin);
  for(let i=0;i<2;i++){box(.78,.012,.02,1.35,.66+i*.26,-.916,'#563e27',cabin);box(.18,.04,.04,1.35,.77+i*.22,-.89,'#d6b680',cabin);}
  const monitorBody=box(1.36,.94,.2,.56,1.64,-1.4,'#253934',cabin);
  // Transparent WebGL cutout exposes the CSS3D iframe behind the scene. Geometry
  // in front still occludes it; DOM text and controls stay sharp and interactive.
  const monitor=new THREE.Mesh(new THREE.PlaneGeometry(1.16,.725),new THREE.MeshBasicMaterial({color:0,opacity:0,blending:THREE.NoBlending,side:THREE.DoubleSide}));
  monitor.position.set(.56,1.64,-1.291);scene.add(monitor);
  const screenElement=document.createElement('div');screenElement.className='computer-screen';
  const computerFrame=document.createElement('iframe');computerFrame.src='/desktop.html';computerFrame.title='Brydon’s website on the cabin computer';computerFrame.id='computer-frame';
  Object.assign(computerFrame.style,{width:'100%',height:'100%',border:'0',display:'block',background:'#142a23'});computerFrame.tabIndex=-1;screenElement.append(computerFrame);
  const htmlScreen=new CSS3DObject(screenElement);htmlScreen.position.copy(monitor.position);htmlScene.add(htmlScreen);
  let pendingPage='home';
  computerFrame.addEventListener('load',()=>computerFrame.contentWindow?.postMessage({source:'switchback-cabin',type:'page',value:pendingPage},location.origin));
  box(.3,.1,.27,.56,1.2,-1.26,'#354039',cabin);
  box(.79,.04,.28,.56,1.22,-.99,'#3d4940',cabin);
  for(let i=0;i<5;i++)box(.09,.016,.02,.28+i*.12,1.246,-.95,'#b7bba6',cabin);
  box(.42,.04,.5,1.37,1.225,-1.02,'#dfd0a3',cabin);
  box(.39,.01,.46,1.37,1.25,-1.02,'#f2e8cd',cabin);
  cylinder(.11,.1,.23,-.02,1.3,-1.03,'#d8c59e',cabin,10);
  const handle=mesh(new THREE.TorusGeometry(.08,.025,5,10),'#d8c59e',cabin);handle.position.set(-.14,1.33,-1.03);
  const interiorDetails=furnishCabin(cabin);
  const hearthKettle=createHearthKettle(cabin,onKettle);
  const blueJay=createBlueJay(scene);
  // Small interior window behind the desk.
  box(1.2,.9,.06,.95,2.27,-1.9,'#483f30',cabin);box(1.03,.74,.015,.95,2.27,-1.86,'#82b0ac',cabin,true);
  box(.05,.75,.02,.95,2.27,-1.84,'#514632',cabin);box(1.05,.05,.02,.95,2.27,-1.84,'#514632',cabin);

  // An after-hours wall: equations, books, climbing kit, and the coffee setup.
  const chalkCanvas=drawResearchBoard(),chalkTexture=new THREE.CanvasTexture(chalkCanvas);
  chalkTexture.colorSpace=THREE.SRGBColorSpace;chalkTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  box(1.38,1.13,.09,-.95,2.16,-1.77,'#a07c46',cabin);
  const chalkboard=box(1.22,.97,.015,-.95,2.16,-1.715,'#203932',cabin);chalkboard.material=new THREE.MeshBasicMaterial({map:chalkTexture,toneMapped:false});
  box(1.43,.09,.22,-.95,1.54,-1.66,'#87623c',cabin);box(.15,.03,.03,-.59,1.60,-1.56,'#dadcc3',cabin);
  // A printed bitmap on a solid plaque: its message has no HTML text layer.
  box(.67,.34,.035,-1.33,1.19,-1.82,'#725435',cabin);
  const serviceScan=new THREE.TextureLoader().load('/images/switchback/service-064.png');serviceScan.colorSpace=THREE.SRGBColorSpace;serviceScan.magFilter=THREE.NearestFilter;
  const serviceLabel=box(.63,.29,.008,-1.33,1.19,-1.798,'#ceb98d',cabin);serviceLabel.material=new THREE.MeshBasicMaterial({map:serviceScan,toneMapped:false});
  box(1.75,.09,.31,-1.22,2.91,-1.74,'#a0804b',cabin);
  for(let i=0;i<6;i++){const book=box(.14,.29+(i%3)*.035,.22,-1.84+i*.19,3.1,-1.74,['#41574e','#b77f40','#c1b389','#536575','#984f38'][i%5],cabin);book.rotation.z=(i%2)*.05;}
  const helmet=mesh(new THREE.SphereGeometry(.21,10,6,0,Math.PI*2,0,Math.PI*.65),'#50788a',cabin);helmet.position.set(-.64,3.08,-1.74);

  await createGearWall(cabin);
  box(.64,.09,1.05,1.94,1.05,.23,'#a5844c',cabin);box(.53,.62,.91,1.94,.7,.23,'#425a50',cabin);
  const coffeeStation=createCoffeeStation(cabin,onCoffee);
  // Canadian flag, made from a small double-sided mesh rather than text/emoji.
  cylinder(.025,.035,2.3,2.68,2.31,2.8,'#b8aa87',scene,6);
  const flag=new THREE.Group();flag.position.set(2.68,3.18,2.8);scene.add(flag);
  const flagMat=new THREE.MeshBasicMaterial({color:'#fff6df',side:THREE.DoubleSide});
  const field=new THREE.Mesh(new THREE.PlaneGeometry(1.02,.51),flagMat);field.position.x=.51;flag.add(field);
  for(const x of [.115,.905]){const stripe=new THREE.Mesh(new THREE.PlaneGeometry(.23,.51),new THREE.MeshBasicMaterial({color:'#c33b34',side:THREE.DoubleSide}));stripe.position.set(x,0,.006);flag.add(stripe);}
  const leaf=new THREE.Shape();const leafPoints=[[0,-.2],[.018,-.09],[.13,-.1],[.1,-.04],[.22,.055],[.14,.065],[.15,.15],[.08,.105],[.055,.205],[0,.15],[-.055,.205],[-.08,.105],[-.15,.15],[-.14,.065],[-.22,.055],[-.1,-.04],[-.13,-.1],[-.018,-.09]];
  leafPoints.forEach(([x,y],i)=>i?leaf.lineTo(x,y):leaf.moveTo(x,y));leaf.closePath();
  const maple=new THREE.Mesh(new THREE.ShapeGeometry(leaf),new THREE.MeshBasicMaterial({color:'#c33b34',side:THREE.DoubleSide}));maple.position.set(.51,-.01,.013);flag.add(maple);

  // Fire ring and a couple of seats outside.
  const fire=new THREE.Group();fire.position.set(-3.55,.1,3.45);scene.add(fire);
  for(let i=0;i<10;i++){const a=i*Math.PI/5;const rock=mesh(new THREE.DodecahedronGeometry(.23,0),'#85846d',fire);rock.position.set(Math.cos(a)*.64,.08,Math.sin(a)*.64);rock.scale.y=.6;}
  for(let i=0;i<3;i++){const log=cylinder(.1,.13,.9,0,.16,0,'#51402b',fire,6);log.rotation.z=Math.PI/2;log.rotation.y=i*Math.PI/3;}
  const flames=[];for(let i=0;i<5;i++){const f=mesh(new THREE.ConeGeometry(.16+i*.018,.65+i*.05,5),i%2?'#ffc260':'#e87932',fire,true);f.position.set(Math.sin(i*3)*.2,.5,Math.cos(i*3)*.19);flames.push(f);}
  const fireLight=new THREE.PointLight('#ffad50',15,7,2);fireLight.position.set(-3.55,1,3.45);scene.add(fireLight);
  for(const [x,z,a] of [[-5.1,2.5,-.5],[-3.7,5.2,.15]]){
    const logSeat=new THREE.Group();scene.add(logSeat);logSeat.position.set(x,.29,z);logSeat.rotation.y=a;
    cylinder(.25,.27,1.35,0,0,0,'#67513a',logSeat,10).rotation.z=Math.PI/2;
    for(const side of [-1,1]){
      cylinder(.229,.229,.015,side*.68,0,0,'#be9a64',logSeat,10).rotation.z=Math.PI/2;
      for(const radius of [.08,.15,.2]){const ring=mesh(new THREE.TorusGeometry(radius,.009,4,14),'#937344',logSeat);ring.position.x=side*.694;ring.rotation.y=Math.PI/2;}
    }
  }
  const smoke=[];for(let i=0;i<5;i++){const puff=mesh(new THREE.IcosahedronGeometry(.2+i*.06,0),'#adbaad');puff.material=new THREE.MeshBasicMaterial({color:'#adbaad',transparent:true,opacity:.13,depthWrite:false});puff.castShadow=false;smoke.push(puff);}
  // Every subject has volume: the reference art guides these low-poly models.
  const bike=createIron883();bike.position.set(3.65,.045,.8);bike.rotation.y=-Math.PI/2+.1;scene.add(bike);
  const dog=createDog();dog.position.set(.53,.52,-.05);dog.rotation.y=-.08;dog.scale.setScalar(.85);scene.add(dog);
  const worldEffects=createCabinEffects(scene,cabin,dog);
  const person=createBrydon();scene.add(person);person.position.set(1.5,.41,3.45);const arms=person.userData.arms;
  const porchHelmet=createHelmet();porchHelmet.position.set(1.7,.62,2.7);porchHelmet.rotation.y=.35;scene.add(porchHelmet);
  // Subtle ground-contact shadows supplement the models' cast shadows.
  for(const [x,z,sx,sz]of[[1.5,3.45,.38,.18],[3.65,.8,.4,1.5]]){const shadow=new THREE.Mesh(new THREE.CircleGeometry(1,16),new THREE.MeshBasicMaterial({color:'#1f3028',transparent:true,opacity:.28,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.scale.set(sx,sz,1);shadow.position.set(x,.045,z);scene.add(shadow);}

  let width=1,height=1,inside=false,progress=0,desired=0,angleStep=0,orbit=0,night=false,disposed=false,last=0;
  let focusProgress=0,focusDesired=0,panX=0,panY=0,targetPanX=0,targetPanY=0,computerNotified=false;const panKeys=new Set();
  let entryNotified=false;
  const resetFrameClock=()=>{last=0;};document.addEventListener('visibilitychange',resetFrameClock);
  let afterglow=false,revealing=false,brokenComputer=false;
  let journey=null,journeyCallback=null,avatarPosition=[1.5,.41,3.45],avatarHeading=0;
  function walkRoute(points,onArrive){journey=createWalk(avatarPosition,points,avatarHeading);journeyCallback=onArrive;panKeys.clear();}
  function approachDoor(onArrive){
    if(Math.hypot(avatarPosition[0]-1.5,avatarPosition[2]-3.45)<.1){onArrive();return;}
    walkRoute([[avatarPosition[0],.07,4.15],[.7,.07,4.15],[1.5,.41,3.45]],onArrive);
  }
  function resize(){
    const rect=canvas.parentElement.getBoundingClientRect();width=rect.width;height=rect.height;
    renderer.setSize(Math.max(1,Math.round(width*.82)),Math.max(1,Math.round(height*.82)),false);htmlRenderer.setSize(width,height);
    camera.aspect=width/height;camera.updateProjectionMatrix();
    const frameWidth=width<600?430:800;screenElement.style.width=frameWidth+'px';screenElement.style.height=frameWidth/1.6+'px';htmlScreen.scale.setScalar(1.16/frameWidth);
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas.parentElement);resize();
  function positionCamera(){
    const mobile=width<650,far=mobile?1.58:1;
    const base=new THREE.Vector3(10*far,(7.6+panY*2)*far,13.5*far).applyAxisAngle(new THREE.Vector3(0,1,0),orbit);
    const p=ease(progress),entry=THREE.MathUtils.smoothstep(p,.25,1);
    // First approach the door, then cross its threshold at eye level.
    const porch=new THREE.Vector3(.45,2.05,5.8),interior=new THREE.Vector3(.2+panX*.12,2.0+panY*.12,1.65);
    if(p<.48)camera.position.lerpVectors(base,porch,ease(p/.48));
    else camera.position.lerpVectors(porch,interior,ease((p-.48)/.52));
    target.set(mix(0,Math.sin(panX*Math.PI)*3.05,entry),mix(afterglow?3:1.65,1.55+panY*.95,entry),mix(0,1.65-Math.cos(panX*Math.PI)*3.05,entry));
    const focused=ease(focusProgress);camera.fov=mix(mix(afterglow?47:42,65,p),42,focused);
    const tangent=Math.tan(THREE.MathUtils.degToRad(42)/2);
    const fit=Math.max(.725/(2*tangent*.8),1.16/(2*tangent*camera.aspect*.9));
    camera.position.lerp(new THREE.Vector3(.56,1.64,-1.291+fit),focused);target.lerp(new THREE.Vector3(.56,1.64,-1.291),focused);
    camera.updateProjectionMatrix();camera.lookAt(target);
    htmlScreen.visible=progress>.66&&!brokenComputer;
    const ready=focusProgress===1&&!brokenComputer;
    htmlRenderer.domElement.classList.toggle('computer-input-ready',ready);
    screenElement.style.pointerEvents=ready?'auto':'none';computerFrame.style.pointerEvents=ready?'auto':'none';computerFrame.tabIndex=ready?0:-1;computerFrame.inert=!ready;
    if(ready){
      // Flatten only the settled, front-facing screen for reliable native iframe
      // hit testing. The same iframe stays mounted throughout the camera trip.
      camera.updateMatrixWorld();
      const corner=new THREE.Vector3(.56-.58,1.64+.3625,-1.291).project(camera);
      const right=new THREE.Vector3(.56+.58,1.64+.3625,-1.291).project(camera);
      htmlRenderer.domElement.style.setProperty('--screen-x',(corner.x*.5+.5)*width+'px');
      htmlRenderer.domElement.style.setProperty('--screen-y',(-corner.y*.5+.5)*height+'px');
      htmlRenderer.domElement.style.setProperty('--screen-scale',(right.x-corner.x)*.5*width/(width<600?430:800));
    }
    door.rotation.y=-Math.PI*.56*THREE.MathUtils.smoothstep(p,0,.32);
    const walk=THREE.MathUtils.smoothstep(p,.05,.58);
    if(progress>0){
      person.position.set(mix(1.5,.45,walk),.41+(walk<1&&!reducedMotion.matches?Math.sin(walk*38)*.025:0),mix(3.45,1.3,walk));
      person.rotation.y=desired===0?travelHeading([.45,.41,1.3],[1.5,.41,3.45]):travelHeading([1.5,.41,3.45],[.45,.41,1.3]);
      arms.forEach((arm,i)=>arm.rotation.x=walk>0&&walk<1?Math.sin(walk*38+i*Math.PI)*.3:0);
    }else{
      person.position.set(...avatarPosition);person.rotation.y=avatarHeading;
      if(journey?.phase==='walk'&&!reducedMotion.matches){person.position.y+=Math.sin(last*.014)*.022;arms.forEach((arm,i)=>arm.rotation.x=Math.sin(last*.01+i*Math.PI)*.28);}else arms.forEach(arm=>arm.rotation.x=0);
    }
    person.visible=progress<.67;bike.visible=progress<.83;
  }
  function animate(time){
    if(disposed)return;const elapsedSeconds=last?Math.max(0,(time-last)/1000):0,dt=Math.min(elapsedSeconds,.05);last=time;
    if(!document.hidden){
      progress=advanceEntrance(progress,desired,dt,reducedMotion.matches);
      if(journey){
        advanceWalk(journey,dt,reducedMotion.matches);avatarPosition=[...journey.position];avatarHeading=journey.heading;
        if(journey.done){journey=null;const arrived=journeyCallback;journeyCallback=null;arrived?.();}
      }
      if(!focusDesired){
        const horizontal=(panKeys.has('d')||panKeys.has('arrowright')?1:0)-(panKeys.has('a')||panKeys.has('arrowleft')?1:0);
        const vertical=(panKeys.has('w')||panKeys.has('arrowup')?1:0)-(panKeys.has('s')||panKeys.has('arrowdown')?1:0);
        if(inside){targetPanX=THREE.MathUtils.clamp(targetPanX+horizontal*dt*.44,-1,1);targetPanY=THREE.MathUtils.clamp(targetPanY+vertical*dt*.8,-.6,.7);}
        else if(desired===0){angleStep=THREE.MathUtils.clamp(angleStep+horizontal*dt*2.5,-4,4);targetPanY=THREE.MathUtils.clamp(targetPanY+vertical*dt*.7,-.5,.5);}
      }
      panX+=(targetPanX-panX)*(reducedMotion.matches?1:.09);panY+=(targetPanY-panY)*(reducedMotion.matches?1:.09);
      orbit+=(angleStep*.3-orbit)*(reducedMotion.matches?1:.055);
      if(progress===1)focusProgress=advanceEntrance(focusProgress,focusDesired,dt*2.2,reducedMotion.matches);
      if(revealing&&focusProgress===0){desired=0;revealing=false;}
      positionCamera();
      if(focusProgress===1&&!computerNotified){computerNotified=true;onComputer(true);}
      if(focusProgress===0&&computerNotified){computerNotified=false;onComputer(false);}
      if(progress===1&&!entryNotified){entryNotified=true;inside=true;onEnter();}
      if(progress===0&&entryNotified){entryNotified=false;inside=false;avatarPosition=[1.5,.41,3.45];avatarHeading=travelHeading([.45,.41,1.3],avatarPosition);onExit();}
      if(!reducedMotion.matches){
        interiorDetails.animate(time);
        flames.forEach((f,i)=>{f.scale.y=.75+Math.sin(time*.006+i*2)*.23;f.rotation.y=time*.0008+i;});
        fireLight.intensity=14+Math.sin(time*.006)*2+Math.sin(time*.019);
        flag.rotation.y=Math.sin(time*.0012)*.13-.2;
        smoke.forEach((p,i)=>{const phase=(time*.00016+i*.2)%1;p.position.set(-2.1+phase*.5,5.3+phase*2.3,.95+phase*.18);p.scale.setScalar(.6+phase*1.9);p.material.opacity=(1-phase)*.15;});
      }
      worldEffects.animate(time,reducedMotion.matches);
      hearthKettle.animate(time,elapsedSeconds,inside&&desired===1,reducedMotion.matches,true,brokenComputer);
      coffeeStation.animate(time,elapsedSeconds,reducedMotion.matches,brokenComputer);
      hearthKettle.fill(coffeeStation.phase==='filling'?coffeeStation.progress:null,coffeeStation.fillTarget());
      blueJay.animate(time,reducedMotion.matches);
      htmlRenderer.render(htmlScene,camera);renderer.render(scene,camera);
    }
    requestAnimationFrame(animate);
  }
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();onError();});
  positionCamera();requestAnimationFrame(animate);
  return {
    enter(){approachDoor(()=>{desired=1;targetPanX=0;targetPanY=0;});}, exit(){desired=0;focusDesired=0;focusProgress=0;computerNotified=false;panKeys.clear();},
    visit(place,onArrive){const via=[avatarPosition[0],.07,4.15];walkRoute(place==='bike'?[via,[3.15,.07,3.5],[3.23,.07,2.25]]:[via,[-2.7,.07,4.15]],onArrive);},
    evacuate(onArrive){walkRoute([[.55,.07,4.3],[.55,.07,5.05]],onArrive);},
    computer(page){if(page)pendingPage=page;approachDoor(()=>{desired=1;focusDesired=1;targetPanX=0;targetPanY=0;panKeys.clear();});if(page)computerFrame.contentWindow?.postMessage({source:'switchback-cabin',type:'page',value:page},location.origin);},
    room(){focusDesired=0;panKeys.clear();},
    key(key,down){down?panKeys.add(key):panKeys.delete(key);},
    clearKeys(){panKeys.clear();},
    turn(direction,axis='x'){if(focusDesired)return;if(inside){if(axis==='y')targetPanY=THREE.MathUtils.clamp(targetPanY+direction*.3,-.6,.7);else targetPanX=THREE.MathUtils.clamp(targetPanX+direction*.16,-1,1);}else if(desired===0)angleStep=THREE.MathUtils.clamp(angleStep+direction*.7,-4,4);},
    night(on){night=on;windowNight.visible=night;sun.intensity=night?(afterglow?.14:.5):3.4;hemisphere.intensity=night?(afterglow?.78:1.2):2.4;renderer.toneMappingExposure=night?1.1:1.35;worldEffects.night(on);},
    unlock(){afterglow=true;worldEffects.unlock();scene.fog.color.set('#172a39');},
    reveal(){focusDesired=0;revealing=true;targetPanX=0;targetPanY=.15;panKeys.clear();},
    pet(){worldEffects.pet();},
    takeKettleOff(){return hearthKettle.takeOff();},
    coffeeAction(object){
      if(brokenComputer)return false;
      if(object==='kettle'&&!hearthKettle.isOffHeat())return hearthKettle.takeOff();
      const accepted=coffeeStation.action(object,{offHeat:hearthKettle.isOffHeat()});
      if(accepted&&object==='kettle'){targetPanX=.32;targetPanY=-.3;panKeys.clear();}
      return accepted;
    },
    coffeeAreas(){return coffeeStation.hitAreas();},
    kettleArea(){return hearthKettle.hitArea();},
    kettleOffHeat(){return hearthKettle.isOffHeat();},
    chalkboardImage(){return chalkCanvas.toDataURL('image/png');},
    administrator(){worldEffects.administrator();},
    explode(){brokenComputer=true;monitor.visible=false;monitorBody.visible=false;focusDesired=0;revealing=true;targetPanX=0;targetPanY=0;worldEffects.explode();},
    project(x,y,z){look.set(x,y,z).project(camera);return{x:(look.x*.5+.5)*width,y:(-.5*look.y+.5)*height,visible:look.z>-1&&look.z<1};},
    dispose(){disposed=true;document.removeEventListener('visibilitychange',resetFrameClock);resizeObserver.disconnect();scene.traverse(o=>{o.geometry?.dispose();});for(const m of materials.values())m.dispose();renderer.dispose();htmlRenderer.domElement.remove();}
  };
}
