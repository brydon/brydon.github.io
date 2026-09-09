export const BOIL_SECONDS=60;

/** Only an uninterrupted, visible visit to the room heats this kettle. */
export function advanceKettleTimer(elapsed,seconds,{inside,visible=true}){
  if(!inside)return 0;
  return visible?elapsed+Math.max(0,Number.isFinite(seconds)?seconds:0):elapsed;
}
