const mongoose = require('mongoose');
const Tweet = mongoose.model('Tweet')
const helpers = require('../helpers');

const fetchTweets = function () {
	return Tweet.find({})
		.then((tweets) => {
			return tweets
		})
		.catch((err) => console.log('Fetching tweets failed: ', err))
}

const recordTweet = function ({
	id_str,
	text,
	user,
	extended_tweet
}) {
	var tweet_timestamp = "";
	var tweet_name = "";
	var tweet_text = "";
	var retweet_text = "";
	var tweet_img = "";
	// const tweet = new Tweet({
	// 	id_str: id_str,
	// 	status: text,
	// 	author: user.name,
	// 	created_at: helpers.getTime(created_at)
	// })
	tweet_timestamp = tweet.created_at;
	tweet_name = tweet.user.screen_name;
	if (!tweet.retweeted_status == undefined) {
		if (!tweet.retweeted_status.extended_tweet == undefined) {
			retweet_text = tweet.retweeted_status.extended_tweet.full_text;
			tweet_text = retweet_text;
		}
	}
	if (tweet.extended_tweet == undefined) {
		tweet_text = tweet.text;
	} else {
		tweet_text = tweet.extended_tweet.full_text;
	}
	tweet_img = tweet.user.profile_image_url_https;
	// console.log('Nu kom de en tweet från '+ tweet_name);
	const tweetN = new Tweet({
		screen_name: tweet_name,
		userimage: tweet_img,
		text: tweet_text,
		timestamp: tweet_timestamp,
		checkbox: false,
		retweet_text: retweet_text
	});

	tweetN.save()
		.then((tweet) => console.log('Tweet recorded: ', tweet))
		.catch((err) => console.log('Tweet recording failed: ', err))
}

module.exports.recordUniqueTweets = function (tweets) {
	tweets.forEach((tweet) => {
		recordTweet(tweet)
	})
}

module.exports.getUniqueTweets = function (latestTweets) {
	return fetchTweets()
		.then((recordedTweets) => {
			
			return latestTweets.filter((newTweet) => recordedTweets.find((recorderTweet) => recorderTweet.id_str === newTweet.id_str) === undefined)
		})
}