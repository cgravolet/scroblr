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
        album:    $("#nowPlayingSection .currentSongAdditionalDetails span:last-child a").text(),
        artist:   $("#nowPlayingSection .currentSongAdditionalDetails span:first-child a").text(),
        duration: Utils.calculateDuration($("#nowPlayingSection .currentSongStatus #currentDuration").text()),
        elapsed:  Utils.calculateDuration($("#nowPlayingSection .currentSongStatus #currentTime").text()),
        stopped:  $("#mp3Player .mp3Player-MasterControl .mp3MasterPlayGroup .mp3MasterPlay").hasClass("icon-play"),
        title:    $("#nowPlayingSection .currentSongDetails .title").text()
    };
};

module.exports = amazon;
