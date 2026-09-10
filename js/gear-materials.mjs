import * as THREE from './vendor/three.module.min.js';

let reflections;
// A soft room reflection gives small anodized parts readable edges under cabin lights.
// Generated pixels describe illumination, never the silhouette of a piece of gear.
export function finishGearMaterials(group){
  if(!reflections){
    const width=128,height=64,data=new Uint8Array(width*height*4);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const u=x/width,v=y/height,sky=Math.max(0,1-v*1.7);
      const window=Math.exp(-Math.pow((u-.28)/.08,8)-Math.pow((v-.43)/.3,8));
      const lamp=Math.exp(-Math.pow((u-.78)/.13,4)-Math.pow((v-.3)/.2,4));
      const base=[46+sky*72,52+sky*69,46+sky*64];
      for(let c=0;c<3;c++)data[(y*width+x)*4+c]=Math.min(255,base[c]+window*[152,158,158][c]+lamp*[132,107,67][c]);
      data[(y*width+x)*4+3]=255;
    }
    reflections=new THREE.DataTexture(data,width,height);reflections.mapping=THREE.EquirectangularReflectionMapping;
    reflections.colorSpace=THREE.SRGBColorSpace;reflections.needsUpdate=true;
  }
  group.traverse(object=>{
    if(!object.isMesh)return;object.castShadow=true;object.receiveShadow=true;
    for(const material of Array.isArray(object.material)?object.material:[object.material])if(material.metalness>.1){material.envMap=reflections;material.envMapIntensity=.8;}
  });
  return group;
}
