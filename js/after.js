"use strict";

var disabled = window.disabled || false, blank = window.blank || false;

if (!disabled) {
var special_actions = {
	zoom: function (v, args, jsbAccessToken) {
		document.addEventListener('DOMContentLoaded', function () {
			document.body.style.setProperty('zoom', v + '%', 'important');
		}, true);
	},
	window_resize: function (v, args, jsbAccessToken) {
		var window_open = window.open;

		window.resizeBy = function () {};
		window.resizeTo = function () {};
		window.moveTo = function () {};
		window.open = function (URL, name, specs, replace) {
			return window_open(URL, name, undefined, replace);
		};
	},
	alert_dialogs: function (enabled, args, jsbAccessToken, jsbScriptNS) {
		var strings = args[1], html_verify = args[0], frame = args[3];

		window.alert = function (body, title, html_allowed, id) {
			if ((typeof document.hidden !== 'undefined' && document.hidden) || (window !== window.top && typeof messageExtension === 'function')) {
				messageExtension('notification', {
					title: title,
					body: body,
					no_html: html_allowed !== html_verify,
					top: true
				});

				return;
			}

			body = body === null ? '' : (typeof body === 'undefined' ? 'undefined' : body.toString());
			title = title ? title.toString() : null;
			
			var cur_all = document.querySelectorAll('.jsb-alert'), top = 0,
					ht = document.createElement('div'),
					more = parseInt(args[2], 10) >= 536,
					title = (typeof title === 'string' && title.trim().length ? title.replace(/&/g, '&amp;').replace(/</g, '&lt;') : strings.Alert),
					body = (!title || html_allowed !== html_verify ? body.replace(/&/g, '&amp;').replace(/</g, '&lt;') : body), z;

			ht.innerHTML = [
				'<div class="jsb-alert-inner">',
					'<input type="button" class="jsblocker-close" value="', strings.Close, '" />',
					'<div class="jsb-alert-bg">', title, frame ? '<span class="jsb-light"> ' + strings['via frame'] + '</span>' : '', '</div>',
					'<div class="jsb-alert-text">', body, '</div>',
				'</div>'].join('');
			ht.className = 'jsb-alert';
			ht.id = 'jsb-alert-' + (id ? id : Date.now());
			
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
				ht.querySelector('.jsb-alert-inner').style.setProperty('-webkit-transform', 'perspective(200px) rotateX(0deg)');
				ht.setAttribute('data-original_height', ht.offsetHeight);
			
				var inn = ht.querySelector('.jsb-alert-inner'),
						cl = ht.querySelector('.jsblocker-close');

				setTimeout(function (ht) {
					ht.querySelector('.jsb-alert-inner').style.setProperty('-webkit-transform', 'none');
				}, 1000, ht)
				
				cl.addEventListener('click', function () {
					this.disabled = true;
					
					var all = document.querySelectorAll('.jsb-alert'), all_fixed = [],
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

							item.style.setProperty('-webkit-transition-duration', '0.65s, 0.3s' + (more ? ', 0.55s' : ''));
							item.style.setProperty('top', (parseInt(item.style.top, 10) - parseInt(cur.getAttribute('data-original_height'), 10) + 20) + 'px');
						}
					}
				}, true);
			}, 10, ht, cur_all);
		};
		
		window.alert.prototype.jsblocker = 1;

		return window.alert;
	},
	contextmenu_overrides: function (v, args, jsbAccessToken) {
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
		
		setInterval(jsblocker_block_context_override, 20000);
		
		jsblocker_block_context_override();
	},
	autocomplete_disabler: function (v, args, jsbAccessToken) {
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
	font: function (v, args, jsbAccessToken) {
		var s = document.createElement('style');
		s.type = 'text/css';
		s.id = 'jsblocker-css-' + Date.now();
		s.innerText = '*:not(pre):not(code) { font-family: "' + v + '" !important; }';
		document.documentElement.appendChild(s);
	},
	genericSpecial: function (v, args, jsbAccessToken, jsbScriptNS) {
		if (window === window.top)
			messageExtension('registerTopToken');

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
	ajax_intercept: function (v, args, jsbAccessToken, jsbScriptNS) {
		var ajax = {
			open: XMLHttpRequest.prototype.open,
			send: XMLHttpRequest.prototype.send
		}, store = {}, strings = args[3] || {}, storeKey = Math.random().toString(36);

		XMLHttpRequest.prototype.open = function () {
			if (!this[storeKey]) this[storeKey] = {};

			this[storeKey].JSONIntercept = JSON.stringify(arguments);
			this[storeKey].intercept = arguments;

			ajax.open.apply(this, arguments);
		};

		XMLHttpRequest.prototype.send = function () {
			var JSONArguments = JSON.stringify(arguments);

			if (this[storeKey].sentArguments === JSONArguments && JSON.stringify(this[storeKey].intercept) === this[storeKey].JSONIntercept)
				try {
					return this[storeKey].wasSent ? ajax.send.apply(this, arguments) : this.abort();
				} catch (e) {

				} finally {
					return;
				}

			this[storeKey].sentArguments = JSONArguments

			var self = this, allow = false, id = (Math.random() * 1e17).toString(36), a = document.createElement('a'), path = ((this[storeKey].intercept[1] instanceof Object) && this[storeKey].intercept[1].path) ? this[storeKey].intercept[1].path : this[storeKey].intercept[1].toString(),
					str = [
						'<div class="jsb-ajax-add jsb-hide" id="jsb-ajax-add-', id, '">',
							'<input id="jsb-ajax-temp-', id, '" type="checkbox" />',
							'<label for="jsb-ajax-temp-', id, '"> ', strings['Make this a temporary rule'], '</label><br/>',
							'<span class="jsb-label">', strings['On:'],' </span>', '<select id="jsb-ajax-select-', id, '">><option>Loading...</option></select><br/>',
							'<select class="jsb-method-label jsb-allow" data-method="1">',
								'<option value="1">', strings.Allow, '</option>',
								'<option value="0">', strings.Block, '</option>',
							'</select> ',
							'<textarea spellcheck="false" class="jsb-ajax-rule-input" wrap="off">Loading...</textarea> ',
							'<input type="button" class="jsb-bold jsb-ajax-rule-save" value="', strings.Save, '" /><br/>',
							'<input type="button" class="jsb-ajax-rule-cancel" value="', strings.Cancel, '" /><br/>',
						'</div>'];

			store['jsb-alert-' + id] = { req: this, args: arguments };

			a.href = path;

			path = decodeURI(path).replace(/&/g, '&amp;').replace(/</g, '&lt;');

			str.push('<p class="jsb-info jsb-origin">',
					'<b class="jsb-label jsb-bold">Origin</b><br/>',
					'<span class="jsb-indent">Test</span>',
				'</p>',
				'<p class="jsb-info">',
					'<b class="jsb-label jsb-bold">', strings.Path, '</b><br/>',
					'<span class="jsb-indent">', path, '</span>',
				'</p>');

			switch(this[storeKey].intercept[0].toUpperCase()) {
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
						'<b class="jsb-label jsb-bold">', strings.Parameters, '</b><br/>',
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
				'<input type="button" class="jsb-ajax-action jsb-allow jsb-once" data-action="allowed" data-method="1" value="', strings['Allow Once'], '" /> ',
				'<input type="button" class="jsb-ajax-action jsb-block jsb-once" data-action="blocked" data-method="0" value="', strings['Block Once'], '" /> ',
				'<input type="button" class="jsb-ajax-action jsb-create-rule" value="', strings['Add Rule...'], '" /> ',
			'</p>');

			if (!allow) {
				messageExtension('ajaxIntercept', {
					kind: 'ajax_' + this[storeKey].intercept[0].toLowerCase(),
					source: a.href,
					id: id,
					exclude: v === 1,
					meta: pretty_params ? '<p>' + pretty_params.join('') + '</p>': null,
					str: str
				}, function (detail) {
					if (detail.allowed[1] < 0 && v === 1) {
						var actionCallback = registerCallback(function (detail) {
							var me = store[detail.id];

							if (detail.push)
								messageExtension('pushItem', {
									kind: 'ajax_' + me.req[storeKey].intercept[0].toLowerCase(),
									meta: detail.meta.meta,
									data: detail.meta.source,
									which: 'hosts',
									action: detail.ac,
									how: detail.how
								});

							if (detail.ac === 'allowed') {
								me.req[storeKey].wasSent = true;

								ajax.send.apply(me.req, me.args);
							} else
								try {
									me.req[storeKey].wasSent = false;

									me.req.abort();
								} catch (e) {}

							delete store[detail.id];
						});

						messageExtension('notification', {
							top: true,
							id: detail.id,
							meta: {
								parts: detail.domain_parts,
								rule: detail.rule,
								source: detail.source,
								kind: detail.kind,
								meta: detail.meta,
								strings: strings,
								actionCallback: actionCallback
							},
							body: detail.str.join(''),
							title: 'XHR ' + detail.kind.substr(5).toUpperCase() + ' Request'
						}, function (info) {
							var id = info.id,
									strings = info.meta.strings,
									de = document.getElementById(id),
									al = de.querySelector('select'),
									a = document.createElement('a'),
									inp = de.querySelector('.jsb-ajax-rule-input'),
									origin = de.querySelector('.jsb-origin'),
									parts = info.meta.parts, o = [];

							a.href = info.meta.source;

							if (info.frame)
								origin.querySelector('span').innerText = a.origin;
							else
								origin.parentNode.removeChild(origin);

							for (var i = 0; i < parts.length; i++)
								o.push('<option value="', (i > 0 ? '.' : ''), parts[i], '">', parts[i] === '*' ? strings['All Domains'] : (i > 0 ? '.' : '') + parts[i], '</option>');

							al.innerHTML = o.join('');

							inp.value = '^' + info.meta.rule + '$';

							de.querySelector('.jsb-ajax-rule-save').addEventListener('click', function () {
								var de = document.getElementById(id), clicker = document.createEvent('HTMLEvents');
								
								messageExtension('addRule', {
									kind: info.meta.kind,
									rule: {
										simple: de.querySelector('.jsb-ajax-rule-input').value,
										expert: de.querySelector('.jsb-ajax-rule-input').value
									},
									action: de.querySelector('.jsb-method-label').getAttribute('data-method'),
									domain: de.querySelector('select').value,
									temporary: de.querySelector('input[type="checkbox"]').checked
								});
								
								clicker.initEvent('click', true, true);

								de.querySelector('.jsb-once[data-method="' + de.querySelector('.jsb-method-label').getAttribute('data-method') + '"]').dispatchEvent(clicker);
							}, false);

							de.querySelector('.jsb-ajax-rule-input').addEventListener('keypress', function (e) {
								if (e.which === 3 || e.which === 13) {
									e.preventDefault();
									
									var clicker = document.createEvent('HTMLEvents'), de = document.getElementById(id);
								
									clicker.initEvent('click', true, true);

									de.querySelector('.jsb-ajax-rule-save').dispatchEvent(clicker);
								}
							}, false);

							de.querySelector('.jsb-method-label').addEventListener('change', function (e) {
								if (this.value === '0') {
									this.classList.remove('jsb-allow');
									this.classList.add('jsb-block');
								} else {
									this.classList.remove('jsb-block');
									this.classList.add('jsb-allow');
								}

								this.setAttribute('data-method', this.value);
							});
							
							[].forEach.call(de.querySelectorAll('.jsb-ajax-action'), function (self) {
								self.addEventListener('click', function (e) {
									var de = document.getElementById(id),
											la = de.querySelector('.jsb-method-label');

									if (e.target.classList.contains('jsb-create-rule')) {
										de.style.setProperty('z-index', parseInt(de.getAttribute('data-ozindex') + 20, 10), 'important');

										[].forEach.call(de.querySelectorAll('.jsb-info'), function (my) {
											my.classList.add('jsb-hide');
										});

										de.querySelector('.jsb-ajax-add').className = 'jsb-ajax-add';

										la = de = null;

										return;
									}

									this.disabled = true;

									executeCallback(info.origin, info.meta.actionCallback, {
										ac: e.target.getAttribute('data-action'),
										id: id,
										meta: info.meta,
										how: [parseInt(e.target.getAttribute('data-method'), 10), -1],
										push: true
									});

									var clicker = document.createEvent('HTMLEvents');

									clicker.initEvent('click', true, true);

									de.querySelector('.jsblocker-close').dispatchEvent(clicker);
								}, false);
							});

							de.querySelector('.jsb-ajax-rule-cancel').addEventListener('click', function () {
								var de = document.getElementById(id);

								de.style.setProperty('z-index', de.getAttribute('data-ozindex'), 'important');

								[].forEach.call(de.querySelectorAll('.jsb-info'), function (me) {
									me.className = 'jsb-info';
									de.querySelector('.jsb-ajax-add').classList.add('jsb-hide');
								});

								setTimeout(function () {
									de = null;
								}, 100);
							}, false);

							de = al = parts = o = null;
						});
					} else {
						var id = 'jsb-alert-' + detail.id;

						if (detail.allowed[0]) {
							try {
								store[id].req[storeKey].wasSent = true;

								ajax.send.apply(store[id].req, store[id].args)
							} catch(e) {}
						} else {
							try {
								store[id].req[storeKey].wasSent = false;

								store[id].req.abort();
							} catch(e) {}
						}
					}
				}, true);				
			} else {
				this[storeKey].wasSent = true;

				ajax.send.apply(this, arguments);
			}
		};
	},
	inline_scripts: function (v, args, jsbAccessToken) {
		if (parseInt(args[0], 10) >= 537) {
			var meta = document.createElement('meta');
			meta.setAttribute('http-equiv', 'content-security-policy');
			meta.setAttribute('content', "script-src *");
		
			if (document.documentElement.firstChild)
				document.documentElement.insertBefore(meta, document.documentElement.firstChild);
			else
				document.documentElement.appendChild(meta);
		}
	},
	navigator_override: function (v, args, jsbAccessToken) {
		var now = Math.random().toString(36), nowInt = Date.now(), my_navigator = window.navigator,
				agent = now + " AppleWebKit/537 (KHTML, like Gecko) Version/7 Safari/537";

		window.navigator = {
			geoLocation: window.navigator.geoLocation,
			cookieEnabled: window.navigator.cookieEnabled,
			productSub: now,
			mimeTypes: [],
			product: now,
			appCodeName: 'Mozilla',
			appVersion: agent,
			vendor: now,
			vendorSub: now,
			platform: now,
			appName: 'Netscape',
			userAgent: agent,
			language: window.navigator.language,
			plugins: (function () {
				var plugins = function () {};

				plugins.prototype.refresh = function () {};
				plugins.prototype.item = function () {};
				plugins.prototype.namedItem = function () {};

				return new plugins();
			})(),
			onLine: window.navigator.onLine,
			javaEnabled: window.navigator.javaEnabled.bind(my_navigator),
			getStorageUpdates: window.navigator.getStorageUpdates.bind(my_navigator)
		};

		window.screen = {
			width: nowInt,
			availWidth: nowInt,
			height: nowInt,
			availHeight: nowInt,
			availLeft: nowInt,
			availTop: nowInt,
			pixelDepth: nowInt,
			colorDepth: nowInt
		};
	},
	simple_referrer: true,
	inlineScriptsCheck: function (v, args, jsbAccessToken) {
		messageExtension('inlineScriptsAllowed');
	}
},
user_scripts = {
	installUserScriptPrompt: {
		before: 1,
		meta: {
			name: 'installUserScriptPrompt'
		},
		metaStr: '',
		script: function () {
			messageExtension('installUserScriptPrompt', { url: window.location.href }, function (r) {
				messageExtension('notification', {
					title: r.strings['User Script'],
					body: [
						'<p>', r.strings['Add?'], '</p>',
						'<p><input type="button" id="jsb-install-user-script" value="', r.strings['Create Script'], '" /></p>'
					].join(''),
				}, function (info) {
					var al = document.getElementById(info.id);

					al.querySelector('#jsb-install-user-script').addEventListener('click', function () {
						this.value = r.strings['Adding...'];
						this.disabled = 1;

						messageExtension('installUserScriptFrom', { url: window.location.href }, function (result) {
							al.querySelector('.jsb-alert-text').innerHTML = result ? r.strings['User script added.'] : r.strings['User script could not be added.'];
						});
					}, true);
				});
			});
		}
	}
};

var appendScript = function (script, which, v, priv, name, custom, m) {
	var s = document.createElement('script'), string_script = script.toString();

	if (m) {
		var os = document.getElementById(m);
		os.parentNode.removeChild(os);
	}

	s.id = 'jsb-' + (window.Token ? Token.generate() : Date.now());
	s.setAttribute('data-jsb_ignore', window.Token ? Token.create('jsb_ignore') : 1);
	s.setAttribute('data-jsb_special', which);

	if (!custom && window.eventToken) {
		var sp = string_script.split(/\n/g);

		sp.unshift(sp.shift(), 'var jsbEventCallback = {}, jsbGeneratorToken = "' + Token.create('generateToken') + '", jsbEventToken = "' + window.eventToken + '";', 'window[jsbEventToken] = document.addEventListener;', generic_helpers.toString(), "messageExtension('registerSpecial');");
	} else
		var sp = null;

	var tok = window.Token ? Token.create('userScript') : 0, newScript = ['(', sp ? sp.join("\n") : string_script, ')',
		'(',
			v !== undefined ? (typeof v === 'string' ? '"' + v + '"' : v) : 'null', ',',
			script.prototype && script.prototype.args ? JSON.stringify(script.prototype.args) : 'null', ',',
			'"', tok, '",',
			'"', which, '"',
		');'].join('');

	if (document.documentElement.firstChild)
		document.documentElement.insertBefore(s, document.documentElement.firstChild);
	else
		document.documentElement.appendChild(s);

	if (window.eventToken)
		document.addEventListener('JSBCommander' + tok + eventToken, commandHandler, true);

	if (m) {
		if (window.Blob && (window.URL || window.webkitURL)) {
			var	url = (window.URL ? window.URL : window.webkitURL)['createObjectURL'](new Blob([newScript], { type: 'application/javascript' }));

			s.setAttribute('src', url);
		} else
			s.src = 'data:text/javascript,' + encodeURI(newScript);

		if ((window.info && !info.beta) && (!user_scripts[which] || (user_scripts[which] && !user_scripts[which].developerMode)))
			s.onload = function () {
				document.documentElement.removeChild(this);
			};
	} else {
		if (!window.enabled_specials || !enabled_specials.inline_scripts.value || (enabled_specials.inline_scripts.value && enabled_specials.inline_scripts.allowed % 2))
			s.appendChild(document.createTextNode(newScript));

		if (which !== 'inlineScriptsCheck') {
			if (!window.inlineScriptsAllowed || (enabled_specials.inline_scripts.value && !(enabled_specials.inline_scripts.allowed % 2)))
				appendScript(script, which, v, priv, name, custom, s.id);
			else if (!info.beta && (!user_scripts[which] || (user_scripts[which] && !user_scripts[which].developerMode)))
				document.documentElement.removeChild(s);
		} else if (!info.beta && (!user_scripts[which] || (user_scripts[which] && !user_scripts[which].developerMode)))
			document.documentElement.removeChild(s);
	}
}

var doSpecial = function (do_append, n, action, priv, name, custom) {
	var v = enabled_specials[n].value , m;

	if (v === true || parseInt(v, 10) || (typeof v === 'string' && v.length)) {
		if (!((m = enabled_specials[n].allowed) % 2)) {
			if (!enabled_specials[n].exclude)
				jsblocker.blocked.special.all.push({
					name: n, 
					rtype: m,
					unblockable: false,
					meta: null,
					page: [jsblocker.href]
				});
			
			if (!custom) {
				if (do_append) {
					if (special_actions[n] !== true)
						appendScript(action, n, v, priv, name);
				} else action(v);
			}
		} else
			if (m !== 84) {
				if (!enabled_specials[n].exclude)
					jsblocker.allowed.special.all.push({
						name: n, 
						rtype: m,
						unblockable: false,
						meta: null,
						page: [jsblocker.href]
					});

				if (custom) appendScript(action, n, true, priv, name, custom);
			}
	}
}

var genericHelpers = {
	JSBCommander: function JSBCommander (detail, extra, callback, preserve) {
		var callback_id = registerCallback(callback, preserve),
				o = {
			key: jsbAccessToken,
			token: detail.token,
			command: detail.which,
			via: typeof jsbScriptNS !== 'undefined' ? jsbScriptNS : Date.now(),
			callback: callback_id ? callback_id : null,
			callback_func: callback_id ? callback.toString() : null
		};

		if (!(extra instanceof Object)) extra = { data: extra };

		if (extra)
			for (var key in extra)
				if (!(key in o))
					o[key] = extra[key];

		document.dispatchEvent(new JSBCustomEvent('JSBCommander' + jsbAccessToken + jsbEventToken, {
			detail: o
		}));
	},
	JSBCustomEvent: function JSBCustomEvent (event, params) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var evt = document.createEvent('CustomEvent');
		evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return evt;
	},
	messageExtension: function messageExtension (which, meta, callback, preserve) {
		JSBCommander({ token: jsbGeneratorToken, which: 'generateToken' }, { which: which }, function (detail) {
			JSBCommander(detail, meta, callback, preserve);
		});
	},
	registerCallback: function registerCallback (func, preserve) {
		if (typeof func !== 'function') return null;

		var id = Math.random().toString(36);

		jsbEventCallback[id] = {
			func: func,
			preserve: preserve
		}

		return id;
	},
	executeCallback: function executeCallback (origin, callback_id, detail) {
		messageExtension('beginExecuteCallback', { origin: origin, id: callback_id, detail: detail });
	},
	topHandler: function topHandler (detail) {
		if (window !== window.top) return;

		switch (detail.command) {
			case 'notification':
				messageExtension('notification', {
					title: detail.title,
					frame: true,
					body: detail.body,
					id: detail.id,
					meta: detail.meta,
					origin: detail.key
				}, eval(detail.callback_func ? '(function () { return ' + detail.callback_func + ' })();' : ''));
			break;
		}
	},
	initEvent: function initEvent (init) {
		document.removeEventListener(jsbAccessToken + jsbEventToken, initEvent, true);

		jsbGeneratorToken = event.detail.generatorToken;
		jsbAccessToken = init.detail.regeneratedAccessToken;

		jsbEventCallback[event.detail.callback].func(event.detail);

		delete jsbEventCallback[event.detail.callback];

		window[jsbEventToken].call(document, jsbAccessToken + jsbEventToken, function (event) {
			if (event.detail.generatorToken)
				jsbGeneratorToken = event.detail.generatorToken;
			
			if (event.detail.callback && (event.detail.callback in jsbEventCallback)) {
				jsbEventCallback[event.detail.callback].func(event.detail.result ? event.detail.result : event.detail);

				try {
					if (!jsbEventCallback[event.detail.callback].preserve)
						delete jsbEventCallback[event.detail.callback];
				} catch (e) {}

				return;
			} else if (event.detail.topHandler && event.detail.token === jsbAccessToken)
				topHandler(event.detail.topHandler);
		}, true);
	}
},
	userScriptHelpers = {
	GM_getValue: function GM_getValue (name, def) {
		var c = window.localStorage.getItem(jsbScriptNS + name);

		return c === null ? (def !== undefined ? def : null) : c;
	},
	GM_setValue: function GM_setValue (name, value) {
		window.localStorage.setItem(jsbScriptNS + name, value);
	},
	GM_deleteValue: function GM_deleteValue (name) {
		window.localStorage.removeItem(jsbScriptNS + name);
	},
	GM_listValues: function GM_listValues () {
		return Object.keys(window.localStorage).filter(function (key) {
			return key.indexOf(jsbScriptNS) === 0;
		});		
	},

	// RESOURCES
	GM_getResourceText: function GM_getResourceText (name) {
		return GM_resources[name] ? atob(GM_resources[name].data) : '';
	},
	GM_getResourceURL: function GM_getResourceURL (name) {
		if (!GM_resources[name]) return '';

		if (window.Blob) {
			var ch = GM_getResourceText(name), bn = new Array(ch.length);

			for (var i = 0; i < ch.length; i++) bn[i] = ch.charCodeAt(i);

			return (window.URL ? window.URL : window.webkitURL).createObjectURL(new Blob([new Uint8Array(bn)], { type: GM_resources[name].type }));
		} else
			return 'data:' + GM_resources[name].type + ';base64,' + GM_resources[name].data;
	},

	// OTHER
	GM_addStyle: function GM_addStyle (css) {
		var style = document.createElement('style');
		style.setAttribute('type', 'text/css');
		style.innerHTML = css;

		if (document.head) {
			document.head.appendChild(style);
		} else {
			document.documentElement.appendChild(style);
		}
	},
	GM_log: function GM_log () {
		console.debug.apply(console, arguments);
	},
	GM_openInTab: function GM_openInTab (url) {
		messageExtension('openInTab', url);
	},
	GM_registerMenuCommand: function GM_registerMenuCommand (caption, func, accessKey) {
		messageExtension('registerMenuCommand', {
			caption: GM_info.script.name + ' - ' + caption
		}, func, true);
	},
	GM_setClipboard: function GM_setClipboard () { },
	GM_xmlhttpRequest: function GM_xmlhttpRequest (details) {
		var serializable = {}, key, r, a = document.createElement('a');

		for (key in details)
			try {
				r = JSON.stringify(details[key]);

				if (typeof r !== 'undefined') serializable[key] = details[key];
			} catch (e) {}

		a.href = serializable.url;
		serializable.url = a.href;

		messageExtension('XMLHttpRequest', {
			details: serializable
		}, function (res) {
			if (res.action === 'XHRComplete') {
				delete jsbEventCallback[res.callback];

				details = serializable = a = key = r = undefined;
			}	else if (res.action in details)
				details[res.action](res.response);
		}, true);
	}
};

