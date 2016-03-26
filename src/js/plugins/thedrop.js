"use strict";

var $       = require("jquery");
var Plugin  = require("../modules/Plugin");
var Utils   = require("../modules/Utilities");
var thedrop = Object.create(Plugin);

thedrop.init("thedrop", "The Drop", new RegExp("thedrop\\.club", "i"));

thedrop.scrape = function () {
    var $player = $(".player--body");
    var info =  {
        artist:  $(".artist-name", $player).text(),
        title:   $(".track-title", $player).text(),
        stopped: $(".controls .glyphicon-play", $player).length > 0,
        elapsed: Utils.calculateDuration($(".progress-bar .progress").text()),
        percent: Math.round($(".progress-bar > .progress").width() / $(".progress-bar").width() * 100) / 100
    };
    return info;
};

module.exports = thedrop;

