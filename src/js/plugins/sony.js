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
    var player = $("#PlayerPlayPause").parent().parent();
    // Player has not been rendered yet
    if (player.length === 0) {
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

    var playerLabels = player.find('.gwt-InlineLabel');

    return {
        artist:   playerLabels[2].innerText,
        elapsed:  Utils.calculateDuration(elapsed),
        duration: Utils.calculateDuration($("#PlayerDuration").text()),
        stopped:  stopped,
        album:    playerLabels[1].innerText,
        title:    playerLabels[0].innerText,
    };
};

module.exports = sony;
