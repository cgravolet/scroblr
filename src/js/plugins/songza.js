"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var songza = Object.create(Plugin);

songza.init("songza", "Songza");

songza.test = function () {
    var domainTest = this.hostre.test(document.location.hostname);
    var playerTest = $("#player").length > 0;

	if (domainTest) {
		this.isNewSongza = /new\.songza\.com/i.test(document.location.hostname);
	}

    return domainTest && playerTest;
};

songza.scrape = function () {
	var $player = $("#player");
	var info    = {};

	if (this.isNewSongza) {
		info.artist = $(".miniplayer-info-artist-name a",
				$player).text().replace(/^by\s+/i, "");
		info.title = $(".miniplayer-info-track-title", $player).text();
		info.stopped = ($(".miniplayer-control-play-pause .ui-icon-ios7-play",
				$player).css("display") === "none" ? false : true);
		info.album = $(".miniplayer-info-album-title", $player).text().replace(
				/^from\s+/i, "");
		info.percent = $(".miniplayer-timeline-current-time", $player).width() /
				$(".miniplayer-timeline", $player).width();
	} else {
		info.artist  = $(".szi-artist", $player).text();
		info.title   = $(".szi-title", $player).text();
		info.stopped = ($(".player-play", $player).css("display") === 
				"none" ? false : true);
		info.percent = parseFloat($(".szi-progress .szi-bar", $player).width() /
				$(".szi-progress", $player).width());
	}

    return info;
};

module.exports = songza;
