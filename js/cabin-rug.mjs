import * as THREE from './vendor/three.module.min.js';

const WIDTH=2.8,DEPTH=1.87;

/** A wool kilim: the ornament and yarn share one surface, rather than stacked tiles. */
function wovenMaps(){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=684;
  const c=canvas.getContext('2d');c.scale(2,2);
  const ink='#303f39',teal='#405952',rust='#98543e',ochre='#b98a57',cream='#d2b88a';
  const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  function diamond(x,y,rx,ry,color,step=3){
    c.fillStyle=color;
    // Stepped edges follow the warp and weft, including the larger medallions.
    for(let v=-ry;v<ry;v+=step){
      const half=Math.max(step/2,Math.round(rx*(1-Math.abs(v+step/2)/ry)/step)*step);
      c.fillRect(x-half,y+v,half*2,step);
    }
  }
  function star(x,y,size,color){
    rect(x-size/3,y-size,size*2/3,size*2,color);
    rect(x-size,y-size/3,size*2,size*2/3,color);
    diamond(x,y,size*.8,size*.8,color,2);
  }
  // Quiet guard stripes isolate the busier border from the large field shapes.
  for(const[inset,color]of[[0,'#5a3a2f'],[4,cream],[7,rust],[11,cream],[14,teal],[37,cream],[40,rust],[45,cream],[51,ink],[55,rust]]){
    rect(inset,inset,512-inset*2,342-inset*2,color);
  }
  // The border turns the same small flower around all four edges.
  function borderFlower(x,y){
    diamond(x,y,8,8,ochre,2);diamond(x,y,5,5,cream,1);rect(x-1.5,y-1.5,3,3,rust);
    for(const s of [-1,1]){rect(x+s*11-1,y-1,2,2,cream);rect(x-1,y+s*11-1,2,2,cream);}
  }
  for(let x=48;x<=464;x+=26){borderFlower(x,25);borderFlower(x,317);}
  for(let y=53;y<=289;y+=26){borderFlower(25,y);borderFlower(487,y);}
  for(const x of [25,487])for(const y of [25,317]){star(x,y,8,cream);rect(x-2,y-2,4,4,rust);}
  for(let x=58;x<456;x+=12)for(const y of [47,295])diamond(x,y,2,2,teal,1);
  for(let y=59;y<284;y+=12)for(const x of [47,465])diamond(x,y,2,2,teal,1);

  // Three linked, hooked medallions are legible even at the cabin's resolution.
  rect(74,168,364,6,ochre);
  for(const[x,middle]of[[128,false],[256,true],[384,false]]){
    diamond(x,171,63,101,ink);
    diamond(x,171,59,96,middle?ochre:cream);
    diamond(x,171,50,85,teal);
    diamond(x,171,40,68,ink);
    diamond(x,171,36,63,middle?cream:ochre);
    diamond(x,171,29,53,rust);
    diamond(x,171,23,43,middle?teal:ink);
    star(x,171,13,cream);diamond(x,171,5,7,rust,1);
    for(const s of [-1,1]){
      // Ram's-horn pairs, woven into the shoulders rather than floating over them.
      for(const t of [-1,1]){
        const hx=x+s*34,hy=171+t*33;
        rect(hx-2,hy-9,4,18,cream);rect(hx-2,hy+t*7-2,s*10,4,cream);
        rect(hx+s*8-2,hy+t*7-2,4,-t*8,cream);
      }
      diamond(x,171+s*74,3,5,rust,1);
    }
  }
  for(const x of [66,192,320,446])for(const y of [85,257]){
    star(x,y,9,ochre);diamond(x,y,4,5,ink,1);rect(x-1,y-1,2,2,cream);
  }

  // A few dye-lot changes across the weft give the wool an understated abrash.
  c.fillStyle='rgba(220,184,130,.045)';
  for(const[y,h]of[[64,11],[122,5],[208,13],[274,6]])c.fillRect(5,y,502,h);
  c.setTransform(1,0,0,1,0,0);
  const pixels=c.getImageData(0,0,canvas.width,canvas.height),data=pixels.data;
  const bump=document.createElement('canvas');bump.width=canvas.width;bump.height=canvas.height;
  const b=bump.getContext('2d'),relief=b.createImageData(bump.width,bump.height);
  let seed=93271;
  const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
    const i=(y*canvas.width+x)*4;
    const thread=((x+((y>>1)%2)*2)%4<2?1:-1)*(y%2?1:-1);
    const fiber=noise()-.5,variation=thread*3+fiber*7+(y%6===0?-3:0);
    // Slightly worn pile along the exposed middle, without fake stains or tears.
    const wear=Math.exp(-((x-540)**2/110000+(y-410)**2/18000))*.04;
    for(let k=0;k<3;k++)data[i+k]=Math.min(255,data[i+k]+variation+wear*(190-data[i+k]));
    const height=128+thread*22+fiber*19;
    relief.data[i]=relief.data[i+1]=relief.data[i+2]=height;relief.data[i+3]=255;
  }
  c.putImageData(pixels,0,0);b.putImageData(relief,0,0);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
  const bumpMap=new THREE.CanvasTexture(bump);bumpMap.anisotropy=4;
  return {map,bumpMap};
}

