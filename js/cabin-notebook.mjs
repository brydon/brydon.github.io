import * as THREE from './vendor/three.module.min.js';

// Opposite edges are translations of one another: the fish really share contours.
const contours=[
  ['moveTo',0,0],
  ['bezierCurveTo',.18,.14,.26,.20,.28,.20],
  ['bezierCurveTo',.47,-.13,.70,-.10,1,0],
  ['bezierCurveTo',.90,.18,.85,.28,1.10,.50],
  ['bezierCurveTo',.85,.72,.90,.82,1,1],
  ['bezierCurveTo',.70,.90,.47,.87,.28,1.20],
  ['bezierCurveTo',.26,1.20,.18,1.14,0,1],
  ['bezierCurveTo',-.10,.82,-.15,.72,.10,.50],
  ['bezierCurveTo',-.15,.28,-.10,.18,0,0]
];

/** Original pencil study of a fish tessellation, deliberately left half finished. */
export function drawNotebookSketch(){
  const canvas=document.createElement('canvas');canvas.width=432;canvas.height=512;
  const c=canvas.getContext('2d'),w=68,h=59;
  c.fillStyle='#f0e8d4';c.fillRect(0,0,432,512);
  // A little paper tooth, rather than an immaculate digital white rectangle.
  for(let i=0;i<3600;i++){
    const x=(i*157)%432,y=(i*293)%512;
    c.fillStyle=i%3?'rgba(110,95,72,.026)':'rgba(255,255,244,.14)';c.fillRect(x,y,1,1);
  }
  c.fillStyle='#686557';c.font='italic 18px Georgia, serif';c.fillText('Tiling study — fish',34,42);
  c.strokeStyle='rgba(98,96,83,.25)';c.lineWidth=.65;c.beginPath();c.moveTo(34,50);c.lineTo(195,48);c.stroke();

  c.save();c.beginPath();c.rect(27,70,382,348);c.clip();
  c.strokeStyle='rgba(109,120,112,.15)';c.lineWidth=.55;
  for(let x=29;x<430;x+=17){c.beginPath();c.moveTo(x,70);c.lineTo(x,420);c.stroke();}
  for(let y=76;y<425;y+=h/4){c.beginPath();c.moveTo(27,y);c.lineTo(412,y);c.stroke();}
  function outline(count=contours.length){
    c.beginPath();
    for(const [method,...coordinates]of contours.slice(0,count))c[method](...coordinates.map((v,i)=>v*(i%2?h:w)));
    if(count===contours.length)c.closePath();
  }
  function details(strength){
    c.strokeStyle=`rgba(73,70,60,${strength})`;c.lineWidth=.85;c.beginPath();
    c.moveTo(w*.76,h*.29);c.quadraticCurveTo(w*.62,h*.50,w*.77,h*.71);
    c.moveTo(w*.24,h*.50);c.quadraticCurveTo(w*.39,h*.42,w*.59,h*.48);
    c.moveTo(w*.39,h*.48);c.lineTo(w*.49,h*.34);c.lineTo(w*.55,h*.48);
    c.moveTo(w*.41,h*.72);c.lineTo(w*.51,h*.88);c.lineTo(w*.61,h*.76);c.stroke();
    c.beginPath();c.arc(w*.91,h*.46,2.1,0,Math.PI*2);c.stroke();
    c.fillStyle=`rgba(55,55,47,${strength})`;c.beginPath();c.arc(w*.914,h*.46,.85,0,Math.PI*2);c.fill();
    c.beginPath();c.moveTo(w*1.035,h*.535);c.lineTo(w*.963,h*.532);c.stroke();
  }
  for(let row=0;row<6;row++)for(let col=0;col<6;col++){
    const progress=row+col*.56,complete=progress<3.05,partial=progress>=3.05&&progress<4.85;
    if(!complete&&!partial)continue;
    c.save();c.translate(22+col*w,83+row*h);
    if(complete){
      outline();c.fillStyle=(row+col)%3===0?'rgba(98,95,80,.17)':'rgba(221,215,194,.32)';c.fill();
      if((row+col)%3===0){
        c.save();outline();c.clip();c.strokeStyle='rgba(77,74,62,.19)';c.lineWidth=.6;
        for(let x=-35;x<105;x+=4){c.beginPath();c.moveTo(x,0);c.lineTo(x+22,h*1.16);c.stroke();}
        c.restore();
      }
      outline();c.strokeStyle='rgba(72,71,60,.78)';c.lineWidth=1.0;c.stroke();details(.8);
    }else{
      // Work trails off into the construction grid: incomplete heads and faint tails.
      outline();c.strokeStyle='rgba(113,111,96,.18)';c.lineWidth=.65;c.stroke();
      outline(3+(row+col)%3);c.strokeStyle='rgba(78,78,68,.47)';c.lineWidth=.9;c.stroke();
      if(progress<3.85)details(.32);
    }
    c.restore();
  }
  c.restore();

  // A loose margin note and a tiny translation arrow leave room to keep drawing.
  c.fillStyle='#858172';c.font='italic 14px Georgia, serif';c.fillText('same edge, shifted ...',40,454);
  c.strokeStyle='rgba(104,101,88,.55)';c.lineWidth=.9;c.beginPath();
  c.moveTo(43,472);c.bezierCurveTo(75,481,93,477,118,469);c.lineTo(111,467);
  c.moveTo(118,469);c.lineTo(114,476);c.stroke();
  return canvas;
}

export function createNotebookSketch(){
  const map=new THREE.CanvasTexture(drawNotebookSketch());map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  const paper=new THREE.Mesh(new THREE.PlaneGeometry(.372,.442),new THREE.MeshStandardMaterial({map,roughness:.98,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
  paper.name='Half-finished pencil fish tessellation';paper.rotation.x=-Math.PI/2;
  paper.position.set(1.37,1.256,-1.02);paper.receiveShadow=true;return paper;
}
