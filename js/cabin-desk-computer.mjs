import * as THREE from './vendor/three.module.min.js';

/** The CSS3D website rectangle. The bezel frames it and never covers it. */
export const SCREEN={x:.56,y:1.64,z:-1.291,width:1.16,height:.725};
const U=.0475,GAP=.0055,CAP=.016,INSET=.0045;
const BROWN='#4a3830',MOD='#3d2e28',ACCENT='#c8643f';

function roundedRect(w,h,r,path=new THREE.Shape()){
  const x=w/2-r,y=h/2-r;path.absarc(x,-y,r,-Math.PI/2,0);path.absarc(x,y,r,0,Math.PI/2);path.absarc(-x,y,r,Math.PI/2,Math.PI);path.absarc(-x,-y,r,Math.PI,Math.PI*1.5);return path;
}
function part(geometry,material,parent,name){const m=new THREE.Mesh(geometry,material);if(name)m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const standard=(color,roughness=.6,metalness=.2)=>new THREE.MeshStandardMaterial({color,roughness,metalness,flatShading:true});
// Heights scale from front to back, giving the case its gentle typing angle.
function wedge(geometry,front,back,depth,height){
  const p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){const t=THREE.MathUtils.clamp(.5-p.getZ(i)/depth,0,1);p.setY(i,p.getY(i)*(front+(back-front)*t)/height);}
  geometry.computeVertexNormals();return geometry;
}

/** A thin-bezel studio display: glass border, graphite chin and a slim back shell. */
export function createMonitorDisplay(){
  const display=new THREE.Group();display.name='Thin-bezel studio display';
  const graphite=standard('#2e3432',.5,.3),shell=standard('#394140',.55,.28),glass=standard('#0c1011',.3,.1);
  const side=.022,border=.015,chin=.062,bevel=.004,depth=.03;
  const top=SCREEN.y+SCREEN.height/2+side,bottom=SCREEN.y-SCREEN.height/2-chin,width=SCREEN.width+side*2;
  const front=SCREEN.z-.0022;
  const housing=part(new THREE.ExtrudeGeometry(roundedRect(width-bevel*2,top-bottom-bevel*2,.016),{depth,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:1,curveSegments:4}),graphite,display,'Graphite display housing');
  housing.position.set(SCREEN.x,(top+bottom)/2,front-depth-bevel);
  // Black glass runs just past the screen; the website plane sits a hair in front of it.
  part(new THREE.PlaneGeometry(SCREEN.width+border*2,SCREEN.height+border*2),glass,display,'Display glass border').position.set(SCREEN.x,SCREEN.y,SCREEN.z-.0012);
  part(new THREE.CircleGeometry(.0035,10),standard('#27302f',.25,.2),display,'Display camera').position.set(SCREEN.x,SCREEN.y+SCREEN.height/2+border/2,SCREEN.z-.0008);
  const back=front-depth-bevel*2;
  part(new THREE.ExtrudeGeometry(roundedRect(.92,.54,.05),{depth:.02,bevelEnabled:true,bevelThickness:.01,bevelSize:.012,bevelSegments:2,curveSegments:5}),shell,display,'Display back shell').position.set(SCREEN.x,1.63,back-.03);
  const hinge=part(new THREE.CylinderGeometry(.028,.028,.2,10),shell,display,'Display hinge');hinge.rotation.z=Math.PI/2;hinge.position.set(SCREEN.x,1.58,-1.398);
  for(let i=0;i<9;i++)part(new THREE.BoxGeometry(.05,.004,.004),glass,display).position.set(SCREEN.x-.24+i*.06,1.86,back-.041);
  return display;
}

