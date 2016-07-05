'use strict'

const   express = require('express'),
        path = require('path'),
        bodyParser = require('body-parser'),
        request = require('request'),
        mongoose = require('mongoose'),
        app = express();

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())


// Set static folder
app.use(express.static(path.join(__dirname, '../public')));

// Index route
// Serve index.html from root
app.get('/', (req, res, next) => res.sendFile('/index.html', {
  root: path.join(__dirname, '../public')
}));


// app.get('/', function (req, res) {
//     res.send('Hello world, I am a chat bot')
// })

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'obi_wan_dies') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = "" + event.message.text.toLowerCase();
            // TODO connect to DB 
            if ( !currentPuzzle || text == "new" ) {
                currentPuzzle = getPuzzle();
                sendTextMessage(sender, "Here's a new puzzle: " + currentPuzzle.question );
            } else if ( text == currentPuzzle.answer) {
                sendTextMessage(sender, "!!!!!!!!!!!!!!!!" );
                sendTextMessage(sender, "Congratulations! Here's a new puzzle" );
                currentPuzzle = getPuzzle();
                sendTextMessage(sender, currentPuzzle.question );
            } else if ( text != currentPuzzle.answer) {
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


function getPuzzle() {
    return puzzles[ getRandom(0, puzzles.length ) ] == currentPuzzle ? getPuzzle() : puzzles[ getRandom(0, puzzles.length ) ];
}

function getRandom( min, max ){
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
});

mongoose.connect('mongodb://heroku_jk541zkr:rrbc4u94f4kcegae7evbicj8t2@ds023074.mlab.com:23074/heroku_jk541zkr');

let puzzles = [

    {
        question: "☕",
        answer: "coffee"
    },
    {
        question: "👗",
        answer: "dress"
    },
    currentPuzzle = {
        question: "✨",
        answer: "star"
    },
    currentPuzzle = {
        question: "🐳🍆",
        answer: "whale dick"
    },
    currentPuzzle = {
        question: "👮✊💰💃👯💊💉😵🔫",
        answer: "democracy"
    },
    currentPuzzle = {
        question: "💍",
        answer: "ring"
    },
    currentPuzzle = {
        question: "👾",
        answer: "octopus"
    },
    currentPuzzle = {
        question: "⚽",
        answer: "soccer"
    },
    currentPuzzle = {
        question: "👌",
        answer: "ok"
    },
    currentPuzzle = {
        question: "👊",
        answer: "fist"
    },
    currentPuzzle = {
        question: "👏",
        answer: "clap"
    },
    currentPuzzle = {
        question: "👎",
        answer: "boo"
    },
    currentPuzzle = {
        question: "🐸",
        answer: "frog"
    },
    currentPuzzle = {
        question: "🏈",
        answer: "football"
    },
    currentPuzzle = {
        question: "🌹",
        answer: "rose"
    },
    currentPuzzle = {
        question: "🔪 🧀",
        answer: "cut the cheese"
    },
    currentPuzzle = {
        question: "👑 🐸",
        answer: "cut the cheese"
    },
    currentPuzzle = {
        question: "✈️ 🌙",
        answer: "fly me to the moon"
    }

]

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