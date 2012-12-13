(function ($) {

	var plugin = scroblr.registerHost("amazon");

	plugin.scrape = function () {
		return {
			artist:   $("#nowPlayingSection .currentSongDetails .title").next().text().substring(3),
			duration: calculateDuration($("#nowPlayingSection .currentSongStatus #currentTime").next().next().text()),
			stopped:  $("#mp3Player .mp3Player-MasterControl .mp3MasterPlayGroup").hasClass("paused"),
			title:    $("#nowPlayingSection .currentSongDetails .title").text()
		};
	};
}(Zepto));
