var gulp = require('gulp');
var rename = require('gulp-rename')
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rimraf = require('rimraf');

gulp.task('minify', ['concat'], function () {

    console.log("Minifying './dist/js/*.js'");
    gulp.src(['./dist/js/*.js'])
            .pipe(uglify())
            .pipe(rename(function (path) {
                path.basename += ".min";
                return path;
            }))
            .pipe(gulp.dest('./dist/js'));

    gulp.src(['./src/js/addon/**/*.js'])
            .pipe(gulp.dest('./dist/js/addon'))
            .pipe(uglify())
            .pipe(rename(function (path) {
                path.basename += ".min";
                return path;
            }))
            .pipe(gulp.dest('./dist/js/addon'));

    console.log("Minifying './src/css/*.css'");
    gulp.src('./src/css/*.css')
            .pipe(gulp.dest('./dist/css'))
            .pipe(minifyCss())
            .pipe(rename(function (path) {
                path.basename += ".min";
                return path;
            }))
            .pipe(gulp.dest('./dist/css'));

});



