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

const mongoose = require('mongoose'),
      request = require('request'),
      Puzzle = mongoose.model('Puzzle'),
      User = mongoose.model('User'),
      Promise = require('bluebird')

// promisifies methods on "Puzzle" and "Puzzle" instances
Promise.promisifyAll(Puzzle);
Promise.promisifyAll(Puzzle.prototype);
Promise.promisifyAll(User);
Promise.promisifyAll(User.prototype);

class Reboji {

    constructor(app) {
        console.log ( "REBOJI CONSTRUCTOR" );
        
        this.puzzles = [];
        this.seenPuzzles = [];
        this.puzzlesComplete = [];
        this.failedPuzzles = [];
        this.currentPuzzle;
        this.token = "EAAF0MuSayRkBAMi8pb5w6X2qf3rsk1wF8UCD8Nhpho0yiBknETthNd2b8o4eM0bUXZBiar1jfSlfeBJneMfSoiFjZA77gMdroLnnai7ClsjU4ZBdpFz69ZAnX2Jx1uy1WzZAc7mJbCntbQkErviZCd2obVJ7MDMfQZD"
        this.firstMessageTime = 100;
        this.messageDelay = 300;
        this.facebookUserId;
        this.currentUser;
        this.currentUserObj;

        // for Facebook verification
        app.get('/webhook/', (req, res) => {
            if (req.query['hub.verify_token'] === 'obi_wan_dies') {
                res.send(req.query['hub.challenge'])
            }
            res.send('Error, wrong token')
        })

        // handling messages
        app.post('/webhook/',  (req, res) => {
            let messaging_events = req.body.entry[0].messaging
            for (let i = 0; i < messaging_events.length; i++) {
                let event = req.body.entry[0].messaging[i]
                this.facebookUserId = event.sender.id
                
                console.log ( ' ' )

                if ( this.currentUser != this.facebookUserId ) {
                    // if user doesn't exist, create a user in the database
                    this.getUserByFbId( this.facebookUserId )
                        .then( ( userObj )=> {
                            if ( !userObj ) {
                                this.createUser( this.facebookUserId )
                            } else {
                                this.currentUserObj = userObj
                                this.puzzlesComplete = userObj.puzzlesComplete
                                this.currentPuzzle = userObj.currentPuzzle
                                this.currentUser = this.facebookUserId
                            }
                        })
                }

                // console.log ( 'webhook > this.currentPuzzle', this.currentPuzzle )

                // if this session doesnt have a current puzzle yet, then get it off the user
                if ( !this.currentPuzzle ) {
                    this.getUserCurrentPuzzle()
                        .then( (userCurrentPuzzle) => {
                            if ( userCurrentPuzzle ) {
                                // there is a user puzzle already
                                this.currentPuzzle = userCurrentPuzzle
                            } else {
                                // if there is no set user puzzle, get a random puzzle from the list
                                this.currentPuzzle = this.getPuzzleFromList()
                                // set the user's current puzzle to the randomly selected puzzle
                                this.setUserCurrentPuzzle( this.currentPuzzle )
                            }
                            // console.log ( 'webhook > getUserCurrentPuzzle: ', this.currentPuzzle, ' user puzzle', userCurrentPuzzle )
                            this.handleMessages(event, this.facebookUserId)
                        })
                } else {
                    this.handleMessages(event, this.facebookUserId)
                }
            }
            // TODO > pair with a specific user in the database
            res.sendStatus(200)
        })
    }

    start() {
        Puzzle.findAsync({}, null, {})
            .then(allPuzzles => {
                this.puzzles = allPuzzles.filter( item => item.pictogram != "" );
                return allPuzzles;
            })
            .catch(err => !console.log(err) && next(err));
    }

    createUser( fbId ) {
        var newObj = new User(
            {
                fbID: fbId,
            }
        );
        newObj.saveAsync()
          .then( savedObj  => {
            console.log ( 'response from user save:', savedObj);
        });
    }

