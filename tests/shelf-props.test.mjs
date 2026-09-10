import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../js/vendor/three.module.min.js';
import {d20Faces,rollD20,DINER_BEATS,dinerFrame,cradlePose} from '../js/d20-state.mjs';
import {createNewtonsCradle} from '../js/cabin-shelf-props.mjs';

test('all twenty results match an upright printed face; opposite sides sum to 21',()=>{
  const geometry=new THREE.IcosahedronGeometry(.083,0),faces=d20Faces(geometry);
  assert.deepEqual(faces.map(face=>face.value).sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i+1));
  for(const face of faces){
    const opposite=faces.find(other=>other.normal.dot(face.normal)<-.999);
    assert.equal(face.value+opposite.value,21);
    assert.ok(face.normal.clone().applyQuaternion(face.orientation).distanceTo(new THREE.Vector3(0,0,1))<1e-6);
    assert.ok(face.up.clone().applyQuaternion(face.orientation).distanceTo(new THREE.Vector3(0,1,0))<1e-6);
  }
  for(let i=0;i<20;i++)assert.equal(rollD20(()=>(i+.5)/20),i+1);
  assert.equal(rollD20(()=>0),1);assert.equal(rollD20(()=>1-Number.EPSILON),20);geometry.dispose();
});

test('diner keeps the exact text, types in paced beats and finishes only after static',()=>{
  const quote='You find yourself in a diner, all evidence of a meal having taken place is before you, but you do not remember how you got here or eating the meal. All you remember is you have to get fast and get safe.';
  assert.equal(DINER_BEATS.map(beat=>beat.text).join(''),quote);
  for(const reduced of [false,true]){
    assert.equal(dinerFrame(0,reduced).segments.map(s=>s.text).join(''),'');
    let staticAt;
    for(let time=0;time<40000;time+=10){
      const frame=dinerFrame(time,reduced);
      if(frame.static){staticAt=time;assert.equal(frame.segments.map(s=>s.text).join(''),quote);assert.equal(frame.done,false);break;}
    }
    assert.ok(staticAt);assert.equal(dinerFrame(staticAt+1000,reduced).done,true);
  }
  const typing=dinerFrame(1100);assert.ok(typing.segments[0].text.length>0);assert.equal(typing.segments[1].text,'');
  const pause=dinerFrame(2050);assert.equal(pause.segments[0].text,DINER_BEATS[0].text);assert.equal(pause.segments[1].text,'');
});

test('cradle transfers motion between end balls, clicks at contact and settles',()=>{
  assert.ok(cradlePose(0).left<0);assert.equal(cradlePose(0).right,0);
  assert.equal(cradlePose(.7).left,0);assert.ok(cradlePose(.7).right>0);
  assert.equal(cradlePose(.34).impact,0);assert.equal(cradlePose(.36).impact,1);
  assert.ok(Math.abs(cradlePose(7).left)<Math.abs(cradlePose(0).left));
  assert.deepEqual(cradlePose(14),{left:0,right:0,impact:-1,done:true});
  const cradle=createNewtonsCradle(),events=[];
  cradle.userData.release();for(let i=0;i<300;i++)cradle.userData.tick(.05,false,level=>events.push(level));
  assert.ok(events.length>=19&&events.length<=20);assert.ok(events.every((level,i)=>!i||level<events[i-1]));
  const pivots=cradle.children.filter(child=>child.isGroup);assert.equal(pivots.length,5);
  assert.ok(pivots.every(p=>p.rotation.z===0));
  cradle.userData.release(true);cradle.userData.tick(.05,true,()=>assert.fail('Reduced motion must not schedule a stream of impacts'));
});
