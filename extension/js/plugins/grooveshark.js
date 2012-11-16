(function ($) {

	var plugin = scroblr.registerHost("grooveshark");

	plugin.scrape = function () {
		return {
			album:    $("#playerDetails_nowPlaying .album").attr("title"),
			artist:   $("#playerDetails_nowPlaying .artist").attr("title"),
			duration: calculateDuration($("#player #player_duration").text()),
			stopped:  $("#player #player_play_pause").hasClass("play"),
			title:    $("#playerDetails_nowPlaying .currentSongLink").attr("title")
		};
	};
}(Zepto));
