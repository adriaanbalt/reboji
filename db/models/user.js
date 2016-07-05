var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    email: String,
    createdDate: {
        type: Date,
        default: new Date()
    },
    lastLoginDate: {
        type: Date,
        default: new Date()
    },
    lastUpdateDate: {
        type: Date,
        default: new Date()
    },
    highscore:{
      _id: String,
      score: Number
    },
    facebook: {
      _id: String,
      photo: String,
      link: String
    }
});

// set user schema on mongoose
mongoose.model('User', UserSchema);



