import * as THREE from './vendor/three.module.min.js';

// A butterfly-style hank: separate hanging bights gathered by the rope itself.
// UVs follow the length of each strand, so its sheath follows every bend.
function sheathTexture(colorway){
  const size=128,data=new Uint8Array(size*size*4);
  const colors=colorway==='teal'
    ? {body:[57,119,120],light:[191,185,152],dark:[43,66,70]}
    : {body:[191,91,43],light:[205,167,116],dark:[71,83,76]};
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const along=x/size,around=y/size;
    const a=around*12+along*4,b=around*12-along*4;
    const row=Math.floor(a),column=Math.floor(b);
    const over=((row+column)%2+2)%2===0;
    const phase=over?a-row:b-column;
    const tracer=((over?row:column)%12+12)%12;
    const fleck=phase>.29&&phase<.68;
    const base=tracer===2&&fleck?colors.light:tracer===8&&fleck?colors.dark:colors.body;
    const ridge=.84+.16*Math.sin(phase*Math.PI);
    const filament=.94+.06*Math.cos(phase*Math.PI*8);
    const index=(y*size+x)*4;
    for(let c=0;c<3;c++)data[index+c]=Math.round(base[c]*ridge*filament);
    data[index+3]=255;
  }
  const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.magFilter=THREE.LinearFilter;
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps=true;texture.anisotropy=4;texture.needsUpdate=true;
  return texture;
}

export function createClimbingRope({colorway='rust'}={}){
  const group=new THREE.Group();group.name='Butterfly-coiled climbing rope';
  const map=sheathTexture(colorway),hankScale=colorway==='teal'?.95:1;
  const sheath=new THREE.MeshStandardMaterial({map,roughness:.91,metalness:0});
  const endMaterial=new THREE.MeshStandardMaterial({color:'#303f40',roughness:.74});
  const radius=.0049;
  function strand(points,segments=76,closed=false,name='Rope bight'){
    const curve=new THREE.CatmullRomCurve3(points.map(([x,y,z])=>new THREE.Vector3(x*hankScale,y*hankScale,z)),closed,'centripetal');
    const geometry=new THREE.TubeGeometry(curve,segments,radius,7,closed);
    const uv=geometry.attributes.uv,length=curve.getLength();
    for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*length/.026);
    const mesh=new THREE.Mesh(geometry,sheath);mesh.name=name;
    mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
    return {mesh,curve};
  }
  // The two rows make a substantial coil, not a stack of coplanar oval rings.
  // Small deviations describe how a real hank settles under its own weight.
  for(let layer=0;layer<2;layer++)for(let i=0;i<9;i++){
    const t=i/8,center=-.085+t*.17+layer*.004*Math.cos(i*1.7);
    const height=.528+.028*Math.sin(i*1.71+layer*.7)+layer*.017;
    const half=.037+.008*Math.sin(i*1.9+.9);
    const z=.019+layer*.046+i*.003;
    const neck=(i-4)*.0065;
    strand([
      [neck-.012,-.056,z],[neck-.021,-.020,z+.008],
      [neck-.006,-.004+layer*.002,z+.014],[neck+.019,-.017,z+.012],
      [neck+.023,-.061,z+.003],[neck+.028,-.137,z],
      [center+half*.91,-.226,z+.01],
      [center+half,-height+.075,z+.012],
      [center+half*.64,-height+.015,z+.019],
      [center-.003,-height,z+.023],
      [center-half*.76,-height+.021,z+.022],
      [center-half,-height+.091,z+.014],
      [center-half*.86,-.233,z+.002],
      [neck-.021,-.133,z-.003]
    ],76,true,`Hanging rope bight ${layer*9+i+1}`);
  }
  // Five snug rope turns lock the hank below the folded hanging crown.
  const neckWrap=[];
  for(let i=0;i<=175;i++){
    const t=i/175,a=t*Math.PI*10;
    neckWrap.push([Math.sin(a)*.062,-.079-t*.055,.058+Math.cos(a)*.057]);
  }
  strand(neckWrap,175,false,'Five-turn gathering wrap');
  // A securing tuck crosses the wraps and feeds back through the upper bight.
  strand([[0,-.137,.116],[.040,-.129,.119],[.052,-.090,.114],
    [.014,-.062,.110],[-.035,-.048,.097],[-.046,-.066,.087],
    [-.020,-.094,.110],[.016,-.146,.115]],46,false,'Securing tuck');
  const tails=[
    [[.017,-.146,.115],[.055,-.205,.123],[.069,-.325,.126],
      [.052,-.432,.129],[.073,-.537,.123],[.072,-.638,.116]],
    [[-.021,-.111,.108],[-.047,-.171,.120],[-.027,-.262,.125],
      [-.041,-.387,.128],[-.021,-.487,.120],[-.026,-.589,.120]]
  ];
  tails.forEach((points,index)=>{
    const {curve}=strand(points,56,false,`Rope end ${index+1}`);
    const end=curve.getPoint(1),tangent=curve.getTangent(1);
    const sleeve=new THREE.Mesh(new THREE.CylinderGeometry(.00525,.00525,.026,8),endMaterial);
    sleeve.name='Heat-shrink rope end';sleeve.position.copy(end).addScaledVector(tangent,-.012);
    sleeve.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tangent);group.add(sleeve);
    const cap=new THREE.Mesh(new THREE.CircleGeometry(.0047,8),endMaterial);
    cap.position.copy(end).addScaledVector(tangent,.001);
    cap.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),tangent);group.add(cap);
  });
  // Leave enough separation from the pegboard for the back strands to cast shadows.
  for(const part of group.children)part.position.z+=.008;
  group.userData.item='rope';
  group.userData.colorway=colorway;
  return group;
}
