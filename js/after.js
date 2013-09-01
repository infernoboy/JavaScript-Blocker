"use strict";

var disabled = typeof beforeLoad === 'undefined' ? false : disabled;

// POSSIBLE MEMORY LEAK HERE.

if (!disabled) {
var gm_injected = 0, special_actions = {
	zoom: function () {
		document.addEventListener('DOMContentLoaded', function () {
			document.body.style.setProperty('zoom', v + '%', 'important');
		}, true);
	},
	window_resize: function () {
		var window_open = window.open;

		window.resizeBy = function () {};
		window.resizeTo = function () {};
		window.moveTo = function () {};
		window.open = function (URL, name, specs, replace) {
			return window_open(URL, name, undefined, replace);
		};
	},
	alert_dialogs: function () {
		var enabled = v;

		window.alert = function (a, text, html_allowed) {
			a = a === null ? '' : (typeof a === 'undefined' ? 'undefined' : a.toString());
			text = text ? text.toString() : null;
			
			var html_verify = args[0],
					cur_all = document.querySelectorAll('.jsblocker-alert'), top = 0,
					ht = document.createElement('div'),
					more = parseInt(window.navigator.appVersion.split('Safari/')[1].split('.')[0], 10) >= 536;

			ht.innerHTML = [
				'<div class="jsblocker-alert-inner">',
					'<a href="javascript:void(0);" class="jsblocker-close"></a>',
					'<div class="jsblocker-alert-bg">', (text ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;') : 'alert()'), '</div>',
					'<div class="jsblocker-alert-text">', (!text || html_allowed !== html_verify ? a.replace(/&/g, '&amp;').replace(/</g, '&lt;') : a), '</div>',
				'</div>'].join('');
			ht.className = 'jsblocker-alert';
			ht.id = 'jsblocker-alert-' + (+new Date());
			
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

					if (this.disallowMouseWheel || event.wheelDeltaY) return;

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
			}, 10, ht, cur_all);
		};
		
		window.alert.prototype.jsblocker = 1;

		return window.alert;
	},
	contextmenu_overrides: function () {
		var jsblocker_stop_cm = function (e) {
			e.stopImmediatePropagation();
			e.stopPropagation();
		},
			jsblocker_stop_md = function (e) {
			if (e.which && e.which === 3) {
				e.stopImmediatePropagation();
				e.stopPropagation();
			}
		},
			jsblocker_block_context_override = function () {
			window.oncontextmenu = null;
			document.oncontextmenu = null;
			
			window.removeEventListener('contextmenu', jsblocker_stop_cm);
			window.removeEventListener('mousedown', jsblocker_stop_md);
			document.removeEventListener('contextmenu', jsblocker_stop_cm);
			document.removeEventListener('mousedown', jsblocker_stop_md);
			
			window.addEventListener('contextmenu', jsblocker_stop_cm, true);
			window.addEventListener('mousedown', jsblocker_stop_md, true);
			document.addEventListener('contextmenu', jsblocker_stop_cm, true);
			document.addEventListener('mousedown', jsblocker_stop_md, true);
		};
		
		setInterval(jsblocker_block_context_override, 1500);
		
		jsblocker_block_context_override();
	},
	autocomplete_disabler: function () {
		var bv = parseInt(args[0], 10);

		document.addEventListener('DOMContentLoaded', function () {
			var inps = document.getElementsByTagName('input');
			
			for (var i = 0; inps[i]; i++)
				inps[i].setAttribute('autocomplete', 'on');
		}, true);

		function withNode(node) {
			if (node.nodeName === 'INPUT')
				node.setAttribute('autocomplete', 'on');
		}

		if (bv >= 536) {
			var observer = new WebKitMutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					if (mutation.type === 'childList')
						for (var i = 0; i < mutation.addedNodes.length; i++)
							withNode(mutation.addedNodes[i]);
				});
			});

			observer.observe(document, { childList: true, subtree: true });
		} else
			document.addEventListener('DOMNodeInserted', function (event) {
				withNode(event.target);
			}, true);
	},
	font: function () {
		var s = document.createElement('style');
		s.type = 'text/css';
		s.id = 'jsblocker-css-' + (+new Date());
		s.innerText = '*:not(pre):not(code) { font-family: "' + v + '" !important; }';
		document.documentElement.appendChild(s);
	},
	history_fix: function () {
		var my_history = {
			pushState: window.history.pushState,
			replaceState: window.history.replaceState
		};

		window.history.pushState = function () {
			my_history.pushState.apply(window.history, arguments);

			window.postMessage('history-state-change', '*');
		};

		window.history.replaceState = function () {
			my_history.replaceState.apply(window.history, arguments);

			window.postMessage('history-state-change', '*');
		};
	},
	ajax_intercept: function () {
		var ajax = {
			open: XMLHttpRequest.prototype.open,
			send: XMLHttpRequest.prototype.send
		};

		XMLHttpRequest.prototype.open = function () {
			this.intercept = arguments;

			ajax.open.apply(this, arguments);
		}

		XMLHttpRequest.prototype.send = function () {
			var str = 'This page wants to ', allow = false;

			switch(this.intercept[0]) {
				case 'POST':
					str += 'POST the following information to ' + this.intercept[1] + ":\n\n" + decodeURIComponent(Array.prototype.slice.call(arguments).join(' '));
				break;

				case 'GET':
					str += 'GET ' + this.intercept[1];
				break;

				default:
					allow = true;
				break;
			}

			var confirmed = allow ? true : confirm(str + "\n\nDo you want to allow this?");

			if (confirmed)
				ajax.send.apply(this, arguments);
		}
	}
},
custom_special_actions = {};

