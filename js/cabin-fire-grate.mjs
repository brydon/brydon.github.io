import * as THREE from './vendor/three.module.min.js';

/** A low forged-iron log cradle, with air and an ember bed beneath the fire. */
export function createFireplaceGrate(){
  const grate=new THREE.Group();grate.name='Forged iron fireplace log cradle';
  const iron=new THREE.MeshStandardMaterial({color:'#343934',roughness:.76,metalness:.45});
  const worn=new THREE.MeshStandardMaterial({color:'#5a5c4e',roughness:.70,metalness:.4});
  const ash=new THREE.MeshStandardMaterial({color:'#47463b',roughness:1});
  function mesh(geometry,material=iron){const m=new THREE.Mesh(geometry,material);m.castShadow=m.receiveShadow=true;grate.add(m);return m;}
  function bar(a,b,width,depth=width,material=iron){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
    const m=mesh(new THREE.BoxGeometry(width,delta.length(),depth),material);m.position.copy(start).add(end).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;
  }
  // The four splayed feet sit directly on the stone hearth, with daylight below.
  for(const x of [-.32,.32])for(const z of [-.115,.24]){
    const foot=mesh(new THREE.BoxGeometry(.067,.025,.065));foot.position.set(x,.0825,z);
    bar([x,.091,z],[x*.94,.176,z*.90],.033);
  }
  for(const z of [-.104,.216])bar([-.355,.176,z],[.355,.176,z],.036,.034);
  // Basket ribs cradle the logs and turn up at the front to stop them rolling out.
  for(let i=0;i<7;i++){
    const x=-.33+i*.11;
    const points=[[x,.265,-.175],[x,.181,-.105],[x,.181,.217],[x,.285,.310],[x,.345,.315]];
    for(let j=1;j<points.length;j++)bar(points[j-1],points[j],.025,.027);
    const tip=mesh(new THREE.BoxGeometry(.029,.012,.031),worn);tip.position.set(x,.345,.315);
  }
  // The front and back rails connect every rib into a single rigid basket.
  bar([-.347,.282,.307],[.347,.282,.307],.028,.03);
  bar([-.347,.26,-.171],[.347,.26,-.171],.026,.03);
  for(const x of [-.335,.335]){
    const rivet=mesh(new THREE.CylinderGeometry(.011,.011,.009,7),worn);rivet.rotation.x=Math.PI/2;rivet.position.set(x,.282,.327);
  }
  // Small ash fragments remain on the hearth rather than floating with the logs.
  for(let i=0;i<9;i++){
    const flake=mesh(new THREE.DodecahedronGeometry(.025+(i%3)*.006,0),ash);
    flake.position.set(Math.sin(i*2.7)*.29,.085,Math.cos(i*1.7)*.14+.045);flake.scale.set(1,.22,.65);
  }
  return grate;
}
