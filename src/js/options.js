"use strict";

(function (model, $) {
	var $body = $("body");

	function attachBehaviors() {
		$body.on("click", "#authorizeBtn", function (e) {
			e.preventDefault();
			sendMessage("authButtonClicked");
		});

		$body.on("click", "#logoutLink", function (e) {
			e.preventDefault();
			sendMessage("logoutLinkClicked");
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

	function initialize() {
		attachBehaviors();
		toggleAuthState();
		populateSettingsOptions();
	}

	function messageHandler (msg) {
		switch (msg.name) {
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
			"disable_autodismiss"
		];

		for (i = 0, max = options.length; i < max; i += 1) {
			if (localStorage[options[i]] === "true") {
				$("#" + options[i]).prop("checked", false);
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
		if (model.lf_session) {
			$("#userSettings").show();
			$("#authenticate").hide();
			$("#userProfile").text(model.lf_session.name);
		} else {
			$("#userSettings").hide();
			$("#authenticate").show();
		}
	}

	initialize();

}(chrome.extension.getBackgroundPage(), jQuery));
