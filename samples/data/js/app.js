'use strict';

/**
 * DATA SAMPLE
 * Using User Authorization,
 * Custom Objects
 * 
 * Browser supports:
 * IE 11, Edge 12, Safari 8,
 * last 2 version of modern browsers
 */

/* eslint no-alert: "off" */
/* eslint no-console: "off" */
/*  global QB_CREDS:true, QB_CONFIG:true,
    Handlebars:true, Siema:true, WMap:true,
    User:true, Places:true, Checkin:true, qbContent:true */

function App() {
  this.ui = {
    'map': 'j-map',
    'panel': 'j-panel',
    'header': 'j-header',
    'overlay': 'j-overlay'
  };

  /** This is root element of app */
  this.$app = document.getElementById('j-app');

  this.map;

  this.user = new User();
  this.places = new Places();
  this.checkin = Checkin;

  /* A list of possible name of pages */
  this._PAGES = ['dashboard', 'new_place', 'place_detailed', 'checkin'];

  this._activePageName = '';
    
  /**
   * Write to root element a class name of a page
   * by set activePage property 
   */
  Object.defineProperty(this, 'activePage', {
    set: function(params) {
      var self = this;

      // Set a class (pageName) to root el of app
      // Remove all previously options
      self._PAGES.forEach(function(pName) {
          self.$app.classList.remove(pName);
      });

      // set a name of current page
      self.$app.classList.add(params.pageName);

      // render the page
      self.renderPage(params.pageName, params.detailed);

      this._activePageName = params.pageName;
    },
    get: function() {
      return this._activePageName;
    }
  });

  this._init();
}

App.prototype._init = function() {
    var self = this;

    // init the SDK, be careful the SDK must init one time
    QB.init(QB_CREDS.appId, QB_CREDS.authKey, QB_CREDS.authSecret, QB_CONFIG);
    // create a session
    QB.createSession(function() {
        // fetch user and places from server
        Promise.all([self.user.auth(), self.places.sync()]).then(function() {
            // render skeleton of app
            self.$app.innerHTML = self.renderView('app-tpl', {
                version: QB.version + ':' + QB.buildNumber
            });

            // render the map and set listener
            self.map = new WMap({
                'el': document.getElementById(self.ui.map),
                'draftNewPlace': function() {
                    self.activePage = { pageName: 'new_place' };
                }
            });

            self.map.getAndSetUserLocation();

            self.activePage = { pageName: 'dashboard' };
        }).catch(function(err) {
            console.error(err);
            alert('Something goes wrong, checkout late.');
        });
    });
};

App.prototype.renderPage = function(pageName, detailed) {
    var self = this;

    switch(pageName) {
        case 'dashboard':
            self.renderDashboard();
            break;
        case 'new_place':
            self.renderCreatePlace();
            break;
        case 'place_detailed':
            self.renderPlaceDetailed(detailed);
            break;
        case 'checkin':
            self.renderCheckin(detailed);
            break;
    }
};

App.prototype.renderView = function(idTpl, options) {
    var source = document.getElementById(idTpl).innerHTML;
    var tpl = Handlebars.compile(source);

    return tpl(options);
};

App.prototype.renderDashboard = function() {
    var self = this;

    // render header and set listener
    var $header = document.getElementById(self.ui.header);

    $header.innerHTML = self.renderView('header-tpl', self.user);
    self._setListenersHeader();

    // render list of places and set listeners
    var $panel = document.getElementById(self.ui.panel);
    $panel.innerHTML = self.renderView('places_preview-tpl', {'items': self.places.items});
    self._setListenersPlacesPreview();

    self._resetAllMarkersPlaces();
};

App.prototype._setListenersHeader = function() {
    var self = this;

    // remove a user and reload a page
    document.getElementById('j-logout').addEventListener('click', function() {
        self.user.logout();
        document.location.reload(true);
    });
};

App.prototype._setListenersPlacesPreview = function() {
    var self = this;

    var $places = document.querySelectorAll('.j-place'),
        placesAmount = $places.length;

    function showPlace(e) {
        var $item = e.target.closest('.j-place');

        self.activePage = {
            pageName: 'place_detailed',
            detailed: $item.dataset.id
        };
    }

    if (placesAmount) {
        for (var i = 0, l = (placesAmount - 1); i <= l; i++) {
            $places[i].addEventListener('click', showPlace);
        }
    }
};

App.prototype._setListenersMarkersPlacesPreview = function(markers) {
    var self = this;

    function showPlace() {
        self._resetAllMarkersPlaces();

        self.activePage = {
            pageName: 'place_detailed',
            detailed: this._id
        };
    }

    for (var i in markers) {
        var marker = markers[i];

        marker.addListener('click', showPlace);

        marker.addListener('mouseover', function() {
            self.map.setMarkerStyle(this._id, 'mouseover');
        });

        marker.addListener('mouseout', function() {
            self.map.setMarkerStyle(this._id, 'mouseout');
        });
    }
};

