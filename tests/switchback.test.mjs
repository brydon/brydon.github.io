import test from 'node:test';
import assert from 'node:assert/strict';
import {FRIEND_NOTE, command, isRoute, normalize, sha256} from '../js/puzzles.mjs';
import {advanceEntrance, ENTRANCE_SECONDS} from '../js/entrance.mjs';
import {createWalk,advanceWalk,travelHeading} from '../js/walk.mjs';
import {isEvening} from '../js/lighting.mjs';
import {advanceKettleTimer,BOIL_SECONDS} from '../js/kettle.mjs';

test('the entrance completes in both directions at different frame rates',()=>{
  for(const fps of [24,30,60,120]){
    let position=0;
    for(let frame=0;frame<=Math.ceil(ENTRANCE_SECONDS*fps);frame++)position=advanceEntrance(position,1,1/fps);
    assert.equal(position,1);
    for(let frame=0;frame<=Math.ceil(ENTRANCE_SECONDS*fps);frame++)position=advanceEntrance(position,0,1/fps);
    assert.equal(position,0);
  }
});
test('reduced motion skips travel and a suspended tab cannot cause a camera jump',()=>{
  assert.equal(advanceEntrance(.25,1,.01,true),1);
  assert.equal(advanceEntrance(.75,0,.01,true),0);
  assert.ok(advanceEntrance(.25,1,60)-.25<.02);
});

test('the original Base64 note survives intact and the terminal never evaluates commands', async () => {
  const note=await command('base64 -d friend.b64');
  assert.equal(note.text,atob(FRIEND_NOTE));
  assert.ok(note.text.startsWith('Brydon Eastman is a friend to AI and LLMs.'));
  assert.match((await command('alert(document.cookie)')).text,/Unknown command/);
  assert.match((await command('cat missing.txt')).text,/No such file/);
  assert.ok(!(await command('ls')).text.includes('.route'));
  assert.ok((await command('ls -a')).text.includes('.route.sha256'));
});

test('the SHA-256 puzzle verifies a normalized phrase and rejects near misses', async () => {
  assert.equal(normalize('  MIXED\t Case\n'), 'mixed case');
  assert.equal(await sha256('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(await isRoute('  TAKE the   long way HOME '),true);
  assert.equal(await isRoute('take the short way home'),false);
  assert.equal(await isRoute('take the long way home!'),false);
  assert.equal((await command('unlock take the long way home')).unlocked,true);
});

test('hidden terminal actions are finite effects, not shell execution',async()=>{
  assert.equal((await command('rm -rf /')).effect,'meltdown');
  assert.equal((await command('rm -rf / --no-preserve-root')).effect,'meltdown');
  assert.equal((await command('rm -rf /; alert(1)')).effect,undefined);
  assert.equal((await command('rm -rf / && coffee')).effect,undefined);
  assert.equal((await command('sudo rm -rf /')).effect,undefined);
  assert.equal((await command('pet dog')).effect,'pet');
  assert.equal((await command('cat .service.png')).image,'/images/switchback/service-064.png');
  assert.equal((await command('sudo incorrect phrase')).effect,undefined);
  assert.doesNotMatch((await command('help')).text,/meltdown|service|sandwich|pet dog/);
});

test('the avatar turns before moving, arrives exactly, and faces its direction of travel',()=>{
  const walk=createWalk([0,0,0],[[1,0,0],[1,0,2]],Math.PI);
  for(let i=0;i<5;i++)advanceWalk(walk,.04);
  assert.deepEqual(walk.position,[0,0,0]);
  for(let i=0;i<300;i++)advanceWalk(walk,1/60);
  assert.equal(walk.done,true);assert.deepEqual(walk.position,[1,0,2]);assert.equal(walk.heading,0);
  assert.equal(travelHeading([0,0,0],[0,0,2]),0);
  assert.equal(Math.abs(travelHeading([0,0,2],[0,0,0])),Math.PI);
  const reduced=createWalk([0,0,0],[[2,0,4]]);advanceWalk(reduced,.01,true);assert.equal(reduced.done,true);assert.deepEqual(reduced.position,[2,0,4]);
});

test('default lighting follows local morning and evening boundaries',()=>{
  assert.equal(isEvening(6),true);assert.equal(isEvening(7),false);assert.equal(isEvening(12),false);assert.equal(isEvening(18),false);assert.equal(isEvening(19),true);assert.equal(isEvening(0),true);
});

test('the kettle heats across visits after first entry and pauses in the background',()=>{
  let elapsed=advanceKettleTimer(0,120,{inside:false});assert.equal(elapsed,0);
  elapsed=advanceKettleTimer(elapsed,20,{inside:true});assert.equal(elapsed,20);
  elapsed=advanceKettleTimer(elapsed,20,{inside:false});assert.equal(elapsed,40);
  for(const inside of [true,false])assert.equal(advanceKettleTimer(elapsed,120,{inside,visible:false}),40);
  elapsed=advanceKettleTimer(elapsed,20,{inside:true});assert.equal(elapsed,BOIL_SECONDS);
  elapsed=advanceKettleTimer(elapsed,10,{inside:false});assert.equal(elapsed,70);
  assert.equal(advanceKettleTimer(elapsed,NaN,{inside:true}),70);
});
