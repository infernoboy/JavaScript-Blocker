"use strict";

var disabled = typeof beforeLoad === 'undefined' ? false : disabled, blank = window.blank ? window.blank : false;

if (!disabled && !blank) {
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
		window.alert = function (a, text, html_allowed, hkey, id) {
			a = a === null ? '' : (typeof a === 'undefined' ? 'undefined' : a.toString());
			text = text ? text.toString() : null;
			
			var html_verify = args[0],
					cur_all = document.querySelectorAll('.jsblocker-alert'), top = 0,
					ht = document.createElement('div'),
					more = parseInt(window.navigator.appVersion.split('Safari/')[1].split('.')[0], 10) >= 536,
					title = (text ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;') : 'alert()'),
					body = (!text || html_allowed !== html_verify ? a.replace(/&/g, '&amp;').replace(/</g, '&lt;') : a), z;

			ht.innerHTML = [
				'<div class="jsblocker-alert-inner">',
					'<a href="javascript:void(0);" class="jsblocker-close"></a>',
					'<div class="jsblocker-alert-bg">', title, '</div>',
					'<div class="jsblocker-alert-text">', body, '</div>',
				'</div>'].join('');
			ht.className = 'jsblocker-alert';
			ht.id = 'jsblocker-alert-' + (id ? id : Date.now());
			
			if (document.documentElement.firstChild)
				document.documentElement.insertBefore(ht, document.documentElement.firstChild);
			else
				document.documentElement.appendChild(ht);

			ht.style.setProperty('top', -ht.offsetHeight + 'px');	
			ht.style.setProperty('z-index', z = (cur_all.length ? 999999909 - cur_all.length : 999999909), 'important');	

			ht.setAttribute('data-ozindex', z);

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
				ht.setAttribute('data-original_height', ht.offsetHeight);
			
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
							item.style.setProperty('top', (parseInt(item.style.top, 10) - parseInt(cur.getAttribute('data-original_height'), 10) + 20) + 'px');

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
		}, store = {}, key = args[0];

		XMLHttpRequest.prototype.open = function () {
			this.intercept = arguments;

			ajax.open.apply(this, arguments);
		};

		XMLHttpRequest.prototype.send = function () {
			var self = this, allow = false, id = (Date.now() + Math.random()).toString(36).replace(/\./, ''), a = document.createElement('a'), path = ((this.intercept[1] instanceof Object) && this.intercept[1].path) ? this.intercept[1].path : this.intercept[1].toString(),
					str = [
						'<div class="jsb-ajax-add jsb-hide" id="jsb-ajax-add-', id, '">',
							'<input id="jsb-ajax-temp-', id, '" type="checkbox" />',
							'<label for="jsb-ajax-temp-', id, '"> Make this a temporary rule</label><br/>',
							'<span class="jsb-label">On: </span>', '<select id="jsb-ajax-select-', id, '">><option>Loading...</option></select><br/>',
							'<span class="jsb-method-label">???</span> ',
							'<textarea spellcheck="false" class="jsb-ajax-rule-input" wrap="off">Loading...</textarea> ',
							'<a href="javascript:void(0);" class="jsb-bold jsb-ajax-rule-save">Save</a><br/>',
							'<a href="javascript:void(0);" class="jsb-ajax-rule-cancel">Cancel</a><br/>',
						'</div>'];

			store[id] = { req: this, args: arguments };

			a.href = path;

			path = decodeURI(path).replace(/&/g, '&amp;').replace(/</g, '&lt;');

			str.push('<p class="jsb-info">',
				'<b class="jsb-label jsb-bold">Path</b><br/>',
				'<span class="jsb-indent">', path, '</span>',
			'</p>');

			switch(this.intercept[0].toUpperCase()) {
				case 'POST':
					var raw_params = Array.prototype.slice.call(arguments).join(' '),
							params = raw_params.split(/&/g),
							pretty_params = [], s;

					for (var i = 0; i < params.length; i++)
						if (params[i].length) {
							s = params[i].split('=');
							pretty_params.push('<b class="jsb-bold">', decodeURIComponent(s[0].replace(/&/g, '&amp;').replace(/</g, '&lt;')), '</b>: ', decodeURIComponent(s[1]).replace(/&/g, '&amp;').replace(/</g, '&lt;'), '<br/>');
						}
					
					str.push('<p class="jsb-info">',
						'<b class="jsb-label jsb-bold">Parameters</b><br/>',
						'<span class="jsb-indent">', pretty_params.join(''), '</span>',
					'</p>');
				break;

				case 'PUT':
				case 'GET':
					// DO NOTHING.
				break;

				default:
					allow = true;
				break;
			}

			str.push('<p class="jsb-info">',
				'<a href="javascript:void(0);" class="jsb-ajax-action jsb-allow jsb-once" data-action="allowed" data-method="1">Allow Once</a> <span class="jsb-divider">|</span> ',
				'<a href="javascript:void(0);" class="jsb-ajax-action jsb-allow jsb-create-rule" data-action="allowed" data-method="1">Allow...</a> <span class="jsb-divider">|</span> ',
				'<a href="javascript:void(0);" class="jsb-ajax-action jsb-block jsb-once" data-action="blocked" data-method="0">Block Once</a> <span class="jsb-divider">|</span> ',
				'<a href="javascript:void(0);" class="jsb-ajax-action jsb-block jsb-create-rule" data-action="blocked" data-method="0">Block...</a> ',
			'</p>');

			if (!allow) {
				var ajaxIntercept = new CustomEvent('JSBCommander', {
					detail: {
						key: key,
						token: args[1],
						command: 'ajaxIntercept',
						kind: 'ajax_' + this.intercept[0].toLowerCase(),
						source: a.href,
						id: id,
						exclude: v === 1,
						meta: pretty_params ? '<p>' + pretty_params.join('') + '</p>': null,
						str: str
					}
				});
				
				document.dispatchEvent(ajaxIntercept);
			} else
				ajax.send.apply(this, arguments);
		};

		document.addEventListener('jsb_alert_ready', function (event) {
			var id = event.detail.id,
					de = document.getElementById('jsblocker-alert-' + id),
					al = de.querySelector('select'),
					inp = de.querySelector('.jsb-ajax-rule-input'),
					parts = event.detail.meta.parts, o = [];

			for (var i = 0; i < parts.length; i++)
				o.push('<option value="', (i > 0 ? '.' : ''), parts[i], '">', parts[i] === '*' ? 'All Domains' : (i > 0 ? '.' : '') + parts[i], '</option>');

			al.innerHTML = o.join('');

			inp.value = '^' + event.detail.meta.rule + '$';

			de.querySelector('.jsb-ajax-rule-save').addEventListener('click', function () {
				var de = document.getElementById('jsblocker-alert-' + id),
						addRule = new CustomEvent('JSBCommander', {
					detail: {
						token: event.detail.addRuleToken,
						key: key,
						command: 'addRule',
						accessKey: event.detail.meta.accessKey,
						kind: event.detail.meta.kind,
						rule: de.querySelector('.jsb-ajax-rule-input').value,
						action: de.querySelector('.jsb-method-label').getAttribute('data-method'),
						domain: de.querySelector('select').value,
						temporary: de.querySelector('input[type="checkbox"]').checked
					}
				});

				document.dispatchEvent(addRule);

				var clicker = document.createEvent('HTMLEvents');
				
				clicker.initEvent('click', true, true);

				de.querySelector('.jsb-once[data-method="' + de.querySelector('.jsb-method-label').getAttribute('data-method') + '"]').dispatchEvent(clicker);
			}, false);

			de.querySelector('.jsb-ajax-rule-input').addEventListener('keypress', function (e) {
				if (e.which === 3 || e.which === 13) {
					e.preventDefault();
					
					var clicker = document.createEvent('HTMLEvents'), de = document.getElementById('jsblocker-alert-' + id);
				
					clicker.initEvent('click', true, true);

					de.querySelector('.jsb-ajax-rule-save').dispatchEvent(clicker);
				}
			}, false);
 
			[].forEach.call(de.querySelectorAll('.jsb-ajax-action'), function (self) {
				self.addEventListener('click', function (e) {
					var de = document.getElementById('jsblocker-alert-' + id),
							la = de.querySelector('.jsb-method-label');

					if (~e.target.className.indexOf('jsb-create-rule')) {
						de.style.setProperty('z-index', parseInt(de.getAttribute('data-ozindex') + 20, 10), 'important');

						[].forEach.call(de.querySelectorAll('.jsb-info'), function (me) {
							me.className += ' jsb-hide';
						});

						de.querySelector('.jsb-ajax-add').className = 'jsb-ajax-add';
						
						la.innerText = e.target.getAttribute('data-method') === '0' ? 'Block' : 'Allow';
						la.className = 'jsb-method-label jsb-' + (e.target.getAttribute('data-method') === '0' ? 'block' : 'allow');
						la.setAttribute('data-method', e.target.getAttribute('data-method'));

						la = de = null;

						return;
					}

					var clicker = document.createEvent('HTMLEvents'), ac = e.target.getAttribute('data-action'), me = store[id];
					
					clicker.initEvent('click', true, true);

					de.querySelector('.jsblocker-close').dispatchEvent(clicker);

					la = de = null;

					var pushItem = new CustomEvent('JSBCommander', {
						detail: {
							key: key,
							token: event.detail.pushItemToken,
							command: 'pushItem',
							kind: 'ajax_' + me.req.intercept[0].toLowerCase(),
							meta: event.detail.meta.meta,
							data: event.detail.meta.source,
							which: 'hosts',
							action: ac,
							how: [parseInt(e.target.getAttribute('data-method'), 10), -1]
						}
					});

					document.dispatchEvent(pushItem);

					if (ac === 'allowed')
						ajax.send.apply(me.req, me.args);
					else
						try {
							me.req.abort();
						} catch (e) {}

					delete store[id];
				}, false);
			});

			de.querySelector('.jsb-ajax-rule-cancel').addEventListener('click', function () {
				var de = document.getElementById('jsblocker-alert-' + id);

				de.style.setProperty('z-index', de.getAttribute('data-ozindex'), 'important');

				[].forEach.call(de.querySelectorAll('.jsb-info'), function (me) {
					me.className = 'jsb-info';
					de.querySelector('.jsb-ajax-add').className += ' jsb-hide';
				});

				setTimeout(function () {
					de = null;
				}, 100);
			}, false);

			de = al = parts = o = null;
		}, false);

		document.addEventListener('jsb_ajax_handler', function (event) {
			if (event.detail.allowed[1] < 0 && v === 1) {
				var inlineAlert = new CustomEvent('JSBCommander', {
					detail: {
						key: key,
						token: event.detail.token,
						id: event.detail.id,
						command: 'inlineAlert',
						meta: {
							parts: event.detail.domain_parts,
							rule: event.detail.rule,
							source: event.detail.source,
							kind: event.detail.kind,
							accessKey: event.detail.accessKey,
							meta: event.detail.meta
						},
						body: event.detail.str.join(''),
						title: 'XHR ' + event.detail.kind.substr(5).toUpperCase() + ' Request'
					}
				});

				document.dispatchEvent(inlineAlert);
			} else {
				if (event.detail.allowed[0]) try {
					ajax.send.apply(store[event.detail.id].req, store[event.detail.id].args)
				} catch(e) {}
				else try {
					store[event.detail.id].req.abort();
				} catch(e) {}
			}
		}, true);
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
	simple_referrer: true,
	CustomEvent: function () {
		if (!window.CustomEvent) {
			var CustomEvent = function (event, params) {
				params = params || { bubbles: false, cancelable: false, detail: undefined };
				var evt = document.createEvent('CustomEvent');
				evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
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
	s.setAttribute('data-jsb_ignore', window.Token ? Token.create('jsb_ignore') : 1);
	s.setAttribute('data-jsb_special', which);
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
				if (do_append) {
					if (special_actions[n] !== true)
						appendScript(action, n, v, priv);
				} else action(v);
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
special_actions.ajax_intercept.prototype.args = [window.accessToken || 1, window.Token ? Token.create('ajaxIntercept', true) : null];
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