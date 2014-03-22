"use strict";

var $     = require("jquery");
var conf  = require("./conf.json");
var md5   = require("MD5");

window.scroblrGlobal = (function () {
    var keepalive;
    var currentTrack = null;
    var history      = [];
    var lf_session   = JSON.parse(localStorage.lf_session || null);

    function doNotScrobbleCurrentTrack() {

        if (currentTrack.noscrobble) {
            currentTrack.noscrobble = false;
        } else {
            currentTrack.noscrobble = true;
        }
        sendMessage("trackNoScrobbleSet");
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

        return md5(paramString + conf.API_SEC);
    }

    /**
     * Checks the browser's local storage for preference options and returns the
     * default setting if not found. Options are stored differently based on the
     * browser, this function simplifies the process of accessing those preferences.
     *
     * @param {string} option The name of the option (ex. "pandora")
     */
    function getOptionStatus(option) {
        return !localStorage["disable_" + option];
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
                api_key: conf.API_KEY,
                artist:  track.artist,
                track:   track.title
            };

            if (lf_session && lf_session.name) {
                params.username = lf_session.name;
            }

            sendRequest("track.getInfo", params, getTrackInfoCallback,
                getTrackInfoFailure);
        }
    }

    /**
     * Callback function to handle grabbing the data returned from the track.getInfo
     * request and appending the new data to the currentTrack object.
     *
     * @param {object} data The data returned from the track.getInfo API request
     */
    function getTrackInfoCallback(data) {
        var trackParams = {
            album:      $("track > album title", data).text() || currentTrack.album || "",
            image:      $("track > album image[size=large]", data).text() || "",
            loved:      $("track userloved").text() == "1",
            url_album:  $("track > album url", data).text() || "",
            url_artist: $("track > artist url", data).text() || "",
            url_track:  $("track > url", data).text() || "",
            tags:       []
        };

        if (!currentTrack.duration) {
            trackParams.duration = parseFloat($("track > duration", data).text());
        }

        $("track tag", data).each(function () {
            trackParams.tags.push({
                name: $(this).find("name").text(),
                url:  $(this).find("url").text()
            });
        });

        $.extend(currentTrack, trackParams);
        sendNowPlayingRequest();
        sendMessage("songInfoRetrieved", currentTrack);
        notify({
            image:   currentTrack.image,
            message: currentTrack.artist + " - " + currentTrack.title,
            title:   "Now Playing"
        });
    }

    function getTrackInfoFailure() {
        if (currentTrack.host === "youtube") {
            currentTrack.noscrobble   = true;
            currentTrack.editrequired = true;
            sendMessage("trackEditRequired");
        } else {
            sendNowPlayingRequest();
            sendMessage("songInfoRetrieved", currentTrack);
            notify({
                message: currentTrack.artist + " - " + currentTrack.title,
                title:   "Now Playing"
            });
        }
    }

    /**
     * Creates the request object to send to the Last.fm API in order to request a
     * user session
     *
     * @param {string} token
     */
    function getUserSession(token) {
        var params = {
            api_key: conf.API_KEY,
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
        }
        localStorage.lf_session = JSON.stringify(lf_session);
        sendMessage("userSessionRetrieved");
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

    function keepTrackAlive() {
        window.clearTimeout(keepalive);
        keepalive = window.setTimeout(function () {
            pushTrackToHistory(currentTrack);
            scrobbleHistory();
            currentTrack = null;
            sendMessage("keepAliveExpired");
        }, 15000);
    }

    /**
     * Clears the current users session from local memory
     */
    function logoutUser() {
        localStorage.removeItem("lf_session");
        lf_session = null;
        sendMessage("userLoggedOut", null);
    }

    /**
     * Creates the request object for loving or unloving a track.
     *
     * @param {boolean} love She loves me. She loves me not. (True or False)
     */
    function loveTrack() {
        var params = {
            api_key: conf.API_KEY,
            sk:      lf_session.key,
            artist:  currentTrack.artist,
            track:   currentTrack.title
        };

        if (currentTrack.loved === false) {
            currentTrack.loved = true;
            sendRequest("track.love", params);
        } else if (currentTrack.loved === true) {
            currentTrack.loved = false;
            sendRequest("track.unlove", params);
        }

        sendMessage("trackLoved");
    }

    /**
     * Handles all incoming event messages from other extension resources.
     *
     * @param {object} msg The message contents (ex. {name: "keepAlive",
	 *                     message: null})
     */
    function messageHandler(msg) {

		if (conf.DEBUG) {
			console.log(msg.name, msg.message);
		}

        switch (msg.name) {
		case "accessGranted":
			getUserSession(msg.message);
			break;
		case "authButtonClicked":
			openAuthWindow();
			break;
		case "doNotScrobbleButtonClicked":
			doNotScrobbleCurrentTrack();
			break;
		case "popupSettingsChanged":
			sendMessage("localSettingsChanged");
			break;
		case "logoutLinkClicked":
			logoutUser();
			break;
		case "loveTrackButtonClicked":
			loveTrack();
			break;
		case "nowPlaying":
			updateNowPlaying(msg.message);
			getTrackInfo(msg.message);
			break;
		case "trackEdited":
			updateCurrentTrack(msg.message);
			trackEditResponse();
			sendMessage("trackEditSaved");
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
     * @param {object} message The notification to be sent (ex. {title:
	 *                         "Now Playing", message: "Big Black - Kerosene"})
     */
    function notify(message) {
        /* globals webkitNotifications */

        var notification;

        if (!(message.image && message.image.length)) {
            message.image = "img/scroblr64.png";
        }

        if (window.webkitNotifications && getOptionStatus("notifications")) {
            notification = webkitNotifications.createNotification(
                message.image, message.title, message.message);
            notification.show();

            if (getOptionStatus("autodismiss")) {
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
                // url: conf.AUTH_URL + chrome.extension.getURL("access-granted.html")
                url: conf.AUTH_URL + "http://scroblr.fm/access-granted.html"
            });
        } else if (typeof safari != "undefined") {
            newTab = safari.application.activeBrowserWindow.openTab();
            newTab.url = conf.AUTH_URL + safari.extension.baseURI + "access-granted.html";
        }

        sendMessage("initUserForm", true);
    }

    function pushTrackToHistory(track) {
        if (track) {
            history.push(track);
        }

        if (history.length > 25) {
            history.splice(0, 1);
        }
    }

    /**
     * Scrobbles any tracks in the history array that have not been scrobbled yet.
     */
    function scrobbleHistory() {
        var i, max, requestParams, track;

        for (i = 0, max = history.length; i < max; i += 1) {
            track = history[i];

            if (!track.scrobbled && lf_session && getOptionStatus("scrobbling") &&
                trackShouldBeScrobbled(track)) {
                requestParams = {
                    api_key:   conf.API_KEY,
                    artist:    track.artist,
                    sk:        lf_session.key,
                    timestamp: Math.round(track.dateTime / 1000),
                    track:     track.title
                };

                if (track.album) {
                    requestParams.album = track.album;
                }

                scrobbleTrack(track, requestParams);
            }
        }

    }

    function scrobbleTrack(track, params) {
        sendRequest("track.scrobble", params, function () {
            track.scrobbled = true;
        });
    }

    /**
     * Handles sending event messages to the Chrome/Safari extension API.
     *
     * @param {string} name The name of the event to trigger
     * @param {?} message Any type of data that should be sent along with the msg
     */
    function sendMessage(name, message) {
        var popovers, i;

        if (typeof chrome != "undefined") {
            chrome.extension.sendMessage({
                name:    name,
                message: message
            });
        } else if (typeof safari != "undefined") {
            popovers = safari.extension.popovers;
            i = popovers.length;

            while (i--) {
                popovers[i].contentWindow.scroblrView.messageHandler({
                    name: name,
                    message: message
                });
            }
        }
    }

    function sendNowPlayingRequest() {
        var artistTitlePresent, params, scrobblingEnabled, serviceEnabled;

        artistTitlePresent = (currentTrack.artist && currentTrack.title ? true : false);
        scrobblingEnabled  = getOptionStatus("scrobbling");
        serviceEnabled     = getOptionStatus(currentTrack.host);

        if (lf_session && scrobblingEnabled && artistTitlePresent && serviceEnabled) {
            params = {
                api_key:  conf.API_KEY,
                artist:   currentTrack.artist,
                sk:       lf_session.key,
                track:    currentTrack.title
            };

            if (currentTrack.duration) {
                params.duration = Math.round(currentTrack.duration / 1000);
            }

            if (currentTrack.album) {
                params.album = currentTrack.album;
            }

            sendRequest("track.updateNowPlaying", params);
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
    function sendRequest(method, params, success, error) {
        var requirePost = ["track.love", "track.scrobble", "track.unlove",
            "track.updateNowPlaying"];

        params.method  = method;
        params.api_sig = getApiSignature(params);

        $.ajax({
            data:    params,
            error:   error || handleFailure,
            success: success,
            type:    (requirePost.indexOf(method) >= 0 ? "POST" : "GET"),
            url:     conf.API_URL
        });
    }

    function trackEditResponse() {
        if (currentTrack.editrequired) {
            currentTrack.editrequired = false;
            currentTrack.noscrobble   = false;
            sendNowPlayingRequest();
            notify({
                message: currentTrack.artist + " - " + currentTrack.title,
                title:   "Now Playing"
            });
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
        var artistTitlePresent, greaterThan30s, listenedTo4m, listenedToMoreThanHalf,
            noDurationWithElapsed, serviceEnabled;

        artistTitlePresent     = (track.artist && track.title ? true : false);
        greaterThan30s         = (track.duration > 30000);
        listenedTo4m           = (track.elapsed >= 240000);
        listenedToMoreThanHalf = (track.elapsed >= track.duration / 2);
        noDurationWithElapsed  = (!track.duration && track.elapsed > 30000);
        serviceEnabled         = getOptionStatus(track.host);

        return serviceEnabled && !track.noscrobble && artistTitlePresent && ((greaterThan30s &&
            (listenedTo4m || listenedToMoreThanHalf)) || noDurationWithElapsed);
    }

    /**
     * Updates properties in the current song object.
     *
     * @param {object} data
     */
    function updateCurrentTrack(data) {
        if (data.id === currentTrack.id) {
            keepTrackAlive();

            for (var key in data) {

                if (data.hasOwnProperty(key)) {

                    /*
                     * Pandora occasionally clears elapsed and durations before
                     * the next track begins, this causes lost scrobbles. Need
                     * to make sure new elapsed time is not less than previous
                     * elapsed time.
                     */
                    if ( (key === "elapsed" && data[key] > currentTrack[key]) ||
                        (key === "elapsed" && !currentTrack[key]) ||
                        key !== "elapsed") {
                        currentTrack[key] = data[key];
                    }
                }
            }
        }
    }

    /**
     * Constructs the "Now Playing" request to send to the Last.fm api
     *
     * @param {object} track
     */
    function updateNowPlaying(track) {
        if (track.host === "youtube" && !getOptionStatus("youtube")) {
            return false;
        }

        pushTrackToHistory(currentTrack);
        scrobbleHistory();
        keepTrackAlive();

        if (!track.artist) {
            track.editrequired = true;
            track.noscrobble   = true;
            sendMessage("trackEditRequired");
        }

        currentTrack = $.extend({}, track);
    }

    initialize();

    return {
        getCurrentTrack: function () {
            return currentTrack;
        },
        getHistory: function () {
            return history;
        },
        getSession: function () {
            return lf_session;
        },
        messageHandler: messageHandler
    };
}());
