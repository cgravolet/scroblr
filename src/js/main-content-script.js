"use strict";

var $            = require("jquery");
var conf         = require("./conf.json");
var firefox      = require('./firefox/firefox.js');
var Track        = require("./modules/Track");
var plugins      = require("./plugins");
var currentTrack = null;
var host         = null;
var poller       = null;

function createGUID() {

    function S4() {
        return Math.floor(Math.random() * 0x10000).toString(16);
    }

    return (
        S4() + S4() + "-" +
        S4() + "-" +
        S4() + "-" +
        S4() + "-" +
        S4() + S4() + S4()
    );
}

function getAccessToken() {

    if (/scroblr\.fm\/access\-granted/i.test(window.location.href)) {

        if (!/token=.+/i.test(window.location.search)) {
            return true;
        }

        var token = window.location.search.split('=')[1];

        if (typeof chrome != 'undefined') {
            chrome.extension.sendMessage({
                name: 'accessGranted',
                message: token
            });
        } else if (typeof safari != 'undefined') {
            safari.self.tab.dispatchMessage('accessGranted', token);
        } else if (firefox) {
            firefox.postMessage({
                name: 'accessGranted',
                message: token
            });
        }
        return true;
    }
    return false;
}

/**
 * Calculates the amount of milliseconds that have passed since the track
 * started playing.
 *
 * @param {Number} dateTime - Datetime value
 */
function getElapsedTime(dateTime) {
    var now = (new Date()).valueOf();
    return now - dateTime;
}

/**
 * Initialization method
 */
function init() {

    for (var key in plugins) {

        if (conf.DEBUG) {
            console.log("SCROBLR::::: Testing plugin ", key, document.location.hostname);
        }

        if (plugins.hasOwnProperty(key) && plugins[key].test()) {
            host    = plugins[key];
            host.id = host.name.toUpperCase() + (new Date()).valueOf();
            plugins.length = 0;

            if (conf.DEBUG) {
                console.log("SCROBLR::::: Initializing plugin ", key);
            }

            if (typeof host.initialize === "function") {
                host.initialize();
            }

            poller = window.setInterval(pollTrackInfo, 5000);
            break;
        }
    }
}

function pollTrackInfo() {
    var newTrack  = Object.create(Track);
    var prevTrack = currentTrack || {toString: function () {return "";}};
    var updateObj = {};

    newTrack.init(host.scrape(), host.name, host.id);

    if (!newTrack.toString()) {

		if (newTrack.hasOwnProperty("reset") && newTrack.reset === true) {
			currentTrack = null;
		}
        return false;
    }

    // A new track is playing
    if (newTrack.toString() !== prevTrack.toString()) {
        newTrack.id  = createGUID();
        currentTrack = newTrack;
        sendMessage("nowPlaying", newTrack);

    // A track continues to play
    } else if (!newTrack.stopped) {
        newTrack.id  = prevTrack.id;
        updateObj.id = newTrack.id;

        ["album", "duration", "elapsed", "percent", "score", "stopped"].forEach(
                function (val) {

            if (newTrack.hasOwnProperty(val) && newTrack[val] !==
					prevTrack[val]) {
                prevTrack[val] = newTrack[val];
                updateObj[val] = newTrack[val];
            } else if (val === "elapsed" && !newTrack.hasOwnProperty(val)) {
                prevTrack[val] = getElapsedTime(prevTrack.dateTime);
                updateObj[val] = prevTrack[val];
            }
        });

        sendMessage("updateCurrentTrack", updateObj);

    // A track is paused
    } else if (newTrack.stopped) {
		updateObj.id = prevTrack.id;
        sendMessage("updateCurrentTrack", updateObj);
    }
}

/**
 * @param {string} name
 * @param {object} message
 */
function sendMessage(name, message) {
	var key, msg;

	if (conf.DEBUG) {
		console.log("SCROBLR::::: ", name, message);
	}

    if (typeof chrome != "undefined") {
        chrome.extension.sendMessage({
            name: name,
            message: message
        });
    } else if (typeof safari != "undefined") {
		msg = $.extend({}, message);

		/*
		 * If you try passing an object with functions in it through Safari's
		 * dispatchMessage method, it will quietly suppress the message and not
		 * do anything. This enumerator will remove any functions from the
		 * message object by setting them to null.
		 */
		for (key in msg) {

			if (msg.hasOwnProperty(key) && typeof msg[key] === "function") {
				msg[key] = null;
			}
		}
        safari.self.tab.dispatchMessage(name, msg);
    } else if (firefox) {
        firefox.postMessage({
            name: name,
            message: message
        });
    }
}

/*
 * Check for the access granted token on the scroblr access granted site. If
 * not available, proceed as normal and initialize the content script.
 */
if (!getAccessToken()) {
    init();
}
