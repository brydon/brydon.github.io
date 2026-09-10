import * as THREE from './vendor/three.module.min.js';
import {finishGearMaterials} from './gear-materials.mjs';

const point = p => new THREE.Vector3(...p);

/** A plain, gently bevelled gold band, lying on its side on the floor. */
export function createWeddingBand(){
  const ring=new THREE.Group();ring.name='Misplaced gold wedding band';
  const profile=[
    [.0175,.0015],[.0185,0],[.0225,0],[.024,.0015],
    [.024,.0095],[.0225,.011],[.0185,.011],[.0175,.0095],[.0175,.0015]
  ].map(p=>new THREE.Vector2(...p));
  const gold=new THREE.MeshStandardMaterial({color:'#e0ad43',metalness:.88,roughness:.24});
  const band=new THREE.Mesh(new THREE.LatheGeometry(profile,32),gold);
  ring.add(band);finishGearMaterials(ring);return ring;
}

/** Unbranded everyday backpack, with its top loop actually resting on a hook. */
export function createHangingBackpack(){
  const bag=new THREE.Group();bag.name='Black backpack on the entrance hook';
  const cloth=new THREE.MeshStandardMaterial({color:'#252a2b',roughness:.97});
  const pocketCloth=new THREE.MeshStandardMaterial({color:'#303637',roughness:.96});
  const webbing=new THREE.MeshStandardMaterial({color:'#13191a',roughness:1,side:THREE.DoubleSide});
  const seam=new THREE.MeshStandardMaterial({color:'#454c4b',roughness:.94});
  const zipper=new THREE.MeshStandardMaterial({color:'#686f6b',roughness:.57,metalness:.35});
  const hookMetal=new THREE.MeshStandardMaterial({color:'#7c8179',roughness:.43,metalness:.73});
  function mesh(geometry,material,x=0,y=0,z=0){
    const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);bag.add(m);return m;
  }
  function tube(points,radius,material,closed=false){
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point),closed),32,radius,6,closed),material);
  }
  function ribbon(points,width,material){
    const path=new THREE.CatmullRomCurve3(points.map(point)),vertices=[],indices=[];
    for(let i=0;i<=24;i++){
      const t=i/24,p=path.getPoint(t),tangent=path.getTangent(t);
      const across=new THREE.Vector3(tangent.y,-tangent.x,0).normalize().multiplyScalar(width/2);
      vertices.push(...p.clone().add(across),...p.clone().sub(across));
      if(i<24){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geometry.setIndex(indices);geometry.computeVertexNormals();return mesh(geometry,material);
  }
  function sewnPanel(shape,depth,bevel,material,z){
    return mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:6}),material,0,0,z);
  }
  const outline=new THREE.Shape();
  outline.moveTo(-.163,-.285);outline.quadraticCurveTo(-.203,-.277,-.207,-.224);
  outline.lineTo(-.196,.142);outline.bezierCurveTo(-.19,.257,-.111,.292,0,.297);
  outline.bezierCurveTo(.117,.294,.188,.248,.197,.143);outline.lineTo(.208,-.22);
  outline.quadraticCurveTo(.205,-.283,.166,-.288);outline.quadraticCurveTo(0,-.301,-.163,-.285);
  sewnPanel(outline,.137,.019,cloth,.023);

  // Padded shoulder straps tuck behind the pack, with loose webbing at the base.
  for(const side of [-1,1]){
    ribbon([[side*.093,.242,.005],[side*.155,.10,.004],[side*.23,-.10,.017],[side*.193,-.242,.02],[side*.125,-.269,.018]],.041,webbing);
    ribbon([[side*.177,-.237,.043],[side*.225,-.286,.043],[side*.203,-.385,.071]],.022,webbing);
    mesh(new THREE.BoxGeometry(.035,.024,.008),seam,side*.214,-.296,.05).rotation.z=side*.17;
  }
  // A sewn carry loop bends away from the wall where it bears on the hook.
  ribbon([[-.034,.28,.03],[-.034,.39,.053],[0,.456,.104],[.034,.39,.053],[.034,.28,.03]],.019,webbing);
  const mount=mesh(new THREE.CylinderGeometry(.026,.026,.008,12),hookMetal,0,.483,.003);mount.rotation.x=Math.PI/2;
  for(const y of [.468,.498]){const screw=mesh(new THREE.CylinderGeometry(.004,.004,.010,6),seam,0,y,.007);screw.rotation.x=Math.PI/2;}
  tube([[0,.484,.011],[0,.453,.043],[0,.439,.085],[0,.455,.111],[0,.48,.109]],.0075,hookMetal);

  // Broad front pocket, narrow zipper teeth and two small metal zipper pulls.
  const pocket=new THREE.Shape();pocket.moveTo(-.145,-.246);pocket.quadraticCurveTo(-.163,-.235,-.162,-.204);
  pocket.lineTo(-.151,-.043);pocket.quadraticCurveTo(0,-.012,.151,-.041);
  pocket.lineTo(.161,-.204);pocket.quadraticCurveTo(.166,-.241,.14,-.25);pocket.quadraticCurveTo(0,-.27,-.145,-.246);
  sewnPanel(pocket,.04,.011,pocketCloth,.169);
  tube([[-.148,-.058,.222],[0,-.04,.23],[.147,-.059,.222]],.003,webbing);
  for(let i=0;i<15;i++){
    const x=-.137+i*.0195,y=-.043-Math.pow(x/.15,2)*.015;
    mesh(new THREE.BoxGeometry(.006,.005,.002),zipper,x,y,.231-Math.abs(x)*.052);
  }
  tube([[-.172,.117,.18],[-.145,.236,.178],[0,.275,.18],[.145,.236,.178],[.178,.115,.18]],.004,webbing);
  tube([[-.17,.115,.184],[-.144,.231,.185],[0,.271,.187],[.14,.231,.185],[.174,.117,.184]],.0017,zipper);
  for(const [x,y,z,tilt]of [[.143,-.065,.231,.15],[.174,.111,.19,-.18]]){
    const pull=mesh(new THREE.TorusGeometry(.0075,.002,4,8),zipper,x,y-.012,z);pull.scale.y=1.65;pull.rotation.z=tilt;
  }
  // Soft piping makes the black silhouette readable under the warm cabin light.
  tube([[-.174,-.276,.18],[-.195,-.22,.174],[-.184,.14,.171],[-.145,.25,.173],[0,.285,.171],[.15,.246,.171],[.186,.14,.173],[.195,-.22,.174],[.169,-.278,.18]],.0022,seam);
  finishGearMaterials(bag);return bag;
}

export function createPersonalDetails(cabin){
  const ring=createWeddingBand();ring.position.set(-.24,.469,-.64);ring.rotation.y=.32;cabin.add(ring);
  // On the interior front wall, to the right of the door opening.
  const backpack=createHangingBackpack();backpack.position.set(1.61,1.68,1.925);backpack.rotation.y=Math.PI;cabin.add(backpack);
  return {
    ring,backpack,
    ringArea(){
      ring.updateWorldMatrix(true,false);
      const corners=[];
      // The clickable patch stays generous while the band keeps a believable size.
      for(const x of [-.067,.067])for(const y of [0,.044])for(const z of [-.067,.067])corners.push(ring.localToWorld(new THREE.Vector3(x,y,z)).toArray());
      return corners;
    }
  };
}
