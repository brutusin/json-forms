var fs = require('fs');
var tasks = fs.readdirSync('./gulp/tasks');
var gulp = require('gulp');

tasks.forEach(function (task) {
    require('./tasks/' + task);
});
