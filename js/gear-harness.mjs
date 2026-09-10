import * as THREE from './vendor/three.module.min.js';

// Construction references: Petzl CORAX front view and DOUBLEBACK detail.
// These are sewn bands with thickness and lining, not tubes standing in for straps.
export function createClimbingHarness(){
  const harness=new THREE.Group();harness.name='Sport harness with padded waist and leg loops';
  const fabric=new THREE.MeshStandardMaterial({color:'#3b5759',roughness:.96});
  const lining=new THREE.MeshStandardMaterial({color:'#252e32',roughness:1});
  const edging=new THREE.MeshStandardMaterial({color:'#17282c',roughness:.92});
  const webbing=new THREE.MeshStandardMaterial({color:'#46585b',roughness:.94});
  const accent=new THREE.MeshStandardMaterial({color:'#a75139',roughness:.9});
  const thread=new THREE.MeshStandardMaterial({color:'#8a9690',roughness:1});
  const steel=new THREE.MeshStandardMaterial({color:'#939d9c',metalness:.72,roughness:.29});
  const darkSteel=new THREE.MeshStandardMaterial({color:'#46545a',metalness:.68,roughness:.4});
  const add=(geometry,material,name)=>{const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;harness.add(mesh);return mesh;};
  const vector=p=>new THREE.Vector3(...p);
  const stitches=[];
  function tube(points,r,material,name,closed=false,steps=32){
    return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(vector),closed,'centripetal'),steps,r,5,closed),material,name);
  }
  function rod(a,b,r,material,name){
    const start=vector(a),end=vector(b),delta=end.clone().sub(start);
    const mesh=add(new THREE.CylinderGeometry(r,r,delta.length(),6),material,name);
    mesh.position.copy(start.add(end).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return mesh;
  }
  // A softly rounded rectangular cross-section is swept around each fabric band.
  // The inner and outer surfaces have distinct materials; edges stay thin.
  function band(point,width,thickness,material,name,{closed=false,steps=56,up=new THREE.Vector3(0,1,0),seams=false}={}){
    const positions=[],outside=[],inside=[],profile=12,edgeA=[],edgeB=[];
    const frames=[];
    for(let i=0;i<=steps;i++){
      const t=i/steps,center=point(t),before=point(closed?(t-.0001+1)%1:Math.max(0,t-.0001)),after=point(closed?(t+.0001)%1:Math.min(1,t+.0001));
      const tangent=after.sub(before).normalize(),across=up.clone().addScaledVector(tangent,-up.dot(tangent)).normalize();
      const outward=new THREE.Vector3().crossVectors(tangent,across).normalize();
      const w=typeof width==='function'?width(t):width;
      frames.push({center,tangent,across,outward,w});
      for(let j=0;j<profile;j++){
        const a=j/profile*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
        const p=center.clone().addScaledVector(across,Math.sign(c)*Math.pow(Math.abs(c),.42)*w/2).addScaledVector(outward,s*thickness/2);
        positions.push(p.x,p.y,p.z);
      }
      edgeA.push(center.clone().addScaledVector(across,w/2-.0014).addScaledVector(outward,thickness*.32).toArray());
      edgeB.push(center.clone().addScaledVector(across,-w/2+.0014).addScaledVector(outward,thickness*.32).toArray());
      if(seams&&i%2===0){
        for(const side of [-1,1]){
          const p=center.clone().addScaledVector(across,side*(w/2-.005)).addScaledVector(outward,thickness*.52);
          stitches.push({p,tangent,across,outward});
        }
      }
    }
    for(let i=0;i<steps;i++)for(let j=0;j<profile;j++){
      const a=i*profile+j,b=i*profile+(j+1)%profile,c=(i+1)*profile+j,d=(i+1)*profile+(j+1)%profile;
      (j<profile/2?outside:inside).push(a,b,c,b,d,c);
    }
    if(!closed){
      for(let j=1;j<profile-1;j++){outside.push(0,j,j+1);const o=steps*profile;outside.push(o,o+j+1,o+j);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setIndex([...outside,...inside]);geometry.addGroup(0,outside.length,0);geometry.addGroup(outside.length,inside.length,1);geometry.computeVertexNormals();
    const mesh=add(geometry,[material,lining],name);
    if(seams){tube(edgeA,.00155,edging,name+' upper bound edge',closed,steps);tube(edgeB,.00155,edging,name+' lower bound edge',closed,steps);}
    return mesh;
  }
  function strap(points,width,material,name,options={}){
    const curve=new THREE.CatmullRomCurve3(points.map(vector),false,'centripetal');
    return band(t=>curve.getPoint(t),width,.0032,material,name,{up:new THREE.Vector3(1,0,0),steps:20,...options});
  }
  function buckle(x,y,z,w,h,rotation=0){
    const shape=new THREE.Shape(),r=.0035;
    shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const hole=new THREE.Path();hole.moveTo(-w/2+.005,-h/2+.005);hole.lineTo(-w/2+.005,h/2-.005);hole.lineTo(w/2-.005,h/2-.005);hole.lineTo(w/2-.005,-h/2+.005);hole.closePath();shape.holes.push(hole);
    const frame=add(new THREE.ExtrudeGeometry(shape,{depth:.0035,bevelEnabled:true,bevelThickness:.0007,bevelSize:.0007,bevelSegments:1,curveSegments:3}),steel,'Double-back adjustment buckle');
    frame.position.set(x,y,z);frame.rotation.z=rotation;
    const transform=(px,py,pz)=>[x+px*Math.cos(rotation)-py*Math.sin(rotation),y+px*Math.sin(rotation)+py*Math.cos(rotation),z+pz];
    rod(transform(0,-h/2+.003,.004),transform(0,h/2-.003,.004),.002,darkSteel,'Buckle centre bar');
    // The strap passes over one bar and returns through the second slot.
    const tail=strap([transform(-w*.4,0,.002),transform(0,0,.0055),transform(w*.38,0,.0025)],h-.013,webbing,'Webbing threaded through buckle',{up:new THREE.Vector3(-Math.sin(rotation),Math.cos(rotation),0),steps:8});
    return {frame,tail};
  }
  const waistPoint=t=>{
    const a=.30+t*(Math.PI*2-.60);
    return new THREE.Vector3(.183*Math.sin(a),-.091-.020*Math.cos(a)+.006*Math.sin(a),.062+.043*Math.cos(a));
  };
  band(waistPoint,t=>.040+.034*Math.pow(Math.sin(Math.PI*t),.65),.010,fabric,'Wide padded waist belt',{seams:true,steps:64});
  // The back rises to the hanging tab, the front drops under its own weight.
  strap([[0,-.052,.016],[.004,-.020,.019],[.001,-.002,.019],[-.009,-.013,.023],[-.015,-.054,.023]],.014,webbing,'Rear haul loop on peg',{steps:20});
  strap([[-.175,-.092,.091],[-.119,-.108,.104],[-.063,-.112,.111],[0,-.111,.112],[.071,-.109,.110],[.122,-.103,.101],[.173,-.091,.084]],.025,webbing,'Waist adjustment webbing',{up:new THREE.Vector3(0,1,0),steps:36});
  buckle(-.077,-.112,.111,.033,.041,-.055);buckle(.079,-.106,.109,.033,.041,.055);
  strap([[-.078,-.114,.116],[-.119,-.119,.116],[-.141,-.143,.114]],.019,webbing,'Folded left waist strap tail',{up:new THREE.Vector3(0,1,0),steps:12});
  strap([[.084,-.108,.113],[.126,-.109,.108],[.148,-.098,.096]],.019,webbing,'Tucked right waist strap tail',{up:new THREE.Vector3(0,1,0),steps:12});
  // Front tie-in reinforcement is separate from the vertical belay loop.
  strap([[-.050,-.112,.116],[0,-.113,.121],[.05,-.111,.117]],.025,webbing,'Upper tie-in bridge',{up:new THREE.Vector3(0,1,0),steps:10});
  strap([[-.024,-.203,.095],[0,-.194,.109],[.026,-.207,.102]],.019,webbing,'Lower reinforced tie-in bridge',{up:new THREE.Vector3(0,1,0),steps:12});
  band(t=>{const a=t*Math.PI*2;return new THREE.Vector3(.006,-.156+.051*Math.cos(a),.122+.012*Math.sin(a));},.017,.004,accent,'Contrasting sewn belay loop',{closed:true,up:new THREE.Vector3(1,0,0),steps:32});
  // The front leg straps meet the lower bridge. Rear elastics stay behind them.
  strap([[-.115,-.118,.035],[-.113,-.215,.037],[-.153,-.352,.046]],.011,edging,'Left rear elastic riser');
  strap([[.120,-.121,.032],[.134,-.249,.04],[.154,-.366,.047]],.011,edging,'Right rear elastic riser');
  strap([[-.023,-.202,.103],[-.048,-.267,.102],[-.082,-.334,.116],[-.120,-.351,.127]],.021,webbing,'Left load-bearing leg strap');
  strap([[.025,-.207,.104],[.058,-.278,.10],[.094,-.353,.121],[.13,-.361,.126]],.021,webbing,'Right load-bearing leg strap');
  for(const [cx,cy,tilt]of [[-.106,-.400,-.20],[.112,-.414,.16]]){
    const point=t=>{const a=t*Math.PI*2;return new THREE.Vector3(cx+.084*Math.sin(a),cy-.041*Math.cos(a)+tilt*.084*Math.sin(a),.086+.035*Math.cos(a));};
    band(point,t=>.033+.012*(.5+.5*Math.cos(t*Math.PI*2)),.007,fabric,cx<0?'Left padded leg loop':'Right padded leg loop',{closed:true,seams:true,steps:48});
    buckle(cx+(cx<0?-.02:.02),cy+.037,.111,.031,.032,cx<0?-.17:.14);
    // Webbing overlaps the padding by the adjustment buckles, with a short loose end.
    strap([[cx-.055,cy+.022,.091],[cx,cy+.038,.121],[cx+.058,cy+.025,.093]],.018,webbing,'Leg loop adjustment webbing',{up:new THREE.Vector3(0,1,0),steps:16});
    strap([[cx+(cx<0?-.035:.035),cy+.036,.116],[cx+(cx<0?-.051:.049),cy+.009,.121],[cx+(cx<0?-.042:.059),cy-.019,.116]],.017,webbing,'Leg buckle webbing tail',{steps:12});
  }
  // Four gear loops: two stiffer front loops and slimmer rear loops.
  for(const side of [-1,1]){
    tube([[side*.158,-.105,.086],[side*.207,-.140,.083],[side*.225,-.152,.059],[side*.187,-.164,.054],[side*.14,-.145,.077]],.0041,edging,'Rigid front gear loop',false,24);
    tube([[side*.151,-.087,.032],[side*.193,-.108,.020],[side*.191,-.141,.023],[side*.134,-.150,.031],[side*.109,-.120,.035]],.0030,webbing,'Flexible rear gear loop',false,22);
    strap([[side*.155,-.093,.088],[side*.156,-.118,.090]],.012,webbing,'Gear loop sewn attachment',{steps:5});
  }
  // Small woven keeper sleeves, cross seams and reinforcement bartacks.
  for(const side of [-1,1]){
    strap([[side*.135,-.088,.103],[side*.135,-.128,.104]],.010,edging,'Waist elastic keeper',{steps:5});
    for(let i=0;i<5;i++)rod([side*.026-.010,-.111+(i-2)*.003,.126],[side*.026+.010,-.111+(i-2)*.003,.126],.00065,thread,'Tie-in reinforcement stitching');
    for(let i=0;i<4;i++)rod([side*.050-.008,-.25+(i-2)*.0027,.106],[side*.050+.008,-.25+(i-2)*.0027,.106],.0006,thread,'Leg strap bartack');
  }
  for(let i=0;i<5;i++)rod([-.001,-.154+(i-2)*.003,.137],[.013,-.154+(i-2)*.003,.137],.0006,thread,'Belay loop seam');
  const stitchMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.0030,.00065,.0006),thread,stitches.length);
  stitchMesh.name='Double rows of edge stitching';const matrix=new THREE.Matrix4(),basis=new THREE.Matrix4(),rotation=new THREE.Quaternion();
  stitches.forEach(({p,tangent,across,outward},i)=>{basis.makeBasis(tangent,across,outward);rotation.setFromRotationMatrix(basis);matrix.compose(p,rotation,new THREE.Vector3(1,1,1));stitchMesh.setMatrixAt(i,matrix);});harness.add(stitchMesh);
  return harness;
}
