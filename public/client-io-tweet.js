console.log('loading');
//Jquery code starts here
$('document').ready(function () {
	console.log('loaded');
	//Connecting the socket to host and port
	var socket = io.connect();
	
	//livetweets event raised at backend is handled here
	socket.on('livetweets', function (tweetN) {
		console.log(tweetN);
		var tweet = tweetN.data;
		$('#stream-container').prepend('<div class="tweet-container"><div class="tweet-img"><img src="' + tweet.userimage +'" alt="twitter profilbild"></div><div class="tweet-container-inner"><div class="tweet-name">'+ tweet.screen_name +'</div><div class="tweet-text">' +
			tweet.text + '</div><div class="retweet-text">' + tweet.retweet_text + '</div><div class="tweet-timestamp">' +
			tweet.timestamp + '</div></div><div class="tweet-checkbox ' + tweet.checkbox + '"><i class="fas fa-times"></i></div></div>');

	})
	
	socket.on('error', function (error) {
		$('.error-fied').prepend(error);
	}) 

});
//jquery code ends here