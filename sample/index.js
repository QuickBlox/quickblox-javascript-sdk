const QB = require('./../quickblox.min.js');

const client = new QB({'appId': 1});

client.addListener('error', (e) => {
    console.log('ERRR', e);
});

client.auth();
