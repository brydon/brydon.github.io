import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../js/vendor/three.module.min.js';
import {createDeskChair} from '../js/cabin-chair.mjs';
import {notebookHitArea} from '../js/cabin-notebook.mjs';

test('the real open-weave chair does not hide exposed notebook paper',()=>{
  const cabin=new THREE.Group(),chair=createDeskChair(cabin);
  const monitor=new THREE.Mesh(new THREE.BoxGeometry(1.36,.94,.2));monitor.position.set(.56,1.64,-1.4);cabin.add(monitor);
  const paper=new THREE.Mesh(new THREE.PlaneGeometry(.372,.442));paper.rotation.x=-Math.PI/2;paper.position.set(1.37,1.256,-1.02);cabin.add(paper);
  assert.ok(chair.children.some(child=>child.isLineSegments),'exercise the actual chair weave');
  const camera=new THREE.PerspectiveCamera(65,1,.07,100);
  for(const pan of [0,.18,.36]){
    camera.position.set(.2+pan*.12,2,1.65);camera.lookAt(Math.sin(pan*Math.PI)*3.05,1.55,1.65-Math.cos(pan*Math.PI)*3.05);
    const exposed=notebookHitArea(paper,camera,[chair,monitor]);
    assert.equal(exposed.length,9,`paper remains available at pan ${pan}`);
  }
});

test('solid occlusion is cached until camera, paper or furniture changes',()=>{
  const paper=new THREE.Mesh(new THREE.PlaneGeometry(.372,.442));
  const camera=new THREE.PerspectiveCamera();camera.position.z=2;
  const furniture=new THREE.Group(),blocker=new THREE.Mesh(new THREE.BoxGeometry(.6,.6,.1));
  blocker.position.z=1;furniture.add(blocker);
  let casts=0;const original=blocker.raycast;blocker.raycast=function(...args){casts++;return original.apply(this,args);};
  const blocked=notebookHitArea(paper,camera,[furniture]);assert.equal(blocked.length,0);
  const firstCasts=casts;assert.ok(firstCasts>0);
  assert.equal(notebookHitArea(paper,camera,[furniture]),blocked);assert.equal(casts,firstCasts,'stationary frames reuse visibility');
  camera.rotation.y=.4;
  assert.equal(notebookHitArea(paper,camera,[furniture]),blocked);assert.equal(casts,firstCasts,'looking around does not change line of sight');
  camera.position.x=.04;
  notebookHitArea(paper,camera,[furniture]);assert.ok(casts>firstCasts,'moving the eye invalidates the cached rays');
  furniture.visible=false;assert.equal(notebookHitArea(paper,camera,[furniture]).length,9,'hidden parent does not occlude');
  furniture.visible=true;assert.equal(notebookHitArea(paper,camera,[furniture]).length,0,'visible parent occludes again');
  blocker.position.x=3;
  const exposed=notebookHitArea(paper,camera,[furniture]);assert.equal(exposed.length,9,'moving furniture updates visibility');
  paper.position.x=.2;
  const shifted=notebookHitArea(paper,camera,[furniture]);assert.notEqual(shifted,exposed);assert.ok(shifted[0][0]>exposed[0][0],'moving paper updates world corners');
  paper.visible=false;assert.equal(notebookHitArea(paper,camera,[furniture]).length,0);
  paper.visible=true;camera.position.z=-2;assert.equal(notebookHitArea(paper,camera,[furniture]).length,0,'the back of the paper is not interactive');
});
