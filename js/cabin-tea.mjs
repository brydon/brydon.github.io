/*
                  ( (
                   ) )
                .........
                |       |]
                \       /
                 `-----'

        Steep it a little longer than you think.
*/
import * as THREE from './vendor/three.module.min.js';

/** A steeping mug of tea in the desk mug's units: hollow stoneware, a smooth handle, a tea bag and rising steam. */
export function createTeaMug(){
  const mug=new THREE.Group();mug.name='Porch tea mug';
  const ceramic=new THREE.MeshPhysicalMaterial({color:'#e8e2d4',roughness:.30,clearcoat:.38,clearcoatRoughness:.22,side:THREE.DoubleSide});
  const clay=new THREE.MeshStandardMaterial({color:'#b59a77',roughness:.92,side:THREE.DoubleSide});
  const paper=new THREE.MeshStandardMaterial({color:'#f4ead2',roughness:.95});
  function part(geometry,material,name,parent=mug){const m=new THREE.Mesh(geometry,material);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  const lathe=(profile,material,name)=>part(new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),32),material,name);
  lathe([[0,0],[.075,0],[.086,.002],[.093,.008],[.097,.017],[.100,.035],[.102,.050],[.098,.055]],clay,'Unglazed clay foot');
  lathe([[.1018,.047],[.106,.051],[.107,.058],[.108,.075],[.109,.11],[.110,.17],[.111,.221],[.111,.228],[.102,.228],[.101,.216],[.093,.075],[.087,.032],[.080,.026],[0,.026]],ceramic,'Glazed hollow tea mug');
  lathe([[.111,.2265],[.1115,.229],[.1105,.231],[.103,.231],[.1018,.229],[.102,.2265]],clay,'Thin unglazed rim');
  const handlePath=new THREE.CatmullRomCurve3([[-.113,.179,0],[-.157,.190,0],[-.196,.178,0],[-.212,.148,0],[-.205,.116,0],[-.172,.089,0],[-.113,.078,0]].map(p=>new THREE.Vector3(...p)));
  part(new THREE.TubeGeometry(handlePath,40,.013,8,false),ceramic,'Smooth oval tea mug handle');
  // The tea sits about two thirds up, so the glazed inner wall shows above it.
  part(new THREE.CylinderGeometry(.097,.088,.139,32),new THREE.MeshStandardMaterial({color:'#86441a',roughness:.18}),'Steeping tea').position.y=.0955;
  // The string climbs out of the tea and over the rim opposite the handle; the tag dangles off that side.
  const string=[[.01,.16,0],[.05,.238,.02],[.096,.25,.045],[.116,.232,.054],[.124,.16,.058]].map(p=>new THREE.Vector3(...p));
  part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(string),24,.004,5,false),new THREE.MeshStandardMaterial({color:'#f1ead8',roughness:.9}),'Tea bag string');
  const tag=new THREE.Group();tag.name='Tea bag tag';tag.position.set(.127,.105,.059);tag.rotation.set(0,.7,-.08);mug.add(tag);
  part(new THREE.BoxGeometry(.095,.108,.006),paper,'Tea tag paper',tag);
  part(new THREE.BoxGeometry(.095,.026,.007),new THREE.MeshStandardMaterial({color:'#b8432c',roughness:.9}),'Tea tag band',tag).position.set(0,.03,.0005);
  const steam=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshBasicMaterial({color:'#e6ddc6',transparent:true,opacity:.2,depthWrite:false}),10);steam.name='Tea steam';mug.add(steam);
  const dummy=new THREE.Object3D();
  // Steam lifts from the tea and drifts out of the mug; reduced motion holds each wisp in place.
  mug.userData.animate=(time,reduced)=>{
    for(let i=0;i<10;i++){const f=reduced?i/10:(time*.0005+i/10)%1;dummy.position.set(Math.sin(i+f*3)*.045*f,.19+f*.3,Math.cos(i*2)*.04*f);dummy.scale.setScalar(.006+Math.sin(f*Math.PI)*.02);dummy.updateMatrix();steam.setMatrixAt(i,dummy.matrix);}
    steam.instanceMatrix.needsUpdate=true;
  };
  mug.userData.animate(0,true);
  return mug;
}
