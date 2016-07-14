var mongoose = require('mongoose');

var PuzzleSchema = new mongoose.Schema({
    
    _id: {
        type: String,
        unique: true
    },
    difficulty: String, // 0
    question: String, // a combination of emojis
    answer: String, // []
    hint: String, // []
    guesses: Array
    
});

mongoose.model('Puzzle', PuzzleSchema);
