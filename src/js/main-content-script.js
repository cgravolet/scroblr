"use strict";

var $            = require("jquery");
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

        if (plugins.hasOwnProperty(key) && plugins[key].test()) {
            host    = plugins[key];
            host.id = host.name.toUpperCase() + (new Date()).valueOf();
            plugins.length = 0;

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
        sendMessage("updateCurrentTrack", {});
    }
}

/**
 * @param {string} name
 * @param {object} message
 */
function sendMessage(name, message) {

    if (typeof chrome != "undefined") {
        chrome.extension.sendMessage({
            name: name,
            message: message
        });
    } else if (typeof safari != "undefined") {
        safari.self.tab.dispatchMessage(name, $.extend({}, message, {
            toString: null
        }));
    }
}

init();
