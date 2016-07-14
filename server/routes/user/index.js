var mongoose = require('mongoose');
var User = mongoose.model('User');
var Promise = require('bluebird');

// promisifies methods on "User" and "User" instances
Promise.promisifyAll(User);
Promise.promisifyAll(User.prototype);

module.exports = (router) => {

	router.get('/user', function(req, res, next) {
		console.log ( "route get api/user");
		User.findAsync({ facebookID : req.body.fbID }, null, {})
			.then(allUsers => res.json(allUsers))
			.catch(err => !console.log(err) && next(err));
	});

	router.post('/user', function(req, res, next) {
		console.log ( "route POST api/user", req.body, newObj);
		var newObj = new User(req.body);
	    newObj.saveAsync()
	      .then( savedObj  => res.json(savedObj) );
	});

	router.put('/user', function(req, res, next) {
		console.log ( "route PUT api/user", req.params.id, req.body);
		User.findByIdAndUpdateAsync(req.params.id, req.body, {new:true}) // new option here says return the updated object to the following promise
	      .then(updated => res.status(200).json(updated))
	      .catch(err => !console.log(err) && next(err));
	});

};