var gulp     = require('gulp');
var html     = require('../config/html');
var iconFont = require('../config/iconFont');
var images   = require('../config/images');
var compass     = require('../config/compass');
var fonts    = require('../config/fonts');
var server    = require('../config/server');
var scripts  = require('../config/scripts');
var data  = require('../config/data');
var watch    = require('gulp-watch');

gulp.task('watch', () => {
  watch(compass.src, () => gulp.start('compass'));
  watch(html.watch, () => gulp.start('html'));
  //@TODO figure out dev server restarts
  //watch(server.watch, function() { gulp.start('webpack:development'); });
});
