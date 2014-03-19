"use strict";

var $       = require("jquery");
var Plugin  = require("../modules/Plugin");
var Utils   = require("../modules/Utilities");
var Pandora = Object.create(Plugin);

Pandora.init("pandora");

Pandora.test = function () {
    var domainMatch = this.hostre.test(document.location.hostname);
    var playerFound = $("#playerBar").length > 0;

    return domainMatch && playerFound;
};

Pandora.scrape = function () {
    return {
        album:    $("#playerBar .playerBarAlbum").text(),
        artist:   cleanseArtist($("#playerBar .playerBarArtist").text()),
        duration: Utils.calculateDuration($("#playbackControl .elapsedTime").text(), $("#playbackControl .remainingTime").text()),
        elapsed:  Utils.calculateDuration($("#playbackControl .elapsedTime").text()),
        stopped:  $("#playerBar .playButton").css("display") === "block",
        title:    $("#playerBar .playerBarSong").text()
    };
};

function cleanseArtist(string) {
    var artist = stripChildrensLabel(string);
    return stripHolidayLabel(artist);
}

function stripChildrensLabel(string) {
    return string.replace(/\s+\(Children's\)$/i, "");
}

function stripHolidayLabel(string) {
    return string.replace(/\s+\(Holiday\)$/i, "");
}

module.exports = Pandora;