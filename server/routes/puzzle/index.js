const mongoose = require('mongoose');
const Puzzle = mongoose.model('Puzzle');
const Promise = require('bluebird');

// promisifies methods on "Puzzle" and "Puzzle" instances
Promise.promisifyAll(Puzzle);
Promise.promisifyAll(Puzzle.prototype);

module.exports = (router) => {

	router.get('/puzzle', function(req, res, next) {
		console.log ( "route api/puzzle");
		Puzzle.findOneAsync({}, null, {})
			.then(allPuzzles => res.json(allPuzzles))
			.catch(err => !console.log(err) && next(err));
	});

	router.post('/puzzle', function(req, res, next) {
		var newObj = new Puzzle(req.body);
	    newObj.saveAsync()
	      .then( savedObj  => res.json(savedObj) );
	});


};