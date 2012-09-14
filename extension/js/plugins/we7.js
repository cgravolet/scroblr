(function ($) {

	var plugin = scroblr.registerHost("we7");

	plugin.init = function () {
		if ($('#player-section').length) {
			return this.hostre.test(document.location.hostname);
		}
		return false;
	};

	plugin.scrape = function () {
		return {
			artist:   $('#track-marquee #track-title a').eq(0).text(),
			title:    $('#track-marquee #track-title a').eq(1).text(),
			duration: scroblr.utilities.calculateDuration($('#elapsed').text(), $('#remaining').text()),
			elapsed:  scroblr.utilities.calculateDuration($('#elapsed').text())
		};
	};
}(jQuery));
