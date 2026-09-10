import * as THREE from './vendor/three.module.min.js';

const materials=new Map(),geometries=new Map();
function metal(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,metalness:.78,roughness:.29}));return materials.get(color);}
const silver=metal('#bec8ca'),steel=metal('#cfd6d3'),gateMetal=metal('#576769');
const rubber=new THREE.MeshStandardMaterial({color:'#262e30',roughness:.94});
const threadRed=new THREE.MeshStandardMaterial({color:'#ad493b',roughness:.92});
const threadBlue=new THREE.MeshStandardMaterial({color:'#3c7d99',roughness:.92});
const edgeThread=new THREE.MeshStandardMaterial({color:'#e2dccb',roughness:.96});
const up=new THREE.Vector3(0,1,0);
function add(parent,geometry,material,name){const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function rod(parent,a,b,r,material,name,segments=8){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),direction=end.clone().sub(start);const mesh=add(parent,new THREE.CylinderGeometry(r,r,direction.length(),segments),material,name);mesh.position.copy(start).add(end).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(up,direction.normalize());return mesh;}
function tube(parent,points,r,material,name,segments=20,radial=6){return add(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),segments,r,radial,false),material,name);}

// Swept forged stock: the broad faces really are recessed between the two rims.
// This open C-shaped body stops at a hinge and keylock nose, leaving a gate opening.
function stockGeometry(locking){
  const key='stock-'+locking;if(geometries.has(key))return geometries.get(key);
  const points=locking?[
    [-.025,.023,0],[-.017,.041,0],[.010,.048,0],[.026,.038,0],
    [.027,.011,0],[.024,-.026,0],[.010,-.045,0],[-.012,-.040,0],[-.022,-.027,0]
  ]:[
    [-.025,.019,0],[-.020,.033,0],[.009,.048,0],[.025,.043,0],
    [.027,.015,0],[.026,-.027,0],[.013,-.046,0],[-.010,-.041,0],[-.021,-.025,0]
  ];
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');
  const profile=[[-1,-.55],[-.78,-1],[-.48,-.58],[.48,-.58],[.78,-1],[1,-.55],[1,.55],[.78,1],[.48,.58],[-.48,.58],[-.78,1],[-1,.55]];
  const positions=[],uv=[],indices=[],steps=44;
  for(let i=0;i<=steps;i++){
    const t=i/steps,point=curve.getPoint(t),tangent=curve.getTangent(t),normal=new THREE.Vector3(-tangent.y,tangent.x,0);
    const radius=.0045+.0008*Math.sin(Math.PI*t);
    for(let j=0;j<profile.length;j++){const [across,depth]=profile[j];positions.push(point.x+normal.x*across*radius,point.y+normal.y*across*radius,depth*.0046);uv.push(t,j/profile.length);}
    if(i<steps)for(let j=0;j<profile.length;j++){const a=i*12+j,b=i*12+(j+1)%12,c=(i+1)*12+j,d=(i+1)*12+(j+1)%12;indices.push(a,b,c,b,d,c);}
  }
  // Flat end faces are almost completely covered by the hinge and nose forging.
  for(let j=1;j<11;j++){indices.push(0,j+1,j);const s=steps*12;indices.push(s,s+j,s+j+1);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometries.set(key,geometry);return geometry;
}

function knurlTexture(){
  if(geometries.has('knurl'))return geometries.get('knurl');
  const size=64,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const a=((x+y)%16)/16,b=((x-y+128)%16)/16;const h=Math.min(Math.abs(a-.5),Math.abs(b-.5));const v=110+Math.round(h*260);const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}
  const map=new THREE.DataTexture(data,size,size);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(3,1);map.needsUpdate=true;geometries.set('knurl',map);return map;
}

function knurledSleeveGeometry(){
  if(geometries.has('sleeve'))return geometries.get('sleeve');
  const positions=[],uv=[],columns=28,rows=8;
  const vertex=(u,v,r)=>[Math.sin(u*Math.PI*2)*r,(v-.5)*.021,Math.cos(u*Math.PI*2)*r];
  const triangle=(a,b,c)=>{positions.push(...a,...b,...c);uv.push(0,0,1,0,.5,1);};
  for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
    const u=(column+row*.5)/columns,v=row/rows;
    const corners=[vertex(u,v,.006),vertex(u+1/columns,v,.006),vertex(u+1.5/columns,v+1/rows,.006),vertex(u+.5/columns,v+1/rows,.006)];
    const tip=vertex(u+.75/columns,v+.5/rows,.00642);
    for(let i=0;i<4;i++)triangle(corners[i],corners[(i+1)%4],tip);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();geometries.set('sleeve',geometry);return geometry;
}

