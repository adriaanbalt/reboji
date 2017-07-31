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
const token = "EAAF0MuSayRkBAMi8pb5w6X2qf3rsk1wF8UCD8Nhpho0yiBknETthNd2b8o4eM0bUXZBiar1jfSlfeBJneMfSoiFjZA77gMdroLnnai7ClsjU4ZBdpFz69ZAnX2Jx1uy1WzZAc7mJbCntbQkErviZCd2obVJ7MDMfQZD"
const firstMessageTime = 100;
const messageDelay = 300;
let facebookUserId;

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
    console.log ( 'webhook verification', req, res )
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


// User.findAsync({}, null, {})
//     .then(allUsers => {
//         console.log( 'ALLUSERS:', allUsers );
//     })
//     .catch(err => !console.log(err) && next(err));

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
        facebookUserId = event.sender.id
        // if this session doesnt have a current puzzle yet, then get it off the user
        if ( !currentPuzzle ) {
            getUserCurrentPuzzle()
                .then( (userCurrentPuzzle) => {
                    if ( userCurrentPuzzle ) {
                        // there is a user puzzle already
                        currentPuzzle = userCurrentPuzzle
                    } else {
                        // if there is no set user puzzle, get a random puzzle from the list
                        currentPuzzle = getPuzzleFromList()
                        // set the user's current puzzle to the randomly selected puzzle
                        setUserCurrentPuzzle( currentPuzzle )
                    }
                    console.log ( '>>first request: ', currentPuzzle, ' user puzzle', userCurrentPuzzle )
                    handleMessages(event, facebookUserId)
                })
        } else {
            handleMessages(event, facebookUserId)
        }
    }
    // TODO > pair with a specific user in the database
    res.sendStatus(200)
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
});

// api routes
// app.use('/api', require('./routes'));
app.use('/api', require( path.join(__dirname, 'routes') ));

getAllPuzzles();

function getAllPuzzles() {

    Puzzle.findAsync({}, null, {})
        .then(allPuzzles => {
            puzzles = allPuzzles.filter( item => item.pictogram != "" );
            console.log ( 'all puzzles', puzzles)
            return allPuzzles;
        })
        .catch(err => !console.log(err) && next(err));
}

