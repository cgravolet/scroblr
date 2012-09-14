(function ($) {

	var plugin = scroblr.registerHost("playerfm");

	plugin.scrape = function () {
		
		var elapsedString, timeRemainingString;

		elapsedString       = $(".permaplayer .current .play-monitor .time-elapsed").text();
		timeRemainingString = $(".permaplayer .current .play-monitor .time-remaining").text();

		return {
			artist:   $(".permaplayer .meta .trackWrapper .title :first-child").text(),
			elapsed:  scroblr.utilities.calculateDuration(elapsedString),
			duration: scroblr.utilities.calculateDuration(elapsedString, timeRemainingString),
			stopped:  $(".permaplayer .current .playpause .icon-play").is(":visible"),
			title:    $(".permaplayer .meta .trackWrapper .title :last-child").text()
		};
	};
}(jQuery));
