'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var minify = require('gulp-minify');


gulp.task('build', function () {
    return gulp.src('./src/js/**/*.js')
        .pipe(minify({
            ext:{
                src:'-debug.js',
                min:'.min.js'
            },
            ignoreFiles: ['min.js']
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('sass', function () {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./src/css'));
});

/* Watcher */
gulp.task('sass:watch', function () {
    gulp.watch('./src/sass/**/*.scss', ['sass']);
});

gulp.task('watch', function () {
    gulp.watch('./src/js/**/*.js', ['build']);
});