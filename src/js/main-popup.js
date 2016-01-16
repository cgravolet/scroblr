"use strict";

var $        = require("jquery");
var conf     = require("./conf.json");
var firefox  = require('./firefox/firefox.js');
var Mustache = require("mustache");

window.scroblrView = (function () {
    var model = null;
    var $body = $("body");

    if (typeof chrome != "undefined") {
        model = chrome.extension.getBackgroundPage();
    } else if (typeof safari != "undefined") {
        model = safari.extension.globalPage.contentWindow;
    } else if (firefox) {
        model = firefox;
    }

    function attachBehaviors () {
        $body.on("click", "#authorizeBtn", function (e) {
            e.preventDefault();
            sendMessage("authButtonClicked");
        });

        $body.on("click", ".goto-section", function (e) {
            e.preventDefault();
            displaySection($(this).attr("href").slice(1));
        });

        $body.on("click", ".goto-link", function (e) {
            e.preventDefault();
            openNewTab($(this).attr("href"));
        });

        $body.on("click", "#doNotScrobbleBtn", function (e) {
            e.preventDefault();
            sendMessage("doNotScrobbleButtonClicked");
        });

        $body.on("click", "#loveTrackBtn", function (e) {
            e.preventDefault();
            sendMessage("loveTrackButtonClicked");
        });

        $body.on("click", "#logoutLink", function (e) {
            e.preventDefault();
            sendMessage("logoutLinkClicked");
        });

        $body.on("click", "#submitTrackEditBtn", function (e) {
            e.preventDefault();
            var track = model.scroblrGlobal.getCurrentTrack();
            sendMessage("trackEdited", {
                artist: $(".edit-track input[name=artist]").val(),
                id:     track.id,
                title:  $(".edit-track input[name=title]").val(),
                album:  $(".edit-track input[name=album]").val()
            });
        });

        $(".settings-options input").on("change", function (e) {
            changeSettingsOption.call(this, e);
        });

        if (typeof chrome != "undefined") {
            chrome.extension.onMessage.addListener(messageHandler);
        } else if (typeof safari != "undefined") {
            safari.application.addEventListener("message", messageHandler, false);
            safari.application.addEventListener("popover", popoverHandler, true);
        } else if (firefox) {
            firefox.addEventListener(messageHandler);
        }
    }

    function changeSettingsOption(e) {
        /*jshint validthis:true */
        var id = $(this).attr("id");

        if (this.checked) {
            localStorage.removeItem(id);
        } else {
            localStorage[id] = "true";
        }

        sendMessage("popupSettingsChanged");
    }

    function displaySection(section) {
        if (section === "edit-track") {
            renderEditTrackForm();
        }
        $body.removeClass().addClass("show-" + section);
    }

    function initialize() {
        attachBehaviors();

        if (typeof chrome != "undefined" || firefox) {
            populateSettingsOptions();
            showStartScreen();
        }
    }

    function messageHandler (msg) {
		if (conf.DEBUG) {
			console.log(msg.name, msg.message);
		}

        switch (msg.name) {
        case "trackLoved": // intentional fall-through
        case "trackNoScrobbleSet":
        case "songInfoRetrieved":
            window.setTimeout(function () {
                renderNowPlaying();
            }, 500);
            break;
        case "updateCurrentTrack":
            if (msg.message.hasOwnProperty("score")) {
                window.setTimeout(function () {
                    renderNowPlaying();
                }, 500);
            }
            break;
        case "keepAliveExpired": // intentional fall-through
        case "trackEditRequired":
        case "trackEditSaved":
        case "userLoggedOut":
        case "userSessionRetrieved":
            showStartScreen();
            break;
        case "popover":
            popoverHandler();
            break;
        }
    }

    function openNewTab(url) {
        var newTab;

        if (typeof chrome != "undefined") {
            chrome.tabs.create({url: url});
        } else if (typeof safari != "undefined") {
            newTab = safari.application.activeBrowserWindow.openTab();
            newTab.url = url;
        } else if (firefox) {
            firefox.openTab(url);
        }
    }

    function popoverHandler() {
        populateSettingsOptions();
        showStartScreen();
    }

    function populateSettingsOptions() {
        var i, max, options, session;

        session = model.scroblrGlobal.getSession();
        options = [
            "disable_scrobbling",
            "disable_notifications",
            "disable_autodismiss",
            "disable_youtube"
        ];

        for (i = 0, max = options.length; i < max; i += 1) {
            if (localStorage[options[i]] === "true") {
                $("#" + options[i]).prop("checked", false);
            }
        }

        if (session) {
            $("#userProfile").text(session.name).attr("href",
                "http://last.fm/user/" + session.name);
        }

        if (firefox) {
            $("#disable_autodismiss, label[for=disable_autodismiss]").hide();
        }
    }

    function renderEditTrackForm() {
        var $container, data, template, track;

        $container = $("section.edit-track");
        template   = $.trim($("#tmplEditTrack").html());
        track      = model.scroblrGlobal.getCurrentTrack();

        $container.html(Mustache.render(template, track));
    }

    function renderNowPlaying() {
        var $container, template, track;

        $container = $("section.now-playing");
        template   = $.trim($("#tmplNowPlaying").html());
        track      = model.scroblrGlobal.getCurrentTrack();

        if (track && track.hasOwnProperty("score")) {
            if (track.score <= 50) {
                track.badscore = true;
            } else {
                track.badscore = false;
            }
        }

        $container.html(Mustache.render(template, track));
    }

    function sendMessage(name, message) {
        model.scroblrGlobal.messageHandler({
            name: name,
            message: message
        });
    }

    function showStartScreen() {
        var session, track;

        session = model.scroblrGlobal.getSession();
        track   = model.scroblrGlobal.getCurrentTrack();

        $body.removeClass();

        if (!session) {
            $body.addClass("show-authenticate");
        } else if (track && track.editrequired) {
            renderEditTrackForm();
            $body.addClass("show-edit-track");
        } else {
            renderNowPlaying();
            $body.addClass("show-now-playing");
        }
    }

    initialize();

    return {
        messageHandler: messageHandler
    };
}());
