"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var amazon = Object.create(Plugin);

amazon.init("amazon", "Amazon Cloud Player");

amazon.test = function () {
    return (/amazon\.[A-Z\.]{2,}\/gp\/dmusic/i).test(document.location.href);
};

amazon.scrape = function () {
    return {
        artist:   $("#nowPlayingSection .currentSongDetails .title").next().text().substring(3),
        duration: Utils.calculateDuration($("#nowPlayingSection .currentSongStatus #currentTime").next().next().text()),
        stopped:  $("#mp3Player .mp3Player-MasterControl .mp3MasterPlayGroup").hasClass("paused"),
        title:    $("#nowPlayingSection .currentSongDetails .title").text()
    };
};

module.exports = amazon;