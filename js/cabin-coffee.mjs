/*
                 )   (
                  ( )
               .-------.
                \ | | / )
                 \| |/--'
                  \ /
               .---V---.
              /         \
              \_________/
             [  300.0 g  ]

        The bloom is a perfectly good reason to do nothing for a bit.
*/
import * as THREE from './vendor/three.module.min.js';
import {createCoffeeState,coffeeAction,advanceCoffee,coffeeProgress,fillProgress,coffeeClueRevealed,servingFraction,servingMotion,brewWater,waterIsFlowing} from './coffee.mjs';

export function createCoffeeStation(cabin,onChange=()=>{}){
  const station=new THREE.Group();station.name='V60 pour-over station';station.position.set(1.94,1.10,.50);station.rotation.y=-Math.PI/2;cabin.add(station);
  const materials=new Map(),state=createCoffeeState();
  function mesh(geometry,color,x=0,y=0,z=0,parent=station){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.6,flatShading:true}));const object=new THREE.Mesh(geometry,materials.get(color));object.position.set(x,y,z);object.castShadow=true;parent.add(object);return object;}
  const box=(w,h,d,x,y,z,c,p)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z,p);
  const cylinder=(top,bottom,height,x,y,z,c,sides=16,p)=>mesh(new THREE.CylinderGeometry(top,bottom,height,sides),c,x,y,z,p);
  function pipe(points,radius,color,p){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),28,radius,7,false),color,0,0,0,p);}
  function label(width,height,color,background){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const c=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return {material:new THREE.MeshBasicMaterial({map:texture,toneMapped:false}),draw(text){c.fillStyle=background;c.fillRect(0,0,width,height);c.fillStyle=color;c.font=Math.round(height*.48)+'px monospace';c.textAlign='center';c.fillText(text,width/2,height*.69);texture.needsUpdate=true;}};}
  box(.4,.032,.37,-.21,.018,.045,'#293b35');box(.355,.008,.26,-.21,.04,.018,'#3e4b42');
  const readout=label(256,40,'#a2c894','#152921');
  box(.245,.027,.004,-.21,.021,.233,'#162922').material=readout.material;
  for(const x of [-.365,-.055])cylinder(.012,.012,.006,x,.022,.235,'#6c7d65',10).rotation.x=Math.PI/2;
  const glass=new THREE.MeshPhysicalMaterial({color:'#d9e6dc',transparent:true,opacity:.28,roughness:.12,side:THREE.DoubleSide,depthWrite:false});
  const profile=[[0,0],[.094,.002],[.123,.027],[.135,.09],[.123,.14],[.085,.19],[.073,.225],[.084,.231]].map(([x,y])=>new THREE.Vector2(x,y));
  const server=new THREE.Group();server.name='Coffee server';server.position.set(-.21,.045,.015);station.add(server);const serverHome=server.position.clone();
  const carafe=mesh(new THREE.LatheGeometry(profile,24),'#d9e6dc',0,0,0,server);carafe.material=glass;carafe.castShadow=false;
  const coffee=cylinder(.119,.104,.075,0,.058,0,'#533322',24,server),coffeeSurface=cylinder(.119,.119,.004,0,.097,0,'#70502f',24,server);
  pipe([[.115,.17,0],[.19,.16,0],[.215,.10,0],[.175,.05,0],[.115,.065,0]],.013,'#c6d5cb',server).material=glass;
  const filterRig=new THREE.Group();filterRig.name='Lift-off V60';station.add(filterRig);
  cylinder(.101,.101,.018,-.21,.281,.015,'#e9ddc6',24,filterRig);
  const dripper=mesh(new THREE.CylinderGeometry(.157,.037,.20,24,1,true),'#e7dbc4',-.21,.393,.015,filterRig);dripper.material=new THREE.MeshStandardMaterial({color:'#e7dbc4',side:THREE.DoubleSide,roughness:.38});
  const paper=mesh(new THREE.CylinderGeometry(.143,.027,.19,24,1,true),'#f0e4c9',-.21,.411,.015,filterRig);paper.material=new THREE.MeshStandardMaterial({color:'#f0e4c9',side:THREE.DoubleSide,roughness:.98});
  const grounds=cylinder(.114,.04,.028,-.21,.454,.015,'#6a4630',24,filterRig);
  for(let i=0;i<12;i++){
    const points=[];for(let j=0;j<7;j++){const t=j/6,a=i*Math.PI/6+t*.28,r=.04+t*.119;points.push([-.21+Math.cos(a)*r,.294+t*.199,.015+Math.sin(a)*r]);}
    pipe(points,.006,'#cfc1a7',filterRig);
  }
  pipe([[-.06,.451,.015],[.006,.445,.015],[.019,.388,.015],[-.047,.358,.015]],.016,'#e7dbc4',filterRig);

  // A hollow heat-reveal mug: the ink stays invisible until coffee is served.
  const mug=new THREE.Group();mug.name='Heat-reveal desk mug';mug.position.set(-.02,1.187,-1.03);cabin.add(mug);
  const ceramic=new THREE.MeshPhysicalMaterial({color:'#ece8df',roughness:.30,clearcoat:.38,clearcoatRoughness:.22,side:THREE.DoubleSide});
  const clay=new THREE.MeshStandardMaterial({color:'#b59a77',roughness:.92,side:THREE.DoubleSide});
  function stoneware(profile,material,name){const part=mesh(new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),32),'#ece8df',0,0,0,mug);part.material=material;part.name=name;return part;}
  // Exposed stoneware is confined to the rounded lower fifth and a narrow lip.
  stoneware([[0,0],[.075,0],[.086,.002],[.093,.008],[.097,.017],[.100,.035],[.102,.050],[.098,.055]],clay,'Unglazed clay foot');
  stoneware([[.1018,.047],[.106,.051],[.107,.058],[.108,.075],[.109,.11],[.110,.17],[.111,.221],[.111,.228],[.102,.228],[.101,.216],[.093,.075],[.087,.032],[.080,.026],[0,.026]],ceramic,'Cream glazed hollow mug');
  stoneware([[.111,.2265],[.1115,.229],[.1105,.231],[.103,.231],[.1018,.229],[.102,.2265]],clay,'Thin unglazed rim');
  const handlePath=new THREE.CatmullRomCurve3([[-.113,.179,0],[-.157,.190,0],[-.196,.178,0],[-.212,.148,0],[-.205,.116,0],[-.172,.089,0],[-.113,.078,0]].map(p=>new THREE.Vector3(...p)));
  const handle=mesh(new THREE.TubeGeometry(handlePath,40,.013,8,false),'#ece8df',0,0,0,mug);handle.material=ceramic;handle.name='Smooth oval mug handle';
  const mugCoffee=cylinder(.09,.082,.16,0,.106,0,'#533322',20,mug);mugCoffee.name='Coffee in the desk mug';mugCoffee.visible=false;
  const ink=label(320,90,'#35463c','rgba(0,0,0,0)');ink.material.transparent=true;ink.material.depthWrite=false;ink.draw('take the');
  const lettering=new THREE.Mesh(new THREE.CylinderGeometry(.111,.1102,.038,20,1,true,-.61,1.22),ink.material);lettering.name='Warm mug lettering';lettering.position.set(0,.13,0);lettering.visible=false;mug.add(lettering);
  const mugSteam=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshBasicMaterial({color:'#e6ddc6',transparent:true,opacity:.2,depthWrite:false}),10);mugSteam.visible=false;mug.add(mugSteam);
  const servingStream=new THREE.Mesh(new THREE.CylinderGeometry(.004,.003,1,7),new THREE.MeshStandardMaterial({color:'#785136',roughness:.3}));servingStream.name='Coffee into the desk mug';servingStream.visible=false;cabin.add(servingStream);

  // Every movable part is geometry. Open rims and separate lids make filling readable.
  const goose=new THREE.Group();goose.position.set(.27,.116,.025);station.add(goose);const gooseHome=goose.position.clone();
  cylinder(.105,.13,.20,0,0,0,'#344540',20,goose);
  const collar=mesh(new THREE.CylinderGeometry(.089,.105,.055,20,1,true),'#43554b',0,.128,0,goose);collar.material.side=THREE.DoubleSide;
  cylinder(.084,.084,.003,0,.139,0,'#152d2b',20,goose);
  const gooseLid=new THREE.Group();gooseLid.position.y=.161;goose.add(gooseLid);
  cylinder(.102,.102,.011,0,0,0,'#283b34',20,gooseLid);cylinder(.026,.031,.036,0,.023,0,'#775638',10,gooseLid);
  pipe([[-.10,-.035,0],[-.165,-.019,0],[-.187,.129,0],[-.255,.211,0],[-.296,.211,0],[-.305,.187,0]],.012,'#657c70',goose);
  pipe([[.095,.122,0],[.184,.129,0],[.212,.052,0],[.176,-.042,0],[.11,-.037,0]],.025,'#25372f',goose);

  // A 1Zpresso-style hand grinder: textured grip, dial collar, Z crank and a knurled catch cup.
  const graphite='#191b1e',shoulder='#23262a',knurl='#2c2f33',band='#121416',wood='#875538';
  const shade=c=>materials.get(c)||materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.6,flatShading:true})).get(c);
  const around=n=>Array.from({length:n},(_,i)=>i/n*Math.PI*2);
  function marks(angles,w,h,r,y,tilt,c,p){const m=new THREE.InstancedMesh(new THREE.BoxGeometry(w,h,.003),shade(c),angles.length),o=new THREE.Object3D();angles.forEach((a,i)=>{o.position.set(Math.cos(a)*r,y,Math.sin(a)*r);o.rotation.set(0,Math.PI/2-a,tilt);o.updateMatrix();m.setMatrixAt(i,o.matrix);});p.add(m);return m;}
  const grinder=new THREE.Group();grinder.position.set(.47,0,.23);station.add(grinder);
  cylinder(.043,.043,.185,0,.188,0,graphite,20,grinder);cylinder(.045,.043,.018,0,.099,0,shoulder,20,grinder);
  cylinder(.046,.046,.115,0,.185,0,'#111315',24,grinder);marks(around(12),.004,.095,.0465,.185,0,'#303337',grinder);
  cylinder(.047,.047,.018,0,.116,0,knurl,24,grinder);marks(around(12),.006,.012,.0475,.116,.55,'#101214',grinder);
  cylinder(.046,.049,.026,0,.286,0,shoulder,24,grinder);cylinder(.051,.051,.032,0,.310,0,knurl,24,grinder);
  for(const y of [.295,.325])cylinder(.052,.052,.004,0,y,0,band,24,grinder);
  marks(around(4),.003,.014,.0515,.310,0,'#c5c7c8',grinder);marks(around(12).filter((_,i)=>i%3),.002,.007,.0515,.310,0,'#777b7e',grinder);
  cylinder(.047,.047,.010,0,.331,0,'#202327',24,grinder);
  const steel=new THREE.MeshStandardMaterial({color:'#a9adb0',metalness:.5,roughness:.35});
  cylinder(.010,.010,.022,0,.347,0,'#a9adb0',12,grinder).material=steel;
  const crank=new THREE.Group();crank.position.y=.354;grinder.add(crank);
  pipe([[0,0,0],[.040,0,0],[.098,-.055,0],[.170,-.055,0]],.0055,'#a9adb0',crank).material=steel;
  cylinder(.024,.019,.050,.170,-.055,0,wood,12,crank);mesh(new THREE.SphereGeometry(.024,12,4,0,Math.PI*2,0,Math.PI/2),wood,.170,-.030,0,crank);cylinder(.019,.016,.010,.170,-.085,0,'#68402c',12,crank);
  const catchCup=new THREE.Group();catchCup.position.copy(grinder.position);station.add(catchCup);const cupHome=catchCup.position.clone();
  mesh(new THREE.CylinderGeometry(.046,.045,.088,24,1,true),graphite,0,.047,0,catchCup).material=new THREE.MeshStandardMaterial({color:graphite,roughness:.6,flatShading:true,side:THREE.DoubleSide});
  cylinder(.044,.044,.006,0,.006,0,graphite,24,catchCup);
  cylinder(.048,.048,.018,0,.088,0,knurl,24,catchCup);marks(around(10),.005,.012,.0485,.088,-.6,'#111315',catchCup);
  // Grounds sit just below the rim so the tipped cup shows them in its mouth.
  const cupGrounds=cylinder(.041,.044,.012,0,.078,0,'#593d28',20,catchCup);
  const dust=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.005,0),materials.get('#593d28'),24);station.add(dust);
  box(.23,.004,.23,.054,.004,.255,'#e1cea3');
  const recipeTexture=new THREE.TextureLoader().load('/images/switchback/gesha-recipe.png');recipeTexture.colorSpace=THREE.SRGBColorSpace;
  const recipe=new THREE.Mesh(new THREE.PlaneGeometry(.225,.225),new THREE.MeshBasicMaterial({map:recipeTexture,toneMapped:false}));recipe.rotation.x=-Math.PI/2;recipe.position.set(.054,.007,.255);station.add(recipe);

  const steam=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshBasicMaterial({color:'#dce7d8',transparent:true,opacity:.22,depthWrite:false}),14);steam.frustumCulled=false;station.add(steam);
  const water=new THREE.Mesh(new THREE.CylinderGeometry(.004,.003,1,7),new THREE.MeshStandardMaterial({color:'#b4d9d5',transparent:true,opacity:.72,roughness:.1}));water.visible=false;station.add(water);
  const dummy=new THREE.Object3D(),tip=new THREE.Vector3(),landing=new THREE.Vector3(-.21,.468,.015),direction=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
  const ease=x=>{x=THREE.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
  let lastReadout='',lastSound='',lastWater='';
  function notify(){const p=coffeeProgress(state),flow=state.phase==='pouring'&&!waterIsFlowing(p)?'bloom':state.phase==='serving'&&!(p>=.4&&p<.75)?'carrying':state.phase;if(flow!==lastSound||state.water!==lastWater){lastSound=flow;lastWater=state.water;onChange(flow,state.water);}}
  function worldPoint(x,y,z){return station.localToWorld(new THREE.Vector3(x,y,z));}
  function quad(x,y,z,w,h){return [[x-w/2,y+h/2,z],[x+w/2,y+h/2,z],[x+w/2,y-h/2,z],[x-w/2,y-h/2,z]].map(p=>worldPoint(...p).toArray());}
  return {
    action(object,options){const accepted=coffeeAction(state,object,options);if(accepted)notify();return accepted;},
    get phase(){return state.phase;},get progress(){return coffeeProgress(state);},
    get filling(){return state.water==='filling';},get fillProgress(){return fillProgress(state);},
    clueRevealed(){return coffeeClueRevealed(state);},
    fillTarget(){return worldPoint(.27,.277,.025);},
    hitAreas(){return {grinder:quad(.54,.185,.285,.27,.37),v60:quad(-.21,.414,.17,.33,.25),gooseneck:quad(.27,.15,.14,.30,.30)};},
    animate(time,seconds,reduced=false,burning=false){
      advanceCoffee(state,seconds,{burning});notify();const phase=state.phase,p=coffeeProgress(state),pour=phase==='pouring',fill=state.water==='filling',loading=phase==='loading';
      const serving=phase==='serving',served=phase==='served',finished=['brewed','serving','served'].includes(phase),cupFill=served?1:serving?servingFraction(p):0;
      const volume=finished?300-cupFill*240:pour?brewWater(p):0;
      crank.rotation.y=phase==='grinding'?(reduced?0:state.elapsed*15):0;
      grinder.rotation.z=phase==='grinding'&&!reduced?Math.sin(time*.045)*.014:0;
      const lift=loading?ease(p/.27)*(1-ease((p-.80)/.20)):0;
      catchCup.position.copy(cupHome).lerp(new THREE.Vector3(-.17,.60,.015),lift);catchCup.rotation.z=-2.3*lift;
      cupGrounds.visible=phase==='ground'||(loading&&p<.55);
      grounds.visible=['ready','hot','pouring','brewed','serving','served'].includes(phase)||(loading&&p>.4);
      grounds.material.color.set(pour||finished?'#392b21':'#6a4630');
      dust.visible=loading&&p>.3&&p<.79;
      if(dust.visible)for(let i=0;i<24;i++){const f=(time*.004+i/24)%1;dummy.position.set(-.21+Math.sin(i*3)*.036,.64-f*.18,.015+Math.cos(i*2)*.035);dummy.scale.setScalar(1);dummy.updateMatrix();dust.setMatrixAt(i,dummy.matrix);}dust.instanceMatrix.needsUpdate=dust.visible;
      const raised=pour?ease(p/.12)*(1-ease((p-.90)/.10)):0;
      goose.position.copy(gooseHome).lerp(new THREE.Vector3(.14,.65,.015),raised);goose.rotation.z=.65*raised;
      if(pour&&!reduced){goose.position.x+=Math.sin(time*.0018)*.008*raised;goose.position.z+=Math.cos(time*.0018)*.008*raised;}
      const fp=fillProgress(state),lidLift=fill?ease(fp/.18)*(1-ease((fp-.84)/.16)):0;gooseLid.position.set(.13*lidLift,.161+.11*lidLift,0);gooseLid.rotation.z=-.45*lidLift;
      water.visible=pour&&waterIsFlowing(p);station.updateWorldMatrix(true,true);
      if(water.visible){tip.set(-.305,.187,0);goose.localToWorld(tip);station.worldToLocal(tip);direction.subVectors(landing,tip);water.position.copy(tip).add(landing).multiplyScalar(.5);water.scale.y=direction.length();water.quaternion.setFromUnitVectors(up,direction.normalize());}
      // Set the dripper down, carry the server to the desk, pour, then return it.
      const motion=serving?servingMotion(p):servingMotion(0),filterMove=motion.filter;
      filterRig.position.set(-.14*filterMove,-.235*filterMove+Math.sin(filterMove*Math.PI)*.24,.23*filterMove);
      const carry=motion.server;
      station.updateWorldMatrix(true,false);mug.updateWorldMatrix(true,false);
      const mugTarget=station.worldToLocal(mug.localToWorld(new THREE.Vector3(0,.46,.16)));
      server.position.copy(serverHome).lerp(mugTarget,carry);server.position.y+=Math.sin(carry*Math.PI)*.25;
      server.rotation.z=1.05*motion.tilt;
      station.updateWorldMatrix(true,true);
      servingStream.visible=serving&&p>=.4&&p<.75;
      if(servingStream.visible){
        const from=cabin.worldToLocal(server.localToWorld(new THREE.Vector3(-.079,.23,0))),to=cabin.worldToLocal(mug.localToWorld(new THREE.Vector3(0,.04+cupFill*.17,0)));
        direction.subVectors(to,from);servingStream.position.copy(from).add(to).multiplyScalar(.5);servingStream.scale.y=direction.length();servingStream.quaternion.setFromUnitVectors(up,direction.normalize());
      }
      mugCoffee.visible=cupFill>0;mugCoffee.scale.y=Math.max(.001,cupFill);mugCoffee.position.y=.027+.08*cupFill;
      lettering.visible=coffeeClueRevealed(state);mugSteam.visible=cupFill>0;
      if(mugSteam.visible)for(let i=0;i<10;i++){const f=reduced?i/10:(time*.0005+i/10)%1;dummy.position.set(Math.sin(i+f*3)*.045*f,.23+f*.25,Math.cos(i*2)*.04*f);dummy.scale.setScalar(.006+Math.sin(f*Math.PI)*.02);dummy.updateMatrix();mugSteam.setMatrixAt(i,dummy.matrix);}mugSteam.instanceMatrix.needsUpdate=mugSteam.visible;
      const fraction=volume/300;coffee.visible=coffeeSurface.visible=volume>0;coffee.scale.y=Math.max(.015,fraction);coffee.position.y=.007+.043*fraction;coffeeSurface.position.y=.010+.085*fraction;coffeeSurface.scale.setScalar(.84+.16*fraction);
      steam.visible=state.water==='hot'||['pouring','brewed'].includes(phase);const origin=phase==='brewed'?new THREE.Vector3(-.21,.52,.015):goose.position.clone().add(new THREE.Vector3(0,.21,0));
      if(steam.visible)for(let i=0;i<14;i++){const f=reduced?i/14:(time*.00045+i/14)%1;dummy.position.copy(origin).add(new THREE.Vector3(Math.sin(i*2+f*3)*.055*f,f*.36,Math.cos(i*3)*.045*f));dummy.scale.setScalar(.008+Math.sin(f*Math.PI)*.032);dummy.updateMatrix();steam.setMatrixAt(i,dummy.matrix);}steam.instanceMatrix.needsUpdate=steam.visible;
      const mass=serving?0:finished?volume:pour?volume:grounds.visible?18:0,clock=pour?Math.floor(state.elapsed):finished?16:0;
      const text=mass.toFixed(1).padStart(5,'0')+'g  0:'+String(clock).padStart(2,'0');if(text!==lastReadout){readout.draw(text);lastReadout=text;}
    }
  };
}
