(function ($) {
	var plugin = scroblr.registerHost("vk");

	plugin.scrape = function () {
		console.log("My plugin scrapped");
		var info = {};
		//stopped, artist, title

		var gpPlay = $("#gp_play");
		var isPlaying = gpPlay && gpPlay.hasClass("playing");
		info.stopped = !isPlaying;

		if (isPlaying) {
			info.artist = $("#gp_performer").text();
			info.title =  $("#gp_title").text();
		}

		return info;
	};
}(Zepto));
