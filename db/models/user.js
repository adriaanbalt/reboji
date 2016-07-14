var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
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
    fbID: String,
    email: String,
    guesses: Array,
    puzzles: [
        { 
            type: String,
            ref: 'Puzzle' 
        }
    ],
    currentPuzzle: { 
        type: String,
        ref: 'Puzzle' 
    }
});

// set user schema on mongoose
mongoose.model('User', UserSchema);
