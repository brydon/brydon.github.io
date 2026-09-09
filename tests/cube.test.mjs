import test from 'node:test';
import assert from 'node:assert/strict';
import {solvedCube,turnCube,cubeSolved,CUBE_FACES,FACE_KEYS,makeScramble,invertMove,faceGrid,createCubeSession} from '../js/cube-state.mjs';
import {createCubeModel} from '../js/cube-model.mjs';
import {createCubeTurn} from '../js/cube-turn.mjs';

const apply=(cube,moves)=>moves.reduce((state,{face,amount})=>turnCube(state,face,amount),cube);
function random(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}

test('cube has 26 pieces, with the usual corners, edges, centres and nine stickers of each colour',()=>{
  const state=solvedCube();assert.equal(state.length,26);
  for(const [stickers,count]of [[1,6],[2,12],[3,8]])assert.equal(state.filter(piece=>piece.stickers.length===stickers).length,count);
  for(const face of FACE_KEYS){assert.equal(state.flatMap(piece=>piece.stickers).filter(sticker=>sticker.color===face).length,9);assert.deepEqual(faceGrid(state,face),Array(9).fill(face));}
  assert.ok(cubeSolved(state));
});

test('all faces obey quarter, half, inverse and fourth-power turn identities without mutating input',()=>{
  for(const face of FACE_KEYS){
    const start=solvedCube(),snapshot=structuredClone(start),once=turnCube(start,face);
    assert.deepEqual(start,snapshot);assert.ok(!cubeSolved(once));
    assert.deepEqual(turnCube(once,face,-1),start);
    assert.deepEqual(turnCube(once,face),turnCube(start,face,2));
    assert.deepEqual(apply(start,Array(4).fill({face,amount:1})),start);
  }
  assert.throws(()=>turnCube(solvedCube(),'X'),RangeError);
  assert.throws(()=>turnCube(solvedCube(),'R',3),RangeError);
});

test('clockwise R and F move adjoining stickers in standard outside-face directions',()=>{
  const right=turnCube(solvedCube(),'R').find(piece=>piece.id==='1,1,1');
  assert.deepEqual(right.position,[1,1,-1]);
  assert.deepEqual(right.stickers.find(sticker=>sticker.color==='F').normal,[0,1,0]);
  assert.deepEqual(right.stickers.find(sticker=>sticker.color==='U').normal,[0,0,-1]);
  const front=turnCube(solvedCube(),'F').find(piece=>piece.id==='1,1,1');
  assert.deepEqual(front.position,[1,-1,1]);
  assert.deepEqual(front.stickers.find(sticker=>sticker.color==='U').normal,[1,0,0]);
  assert.deepEqual(faceGrid(turnCube(solvedCube(),'R'),'U'),['U','U','F','U','U','F','U','U','F']);
  const commutator=[{face:'R',amount:1},{face:'U',amount:1},{face:'R',amount:-1},{face:'U',amount:-1}];
  assert.ok(!cubeSolved(apply(solvedCube(),commutator)));
  assert.deepEqual(apply(solvedCube(),Array(6).fill(commutator).flat()),solvedCube());
});

test('legal scrambles remain reachable, preserve outward stickers, and can be solved by their inverses',()=>{
  for(let seed=1;seed<=25;seed++){
    const moves=makeScramble(random(seed),120),scrambled=apply(solvedCube(),moves);
    assert.ok(!cubeSolved(scrambled));assert.equal(new Set(scrambled.map(piece=>piece.position.join(','))).size,26);
    for(const face of FACE_KEYS){const grid=faceGrid(scrambled,face);assert.equal(grid.filter(Boolean).length,9);}
    for(const piece of scrambled)for(const sticker of piece.stickers){
      assert.equal(sticker.normal.filter(Boolean).length,1);
      const axis=sticker.normal.findIndex(Boolean);assert.equal(piece.position[axis],sticker.normal[axis]);
    }
    assert.deepEqual(apply(scrambled,[...moves].reverse().map(invertMove)),solvedCube());
  }
});

test('session records only player moves, undoes, pauses its timer when solved, and resets for practice',()=>{
  const initial=apply(solvedCube(),makeScramble(random(30))),game=createCubeSession(initial);
  assert.equal(game.undo(),false);game.tick(10);assert.equal(game.elapsed,0);
  game.turn('L',-1);game.tick(2);assert.equal(game.elapsed,2);assert.equal(game.history.length,1);
  assert.deepEqual(game.undo(),{face:'L',amount:1});assert.deepEqual(game.state,initial);
  game.reset(true);assert.ok(game.solved);assert.ok(!game.started);assert.equal(game.elapsed,0);
  game.turn('R');game.tick(3);game.turn('R',-1);assert.ok(game.solved);assert.ok(game.started);
  game.tick(40);assert.equal(game.elapsed,3);
  game.reset();assert.ok(!game.solved);assert.equal(game.history.length,0);assert.equal(game.elapsed,0);
});

test('animated turns rotate exactly nine pieces and snap safely when interrupted or finished twice',()=>{
  for(const face of FACE_KEYS)for(const amount of [1,-1,2]){
    const before=apply(solvedCube(),makeScramble(random(16))),after=turnCube(before,face,amount),model=createCubeModel(before);
    const motion=createCubeTurn(model,before,after,{face,amount}),pivot=model.group.children.find(object=>object.children.length===9);
    assert.ok(pivot);motion.sample(.5);
    assert.equal(pivot.rotation[['x','y','z'][CUBE_FACES[face].axis]],-CUBE_FACES[face].layer*amount*Math.PI/4);
    motion.finish();motion.finish();motion.sample(.9);
    assert.equal(model.group.children.length,26);
    for(const piece of after){
      const actual=model.pieces.get(piece.id);assert.deepEqual(actual.position.toArray(),piece.position);
      assert.deepEqual(actual.quaternion.toArray(),[0,0,0,1]);
      piece.stickers.forEach((sticker,i)=>assert.deepEqual(actual.children[i+1].position.toArray(),sticker.normal.map(n=>n*.474)));
    }
    model.dispose();
  }
});
