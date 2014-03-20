"use strict";

var $       = require("jquery");
var Plugin  = require("../modules/Plugin");
var earbits = Object.create(Plugin);

earbits.init("earbits", "Earbits");

earbits.test = function () {
    var domainMatch = this.hostre.test(document.location.hostname);
    var playerFound = $("#audio-controls").length > 0;

    return domainMatch && playerFound;
};

earbits.scrape = function () {
	var artist = $(".track-info .artist-name").text().split("-");
	var info = {
		artist:  artist.length > 1 ? $.trim(artist[1]) : "",
		stopped: $("#audio-controls .btn-playpause").hasClass("btn-play"),
		title:   $(".track-info .track-name").text()
	};

	// Calculate progress, if available
	var $progressBar = $("#audio-controls .progress-bar .ui-slider-range");
	var progress     = $progressBar.width();
	var progressMax  = $progressBar.parent().width();

	if (progress > 0) {
		info.percent = progress / progressMax;
	}

	return info;
};

module.exports = earbits;
