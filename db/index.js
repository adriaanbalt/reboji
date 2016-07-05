var mongoose    = require('mongoose'),
    Promise    = require('bluebird');

module.exports = (URI) => {

    console.log ( "   DB URI >", URI );

    // DB connection, use prod db if running prod
    var db = mongoose.connect(URI).connection;

    //initialize models
    require('./models/puzzle');
    require('./models/emoji');

    return new Promise((resolve, reject) => {
      db.on('connected', () => console.log('MongoDB connected!'));
      db.on('open', resolve); //happens after models are loaded
      db.on('error', reject);
    });
};
