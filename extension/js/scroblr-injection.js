var scroblr = (function ($, moment) {

	var history, host, Plugin, plugins, poller, Song;

	history = [];
	plugins = {};

	/**
	 * @constructor
	 * @private
	 */
	Plugin = function (name) {

		this.hostre = new RegExp("www\\." + name + "\\.com", "i");
		this.name = name;

		// Init method should return true or false depending on whether this
		// plugin matches the hostname
		this.init = function () {
			return this.hostre.test(document.location.hostname);
		}
	};

	/**
	 * @constructor
	 * @private
	 */
	Song = function (params) {

		$.extend(this, params);

		this.dateTime = moment();
		this.toString = function () {
			if (this.artist.length && this.title.length) {
				return this.artist + ' - ' + this.title;
			} else {
				return "";
			}
		};
	};

	/**
	 * @param {string} timestring
	 */
	function calculateDuration(timestring) {

		var i, j, max, pow, seconds, timeSegments;

		seconds = 0;

		for (i = 0, max = arguments.length; i < max; i += 1) {

			if (arguments[i].toString().length) {
				timeSegments = arguments[i].split(':');

				for (j = timeSegments.length - 1, pow = 0; j >= 0 &&
						j >= (timeSegments.length - 3); j -= 1, pow += 1) {
					seconds += parseFloat(timeSegments[j].replace('-', '')) *
							Math.pow(60, pow);
				}
			}
		}

		return seconds * 1000;
	}

	/**
	 * @private
	 */
	function getElapsedTime(dateTime) {
		var now = moment().valueOf();
		return now - dateTime.valueOf();
	}

	/**
	 * Initialization method
	 * 
	 * @private
	 */
	function init() {

		for (var key in plugins) {
			if (plugins.hasOwnProperty(key) && plugins[key].init()) {
				host = plugins[key];
				poller = window.setInterval(pollSongInfo, 5000);
				break;
			}
		}
	}

	/**
	 * @private
	 */
	function pollSongInfo() {

		var currentSong, currentSongStr, lastSongInHistory, lastSongInHistoryStr;

		currentSong = new Song(host.scrape());
		currentSongStr = currentSong.toString();

		if (history.length) {
			lastSongInHistory = history[history.length - 1];
			lastSongInHistoryStr = lastSongInHistory.toString();
		}

		if (currentSongStr.length && currentSongStr !== lastSongInHistoryStr) {
			history.push(currentSong);
			console.log(history);

		} else if (currentSongStr.length) {

			$.each(['album', 'duration', 'elapsed', 'percent', 'score', 'stopped'], function (i, val) {
				if (currentSong.hasOwnProperty(val)) {
					lastSongInHistory[val] = currentSong[val];
				} else if (val === 'elapsed') {
					lastSongInHistory[val] = getElapsedTime(lastSongInHistory.dateTime);
				}
			});
		}
	}

	/**
	 */
	function registerPlugin(name) {
		plugins[name] = new Plugin(name);
		return plugins[name];
	}

	/**
	 * @param {string} name
	 * @param {object} message
	 */
	function sendMessage(name, message) {
		if (typeof chrome != 'undefined') {
			chrome.extension.sendRequest({
				name: name,
				message: message
			});
		}
		else if (typeof safari != 'undefined') {
			safari.self.tab.dispatchMessage(name, message);
		}
	}

	/*
	 * Document ready
	 */
	$(document).ready(function () {
		init();
	});

	return {
		registerHost: registerPlugin,
		utilities: {
			calculateDuration: calculateDuration
		}
	};
}(jQuery, moment));
