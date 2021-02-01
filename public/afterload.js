$('document').ready(function () {
	console.log('Afterload.js init');
	jQuery('.tweet-checkbox').click(function (event) {
		jQuery(this).toggleClass('false true');
	});
});