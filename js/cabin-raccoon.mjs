import * as THREE from './vendor/three.module.min.js';

/** A quiet visitor sheltering under the three firs left of the cabin. */
export function createRaccoon(scene) {
  const group=new THREE.Group();group.name='Raccoon hiding under the firs';group.scale.setScalar(.82);scene.add(group);
  const materials=new Map();
  const material=color=>{
    if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.92,flatShading:true}));
    return materials.get(color);
  };
  function mesh(geometry,color,parent=group){const m=new THREE.Mesh(geometry,material(color));m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  const sphere=new THREE.SphereGeometry(1,10,7);
  function oval(size,position,color,parent=group){const m=mesh(sphere,color,parent);m.scale.set(...size);m.position.set(...position);return m;}
  const body=new THREE.Group();group.add(body);
  oval([.144,.154,.259],[0,.198,-.066],'#727670',body);
  oval([.151,.136,.155],[0,.184,-.216],'#676d66',body);
  oval([.123,.12,.133],[0,.215,.12],'#7d8178',body);
  oval([.099,.078,.139],[0,.13,.088],'#acada0',body);
  // A few broad fur facets distinguish the softly arched, grizzled back.
  for(const [x,z,s] of [[-.061,-.17,1],[.063,-.10,.9],[0,.055,.8]]){
    const tuft=mesh(new THREE.IcosahedronGeometry(.077,0),'#85897e',body);tuft.position.set(x,.308,z);tuft.scale.set(.67,.45,s);
  }
  const legs=[];
  for(const side of [-1,1])for(const rear of [false,true]){
    const leg=new THREE.Group();leg.position.set(side*(rear?.108:.102),.141,rear?-.222:.132);group.add(leg);legs.push(leg);
    oval([rear?.047:.037,.077,.041],[0,-.052,0],'#4f5851',leg);
    oval([.041,.025,.066],[0,-.110,.022],'#2d3832',leg);
    // Three tiny toes catch a little light when a paw steps into the clearing.
    for(let toe=-1;toe<=1;toe++)oval([.008,.010,.014],[toe*.021,-.115,.073],'#657066',leg);
  }

  const head=new THREE.Group();head.position.set(0,.286,.234);body.add(head);
  oval([.131,.106,.119],[0,0,0],'#94988e',head);
  for(const side of [-1,1]){
    const ear=oval([.046,.062,.028],[side*.093,.091,-.014],'#515e54',head);ear.rotation.z=-side*.24;
    const rim=oval([.036,.050,.016],[side*.095,.095,.007],'#d0cfb8',head);rim.rotation.z=-side*.24;
    const inner=oval([.023,.034,.013],[side*.096,.094,.019],'#5d655a',head);inner.rotation.z=-side*.24;
    const mask=oval([.070,.039,.040],[side*.065,.001,.084],'#29382f',head);mask.rotation.z=-side*.17;mask.rotation.y=side*.32;
    const brow=oval([.059,.017,.022],[side*.057,.043,.087],'#d1d0bc',head);brow.rotation.z=-side*.13;
    oval([.065,.045,.051],[side*.066,-.052,.080],'#c9c9b3',head);
    oval([.044,.033,.065],[side*.032,-.045,.128],'#ddd9bf',head);
  }
  oval([.023,.052,.024],[0,.018,.105],'#b8bba9',head);
  oval([.026,.018,.018],[0,-.035,.192],'#233229',head);
  oval([.009,.006,.003],[-.007,-.027,.207],'#9aab98',head);
  oval([.041,.012,.016],[0,-.073,.161],'#657564',head);
  const eyes=new THREE.Group();eyes.name='Raccoon eyes';head.add(eyes);
  const eyeMaterial=new THREE.MeshStandardMaterial({color:'#bac4a1',roughness:.28,emissive:'#d7c697',emissiveIntensity:0});
  for(const side of [-1,1]){
    const eye=new THREE.Mesh(sphere,eyeMaterial);eye.scale.set(.012,.015,.009);eye.position.set(side*.061,.011,.123);eyes.add(eye);
    oval([.005,.010,.004],[side*.061,.011,.131],'#16291e',eyes);
    oval([.003,.004,.002],[side*.061-.003,.017,.135],'#f0edd3',eyes);
  }
  const whiskers=[];
  for(const side of [-1,1])for(let i=0;i<2;i++)whiskers.push(
    new THREE.Vector3(side*.051,-.05,.162),new THREE.Vector3(side*(.132+i*.014),-.034-i*.034,.141));
  const whiskerLines=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(whiskers),new THREE.LineBasicMaterial({color:'#8b9985'}));head.add(whiskerLines);

  const tail=new THREE.Group();tail.position.set(0,.184,-.258);group.add(tail);
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(.015,-.02,-.11),new THREE.Vector3(.055,-.032,-.245),new THREE.Vector3(.105,-.02,-.377)]);
  const sections=24,sides=8,tailGeometry=new THREE.TubeGeometry(curve,sections,1,sides,false),frames=curve.computeFrenetFrames(sections,false),tailPosition=tailGeometry.attributes.position;
  for(let i=0;i<=sections;i++){
    const t=i/sections,p=curve.getPointAt(t),r=.060*(1-t*.56),normal=frames.normals[i],binormal=frames.binormals[i];
    for(let j=0;j<=sides;j++){
      const a=j*Math.PI*2/sides;
      tailPosition.setXYZ(i*(sides+1)+j,p.x+r*(-Math.cos(a)*normal.x+Math.sin(a)*binormal.x),p.y+r*(-Math.cos(a)*normal.y+Math.sin(a)*binormal.y),p.z+r*(-Math.cos(a)*normal.z+Math.sin(a)*binormal.z));
    }
  }
  tailGeometry.computeVertexNormals();tailGeometry.clearGroups();
  for(let ring=0;ring<8;ring++)tailGeometry.addGroup(ring*3*sides*6,3*sides*6,ring%2);
  const tailMesh=new THREE.Mesh(tailGeometry,[material('#979c8c'),material('#38483c')]);tailMesh.castShadow=true;tailMesh.receiveShadow=true;tail.add(tailMesh);
  oval([.027,.027,.031],[.105,-.02,-.377],'#38483c',tail);

  // Resting points sit underneath the existing fir canopies. Intermediate
  // points pass behind the left fire seat, keeping both the fire and island
  // edge clear. The visitor retraces this corridor instead of crossing camp.
  const shelters=[[-5.86,3.35],[-6.67,.54],[-5.28,-2.24]],restHeadings=[.68,1.2,.2];
  const corridors=[
    [[-5.86,3.35],[-6.25,2.66],[-6.70,1.58],[-6.67,.54]],
    [[-6.67,.54],[-6.29,-.25],[-5.74,-1.04],[-5.28,-2.24]]
  ];
  let shelter=0,direction=1,phase='rest',elapsed=0,restDuration=6,route=null,routeLength=0,walked=0,gait=0,wasReduced=false,heading=.68;
  function restPose(){
    body.position.y=0;head.rotation.set(0,0,0);tail.rotation.set(0,0,0);eyes.scale.y=1;
    for(const leg of legs){leg.rotation.x=0;leg.position.y=.141;}
  }
  function park(){
    const [x,z]=shelters[shelter];group.position.set(x,.025,z);group.rotation.y=restHeadings[shelter];
    heading=restHeadings[shelter];restPose();
  }
  function beginScamper(){
    if(shelter===2)direction=-1;else if(shelter===0)direction=1;
    const index=direction>0?shelter:shelter-1,points=corridors[index].map(([x,z])=>new THREE.Vector3(x,.025,z));
    if(direction<0)points.reverse();
    route=new THREE.CatmullRomCurve3(points,false,'centripetal');routeLength=route.getLength();walked=0;elapsed=0;phase='walk';
  }
  park();
  return {
    group,
    night(on){eyeMaterial.emissiveIntensity=on?1.25:0;eyeMaterial.color.set(on?'#d5c596':'#bac4a1');},
    animate(seconds,reduced=false,visible=true){
      group.visible=visible;
      if(!visible)return;
      if(reduced){
        if(!wasReduced){phase='rest';elapsed=0;park();}
        wasReduced=true;return;
      }
      wasReduced=false;
      const dt=Number.isFinite(seconds)?Math.min(.1,Math.max(0,seconds)):0;
      elapsed+=dt;
      if(phase==='rest'){
        const turn=THREE.MathUtils.euclideanModulo(restHeadings[shelter]-heading+Math.PI,Math.PI*2)-Math.PI;
        heading+=turn*Math.min(1,dt*4);group.rotation.y=heading;
        // Long still intervals punctuated by a small head turn and blink let
        // the mask and eyes peek through gaps in the low branches.
        head.rotation.y=Math.sin(elapsed*.55)*.20;
        head.rotation.x=Math.sin(elapsed*.7)*.035;
        body.position.y=Math.sin(elapsed*2.2)*.002;
        tail.rotation.y=Math.sin(elapsed*.8)*.035;
        eyes.scale.y=(elapsed%7.7)>7.53?.12:1;
        if(elapsed>=restDuration)beginScamper();
      }else{
        walked=Math.min(routeLength,walked+dt*.67*Math.min(1,elapsed/.4));const t=walked/routeLength,p=route.getPointAt(t),tangent=route.getTangentAt(t);
        const aim=Math.atan2(tangent.x,tangent.z),turn=THREE.MathUtils.euclideanModulo(aim-heading+Math.PI,Math.PI*2)-Math.PI;
        heading+=turn*Math.min(1,dt*7);group.position.copy(p);group.rotation.y=heading;
        gait+=dt*16;body.position.y=Math.sin(gait*2)*.005;
        legs.forEach((leg,i)=>{const swing=Math.sin(gait+(i===0||i===3?0:Math.PI));leg.rotation.x=swing*.34;leg.position.y=.141+Math.max(0,swing)*.013;});
        head.rotation.set(.055,Math.sin(gait*.5)*.035,0);tail.rotation.y=Math.sin(gait*.5)*.085;eyes.scale.y=1;
        if(t===1){shelter+=direction;phase='rest';elapsed=0;restDuration=[16,19,22][shelter];restPose();}
      }
    }
  };
}
