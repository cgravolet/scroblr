"use strict";

var $ = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils = require("../modules/Utilities");
var grooveshark = Object.create(Plugin);

grooveshark.init("grooveshark", "Grooveshark");

grooveshark.test = function () {
    return /grooveshark\.com/.test(document.location.href);
};

grooveshark.scrape = function () {
    values = {
        stopped: !$("#play-pause").attr("class").match(/playing/),
        duration: Utils.calculateDuration($("#time-total").text()),
        elapsed: Utils.calculateDuration($("#time-elapsed").text()),
        title: $(".now-playing-link.song").text(),
        artist: $(".now-playing-link.artist").text()
    }
    values.percent = values.elapsed / values.duration;
    return values;
}

module.exports = grooveshark;