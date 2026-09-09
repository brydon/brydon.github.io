/** Small chunks also let browsers without workers prepare audio without a stall. */
export function* generateAudioSamples(sampleRate){
  if(!Number.isInteger(sampleRate)||sampleRate<8000||sampleRate>384000)throw new RangeError('Unsupported audio sample rate');
  const white=new Float32Array(sampleRate*4),brown=new Float32Array(sampleRate*4);
  const impulse=[new Float32Array(Math.round(sampleRate*2.5)),new Float32Array(Math.round(sampleRate*2.5))];
  let seed=805,last=0;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  for(let start=0;start<white.length;start+=8192){
    for(let i=start,end=Math.min(start+8192,white.length);i<end;i++){
      const n=random()*2-1;white[i]=n;last=(last+.025*n)/1.025;brown[i]=last*4;
    }
    yield;
  }
  for(const channel of impulse)for(let start=0;start<channel.length;start+=8192){
    for(let i=start,end=Math.min(start+8192,channel.length);i<end;i++)channel[i]=(random()*2-1)*Math.pow(1-i/channel.length,3.5);
    yield;
  }
  return {sampleRate,white,brown,impulse};
}
