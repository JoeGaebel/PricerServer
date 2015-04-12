dealSchema = new db.Schema({
    username: String,
    deals: [{
        URL: String,
        name: String,
        address: String,
        address2: String,
        phone: String,
        dealTitle: String,
        dealInfo: String,
        expirationDate: String,
        showImageStandardBig: String,
        showImageStandardSmall: String,
        distance: Number,
        topic: String,
        topicProb: Number
    }]
});