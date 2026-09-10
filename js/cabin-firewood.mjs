import * as THREE from './vendor/three.module.min.js';

/** Split firewood and a working chopping spot, placed outside the cabin's rear wall. */
export function createFirewoodArea() {
  const area=new THREE.Group();area.name='Firewood and chopping stump';
  const materials=new Map();
  const mat=(color,metalness=0)=>{
    const key=color+metalness;
    if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:metalness?.48:.96,metalness,flatShading:true}));
    return materials.get(key);
  };
  function mesh(geometry,color,parent,metalness=0){
    const item=new THREE.Mesh(geometry,mat(color,metalness));item.castShadow=true;item.receiveShadow=true;parent.add(item);return item;
  }
  function block(size,position,color,parent){const m=mesh(new THREE.BoxGeometry(...size),color,parent);m.position.set(...position);return m;}
  function lines(points,color,parent){
    const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));
    const item=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color}));parent.add(item);return item;
  }
  const segment=(pts,a,b)=>pts.push(a,b);

  function splitLog(radius,length,index) {
    const log=new THREE.Group();log.name='Split firewood';
    // A broad, uneven split face beneath an arc of bark. The facets remain
    // visible in the cabin's low-resolution view; no round wooden cylinders.
    const profile=[[-radius,0],[radius,0]];
    for(let i=1;i<9;i++){
      const angle=i*Math.PI/9,r=radius*(1+.045*Math.sin(i*2.5+index));
      profile.push([Math.cos(angle)*r,Math.sin(angle)*r]);
    }
    const shape=new THREE.Shape(profile.map(([x,y])=>new THREE.Vector2(x,y)));
    const wood=['#c49b60','#be945a','#d1aa70'][index%3],endGeometry=new THREE.ShapeGeometry(shape);
    const front=mesh(endGeometry,wood,log);front.position.z=length/2;
    const backGeometry=endGeometry.clone();backGeometry.setIndex(Array.from(backGeometry.index.array).reverse());backGeometry.computeVertexNormals();
    const back=mesh(backGeometry,wood,log);back.position.z=-length/2;
    const split=mesh(new THREE.PlaneGeometry(radius*2,length),wood,log);split.rotation.x=Math.PI/2;
    const barkPositions=[];
    // profile[0] -> profile[1] is the split surface; every other edge is bark.
    for(let i=1;i<profile.length;i++){
      const a=profile[i],b=profile[(i+1)%profile.length];
      barkPositions.push(a[0],a[1],-length/2,b[0],b[1],-length/2,a[0],a[1],length/2,
        a[0],a[1],length/2,b[0],b[1],-length/2,b[0],b[1],length/2);
    }
    const barkGeometry=new THREE.BufferGeometry();barkGeometry.setAttribute('position',new THREE.Float32BufferAttribute(barkPositions,3));barkGeometry.computeVertexNormals();
    mesh(barkGeometry,['#66503a','#58452f','#73563b','#5f4a35'][index%4],log);
    const grain=[];
    for(const z of [-length/2-.001,length/2+.001]){
      for(const fraction of [.24,.47,.72,.9])for(let i=0;i<12;i++){
        const point=j=>{const a=j*Math.PI/12,r=radius*fraction*(1+.035*Math.sin(j*1.8+index));return [Math.cos(a)*r,Math.sin(a)*r,z];};
        segment(grain,point(i),point(i+1));
      }
      // Short radial checks make the cut ends read as seasoned firewood.
      for(const a of [.25+(index*.13)%(Math.PI-.5),2.17]){
        segment(grain,[Math.cos(a)*radius*.74,Math.sin(a)*radius*.74,z],[Math.cos(a)*radius*.98,Math.sin(a)*radius*.98,z]);
      }
    }
    lines(grain,'#997342',log);
    return log;
  }

  const stack=new THREE.Group();stack.name='Stack of chopped firewood';stack.position.set(-.65,.02,-2.72);area.add(stack);
  // Two low sleepers keep the cut wood off the soil. The nearest ends clear
  // the foundation's z=-2.25 edge; the pile is supported against the rear wall.
  for(const x of [-.86,.86])block([.14,.12,.88],[x,.06,0],'#6a5236',stack);
  let logIndex=0;
  for(let row=0;row<5;row++){
    const count=row<3?7:row===3?6:5;
    for(let col=0;col<count;col++){
      const i=logIndex++,r=.15+(i%3)*.009,length=.68+(i%4)*.035;
      const log=splitLog(r,length,i);
      log.position.set((col-(count-1)/2)*.30,.127+row*.154,(i%3-1)*.013);
      log.rotation.z=Math.sin(i*2.7)*.035;stack.add(log);
    }
  }
  // A couple of unstacked pieces beside the chopping block show where work
  // stopped, without covering the open space needed to swing the axe.
  for(const [index,x,z,angle] of [[31,.28,-3.51,.35],[32,.45,-3.79,-.22]]){
    const log=splitLog(.13,.59,index);log.position.set(x,.024,z);log.rotation.y=angle;area.add(log);
  }

  const stump=new THREE.Group();stump.name='Chopping stump with embedded axe';stump.position.set(1.33,.02,-3.33);area.add(stump);
  const trunk=mesh(new THREE.CylinderGeometry(.335,.39,.57,13,1), '#67503a',stump);trunk.position.y=.285;
  for(let i=0;i<7;i++){
    const a=i*Math.PI*2/7,r=.323;
    const root=mesh(new THREE.ConeGeometry(.12,.17,4),'#614a34',stump);
    root.position.set(Math.cos(a)*r,.075,Math.sin(a)*r);root.rotation.y=-a;
  }
  const cut=mesh(new THREE.CylinderGeometry(.33,.334,.024,13),'#bd995f',stump);cut.position.y=.578;
  const growth=[];
  for(const radius of [.055,.107,.164,.223,.281])for(let i=0;i<28;i++){
    const point=j=>{const a=j*Math.PI*2/28,r=radius*(1+.04*Math.sin(j*1.5+radius*23));return [.014+Math.cos(a)*r,.591,-.009+Math.sin(a)*r];};
    segment(growth,point(i),point(i+1));
  }
  lines(growth,'#92703e',stump);
  const fissures=[];
  for(const [a,length] of [[.3,.12],[2.05,.09],[4.7,.16]]){
    segment(fissures,[Math.cos(a)*.329,.592,Math.sin(a)*.329],[Math.cos(a)*(.329-length),.592,Math.sin(a)*(.329-length)]);
  }
  for(let i=0;i<5;i++)segment(fissures,[-.09+i*.037,.592,-.11+i*.027],[-.025+i*.033,.592,-.08+i*.027]);
  lines(fissures,'#715235',stump);
  const barkFurrows=[];
  for(let i=0;i<13;i++){
    const a=i*Math.PI*2/13;
    segment(barkFurrows,[Math.cos(a)*.385,.04,Math.sin(a)*.385],[Math.cos(a+.018)*.353,.34,Math.sin(a+.018)*.353]);
    segment(barkFurrows,[Math.cos(a+.018)*.353,.34,Math.sin(a+.018)*.353],[Math.cos(a)*.336,.565,Math.sin(a)*.336]);
  }
  lines(barkFurrows,'#473c2e',stump);

  const axe=new THREE.Group();axe.name='Wood-handled splitting axe';axe.position.set(-.075,.655,.015);axe.rotation.set(.04,.45,-.19);stump.add(axe);
  // The cheek is thick around the handle eye and tapers toward the cutting
  // edge. Its bottom corner bites into the stump rather than resting above it.
  const outline=[[-.225,-.15],[-.258,.045],[-.19,.125],[.035,.065],[.143,.063],[.148,-.04],[.036,-.043]];
  const positions=[],thickness=x=>x<-.18?.011:x<0?.042:.057;
  for(const side of [-1,1])for(let i=1;i<outline.length-1;i++){
    const tri=side===1?[0,i+1,i]:[0,i,i+1];
    for(const n of tri){const [x,y]=outline[n];positions.push(x,y,side*thickness(x));}
  }
  for(let i=0;i<outline.length;i++){
    const a=outline[i],b=outline[(i+1)%outline.length],za=thickness(a[0]),zb=thickness(b[0]);
    positions.push(a[0],a[1],-za,a[0],a[1],za,b[0],b[1],-zb,a[0],a[1],za,b[0],b[1],zb,b[0],b[1],-zb);
  }
  const headGeometry=new THREE.BufferGeometry();headGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));headGeometry.computeVertexNormals();
  mesh(headGeometry,'#485050',axe,.58);
  // Ground silver edge, distinct from the dark forged-steel head.
  for(const side of [-1,1]){
    const edge=new THREE.Shape();edge.moveTo(-.225,-.15);edge.lineTo(-.258,.045);edge.lineTo(-.19,.125);edge.lineTo(-.165,.107);edge.lineTo(-.223,.036);edge.lineTo(-.195,-.136);edge.closePath();
    const blade=mesh(new THREE.ShapeGeometry(edge),'#b2b6ab',axe,.72);blade.position.z=side*.012;blade.material=mat('#b2b6ab',.72);blade.material.side=THREE.DoubleSide;
  }
  const handlePath=new THREE.CatmullRomCurve3([new THREE.Vector3(.072,-.025,0),new THREE.Vector3(.071,.20,0),new THREE.Vector3(.112,.49,0),new THREE.Vector3(.135,.74,0),new THREE.Vector3(.103,.875,0)]);
  const handlePositions=[],handleIndices=[],steps=14,sides=8;
  for(let i=0;i<=steps;i++){
    const t=i/steps,p=handlePath.getPoint(t),r=.023+.007*Math.sin(t*Math.PI)+.011*t*t*t;
    const tangent=handlePath.getTangent(t),normal=new THREE.Vector3(tangent.y,-tangent.x,0).normalize();
    for(let j=0;j<sides;j++){
      const a=j*Math.PI*2/sides;
      handlePositions.push(p.x+normal.x*Math.cos(a)*r,p.y+normal.y*Math.cos(a)*r,Math.sin(a)*r*.67);
      if(i<steps){const n=i*sides+j,k=i*sides+(j+1)%sides;handleIndices.push(n,n+sides,k,k,n+sides,k+sides);}
    }
  }
  for(const base of [0,steps*sides])for(let j=1;j<sides-1;j++){
    handleIndices.push(base,...(base===0?[base+j,base+j+1]:[base+j+1,base+j]));
  }
  const handleGeometry=new THREE.BufferGeometry();handleGeometry.setAttribute('position',new THREE.Float32BufferAttribute(handlePositions,3));handleGeometry.setIndex(handleIndices);handleGeometry.computeVertexNormals();
  mesh(handleGeometry,'#bb8447',axe);
  const grainLine=[];
  for(let i=1;i<steps;i++){
    const a=handlePath.getPoint(i/steps),b=handlePath.getPoint((i+1)/steps);
    segment(grainLine,[a.x+.009,a.y,.019],[b.x+.009,b.y,.019]);
  }
  lines(grainLine,'#916333',axe);

  // Flat chips and bark fragments sit on the soil, concentrated by the stump.
  for(let i=0;i<11;i++){
    const a=i*2.399,r=.47+(i%3)*.14,x=1.33+Math.cos(a)*r,z=-3.33+Math.sin(a)*r;
    const chip=new THREE.Shape();chip.moveTo(-.035,-.035);chip.lineTo(.055,-.02);chip.lineTo(.025,.053);chip.lineTo(-.035,.018);chip.closePath();
    const m=mesh(new THREE.ExtrudeGeometry(chip,{depth:.012,bevelEnabled:false}),i%3?'#c39e62':'#6c5135',area);
    m.rotation.set(-Math.PI/2,0,a);m.position.set(x,.023,z);
  }
  return area;
}
