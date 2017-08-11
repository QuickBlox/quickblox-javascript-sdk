import {expect} from 'chai';
import EventEmitter from './EventEmitter.js';

describe('EventEmitter', function() {
  it('should work', function() {
    const ee = new EventEmitter();
    const eventAttrs = {
      'task': 'make test'
    };

    function handleTestEvent(params) {
      expect(eventAttrs).to.deep.equal(params);
    }

    ee.addListener('test', handleTestEvent);
    
    ee.emit('test', eventAttrs);
  });
});
