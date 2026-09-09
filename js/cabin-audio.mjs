/** Original procedural sound design. No recordings, music downloads or backend. */
export function createCabinAudio(context,samples){
  const master=context.createGain();master.gain.value=.60;
  const limiter=context.createDynamicsCompressor();limiter.threshold.value=-15;limiter.knee.value=18;limiter.ratio.value=5;limiter.attack.value=.006;limiter.release.value=.25;master.connect(limiter).connect(context.destination);
  const state={inside:false,boiling:false,burning:false,aurora:false};
  let enabled=false,nextCrackle=0,lastBark=-10,scoreUntil=0;
  const voices=new Set();let seed=805;
  const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  function buffer(channels){const result=context.createBuffer(channels.length,channels[0].length,samples.sampleRate);channels.forEach((data,i)=>result.copyToChannel(data,i));return result;}
  const white=buffer([samples.white]),brown=buffer([samples.brown]);
  function gain(value=0,output=master){const node=context.createGain();node.gain.value=value;node.connect(output);return node;}
  function filter(type,freq,q=1){const node=context.createBiquadFilter();node.type=type;node.frequency.value=freq;node.Q.value=q;return node;}
  function track(node,outputs=[]){voices.add(node);node.onended=()=>{voices.delete(node);node.disconnect();outputs.forEach(n=>n.disconnect());};return node;}
  function noise(buffer,type,freq,volume){const source=context.createBufferSource(),eq=filter(type,freq,.7),level=gain(volume);source.buffer=buffer;source.loop=true;source.connect(eq).connect(level);source.start();return {source,eq,level};}
  function ramp(param,value,seconds=.45){param.setTargetAtTime(value,context.currentTime,seconds);}
  const forest=noise(brown,'lowpass',800,.025),fire=noise(brown,'lowpass',1200,0),hiss=noise(white,'bandpass',3400,0);
  const whistleLevel=gain(0),whistle=context.createOscillator(),overtone=context.createOscillator(),overtoneLevel=gain(.14,whistleLevel);
  whistle.frequency.value=1568;overtone.frequency.value=3136;whistle.connect(whistleLevel);overtone.connect(overtoneLevel);whistle.start();overtone.start();
  const vibrato=context.createOscillator(),vibratoDepth=context.createGain();vibrato.frequency.value=6.5;vibratoDepth.gain.value=12;vibrato.connect(vibratoDepth).connect(whistle.frequency);vibrato.start();
  const musicBus=gain(0),dry=gain(.7,musicBus),wet=gain(.23,musicBus),reverb=context.createConvolver();
  const impulse=buffer(samples.impulse);
  reverb.buffer=impulse;reverb.connect(wet);
  const musicInput=context.createGain();musicInput.connect(dry);musicInput.connect(reverb);
  function tone(freq,at,duration,volume,type='sine',output=master,attack=.025,detune=0){
    const level=gain(0,output),osc=track(context.createOscillator(),[level]);osc.type=type;osc.frequency.setValueAtTime(freq,at);osc.detune.value=detune;osc.connect(level);
    level.gain.setValueAtTime(0,at);level.gain.linearRampToValueAtTime(volume,at+attack);level.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.start(at);osc.stop(at+duration+.03);return osc;
  }
  function burst(at,length,volume,freq,type='lowpass'){
    const source=track(context.createBufferSource()),eq=filter(type,freq,.9),level=gain(0);source.buffer=white;source.connect(eq).connect(level);
    level.gain.setValueAtTime(.0001,at);level.gain.linearRampToValueAtTime(volume,at+.008);level.gain.exponentialRampToValueAtTime(.0001,at+length);
    source.onended=()=>{voices.delete(source);source.disconnect();eq.disconnect();level.disconnect();};source.start(at,random()*2,length);return source;
  }
  function music(){
    if(!enabled||state.burning||context.currentTime<scoreUntil)return;
    const start=context.currentTime+.15;scoreUntil=start+39;ramp(musicBus.gain,1,1.5);
    // Dmaj9 → Bm7 → Gmaj9 → Asus2: slow, warm, unresolved in the nicest way.
    const chords=[[146.832,220,277.183,329.628],[123.471,185,220,293.665],[97.999,146.832,185,246.942],[110,164.814,220,293.665]];
    chords.forEach((chord,bar)=>{
      const at=start+bar*8;
      chord.forEach((freq,i)=>{tone(freq,at+i*.09,10,.045,'sine',musicInput,1.9,-3);tone(freq*2,at+i*.09,9,.015,'sine',musicInput,2.2,3);});
      const melody=[chord[3]*2,chord[1]*2,chord[2]*2,chord[3]*2];
      melody.forEach((freq,i)=>{tone(freq,at+1.4+i*1.55,3.6,.032,'sine',musicInput,.012);tone(freq*2.005,at+1.4+i*1.55,1.1,.004,'sine',musicInput,.008);});
    });
  }
  function sync(){
    ramp(forest.level.gain,state.inside?.014:.025);
    ramp(fire.level.gain,state.burning?.22:state.inside?.018:.009,state.burning?.8:.4);
    ramp(fire.eq.frequency,state.burning?1800:850);
    ramp(hiss.level.gain,state.boiling&&!state.burning?.025:0,.4);
    ramp(whistleLevel.gain,state.boiling&&!state.burning?.035:0,.6);
    if(state.burning)ramp(musicBus.gain,0,.25);
  }
  return {
    context,
    async setEnabled(on){enabled=on;if(on){await context.resume();sync();if(state.aurora&&!state.burning)music();}else await context.suspend();},
    async visibility(visible){if(!visible)await context.suspend();else if(enabled)await context.resume();},
    setWorld(values){const wasAurora=state.aurora;Object.assign(state,values);sync();if(enabled&&state.aurora&&!wasAurora)music();},
    pet(){
      if(!enabled||context.state!=='running'||context.currentTime-lastBark<1.3)return;
      lastBark=context.currentTime;
      // Two short rounded yips, with a downward pitch bend and breath noise.
      for(let i=0;i<2;i++){
        const at=context.currentTime+i*.19,eq=filter('lowpass',1100,.8),level=gain(0),osc=track(context.createOscillator(),[eq,level]);
        osc.type='sawtooth';osc.frequency.setValueAtTime(230+i*25,at);osc.frequency.exponentialRampToValueAtTime(95+i*18,at+.12);osc.connect(eq).connect(level);
        level.gain.setValueAtTime(0,at);level.gain.linearRampToValueAtTime(.11,at+.014);level.gain.exponentialRampToValueAtTime(.0001,at+.15);osc.start(at);osc.stop(at+.17);burst(at,.085,.028,900,'bandpass');
      }
    },
    explode(){
      state.burning=true;state.boiling=false;sync();
      if(!enabled||context.state!=='running')return;
      const at=context.currentTime;
      burst(at,.9,.38,1100);burst(at+.025,.19,.13,2600,'highpass');
      const boom=tone(95,at,.9,.23);boom.frequency.exponentialRampToValueAtTime(31,at+.75);
      for(let i=0;i<8;i++)burst(at+.15+i*.095,.075,.035,800+random()*2500);
    },
    update(){
      if(!enabled||context.state!=='running'||context.currentTime<nextCrackle)return;
      const now=context.currentTime;nextCrackle=now+(state.burning?.055+random()*.11:.35+random()*.8);
      if(state.inside||state.burning)burst(now+.01,.018+random()*.06,state.burning?.022+random()*.04:.006+random()*.008,700+random()*2100,'bandpass');
    },
    dispose(){enabled=false;[forest.source,fire.source,hiss.source,whistle,overtone,vibrato,...voices].forEach(node=>{try{node.stop();}catch{/* Already ended. */}});master.disconnect();context.close?.();}
  };
}
