import * as THREE from './vendor/three.module.min.js';
import {advanceKettleTimer,BOIL_SECONDS} from './kettle.mjs';

function model(parent){
  const group=new THREE.Group();parent.add(group);const materials=new Map();
  function mesh(geometry,color,x=0,y=0,z=0,p=group){
    if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.66,flatShading:true}));
    const m=new THREE.Mesh(geometry,materials.get(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;p.add(m);return m;
  }
  const pipe=(points,r,c,p=group)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),24,r,6,false),c,0,0,0,p);
  return {group,mesh,pipe};
}

export function createHearthKettle(cabin,onBoil=()=>{}){
  const {group,mesh,pipe}=model(cabin);group.name='The kettle is on';group.position.set(-1.97,.47,.95);group.rotation.y=Math.PI/2;
  // A swing arm holds the kettle over the open flames.
  pipe([[-.4,.13,.02],[-.4,.98,.02],[-.38,1.02,.02],[.06,1.02,.02]],.021,'#313a32');
  pipe([[.04,1.01,.02],[.04,.91,.02],[.07,.89,.02],[.10,.92,.02]],.011,'#72776a');
  const body=new THREE.Group();body.position.set(.08,.49,.13);group.add(body);
  const profile=[[0,0],[.13,0],[.185,.055],[.198,.145],[.16,.23],[.105,.26]].map(([x,y])=>new THREE.Vector2(x,y));
  mesh(new THREE.LatheGeometry(profile,16),'#587374',0,0,0,body);
  mesh(new THREE.CylinderGeometry(.145,.162,.025,16),'#334e4b',0,.013,0,body);
  const lid=new THREE.Group();lid.position.y=.27;body.add(lid);
  mesh(new THREE.CylinderGeometry(.095,.121,.025,16),'#afac87',0,0,0,lid);
  mesh(new THREE.CylinderGeometry(.027,.036,.04,8),'#55432f',0,.032,0,lid);
  pipe([[-.165,.16,0],[-.195,.27,0],[-.14,.39,0],[0,.43,0],[.14,.39,0],[.195,.27,0],[.165,.16,0]],.016,'#2e3d36',body);
  pipe([[-.12,.07,.04],[-.24,.12,.05],[-.29,.25,.07],[-.36,.28,.08]],.035,'#72908a',body);
  // The spout has an actual dark mouth, so it reads as a kettle from the room.
  const mouth=mesh(new THREE.CircleGeometry(.026,10),'#243831',-.362,.281,.08,body);mouth.rotation.y=-Math.PI/2;mouth.rotation.x=-.3;
  const steam=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshBasicMaterial({color:'#e1e9dd',transparent:true,opacity:.14,depthWrite:false}),18);
  steam.frustumCulled=false;group.add(steam);
  const droplets=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.012,0),new THREE.MeshStandardMaterial({color:'#aacccd',transparent:true,opacity:.7,roughness:.2}),24);
  droplets.frustumCulled=false;group.add(droplets);
  const puddle=mesh(new THREE.CylinderGeometry(.26,.26,.008,18),'#638e87',.08,.078,.31);puddle.material=new THREE.MeshStandardMaterial({color:'#789f96',transparent:true,opacity:.48,roughness:.18});
  const dummy=new THREE.Object3D();let elapsed=0,wasBoiling=false;
  return {animate(time,seconds,inside,reduced,visible=true,burning=false){
    elapsed=advanceKettleTimer(elapsed,seconds,{inside,visible});
    const boiling=elapsed>=BOIL_SECONDS&&!burning,amount=Math.min(1,Math.max(0,elapsed-BOIL_SECONDS)/3);
    if(boiling!==wasBoiling){wasBoiling=boiling;onBoil(boiling);}
    steam.visible=!burning;droplets.visible=boiling;puddle.visible=boiling;
    puddle.scale.set(.55+amount*.9,1,.7+amount*.9);
    lid.position.y=.27+(boiling?(reduced?.025:Math.abs(Math.sin(time*.049))*.043):0);
    lid.rotation.z=boiling&&!reduced?Math.sin(time*.063)*.12:0;
    for(let i=0;i<18;i++){
      const phase=reduced?i/18:((time*(boiling?.0008:.00019)+i/18)%1);
      const spread=boiling?.26:.08;
      dummy.position.set(-.28+Math.sin(i*2.4+phase*3)*spread*phase,.80+phase*(boiling?.93:.36),.21+Math.cos(i*1.9)*spread*phase);
      dummy.scale.setScalar((boiling?.025:.012)+Math.sin(phase*Math.PI)*(boiling?.10:.035));dummy.updateMatrix();steam.setMatrixAt(i,dummy.matrix);
    }
    steam.instanceMatrix.needsUpdate=true;
    if(boiling)for(let i=0;i<24;i++){
      const phase=reduced?i/24:(time*.0016+i/24)%1,a=i*2.4;
      dummy.position.set(.08+Math.cos(a)*(.08+phase*.18),.77+Math.sin(phase*Math.PI)*.12-phase*.69,.13+Math.sin(a)*(.08+phase*.23));
      dummy.scale.set(1,1.5,1);dummy.updateMatrix();droplets.setMatrixAt(i,dummy.matrix);
    }
    droplets.instanceMatrix.needsUpdate=true;
  }};
}

