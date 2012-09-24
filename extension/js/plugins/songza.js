(function ($) {

	var plugin = scroblr.registerHost("songza");

	plugin.scrape = function () {
		return {
			artist:  $("#player .szi-roll-song .szi-info .szi-artist").text(),
			percent: parseFloat($("#player .szi-progress .szi-bar").width() / $("#player .szi-progress").width()),
			stopped: !!$("#player .sz-player-state-pause").length,
			title:   $("#player .szi-roll-song .szi-info .szi-title").text()
		};
	};
}(jQuery));
