var isJango = (window.location.hostname.toLowerCase().indexOf('jango') >= 0 ? true : false),
	isJangoPlayer = (isJango && $('#player_info').length ? true : false),
	scroblr;

if (!isJango || isJangoPlayer) {

	scroblr = (function () {


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

		
		function calculateDuration (timestring) {
			var seconds = 0;
			for (var i = 0, max = arguments.length; i < max; i += 1) {
				if (arguments[i].toString().length) {
					seconds += (parseFloat(arguments[i].split(':')[0].replace('-', '')) * 60) + parseFloat(arguments[i].split(':')[1]);
				}
			}
			return seconds * 1000;
		}


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

					accuradio: function () {
						return {
							album: $('#span_information_album').text(),
							artist: $('#span_information_artist').text(),
							name: $('#span_information_title').text(),
							stopped: $('#player_lowest_controls_wrapper #play').length ? true : false
						};
					},

					amazon: function () {
						return {
							artist: $('#nowPlayingSection .currentSongDetails .title').next().text().substring(3),
							duration: calculateDuration($('#nowPlayingSection .currentSongStatus #currentTime').next().next().text()),
							name: $('#nowPlayingSection .currentSongDetails .title').text(),
							stopped: $('#mp3Player .mp3Player-MasterControl .mp3MasterPlayGroup').hasClass('paused')
						};
					},

					bandcamp: function () {
						var info = {
								stopped: (!$('.inline_player .playbutton').hasClass('playing'))
							},
							istrack = (document.location.pathname.indexOf('/track') >= 0),
							pagetitle = $('title').text().split('|');
						if (!info.stopped) {
							info.artist = $.trim(pagetitle[pagetitle.length-1]);
							info.duration = calculateDuration($('.inline_player .track_info .time').text().split('/')[1]);
							info.name = istrack ? $(".trackTitle").first().text() : $(".track_info .title").text();
						}
						return info;
					},

					google: function () {
						return {
							artist: $('#playerArtist .fade-out-content').attr('title'),
							duration: calculateDuration($('#duration').text()),
							name: $('#playerSongTitle .fade-out-content').attr('title'),
							stopped: ($('#playPause').attr('title') == 'Play')
						};
					},

					grooveshark: function () {
						return {
							album: $('#playerDetails_nowPlaying .album').attr('title'),
							artist: $('#playerDetails_nowPlaying .artist').attr('title'),
							duration: calculateDuration($('#player #player_duration').text()),
							name: $('#playerDetails_nowPlaying .currentSongLink').attr('title'),
							stopped: $('#player #player_play_pause').hasClass('play')
						};
					},

					jango: function () {
						return {
							artist: $.trim($('#player_info #player_current_artist').contents().last().text()),
							duration: calculateDuration($('#player_info #timer').text().substring(1)),
							name: $('#player_info #current-song').text().replace(/^\s+/, '').replace(/\s+$/, ''),
							stopped: $('#btn-playpause').hasClass('pause')
						};
					},

					pandora: function () {
						function stripChildrensLabel (string) {
							return string.replace(/\s+\(Children's\)$/i, '');
						}
						function stripHolidayLabel (string) {
							return string.replace(/\s+\(Holiday\)$/i, '');
						}
						function cleanseArtist (string) {
							var artist = stripChildrensLabel(string);
							return stripHolidayLabel(artist);
						}
						return {
							album: $('#playerBar .playerBarAlbum').text(),
							artist: cleanseArtist($('#playerBar .playerBarArtist').text()),
							duration: calculateDuration($('#playbackControl .elapsedTime').text(), $('#playbackControl .remainingTime').text()),
							elapsed: calculateDuration($('#playbackControl .elapsedTime').text()),
							name: $('#playerBar .playerBarSong').text(),
							stopped: $('#playerBar .playButton').is(':visible')
						};
					},

					rhapsody: function () {
						return {
							artist: $('#player-artist-link').text(),
							duration: calculateDuration($('#player-total-time').text()),
							elapsed: calculateDuration($('#player-current-time').text()),
							name: $('#player-track-link').text(),
							stopped: ($('#player-play').css('display') == 'block')
						};
					},

					turntable: function () {
						var info = {};
						if ($('#songboard_artist').text().length) {
							info.artist = $('#room-info-tab .song:first-child .details div:first-child').text().split(' - ');
							info.duration = calculateDuration(info.artist.pop());
							info.artist = info.artist.join(' - ');
							info.name = $('#room-info-tab .song:first-child .title').text();
							info.score = parseFloat($('#room-info-tab .song:first-child .details div.score').text().replace(/[^0-9]+/g, ''));
						}
						return info;
					},

					twonky: function () {
						if ($('.meta_title').text().length) {
							return {
								album: $('.meta_album').text(),
								artist: $.trim($('.meta_artist').text()),
								duration: calculateDuration($('.meta_duration').text()),
								name: $.trim($('.meta_title').text()),
								stopped: $('.trackPlayerButtonIcon').hasClass('play')
							};
						}
					},

					we7: function () {
						return {
							artist: $('.chugger-current .chugger-track-details .artist-name').text(),
							duration: 300000,
							elapsed: Math.floor(($('#played-bar').width() / $('#timeline-bar').width()) * 300000),
							name: $('.chugger-current .chugger-track-details .track-name').text(),
							stopped: $('.player-bar-button').hasClass('play') 
						};
					}

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
			var host = false;
			if (window.location.hostname.toLowerCase().indexOf('accuradio') >= 0) {
				host = 'accuradio';
			}
			else if (window.location.hostname.toLowerCase().indexOf('amazon') >= 0 && window.location.pathname.indexOf('music') >= 0) {
				host = 'amazon';
			}
			else if (window.location.hostname.toLowerCase().indexOf('bandcamp') >= 0) {
				host = 'bandcamp';
			}
			else if (window.location.hostname.toLowerCase().indexOf('google') >= 0) {
				host = 'google';
			}
			else if (window.location.hostname.toLowerCase().indexOf('grooveshark') >= 0) {
				host = 'grooveshark';
			}
			else if (window.location.hostname.toLowerCase().indexOf('jango') >= 0) {
				host = 'jango';
			}
			else if (window.location.hostname.toLowerCase().indexOf('pandora') >= 0) {
				host = 'pandora';
			}
			else if (window.location.hostname.toLowerCase().indexOf('rhapsody') >= 0) {
				if ($('#container').length) {
					host = 'rhapsody';
				}
			}
			else if (window.location.hostname.toLowerCase().indexOf('turntable') >= 0) {
				host = 'turntable';
			}
			else if (window.location.hostname.toLowerCase().indexOf('twonky') >= 0) {
				if ($('body.musicDashboard').length) {
					host = 'twonky';
				}
			}
			else if (window.location.hostname.toLowerCase().indexOf('we7') >= 0) {
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
				if (currentsong.duration > song.duration) {
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


		// Initialize on document ready
		$(function () {
			init();
		});


		return {
			getCurrentSongInfo: getCurrentSongInfo
		};


	}());

}

