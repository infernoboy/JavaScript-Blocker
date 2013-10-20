"use strict";

var disabled = typeof beforeLoad === 'undefined' ? false : disabled;

// POSSIBLE MEMORY LEAK HERE.

if (!disabled) {
var special_actions = {
	zoom: function (v) {
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
	alert_dialogs: function (enabled, args) {
		window.alert = function (a, text, html_allowed, hkey) {
			a = a === null ? '' : (typeof a === 'undefined' ? 'undefined' : a.toString());
			text = text ? text.toString() : null;
			
			var html_verify = args[0],
					cur_all = document.querySelectorAll('.jsblocker-alert'), top = 0,
					ht = document.createElement('div'),
					more = parseInt(window.navigator.appVersion.split('Safari/')[1].split('.')[0], 10) >= 536,
					title = (text ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;') : 'alert()'),
					body = (!text || html_allowed !== html_verify ? a.replace(/&/g, '&amp;').replace(/</g, '&lt;') : a);	

			ht.innerHTML = [
				'<div class="jsblocker-alert-inner">',
					'<a href="javascript:void(0);" class="jsblocker-close"></a>',
					'<div class="jsblocker-alert-bg">', title, '</div>',
					'<div class="jsblocker-alert-text">', body, '</div>',
				'</div>'].join('');
			ht.className = 'jsblocker-alert';
			ht.id = 'jsblocker-alert-' + (+new Date());
			
			if (document.documentElement.firstChild)
				document.documentElement.insertBefore(ht, document.documentElement.firstChild);
			else
				document.documentElement.appendChild(ht);

			ht.style.setProperty('top', -ht.offsetHeight + 'px');	
			ht.style.setProperty('z-index', (cur_all.length ? 9999999909 - cur_all.length : 9999999909), 'important');	

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

					// if (event.wheelDeltaX) event.preventDefault();

					// if (this.disallowMouseWheel || event.wheelDeltaY) return;

					clearTimeout(ht.resetTimeout);

					var st = window.getComputedStyle(inn, null),
							right = parseInt(st.getPropertyValue('right'), 10),
							// del = event.wheelDeltaX * (event.webkitDirectionInvertedFromDevice ? -1 : 1),
							del = 0,
							nright = right + del;

					if (nright > 0) nright = 0;

					var per = 1 - Math.abs(nright) / (ht.clientWidth + 15);

					ht.style.setProperty('-webkit-transition-duration', '0' + dur.substr(4));

					inn.style.setProperty('right', nright + 'px', 'important');
					ht.style.setProperty('opacity');

					if (per <= 0.1) {
						ht.removed = 1;

						var event = document.createEvent('HTMLEvents');
						event.initEvent('click', true, true);

						cl.dispatchEvent(event);
					} else
						ht.resetTimeout = setTimeout(function (ht, inn) {
							inn.style.setProperty('right', '0px', 'important');
							ht.style.setProperty('opacity', '1');
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
	autocomplete_disabler: function (v, args) {
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
	font: function (v) {
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
	ajax_intercept: function (v, args) {
		var ajax = {
			open: XMLHttpRequest.prototype.open,
			send: XMLHttpRequest.prototype.send
		}, store = {};

		XMLHttpRequest.prototype.open = function () {
			this.intercept = arguments;

			ajax.open.apply(this, arguments);
		}

		XMLHttpRequest.prototype.send = function () {
			var self = this, key = args[0], str = '', allow = false, id = (Date.now() + Math.random()).toString(36).replace(/\./, ''), a = document.createElement('a'), path = (this.intercept[1] instanceof Object) ? this.intercept[1].path : this.intercept[1];

			store[id] = { req: this, args: arguments };

			a.href = path;

			switch(this.intercept[0]) {
				case 'POST':
					str += '<p><b>Path</b><br/>' + path + "</p><p><b>Parameters</b><br/>" + decodeURIComponent(Array.prototype.slice.call(arguments).join(' ')) + '</p>';
				break;

				case 'PUT':
				case 'GET':
					str += '<p><b>Path</b><br/>' + path + '</p>';
				break;

				default:
					allow = true;
				break;
			}

			if (!allow) {
				var ajaxIntercept = new CustomEvent('JSBCommander', {
					detail: {
						key: args[0],
						command: 'ajaxIntercept',
						kind: 'ajax_' + this.intercept[0].toLowerCase(),
						source: a.href,
						id: id,
						exclude: v === 1
					}
				});

				document.addEventListener('ajax_handler_' + id, function (event) {
					document.removeEventListener('ajax_handler_' + event.detail.id);

					if (event.detail.allowed[1] < 0 && v === 1) {
						var inlineAlert = new CustomEvent('JSBCommander', {
							detail: {
								key: args[0],
								command: 'inlineAlert',
								body: [str, '<p>',
									'<a href="javascript:void(0);" class="' + id + ' jsb-allow" data-action="allowed" data-method="1" data-store="' + id + '">Allow</a> <span class="jsb-divider">|</span> ',
									'<a href="javascript:void(0);" class="' + id + ' jsb-block" data-action="blocked" data-method="0" data-store="' + id + '">Block</a> ',
								'</p>'].join(''),
								title: 'AJAX ' + self.intercept[0] + ' Request'
							}
						});

						document.addEventListener('click', function (event) {
							if (event.target.className && ~event.target.className.indexOf(id)) {
								var clicker = document.createEvent('HTMLEvents'), ac = event.target.getAttribute('data-action'), me = store[event.target.getAttribute('data-store')];
								clicker.initEvent('click', true, true);

								event.target.parentNode.parentNode.previousSibling.previousSibling.dispatchEvent(clicker);

								var pushItem = new CustomEvent('JSBCommander', {
									detail: {
										key: key,
										command: 'pushItem',
										kind: 'ajax_' + me.req.intercept[0].toLowerCase(),
										data: a.href,
										which: 'hosts',
										action: ac,
										how: [parseInt(event.target.getAttribute('data-method'), 10), -1]
									}
								});

								document.dispatchEvent(pushItem);

								switch(ac) {
									case 'allowed':
										ajax.send.apply(me.req, me.args);
									break;
									
									case 'blocked':
										try {
											me.req.abort();
										} catch (e) {}
									break;
								}

								delete store[event.target.getAttribute('data-store')];
							}
						}, false);

						document.dispatchEvent(inlineAlert);
					} else {
						if (event.detail.allowed[0]) ajax.send.apply(store[event.detail.id].req, store[event.detail.id].args)
						else try {
							store[event.detail.id].req.abort();
						} catch(e) {}
					}
				}, true);
				
				document.dispatchEvent(ajaxIntercept);
			}
		}
	},
	inline_scripts: function (v, args) {
		if (parseInt(args[0], 10) >= 537) {
			var meta = document.createElement('meta');
			meta.setAttribute('http-equiv', 'content-security-policy');
			meta.setAttribute('content', "default-src *; script-src *; style-src * 'unsafe-inline'; object-src *");
		
			if (document.documentElement.firstChild)
				document.documentElement.insertBefore(meta, document.documentElement.firstChild);
			else
				document.documentElement.appendChild(meta);
		}
	},
	CustomEvent: function () {
		if (!window.CustomEvent) {
			var CustomEvent = function ( event, params ) {
				params = params || { bubbles: false, cancelable: false, detail: undefined };
				var evt = document.createEvent( 'CustomEvent' );
				evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
				return evt;
			};

			window.CustomEvent = CustomEvent;
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
		encodeURI(['(', script.toString(), ')',
		'(',
			v !== undefined ? (typeof v === 'string' ? '"' + v + '"' : v) + ',': 'null,',
			script.prototype && script.prototype.args ? JSON.stringify(script.prototype.args) + ',': 'null,',
			'"', priv ? window.accessToken : 0, '",',
			'"', which, '"',
		');'].join(''))].join('');

	if (document.documentElement.firstChild)
		document.documentElement.insertBefore(s, document.documentElement.firstChild);
	else
		document.documentElement.appendChild(s);

}

var doSpecial = function (do_append, n, action, priv) {
	var custom = n.indexOf('custom') === 0,
			v = enabled_specials[n].value || custom, m;

	if (v === true || parseInt(v, 10) || (typeof v === 'string' && v.length)) {
		if (!((m = enabled_specials[n].allowed) % 2)) {
			if (!enabled_specials[n].exclude) jsblocker.blocked.special.all.push([n, m]);
			
			if (!custom) {
				if (do_append) appendScript(action, n, v, priv);
				else action(v);
			}
		} else
			if (m !== 84) {
				if (!enabled_specials[n].exclude) jsblocker.allowed.special.all.push([n, m]);

				if (custom) appendScript(action, n, true, priv);
			}
	}
}

var parseSpecials = function (pre) {
	if (pre)
		for (var z in special_actions)
			doSpecial(1, z, special_actions[z]);

	for (var n in custom_special_actions) {
		if (pre && ~n.indexOf('custompost')) continue;
		if (!pre && !~n.indexOf('custompost')) continue;

		doSpecial(1, n, "function (v, accessToken, gmName) {\n" + custom_special_actions[n].func + "\n}", 1);
	}
}

special_actions.alert_dialogs.prototype.args = [window.accessToken || 1];
special_actions.ajax_intercept.prototype.args = [window.accessToken || 1];
special_actions.autocomplete_disabler.prototype.args = [window.bv || 0];
special_actions.inline_scripts.prototype.args = [window.bv || 0];

if (typeof beforeLoad !== 'undefined' && !disabled) {
	appendScript(special_actions.history_fix, 'history_fix');
	appendScript(special_actions.CustomEvent, 'CustomEvent');

	var customScripts = ResourceCanLoad(beforeLoad, ['customScripts']), specials = ['inline_scripts'];

	for (var cp in customScripts.pre) {
		custom_special_actions[cp] = customScripts.pre[cp];

		specials.push(cp);
	}

	for (var pc in customScripts.post) {
		custom_special_actions[pc] = customScripts.post[pc];

		specials.push(pc);
	}

	for (var w in special_actions) specials.push(w);

	var enabled_specials = ResourceCanLoad(beforeLoad, ['enabledSpecials', specials, jsblocker.href]);

	parseSpecials(true);

	document.addEventListener('DOMContentLoaded', function () {
		parseSpecials(false);
	}, true);
}
}