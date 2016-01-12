"use strict";

var conf          = require("../conf.json");
var notifications = require("sdk/notifications");
var panel         = require("sdk/panel");
var tabs          = require("sdk/tabs");

var workers = []; // used for passing messages
var button;
var popup;

function initialize() {
	enableLoggingInDebugMode();
	attachBackgroundPage();
	attachToolbarButton();
	attachContentScript();
}

function enableLoggingInDebugMode() {
	var pkg = require('../../../package.json');
	var preferences = require("sdk/preferences/service");

	var logLevelKey = "extensions." + pkg.id + ".sdk.console.logLevel";

	if (conf.DEBUG) {
		preferences.set(logLevelKey, "info");
	} else {
		preferences.reset(logLevelKey);
	}
}

function attachBackgroundPage() {
	var backgroundPage = panel.Panel({
		contentURL: "./background.html",
		contentScriptFile: "./js/bundle-background.js"
	});
	attachWorker(backgroundPage);	
}

function attachToolbarButton() {
	var buttons = require('sdk/ui/button/toggle');
	popup = createPopup();
	button = buttons.ToggleButton({
		id: "Scroblr",
		label: "Scroblr",
		icon: {
			"18": "./img/scroblr24.png",
			"32": "./img/scroblr48.png",
			"36": "./img/scroblr48.png",
			"64": "./img/scroblr64.png"
		},
		onChange: function (state) {
			if (state.checked) {
				popup.postMessage({name: 'popover', message: null});
				popup.show({
					position: button
				});
			} else {
				popup.hide();
			}
		}
	});
}

function attachContentScript() {
	var pageMod = require("sdk/page-mod");
	var includes = getIncludeUrls();

	pageMod.PageMod({
		include: includes,
		contentScriptFile: "./js/bundle-content-script.js",
		attachTo: ["top", "frame"],
		onAttach: function(worker) {
			attachWorker(worker);
			worker.on('detach', function () {
				detachWorker(worker);
			});
		}
	});
}

function createPopup() {
	var popup = panel.Panel({
		contentURL: "./popup.html",
		contentStyleFile: [
			"./css/normalize.css", 
			"./css/popup.css"
		],
		contentScriptFile: "./js/bundle-popup.js",
		width:  320,
		height: 150,
		onHide: function () {
			button.state('window', {checked: false});
		}
	});

	attachWorker(popup);
	return popup;
}

function attachWorker(worker) {
	workers.push(worker);
	worker.on('message', function (message) {
		messageHandler(worker, message);
	});
}

function detachWorker(worker) {
	for (var i = 0; i < workers.length; i++) {
		if (workers[i] == worker) {
			workers.splice(i, 1);
			break;
		}
	}
}

function messageHandler(worker, message) {
	console.log("SCROBLR::::: Handling message:", message);

	// handle Firefox-specific messages
	switch (message.name) {
		case "openTab":
			popup.hide();
			tabs.open(message.message);
			return;

		case "showNotification":
			var image = message.message.image;
			if (image.indexOf("img/") === 0) {
				image = "./" + image;
			}
			notifications.notify({
				title: message.message.title,
				text: message.message.message,
				iconURL: image,
			});
			return;
	}

	for (var i = 0; i < workers.length; i++) {
		if (workers[i] != worker) {
			workers[i].postMessage(message);
		}
	}
}

// load content script matching URLs from manifest.json and convert to regex
function getIncludeUrls() {
	var manifest = require('../../manifest.json');
	var matches = manifest.content_scripts[0].matches;
	var expressions = matches.map(createRegexForIncludeUrl);
	return expressions;
}

function createRegexForIncludeUrl(url) {
	var re = url;
	re = re.replace("*://*.", "");
	re = re.replace("*://", "");

	// escape . and /
	re = re.replace(/\./g, "\\.");
	re = re.replace(/\//g, "\\/");

	re = re.replace("*", ".*");

	// regex for *://*
	re = "https?://[^.]*.?" + re;

	return new RegExp(re);
}

initialize();
