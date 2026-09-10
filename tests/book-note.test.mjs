import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../js/vendor/three.module.min.js';
import {createBookNoteState,BOOK_NOTE_DURATION} from '../js/book-note-state.mjs';
import {createBookNote} from '../js/cabin-book-note.mjs';
import {projectedVolumeBounds} from '../js/hit-area.mjs';

function fixture(){
  const cabin=new THREE.Group(),library=new THREE.Group();library.position.set(-2.04,.47,-.9);library.rotation.y=Math.PI/2;cabin.add(library);
  const book=new THREE.Group();book.position.set(-.479,.332,.026);library.add(book);
  book.add(new THREE.Mesh(new THREE.BoxGeometry(.112,.414,.30)));
  const urls=[],note=createBookNote(cabin,book,{loadTexture:url=>{urls.push(url);return new THREE.Texture();}});
  const paper=cabin.getObjectByName('Loose printed scrap from Feynman volume II');
  return {cabin,book,paper,note,urls};
}

test('one book release progresses to a readable landed note, never directly to a discovery',()=>{
  const state=createBookNoteState();
  state.advance(100);assert.equal(state.phase,'stashed');assert.equal(state.canRead,false);
  assert.equal(state.release(),true);assert.equal(state.phase,'falling');assert.equal(state.canRelease,false);assert.equal(state.canRead,false);
  assert.equal(state.release(),false);
  state.advance(.3);const elapsed=state.elapsed;
  state.advance(200,{paused:true});assert.equal(state.elapsed,elapsed,'background time does not advance the fall');
  for(const invalid of [NaN,Infinity,-10,0])state.advance(invalid);
  assert.equal(state.elapsed,elapsed);
  state.advance(BOOK_NOTE_DURATION);assert.equal(state.phase,'landed');assert.equal(state.canRead,true);
  state.advance(1000);assert.equal(state.elapsed,BOOK_NOTE_DURATION);assert.equal(state.release(),false);
});

test('reduced motion settles immediately and burning disables either interaction',()=>{
  const immediate=createBookNoteState();immediate.release(true);assert.equal(immediate.phase,'landed');assert.equal(immediate.canRead,true);
  const changing=createBookNoteState();changing.release();changing.advance(.2);changing.advance(0,{reducedMotion:true});assert.equal(changing.phase,'landed');
  for(const phase of ['stashed','falling','landed']){
    const state=createBookNoteState();if(phase!=='stashed')state.release(phase==='landed');
    state.advance(.1,{burning:true});assert.equal(state.canRead,false);assert.equal(state.canRelease,false);assert.equal(state.release(),false);
    state.advance(100);assert.equal(state.disabled,true,'a later frame cannot revive a burned interaction');
  }
});

test('the exact scrap slips from the Feynman book and comes to rest on clear floor',()=>{
  const {cabin,book,paper,note,urls}=fixture(),home=book.position.clone(),rotation=book.quaternion.clone();
  assert.deepEqual(urls,['/images/switchback/service-064.png']);assert.ok(Math.abs(paper.geometry.parameters.width/paper.geometry.parameters.height-384/176)<1e-12);
  assert.equal(paper.visible,false);assert.equal(note.bookArea().length,8);assert.deepEqual(note.paperArea(),[]);
  assert.equal(note.release(),true);assert.equal(note.release(),false);assert.deepEqual(note.bookArea(),[]);assert.deepEqual(note.paperArea(),[]);
  note.animate(.2);assert.equal(paper.visible,true);assert.ok(book.position.z>home.z,'the book visibly tugs forward');assert.equal(note.canRead(),false);
  const suspended=paper.position.clone();note.animate(100,false,false,true);assert.deepEqual(paper.position.toArray(),suspended.toArray());
  for(let frame=0;frame<110;frame++){
    note.animate(1/60);cabin.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(paper);assert.ok(bounds.min.y>=.470-1e-7,'even curled corners stay above the floorboards');
    if(note.phase!=='landed')assert.deepEqual(note.paperArea(),[],'airborne paper is not clickable');
  }
  assert.equal(note.phase,'landed');assert.equal(note.canRead(),true);assert.equal(note.paperArea().length,4);
  assert.deepEqual(book.position.toArray(),home.toArray());assert.ok(book.quaternion.angleTo(rotation)<1e-7,'book returns to its shelf');
  const bounds=new THREE.Box3().setFromObject(paper);
  assert.ok(bounds.max.y<.472,'the resting sheet does not hover');assert.ok(bounds.min.x> -1.78,'clear of the bookcase lip');assert.ok(bounds.max.z<-.375,'clear of the rug and its fringe');
  const normal=new THREE.Vector3(0,0,1).applyQuaternion(paper.quaternion);assert.ok(normal.y>.999,'printed front lands face up');
  const resting=note.paperArea();for(let visit=0;visit<4;visit++)note.animate(20);
  assert.deepEqual(note.paperArea(),resting,'inside/outside time never resets the landed note');
  assert.equal(cabin.children.filter(child=>child===paper).length,1);assert.equal(note.release(),false);
  const camera=new THREE.PerspectiveCamera(65,1,.07,100);camera.position.set(.2,1.928,1.65);camera.lookAt(-1.5,.8,-.4);camera.updateMatrixWorld();
  const points=resting.map(p=>{const v=new THREE.Vector3(...p).project(camera);return{x:(v.x*.5+.5)*800,y:(-.5*v.y+.5)*800,visible:v.z>-1&&v.z<1};});
  const target=projectedVolumeBounds(points);assert.ok(target&&target.width>=44&&target.height>=44);assert.ok(target.width<180&&target.height<180,'floor hit target remains local to the scrap');
});

test('model state settles without animation, and no paper interaction survives burning',()=>{
  const {book,paper,note}=fixture(),home=book.position.clone();note.release(true);
  assert.equal(paper.visible,true);assert.equal(note.canRead(),true);assert.deepEqual(book.position.toArray(),home.toArray());
  note.animate(.1,false,true);assert.equal(paper.visible,false);assert.deepEqual(note.paperArea(),[]);assert.deepEqual(note.bookArea(),[]);assert.equal(note.release(),false);
});
