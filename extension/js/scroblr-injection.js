var scroblr = (function ($, moment) {

	var history, host, Plugin, plugins, poller, Track;

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
	Track = function (params) {
		$.extend(this, params);

		this.dateTime = moment().valueOf();
		this.toString = function () {
			if (this.artist.length && this.title.length) {
				return this.artist + " - " + this.title;
			} else {
				return "";
			}
		};
	};

	/**
	 * Calculates the duration of a track in milliseconds based on a time string
	 * (i.e. "01:24" or "-2:32")
	 *
	 * @param {string} timestring
	 */
	function calculateDuration(timestring) {
		var i, j, max, pow, seconds, timeSegments;

		seconds = 0;

		for (i = 0, max = arguments.length; i < max; i += 1) {

			if (arguments[i].toString().length) {
				timeSegments = arguments[i].split(":");

				for (j = timeSegments.length - 1, pow = 0; j >= 0 &&
						j >= (timeSegments.length - 3); j -= 1, pow += 1) {
					seconds += parseFloat(timeSegments[j].replace("-", "")) *
							Math.pow(60, pow);
				}
			}
		}

		return seconds * 1000;
	}

	/**
	 * Calculates the amount of milliseconds that have passed since the track
	 * started playing.
	 *
	 * @param {object} dateTime A moment object
	 * @private
	 */
	function getElapsedTime(dateTime) {
		var now = moment().valueOf();
		return now - dateTime;
	}

	function getTrackHistory() {
		return history;
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
				poller = window.setInterval(pollTrackInfo, 5000);
				break;
			}
		}
	}

	/**
	 * @private
	 */
	function pollTrackInfo() {
		var currentTrack, currentTrackStr, prevTrack, prevTrackStr;

		currentTrack    = new Track(host.scrape());
		currentTrackStr = currentTrack.toString();

		if (history.length) {
			prevTrack    = history[history.length - 1];
			prevTrackStr = prevTrack.toString();
		}

		// New track is playing
		if (currentTrackStr.length && currentTrackStr !== prevTrackStr) {
			updateNowPlaying(currentTrack);
		
		// A track continues to play
		} else if (currentTrackStr.length) {

			$.each(["album", "duration", "elapsed", "percent", "score", "stopped"],
					function (i, val) {

				if (currentTrack.hasOwnProperty(val)) {
					prevTrack[val] = currentTrack[val];
				} else if (val === "elapsed") {
					prevTrack[val] = getElapsedTime(prevTrack.dateTime);
				}
			});
		}
	}

	/**
	 * @private
	 */
	function registerPlugin(name) {
		plugins[name] = new Plugin(name);
		return plugins[name];
	}

	/**
	 * @param {string} name
	 * @param {object} message
	 * @private
	 */
	function sendMessage(name, message) {
		if (typeof chrome != "undefined") {
			chrome.extension.sendRequest({
				name: name,
				message: message
			});
		} else if (typeof safari != "undefined") {
			safari.self.tab.dispatchMessage(name, message);
		}
	}

	/**
	 * Determines if a track should be scrobbled or not.
	 *
	 * @param {Track} track
	 * @return {boolean}
	 * @private
	 */
	function trackShouldBeScrobbled(track) {
		var greaterThan30s, listenedTo4m, listenedToMoreThanHalf,
			noDurationWithElapsed;

		greaterThan30s         = (track.duration > 30000);
		listenedTo4m           = (track.elapsed >= 240000);
		listenedToMoreThanHalf = (track.elapsed >= track.duration / 2);
		noDurationWithElapsed  = (track.duration === 0 && track.elapsed > 30000);

		if ((greaterThan30s && (listenedTo4m || listenedToMoreThanHalf)) ||
				noDurationWithElapsed) {
			return true;
		}
		return false;
	}

	/**
	 * @param {object} track
	 * @private
	 */
	function updateNowPlaying(track) {
		var prevTrack;

		sendMessage("nowPlaying", track);

		if (history.length) {
			prevTrack = history.pop();

			if (trackShouldBeScrobbled(prevTrack)) {
				sendMessage("scrobbleTrack", prevTrack);
			}
		}

		history.push(track);
	}

	/*
	 * Document ready
	 */
	$(document).ready(function () {
		init();
	});

	return {
		getTrackHistory: getTrackHistory,
		registerHost:    registerPlugin,
		utilities: {
			calculateDuration: calculateDuration
		}
	};
}(jQuery, moment));
