"use strict";

var $      = require("jquery");
var conf   = require("../conf.json");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var tidal  = Object.create(Plugin).init("tidal", "Tidal");

tidal.test = function () {
    return /listen\.tidalhifi\.com/i.test(document.location.hostname);
};

tidal.scrape = function () {
    var $player = $(".player");

    if (!$player) {
        return null;
    }

    return {
        artist: $("[data-bind='artist'] [data-bind='name']", $player).text(),
        duration: Utils.calculateDuration($(".progress-bar .progress-duration", $player).text()),
        elapsed: Utils.calculateDuration($(".progress-bar .progress-progress", $player).text()),
        stopped: $(".play-controls .js-play", $player).css("display") !== "none",
        title: $("[data-bind='title']", $player).text()
    };
};

module.exports = tidal;

