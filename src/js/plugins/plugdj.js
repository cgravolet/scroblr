"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var Utils  = require("../modules/Utilities");
var Plugdj = Object.create(Plugin);

Plugdj.init("plugdj", new RegExp("plug\\.dj", "i"));

Plugdj.initialize = function () {
    var script = document.createElement("script");

    script.appendChild(document.createTextNode("(" + injectScript + "());"));
    appendDataFields();
    document.head.appendChild(script);
};

Plugdj.scrape = function () {
    var info, remainingTime;

    if (!$("#scroblr-artist").length) {
        appendDataFields();
    }

    info = {
        artist:   $("#scroblr-artist").val(),
        duration: parseFloat($("#scroblr-duration").val()),
        title:    $("#scroblr-title").val()
    };

    remainingTime = Utils.calculateDuration($("#time-remaining-value").text() || "");
    info.elapsed  = info.duration - remainingTime;

    return info;
};

function appendDataFields() {
    $('<input type="hidden" id="scroblr-artist" value="" />').appendTo(document.body);
    $('<input type="hidden" id="scroblr-duration" value="" />').appendTo(document.body);
    $('<input type="hidden" id="scroblr-title" value="" />').appendTo(document.body);
}

/**
 * Injection script that gets appended to the page so it can access the
 * plug.dj API methods and update the hidden scroblr form fields for keeping
 * track of the currently playing track.
 */
function injectScript() {
    /* globals API */

    function updateMedia() {
        var media;

        if (!document.getElementById("scroblr-artist")) {
            return false;
        }

        if (window.API && API.getDJ().length !== 0) {
            media = API.getMedia();
        }

        if (media) {
            document.getElementById("scroblr-artist").value = media.author;
            document.getElementById("scroblr-duration").value = media.duration * 1000;
            document.getElementById("scroblr-title").value = media.title;
        } else {
            document.getElementById("scroblr-artist").value = "";
            document.getElementById("scroblr-duration").value = 0;
            document.getElementById("scroblr-title").value = "";
        }
    }

    window.setTimeout(function () {
        updateMedia();
        window.setInterval(updateMedia, 5000);
    }, 3000);
}

module.exports = Plugdj;
