'use strict';

var gulp = require('gulp');

var browserify = require('browserify');
var source = require('vinyl-source-stream');

var connect = require('gulp-connect');
var notify = require('gulp-notify');

gulp.task('build', function () {
    var isDevelopment = process.env.NODE_ENV === 'develop',
        browserifyOpts = {
            debug: isDevelopment,
            standalone: 'QB'
    };

    return browserify('./src/qbMain.js', browserifyOpts)
        .bundle()
        .on('error', function(error) {
            notify('Failed when create a bundle <%= error.message %>')
            this.emit('end');
        })
        .pipe(source('quickblox.min.js'))
        .pipe(notify('Build task is finished.'))
        .pipe(gulp.dest('./'));
});

gulp.task('connect', function() {
    connect.server({
        port: 8080,
        https: true
    });
});

gulp.task('generate-build_version', function() {
    var fs = require('fs');
    const configPath = './src/qbConfig.js';

    function incBuildVersion(buildVersion) {
        return --buildVersion;
    }

    fs.readFile(configPath, 'utf8', function (error, config) {
        if (error) {
            throw new Error(error);
        }
    
        var result = config.replace(/-\d{4}/g, incBuildVersion);

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
