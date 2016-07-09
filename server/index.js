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
        Promise = require('bluebird');


// promisifies methods on "Puzzle" and "Puzzle" instances
Promise.promisifyAll(Puzzle);
Promise.promisifyAll(Puzzle.prototype);

let puzzles = Puzzle.findAsync({}, null, {})
        .then(allPuzzles => {
            console.log ( 'puzzles', allPuzzles);
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


// handling messages
app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = "" + event.message.text.toLowerCase();

            // console.log ( 'checkPuzzleAnswer( text )', checkPuzzleAnswer( text ) );
            // TODO connect to DB 
            if ( !currentPuzzle || text == "new" ) {
                currentPuzzle = getPuzzle();
                sendTextMessage(sender, "Here's a new puzzle: " + currentPuzzle.question );
            } else if ( checkPuzzleAnswer( text ) ) {
                sendTextMessage(sender, "!!!!!!!!!!!!!!!!" );
                sendTextMessage(sender, "Congratulations! Here's a new puzzle" );
                currentPuzzle = getPuzzle();
                sendTextMessage(sender, currentPuzzle.question );
            } else if ( !checkPuzzleAnswer( text ) ) {
                sendTextMessage(sender, "Wrong. Try again or respond 'new' for a different puzzle." );
                sendTextMessage(sender, "current puzzle: " + currentPuzzle.question );
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

console.log ( 'path to routes', path.join(__dirname, 'routes') );

function getPuzzle() {
    // let returnPuzzle;
    // Puzzle.findOneAsync({}, null, {})
    //         .then(puzzle => {
    //             returnPuzzle = puzzle;
    //         })
    //         .catch(err => !console.log(err) && next(err));

    // return returnPuzzle;
    let newPuzz = puzzles[ getRandom(0, puzzles.length ) ];// == currentPuzzle ? getPuzzle() : puzzles[ getRandom(0, puzzles.length ) ];
    console.log ( 'puzzles', puzzles.length, newPuzz );
    return newPuzz;
}

function getRandom( min, max ){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkPuzzleAnswer( text ) {
    for ( var i=0; i<currentPuzzle.answer.length; i++ ){
        if ( currentPuzzle.answer[i] == text ) {
            return true;
        }
    }
    return false;
}

const token = "EAAF0MuSayRkBAPHrPoIX9MLbR9itpARYzI4dEBPEX8LVe3MmqZArZA0iJOtXNTqKwY4y1Qu11HEARGtqcxXjbcWNyUfyX7BocxtiDxg1KlLyu32VfyS9bkErZBayW8B7itHPntLZCMgMRW2ct7K2nynYBCQ3LloZD"
let currentPuzzle;

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
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