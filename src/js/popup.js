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

		chrome.extension.onMessage.addListener(messageHandler);
	}

	function displaySection(section) {
		$body.removeClass().addClass("show-" + section);
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
		var $nowPlaying, data, template, track;

		$nowPlaying = $("section.now-playing");
		template    = $.trim($("#tmplNowPlaying").html());
		track       = model.currentTrack || {};

		$nowPlaying.html(Mustache.render(template, track));
	}

	initialize();
}(chrome.extension.getBackgroundPage(), Mustache));