/** Ready to add to the cabin; the underside sits on the existing floor at y=.47. */
export function createCabinRug(){
  const rug=new THREE.Group();rug.name='Handwoven wool cabin rug';rug.position.set(.13,.482,.56);
  const {map,bumpMap}=wovenMaps();
  const cloth=new THREE.MeshStandardMaterial({map,bumpMap,bumpScale:.0013,roughness:1});
  const backing=new THREE.MeshStandardMaterial({color:'#604331',roughness:1});
  const yarn=new THREE.MeshStandardMaterial({color:'#c5b18b',roughness:1,side:THREE.DoubleSide});
  function surfaceY(x,z){
    // Only the bound edges undulate; chair legs still rest on a nearly flat weave.
    const edge=Math.max(Math.abs(x)/(WIDTH/2),Math.abs(z)/(DEPTH/2));
    return .011+Math.pow(edge,10)*(.0015+Math.sin(x*14+z*9)*.0015);
  }
  const geometry=new THREE.PlaneGeometry(WIDTH,DEPTH,36,24);geometry.rotateX(-Math.PI/2);
  const positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++)positions.setY(i,surfaceY(positions.getX(i),positions.getZ(i)));
  geometry.computeVertexNormals();
  const top=new THREE.Mesh(geometry,cloth);top.receiveShadow=true;rug.add(top);

  // A narrow fabric edge, with no tall, layered plinth beneath the pattern.
  const boundary=[];
  for(let i=0;i<=36;i++)boundary.push([-WIDTH/2+i*WIDTH/36,-DEPTH/2]);
  for(let i=1;i<=24;i++)boundary.push([WIDTH/2,-DEPTH/2+i*DEPTH/24]);
  for(let i=1;i<=36;i++)boundary.push([WIDTH/2-i*WIDTH/36,DEPTH/2]);
  for(let i=1;i<24;i++)boundary.push([-WIDTH/2,DEPTH/2-i*DEPTH/24]);
  const sides=[];
  for(let i=0;i<boundary.length;i++){
    const[a,z]=boundary[i],[b,w]=boundary[(i+1)%boundary.length],ay=surfaceY(a,z),by=surfaceY(b,w);
    sides.push(a,-.011,z,a,ay,z,b,by,w,a,-.011,z,b,by,w,b,-.011,w);
  }
  const edgeGeometry=new THREE.BufferGeometry();edgeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(sides,3));edgeGeometry.computeVertexNormals();
  const edge=new THREE.Mesh(edgeGeometry,backing);edge.castShadow=edge.receiveShadow=true;rug.add(edge);

  // Knotted warp ends branch into three soft threads, batched into one mesh.
  const fringe=[];
  function ribbon(points,width){
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i];
      const length=Math.hypot(b[0]-a[0],b[2]-a[2]);
      const dx=-(b[2]-a[2])/length*width,dz=(b[0]-a[0])/length*width;
      fringe.push(a[0]-dx,a[1],a[2]-dz,b[0]-dx,b[1],b[2]-dz,a[0]+dx,a[1],a[2]+dz,a[0]+dx,a[1],a[2]+dz,b[0]-dx,b[1],b[2]-dz,b[0]+dx,b[1],b[2]+dz);
    }
  }
  // Warp runs along the long dimension; fringe belongs only on the short x ends.
  for(const sign of [-1,1])for(let i=0;i<38;i++){
    const x=sign*WIDTH/2,z=-DEPTH/2+.035+i*(DEPTH-.07)/37;
    const sway=Math.sin(i*2.7+sign)*.008,length=.067+(Math.sin(i*4.31)+1)*.014;
    ribbon([[x-sign*.01,.006,z],[x+sign*.018,.004,z],[x+sign*.035,-.003,z+sway]],.006);
    for(let strand=-1;strand<=1;strand++){
      const drift=sway+strand*.008;
      ribbon([[x+sign*.03,-.003,z+strand*.003],[x+sign*length*.7,-.007,z+drift*.6],[x+sign*(length-Math.abs(strand)*.007),-.008,z+drift]],.0019);
    }
  }
  const fringeGeometry=new THREE.BufferGeometry();fringeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(fringe,3));fringeGeometry.computeVertexNormals();
  const tassels=new THREE.Mesh(fringeGeometry,yarn);tassels.castShadow=tassels.receiveShadow=true;rug.add(tassels);
  return rug;
}
