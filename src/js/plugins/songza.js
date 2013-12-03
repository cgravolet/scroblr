(function ($) {

	var plugin = scroblr.registerHost("songza");

	plugin.test = function () {
		var domainTest, playerTest;

		domainTest = this.hostre.test(document.location.hostname);
		playerTest = $("#player").length > 0;

		return domainTest && playerTest;
	};

	plugin.scrape = function () {
		var info = {
			artist:  $("#player .szi-artist").text(),
			percent: parseFloat($("#player .szi-progress .szi-bar").width() / $("#player .szi-progress").width()),
			stopped: $("#player .player-play").css("display") === "none" ? false : true,
			title:   $("#player .szi-title").text()
		};
		return info;
	};
}(Zepto));