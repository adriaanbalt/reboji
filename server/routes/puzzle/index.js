const mongoose = require('mongoose');
const Puzzle = mongoose.model('Puzzle');
const Promise = require('bluebird');

// promisifies methods on "Puzzle" and "Puzzle" instances
Promise.promisifyAll(Puzzle);
Promise.promisifyAll(Puzzle.prototype);

module.exports = (router) => {

	// Get initial app data
	router.get('/puzzle', function(req, res, next) {
		console.log ( "route api/puzzle");
		Puzzle.findOneAsync({}, null, {})
			.then(allPuzzles => res.json(allPuzzles))
			.catch(err => !console.log(err) && next(err));
	});


};