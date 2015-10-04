"use strict";

var $          = require("jquery");
var Plugin     = require("../modules/Plugin");
var dubtrackfm = Object.create(Plugin);

dubtrackfm.init("dubtrackfm", "Dubtrack.fm", new RegExp("dubtrack\\.fm", "i"));

dubtrackfm.scrape = function () {
    var info   = {};
    var player = $("#player-controller");
    var track  = $(".infoContainer .currentSong", player).text();

    if (player.length > 0 && track.indexOf(" - ") >= 0) {
        var trackArr = track.split(" - ");
        var percent  = $(".progressBg", player).width() / $(".infoContainer",
                player).outerWidth();

        info.artist  = trackArr[0];
        info.title   = trackArr[1];
        info.percent = percent;
    }

    return info;
};

module.exports = dubtrackfm;
