(function ($) {

	var plugin = scroblr.registerHost("accuradio");

	plugin.scrape = function () {
		return {
			album:   $("#span_information_album").text(),
			artist:  $("#span_information_artist").text(),
			stopped: !!$("#player_lowest_controls_wrapper #play").length,
			title:   $("#span_information_title").text()
		};
	};
}(jQuery));
