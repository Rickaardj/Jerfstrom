const mongoose = require('mongoose');
const schema = mongoose.Schema;

const tweetSchema = new schema({
	id_str: {
		type: String,
		required: false,
		unique: [true, "får bara finnas en tweet med samma id"],
		sparse: true
	},
	screen_name: {
		type: String,
		required: true
	},
	userimage: {
		type: String,
		required: false
	},
	text: {
		type: String,
		required: true
	},
	timestamp: {
		type: String,
		required: true
	},
	checkbox: {
		type: String,
		required: false
	},
	retweet_text: {
		type: String,
		require: false
	}

}, { timestamps: true});

const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;



// 'userScreenName': tweet.user.screen_name,
// 'text': tweet.text,
// 'userImage': tweet.user.profile_image_url_https,
// tweet_timestamp = tweet.created_at;
