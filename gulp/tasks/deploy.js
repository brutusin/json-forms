var gulp = require('gulp');
var exec = require('child_process').execSync;

gulp.task('deploy', function () {
    var user = process.env["GIT_USER"];
    var pass = process.env["GIT_PASS"];
    if (!user || !pass) {
        throw "Environment variables GIT_USER, GIT_PASS missing!";
    }
    exec('rm -rf .publish');
    exec('mkdir .publish');
    exec('cp -R .git .publish/.git');
    exec('git remote set-url origin https://' + user + ':' + pass + '@github.com/brutusin/json-forms.git', {"cwd": ".publish", stdio: 'ignore'});
    exec('git checkout gh-pages', {"cwd": ".publish", stdio: 'ignore'});
    exec('rm -rf .publish/dist');
    exec('cp -R dist .publish');
    exec('git add dist', {"cwd": ".publish"});
    try {
        exec('git commit -m "commited via gulp/tasks/deploy.js"', {"cwd": ".publish", stdio: 'ignore'});
    } catch (ex) {
        console.warn("git commit returned " + ex.status);
        return;
    }
    exec('git push --force"', {"cwd": ".publish", stdio: 'ignore'});
});