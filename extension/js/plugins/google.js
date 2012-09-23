(function ($) {

	var plugin = scroblr.registerHost("google");

	plugin.scrape = function () {
		return {
			artist:   $("#playerArtist .fade-out-content").attr("title"),
			duration: calculateDuration($("#duration").text()),
			stopped:  $("#playPause").attr("title") === "Play",
			title:    $("#playerSongTitle .fade-out-content").attr("title")
		};
	};
}(jQuery));
