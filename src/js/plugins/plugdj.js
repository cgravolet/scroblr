(function ($) {

	var plugin = scroblr.registerHost("plugdj");

	plugin.hostre = new RegExp("plug\\.dj", "i");

	plugin.init = function () {
		var script = document.createElement("script");

		script.appendChild(document.createTextNode("(" + injectScript + "());"));

		window.setTimeout(function () {
			$('<input type="hidden" id="scroblr-artist" value="" />').appendTo(document.body);
			$('<input type="hidden" id="scroblr-duration" value="" />').appendTo(document.body);
			$('<input type="hidden" id="scroblr-title" value="" />').appendTo(document.body);
			document.body.appendChild(script);
		}, 2000);
	};

	plugin.scrape = function () {
		var info, remainingTime;

		info = {
			artist:   $("#scroblr-artist").val(),
			duration: parseFloat($("#scroblr-duration").val()),
			title:    $("#scroblr-title").val()
		};

		remainingTime = scroblr.utilities.calculateDuration($("#time-remaining-value").text() || "");
		info.elapsed  = info.duration - remainingTime;

		return info;
	};

	/**
	 * Injection script that gets appended to the page so it can access the
	 * plug.dj API methods and update the hidden scroblr form fields for keeping
	 * track of the currently playing track.
	 */
	function injectScript() {

		function updateMedia() {
			var media;

			if (window.API && API.getDJs().length) {
				media = API.getMedia();
			}

			if (media) {
				document.getElementById("scroblr-artist").value = media.author;
				document.getElementById("scroblr-duration").value = media.duration * 1000;
				document.getElementById("scroblr-title").value = media.title;
			} else {
				document.getElementById("scroblr-artist").value = "";
				document.getElementById("scroblr-duration").value = 0;
				document.getElementById("scroblr-title").value = "";
			}
		}

		window.setTimeout(function () {
			updateMedia();
			window.setInterval(updateMedia, 5000);
		}, 3000);
	}
}(Zepto));
