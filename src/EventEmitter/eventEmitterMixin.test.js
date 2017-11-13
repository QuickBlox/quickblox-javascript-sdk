import {expect} from 'chai';
import eventEmitterMixin from './eventEmitterMixin.js';

describe('EventEmitter', function() {
  // Uses as example for extends
  class testClass {}

  function eventHandler(data) {}

  let eventName = 'customEvent';

  let instance;
  
  it('Assign methods from mixin to another object', () => {
    Object.assign(testClass.prototype, eventEmitterMixin);

    expect(testClass.prototype).respondTo('emit');
    expect(testClass.prototype).respondTo('addListener');
    expect(testClass.prototype).respondTo('removeListener');
  });

  it('set a listener', () => {
    instance = new testClass();
    instance.addListener(eventName, eventHandler);

    // check out that _eventHandlers[eventName] is an array
    expect(instance._eventHandlers[eventName]).to.have.length(1);
    // check out that _eventHandlers[eventName][0] is a function
    expect(instance._eventHandlers[eventName][0]).to.be.a('function');
    // check out that instance will respond to a method `addListener`
    expect(instance).to.respondTo('addListener');
  });

  it('remove a listener', () => {
    instance.removeListener(eventName, eventHandler);

    // check out that _eventHandlers[eventName] is an array with 0 items
    expect(instance._eventHandlers[eventName]).to.have.length(0);
  });

  it('emit an event', () => {
    let eventName = 'test';
    let data = {
      custom: 'data'
    };

    function handler(incomingData) {
      expect(incomingData).to.be.equal(data);
    }

    instance.addListener(eventName, handler);
    instance.emit(data);
  });
});
