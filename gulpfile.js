'use strict';

var gulp = require('gulp');

var babelify = require('babelify');
var browserify = require('browserify');

var source = require('vinyl-source-stream');

var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');

var connect = require('gulp-connect')

gulp.task('transform', function () {
    console.log(process.env.NODE_ENV);
    let isDevelopment = process.env.NODE_ENV === 'development',
        browserifyOpts = {
            debug: isDevelopment,
            standalone: 'QB'
    };

    return browserify('./src/qbMain.js', browserifyOpts)
        .transform(babelify, { presets: ['es2015'] })
        .bundle()
        .pipe(source('quickblox.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('uglify', function () {
    gulp.src('./quickblox.js')
        .pipe(uglify())
        .pipe(gulp.dest('./'));
});