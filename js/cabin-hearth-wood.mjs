import * as THREE from './vendor/three.module.min.js';

/** A narrow slatted wood box in the gap between the hearth and the front wall. */
export function createHearthLogBox(){
  const group=new THREE.Group();group.name='Hearth firewood box';
  group.position.set(-1.77,.47,1.79);group.rotation.y=Math.PI/2;
  const timber=new THREE.MeshStandardMaterial({color:'#735038',roughness:.96,flatShading:true});
  const edge=new THREE.MeshStandardMaterial({color:'#8e6748',roughness:.95,flatShading:true});
  const iron=new THREE.MeshStandardMaterial({color:'#363c36',roughness:.76,metalness:.35});
  const bark=new THREE.MeshStandardMaterial({color:'#68452e',roughness:1,flatShading:true});
  const cut=new THREE.MeshStandardMaterial({color:'#bc9464',roughness:1,flatShading:true});
  function mesh(geometry,material,x,y,z){
    const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;group.add(m);return m;
  }
  const box=(w,h,d,x,y,z,material=timber)=>mesh(new THREE.BoxGeometry(w,h,d),material,x,y,z);
  // Runners and a solid floor support the wood, with small gaps between side slats.
  for(const z of [-.185,.185])box(.24,.026,.043,0,.013,z);
  box(.24,.035,.5,0,.0435,0);
  for(const x of [-.111,.111]){
    for(const z of [-.24,.24])box(.018,.235,.02,x,.1435,z,edge);
    for(const y of [.10,.18,.25])box(.018,.052,.5,x,y,0,edge);
  }
  for(const z of [-.242,.242]){
    for(const y of [.105,.177])box(.222,.058,.016,0,y,z);
    // A low front/back rim leaves the log ends visible and provides a lifting lip.
    box(.24,.026,.022,0,.232,z,edge);
    for(const x of [-.096,.096])for(const y of [.106,.18]){
      const nail=mesh(new THREE.CylinderGeometry(.007,.007,.005,6),iron,x,y,z+Math.sign(z)*.01);
      nail.rotation.x=Math.PI/2;
    }
  }
  // Every log lies inside the box; their end grain faces the room.
  for(let row=0;row<3;row++)for(let i=0;i<(row===2?1:2);i++){
    const x=row===2?.012:(i-.5)*.101,y=.108+row*.088,z=(row+i)%2?.012:-.01;
    const length=.408-((row+i)%3)*.017;
    const log=mesh(new THREE.CylinderGeometry(.044,.047,length,7),bark,x,y,z);
    log.rotation.x=Math.PI/2;
    for(const side of [-1,1]){
      const end=mesh(new THREE.CylinderGeometry(.039,.041,.006,7),cut,x,y,z+side*(length/2+.001));
      end.rotation.x=Math.PI/2;
    }
  }
  return group;
}