    getUserByFbId( fbId ) {
        return new Promise((resolve, reject) => {
            User.findOneAsync({ fbID:this.facebookUserId })
                .then( ( user ) => {
                    // console.log ( 'checkUserExists response', user )
                    if ( !user ) {

                    }
                    resolve( user ) 
                }) 
            })
    }

    handleMessages( event ) {

        if (event.message && event.message.text) {
            let text = "" + event.message.text.toLowerCase();

            // starting the game
            if ( !this.currentPuzzle ) {
                this.sendTextMessage( '-' );
                setTimeout( ()=>this.sendTextMessage( "Here is your first puzzle of " + puzzles.length + " puzzles." ), this.firstMessageTime )
                setTimeout( ()=>this.sendTextMessage( this.currentPuzzle.pictogram ), this.firstMessageTime+(this.messageDelay*1) )
            }
            // help command
            else if ( text == "help" ) {
                this.sendTextMessage( '-' );
                setTimeout( ()=>this.sendTextMessage( "Commands:" ), this.firstMessageTime )
                setTimeout( ()=>this.sendTextMessage( "'new' : a new puzzle." ), this.firstMessageTime+(this.messageDelay*1) )
                setTimeout( ()=>this.sendTextMessage( "'hint' : hint of the current puzzle, if there is one." ), this.firstMessageTime+(this.messageDelay*2) )
                setTimeout( ()=>this.sendTextMessage( "'score' : your current score." ), this.firstMessageTime+(this.messageDelay*3) )
                setTimeout( ()=>this.sendTextMessage( "'current' : your current puzzle." ), this.firstMessageTime+(this.messageDelay*4) )
                setTimeout( ()=>this.sendTextMessage( "'help' : available commands." ), this.firstMessageTime+(this.messageDelay*5) )
            }
            // get a new puzzle
            else if ( text == "new" ) {
                this.sendTextMessage( '-' );
                // update user on database to a new puzzle
                this.setUserCurrentPuzzle( this.getPuzzleFromList() )
                setTimeout( ()=>this.sendTextMessage( "Here is a new puzzle" ), this.firstMessageTime )
                setTimeout( ()=>this.sendTextMessage( this.currentPuzzle.pictogram ), this.firstMessageTime+(this.messageDelay*1) )
            }
            // get a hint
            else if ( text == "hint" ) {
                if ( this.currentPuzzle.hint ) {
                    this.sendTextMessage( "Here is this puzzle's hint:" );
                    setTimeout( ()=>this.sendTextMessage( this.currentPuzzle.hint ), this.firstMessageTime+(this.messageDelay*1) )
                } else {
                    this.sendTextMessage( "Sorry, this puzzle does not have a hint." );
                }
            }
            // check your info
            else if ( text == "score" ) {
                this.sendTextMessage( "You have completed " + this.puzzlesComplete.length + " of " + this.puzzles.length + " puzzles." );
            }
            // get current puzzle
            else if ( text == "current" ) {
                console.log ( 'current ', this.currentPuzzle )
                this.sendTextMessage( "Your current puzzle is");
                setTimeout( ()=>this.sendTextMessage( this.currentPuzzle.pictogram ), this.firstMessageTime+(this.messageDelay*1) )
            }
            // get current puzzle
            else if ( text == "me" ) {
                console.log ( 'this.currentUserObj', this.currentUserObj )
                this.sendTextMessage( "Your user info is");
                setTimeout( ()=>this.sendTextMessage( this.currentUserObj ), this.firstMessageTime+(this.messageDelay*1) )
            }
            // successful puzzle response
            else if ( this.checkPuzzleAnswer( text ) ) {
                // delete a puzzle that was successfully answered
                this.removePuzzle( this.currentPuzzle ); 
                // add successful puzzles to a separate array for logging
                this.updateUserPuzzlesComplete( this.currentPuzzle );
                // update user on database to a new puzzle
                this.setUserCurrentPuzzle( this.getPuzzleFromList() )

                this.sendTextMessage( "-" )
                setTimeout( ()=>this.sendTextMessage( "Congratulations! You have completed " + this.currentUserObj.puzzlesComplete.length + " of " + this.puzzles.length + " puzzles. Here's a new puzzle" ), 100 )
                setTimeout( ()=>this.sendTextMessage( this.currentPuzzle.pictogram ), this.firstMessageTime+(this.messageDelay*1) )
            }
            // incorrect puzzle response
            else if ( !this.checkPuzzleAnswer( text ) ) {
                this.sendTextMessage( '-' );
                setTimeout( ()=>this.sendTextMessage( "Sorry that was incorrect. You have " + this.puzzlesComplete.length + " of " + this.puzzles.length + " puzzles left to complete. Try again or respond 'help' for available commands." ), 100 )
                setTimeout( ()=>this.sendTextMessage( this.currentPuzzle.pictogram ), this.firstMessageTime+(this.messageDelay*1) )
            }
        }
    }

