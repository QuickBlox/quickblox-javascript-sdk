import chai from 'chai';

import Client from './Client.js';

let expect = chai.expect;

describe('Client', () => {
  describe('create invalid instance', () => {
    it('WITHOUT params', () => {
      expect(() => { new Client(); }).to.throw(Error);
    });

    it('withot reqired parameter `appId`', () => {
      let invalidParams = {
        testId: 1,
        testAuth: 'alksdaasp3sd'
      };

      expect(() => { new Client(invalidParams); }).to.throw(Error);
    });
  });

  describe('instance with ready access only', () => {
    let client;

    let appId = 5;

    it('create instanse with app credentials', () => {
      let appCreds = {
        appId: 29650,
        authKey: 'WULOyezrmxpOgQ-',
        authSecret: 'TqQmBFbANJ6cfu4'
      };

      client = new Client(appCreds);
      
      expect(client._appId).to.equal(appCreds.appId);
    });


  });
    
    // let client;

    // it('with appId parameter only', () => {
    //   const appId = 8;

    //   client = new Client({ 'appId': appId });

    //   expect(client._appId).to.equal(appId);
    // });
});
