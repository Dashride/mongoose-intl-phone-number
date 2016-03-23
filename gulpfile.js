'use strict';

require('babel-core/register');

var fs = require('fs'),
    gulp = require('gulp'),
    gutil = require("gulp-util"),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    jshint = require('gulp-jshint'),
    jsdoc2md = require('gulp-jsdoc-to-markdown'),
    concat = require("gulp-concat"),
    babel = require('gulp-babel'),
    isparta = require('isparta');

var paths = {
    es6: {
        js: ['./src-es6/**/*.js', '!./**/*.spec.js'],
        specs: ['./src-es6/**/*.spec.js'],
        all: ['./src-es6/**/*.js', '!./coverage/**/*.js', '!./node_modules/**/*.js']
    },
    js: ['./**/*.js', '!./**/*.spec.js', '!./coverage/**/*.js', '!./node_modules/**/*.js'],
    specs: ['./**/*.spec.js'],
    all: ['./**/*.js', '!./coverage/**/*.js', '!./node_modules/**/*.js']
};

gulp.task('watch', ['test'], function (done) {
    var glob = paths.es6.all;
    return gulp.watch(glob, ['test']);
});

gulp.task('6to5', function () {
    return gulp.src(paths.es6.js)
        .pipe(babel())
        .pipe(gulp.dest('lib'));
});

gulp.task('lint', function() {
    return gulp.src(paths.all)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('coveralls', function(done) {
    return gulp.src(paths.es6.js)
        .pipe(istanbul({
            instrumenter: isparta.Instrumenter,
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            return gulp.src(paths.es6.specs)
                .pipe(mocha({
                    reporter: 'spec'
                }))
                .pipe(istanbul.writeReports({
                    reporters: [ 'lcovonly', 'text' ],
                }));
        });
});

gulp.task('coverage', function(done) {
    return gulp.src(paths.es6.js)
        .pipe(istanbul({
            instrumenter: isparta.Instrumenter,
            includeUntested: false
        }))
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            return gulp.src(paths.es6.specs)
                .pipe(mocha({
                    reporter: 'spec'
                }))
                .pipe(istanbul.writeReports({
                    reporters: [ 'text', 'html' ],
                }));
        });
});

gulp.task('test', [/*'lint'*/], function(done) {
    return gulp.src(paths.es6.specs)
        .pipe(mocha({
            reporter: 'spec'
        }));
});

gulp.task('docs', function() {
    return gulp.src(paths.es6.js)
        .pipe(concat('README.md'))
        .pipe(jsdoc2md({template: fs.readFileSync('./readme.hbs', 'utf8')}))
        .on('error', function(err){
            gutil.log('jsdoc2md failed:', err.message);
        })
        .pipe(gulp.dest('.'));
});
