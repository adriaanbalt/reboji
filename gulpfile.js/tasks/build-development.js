var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

gulp.task('build:development', (cb) =>
	gulpSequence('clean', ['compass', 'html', 'mongo'], ['webpack:development', 'watch'], () => {console.log('Running!'); cb();}));
