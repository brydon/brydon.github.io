import test from 'node:test';
import assert from 'node:assert/strict';
import {generateAudioSamples} from '../js/audio-samples.mjs';
import {prepareAudioSamples} from '../js/audio-preload.mjs';

test('audio preparation yields, stays deterministic and preserves finite PCM at different rates',()=>{
  for(const rate of [8000,44100,48000]){
    const generate=()=>{const iterator=generateAudioSamples(rate);let next,yields=0;while(!(next=iterator.next()).done)yields++;assert.ok(yields>1);return next.value;};
    const a=generate(),b=generate();assert.deepEqual(a,b);
    assert.equal(a.white.length,rate*4);assert.equal(a.brown.length,rate*4);assert.equal(a.impulse.length,2);assert.equal(a.impulse[0].length,rate*2.5);
    for(const channel of [a.white,a.brown,...a.impulse])for(const value of channel)assert.ok(Number.isFinite(value));
    assert.ok(Math.abs(a.impulse[0].at(-1))<.00001);
  }
});

test('concurrent and later requests share the cache, while the fallback yields to the UI',async()=>{
  let yielded=false;setTimeout(()=>{yielded=true;},0);
  const first=prepareAudioSamples(8000),second=prepareAudioSamples(8000);assert.equal(first,second);
  const samples=await first;assert.equal(yielded,true);assert.equal(await prepareAudioSamples(8000),samples);
});
