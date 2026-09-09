import * as THREE from './vendor/three.module.min.js';
import {CUBE_FACES,faceFromNormal} from './cube-state.mjs';

/** The same 26 physical pieces and 54 stickers appear on the shelf and in the game. */
export function createCubeModel(state,{labels=false}={}){
  const group=new THREE.Group();group.name='3 × 3 puzzle cube';
  const bodyGeometry=new THREE.BoxGeometry(.94,.94,.94);
  const shape=new THREE.Shape(),r=.065,h=.414;
  shape.moveTo(-h+r,-h);shape.lineTo(h-r,-h);shape.quadraticCurveTo(h,-h,h,-h+r);
  shape.lineTo(h,h-r);shape.quadraticCurveTo(h,h,h-r,h);shape.lineTo(-h+r,h);
  shape.quadraticCurveTo(-h,h,-h,h-r);shape.lineTo(-h,-h+r);shape.quadraticCurveTo(-h,-h,-h+r,-h);
  const stickerGeometry=new THREE.ShapeGeometry(shape,3);
  // ShapeGeometry's default UVs use world coordinates; map the full label to the sticker.
  const uv=stickerGeometry.attributes.uv,position=stickerGeometry.attributes.position;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(position.getX(i)+h)/(2*h),(position.getY(i)+h)/(2*h));
  const plastic=new THREE.MeshStandardMaterial({color:'#182623',roughness:.54,metalness:.04});
  const colors=Object.fromEntries(Object.entries(CUBE_FACES).map(([face,{color}])=>[face,new THREE.MeshStandardMaterial({color,roughness:.66})]));
  const labelMaterials={};
  if(labels)for(const [face,{color}]of Object.entries(CUBE_FACES)){
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
    const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,128,128);
    ctx.fillStyle=['U','D'].includes(face)?'#263b34':'#fff6e3';ctx.font='bold 64px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(face,64,67);
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
    labelMaterials[face]=new THREE.MeshStandardMaterial({map,roughness:.66});
  }
  const pieces=new Map(),stickers=[];
  for(const piece of state){
    const part=new THREE.Group();part.name='Cubie '+piece.id;group.add(part);
    const body=new THREE.Mesh(bodyGeometry,plastic);part.add(body);
    for(const sticker of piece.stickers){
      const surface=new THREE.Mesh(stickerGeometry,labels&&piece.stickers.length===1?labelMaterials[sticker.color]:colors[sticker.color]);
      surface.userData.color=sticker.color;part.add(surface);stickers.push(surface);
    }
    pieces.set(piece.id,part);
  }
  function sync(next){
    for(const piece of next){
      const part=pieces.get(piece.id);group.add(part);part.position.set(...piece.position);part.quaternion.identity();
      piece.stickers.forEach((sticker,index)=>{
        const surface=part.children[index+1],normal=new THREE.Vector3(...sticker.normal);
        surface.position.copy(normal).multiplyScalar(.474);
        surface.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
        surface.userData.face=faceFromNormal(sticker.normal);
      });
    }
    group.updateMatrixWorld(true);
  }
  sync(state);
  return {group,stickers,pieces,sync,dispose(){bodyGeometry.dispose();stickerGeometry.dispose();plastic.dispose();for(const material of [...Object.values(colors),...Object.values(labelMaterials)]){material.map?.dispose();material.dispose();}}};
}
