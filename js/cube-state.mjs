// Clockwise is viewed from outside the face, following standard cube notation.
export const CUBE_FACES=Object.freeze({
  U:{axis:1,layer:1,name:'Top',color:'#f5f0db'},
  R:{axis:0,layer:1,name:'Right',color:'#df493e'},
  F:{axis:2,layer:1,name:'Front',color:'#35a478'},
  D:{axis:1,layer:-1,name:'Bottom',color:'#edc849'},
  L:{axis:0,layer:-1,name:'Left',color:'#ec8b3e'},
  B:{axis:2,layer:-1,name:'Back',color:'#477fcc'}
});
export const FACE_KEYS=Object.keys(CUBE_FACES);
export function solvedCube(){
  const pieces=[];
  for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
    if(x===0&&y===0&&z===0)continue;
    const position=[x,y,z],stickers=[];
    for(const [color,{axis,layer}]of Object.entries(CUBE_FACES))if(position[axis]===layer){
      const normal=[0,0,0];normal[axis]=layer;stickers.push({color,normal});
    }
    pieces.push({id:position.join(','),position,stickers});
  }
  return pieces;
}
export function faceFromNormal(normal){
  return FACE_KEYS.find(face=>{const {axis,layer}=CUBE_FACES[face];return normal[axis]===layer;});
}
function quarterTurn([x,y,z],axis,sign){
  const next=axis===0?[x,-sign*z,sign*y]:axis===1?[sign*z,y,-sign*x]:[-sign*y,sign*x,z];
  return next.map(n=>n===0?0:n); // Keep integer coordinates, including canonical zero.
}
export function turnCube(state,face,amount=1){
  const definition=CUBE_FACES[face];
  if(!definition||![1,-1,2].includes(amount))throw new RangeError('Invalid cube turn');
  const {axis,layer}=definition,sign=-layer*Math.sign(amount);
  const rotate=vector=>{let result=vector;for(let i=0;i<Math.abs(amount);i++)result=quarterTurn(result,axis,sign);return result;};
  return state.map(piece=>piece.position[axis]!==layer?piece:{...piece,position:rotate(piece.position),stickers:piece.stickers.map(sticker=>({...sticker,normal:rotate(sticker.normal)}))});
}
export function cubeSolved(state){
  return state.length===26&&state.every(piece=>piece.stickers.every(sticker=>faceFromNormal(sticker.normal)===sticker.color));
}
export function invertMove({face,amount}){return {face,amount:amount===2?2:-amount};}
export function moveLabel({face,amount}){return face+(amount===-1?'′':amount===2?'2':'');}
// Each face is read from outside: left to right, top to bottom.
export function faceGrid(state,face){
  const [right,up]={U:[[1,0,0],[0,0,-1]],D:[[1,0,0],[0,0,1]],R:[[0,0,-1],[0,1,0]],L:[[0,0,1],[0,1,0]],F:[[1,0,0],[0,1,0]],B:[[-1,0,0],[0,1,0]]}[face];
  const dot=(a,b)=>a.reduce((sum,n,i)=>sum+n*b[i],0),grid=Array(9);
  for(const piece of state)for(const sticker of piece.stickers)if(faceFromNormal(sticker.normal)===face){
    grid[(1-dot(piece.position,up))*3+dot(piece.position,right)+1]=sticker.color;
  }
  return grid;
}
export function makeScramble(random=Math.random,length=24){
  const moves=[];let previousAxis=-1;
  for(let i=0;i<length;i++){
    const choices=FACE_KEYS.filter(face=>CUBE_FACES[face].axis!==previousAxis);
    const face=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];
    moves.push({face,amount:[1,-1,2][Math.min(2,Math.floor(random()*3))]});previousAxis=CUBE_FACES[face].axis;
  }
  return moves;
}
export function scrambleCube(random=Math.random){
  let state=makeScramble(random).reduce((cube,move)=>turnCube(cube,move.face,move.amount),solvedCube());
  if(cubeSolved(state))state=turnCube(state,'F');
  return state;
}
/** State survives closing the dialog. Viewing the cube never changes its stickers. */
export function createCubeSession(initialState=scrambleCube()){
  let state=initialState,history=[],started=false,elapsed=0;
  return {
    get state(){return state;},get history(){return [...history];},
    get solved(){return cubeSolved(state);},get started(){return started;},get elapsed(){return elapsed;},
    turn(face,amount=1){state=turnCube(state,face,amount);history.push({face,amount});started=true;return state;},
    undo(){
      if(!history.length)return false;
      const move=invertMove(history.pop());state=turnCube(state,move.face,move.amount);return move;
    },
    tick(seconds){if(started&&!cubeSolved(state))elapsed+=Math.max(0,seconds);},
    reset(practice=false){state=practice?solvedCube():scrambleCube();history=[];started=false;elapsed=0;return state;}
  };
}
