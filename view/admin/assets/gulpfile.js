"use strict";

var gulp = require('gulp'),
  gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  concat = require('gulp-concat'),
  cssmin = require('gulp-minify-css'),
  sourcemaps = require('gulp-sourcemaps'),
  livereload = require('gulp-livereload');

gulp.task('html', function() {
  gulp.src('../*.html')
  .pipe(livereload());
});

gulp.task('css', function() {
  gulp.src('src/scss/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass())
  .pipe(sourcemaps.write())
  .pipe(gutil.env.type === 'production' ? cssmin() : gutil.noop())
  .pipe(gulp.dest('dist/css/'))
  .pipe(livereload());
});

gulp.task('js', function() {
  return gulp.src('src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    //only uglify if gulp is ran with '--type production'
    .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'))
    .pipe(livereload());
});

gulp.task('vendor-js', function() {
  return gulp.src([
    'src/vendor/js/codemirror.js',
    'src/vendor/js/*.js'
  ])
  .pipe(concat('vendor.js'))
  .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
  .pipe(gulp.dest('dist/js/'))
});

gulp.task('vendor-css', function() {
  return gulp.src('src/vendor/css/*.css')
  .pipe(concat('vendor.css'))
  .pipe(gutil.env.type === 'production' ? cssmin() : gutil.noop())
  .pipe(gulp.dest('dist/css/'))
});

gulp.task('copy-fonts', function() {
  return gulp.src('src/fonts/**/*').pipe(gulp.dest('dist/fonts/'));
});

gulp.task('copy-img', function() {
  return gulp.src('src/img/**/*.png').pipe(gulp.dest('dist/img/'));
});

//Watch task
gulp.task('default',function() {
  livereload.listen();
  gulp.watch('src/scss/**/*.scss',['css']);
  gulp.watch('src/js/**/*.js',['js']);
  gulp.watch('src/vendor/css/*.css',['vendor-css']);
  gulp.watch('src/vendor/js/*.js',['vendor-js']);
  gulp.watch('src/fonts/**/*',['copy-fonts']);
  gulp.watch('src/img/**/*.png',['copy-img']);
  gulp.watch('../*.html',['html']);
});