var appendScript = function (script, which, v, priv) {
	var s = document.createElement('script');

	s.id = 'jsblocker-' + (+new Date());
	s.setAttribute('data-ignore', window.accessToken);
	s.setAttribute('data-special', which);
	s.src = ['data:text/javascript,',
		encodeURI(['(function() { var fn = ', script.toString(), ', anon = (new Function("v", "args", "accessKey", "which", "(" + fn.toString() + ")();"))',
		'(',
			v !== undefined ? (typeof v === 'string' ? '"' + v + '"' : v) + ',': 'null,',
			script.prototype && script.prototype.args ? JSON.stringify(script.prototype.args) + ',': 'null,',
			'"', priv ? window.accessToken : 0, '",',
			'"', which, '"',
		'); })();'].join(''))].join('');
	document.documentElement.appendChild(s);
}

var doSpecial = function (do_append, n, action, priv) {
	var custom = n.indexOf('custom') === 0,
			v = enabled_specials[n].value || custom, m;

	if (v === true || parseInt(v, 10) || (typeof v === 'string' && v.length)) {
		if (!((m = enabled_specials[n].allowed) % 2)) {
			jsblocker.blocked.special.all.push([n, m]);
			
			if (!custom) {
				if (do_append) appendScript(action, n, v, priv);
				else action(v);
			}
		} else
			if (m !== 84) {
				jsblocker.allowed.special.all.push([n, m]);

				if (custom) appendScript(action, n, true, priv);
			}
	}
}

var GM = function () {
	// GreaseMonkey support functions
	GM_xmlhttpRequestCallbacks = {},
	GM_contextMenuCallbacks = {},
	// VALUES
	GM_getValue = function (name, def) {
		var c = window.localStorage.getItem(gmName + name);

		return c === null ? (def !== undefined ? def : null) : c;
	},
	GM_setValue = function (name, value) {
		window.localStorage.setItem(gmName + name, value);
	},
	GM_deleteValue = function (name) {
		window.localStorage.removeItem(gmName + name);
	},
	GM_listValues = function () {
		var a = [];

		for (var key in window.localStorage)
			if (window.localStorage.hasOwnProperty(key) && key.indexOf(gmName) === 0)
				a.push(key);
		
		return a;
	},

	// RESOURCES
	GM_getResourceText = function (name) {

	},
	GM_getResourceURL = function (name) {

	},

	// OTHER
	GM_addStyle = function (css) {
		var style = document.createElement('style');
		style.setAttribute('type', 'text/css');
		style.innerHTML = css;

		if (document.body)
			document.body.appendChild(style);
		else
			document.documentElement.appendChild(style);
	},
	GM_log = function () {
		console.debug.apply(console, arguments);
	},
	GM_openInTab = function (url) {
		window.postMessage({
			key: accessToken,
			command: 'GM_openInTab',
			data: url
		}, '*');
	},
	GM_registerMenuCommand = function (caption, func, accessKey) {
		GM_contextMenuCallbacks[caption] = func;

		window.postMessage({
			key: accessToken,
			command: 'GM_registerMenuCommand',
			data: {
				ns: gmName,
				caption: caption
			}
		}, '*');
	},
	GM_setClipboard = function () {
		// Cannot be implemented.
	},
	GM_xmlhttpRequest = function (details) {
		var token = Math.random().toString(36);

		GM_xmlhttpRequestCallbacks[token] = details;

		window.postMessage({
			key: accessToken,
			token: token,
			command: 'GM_xmlhttpRequest',
			data: JSON.stringify(details)
		}, '*');
	},
	unsafeWindow = window;

	window.addEventListener('message', function (event) {
		if (event.data.type === 'GM_xmlhttpRequestComplete' && GM_xmlhttpRequestCallbacks[event.data.token]) {
			try {
				console.log('AJAX!!!!', event.data)
				GM_xmlhttpRequestCallbacks[event.data.token][event.data.action](event.data.data);
			} catch (e) {
				console.error(e);
			}
		} else if (event.data.type === 'GM_contextMenu' && event.data.target === accessToken && event.data.ns === gmName)
			GM_contextMenuCallbacks[event.data.caption]();
	}, true);
}

GM = GM.toString();
var p = GM.split('{');
p.splice(0, 1);
p[p.length - 1] = p[p.length - 1].substr(0, p[p.length - 1].length - 1);

var parseSpecials = function (pre) {
	if (pre)
		for (var z in special_actions)
			doSpecial(1, z, special_actions[z]);

	for (var n in custom_special_actions) {
		if (pre && ~n.indexOf('custompost')) continue;
		if (!pre && !~n.indexOf('custompost')) continue;

		doSpecial(1, n, "function (v, accessToken, gmName) {\n" + p.join('{') + "\n" + custom_special_actions[n].func + "\n}", 1);
	}
}

special_actions.alert_dialogs.prototype.args = [window.accessToken || 1];
special_actions.autocomplete_disabler.prototype.args = [window.bv || 0];

if (typeof beforeLoad !== 'undefined' && !disabled) {
	var customScripts = ResourceCanLoad(beforeLoad, ['customScripts']);

	for (var cp in customScripts.pre)
		custom_special_actions[cp] = customScripts.pre[cp];

	for (var pc in customScripts.post)
		custom_special_actions[pc] = customScripts.post[pc];

	var specials = [];

	for (var w in special_actions) specials.push(w);
	for (var q in custom_special_actions) specials.push(q);

	var enabled_specials = ResourceCanLoad(beforeLoad, ['enabledSpecials', specials, jsblocker.href]);

	parseSpecials(true);

	document.addEventListener('DOMContentLoaded', function () {
		parseSpecials(false);
	}, true);

	appendScript(special_actions.history_fix, 'history_fix');
}
}