var generic_helpers = [], user_helpers = [], helper;

for (helper in genericHelpers)
	generic_helpers.push(genericHelpers[helper].toString() + ';');

generic_helpers.push('	window[jsbEventToken].call(document, jsbAccessToken + jsbEventToken, initEvent, true);');

generic_helpers = generic_helpers.join("\n");

for (helper in userScriptHelpers)
	user_helpers.push(userScriptHelpers[helper].toString() + ';');

user_helpers = user_helpers.join("\n");

var parseSpecials = function (pre) {
	var lines, helper, script, z, n, i, b;

	if (pre)
		for (z in special_actions)
			doSpecial(1, z, special_actions[z]);

	for (n in user_scripts) {
		if (pre && !user_scripts[n].before) continue;
		if (!pre && user_scripts[n].before) continue;

		lines = [];

		if (user_scripts[n].script) {
			if (typeof user_scripts[n].script === 'function')
				script = '(' + user_scripts[n].script + ')();';
			else
				script = user_scripts[n].script;

			lines = script.split(/\n/g);

			lines.unshift(
				'function (jsbValue, jsbArgs, jsbAccessToken, jsbScriptNS) {',
				'	var unsafeWindow = window, jsbEventCallback = {}, jsbGeneratorToken = "' + Token.create('generateToken') + '", jsbEventToken = "' + eventToken + '",',
				' GM_resources = ' + (user_scripts[n].resources ? JSON.stringify(user_scripts[n].resources) : '{}') + ',',
				' GM_info = {',
				'		scriptMetaStr: ' + JSON.stringify(user_scripts[n].metaStr) + ',',
				'		scriptWillUpdate: ' + (user_scripts[n].autoUpdate ? 'true' : 'false') + ',',
				'		version: null,',
				'		script: ' + JSON.stringify(user_scripts[n].meta),
				'	};',
				generic_helpers,
				user_helpers,
				"	messageExtension('registerUserScript');"
			);

			lines.push('}');

			doSpecial(1, n, lines.join("\n"), 1, user_scripts[n].meta.name, 1);
		} else
			doSpecial(1, n, 'function() {}', 1, user_scripts[n].meta.name, 1);
	}
}

