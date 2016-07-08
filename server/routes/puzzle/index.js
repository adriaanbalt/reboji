var mongoose = require('mongoose');
var Puzzle = mongoose.model('Puzzle');
var Promise = require('bluebird');

// promisifies methods on "Puzzle" and "Puzzle" instances
Promise.promisifyAll(Puzzle);
Promise.promisifyAll(Puzzle.prototype);

module.exports = (router) => {

	router.get('/puzzle', function(req, res, next) {
		console.log ( "route get api/puzzle");
		Puzzle.findOneAsync({}, null, {})
			.then(allPuzzles => res.json(allPuzzles))
			.catch(err => !console.log(err) && next(err));
	});

	router.post('/puzzle', function(req, res, next) {
		console.log ( "route POST api/puzzle", req.body, newObj);
		var newObj = new Puzzle(req.body);
	    newObj.saveAsync()
	      .then( savedObj  => res.json(savedObj) );
	});

};