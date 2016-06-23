var gulp         = require('gulp');
var gulpSequence = require('gulp-sequence');
var config       = require('../config');

// pull in stop.js to stop currently running server of this type
var stopPrevious = require(config.root + '/server/stop');

// retrieve serverType from command line args
var serverType = ['dev','qa','prod'].indexOf(process.argv[2]) !== -1 ? process.argv[2] : process.env.NODE_ENV;

gulp.task('build:production', (cb) =>{
	console.log ( "build production!" , serverType );
    gulpSequence('clean', 'compass', 'mongo', 'webpack:production', 'html', cb);
});
