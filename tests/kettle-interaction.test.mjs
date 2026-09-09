import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../js/vendor/three.module.min.js';
import {createHearthKettle} from '../js/cabin-life.mjs';

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
