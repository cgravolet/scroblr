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
		$("#loginForm").on("submit", function (e) {
			e.preventDefault();
			model.messageHandler({
				name: "loginFormSubmitted",
				message: $("#userNameInput").val().toLowerCase()
			});
		});

		$("#logoutLink").on("click", function (e) {
			e.preventDefault();
			model.messageHandler({name: "logoutLinkClicked"});
		});

		$("#cancelAuthLink").on("click", function (e) {
			e.preventDefault();
			model.messageHandler({name: "cancelAuthLinkClicked"});
		});

		$("#loveTrackLink").on("click", function (e) {
			e.preventDefault();
			if ($(this).hasClass("loved")) {
				model.messageHandler({name: "unloveTrack"});
			} else {
				model.messageHandler({name: "loveTrack"});
			}

			$(this).toggleClass("loved");
		});

		$(".navigation").on("click", "a", function (e) {
			e.preventDefault();
			handleNavigationClick.call(this, e);
		});

		chrome.extension.onMessage.addListener(messageHandler);
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

	function handleNavigationClick(e) {
		var $parent, $target;

		$target = $(this);
		$parent = $target.parent();

		$(".navigation li").removeClass("is-selected");
		$("section").removeClass();
		$parent.addClass("is-selected");
		$($target.attr("href")).addClass("is-active");
	}

	function initializeUserForm (waiting) {
		var $authForm, $userImage, $userName, userImage, userLink;

		$authForm  = $(".auth-form").removeClass("is-authorized is-authorizing");
		$userImage = $("#userImage").empty();
		$userName  = $("#userName").empty()

		if (waiting) {
			$authForm.addClass("is-authorizing");
		} else if (model.lf_session) {
			$authForm.addClass("is-authorized");
			$userName.text(model.lf_session.name);

			if (localStorage.lf_image) {
				userImage = '<img height="20" width="20" src="' + localStorage.lf_image +
						'" alt="" />';
				userLink = '<a href="http://last.fm/user/' + model.lf_session.name +
						'" target="_blank">' + userImage + '</a>';
				$userImage.html(userLink);
			} else {
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
		$(".now-playing p, .album-art").empty();
		$(".score").empty().show();
		$(document.body).removeClass();
		$("#lastfmWaitingAuth").hide();
	}

	function updateNowPlaying (data) {
		var album, artist, duration, imageTag, nowPlaying, track;

		currentTrack = data;
		nowPlaying   = $(".now-playing");

		resetBar();

		if (data.title && data.artist) {
			$(document.body).addClass(data.host).addClass("is-listening");

			if (data.image && data.image.indexOf("default_album") < 0) {
				$(".album-art").html("<img src=\"" + data.image + "\" />");
			}

			album = data.url_album ? "<a href=\"" + data.url_album +
					"\" target=\"_blank\" title=\"" + data.album + "\">" + data.album + 
					"</a>" : data.album;
			artist = data.url_artist ? "<a href=\"" + data.url_artist +
					"\" target=\"_blank\" title=\"" + data.artist + "\">" + data.artist +
					"</a>" : data.artist;
			track = data.url ? "<a href=\"" + data.url +
					"\" target=\"_blank\" title=\"" + data.title + "\">" +
					data.title + "</a>" : data.title;

			duration = (data.duration > 0 ? formatDuration(data.duration) : "");
			$(".track", nowPlaying).html(track);
			$(".artist", nowPlaying).html(artist);
			$(".album", nowPlaying).html(album);
			updateCurrentTrack({score: data.score});
		} else {
			$(document.body).removeClass("is-listening");
		}
	}

	function updateCurrentTrack (data) {
		var $score = $(".score");

		if (data.score) {
			$score.removeClass("is-bad is-good");
			$score.html("Room score: " + data.score + "%").show();

			if (data.score < 50) {
				$score.addClass("is-bad");
			} else {
				$score.addClass("is-good");
			}
		}
	}

	initialize();

	return {
		initializeUserForm: initializeUserForm
	};
}(chrome.extension.getBackgroundPage()));
