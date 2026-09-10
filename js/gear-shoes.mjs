import * as THREE from './vendor/three.module.min.js';

// A pair of asymmetric, downturned sport shoes, hanging by their heel loops.
// Rubber and fabric panels share a sculpted last rather than stacked ellipsoids.
export function createClimbingShoes(){
  const pair=new THREE.Group();pair.name='Turquoise and yellow climbing shoes';
  const rubber=new THREE.MeshStandardMaterial({color:'#202628',roughness:.84,metalness:.015,side:THREE.DoubleSide});
  const sole=new THREE.MeshStandardMaterial({color:'#141b1c',roughness:.93});
  const upper=new THREE.MeshStandardMaterial({color:'#343e40',roughness:.97,side:THREE.DoubleSide});
  const turquoise=new THREE.MeshStandardMaterial({color:'#3d9fa7',roughness:.88,side:THREE.DoubleSide});
  const yellow=new THREE.MeshStandardMaterial({color:'#d9ba43',roughness:.88,side:THREE.DoubleSide});
  const lining=new THREE.MeshStandardMaterial({color:'#10191b',roughness:1,side:THREE.DoubleSide});
  const stitch=new THREE.MeshStandardMaterial({color:'#97b9b4',roughness:1});
  const metal=new THREE.MeshStandardMaterial({color:'#4a5050',metalness:.72,roughness:.44});
  const sections=[
    // length, half width, height, center depth, medial displacement
    [0,.003,.006,.025,0],[.06,.024,.021,.031,0],
    [.14,.031,.028,.035,0],[.25,.032,.030,.039,0],
    [.36,.029,.028,.042,-.001],[.48,.033,.030,.042,0],
    [.62,.043,.027,.032,.005],[.76,.044,.020,.022,.009],
    [.87,.035,.014,.016,.012],[.96,.016,.008,.012,.017],
    [1,.002,.003,.011,.02]
  ];
  function profile(t){
    let index=0;while(index<sections.length-2&&sections[index+1][0]<t)index++;
    const a=sections[index],b=sections[index+1],q=(t-a[0])/(b[0]-a[0]),s=q*q*(3-2*q);
    return a.slice(1).map((v,j)=>THREE.MathUtils.lerp(v,b[j+1],s));
  }
  function point(t,angle,hand,offset=0){
    const [width,height,depth,shift]=profile(t);
    return new THREE.Vector3(hand*shift+(width+offset)*Math.cos(angle),-.037-t*.231,
      .021+depth+(height+offset)*Math.sin(angle));
  }
  function mesh(parent,geometry,material,name){const m=new THREE.Mesh(geometry,material);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function tube(parent,points,r,material,closed=false,segments=40){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>p.isVector3?p:new THREE.Vector3(...p)),closed,'centripetal');
    return mesh(parent,new THREE.TubeGeometry(curve,segments,r,6,closed),material,'Sewn edge or pull loop');
  }
  function surface(parent,hand,material,{from=0,to=1,start=0,end=Math.PI*2,offset=0,hole=false,name='Shoe panel',lengthSegments=36,radialSegments=30}={}){
    const vertices=[],indices=[];
    for(let i=0;i<=lengthSegments;i++)for(let j=0;j<=radialSegments;j++){
      vertices.push(...point(THREE.MathUtils.lerp(from,to,i/lengthSegments),THREE.MathUtils.lerp(start,end,j/radialSegments),hand,offset).toArray());
    }
    for(let i=0;i<lengthSegments;i++)for(let j=0;j<radialSegments;j++){
      const t=THREE.MathUtils.lerp(from,to,(i+.5)/lengthSegments),a=THREE.MathUtils.lerp(start,end,(j+.5)/radialSegments);
      if(hole&&((t-.20)/.154)**2+((a-Math.PI/2)/1.07)**2<1)continue;
      const k=i*(radialSegments+1)+j;
      indices.push(k,k+1,k+radialSegments+1,k+1,k+radialSegments+2,k+radialSegments+1);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    return mesh(parent,geometry,material,name);
  }
  function ribbon(parent,points,width,material,name){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>p.isVector3?p:new THREE.Vector3(...p)),false,'centripetal');
    const vertices=[],indices=[];
    for(let i=0;i<=24;i++){
      const p=curve.getPoint(i/24),side=new THREE.Vector3(0,1,0).multiplyScalar(width/2);
      vertices.push(...p.clone().add(side).toArray(),...p.clone().sub(side).toArray());
      if(i<24){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    return mesh(parent,geometry,material,name);
  }
  // Bonded panels are sampled directly on the last, including their edges.
  // Unlike a free ribbon they cannot lift into fins or read as loose laces.
  function bondedPanel(parent,hand,material,from,to,angleAt,halfWidthAt,name){
    const vertices=[],indices=[];
    for(let i=0;i<=32;i++){
      const q=i/32,t=THREE.MathUtils.lerp(from,to,q),a=angleAt(q),w=halfWidthAt(q);
      vertices.push(...point(t,a-w,hand,.0023).toArray(),...point(t,a+w,hand,.0023).toArray());
      if(i<32){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    return mesh(parent,geometry,material,name);
  }
  for(const hand of [-1,1]){
    const shoe=new THREE.Group();shoe.name=hand<0?'Left downturned shoe':'Right downturned shoe';
    shoe.position.set(-hand*.072,hand<0?-.006:0,.005);
    shoe.rotation.z=hand*.055;shoe.rotation.y=hand*.15;pair.add(shoe);
    surface(shoe,hand,upper,{hole:true,name:'Hollow microsuede upper'});
    surface(shoe,hand,sole,{start:Math.PI,end:Math.PI*2,offset:.0018,name:'Curved rubber outsole',radialSegments:16});
    surface(shoe,hand,rubber,{from:.61,offset:.0013,name:'Asymmetric rubber toe rand',lengthSegments:20,radialSegments:26});
    // Thick molded heel cup surrounds the lower heel but leaves the collar open.
    surface(shoe,hand,rubber,{to:.29,start:Math.PI*.90,end:Math.PI*2.1,offset:.0024,name:'Sculpted rubber heel cup',lengthSegments:16,radialSegments:24});
    // A dark inner wall makes the collar an actual cavity with a rolled rim.
    surface(shoe,hand,lining,{from:.055,to:.35,offset:-.0048,name:'Recessed collar lining',lengthSegments:16,radialSegments:24,hole:true});
    const cavity=mesh(shoe,new THREE.SphereGeometry(1,18,12),lining,'Deep insole inside open collar');
    cavity.scale.set(.024,.033,.008);cavity.position.set(0,-.083,.047);
    const lip=[];for(let i=0;i<40;i++){
      const a=i/40*Math.PI*2;
      lip.push(point(.20+.151*Math.sin(a),Math.PI/2+1.068*Math.cos(a),hand,.001));
    }
    tube(shoe,lip,.0027,rubber,true,56);
    // Turquoise piping and throat/tongue panels match the reference shoe.
    surface(shoe,hand,turquoise,{from:.36,to:.58,start:.72,end:2.42,offset:.0015,name:'Turquoise tongue',lengthSegments:14,radialSegments:14});
    for(const side of [-1,1]){
      bondedPanel(shoe,hand,turquoise,.43,.88,
        q=>Math.PI/2+side*(.70-.28*Math.sin(q*Math.PI)),
        q=>.095*Math.sin(Math.PI*(.08+.92*q)),
        'Bonded turquoise toe-hooking accent');
    }
    // The yellow tension band follows each side from heel toward the arch.
    for(const side of [-1,1]){
      bondedPanel(shoe,hand,yellow,.115,.665,
        ()=>side<0?Math.PI*.91:Math.PI*.09,
        q=>.08+.31*Math.sin(Math.PI*q),
        'Conforming yellow heel-to-arch tension band');
    }
    const strap=[];for(let i=0;i<=16;i++)strap.push(point(.40+.028*Math.sin(i/16*Math.PI),.16+i/16*(Math.PI-.32),hand,.006));
    ribbon(shoe,strap,.025,rubber,'Black closure strap backing');
    ribbon(shoe,strap.map(p=>p.clone().add(new THREE.Vector3(0,0,.0018))),.019,turquoise,'Turquoise hook-and-loop strap');
    for(const edge of [-1,1]){
      const points=strap.map(p=>p.clone().add(new THREE.Vector3(0,edge*.0073,.0023)));
      tube(shoe,points,.00065,stitch,false,28);
    }
    const buckle=mesh(shoe,new THREE.TorusGeometry(.005,.0012,5,10),metal,'Closure strap D-ring');
    buckle.position.copy(point(.41,.20,hand,.007));buckle.scale.set(.7,1.3,1);buckle.rotation.y=.45;
    // A small yellow bar-tack and fine vents break up the toe-hooking rubber.
    const bar=mesh(shoe,new THREE.BoxGeometry(.015,.003,.0018),yellow,'Yellow tongue bar-tack');bar.position.copy(point(.57,Math.PI/2,hand,.0035));
    const vents=new THREE.InstancedMesh(new THREE.SphereGeometry(.0014,5,4),lining,10),matrix=new THREE.Matrix4();
    for(let i=0;i<10;i++){const p=point(.59+(i%5)*.020,.54+Math.floor(i/5)*.18,hand,.0028);matrix.makeTranslation(...p.toArray());vents.setMatrixAt(i,matrix);}shoe.add(vents);
    // Thin, fabric-like heel tabs, visibly open so the hanging cord passes through.
    const heelLoop=[[-.005,-.051,.057],[-.006,-.022,.054],[0,-.010,.049],[.008,-.021,.045],[.007,-.047,.045]];
    tube(shoe,heelLoop,.0035,rubber,false,28);
    tube(shoe,heelLoop.map(([x,y,z])=>[x,y,z+.003]),.0011,yellow,false,28);
  }
  // One short cord suspends both heel tabs from the board peg.
  tube(pair,[[-.073,-.019,.058],[-.049,-.006,.065],[0,.006,.061],[.045,-.004,.051],[.075,-.011,.046]],.0025,rubber,false,42);
  for(const shoe of pair.children)shoe.scale.y*=1.065;
  pair.userData.item='climbing shoes';
  return pair;
}
