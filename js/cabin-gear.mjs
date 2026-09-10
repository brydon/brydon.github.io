import * as THREE from './vendor/three.module.min.js';
import {SVGLoader} from './vendor/SVGLoader.js';
import {createPegboard} from './gear-pegboard.mjs';
export {createPegboard} from './gear-pegboard.mjs';

export async function createGearWall(cabin){
  function mesh(parent,geometry,color,x=0,y=0,z=0){const object=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.8,flatShading:true}));object.position.set(x,y,z);object.castShadow=true;parent.add(object);return object;}
  const box=(p,w,h,d,x,y,z,c)=>mesh(p,new THREE.BoxGeometry(w,h,d),c,x,y,z);
  function rod(parent,a,b,r,color){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);const object=mesh(parent,new THREE.CylinderGeometry(r,r,delta.length(),7),color);object.position.copy(start.add(end).multiplyScalar(.5));object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return object;}
  const board=createPegboard();board.position.set(2.23,2.12,1.01);board.rotation.y=-Math.PI/2;cabin.add(board);

  // A pen cup with two small national flags, made from actual mesh layers.
  box(cabin,.34,.04,.29,1.72,1.22,-1.62,'#a98853');
  const cup=new THREE.Group();cup.name='Canadian and Sri Lankan desk flags';cup.position.set(1.72,1.24,-1.62);cup.rotation.y=-.12;cup.scale.setScalar(.9);cabin.add(cup);
  const vessel=mesh(cup,new THREE.CylinderGeometry(.095,.081,.19,12),'#506d5e',0,.095,0);mesh(cup,new THREE.CylinderGeometry(.081,.081,.007,12),'#273b30',0,.192,0);
  for(let i=0;i<5;i++)rod(cup,[(i-2)*.026,.04,.02],[(i-2)*.035,.31+(i%3)*.025,.025],.009,['#ac7740','#394740','#b79764'][i%3]);
  const canada=new THREE.Group();canada.position.set(-.035,.1,0);canada.rotation.z=.25;cup.add(canada);rod(canada,[0,0,0],[0,.61,0],.008,'#d6c6a1');
  box(canada,.29,.145,.006,-.145,.52,0,'#f3edda');for(const x of [-.257,-.033])box(canada,.066,.145,.007,x,.52,.003,'#b83b34');
  const leaf=new THREE.Shape();[[0,-.07],[.006,-.03],[.046,-.035],[.035,-.014],[.077,.019],[.049,.023],[.052,.052],[.028,.037],[.019,.072],[0,.052],[-.019,.072],[-.028,.037],[-.052,.052],[-.049,.023],[-.077,.019],[-.035,-.014],[-.046,-.035],[-.006,-.03]].forEach(([x,y],i)=>i?leaf.lineTo(x,y):leaf.moveTo(x,y));leaf.closePath();
  const maple=mesh(canada,new THREE.ExtrudeGeometry(leaf,{depth:.001,bevelEnabled:false}),'#b83b34',-.145,.517,.008);maple.scale.setScalar(.72);
  const sriLanka=new THREE.Group();sriLanka.position.set(.035,.1,.01);sriLanka.rotation.z=-.22;cup.add(sriLanka);rod(sriLanka,[0,0,0],[0,.55,0],.008,'#d6c6a1');
  const svg=await new SVGLoader().loadAsync('/images/switchback/sri-lanka.svg');
  const flag=new THREE.Group();flag.position.set(0,.535,0);flag.scale.set(.0002583,-.0002583,.0002583);sriLanka.add(flag);
  svg.paths.forEach((path,index)=>{
    if(path.userData.style.fill==='none')return;
    const material=new THREE.MeshBasicMaterial({color:path.color,side:THREE.DoubleSide,toneMapped:false});
    for(const shape of SVGLoader.createShapes(path)){const part=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:2,bevelEnabled:false,curveSegments:8}),material);part.position.z=index*2.2;flag.add(part);}
  });
}
