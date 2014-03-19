"use strict";

var $        = require("jquery");
var Mustache = require("mustache");
var plugins  = require("./plugins");
var model    = chrome.extension.getBackgroundPage().scroblrGlobal;
var $body    = $(document.body);

function getOptionStatus(option) {
    return !localStorage["disable_" + option];
}

function attachBehaviors() {
    $body.on("click", "#authorizeBtn", function (e) {
        e.preventDefault();
        sendMessage("authButtonClicked");
    });

    $body.on("click", "#logoutLink", function (e) {
        e.preventDefault();
        sendMessage("logoutLinkClicked");
    });

    $body.on("click", "#toggleOptions", function (e) {
        e.preventDefault();
        toggleOptions();
    });

    $(".container input").on("change", function (e) {
        changeSettingsOption.call(this, e);
    });

    chrome.extension.onMessage.addListener(messageHandler);
}

function changeSettingsOption(e) {
    /* jshint validthis:true */

    var id = $(this).attr("id");

    if (this.checked) {
        localStorage.removeItem(id);
    } else {
        localStorage[id] = "true";
    }

    sendMessage("localSettingsChanged");
}

function initialize() {
    renderSiteOptions();
    attachBehaviors();
    toggleAuthState();
    populateSettingsOptions();
}

function messageHandler (msg) {
    switch (msg.name) {
        case "localSettingsChanged":
            populateSettingsOptions();
            break;
        case "userLoggedOut":
        case "userSessionRetrieved": // Intentional fall-through
            toggleAuthState();
            break;
    }
}

function populateSettingsOptions() {
    var i, key, max;
	var options  = [
        "disable_scrobbling",
        "disable_notifications",
        "disable_autodismiss"
	];

	for (key in plugins) {

		if (plugins.hasOwnProperty(key)) {
			options.push("disable_" + plugins[key].name);
		}
	}

    for (i = 0, max = options.length; i < max; i += 1) {

        if (localStorage[options[i]] === "true") {
            $("#" + options[i]).prop("checked", false);
        } else {
            $("#" + options[i]).prop("checked", true);
        }
    }
}

function renderSiteOptions() {
    var template = $.trim($("#tmpl_siteOption").html());
    var tmplData = {plugins: []};

    for (var key in plugins) {
        var pluginEnabled = (localStorage["disable_" + plugins[key].name] ===
            true ? false : true);

        tmplData.plugins.push({
            checked:     pluginEnabled,
            displayName: plugins[key].displayName,
            name:        plugins[key].name
        });
    }

    $(".site-specific-options").append(Mustache.render(template, tmplData));
}

function sendMessage(name, message) {
    model.messageHandler({
        name: name,
        message: message
    });
}

function toggleAuthState() {
    var session = model.getSession();

    if (session) {
        $("#userSettings").show();
        $("#authenticate").hide();
        $("#userProfile").text(session.name);
    } else {
        $("#userSettings").hide();
        $("#authenticate").show();
    }
}

function toggleOptions() {
    var $options = $(".site-specific-options input");
    var foundDisabledOption = false;

    for (var i = 0, max = $options.length; i < max; i += 1) {

        if (!$options.eq(i).prop("checked")) {
            foundDisabledOption = true;
            break;
        }
    }

    for (i = 0; i < max; i += 1) {
        $options.eq(i).prop("checked",
                foundDisabledOption ? true : false).trigger("change");
    }
}

initialize();
