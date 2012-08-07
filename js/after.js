"use strict";

var special_actions = {
	zoom: function (v) {
		document.addEventListener('DOMContentLoaded', function () {
			document.body.style.setProperty('zoom', v + '%', 'important');
		}, true);
	},
	window_resize: function () {
		var wo = 'window_open_' + +new Date;

		window.resizeBy = function () {};
		window.resizeTo = function () {};
		window.moveTo = function () {};
		window[wo] = window.open;
		window.open = function (URL, name, specs, replace) {
			window[wo](URL, name, undefined, replace);
		};
	},
	alert_dialogs: function () {
		window.alert = function (a, text) {
			a = a.toString();
			
			var cur_all = document.querySelectorAll('.jsblocker-alert'), top = 0,
					ht = document.createElement('div'),
					more = parseInt(window.navigator.appVersion.split('Safari/')[1].split('.')[0], 10) >= 536;

			ht.innerHTML = [
				'<div class="jsblocker-alert-inner">',
					'<a href="javascript:void(0);" class="jsblocker-close"></a>',
					'<div class="jsblocker-alert-bg">', (text ? text.replace(/</g, '&lt;') : 'alert()'), '</div>',
					'<div class="jsblocker-alert-text">', (!text ? a.replace(/</g, '&lt;') : a), '</div>',
				'</div>'].join('');
			ht.className = 'jsblocker-alert';
			ht.id = 'jsblocker-alert-' + (+new Date);
			
			document.documentElement.appendChild(ht);

			ht.style.setProperty('top', -ht.offsetHeight + 'px');	
			ht.style.setProperty('z-index', (cur_all.length ? 90000 - cur_all.length : 90000), 'important');	

			setTimeout(function (ht, now) {
				var dur = '0.65s, 0.45s' + (more ? ', 0.55s' : '');

				for (var oh = 0; now[oh]; oh++) {
					now[oh].style.setProperty('-webkit-transition-duration', dur);
					now[oh].style.setProperty('top', (parseInt(now[oh].style.top, 10) + ht.offsetHeight - 20) + 'px');
				}

				ht.style.setProperty('-webkit-transition', 'opacity 0.65s, top 0.45s ease-out' + (more ? ', -webkit-filter 0.55s' : ''));
				ht.style.setProperty('opacity', '1');
				ht.style.setProperty('top', '0px');
				ht.querySelector('.jsblocker-alert-inner').style.setProperty('-webkit-transform', 'perspective(200px) rotateX(0deg)');
			
				var inn = ht.querySelector('.jsblocker-alert-inner'),
						cl = ht.querySelector('.jsblocker-close');

				ht.addEventListener('mousewheel', function (event) {
					if (ht.removed) return;

					if (event.wheelDeltaX) event.preventDefault();

					if (this.disallowMouseWheel || event.wheelDeltaY) return console.log(event.wheelDeltaY);

					clearTimeout(ht.resetTimeout);

					var st = window.getComputedStyle(inn, null),
							right = parseInt(st.getPropertyValue('right'), 10),
							del = event.wheelDeltaX * (event.webkitDirectionInvertedFromDevice ? -1 : 1),
							nright = right + del;

					if (nright > 0) nright = 0;

					var per = 1 - Math.abs(nright) / (ht.clientWidth + 15);

					ht.style.setProperty('-webkit-transition-duration', '0' + dur.substr(4));

					inn.style.setProperty('right', nright + 'px', 'important');
					ht.style.setProperty('opacity', per, 'important');

					if (per <= 0.1) {
						ht.removed = 1;

						var event = document.createEvent('HTMLEvents');
						event.initEvent('click', true, true);

						cl.dispatchEvent(event);
					} else
						ht.resetTimeout = setTimeout(function (ht, inn) {
							inn.style.setProperty('right', '0px', 'important');
							ht.style.setProperty('opacity', '1', 'important');
						}, 500, ht, inn);

					setTimeout(function (ht, more, dur) {
						ht.style.setProperty('-webkit-transition-duration', dur);
					}, 100, ht, more, dur);
				}, true);
				
				inn.addEventListener('mouseover', function () {
					cl.style.opacity = 1;
				}, true);
				inn.addEventListener('mouseout', function () {
					cl.style.opacity = 0;
				}, true);
				cl.addEventListener('click', function () {
					this.parentNode.removeChild(this);
					
					var all = document.querySelectorAll('.jsblocker-alert'), all_fixed = [],
							cur = document.getElementById(ht.id);

					for (var i = 0; all[i]; i++)
						all_fixed.push(all[i].getAttribute('id'));

					all_fixed.reverse();

					all_fixed = all_fixed.slice(all_fixed.indexOf(ht.id) + 1);

					if (cur) {
						cur.style.setProperty('opacity', '0');

						if (more)
							cur.style.setProperty('-webkit-filter', 'blur(4px)');

						cur.addEventListener('webkitTransitionEnd', function () {
							try {
								cur.parentNode.removeChild(cur);
							} catch (e) {}
						});
					}

					if (all_fixed && all_fixed.length) {
						for (var b = 0; all_fixed[b]; b++) {
							var item = document.getElementById(all_fixed[b]);

							item.disallowMouseWheel = 1;

							item.style.setProperty('-webkit-transition-duration', '0.65s, 0.3s' + (more ? ', 0.55s' : ''));
							item.style.setProperty('top', (parseInt(item.style.top, 10) - cur.offsetHeight + 20) + 'px');

							setTimeout(function (item) {
								item.disallowMouseWheel = 0;
							}, 550, item);
						}
					}
				}, true);
			}, 100, ht, cur_all);
		};
		
		window.alert.prototype.jsblocker = 1;

		return window.alert;
	},
	confirm_dialogs: function () {
		window.confirm = window.alert.prototype.jsblocker ? function (c) { window.alert(c, 'confirm()'); return true; } : function () { return true; };
	},
	contextmenu_overrides: function () {
		window.jsblocker_stop_cm = function (e) {
			e.stopImmediatePropagation();
			e.stopPropagation();
		};
		window.jsblocker_stop_md = function (e) {
			if (e.which && e.which === 3) {
				e.stopImmediatePropagation();
				e.stopPropagation();
			}
		};
		window.jsblocker_block_context_override = function () {
			window.oncontextmenu = null;
			document.oncontextmenu = null;
			
			window.removeEventListener('contextmenu', window.jsblocker_stop_cm);
			window.removeEventListener('mousedown', window.jsblocker_stop_md);
			document.removeEventListener('contextmenu', window.jsblocker_stop_cm);
			document.removeEventListener('mousedown', window.jsblocker_stop_md);
			
			window.addEventListener('contextmenu', window.jsblocker_stop_cm, true);
			window.addEventListener('mousedown', window.jsblocker_stop_md, true);
			document.addEventListener('contextmenu', window.jsblocker_stop_cm, true);
			document.addEventListener('mousedown', window.jsblocker_stop_md, true);
		};
		
		setInterval(window.jsblocker_block_context_override, 1500);
		
		window.jsblocker_block_context_override();
	},
	autocomplete_disabler: function () {
		document.addEventListener('DOMContentLoaded', function () {
			var inps = document.getElementsByTagName('input');
			
			for (var i = 0; inps[i]; i++)
				inps[i].setAttribute('autocomplete', 'on');
		}, true);
		
		document.addEventListener('DOMNodeInserted', function (e) {
			if (e.nodeName === 'INPUT')
				e.setAttribute('autocomplete', 'on');
		}, true);
	},
	font: function (v) {
		var s = document.createElement('style');
		s.type = 'text/css';
		s.id = 'jsblocker-css-' + (+new Date);
		s.innerText = '*:not(pre):not(code) { font-family: "' + v + '" !important; }';
		document.documentElement.appendChild(s);
	}
},
non_injected_special_actions = {};

