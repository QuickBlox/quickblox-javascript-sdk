var QB = require('./src/qbMain.js');
var fs = require('fs');

QB.init(56915, 'ZyhrvPeKSNyWsBw', 'FrQyTSNwhprcbRf');

QB.createSession({
    login: "testtestest",
    password: "testtestest"
}, function(err, res) {
    if (err) {
        console.log(err);
        return false;
    }

    console.log(res);

    fs.stat('spec/logo.png', function (error, stats) {
        fs.readFile('spec/logo.png', function (e, data) {
            if (e) {
                console.log(e);
                return false;
            }

            QB.content.createAndUpload({
                name: 'logo.png',
                file: data,
                type: "image/png",
                size: data.length,
                public: false
            }, function(err, res) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(res);
                }
            });
        });
    });
});
