(function ($) {

	var plugin = scroblr.registerHost("google");

	plugin.init = function () {
		return document.location.href.indexOf("play.google.com/music/listen") >= 0;
	};

	plugin.scrape = function () {
		return {
			artist:   $("#playerArtist .fade-out-content").attr("title"),
			duration: scroblr.utilities.calculateDuration($("#duration").text()),
			stopped:  $("#playPause").attr("title") === "Play",
			title:    $("#playerSongTitle .fade-out-content").attr("title")
		};
	};
}(Zepto));
