import * as THREE from './vendor/three.module.min.js';
import {CUBE_FACES} from './cube-state.mjs';

/** Animate a legal turn, then snap every piece back to exact integer coordinates. */
export function createCubeTurn(model,before,after,{face,amount}){
  const {axis,layer}=CUBE_FACES[face],pivot=new THREE.Group();
  model.group.add(pivot);
  for(const piece of before)if(piece.position[axis]===layer)pivot.add(model.pieces.get(piece.id));
  let finished=false;
  return {
    sample(progress){if(!finished){pivot.rotation[['x','y','z'][axis]]=-layer*amount*Math.PI/2*Math.max(0,Math.min(1,progress));}},
    finish(){if(finished)return;finished=true;model.sync(after);model.group.remove(pivot);}
  };
}
