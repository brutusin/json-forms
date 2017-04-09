var gulp = require("gulp");
var del = require('del');

gulp.task('clean:dist', function () {
  return del([
    'dist/**/*',
  ]);
});