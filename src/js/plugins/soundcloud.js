"use strict";

var $          = require("jquery");
var Plugin     = require("../modules/Plugin");
var soundcloud = Object.create(Plugin);

soundcloud.init("soundcloud", "SoundCloud");

soundcloud.scrape = function () {
    var info, player, playing, soundcloudNext, compactArr;

    soundcloudNext = !!$("body > #app").length;

    if (soundcloudNext) {
        playing = $(".sc-button-play.sc-button-pause").not(".sc-button-medium").last();
        info = {
            stopped: !playing.length
        };

        if (!info.stopped) {
            if(playing.parents(".streamContext").length && playing.parents(".playlist").length){
                player        = playing.parents(".playlist").find(".active");
                compactArr    = player.find(".compactTrackListItem__content").text().split(/-(.+)?/);
                info.artist   = compactArr[0];
                info.title    = compactArr[1];
            } else {
                player        = playing.parents(playing.parents(".sound").length ? ".sound" : ".trackList__item");
                info.artist   = player.find(".soundTitle__username").text();
                info.title    = player.find(".soundTitle__title").text();
            }
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

module.exports = soundcloud;
