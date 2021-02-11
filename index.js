const express = require('express')
require('dotenv').config();
//Initialize the express App
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');
const Tweet = require('./models/tweets');
var io = require('socket.io')(server);

//Twitter
var Twitter = require('twit');
var request = require("request");
const { assert } = require('console');

//connection to mongodb
const dbURI = process.env.DB_CONNECTION;
const conn = mongoose.connection;

mongoose.connect(dbURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then((result) => server.listen(PORT, TwitterStream()))
	.catch((err) => console.log(err));

require('./db/db')

app.get('/', (req, res) => {
	// console.log('Laddar sida');
	Tweet.find().sort({
			createdAt: -1 //createdAt -1 gör att den visar de senaste tweetsen i databasen först
		}).limit(20) //.limit(20) efter gör att den visar max 20 tweets på startsidan
		.then((result) => {
			res.render('pages/home', {
				tweets: result
			})

		})
		.catch((err) => console.log(err));
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

function TwitterStream(params) {
	var client = new Twitter({
		consumer_key: process.env.TWITTER_CONSUMER_KEY,
		consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
		access_token: process.env.TWITTER_ACCESS_TOKEN,
		access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
		// bearer_token: process.env.TWITTER_BEARER_TOKEN
	});

	var usersAttFolja = '1158572066,761052883076861952,716344220,1146869628959952901,754729466';
	var stream = client.stream('statuses/filter', {
		follow: usersAttFolja
	})

	console.log('*****    Waiting for tweets    *****');

	var tweet_timestamp = "";
	var tweet_name = "";
	var tweet_text = "";
	var retweet_text = "";
	var tweet_img = "";
	var id_string = "";

	var sparad = 0;

	io.on('connection', function (socket) {

		stream.on('tweet', function (tweet) { //tweet är JSON objektet som v hämtar med API't
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
			id_string = tweet.id_str;
			// console.log('Nu kom de en tweet från '+ tweet_name);
			const tweetN = new Tweet({
				id_str: id_string,
				screen_name: tweet_name,
				userimage: tweet_img,
				text: tweet_text,
				timestamp: tweet_timestamp,
				checkbox: false,
				retweet_text: retweet_text
			});
			console.log(sparad);
			if (sparad == 0) {

				tweetN.save(function (err) {
					if (err) return console.log(err);
					sparad = 1;
				  });
				
			} else {

				sparad = 0;
			}
			socket.emit('livetweets', {
				data: tweetN
			})
		});
		stream.on('error', function (error) {
			socket.emit('error', {
				data: error
			})
			console.log(error);
		});
	});
}

app.post('/tweet-updatecheckbox/:id/:status', (req, res) => {
	const id = req.params.id;
	const status = req.params.status;
	console.log(id, status);
	Tweet.findByIdAndUpdate(id,{checkbox:status})
		.then(result => {
			res.json({ redirect: '/'});
		})
		.catch(err => console.log(err));

});

app.delete('/tweet-tabort/:id', (req, res) => {
	const id = req.params.id;
	console.log(id);
	Tweet.findByIdAndDelete(id)
		.then(result => {
			res.json({ redirect: '/'});
		})
		.catch(err => console.log(err));

});

// app.post('/search', function (req, res, next) {
// 	T.get('search/tweets', {
// 		q: '#coding',
// 		count: 2
// 	}, function (err, data, response) {
// 		return res.json({
// 			tweetdata: data
// 		});
// 	});
// });