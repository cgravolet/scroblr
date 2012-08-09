var scroblrBar = (function (model) {


	var currentsong = null,
		keepalive = null;


	function init () {
		attachBehaviors();
		resetBar();
		initializeUserForm();
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

		safari.self.browserWindow.addEventListener('message', messageHandler, false);

	}


	function initializeUserForm (waiting) {
		$('footer > *').hide();
		if (waiting) {
			$('#lastfmWaitingAuth').show();
		}
		else if (model.lf_session === null) {
			$('#lastfmLoginForm').show();
		}
		else {
			$('#lastfmAccountDetails').show();
			$('#lastfmUsername').text(model.lf_session.name);
			if (localStorage.lf_image) {
				$('#lastfmUserimage').html('<img height="20" width="20" src="' + localStorage.lf_image + '" alt="" />');
			}
			else {
				$('#lastfmUserimage').empty();
				model.user_get_info(model.lf_session.name);
			}
		}
	}


	function keepAlive () {
		window.clearTimeout(keepalive);
		keepalive = window.setTimeout(resetBar, 20000);
	}


	function messageHandler (msg) {
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
		$('#welcome').show();
		$('#nowPlaying').empty().removeClass().hide();
		$('#lastfmWaitingAuth').hide();
		showHostControls(false);
		updateCurrentSong({score: 50});
	}


	function showHostControls (data) {
		$('#hostControls > p').hide();
		if (data) {
			$('#hostControls p.loveTrack').show();
			if (data.loved) {
				$('#hostControls p.loveTrack').addClass('loved');
			}
			if (data.host) {
				$('#hostControls p.' + data.host).show();
			}
		}
	}


	function updateNowPlaying (data) {
		var nowPlaying = $('#nowPlaying');
		resetBar();
		currentsong = data;
		if (data.name.length && data.artist.length) {
			nowPlaying.addClass(data.host).show();
			nowPlaying.html('<strong>Now playing:</strong> ' + data.artist + ' <em>-</em> ' + data.name);
			$('#welcome').hide();
			showHostControls(data);
			updateCurrentSong({score: data.score});
		}
	}


	function updateCurrentSong (data) {
		if (data.hasOwnProperty('duration')) {
			currentsong.duration = data.duration;
		}
		if (data.hasOwnProperty('score')) {
			$('#turntableScore').html('<strong>Room vote:</strong> ' + data.score + '%');
		}
	}


	init();


	return {
		messageHandler: messageHandler
	};


}(safari.extension.globalPage.contentWindow));

