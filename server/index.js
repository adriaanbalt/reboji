'use strict'

const   express = require('express'),
        path = require('path'),
        bodyParser = require('body-parser'),
        request = require('request'),
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
                sendTextMessage(sender, "new puzzle: " + currentPuzzle.question );
            } else if ( text == currentPuzzle.answer) {
                sendTextMessage(sender, "!!!!!!!!!!!!!!!!" );
                sendTextMessage(sender, "Congratulations!" );
                sendTextMessage(sender, "" );
                currentPuzzle = getPuzzle();
                sendTextMessage(sender, "new puzzle: " + currentPuzzle.question );
            } else if ( text != currentPuzzle.answer) {
                sendTextMessage(sender, "Wrong. Try again. Respond 'new' for a different puzzle." );
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
})

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
        answer: "game"
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
        answer: "pound"
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
        question: "👯",
        answer: "babes"
    }
    



]

/*
Facebook Smiley FaceFacebook big smile - Grin emoticonFacebook Sad EmoticonFacebook Cry EmoticonFacebook Tounge Out EmoticonFacebook Angel Smiley EmoticonFacebook Devil EmoticonFacebook Confused SmileyFacebook Wink SmileyFacebook Gasp EmoticonFacebook squint emoticonFacebook angry smileyFacebook Kiss Emoticon

:)

:D

:(

:'(

:P

O:)

3:)

o.O

;)

:O

-_-

>:O

:*
Facebook Heart EmoticonFacebook Kiki SmileyGlasses Smiley for FacebookFacebook Sunglasses SmileyFacebook Shark EmoticonFacebook Robot SmileyFacebook Grumpy SmileyFacebook Pacman EmoticonFacebook Unsure SmileyFacebook Curly Lips EmoticonFacebook Blush EmoticonThumb Up (y) Like Facebook EmoticonPoop - New Facebook Emoticon

<3

^_^

8-)

8|

(^^^)

:|]

>:(

:v

:/

:3

☺

(y)

:poop:
Chris Putnam emoticonFacebook Penguin EmoticonPeace Fingers EmoticonFacebook Sun EmoticonFacebook Cloud IconUmbrella EmoticonFacebook Thunder EmoticonStars Facebook EmoticonsWhite star Facebook emoticonSnowflake Emoji for FacebookFacebook Snowman EmoticonCup Of Coffee Facebook EmoticonHot plate emoticon

:putnam:

<(")

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
Congratulations emoticonSecret Facebook emoticonFree service symbolAvailable Facebook symbolsDestination emoticonFinger pointFull emoticonSale emoticonHave nothing emoticonMonth symbolOwn emoticonRequest emoticonWorking emoticon for Facebook

㊗ ㊙ 🈂 🈳 🈁 🈯 🈵 🈹 🈚 🈷 🈶 🈸 🈺
Good bargain symbolSquare symbolCircleRightwards arrowDownwards arrowLeftwards arrowUpwards arrowNortheast arrowNorthwest arrowSoutheast arrowSouthwest arrowUp right arrowArrow pointing down right 
🉐 ⬜ ⚪ ➡ ⬇ ⬅ ⬆ ↗ ↖ ↘ ↙ ⤴ ⤵
Ribbon emoticonClosed umbrella emojiDroplet emojiHammer Facebook emoticonSeat emoticonPart alternation markTrident emoticonNoob signMahjong tile red dragonGem stoneDiamond emoticonBlue diamond emojiOrange diamond

🎀 🌂 💧 🔨 💺 〽 🔱 🔰 🀄 💎 💠 🔷 🔶
*/