import {generateAudioSamples} from './audio-samples.mjs';

self.onmessage=({data})=>{
  const generator=generateAudioSamples(data.sampleRate);let next;
  do{next=generator.next();}while(!next.done);
  const samples=next.value;
  self.postMessage(samples,[samples.white.buffer,samples.brown.buffer,...samples.impulse.map(channel=>channel.buffer)]);
};
