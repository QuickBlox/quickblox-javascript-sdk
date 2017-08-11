/**
 * @access private
 * 
 * @example
 * let myClass = new EventEmitter();
 */
class EventEmitter {
    constructor() {
        this._events = {};
    }

    addListener(eventName, listener) {
        const self = this;

        if(!self._events[eventName]) {
            self._events[eventName] = [];
        }

        self._events[eventName].push(listener);

        return self;
    }

    emit(eventName, args) {
        const self = this;

        const eventListeners = self._events[eventName];

        if(eventListeners) {
            eventListeners.forEach( listener => listener.call(self, args));
        }

        return this;
    }
}

export default EventEmitter;
