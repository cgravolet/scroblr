"use strict";

var token = window.location.search.split('=')[1];

if (typeof chrome != 'undefined') {
    chrome.extension.sendMessage({
        name: 'accessGranted',
        message: token
    });
} else if (typeof safari != 'undefined') {
    safari.self.tab.dispatchMessage('accessGranted', token);
}