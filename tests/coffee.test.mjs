import test from 'node:test';
import assert from 'node:assert/strict';
import {createCoffeeState,coffeeAction,advanceCoffee,coffeeProgress,coffeeClueRevealed,servingFraction,COFFEE_DURATION,brewWater} from '../js/coffee.mjs';

test('coffee requires grinding, dosing, boiled water off the heat, and a final pour',()=>{
  for(const pourObject of ['v60','gooseneck']){
    const state=createCoffeeState();
    for(const object of ['v60','kettle','gooseneck'])assert.equal(coffeeAction(state,object,{offHeat:true}),false);
    assert.equal(coffeeAction(state,'grinder'),true);assert.equal(coffeeAction(state,'grinder'),false);
    advanceCoffee(state,COFFEE_DURATION.grinding);assert.equal(state.phase,'ground');
    assert.equal(coffeeAction(state,'kettle',{offHeat:true}),false);
    assert.equal(coffeeAction(state,'v60'),true);advanceCoffee(state,COFFEE_DURATION.loading);
    assert.equal(coffeeAction(state,'kettle',{offHeat:false}),false);assert.equal(coffeeAction(state,'v60'),false);
    assert.equal(coffeeAction(state,'kettle',{offHeat:true}),true);assert.equal(coffeeAction(state,'gooseneck'),false);
    advanceCoffee(state,COFFEE_DURATION.filling);assert.equal(state.phase,'hot');
    assert.equal(coffeeAction(state,pourObject),true);advanceCoffee(state,COFFEE_DURATION.pouring);
    assert.equal(state.phase,'brewed');assert.equal(coffeeAction(state,'grinder'),false);
  }
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
test('serving conserves the coffee and a fire cannot finish revealing the mug',()=>{
  for(const phase of ['serving','served']){
    const state={phase,elapsed:COFFEE_DURATION.serving*.8};advanceCoffee(state,60,{burning:true});
    assert.equal(state.phase,'broken');assert.equal(coffeeClueRevealed(state),false);assert.equal(coffeeAction(state,'mug'),false);
  }
  assert.equal(servingFraction(.4),0);assert.equal(servingFraction(.75),1);
  for(let i=0;i<=100;i++){const fill=servingFraction(i/100),cup=fill*240,server=300-cup;assert.ok(cup>=0&&cup<=240);assert.ok(server>=60);assert.equal(cup+server,300);}
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
