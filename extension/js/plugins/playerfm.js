(function ($) {

	var plugin = scroblr.registerHost("playerfm");

	plugin.hostre = new RegExp("player\\.fm", "i");
	plugin.scrape = function () {
		var elapsedString, timeRemainingString;

		elapsedString       = $('.permaplayer .current .play-monitor .time-elapsed').text();
		timeRemainingString = $('.permaplayer .current .play-monitor .time-remaining').text();

		return {
			artist:   $('.permaplayer .track-wrapper .current-series-link').text(),
			title:    $('.permaplayer .track-wrapper .current-episode-link').text(),
			elapsed:  scroblr.utilities.calculateDuration(elapsedString),
			duration: scroblr.utilities.calculateDuration(elapsedString, timeRemainingString),
			stopped:  $('.container .playpause .jp-play').css("display") !== "none"
		};
	};
}(Zepto));
