"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var relevant = Object.create(Plugin);

relevant.init("relevant", "Relevant Magazine");

relevant.test = function () {
    return (/\.relevantmagazine.com\/the-drop\/*/i).test(document.location.href);
};

relevant.scrape = function () {
    var $playingRow = $('.media.audio').has('.cp-pause:visible');
    var progressStyle = $playingRow.find('.cp-progress-holder > div').filter(':visible').last().attr('style');
    var progressDegrees = /rotate\(([\d.]+)deg\)/.exec(progressStyle);
    return {
        album:    $(".titlecont h2").text(),
        artist:   $(".field-name-field-artist").text(),
        title:    $playingRow.find('.overflow').text(),
        stopped:  $('.album-art .cp-play').is(':visible'),
        duration: Utils.calculateDuration(($playingRow.find('.time').text() || "").replace(/[()]/g, '')),
        percent:  (progressDegrees || [null,0])[1] / 360
    };
};

module.exports = relevant;
