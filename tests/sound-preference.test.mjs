import test from 'node:test';
import assert from 'node:assert/strict';
import {createSoundPreference,isSoundRestoreGesture} from '../js/sound-preference.mjs';

const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
function fixture(saved,overrides={}){
  const calls=[],changes=[],errors=[];
  let stored=saved,playing=false;
  const audio={setEnabled(on){calls.push(['enabled',on]);playing=on;return Promise.resolve();},visibility(on){calls.push(['visible',on]);if(!on)playing=false;return Promise.resolve();}};
  const preference=createSoundPreference({
    read:()=>stored,write:value=>{stored=value;},
    prepare:()=>{calls.push(['prepare']);return Promise.resolve(audio);},
    resume:()=>{calls.push(['resume']);return Promise.resolve();},
    disable:()=>audio.setEnabled(false),
    onChange:value=>changes.push(value),onError:error=>errors.push(error),...overrides
  });
  return {preference,audio,calls,changes,errors,get stored(){return stored;},get playing(){return playing;}};
}

test('saved on is displayed at load without preparing or resuming audio; the first gesture restores it',async()=>{
  const f=fixture('true');
  assert.equal(f.preference.enabled,true);assert.deepEqual(f.changes,[true]);assert.deepEqual(f.calls,[]);
  const restored=f.preference.gesture();
  assert.deepEqual(f.calls,[['prepare'],['resume']],'resume runs before the gesture handler returns');
  assert.equal(f.preference.gesture(),restored,'concurrent gestures share preparation');
  assert.equal(await restored,true);assert.equal(f.playing,true);
  await f.preference.gesture();assert.equal(f.calls.filter(([name])=>name==='resume').length,1);
});

test('saved off and a new visitor stay silent on gestures',async()=>{
  for(const saved of ['false',null]){
    const f=fixture(saved);assert.equal(f.preference.enabled,false);assert.deepEqual(f.changes,[false]);
    await f.preference.gesture();assert.deepEqual(f.calls,[]);
  }
});

test('both toggle choices persist and are restored by the next page load',async()=>{
  const f=fixture(null);
  const started=f.preference.toggle();assert.equal(f.stored,'true');assert.equal(f.preference.enabled,true);
  await started;assert.equal(f.playing,true);assert.equal(fixture(f.stored).preference.enabled,true);
  await f.preference.toggle();assert.equal(f.stored,'false');assert.equal(f.playing,false);
  assert.equal(fixture(f.stored).preference.enabled,false);
});

test('turning off while samples load cancels restored sound permanently',async()=>{
  const ready=deferred(),f=fixture('true',{prepare:()=>ready.promise});
  const started=f.preference.gesture();await f.preference.toggle();
  assert.equal(f.stored,'false');assert.deepEqual(f.changes,[true,false]);
  ready.resolve(f.audio);assert.equal(await started,false);
  assert.equal(f.playing,false);assert.ok(!f.calls.some(([name,on])=>name==='enabled'&&on));
});

test('turning off during asynchronous enable wins even if the old enable finishes late',async()=>{
  const enabled=deferred(),entered=deferred(),f=fixture('true');
  const original=f.audio.setEnabled;
  f.audio.setEnabled=on=>{
    if(!on)return original(false);
    entered.resolve();return enabled.promise.then(()=>original(true));
  };
  const started=f.preference.gesture();await entered.promise;
  await f.preference.toggle();enabled.resolve();await started;
  assert.equal(f.playing,false);assert.equal(f.stored,'false');assert.deepEqual(f.changes,[true,false]);
});

test('an old canceled preparation cannot interfere with a newer On click',async()=>{
  const old=deferred(),latest=deferred();let attempts=0;
  const f=fixture('true',{prepare:()=>++attempts===1?old.promise:latest.promise});
  const first=f.preference.gesture();await f.preference.toggle();const second=f.preference.toggle();
  latest.resolve(f.audio);assert.equal(await second,true);
  old.resolve(f.audio);assert.equal(await first,false);
  assert.equal(f.playing,true);assert.equal(f.stored,'true');
});

test('autoplay rejection preserves On and silently retries on the next real gesture',async()=>{
  let blocked=true;const f=fixture('true',{resume:()=>blocked?Promise.reject(Error('blocked')):Promise.resolve()});
  assert.equal(await f.preference.gesture(),false);assert.equal(f.preference.enabled,true);assert.deepEqual(f.errors,[]);
  blocked=false;assert.equal(await f.preference.gesture(),true);assert.equal(f.playing,true);
});

test('explicit unsupported audio reports the failure but remembers the requested choice',async()=>{
  const failure=Error('no AudioContext'),f=fixture(null,{prepare:()=>{throw failure;}});
  assert.equal(await f.preference.toggle(),false);assert.equal(f.stored,'true');assert.deepEqual(f.errors,[failure]);
});

test('unavailable storage does not prevent sound from being toggled',async()=>{
  const fail=()=>{throw Error('storage blocked');},f=fixture(null,{read:fail,write:fail});
  assert.equal(f.preference.enabled,false);await f.preference.toggle();assert.equal(f.playing,true);
  await f.preference.toggle();assert.equal(f.playing,false);
});

test('a restore completing in a hidden page stays suspended',async()=>{
  const f=fixture('true',{hidden:()=>true});await f.preference.gesture();assert.equal(f.playing,false);
  assert.deepEqual(f.calls.at(-1),['visible',false]);
});

test('only genuine pointer/key gestures restore sound, excluding the toggle itself',()=>{
  const pointer={type:'pointerdown',isTrusted:true,button:0,target:{closest:()=>null}};
  assert.equal(isSoundRestoreGesture(pointer),true);
  assert.equal(isSoundRestoreGesture({...pointer,isTrusted:false}),false);
  assert.equal(isSoundRestoreGesture({...pointer,button:2}),false);
  assert.equal(isSoundRestoreGesture({...pointer,target:{closest:()=>({})}}),false);
  const key={type:'keydown',isTrusted:true,key:'Enter',repeat:false,target:pointer.target};
  assert.equal(isSoundRestoreGesture(key),true);
  assert.equal(isSoundRestoreGesture({...key,repeat:true}),false);
  assert.equal(isSoundRestoreGesture({...key,key:'Shift'}),false);
  assert.equal(isSoundRestoreGesture({...key,target:{closest:()=>({})}}),false);
});
