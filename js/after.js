"use strict";

var special_actions = {
	zoom: function (v) {
		document.addEventListener('DOMContentLoaded', function () {
			document.body.style.setProperty('zoom', v + '%', 'important');
		}, true);
	},
	window_resize: function () {
		window.resizeBy = function () {};
		window.resizeTo = function () {};
		window.moveTo = function () {};
		window._jsblocker_window_open = window.open;
		window.open = function (URL, name, specs, replace) {
			window._jsblocker_window_open(URL, name, undefined, replace);
		};
	},
	alert_dialogs: function () {
		window.alert = function (a, text) {
			var cur_all = document.querySelectorAll('.jsblocker-alert'), top = 0;

			for (var i = 0; cur_all[i]; i++)
				top += cur_all[i].offsetHeight - 8;
			
			var ht = document.createElement('div'),
					win = /Win/.test(window.navigator.platform);

			ht.className = 'jsblocker-alert';
			ht.innerHTML = [
				'<div class="jsblocker-alert-inner">',
					'<a href="javascript:void(0);" class="jsblocker-close">x</a>',
					'<div class="jsblocker-alert-text">', (!text ? a.replace(/</g, '&lt;') : a), '</div>',
					'<div class="jsblocker-alert-bg">', (text ? text.replace(/</g, '&lt;') : 'alert()'), '</div>',
				'</div>'].join('');
			ht.className = 'jsblocker-alert';
			ht.id = 'jsblocker-alert-' + (+new Date);
			
			document.documentElement.appendChild(ht);

			ht.style.setProperty('top', -ht.offsetHeight + 'px');	

			setTimeout(function (ht, top) {
				ht.style.setProperty('-webkit-transition', 'opacity 0.5s, top 0.5s' + (!win ? ', -webkit-filter 0.4s' : ''));
				ht.style.setProperty('opacity', '1');
				ht.style.setProperty('top', top + 'px');
				ht.querySelector('.jsblocker-alert-inner').style.setProperty('-webkit-transform', 'perspective(200px) rotateX(0deg)');
			
				var inn = ht.querySelector('.jsblocker-alert-inner'),
						cl = ht.querySelector('.jsblocker-close');
				
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

					all_fixed = all_fixed.slice(all_fixed.indexOf(ht.id) + 1);

					if (cur) {
						cur.style.setProperty('opacity', '0');
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

							item.style.setProperty('top', (parseInt(item.style.top, 10) - cur.offsetHeight + 8) + 'px');
						}
					}
				}, true);
			}, 100, ht, top);
		};
		
		window.alert.prototype.jsblocker = 1;
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
};

function appendScript(script, v) {
	var s = document.createElement('script');
	s.id = 'jsblocker-' + (+new Date);
	s.innerHTML = '(' + script + ')(' + (typeof v !== 'undefined' ? (typeof v === 'string' ? '"' + v + '"' : v ): '') + ');';
	document.documentElement.appendChild(s);
}

/*
appendScript(function (base) {
	window.jsblockerBaseURI = base;
}, safari.extension.baseURI);
*/

var v;

if (typeof if_setting === 'function')
	for (var n in special_actions) {
		v = if_setting('enable_special_' + n);
	
		if ((v === true || parseInt(v, 10)) || (typeof v === 'string' && v.length && v !== '0')) {
			if (!safari.self.tab.canLoad(beforeLoad, ['special', n, jsblocker.href])) {
				jsblocker.blocked.special.all.push(n);
					
				appendScript(special_actions[n], v);
			} else
				jsblocker.allowed.special.all.push(n);
		};
	}