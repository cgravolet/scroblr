"use strict";

var $       = require("jquery");
var Plugin  = require("../modules/Plugin");
var Utils   = require("../modules/Utilities");
var pandora = Object.create(Plugin);

pandora.init("pandora");

pandora.test = function () {
    var domainMatch = this.hostre.test(document.location.hostname);
    var playerFound = $("#playerBar").length > 0;

    return domainMatch && playerFound;
};

pandora.scrape = function () {
    return {
        album:    $("#playerBar .playerBarAlbum").text(),
        artist:   cleanseArtist($("#playerBar .playerBarArtist").text()),
        duration: Utils.calculateDuration($("#playbackControl .elapsedTime").text(), $("#playbackControl .remainingTime").text()),
        elapsed:  Utils.calculateDuration($("#playbackControl .elapsedTime").text()),
        stopped:  $("#playerBar .playButton").css("display") === "block",
        title:    $("#playerBar .playerBarSong").text()
    };
};

/*
 * Sometimes, pandora appends labels to the artist name such as
 * "Artist (Holiday)" or "Artist (Children's)".
 */
function cleanseArtist(string) {
    return stripChildrensLabel(stripHolidayLabel(string));
}

function stripChildrensLabel(string) {
    return string.replace(/\s+\(Children's\)$/i, "");
}

function stripHolidayLabel(string) {
    return string.replace(/\s+\(Holiday\)$/i, "");
}

module.exports = pandora;
