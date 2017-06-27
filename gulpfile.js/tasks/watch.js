var gulp     = require('gulp');
var html     = require('../config/html');
var compass     = require('../config/compass');
var server    = require('../config/server');
var watch    = require('gulp-watch');

gulp.task('watch', () => {
  watch(compass.src, () => gulp.start('compass'));
  watch(html.watch, () => gulp.start('html'));
  //@TODO figure out dev server restarts
  //watch(server.watch, function() { gulp.start('webpack:development'); });
});
