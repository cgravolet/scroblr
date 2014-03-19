"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Vk     = Object.create(Plugin);

Vk.init("vk");

Vk.scrape = function () {
    var gpPlay = $("#gp_play");
    var isPlaying = gpPlay && gpPlay.hasClass("playing");
    var info = {
        stopped: !isPlaying
    };

    if (isPlaying) {
        info.artist = $("#gp_performer").text();
        info.title =  $("#gp_title").text();
    }

    return info;
};

module.exports = Vk;
