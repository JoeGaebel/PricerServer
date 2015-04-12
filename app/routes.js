//================================Routes===========================================//
var indico = require('indico.io');
var unirest = require('unirest');

indico.apiKey = "d20bdc8065f1ce9f0ae9d6d395e88a94";

module.exports = function(app) {

    // ============================ COUPON DEALZ =======================================

    function creatBatchObject(batch, callback) {
        unirest.get("https://8coupons.p.mashape.com/getdeals?key=ac56993a4bac47e69e55be1139e92da82978fbb07af8caaaf8a2ca17e169f8e044284d90947139a3cdbe307221259bb9&limit=" + limit + "&mileradius=" + mileradius + "&userid=" + userid + "&zip=" + zip + "")
            .header("X-Mashape-Key", "RN9umwpGbBmshopPwKJXzLDev6qQp1ihzVGjsnvcADyO4o8Zyb")
            .header("Accept", "application/json")
            .end(function(result) {

                for (var i = 0; i < result.body.length; i++) {
                    console.log(result.body[i]);
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
        for (var deal in batch)
            dealInfoArray.push(batch[deal].dealInfo);
        //Run dealInfoArray through the batch text tag indico api
        indico.batchTextTags(dealInfoArray)
            .then(function(res) {
                //For reach deal, find the topic, and assign that to the deal object
                res.forEach(function(indicoObject, index) {
                    console.log(indicoObject);
                    var max = getMaxProb(indicoObject);
                    batch[index].topic = max.topic;
                    batch[index].topicProb = max.value;
                });
                callback();
            }).catch(function(err) {
                console.warn(err);
            });

    }



    app.post('/updateUser', function(req, res) {
        var username = req.body.username;
        console.log(username);
        profileModel.find({
            'username': username
        }, function(err, data) {
            if (data[0]) {
                res.send("User Exists!");
                console.log("User exists!");
            } else {
                var newUser = new profileModel({
                    "username": username
                });
                newUser.save(function(err) {
                    if (err) {
                        res.send(err);
                        console.log(err);
                    } else {
                        res.send("Saved " + newUser);
                        console.log("Saved " + newUser);
                    }
                });
            }
        });

    });

    app.get('/deals', function(req, res) {
        var batch = []; //Create an array to inject into
        //Replace below with data from req
        var mileradius = '20';
        var zip = '10022';
        var userid = '18381';
        var limit = '10';




        creatBatchObject(batch, function() { //Load coupons on req params
            injectTopicsAndProbability(batch, function() { //inject topic and probabilty
                console.log(batch);
                res.send(batch); //Send to the phone
            });
        });

    });




    /////////////////////////////////TESTING///////////////////////////
    var batch = []; //Create an array to inject into

    //Replace below with data from req
    var mileradius = '20';
    var zip = '10022';
    var userid = '18381';
    var limit = '10';


    // creatBatchObject(batch, function() { //Load coupons on req params
    //     injectTopicsAndProbability(batch, function() { //inject topic and probabilty
    //         console.log(batch);
    //     });
    // });






}