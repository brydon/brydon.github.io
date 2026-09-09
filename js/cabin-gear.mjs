import * as THREE from './vendor/three.module.min.js';
import {SVGLoader} from './vendor/SVGLoader.js';

export async function createGearWall(cabin){
  const wood=new THREE.MeshStandardMaterial({color:'#978465',roughness:.95,flatShading:true});
  function mesh(parent,geometry,color,x=0,y=0,z=0){const object=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.8,flatShading:true}));object.position.set(x,y,z);object.castShadow=true;parent.add(object);return object;}
  const box=(p,w,h,d,x,y,z,c)=>mesh(p,new THREE.BoxGeometry(w,h,d),c,x,y,z);
  function tube(parent,points,r,color,closed=false){return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed),48,r,6,closed),color);}
  function rod(parent,a,b,r,color){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);const object=mesh(parent,new THREE.CylinderGeometry(r,r,delta.length(),7),color);object.position.copy(start.add(end).multiplyScalar(.5));object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return object;}
  const board=new THREE.Group();board.name='Climbing gear pegboard';board.position.set(2.23,2.12,1.01);board.rotation.y=-Math.PI/2;cabin.add(board);
  const backing=new THREE.Mesh(new THREE.BoxGeometry(1.53,1.43,.065),wood);board.add(backing);
  for(const x of [-.79,.79])box(board,.045,1.5,.09,x,0,0,'#6a563e');for(const y of [-.737,.737])box(board,1.62,.045,.09,0,y,0,'#6a563e');
  const holes=new THREE.InstancedMesh(new THREE.CylinderGeometry(.012,.012,.004,6),new THREE.MeshBasicMaterial({color:'#514936'}),130),matrix=new THREE.Matrix4(),q=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0));
  let index=0;for(let x=0;x<13;x++)for(let y=0;y<10;y++){matrix.compose(new THREE.Vector3(-.68+x*.113,-.61+y*.135,.035),q,new THREE.Vector3(1,1,1));holes.setMatrixAt(index++,matrix);}board.add(holes);
  const hook=(x,y)=>tube(board,[[x,y,.035],[x,y,.15],[x,y+.035,.17]],.011,'#b3b6a0');
  // A bundled climbing rope, with several separate strands and loose ends.
  hook(-.47,.51);
  for(let strand=0;strand<7;strand++){
    const points=[];for(let i=0;i<36;i++){const a=i/36*Math.PI*2;points.push([-.45+Math.sin(a)*(.14+strand*.006),.11+Math.cos(a)*.34,.115+strand*.016]);}
    tube(board,points,.011,strand%2?'#ad603f':'#c27b49',true);
  }
  box(board,.15,.055,.18,-.45,.31,.17,'#b5a77f');tube(board,[[-.4,-.17,.16],[-.4,-.41,.17],[-.3,-.55,.19],[-.29,-.62,.19]],.014,'#bd7845');
  // Quickdraws: asymmetric carabiners, metal gates, and fabric dogbones.
  function carabiner(parent,x,y,z,color,rotation=0){
    const group=new THREE.Group();group.position.set(x,y,z);group.rotation.z=rotation;parent.add(group);
    tube(group,[[-.045,-.075,0],[.055,-.06,0],[.065,.045,0],[-.025,.10,0],[-.065,.055,0]],.014,color,true);
    rod(group,[.063,-.037,.006],[.056,.046,.006],.009,'#d1d2be');
    return group;
  }
  for(let i=0;i<3;i++){
    const x=-.04+i*.24;hook(x,.52);carabiner(board,x,.40,.15,['#829d9e','#b95d40','#b2a36d'][i],-.15+i*.1);
    box(board,.047,.20,.025,x,.185,.155,['#46565b','#875346','#5f704d'][i]);box(board,.017,.18,.005,x,.185,.172,'#bdb798');carabiner(board,x,-.005,.15,'#9baca7',.3-i*.1);
  }
  // A hanging harness, chalk bag, belay device and brush complete the kit.
  hook(.26,-.2);
  const belt=tube(board,[[.09,-.29,.13],[.12,-.19,.14],[.4,-.19,.14],[.43,-.29,.13],[.26,-.34,.15]],.022,'#354a49',true);
  for(const x of [.15,.38]){
    tube(board,[[x,-.36,.14],[x-.06,-.49,.14],[x,-.59,.18],[x+.07,-.49,.2]],.019,'#496b68',true);rod(board,[x,-.31,.15],[x,-.43,.15],.016,'#323d38');
  }
  box(board,.085,.034,.02,.24,-.245,.17,'#bcc0a9');
  const chalkBag=mesh(board,new THREE.CylinderGeometry(.072,.088,.17,9),'#6d8790',-.58,-.53,.16);const rim=mesh(board,new THREE.TorusGeometry(.074,.013,5,14),'#263a37',-.58,-.44,.16);rim.rotation.x=Math.PI/2;
  tube(board,[[-.65,-.46,.16],[-.67,-.3,.12],[-.57,-.29,.10]],.009,'#c6b995');
  rod(board,[-.14,-.6,.13],[-.10,-.35,.13],.013,'#bea371');box(board,.06,.10,.025,-.091,-.33,.14,'#d2c59e');
  carabiner(board,.65,-.37,.15,'#b6baa4',.2);for(const x of [.62,.68]){const device=mesh(board,new THREE.TorusGeometry(.026,.013,6,12),'#668d9d',x,-.23,.17);device.scale.y=1.3;}

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
