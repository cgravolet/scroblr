var scroblrBar = (function (model) {


	var currentsong = null,
		keepalive = null;


	function init () {
		attachBehaviors();
		resetBar();
		initializeUserForm();
		if (model.currentsong !== null) {
			updateNowPlaying(model.currentsong);
		}
	}


	function attachBehaviors () {

		$('#lastfmLoginForm').bind('submit', function (e) {
			var user = $('#lastfmLoginName').val().toLowerCase() || '';
			model.message_handler({name: 'loginFormSubmitted', message: user});
			e.preventDefault();
		});

		$('#lastfmLogoutLink').click(function (e) {
			model.message_handler({name: 'logoutLinkClicked', message: null});
			e.preventDefault();
		});

		$('#lastfmCancelAuthLink').click(function (e) {
			model.message_handler({name: 'cancelAuthLinkClicked', message: null});
			e.preventDefault();
		});

		$('#lastfmLoveTrackLink').click(function (e) {
			if ($(this).hasClass('loved')) {
				model.message_handler({name: 'unloveTrack', message: null});
			}
			else {
				model.message_handler({name: 'loveTrack', message: null});
			}
			$(this).toggleClass('loved');
			e.preventDefault();
		});

		chrome.extension.onRequest.addListener(message_handler);

	}


	function formatDuration (duration) {
		var seconds_total = duration / 1000,
			hours   = Math.floor(seconds_total / 3600),
			minutes = Math.floor((seconds_total - (hours * 3600)) / 60),
			seconds = Math.round((seconds_total - (hours * 3600)) % 60),
			formatted_hour = '';
		if (hours > 0) {
			formatted_hour = hours + ':';
			if (minutes.toString().length < 2) {
				minutes = '0' + minutes;
			}
		}
		if (seconds.toString().length < 2) {
			seconds = '0' + seconds;
		}
		return formatted_hour + minutes + ':' + seconds;
	}


	function getCurrentSong () {
		return currentsong;
	}


	function initializeUserForm (waiting) {
		$('#auth form, #auth > p').hide();
		if (waiting === true) {
			$('#lastfmWaitingAuth').show();
		}
		else if (model.lf_session === null) {
			$('#lastfmLoginForm').show();
		}
		else {
			$('#lastfmAccountDetails').show();
			$('#lastfmUsername').text(model.lf_session.name);
			if (localStorage.lf_image) {
				$('#lastfmUserimage').html('<a href="http://last.fm/user/' + model.lf_session.name + '" target="_blank"><img height="20" width="20" src="' + localStorage.lf_image + '" alt="" /></a>');
			}
			else {
				$('#lastfmUserimage').empty();
				model.user_get_info(model.lf_session.name);
			}
		}
	}


	function keepAlive () {
		window.clearTimeout(keepalive);
		keepalive = window.setTimeout(resetBar, 15000);
	}


	function message_handler (msg, sender, sendResponse) {
		switch (msg.name) {
			case "initUserForm":
				initializeUserForm(msg.message);
				break;
			case "keepAlive":
				keepAlive();
				break;
			case "nowPlaying":
				updateNowPlaying(msg.message);
				break;
			case "songInfoRetrieved":
				updateNowPlaying(msg.message);
				break;
			case "updateCurrentSong":
				updateCurrentSong(msg.message);
				break;
		}
	}


	function resetBar () {
		$('#nowPlaying').removeClass().hide().find('.artist, .album, .track').empty();
		$('#lastfmWaitingAuth').hide();
		showHostControls(false);
		updateCurrentSong({score: 50});
	}


	function showHostControls (data) {
		$('.hostdata').hide();
		if (data) {
			if (data.host) {
				$('#' + data.host).show();
			}
		}
	}


	function updateNowPlaying (data) {
		var nowPlaying = $('#nowPlaying');
		resetBar();
		currentsong = data;
		if (data.name.length && data.artist.length) {
			nowPlaying.addClass(data.host).show();
			if (data.image.length) {
				$('p.album', nowPlaying).html('<a href="' + data.url_album + '" target="_blank"><img src="' + data.image + '" alt="' + data.album + '" /></a>');
			}
			$('p.track', nowPlaying).html(data.name + ' <em>' + (data.duration > 0 ? formatDuration(data.duration) : '') + '</em>');
			$('p.artist', nowPlaying).html(data.artist);
			showHostControls(data);
			updateCurrentSong({score: data.score});
		}
	}


	function updateCurrentSong (data) {
		if (data.hasOwnProperty('duration')) {
			currentsong.duration = data.duration;
			$('#nowPlaying .track em').text(formatDuration(data.duration));
		}
		if (data.hasOwnProperty('score')) {
			$('#turntableScore').text(data.score + '%');
		}
	}


	init();


	return {
		getCurrentSong: getCurrentSong,
		initializeUserForm: initializeUserForm
	};


}(chrome.extension.getBackgroundPage()));

