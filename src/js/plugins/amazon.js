"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var Amazon = Object.create(Plugin);

Amazon.init("amazon");

Amazon.test = function () {
    return (/amazon\.[A-Z\.]{2,}\/gp\/dmusic/i).test(document.location.href);
};

Amazon.scrape = function () {
    return {
        artist:   $("#nowPlayingSection .currentSongDetails .title").next().text().substring(3),
        duration: Utils.calculateDuration($("#nowPlayingSection .currentSongStatus #currentTime").next().next().text()),
        stopped:  $("#mp3Player .mp3Player-MasterControl .mp3MasterPlayGroup").hasClass("paused"),
        title:    $("#nowPlayingSection .currentSongDetails .title").text()
    };
};

module.exports = Amazon;