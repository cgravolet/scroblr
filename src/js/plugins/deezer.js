"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var deezer = Object.create(Plugin);

deezer.init("deezer", "Deezer");

deezer.test = function () {
    return (/deezer\.com\//i).test(document.location.href);
};

deezer.scrape = function () {
    return {
        artist:   $('.player-track-link').eq(1).text(),
        duration: Utils.calculateDuration($('.player-progress .progress-length').text() || ""),
        elapsed:  Utils.calculateDuration($('.player-progress .progress-time').text() || ""),
        title:    $('.player-track-title').text(),
        stopped:  $('.player .control-pause').size() < 1
    };
};

module.exports = deezer;
