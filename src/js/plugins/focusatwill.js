"use strict";

var $           = require("jquery");
var Plugin      = require("../modules/Plugin");
var Focusatwill = Object.create(Plugin);

Focusatwill.init("focusatwill");

Focusatwill.test = function () {
    var domainMatch = this.hostre.test(document.location.hostname);
    var playerFound = $("#home-body .trackDetail").length > 0;

    return domainMatch && playerFound;
};

Focusatwill.scrape = function () {
    var $body   = $("#home-body");
    var $header = $("#home-header");

    return {
        artist:  $(".trackDetail .artist", $body).text().split(":")[1],
        stopped: $(".playerControls .play", $header).data("player-state") === "stopped",
        title:   $(".trackDetail .track", $body).text()
    };
};

module.exports = Focusatwill;
