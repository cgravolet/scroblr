"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var spotify = Object.create(Plugin);

spotify.init("spotify", "Spotify");

spotify.test = function () {
    return (/play\.spotify\.com\//i).test(document.location.href);
};

spotify.scrape = function () {
    return {
        artist:   $('#app-player').contents().find('#track-artist a').first().text(),
        duration: Utils.calculateDuration($('#app-player').contents().find('#track-length').first().text() || ""),
        elapsed:  Utils.calculateDuration($('#app-player').contents().find('#track-current').first().text() || ""),
        title:    $('#app-player').contents().find('#track-name a').first().text(),
        stopped:  !$('#app-player').contents().find('#play-pause').hasClass("playing")
    };
};

module.exports = spotify;
