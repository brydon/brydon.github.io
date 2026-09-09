import * as THREE from './vendor/three.module.min.js';

export const REWARD_CODE='4d8be3c34a6d1385fac4538f51b811264bd010ffa4876f2f1bce2b1466c0f094';

export function createRewardSign(scene){
  const sign=new THREE.Group();sign.name='The long way home sign';sign.position.set(3.4,.07,4.4);sign.rotation.y=.25;sign.scale.setScalar(.8);sign.visible=false;scene.add(sign);
  function box(w,h,d,x,y,z,color){const object=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.94}));object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;sign.add(object);return object;}
  for(const x of [-.83,.83]){box(.12,1.98,.13,x,.99,-.035,'#785635');box(.16,.07,.17,x,2.00,-.035,'#b59159');}
  box(2.20,1.32,.12,0,1.52,0,'#76563a');
  const canvas=document.createElement('canvas');canvas.width=1100;canvas.height=620;const c=canvas.getContext('2d');
  c.fillStyle='#e5d6b1';c.fillRect(0,0,1100,620);c.strokeStyle='#526a58';c.lineWidth=3;c.strokeRect(24,24,1052,572);
  c.fillStyle='#304b40';c.textAlign='center';c.font='bold 42px monospace';c.fillText('THE LONG WAY HOME',550,109);
  c.font='30px monospace';c.fillText(REWARD_CODE.slice(0,32),550,220);c.fillText(REWARD_CODE.slice(32),550,266);
  c.font='28px monospace';const contact='Contact me with this code';c.fillText(contact,550,390);
  const start=550-c.measureText(contact).width/2;c.beginPath();c.moveTo(start,397);c.lineTo(start+c.measureText('Contact me').width,397);c.stroke();
  c.font='italic 28px serif';c.fillText('and thanks for taking the time to look around!',550,480);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
  const print=new THREE.Mesh(new THREE.PlaneGeometry(2.08,1.172),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));print.position.set(0,1.52,.066);sign.add(print);
  for(const x of [-.99,.99])for(const y of [.99,2.05]){const pin=new THREE.Mesh(new THREE.SphereGeometry(.018,6,4),new THREE.MeshStandardMaterial({color:'#6e7160',metalness:.5,roughness:.6}));pin.position.set(x,y,.075);sign.add(pin);}
  return {
    unlock(){sign.visible=true;},
    get visible(){return sign.visible;},
    hitArea(){return [[-1.1,2.18,.08],[1.1,2.18,.08],[1.1,.86,.08],[-1.1,.86,.08]].map(p=>sign.localToWorld(new THREE.Vector3(...p)).toArray());}
  };
}
