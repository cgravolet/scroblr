"use strict";

var $ = require("jquery"),
    Utilites = require("../modules/Utilities"),
    di = Object.create(require("../modules/Plugin"));

di.init("di", "Digitally Imported");

di.test = function () {
    return /www\.di\.fm/i.test(document.location.hostname);
};

di.scrape = function () {
    var timecode = $('.timecode').text().split(' / '),
        track = $('.track-name .artist-name'),
        stopped = track.length === 0;

    return {
        artist: track.text().replace(/\s+-\s+$/, ''),
        title: $.trim(stopped ? "" : track[0].nextSibling.nodeValue),
        elapsed: Utilites.calculateDuration(timecode[0]),
        duration: Utilites.calculateDuration(timecode[1]),
        stopped: stopped
    };
};

module.exports = di;