/** A nominal 105 mm carabiner. +Z faces the viewer; the gate sits on the left. */
export function createCarabiner({locking=false,wire=false,color=locking?'#69767b':'#b66b35',bent=false}={}){
  const group=new THREE.Group();group.name=locking?'Screw-lock HMS carabiner':wire?'Wiregate climbing carabiner':'Keylock climbing carabiner';
  const body=metal(color);add(group,stockGeometry(locking),body,'Forged I-beam spine and baskets');
  const hinge=locking?[-.022,-.027,0]:[-.021,-.025,0],nose=locking?[-.025,.023,0]:[-.025,.019,0];
  if(wire){
    // One bent spring wire with separate front/rear legs, seated in offset pin holes.
    tube(group,[[-.020,-.027,.0034],[-.020,-.019,.0034],[-.025,.010,.0034],[-.026,.019,.0034],[-.026,.021,0],[-.026,.019,-.0034],[-.025,.010,-.0034],[-.020,-.017,-.0034],[-.019,-.024,-.0034]],.00105,steel,'Bent stainless spring-wire gate',20,6);
    for(const z of [-.0049,.0049]){const pin=add(group,new THREE.CylinderGeometry(.0014,.0014,.0009,8),gateMetal,'Wire hinge socket');pin.rotation.x=Math.PI/2;pin.position.set(hinge[0],hinge[1],z);}
  }else{
    const middle=[(hinge[0]+nose[0])/2+(bent?.0045:0),(hinge[1]+nose[1])/2,0];
    tube(group,[hinge,middle,nose],.0032,locking?gateMetal:silver,bent?'Bent solid gate':'Straight solid gate',10,8);
    if(locking){
      const a=new THREE.Vector3(...hinge),b=new THREE.Vector3(...nose),direction=b.clone().sub(a).normalize();
      const sleeveMaterial=metal('#b58b38');sleeveMaterial.bumpMap=knurlTexture();sleeveMaterial.bumpScale=.0007;
      const sleeve=add(group,knurledSleeveGeometry(),sleeveMaterial,'Diamond-knurled brass locking sleeve');sleeve.position.copy(a).lerp(b,.57);sleeve.quaternion.setFromUnitVectors(up,direction);
      for(const offset of [-.0065,.0065]){const band=add(group,new THREE.TorusGeometry(.00615,.00042,4,18),metal('#7f6634'),'Screw-sleeve dividing groove');band.position.copy(sleeve.position).addScaledVector(direction,offset);band.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction);}
    }
    for(const z of [-.005,.005]){const pin=add(group,new THREE.CylinderGeometry(.0016,.0016,.0011,10),steel,'Gate hinge rivet');pin.rotation.x=Math.PI/2;pin.position.set(hinge[0],hinge[1],z);}
  }
  // A small keylock nose cap is distinct from the spring gate beneath it.
  const noseCap=add(group,new THREE.SphereGeometry(.00455,8,6),body,'Rounded keylock nose');noseCap.position.set(...nose);noseCap.scale.set(.85,1.2,1);
  return group;
}

function wovenMaterial(){
  if(materials.has('woven'))return materials.get('woven');
  const size=64,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const warp=(x%4<2)===(y%4<2),value=(warp?216:185)+(y%8===0?8:0);const i=(y*size+x)*4;data[i]=value;data[i+1]=value+2;data[i+2]=value;data[i+3]=255;}
  const map=new THREE.DataTexture(data,size,size);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(1,7);map.needsUpdate=true;
  const material=new THREE.MeshStandardMaterial({map,roughness:.98,side:THREE.DoubleSide});materials.set('woven',material);return material;
}

