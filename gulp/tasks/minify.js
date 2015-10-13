var gulp = require('gulp');
var rename = require('gulp-rename')
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rimraf = require('rimraf');

gulp.task('minify', function () {
    
    var jsDeletionCallBack = function () {
        console.log("Minifying './src/js/*.js'");
        gulp.src('./src/js/*.js')
                .pipe(gulp.dest('./dist/js'))
                .pipe(uglify())
                .pipe(rename(function (path) {
                    path.basename += ".min";
                    return path;
                }))
                .pipe(gulp.dest('./dist/js'));
     
    };
    var cssDeletionCallBack = function () {
        console.log("Minifying './src/css/*.css'");
        gulp.src('./src/css/*.css')
                .pipe(gulp.dest('./dist/css'))
                .pipe(minifyCss())
                .pipe(rename(function (path) {
                    path.basename += ".min";
                    return path;
                }))
                .pipe(gulp.dest('./dist/css'));
    };
    console.log("Deleting './dist/js'");
    rimraf('./dist/js', jsDeletionCallBack);
    console.log("Deleting './dist/css'");
    rimraf('./dist/css', cssDeletionCallBack);
    
});



