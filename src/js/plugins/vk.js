"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var vk     = Object.create(Plugin);

vk.init("vk");

vk.scrape = function () {
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

module.exports = vk;
