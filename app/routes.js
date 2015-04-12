//================================Routes===========================================//
var indico = require('indico.io');
var unirest = require('unirest');

indico.apiKey = "d20bdc8065f1ce9f0ae9d6d395e88a94";

module.exports = function(app) {

    // ============================ COUPON DEALZ =======================================



    function creatBatchObject(batch, mileradius, zip, userid, limit, callback) {
        unirest.get("https://8coupons.p.mashape.com/getdeals?key=ac56993a4bac47e69e55be1139e92da82978fbb07af8caaaf8a2ca17e169f8e044284d90947139a3cdbe307221259bb9&limit=" + limit + "&mileradius=" + mileradius + "&userid=" + userid + "&zip=" + zip + "")
            .header("X-Mashape-Key", "RN9umwpGbBmshopPwKJXzLDev6qQp1ihzVGjsnvcADyO4o8Zyb")
            .header("Accept", "application/json")
            .end(function(result) {

                for (var i = 0; i < result.body.length; i++) {
                    //   console.log(result.body[i]);
                    batch[i] = {}
                    batch[i].URL = result.body[i].URL
                    batch[i].name = result.body[i].name
                    batch[i].address = result.body[i].address
                    batch[i].address2 = result.body[i].address2
                    batch[i].phone = result.body[i].phone
                    batch[i].dealTitle = result.body[i].dealTitle
                    batch[i].dealInfo = result.body[i].dealinfo
                    batch[i].expirationDate = result.body[i].expirationDate
                    batch[i].showImageStandardBig = result.body[i].showImageStandardBig
                    batch[i].showImageStandardSmall = result.body[i].showImageStandardSmall
                    batch[i].distance = result.body[i].distance
                }
                callback();
            });
    }

    function getMaxProb(indicoObject) {
        var maxObject = {}
        maxObject.value = 0.0;
        maxObject.topic = 0.0;

        for (var attribute in indicoObject) {
            var value = indicoObject[attribute];
            if (value > maxObject.value) {
                maxObject.value = value;
                maxObject.topic = attribute;
            }
        }

        return maxObject;
    }

    function injectTopicsAndProbability(batch, callback) {
        //Create an array of Deal descriptions
        var dealInfoArray = [];
        // console.log(batch);
        for (var deal in batch)
            dealInfoArray.push(batch[deal].dealInfo);
        //Run dealInfoArray through the batch text tag indico api
        indico.batchTextTags(dealInfoArray)
            .then(function(res) {
                //For reach deal, find the topic, and assign that to the deal object
                res.forEach(function(indicoObject, index) {
                    //  console.log(indicoObject);
                    var max = getMaxProb(indicoObject);
                    batch[index].topic = max.topic;
                    batch[index].topicProb = max.value;
                });
                callback();
            }).catch(function(err) {
                console.warn(err);
            });

    }

    app.post('/getSavedDeals', function(req, res) {
        var username = req.body.username;
        savedDealModel.find({
            'username': username
        }, function(err, data) {
            if (err)
                res.send(err);
            else res.send(data);
        });
    });

    function truncate(number) {
        return number > 0 ? Math.floor(number) : Math.ceil(number);
    }

    app.post('/updateUser', function(req, res) {
        var swipeMultiplier = 20;
        var deals = req.body.deals; //array of JSON deals
        var username = req.body.username;
        //Find specified User
        profileModel.find({
            'username': username
        }, function(err, data) {
            if (data[0]) {
                //For each deal from phone

                var savedDeals = {};
                savedDeals.username = username;
                savedDeals.deals = [];

                for (var index in deals) {
                    var deal = deals[index];


                    //Get variance based on the swipe, and the topic prob
                    var variance = truncate(swipeMultiplier * deal.topicProb);


                    console.log(deal.swiped);
                    if (deal.swiped == 'false') {
                        variance *= -1;
                        console.warn("left swipe!");
                    }
                    if (deal.swiped == 'true') {
                        savedDeals.deals.push(deal);
                        console.warn("right swipe!");
                    }

                    //Update the topic's relevancy
                    data[0].relevancy[deal.topic] += variance;

                    //Keep the relevancy between 0 and 100 (real quick)
                    if (data[0].relevancy[deal.topic] < 0)
                        data[0].relevancy[deal.topic] = 0;
                    if (data[0].relevancy[deal.topic] > 100)
                        data[0].relevancy[deal.topic] = 100;
                }

                //update saved deals
                savedDealModel.update({
                    'username': username
                }, savedDeals, {
                    upsert: true
                }, function(err) {
                    if (!err)
                        console.log("Successfully updated savedDeals db");
                    else
                        console.warn(cb);
                });

                //Update the user's relevancy
                profileModel.update({
                    'username': username
                }, {
                    relevancy: data[0].relevancy
                }, null, function() {
                    res.send("Successfully updated!");
                });


            } else {
                console.log("Error, user not found!");
                res.send("User not found!");
            }
        });

    });

    app.post('/deals', function(req, res) {
        var batch = []; //Create an array to inject into
        //Replace below with data from req

        //Phone must provide radius, zip, userid(the tolken), limit, 
        // username, and adventure level
        var mileradius = '20';
        var zip = '10022';
        var userid = '18381';
        var limit = '20';
        var username = req.body.username;
        var adventure = 2;

        //Adjust threshold for relevancy of coupons
        if (adventure == 3)
            threshold = 0;
        else if (adventure == 2)
            threshold = 50; //55 for testing
        else if (adventure == 1)
            threshold = 75;

        //Find the user's profile for their relevancy compare
        profileModel.find({
            'username': username
        }, function(err, data) {
            if (!data[0]) {
                var newUser = new profileModel({
                    "username": username
                });
                newUser.save(function(err) {
                    if (err) {
                        res.send(err);
                        console.log(err);
                    } else {
                        console.log("Created new user " + newUser.username);
                    }
                });
                data[0] = newUser;
            }
            var relevancy = data[0].relevancy;
            var relevantDeals = [];
            creatBatchObject(batch, mileradius, zip, userid, limit, function() { //Load coupons on req params
                injectTopicsAndProbability(batch, function() { //inject topic and probabilty
                    for (var index in batch) {
                        var deal = batch[index];

                        if (relevancy[deal.topic] >= threshold)
                            relevantDeals.push(deal);

                    }
                    res.send(relevantDeals);
                });
            });
        });
    });








}