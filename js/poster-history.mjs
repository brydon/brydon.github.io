export const POSTERS=Object.freeze([
  {name:'Cohere',print:'/images/switchback/cohere-poster.svg'},
  {name:'Thinking Machines',print:'/images/switchback/posters/thinking-machines.svg'},
  {name:'OpenAI',print:'/images/switchback/posters/openai.svg'},
  {name:'Minerva AI',print:'/images/switchback/posters/minerva.svg'},
  {name:'University of Waterloo',print:'/images/switchback/posters/waterloo.svg'},
  {name:'McMaster University',print:'/images/switchback/posters/mcmaster.svg'},
  {name:'Redeemer University',print:'/images/switchback/posters/redeemer.svg'}
]);

const CLICKS=5,WINDOW_MS=3000;
export const RED_HERRING_FACT='A red herring can spend two or three weeks being cold-smoked.';
export const RED_HERRING_ASIDE='That is a very patient fish.';

/** A rolling click window; each newly exposed poster starts with a clean slate. */
export function createPosterHistory(){
  let index=0,hits=[],falling=false,elapsed=0;
  return {
    get index(){return index;},
    get falling(){return falling;},
    get current(){return POSTERS[index]??null;},
    tap(now){
      if(falling||index===POSTERS.length||!Number.isFinite(now))return false;
      hits=hits.filter(at=>now-at<=WINDOW_MS&&now>=at);
      hits.push(now);
      if(hits.length>=CLICKS){falling=true;elapsed=0;hits=[];return 'fall';}
      return 'wobble';
    },
    advance(seconds,reducedMotion=false){
      if(!falling)return 0;
      elapsed+=Math.max(0,seconds);
      const progress=Math.min(1,elapsed/(reducedMotion?.18:.95));
      if(progress===1){index++;falling=false;elapsed=0;}
      return progress;
    }
  };
}
