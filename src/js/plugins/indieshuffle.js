(function ($) {

	var plugin = scroblr.registerHost("indieshuffle");

	plugin.test = function () {
		var domainTest, playerTest;

		domainTest = this.hostre.test(document.location.hostname);
		playerTest = $("#now-playing").length > 0;

		return domainTest && playerTest;
	};

	plugin.scrape = function () {
		var info = {
			artist:   $("#now-playing-title strong").text(),
			duration: scroblr.utilities.calculateDuration($("#jplayer_total_time").text()),
			elapsed:  scroblr.utilities.calculateDuration($("#jplayer_play_time").text()),
			title:    $("#now-playing-title a").contents().filter(filterTextNode).text(),
			stopped:  !$("#play-pause").hasClass("playing")
		};

		return info;
	};

	function filterTextNode() {
		return this.nodeType === 3;
	}
}(Zepto));
