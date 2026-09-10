import test from 'node:test';
import assert from 'node:assert/strict';
import {createCoffeeState,coffeeAction,advanceCoffee,coffeeProgress,fillProgress,coffeeClueRevealed,servingFraction,servingMotion,COFFEE_DURATION,brewWater} from '../js/coffee.mjs';

test('brewing requires both grounds and hot water, with a final manual pour',()=>{
  for(const pourObject of ['v60','gooseneck']){
    const state=createCoffeeState();
    for(const object of ['v60','kettle','gooseneck'])assert.equal(coffeeAction(state,object),false);
    assert.equal(coffeeAction(state,'grinder'),true);assert.equal(coffeeAction(state,'grinder'),false);
    advanceCoffee(state,COFFEE_DURATION.grinding);assert.equal(state.phase,'ground');
    assert.equal(coffeeAction(state,'v60'),true);advanceCoffee(state,COFFEE_DURATION.loading);
    assert.equal(coffeeAction(state,'kettle',{offHeat:false}),false);assert.equal(coffeeAction(state,'v60'),false);
    assert.equal(coffeeAction(state,'kettle',{offHeat:true}),true);assert.equal(coffeeAction(state,'gooseneck'),false);
    advanceCoffee(state,COFFEE_DURATION.filling);assert.equal(state.phase,'hot');
    assert.equal(coffeeAction(state,pourObject),true);advanceCoffee(state,COFFEE_DURATION.pouring);
    assert.equal(state.phase,'brewed');assert.equal(coffeeAction(state,'grinder'),false);
    assert.equal(coffeeAction(state,'kettle',{offHeat:true}),false);
  }
});
test('either kettle can fill before, during or after coffee preparation without losing progress',()=>{
  for(const object of ['kettle','gooseneck'])for(const preparation of ['idle','grinding','ground','loading','ready']){
    const state=createCoffeeState();
    if(preparation!=='idle')coffeeAction(state,'grinder');
    if(['ground','loading','ready'].includes(preparation))advanceCoffee(state,COFFEE_DURATION.grinding);
    if(['loading','ready'].includes(preparation))coffeeAction(state,'v60');
    if(preparation==='ready')advanceCoffee(state,COFFEE_DURATION.loading);
    if(['grinding','loading'].includes(preparation))advanceCoffee(state,.25);
    const phase=state.phase,elapsed=state.elapsed;
    assert.equal(coffeeAction(state,object,{offHeat:false}),false);
    assert.equal(coffeeAction(state,object,{offHeat:true}),true);
    assert.equal(state.phase,phase);assert.equal(state.elapsed,elapsed);assert.equal(state.water,'filling');
    assert.equal(coffeeAction(state,object,{offHeat:true}),false,'no duplicate filling');
    advanceCoffee(state,COFFEE_DURATION.filling);assert.equal(state.water,'hot');
    if(state.phase==='idle'){coffeeAction(state,'grinder');advanceCoffee(state,COFFEE_DURATION.grinding);}
    if(state.phase==='ground'){coffeeAction(state,'v60');advanceCoffee(state,COFFEE_DURATION.loading);}
    assert.equal(state.phase,'hot');assert.equal(coffeeAction(state,'v60'),true);
    advanceCoffee(state,COFFEE_DURATION.pouring);assert.equal(state.phase,'brewed');
  }
});
test('water and grinding have independent clocks; filling pauses and cancels safely',()=>{
  const state=createCoffeeState();coffeeAction(state,'gooseneck',{offHeat:true});advanceCoffee(state,1);
  coffeeAction(state,'grinder');advanceCoffee(state,1);
  assert.equal(state.elapsed,1);assert.equal(state.waterElapsed,2);
  const before=fillProgress(state);advanceCoffee(state,60,{visible:false});assert.equal(fillProgress(state),before);
  advanceCoffee(state,NaN);assert.equal(fillProgress(state),before);
  advanceCoffee(state,2.2);assert.equal(state.phase,'ground');assert.equal(state.water,'filling');
  advanceCoffee(state,.3);assert.equal(state.water,'hot');assert.equal(state.phase,'ground');
  const filling=createCoffeeState();coffeeAction(filling,'kettle',{offHeat:true});
  advanceCoffee(filling,60,{burning:true});assert.equal(filling.phase,'broken');assert.equal(fillProgress(filling),0);
});
test('the mug clue requires a completed brew and a separate completed serving',()=>{
  const state=createCoffeeState();
  for(const [object,duration] of [['grinder','grinding'],['v60','loading'],['kettle','filling'],['gooseneck','pouring']]){
    assert.equal(coffeeAction(state,'mug'),false);assert.equal(coffeeClueRevealed(state),false);
    assert.equal(coffeeAction(state,object,{offHeat:true}),true);
    assert.equal(coffeeAction(state,'mug'),false);
    advanceCoffee(state,COFFEE_DURATION[duration]);
  }
  assert.equal(state.phase,'brewed');assert.equal(coffeeClueRevealed(state),false);
  assert.equal(coffeeAction(state,'mug'),true);
  for(const object of ['mug','grinder','v60','gooseneck','kettle'])assert.equal(coffeeAction(state,object,{offHeat:true}),false);
  advanceCoffee(state,COFFEE_DURATION.serving*.8);assert.equal(coffeeClueRevealed(state),false);
  const progress=coffeeProgress(state);advanceCoffee(state,60,{visible:false});assert.equal(coffeeProgress(state),progress);
  advanceCoffee(state,COFFEE_DURATION.serving*.2);assert.equal(coffeeClueRevealed(state),true);
  advanceCoffee(state,60);assert.equal(coffeeClueRevealed(state),true);assert.equal(coffeeAction(state,'mug'),false);
});
test('either brewing target then either serving target completes the same coffee sequence',()=>{
  for(const waterFirst of [false,true])for(const brewingTarget of ['gooseneck','v60'])for(const servingTarget of ['mug','v60']){
    const state=createCoffeeState();
    const fill=()=>{assert.equal(coffeeAction(state,'gooseneck',{offHeat:true}),true);advanceCoffee(state,COFFEE_DURATION.filling);};
    const prepareGrounds=()=>{
      assert.equal(coffeeAction(state,'grinder'),true);advanceCoffee(state,COFFEE_DURATION.grinding);
      assert.equal(coffeeAction(state,'v60'),true);advanceCoffee(state,COFFEE_DURATION.loading);
    };
    if(waterFirst){fill();prepareGrounds();}else{prepareGrounds();fill();}
    assert.equal(state.phase,'hot');assert.equal(state.water,'hot');
    assert.equal(coffeeAction(state,brewingTarget),true);assert.equal(state.phase,'pouring');
    for(const object of ['mug','v60','gooseneck'])assert.equal(coffeeAction(state,object),false,'busy equipment cannot start another pour');
    advanceCoffee(state,COFFEE_DURATION.pouring);assert.equal(state.phase,'brewed');
    assert.equal(coffeeAction(state,'gooseneck'),false,'the empty gooseneck does not serve brewed coffee');
    assert.equal(coffeeAction(state,servingTarget),true);assert.equal(state.phase,'serving');
    assert.equal(coffeeClueRevealed(state),false);
    for(const object of ['mug','v60'])assert.equal(coffeeAction(state,object),false,'serving cannot be restarted mid-animation');
    advanceCoffee(state,COFFEE_DURATION.serving);assert.equal(state.phase,'served');assert.equal(coffeeClueRevealed(state),true);
    for(const object of ['mug','v60'])assert.equal(coffeeAction(state,object),false,'the completed mug cannot be overfilled');
  }
});
test('serving conserves the coffee and a fire cannot finish revealing the mug',()=>{
  for(const phase of ['serving','served']){
    const state={phase,elapsed:COFFEE_DURATION.serving*.8};advanceCoffee(state,60,{burning:true});
    assert.equal(state.phase,'broken');assert.equal(coffeeClueRevealed(state),false);assert.equal(coffeeAction(state,'mug'),false);
  }
  assert.equal(servingFraction(.4),0);assert.equal(servingFraction(.75),1);
  for(let i=0;i<=100;i++){const fill=servingFraction(i/100),cup=fill*240,server=300-cup;assert.ok(cup>=0&&cup<=240);assert.ok(server>=60);assert.equal(cup+server,300);}
});
test('the dripper returns only after the server is back on its scale',()=>{
  assert.deepEqual(servingMotion(0),{filter:0,server:0,tilt:0});
  assert.deepEqual(servingMotion(1),{filter:0,server:0,tilt:0});
  for(let i=1;i<1000;i++){
    const p=i/1000,motion=servingMotion(p);
    for(const value of Object.values(motion))assert.ok(value>=0&&value<=1);
    if(motion.server>0)assert.equal(motion.filter,1,'the filter must stay out of the server’s path');
    if(p>.91&&p<1){assert.equal(motion.server,0);assert.ok(motion.filter>0&&motion.filter<1);}
  }
});
test('coffee pauses in the background and a burning cabin cancels the sequence',()=>{
  const state=createCoffeeState();coffeeAction(state,'grinder');advanceCoffee(state,1);
  const before=coffeeProgress(state);advanceCoffee(state,60,{visible:false});assert.equal(coffeeProgress(state),before);
  advanceCoffee(state,NaN);assert.equal(coffeeProgress(state),before);
  advanceCoffee(state,0,{burning:true});assert.equal(state.phase,'broken');assert.equal(coffeeAction(state,'grinder'),false);
});
test('the bloom rests at 60 grams before the main pour reaches 300 grams',()=>{
  assert.equal(brewWater(0),0);assert.equal(brewWater(.4),60);assert.equal(brewWater(1),300);
  let previous=0;for(let i=0;i<=100;i++){const water=brewWater(i/100);assert.ok(water>=previous&&water<=300);previous=water;}
});
