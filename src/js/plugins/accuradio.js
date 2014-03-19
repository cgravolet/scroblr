"use strict";

var $         = require("jquery");
var Plugin    = require("../modules/Plugin");
var Utils     = require("../modules/Utilities");
var Accuradio = Object.create(Plugin);

Accuradio.init("accuradio");

Accuradio.scrape = function () {
    var artist = $("#songartist").text() || "";

    if (artist.indexOf("Click here") >= 0) {
        artist = "";
    }

    return {
        album:   $("#songalbum").text(),
        artist:  artist,
        title:   $("#songtitle").text(),
        stopped: $("#playerPlayButton").length ? true : false
    };
};

module.exports = Accuradio;