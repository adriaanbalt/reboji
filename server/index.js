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
            let text = "" + event.message.text
            // TODO connect to DB 
            if ( text == "new" ){
                currentPuzzle = getPuzzle();
                sendTextMessage(sender, currentPuzzle.question );
            } else if ( text == currentPuzzle.answer) {
                sendTextMessage(sender, "Congratulations!" );
            } else {
                sendTextMessage(sender, "Wrong" );
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
    return puzzles[ getRandom(0, puzzles.length ) ];
}

function getRandom( min, max ){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const token = "EAAF0MuSayRkBAPHrPoIX9MLbR9itpARYzI4dEBPEX8LVe3MmqZArZA0iJOtXNTqKwY4y1Qu11HEARGtqcxXjbcWNyUfyX7BocxtiDxg1KlLyu32VfyS9bkErZBayW8B7itHPntLZCMgMRW2ct7K2nynYBCQ3LloZD"
let currentPuzzle = {
    question: "✨",
    answer: "star"
};

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
        question: "👮💰🔫💊💉😵✊",
        answer: "democracy"
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
Boat emoticonFuel pump emoticonAirplane Facebook emoticonFountain emoticonTent emoticonFacebook church emoticonTelephone Facebook EmoticonEnvelope emoticonScissors emoticonToilet emoticon for FacebookBath emoticonRed bikini undearwear emoticon for FacebookLipstick emoticon

⛵ ⛽ ✈ ⛲ ⛺ ⛪ ☎ ✉ ✂ 🚽 🛀 👙 💄
T-shirt emoticonKimono emojiDress emoticonBoots emoticonHigh heels emoticonSandal emoticonBriefcase emoticonHandbagTie emoticon for FacebookTop hat Facebook emoticonsWomans hat emojiCrown emoticonRing emoticon

👕 👘 👗 👢 👠 👡 💼 👜 👔 🎩 👒 👑 💍
No smoking Facebook emoticonSoccer ball emoticonBaseball emoticonGolf emoticonFootball emoticonBasketball emoticonTennis emoticonBilliard emoticonTarget emoticonSkis emoticonRacing flags emoticonFinish line emoticonTrophy emoticon

🚭 ⚽ ⚾ ⛳ 🏈 🏀 🎾 🎱 🎯 🎿 🎌 🏁 🏆
Warning sign emoticon for FacebookNo entry emoticonexclamation point EmojiExclamation mark emoticonRed exclamation point emoticonQuestion mark emoticonCross mark emoticonCross mark Facebook emojiMultiplication Facebook symbolHeart suit emoticonSpades emoticonDiamond suit emoticon for FacebookClubs suit emoticon

⚠ ⛔ ❕ ❓ ❗ ❔ ❌ ❎ ✖ ♥ ♠ ♦ ♣
A-ok signDislike EmoticonFacebook Clenched Fist EmoticonIndex finger emoticonHigh Five EmoticonTwo hands reaching upMuscle armFist EmoticonA pair of hands clapping.Finger pointing upIndex fingerFinger pointing left emoticonFinger pointing down Emoticon

👌 👎 ✊ ☝ ✋ 🙌 💪 👊 👏 👆 👉 👈 👇
Broken Heart EmoticonFacebook Blue Heart IconGreen Heart EmoticonYellow Heart EmoticonPurple Heart EmoticonTriple Heart EmoticonStabbed HeartCool heart iconWrapped Heart EmoticonSparkling Heart IconRevolving hearts EmojiWhite heart in red squareLove letter Facebook emoticon

💔 💙 💚 💛 💜 💗 💘 💓 💝 💖 💞 💟 💌
Couple in loveLip Mark EmoticonLips EmoticonEmoticon in loveEmoticon Blowing A KissKiss emoticon for FacebookHappy Facebook smiley red in faceSmirking smileySatisfiedSmiling face for FacebookBig smile emoticonDisappointed emoticonCrying Emoji smiley for Facebook

💑 💋 👄 😍 😘 😚 😊 😏 😌 😃 😄 😞 😢
Medic Facebook smileyEmoticon with cold sweatFear EmoticonRelieved emoticonSleepy smileyScared Facebook EmoticonEmoticon screaming in fearDizzy emoticonEmoticon Shedding TearsAngry face emoticonEmoticon with eyes wide openAstonished EmoticonBig Grin Emoticon

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
Hotel emoticonLove hotel emojiOffice emoticonSchool emoticonFactory emoticonHospital emoticonDepartment store emoticonConvenience storeWedding emoticonHouse emojiHouse emoticonMailbox emoticonMailbox with raised flag

🏨 🏩 🏢 🏫 🏭 🏥 🏬 🏪 💒 🏡 🏠 📪 📫
Postbox emojiMail emoticon for FacebookIncoming mail Facebok emoticonMemo signSchool bag emoticonOpen book emoticonPaint paletteMicrophone emoticonMegaphone emoticonHeadphones emoticonSaxophone emoticonTrumpet emoticonGuitar emoticon for Facebook

📮 📩 📨 📝 🎒 📖 🎨 🎤 📣 🎧 🎷 🎺 🎸
Public address systemLock emojiClosed lock with a keyKey Facebook emoticonOpen lock emoticonMagnifying glass emoticonLight bulb emoticonDollar sign for Facebook Pistol emoticonBomb emoticonCigarette emoticonPill emoticonSyringe emoji

📢 🔒 🔐 🔑 🔓 🔎 💡 💲 🔫 💣 🚬 💊 💉
Mask emoticonClapper boardFilm roleRestroomMens emoticonWomens emoticonChild emoticonVS emoticon versusUp emojiCool emoticon signWheelchair emoticonCurly loops signWC emoticon

🎭 🎬 🎦 🚻 🚹 🚺 🚼 🆚 🆙 🆒 ♿ ➿ 🚾
Congratulations emoticonSecret Facebook emoticonFree service symbolAvailable Facebook symbolsDestination emoticonFinger pointFull emoticonSale emoticonHave nothing emoticonMonth symbolOwn emoticonRequest emoticonWorking emoticon for Facebook

㊗ ㊙ 🈂 🈳 🈁 🈯 🈵 🈹 🈚 🈷 🈶 🈸 🈺
Good bargain symbolSquare symbolCircleRightwards arrowDownwards arrowLeftwards arrowUpwards arrowNortheast arrowNorthwest arrowSoutheast arrowSouthwest arrowUp right arrowArrow pointing down right 
🉐 ⬜ ⚪ ➡ ⬇ ⬅ ⬆ ↗ ↖ ↘ ↙ ⤴ ⤵
Ribbon emoticonClosed umbrella emojiDroplet emojiHammer Facebook emoticonSeat emoticonPart alternation markTrident emoticonNoob signMahjong tile red dragonGem stoneDiamond emoticonBlue diamond emojiOrange diamond

🎀 🌂 💧 🔨 💺 〽 🔱 🔰 🀄 💎 💠 🔷 🔶
*/