App.prototype._resetAllMarkersPlaces = function() {
    this.map.removeAllPlaces();
    this.map.activePlace = null;
    this.map.setPlaces(this.places.items);

    this._setListenersMarkersPlacesPreview(this.map.places);
};

App.prototype.renderCreatePlace = function() {
    var self = this;

    var $header = document.getElementById(self.ui.header);
    // Remove innerHTML of header
    while ($header.hasChildNodes()) {
        $header.removeChild($header.lastChild);
    }

    var latLng = self.map.getPositionSketchedPlace();

    var $panel = document.getElementById(self.ui.panel);
    $panel.innerHTML = self.renderView('new_place-tpl', {'latLng': JSON.stringify(latLng)});
    self._setListenersPlacesNew();
};

App.prototype._setListenersPlacesNew = function() {
    var self = this,
        filesBuffer = [];

    var ui = {
        backBtn: 'j-to_dashboard',
        createPlaceForm: 'j-create',
        uploadImage: 'j-media'
    };

    document.getElementById(ui.backBtn).addEventListener('click', function(e) {
        e.preventDefault();

        self.map.removeSketchedPlace();

        self.activePage = {
            pageName: 'dashboard'
        };
    });

    var uploadImageInp = document.querySelector('.' + ui.uploadImage);
    var mediaWrap = document.getElementById('media_wrap');

    uploadImageInp.addEventListener('change', function(e) {
        e.preventDefault();

        var images = document.querySelectorAll('.form__img_preview');

        if (images.length) {
            images.forEach(function(image) {
                image.remove();
            });
        }

        var listPromises = [];

        for (var i = 0; i < this.files.length; i++) {
            filesBuffer = [];
            listPromises.push(qbContent.validateImage(this.files[i]));
        }

        var limit = 20,
            warnMessage;

        Promise.all(listPromises).then(function(files) {
            renderImages: for (var i = 0; i < files.length; i++) {
                var file = files[i];

                if (!file) {
                    warnMessage = 'Some files will not be uploaded (incorrect image type)';
                    console.warn(warnMessage);

                    continue renderImages;
                } else {
                    limit--;
                }

                if (limit < 0) {
                    var warnInfo = 'Max limit of upload images is 20, some images will not be uploaded';

                    console.warn(warnInfo);
                    alert(warnInfo);

                    break renderImages;
                }

                var imgWrap = document.createElement('div'),
                    img = document.createElement('img'),
                    reader = new FileReader();

                filesBuffer.push(file);

                img.file = file;
                img.classList.add('form__img');
                imgWrap.classList.add('form__img_preview');
                mediaWrap.appendChild(imgWrap);
                imgWrap.appendChild(img);
                reader.readAsDataURL(file);

                reader.onload = (function(aImg) {
                    return function(e) {
                        aImg.src = e.target.result;
                    };
                })(img);
            }

            if (warnMessage) {
                alert(warnMessage);
            }
        });
    });

    var placeForm = document.getElementById(ui.createPlaceForm);

    // this fix deletes empty symbols from start and end of form's values (https://quickblox.atlassian.net/browse/QBWEBSDK-559)
    placeForm.addEventListener('change', function() {
        var title = document.getElementById('title').value.trim(),
            description = document.getElementById('description').value.trim();

        document.getElementById('title').value = title;
        document.getElementById('description').value = description;
    });

    placeForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var target = e.target,
            ltln = JSON.parse(document.getElementById('latlng').value),
            title = document.getElementById('title').value,
            description = document.getElementById('description').value,
            rate = document.getElementById('rate').value;

        var dataInfo = {
            location:  [ltln.lng, ltln.lat],
            title: title,
            description: description,
            rate: +rate,
        };

        var listPromises = [];

        function _createPlace(data) {
            self.places.create(dataInfo)
                .then(function(res) {
                    self.map.setPlaces(res);
                    self.map.removeSketchedPlace();

                    self.activePage = {
                        pageName: 'place_detailed',
                        detailed: res._id
                    };
                }).catch(function(err) {
                // User is unauthorized
                if (err.code === 401) {
                    document.location.reload(true);
                }
            });
        }

        if (filesBuffer.length) {
            filesBuffer.forEach(function(file) {
                listPromises.push(qbContent.upload(file));
            });

            Promise.all(listPromises).then(function(uids) {
                dataInfo.media = uids;
                _createPlace(dataInfo);
            }).catch(function(error) {
                alert(JSON.stringify(error));
                self.renderCreatePlace();
            });
        } else {
            _createPlace(dataInfo);
        }

        // clear form
        if($overlay) {
            $overlay.innerHTML = '';
        }

        return false;
    });
};

