/**
 * @access private
 * 
 * @example
 * Object.assign(Client.prototype, eventEmitterMixin);
 * 
 * let client = new Client();
 * 
 * function handleCustomEvent(data) {
 *  console.log(Incoming data, data);
 * }
 * 
 * client.addListener('customEvent', handleCustomEvent);
 * 
 * client.emit('customEvent', {
 *  'cutom': 'field'
 * });
 * // emit return this for create a chain
 * client.emit('event1', {'some': 'data'}).emit('event2', {'some': 'data'});
 */
let eventEmitterMixin = {
  /**
   * Set up a listener for specific event.
   * 
   * @param {string} eventName The name of event what will be listened.
   * @param {Function} listener The callback that handles the emitted event.
   * @memberof EventEmitter
   */
  addListener(eventName, listener) {
    const self = this;

    if(!self._eventHandlers) {
      this._eventHandlers = {};
    }

    if(!self._eventHandlers[eventName]) {
      self._eventHandlers[eventName] = [];
    }

    self._eventHandlers[eventName].push(listener);
  },

  /**
   * Remove the lister for event
   * 
   * @param {string} The name of event what will be listened. 
   * @param {Function} listener The callback that handles the emitted event.
   */
  removeListener(eventName, listener) {
    let handlers = this._eventHandlers && this._eventHandlers[eventName];

    if (!handlers) return;

    for(let i = 0; i < handlers.length; i++) {
      if (handlers[i] == listener) {
        handlers.splice(i--, 1);
      }
    }
  },

  /**
   * Emit the specific event.
   * 
   * @param {string} eventName The name of event what will be emit.
   * @param {Object} data Data which will passed in handle function.
   * @memberof EventEmitter
   */
  emit(eventName, data) {
    const self = this;
    const eventListeners = self._eventHandlers[eventName];

    if(eventListeners) {
      eventListeners.forEach(listener => listener.call(self, data));
    }

    return this;
  }
};

export default eventEmitterMixin;
