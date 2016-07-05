var mongoose = require('mongoose');

var EmojiSchema = new mongoose.Schema({
    
    _id: {
        type: String,
        unique: true
    },
    name: String,
    icon: String,
    words: Array
    
});

mongoose.model('Emoji', EmojiSchema);
