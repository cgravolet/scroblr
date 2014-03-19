"use strict";

var $           = require("jquery");
var Plugin      = require("../modules/Plugin");
var eighttracks = Object.create(Plugin);

eighttracks.init("eighttracks", "8tracks", new RegExp("8tracks\\.com", "i"));

eighttracks.scrape = function () {
    return {
        album:   $("#player .track_metadata .album > .detail").text(),
        artist:  $("#player .title_artist > .a").text(),
        percent: parseFloat($("#player_progress_bar_meter").width() / $("#player_progress_bar").width()),
        stopped: $("#player_play_button").css("display") == "block",
        title:   $("#player .title_artist > .t").text()
    };
};

module.exports = eighttracks;