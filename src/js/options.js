(function (model, $) {
	"use strict";

	var $body = $("body");

	function getOptionStatus(option) {
		return !localStorage["disable_" + option];
	}

	function attachBehaviors() {
		$body.on("click", "#authorizeBtn", function (e) {
			e.preventDefault();
			sendMessage("authButtonClicked");
		});

		$body.on("click", "#logoutLink", function (e) {
			e.preventDefault();
			sendMessage("logoutLinkClicked");
		});

		$(".container input").on("change", function (e) {
			changeSettingsOption.call(this, e);
		});

		chrome.extension.onMessage.addListener(messageHandler);
	}

	function changeSettingsOption(e) {
		/*jshint validthis:true */
		var id = $(this).attr("id");

		if (this.checked) {
			localStorage.removeItem(id);
		} else {
			localStorage[id] = "true";
		}

		sendMessage("localSettingsChanged");
	}

	function initialize() {
		attachBehaviors();
		toggleAuthState();
		populateSettingsOptions();
	}

	function messageHandler (msg) {
		switch (msg.name) {
		case "localSettingsChanged":
			populateSettingsOptions();
			break;
		case "userLoggedOut":
		case "userSessionRetrieved":
			toggleAuthState();
			break;
		}
	}

	function populateSettingsOptions() {
		var i, max, options;

		options = [
			"disable_scrobbling",
			"disable_notifications",
			"disable_autodismiss",
			"disable_eighttracks",
			"disable_accujazz",
			"disable_accuradio",
			"disable_bandcamp",
			"disable_google",
			"disable_indieshuffle",
			"disable_jango",
			"disable_pandora",
			"disable_playerfm",
			"disable_plugdj",
			"disable_rhapsody",
			"disable_songza",
			"disable_soundcloud",
			"disable_youtube"
		];

		for (i = 0, max = options.length; i < max; i += 1) {
			if (localStorage[options[i]] === "true") {
				$("#" + options[i]).prop("checked", false);
			} else {
				$("#" + options[i]).prop("checked", true);
			}
		}
	}

	function sendMessage(name, message) {
		model.messageHandler({
			name: name,
			message: message
		});
	}

	function toggleAuthState() {
		var session = model.getSession();

		if (session) {
			$("#userSettings").show();
			$("#authenticate").hide();
			$("#userProfile").text(session.name);
		} else {
			$("#userSettings").hide();
			$("#authenticate").show();
		}
	}

	initialize();

}(chrome.extension.getBackgroundPage().scroblrGlobal, jQuery));
