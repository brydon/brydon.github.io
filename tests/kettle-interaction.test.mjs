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
    if(progress===null){for(let i=0;i<4;i++)assert.ok(new THREE.Vector3(...area[i]).distanceTo(new THREE.Vector3(...home[i]))<1e-8);}
    else assert.ok(new THREE.Vector3(...area[0]).distanceTo(new THREE.Vector3(...home[0]))>2);
  }
  assert.equal(kettle.isOffHeat(),true);assert.equal(kettle.takeOff(),false);
});
