"use strict";

var $           = require("jquery");
var Plugin      = require("../modules/Plugin");
var Utils       = require("../modules/Utilities");
var pocketcasts = Object.create(Plugin);

pocketcasts.init("pocketcasts", "Pocket Casts", new RegExp("play\\.pocketcasts\\.com", "i"));

pocketcasts.scrape = function () {
	var elapsed = Utils.calculateDuration($('.current_time').filter(':visible').text());
	var duration = $('.seek_bar').attr('duration') * 1000; // Convert seconds to milliseconds.
	var percent = elapsed / duration;

	var state = {
		artist:   $('.player_podcast_title').filter(':visible').text(),
		title:    $('.player_episode').filter(':visible').text(),
		elapsed:  elapsed,
		duration: duration,
		percent:  percent,
		stopped:  $('.play_pause_button').hasClass('play_button')
	};

	//console.log(state);

	return state;
};

module.exports = pocketcasts;
