export const BOOK_NOTE_DURATION=1.65;

/** One paper, one release; moving between room views never resets this state. */
export function createBookNoteState(){
  let phase='stashed',elapsed=0,disabled=false;
  return {
    get phase(){return phase;},
    get elapsed(){return elapsed;},
    get progress(){return elapsed/BOOK_NOTE_DURATION;},
    get disabled(){return disabled;},
    get canRelease(){return !disabled&&phase==='stashed';},
    get canRead(){return !disabled&&phase==='landed';},
    release(reducedMotion=false){
      if(disabled||phase!=='stashed')return false;
      phase=reducedMotion?'landed':'falling';elapsed=reducedMotion?BOOK_NOTE_DURATION:0;return true;
    },
    advance(seconds,{reducedMotion=false,paused=false,burning=false}={}){
      if(burning)disabled=true;
      if(disabled||paused||phase!=='falling')return;
      if(reducedMotion){elapsed=BOOK_NOTE_DURATION;phase='landed';return;}
      if(!Number.isFinite(seconds)||seconds<=0)return;
      elapsed=Math.min(BOOK_NOTE_DURATION,elapsed+seconds);
      if(elapsed===BOOK_NOTE_DURATION)phase='landed';
    }
  };
}
