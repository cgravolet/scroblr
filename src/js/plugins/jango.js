"use strict";

var $      = require("jquery");
var Plugin = require("../modules/Plugin");
var jango  = Object.create(Plugin);

jango.init("jango", "Jango");

jango.initialize = function () {
    var script;

    $('<input type="hidden" id="scroblr-artist" value="" />').appendTo(document.body);
    $('<input type="hidden" id="scroblr-duration" value="" />').appendTo(document.body);
    $('<input type="hidden" id="scroblr-elapsed" value="" />').appendTo(document.body);
    $('<input type="hidden" id="scroblr-title" value="" />').appendTo(document.body);

    script = document.createElement("script");
    script.appendChild(document.createTextNode("(" + injectScript + "());"));
    document.body.appendChild(script);
};

jango.test = function () {
    var hostMatch = this.hostre.test(document.location.hostname);

    if (hostMatch && document.getElementById("player-outer-box")) {
        return true;
    }

    return false;
};

jango.scrape = function () {
    return {
        artist:   $("#scroblr-artist").val(),
        album:    $.trim($("#player_info #player_current_artist").contents().last().text()),
        duration: parseFloat($("#scroblr-duration").val()),
        elapsed:  parseFloat($("#scroblr-elapsed").val()),
        stopped:  !$("#btn-playpause").hasClass("pause"),
        title:    $("#scroblr-title").val()
    };
};

/**
 * Injection script that gets appended to the page so it can access the
 * jango API methods and update the hidden scroblr form fields for keeping
 * track of the currently playing track.
 */
function injectScript() {
    /* globals _jm, _jp */

    function updateMedia() {
        var manager, media, sound;

        manager = _jp.soundManager;
        media   = _jm.song_info;
        sound   = manager.sounds[manager.soundIDs[manager.soundIDs.length - 1]];

        document.getElementById("scroblr-artist").value   = media.artist || "";
        document.getElementById("scroblr-duration").value = sound.duration || 0;
        document.getElementById("scroblr-elapsed").value  = sound.position || 0;
        document.getElementById("scroblr-title").value    = media.song || "";
    }

    window.setTimeout(function () {
        updateMedia();
        window.setInterval(updateMedia, 5000);
    }, 3000);
}

module.exports = jango;
