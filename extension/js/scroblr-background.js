var api_key, api_sec, api_url, lf_session, lf_sessioncache, lf_auth_waiting,
	currentsong, keepalive;

api_key = "59c070288bfca89ca9700fde083969bb";
api_sec = "0193a089b025f8cfafcc922e54b93706";
api_url = "http://ws.audioscrobbler.com/2.0/";
currentsong = null;
keepalive = null;
lf_auth_waiting = false;
lf_session = null;
lf_sessioncache = {};

if (localStorage.lf_session) {
	lf_session = JSON.parse(localStorage.lf_session);
}

if (localStorage.lf_sessioncache) {
	lf_sessioncache = JSON.parse(localStorage.lf_sessioncache);
}

/**
 * Helper function that takes Last.fm request parameters, appends the api secret
 * key and turns it into an md5 hash to create the API signature which Last.fm
 * requires be appended to all requests.
 *
 * @param {object} params The request parameters (ex. {artist: "Big Black",
 *                        track: "Kerosene", method: "track.love"})
 */
function getApiSignature(params) {

	var key, keys, string;

	keys = [];
	string = "";

	for (key in params) {
		keys.push(key);
	}

	keys.sort();

	for (var index in keys) {
		key = keys[index];
		string += key + params[key];
	}

	return hex_md5(string + api_sec);
}

/**
 * Checks the browser's local storage for preference options and returns the
 * default setting if not found. Options are stored differently based on the
 * browser, this function simplifies the process of accessing those preferences.
 *
 * @param {string} option The name of the option (ex. "pandora")
 */
function getOptionStatus(option) {
	if (typeof chrome != "undefined") {
		return (localStorage["enable_" + option] == "false" ? false : true);
	} else if (typeof safari != "undefined") {
		return (safari.extension.settings["enable_" + option] == false ?
				false : true);
	}
}

/**
 * Creates the request to get song info from Last.fm.
 *
 * @param {object} track The song object (ex. {name: "Kerosene",
 *                       artist: "Big Black", duration: etc...})
 */
function getSongInfo(track) {

	var params;

	if (track.title.length && track.artist.length) {
		params = {
			api_key: api_key,
			artist: track.artist,
			track: track.title
		};

		if (lf_session != null && lf_session.name.length) {
			params.username = lf_session.name;
		}
		sendRequest("track.getInfo", params, getSongInfoCallback);
	}
}

/**
 * Callback function to handle grabbing the data returned from the track.getInfo
 * request and appending the new data to the currentsong object.
 *
 * @param {object} data The data returned from the track.getInfo API request
 */
function getSongInfoCallback(data) {

	currentsong.album = $("track > album title", data).text() ||
			currentsong.album ? currentsong.album : "";
	currentsong.image = $("track > album image[size=large]", data).text() ||
			"";
	currentsong.loved = $("track userloved").text() == 1 ? true : false;
	currentsong.tags = [];
	currentsong.url = $("track > url", data).text() || "";
	currentsong.url_album = $("track > album url", data).text() || "";
	currentsong.url_artist = $("track > artist url", data).text() || "";

	$("track tag", data).each(function () {
		currentsong.tags.push({
			name: $(this).find("name").text(),
			url: $(this).find("url").text()
		});
	});

	sendMessage("songInfoRetrieved", currentsong);
}

/**
 * Handles API request failures. Notice how it doesn't do a goddamn thing, this
 * should probably be expanded upon...
 */
function handleFailure() {
	console.log(arguments);
}

/**
 * The initialization function, gets run once on page load (when the browser
 * window opens for the first time, or when scroblr is enabled.)
 */
function initialize() {
	if (typeof chrome != "undefined") {
		chrome.extension.onMessage.addListener(message_handler);
	} else if (typeof safari != "undefined") {
		safari.application.addEventListener("message", message_handler, false);
	}
}

/**
 * Function that gets run every couple seconds while a song is playing and
 * resets the keepAlive timeout. This is how the extension understands when a
 * scrobbling window gets closed or the song stops playing.
 */
