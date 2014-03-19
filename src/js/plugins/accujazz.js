"use strict";

var $        = require("jquery");
var Plugin   = require("../modules/Plugin");
var accujazz = Object.create(Plugin);

accujazz.init("accujazz", "AccuJazz");

accujazz.test = function () {
    return document.location.href.indexOf("slipstreamradio.com/pop_player/") >= 0;
};

accujazz.scrape = function () {
    var artist = $("#span_information_artist").text() || "";

    if (artist.indexOf("Click here") >= 0) {
        artist = "";
    }

    return {
        album:   $("#span_information_album").text(),
        artist:  artist,
        title:   $("#span_information_title").text()
    };
};

module.exports = accujazz;
