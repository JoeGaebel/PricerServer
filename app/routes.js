//================================Routes===========================================//
var indico = require('indico.io');
var unirest = require('unirest');

var batch = [];
var mileradius = '20';
var zip = '10022';
var userid = '18381';
var limit = '10';

indico.apiKey = "d20bdc8065f1ce9f0ae9d6d395e88a94";

module.exports = function(app) {

// ============================ COUPON DEALZ =======================================

	function creatBatchObject(batch, callback){
	unirest.get("https://8coupons.p.mashape.com/getdeals?key=ac56993a4bac47e69e55be1139e92da82978fbb07af8caaaf8a2ca17e169f8e044284d90947139a3cdbe307221259bb9&limit=" + limit + "&mileradius=" + mileradius +"&userid=" + userid + "&zip=" + zip + "")
	.header("X-Mashape-Key", "RN9umwpGbBmshopPwKJXzLDev6qQp1ihzVGjsnvcADyO4o8Zyb")
	.header("Accept", "application/json")
	.end(function (result) {
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

	}

    //=============================== DUMMY ===========================================

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


        // indicoObject.forEach(function(value, index) {
        //     if (value > maxObject.value) {
        //         maxObject.value = value;
        //         maxObject.index = index;
        //     }
        // });

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
                    var max = getMaxProb(indicoObject);
                    batch[index].topic = max.topic;
                    batch[index].topicProb = max.value;
                });
                callback();
            }).catch(function(err) {
                console.warn(err);
            });

    }

    //Batch should be an array of dealInfos
    var batch = [{
        dealInfo: "Iran agress to nuclear limits, but key issues are unresolved."
    }, {
        dealInfo: "We're supposed to get up to 24 inches of snow in the storm."
    }];

    injectTopicsAndProbability(batch, function(cb) {
        console.log(batch);
    });

    //use this to check the current user
    app.get('/DUMMY', function(req, res) {
        res.send(currentUser);
    });
}