'use strict';

/* global QB:true */

function Content(file) {
  return new Promise(function(resolve, reject) {
    var params = {
      file: file,
      name: file.name,
      type: file.type,
      size: file.size,
      public: false
    };
    
    QB.content.createAndUpload(params, function(err, response) {
        if (err) {
          reject(err);
        } else {
          resolve(response.uid);
        }
    });
  });
}

window.Content = Content;