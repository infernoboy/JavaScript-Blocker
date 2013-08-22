window.onerror = function (d, p, l, c) {
	globalPage._d(d + ', ' + p + ', ' + l);
};

NodeList.prototype.forEach = Array.prototype.forEach;

var globalPage = GlobalPage.page(),
		_ = globalPage._,
		fun = function () {
	globalPage.JB.hljs = hljs;
	globalPage.JB.utils.once_again('load');
			
	setTimeout(function () {
		globalPage.JB.bind_events();
		globalPage.JB.load_language(true);
	}, 1000);
	
	var all = document.body.querySelectorAll('*');
	
	all.forEach(function (element) {
		var i18n = element.getAttribute('data-i18n');

		if (!i18n) return;

		if (element.getAttribute('value') && element.value.length) element.value = _(i18n);
		if (element.getAttribute('placeholder') && element.placeholder.length) element.placeholder = _(i18n);
		if (element.getAttribute('label')) element.label = _(i18n);
		if (element.getAttribute('title')) element.title = _(i18n);
		if (!element.getAttribute('title') && ~['LABEL', 'SPAN', 'DIV', 'P', 'H1', 'LI', 'A', 'H3'].indexOf(element.nodeName) && i18n) element.innerHTML = _(i18n);
	});

	if (window.navigator.platform.match(/Win/)) document.body.className += ' windows';
	else if (window.navigator.platform.match(/Mac/)) document.body.className += ' macos';
	
	document.body.className += ' theme-' + globalPage.JB.theme;
};

document.addEventListener('DOMContentLoaded', fun);