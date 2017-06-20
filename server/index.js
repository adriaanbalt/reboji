'use strict'

require( '../db' )('mongodb://heroku_jk541zkr:rrbc4u94f4kcegae7evbicj8t2@ds023074.mlab.com:23074/heroku_jk541zkr');

const   express = require('express'),
        path = require('path'),
        cookieParser = require('cookie-parser'),
        bodyParser = require('body-parser'),
        request = require('request'),
        app = express(),
        mongoose = require('mongoose'),
        Puzzle = mongoose.model('Puzzle'),
        User = mongoose.model('User'),
        Promise = require('bluebird');


// promisifies methods on "Puzzle" and "Puzzle" instances
Promise.promisifyAll(Puzzle);
Promise.promisifyAll(Puzzle.prototype);
Promise.promisifyAll(User);
Promise.promisifyAll(User.prototype);

let puzzles = [];
let seenPuzzles = [];
let successfulPuzzles = [];
let failedPuzzles = [];
let currentPuzzle;
let currentIndex;
const token = "EAAF0MuSayRkBAMi8pb5w6X2qf3rsk1wF8UCD8Nhpho0yiBknETthNd2b8o4eM0bUXZBiar1jfSlfeBJneMfSoiFjZA77gMdroLnnai7ClsjU4ZBdpFz69ZAnX2Jx1uy1WzZAc7mJbCntbQkErviZCd2obVJ7MDMfQZD"

Puzzle.findAsync({}, null, {})
    .then(allPuzzles => {
        puzzles = allPuzzles;
        return allPuzzles;
    })
    .catch(err => !console.log(err) && next(err));

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())
// Set static folder
app.use(express.static(path.join(__dirname, '../public')));
// allows cookie parsing (cookies are simple key value stores in the browser)
app.use(cookieParser()); 

// Index route - Serve index.html from root
app.get('/', (req, res, next) => res.sendFile('/index.html', {
  root: path.join(__dirname, '../public')
}));

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'obi_wan_dies') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// var newObj = new User(
//     {
//         fbID: "1064814340266637",
//         email: "adriaan@liquidium.com",
//         guesses: [ "hi", "test" ],
//         puzzles: ["1468083290053", "1468083397541"],
//         currentPuzzle: ["5432"]
//     }
// );

// newObj.saveAsync()
//   .then( savedObj  => {
//     console.log ( 'response from user save:', savedObj);
// });

// User.findAsync({ fbID:"1064814340266637" })
//     .then( userObj => {
//         console.log ( 'userObj!!!', userObj);
//         return User.populate(userObj, {path:"currentPuzzle"})
//     })
//     .then( populatedObj => {
//         console.log ( "populatedObj!!", populatedObj );
//     })
//     .catch((err) => console.log(err));

// User.findOne({ fbID:"1064814340266637" })
//     .populate('currentPuzzle') // only return the Persons name
//     .exec(function (err, story) {
//      if (err) return handleError(err);
//      console.log('The creator is %s', story.currentPuzzle);
//     })

// webhook sender { sender: { id: '1064814340266637' },
//   recipient: { id: '207689382963492' },
//   timestamp: 0,
//   delivery:
//    { mids: [ 'mid.1468522377278:e70784c99fb6337e66' ],
//      watermark: 1468522377355,
//      seq: 3120 } } 1064814340266637