/** An aluminium stand: a flat rounded foot and a leaning neck, left standing if the display bursts. */
export function createMonitorStand(){
  const stand=new THREE.Group();stand.name='Aluminium display stand';
  const alloy=standard('#646b67',.42,.45);
  const foot=part(new THREE.ExtrudeGeometry(roundedRect(.36,.26,.05),{depth:.008,bevelEnabled:true,bevelThickness:.002,bevelSize:.003,bevelSegments:1,curveSegments:5}),alloy,stand,'Display stand foot');
  foot.rotation.x=-Math.PI/2;foot.position.set(SCREEN.x,1.197,-1.4);
  const a=new THREE.Vector3(0,1.205,-1.525),b=new THREE.Vector3(0,1.58,-1.398),neck=part(new THREE.BoxGeometry(.19,a.distanceTo(b),.014),alloy,stand,'Display stand neck');
  neck.position.set(SCREEN.x,(a.y+b.y)/2,(a.z+b.z)/2);neck.rotation.x=Math.atan2(b.z-a.z,b.y-a.y);
  const bend=part(new THREE.CylinderGeometry(.012,.012,.19,8),alloy,stand);bend.rotation.z=Math.PI/2;bend.position.set(SCREEN.x,1.207,-1.527);
  return stand;
}

// A 75% board: F-row, number row, QWERTY rows, a nav column and inverted-T arrows.
const ROWS=[
  [['esc',1,'accent'],.25,'F1','F2','F3','F4',.25,'F5','F6','F7','F8',.25,'F9','F10','F11','F12',.25,['prt',1,'mod'],['del',1,'mod']],
  ['`','1','2','3','4','5','6','7','8','9','0','-','=',['delete',2,'mod'],['pgup',1,'mod']],
  [['tab',1.5,'mod'],'Q','W','E','R','T','Y','U','I','O','P','[',']',['\\',1.5],['pgdn',1,'mod']],
  [['caps',1.75,'mod'],'A','S','D','F','G','H','J','K','L',';',"'",['return',2.25,'accent'],['home',1,'mod']],
  [['shift',2.25,'mod'],'Z','X','C','V','B','N','M',',','.','/',['shift',1.75,'mod'],['↑',1,'mod'],['end',1,'mod']],
  [['ctrl',1.25,'mod'],['opt',1.25,'mod'],['cmd',1.25,'mod'],['',6.25,'mod'],['cmd',1,'mod'],['fn',1,'mod'],['ctrl',1,'mod'],['←',1,'mod'],['↓',1,'mod'],['→',1,'mod']]
];
export function keyboardLayout(){
  const keys=[];
  ROWS.forEach((row,r)=>{let x=0;for(const item of row){
    if(typeof item==='number'){x+=item;continue;}
    const [label,width,kind]=typeof item==='string'?[item,1,'alpha']:[item[0],item[1],item[2]||'alpha'];
    keys.push({label,width,kind,x:(x+width/2-8)*U,z:(r-2.5)*U+(r?.004:-.004)});x+=width;
  }});
  return keys;
}
// Low-profile keycaps: a tapered block with lighter tops over darker sides.
function keycap(width){
  const g=new THREE.BoxGeometry(width,CAP,U-GAP),p=g.attributes.position,n=g.attributes.normal,shade=[];
  for(let i=0;i<p.count;i++){
    if(p.getY(i)>0){p.setX(i,p.getX(i)-Math.sign(p.getX(i))*INSET);p.setZ(i,p.getZ(i)-Math.sign(p.getZ(i))*INSET);}
    const s=n.getY(i)>.5?1:n.getZ(i)>.5?.74:.62;shade.push(s,s,s);
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(shade,3));g.translate(0,CAP/2+.002,0);return g;
}
function legendAtlas(labels){
  const cells=Math.ceil(Math.sqrt(labels.length)),size=1024,cell=size/cells,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  const c=canvas.getContext('2d');c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';
  labels.forEach((label,i)=>{c.font=`600 ${label.length>2?cell*.26:label.length>1?cell*.36:cell*.46}px system-ui,Helvetica,Arial,sans-serif`;c.fillText(label,(i%cells+.5)*cell,(Math.floor(i/cells)+.5)*cell);});
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return {map,cells};
}

