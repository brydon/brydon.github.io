import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../js/vendor/three.module.min.js';
import {POSTERS,createPosterHistory} from '../js/poster-history.mjs';
import {createPosterStack} from '../js/cabin-posters.mjs';

test('poster clicks use a rolling three-second window and ignore clicks during a fall',()=>{
  const history=createPosterHistory();
  for(const time of [0,1000,2000,3001,3500])assert.equal(history.tap(time),'wobble');
  assert.equal(history.tap(3999),'fall');
  for(let i=0;i<20;i++)assert.equal(history.tap(4000+i),false);
  assert.equal(history.current.name,'Cohere');
  history.advance(.5);assert.equal(history.falling,true);
  history.advance(.5);assert.equal(history.current.name,'Thinking Machines');
  assert.equal(history.tap(4500),'wobble');
  assert.equal(history.falling,false);
  assert.equal(history.tap(NaN),false);
});

test('all seven posters fall in order, including with reduced motion, leaving no wall interaction',()=>{
  for(const reduced of [false,true]){
    const history=createPosterHistory(),names=[];
    for(let layer=0;layer<7;layer++){
      names.push(history.current.name);
      for(let click=0;click<5;click++)assert.equal(history.tap(layer*5000+click*100),click===4?'fall':'wobble');
      history.advance(reduced?.2:1,reduced);
    }
    assert.deepEqual(names,['Cohere','Thinking Machines','OpenAI','Minerva AI','University of Waterloo','McMaster University','Redeemer University']);
    assert.equal(history.current,null);assert.equal(history.tap(99999),false);
    history.advance(10);assert.equal(history.index,7);
  }
});

test('the hit area follows the wobbling frame and every fallen poster rests face-up above the floor',()=>{
  for(const reduced of [false,true]){
    const cabin=new THREE.Group(),stack=createPosterStack(cabin,{loadTexture:()=>new THREE.Texture()});
    for(let layer=0;layer<7;layer++){
      const name=POSTERS[layer].name,frame=cabin.getObjectByName(name+' poster');
      assert.equal(stack.hotspot().name,name);
      const home=stack.hotspot().vertices;
      stack.tap(layer*5000);stack.animate(.065,reduced);
      assert.equal(stack.hotspot().disabled,false);
      assert.equal(JSON.stringify(home)!==JSON.stringify(stack.hotspot().vertices),!reduced);
      for(let i=1;i<5;i++)stack.tap(layer*5000+i*100);
      assert.equal(stack.hotspot().disabled,true);
      for(let i=0;i<60;i++)stack.animate(1/60,reduced);
      cabin.updateMatrixWorld(true);
      const bounds=new THREE.Box3().setFromObject(frame);
      assert.ok(bounds.min.y>=.54&&bounds.max.y<.73,'the frame clears the rug without hovering');
      const normal=new THREE.Vector3(0,0,1).applyQuaternion(frame.quaternion);
      assert.ok(normal.y>.999,'the artwork lies face-up');
      assert.equal(frame.visible,true);
      if(layer<6)assert.equal(stack.hotspot().name,POSTERS[layer+1].name);
    }
    assert.equal(stack.hotspot().kind,'note');
    assert.equal(stack.hotspot().disabled,false);
    assert.equal(stack.tap(99999),'note');
    assert.equal(cabin.getObjectByName('The last red herring').visible,true);
    assert.equal(cabin.children.filter(object=>object.visible).length,8);
  }
});
