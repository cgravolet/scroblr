"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var amazon = Object.create(Plugin);

amazon.init("amazon", "Amazon Music");

amazon.test = function () {
    return (/music\.amazon\.[A-Z\.]{2,}/i).test(document.location.href);
};

amazon.scrape = function () {
    var $playbackInfo = $(".playbackControlsView");
    var $scrubber = $(".scrubberTrack .scrubber", $playbackInfo);

    return {
        artist:  $(".trackArtist > a", $playbackInfo).attr("title"),
        percent: Math.round($scrubber.width() / $scrubber.parent().width() * 100) / 100,
        stopped: $(".playbackControls span.playButton", $playbackInfo).hasClass("playerIconPlay"),
        title:   $(".trackTitle", $playbackInfo).text()
    };
};

module.exports = amazon;
