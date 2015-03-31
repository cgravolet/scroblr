"use strict";

var $        = require("jquery");
var Plugin   = require("../modules/Plugin");
var Utils    = require("../modules/Utilities");
var rhapsody = Object.create(Plugin);

rhapsody.init("rhapsody", "Rhapsody");

rhapsody.test = function () {
    var napster  = /napster\.[A-Z\.]{2,}/i.test(document.location.hostname);
    var rhapsody = /rhapsody\.com/i.test(document.location.hostname);
    return (rhapsody || napster);
};

rhapsody.scrape = function () {
    var timerArray = $(".player-time").text().trim().split("/");
    var elapsed = timerArray[0];
    var duration = timerArray[1];

    return {
        artist:   $(".player-artist").text().split("- ")[1].trim(),
        title:    $(".player-track").text().trim(),
        stopped:  $(".icon-play").attr("title") === "Play",
        duration: Utils.calculateDuration(duration),
        elapsed:  Utils.calculateDuration(elapsed)
    };
};

module.exports = rhapsody;
