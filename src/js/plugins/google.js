(function ($) {

	var plugin = scroblr.registerHost("google");

	plugin.test = function () {
		return document.location.href.indexOf("play.google.com/music/listen") >= 0;
	};

	plugin.scrape = function () {
		return {
			album: $(".player-album").text(),
			artist: $("#player-artist").text(),
			duration: scroblr.utilities.calculateDuration($("#duration").text()),
			title: $("#playerSongTitle .fade-out-content").text(),
			stopped: ($("#playPause").attr("title") == "Play")
		};
	};
}(Zepto));
