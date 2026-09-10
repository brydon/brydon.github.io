import * as THREE from './vendor/three.module.min.js';

// Rope channels open THROUGH THE TOP of this compact casting. Side cheeks
// have real windows; the guide eye and keeper are separate openings.
// Form reference: Black Diamond ATC-Guide, black, front three-quarter view.
export function createATC(){
  const device=new THREE.Group();device.name='Black guide-style tubular belay device';
  const casting=new THREE.Group();casting.name='Scalloped black aluminum casting';device.add(casting);
  const alloy=new THREE.MeshStandardMaterial({color:'#282e31',metalness:.75,roughness:.32});
  const edge=new THREE.MeshStandardMaterial({color:'#424a4d',metalness:.8,roughness:.3});
  const recess=new THREE.MeshStandardMaterial({color:'#101719',metalness:.58,roughness:.42});
  const cable=new THREE.MeshStandardMaterial({color:'#9ba4a3',metalness:.18,roughness:.41});
  const add=(geometry,material,name)=>{const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;casting.add(mesh);return mesh;};
  function rect(path,x,y,w,h,r){
    path.moveTo(x+r,y);path.lineTo(x+w-r,y);path.quadraticCurveTo(x+w,y,x+w,y+r);path.lineTo(x+w,y+h-r);path.quadraticCurveTo(x+w,y+h,x+w-r,y+h);path.lineTo(x+r,y+h);path.quadraticCurveTo(x,y+h,x,y+h-r);path.lineTo(x,y+r);path.quadraticCurveTo(x,y,x+r,y);path.closePath();return path;
  }
  function extrude(shape,depth,bevel=.0008){return new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:8});}
  const plan=new THREE.Shape();plan.moveTo(-.024,-.011);plan.quadraticCurveTo(-.024,-.020,-.014,-.023);plan.lineTo(.014,-.023);plan.quadraticCurveTo(.024,-.020,.024,-.011);plan.lineTo(.025,.024);plan.quadraticCurveTo(.024,.029,.018,.030);plan.lineTo(-.018,.030);plan.quadraticCurveTo(-.025,.029,-.025,.023);plan.closePath();
  for(const x of [-.0195,.004]){const hole=new THREE.Path();rect(hole,x,-.014,.0155,.038,.0065);plan.holes.push(hole);}
  function rimGeometry(top){
    const geometry=extrude(plan,top?.0022:.0017,top?.0011:.0006);geometry.rotateX(-Math.PI/2);
    const p=geometry.attributes.position;
    for(let i=0;i<p.count;i++){const z=p.getZ(i);p.setY(i,p.getY(i)+(top?.011-z*.20:-.012));if(!top)p.setX(i,p.getX(i)*.94);}
    p.needsUpdate=true;geometry.computeVertexNormals();return geometry;
  }
  add(rimGeometry(true),alloy,'Rounded top rims around open twin rope channels');
  add(rimGeometry(false),alloy,'Lower rims of open rope channels');
  // Side profile coordinates are fore-aft distance and height.
  const side=new THREE.Shape();side.moveTo(-.020,-.011);side.quadraticCurveTo(-.027,-.006,-.023,.009);side.quadraticCurveTo(-.016,.014,-.006,.014);side.lineTo(.019,.023);side.quadraticCurveTo(.030,.031,.031,.019);side.lineTo(.029,-.006);side.quadraticCurveTo(.026,-.013,.019,-.013);side.lineTo(-.011,-.013);side.closePath();
  const window=new THREE.Path();window.moveTo(-.013,-.004);window.quadraticCurveTo(-.019,.001,-.014,.005);window.lineTo(.016,.012);window.quadraticCurveTo(.023,.014,.022,.004);window.lineTo(.021,-.003);window.quadraticCurveTo(.014,-.008,.003,-.008);window.lineTo(-.013,-.004);window.closePath();side.holes.push(window);
  function sideGeometry(shape,depth){const g=extrude(shape,depth,.001);g.rotateY(Math.PI/2);return g;}
  for(const x of [-.025,.0216])add(sideGeometry(side,.0034),alloy,'Scalloped cheek with open side window').position.x=x;
  const divider=new THREE.Shape();divider.moveTo(-.023,-.011);divider.lineTo(-.023,.006);divider.quadraticCurveTo(-.019,.013,-.013,.013);divider.lineTo(.018,.023);divider.quadraticCurveTo(.027,.030,.030,.021);divider.lineTo(.029,-.012);divider.closePath();
  add(sideGeometry(divider,.0038),alloy,'Curved central rib separating the rope slots').position.x=-.0019;
  // End bridges connect the three rails into a single casting.
  for(const [z,y,h]of [[.019,-.003,.022],[-.027,.001,.029]]){
    const shape=rect(new THREE.Shape(),-.022,-h/2,.044,h,.006);
    const bridge=add(extrude(shape,.0025,.001),alloy,'Cast end bridge');bridge.position.set(0,y,z);
  }
  const horn=new THREE.Shape();horn.moveTo(-.010,.014);horn.lineTo(.023,.023);horn.quadraticCurveTo(.032,.034,.033,.021);horn.lineTo(.030,.014);horn.lineTo(-.010,.010);horn.closePath();
  for(const x of [-.022,-.003,.003,.022])add(sideGeometry(horn,.0016),alloy,'Raised friction horn along rope channel').position.x=x-.0008;
  // The forged guide eye extends from the nose and tilts out toward the viewer.
  const eye=new THREE.Shape();eye.moveTo(-.009,.004);eye.quadraticCurveTo(-.019,-.013,-.014,-.030);eye.quadraticCurveTo(-.009,-.044,.003,-.043);eye.quadraticCurveTo(.018,-.041,.018,-.026);eye.quadraticCurveTo(.018,-.008,.009,.004);eye.closePath();
  const eyeHole=new THREE.Path();eyeHole.moveTo(-.003,-.010);eyeHole.quadraticCurveTo(-.011,-.026,-.004,-.033);eyeHole.quadraticCurveTo(.004,-.038,.010,-.029);eyeHole.quadraticCurveTo(.013,-.018,.004,-.009);eyeHole.quadraticCurveTo(0,-.006,-.003,-.010);eyeHole.closePath();eye.holes.push(eyeHole);
  const guide=add(extrude(eye,.005,.0018),alloy,'Prominent open guide-mode attachment eye');guide.position.set(0,-.006,.020);guide.rotation.x=-.44;
  const release=rect(new THREE.Shape(),-.007,-.004,.014,.017,.005);
  const releaseHole=rect(new THREE.Path(),-.0028,.002,.0056,.006,.0027);release.holes.push(releaseHole);
  const releaseEye=add(extrude(release,.003,.0006),alloy,'Small auto-block release aperture');releaseEye.position.set(0,-.005,-.030);releaseEye.rotation.x=.45;
  const points=[[-.018,-.010,-.008],[-.021,-.035,-.014],[-.015,-.071,-.012],[0,-.083,-.008],[.016,-.069,-.010],[.021,-.034,-.011],[.018,-.010,-.008]].map(p=>new THREE.Vector3(...p));
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,false,'centripetal'),60,.0018,8,false),cable,'Gray plastic-coated keeper wire');
  for(const x of [-.018,.018]){const anchor=add(new THREE.CylinderGeometry(.0026,.0026,.009,8),recess,'Wire keeper swage');anchor.position.set(x,-.014,-.008);}
  const mark=new THREE.Shape();mark.moveTo(-.002,0);mark.lineTo(.002,.0015);mark.lineTo(.002,.006);mark.lineTo(-.002,.0045);mark.closePath();
  add(new THREE.ShapeGeometry(mark),edge,'Small etched diamond').position.set(0,-.003,.0228);
  // Tilt the casting to expose the channels in its natural hanging presentation.
  casting.rotation.x=.40;
  device.userData.hangingPoint=new THREE.Vector3(0,-.081,-.008).applyEuler(casting.rotation).toArray();
  return device;
}
