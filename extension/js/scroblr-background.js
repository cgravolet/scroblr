var API_KEY, API_SEC, API_URL, LASTFM_AUTH_URL, currentTrack, history,
	lf_session, lf_sessioncache, lf_auth_waiting, keepalive;

API_KEY         = "59c070288bfca89ca9700fde083969bb";
API_SEC         = "0193a089b025f8cfafcc922e54b93706";
API_URL         = "http://ws.audioscrobbler.com/2.0/";
LASTFM_AUTH_URL = "http://www.last.fm/api/auth/?api_key=" + API_KEY + "&cb=";
currentTrack    = null;
history         = [];
keepalive       = null;
lf_auth_waiting = false;
lf_session      = JSON.parse(localStorage.lf_session || null);
lf_sessioncache = JSON.parse(localStorage.lf_sessioncache || null);

if (!lf_sessioncache) {
	lf_sessioncache = {};
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
	var i, key, keys, max, paramString;

	keys        = [];
	paramString = "";

	for (key in params) {
		if (params.hasOwnProperty(key)) {
			keys.push(key);
		}
	}
	keys.sort();

	for (i = 0, max = keys.length; i < max; i += 1) {
		key = keys[i];
		paramString += key + params[key];
	}

	return hex_md5(paramString + API_SEC);
}

/**
 * Checks the browser's local storage for preference options and returns the
 * default setting if not found. Options are stored differently based on the
 * browser, this function simplifies the process of accessing those preferences.
 *
 * @param {string} option The name of the option (ex. "pandora")
 */
function getOptionStatus(option) {
	var setting;

	if (typeof chrome != "undefined") {
		setting = localStorage["enable_" + option];
	} else if (typeof safari != "undefined") {
		setting = safari.extension.settings["enable_" + option];
	}

	return setting === undefined;
}

/**
 * Creates the request to get song info from Last.fm.
 *
 * @param {object} track The song object (ex. {name: "Kerosene",
 *                       artist: "Big Black", duration: etc...})
 */
function getTrackInfo(track) {
	var params;

	if (track.title && track.artist) {
		params = {
			api_key: API_KEY,
			artist:  track.artist,
			track:   track.title
		};

		if (lf_session && lf_session.name) {
			params.username = lf_session.name;
		}

		sendRequest("track.getInfo", params, getTrackInfoCallback);
	}
}

/**
 * Callback function to handle grabbing the data returned from the track.getInfo
 * request and appending the new data to the currentTrack object.
 *
 * @param {object} data The data returned from the track.getInfo API request
 */
function getTrackInfoCallback(data) {
	var trackParams;

	trackParams = {
		album:      $("track > album title", data).text() || currentTrack.album || "",
		image:      $("track > album image[size=large]", data).text() || "",
		loved:      $("track userloved").text() == "1",
		url:        $("track > url", data).text() || "",
		url_album:  $("track > album url", data).text() || "",
		url_artist: $("track > artist url", data).text() || "",
		tags:       []
	};

	$("track tag", data).each(function () {
		trackParams.tags.push({
			name: $(this).find("name").text(),
			url:  $(this).find("url").text()
		});
	});

	$.extend(currentTrack, trackParams);
	sendMessage("songInfoRetrieved", currentTrack);
}

/**
 * Constructs the request object to send to the Last.fm API in order to get more
 * detailed user info
 *
 * @param {string} user Last.fm username
 */
