var token = window.location.search.split('=')[1];
if (typeof chrome != 'undefined') {
  chrome.extension.sendRequest({
    name: 'accessGranted',
    message: token
  });
}
else if (typeof safari != 'undefined') {
  safari.self.tab.dispatchMessage('accessGranted', token);
}
