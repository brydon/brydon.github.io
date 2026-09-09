import {generateAudioSamples} from './audio-samples.mjs';

const cache=new Map();
async function cooperativeSamples(sampleRate){
  const generator=generateAudioSamples(sampleRate);let next;
  while(!(next=generator.next()).done)await new Promise(resolve=>setTimeout(resolve,0));
  return next.value;
}
function workerSamples(sampleRate){
  return new Promise((resolve,reject)=>{
    const worker=new Worker(new URL('./audio-buffer-worker.mjs',import.meta.url),{type:'module'});
    worker.onmessage=({data})=>{worker.terminate();resolve(data);};
    worker.onerror=event=>{event.preventDefault();worker.terminate();reject(new Error('Audio worker unavailable'));};
    worker.postMessage({sampleRate});
  });
}

/** Reuse one pending/result promise for every request at the context's rate. */
export function prepareAudioSamples(sampleRate){
  if(!cache.has(sampleRate)){
    const task=(typeof Worker==='undefined'?cooperativeSamples(sampleRate):workerSamples(sampleRate).catch(()=>cooperativeSamples(sampleRate)))
      .catch(error=>{cache.delete(sampleRate);throw error;});
    cache.set(sampleRate,task);
  }
  return cache.get(sampleRate);
}
