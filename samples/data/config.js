'use strict';

var QB_CREDS = {
  appId: 53851,
  authKey: 'XeTM6Acx9Jsyb4D',
  authSecret: 'SA-h4W-sZgzhO-u'
};

var QB_CONFIG = {
  debug: {
    mode: 1 // the SDK will be printing logs to console.log
  },
  on: {
    sessionExpired: function() {
      alert('Session is expired, the page will be reload.');
      window.location.reload();
    }
  }
};

var APP_CONFIG = {
  maxMediaItemsCount: 20 
}

window.QB_CREDS = QB_CREDS;
window.QB_CONFIG = QB_CONFIG;
window.APP_CONFIG = APP_CONFIG;
