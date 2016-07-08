var mongoose = require('mongoose');

var PuzzleSchema = new mongoose.Schema({
    
    _id: {
        type: String,
        unique: true
    },
    name: String, // the name of this puzzle
    pictogram: String, // a combination of emojis
    difficulty: String, // 0
    answer: String, // []
    hint: String // []
    
});

mongoose.model('Puzzle', PuzzleSchema);
