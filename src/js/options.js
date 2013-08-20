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
		populateServiceOptions();
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

	function populateServiceOptions() {
		var services = [
			{id: "eighttracks" , name: "8tracks"},
			{id: "accujazz" , name: "Accujazz"},
			{id: "accuradio" , name: "Accuradio"},
			{id: "bandcamp" , name: "Bandcamp"},
			{id: "google" , name: "Google"},
			{id: "indieshuffle" , name: "Indieshuffle"},
			{id: "jango" , name: "Jango"},
			{id: "pandora" , name: "Pandora"},
			{id: "piki" , name: "Piki"},
			{id: "playerfm" , name: "Playerfm"},
			{id: "plugdj" , name: "Plugdj"},
			{id: "rhapsody" , name: "Rhapsody"},
			{id: "songza" , name: "Songza"},
			{id: "soundcloud" , name: "Soundcloud"},
			{id: "turntable" , name: "Turntable"},
			{id: "youtube" , name: "Youtube"},
		];

		for (var i = 0; i < services.length; i++) {
			var checked = getOptionStatus(services[i].id) ? 'checked': '';
			$('.service-options').append("<input type='checkbox' id='disable_"+services[i].id+"' "+checked+" /> <label for='disable_"+services[i].id+"'>Enable "+services[i].name+"</label><br>");
		}
	}

	function populateSettingsOptions() {
		var i, max, options;

		options = [
			"disable_scrobbling",
			"disable_notifications",
			"disable_autodismiss",
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
