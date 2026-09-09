/** Authored chalk diagrams; mathematical sources and conventions are in
 * docs/chalkboard-notes.md. This canvas is a texture on the solid board. */
export function drawResearchBoard(){
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1220;
  const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
  const white='#dedfcc',faint='#839c8c',gold='#d8c281',blue='#91c3c4',rose='#ce9985';
  let seed=421;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  c.fillStyle='#203932';c.fillRect(0,0,W,H);
  // Eraser ghosts and fine chalk dust are deterministic, so the board stays put.
  for(let i=0;i<80;i++){c.fillStyle=`rgba(161,184,155,${.004+random()*.011})`;c.beginPath();c.ellipse(random()*W,random()*H,35+random()*180,6+random()*32,(random()-.5)*.2,0,Math.PI*2);c.fill();}
  function text(value,x,y,size=28,color=white,angle=0){
    c.save();c.translate(x,y);c.rotate(angle);c.font=`italic ${size}px Georgia, serif`;c.fillStyle=color;c.globalAlpha=.9;c.fillText(value,0,0);c.globalAlpha=.12;c.fillText(value,.65,-.4);c.restore();
  }
  function stroke(points,color=white,width=2.5,dash=[]){
    c.save();c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.setLineDash(dash);c.globalAlpha=.84;c.beginPath();
    points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore();
  }
  function curve(points,color=white,width=2.5,dash=[]){
    c.save();c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.setLineDash(dash);c.beginPath();c.moveTo(...points[0]);c.bezierCurveTo(...points[1],...points[2],...points[3]);c.stroke();c.restore();
  }
  function circle(x,y,r,color=white,fill=false){c.save();c.strokeStyle=color;c.fillStyle=color;c.lineWidth=2.4;c.beginPath();c.arc(x,y,r,0,Math.PI*2);fill?c.fill():c.stroke();c.restore();}
  function arrow(points,color=white,width=2.5){stroke(points,color,width);const last=points.at(-1),prev=points.at(-2),a=Math.atan2(last[1]-prev[1],last[0]-prev[0]);stroke([[last[0]-10*Math.cos(a-.42),last[1]-10*Math.sin(a-.42)],last,[last[0]-10*Math.cos(a+.42),last[1]-10*Math.sin(a+.42)]],color,width);}
  function curvedArrow(points,color=white){curve(points,color);const end=points[3],prev=points[2],a=Math.atan2(end[1]-prev[1],end[0]-prev[0]);arrow([[end[0]-13*Math.cos(a),end[1]-13*Math.sin(a)],end],color);}
  function bracket(x,y,h,side){stroke([[x+side*16,y],[x,y],[x+1,y+h],[x+side*16,y+h]],white,3.5);}
  // Loosely divided working areas, with annotations crossing the margins.
  stroke([[776,46],[769,520],[782,571],[770,1165]],faint,1.3,[9,13]);
  stroke([[44,553],[458,548],[738,558]],faint,1.5);
  stroke([[819,568],[1110,556],[1483,564]],faint,1.5);

  text('NMR → tilings → structure',46,62,38,white,-.018);
  stroke([[47,78],[363,74],[500,79]],gold,3);
  text('zeolites / local constraints',48,119,27,blue,.012);
  // A Euclidean {6,3} honeycomb toy example with barycentric chambers.
  const radius=67,centers=[];
  for(let row=0;row<3;row++)for(let col=0;col<3;col++)centers.push([117+col*Math.sqrt(3)*radius+(row%2)*Math.sqrt(3)*radius/2,202+row*1.5*radius]);
  for(const [cx,cy]of centers){
    const vertices=Array.from({length:6},(_,i)=>[cx+radius*Math.cos(Math.PI/6+i*Math.PI/3),cy+radius*Math.sin(Math.PI/6+i*Math.PI/3)]);
    stroke([...vertices,vertices[0]],white,2.3);
    for(let i=0;i<6;i++){
      const a=vertices[i],b=vertices[(i+1)%6],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
      stroke([[cx,cy],a],faint,1.1);stroke([[cx,cy],mid],faint,1.1,[3,6]);circle(...a,3.4,blue,true);
    }
  }
  const [cx,cy]=centers[4],v=[cx+radius*Math.cos(Math.PI/6),cy+radius*.5],mid=[cx+radius*Math.cos(Math.PI/6)/2,cy+radius*.75];
  c.fillStyle='#d8c28125';c.beginPath();c.moveTo(cx,cy);c.lineTo(...v);c.lineTo(...mid);c.closePath();c.fill();stroke([[cx,cy],v,mid,[cx,cy]],gold,3.5);
  text('δ',cx+23,cy+27,31,gold);text('2',cx-18,cy-8,19,gold);text('0',v[0]+9,v[1]+2,19,gold);text('1',mid[0]+4,mid[1]+24,19,gold);
  text('Delaney chambers',460,184,27,gold,-.035);
  text('σ₀² = σ₁² = σ₂² = 1',460,222,24);
  text('D = {δ}',472,268,28);
  text('σᵢ(δ) = δ',472,306,27);
  text('m₀₁ = 6',472,349,27,blue);
  text('m₁₂ = 3',472,387,27,blue);
  text('hexagonal toy case',456,425,22,faint,.02);
  curvedArrow([[487,439],[458,457],[457,474],[416,470]],gold);
  // A suggestive spectrum, explicitly a sketch rather than fabricated NMR data.
  const spectrum=[];for(let i=0;i<=540;i++){const x=i/540,y=[.19,.39,.57,.78].reduce((sum,p,j)=>sum+(j%2?27:44)*Math.exp(-(((x-p)/.012)**2)),0);spectrum.push([74+i,514-y]);}
  stroke(spectrum,blue,2);text('δ (²⁹Si)',623,517,23,blue);
  text('sites · occupancies · connectivities',60,538,21,faint);

  // Figure 1's actual edge set from Vander Meulen–Van Tuyl–Watt.
  text('C₁₂(1,3,4)',838,70,40);text('Catriona’s circulants',1092,69,26,gold,.035);
  const nodes=Array.from({length:12},(_,i)=>[1093+168*Math.cos(i*Math.PI/6-Math.PI/2),290+168*Math.sin(i*Math.PI/6-Math.PI/2)]);
  for(const [step,color]of[[4,gold],[3,blue],[1,white]]){
    for(let i=0;i<12;i++)stroke([nodes[i],nodes[(i+step)%12]],color,step===1?3:1.65);
  }
  nodes.forEach(([x,y],i)=>{c.fillStyle='#203932';c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fill();circle(x,y,6,white);const a=i*Math.PI/6-Math.PI/2;text(String(i+1),x+20*Math.cos(a)-6,y+20*Math.sin(a)+7,20);});
  text('step 1',1310,224,24);text('step 3',1310,263,24,blue);text('step 4',1310,302,24,gold);
  text('Cohen–',1288,376,25,rose,-.055);text('Macaulay?',1290,407,25,rose,-.055);
  curve([[1280,414],[1353,433],[1435,425],[1460,395]],rose,1.5);
  text('i ~ j  ⇔  min(|i−j|, 12−|i−j|) ∈ {1,3,4}',821,493,26);
  text('I(G) = ⟨ xᵢxⱼ : {i,j} ∈ E(G) ⟩',842,538,30,blue);

  text('sparse companions',48,607,37,white,-.015);text('2n − 1 entries',468,608,28,gold,.03);
  // A non-Fiedler sparse companion example from Brydon's research summary.
  // The coefficient block is rows 3–4, columns 1–3 (one-based indices).
  c.fillStyle='#d8c2810e';c.fillRect(162,764,319,105);stroke([[161,765],[480,765],[480,872],[161,872],[161,765]],gold,1.6,[7,7]);
  text('C =',49,749,39);bracket(139,647,235,1);bracket(569,647,235,-1);
  const matrix=[['0','1','0','0'],['0','0','1','0'],['−a₃','0','−a₁','1'],['−a₄','0','−a₂','0']];
  matrix.forEach((row,i)=>row.forEach((entry,j)=>text(entry,183+j*96-(entry.length>1?17:0),689+i*55,35,entry.startsWith('−')?gold:entry==='1'?blue:faint)));
  text('not just',596,718,25,rose,-.07);text('Fiedler!',596,751,28,rose,-.07);
  curvedArrow([[638,773],[642,816],[580,848],[491,837]],rose,2);
  text('det(λI−C) = λ⁴ + a₁λ³ + a₂λ² + a₃λ + a₄',46,933,29);
  const gx=[99,264,429,594],gy=1070;
  for(let i=0;i<3;i++){arrow([[gx[i]+14,gy],[gx[i+1]-14,gy]],blue,3);text('1',(gx[i]+gx[i+1])/2-5,gy-12,22,blue);}
  curvedArrow([[gx[2]-8,gy-12],[gx[2]-35,957],[gx[0]+35,957],[gx[0]+8,gy-12]],gold);text('−a₃',236,989,26,gold);
  curvedArrow([[gx[3]-7,gy+13],[gx[3]-40,1195],[gx[0]+40,1195],[gx[0]+7,gy+13]],gold);text('−a₄',320,1182,26,gold);
  curvedArrow([[gx[3]-12,gy+7],[gx[3]-39,1133],[gx[2]+39,1133],[gx[2]+12,gy+7]],gold);text('−a₂',491,1135,26,gold);
  curvedArrow([[gx[2]-7,gy-13],[gx[2]-70,993],[gx[2]+69,993],[gx[2]+7,gy-13]],rose);text('−a₁',452,1024,24,rose);
  gx.forEach((x,i)=>{c.fillStyle='#203932';c.beginPath();c.arc(x,gy,13,0,Math.PI*2);c.fill();circle(x,gy,12,i===2?rose:white);text(String(i+1),x-7,gy+8,23,i===2?rose:white);});
  text('every cycle',600,1012,23,rose,-.06);text('meets here',603,1042,23,rose,-.06);arrow([[624,1053],[618,1100],[451,1085]],rose,1.8);

  text('chemostat / Holling II',833,612,36,white,.012);
  text('q(x) = ax / (b+x)',849,663,30,blue);
  text('supercritical Hopf',1159,668,27,gold,-.025);
  arrow([[862,935],[1484,935]],faint,2);arrow([[862,935],[862,712]],faint,2);
  text('x',839,718,27);text('S⁰',1483,967,27);text('schematic',883,960,21,faint);
  const hx=1090,hy=828;
  stroke([[878,hy],[hx,hy]],white,3.2);stroke([[hx,hy],[1460,hy]],white,2,[9,8]);
  const upper=[],lower=[];for(let i=0;i<=100;i++){const t=i/100;upper.push([hx+t*370,hy-100*Math.sqrt(t)]);lower.push([hx+t*370,hy+87*Math.sqrt(t)]);}
  stroke(upper,blue,3.4);stroke(lower,blue,3.4);circle(hx,hy,6,gold,true);
  stroke([[hx,hy+12],[hx,935]],gold,1.5,[5,8]);text('S⁰crit',1057,965,25,gold);
  text('stable eq.',895,856,24);text('unstable eq.',1262,815,22,faint);
  text('stable cycle',1318,713,23,blue);text('max / min',1350,890,21,blue);
  text('Ṡ = D(S⁰−S) − mSx',831,1016,30);
  text('ẋ = x(−D+mS) − yq(x)',831,1056,30);
  text('ẏ = y(−D+q(x))',831,1096,30);
  // Phase portrait: the coexistence point loses stability to one stable orbit.
  const ox=1382,oy=1095;
  arrow([[1286,1165],[1491,1165]],faint,1.5);arrow([[1286,1165],[1286,1031]],faint,1.5);
  const orbit=[];for(let i=0;i<=90;i++){const a=i/90*Math.PI*2;orbit.push([ox+79*Math.cos(a),oy+48*Math.sin(a)]);}stroke(orbit,blue,2.7);
  const spiral=[];for(let i=0;i<=150;i++){const a=i*.10,r=.10+.89*i/150;spiral.push([ox+79*r*Math.cos(a),oy+48*r*Math.sin(a)]);}stroke(spiral,faint,1.2);
  circle(ox,oy,3,rose,true);arrow([[ox+69,oy+22],[ox+61,oy+31]],blue,2.4);text('x',1493,1172,22);text('y',1263,1037,22);
  text('one orbit. globally attracting.*',833,1150,24,gold,-.025);
  text('*positive, non-equilibrium solutions',832,1183,20,faint);

  // A little dust and interrupted strokes, applied last without obscuring text.
  for(let i=0;i<21000;i++){const x=random()*W,y=random()*H;c.fillStyle=i%3?'#203932':'#e0e3cf';c.globalAlpha=i%3?.17:.05;c.fillRect(x,y,random()*1.8+.3,random()*1.2+.3);}c.globalAlpha=1;
  return canvas;
}
