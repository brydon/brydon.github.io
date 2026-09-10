import * as THREE from './vendor/three.module.min.js';
import {finishGearMaterials} from './gear-materials.mjs';

/** A small wrought-iron rack, poker and scissor tongs in hearth-local coordinates. */
export function createFireplaceTools(){
  const tools=new THREE.Group();tools.name='Fire tools on the right stone pier';
  const iron=new THREE.MeshStandardMaterial({color:'#303a35',roughness:.68,metalness:.62});
  const worn=new THREE.MeshStandardMaterial({color:'#69736c',roughness:.54,metalness:.74});
  const wood=new THREE.MeshStandardMaterial({color:'#5a412c',roughness:.87});
  function mesh(geometry,material,parent=tools){const m=new THREE.Mesh(geometry,material);parent.add(m);return m;}
  function box(w,h,d,x,y,z,material,parent=tools){const m=mesh(new THREE.BoxGeometry(w,h,d),material,parent);m.position.set(x,y,z);return m;}
  function tube(points,radius,material,parent=tools,closed=false,caps=false){
    const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed);
    const m=mesh(new THREE.TubeGeometry(path,32,radius,7,closed),material,parent);
    if(caps)for(const p of [points[0],points.at(-1)])mesh(new THREE.SphereGeometry(radius,7,5),material,parent).position.set(...p);
    return m;
  }
  function bolt(radius,length,x,y,z,material,parent=tools){
    const m=mesh(new THREE.CylinderGeometry(radius,radius,length,8),material,parent);m.rotation.x=Math.PI/2;m.position.set(x,y,z);return m;
  }
  function eye(x,y,z,rx,ry,parent){
    const points=[];for(let i=0;i<12;i++){const a=i*Math.PI/6;points.push([x+Math.sin(a)*rx,y+Math.cos(a)*ry,z]);}
    return tube(points,.0055,iron,parent,true);
  }

  // Both back plates bite into the stone face at z=.27; the bolts face the room.
  const rack=new THREE.Group();rack.name='Bolted two-hook fire-tool rack';tools.add(rack);
  for(const x of [.452,.595]){
    box(.052,.09,.014,x,.85,.274,iron,rack);
    for(const y of [.819,.881]){
      bolt(.008,.018,x,y,.287,worn,rack);
      box(.009,.0017,.001,x,y,.2965,iron,rack);
    }
  }
  tube([[.431,.848,.286],[.53,.848,.286],[.624,.848,.286]],.008,iron,rack,false,true);
  for(const x of [.452,.57]){
    // The loop's upper inside edge bears on the hook's rounded cradle.
    tube([[x,.848,.282],[x,.844,.321],[x,.823,.346],[x,.818,.354],[x,.822,.370],[x,.842,.375]],.006,iron,rack,false,true);
  }

  const poker=new THREE.Group();poker.name='Hanging fire poker';tools.add(poker);
  eye(.452,.795,.352,.023,.034,poker);
  tube([[.452,.761,.352],[.452,.64,.357],[.449,.43,.370],[.452,.232,.384]],.006,iron,poker);
  const gripProfile=[[.006,.643],[.010,.647],[.012,.659],[.011,.72],[.012,.741],[.009,.751],[.006,.753]].map(p=>new THREE.Vector2(...p));
  const grip=mesh(new THREE.LatheGeometry(gripProfile,10),wood,poker);grip.position.set(.452,0,.355);
  for(const y of [.646,.75]){
    const ferrule=mesh(new THREE.CylinderGeometry(.010,.010,.012,10),worn,poker);ferrule.position.set(.452,y,.355);
  }
  const point=mesh(new THREE.ConeGeometry(.0065,.03,7),worn,poker);point.rotation.z=Math.PI;point.position.set(.452,.217,.384);
  tube([[.451,.265,.382],[.478,.258,.383],[.486,.278,.383]],.0056,iron,poker,false,true);

  const tongs=new THREE.Group();tongs.name='Hanging scissor fire tongs';tools.add(tongs);
  eye(.57,.795,.355,.0175,.034,tongs);
  eye(.621,.782,.367,.0185,.036,tongs);
  function flatArm(points,z){
    const curve=new THREE.CatmullRomCurve3(points.map(([x,y])=>new THREE.Vector3(x,y,0)));
    const left=[],right=[];
    for(let i=0;i<=32;i++){
      const t=i/32,p=curve.getPoint(t),direction=curve.getTangent(t),halfWidth=.0058+Math.max(0,(t-.78)/.22)*.003;
      const normal=new THREE.Vector3(-direction.y,direction.x,0).normalize().multiplyScalar(halfWidth);
      left.push(new THREE.Vector2(p.x+normal.x,p.y+normal.y));right.push(new THREE.Vector2(p.x-normal.x,p.y-normal.y));
    }
    const shape=new THREE.Shape([...left,...right.reverse()]);
    const arm=mesh(new THREE.ExtrudeGeometry(shape,{depth:.006,bevelEnabled:true,bevelThickness:.001,bevelSize:.001,bevelSegments:1,steps:1}),iron,tongs);arm.position.z=z;return arm;
  }
  flatArm([[.57,.761],[.584,.665],[.598,.565],[.618,.389],[.642,.269],[.638,.244],[.611,.228]],.352);
  flatArm([[.621,.746],[.608,.651],[.598,.565],[.583,.398],[.560,.268],[.564,.243],[.594,.228]],.364);
  // The overlapping flat arms share a through-rivet; the broad jaws almost meet.
  bolt(.0105,.032,.598,.565,.361,worn,tongs);
  bolt(.012,.005,.598,.565,.379,worn,tongs);
  box(.010,.0018,.001,.598,.565,.382,iron,tongs);
  finishGearMaterials(tools);return tools;
}
