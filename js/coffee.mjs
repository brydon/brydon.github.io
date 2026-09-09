export const COFFEE_DURATION={grinding:3.2,loading:1.5,filling:4.5,pouring:16,serving:6};
const next={grinding:'ground',loading:'ready',filling:'hot',pouring:'brewed',serving:'served'};
export const createCoffeeState=()=>({phase:'idle',elapsed:0});
export const coffeeProgress=state=>COFFEE_DURATION[state.phase]?Math.min(1,state.elapsed/COFFEE_DURATION[state.phase]):0;
export const coffeeClueRevealed=state=>state.phase==='served';
export const servingFraction=progress=>Math.max(0,Math.min(1,(progress-.4)/.35));
export function servingMotion(progress){
  const ease=value=>{const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};
  return {
    filter:ease(progress/.18)*(1-ease((progress-.91)/.09)),
    server:ease((progress-.18)/.20)*(1-ease((progress-.80)/.11)),
    tilt:ease((progress-.34)/.06)*(1-ease((progress-.75)/.05))
  };
}

/** Physical prerequisites, independent of rendering and audio. */
export function coffeeAction(state,object,{offHeat=false}={}){
  let phase;
  if(object==='grinder'&&state.phase==='idle')phase='grinding';
  if(object==='v60'&&state.phase==='ground')phase='loading';
  if(object==='kettle'&&state.phase==='ready'&&offHeat)phase='filling';
  if((object==='v60'||object==='gooseneck')&&state.phase==='hot')phase='pouring';
  if(object==='mug'&&state.phase==='brewed')phase='serving';
  if(!phase)return false;
  state.phase=phase;state.elapsed=0;return true;
}
export function advanceCoffee(state,seconds,{visible=true,burning=false}={}){
  if(burning){state.phase='broken';state.elapsed=0;return;}
  if(!visible||!next[state.phase])return;
  state.elapsed+=Math.max(0,Number.isFinite(seconds)?seconds:0);
  if(state.elapsed>=COFFEE_DURATION[state.phase]){state.phase=next[state.phase];state.elapsed=0;}
}

/** Bloom, pause, then a gentle main pour; quantities drive both water and scale. */
export function brewWater(progress){
  if(progress<.12)return 0;
  if(progress<.32)return (progress-.12)/.20*60;
  if(progress<.46)return 60;
  return Math.min(300,60+(progress-.46)/.44*240);
}
export const waterIsFlowing=progress=>(progress>=.12&&progress<.32)||(progress>=.46&&progress<.90);