// handling messages
app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id

        // User.findAsync({}, null, {})
        //     .then(allUsers => {
        //         console.log( 'ALLUSERS:', allUsers );
        //     })
        //     .catch(err => !console.log(err) && next(err));

        if (event.message && event.message.text) {
            let text = "" + event.message.text.toLowerCase();

            // TODO connect to DB 
            if ( !currentPuzzle ) {
                currentPuzzle = getPuzzle();
                sendTextMessage(sender, '-' );
                sendTextMessage(sender, "Here is your first puzzle of " + puzzles.length + " puzzles." );
                sendTextMessage(sender, currentPuzzle.pictogram );
            } else if ( text == "new" ) {
                currentPuzzle = getPuzzle();
                sendTextMessage(sender, '-' );
                sendTextMessage(sender, "Here is a new puzzle" );
                sendTextMessage(sender, currentPuzzle.pictogram );
            } else if ( text == "hint" ) {
                if ( currentPuzzle.hint ) {
                    sendTextMessage(sender, "Here's this puzzle's hint: " + currentPuzzle.hint );    
                } else {
                    sendTextMessage(sender, "Sorry, this puzzle does not have a hint." );
                }
            } else if ( checkPuzzleAnswer( text ) ) {
                removePuzzle( currentIndex );
                correctPuzzle( currentPuzzle );
                currentPuzzle = getPuzzle();
                sendTextMessage(sender, '-' );
                sendTextMessage(sender, "Congratulations! You have " + puzzles.length + " puzzles left to complete. Here's a new puzzle");
                sendTextMessage(sender, currentPuzzle.pictogram );
                setTimeout( ()=>sendTextMessage(sender, successfulPuzzles.length + " of " + puzzles.length ), 1000 )
            } else if ( !checkPuzzleAnswer( text ) ) {
                sendTextMessage(sender, '-' );
                sendTextMessage(sender, "Sorry that was incorrect. You have " + puzzles.length + " puzzles left to complete. Try again or respond 'new' for a different puzzle or respond 'hint' for this puzzle's hint. Reminder of your current puzzle" );
                sendTextMessage(sender, currentPuzzle.pictogram );
            }
            // compare text to current puzzle question answer
            // if ( checkPuzzleValidity( text ) ){
            //     sendSuccess();
            // } else if ( text != "new" ) {
            //     sendNewPuzzle();
            // } else {
            //     sendFailure();
            // }
            // check the message that the user sent against the current emoji puzzle
            // sendTextMessage(sender, "👕 👘 👗 👢 👠 👡 💼 👜 👔 🎩 👒 👑 💍 ⛵ ⛽ ✈ ⛲ ⛺ ⛪ ☎ ✉ ✂ 🚽 🛀 👙 💄 ✌ ☀ ☁ ☔ ⚡ ✨ ⭐ ✳ ⛄ ☕ ♨ 🎀 🌂 💧 🔨 💺 〽 🔱 🔰 🀄 💎 💠 🔷 🔶 ✌ ☀ ☁ ☔ ⚡ ✨ ⭐ ✳ ⛄ ☕ ♨ 🏢 🏫 🏭 🏥 🏬 🏪 💒 : you said : " + text.substring(0, 200))
        }
    }
    res.sendStatus(200)
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
});

// api routes
// app.use('/api', require('./routes'));
app.use('/api', require( path.join(__dirname, 'routes') ));

function correctPuzzle( puzzle ) {
    successfulPuzzles.push( puzzle )
}
function removePuzzle( index ) {
    puzzles.splice(index, 1)
}
function getPuzzle() {
    // let returnPuzzle;
    // Puzzle.findOneAsync({}, null, {})
    //         .then(puzzle => {
    //             returnPuzzle = puzzle;
    //         })
    //         .catch(err => !console.log(err) && next(err));

    // return returnPuzzle;
    currentIndex = getRandom(0, puzzles.length );
    let newPuzz = puzzles[ currentIndex ];// == currentPuzzle ? getPuzzle() : puzzles[ getRandom(0, puzzles.length ) ];
    return newPuzz;
}

