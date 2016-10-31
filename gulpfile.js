'use strict';

var gulp = require('gulp');

var babelify = require('babelify');
var browserify = require('browserify');

var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var connect = require('gulp-connect');

var notify = require("gulp-notify");

gulp.task('build', function () {
    var isDevelopment = process.env.NODE_ENV === 'develop',
        browserifyOpts = {
            debug: isDevelopment,
            standalone: 'QB'
    };

    return browserify('./src/qbMain.js', browserifyOpts)
        // .transform(babelify, { presets: ['es2015'] }) // We are added babel, but doesn't use it now
        .bundle()
        .on('error', function(error) {
            notify('Failed when create a bundle <%= error.message %>')
            this.emit('end');
        })
        .pipe(source('quickblox.js'))
        .pipe(uglify()).on('error', function(error){
            notify('Uglify Error <%= error.message %>');
            this.emit('end');
        })
        .pipe(rename('quickblox.min.js'))
        .pipe(notify('Build task is finished.'))
        .pipe(gulp.dest('./'));
});

gulp.task('connect', function() {
    connect.server({
        port: 8080,
        https: true
    });
});

gulp.task('watch', function () {
  gulp.watch(['./src/**/*.js'], ['build']);
});

gulp.task('default', ['build', 'connect', 'watch']);
