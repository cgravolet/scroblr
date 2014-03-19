"use strict";

var $           = require("jquery");
var Plugin      = require("../modules/Plugin");
var focusatwill = Object.create(Plugin);

focusatwill.init("focusatwill", "Focus@Will");

focusatwill.test = function () {
    var domainMatch = this.hostre.test(document.location.hostname);
    var playerFound = $("#home-body .trackDetail").length > 0;

    return domainMatch && playerFound;
};

focusatwill.scrape = function () {
    var $body  = $("#home-body");
    var artist = $(".trackDetail .artist", $body).text().split(":");
    var title  = $(".trackDetail .track", $body).text();

	if (artist.length > 1) {
		return {
			artist: artist[1],
			title:  title
		};
	}

	return {
		reset: true
	};
};

module.exports = focusatwill;
