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
    
    var songTitle = $details.find(".title").text();     // try to check for / fix truncated titles
    if (songTitle.match(/\.\.\.$/)) {
        if ($(".currentlyPlaying").length) {
            songTitle = $(".currentlyPlaying td.titleCell").attr("title");
        }
        else if ($(".moreLikeThis").length) {
            var moreLike = $(".moreLikeThis a").attr("href");
            songTitle = moreLike.split("/title=")[1].split("/artist")[0];
        }
        else if ($(".recTriggerReason").length) {
            songTitle = $(".recTriggerReason").text()
                .replace("You are listening to ", "").replace(/\.$/, "");
        }               
    }

    return {
        album:    $addlDetails.find("span:last-child a").text(),
        artist:   $details.find(".artistLink").attr("title"),
        duration: Utils.calculateDuration($status.find("#currentDuration").text()),
        elapsed:  Utils.calculateDuration($status.find("#currentTime").text()),
        stopped:  $mp3Controls.find(".mp3MasterPlayGroup .mp3MasterPlay").hasClass("icon-play"),
        title:    songTitle
    };
};

module.exports = amazon;