App.prototype.renderPlaceDetailed = function(placeId) {
    var self = this;

    var placeInfo = self.places.getPlace(placeId),
        mediaCount = placeInfo.media && placeInfo.media.length || [];

    var $header = document.getElementById(self.ui.header);
    // Remove innerHTML of header
    while ($header.hasChildNodes()) {
        $header.removeChild($header.lastChild);
    }

    placeInfo = Object.assign(placeInfo, {
        'isCanUploadMedia': (mediaCount < 20)
    });

    var $panel = document.getElementById(self.ui.panel);
    $panel.innerHTML = self.renderView('place_detailed-tpl', placeInfo);

    if (placeInfo.media !== null && mediaCount) {
        App.initCarousel();
    }

    self.map.activePlace = placeId;

    this.checkin.get({
        '_parent_id': placeId,
        'sort_desc': 'created_at' // the newest check-ins will be at the top
    }).then(function(checkins) {
        var $panel = document.getElementById('j-checkins');
        $panel.innerHTML = self.renderView('checkins-tpl', {'items': checkins});

        self.places.setAmountExistedCheckins(placeId, checkins.length);
    });

    document.getElementById('j-to_dashboard').addEventListener('click', function(e) {
        e.preventDefault();

        self.activePage = {
            pageName: 'dashboard'
        };
    });

    document.getElementById('j-checkin').addEventListener('click', function(e) {
        e.preventDefault();

        self.activePage = {
            pageName: 'checkin',
            detailed: placeId
        };
    });

    var addNewMediaInp = document.querySelector('.j-add_media');

    addNewMediaInp.addEventListener('change', function(e) {
        e.preventDefault();
        
        var photosCount = document.querySelectorAll('.j-photo').length,
            limit = APP_CONFIG.maxMediaItemsCount - photosCount,
            validationPromises = [],
            listPromises = [],
            warnMessage;

        for (var i = 0; i < this.files.length; i++) {
            validationPromises.push(qbContent.validateImage(this.files[i]));
        }
        
        Promise.all(validationPromises).then(function(files) {
            collectPromises: for (var i = 0; i < files.length; i++) {
                var file = files[i];

                if (!file) {
                    warnMessage = 'Some files will not be uploaded (incorrect image type)';
                    console.warn(warnMessage);

                    continue collectPromises;
                } else {
                    limit--;
                }

                if (limit < 0) {
                    var warnInfo = 'Max limit of upload images is 20, some images will not be uploaded';

                    console.warn(warnInfo);
                    alert(warnInfo);

                    break collectPromises;
                }

                listPromises.push(qbContent.upload(file));
            }

            if (warnMessage) {
                alert(warnMessage);
            }

            Promise.all(listPromises).then(function(uids) {
                self.places.update({
                    _id: placeId,
                    add_to_set: {
                        media: uids
                    }
                }).then(function(res) {
                    self.places.updateLocal(res);

                    if(self.activePage === 'place_detailed') {
                        self.renderPlaceDetailed(placeId);
                    }
                });
            });
        });
    });
};

App.prototype.renderCheckin = function(placeId) {
    var self = this;

    var $overlay = document.getElementById(self.ui.overlay);

    $overlay.innerHTML = self.renderView('checkin-tpl', {
        id: placeId
    });
    
    var place = self.places.getPlace(placeId),
        checkinForm = document.getElementById('checkin-submit');

    // this fix deletes empty symbols from start and end of form's values
    checkinForm.addEventListener('change', function() {
        var comment = document.getElementById('checkin_comment').value.trim();

        document.getElementById('checkin_comment').value = comment;
    });

    checkinForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var target = e.target,
            comment = document.getElementById('checkin_comment').value,
            rate = +(document.getElementById('checkin_rate').value);

        var checkinData = {
            '_parent_id': document.getElementById('checkin_id').value,
            'comment': comment,
            'rate': rate,
            'author_id': self.user.id,
            'author_fullname': self.user.full_name
        };

        // Check-Ins amount equal to 2 Because 1 is author, 2 is current user
        var newRate = ((place.rate * (place.checkinsAmount + 1)) + rate) / (place.checkinsAmount + 2);

        self.checkin.create(checkinData).then(function(checkin) {
            self.places.update({
                _id: placeId,
                rate: newRate.toFixed(2)
            }).then(function(res) {
                console.log('RESR', res);
                self.places.updateLocal(res);
                console.log('ALL', self.places);
                self.activePage = {
                    pageName: 'place_detailed',
                    detailed: res._id
                };

                // clear form
                var $overlay = document.getElementById('j-overlay');
                $overlay.innerHTML = '';
            });
        }).catch(function(err) {
            console.error(err);
        });

        return false;
    });

    document.getElementById('checkin-cancel').addEventListener('click', function(e) {
        e.preventDefault();

        self.activePage = {
            pageName: 'place_detailed',
            detailed: placeId
        };
    });
};

// static method for init carousel
App.initCarousel = function() {
    var mySiema = new Siema({
        perPage: 3
    });

    document.querySelector('.j-prev').addEventListener('click', function() {
        mySiema.prev(1);
    });

    document.querySelector('.j-next').addEventListener('click', function() {
        mySiema.next(1);
    });
};

// this rule only for this line
/* eslint no-unused-vars:0 */
var app = new App();
