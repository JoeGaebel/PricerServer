// server.js

// set up ======================================================================
// get all the tools we need
var express = require('express')
var app = express()
var port = process.env.PORT || 3002
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var http = require('http')
db = require('mongoose');



// DATBASE CRUMS ======================================
db.connect('mongodb://priceradmin:bluecakes1@ds061611.mongolab.com:61611/pricer');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json()) // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static(__dirname + '/public'))



// routes ======================================================================
require('./app/profileSchema.js');
require('./app/dealSchema.js');
savedDealModel = db.model('savedDealModel', dealSchema);
profileModel = db.model('profileModel', profileSchema);
require('./app/routes.js')(app)
// launch ======================================================================
app.listen(port)
console.log('The magic happens on port ' + port)