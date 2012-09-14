(function ($) {

	var plugin = scroblr.registerHost("bandcamp");

	plugin.scrape = function () {

		var ingo, isTrack, pageTitle;

		info = {
			stopped: (!$(".inline_player .playbutton").hasClass("playing"))
		};
		isTrack   = (document.location.pathname.indexOf("/track") >= 0);
		pageTitle = $("title").text().split("|");

		if (!info.stopped) {
			info.artist   = $.trim(pageTitle[pageTitle.length-1]);
			info.duration = calculateDuration($(".inline_player .track_info .time").text().split("/")[1]);
			info.title    = isTrack ? $(".trackTitle").first().text() : $(".track_info .title").text();
		}

		return info;
	};
}(jQuery));
