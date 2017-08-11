/**
 * Disabled eslint rule no-console for this file
 */

/* eslint no-console:0 */

const logger = {
  loggerName: 'Quickblox JS SDK',
  log(txt) {
    console.log(txt);
  },
  warm(txt) {
    console.warm(txt);
  }
};

export default logger;