special_actions.alert_dialogs.prototype.args = [window.accessToken || 1, { 'Alert': _('Alert'), 'Close': _('Close'), 'via frame': _('via frame') }, window.bv];
special_actions.ajax_intercept.prototype.args = [window.accessToken || 1, window.Token ? Token.create('ajaxIntercept', true) : null, window.bv];
special_actions.autocomplete_disabler.prototype.args = [window.bv || 0];
special_actions.inline_scripts.prototype.args = [window.bv || 0];

if (window.Token && !disabled) {
	var specials = [], scripts = ResourceCanLoad(beforeLoad, ['userScripts', jsblocker.href]), enabled_specials = {};

	for (var i in scripts) {
		specials.push(i);

		if (scripts[i].requirements)
			for (var url in scripts[i].requirements) {
				enabled_specials[url] = { allowed: 1, value: 1 };

				user_scripts[url] = {
					before: true,
					metaStr: '',
					script: atob(scripts[i].requirements[url].data),
					meta: {
						name: url
					}
				};
			}
	}

	for (var key in scripts) user_scripts[key] = scripts[key];
	for (var w in special_actions) specials.push(w);

	var es = ResourceCanLoad(beforeLoad, ['enabledSpecials', specials, jsblocker.href]);

	for (var s in es) enabled_specials[s] = es[s];

	if (enabled_specials.ajax_intercept.value === 1)
		special_actions.ajax_intercept.prototype.args.push({
			'Make this a temporary rule': _('Temporary rule'),
			'Allow': _('Allow'),
			'Block': _('Block'),
			'Allow Once': _('Allow Once'),
			'Block Once': _('Block Once'),
			'Add Rule...': _('Add Rule...'),
			'Save': _('Save'),
			'On:': _('On:'),
			'Cancel': _('Cancel'),
			'Origin': _('Origin'),
			'Path': _('Path'),
			'Parameters': _('Parameters'),
			'All Domains': _('All Domains'),
		});

	appendScript(special_actions.inlineScriptsCheck, 'inlineScriptsCheck');
	appendScript(special_actions.genericSpecial, 'genericSpecial');

	parseSpecials(true);

	document.addEventListener('DOMContentLoaded', function () {
		parseSpecials(false);
	}, true);
}
}