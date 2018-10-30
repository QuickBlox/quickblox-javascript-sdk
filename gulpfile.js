'use strict';

var gulp = require('gulp');

var browserify = require('browserify');
var source = require('vinyl-source-stream');

var notify = require('gulp-notify');
var uglify = require('gulp-uglify');

gulp.task('build', function() {
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

gulp.task('minify', function() {
    return gulp.src(['./quickblox.min.js'])
        .pipe(uglify())
        .on('error', function (err) { console.log('ERROR', err) })
        .pipe(gulp.dest('./'));
});

gulp.task('generate-build_version', function(done) {
    var fs = require('fs');
    var configPath = './src/qbConfig.js';

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

            done();
        });
    });
});

gulp.task('watch', function() {
    gulp.watch(['./src/**/*.js'], gulp.series('build'));
});

gulp.task('default', gulp.series('build', 'watch'));
