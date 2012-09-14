(function ($) {

	var plugin = scroblr.registerHost("twonky");

	plugin.scrape = function () {
		if ($(".meta_title").text().length) {
			return {
				album:    $(".meta_album").text(),
				artist:   $.trim($(".meta_artist").text()),
				duration: calculateDuration($(".meta_duration").text()),
				stopped:  $(".trackPlayerButtonIcon").hasClass("play"),
				title:    $.trim($(".meta_title").text())
			};
		}
	};
}(jQuery));
