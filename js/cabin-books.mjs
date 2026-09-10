import * as THREE from './vendor/three.module.min.js';

// Small, locally drawn jacket studies. Titles, edition colours and motifs are
// deliberate; no remote cover downloads or full-book content are needed.
export const SHELF_BOOKS={
  sutton:{title:'Reinforcement Learning',lines:['Reinforcement','Learning'],author:'SUTTON & BARTO',edition:'SECOND EDITION',base:'#e8e7de',ink:'#252b31',accent:'#36799e',motif:'learning'},
  cover:{title:'Elements of Information Theory',lines:['ELEMENTS OF','INFORMATION','THEORY'],author:'COVER & THOMAS',edition:'SECOND EDITION',base:'#122841',ink:'#f0e8bf',accent:'#86ac52',motif:'entropy'},
  strogatz:{title:'Nonlinear Dynamics and Chaos',lines:['NONLINEAR','DYNAMICS','AND CHAOS'],author:'STEVEN H. STROGATZ',edition:'SECOND EDITION',base:'#161b20',ink:'#e7e9dc',accent:'#58aed1',motif:'chaos'},
  axler:{title:'Linear Algebra Done Right',lines:['Linear Algebra','Done Right'],author:'SHELDON AXLER',edition:'THIRD EDITION',base:'#eee9d5',ink:'#174d84',accent:'#226291',motif:'geometry'},
  rudin:{title:'Principles of Mathematical Analysis',lines:['Principles of','Mathematical','Analysis'],author:'WALTER RUDIN',edition:'THIRD EDITION',base:'#48342f',ink:'#f4ead8',accent:'#e77d34',motif:'analysis'},
  dragon:{title:'Compilers',lines:['COMPILERS'],subtitle:'Principles, Techniques, and Tools',author:'AHO · SETHI · ULLMAN',edition:'',base:'#f0e5cf',ink:'#252925',accent:'#b3302c',motif:'dragon'},
  fellowship:{title:'The Fellowship of the Ring',lines:['THE FELLOWSHIP','OF THE RING'],author:'J. R. R. TOLKIEN',edition:'THE LORD OF THE RINGS · I',base:'#262828',ink:'#e5dcca',accent:'#d6bb54',motif:'ring',part:1},
  towers:{title:'The Two Towers',lines:['THE TWO','TOWERS'],author:'J. R. R. TOLKIEN',edition:'THE LORD OF THE RINGS · II',base:'#262828',ink:'#e5dcca',accent:'#d98442',motif:'ring',part:2},
  king:{title:'The Return of the King',lines:['THE RETURN','OF THE KING'],author:'J. R. R. TOLKIEN',edition:'THE LORD OF THE RINGS · III',base:'#262828',ink:'#e5dcca',accent:'#64a38c',motif:'ring',part:3}
};
for(const [id,title,base]of [['algebra','Algebra','#e6bd42'],['topology','Topology','#dbb955'],['graphs','Graph Theory','#eee8d0'],['complex','Complex Analysis','#e0c469'],['differential','Differential Equations','#ebe6d3'],['combinatorics','Combinatorics','#dba83d']]){
  SHELF_BOOKS[id]={title,lines:title.split(' ').length>1?title.split(' '):[title],author:'GRADUATE TEXTS',edition:'MATHEMATICS',base,ink:'#232c2a',accent:'#324f78',motif:'springer'};
}
const jackets=new Map();
Object.assign(SHELF_BOOKS,{
  holmes:{title:'The Adventures of Sherlock Holmes',spineTitle:'Sherlock Holmes',lines:['THE ADVENTURES OF','SHERLOCK','HOLMES'],author:'ARTHUR CONAN DOYLE',spineAuthor:'CONAN DOYLE',edition:'',base:'#49352f',ink:'#dbbf80',accent:'#c4a163',motif:'holmes'},
  kr:{title:'The C Programming Language',lines:['The C','Programming','Language'],author:'KERNIGHAN & RITCHIE',spineAuthor:'K&R',edition:'SECOND EDITION',base:'#eee9d8',ink:'#234c7f',accent:'#2d5b8e',motif:'c'},
  knuth:{title:'The Art of Computer Programming',spineTitle:'The Art of Computer Programming',lines:['The Art of','Computer','Programming'],author:'DONALD E. KNUTH',spineAuthor:'KNUTH',edition:'VOLUME 1',base:'#d8bd83',ink:'#593127',accent:'#733b2a',motif:'knuth'},
  geb:{title:'Gödel, Escher, Bach',lines:['Gödel,','Escher, Bach'],author:'DOUGLAS R. HOFSTADTER',spineAuthor:'HOFSTADTER',edition:'AN ETERNAL GOLDEN BRAID',base:'#e8dcc1',ink:'#5a302a',accent:'#ab683c',motif:'geb'},
  murray1:{title:'Mathematical Biology I',lines:['Mathematical','Biology I'],author:'J. D. MURRAY',edition:'THIRD EDITION',subtitle:'An Introduction',base:'#254f3b',ink:'#e0d57a',accent:'#ded06a',motif:'biology'},
  murray2:{title:'Mathematical Biology II',lines:['Mathematical','Biology II'],author:'J. D. MURRAY',edition:'THIRD EDITION',subtitle:'Spatial Models and Biomedical Applications',base:'#1e4938',ink:'#e0d57a',accent:'#ded06a',motif:'biology'},
  bible:{title:'Holy Bible',lines:['HOLY','BIBLE'],author:'',edition:'',base:'#24231f',ink:'#d9bb67',accent:'#d9bb67',motif:'bible'},
  sicp:{title:'Structure and Interpretation of Computer Programs',spineTitle:'Structure & Interpretation',lines:['Structure and','Interpretation of','Computer Programs'],author:'ABELSON · SUSSMAN · SUSSMAN',spineAuthor:'ABELSON & SUSSMAN',edition:'SECOND EDITION',base:'#685581',ink:'#f3ead7',accent:'#d4c299',motif:'wizard'},
  clrs:{title:'Introduction to Algorithms',lines:['Introduction','to Algorithms'],author:'CORMEN · LEISERSON · RIVEST · STEIN',spineAuthor:'CLRS',edition:'THIRD EDITION',base:'#ccdce0',ink:'#252e37',accent:'#a84f46',motif:'algorithms'}
});
for(const part of ['I','II','III'])SHELF_BOOKS['feynman'+part]={title:'The Feynman Lectures on Physics',spineTitle:'The Feynman Lectures',lines:['The Feynman','Lectures on','Physics'],author:'FEYNMAN · LEIGHTON · SANDS',spineAuthor:'FEYNMAN',edition:'VOLUME '+part,base:'#a33230',ink:'#f4e5c9',accent:'#e7cb96',motif:'physics',part};
function canvas(w,h){const image=document.createElement('canvas');image.width=w/2;image.height=h/2;const context=image.getContext('2d');context.scale(.5,.5);return [image,context];}
function type(c,text,x,y,size,color,maxWidth,font='Georgia'){c.fillStyle=color;c.font=`${size}px ${font}`;c.fillText(text,x,y,maxWidth);}
function line(c,points,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function motif(c,book,x,y,scale=1){
  c.save();c.translate(x,y);c.scale(scale,scale);
  if(book.motif==='holmes'){
    c.strokeStyle=book.accent;c.lineWidth=6;c.beginPath();c.arc(-15,-18,43,0,Math.PI*2);c.stroke();line(c,[[15,16],[64,74]],book.accent,13);
  }else if(book.motif==='c'){
    type(c,'C',-76,61,191,book.accent,160,'Georgia');
  }else if(book.motif==='knuth'){
    c.strokeStyle=book.accent;c.lineWidth=2;c.strokeRect(-90,-64,180,131);type(c,'1',-24,26,92,book.ink,160,'Georgia');
  }else if(book.motif==='geb'){
    for(const [x,y,letter]of [[-45,-38,'G'],[18,36,'E'],[66,-52,'B']]){
      c.fillStyle=book.accent;c.fillRect(x-30,y-30,61,61);line(c,[[x-30,y-30],[x-13,y-45],[x+47,y-45],[x+31,y-30]],'#d6a773',3);line(c,[[x+31,y-30],[x+47,y-45],[x+47,y+17],[x+31,y+31]],'#7e4b30',3);type(c,letter,x-22,y+18,53,'#f3e2bd',52);
    }
  }else if(book.motif==='bible'){
    line(c,[[0,-54],[0,62]],book.accent,6);line(c,[[-34,-17],[34,-17]],book.accent,6);
  }else if(book.motif==='physics'){
    type(c,book.part,-26,18,79,book.ink,170);line(c,[[-100,58],[100,58]],book.ink,2);
  }else if(book.motif==='biology'){
    // A spotted cat silhouette nods to the distinctive green Murray jackets.
    c.fillStyle=book.accent;c.beginPath();c.ellipse(-7,7,77,29,-.12,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(74,-13,24,21,-.4,0,Math.PI*2);c.fill();
    line(c,[[-74,7],[-107,-2],[-119,-33],[-112,-47]],book.accent,10);
    for(const x of [-54,-26,35,60])line(c,[[x,19],[x+5,54],[x+21,55]],book.accent,9);
    c.fillStyle=book.base;for(let i=0;i<28;i++){const x=-67+i%9*16,y=-10+Math.floor(i/9)*12;c.beginPath();c.ellipse(x,y,3+(i%2),2.5,0,0,Math.PI*2);c.fill();}
  }else if(book.motif==='wizard'){
    c.strokeStyle=book.accent;c.lineWidth=3;c.beginPath();c.moveTo(-46,68);c.lineTo(-12,-7);c.lineTo(-28,-15);c.lineTo(9,-90);c.lineTo(32,-11);c.lineTo(13,-4);c.lineTo(56,69);c.closePath();c.stroke();
    line(c,[[7,68],[7,18],[-13,8],[19,8],[7,28]],book.accent,3);line(c,[[50,82],[68,-60]],book.accent,4);line(c,[[46,-48],[87,-70]],book.accent,2);
  }else if(book.motif==='algorithms'){
    const links=[[[0,-95],[0,-56]],[[-90,-40],[88,-68]],[[-50,-47],[-50,7]],[[49,-62],[49,-4]],[[-104,23],[7,-9]],[[17,10],[89,-12]],[[-77,17],[-77,71]],[[60,-6],[60,45]]];for(const p of links)line(c,p,'#3b4545',2);
    c.fillStyle=book.accent;for(const [x,y]of [[-87,75],[55,50],[-4,0],[82,-14]]){c.beginPath();c.ellipse(x,y,24,9,-.35,0,Math.PI*2);c.fill();}
  }else if(book.motif==='ring'){
    c.strokeStyle=book.accent;c.lineWidth=9;c.beginPath();c.arc(0,0,55,0,Math.PI*2);c.stroke();
    c.strokeStyle='#101413';c.lineWidth=2;
    if(book.part===1){c.beginPath();c.ellipse(0,0,21,9,0,0,Math.PI*2);c.stroke();c.beginPath();c.arc(0,0,6,0,Math.PI*2);c.fillStyle='#101413';c.fill();}
    if(book.part===2)for(const side of [-1,1]){const x=side*91;line(c,[[x-9,42],[x-8,-28],[x-4,-36],[x,-28],[x+4,-36],[x+8,-28],[x+9,42]],'#101413',3);}
    if(book.part===3){line(c,[[-27,10],[-23,-8],[-12,0],[0,-22],[12,0],[23,-8],[27,10],[-27,10]],'#101413',3);for(let i=0;i<5;i++)line(c,[[-24+i*12,10],[-21+i*10,21]],'#101413',2);}
  }else if(book.motif==='learning'){
    for(let i=0;i<35;i++){const pts=[];for(let j=0;j<55;j++){const t=j/54;pts.push([-20+45*Math.sin(t*4+i*.07)+i*2.2,-115+t*240]);}line(c,pts,['#b54345','#bd9141','#588891','#679566','#617598'][i%5],1.1);}
  }else if(book.motif==='entropy'){
    for(let k=0;k<11;k++){const pts=[];for(let i=0;i<260;i++){const t=i*.047,r=4+7*t;pts.push([r*Math.cos(t+k*.042),r*Math.sin(t+k*.042)]);}line(c,pts,k%2?'#9aab3e':'#41917c',1.7);}
  }else if(book.motif==='chaos'){
    for(let k=0;k<6;k++){const pts=[];for(let i=0;i<700;i++){const t=i*.035,r=74+23*Math.sin(t*6.07+k*.09);pts.push([r*Math.cos(t),r*Math.sin(t)]);}line(c,pts,['#66afa4','#dcba64','#cb6d88','#7999ce','#d9c263','#6ca5bf'][k],.8);}
  }else if(book.motif==='geometry'){
    line(c,[[-90,60],[-35,-55],[100,60],[-90,60]],'#477c99',3);line(c,[[-35,-55],[5,60]],'#477c99',2);type(c,'a² + b² = ½c² + 2d²',-110,98,16,book.ink,230);
  }else if(book.motif==='dragon'){
    c.fillStyle=book.accent;c.strokeStyle='#63251e';c.lineWidth=3;
    c.beginPath();c.moveTo(-81,54);c.bezierCurveTo(-142,14,-84,-20,-48,25);c.bezierCurveTo(-26,64,58,46,61,-5);c.lineTo(28,-20);c.lineTo(63,-36);c.lineTo(54,-73);c.lineTo(78,-49);c.lineTo(94,-60);c.lineTo(85,-35);c.lineTo(106,-22);c.lineTo(87,-8);c.bezierCurveTo(89,48,38,76,-15,63);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(18,29);c.lineTo(-8,-78);c.lineTo(-77,-47);c.lineTo(-47,-25);c.lineTo(-68,0);c.lineTo(-33,8);c.closePath();c.fill();c.stroke();
    c.fillStyle='#f3d790';c.fillRect(80,-33,4,4);line(c,[[-1,58],[-15,89],[-32,89]],'#63251e',4);line(c,[[35,54],[48,86],[65,86]],'#63251e',4);
  }
  c.restore();
}
function texture(image){const map=new THREE.CanvasTexture(image);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;}
function jacket(id){
  if(jackets.has(id))return jackets.get(id);
  const book=SHELF_BOOKS[id],[front,c]=canvas(512,768),[spine,s]=canvas(128,768);
  for(const [ctx,w]of [[c,512],[s,128]]){
    ctx.fillStyle=book.base;ctx.fillRect(0,0,w,768);
    // Quiet cloth variation and worn jacket edges remain legible when minified.
    let seed=813;for(let i=0;i<2100;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;ctx.fillStyle=i%2?'#ffffff07':'#00000007';ctx.fillRect(seed%w,(seed>>>12)%768,2,2);}
    ctx.fillStyle='#ffffff15';ctx.fillRect(3,3,w-6,2);ctx.fillStyle='#00000025';ctx.fillRect(0,0,3,768);
  }
  if(book.motif==='geometry'){c.fillStyle=book.accent;c.fillRect(0,0,512,61);type(c,'Undergraduate Texts in Mathematics',24,39,22,'#ffffff',460);}
  if(book.motif==='springer'){c.fillStyle='#f1ead0';c.fillRect(0,0,512,70);type(c,'Graduate Texts in Mathematics',25,45,24,book.ink,460);c.fillStyle=book.accent;c.fillRect(0,579,512,18);s.fillStyle='#f1ead0';s.fillRect(0,0,128,68);s.fillStyle=book.accent;s.fillRect(0,675,128,16);}
  if(book.motif==='analysis'){c.fillStyle=book.accent;c.fillRect(0,468,512,45);s.fillStyle=book.accent;s.fillRect(0,584,128,30);}
  c.textAlign='left';
  if(book.motif==='ring'){
    c.textAlign='center';type(c,book.author,256,90,32,book.ink,440,'Georgia');
    book.lines.forEach((text,i)=>type(c,text,256,196+i*46,39,book.accent,458));
    motif(c,book,256,468,1.48);type(c,'THE LORD OF THE RINGS',256,691,23,book.ink,444);type(c,'PART '+['','I','II','III'][book.part],256,724,18,book.ink,400);
  }else{
    const top=book.motif==='geometry'?150:100;
    book.lines.forEach((text,i)=>type(c,text,34,top+i*55,44,book.ink,445,book.motif==='learning'?'Arial':'Georgia'));
    if(book.subtitle)type(c,book.subtitle,34,book.motif==='biology'?235:168,19,book.ink,445);
    type(c,book.edition,34,top+book.lines.length*55+28,22,book.accent,440,'Arial');
    if(book.motif!=='analysis')motif(c,book,book.motif==='learning'?395:256,book.motif==='learning'?485:485,book.motif==='learning'?1.2:1.5);
    type(c,book.author,34,704,25,book.motif==='learning'?book.ink:book.accent,445,'Arial');
  }
  // Spine typography reads from the top down, as on a shelved volume.
  s.textAlign='center';type(s,book.spineAuthor||book.author.replace('STEVEN H. ','').replace('SHELDON ','').replace('WALTER ',''),64,43,book.spineAuthor==='CLRS'?27:17,book.motif==='ring'?book.ink:book.accent,112,'Arial');
  s.save();s.translate(64,100);s.rotate(Math.PI/2);s.textAlign='left';
  type(s,book.spineTitle||book.title,0,12,40,book.motif==='ring'?book.accent:book.ink,492,book.motif==='learning'?'Arial':'Georgia');s.restore();
  if(book.motif==='ring')motif(s,book,64,644,.57);
  else if(book.motif==='dragon')motif(s,book,64,635,.42);
  else if(book.motif==='geometry'){s.fillStyle=book.accent;s.fillRect(0,658,128,110);type(s,'UTM',64,700,22,'#fff',100,'Arial');}
  else if(book.motif==='chaos'||book.motif==='entropy')motif(s,book,64,653,.43);
  else if(book.motif==='learning')for(let i=0;i<5;i++){s.fillStyle=['#b54345','#bd9141','#588891','#679566','#617598'][i];s.fillRect(18+i*19,627,9,60);}
  else if(['biology','bible','wizard','algorithms','physics','c','knuth','geb'].includes(book.motif))motif(s,book,64,648,.44);
  type(s,book.motif==='ring'?['','I','II','III'][book.part]:book.edition.replace(' EDITION',''),64,741,17,book.ink,112,'Arial');
  const result={front:new THREE.MeshStandardMaterial({map:texture(front),roughness:.92}),spine:new THREE.MeshStandardMaterial({map:texture(spine),roughness:.9}),cloth:new THREE.MeshStandardMaterial({color:book.base,roughness:.96}),pages:new THREE.MeshStandardMaterial({color:'#d9d0b7',roughness:1})};
  jackets.set(id,result);return result;
}

/** Bound book, spine towards +Z, front cover towards +X; dimensions in metres. */
export function createShelfBook(id,{height=.4,thickness=.115,depth=.3}={}){
  const book=new THREE.Group();book.name=SHELF_BOOKS[id].title;book.userData.book=id;const mat=jacket(id);
  if(id==='bible')mat.pages.color.set('#b79b58');
  function add(geo,material,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;book.add(m);return m;}
  add(new THREE.BoxGeometry(thickness-.014,height-.014,depth-.014),mat.pages,0,0,-.003);
  for(const side of [-1,1])add(new THREE.BoxGeometry(.006,height,depth),mat.cloth,side*(thickness-.006)/2,0,0);
  add(new THREE.BoxGeometry(thickness,height,.012),mat.cloth,0,0,depth/2-.003);
  add(new THREE.PlaneGeometry(thickness,height),mat.spine,0,0,depth/2+.0032);
  const cover=add(new THREE.PlaneGeometry(depth,height),mat.front,thickness/2+.0002);cover.rotation.y=Math.PI/2;
  // Shallow page-edge lines and the shoulder at the binding are real geometry.
  const edges=mat.pages.clone();edges.color.set('#bcb29a');
  for(const y of [-.39,-.19,.08,.31])add(new THREE.BoxGeometry(thickness-.016,.0008,depth-.016),edges,0,y*height,-.003);
  return book;
}
