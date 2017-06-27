var gulp = require('gulp');
var del = require('del');
var config = require('../config');
var htmlConfig = require('../config/html');

gulp.task('clean', (cb) => del([
    config.publicAssets,
  ], {
    force: true
  }, cb));
