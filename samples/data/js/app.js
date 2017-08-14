'use strict';

/* eslint no-alert: "off" */
/* eslint no-console: "off" */
/* global QB_CREDS:true, QB_CONFIG:true, User:true, Places:true, Checkin:true, WMap:true, Handlebars:true, Content:true, Siema:true */

function App() {
    this.ui = {
        'map': 'j-map',
        'panel': 'j-panel',
        'header': 'j-header',
        'overlay': 'j-overlay'
    };

    // root el
    this.$app = document.getElementById('j-app');

    this.map;

    this.user = new User();
    this.places = new Places();
    this.checkin = Checkin;

    /* Write to root element a class name of page by set activePage */
    this._PAGES = ['dashboard', 'new_place', 'place_detailed', 'checkin'];

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
        // sync user and places from server
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
    var self = this;

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

        renderPhotos: for (var i = 0; i < this.files.length; i++) {
            if (i === 5) {
                console.warn('Max limit of upload files is 20');
                break renderPhotos;
            }

            var file = this.files[i];

            var imgWrap = document.createElement('div');

            imgWrap.classList.add('form__img_preview');

            var img = document.createElement('img');

            img.classList.add('form__img');
            img.file = file;

            mediaWrap.appendChild(imgWrap);
            imgWrap.appendChild(img);

            var reader = new FileReader();

            reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
            reader.readAsDataURL(file);
        }
    });

    document.getElementById(ui.createPlaceForm).addEventListener('submit', function(e) {
        e.preventDefault();

        var ltln = JSON.parse(document.getElementById('latlng').value),
            title = document.getElementById('title').value,
            description = document.getElementById('description').value,
            rate = document.getElementById('rate').value;

        var dataInfo = {
            location:  [ltln.lng, ltln.lat],
            title: title.trim(),
            description: description.trim(),
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

        if (uploadImageInp.files.length) {
            uploadProcess: for (var i = 0; i < uploadImageInp.files.length; i++) {
                if (i === 20) break uploadProcess;

                var file = uploadImageInp.files[i];

                listPromises.push(new Content(file));
            }

            Promise.all(listPromises).then(function(uids) {
                dataInfo.media = uids;
                _createPlace(dataInfo);
            });
        } else {
            _createPlace(dataInfo);
        }

        e.target.reset();
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
            uploadLimit = 20 - photosCount,
            listPromises = [];

        uploadProcess: for (var i = 0; i < addNewMediaInp.files.length; i++) {
            if (i === uploadLimit) {
                console.warn('Max limit of upload files is 20 (' + uploadLimit + ' were uploaded)');
                break uploadProcess;
            }

            var file = addNewMediaInp.files[i];

            listPromises.push(new Content(file));
        }

        Promise.all(listPromises).then(function(uids) {
            self.places.update({
                _id: placeId,
                add_to_set: {
                    media: uids
                }
            }).then(function(res) {
                self.places.updateLocal(res);

                self.renderPlaceDetailed(placeId);
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
    
    var place = self.places.getPlace(placeId);

    document.getElementById('checkin-submit').addEventListener('submit', function(e) {
        e.preventDefault();

        var comment = document.getElementById('checkin_comment').value,
            rate = +(document.getElementById('checkin_rate').value);

        var checkinData = {
            '_parent_id': document.getElementById('checkin_id').value,
            'comment': comment.trim(),
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
                self.places.updateLocal(res);
                self.activePage = {
                    pageName: 'place_detailed',
                    detailed: res._id
                };
            });
        }).catch(function(err) {
            console.error(err);
        });

        document.getElementById('checkin-cancel').click();
        e.target.reset();
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
