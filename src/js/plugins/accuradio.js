(function ($) {

	var plugin = scroblr.registerHost("accuradio");

	plugin.scrape = function () {
		var artist = $("#span_information_artist").text() || "";

		if (artist.indexOf("Click here") >= 0) {
			artist = "";
		}

		return {
			album:   $("#span_information_album").text(),
			artist:  artist,
			title:   $("#span_information_title").text(),
			stopped: $("#player_lowest_controls_wrapper #play").length ? true : false
		};
	};
}(Zepto));
