import * as THREE from './vendor/three.module.min.js';

export function createCoffeeStation(cabin){
  const station=new THREE.Group();station.name='V60 pour-over station';station.position.set(1.94,1.10,.23);station.rotation.y=-Math.PI/2;cabin.add(station);
  const materials=new Map();
  function mesh(geometry,color,x=0,y=0,z=0){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.6,flatShading:true}));const object=new THREE.Mesh(geometry,materials.get(color));object.position.set(x,y,z);object.castShadow=true;station.add(object);return object;}
  const box=(w,h,d,x,y,z,c)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z);
  const cylinder=(top,bottom,height,x,y,z,c,sides=16)=>mesh(new THREE.CylinderGeometry(top,bottom,height,sides),c,x,y,z);
  function pipe(points,radius,color){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),28,radius,7,false),color);}
  function label(text,width,height,color,background){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const c=canvas.getContext('2d');c.fillStyle=background;c.fillRect(0,0,width,height);c.fillStyle=color;c.font=Math.round(height*.48)+'px monospace';c.textAlign='center';c.fillText(text,width/2,height*.69);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:texture,toneMapped:false});}
  // A low digital scale, rubber mat and a small luminous display.
  box(.4,.032,.37,-.21,.018,.045,'#293b35');box(.355,.008,.26,-.21,.04,.018,'#3e4b42');
  const display=box(.245,.027,.004,-.21,.021,.233,'#162922');display.material=label('018.0g  0:00',256,40,'#a2c894','#152921');
  for(const x of [-.365,-.055])cylinder(.012,.012,.006,x,.022,.235,'#6c7d65',10).rotation.x=Math.PI/2;
  // Transparent, curved glass server with coffee visible inside.
  const glass=new THREE.MeshPhysicalMaterial({color:'#d9e6dc',transparent:true,opacity:.28,roughness:.12,metalness:0,side:THREE.DoubleSide,depthWrite:false});
  const profile=[[0,0],[.094,.002],[.123,.027],[.135,.09],[.123,.14],[.085,.19],[.073,.225],[.084,.231]].map(([x,y])=>new THREE.Vector2(x,y));
  const carafe=mesh(new THREE.LatheGeometry(profile,24),'#d9e6dc',-.21,.045,.015);carafe.material=glass;carafe.castShadow=false;
  cylinder(.119,.104,.075,-.21,.103,.015,'#533322',24);
  const coffeeSurface=cylinder(.119,.119,.004,-.21,.142,.015,'#70502f',24);
  const handle=pipe([[-.095,.215,.015],[-.02,.205,.015],[.005,.145,.015],[-.035,.095,.015],[-.095,.11,.015]],.013,'#c6d5cb');handle.material=glass;
  // Ceramic V60 and paper filter: both are open cones, with modeled ribs.
  cylinder(.101,.101,.018,-.21,.281,.015,'#e9ddc6',24);
  const dripper=mesh(new THREE.CylinderGeometry(.157,.037,.20,24,1,true),'#e7dbc4',-.21,.393,.015);dripper.material=new THREE.MeshStandardMaterial({color:'#e7dbc4',side:THREE.DoubleSide,roughness:.38});
  const paper=mesh(new THREE.CylinderGeometry(.143,.027,.19,24,1,true),'#f0e4c9',-.21,.411,.015);paper.material=new THREE.MeshStandardMaterial({color:'#f0e4c9',side:THREE.DoubleSide,roughness:.98});
  cylinder(.114,.04,.028,-.21,.454,.015,'#6a4630',24);
  for(let i=0;i<12;i++){
    const points=[];for(let j=0;j<7;j++){const t=j/6,a=i*Math.PI/6+t*.28,r=.04+t*.119;points.push([-.21+Math.cos(a)*r,.294+t*.199,.015+Math.sin(a)*r]);}
    pipe(points,.006,'#cfc1a7');
  }
  pipe([[-.06,.451,.015],[.006,.445,.015],[.019,.388,.015],[-.047,.358,.015]],.016,'#e7dbc4');
  // Matte gooseneck kettle, with its rising spout and large open handle.
  cylinder(.105,.13,.20,.27,.116,.025,'#344540',20);cylinder(.089,.105,.055,.27,.244,.025,'#43554b',20);cylinder(.102,.102,.011,.27,.277,.025,'#283b34',20);
  cylinder(.026,.031,.036,.27,.3,.025,'#775638',10);
  pipe([[.17,.081,.025],[.105,.097,.025],[.083,.245,.025],[.015,.327,.025],[-.026,.326,.025],[-.035,.303,.025]],.012,'#657c70');
  pipe([[.365,.238,.025],[.454,.245,.025],[.482,.168,.025],[.446,.074,.025],[.38,.079,.025]],.025,'#25372f');
  // Hand grinder and a folded recipe card beside the scale.
  cylinder(.044,.044,.235,.23,.13,-.225,'#9b9e88',14);cylinder(.046,.046,.046,.23,.033,-.225,'#666c59',14);cylinder(.037,.044,.03,.23,.261,-.225,'#d0c4a1',14);
  pipe([[.23,.274,-.225],[.23,.30,-.225],[.365,.30,-.225]],.007,'#7e8b78');cylinder(.02,.022,.036,.365,.28,-.225,'#87643f',8);
  const card=box(.16,.004,.12,.054,.004,.233,'#e1cea3');const recipe=new THREE.Mesh(new THREE.PlaneGeometry(.15,.11),label('18 : 300',192,128,'#5b5542','#e1cea3'));recipe.rotation.x=-Math.PI/2;recipe.position.set(.054,.007,.233);station.add(recipe);
  return station;
}
