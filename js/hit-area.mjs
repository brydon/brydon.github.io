/** Screen bounds of a projected 3D volume; independent of which face is visible. */
export function projectedVolumeBounds(points,{padding=8,minSize=44}={}){
  if(!points.length||points.some(p=>!p.visible||!Number.isFinite(p.x)||!Number.isFinite(p.y)))return null;
  const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x));
  const top=Math.min(...points.map(p=>p.y)),bottom=Math.max(...points.map(p=>p.y));
  const width=Math.max(minSize,right-left+padding*2),height=Math.max(minSize,bottom-top+padding*2);
  return {left:(left+right-width)/2,top:(top+bottom-height)/2,width,height};
}
