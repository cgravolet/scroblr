"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var hoopla = Object.create(Plugin);

hoopla.init("hoopla", "Hoopla");

hoopla.test = function () {
    return (/\.hoopladigital\.com\/title\/\d+\?play/i).test(document.location.href);
};

hoopla.scrape = function () {
    var $playingRow = $('.playing');
    var durationText = $.trim($playingRow.find('.segment-duration').text() || "");
    var durationParts = /(?:(\d+)\smin)?\s*(?:(\d+)\ssec)?/.exec(durationText).slice(1);
    return {
        album:    $(".title").text(),
        artist:   $(".subheader").text(),
        duration: durationParts.reverse().reduce(function (sum, t, i) { return sum + parseInt(t) * Math.pow(60, i); }, 0) * 1000,
        title:    $playingRow.find('.segment-name').text()
    };
};

module.exports = hoopla;
