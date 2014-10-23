"use strict";

var $           = require("jquery");
var Plugin      = require("../modules/Plugin");
var Utils       = require("../modules/Utilities");
var wonderfm = Object.create(Plugin);

wonderfm.init("wonderfm", "wonder.fm", "*://wonder.fm/*");

wonderfm.test = function () {
	
	var domainMatch = /wonder\.fm/i.test(document.location.hostname);
	var playerFound = $("#controls").length > 0;
	
	return domainMatch && playerFound;
	
};

wonderfm.initialize = function () {
	var script;

	$('<input type="hidden" id="scroblr-duration" value="" />').appendTo(document.body);
	$('<input type="hidden" id="scroblr-elapsed" value="" />').appendTo(document.body);

	script = document.createElement("script");
	script.appendChild(document.createTextNode("(" + injectScript + "());"));
	document.body.appendChild(script);
};

wonderfm.scrape = function () {

	var artist  =  $("#current_track a")[0].text;
	var elapsed =  parseInt($("#scroblr-elapsed").val());
	var duration = parseInt($("#scroblr-duration").val());
	var percent =  parseInt($(".jp-play-bar").width()) / parseInt($(".jp-seek-bar").width());
	var stopped =  $(".jp-play").css("display") == "block";
	var title =    $("#current_track a")[1].text;

	//console.log("artist: " + artist);
	//console.log("elapsed: " + elapsed);
	//console.log("duration: " + duration);
	//console.log("percent: " + percent);
	//console.log("stopped: " + stopped);
	//console.log("title: " + title);

	return {
		artist:   artist, 
		elapsed:  elapsed,
		duration: duration,
		percent:  percent,
		stopped:  stopped,
		title:    title
	};

};

/**
 * Injection script that gets appended to the page so it can access the
 * jQuery jPlayer methods and update the hidden scroblr form fields for keeping
 * track of the track information.
 */
function injectScript() {

	function updateMedia() {
		var currentPlayer = null;

		if ($("#jquery_jplayer_2").length > 0) {
			if ($("#jquery_jplayer_2").data().jPlayer.status.currentPercentAbsolute > 0) {
				currentPlayer = "#jquery_jplayer_2";
			} else {
				currentPlayer = "#jquery_jplayer_1";
			}
		} else {
			currentPlayer = "#jquery_jplayer_1";
		}
		
		$("#scroblr-duration").val($(currentPlayer).data().jPlayer.status.duration * 1000);
		$("#scroblr-elapsed").val($(currentPlayer).data().jPlayer.status.currentTime * 1000);
	}

	window.setTimeout(function () {
		updateMedia();
		window.setInterval(updateMedia, 5000);
	}, 3000);
}

module.exports = wonderfm;