function keepAlive() {
	window.clearTimeout(keepalive);
	keepalive = window.setTimeout(function () {
		currentsong = null;
	}, 15000);
}

/**
 * Creates the request object for loving or unloving a track.
 *
 * @param {boolean} love She loves me. She loves me not. (True or False)
 */
function love_track(love) {

	var params = {
			api_key: api_key,
			sk: lf_session.key,
			artist: currentsong.artist,
			track: currentsong.name
		};

	if (love === false) {
		sendRequest("track.unlove", params);
	} else {
		sendRequest("track.love", params);
	}
}

/**
 * Handles all incoming event messages from other extension resources.
 *
 * @param {object} msg The message contents (ex. {name: "keepAlive",
 *                     message: null})
 */
function message_handler(msg) {
	switch (msg.name) {
	case "accessGranted":
		user_get_session(msg.message);
		break;
	case "cancelAuthLinkClicked":
		sendMessage("initUserForm", null);
		break;
	case "keepAlive":
		keepAlive();
		break;
	case "loginFormSubmitted":
		user_get_session_from_cache(msg.message);
		break;
	case "logoutLinkClicked":
		user_logout();
		break;
	case "loveTrack":
		love_track(true);
		break;
	case "nowPlaying":
		updateNowPlaying(msg.message);
		getSongInfo(msg.message);
		break;
	case "scrobbleTrack":
		scrobble(msg.message);
		break;
	case "unloveTrack":
		love_track(false);
		break;
	case "updateCurrentSong":
		update_current_song(msg.message);
		break;
	case "updateScore":
		update_score(msg.message);
		break;
	}
}

/**
 * Handles sending HTML5 window notifications (used mainly when a new song
 * starts playing, Chrome-only for the time being)
 *
 * @param {object} notification The notification to be sent (ex. {title:
 *                              "Now Playing", message: "Big Black - Kerosene"})
 */
function notify(notification) {

	var notification;

	if (window.webkitNotifications && getOptionStatus("messaging")) {
		notification = webkitNotifications.createNotification(
				"img/scroblr64.png", notification.title, notification.message);
		notification.show();

		if (getOptionStatus("auto_dismiss")) {
			window.setTimeout(function () {
				notification.cancel()
			}, 5000);
		}
	}
}

/**
 * This function opens the Last.fm auth window in a new tab when a new user
 * requests a session. It also appends a callback parameter to the auth URL so
 * that when the user grants access to scroblr on the Last.fm website, it will
 * refer them back to the access granted page with a token in the URL.
 */
function openAuthWindow() {

	var newTab;

	if (typeof chrome != "undefined") {
		chrome.tabs.create({
			url: "http://www.last.fm/api/auth/?api_key=" + api_key + "&cb=" +
			     chrome.extension.getURL("access-granted.html")
		});
	} else if (typeof safari != "undefined") {
		newTab = safari.application.activeBrowserWindow.openTab();
		newTab.url = "http://www.last.fm/api/auth/?api_key=" + api_key +
				"&cb=" + safari.extension.baseURI + "access-granted.html";
	}

	sendMessage("initUserForm", true);
}

/**
 * Handles logic for determining if the last played track should be scrobbled
 * and creates the request object.
 *
 * @param {object} track The song object (ex. {name: "Kerosene",
 *                       artist: "Big Black", duration: etc...})
 */
function scrobble(track) {

	var params, hostEnabled;

	// hostEnabled = getOptionStatus(track.host);
	params = {
		api_key: api_key,
		sk: lf_session != null ? lf_session.key : null,
		artist: track.artist,
		timestamp: Math.round(track.dateTime / 1000),
		track: track.title
	};

	if (track.album) {
		params.album = track.album;
	}
	sendRequest("track.scrobble", params);
}

/**
 * Handles sending event messages to the Chrome/Safari extension API.
 *
 * @param {string} name The name of the event to trigger
 * @param {?} message Any type of data that should be sent along with the msg
 */
