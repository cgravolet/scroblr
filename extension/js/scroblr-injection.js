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
							istrack = (document.location.pathname.indexOf('/track') >= 0);
						if (!info.stopped) {
							info.artist = $('span[itemprop="byArtist"]').text();
							info.duration = calculateDuration($('.inline_player .track_info .time_total').text());
							info.elapsed = calculateDuration($('.inline_player .track_info .time_elapsed').text());
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
							artist: $('#player_info #player_current_artist').contents().last().text(),
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

					playerfm: function() {

						var elapsedString       = $('.permaplayer .current .play-monitor .time-elapsed').text();
						var timeRemainingString = $('.permaplayer .current .play-monitor .time-remaining').text();

						return {
							artist:   $('.permaplayer .track-wrapper .current-series-link').text(),
							name:     $('.permaplayer .track-wrapper .current-episode-link').text(),
							elapsed:  calculateDuration(elapsedString),
							duration: calculateDuration(elapsedString, timeRemainingString),
							stopped:  $('.container .mainflow .playpause .icon-play').is(':visible')
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

					songza: function () {
						return {
							artist: $('#player .szi-roll-song .szi-info .szi-artist').text(),
							name: $('#player .szi-roll-song .szi-info .szi-title').text(),
							percent: parseFloat($('#player .szi-progress .szi-bar').width() / $('#player .szi-progress').width()),
							stopped: ($('#player .sz-player-state-pause').length > 0)
						};
					},

					soundcloud: function() {
						var soundcloudNext = $('body > #app').length > 0;

						if (soundcloudNext) {
							var playing = $('.sc-button-play.sc-button-pause'),
									info = {
										stopped: (playing.length == 0)
									};

							if (!info.stopped) {
								var player = playing.parents('.sound');

								info.artist = player.find('.soundTitle__username').text();
								info.duration = calculateDuration(player.find('.timeIndicator__total').text().replace('.', ':'));
								info.elapsed = calculateDuration(player.find('.timeIndicator__current').text().replace('.', ':'));
								info.name = player.find('.soundTitle__title').text();
							}
							return info;
						}
						else {
							var playing = $('.play.playing'),
									info = {
										stopped: (playing.length == 0)
									};

							if (!info.stopped) {
								var player = playing.parents('div.player');

								info.artist = player.find('.user-name').text();
								info.duration = calculateDuration(player.find('.timecodes span:last').text().replace('.', ':'));
								info.elapsed = calculateDuration(player.find('.timecodes span:first').text().replace('.', ':'));
								info.name = player.find('h3 a').text();
							}
							return info;
						}
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
								artist: $('.meta_artist').text(),
								duration: calculateDuration($('.meta_duration').text()),
								name: $('.meta_title').text(),
								stopped: $('.trackPlayerButtonIcon').hasClass('play')
							};
						}
					},

					we7: function () {
						return {
							artist: $('#track-marquee #track-title a').eq(0).text(),
							name: $('#track-marquee #track-title a').eq(1).text(),
							duration: calculateDuration($('#elapsed').text(), $('#remaining').text()),
							elapsed: calculateDuration($('#elapsed').text())
						};
					}

				};

			return $.extend(currentsong, scrape[host]());

		}


		function getElapsedTime (data) {
			var elapsed = data.elapsed;
			if (elapsed === 0) {
				var now = (new Date()).getTime() / 1000.0;
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
			else if (hostname.indexOf('soundcloud') >= 0) {
				host = 'soundcloud';
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
				if ($('#player-section').length) {
					host = 'we7';
				}
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

			currentsong.album = $.trim(currentsong.album);
			currentsong.artist = $.trim(currentsong.artist);
			currentsong.name = $.trim(currentsong.name);

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


		function sendMessage (name, message) {
			if (typeof chrome != 'undefined') {
				chrome.extension.sendMessage({
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

