export const ENTRANCE_SECONDS = 3.5;
export function advanceEntrance(progress, destination, delta, reducedMotion=false) {
  if(reducedMotion)return destination;
  const step=Math.max(0,Math.min(delta,.05))/ENTRANCE_SECONDS;
  return destination>progress?Math.min(destination,progress+step):Math.max(destination,progress-step);
}
