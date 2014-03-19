"use strict";

var $         = require("jquery");
var Plugin    = require("../modules/Plugin");
var accuradio = Object.create(Plugin);

accuradio.init("accuradio");

accuradio.scrape = function () {
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

module.exports = accuradio;