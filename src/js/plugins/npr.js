"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var npr = Object.create(Plugin);

npr.init("npr", "NPR");

npr.test = function () {
    return (/npr\.org\//i).test(document.location.href);
};

npr.scrape = function () {
    var artist, title;
    var $player = $('#npr-player');
    var fullTitle = $player.find('.player-details .title').text();
    var titleParts = /^(.+), "(.+)"$/.exec(fullTitle);

    if (titleParts) {
      artist = titleParts[1];
      title = titleParts[2];
    } else {
      title = fullTitle;
      artist = '';
    }

    var $playerBasic = $player.find('.player-basic');
    var timeElapsed = $playerBasic.find('.time-elapsed').text();
    var timeTotal = $playerBasic.find('.time-total').text();
    return {
        artist:   artist,
        title:    title,
        stopped:  !$playerBasic.is('.is-playing'),
        duration: Utils.calculateDuration(timeTotal),
        elapsed:  Utils.calculateDuration(timeElapsed)
    };
};

module.exports = npr;