function getUserInfo(user) {
	var params = {
		api_key: API_KEY,
		user:    user
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
function getUserSession(token) {
	var params = {
		api_key: API_KEY,
		token:   token
	};

	if (token) {
		sendRequest("auth.getSession", params, getUserSessionCallback);
	}
}

/**
 * Callback function that takes the response and creates the session object to
 * save to memory
 *
 * @param {object} data The XML response from the Last.fm API server
 */
function getUserSessionCallback(data) {
	if (data) {
		lf_session = {
			name:       $("session name", data).text(),
			key:        $("session key", data).text(),
			subscriber: $("session subscriber", data).text() == "1"
		};
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
function getUserSessionFromCache(user) {
	if (lf_sessioncache.hasOwnProperty(user)) {
		lf_session = lf_sessioncache[user];
		localStorage.lf_session = JSON.stringify(lf_session);
		sendMessage("initUserForm", null);
	} else {
		openAuthWindow();
	}
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
		chrome.extension.onMessage.addListener(messageHandler);
	} else if (typeof safari != "undefined") {
		safari.application.addEventListener("message", messageHandler, false);
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
		currentTrack = null;
	}, 15000);
}

/**
 * Clears the current users session from local memory
 */
function logoutUser() {
	localStorage.removeItem("lf_session");
	lf_session = null;
	sendMessage("initUserForm", null);
}

/**
 * Creates the request object for loving or unloving a track.
 *
 * @param {boolean} love She loves me. She loves me not. (True or False)
 */
function loveTrack(love) {
	var params = {
		api_key: API_KEY,
		sk:      lf_session.key,
		artist:  currentTrack.artist,
		track:   currentTrack.name
	};

	if (love) {
		sendRequest("track.love", params);
	} else {
		sendRequest("track.unlove", params);
	}
}

/**
 * Handles all incoming event messages from other extension resources.
 *
 * @param {object} msg The message contents (ex. {name: "keepAlive",
 *                     message: null})
 */
function messageHandler(msg) {
	switch (msg.name) {
	case "accessGranted":
		getUserSession(msg.message);
		break;
	case "cancelAuthLinkClicked":
		sendMessage("initUserForm", null);
		break;
	case "keepAlive":
		keepAlive();
		break;
	case "loginFormSubmitted":
		getUserSessionFromCache(msg.message);
		break;
	case "logoutLinkClicked":
		logoutUser();
		break;
	case "loveTrack":
		loveTrack(true);
		break;
	case "nowPlaying":
		updateNowPlaying(msg.message);
		getTrackInfo(msg.message);
		break;
	case "scrobbleTrack":
		scrobble(msg.message);
		break;
	case "unloveTrack":
		loveTrack(false);
		break;
	case "updateCurrentTrack":
		updateCurrentTrack(msg.message);
		break;
	}
}

/**
 * Handles sending HTML5 window notifications (used mainly when a new song
 * starts playing, Chrome-only for the time being)
 *
 * @param {object} notificationData The notification to be sent (ex. {title:
 *                              		"Now Playing", message: "Big Black - Kerosene"})
 */
function notify(notificationData) {
	var notification;

	if (window.webkitNotifications && getOptionStatus("messaging")) {
		notification = webkitNotifications.createNotification(
				"img/scroblr64.png", notificationData.title, notificationData.message);
		notification.show();

		if (getOptionStatus("auto_dismiss")) {
			window.setTimeout(function () {
				notification.cancel();
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
			url: LASTFM_AUTH_URL + chrome.extension.getURL("access-granted.html")
		});
	} else if (typeof safari != "undefined") {
		newTab = safari.application.activeBrowserWindow.openTab();
		newTab.url = LASTFM_AUTH_URL + safari.extension.baseURI + "access-granted.html";
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
		api_key:   API_KEY,
		artist:    track.artist,
		sk:        lf_session ? lf_session.key : null,
		timestamp: Math.round(track.dateTime / 1000),
		track:     track.title
	};

	if (track.album) {
		params.album = track.album;
	}

	if (lf_session) {
		sendRequest("track.scrobble", params);
	}
}

/**
 * Handles sending event messages to the Chrome/Safari extension API.
 *
 * @param {string} name The name of the event to trigger
 * @param {?} message Any type of data that should be sent along with the msg
 */
function sendMessage(name, message) {
	var bars, i;

	if (typeof chrome != "undefined") {
		chrome.extension.sendMessage({
			name:    name,
			message: message
		});
	} else if (typeof safari != "undefined") {
		bars = safari.extension.bars;
		i = bars.length;

		while (i--) {
			bars[i].contentWindow.scroblrBar.messageHandler({
				name: name,
				message: message
			});
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
	var type = "GET",
			requirePost = ["track.love", "track.scrobble", "track.unlove",
										 "track.updateNowPlaying"];

	if ($.inArray(method, requirePost) >= 0) {
		type = "POST";
	}

	params.method  = method;
	params.api_sig = getApiSignature(params);

	$.ajax({
		data:    params,
		failure: handleFailure,
		success: callback,
		type:    type,
		url:     API_URL
	});
}

/**
 * Updates properties in the current song object.
 *
 * @param {object} data
 */
function updateCurrentTrack(data) {
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			currentTrack[key] = data[key];
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

	hostEnabled  = getOptionStatus(track.host);
	currentTrack = track;
	notify({
		message: track.artist + " - " + track.title,
		title:   "Now Playing"
	});

	if (lf_session) {
		params = {
			api_key:  API_KEY,
			artist:   track.artist,
			duration: track.duration / 1000,
			sk:       lf_session.key,
			track:    track.title
		};

		if (track.album) {
			params.album = track.album;
		}

		sendRequest("track.updateNowPlaying", params);
	}
}

initialize();