function getRandom( min, max ){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkPuzzleAnswer( text ) {
    return ( currentPuzzle.answer.toLowerCase() == text.toLowerCase() );
    // for ( var i=0; i<currentPuzzle.answer.length; i++ ){
    //     if ( currentPuzzle.answer[i] == text ) {
    //         return true;
    //     }
    // }
    // return false;
}

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token:token
        },
        method: 'POST',
        json: {
            recipient: {
                id:sender
            },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


// let puzzles = [

//     {
//         question: "☕",
//         answer: "coffee"
//     },
//     {
//         question: "👗",
//         answer: "dress"
//     },
//     {
//         question: "✨",
//         answer: "star"
//     },
//     {
//         question: "🐳🍆",
//         answer: "whale dick"
//     },
//     {
//         question: "👮✊💰💃👯💊💉😵🔫",
//         answer: "democracy"
//     },
//     {
//         question: "💍",
//         answer: "ring"
//     },
//     {
//         question: "👾",
//         answer: "octopus"
//     },
//     {
//         question: "⚽",
//         answer: "soccer"
//     },
//     {
//         question: "👌",
//         answer: "ok"
//     },
//     {
//         question: "👊",
//         answer: "fist"
//     },
//     {
//         question: "👏",
//         answer: "clap"
//     },
//     {
//         question: "👎",
//         answer: "boo"
//     },
//     {
//         question: "🐸",
//         answer: "frog"
//     },
//     {
//         question: "🏈",
//         answer: "football"
//     },
//     {
//         question: "🌹",
//         answer: "rose"
//     },
//     {
//         question: "🔪 🧀",
//         answer: "cut the cheese"
//     },
//     {
//         question: "👑 🐸",
//         answer: "cut the cheese"
//     },
//     {
//         question: "✈️ 🌙",
//         answer: "fly me to the moon"
//     }

// ]

/*

:)     :D     :(     :'(     :P     O:)     3:)     o.O     ;)     :O     -_-     >:O     :*

<3     ^_^     8-)     8|     (^^^)     :|]     >:(     :v     :/     :3     ☺     (y)     <(")

 ✌ ☀ ☁ ☔ ⚡ ✨ ⭐ ✳ ⛄ ☕ ♨
⛵ ⛽ ✈ ⛲ ⛺ ⛪ ☎ ✉ ✂ 🚽 🛀 👙 💄
👕 👘 👗 👢 👠 👡 💼 👜 👔 🎩 👒 👑 💍
🚭 ⚽ ⚾ ⛳ 🏈 🏀 🎾 🎱 🎯 🎿 🎌 🏁 🏆
⚠ ⛔ ❕ ❓ ❗ ❔ ❌ ❎ ✖ ♥ ♠ ♦ ♣
👌 👎 ✊ ☝ ✋ 🙌 💪 👊 👏 👆 👉 👈 👇
💔 💙 💚 💛 💜 💗 💘 💓 💝 💖 💞 💟 💌
💑 💋 👄 😍 😘 😚 😊 😏 😌 😃 😄 😞 😢
😷 😓 😰 😥 😪 😨 😱 😵 😭 😠 😳 😲 😤
😜 😝 😉 😔 😒 😂 😡 👿 👽 👾 👻 👼 👯
💂 👳 🎅 👮 👷 👸 👴 👵 👨 👩 👦 👧 👶
👱 👫 🎎 💃 👂 👃 👀 🌟 🌙 🎵 🎶 💤 🔥
🔔 🎈 🎉 🍸 🍺 🍻 🍶 🍵 🍴 🍞 🍳 🍟 🍲
🍣 🍝 🍜 🍰 🍧 🍦 🍔 🍎 🍓 🍊 🍉 🍅 🍆
🌱 🌴 🌵 🍁 🍂 🍃 🌸 🌹 🌷 🌻 🌺 💐 🎄
🐶 🐻 🐵 🐭 🐹 🐺 🐯 🐴 🐷 🐱 🐰 🐩 🐑
🐧 🐨 🐮 🐗 🐔 🐥 🐦 🐘 🐎 🐒 🐫 🐬 🐳
🐠 🐟 🐡 🐙 🐚 🐸 🐍 🐛 💨 🌊 💦 ✴ 🌈
📞 📠 🔈 📻 📷 🎥 📼 📡 📺 💻 💾 📀 📱
🎁 🎏 💢 💅 🐾 🍀 🎓 🎃 💀 🏧 💰 💵 💴
🚲 🚗 🚙 🚚 🚌 🚒 🚓 🚑 🚕 🚄 🚃 🚅 🚉
🚤 🚢 🎢 🚀 🎫 🚏 🚥 🚧 💈 📶 🔞 📳 📴
🌅 🌄 🌇 🌆 🌃 🗻 🏯 🏣 🏰 🏦 🗽 🎡 🗼
🏨 🏩 🏢 🏫 🏭 🏥 🏬 🏪 💒 🏡 🏠 📪 📫
📮 📩 📨 📝 🎒 📖 🎨 🎤 📣 🎧 🎷 🎺 🎸
📢 🔒 🔐 🔑 🔓 🔎 💡 💲 🔫 💣 🚬 💊 💉
🎭 🎬 🎦 🚻 🚹 🚺 🚼 🆚 🆙 🆒 ♿ ➿ 🚾
㊗ ㊙ 🈂 🈳 🈁 🈯 🈵 🈹 🈚 🈷 🈶 🈸 🈺
🉐 ⬜ ⚪ ➡ ⬇ ⬅ ⬆ ↗ ↖ ↘ ↙ ⤴ ⤵
🎀 🌂 💧 🔨 💺 〽 🔱 🔰 🀄 💎 💠 🔷 🔶
*/