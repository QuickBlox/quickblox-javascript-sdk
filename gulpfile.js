'use strict';

var gulp = require('gulp');

var browserify = require('browserify');
var source = require('vinyl-source-stream');

var webserver = require('gulp-webserver');
var notify = require('gulp-notify');

var uglify = require('gulp-uglify');
var pump = require('pump');

gulp.task('build', function () {
    var isDevelopment = process.env.NODE_ENV === 'develop',
        browserifyOpts = {
            debug: isDevelopment,
            standalone: 'QB',
            ignoreMissing: true
        };

    return browserify('./src/qbMain.js', browserifyOpts)
        .bundle()
        .on('error', function(error) {
            throw new Error(error);
            notify('Failed when create a bundle.');
            this.emit('end');
        })
        .pipe(source('quickblox.min.js'))
        .pipe(gulp.dest('./'))
        .pipe(notify('Build task is finished.'));
});

gulp.task('minify', function () {
    return gulp.src(['./quickblox.min.js'])
        .pipe(uglify())
        .on('error', function (err) { console.log('ERROR', err) })
        .pipe(gulp.dest('./'));
});

gulp.task('connect', function() {
    gulp.src('./')
    .pipe(webserver({
        host: 'localhost',
        https: true,
        directoryListing: true,
        open: true
    }));
});

gulp.task('generate-build_version', function() {
    var fs = require('fs');
    const configPath = './src/qbConfig.js';

    function incBuildNumber(foundedString, p1, buildNumber, p2) {
        var oldBuildNumber = +buildNumber;

        return p1 + (oldBuildNumber + 1) + p2;
    }

    fs.readFile(configPath, 'utf8', function (error, config) {
        if (error) {
            throw new Error(error);
        }
        var result = config.replace(/(buildNumber:\s\')(\d{4})(')/g, incBuildNumber);

        fs.writeFile(configPath, result, 'utf8', function (error) {
            if (error) {
                throw new Error(error);
            }
        });
    });
});

gulp.task('watch', function () {
    gulp.watch(['./src/**/*.js'], ['build']);
});

gulp.task('default', ['build', 'connect', 'watch']);
