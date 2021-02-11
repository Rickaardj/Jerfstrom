$('document').ready(function () {
	console.log('Afterload.js init');
	jQuery('.trashcan .usure').click(function (event) {
		jQuery(this).closest('.trashcan').toggleClass('mask');
	});

	

	jQuery('a.trashcan .trashcanicon').click(function (event) {
		var trashcan = jQuery(this).closest('a.trashcan').attr('tweet_id');
		const endpoint = '/tweet-tabort/'+trashcan;
		console.log(endpoint);
		fetch(endpoint, {
				method: 'DELETE'
			})
			.then((response) => response.json())
			.then((data) => console.log(data))
			.catch(err => console.log(err))
		jQuery(this).closest('.tweet-container').remove();
	});

	jQuery('.tweet-checkbox').click(function (event) {
		jQuery(this).toggleClass('false true');
		var checkbox = jQuery(this);
		var checkbox_status = "";
		if (jQuery(this).hasClass(true)) {
			checkbox.attr('checkbox_status','true');
			checkbox_status = jQuery(this).attr('checkbox_status');
		}
		else{
			checkbox.attr('checkbox_status','false');
			checkbox_status = jQuery(this).attr('checkbox_status');
		}
		var tweet_id = jQuery(this).attr('checkbox_id');
		
		const endpoint = '/tweet-updatecheckbox/'+tweet_id+'/'+checkbox_status;
		fetch(endpoint, {
			method: 'POST'
		})
		.then((response) => response.json())
		.then((data) => console.log(data))
		.catch(err => console.log(err))
		console.log(endpoint);
		
	});

});