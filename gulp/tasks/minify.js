var gulp = require('gulp'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify');

gulp.task('minify', function() {
  gulp.src([
    './src/js/*.js'
    ])
  .pipe(gulp.dest('./dist/'))
  .pipe(uglify())
  .pipe(rename(function (path) {
    path.basename += ".min";
    return path;
	}))
  .pipe(gulp.dest('./dist/'));
});