function handleMessages( event ) {

    if (event.message && event.message.text) {
        let text = "" + event.message.text.toLowerCase();

        // starting the game
        if ( !currentPuzzle ) {
            sendTextMessage( '-' );
            setTimeout( ()=>sendTextMessage( "Here is your first puzzle of " + puzzles.length + " puzzles." ), firstMessageTime )
            setTimeout( ()=>sendTextMessage( currentPuzzle.pictogram ), firstMessageTime+(messageDelay*1) )
        }
        // help command
        else if ( text == "help" ) {
            sendTextMessage( '-' );
            setTimeout( ()=>sendTextMessage( "Commands:" ), firstMessageTime )
            setTimeout( ()=>sendTextMessage( "'new' : a new puzzle." ), firstMessageTime+(messageDelay*1) )
            setTimeout( ()=>sendTextMessage( "'hint' : hint of the current puzzle, if there is one." ), firstMessageTime+(messageDelay*2) )
            setTimeout( ()=>sendTextMessage( "'score' : your current score." ), firstMessageTime+(messageDelay*3) )
            setTimeout( ()=>sendTextMessage( "'current' : your current puzzle." ), firstMessageTime+(messageDelay*4) )
            setTimeout( ()=>sendTextMessage( "'help' : available commands." ), firstMessageTime+(messageDelay*5) )
        }
        // get a new puzzle
        else if ( text == "new" ) {
            sendTextMessage( '-' );
            // update user on database to a new puzzle
            setUserCurrentPuzzle( getPuzzleFromList() )
            setTimeout( ()=>sendTextMessage( "Here is a new puzzle" ), firstMessageTime )
            setTimeout( ()=>sendTextMessage( currentPuzzle.pictogram ), firstMessageTime+(messageDelay*1) )
        }
        // get a hint
        else if ( text == "hint" ) {
            if ( currentPuzzle.hint ) {
                sendTextMessage( "Here is this puzzle's hint:" );
                setTimeout( ()=>sendTextMessage( currentPuzzle.hint ), firstMessageTime+(messageDelay*1) )
            } else {
                sendTextMessage( "Sorry, this puzzle does not have a hint." );
            }
        }
        // check your info
        else if ( text == "score" ) {
            sendTextMessage( "You have completed " + successfulPuzzles.length + " of " + puzzles.length + " puzzles." );
        }
        // get current puzzle
        else if ( text == "current" ) {
            sendTextMessage( "Your current puzzle is");
            setTimeout( ()=>sendTextMessage( currentPuzzle.pictogram ), firstMessageTime+(messageDelay*1) )
        }
        // successful puzzle response
        else if ( checkPuzzleAnswer( text ) ) {
            // delete a puzzle that was successfully answered
            removePuzzle( currentPuzzle ); 
            // add successful puzzles to a separate array for logging
            correctPuzzle( currentPuzzle );
            // update user on database to a new puzzle
            setUserCurrentPuzzle( getPuzzleFromList() )

            sendTextMessage( "-" )
            setTimeout( ()=>sendTextMessage( "Congratulations! You have completed " + successfulPuzzles.length + " of " + puzzles.length + " puzzles. Here's a new puzzle" ), 100 )
            setTimeout( ()=>sendTextMessage( currentPuzzle.pictogram ), firstMessageTime+(messageDelay*1) )
        }
        // incorrect puzzle response
        else if ( !checkPuzzleAnswer( text ) ) {
            sendTextMessage( '-' );
            setTimeout( ()=>sendTextMessage( "Sorry that was incorrect. You have " + successfulPuzzles.length + " of " + puzzles.length + " puzzles left to complete. Try again or respond 'help' for available commands." ), 100 )
            setTimeout( ()=>sendTextMessage( currentPuzzle.pictogram ), firstMessageTime+(messageDelay*1) )
        }
    }
}
function correctPuzzle( puzzle ) {
    console.log ( 'correctPuzzle()')
    updateUserSuccessfulPuzzles( newPuzzle );
}
function updateUserSuccessfulPuzzles( newPuzzle ) {
    console.log ( 'updateUserSuccessfulPuzzles(), newPuzzle')
    successfulPuzzles.push( puzzle )
    return new Promise((resolve, reject) => {
        User.updateAsync({ fbID:facebookUserId }, { successfulPuzzles: successfulPuzzles })
            .then( (userObj) => {
                console.log ( ' ' )
                console.log ( 'correctPuzzle(): ')
                console.log ( 'user:', userObj );
                console.log ( 'currentPuzzle: ', currentPuzzle )
                return resolve( currentPuzzle )
            })
    })

}
function removePuzzle( puzzleToRemove ) {
    puzzles.filter( puzzle => puzzle === puzzleToRemove )
}
function getPuzzle() {
    // let returnPuzzle;
    // Puzzle.findOneAsync({}, null, {})
    //         .then(puzzle => {
    //             returnPuzzle = puzzle;
    //         })
    //         .catch(err => !console.log(err) && next(err));

    // return returnPuzzle;
    // let newPuzz = puzzles[ getRandom(0, puzzles.length ) ];// == currentPuzzle ? getPuzzle() : puzzles[ getRandom(0, puzzles.length ) ];
    // User.updateAsync({ fbID:facebookUserId }, { currentPuzzle: newPuzz._id,  })
    return currentPuzzle;
}

function getPuzzleFromList() {
    return puzzles[ getRandom(0, puzzles.length ) ];
}

function setUserCurrentPuzzle(puzzle) {
    currentPuzzle = puzzle
    return new Promise((resolve, reject) => {
        User.findByIdAndUpdate({ fbID:facebookUserId }, { $set: { currentPuzzle: puzzle }})
            .then( (userObj) => {
                console.log ( ' ' )
                console.log ( 'setUserCurrentPuzzle(): ')
                console.log ( 'user:', userObj );
                console.log ( 'currentPuzzle: ', currentPuzzle )
                return resolve( currentPuzzle )
            })
    })
}

function getUserCurrentPuzzle() {
    return new Promise((resolve, reject) => {
        User.findOne({ fbID:facebookUserId })
            .populate('currentPuzzle') // only return the Persons name
            .exec( (err, user) => {
                if (err) return reject(err);
                console.log( ' ' );
                console.log('getUserCurrentPuzzle() >>');
                console.log('user: ', user );
                // currentPuzzle = story.currentPuzzle
                resolve( user.currentPuzzle )
            })    
    })
    // User.findAsync({ fbID:"1064814340266637" })
    //     .then( userObj => {
    //         return User.populate(userObj, {path:"currentPuzzle"})
    //     })
    //     .then( populatedObj => {
    //         console.log ( "populatedObj!!", populatedObj );
    //     })
    //     .catch((err) => console.log(err));
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

function sendTextMessage( text ) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token:token
        },
        method: 'POST',
        json: {
            recipient: {
                id:facebookUserId
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