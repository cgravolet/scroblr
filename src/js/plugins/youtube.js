"use strict";

var $       = require("jquery");
var Plugin  = require("../modules/Plugin");
var Utils   = require("../modules/Utilities");
var youtube = Object.create(Plugin);

youtube.init("youtube", "YouTube");

youtube.test = function () {
    return (/youtube\.[A-Z\.]{2,}\/watch/i).test(document.location.href);
};

youtube.scrape = function () {
    var title       = $.trim($("#watch-headline-title").text());
    var parsedTitle = title.replace(/^(.+)\s*[-–:]+\s*(.+)$/, "$1_,_$2").split("_,_");

    if (parsedTitle.length > 1) {
        return cleanseTrack(parsedTitle[0], parsedTitle[1]);
    }

    if (title.indexOf("by") >= 0) {
        parsedTitle = title.replace(/^(.+)\s*by\s*(.+)$/, "$1_,_$2").split("_,_");

        if (parsedTitle.length > 1) {
            return cleanseTrack(parsedTitle[1], parsedTitle[0]);
        }
    }

    if (title.indexOf("\"") >= 0) {
        parsedTitle = title.replace(/^([^"]+)(".+)$/, "$1_,_$2").split("_,_");

        if (parsedTitle.length > 1) {
            return cleanseTrack(parsedTitle[0], parsedTitle[1]);
        }
    }

    return {
        title: title,
        elapsed: Utils.calculateDuration(
            $(".html5-progress-bar.red").attr("aria-valuetext").split(" of")[0]
        ),
        duration: Utils.calculateDuration($(".ytp-bound-time-right").text()),
        stopped: !$(".ytp-button-pause").length
    };
};

/**
 * Cleanse method inspired by the Chrome Last.fm Scrobbler extension
 * by David Sabata (https://github.com/david-sabata/Chrome-Last.fm-Scrobbler)
 *
 * @param {String} artist
 * @param {String} title
 */
function cleanseTrack(artist, title) {
    title = $.trim(title);
    title = title.replace(/\s*\*+\s?\S+\s?\*+$/, ''); // **NEW**
    title = title.replace(/\s*\[[^\]]+\]$/, ''); // [whatever] succeeding title
    title = title.replace(/^\[[^\]]+\]\s*/, ''); // [whatever] preceding title
    title = title.replace(/\s*\([^\)]*version\)$/i, ''); // (whatever version)
    title = title.replace(/\s*\.(avi|wmv|mpg|mpeg|flv)$/i, ''); // video extensions
    title = title.replace(/\s*(of+icial\s*)?(music\s*)?video/i, ''); // (official)? (music)? video
    title = title.replace(/\s*(ALBUM TRACK\s*)?(album track\s*)/i, ''); // (ALBUM TRACK)
    title = title.replace(/\s*\(\s*of+icial\s*\)/i, ''); // (official)
    title = title.replace(/\s*\(\s*[0-9]{4}\s*\)/i, ''); // (1999)
    title = title.replace(/\s+\(\s*(HD|HQ)\s*\)$/, ''); // HD (HQ)
    title = title.replace(/\s+(HD|HQ)\s*$/, ''); // HD (HQ)
    title = title.replace(/\s*video\s*clip/i, ''); // video clip
    title = title.replace(/\s+\(?live\)?$/i, ''); // live
    title = title.replace(/\(\s*\)/, ''); // Leftovers after e.g. (official video)
    title = title.replace(/\(.*lyrics?\)/i, ''); // (with lyrics)
    title = title.replace(/\s*(with\s+)?lyrics?\s*$/i, ''); // (with)? lyrics
    title = title.replace(/^(|.*\s)"(.*)"(\s.*|)$/, '$2'); // Artist - The new "Track title" featuring someone
    title = title.replace(/^(|.*\s)'(.*)'(\s.*|)$/, '$2'); // 'Track title'
    title = title.replace(/^[\/\s,:;~-\s"]+/, ''); // trim starting white chars and dash
    title = title.replace(/[\/\s,:;~-\s"\s!]+$/, ''); // trim trailing white chars and dash

    return {
        artist: artist,
        title:  title,
        elapsed: Utils.calculateDuration(
            $(".html5-progress-bar.red").attr("aria-valuetext").split(" of")[0]
        ),
        duration: Utils.calculateDuration($(".ytp-bound-time-right").text()),
        stopped: !$(".ytp-button-pause").length
    };
}

module.exports = youtube;
