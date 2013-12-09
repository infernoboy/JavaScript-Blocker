NodeList.prototype.forEach = Array.prototype.forEach;

var globalPage = GlobalPage.page(),
		fun = function () {

	if (globalPage) {
		window.onerror = function (d, p, l, c) {
			globalPage._d(d + ', ' + p + ', ' + l);
		};

		window._ = globalPage._;

		globalPage.JB.hljs = hljs;
		globalPage.JB.utils.once_again('load');
			
		setTimeout(function () {
			globalPage.JB.bind_events();
			globalPage.JB.load_language(true);
		}, 1000);
	}
	
	var all = document.body.querySelectorAll('*');
	
	all.forEach(function (element) {
		var i18n = element.getAttribute('data-i18n'), fill = JSON.parse(element.getAttribute('data-i18n-fill') || '[]');

		if (!i18n) return;

		if (element.getAttribute('value') && element.value.length) element.value = window._(i18n, fill);
		if (element.getAttribute('placeholder') && element.placeholder.length) element.placeholder = window._(i18n, fill);
		if (element.getAttribute('label')) element.label = window._(i18n, fill);
		if (element.getAttribute('title')) element.title = window._(i18n, fill);
		if (!element.getAttribute('title') && ~['LABEL', 'SPAN', 'DIV', 'P', 'H1', 'LI', 'A', 'H3'].indexOf(element.nodeName) && i18n) element.innerHTML = window._(i18n, fill);
	});

	if (window.navigator.platform.match(/Win/)) document.body.classList.add('windows');
	else if (window.navigator.platform.match(/Mac/)) document.body.classList.add('macos');
	
	var ctx =	document.getCSSCanvasContext('2d', 'checkbox', 20, 20);
	ctx.clearRect(0, 0, 20, 20)

	ctx.strokeStyle = 'rgba(0,0,0,0.15)';

  ctx.beginPath();
	ctx.moveTo(10, 0);

	ctx.quadraticCurveTo(20, 0, 20, 10);
	ctx.quadraticCurveTo(20, 20, 10, 20);
	ctx.quadraticCurveTo(0, 20, 0, 10);
	ctx.quadraticCurveTo(0, 0, 10, 0);

	ctx.closePath();
	ctx.stroke();

	var ctx_fill =	document.getCSSCanvasContext('2d', 'checkbox-checked', 20, 20);
	
	ctx_fill.clearRect(0, 0, 20, 20)

	ctx_fill.strokeStyle = '#1e57dc';

  ctx_fill.beginPath();
	ctx_fill.moveTo(10, 0);

	ctx_fill.quadraticCurveTo(20, 0, 20, 10); // top-right
	ctx_fill.quadraticCurveTo(20, 20, 10, 20); // bottom-right
	ctx_fill.quadraticCurveTo(0, 20, 0, 10); // bottom-left
	ctx_fill.quadraticCurveTo(0, 0, 10, 0); // top-left

	var grd = ctx.createLinearGradient(0, 0, 20, 20);
	grd.addColorStop(0, '#c8daff');
	grd.addColorStop(1, '#8cadf1');

	ctx_fill.fillStyle = grd;

	ctx_fill.closePath();
	ctx_fill.fill();
	ctx_fill.stroke();
};

document.addEventListener('DOMContentLoaded', fun);