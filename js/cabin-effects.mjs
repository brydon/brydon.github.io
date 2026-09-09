import * as THREE from './vendor/three.module.min.js';

/** Optional discoveries change the little world, never the user's computer. */
export function createCabinEffects(scene,cabin,dog){
  let unlocked=false,nightScene,burstTime=null,petUntil=0,petStarted=0;
  const fireflies=[],ribbons=[],fragments=[];
  const burnMaterials=[],fallingRoof=[],upperWalls=[],blaze=[];
  const dogStart=dog.position.clone();
  const glow=color=>new THREE.MeshBasicMaterial({color,toneMapped:false});
  const particleGeometry=new THREE.IcosahedronGeometry(1,0);
  function jewel(parent,color,size,x,y,z){const m=new THREE.Mesh(particleGeometry,glow(color));m.position.set(x,y,z);m.scale.setScalar(size);parent.add(m);return m;}
  const crown=new THREE.Group();crown.position.set(-.46,.58,.27);crown.rotation.z=-.1;crown.visible=false;dog.add(crown);
  const heartShape=new THREE.Shape();heartShape.moveTo(0,.06);heartShape.bezierCurveTo(-.16,.24,-.3,.02,0,-.18);heartShape.bezierCurveTo(.3,.02,.16,.24,0,.06);
  const heart=new THREE.Mesh(new THREE.ExtrudeGeometry(heartShape,{depth:.045,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.01,bevelThickness:.01}),glow('#df927d'));heart.visible=false;scene.add(heart);
  const gold=new THREE.MeshStandardMaterial({color:'#d9b553',metalness:.55,roughness:.35,flatShading:true});
  const band=new THREE.Mesh(new THREE.CylinderGeometry(.13,.12,.045,8,true),gold);crown.add(band);
  for(let i=0;i<6;i++){const a=i*Math.PI/3,tip=new THREE.Mesh(new THREE.ConeGeometry(.045,.115,4),gold);tip.position.set(Math.cos(a)*.1,.064,Math.sin(a)*.1);crown.add(tip);}
  function unlock(){
    if(unlocked)return;unlocked=true;nightScene=new THREE.Group();nightScene.name='The secret midnight valley';scene.add(nightScene);
    const stars=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.035,0),glow('#d7ecda'),240),matrix=new THREE.Matrix4();
    for(let i=0;i<240;i++){const x=Math.sin(i*127.1)*28,y=7+(Math.sin(i*41.7)*.5+.5)*18,z=-14-(Math.cos(i*59.3)*.5+.5)*17;matrix.makeTranslation(x,y,z);stars.setMatrixAt(i,matrix);}nightScene.add(stars);
    for(let ribbon=0;ribbon<3;ribbon++){
      const vertices=[],colors=[],indices=[];
      for(let i=0;i<=72;i++){
        const x=-70+i*140/72,bottom=9+ribbon*1.3+Math.sin(i*.24+ribbon)*1.4,top=bottom+2.8+Math.sin(i*.33)*.7,z=-19-ribbon*3+Math.cos(i*.23)*1.5;
        vertices.push(x,bottom,z,x,top,z-.2);
        const lower=new THREE.Color(['#65e0ac','#6e9bc8','#a482d6'][ribbon]),upper=new THREE.Color('#273951');
        colors.push(lower.r,lower.g,lower.b,upper.r,upper.g,upper.b);
        if(i<72){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);
      const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.48,side:THREE.DoubleSide,depthWrite:false,toneMapped:false}));nightScene.add(mesh);ribbons.push(mesh);
    }
    // Sagging strings of little 3D bulbs follow the porch and the room ceiling.
    for(const interior of [false,true]){
      const points=[];
      for(let i=0;i<=28;i++){
        const x=-2.2+i*4.4/28,y=(interior?2.95:3.13)-Math.sin(i/28*Math.PI)*.29,z=interior?-1.62:2.47;points.push(new THREE.Vector3(x,y,z));
        if(i%2===0){const bulb=jewel(nightScene,i%4?'#ffd393':'#edb873',.04,x,y-.045,z);bulb.scale.y=.059;}
      }
      const cable=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.009,5,false),new THREE.MeshStandardMaterial({color:'#283b31'}));nightScene.add(cable);
    }
    for(let i=0;i<34;i++){const angle=i*2.4,radius=3.4+(i%8)*.43;const fly=jewel(nightScene,i%3?'#dfd98a':'#95dda3',.022,Math.cos(angle)*radius,.5+(i%6)*.33,Math.sin(angle)*radius);fly.userData.base=fly.position.clone();fireflies.push(fly);}
  }
  const explosion=new THREE.Group();explosion.visible=false;scene.add(explosion);
  for(let i=0;i<24;i++){
    const piece=new THREE.Mesh(new THREE.BoxGeometry(.04+(i%4)*.025,.06,.035),glow(['#efad5b','#34483f','#718b71'][i%3]));piece.userData.velocity=new THREE.Vector3(Math.sin(i*2.4)*1.5,.5+(i%5)*.38,.4+Math.cos(i)*1.1);explosion.add(piece);fragments.push(piece);
  }
  const flash=jewel(explosion,'#ffca82',.1,0,0,0);flash.material=new THREE.MeshBasicMaterial({color:'#ffc783',transparent:true,opacity:.8,depthWrite:false});
  const burstGlow=new THREE.PointLight('#ffae58',0,5,2);explosion.add(burstGlow);
  const inferno=new THREE.Group();inferno.name='Cartoon cabin meltdown';inferno.visible=false;scene.add(inferno);
  for(let i=0;i<24;i++){
    const a=i*Math.PI*2/24,x=Math.cos(a)*2.52,z=Math.sin(a)*2.3;
    const flame=new THREE.Group();flame.position.set(x,.42+(i%4===0?2.4:0),z);inferno.add(flame);
    const orange=new THREE.Mesh(new THREE.ConeGeometry(.39,2.5,5),glow('#e88332'));orange.position.y=1.25;flame.add(orange);
    const goldFlame=new THREE.Mesh(new THREE.ConeGeometry(.25,1.55,5),glow('#ffc65a'));goldFlame.position.set(.03,.78,.1);flame.add(goldFlame);blaze.push(flame);
  }
  const blazeLight=new THREE.PointLight('#ff9446',0,14,2);blazeLight.position.set(0,3,2);inferno.add(blazeLight);
  return {
    unlock,
    night(on){if(nightScene)nightScene.visible=on;},
    administrator(){crown.visible=true;petUntil=performance.now()+7000;},
    pet(){petStarted=performance.now();petUntil=petStarted+3500;heart.visible=true;},
    explode(){
      burstTime=performance.now();explosion.position.set(.56,1.64,-1.25);explosion.visible=true;inferno.visible=true;
      cabin.traverse(object=>{
        if(object.isMesh&&object.material?.isMeshStandardMaterial){object.material=object.material.clone();burnMaterials.push({material:object.material,color:object.material.color.clone()});}
        if(object.userData.burnRoof)fallingRoof.push({object,y:object.position.y,rotation:object.rotation.z});
        if(object.userData.burnWall&&object.position.y>1.4)upperWalls.push(object);
      });
    },
    animate(time,reducedMotion){
      if(unlocked&&!reducedMotion){
        ribbons.forEach((r,i)=>{r.position.y=Math.sin(time*.00022+i)*.5;r.material.opacity=.42+Math.sin(time*.0003+i)*.08;});
        fireflies.forEach((fly,i)=>{const b=fly.userData.base;fly.position.set(b.x+Math.sin(time*.0007+i)*.15,b.y+Math.sin(time*.0011+i)*.17,b.z+Math.cos(time*.0005+i)*.15);fly.scale.setScalar(.015+(Math.sin(time*.002+i)*.5+.5)*.02);});
      }
      if(time<petUntil){
        const t=(time-petStarted)/1000;dog.rotation.z=reducedMotion?0:Math.sin(time*.008)*.014;
        dog.userData.tail.rotation.y=reducedMotion?0:Math.sin(time*.018)*.35;
        dog.userData.head.rotation.x=reducedMotion?-.12:-Math.sin(Math.min(1,t/.5)*Math.PI/2)*.18;
        if(heart.visible){heart.position.copy(dog.position).add(new THREE.Vector3(-.36,.96+(reducedMotion?0:Math.min(t,2)*.14),.35));heart.scale.setScalar(.42);heart.rotation.y=.2;}
      }else{dog.rotation.z=0;dog.userData.tail.rotation.y=0;dog.userData.head.rotation.x=0;heart.visible=false;}
      if(burstTime!==null){
        const t=(time-burstTime)/1000;
        fragments.forEach((piece,i)=>{const v=piece.userData.velocity;piece.position.set(v.x*t,v.y*t-t*t*1.6,v.z*t);piece.rotation.set(t*2+i,t*3+i,t);piece.visible=t<2.8;});
        flash.visible=!reducedMotion&&t<.5;flash.scale.setScalar(.15+t*1.1);flash.material.opacity=Math.max(0,.75-t*1.5);burstGlow.intensity=reducedMotion?0:Math.max(0,4-t*5);
        const spread=THREE.MathUtils.smoothstep(t,.7,4),collapse=THREE.MathUtils.smoothstep(t,4.5,6.8),charcoal=new THREE.Color('#302c29');
        blaze.forEach((flame,i)=>{flame.scale.setScalar(spread*(.65+(reducedMotion?0:Math.sin(time*.008+i)*.12)));flame.scale.y*=1.1+(i%3)*.25;});
        blazeLight.intensity=spread*18;
        burnMaterials.forEach(({material,color})=>{material.color.copy(color).lerp(charcoal,Math.min(1,t/5));material.emissiveIntensity=Math.max(0,1-t/4);});
        fallingRoof.forEach(({object,y,rotation})=>{object.position.y=y-collapse*2.2;object.rotation.z=rotation+collapse*Math.sign(object.position.x)*.2;object.visible=t<7;});
        upperWalls.forEach(object=>{object.visible=t<6;});
        // Our administrator leaves before the cabin loses its load-bearing bits.
        const door=new THREE.Vector3(.45,.44,2.65),safe=new THREE.Vector3(-1.1,.08,4.75);
        if(t<2)dog.position.lerpVectors(dogStart,door,THREE.MathUtils.smoothstep(t,0,2));else dog.position.lerpVectors(door,safe,THREE.MathUtils.smoothstep(t,2,4));
      }
    }
  };
}
