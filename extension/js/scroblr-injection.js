var scroblr = (function ($, moment) {

	var currentTrack, host, Plugin, plugins, poller, Track;

	plugins = {};

	/**
	 * @constructor
	 * @private
	 */
	Plugin = function (name) {
		this.hostre = new RegExp(name + "\\.com", "i");
		this.name   = name;

		// Init method should return true or false depending on whether this
		// plugin matches the hostname
		this.init = function () {
			return this.hostre.test(document.location.hostname);
		};
	};

	/**
	 * @constructor
	 * @private
	 */
	Track = function (params) {
		$.extend(this, params);

		this.host   = host.name;
		this.hostid = host.id;

		if (this.hasOwnProperty("album")) {
			this.album = $.trim(this.album);
		}

		if (this.hasOwnProperty("artist")) {
			this.artist = $.trim(this.artist);
		}

		if (this.hasOwnProperty("title")) {
			this.title = $.trim(this.title);
		}

		this.dateTime = moment().valueOf();
		this.toString = function () {
			if (this.artist && this.title) {
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
			if (arguments[i].toString()) {
				timeSegments = arguments[i].split(":");

				for (j = timeSegments.length - 1, pow = 0;
						 j >= 0 && j >= (timeSegments.length - 3);
						 j -= 1, pow += 1) {
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

	/**
	 * Initialization method
	 *
	 * @private
	 */
	function init() {
		for (var key in plugins) {
			if (plugins.hasOwnProperty(key) && plugins[key].init()) {
				host    = plugins[key];
				host.id = host.name.toUpperCase() + moment().valueOf();
				poller  = window.setInterval(pollTrackInfo, 5000);
				break;
			}
		}
	}

	/**
	 * @private
	 */
	function pollTrackInfo() {
		var newTrack, newTrackStr, prevTrack, prevTrackStr, updateObj;

		newTrack    = new Track(host.scrape());
		newTrackStr = newTrack.toString();

		if (currentTrack) {
			prevTrack    = currentTrack;
			prevTrackStr = prevTrack.toString();
		}

		if (newTrackStr) {
			if (newTrackStr !== prevTrackStr) { // New track is playing
				updateNowPlaying(newTrack);
			} else if (!newTrack.stopped === true) { // A track continues to play
				updateObj   = {};

				$.each(["album", "duration", "elapsed", "percent", "score", "stopped"],
						function (i, val) {

					if (newTrack.hasOwnProperty(val) && newTrack[val] !== prevTrack[val]) {
						prevTrack[val] = newTrack[val];
						updateObj[val] = newTrack[val];
					} else if (val === "elapsed" && !newTrack.hasOwnProperty(val)) {
						prevTrack[val] = getElapsedTime(prevTrack.dateTime);
						updateObj[val] = prevTrack[val];
					}
				});
				sendMessage("updateCurrentTrack", updateObj);
			}
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
			chrome.extension.sendMessage({
				name: name,
				message: message
			});
		} else if (typeof safari != "undefined") {
			safari.self.tab.dispatchMessage(name, message);
		}
	}

	/**
	 * @param {object} track
	 * @private
	 */
	function updateNowPlaying(track) {
		currentTrack = track;
		sendMessage("nowPlaying", track);
	}

	/*
	 * Document ready
	 */
	$(function () {
		init();
	});

	return {
		registerHost:    registerPlugin,
		utilities: {
			calculateDuration: calculateDuration
		}
	};
}(jQuery, moment));
