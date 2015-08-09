"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var groove = Object.create(Plugin).init("groove", "Groove Music", /music\.microsoft\.com/i);

groove.test = function () {
    var domainMatch = this.hostre.test(document.location.hostname);
    var playerFound = $("#player").length > 0;

    return domainMatch && playerFound;
};

groove.scrape = function () {
    var $player         = $("#player");
    var $playerControls = $(".playerControls", $player);
    var $playerDuration = $(".playerDuration", $player);
    var $playerMetadata = $(".playerNowPlayingMetadata:visible", $player);
    var artist          = $.trim($(".secondaryMetadata > a" ,$playerMetadata).attr("title"));
    var title           = $.trim($(".primaryMetadata > a" ,$playerMetadata).attr("title"));
    var duration        = $.trim($(".playerDurationTextRemaining", $playerDuration).text());
    var elapsed         = $.trim($(".playerDurationTextOnGoing", $playerDuration).text());
    var stopped         = $(".iconPlayerPlay", $playerControls).length ? true : false;

    if (!artist.length || !title.length || !duration.length) {
        return {};
    }

    return {
        artist:   artist,
        title:    title,
        duration: Utils.calculateDuration(duration),
        elapsed:  Utils.calculateDuration(elapsed),
        stopped:  stopped
    };
};

module.exports = groove;