function sendMessage(name, message) {

	var bars, i;

	return false;

	if (typeof chrome != "undefined") {
		chrome.extension.sendMessage({
			name: name,
			message: message
		});
	} else if (typeof safari != "undefined") {
		bars = safari.extension.bars;
		i = bars.length;

		while (i--) {
			bars[i].contentWindow.scroblrBar.messageHandler({name: name,
					message: message});
		}
	}
}

/**
 * Generic function that handles sending all Last.fm API requests.
 *
 * @param {string} method The method name (ex. "track.love", "track.scrobble",
 *                        etc...)
 * @param {object} params Any related parameters that are required, depending on
 *                        the method
 * @param {function} callback Any callback function to be run on success
 */
function sendRequest(method, params, callback) {

	var type = "GET";

	if ($.inArray(method, ["track.love", "track.scrobble", "track.unlove",
			"track.updateNowPlaying"]) >= 0) {
		type = "POST";
	}

	params.method = method;
	params.api_sig = getApiSignature(params);

	$.ajax({
		url: api_url,
		type: type,
		data: params,
		success: function (data) {
			if (typeof callback == "function") {
				callback(data);
			}
		},
		failure: handleFailure
	});
}

/**
 * Updates properties in the current song object.
 *
 * @param {object} data
 */
function update_current_song(data) {
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			currentsong[key] = data[key];
		}
	}
}

/**
 * Constructs the "Now Playing" request to send to the Last.fm api
 *
 * @param {object} track
 */
function updateNowPlaying(track) {

	var params, hostEnabled;

	// hostEnabled = getOptionStatus(track.host);

	currentsong = track;
	notify({
		message: track.artist + " - " + track.title,
		title: "Now Playing"
	});

	if (lf_session) {
		params = {
			api_key: api_key,
			artist: track.artist,
			duration: track.duration / 1000,
			sk: lf_session.key,
			track: track.title
		};

		if (track.album) {
			params.album = track.album;
		}
		sendRequest("track.updateNowPlaying", params);
	}
}

/**
 * Constructs the request object to send to the Last.fm API in order to get more
 * detailed user info
 *
 * @param {string} user Last.fm username
 */
function user_get_info(user) {
	var params = {
			api_key: api_key,
			user: user
		};
	sendRequest("user.getInfo", params, function (data) {
		localStorage.lf_image = $("user image[size=small]", data).text();
		sendMessage("initUserForm", null);
	});
}

/**
 * Creates the request object to send to the Last.fm API in order to request a
 * user session
 *
 * @param {string} token
 */
function user_get_session(token) {
	var params = {
			api_key: api_key,
			token: token
		};
	if (token && token.length) {
		sendRequest("auth.getSession", params, user_get_session_callback);
	}
}

/**
 * Callback function that takes the response and creates the session object to
 * save to memory
 *
 * @param {object} data The XML response from the Last.fm API server
 */
function user_get_session_callback(data, session) {
	if (data) {
		lf_session = {
			name: $("session name", data).text(),
			key: $("session key", data).text(),
			subscriber: $("session subscriber", data).text() == "1" ? true : false
		}
		lf_sessioncache[lf_session.name] = lf_session;
		localStorage.lf_sessioncache = JSON.stringify(lf_sessioncache);
	}
	localStorage.lf_session = JSON.stringify(lf_session);
	sendMessage("initUserForm", null);
}

/**
 * Attempts to find the user's session information in local memory, otherwise it
 * needs to send the user to authorization in order to request a valid session
 * token
 */
function user_get_session_from_cache(user) {
	if (lf_sessioncache.hasOwnProperty(user)) {
		lf_session = lf_sessioncache[user];
		localStorage.lf_session = JSON.stringify(lf_session);
		sendMessage("initUserForm", null);
	} else {
		openAuthWindow();
	}
}

/**
 * Clears the current users session from local memory
 */
function user_logout() {
	localStorage.removeItem("lf_session");
	lf_session = null;
	sendMessage("initUserForm", null);
}

initialize();
