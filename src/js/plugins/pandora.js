"use strict";

var $       = require("jquery");
var Plugin  = require("../modules/Plugin");
var Utils   = require("../modules/Utilities");
var pandora = Object.create(Plugin);

pandora.init("pandora", "Pandora");

pandora.test = function () {
    var domainMatch = this.hostre.test(document.location.hostname);
    var playerFound = $(".Container").length > 0;

    return domainMatch && playerFound;
};

pandora.scrape = function () {
    return {
        album:    $("a[data-qa='playing_album_name']").text(),
        artist:   cleanseArtist($("a[data-qa='playing_artist_name']").text()),
        duration: Utils.calculateDuration($("span[data-qa='remaining_time']").text()),
        elapsed:  Utils.calculateDuration($("span[data-qa='elapsed_time']").text()),
        stopped:  $("button[data-qa='play_button']").length > 0,
        title:    $(".Marquee__wrapper__content").text()
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
