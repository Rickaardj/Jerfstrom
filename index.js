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

//connection to mongodb
const dbURI = process.env.DB_CONNECTION;
const conn = mongoose.connection;

mongoose.connect(dbURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then((result) => server.listen(PORT, TwitterStream() , console.log('starting database'), console.log(' ')))
	.catch((err) => console.log(err));


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

	var deandra = '761052883076861952,716344220,1146869628959952901';
	var usersAttFolja = '1158572066';
	var stream = client.stream('statuses/filter', {
		follow: usersAttFolja
	})

	console.log('*****    Waiting for tweets    *****');

	var tweet_timestamp = "";
	var tweet_name = "";
	var tweet_text = "";
	var retweet_text = "";
	var tweet_img = "";

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
			// console.log('Nu kom de en tweet från '+ tweet_name);
			const tweetN = new Tweet({
				screen_name: tweet_name,
				userimage: tweet_img,
				text: tweet_text,
				timestamp: tweet_timestamp,
				checkbox: false,
				retweet_text: retweet_text
			});


			socket.emit('livetweets', {
				data: tweetN
			})

			// TODO: KOLL EMOT DATABSEN ANNARS FUNKAR FAN INTE SKITEN SOM DEN SKA.
			
			// 	.then(() => {
			// 		console.log('databasen koppling stängd');
			// 		return conn.close();
			// 	});

			// Tweet.findOne({ text: tweetN.tweet_text, screen_name: tweetN.tweet_name }).select("text").lean().then(result => {
			// 	if (result) {
					
			// 	}
			// });
			console.log(tweetN);

			console.log(sparad);
			if (sparad == 0) {
				console.log(sparad+ 'i ifsats');
				tweetN.save()
				sparad = 1;
			}else{
				console.log(sparad+ 'elsen');
				sparad = 0;
			}

			// Tweet.find({screen_name: tweet_name,text: tweet_text, timestamp: tweet_timestamp}).count(function (err, count){ 
			// 	if(count>0){
			// 		//document exists });
			// 	}else{
			// 		tweetN.save()
			// 	}
			// }); 

			console.log('mordin');

		});


		

		stream.on('error', function (error) {
			socket.emit('error', {
				data: error
			})
			console.log(error);
		});
	});
}



// io.on('connection', function (socket) {

// 	socket.emit('welcome', { data: 'welcome' });
// 	socket.on('keyword' , function(data){
// 		console.log(data);
// 		var keyword = data.keyword;
// 		var stream = client.stream('statuses/filter', {track: keyword});
// 		stream.on('data', function(event) {

// 							socket.emit('livetweets' , { data : content })
// 							console.log('tweet');
// 				// 	}
// 				// });
// 				//releasing connection
// 				// socket.on('stop' , function(data){
// 				// 	connection.release();
// 				// });

// 			// });

// 		});

// 		stream.on('error', function(error) {
// 			throw error;
// 		});	  
// 	});
// });


//Nyast
// io.on('connect', function (socket) {

// 	var stream = T.stream('statuses/filter', {
// 		follow: usersAttFolja
// 	})
// 	console.log('----Stream began-----');
// 	stream.on('tweetData', function (tweetData) {
// 		console.log(tweetData);
// 		io.emit('tweetData', tweetdata);
// 	})
// });

// io.on('tweetData', function (tweetData) {
// 	console.log('fick in en tweet');
// 	tweet_timestamp = tweetData.created_at;
// 	tweet_name = tweetData.user.screen_name;
// 	if (!tweetData.retweeted_status == undefined) {
// 		if (!tweetData.retweeted_status.extended_tweet == undefined) {
// 			retweet_text = tweetData.retweeted_status.extended_tweet.full_text;
// 			tweet_text = retweet_text;
// 		}
// 	}
// 	if (tweetData.extended_tweet == undefined) {
// 		tweet_text = tweetData.text;
// 	} else {
// 		tweet_text = tweetData.extended_tweet.full_text;
// 	}
// 	if (!tweetData.user.profile_image_url_https == undefined) {
// 		tweet_img = tweetData.tweet.user.profile_image_url_https;
// 	}

// 	const tweet = new Tweet({
// 		screen_name: tweet_name,
// 		userimage: tweet_img,
// 		text: tweet_text,
// 		timestamp: tweet_timestamp,
// 		checkbox: false,
// 		retweet_text: retweet_text
// 	});
// 	console.log(tweet);
// 	console.log(tweetData);
// });


/******** TEST AV DATABAS ************/
// app.get('/tweets', (req, res) => {
// 	const tweet = new Tweet({
// 		screen_name: 'Rickaart',
// 		userimage: 'https://pbs.twimg.com/profile_images/1251865369943453696/afP0eAzn_400x400.jpg',
// 		text: 'Tweet nummer 2 som nu är stored på databasen',
// 		timestamp: '21-01-24 15:03 exempel',
// 		checkbox: false,
// 		retweet_text: ''
// 	});

// 	tweet.save()
// 		.then((result) => {
// 			res.send(result)
// 		})
// 		.catch((err) => console.log(err));
// })

// app.get('/get-tweets', (req, res) => {
// 	Tweet.find()
// 		.then((result) => {
// 			res.send(result)
// 		})
// 		.catch((err) => console.log(err));
// });
/****************************************/


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