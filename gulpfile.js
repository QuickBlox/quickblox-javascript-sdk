'use strict';

var gulp = require('gulp');

var browserify = require('browserify');
var source = require('vinyl-source-stream');

var connect = require('gulp-connect');
var notify = require('gulp-notify');

var uglify = require('gulp-uglify');
var pump = require('pump');

var fs = require('fs');
var builder = require('jquery-custom');

gulp.task('build', function () {
    var isDevelopment = process.env.NODE_ENV === 'develop',
        browserifyOpts = {
            debug: isDevelopment,
            standalone: 'QB'
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
    pump([
        gulp.src('./quickblox.min.js'),
        uglify(),
        notify('Minify task is finished.'),
        gulp.dest('./')
    ]);
});

gulp.task('connect', function() {
    connect.server({
        port: 3000,
        https: true
    });
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

gulp.task('jquery', function () {
    return builder({
        flags: [
            '-deprecated',
            '-dimensions',
            '-effects',
            '-event',
            '-event/alias',
            '-event/focusin',
            '-event/trigger',
            '-offset',
            '-wrap',
            '-core/ready',
            '-exports/global',
            '-sizzle'
        ],
    }, function (err, compiledContent) {
        if (err){
            notify('Can\'t build jquery lib.');
            return console.error(err);
        }

        fs.writeFile('./src/plugins/jquery.ajax.js', compiledContent, function (err) {
            if (err){
                notify('Can\'t build jquery lib.');
                return console.error(err);
            }
            notify('Jquery task is finished.');
        })
    })
});

gulp.task('watch', function () {
    gulp.watch(['./src/**/*.js'], ['build']);
});

gulp.task('default', ['build', 'connect', 'watch']);
