//================================Routes===========================================//
var indico = require('indico.io');
indico.apiKey = "d20bdc8065f1ce9f0ae9d6d395e88a94";

module.exports = function(app) {

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