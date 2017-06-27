var gulp         = require('gulp');
var gulpSequence = require('gulp-sequence');
var config       = require('../config');

// retrieve serverType from command line args
var serverType = ['dev','qa','prod'].indexOf(process.argv[2]) !== -1 ? process.argv[2] : process.env.NODE_ENV;

gulp.task('build:production', (cb) =>{
	console.log ( "build production!" , serverType );
    gulpSequence('clean', 'webpack:production', cb);
});
