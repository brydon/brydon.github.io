import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../js/vendor/three.module.min.js';
import {createRaccoon} from '../js/cabin-raccoon.mjs';

test('raccoon visits different shelters, pauses offscreen, and rests with reduced motion',()=>{
  const raccoon=createRaccoon(new THREE.Scene()),start=raccoon.group.position.clone();
  for(let i=0;i<200;i++)raccoon.animate(.1,false,false);
  assert.ok(raccoon.group.position.equals(start));assert.equal(raccoon.group.visible,false);
  const positions=[];
  for(let i=0;i<1800;i++){
    raccoon.animate(.1,false,true);
    const {x,y,z}=raccoon.group.position;assert.ok([x,y,z].every(Number.isFinite));
    assert.ok(x<-5&&x>-7&&z>-2.6&&z<3.6,'route stays in the left fir grove');
    assert.ok(Math.hypot(x+3.55,z-3.45)>1.8,'raccoon stays clear of the campfire');
    if(i%50===0)positions.push(z);
  }
  assert.ok(Math.max(...positions)>3);assert.ok(Math.min(...positions)<-2);
  const paused=raccoon.group.position.clone();raccoon.animate(100,false,false);assert.ok(raccoon.group.position.equals(paused));
  raccoon.animate(.1,true,true);const still=raccoon.group.position.clone();
  for(let i=0;i<100;i++)raccoon.animate(.1,true,true);
  assert.ok(raccoon.group.position.equals(still));
  raccoon.night(true);const eyes=raccoon.group.getObjectByName('Raccoon eyes');assert.ok(eyes.children[0].material.emissiveIntensity>0);
  raccoon.night(false);assert.equal(eyes.children[0].material.emissiveIntensity,0);
});
