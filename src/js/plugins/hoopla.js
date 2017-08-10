"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var hoopla = Object.create(Plugin);

hoopla.init("hoopla", "Hoopla");

hoopla.test = function () {
    return (/\.hoopladigital\.com\//i).test(document.location.href);
};

hoopla.scrape = function () {
    var $progressSection = $('div[value]');
    if ($progressSection.length === 0) {
        return {};
    }

    var $progress = $progressSection.find('input[step]');
    var durationInSeconds = $progress.attr('max');
    var elapsedInSeconds = $progress.val();

    var $trackInfo = $progressSection.prev();
    var $title = $trackInfo.children().eq(1);

    var $albumInfo = $progressSection.parent().parent().parent().prev();
    var $albumText = $albumInfo.find('> div > div + div').first();

    var TEXT_NODE_TYPE = 3;
    var albumContents = $albumText.contents().filter(function (i, node) { return node.nodeType === TEXT_NODE_TYPE; });
    if (albumContents.length < 3) {
        return {};
    }

    return {
        album:    albumContents[0].data,
        artist:   albumContents[2].data,
        title:    $title.text(),
        duration: durationInSeconds * 1000,
        elapsed:  elapsedInSeconds * 1000,
    };
};

module.exports = hoopla;
