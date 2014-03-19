"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var sony   = Object.create(Plugin);

sony.init("sony", "Sony Music Unlimited",
        /music\.sonyentertainmentnetwork\.com/i);

sony.test = function () {
    var domainTest, pathnameTest;

    domainTest = this.hostre.test(document.location.hostname);
    pathnameTest = !/\.html$/.test(document.location.pathname);
    return domainTest && pathnameTest;
};

sony.scrape = function () {

    // Player has not been rendered yet
    if ($(".GEKKVSQBLV").length === 0) {
        return {stopped: true};
    }

    var xy = $("#PlayerPlayPause").css("background-position");
    // Paused: "-433px -25px" or "-387px -62px"
    // Playing: "-479px -25px" or "-433px -62px"
    var stopped = xy === "-433px -25px" || xy === "-387px -62px";
    var elapsed = $("#PlayerPosition").text();

    // No track has started yet
    if (stopped && elapsed === "0:00") {
        return {stopped: true};
    }

    return {
        artist:   $(".GEKKVSQBCY .gwt-InlineLabel").text(),
        elapsed:  Utils.calculateDuration(elapsed),
        duration: Utils.calculateDuration($("#PlayerDuration").text()),
        stopped:  stopped,
        album:    $(".GEKKVSQBH- .gwt-InlineLabel").text(),
        title:    $(".GEKKVSQBP- .gwt-InlineLabel").text()
    };
};

module.exports = sony;
