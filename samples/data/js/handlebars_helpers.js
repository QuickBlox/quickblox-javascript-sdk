'use strict';

/* global Handlebars:true */

Handlebars.registerHelper('getPreviewUrl', function(media) {
  return QB.content.privateUrl(media[0]);
});

Handlebars.registerHelper('getImageUrl', function(uid) {
  return QB.content.privateUrl(uid);
});
