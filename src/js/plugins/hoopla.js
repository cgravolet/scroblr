"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var hoopla = Object.create(Plugin);

hoopla.init("hoopla", "hoopla");

hoopla.test = function () {
    return (/\.hoopladigital\.com\/title\/\d+\?play/i).test(document.location.href);
};

hoopla.scrape = function () {
    var $playingRow = $('.playing');
    return {
        album:    $(".title").text(),
        artist:   $(".subheader").text(),
        duration: Utils.calculateDuration($.trim($playingRow.find('.segment-duration').text() || "").replace(/\smin\s*/, ':').replace(' sec', '')),
        title:    $playingRow.find('.segment-name').text()
    };
};

module.exports = hoopla;
