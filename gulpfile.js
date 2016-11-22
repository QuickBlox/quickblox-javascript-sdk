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
            notify('Failed when create a bundle <%= error.message %>')
            this.emit('end');
        })
        .pipe(source('quickblox.min.js'))
        .pipe(notify('Build task is finished.'))
        .pipe(gulp.dest('./'));
});

gulp.task('compress', function () {
    pump([
            gulp.src('./quickblox.min.js'),
            uglify(),
            gulp.dest('./')
        ]
    );
});

gulp.task('connect', function() {
    connect.server({
        port: 8080,
        https: true
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
        if (err) return console.error(err);
        fs.writeFile('./src/plugins/jquery.ajax.js', compiledContent, function (err) {
            if (err) return console.error(err);
        })
    })
});

gulp.task('watch', function () {
  gulp.watch(['./src/**/*.js'], ['build']);
});

gulp.task('default', ['build', 'connect', 'watch']);