function dogbone(parent,top,bottom,thread){
  const x=.008,front=.0085,back=-.0085,r=.0085;
  // A continuous closed strip doubles back behind the stock at both ends.
  const centerline=[];
  for(let i=0;i<=12;i++)centerline.push([top+(bottom-top)*i/12,front]);
  for(let i=1;i<=8;i++){const a=i/8*Math.PI;centerline.push([bottom-Math.sin(a)*r,Math.cos(a)*r]);}
  for(let i=1;i<=12;i++)centerline.push([bottom+(top-bottom)*i/12,back]);
  for(let i=1;i<=8;i++){const a=Math.PI+i/8*Math.PI;centerline.push([top-Math.sin(a)*r,Math.cos(a)*r]);}
  const positions=[],uv=[],indices=[];
  for(let i=0;i<centerline.length;i++){
    const [y,z]=centerline[i],t=Math.max(0,Math.min(1,(y-top)/(bottom-top))),half=.0102+.0023*Math.sin(t*Math.PI);
    positions.push(x-half,y,z,x+half,y,z);uv.push(0,i/centerline.length,1,i/centerline.length);
    const n=(i+1)%centerline.length;indices.push(i*2,i*2+1,n*2,i*2+1,n*2+1,n*2);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();add(parent,geometry,wovenMaterial(),'Continuous doubled woven dogbone');
  const length=top-bottom;
  for(let i=0;i<7;i++){
    const y=top-.023-i*(length-.047)/6;
    for(let j=0;j<5;j++){const tack=add(parent,new THREE.BoxGeometry(.0018,.0034,.00045),thread,'Dense colored bar-tack thread');tack.position.set(x+(j-2)*.0027,y,.0091);tack.rotation.z=(j%2?1:-1)*.18;}
  }
  // Double stitched selvage follows the slightly wider middle of the webbing.
  for(const side of [-1,1]){
    const points=[];for(let i=0;i<=10;i++){const t=i/10;points.push([x+side*(.0089+.0023*Math.sin(t*Math.PI)),top-.012+(bottom-top+.024)*t,.009]);}
    tube(parent,points,.00048,edgeThread,'Webbing edge stitching',10,4);
  }
  const keeper=add(parent,new THREE.BoxGeometry(.026,.023,.0195),rubber,'Moulded rubber lower-carabiner keeper');keeper.position.set(x,bottom+.003,0);
  // Its front panel sits below the last bar tack, retaining the biner basket.
  const keeperMark=add(parent,new THREE.BoxGeometry(.004,.008,.0007),thread,'Small keeper stitch-color marker');keeperMark.position.set(x,bottom+.003,.0102);
}

// Bake identical static materials into batches, keeping the twelve carabiner
// silhouettes and sewn construction but avoiding hundreds of tiny draw calls.
function batchMeshes(group){
  group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),batches=new Map();
  group.traverse(mesh=>{if(!mesh.isMesh)return;const transform=inverse.clone().multiply(mesh.matrixWorld);const geometry=(mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone()).applyMatrix4(transform);let batch=batches.get(mesh.material);if(!batch){batch={position:[],normal:[],uv:[]};batches.set(mesh.material,batch);}for(const key of ['position','normal','uv']){const attribute=geometry.getAttribute(key);if(attribute)batch[key].push(...attribute.array);else if(key==='uv')batch.uv.push(...new Array(geometry.attributes.position.count*2).fill(0));}geometry.dispose();});
  const nodes=[];for(const child of group.children){if(child.userData.hangingPoint){const peg=new THREE.Object3D();peg.name=child.name;peg.userData={...child.userData};nodes.push(peg);}}
  group.clear();if(nodes.length)group.add(...nodes);
  for(const [material,attributes]of batches){const geometry=new THREE.BufferGeometry();for(const key of ['position','normal','uv'])geometry.setAttribute(key,new THREE.Float32BufferAttribute(attributes[key],key==='uv'?2:3));add(group,geometry,material,'Batched quickdraw '+(material.name||material.color?.getHexString()||'webbing'));}
}

/** Six 12–16 cm sport draws sharing three pegs in groups of one, two and three. */
export function createQuickdrawRack(){
  const rack=new THREE.Group();rack.name='Six quickdraws stacked on three pegs';
  const lengths=[.153,.134,.160,.145,.155,.132];let index=0;
  [-.12,0,.12].forEach((x,pegIndex)=>{
    const peg=new THREE.Group();peg.name=`Quickdraw peg ${pegIndex+1}`;
    peg.userData.hangingPoint=[x,0,.045];peg.userData.drawCount=pegIndex+1;rack.add(peg);
    for(let layer=0;layer<=pegIndex;layer++,index++){
      // Every crown rests on the same peg axis. The depth spacing clears both
      // the wire gates and the thicker rubber keeper further down each draw.
      const pivot=new THREE.Group();pivot.position.set(x,0,.017+layer*.023);
      pivot.rotation.z=pegIndex===0?-.025:(layer-pegIndex/2)*.060;
      pivot.rotation.y=(layer%2?1:-1)*.018;peg.add(pivot);
      const draw=new THREE.Group();draw.name=`Quickdraw ${index+1}`;
      draw.position.set(-.0065,.005,0);pivot.add(draw);
      const upper=createCarabiner({wire:true,color:index===5?'#626e70':'#b8c2c5'});upper.position.y=-.048;draw.add(upper);
      const bottomCenter=-.096-lengths[index]-.045;
      const lower=createCarabiner({wire:true,color:index%3===0?'#bc742e':'#28718e'});lower.rotation.x=Math.PI;lower.position.set(0,bottomCenter,0);draw.add(lower);
      dogbone(draw,-.091,bottomCenter+.045,index%3===0?threadRed:threadBlue);
    }
  });
  rack.userData.hangingPoints=rack.children.map(peg=>peg.userData.hangingPoint);
  rack.userData.drawCounts=[1,2,3];
  batchMeshes(rack);return rack;
}

/** Lockers threaded onto one projecting peg, origin at its hanging axis. */
export function createCarabinerStack({count=5,color='#69767b'}={}){
  const stack=new THREE.Group();stack.name='Stack of screw-lock carabiners';
  const total=Math.max(1,Math.min(8,Math.floor(count)));
  // Alternating small rolls fan the lower baskets; separate depth planes keep
  // the five gates and locking sleeves mechanically separate.
  const template=createCarabiner({locking:true,color});
  for(let i=0;i<total;i++){
    const pivot=new THREE.Group();pivot.position.set(0,0,.010+i*.0175);
    pivot.rotation.z=(i-(total-1)/2)*.043;
    pivot.rotation.y=(i%2?1:-1)*.012;stack.add(pivot);
    const biner=template.clone();biner.name=`Locking carabiner ${i+1}`;
    biner.position.set(-.0065,-.043,0);pivot.add(biner);
  }
  stack.userData.hangingPoint=[0,0,.010+(total-1)*.0175/2];
  stack.userData.hangingPoints=[stack.userData.hangingPoint];stack.userData.count=total;
  batchMeshes(stack);return stack;
}
