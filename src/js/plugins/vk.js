"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var vk     = Object.create(Plugin);

vk.init("vk", "VK");

vk.scrape = function () {
    var info = { stopped: true };

    var player = $("#top_audio_player");
    if(!player.length) { return info; }

    var playing = player.hasClass("top_audio_player_playing");
    if(!playing) { return info; }

    var title =
        player
            .find('.top_audio_player_title')
            .text()
            .split('–'); // Unicode: EN DASH
    if(title.length != 2) { return info; }

    info.stopped = false;
    info.artist  = title[0];
    info.title   = title[1];

    return info;
};

module.exports = vk;
