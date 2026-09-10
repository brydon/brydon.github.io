import * as THREE from './vendor/three.module.min.js';

/** Blue GRIGRI study: formed side plates, steel cam, folded handle and real apertures. */
export function createGrigri(){
  const device=new THREE.Group();device.name='Blue GriGri with folded handle';
  const part=new THREE.Group();part.scale.setScalar(.001);device.add(part); // millimetres below
  const blue=new THREE.MeshStandardMaterial({color:'#0094bf',metalness:.64,roughness:.3});
  const edgeBlue=new THREE.MeshStandardMaterial({color:'#16718e',metalness:.7,roughness:.34});
  const steel=new THREE.MeshStandardMaterial({color:'#b7c1c4',metalness:.86,roughness:.32});
  const satin=new THREE.MeshStandardMaterial({color:'#879697',metalness:.74,roughness:.44});
  const black=new THREE.MeshStandardMaterial({color:'#252b2c',roughness:.8});
  const dark=new THREE.MeshStandardMaterial({color:'#30393c',metalness:.6,roughness:.48});
  const add=(geometry,material,name,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geometry,material);m.name=name;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;part.add(m);return m;};
  function plateShape(){
    const s=new THREE.Shape();s.moveTo(-21,-40);
    s.bezierCurveTo(-30,-28,-30,0,-22,23);s.bezierCurveTo(-17,38,-8,52,2,54);
    s.bezierCurveTo(13,58,21,38,27,24);s.bezierCurveTo(38,1,37,-22,31,-37);
    s.bezierCurveTo(27,-52,11,-57,-5,-53);s.bezierCurveTo(-15,-51,-20,-46,-21,-40);s.closePath();
    return s;
  }
  function eye(shape){const p=new THREE.Path();p.absellipse(10,-36,10,10.7,-.14,Math.PI*2-.14,true,.24);shape.holes.push(p);}
  function extrude(shape,depth,material,name,z,bevel=.6){return add(new THREE.ExtrudeGeometry(shape,{depth,steps:1,curveSegments:22,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3}),material,name,0,0,z);}
  const rear=plateShape();eye(rear);const back=extrude(rear,2.7,satin,'Forged steel rear plate',0,.9);back.scale.x=1.04;
  // The reinforced nylon lever folds around the back and follows the long spine.
  const handle=new THREE.Shape();handle.moveTo(-25,-40);handle.bezierCurveTo(-42,-40,-43,-17,-34,10);
  handle.bezierCurveTo(-27,33,-14,55,-4,59);handle.bezierCurveTo(2,62,11,63,12,57);
  handle.bezierCurveTo(0,56,-17,35,-25,10);handle.bezierCurveTo(-34,-13,-35,-32,-25,-34);handle.closePath();
  extrude(handle,8,black,'Folded black lowering handle',3,1.7);
  // Cam and rope-bearing surface sit between the two plates, visible through their windows.
  const bearing=add(new THREE.CylinderGeometry(19,19,12,40),steel,'Steel cam',-3,5,12);bearing.rotation.x=Math.PI/2;
  const pinBlock=add(new THREE.BoxGeometry(22,31,10),dark,'Internal cam carrier',3,-4,12);pinBlock.rotation.z=-.11;
  const ropeTrack=new THREE.CatmullRomCurve3([[-27,-39,12],[-31,-18,12],[-26,12,12],[-13,37,12],[-3,44,12]].map(p=>new THREE.Vector3(...p)));
  add(new THREE.TubeGeometry(ropeTrack,46,3.4,10,false),steel,'Rounded steel rope channel');
  const front=plateShape();eye(front);
  const window=new THREE.Path();window.moveTo(-16,8);window.bezierCurveTo(-9,11,-12,-1,-7,-5);window.bezierCurveTo(0,-10,-5,-18,-12,-17);window.bezierCurveTo(-21,-16,-21,-2,-16,8);front.holes.push(window);
  const camWindow=new THREE.Path();camWindow.moveTo(-3,9);camWindow.bezierCurveTo(3,12,9,7,10,0);camWindow.lineTo(10,-6);camWindow.bezierCurveTo(4,-4,0,-6,-3,-2);camWindow.closePath();front.holes.push(camWindow);
  extrude(front,2.5,blue,'Anodized blue moving side plate',22,.9);
  const curve=(points,r,material,name)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),40,r,8,false),material,name);
  // Rolled spine and formed reinforcing rib catch the light instead of being painted lines.
  curve([[-20,-38,24],[-24,-12,25],[-22,13,25],[-13,36,25],[-6,45,24]],1.75,blue,'Rolled plate spine');
  const rib=new THREE.Shape();rib.moveTo(12,-9);rib.bezierCurveTo(18,0,18,9,14,19);rib.lineTo(27,24);rib.bezierCurveTo(34,7,33,-2,29,-8);rib.closePath();
  extrude(rib,1.5,blue,'Raised channel reinforcement',24,.75);
  for(const [x,y,r,z]of [[2,41,6,25.5],[-4,6,5.3,26],[0,49,1.7,25.2]]){
    const cap=add(new THREE.CylinderGeometry(r,r,.95,40),r<2?edgeBlue:steel,'Flush pivot cap',x,y,z);cap.rotation.x=Math.PI/2;
    if(r>2){add(new THREE.TorusGeometry(r-.5,.13,5,40),satin,'Machined pivot rim',x,y,z+.52);}
  }
  const etch=new THREE.LineBasicMaterial({color:'#176884',transparent:true,opacity:.65});
  function engraving(points,name){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),etch);line.name=name;part.add(line);}
  const path=new THREE.CatmullRomCurve3([[5,30,25.46],[15,26,25.46],[23,14,25.46],[25,-4,25.46],[18,-18,25.46],[0,-23,25.46]].map(p=>new THREE.Vector3(...p)));
  engraving(path.getPoints(45).map(p=>p.toArray()),'Etched rope path');engraving([[2,-20,25.48],[0,-23,25.48],[4,-24,25.48]],'Rope direction arrow');
  // Small factory wordmark cut as fine strokes, keeping the model self-contained.
  const letters={G:[[1,.85],[.8,1],[.2,1],[0,.8],[0,.2],[.2,0],[1,0],[1,.5],[.55,.5]],R:[[0,0],[0,1],[.7,1],[1,.8],[1,.6],[.7,.5],[0,.5],[.55,.5],[1,0]],I:[[.5,0],[.5,1]]};
  [...'GRIGRI'].forEach((letter,i)=>engraving(letters[letter].map(([x,y])=>[12+i*2.65+x*1.8,-12+y*3.2,25.46]),'Engraved '+letter));
  return device;
}
