var scroblrBar = (function (model) {

	var currentTrack, keepalive;

	currentTrack = null;
	keepalive    = null;

	function initialize () {
		attachBehaviors();
		resetBar();
		initializeUserForm();

		if (model.currentTrack) {
			updateNowPlaying(model.currentTrack);
		}
	}

	function attachBehaviors () {
		$("#lastfmLoginForm").bind("submit", function (e) {
			var user = $("#lastfmLoginName").val().toLowerCase();
			e.preventDefault();
			model.messageHandler({name: "loginFormSubmitted", message: user});
		});

		$("#lastfmLogoutLink").click(function (e) {
			e.preventDefault();
			model.messageHandler({name: "logoutLinkClicked"});
		});

		$("#lastfmCancelAuthLink").click(function (e) {
			e.preventDefault();
			model.messageHandler({name: "cancelAuthLinkClicked"});
		});

		$("#lastfmLoveTrackLink").click(function (e) {
			e.preventDefault();
			if ($(this).hasClass("loved")) {
				model.messageHandler({name: "unloveTrack"});
			} else {
				model.messageHandler({name: "loveTrack"});
			}

			$(this).toggleClass("loved");
		});

		chrome.extension.onRequest.addListener(messageHandler);
	}

	function formatDuration (duration) {
		var seconds_total = duration / 1000,
				hours   = Math.floor(seconds_total / 3600),
				minutes = Math.floor((seconds_total - (hours * 3600)) / 60),
				seconds = Math.round((seconds_total - (hours * 3600)) % 60),
				formatted_hour = "";

		if (hours > 0) {
			formatted_hour = hours + ":";

			if (minutes.toString().length < 2) {
				minutes = "0" + minutes;
			}
		}

		if (seconds.toString().length < 2) {
			seconds = "0" + seconds;
		}

		return formatted_hour + minutes + ":" + seconds;
	}

	function initializeUserForm (waiting) {
		var userImage, userLink;

		$("#auth form, #auth > p").hide();

		if (waiting) {
			$("#lastfmWaitingAuth").show();
		} else if (!model.lf_session) {
			$("#lastfmLoginForm").show();
		} else {
			$("#lastfmAccountDetails").show();
			$("#lastfmUsername").text(model.lf_session.name);

			if (localStorage.lf_image) {
				userImage = '<img height="20" width="20" src="' + localStorage.lf_image + '" alt="" />';
				userLink = '<a href="http://last.fm/user/' + model.lf_session.name + '" target="_blank">' + userImage + '</a>';
				$("#lastfmUserimage").html(userLink);
			} else {
				$("#lastfmUserimage").empty();
				model.getUserInfo(model.lf_session.name);
			}
		}
	}

	function keepAlive () {
		window.clearTimeout(keepalive);
		keepalive = window.setTimeout(resetBar, 15000);
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
		case "updateCurrentTrack":
			updateCurrentTrack(msg.message);
			break;
		}
	}

	function resetBar () {
		$("#nowPlaying").removeClass().hide().find(".artist, .album, .track").empty();
		$("#lastfmWaitingAuth").hide();
		showHostControls(false);
		updateCurrentTrack({score: 50});
	}

	function showHostControls (data) {
		$(".hostdata").hide();

		if (data && data.host) {
			$("#" + data.host).show();
		}
	}

	function updateNowPlaying (data) {
		var albumLink, duration, imageTag, nowPlaying;

		currentTrack = data;
		nowPlaying   = $("#nowPlaying");

		resetBar();

		if (data.title && data.artist) {
			nowPlaying.addClass(data.host).show();

			if (data.image) {
				imageTag = '<img src="' + data.image + '" alt="' + data.album + '" />';
				albumLink = '<a href="' + data.url_album + '" target="_blank">' + imageTag + '</a>';
				$("p.album", nowPlaying).html(albumLink);
			}

			duration = (data.duration > 0 ? formatDuration(data.duration) : "");
			$("p.track", nowPlaying).html(data.title + ' <em>' + duration + '</em>');
			$("p.artist", nowPlaying).html(data.artist);
			showHostControls(data);
			updateCurrentTrack({score: data.score});
		}
	}

	function updateCurrentTrack (data) {
		if (data.hasOwnProperty("duration")) {
			currentTrack.duration = data.duration;
			$("#nowPlaying .track em").text(formatDuration(data.duration));
		}

		if (data.hasOwnProperty("score")) {
			$("#turntableScore").text(data.score + "%");
		}
	}

	initialize();

	return {
		initializeUserForm: initializeUserForm
	};
}(chrome.extension.getBackgroundPage()));
