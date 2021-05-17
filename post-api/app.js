// ===========================
// Requires
// ===========================
const express = require('express')
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');
//var https = require('https');


const app = express();


// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//parse application/json
app.use(bodyParser.json());

//Server index config
//var serveIndex = require('serve-index');
const { json } = require('body-parser');
app.use(express.static(__dirname + '/'));
//app.use('/uploads', serveIndex(__dirname + '/uploads'));

//Routes
//app.use(require('./routes/user'));
app.use(require('./routes/post'));


// Do connection to database
mongoose.connect('mongodb://db-user/monolithic', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', (error) => {
    if (error) throw error;

    console.log("Database ONLINE");
});

app.listen(4041, () => {
    console.log('Listening http port: ', 4041);
});