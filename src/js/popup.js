var scroblrView = (function (model, Mustache) {
	var $body = $("body");

	function attachBehaviors () {
		$body.on("click", "#authorizeBtn", function (e) {
			e.preventDefault();
			model.messageHandler({
				name: "authButtonClicked"
			});
		});

		$body.on("click", ".goto-section", function (e) {
			e.preventDefault();
			displaySection($(this).attr("href").slice(1));
		});

		$body.on("click", ".goto-link", function (e) {
			e.preventDefault();
			openNewTab($(this).attr("href"));
		});

		$body.on("click", "#doNotScrobbleBtn", function (e) {
			e.preventDefault();
			model.messageHandler({
				name: "doNotScrobbleButtonClicked"
			});
		});

		$body.on("click", "#loveTrackBtn", function (e) {
			e.preventDefault();
			model.messageHandler({
				name: "loveTrackButtonClicked"
			});
		});

		chrome.extension.onMessage.addListener(messageHandler);
	}

	function displaySection(section) {
		$body.removeClass().addClass("show-" + section);
	}

	function doNotScrobbleTrack() {
		if (model.currentTrack.dontscrobble) {
			model.currentTrack.dontscrobble = false;
		} else {
			model.currentTrack.dontscrobble = true;
		}
		renderNowPlaying();
	}

	function initialize() {
		attachBehaviors();

		if (!model.lf_session) {
			$body.addClass("show-authenticate");
		} else {
			renderNowPlaying();
			$body.addClass("show-now-playing");
		}
	}

	function messageHandler (msg) {
		switch (msg.name) {
		case "keepAliveExpired": // intentional fall-through
		case "trackLoved":
		case "trackNoScrobbleSet":
		case "songInfoRetrieved":
			window.setTimeout(function () {
				renderNowPlaying();
			}, 500);
			break;
		case "updateCurrentTrack":
			if (msg.message.hasOwnProperty("score")) {
				window.setTimeout(function () {
					renderNowPlaying();
				}, 500);
			}
			break;
		}
		console.log(msg.name, msg.message);
	}

	function openNewTab(url) {
		var newTab;

		if (typeof chrome != "undefined") {
			chrome.tabs.create({url: url});
		} else if (typeof safari != "undefined") {
			newTab = safari.application.activeBrowserWindow.openTab();
			newTab.url = url;
		}
	}

	function renderNowPlaying() {
		var $nowPlaying, template;

		$nowPlaying = $("section.now-playing");
		template    = $.trim($("#tmplNowPlaying").html());

		if (model.currentTrack.hasOwnProperty("score")) {
			if (model.currentTrack.score <= 50) {
				model.currentTrack.badscore = true;
			} else {
				model.currentTrack.badscore = false;
			}
		}

		$nowPlaying.html(Mustache.render(template, model.currentTrack));
	}

	initialize();
}(chrome.extension.getBackgroundPage(), Mustache));
