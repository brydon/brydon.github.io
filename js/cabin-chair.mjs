import * as THREE from './vendor/three.module.min.js';

/** A mesh task chair: open woven geometry, curved frame, arms and five casters. */
export function createDeskChair(cabin){
  const chair=new THREE.Group();chair.name='Graphite mesh desk chair';chair.position.set(1.4,.47,-.35);
  // Its open front faces the monitor, with the armrests clear of the desk edge.
  chair.rotation.y=.58;cabin.add(chair);
  const materials=new Map();
  function mesh(geometry,color,parent=chair){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.7,metalness:color==='#7b8580'?.5:.12,flatShading:true}));const m=new THREE.Mesh(geometry,materials.get(color));m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function tube(points,r,color,closed=false,parent=chair){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed),40,r,7,closed),color,parent);}
  function cylinder(r,h,x,y,z,color,parent=chair){const m=mesh(new THREE.CylinderGeometry(r,r,h,12),color,parent);m.position.set(x,y,z);return m;}
  function pad(w,h,d,x,y,z,color){const m=mesh(new THREE.BoxGeometry(w,h,d),color);m.position.set(x,y,z);return m;}
  // Gas lift and the splayed five-point base, with actual paired wheels.
  cylinder(.041,.27,0,.285,0,'#7b8580');cylinder(.067,.17,0,.19,0,'#303b38');pad(.19,.09,.25,0,.41,0,'#28332f');
  for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5,s=Math.sin(a),c=Math.cos(a);
    tube([[0,.20,0],[s*.17,.16,c*.17],[s*.34,.095,c*.34],[s*.39,.08,c*.39]],.028,'#46514b');
    const caster=new THREE.Group();caster.position.set(s*.39,.064,c*.39);caster.rotation.y=a;chair.add(caster);
    for(const side of [-1,1]){const wheel=cylinder(.057,.034,side*.037,0,0,'#252e2c',caster);wheel.rotation.z=Math.PI/2;const hub=cylinder(.022,.037,side*.039,0,0,'#68736c',caster);hub.rotation.z=Math.PI/2;}
  }
  // A rounded waterfall seat edge and a tall, gently curved back rim.
  tube([[-.25,.48,-.22],[0,.46,-.30],[.25,.48,-.22],[.27,.5,.13],[.19,.5,.23],[-.19,.5,.23],[-.27,.5,.13]],.031,'#414d47',true);
  tube([[-.20,.54,.21],[-.28,.72,.25],[-.28,1.02,.32],[-.17,1.12,.34],[.17,1.12,.34],[.28,1.02,.32],[.28,.72,.25],[.20,.54,.21]],.033,'#414d47',true);
  // Mesh strands remain genuinely open rather than a translucent solid panel.
  const lines=[];const segment=(a,b)=>lines.push(...a,...b);
  for(let i=0;i<24;i++){
    const x=-.235+i*.47/23;segment([x,.488,-.235],[x,.497,.18]);
    const y=.57+i*.51/23,w=y>.99?.24:.25,z=.21+(y-.54)*.22;segment([-w,y,z],[w,y,z]);
  }
  for(let i=0;i<20;i++){
    const z=-.22+i*.40/19;segment([-.237,.49,z],[.237,.49,z]);
    const x=-.23+i*.46/19;segment([x,.59,.224],[x,1.07,.327]);
  }
  const weave=new THREE.BufferGeometry();weave.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));chair.add(new THREE.LineSegments(weave,new THREE.LineBasicMaterial({color:'#718077',transparent:true,opacity:.7})));
  // Rear lumbar support, adjustable arms, and a small tilt lever.
  tube([[0,.4,.10],[0,.56,.31],[0,.77,.34]],.027,'#303b36');
  for(const side of [-1,1]){
    tube([[0,.69,.33],[side*.1,.73,.35],[side*.18,.79,.34]],.025,'#46524a');
    tube([[side*.19,.43,.11],[side*.31,.49,.13],[side*.34,.7,.07]],.025,'#4f5c54');
    pad(.11,.052,.34,side*.34,.735,-.04,'#27332f');
  }
  tube([[.08,.39,-.02],[.25,.36,-.13],[.31,.36,-.13]],.011,'#7b8580');pad(.10,.025,.045,.30,.36,-.13,'#303a33');
  return chair;
}
