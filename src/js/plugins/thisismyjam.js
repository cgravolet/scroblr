"use strict";

var $           = require("jquery");
var Plugin      = require("../modules/Plugin");
var Utils       = require("../modules/Utilities");
var thisismyjam = Object.create(Plugin);

thisismyjam.init("thisismyjam", "This Is My Jam", null,
		"*://*.thisismyjam.com/*");

thisismyjam.test = function () {
    var domainMatch = this.hostre.test(document.location.hostname);
    var playerFound = $("#player-bar").length > 0;

    return domainMatch && playerFound;
};

thisismyjam.scrape = function () {
    return {
        artist:   $("#player-bar #artist-name").text(),
        duration: Utils.calculateDuration($("#player-bar #totalTime").text().replace(/[^0-9:]+/g, "")),
        elapsed:  Utils.calculateDuration($("#player-bar #currentTime").text()),
        stopped:  $("#player-bar #playPause").hasClass("paused"),
        title:    $("#player-bar #track-title").text()
    };
};

module.exports = thisismyjam;