function appendScript(script, v) {
	var script = script.toString(), p = script.split(/\{/), s = document.createElement('script');
	p[1] = "\n" + '"use strict";' + "\n// JSBlocker Injected Helper Script" + p[1];
	script = p.join('{');
	s.id = 'jsblocker-' + (+new Date);
	s.innerHTML = '(' + script + ')(' + (typeof v !== 'undefined' ? (typeof v === 'string' ? '"' + v + '"' : v ): '') + ');';
	document.documentElement.appendChild(s);
}

appendScript(function (base) {
	window.jsblockerBaseURI = base;
}, safari.extension.baseURI);

function doSpecial(do_append, n, action) {
	var v = if_setting('enable_special_' + n), m;

	if (v === true || parseInt(v, 10) || (typeof v === 'string' && v.length)) {
		if (!(m = safari.self.tab.canLoad(beforeLoad, ['special', n, jsblocker.href]))) {
			jsblocker.blocked.special.all.push(n);
				
			if (do_append) appendScript(action, v);
			else action(v);
		} else
			if (m !== 84)
				jsblocker.allowed.special.all.push(n);
	}
}

if (typeof if_setting === 'function') {
	for (var n in special_actions)
		doSpecial(1, n, special_actions[n]);

	for (var b in non_injected_special_actions)
		doSpecial(0, b, non_injected_special_actions[b]);
}
