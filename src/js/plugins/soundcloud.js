"use strict";

var $          = require("jquery");
var Plugin     = require("../modules/Plugin");
var Utils      = require("../modules/Utilities");
var soundcloud = Object.create(Plugin);

soundcloud.init("soundcloud", "SoundCloud", new RegExp("soundcloud\\.com", "i"));

soundcloud.scrape = function () {

    var artist = document.querySelectorAll(".playbackSoundBadge__titleContextContainer a.playbackSoundBadge__lightLink")[0].getAttribute("title"),
        title = document.querySelectorAll(".playbackSoundBadge__title a.playbackSoundBadge__titleLink")[0].getAttribute("title"),
        elapsed = Utils.calculateDuration(document.querySelectorAll(".playbackTimeline__timePassed span[aria-hidden=true]")[0].innerText),
        duration = Utils.calculateDuration(document.querySelectorAll(".playbackTimeline__duration span[aria-hidden=true]")[0].innerText),
        percent = elapsed / duration,
        stopped = document.querySelectorAll(".playControl.playing").length === 0;

    var state = {
        artist: artist,
        title: title,
        elapsed: elapsed,
        duration: duration,
        percent: percent,
        stopped: stopped,
    };

    return state;

};

module.exports = soundcloud;
