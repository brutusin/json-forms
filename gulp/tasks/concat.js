var gulp = require("gulp");
var concat = require('gulp-concat');
var wrap = require("gulp-wrap");

gulp.task('concat', ['clean:dist'], function () {

    return gulp.src(
            ['./src/js/main/pollyfills.js',
                './src/js/main/header.js',
                './src/js/main/*.js',
                './src/js/main/components/prototype.js',
                './src/js/main/components/*.js',
                './src/js/addon/i18n/brutusin-json-forms-lan-en_GB.js',
                
            ])
            .pipe(concat('brutusin-json-forms.js'))
            .pipe(wrap('(function(){\n"use strict";\n<%= contents %>\n})();'))
            .pipe(gulp.dest('./dist/js'));
});

