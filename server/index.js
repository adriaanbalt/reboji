'use strict'

require( '../db' )('mongodb://heroku_jk541zkr:rrbc4u94f4kcegae7evbicj8t2@ds023074.mlab.com:23074/heroku_jk541zkr');

const   express = require('express'),
        path = require('path'),
        cookieParser = require('cookie-parser'),
        bodyParser = require('body-parser'),
        request = require('request'),
        app = express(),
        Workers = require('./workers');

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

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
});

// api routes
// app.use('/api', require('./routes'));
app.use('/api', require( path.join(__dirname, 'routes') ));

let workers = new Workers( app );
workers.start();