(function ($) {

	var plugin = scroblr.registerHost("accujazz");

	plugin.test = function () {
		return document.location.href.indexOf("slipstreamradio.com/pop_player/") >= 0;
	};

	plugin.scrape = function () {
		var artist = $("#span_information_artist").text() || "";

		if (artist.indexOf("Click here") >= 0) {
			artist = "";
		}

		return {
			album:   $("#span_information_album").text(),
			artist:  artist,
			title:   $("#span_information_title").text()
		};
	};
}(Zepto));