/** A walnut 75% keyboard in six draw calls: case, plate, three keycap sets and one legend sheet. */
export function createDeskKeyboard(){
  const keyboard=new THREE.Group();keyboard.name='Walnut 75% keyboard';
  const width=.82,depth=.353,holeW=16*U+.016,holeD=6*U+.024,caseFront=.026,caseBack=.044,plateFront=.017,plateBack=.035,bevel=.004;
  const outline=roundedRect(width-bevel*2,depth-bevel*2,.024);outline.holes.push(roundedRect(holeW+bevel*2,holeD+bevel*2,.006,new THREE.Path()));
  const frame=new THREE.ExtrudeGeometry(outline,{depth:caseBack-bevel*2,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,curveSegments:5});
  frame.rotateX(-Math.PI/2);frame.translate(0,bevel,0);
  part(wedge(frame,caseFront,caseBack,depth,caseBack),new THREE.MeshStandardMaterial({color:'#5a3621',roughness:.72,flatShading:true}),keyboard,'Solid walnut keyboard case');
  part(wedge(new THREE.BoxGeometry(holeW,1,holeD).translate(0,.5,0),plateFront,plateBack,depth,1),standard('#1f1c1b',.7,.1),keyboard,'Dark keyboard plate');
  // Keys ride on a deck tilted to the plate's slope.
  const deck=new THREE.Group();deck.position.y=(plateFront+plateBack)/2;deck.rotation.x=Math.atan((plateBack-plateFront)/depth);keyboard.add(deck);
  const keys=keyboardLayout(),material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.62,flatShading:true});
  const sets=[[k=>k.width===1,1,'Keycaps'],[k=>k.width>1&&k.width<3,1.75,'Wide keycaps'],[k=>k.width>3,6.25,'Spacebar']];
  const dummy=new THREE.Object3D(),color=new THREE.Color();
  for(const [test,base,name]of sets){
    const group=keys.filter(test),caps=new THREE.InstancedMesh(keycap(base*U-GAP),material,group.length);caps.name=name;caps.castShadow=true;caps.receiveShadow=true;
    group.forEach((k,i)=>{dummy.position.set(k.x,0,k.z);dummy.scale.set((k.width*U-GAP)/(base*U-GAP),1,1);dummy.updateMatrix();caps.setMatrixAt(i,dummy.matrix);caps.setColorAt(i,color.set(k.kind==='accent'?ACCENT:k.kind==='mod'?MOD:BROWN));});
    caps.computeBoundingSphere();deck.add(caps);
  }
  // Small off-white legends share one canvas atlas and one merged sheet.
  if(typeof document!=='undefined'){
    const labeled=keys.filter(k=>k.label),labels=[...new Set(labeled.map(k=>k.label))],{map,cells}=legendAtlas(labels);
    const position=[],uv=[],index=[],s=U*.56,y=CAP+.0024;
    labeled.forEach((k,i)=>{
      const cx=k.width>1?k.x-(k.width*U-GAP)/2+INSET+s/2:k.x,n=labels.indexOf(k.label),u0=n%cells/cells,v1=1-Math.floor(n/cells)/cells,u1=u0+1/cells,v0=v1-1/cells;
      position.push(cx-s/2,y,k.z+s/2,cx+s/2,y,k.z+s/2,cx+s/2,y,k.z-s/2,cx-s/2,y,k.z-s/2);uv.push(u0,v0,u1,v0,u1,v1,u0,v1);index.push(i*4,i*4+1,i*4+2,i*4,i*4+2,i*4+3);
    });
    const sheet=new THREE.BufferGeometry();sheet.setAttribute('position',new THREE.Float32BufferAttribute(position,3));sheet.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));sheet.setIndex(index);sheet.computeVertexNormals();
    const legends=new THREE.Mesh(sheet,new THREE.MeshStandardMaterial({map,color:'#eadfcc',roughness:.8,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));legends.name='Keycap legends';deck.add(legends);
  }
  return keyboard;
}
