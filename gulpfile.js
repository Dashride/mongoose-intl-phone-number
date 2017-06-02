'use strict';

const fs = require('fs');
const gulp = require('gulp');
const gutil = require('gulp-util');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const jshint = require('gulp-jshint');
const jsdoc2md = require('gulp-jsdoc-to-markdown');
const concat = require('gulp-concat');
const isparta = require('isparta');

const paths = {
    js: ['./**/*.js', '!./**/*.spec.js', '!./coverage/**/*.js', '!./node_modules/**/*.js'],
    specs: ['./lib/*.spec.js'],
    coverage: ['./lib/*.js', '!./lib/*spec.js'],
    all: ['./**/*.js', '!./coverage/**/*.js', '!./node_modules/**/*.js']
};

gulp.task('watch', ['test'], function (done) {
    const glob = paths.es6.all;
    return gulp.watch(glob, ['test']);
});

gulp.task('lint', function() {
    return gulp.src(paths.all)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('coveralls', function(done) {
    return gulp.src(paths.coverage)
        .pipe(istanbul({
            instrumenter: isparta.Instrumenter,
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            return gulp.src(paths.specs)
                .pipe(mocha({
                    reporter: 'spec'
                }))
                .pipe(istanbul.writeReports({
                    reporters: ['lcovonly', 'text'],
                }));
        });
});

gulp.task('coverage', function(done) {
    return gulp.src(paths.coverage)
        .pipe(istanbul({
            instrumenter: isparta.Instrumenter,
            includeUntested: false
        }))
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            return gulp.src(paths.specs)
                .pipe(mocha({
                    reporter: 'spec'
                }))
                .pipe(istanbul.writeReports({
                    reporters: ['text', 'html'],
                }));
        });
});

gulp.task('test', [/*'lint'*/], function(done) {
    return gulp.src(paths.specs)
        .pipe(mocha({
            reporter: 'spec'
        }));
});

gulp.task('docs', function() {
    return gulp.src(paths.js)
        .pipe(concat('README.md'))
        .pipe(jsdoc2md({template: fs.readFileSync('./readme.hbs', 'utf8')}))
        .on('error', function(err) {
            gutil.log('jsdoc2md failed:', err.message);
        })
        .pipe(gulp.dest('.'));
});
