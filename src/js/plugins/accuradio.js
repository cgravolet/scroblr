(function ($) {

	var plugin = scroblr.registerHost("accuradio");

	plugin.scrape = function () {
		var artist = $("#songartist").text() || "";

		if (artist.indexOf("Click here") >= 0) {
			artist = "";
		}

		return {
			album:   $("#songalbum").text(),
			artist:  artist,
			title:   $("#songtitle").text(),
			stopped: $("#playerPlayButton").length ? true : false
		};
	};
}(Zepto));
