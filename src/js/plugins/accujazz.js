"use strict";

var $        = require("jquery");
var Plugin   = require("../modules/Plugin");
var Utils    = require("../modules/Utilities");
var Accujazz = Object.create(Plugin);

Accujazz.init("accujazz");

Accujazz.test = function () {
    return document.location.href.indexOf("slipstreamradio.com/pop_player/") >= 0;
};

Accujazz.scrape = function () {
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

module.exports = Accujazz;
