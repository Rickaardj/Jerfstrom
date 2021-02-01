const { Router } = require('express');
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
	console.log('Laddad om sida');
	TwitterStream();
	Tweet.find().sort({
			createdAt: -1
		})
		.then((result) => {
			res.render('pages/index', {
				tweets: result
			})
		})
		.catch((err) => console.log(err));
});

module.exports = router;