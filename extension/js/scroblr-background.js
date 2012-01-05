var api_key = '59c070288bfca89ca9700fde083969bb',
	api_sec = '0193a089b025f8cfafcc922e54b93706',
	api_url = 'http://ws.audioscrobbler.com/2.0/',
	lf_session = localStorage.lf_session ? JSON.parse(localStorage.lf_session) : null,
	lf_sessioncache = localStorage.lf_sessioncache ? JSON.parse(localStorage.lf_sessioncache) : {},
	lf_auth_waiting = false,
	currentsong = null,
	keepalive = null;


function command_handler (event) {
	switch (event.command) {
		case "toggleScroblr":
			toggle_scroblr_bar();
			break;
	}
}


function getApiSignature (params) {
	var key,
		keys = [],
		string = '';
	for (key in params) {
		keys.push(key);
	}
	keys.sort();
	for (var index in keys) {
		key = keys[index];
		string += key + params[key];
	}
	string += api_sec;
	return md5(string);
}


function getOptionStatus (option) {
	if (typeof chrome != 'undefined') {
		return (localStorage['enable_' + option] == 'false' ? false : true);
	}
	else if (typeof safari != 'undefined') {
		return (safari.extension.settings['enable_' + option] == false ? false : true);
	}
}


function get_song_info (data) {
	var params;
	if (data.name.length && data.artist.length) {
		params = {
			api_key: api_key,
			artist: data.artist,
			track: data.name
		};
		if (lf_session != null && lf_session.name.length) {
			params.username = lf_session.name;
		}
		sendRequest('track.getInfo', params, get_song_info_callback);
	}
}


function get_song_info_callback (data) {
	currentsong.url = $('track > url', data).text() || '';
	currentsong.url_album = $('track > album url', data).text() || '';
	currentsong.url_artist = $('track > artist url', data).text() || '';
	currentsong.album = $('track > album title', data).text() || currentsong.album.length ? currentsong.album : '';
	currentsong.image = $('track > album image[size="large"]', data).text() || '';
	currentsong.loved = $('track userloved').text() == 1 ? true : false;
	currentsong.tags = [];
	$('track tag', data).each(function () {
		currentsong.tags.push({
			name: $(this).find('name').text(),
			url: $(this).find('url').text()
		});
	});
	sendMessage('songInfoRetrieved', currentsong);
}


function handleFailure () {
	console.log(arguments);
}


function initialize () {
	if (typeof chrome != 'undefined') {
		chrome.extension.onRequest.addListener(message_handler);
	}
	else if (typeof safari != 'undefined') {
		safari.application.addEventListener('message', message_handler, false);
		safari.application.addEventListener("command", command_handler, false);
	}
}


function keepAlive () {
	window.clearTimeout(keepalive);
	keepalive = window.setTimeout(function () {
		currentsong = null;
	}, 15000);
}


function love_track (love) {
	var params = {
			api_key: api_key,
			sk: lf_session.key,
			artist: currentsong.artist,
			track: currentsong.name
		};
	if (love === false) {
		sendRequest('track.unlove', params);
	}
	else {
		sendRequest('track.love', params);
	}
}


