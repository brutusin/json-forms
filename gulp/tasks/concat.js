var gulp = require("gulp");
var gulpMerge = require('gulp-merge');
var concat = require('gulp-concat');
var wrap = require("gulp-wrap");
 
gulp.task('concat', function() {
    
  var wrap = gulp.src(['./src/js/main/main.js'])
    .pipe(wrap('(function(){\n"use strict";\n<%= contents %>\n})();'))
    .pipe(gulp.dest("./dist"));
    
  return gulp.src(['./src/js/main/header.js', './src/js/main/pollyfills.js', ])
    .pipe(concat('all.js'))
    .pipe(wrap('(function(){\n"use strict";\n<%= contents %>\n})();'))
    .pipe(gulp.dest('./dist/'));
});
gulp.src(['./src/js/main/main.js', './src/js/main/input/*.js'])
    .pipe(wrap('(function(){\n"use strict";\n<%= contents %>\n})();'))
    .pipe(gulp.dest("./dist"));
    
    
    var gulpMerge = require('gulp-merge');

gulp.task('build', function() {
    return gulpMerge(
        gulp.src(['./src/js/main/main.js','./src/js/main/input/*.js'])
            .pipe(concat('concat1.js')),

        gulp.src('src/**/*.js')
    )
    .pipe(uglify())
    .pipe(gulp.dest('build/'));
});