"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var google = Object.create(Plugin);

google.init("google", "Google Play");

google.test = function () {
    return (/play\.google\.[A-Z\.]{2,}\/music\/listen/i).test(document.location.href);
};

google.scrape = function () {
    return {
        album:    $(".player-album").text(),
        artist:   $("#player-artist").text(),
        duration: Utils.calculateDuration($("#time_container_duration").text() || ""),
        elapsed:  Utils.calculateDuration($("#time_container_current").text() || ""),
        title:    $("#playerSongTitle").text(),
        stopped:  !$('button[data-id="play-pause"]').hasClass("playing")
    };
};

module.exports = google;
