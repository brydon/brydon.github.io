import test from 'node:test';
import assert from 'node:assert/strict';
import {createCoffeeState,coffeeAction,advanceCoffee,coffeeProgress,COFFEE_DURATION,brewWater} from '../js/coffee.mjs';

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
