import * as THREE from './vendor/three.module.min.js';

/** Closed timber root-cellar doors, set into a low stone curb on the left wall. */
export function createCellarEntrance(){
  const entrance=new THREE.Group();entrance.name='Closed root cellar entrance';
  // Keep the doors forward of the rear fir so their opening arc has clearance.
  entrance.position.set(-3.205,0,.30);entrance.rotation.y=-Math.PI/2;
  const mat=(color,roughness=1,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const stone=[mat('#827e68'),mat('#918b72'),mat('#777967')];
  const mortar=mat('#575c4e'),timber=mat('#595442'),grain=mat('#4b493a');
  const boards=['#81765a','#786e55','#877c61','#726b55'].map(c=>mat(c));
  const seam=mat('#383b31'),iron=mat('#343d38',.65,.5),wornIron=mat('#788074',.52,.55);
  function mesh(geometry,material,parent=entrance){const m=new THREE.Mesh(geometry,material);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
  function box(w,h,d,x,y,z,material,parent=entrance){const m=mesh(new THREE.BoxGeometry(w,h,d),material,parent);m.position.set(x,y,z);return m;}
  const width=1.46,depth=1.46,low=.29,high=.83,slope=Math.atan2(high-low,depth),length=Math.hypot(depth,high-low);
  box(1.55,.20,1.53,0,.12,0,mortar);
  // Individual foundation stones leave small, recessed mortar joints.
  for(let i=0;i<5;i++){
    const x=-.63+i*.315;
    box(.303,.19+(i%2)*.016,.21,x,.132,.68,stone[i%3]);
    for(const side of [-1,1])box(.20,.20,.297,side*.69,.13,-.62+i*.31,stone[(i+1)%3]);
  }
  box(1.53,.048,1.54,0,.244,0,timber);
  const cheek=new THREE.Shape();cheek.moveTo(-depth/2,.268);cheek.lineTo(depth/2,.268);cheek.lineTo(depth/2,high);cheek.lineTo(-depth/2,low);cheek.closePath();
  const cheekGeometry=new THREE.ExtrudeGeometry(cheek,{depth:.047,bevelEnabled:false});
  for(const side of [-1,1]){
    const panel=mesh(cheekGeometry,timber);panel.rotation.y=Math.PI/2;panel.position.x=side<0?-width/2:width/2-.047;
    // Recessed joints follow the horizontal boards of each wedge-shaped cheek.
    for(let i=0;i<4;i++){
      const y=.36+i*.116,front=depth/2-(y-low)*depth/(high-low);
      box(.002,.009,front+depth/2,side*(width/2+.001),y,(front-depth/2)/2,grain);
    }
  }
  box(width,high-.268,.035,0,(high+.268)/2,-depth/2,timber);
  const doors=new THREE.Group();doors.name='Shut timber double doors';doors.position.y=(high+low)/2;doors.rotation.x=slope;entrance.add(doors);
  box(width,.035,length,0,0,0,seam,doors);
  for(const side of [-1,1]){
    const leaf=new THREE.Group();leaf.name=side<0?'Closed left cellar door':'Closed right cellar door';doors.add(leaf);
    for(let i=0;i<4;i++){
      const x=side*(.021+(i+.5)*.173);
      box(.168,.037,length-.028,x,.028,0,boards[(i+(side>0?1:0))%4],leaf);
      // Sparse long grain catches daylight without competing with the plank seams.
      for(let g=0;g<2;g++)box(.004,.001,.31+((i+g)%3)*.14,x-.05+g*.075,.047,-.37+g*.57+(i%2)*.035,grain,leaf);
    }
    for(const z of [-.48,.43]){
      box(.62,.016,.054,side*.425,.0545,z,iron,leaf);
      // Tapered strap tips and knuckles visibly meet the outer timber jambs.
      const tip=box(.075,.016,.043,side*.091,.0545,z,iron,leaf);tip.rotation.y=side*.06;
      const hinge=mesh(new THREE.CylinderGeometry(.021,.021,.12,8),wornIron,leaf);hinge.rotation.x=Math.PI/2;hinge.position.set(side*.737,.043,z);
      for(const x of [.18,.40,.65]){
        const rivet=mesh(new THREE.CylinderGeometry(.011,.011,.008,7),wornIron,leaf);rivet.position.set(side*x,.069,z);
      }
    }
    // Two modest iron ring pulls, bolted to the low end of the closed doors.
    box(.065,.012,.085,side*.115,.057,.26,iron,leaf);
    const pull=mesh(new THREE.TorusGeometry(.044,.009,6,12),wornIron,leaf);pull.rotation.x=-Math.PI/2+.22;pull.position.set(side*.115,.083,.29);
  }
  // A timber header and thin dark flashing close the high joint against the siding.
  box(1.57,.082,.084,0,high+.015,-depth/2-.018,timber);
  box(1.57,.018,.13,0,high+.063,-depth/2-.01,iron);
  return entrance;
}
