// server.js

// set up ======================================================================
// get all the tools we need
var express = require('express')
var app = express()
var port = process.env.PORT || 3002
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var http = require('http')
var MongoClient = require('mongodb').MongoClient;

// COUPON DEALZ =======================================
var unirest = require('unirest');

var batch = []

var mileradius = '20';
var zip = '10022';
var userid = '18381';
var limit = '10';



unirest.get("https://8coupons.p.mashape.com/getdeals?key=ac56993a4bac47e69e55be1139e92da82978fbb07af8caaaf8a2ca17e169f8e044284d90947139a3cdbe307221259bb9&limit=" + limit + "&mileradius=" + mileradius +"&userid=" + userid + "&zip=" + zip + "")
.header("X-Mashape-Key", "RN9umwpGbBmshopPwKJXzLDev6qQp1ihzVGjsnvcADyO4o8Zyb")
.header("Accept", "application/json")
.end(function (result, callback) {
	for(var i = 0; i < result.body.length;i++){
		batch[i] = {}
		batch[i].URL = result.body[i].URL
		batch[i].name = result.body[i].name
		batch[i].address =result.body[i].address
		batch[i].address2 = result.body[i].address2
		batch[i].phone = result.body[i].phone
		batch[i].dealTitle = result.body[i].dealTitle
		batch[i].dealInfo = result.body[i].dealInfo
		batch[i].expirationDate = result.body[i].expirationDate
		batch[i].showImageStandardBig = result.body[i].showImageStandardBig
		batch[i].showImageStandardSmall = result.body[i].showImageStandardSmall
		batch[i].distance = result.body[i].distance
	}
	callback();
});

// DATBASE CRUMS ======================================

MongoClient.connect('mongodb://priceradmin:bluecakes1@ds061611.mongolab.com:61611/pricer', function(err, db) {
    if (err) throw err;
    console.log("Connected to Database");
    _db = db //this is our global database object
})




app.use(bodyParser.json()) // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static(__dirname + '/public'))



// routes ======================================================================
require('./app/routes.js')(app) // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port)
console.log('The magic happens on port ' + port)


// indicoLine(batch)
// batch.topic
// batch.probability

// getRevl(batch)
// batch.relevancy = asdads


// res.send()
