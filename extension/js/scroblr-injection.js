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
	function calculateDuration (timestring) {
		var seconds = 0;
		for (var i = 0, max = arguments.length; i < max; i += 1) {
			if (arguments[i].toString().length) {
				timeSegments = arguments[i].split(':');
				// Iterate over timeSegments in reverse calculating the number
				// of seconds represented by the seconds, minutes, and hours
				// fields.
				for (var j = timeSegments.length - 1, pow = 0; (j >= 0) && (j >= (timeSegments.length - 3)); j -= 1, pow += 1) {
					seconds += parseFloat(timeSegments[j].replace('-', '')) * Math.pow(60, pow);
				}
			}
		}
		return seconds * 1000;
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
	function sendMessage (name, message) {
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











var scroblr1 = function () {

	var host = '',
		interval = '',
		song = {
			album: '',
			artist: 'undefined',
			duration: 0,
			elapsed: 0,
			host: host,
			image: '',
			loved: false,
			name: 'undefined',
			score: 50,
			stopped: false,
			tags: [],
			timestamp: null,
			url: '',
			url_album: '',
			url_artist: ''
		};




	function getCurrentSongInfo () {
		var currentsong = {
				album: '',
				artist: '',
				duration: 0,
				elapsed: 0,
				host: host,
				image: '',
				loved: false,
				name: '',
				score: 50,
				stopped: false,
				tags: [],
				timestamp: Math.round((new Date()).getTime() / 1000.0),
				url: '',
				url_album: '',
				url_artist: ''
			},
			scrape = {
			};

		return $.extend(currentsong, scrape[host]());

	}


	function getElapsedTime (data) {
		var elapsed = data.elapsed,
			now = (new Date()).getTime() / 1000.0;
		if (elapsed === 0) {
			elapsed = Math.round(now - song.timestamp) * 1000;
		}
		return elapsed;
	}


	function getHost () {

		var host, hostname;

		host = false;
		hostname = window.location.hostname.toLowerCase();

		if (hostname.indexOf('accuradio') >= 0) {
			host = 'accuradio';
		}
		else if (hostname.indexOf('amazon') >= 0 && window.location.pathname.indexOf('music') >= 0) {
			host = 'amazon';
		}
		else if (hostname.indexOf('bandcamp') >= 0) {
			host = 'bandcamp';
		}
		else if (hostname.indexOf('google') >= 0) {
			host = 'google';
		}
		else if (hostname.indexOf('grooveshark') >= 0) {
			host = 'grooveshark';
		}
		else if (hostname.indexOf('jango') >= 0) {
			host = 'jango';
		}
		else if (hostname.indexOf('pandora') >= 0) {
			host = 'pandora';
		}
		else if (hostname.indexOf('player.fm') >= 0) {
			host = 'playerfm';
		}
		else if (hostname.indexOf('rhapsody') >= 0 || hostname.indexOf('napster') >= 0) {
			if ($('#container').length) {
				host = 'rhapsody';
			}
		}
		else if (hostname.indexOf('songza') >= 0) {
			if ($('#player').length) {
				host = 'songza';
			}
		}
		else if (hostname.indexOf('turntable') >= 0) {
			host = 'turntable';
		}
		else if (hostname.indexOf('twonky') >= 0) {
			if ($('body.musicDashboard').length) {
				host = 'twonky';
			}
		}
		else if (hostname.indexOf('we7') >= 0) {
			host = 'we7';
		}
		return host;
	}


	function init () {
		host = getHost();
		if (host === false) {
			return false;
		}
		interval = window.setInterval(pollSongInfo, 5000);
	}


	function pollSongInfo () {
		var currentsong = getCurrentSongInfo(),
			currentsong_update_object = {};
		if (currentsong.name != song.name || currentsong.artist != song.artist) {
			song = currentsong;
			sendMessage('nowPlaying', song);
		}
		else if (currentsong.name.length && currentsong.artist.length) {
			if (currentsong.hasOwnProperty('percent') && currentsong.duration === 0) {
				currentsong.duration = Math.round((currentsong.timestamp * 1000 - song.timestamp * 1000) / currentsong.percent);
				currentsong.elapsed = Math.round(currentsong.duration * currentsong.percent);
			}
			if (currentsong.duration > song.duration || song.duration - currentsong.duration > 200000) {
				currentsong_update_object.duration = song.duration = currentsong.duration;
			}
			if (currentsong.score != song.score) {
				currentsong_update_object.score = song.score = currentsong.score;
			}
			currentsong_update_object.elapsed = song.elapsed = getElapsedTime(currentsong);
			sendMessage('updateCurrentSong', currentsong_update_object);
		}
		sendMessage('keepAlive', null);
	}
};
