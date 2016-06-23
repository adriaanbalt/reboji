var mongoose = require('mongoose');

var EmojiSchema = new mongoose.Schema({
    
    _id: {
        type: String,
        unique: true
    },
    name: String, // the name of this puzzle
    pictogram: String, // a combination of emojis
    difficulty: Number, // 0
    answer: Array // []
    
});

mongoose.model('Emoji', EmojiSchema);
