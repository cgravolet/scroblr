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

		$body.on("click", "#logoutLink", function (e) {
			e.preventDefault();
			model.messageHandler({
				name: "logoutLinkClicked"
			});
		});

		$(".settings-options input").on("change", function (e) {
			changeSettingsOption.call(this, e);
		});

		chrome.extension.onMessage.addListener(messageHandler);
	}

	function changeSettingsOption(e) {
		var id = $(this).attr("id");

		if (this.checked) {
			localStorage.removeItem(id);
		} else {
			localStorage[id] = "true";
		}
	}

	function displaySection(section) {
		$body.removeClass().addClass("show-" + section);
	}

	function initialize() {
		attachBehaviors();
		populateSettingsOptions();
		showStartScreen();
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
		case "userLoggedOut":
			showStartScreen();
			break;
		}
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

	function populateSettingsOptions() {
		var i, max, options;

		options = [
			"disable_scrobbling",
			"disable_notifications",
			"disable_autodismiss"
		];

		for (i = 0, max = options.length; i < max; i += 1) {
			if (localStorage[options[i]] === "true") {
				$("#" + options[i]).prop("checked", false);
			}
		}

		$("#userProfile").text(model.lf_session.name).attr("href",
				"http://last.fm/user/" + model.lf_session.name);
	}

	function renderNowPlaying() {
		var $nowPlaying, template;

		$nowPlaying = $("section.now-playing");
		template    = $.trim($("#tmplNowPlaying").html());

		if (model.currentTrack && model.currentTrack.hasOwnProperty("score")) {
			if (model.currentTrack.score <= 50) {
				model.currentTrack.badscore = true;
			} else {
				model.currentTrack.badscore = false;
			}
		}

		$nowPlaying.html(Mustache.render(template, model.currentTrack));
	}

	function showStartScreen() {
		$body.removeClass();

		if (!model.lf_session) {
			$body.addClass("show-authenticate");
		} else {
			renderNowPlaying();
			$body.addClass("show-now-playing");
		}
	}

	initialize();
}(chrome.extension.getBackgroundPage(), Mustache));
