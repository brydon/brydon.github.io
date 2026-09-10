/** A saved choice is separate from whether a browser has unlocked its audio. */
export function createSoundPreference({read,write,prepare,resume,disable,hidden=()=>false,onChange=()=>{},onError=()=>{}}){
  let enabled=false;
  try{enabled=read()==='true';}catch{/* Storage may be unavailable. */}
  let revision=0,pending=null,active=false;
  onChange(enabled);

  function silence(){
    // Invoke synchronously: an Off click must suspend even during preparation.
    try{return Promise.resolve(disable()).catch(()=>{});}catch{return Promise.resolve();}
  }
  function start(explicit){
    if(!enabled||active)return Promise.resolve(active);
    if(pending)return pending;
    const attempt=revision;
    let ready,resumed;
    try{
      ready=prepare();
      // Deliberately before any await, while this pointer/key gesture is active.
      resumed=resume();
    }catch(error){resumed=Promise.reject(error);}
    const current=()=>attempt===revision&&enabled;
    const work=Promise.all([ready,resumed]).then(async([prepared])=>{
      if(!current())return false;
      await prepared.setEnabled(true);
      if(!current()){
        if(!enabled)await silence();
        return false;
      }
      if(hidden())await prepared.visibility(false);
      if(!current()){
        if(!enabled)await silence();
        return false;
      }
      active=true;
      return true;
    }).catch(async error=>{
      if(current()){
        // A rejected resume must not leave the audio engine enabled for a later
        // visibility change. Keep the user's choice, and retry on a gesture.
        active=false;
        await silence();
        if(current()&&explicit)onError(error);
      }
      return false;
    }).finally(()=>{if(pending===work)pending=null;});
    pending=work;
    return work;
  }
  return {
    get enabled(){return enabled;},
    gesture(){return start(false);},
    toggle(){
      enabled=!enabled;revision++;active=false;pending=null;
      try{write(String(enabled));}catch{/* The choice still works this visit. */}
      onChange(enabled);
      return enabled?start(true):silence();
    }
  };
}

export function isSoundRestoreGesture(event){
  if(!event.isTrusted||event.target?.closest?.('#sound-toggle'))return false;
  if(event.type==='pointerdown')return event.button===0;
  return event.type==='keydown'&&!event.repeat&&!['Shift','Control','Alt','Meta'].includes(event.key);
}
