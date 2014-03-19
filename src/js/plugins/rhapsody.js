"use strict";

var $        = require("jquery");
var Plugin   = require("../modules/Plugin");
var Utils    = require("../modules/Utilities");
var Rhapsody = Object.create(Plugin);

Rhapsody.init("rhapsody");

Rhapsody.test = function () {
    var napster  = /napster\.[A-Z\.]{2,}/i.test(document.location.hostname);
    var rhapsody = /rhapsody\.com/i.test(document.location.hostname);
    return (rhapsody || napster);
};

Rhapsody.scrape = function () {
    return {
        artist:   $("#player-artist-link").text(),
        duration: Utils.calculateDuration($("#player-total-time").text()),
        elapsed:  Utils.calculateDuration($("#player-current-time").text()),
        stopped:  $("#player-play").css("display") === "block",
        title:    $("#player-track-link").text()
    };
};

module.exports = Rhapsody;
