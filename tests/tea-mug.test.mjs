import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../js/vendor/three.module.min.js';
import {createTeaMug} from '../js/cabin-tea.mjs';

const rimTop=.231;
function steamHeights(mug){
  const steam=mug.getObjectByName('Tea steam'),matrix=new THREE.Matrix4(),position=new THREE.Vector3();
  return Array.from({length:steam.count},(_,i)=>{steam.getMatrixAt(i,matrix);return position.setFromMatrixPosition(matrix).y;});
}

test('tea sits well below the rim, so the mug reads as hollow rather than brimming',()=>{
  const top=new THREE.Box3().setFromObject(createTeaMug().getObjectByName('Steeping tea')).max.y;
  assert.ok(top<rimTop-.05,`tea top ${top} should sit well below the rim`);
});

test('the tea bag tag hangs off the side opposite the handle',()=>{
  const mug=createTeaMug();
  const handle=new THREE.Box3().setFromObject(mug.getObjectByName('Smooth oval tea mug handle')).getCenter(new THREE.Vector3());
  const tag=mug.getObjectByName('Tea bag tag').getWorldPosition(new THREE.Vector3());
  assert.ok(handle.x<0,'handle on one side');assert.ok(tag.x>.1,'tag on the other');
});

test('steam rises out of the mug and holds still for reduced motion',()=>{
  const mug=createTeaMug();
  mug.userData.animate(1200,false);const moving=steamHeights(mug);
  assert.ok(Math.max(...moving)>rimTop+.1,'steam clears the rim');
  mug.userData.animate(2600,false);assert.notDeepEqual(steamHeights(mug),moving);
  mug.userData.animate(1200,true);const still=steamHeights(mug);
  mug.userData.animate(2600,true);assert.deepEqual(steamHeights(mug),still);
});
