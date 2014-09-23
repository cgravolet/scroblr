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
    var $mp3Player   = $("#mp3Player");
    var $nowPlaying  = $("#nowPlayingSection");
    var $addlDetails = $nowPlaying.find(".currentSongAdditionalDetails");
    var $details     = $nowPlaying.find(".currentSongDetails");
    var $status      = $nowPlaying.find(".currentSongStatus");
    var $mp3Controls = $mp3Player.find(".mp3Player-MasterControl");

    return {
        album:    $addlDetails.find("span:last-child a").text(),
        artist:   $details.find(".artistLink").attr("title"),
        duration: Utils.calculateDuration($status.find("#currentDuration").text()),
        elapsed:  Utils.calculateDuration($status.find("#currentTime").text()),
        stopped:  $mp3Controls.find(".mp3MasterPlayGroup .mp3MasterPlay").hasClass("icon-play"),
        title:    $details.find(".title").text()
    };
};

module.exports = amazon;
