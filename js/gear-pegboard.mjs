import * as THREE from './vendor/three.module.min.js';
import {createClimbingRope} from './gear-rope.mjs';
import {createClimbingHarness} from './gear-harness.mjs';
import {createQuickdrawRack,createCarabiner,createCarabinerStack} from './gear-carabiners.mjs';
import {createGrigri} from './gear-grigri.mjs';
import {createATC} from './gear-atc.mjs';
import {createClimbingShoes} from './gear-shoes.mjs';
import {createIceAxe} from './gear-ice-axe.mjs';
import {finishGearMaterials} from './gear-materials.mjs';

/** Everything hangs from its own peg, with space to take a piece off the board. */
export function createPegboard(){
  const board=new THREE.Group();board.name='Climbing gear pegboard';
  const material=(color,roughness=.85,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const wood=material('#997c55'),edge=material('#6c5236'),steel=material('#a1aaa5',.36,.7),paper=material('#d6c49f');
  const add=(geometry,mat,name,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.position.set(x,y,z);board.add(mesh);return mesh;};
  const box=(w,h,d,x,y,z,mat,name)=>add(new THREE.BoxGeometry(w,h,d),mat,name,x,y,z);
  function tube(points,r,mat,name,steps=20){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),steps,r,7,false),mat,name);}
  // Pressed hardboard fibres; small variation keeps the plywood from looking painted.
  const data=new Uint8Array(256*256*4);let seed=1927;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=.94+(seed/4294967296)*.12+.013*Math.sin(x*.7+y*.08);
    for(let c=0;c<3;c++)data[(y*256+x)*4+c]=Math.min(255,[173,143,99][c]*n);data[(y*256+x)*4+3]=255;
  }
  const grain=new THREE.DataTexture(data,256,256);grain.colorSpace=THREE.SRGBColorSpace;grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(3,3);grain.needsUpdate=true;
  wood.map=grain;wood.color.set('#ffffff');
  box(1.53,1.43,.035,0,0,0,wood,'Pressed hardboard panel');
  for(const x of [-.783,.783])box(.035,1.50,.060,x,0,-.003,edge,'Slim timber side batten');
  for(const y of [-.735,.735])box(1.60,.035,.060,0,y,-.003,edge,'Slim timber edge batten');
  const holes=new THREE.InstancedMesh(new THREE.CircleGeometry(.0042,8),new THREE.MeshBasicMaterial({color:'#43382b'}),37*34);
  const bevels=new THREE.InstancedMesh(new THREE.RingGeometry(.0042,.0052,8),material('#b89a6b'),37*34),matrix=new THREE.Matrix4();
  let index=0;for(let x=0;x<37;x++)for(let y=0;y<34;y++){
    matrix.makeTranslation(-.72+x*.04,-.66+y*.04,.0176);holes.setMatrixAt(index,matrix);matrix.elements[14]=.0177;bevels.setMatrixAt(index++,matrix);
  }
  holes.name='Recessed peg holes';bevels.name='Worn peg hole rims';board.add(holes,bevels);
  for(const x of [-.731,.731])for(const y of [-.68,.68]){
    const screw=add(new THREE.CylinderGeometry(.005,.005,.003,12),steel,'Panel mounting screw',x,y,.020);screw.rotation.x=Math.PI/2;
    box(.006,.001,.001,x,y,.022,edge,'Screw slot');
  }
  function hook(x,y,reach=.09){
    box(.015,.034,.004,x,y+.005,.023,steel,'Peg mounting plate');
    tube([[x,y+.012,.022],[x,y,.034],[x,y,reach-.013],[x,y+.006,reach],[x,y+.019,reach+.002]],.0028,steel,'Bent steel gear peg');
    add(new THREE.SphereGeometry(.003,7,5),steel,'Rounded peg tip',x,y+.019,reach+.002);
  }
  const place=(object,x,y,z,rotation=0)=>{object.position.set(x,y,z);object.rotation.z=rotation;board.add(object);return object;};
  // Two full hanks, with their folded crowns resting on the projecting pegs.
  for(const [x,y,colorway,angle]of [[-.53,.58,'rust',-.012],[-.22,.49,'teal',.012]]){
    hook(x,y-.01,.10);
    const rope=place(createClimbingRope({colorway}),x,y,.030,angle);
    rope.scale.z=.75;
  }
  // Six quickdraws share three pegs in groups of one, two and three.
  const draws=place(createQuickdrawRack(),.27,.56,.035);
  for(const p of draws.userData.hangingPoints)hook(.27+p[0],.56+p[1],.13);
  hook(.17,-.10,.092);place(createClimbingHarness(),.17,-.082,.076,.025);
  hook(-.52,-.23,.095);place(createClimbingShoes(),-.52,-.236,.034,-.035);
  // Five locking carabiners sit in depth on each peg, with the sleeves exposed.
  for(const [x,y,color]of [[.11,.15,'#677b86'],[.25,.14,'#7c8d92'],[.39,.15,'#67777b']]){
    hook(x,y,.12);place(createCarabinerStack({count:5,color}),x,y,.028);
  }
  // The GriGri hangs by its attachment eye from a locker, body below the eye.
  hook(.61,.284,.105);place(createCarabiner({locking:true,color:'#798f96'}),.61,.232,.110,.08);
  const grigri=place(createGrigri(),.62,.143,.103,Math.PI+.10);grigri.rotation.y=-.16;
  // The ATC's keeper can be draped over its own peg; its actual eye stays visible.
  hook(-.01,.26,.11);const atc=place(createATC(),0,0,0,Math.PI-.12);atc.rotation.x=.28;atc.rotation.y=-.25;
  const keeper=new THREE.Vector3(...(atc.userData.hangingPoint||[0,-.085,.004])).applyEuler(atc.rotation);atc.position.copy(new THREE.Vector3(-.01,.26,.11).sub(keeper));
  // A chalk bag and the brush occupy the gap beneath the rope.
  hook(-.23,-.24,.075);
  const bag=new THREE.Group();bag.name='Soft chalk bag';place(bag,-.23,-.41,.095,.04);
  const cloth=material('#635964',.99),lining=material('#282e30',1);
  const profile=[[0,-.079],[.031,-.079],[.044,-.070],[.050,-.030],[.052,.033],[.055,.055],[.044,.055],[.043,-.055],[0,-.060]].map(p=>new THREE.Vector2(...p));
  const pouch=new THREE.Mesh(new THREE.LatheGeometry(profile,24),cloth);pouch.scale.z=.8;bag.add(pouch);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.049,.007,6,28),lining);rim.rotation.x=Math.PI/2;rim.position.y=.055;rim.scale.y=.8;bag.add(rim);
  tube([[-.256,-.36,.087],[-.25,-.275,.073],[-.23,-.238,.081],[-.21,-.274,.086],[-.202,-.366,.090]],.0033,lining,'Chalk bag hanging strap');
  const string=material('#c7b99a');tube([[-.18,-.365,.12],[-.169,-.397,.131],[-.18,-.42,.132]],.0015,string,'Chalk bag drawcord');
  hook(-.12,-.24,.07);
  const brush=new THREE.Group();brush.name='Dark walnut climbing brush';place(brush,-.12,-.244,.080,-.1);
  const handleShape=new THREE.Shape();handleShape.moveTo(-.007,0);handleShape.quadraticCurveTo(-.011,.012,0,.014);handleShape.quadraticCurveTo(.011,.012,.007,0);handleShape.lineTo(.004,-.105);handleShape.lineTo(.014,-.127);handleShape.lineTo(.014,-.174);handleShape.quadraticCurveTo(0,-.188,-.014,-.174);handleShape.lineTo(-.014,-.127);handleShape.lineTo(-.004,-.105);handleShape.closePath();
  const hole=new THREE.Path();hole.absellipse(0,.005,.003,.003,0,Math.PI*2,true);handleShape.holes.push(hole);
  const brushBody=new THREE.Mesh(new THREE.ExtrudeGeometry(handleShape,{depth:.006,bevelEnabled:true,bevelSize:.001,bevelThickness:.001,bevelSegments:2,curveSegments:8}),material('#493023'));brush.add(brushBody);
  const bristles=new THREE.InstancedMesh(new THREE.CylinderGeometry(.0008,.001,.013,5),material('#c9b78f'),60),rotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0));
  index=0;for(let x=0;x<5;x++)for(let y=0;y<12;y++){matrix.compose(new THREE.Vector3(-.009+x*.0045,-.126-y*.0042,.013),rotation,new THREE.Vector3(1,1,.9+(y%3)*.1));bristles.setMatrixAt(index++,matrix);}brush.add(bristles);
  // The alpine axe hangs upright by its head alongside the harness.
  place(createIceAxe(),.54,-.055,.042);
  hook(.563,-.052,.081);
  // Keep the familiar packing note and its existing in-world click area.
  box(.23,.26,.006,.60,.53,.13,paper,'Folded packing note');box(.055,.027,.004,.60,.665,.135,material('#a59772'),'Paper tape');
  for(let i=0;i<4;i++)box(.14-i*.012,.0028,.001,.59,.60-i*.044,.134,material('#81765b'),'Pencil line on note');
  return finishGearMaterials(board);
}
