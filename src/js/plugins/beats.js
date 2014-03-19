"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var Beats  = Object.create(Plugin);

Beats.init("beats", /listen\.beatsmusic\.com/i);

Beats.scrape = function () {
    var player = $("#app__transport");
    var durationElapsed = $.trim($(".horizontal_bar__handle").text()).split(" | ");
    var info = {};

    if (!player.length) {
        return false;
    }

    if (durationElapsed.length === 2) {
        info.duration = Utils.calculateDuration(durationElapsed[1]);
        info.elapsed  = Utils.calculateDuration(durationElapsed[0]);
    }

    info.artist   = $(".artist-track-target .artist", player).text();
    info.stopped  = $("#play_pause_icon").hasClass("icon-bicons_play");
    info.title    = $(".artist-track-target .track", player).text();

    return info;
};

module.exports = Beats;