function message_handler (msg, sender, sendResponse) {
	switch (msg.name) {
		case "accessGranted":
			user_get_session(msg.message);
			break;
		case "cancelAuthLinkClicked":
			sendMessage('initUserForm', null);
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
			update_now_playing(msg.message);
			get_song_info(msg.message);
			break;
		case "scrobbleThis":
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


function notify (notification) {
	var notification;
	if (window.webkitNotifications && getOptionStatus('messaging')) {
		notification = webkitNotifications.createNotification('img/scroblr64.png', notification.title, notification.message);
		notification.show();
		window.setTimeout(function () {
			notification.cancel()
		}, 5000);
	}
}


function openAuthWindow () {
	if (typeof chrome != 'undefined') {
		chrome.tabs.create({
			url: 'http://www.last.fm/api/auth/?api_key=' + api_key + '&cb=' + chrome.extension.getURL('scroblr-access-granted.html')
		});
	}
	else if (typeof safari != 'undefined') {
		var newTab = safari.application.activeBrowserWindow.openTab();
		newTab.url = 'http://www.last.fm/api/auth/?api_key=' + api_key + '&cb=' + safari.extension.baseURI + 'scroblr-access-granted.html';
	}
	sendMessage('initUserForm', true);
}


function scrobble (data) {
	var params = {
			api_key: api_key,
			sk: lf_session != null ? lf_session.key : null,
			artist: data.artist,
			timestamp: data.timestamp,
			track: data.name
		},
		greaterThan30s = (data.duration > 30000),
		listenedTo4m = (data.elapsed >= 240000),
		listenedToMoreThanHalf = (data.elapsed >= data.duration / 2),
		hostEnabled = getOptionStatus(data.host);
	if (data.album.length) {
		params.album = data.album;
	}
	if (hostEnabled && greaterThan30s && (listenedTo4m || listenedToMoreThanHalf) && data.artist.length && data.name.length) {
		sendRequest('track.scrobble', params);
	}
	else if (hostEnabled && data.duration === 0 && data.elapsed > 30000) {
		sendRequest('track.scrobble', params);
	}
}


function sendMessage (name, message) {
	var bars, i;
	if (typeof chrome != 'undefined') {
		chrome.extension.sendRequest({
			name: name,
			message: message
		});
	}
	else if (typeof safari != 'undefined') {
		bars = safari.extension.bars;
		i = bars.length;
		while (i--) {
			bars[i].contentWindow.scroblrBar.messageHandler({name: name, message: message});
		}
	}
}


function sendRequest (method, params, callback) {
	var type = 'GET';
	if ($.inArray(method, ['track.love', 'track.scrobble', 'track.unlove', 'track.updateNowPlaying']) >= 0) {
		type = 'POST';
	}
	params.method = method;
	params.api_sig = getApiSignature(params);
	$.ajax({
		url: api_url,
		type: type,
		data: params,
		success: function (data) {
			if (typeof callback == 'function') {
				callback(data);
			}
		},
		failure: handleFailure
	});
}


function toggle_scroblr_bar () {
	var scroblrBar,
		i = 0,
		max = safari.extension.bars.length;
	for (; i < max; i += 1) {
		scroblrBar = safari.extension.bars[i];
		if (scroblrBar.visible) {
			scroblrBar.hide();
		}
		else {
			scroblrBar.show();
		}
	}
}


function update_current_song (data) {
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			currentsong[key] = data[key];
		}
	}
}


function update_now_playing (data) {
	var params,
		hostEnabled = getOptionStatus(data.host);
	if (currentsong != null) {
		scrobble(currentsong);
	}
	currentsong = data;
	if (hostEnabled && data.name.length && data.artist.length) {
		notify({
			message: data.artist + ' - ' + data.name,
			title: 'Now Playing'
		});
		if (lf_session) {
			params = {
				api_key: api_key,
				artist: data.artist,
				sk: lf_session.key,
				track: data.name
			};
			if (data.album) {
				params.album = data.album;
			}
			if (data.host != 'we7') {
				params.duration = data.duration / 1000;
			}
			if (data.name.length && data.artist.length) {
				sendRequest('track.updateNowPlaying', params);
			}
		}
	}
}


function user_get_info (user) {
	var params = {
			api_key: api_key,
			user: user
		};
	sendRequest('user.getInfo', params, function (data) {
		localStorage.lf_image = $('user image[size="small"]', data).text();
		sendMessage('initUserForm', null);
	});
}


function user_get_session (token) {
	var params = {
			api_key: api_key,
			token: token
		};
	if (token && token.length) {
		sendRequest('auth.getSession', params, user_get_session_callback);
	}
}


function user_get_session_callback (data, session) {
	if (data) {
		lf_session = {
			name: $('session name', data).text(),
			key: $('session key', data).text(),
			subscriber: $('session subscriber', data).text() == '1' ? true : false
		}
		lf_sessioncache[lf_session.name] = lf_session;
		localStorage.lf_sessioncache = JSON.stringify(lf_sessioncache);
	}
	localStorage.lf_session = JSON.stringify(lf_session);
	sendMessage('initUserForm', null);
}


function user_get_session_from_cache (user) {
	if (lf_sessioncache.hasOwnProperty(user)) {
		lf_session = lf_sessioncache[user];
		localStorage.lf_session = JSON.stringify(lf_session);
		sendMessage('initUserForm', null);
	}
	else {
		openAuthWindow();
	}
}


function user_logout () {
	localStorage.removeItem('lf_session');
	lf_session = null;
	sendMessage('initUserForm', null);
}


initialize();

