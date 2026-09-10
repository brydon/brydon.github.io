import * as THREE from './vendor/three.module.min.js';
import {createCubeModel} from './cube-model.mjs';
import {scrambleCube} from './cube-state.mjs';
import {createDeskChair} from './cabin-chair.mjs';
import {createShelfBook} from './cabin-books.mjs';
import {createD20,propArea} from './cabin-shelf-props.mjs';

/** Solid furniture with printed artwork on book spines and the wall poster. */
export function furnishCabin(cabin){
  const materials=new Map();
  function mesh(parent,geometry,color,x,y,z,glow=false){
    const key=color+glow;
    if(!materials.has(key))materials.set(key,glow?new THREE.MeshBasicMaterial({color,toneMapped:false}):new THREE.MeshStandardMaterial({color,roughness:.92,flatShading:true}));
    const object=new THREE.Mesh(geometry,materials.get(key));object.position.set(x,y,z);object.castShadow=!glow;object.receiveShadow=!glow;parent.add(object);return object;
  }
  const box=(p,w,h,d,x,y,z,c)=>mesh(p,new THREE.BoxGeometry(w,h,d),c,x,y,z);
  const cylinder=(p,t,b,h,x,y,z,c,n=10)=>mesh(p,new THREE.CylinderGeometry(t,b,h,n),c,x,y,z);
  function plant(parent,x,y,z,scale=1){
    const pot=new THREE.Group();pot.position.set(x,y,z);pot.scale.setScalar(scale);parent.add(pot);
    cylinder(pot,.15,.105,.23,0,.115,0,'#a65f3d');cylinder(pot,.157,.157,.035,0,.228,0,'#be794e');cylinder(pot,.14,.14,.016,0,.24,0,'#44362a');
    for(let i=0;i<8;i++){
      const a=i*2.4,leaf=mesh(pot,new THREE.SphereGeometry(1,6,4),i%2?'#5f7c3e':'#79944f',Math.cos(a)*.14,.4+(i%3)*.06,Math.sin(a)*.14);
      leaf.scale.set(.08,.22,.045);leaf.rotation.set(Math.sin(a)*.6,a,Math.cos(a)*.7);
    }
  }

  // A deep bookcase against the LEFT wall, with books facing into the room.
  const library=new THREE.Group();library.name='Left-wall bookshelf';library.position.set(-2.04,.47,-.9);library.rotation.y=Math.PI/2;cabin.add(library);
  box(library,1.5,2.25,.045,0,1.14,-.2,'#64442e');
  for(const x of [-.76,.76])box(library,.09,2.3,.46,x,1.16,0,'#9a6b3c');
  for(const y of [.08,.61,1.14,1.67,2.27])box(library,1.61,.09,.49,0,y,.015,'#b0854c');
  box(library,1.73,.13,.53,0,2.36,.01,'#785133');
  const readingRows=[
    ['feynmanI','feynmanII','feynmanIII','complex','differential','combinatorics','axler','rudin','algebra'],
    ['murray1','murray2','bible','sicp','clrs','differential','graphs','complex','topology'],
    ['fellowship','towers','king','algebra','complex','graphs'],
    ['sutton','cover','strogatz','axler','rudin','dragon']
  ];
  for(let row=0;row<4;row++)for(let i=0;i<readingRows[row].length;i++){
    const height=row===3?[.43,.44,.45,.40,.375,.43][i]:row===2&&i<3?.395:row===1&&i<2?.435:row===0&&i<3?.414:.32+((i*3+row)%4)*.033;
    const thickness=row===1&&i<3?.139:row===2&&i<3?.126:.112;
    const book=createShelfBook(readingRows[row][i],{height,thickness,depth:.30});
    const tilt=i===8?-.045:0;
    book.position.set(-.63+i*.151,.125+row*.53+(height*Math.cos(tilt)+thickness*Math.abs(Math.sin(tilt)))/2,.022+(i%3)*.004);
    book.rotation.z=tilt;library.add(book);
  }
  let shelfCubeState=scrambleCube();
  const shelfCube=createCubeModel(shelfCubeState);
  shelfCube.group.position.set(.43,1.7962,.095);shelfCube.group.scale.setScalar(.055);shelfCube.group.rotation.y=-.25;library.add(shelfCube.group);
  // One jacket faces out beside the Tolkien trilogy; the cube stays on its shelf.
  const displayBook=createShelfBook('dragon',{height:.43,thickness:.062,depth:.295});
  displayBook.position.set(.43,1.185+.43/2,.105);displayBook.rotation.y=-Math.PI/2+.07;library.add(displayBook);
  plant(library,-.43,2.43,0,.7);
  const die=createD20(),dieBounds=new THREE.Box3().setFromObject(die);die.position.set(-.025,2.425-dieBounds.min.y,.045);library.add(die);
  box(library,.32,.36,.05,.42,2.6,.035,'#d2b583');box(library,.26,.29,.009,.42,2.6,.065,'#58777a');
  const mountain=mesh(library,new THREE.ConeGeometry(.13,.21,3),'#acb8a0',.42,2.58,.08);mountain.scale.z=.13;

  // An open stone hearth on the left side: it never crosses the chalkboard.
  const hearth=new THREE.Group();hearth.name='Open stone fireplace';hearth.position.set(-1.97,.47,.95);hearth.rotation.y=Math.PI/2;cabin.add(hearth);
  box(hearth,1.4,.07,1,0,.035,.13,'#696a5d');box(hearth,1.14,.86,.1,0,.48,-.23,'#302f29');
  for(const side of [-1,1])for(let i=0;i<4;i++){
    box(hearth,.22,.205,.53,side*.52,.16+i*.215,.005,['#87816c','#a3987e','#767662'][i%3]);
    box(hearth,.016,.17,.01,side*.54,.16+i*.215,.276,'#b1a58a');
  }
  box(hearth,1.24,.2,.62,0,1.025,.015,'#99907b');box(hearth,1.48,.105,.73,0,1.18,.045,'#956738');
  cylinder(hearth,.12,.14,2.32,0,2.39,-.12,'#333c35');
  for(const y of [1.44,2.1,2.94])cylinder(hearth,.143,.143,.065,0,y,-.12,'#596055');
  box(hearth,.88,.025,.48,0,.125,.05,'#252b26');
  for(let i=0;i<3;i++){
    const log=cylinder(hearth,.085,.1,.65,(i-1)*.11,.23+i*.035,.04,'#604029',7);log.rotation.z=Math.PI/2;log.rotation.y=(i-1)*.36;
    const ember=mesh(hearth,new THREE.IcosahedronGeometry(.07,0),'#e97223',(i-1)*.21,.21,.2,true);ember.scale.y=.3;
  }
  const holmes=createShelfBook('holmes',{height:.30,thickness:.065,depth:.22});
  holmes.rotation.set(0,0,Math.PI/2);holmes.position.set(-.43,1.2325+.065/2,.09);hearth.add(holmes);
  const flames=[];
  for(let i=0;i<7;i++){
    const flame=new THREE.Group();flame.position.set((i%4-1.5)*.145,.28,Math.floor(i/4)*.17-.04);hearth.add(flame);
    const h=.36+(i%3)*.10;
    const outer=mesh(flame,new THREE.ConeGeometry(.10,h,6),'#ef7122',0,h/2,0,true);outer.rotation.z=(i%2?1:-1)*.12;
    mesh(flame,new THREE.ConeGeometry(.065,h*.66,5),'#ffc65a',.012,h*.32,.038,true);
    mesh(flame,new THREE.ConeGeometry(.034,h*.35,5),'#ffe7a6',.016,h*.17,.066,true);
    flames.push(flame);
  }
  const glow=new THREE.PointLight('#ff9a42',1.9,5,2);glow.position.set(.05,.63,.55);hearth.add(glow);
  // Split firewood, fire tools, and a candle on the mantel.
  const wood=new THREE.Group();wood.position.set(-1.96,.57,1.78);wood.rotation.y=Math.PI/2;cabin.add(wood);
  for(let row=0;row<2;row++)for(let i=0;i<3-row;i++){
    const log=cylinder(wood,.075,.085,.33,-.16+i*.15+row*.06,row*.13,0,'#795235',7);log.rotation.x=Math.PI/2;
    const end=cylinder(wood,.064,.071,.01,-.16+i*.15+row*.06,row*.13,.17,'#c19a64',7);end.rotation.x=Math.PI/2;
  }
  cylinder(hearth,.058,.06,.16,.43,1.31,.08,'#decc94');mesh(hearth,new THREE.ConeGeometry(.023,.08,5),'#ffcd78',.43,1.435,.08,true);

  // A thick woven rug, with borders, geometric medallions and individual fringe.
  const rug=new THREE.Group();rug.name='Woven cabin rug';rug.position.set(.13,.482,.56);cabin.add(rug);
  box(rug,2.8,.026,1.87,0,0,0,'#683e32');
  for(const[w,d,c]of[[2.68,1.75,'#bf905c'],[2.55,1.62,'#394e49'],[2.42,1.49,'#bd9868'],[2.3,1.37,'#8e4935']])box(rug,w,.005,d,0,.018+(2.8-w)*.025,0,c);
  for(let i=0;i<5;i++){
    const x=(i-2)*.43;
    for(const[size,c,y]of[[.29,'#e0b878',.04],[.215,'#354e49',.045],[.095,'#cc9a61',.05]]){const diamond=box(rug,size,.005,size,x,y,0,c);diamond.rotation.y=Math.PI/4;}
    for(const z of [-.53,.53]){const tile=box(rug,.12,.005,.12,x,.05,z,'#d0aa73');tile.rotation.y=Math.PI/4;}
  }
  for(let i=0;i<27;i++)for(const z of [-1,1]){const fringe=box(rug,.022,.016,.13,-1.3+i*.1,.001,z*.985,'#c4b085');fringe.rotation.y=(i%3-1)*.12;}
  for(let i=0;i<24;i++)box(rug,2.64,.003,.008,0,.055,-.82+i*.071,'#95613f').material=new THREE.MeshStandardMaterial({color:'#bd9366',transparent:true,opacity:.12,roughness:1});

  createDeskChair(cabin);
  plant(cabin,1.88,1.13,-.49,.65);
  // Desk lamp, pencil cup, and a scatter of folded field notes.
  cylinder(cabin,.11,.13,.028,1.61,1.214,-1.34,'#333e33');cylinder(cabin,.016,.016,.44,1.61,1.44,-1.34,'#535b44');
  cylinder(cabin,.085,.17,.12,1.61,1.69,-1.34,'#425244');mesh(cabin,new THREE.SphereGeometry(.047,8,6),'#ffd190',1.61,1.615,-1.34,true);
  const deskGlow=new THREE.PointLight('#ffcf85',.55,2,2);deskGlow.position.set(1.61,1.58,-1.3);cabin.add(deskGlow);
  cylinder(cabin,.055,.05,.13,1.72,1.28,-.98,'#637365');
  for(let i=0;i<4;i++){const pencil=cylinder(cabin,.008,.008,.19,1.69+i*.017,1.39,-.98,'#d5ac5d',5);pencil.rotation.z=(i-1.5)*.12;}
  // A warm pendant anchors the room, instead of an invisible ceiling light.
  cylinder(cabin,.018,.018,.8,-.05,3.03,-.2,'#384035');cylinder(cabin,.10,.29,.23,-.05,2.55,-.2,'#374637');
  const bulb=mesh(cabin,new THREE.SphereGeometry(.09,10,7),'#ffe1a5',-.05,2.46,-.2,true);bulb.scale.y=.55;
  const roomGlow=new THREE.PointLight('#ffd1a0',3.5,7,2);roomGlow.position.set(-.05,2.36,-.2);cabin.add(roomGlow);
  return {
    dieArea(){return propArea(die);},
    setDieResult(value){
      const face=die.userData.faces.find(face=>face.value===value);if(!face)return;
      die.quaternion.copy(face.orientation);die.rotation.x-=Math.PI/2;
      const p=die.children[0].geometry.attributes.position;let minY=Infinity;
      for(let i=0;i<p.count;i++)minY=Math.min(minY,new THREE.Vector3().fromBufferAttribute(p,i).applyQuaternion(die.quaternion).y);
      die.position.y=2.425-minY;
    },
    cubeState(){return shelfCubeState;},
    setCubeState(state){shelfCubeState=state;shelfCube.sync(state);},
    cubeArea(){
      shelfCube.group.updateWorldMatrix(true,false);
      const vertices=[];for(const x of [-1.5,1.5])for(const y of [-1.5,1.5])for(const z of [-1.5,1.5])vertices.push(shelfCube.group.localToWorld(new THREE.Vector3(x,y,z)).toArray());
      return vertices;
    },
    animate(time){flames.forEach((flame,i)=>{flame.scale.y=.88+Math.sin(time*.008+i*2.1)*.16;flame.scale.x=.96+Math.sin(time*.011+i)*.06;});glow.intensity=1.8+Math.sin(time*.007)*.18+Math.sin(time*.021)*.1;}};
}
