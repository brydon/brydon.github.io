export const BOIL_SECONDS=60;

/** The first visit starts heating; it continues outside and pauses in hidden tabs. */
export function advanceKettleTimer(elapsed,seconds,{inside,visible=true,started=inside||elapsed>0}){
  if(!visible||!started)return elapsed;
  return elapsed+Math.max(0,Number.isFinite(seconds)?seconds:0);
}