    updateUserPuzzlesComplete( newPuzzle ) {
        this.puzzlesComplete.push( newPuzzle.id )
        return new Promise((resolve, reject) => {
            User.findOneAsync({ fbID:this.facebookUserId })
                .then( (userObj) => {
                    userObj.puzzlesComplete = this.puzzlesComplete
                    return userObj.save()
                        .then( ( userObj ) => {
                            console.log ( 'this.currentUserObj', this.currentUserObj )
                            this.currentUserObj = userObj
                            return resolve( userObj.puzzlesComplete )
                        })
                })
        })
    }

    removePuzzle( puzzleToRemove ) {
        this.puzzles.filter( puzzle => puzzle === puzzleToRemove )
    }
    getPuzzle() {
        // let returnPuzzle;
        // Puzzle.findOneAsync({}, null, {})
        //         .then(puzzle => {
        //             returnPuzzle = puzzle;
        //         })
        //         .catch(err => !console.log(err) && next(err));

        // return returnPuzzle;
        // let newPuzz = puzzles[ getRandom(0, puzzles.length ) ];// == currentPuzzle ? getPuzzle() : puzzles[ getRandom(0, puzzles.length ) ];
        // User.updateAsync({ fbID:this.facebookUserId }, { currentPuzzle: newPuzz._id,  })
        return this.currentPuzzle;
    }

    getPuzzleFromList() {
        return this.puzzles[ this.getRandom(0, this.puzzles.length ) ];
    }

    setUserCurrentPuzzle(puzzle) {
        this.currentPuzzle = puzzle
        return new Promise((resolve, reject) => {
            User.findOneAsync({ fbID:this.facebookUserId })
                .then( (userObj) => {
                    this.currentUserObj = userObj
                    userObj.currentPuzzle = puzzle
                    userObj.save()
                    // console.log ( 'currentPuzzle: ', this.currentPuzzle )
                    return resolve( this.currentPuzzle )
                })


        })
    }

    getUserCurrentPuzzle() {
        return new Promise((resolve, reject) => {
            User.findOne({ fbID:this.facebookUserId })
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

    getRandom( min, max ){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    checkPuzzleAnswer( text ) {
        console.log ( 'checkPuzzleAnswer:', this.currentPuzzle, text )
        // console.log ( 'checkPuzzleAnswehr', ( this.currentPuzzle.answer.toLowerCase() == text.toLowerCase() ), text.toLowerCase(), this.currentPuzzle.answer.toLowerCase() )
        return ( this.currentPuzzle.answer.toLowerCase() == text.toLowerCase() );
        // for ( var i=0; i<currentPuzzle.answer.length; i++ ){
        //     if ( currentPuzzle.answer[i] == text ) {
        //         return true;
        //     }
        // }
        // return false;
    }

    sendTextMessage( text ) {
        let messageData = { text:text }
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token:this.token
            },
            method: 'POST',
            json: {
                recipient: {
                    id:this.facebookUserId
                },
                message: messageData,
            }
        }, (error, response, body) => {
            if (error) {
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('Error: ', response.body.error)
            }
        })
    }
}

module.exports = Reboji

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
