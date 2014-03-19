"use strict";

var $          = require("jquery");
var Plugin     = require("../modules/Plugin");
var Soundcloud = Object.create(Plugin);

Soundcloud.init("soundcloud");

Soundcloud.scrape = function () {
    var info, player, playing, soundcloudNext;

    soundcloudNext = !!$("body > #app").length;

    if (soundcloudNext) {
        playing = $(".sc-button-play.sc-button-pause");
        info = {
            stopped: !playing.length
        };

        if (!info.stopped) {
            player        = playing.parents(".sound");
            info.artist   = player.find(".soundTitle__username").text();
            info.title    = player.find(".soundTitle__title").text();
        }
    } else {
        playing = $(".play.playing");
        info = {
            stopped: !playing.length
        };

        if (!info.stopped) {
            player        = playing.parents("div.player");
            info.artist   = player.find(".user-name").text();
            info.title    = player.find("h3 a").text();
        }
    }

    return info;
};

module.exports = Soundcloud;
