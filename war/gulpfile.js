var gulp = require('gulp');
var less = require('gulp-less-sourcemap');
var path = require('path');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var cssFolder = './src/main/webapp/css';
var jsFolder = './src/main/webapp/scripts';

gulp.task('default', ['css', 'javascript']);

gulp.task('css', function() {
  gulp.src(cssFolder + '/jenkins/jenkins.less')
    .pipe(less({
      generateSourceMap: true,
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest(cssFolder));
});

gulp.task('javascript', function() {
  browserify(jsFolder + '/test1/jenkins.js')
    .bundle()
    .pipe(source('jenkins-bundled.js'))
    .pipe(gulp.dest(jsFolder));
});

gulp.task('watch', function() {
  gulp.watch(cssFolder + '/**/*.less', ['css']);
  gulp.watch(jsFolder + '/test1/**/*.js', ['javascript']);
});
