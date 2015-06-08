"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var xbox   = Object.create(Plugin).init("xbox", "Xbox Music", /music\.xbox\.com/i);

xbox.scrape = function () {
    var $player         = $("#player");
    var $playerControls = $(".playerControls", $player);
    var $playerDuration = $(".playerDuration", $player);
    var $playerMetadata = $(".playerNowPlayingMetadata:visible", $player);
    var artist          = $(".secondaryMetadata > a" ,$playerMetadata).attr("title");
    var title           = $(".primaryMetadata > a" ,$playerMetadata).attr("title");
    var duration        = $(".playerDurationTextRemaining", $playerDuration).text();
    var elapsed         = $(".playerDurationTextOnGoing", $playerDuration).text();
    var stopped         = $(".iconPlayerPlay", $playerControls).length ? true : false;

    return {
        artist:   artist,
        title:    title,
        duration: Utils.calculateDuration(duration),
        elapsed:  Utils.calculateDuration(elapsed),
        stopped:  stopped
    };
};

module.exports = xbox;

