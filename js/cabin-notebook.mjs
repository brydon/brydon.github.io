import * as THREE from './vendor/three.module.min.js';

const WIDTH=.372,HEIGHT=.442;
const ray=new THREE.Raycaster(),eye=new THREE.Vector3(),point=new THREE.Vector3(),direction=new THREE.Vector3(),normal=new THREE.Vector3();
const hitAreas=new WeakMap();
function visibleObject(object){for(let item=object;item;item=item.parent)if(!item.visible)return false;return true;}

/** A pencil study left open on the desk, with the same artwork as the reader. */
export function createNotebookSketch(){
  const map=new THREE.TextureLoader().load('/images/switchback/robot-drawing-hands.png');
  map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  const paper=new THREE.Mesh(new THREE.PlaneGeometry(WIDTH,HEIGHT),new THREE.MeshStandardMaterial({map,roughness:.98,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
  paper.name='Unfinished graphite study of two robot hands drawing one another';paper.rotation.x=-Math.PI/2;
  paper.position.set(1.37,1.256,-1.02);paper.receiveShadow=true;return paper;
}

/** The exposed paper provides the tap target, never the chair or monitor over it. */
export function notebookHitArea(paper,camera,occluders=[]){
  paper.updateWorldMatrix(true,false);camera.getWorldPosition(eye);
  normal.set(0,0,1).transformDirection(paper.matrixWorld);
  point.set(0,0,0).applyMatrix4(paper.matrixWorld);
  if(!visibleObject(paper)||normal.dot(direction.subVectors(eye,point))<=0)return [];
  let cache=hitAreas.get(paper);
  if(!cache||cache.roots.length!==occluders.length||cache.roots.some((object,i)=>object!==occluders[i])){
    const meshes=[];
    // The chair's open weave consists of thin lines. Raycaster's default line
    // threshold is a metre, which would incorrectly turn it into a solid panel.
    for(const object of occluders)object.traverse(child=>{if(child.isMesh)meshes.push(child);});
    cache={roots:[...occluders],meshes,eye:new THREE.Vector3(Infinity,Infinity,Infinity),paper:new THREE.Matrix4(),matrices:meshes.map(()=>new THREE.Matrix4()),visibility:[],points:[]};
    hitAreas.set(paper,cache);
  }
  for(const object of occluders)object.updateWorldMatrix(true,true);
  if(cache.eye.distanceToSquared(eye)<1e-8&&cache.paper.equals(paper.matrixWorld)&&cache.meshes.every((object,i)=>cache.matrices[i].equals(object.matrixWorld)&&cache.visibility[i]===visibleObject(object)))return cache.points;
  const visible=[];
  // Sampling the corners and interior keeps a partially exposed page usable.
  for(const x of [-.5,0,.5])for(const y of [-.5,0,.5]){
    point.set(x*WIDTH,y*HEIGHT,.001).applyMatrix4(paper.matrixWorld);
    direction.subVectors(point,eye);const distance=direction.length();
    ray.set(eye,direction.normalize());ray.near=0;ray.far=Math.max(0,distance-.004);
    const blocked=ray.intersectObjects(cache.meshes,false).some(hit=>visibleObject(hit.object));
    if(!blocked)visible.push(point.toArray());
  }
  cache.eye.copy(eye);cache.paper.copy(paper.matrixWorld);cache.points=visible;
  cache.meshes.forEach((object,i)=>{cache.matrices[i].copy(object.matrixWorld);cache.visibility[i]=visibleObject(object);});
  return visible;
}