export function createBlueJay(scene){
  const branch=model(scene);branch.group.name='Blue jay pine branch';branch.group.position.set(5.9,1.08,1);
  branch.pipe([[0,0,0],[-.08,.18,.38],[-.25,.40,.85],[-.45,.52,1.3],[-.68,.58,1.5]],.041,'#69523a');
  branch.pipe([[-.25,.40,.85],[-.04,.56,1.18],[.05,.60,1.35]],.018,'#795b3d');
  const {group,mesh,pipe}=model(scene);group.name='Blue jay';group.position.set(5.45,1.60,2.3);group.rotation.y=-.65;
  const oval=(x,y,z,sx,sy,sz,color,parent=group)=>{const m=mesh(new THREE.SphereGeometry(1,10,7),color,x,y,z,parent);m.scale.set(sx,sy,sz);return m;};
  for(const x of [-.065,.065]){
    pipe([[x,.025,0],[x,.14,-.02]],.012,'#34414a');
    for(const dx of [-.03,0,.03])pipe([[x,.025,0],[x+dx,.012,.07]],.007,'#34414a');
  }
  oval(0,.25,0,.135,.19,.19,'#6594c0');oval(0,.225,.118,.11,.14,.095,'#e4e7d7');
  const head=new THREE.Group();head.position.set(0,.425,.08);group.add(head);
  oval(0,0,0,.125,.115,.13,'#599ed2',head);oval(0,-.032,.087,.105,.075,.06,'#eef0dc',head);
  // A pointed blue crest, pale cheeks, black collar and fine dark bill.
  const crest=mesh(new THREE.ConeGeometry(.085,.19,4),'#4f91c4',0,.115,-.045,head);crest.rotation.x=-.3;
  for(const side of [-1,1]){
    oval(side*.091,-.056,.04,.028,.045,.075,'#253b50',head);
    oval(side*.099,.012,.072,.019,.022,.018,'#152d3e',head);oval(side*.11,.019,.079,.005,.006,.005,'#f8f3d8',head);
    const wing=oval(side*.121,.26,-.042,.045,.145,.153,'#3c7cb2');wing.rotation.x=-.28;
    for(let i=0;i<4;i++){
      const stripe=mesh(new THREE.BoxGeometry(.012,.017,.145-i*.014),i%2?'#d0e0e3':'#213d56',side*.162,.31-i*.038,-.025-i*.02);stripe.rotation.x=-.25;
    }
  }
  const bill=mesh(new THREE.ConeGeometry(.026,.11,4),'#263e4e',0,-.012,.16,head);bill.rotation.x=Math.PI/2;
  const tail=new THREE.Group();tail.position.set(0,.21,-.135);tail.rotation.x=.5;group.add(tail);
  for(let i=-1;i<=1;i++){
    oval(i*.035,-.04,-.14,.031,.029,.20,i===0?'#387dac':'#5c9ec8',tail);
    for(let j=0;j<4;j++)mesh(new THREE.BoxGeometry(.054,.008,.018),j===3?'#d3e3e6':'#233f59',i*.035,-.009,-.08-j*.069,tail);
  }
  return {animate(time,reduced){
    head.rotation.y=reduced?-.1:Math.sin(time*.0007)*.25;
    tail.rotation.x=.5+(reduced?0:Math.sin(time*.002)*.035);
  }};
}
