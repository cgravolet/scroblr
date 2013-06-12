(function ($) {

	var plugin = scroblr.registerHost("indieshuffle");

	plugin.scrape = function () {
		return {
			artist: $("#now-playing-title strong").text(),
			duration: scroblr.utilities.calculateDuration($("#jplayer_total_time").text()),
			elapsed: scroblr.utilities.calculateDuration($("#jplayer_play_time").text()),
			name: $("#now-playing-title a").clone().find("strong").remove().end().text(),
			stopped: !$("#play-pause").hasClass("playing")
		};
	};
}(Zepto));
