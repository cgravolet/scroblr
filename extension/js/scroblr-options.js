(function () {
	var formElements = document.forms['scroblr-options'].elements,
		i = formElements.length;
	while (i--) {
		if (localStorage[formElements[i].name] == 'false') {
			formElements[i].checked = false;
		}
		else {
			formElements[i].checked = true;
		}
		formElements[i].addEventListener('change', function () {
			if (this.checked) {
				localStorage.removeItem(this.name);
			}
			else {
				localStorage[this.name] = this.checked;
			}
		});
	}
}());
