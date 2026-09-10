import * as THREE from './vendor/three.module.min.js';
import {finishGearMaterials} from './gear-materials.mjs';

// A lightweight alpine piolet: black pick/adze head and bowed gold alloy shaft.
// Local origin is the head; rotate Z by PI/2 to hang it horizontally.
export function createIceAxe(){
  const group=new THREE.Group();group.name='Gold alpine ice axe';
  const steel=new THREE.MeshStandardMaterial({color:'#252d2c',metalness:.77,roughness:.39});
  const edge=new THREE.MeshStandardMaterial({color:'#dce1dc',metalness:.92,roughness:.21});
  const alloy=new THREE.MeshStandardMaterial({color:'#d58a24',metalness:.67,roughness:.33});
  const rubber=new THREE.MeshStandardMaterial({color:'#293331',roughness:.91});
  const gripRidge=new THREE.MeshStandardMaterial({color:'#bd7a21',metalness:.53,roughness:.46});
  const dark=new THREE.MeshStandardMaterial({color:'#596562',metalness:.68,roughness:.43});
  function mesh(geometry,material,name){const object=new THREE.Mesh(geometry,material);object.name=name;group.add(object);return object;}
  function extrude(shape,depth,material,name,z=.021){
    const object=mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.0007,bevelThickness:.0006,curveSegments:10}),material,name);
    object.position.z=z-depth/2;return object;
  }
  const head=new THREE.Shape();
  head.moveTo(-.025,.012);head.quadraticCurveTo(.012,.024,.040,.009);
  head.bezierCurveTo(.068,.001,.096,-.037,.149,-.063);
  head.lineTo(.151,-.070);
  // Forged lower-edge teeth become progressively stronger toward the shaft.
  const teeth=[[.143,-.065],[.140,-.069],[.135,-.061],[.130,-.065],
    [.125,-.057],[.119,-.061],[.114,-.052],[.109,-.056],
    [.103,-.047],[.098,-.051],[.092,-.041],[.086,-.045],
    [.079,-.035],[.073,-.038],[.062,-.027]];
  for(const p of teeth)head.lineTo(...p);
  head.quadraticCurveTo(.034,-.015,.012,-.011);
  head.quadraticCurveTo(-.006,-.015,-.025,-.005);head.closePath();
  const headHole=new THREE.Path();headHole.moveTo(.010,.008);
  headHole.bezierCurveTo(.012,.017,.036,.009,.035,.003);
  headHole.bezierCurveTo(.031,-.008,.021,-.007,.016,-.001);headHole.closePath();head.holes.push(headHole);
  const forwardHole=new THREE.Path();forwardHole.moveTo(.040,.003);
  forwardHole.quadraticCurveTo(.047,.006,.055,-.008);
  forwardHole.quadraticCurveTo(.057,-.013,.050,-.012);forwardHole.lineTo(.035,-.011);
  forwardHole.quadraticCurveTo(.033,-.008,.040,.003);head.holes.push(forwardHole);
  const forging=extrude(head,.0075,steel,'Forged pick with clipping hole');
  // The thin pick tip broadens into the load-bearing head forging.
  const positions=forging.geometry.attributes.position;
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),thickness=THREE.MathUtils.lerp(.43,1,THREE.MathUtils.clamp((.151-x)/.12,0,1));
    positions.setZ(i,.00375+(positions.getZ(i)-.00375)*thickness);
  }
  forging.geometry.computeVertexNormals();
  // A flared, shallowly dished adze is perpendicular to the pick, with a bevelled edge.
  const adzeStations=[[-.014,.010,.005],[-.025,.014,.009],[-.037,.012,.013],[-.042,-.009,.014]];
  function adzeLayer(thickness,material,name){
    const vertices=[],indices=[];
    for(let side=0;side<2;side++)for(let i=0;i<adzeStations.length;i++){
      const [x,y,width]=adzeStations[i];
      vertices.push(x,y+side*thickness,.021-width,x,y+side*thickness+.002,.021,x,y+side*thickness,.021+width);
    }
    for(let side=0;side<2;side++)for(let i=0;i<3;i++)for(let j=0;j<2;j++){
      const k=side*12+i*3+j;
      if(side)indices.push(k,k+3,k+1,k+1,k+3,k+4);
      else indices.push(k,k+1,k+3,k+1,k+4,k+3);
    }
    for(const j of [0,2])for(let i=0;i<3;i++){
      const k=i*3+j;indices.push(k,k+12,k+3,k+3,k+12,k+15);
    }
    for(const i of [0,9])for(let j=0;j<2;j++){
      const k=i+j;indices.push(k,k+1,k+12,k+1,k+13,k+12);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    return mesh(geometry,material,name);
  }
  adzeLayer(.0032,steel,'Flared steel adze');
  const cuttingEdge=mesh(new THREE.BoxGeometry(.002,.003,.027),steel,'Short adze lip');cuttingEdge.position.set(-.042,-.007,.021);cuttingEdge.rotation.z=.25;
  const shaftPath=new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,-.008,.021),new THREE.Vector3(-.011,-.110,.021),
    new THREE.Vector3(-.022,-.215,.021),new THREE.Vector3(-.021,-.325,.021),
    new THREE.Vector3(-.012,-.435,.021),new THREE.Vector3(.001,-.548,.021)
  ],false,'centripetal');
  const crossSection=[[-.008,-.008],[-.0105,-.004],[-.0105,.004],[-.007,.009],[.007,.009],[.0105,.004],[.0105,-.004],[.008,-.008]];
  function shaftSurface(start,end,scale,material,name){
    const vertices=[],indices=[],n=36;
    for(let i=0;i<=n;i++){
      const t=THREE.MathUtils.lerp(start,end,i/n),p=shaftPath.getPoint(t),tangent=shaftPath.getTangent(t);
      const normal=new THREE.Vector3(-tangent.y,tangent.x,0).normalize();
      for(const [x,z]of crossSection)vertices.push(...p.clone().addScaledVector(normal,x*scale).add(new THREE.Vector3(0,0,z*scale)).toArray());
      if(i<n)for(let j=0;j<8;j++){const k=i*8+j,next=i*8+(j+1)%8;indices.push(k,k+8,next,next,k+8,next+8);}
    }
    for(let j=1;j<7;j++){indices.push(0,j+1,j);const k=n*8;indices.push(k,k+j,k+j+1);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    return mesh(geometry,material,name);
  }
  shaftSurface(0,1,1,alloy,'Curved anodized aluminum shaft');
  shaftSurface(.735,.986,1.015,alloy,'Ridged alloy lower shaft');
  // Small transverse ribs on the grip are geometry, not a painted pattern.
  const ribs=new THREE.InstancedMesh(new THREE.TorusGeometry(.0108,.00085,4,12),gripRidge,18),matrix=new THREE.Matrix4();
  for(let i=0;i<18;i++){
    const t=.745+i/17*.230,p=shaftPath.getPoint(t),tangent=shaftPath.getTangent(t);
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),tangent);
    matrix.compose(p,q,new THREE.Vector3(1,.83,1));ribs.setMatrixAt(i,matrix);
  }
  ribs.name='Fine lower-shaft grip ridges';group.add(ribs);
  // A compact adjustable hand stop clamps around the shaft, rather than a full grip.
  const stopPoint=shaftPath.getPoint(.66);
  const stopRing=mesh(new THREE.TorusGeometry(.012,.0035,5,16),rubber,'Adjustable hand-stop collar');
  stopRing.rotation.x=Math.PI/2;stopRing.scale.y=.77;stopRing.position.copy(stopPoint);
  const stop=new THREE.Shape();stop.moveTo(stopPoint.x-.014,stopPoint.y+.004);
  stop.lineTo(stopPoint.x+.013,stopPoint.y+.006);stop.quadraticCurveTo(stopPoint.x+.035,stopPoint.y+.009,stopPoint.x+.039,stopPoint.y+.029);
  stop.lineTo(stopPoint.x+.044,stopPoint.y+.027);stop.quadraticCurveTo(stopPoint.x+.039,stopPoint.y-.005,stopPoint.x+.014,stopPoint.y-.007);
  stop.lineTo(stopPoint.x-.014,stopPoint.y-.008);stop.closePath();extrude(stop,.013,rubber,'Curved adjustable hand rest');
  const stopRivet=mesh(new THREE.CylinderGeometry(.0034,.0034,.002,10),alloy,'Hand-stop adjustment rivet');stopRivet.rotation.x=Math.PI/2;stopRivet.position.set(stopPoint.x+.027,stopPoint.y+.007,.029);
  // The shaft itself ends in an angled, open-looking alloy spike.
  const spike=new THREE.Shape();spike.moveTo(-.009,-.540);spike.lineTo(.012,-.540);spike.lineTo(.015,-.553);spike.lineTo(-.006,-.589);spike.closePath();
  extrude(spike,.014,alloy,'Integrated angled shaft spike');
  for(const [x,y,z]of [[-.001,-.042,.030],[0,-.529,.030]]){
    const rivet=mesh(new THREE.CylinderGeometry(.0024,.0024,.0018,10),edge,'Flush shaft rivet');rivet.rotation.x=Math.PI/2;rivet.position.set(x,y,z);
  }
  // A slim silver inset keeps the shaft extrusion legible in low cabin lighting.
  const stripe=mesh(new THREE.BoxGeometry(.0015,.070,.0004),edge,'Narrow shaft highlight');stripe.position.set(-.022,-.263,.0302);
  group.userData.item='ice axe';group.userData.lengthMeters=.60;
  return finishGearMaterials(group);
}
