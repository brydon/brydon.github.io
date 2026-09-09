const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export const travelHeading=(from,to)=>Math.atan2(to[0]-from[0],to[2]-from[2]);
export function createWalk(position,points,heading=0){return{position:[...position],from:[...position],points:points.map(p=>[...p]),heading,fromHeading:heading,index:0,time:0,phase:'turn',done:false};}
export function advanceWalk(walk,delta,reducedMotion=false){
  if(walk.done)return walk;
  if(reducedMotion){walk.heading=travelHeading(walk.position,walk.points.at(-1));walk.position=[...walk.points.at(-1)];walk.done=true;return walk;}
  const destination=walk.points[walk.index],targetHeading=travelHeading(walk.from,destination);
  walk.time+=clamp(delta,0,.05);
  if(walk.phase==='turn'){
    const t=clamp(walk.time/.25,0,1),shortest=Math.atan2(Math.sin(targetHeading-walk.fromHeading),Math.cos(targetHeading-walk.fromHeading));
    walk.heading=walk.fromHeading+shortest*t*t*(3-2*t);
    if(t===1){walk.phase='walk';walk.time=0;}
  }else{
    const distance=Math.hypot(...destination.map((v,i)=>v-walk.from[i])),t=clamp(walk.time/Math.max(.08,distance/1.45),0,1);
    walk.position=destination.map((v,i)=>walk.from[i]+(v-walk.from[i])*t);
    if(t===1){walk.index++;if(walk.index===walk.points.length)walk.done=true;else{walk.from=[...walk.position];walk.fromHeading=walk.heading;walk.phase='turn';walk.time=0;}}
  }
  return walk;
}
