import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../js/vendor/three.module.min.js';
import {createHearthKettle} from '../js/cabin-life.mjs';
import {projectedVolumeBounds} from '../js/hit-area.mjs';

test('the first entry starts the kettle and later exits preserve heat and boiling',()=>{
  const notifications=[],kettle=createHearthKettle(new THREE.Group(),boiling=>notifications.push(boiling));
  kettle.animate(120000,120,false,false);assert.deepEqual(notifications,[]);assert.equal(kettle.takeOff(),false);
  kettle.animate(120000,0,true,false); // A visit starts it even on a zero-delta frame.
  kettle.animate(140000,20,false,false);assert.equal(kettle.takeOff(),false);
  kettle.animate(160000,20,true,false);assert.equal(kettle.takeOff(),false);
  kettle.animate(280000,120,false,false,false);assert.deepEqual(notifications,[]);
  kettle.animate(299000,19,false,false);assert.equal(kettle.takeOff(),false);
  kettle.animate(300000,1,true,false);assert.deepEqual(notifications,[true]);
  kettle.animate(310000,10,false,false);kettle.animate(320000,10,true,false);
  assert.deepEqual(notifications,[true],'leaving and returning cannot cancel or retrigger boiling');
  assert.equal(kettle.takeOff(),true);assert.deepEqual(notifications,[true,false]);
  kettle.animate(440000,120,false,false);kettle.animate(560000,120,true,false);
  assert.deepEqual(notifications,[true,false],'taking the kettle off still ends heating');
});

test('taking a boiling kettle off stops its sound and keeps it off across room visits',()=>{
  const notifications=[],kettle=createHearthKettle(new THREE.Group(),boiling=>notifications.push(boiling));
  assert.equal(kettle.takeOff(),false);
  kettle.animate(59000,59,true,false);assert.equal(kettle.takeOff(),false);
  kettle.animate(60000,1,true,false);assert.deepEqual(notifications,[true]);
  assert.equal(kettle.takeOff(),true);assert.deepEqual(notifications,[true,false]);
  assert.equal(kettle.takeOff(),false);
  for(let frame=0;frame<240;frame++)kettle.animate(60000+frame*1000/60,1/60,true,false);
  kettle.animate(65000,1,false,false);
  kettle.animate(126000,61,true,true);
  assert.equal(kettle.takeOff(),false);assert.deepEqual(notifications,[true,false]);
});

test('filling moves the hot kettle and its hit area, then safely restores the swing arm',()=>{
  const cabin=new THREE.Group(),kettle=createHearthKettle(cabin);
  const body=cabin.getObjectByName('Hearth kettle body'),stream=cabin.getObjectByName('Hot water transfer'),target=new THREE.Vector3(1.915,1.393,.5);
  const rig=body.parent;
  kettle.fill(.5,target);assert.equal(body.parent,rig);assert.equal(stream.visible,false);
  kettle.animate(61000,61,true,false);kettle.takeOff();
  for(let i=0;i<60;i++)kettle.animate(61000+i*1000/60,1/60,true,false);
  const home=kettle.hitArea();
  for(const progress of [.5,null,.35,null]){
    kettle.fill(progress,target);
    assert.equal(stream.visible,progress!==null);
    assert.equal(body.parent,progress===null?rig:cabin);
    const area=kettle.hitArea();assert.ok(area.flat().every(Number.isFinite));
    if(progress===null){for(let i=0;i<home.length;i++)assert.ok(new THREE.Vector3(...area[i]).distanceTo(new THREE.Vector3(...home[i]))<1e-8);}
    else assert.ok(new THREE.Vector3(...area[0]).distanceTo(new THREE.Vector3(...home[0]))>2);
  }
  assert.equal(kettle.isOffHeat(),true);assert.equal(kettle.takeOff(),false);
});

test('filling immediately after taking the kettle off returns continuously to the swung hook',()=>{
  for(const reduced of [false,true]){
    const cabin=new THREE.Group(),kettle=createHearthKettle(cabin),body=cabin.getObjectByName('Hearth kettle body');
    const rig=body.parent,target=new THREE.Vector3(1.915,1.377,.77),point=new THREE.Vector3();
    kettle.animate(60000,60,true,reduced);assert.equal(kettle.takeOff(),true);
    const departure=body.getWorldPosition(new THREE.Vector3()),departureRotation=body.getWorldQuaternion(new THREE.Quaternion());
    kettle.fill(0,target);
    assert.ok(body.getWorldPosition(point).distanceTo(departure)<1e-8,'the outward path starts at the current kettle position');
    assert.ok(body.getWorldQuaternion(new THREE.Quaternion()).angleTo(departureRotation)<1e-7);
    for(let frame=1;frame<=270;frame++){
      kettle.animate(60000+frame*1000/60,1/60,true,reduced);
      kettle.fill(frame/270,target);
    }
    const returned=body.getWorldPosition(new THREE.Vector3()),returnedRotation=body.getWorldQuaternion(new THREE.Quaternion());
    assert.ok(returned.distanceTo(departure)>.7,'the kettle follows the hook that swung away while it was filling');
    kettle.fill(null,target);
    assert.equal(body.parent,rig);
    assert.ok(body.getWorldPosition(point).distanceTo(returned)<1e-8,'reattaching to the hook must not jump');
    assert.ok(body.getWorldQuaternion(new THREE.Quaternion()).angleTo(returnedRotation)<1e-7,'reattaching must not rotate the kettle');
    assert.equal(cabin.getObjectByName('Hot water transfer').visible,false);
  }
});

test('the kettle click area covers its geometry before, during and after swinging at different viewing angles',()=>{
  const cabin=new THREE.Group(),kettle=createHearthKettle(cabin),body=cabin.getObjectByName('Hearth kettle body');
  kettle.animate(61000,61,true,false);
  const camera=new THREE.PerspectiveCamera(55,16/9,.1,100),point=new THREE.Vector3();
  for(const pose of ['boiling','halfway','off']){
    if(pose==='halfway')kettle.takeOff();
    if(pose!=='boiling')for(let i=0;i<27;i++)kettle.animate(61000+i*1000/60,1/60,true,false);
    cabin.updateMatrixWorld(true);
    for(const location of [[.2,2,1.65],[.2,2,3],[.2,2,-.5]]){
      camera.position.set(...location);camera.lookAt(body.getWorldPosition(point));camera.updateMatrixWorld(true);
      const project=world=>{const p=point.copy(world).project(camera);return{x:(p.x+1)*640,y:(1-p.y)*360,visible:p.z>-1&&p.z<1};};
      const bounds=projectedVolumeBounds(kettle.hitArea().map(p=>project(new THREE.Vector3(...p))));
      assert.ok(bounds&&bounds.width>=44&&bounds.height>=44);
      body.traverse(object=>{
        const vertices=object.geometry?.attributes.position;if(!vertices)return;
        for(let i=0;i<vertices.count;i++){
          const p=project(new THREE.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(object.matrixWorld));
          assert.ok(p.x>=bounds.left&&p.x<=bounds.left+bounds.width&&p.y>=bounds.top&&p.y<=bounds.top+bounds.height,`${pose}: ${object.type} must remain clickable`);
        }
      });
    }
  }
  assert.equal(projectedVolumeBounds([{x:0,y:0,visible:false}]),null);
});
