var gulp = require("gulp");
var concat = require('gulp-concat');
var wrap = require("gulp-wrap");

gulp.task('concat', ['clean:dist'], function () {

    return gulp.src(
            ['./src/js/main/*.js',
                './src/js/main/schemas/*.js',
                './src/js/main/schemas/rendering/**/*.js',
                './src/js/main/schemas/version/**/*.js'
                        //'./src/js/addon/i18n/brutusin-json-forms-lan-en_GB.js',

            ])
            .pipe(concat('brutusin-json-forms.js'))
            .pipe(wrap('if (typeof brutusin === "undefined") {window.brutusin = new Object();} else if (typeof brutusin !== "object") {throw ("brutusin global variable already exists");}\n' +
                    '(function(){\n"use strict";\n'+
                    'var schemas = {};\n' +
                    '<%= contents %>\n' +
                    'brutusin.schemas = schemas;\n})();'))
            .pipe(gulp.dest('./dist/js'));
});

