/***************************************
 * @file js/global.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

"use strict";

var Template = {
			tmpl_cache: { },
			create: function(str, data) {
				// Simple JavaScript Templating
				// John Resig - http://ejohn.org/ - MIT Licensed
		
				if(data !== false && typeof data != 'object') data = {};
		
				if(!/\W/.test(str)) {
					if(str in this.tmpl_cache) var fn = this.tmpl_cache[str];
					else {
						var e;
						
						if(!(e = document.getElementById(str))) return false;
				
						var fn = this.create($(e).text(), false);
					}
				} else
					var fn = this.tmpl_cache[str] = new Function('self',
						"var p=[],print=function(){p.push.apply(p,arguments);};p.push('" +
						str
							.replace(/[\r\t\n]/g, "")
							.split("<%").join("\t")
							.replace(/((^|%>)[^\t]*)'/g, "$1\r")
							.replace(/\t=(.*?)%>/g, "',$1,'")
							.split("\t").join("');")
							.split("%>").join("p.push('")
							.split("\r").join("\\'") +
						"');return p.join('');");
	
				return data ? fn(data) : fn;
			}
	},
	_$ = function (s) {
		return $(s, JavaScriptBlocker.popover);
	},
	JavaScriptBlocker = {
	updating: !1,
	finding: !1,
	reloaded: !1,
	caches: {
		domain_parts: {},
		active_host: {},
		collapsed_domains: null
	},
	commandKey: !1,
	speedMultiplier: 1,
	disabled: !1,
	frames: {},
	displayv: '2.3.1',
	bundleid: 55,
	
	set_theme: function (theme) {
		_$('#main-large-style').attr('href', safari.extension.settings.largeFont ? 'css/main.large.css' : '');
		
		if (!this.donationVerified) {
			if (theme !== 'default') {
				this.theme = 'default';
				this.set_theme(this.theme);
			}
			
			return false;
		}
		
		var t = _$('#poppy-theme-style');
		
		if (!(new RegExp('\\.' + theme + '\\.')).test(t.attr('href'))) {
			t.attr('href', 'css/poppy.' + theme + '.css');
			_$('#main-theme-style').attr('href', 'css/main.' + theme + '.css');
		}
	},

	donate: function () {
		var self = this;
		
		this.utils.send_installid();
		
		if (!self.donationVerified)
			new Poppy($(this.popover.body).width() / 2, 13, [
				'<p>', _('Updated JavaScript Blocker {1}', ['<a class="outside" href="http://javascript-blocker.toggleable.com/change-log/230">' + this.displayv + '</a>']), '</p>',
				'<p>', _('Thank you for your continued use'), '</p>',
				'<p>', _('Please, if you can'), '</p>',
				'<p>',
					'<input type="button" value="', _('Make a Donation'), '" id="make-donation" /> ',
					'<input type="button" value="', _('Maybe Later'), '" id="no-donation" /> ',
					'<input type="button" value="', _('I\'ve Donated!'), '" id="already-donation" /> ',
				'</p>'].join(''), function () {
					_$('#make-donation').click(function () {
						self.installedBundle = self.bundleid;
				
						self.utils.open_url('http://javascript-blocker.toggleable.com/donate');
					});
					_$('#no-donation').click(function () {
						self.installedBundle = self.bundleid;
						new Poppy();
					});
					_$('#already-donation').click(function () {
						self.installedBundle = self.bundleid;
						_$('#unlock').click();
					});
				}, null, null, true);
		else {
			new Poppy();
			this.installedBundle = this.bundleid;
		}
	},
	
	updater: function () {
		var v = this.installedBundle, self = this;
		
		if (v === this.bundleid) return false;
		else if (v < 51) {
			if (!self.RulesWereUpgraded) {
				self.RulesWereUpgraded = true;
				
				for (var d in this.rules.rules)
					self.utils.zero_timeout(function (self, domain) {
						var rules = self.rules.for_domain(domain, true), rule;
					
						if (domain in rules) {
							self.rules.remove_domain(domain);
						
							for (rule in rules[domain]) {
								var x = typeof rules[domain][rule] === 'object' ? rules[domain][rule][0] : rules[domain][rule],
										y = x > 5 ? (x === 7 ? 1 : 0) : x,
										z = x > 5;
								self.rules.add(domain, rule, y, z);
							}
						}
					}, [self, d]);
					
				self.rules.reinstall_predefined();
			}
		
			self.utils.zero_timeout(function (self) {
				new Poppy($(this.popover.body).width() / 2, 13, [
					'<p>Donator-only features have now be locked and are only available to donators, including the new temporary rules feature.</p>',
					'<p><a class="outside" href="http://javascript-blocker.toggleable.com/donation_only">', _('What donation?'), '</a></p>',
					'<p><input type="button" id="rawr-continue" value="', _('Understood'), '" /></p>'].join(''), function () {
						_$('#rawr-continue').click(function () {
							self.installedBundle = 51;
							self.updater();
						});
				}, null, null, true);
			}, [self]);
		} else if (v < 54) {
			if (!self.RulesWereUpgraded2) {
				self.RulesWereUpgraded2 = true;
				
				window.localStorage.removeItem('CollapsedDomains');
				window.localStorage.removeItem('InstallID');
				
				var ex = ['CollapsedDomains', 'ExamineUpdateTime', 'InstalledBundleID', 'LastRuleWasTemporary', 'ERROR', 'Rules',
						'allowedIsCollapsed', 'blockedIsCollapsed', 'unblockedIsCollapsed'], key, n = {};
				
				for (key in window.localStorage) {
					if (ex.indexOf(key) > -1) continue;
					
					try {
						n[key] = JSON.parse(window.localStorage[key]);
					} catch (e) {
						continue;
					} finally {
						window.localStorage.removeItem(key);
					}
				}
				
				window.localStorage.setItem('Rules', JSON.stringify(n));
			}
			
			new Poppy($(this.popover.body).width() / 2, 13, [
				'<p class="misc-info">Update 2.3.0</p>',
				'<p>You can now enable the use of a larger display font.</p>',
				'<p>A new option will let you block some referer headers. This utilizes the \'rel="noreferrer"\' attribute of anchors.</p>',
				'<p><b>Donators only:</b> A more full-featured referrer blocker, including the ability to block even server-side redirect ones.</p>',
				'<p><b>Donators only:</b> You can now create a backup of your rules.</p>',
				'<p>Donations can now be made via Bitcoin! Send to: 1C9in5xaFcwi7aYLuK1soZ8mvJBiEN9MNA</p>',
				'<p><a class="outside" href="http://javascript-blocker.toggleable.com/donation_only">', _('What donation?'), '</a></p>',
				'<p><input type="button" id="rawr-continue" value="', _('Understood'), '" /></p>'].join(''), function () {
					_$('#rawr-continue').click($.proxy(self.donate, self));
			}, null, null, true);
		} else if (v < this.bundleid)
			this.donate();
	},
	
	load_language: function (css) {
		function set_popover_css (self, load_language, f) {
			if (self.popover && _$('#lang-css-' + load_language).length === 0) {
				$('<link />').appendTo(self.popover.head).attr({
						href: 'i18n/' + load_language + '.css',
						type: 'text/css',
						rel: 'stylesheet',
						id: 'lang-css-' + load_language,
				}).addClass('language-css');
			} else
				self.utils.zero_timeout(f, [self, load_language, f]);
		}
		
		var load_language = (safari.extension.settings.language !== 'Automatic') ?
				safari.extension.settings.language : window.navigator.language;
	
		if (css)
			this.utils.zero_timeout(set_popover_css, [this, load_language, set_popover_css]);
		else if (load_language !== 'en-us' && !(load_language in Strings))
			$.getScript('i18n/' + load_language + '.js', function (data, status) { });
	},
	
	examine: {
		_cache: { simpleMode : {} },
		_populate_cache: function () {
			if (!this.donationVerified) return false;
			
			if (!$.isEmptyObject(this._cache.simpleMode) &&
					('ExamineUpdateTime' in window.localStorage) &&
					((+new Date) - window.localStorage['ExamineUpdateTime']) / 1000 / 60/ 60 < 12) return false;
				
			$.getScript('http://dl.dropbox.com/u/11967/examine.js').success(function () {
				window.localStorage['ExamineUpdateTime'] = +new Date;
			}).error(function () {
				window.localStorage['ExamineUpdateTime'] = +new Date - (1000 * 60 * 11);
			});
		},
		script: function (host, url) {
			if (!this.donationVerified) return false;
				
			var parts = this.utils.domain_parts(host), part,
					url_parts = this.simpleMode ? this.utils.domain_parts(url) : [],
					cache = this.simpleMode ? this._cache.simpleMode : this._cache, x, u;
			
			for (var i = 0; i < parts.length; i++) {
				part = (i === 0) ? parts[i] : '.' + parts[i];
				
				if (!(part in cache)) continue;
				
				for (var key in cache[part]) {
					if (this.simpleMode) {
						for (x = 0; x < url_parts.length; x++) {
							u = x === 0 ? url_parts[x] : '.' + url_parts[x];
							
							if (cache[part][u]) return cache[part][u];
						}
						
						continue;
					} else if (!(new RegExp('^' + key + '$')).test(url)) continue;
					
					return this._cache[part][key];
				}
			}
			
			return null;
		}
	},
	
	/**
	 * Removes frames that no longer exist.
	 * Removes any empty rules.
	 * Removes any collapsed domains that no longer exist.
	 *
	 * @this {JavaScriptBlocker}
	 */
	_cleanup: function () {
		var i, b, j, c, key, e, new_collapsed = [], new_frames = {};
		
		for (i = 0, b = safari.application.browserWindows.length; i < b; i++)
			for (j = 0, c = safari.application.browserWindows[i].tabs.length; j < c; j++)
				if (this.frames[safari.application.browserWindows[i].tabs[j].url])
					new_frames[safari.application.browserWindows[i].tabs[j].url] = this.frames[safari.application.browserWindows[i].tabs[j].url];
					
		this.frames = new_frames;
		this.anonymous.newTab = {};
		this.anonymous.previous = {};
		
		this.caches.active_host = {};
		this.caches.domain_parts = {};
		
		function clean_emptyruleset (key, r) {
			if ($.isEmptyObject(r.rules[key]))
				delete r.rules[key];
		}
		
		window.localStorage.removeItem('ERROR');
	
		for (key in this.rules.rules)
			this.utils.zero_timeout(clean_emptyruleset, [key, this.rules]);
		
		this.utils.zero_timeout(function (rules) {
			rules.save()
		}, [this.rules]);
		
		var xx = this.collapsedDomains();
		
		if (typeof xx === 'object')
			for (var x = 0; x < xx.length; x++)
				if (xx[x] === _('All Domains') || (xx[x] in this.rules.rules))
					new_collapsed.push(xx[x]);
			
		this.collapsedDomains(new_collapsed);
	},
	get simpleMode() {
		return safari.extension.settings.simpleMode;
	},
	set simpleMode(value) {
		safari.extension.settings.simpleMode = value;
	},
	get saveAutomatic() {
		return safari.extension.settings.saveAutomatic;
	},
	get setupDone() {
		return parseInt(safari.extension.settings.setupDone, 10);
	},
	set setupDone(value) {
		safari.extension.settings.setupDone = value;
	},
	get useAnimations() {
		return safari.extension.settings.animations;
	},
	set theme(value) {
		safari.extension.settings.theme = value;
	},
	get theme() {
		return safari.extension.settings.theme;
	},
	get busy() {
		return $(this.popover.body).hasClass('busy');
	},
	set busy(value) {
		$(this.popover.body).toggleClass('busy', value === 1);
	},
	get installedBundle() {
		var id = window.localStorage.getItem('InstalledBundleID');
		
		return typeof id === 'string' ? parseInt(id, 10) : null;
	},
	set installedBundle(value) {
		if (value === this.bundleid) this.utils.attention(-1);
		window.localStorage.setItem('InstalledBundleID', value);
	},
	get donationVerified() {
		return safari.extension.secureSettings.getItem('donationVerified');
	},
	set donationVerified(value) {
		safari.extension.secureSettings.setItem('donationVerified', value);
	},
	get methodAllowed() {
		if (this.simpleMode) return true;
		return this.donationVerified;
	},
	get host() {
		return this.active_host(_$('#page-list').val());
	},
	collapsedDomains: function (v) {
		if (!v) {
			var t = window.localStorage.getItem('CollapsedDomains');
			return $.isEmptyObject(t) ? [] : JSON.parse(t).d;
		}
		
		window.localStorage.setItem('CollapsedDomains', JSON.stringify({ d: v }));
	},
	utils: {
		_zero_timeouts: [],
		
		/**
		 * Creates an immediate timeout.
		 *
		 * @param {function} fn The function to be executed.
		 * @param {Array} args Arguments to be based to fn.
		 */
		zero_timeout: function(fn, args) {
			this._zero_timeouts.push([fn, args]);
			window.postMessage('zero-timeout', '*');
		},
		sort_object: function (o) {
			var s = {}, k, b, a = [];
			for (k in o) {
				if (o.hasOwnProperty(k))
					a.push(k);
			}
			a.sort();
			for (k = 0, b = a.length; k < b; k++)
				s[a[k]] = o[a[k]];
			return s;
		},
		parse_JSON: function (s) {
			try {
				return JSON.parse(s);
			} catch(e) { return false; }
		},
		escape_regexp: function (text) {
			if (!text || !text.length) return text;
			return text.replace(new RegExp('(\\' + ['/','.','*','+','?','|','$','^','(',')','[',']','{','}','\\'].join('|\\') + ')', 'g'), '\\$1');
		},
		
		/**
		 * Requires the user to click twice on an element to execute an action.
		 *
		 * @param {Element} e The HTML element the user clicks on.
		 */
		confirm_click: function (e) {
			var $e = $(e);

			if (!$e.hasClass('confirm-click')) {
				$e.data('confirm_timeout', setTimeout(function () {
					$e.removeClass('confirm-click');
				}, 3000));

				$e.addClass('confirm-click');

				return false;
			}

			clearTimeout($e.data('confirm_timeout'));

			$e.removeClass('confirm-click');

			return true;
		},
		
		/**
		 * Creates a fancy zoom-in/out window effect.
		 *
		 * @param {jQuery.Element} e The element to be zoomed in or out.
		 * @param {jQuery.Element} hide The element to be hidden/revealed when e is zoomed in or out.
		 * @param {function} cb Callback function to call once zoom window execution is completed.
		 */
		zoom: function (e, hide, cb) {
			var t = 0.6 * this.speedMultiplier, self = this, start_value, end_value, start_hide_zoom, end_hide_zoom, c;

			if (e.is(':animated') || e.data('isAnimating')) return false;
							
			e.data('isAnimating', true);
			
			hide = hide || $('<div />');
			cb = cb || $.noop;
			
			start_value = !e.hasClass('zoom-window') ? 0.3 : 1;
			end_value = start_value === 1 ? 0.3 : 1;
					
			start_hide_zoom = start_value === 1 ? 1.2 : 1;
			end_hide_zoom = start_hide_zoom === 1 ? 1.2 : 1;
					
			if (start_value !== 1) {
				e.addClass('zoom-window').css('zIndex', 999);
				hide.data('scrollTop', hide.scrollTop());
			} else {
				hide.css('zIndex', 0);
				e.removeClass('zoom-window-open');
			}
			
			c = {
				display: 'block',
				WebkitTransitionProperty: '-webkit-transform, opacity',
				WebkitTransitionDuration: t + 's',
				WebkitTransitionTimingFunction: 'ease'
			};
			
			e.css(c);
			hide.css(c);
					
			e.css({
				WebkitTransform: 'scale(' + (start_value & 1) + ')',
				opacity: start_value
			});
					
			hide.css({
				WebkitTransform: 'scale(' + start_hide_zoom + ')',
				opacity: end_value & 1,
				WebkitTransitionDuration: t + 's, ' + (t * 0.8) + 's, ' + t + 's'
			});
					
			if (start_value === 1) hide.scrollTop(hide.data('scrollTop'));
			
			this.zero_timeout(function (hide, e, end_value, start_value, end_hide_zoom, cb, t) {
				hide.css({
					WebkitTransform: 'scale(' + end_hide_zoom + ')',
					opacity: start_value & 1
				});
								
				e.css({
					WebkitTransform: 'scale(' + (end_value & 1) + ')',
					opacity: (end_value & 1) === 0 ? end_value * 0.5 : end_value
				});
				
				e.one('webkitTransitionEnd', { e: e, s: start_value, h: hide, c: cb }, function (event) {
					var d = event.data;
					
					d.e.data('isAnimating', false);
					
					if (d.s !== 1){
						d.h.hide().css('zIndex', 0);
						d.e.addClass('zoom-window-open');
					} else {
						d.e.hide().removeClass('zoom-window zoom-window-open');
						d.h.css('zIndex', 999);
						d.c.call(JavaScriptBlocker);
					}
				});
			}, [hide, e, end_value, start_value, end_hide_zoom, cb, t]);
		},
		timer: {
			timers: { intervals: {}, timeouts: {} },
			interval: function () {
				return this.create.apply(this, ['interval'].concat($.makeArray(arguments)));
			},
			timeout: function () {
				return this.create.apply(this, ['timeout'].concat($.makeArray(arguments)));
			},
			create: function (type, name, script, time, args) {
				if (type != 'interval' && type != 'timeout') return false;
				
				if (typeof args !== 'object') args = [];

				var self = this;

				this.remove(type, name);

				var ww = type == 'interval' ? window.setInterval : window.setTimeout,
						timer_func = ww.apply(null, [script, time].concat(args));

				if (type == 'timeout' && !name.match(/_auto_delete$/))
					this.create('timeout', name + '_auto_delete', function () {
						self.remove(type, name);
					}, time + 100);

				this.timers[type + 's'][name] = { name: name, timer: timer_func, script: script, time: time };

				return this.timers[type + 's'][name];
			},
			remove: function () {
				var args = $.makeArray(arguments), type = args[0] + 's';

				if (args.length === 1) {
					var to_remove = [];
					
					for (name in this.timers[type])
						if (this.timers[type][name])
							to_remove.push(name);
					
					if (to_remove.length)
						this.remove.apply(this, [args[0]].concat(to_remove));

					return true;
				}
		
				for (var i = 1; (name = args[i]); i++) {
					try {
						if (args[0] == 'timeout') {
							clearTimeout(this.timers[type][name].timer);
							clearTimeout(this.timers[type][name + '_auto_delete'].timer);
						} else if (args[0] == 'interval')
							clearInterval(this.timers[type][name].timer);

						delete this.timers[type][name];
						delete this.timers[type][name + '_auto_delete'];
					} catch(e) { }
				}

				return true;
			}
		},
		id: function (c) {
			return ((Math.random() + Math.random() + Math.random()) * 10000000000000000).toString().split('').map(function (e) {
					var v = (parseInt(Math.random() * 10)) + parseInt(e),
							x = String.fromCharCode('1' + (v < 10 ? '0' + v : v)),
							r = String.fromCharCode(65 + Math.round(Math.random() * (90 - 65))),
							b = Math.random() > Math.random() ?
									(Math.random() > Math.random() ? x : x.toUpperCase()) : (Math.random() > Math.random() ? r : r.toLowerCase());
					return typeof c === 'number' ? (c === 0 ? b.toLowerCase() : b.toUpperCase()) : b;
			}).join('');
		},
		open_url: function (url) {
			safari.application.activeBrowserWindow.openTab().url = url;
			safari.extension.toolbarItems[0].popover.hide();
		},
		send_installid: function () {
			$.get('http://lion.toggleable.com:160/jsblocker/installed.php?id=' + safari.extension.secureSettings.getItem('installID'));
		},
		_attention: !1,
		_has_attention: 0,
		attention: function (mode) {
			var self = this;

			if (mode !== 1 && (this._has_attention || mode < 0)) {
				this.timer.remove('interval', 'toolbar_attention');
				this.timer.timeout('toolbar_attention', function () {
					self._has_attention = false;
					
					var toolbarItem;
					
					for (var y = 0; y < safari.extension.toolbarItems.length; y++) {
						toolbarItem = safari.extension.toolbarItems[y];

						toolbarItem.image = self.disabled ? safari.extension.baseURI + 'images/toolbar-disabled.png' : safari.extension.baseURI + 'images/toolbar.png';
					}
				}, 1100);
				
				return false;
			}
			
			this._has_attention = 1;
			
			this.timer.interval('toolbar_attention', function () {
				self._attention = !self._attention;
				
				var u = safari.extension.baseURI + 'images/', toolbarItem;
				
				for (var y = 0; y < safari.extension.toolbarItems.length; y++) {
					toolbarItem = safari.extension.toolbarItems[y];

					toolbarItem.image = self._attention ? u + 'toolbar-attn.png' : (self.disabled ? u + 'toolbar-disabled.png' : u + 'toolbar.png');
					toolbarItem.badge = self._attention ? 0 : 1;
				}
			}, 1000);
		}
	},
	
	/**
	 * Retrieves the hostname of the currently active tab or of the passed in url.
	 *
	 * @param {string}(optional) url An optional url to retrieve a hostname from.
	 * @return {string} The hostname of a url, either from the passed in argument or active tab.
	 */
	active_host: function (url) {
		if (url === 'about:blank') return 'blank';
		
		if (url && (url in this.caches.active_host)) return this.caches.active_host[url];
		var r = /^(https?|file|safari\-extension):\/\/([^\/]+)\//;
		if (url) {
			if (/^data/.test(url)) return (this.caches.active_host[url] = 'Data URI');
			else if (url.match(r) && url.match(r).length > 2) return (this.caches.active_host[url] = url.match(r)[2]);
			else return 'ERROR';
		}
		
		try {
			return (this.caches.active_host[url] = safari.application.activeBrowserWindow.activeTab.url.match(r)[2]);
		} catch(e) {
			return 'ERROR';
		}
	},
	
	active_protocol: function (host) {
		return host.substr(0, host.indexOf(':'));
	},
	
	/**
	 * Separates a hostname into its subdomain parts.
	 *
	 * @param {string} domain The hostname to separate into pieces.
	 * @return {Array} Parts of the hostname, including itself and * (All Domains)
	 */
	domain_parts: function (domain) {
		if (domain in this.caches.domain_parts) return this.caches.domain_parts[domain];
		if (domain === 'blank') return ['blank', '*'];
		
		var s = domain.split(/\./g).reverse(), t = s[0], p = ['*'], i, b,
				ex = ['co.uk', 'me.uk', 'org.uk', 'com.cn', 'org.cn', 'com.tw', 'org.tw', 'com.mx', 'co.nz', 'net.nz', 'org.nz',
						'us.com', 'uk.com', 'eu.com', 'de.com'];
		
		for (i = 1, b = s.length; i < b; i++) {
			t = s[i] + '.' + t;
			if (ex.indexOf(t) === -1)
				p.push(t);
		}
			
		if (p.length === 1) p.push(domain);
		
		this.caches.domain_parts[domain] = p.reverse();
		
		return this.caches.domain_parts[domain];
	},
	rules: {
		_loaded: false,
		get rules() {
			if (this._loaded) return this._rules;
			
			this._loaded = true;
			this._rules = JSON.parse(window.localStorage.getItem('Rules') || '{}');
			
			return this._rules;
		},
		save: function () {
			this.utils.timer.timeout('save_rules', function (rules) {
				try {
					window.localStorage.setItem('Rules', JSON.stringify(rules));
				} catch (e) { }
			}, 1000, [this.rules]);
		},
		export: function () {
			if (!this.donationVerified) return '';
			
			return JSON.stringify(this.rules);
		},
		import: function (string) {
			if (!this.donationVerified) return false;
			
			this._loaded = false;
			this.cache = {};
			
			try {
				var r = JSON.parse(string);
				
				if (typeof r === 'object')
					for (var key in r) {
						if (typeof r[key] === 'object') break;
						
						try {
							r[key] = JSON.parse(r[key]);
						} catch(e) {
							continue;
						}
					}
				
				var s = JSON.stringify(r);

				window.localStorage.setItem('Rules', s);
				
				return true;
			} catch (e) {
				return false;
			}
		},
		cache: {},
		temporary_cleared: false,
		clear_temporary: function () {
			if (this.temporary_cleared || !this.donationVerified) return false;
			
			this.temporary_cleared = true;

			for (var domain in this.rules) {
				var rules = this.for_domain(domain, true), rule;
			
				if (domain in rules)
					for (rule in rules[domain])
						if (rules[domain][rule][1])
							this.remove(domain, rule, true);
			}
		},
		recache: function (d) {
			if (d === '.*')
				this.cache = {};
			else if (d.match(/^\..*$/)) {
				for (var c in this.cache)
					if (c.match(new RegExp('.*' + this.utils.escape_regexp(d) + '$')))
						delete this.cache[c];
			} else
				delete this.cache[d];
		},
		reinstall_predefined: function () {
			var a, b, c, d;
			
			for (a in this.whitelist)
				for (b = 0; b < this.whitelist[a].length; b++)
					this.add(a, this.whitelist[a][b], 5);
			
			for (c in this.blacklist)
				for (d = 0; d < this.blacklist[c].length; d++)
					this.add(c, this.blacklist[c][d], 4);
		},
		for_domain: function (domain, one) {
			if (domain in this.cache) {
				var temp = {};
				
				if (one) {
					if (domain in this.cache[domain] && typeof this.cache[domain][domain] === 'object')
						temp[domain] = this.cache[domain][domain];
					else
						temp[domain] = {};
				} else
					temp = this.cache[domain];
					
				return temp;
			}
			
			var parts = this.domain_parts(domain), o = {}, i, b, c, r;
			
			if (parts.length === 1 && domain !== '.*') return this.for_domain('.*', true);
			
			var x = parts.slice(0, 1),
					y = parts.slice(1);
			
			x.push(x[0]);
			
			parts = x.concat(y);
		
			for (i = 0, b = parts.length; i < b; i++) {
				c = (i > 0 ? '.' : '') + parts[i];
				r = this.rules[c];
				if (r === null || r === undefined) continue;
				if (c === '.*') {
					if (!(c in this.cache)) this.cache[c] = { '.*': r };
					o[c] = this.cache[c][c];
					continue;
				} 
				
				o[c] = r;
			}
	
			this.cache[domain] = o;

			return this.for_domain(domain, one);
		},
		add: function (domain, pattern, action, add_to_beginning, temporary) {
			if (pattern.length === 0) return this.remove(domain, pattern, true);
			
			if (!this.donationVerified) temporary = false;
			
			window.localStorage.setItem('LastRuleWasTemporary', temporary ? 1 : 0);
			
			var crules = this.for_domain(domain, true);
			
			action = parseInt(action, 10);
					
			if (!add_to_beginning) {
				if (!(domain in crules)) crules[domain] = {};
				else if (pattern in crules[domain] && crules[domain][pattern] === action) return false;
			}
			
			if (add_to_beginning) {
				var newrules = {}, e;
				newrules[domain] = {};
				newrules[domain][pattern] = [action, !!temporary];
				
				if (domain in crules)
					for (e in crules[domain])
						if (e !== pattern)
							newrules[domain][e] = crules[domain][e];
				
				crules = newrules;
			} else
				crules[domain][pattern] = [action, !!temporary];
			
			this.recache(domain);

			this.rules[domain] = crules[domain];
			
			this.save();
		},
		remove: function (domain, rule, delete_automatic) {
			var crules = this.for_domain(domain), key;
			if (!(domain in crules)) return false;
			
			this.recache(domain);

			try {
				if (!delete_automatic && crules[domain][rule][0] > 1 && crules[domain][rule][0] < 4) {
					crules[domain][rule][0] *= -1;
					crules[domain][rule][1] = false;
				} else
					delete crules[domain][rule];
			} catch(e) { }

			if ($.isEmptyObject(crules[domain]))
				delete this.rules[domain];
			else
				this.rules[domain] = crules[domain];
				
			this.save();
		},
		
		/**
		 * Retrieves a list of or removes any rule matching a given url.
		 *
		 * @param {string} domain Hostname to check against
		 * @param {string} url The url the rules must match
		 * @param {Boolean} confirmed Wether or not actually remove the rules or just return a list
		 * @param {number} block_allow The action the rule must be to match
		 * @param {Boolean} allow_disabled Wether or not to return/delete disabled rules
		 */
		remove_matching_URL: function (domain, urls, confirmed, block_allow, allow_disabled) {
			var crules = this.for_domain(domain), to_delete = {}, being_deleted = {}, sub, rule, url, rtype, temp;
			
			for (sub in crules) {
				to_delete[sub] = [];
				being_deleted[sub] = [];

				for (rule in crules[sub]) {
					rtype = crules[sub][rule][0];
					temp = crules[sub][rule][1];
					
					if (((!!(rtype % 2) !== block_allow) || (!allow_disabled && rtype < 0))) continue;
					
					for (var i = 0; i < urls.length; i++) {
						url = urls[i];
			
						if ((new RegExp(rule)).test(url)) {
							if (confirmed) {
								delete this.cache[sub];
												
								if (!(rule in crules[sub])) continue;
							
								if (rtype > 1 && rtype < 4) {
									crules[sub][rule][0] *= -1;
									crules[sub][rule][1] = false;
								} else if (rtype > -1)
									delete crules[sub][rule];
							} else {
								if (being_deleted[sub].indexOf(rule) > -1)
									continue;
								else
									being_deleted[sub].push(rule);
								
								to_delete[sub].push([rule, crules[sub][rule]]);
							}
						}
					}
				}

				if (!confirmed) {
					if (!to_delete[sub].length) delete to_delete[sub];
				} else {
			 		this.rules[sub] = crules[sub];
				}
			}
					
			return confirmed ? 1 : to_delete;
		},
		remove_domain: function (domain) {
			delete this.cache[domain];
			delete this.rules[domain];
			this.save();
		},
		
		/**
		 * Creates a <ul> displaying rules with actions to affect them.
		 *
		 * @param {string} domain Domain to display rules for
		 * @param {string|Boolean} url A url the rule must match in order to be displayed
		 * @param {Boolean} no_dbl_click Wether or not to enable double clicking on a rule
		 */
		view: function (domain, url, no_dbl_click) {
			var self = this, allowed = this.for_domain(domain, true), ul = $('<ul class="rules-wrapper"></ul>'), newul, rules, rule, did_match = !1, rtype, temp;
						
			if (domain in allowed) {
				allowed = allowed[domain];

				if (!$.isEmptyObject(allowed)) {
					var j = this.collapsedDomains(),
							domain_name = (domain.charAt(0) === '.' && domain !== '.*' ? domain : (domain === '.*' ? _('All Domains') : domain));
					
					newul = ul.append('<li class="domain-name"><span>' + domain_name + '</span></li><li><ul></ul></li>')
							.find('.domain-name:last').data('domain', domain).attr('id', this.utils.id()).end().find('li:last ul');
					rules = 0;
					
					for (rule in allowed) {
						rtype = allowed[rule][0];
						temp = allowed[rule][1];
						
						if (typeof url === 'object')
							for (var i = 0; i < url.length; i++) {
								did_match = (new RegExp(rule)).test(url[i]);
							
								if (did_match) break;
							}
						
						if ((url && (rtype < 0 || !did_match)) ||
								(safari.extension.settings.ignoreBlacklist && rtype === 4) ||
								(safari.extension.settings.ignoreWhitelist && rtype === 5)) continue;
						rules++;
						newul.append([
								'<li>',
									'<span class="rule type-', rtype, temp ? ' temporary' : '', '">', rule, '</span> ',
											'<input type="button" value="', (rtype < 0 ?
													_('Restore') : (rtype === 2 ? _('Disable') : _('Delete'))) + '" />',
									'<div class="divider"></div>',
								'</li>'].join(''))
								.find('li:last').data('rule', rule).data('domain', domain).data('type', rtype);
					}
					
					$('.divider:last', newul).css('visibility', 'hidden');

					if (rules === 0) return $('<ul class="rules-wrapper"></ul>');
							
					if (j && j.indexOf(domain_name) > -1)
						newul.parent().prev().addClass('hidden');
				}
				
				$('.domain-name', ul).click(function () {
					if (this.className.match(/no\-disclosure/)) return false;
					
					var d = $('span', this).html(), t = $(this).next();
				
					if (t.is(':animated')) return false;
				
					var c = self.collapsedDomains(),
							dex = c.indexOf(d),
							rulesList = _$('#rules-list'),
							sTop = rulesList.scrollTop(),
							height;
						
					if (!$(this).toggleClass('hidden').hasClass('hidden')) {
						if (dex > -1) c.splice(dex, 1);
					} else {
						if (dex === -1) c.push(d);
					}
										
					self.collapsedDomains(c);
					
					t.toggle();
					
					height = t.height();
					
					t.slideToggle(200 * self.speedMultiplier, function () {
						this.style.display = null;
					});
					
					rulesList.scrollTop(sTop);
					
					if (!this.className.match(/hidden/)) {
						var offset = t.offset(),
							bottomView = offset.top + height - _$('header').height();
						
						if (bottomView > rulesList.height())
							rulesList.animate({
								scrollTop: rulesList.scrollTop() + bottomView - rulesList.height(),
							}, 200 * self.speedMultiplier);
					}
				});

				var q = $('li input', ul).click(function () {
					if (!self.utils.confirm_click(this)) return false;
			
					var $this = $(this), li = $this.parent(), parent = li.parent(), span = $('span.rule', li),
							is_automatic = $('span.rule.type-2', li).length;
					
					if (this.value === _('Restore')) {
						self.add(li.data('domain'), li.data('rule'), li.data('type') * -1, false, true);
						this.value = _('Disable');
						span.addClass(span[0].className.substr(span[0].className.indexOf('type')).replace('--', '-')).removeClass('type--2').addClass('temporary');
					} else {
						self.remove(li.data('domain'), li.data('rule'));
						
						if (is_automatic) {
							this.value = _('Restore');
							span.addClass(span[0].className.substr(span[0].className.indexOf('type')).replace('-', '--')).removeClass('type-2 temporary');
						} else {
							li.remove();
				
							$('.divider:last', parent).css('visibility', 'hidden');

							if ($('li', parent).length === 0) {
								parent.parent().prev().remove();
								parent.parent().remove();
							}
						}
					}
					
					_$('#domain-filter').trigger('search');
				}).siblings('span');
				
				if (!no_dbl_click)
					q.dblclick(function (e) {
						var t = $(this), off = t.offset(), domain = t.parent().data('domain'), rule = t.parent().data('rule');
						
						new Poppy(e.pageX, off.top - 2, [t.hasClass('type-4') || t.hasClass('type-5') ?
								_('Predefined rules cannot be edited.') :
								'<input type="button" value="' + _('Edit Rule') + '" id="rule-edit" /> ',
								'<button id="rule-new">' + _('New Rule') + '</button>'].join(''), function () {
							_$('#poppy #rule-edit, #poppy #rule-new').filter('#rule-new')
									.html(_('New rule for {1}', [(domain === '.*' ? _('All Domains') : domain)])).end().click(function () {
								var is_new = this.id === 'rule-new',
									u = is_new ? '' : t.html(),
									padd = self.poppies.add_rule.call({
											url: u,
											domain: domain,
											e: t,
											header: _((is_new ? 'Adding' : 'Editing') + ' a Rule For {1}', [Template.create('tmpl_domain_picker', {
												page_parts: [domain === '.*' ? null : domain, '*'],
												no_label: true,
												no_all: domain !== '.*'
											})])
									}, JavaScriptBlocker);

								var crulelevel = parseInt(t[0].className.split(' ')[1].substr(5));
								
								padd.callback2 = function () {
									if (crulelevel === 1)
										_$('#select-type-allow').click();
								 	else
										_$('#select-type-block').click();
								};
								padd.time = 0.2;
								padd.save_orig = padd.save;
								padd.save = function () {
									if (!is_new) padd.main.rules.remove(padd.me.domain, rule);
									var v = padd.save_orig.call(this, true);
									if (!is_new) {
										t.text(this.val()).removeClass('type-0 type-1 type-2 type--2 type-4 type-5 type-6 type-7 temporary').addClass('type-' + v).toggleClass('temporary', _$('#rule-temporary').is(':checked'))
												.siblings('input').val(_('Delete')).parent().data('rule', this.val()).data('type', v);
										new Poppy(e.pageX, off.top - 2, '<p>' + _('Rule succesfully edited.') + '</p>', $.noop, $.noop, 0.2);
									} else {
										new Poppy(e.pageX, off.top - 2,
												'<p>' + _('Rule succesfully added for {1}', [(padd.me.domain === '.*' ? _('All Domains') : padd.me.domain)]) + '</p>' +
												'<p>' + _('Changes will appear when you reload the rules list.') + '</p>');
									}
								};
								new Poppy(e.pageX, off.top - 2, padd);
							});
						});
					});
			}
		
			return ul;
		}
	},
	add_rule_host: function (me, url, left, top, allow) {
		var self = this,
				hostname = me.parent().data('url'), rule,
				one_script = me.parent().data('script'),
				proto = self.utils.active_protocol(one_script[0]),
				parts = proto === 'http' || proto === 'https' ? self.utils.domain_parts(hostname) : [hostname, '*'], a = [],
				page_parts = self.utils.domain_parts(self.utils.active_host(_$('#page-list').val())), n;

		if (hostname === 'Data URI')
			a.push('<option value="^data:.*$">' + 'Data URI' + '</option>');
		else
			for (var x = 0; x < parts.length - 1; x++)
				a.push('<option value="^' + proto + ':\\/\\/' +
						(x === 0 ? self.utils.escape_regexp(parts[x]) : '([^\\/]+\\.)?' + self.utils.escape_regexp(parts[x])) +
						'\\/.*$">' + (x > 0 ? '.' : '') + parts[x] + '</option>');
			
		new Poppy(left, top + 8, [
				this.donationVerified ? [
					'<p>',
						'<input id="domain-script-temporary" type="checkbox"', parseInt(window.localStorage.LastRuleWasTemporary) ? ' checked' : '', ' />',
						'<label for="domain-script-temporary">&thinsp;', _('Temporary rule'), '</label> ',
					'</p>'].join('') : '',
				'<p>',
					Template.create('tmpl_domain_picker', { page_parts: page_parts }),
				'</p>',
				'<p>',
					'<label for="domain-script" class="no-disclosure ', allow ? 'allowed-' : 'blocked-', 'label">', allow ? _('Allow') : _('Block'), ':</label> ',
					'<select id="domain-script" class="', proto, '">', a.join(''), '</select> ',
					'<input id="domain-script-continue" type="button" value="', _('Continue'), '" />',
				'</p>'].join(''), function () {
					_$('#domain-script-continue').click(function () {
						var	h = _$('#domain-picker').val(),
								pages = [proto + '://' + hostname + '/'],
								temp = _$('#domain-script-temporary').is(':checked');

						self.rules.add(h, _$('#domain-script').val(), allow ? 1 : 0, true, temp);
						safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
					})
		});
	},
	bind_events: function(some, host) {
		var add_rule, remove_rule, self = this;
			
		function url_display (e) {
			var t = $(this), off = t.offset();
			
			function codeify(data) {
				function do_highlight (data, no_zoom) {
					_$('#misc-content pre').remove();
					
					$('<pre></pre>').append('<code class="javascript"></code>').find('code').text(data).end().appendTo(_$('#misc-content'));
					if (!no_zoom) self.utils.zoom(_$('#misc').find('.misc-header').text(t.text()).end(), _$('#main'));
					var p = _$('#misc-content pre code');
					p.data('unhighlighted', p.html());
					self.hljs.highlightBlock(p[0]);
				}
				
				_$('#misc .info-container #beautify-script').remove();
				
				$('<input type="button" value="' + _('Beautify Script') + '" id="beautify-script" />')
						.appendTo(_$('#misc .info-container')).click(function () {
							data = js_beautify(data, {
								indent_size: 2
							});
								
							do_highlight(data, true);
						});
				
				do_highlight(data);
			}
			
			function script_info () {
				if (!self.donationVerified) return new Poppy(e.pageX, off.top -2, _('Donation Required'));
				
				var info = self.examine.script(self.utils.active_host(_$('#page-list').val()), t.text());
					
				if (!info) info = [42, _('No information available.')];
				
				new Poppy(e.pageX, off.top - 2, [
						'<p>', info[1], '</p>',
						'<p>', info[0] === 0 ? _('Most likely not required for proper website functionality.') :
								(info[0] === 1 ? _('Probably required for proper website functionality.') :
								(info[0] === -1 ? _('Not known if required for proper website functionality.') : '')), '</p>'
					].join(''));
			}
			
			if (self.simpleMode)
				script_info();
			else 
				new Poppy(e.pageX, off.top - 2, [
					'<input type="button" value="', _('More Info'), '" id="script-info" /> ',
					'<input type="button" value="', _('View Script'), '" id="view-script" />'].join(''), function () {
						_$('#poppy #script-info').click(script_info).siblings('#view-script').click(function () {
							if (/^data/.test(t.text())) {
								var dd = t.text().match(/^data:(([^;]+);)?([^,]+),(.+)/);

								if (dd && dd[4] && ((dd[2] && dd[2].toLowerCase() === 'text/javascript') ||
										(dd[3] && dd[3].toLowerCase() === 'text/javascript'))) {
									codeify(unescape(dd[4]));
									new Poppy();
								} else
									new Poppy(e.pageX, off.top - 2, '<p>' + _('This data URI cannot be displayed.') + '</p>');
							} else {
								new Poppy(e.pageX, off.top - 2, '<p>' + _('Loading script') + '</p>', $.noop, function () {
									$.ajax({
										dataType: 'text',
										url: t.text(),
										success: function (data) {
											codeify(data);
											new Poppy();
										},
										error: function (req) {
											codeify(data);
											new Poppy();
										}
									});
								}, 0.1);
							}
						});
					});
		}

		$(this.popover).on('click', '#allowed-script-urls ul input', function (e) {
			var butt = this,
				off = $(this).offset(),
				left = off.left + $(this).outerWidth() / 2,
				url = $(this).parent().data('url'),
				script = $(this).parent().data('script');
		
			if (self.simpleMode) return self.add_rule_host($(butt), script, left, off.top, !$(this).parents('#allowed-script-urls').length);
			else if (!self.donationVerified) return false;
			
			var page_parts = self.utils.domain_parts(self.host), n,
					padd = self.poppies.add_rule.call({
						url: '^' + (self.simpleMode ? self.utils.escape_regexp(script[0].substr(0, script[0].indexOf(url))) : '') + self.utils.escape_regexp(url) + (self.simpleMode ? '\\/.*' : '') + '$',
						domain: self.host,
						header: _('Adding a Rule For {1}', [Template.create('tmpl_domain_picker', { page_parts: page_parts, no_label: true })])
				}, self),
				auto_test = self.rules.remove_matching_URL(self.host, script, false, false, true);
				
			if (!$.isEmptyObject(auto_test)) {
				var d, rs = [], ds = [], i;
				for (d in auto_test) {
					for (i = 0; i < auto_test[d].length; i++) {
						if (auto_test[d][i][1][0] < 0 || ((auto_test[d][i][1][0] === 0 || auto_test[d][i][1][0] === 1))) {
							rs.push(auto_test[d][i][0]);
							ds.push(auto_test[d][i]);
						}
					}
				}
				
				if (rs.length) {
					var has_automatic_rule = false, has_standard_rule = false;
					
					for (var x = 0; x < ds.length; x++) {
						if (ds[x][1][0] < 0) {
							has_automatic_rule = true;
							if (has_standard_rule) break;
						} else {
							has_standard_rule = true;
							if (has_automatic_rule) break;
						}
					}
					
					var para, button;
					
					if (has_automatic_rule && has_standard_rule) {
						para = _('Would you like to restore/delete them, or add a new one?');
						button = _('Restore/Delete Rules');
					} else if (has_standard_rule) {
						para = _('Would you like to delete ' + (rs.length === 1 ? 'it' : 'them') + ', or add a new one?');
						button = _('Delete Rule' + (rs.length === 1 ? '' : 's'));
					} else if (has_automatic_rule) {
						para = _('Would you like to restore ' + (rs.length === 1 ? 'it' : 'them') + ', or add a new one?');
						button = _('Restore Rule' + (rs.length === 1 ? '' : 's'));
					} else {
						para = 'If you\'re reading this, something went horribly wrong.';
						button = 'Hmph!';
					}
										
					new Poppy(left, off.top + 8, [
						'<p>', _('The following rule' + (rs.length === 1 ? ' is ' : 's are ') + ('allowing this item:')), '</p>',
						'<ul class="rules-wrapper">',
							'<li class="domain-name no-disclosure">', self.host, '</li>',
							'<li>',
								'<ul>',
									'<li><span class="rule">',
										rs.join('</span><div class="divider"></div></li><li><span class="rule">'),
									'</span><div class="divider" style="visibility:hidden;"></div></li>',
								'</ul>',
							'</li>',
						'</ul>',
						'<p>', para, '</p>',
						'<div class="inputs">',
							'<input type="button" value="', _('New Rule'), '" id="auto-new" /> ',
							'<input type="button" value="', button, '" id="auto-restore" />',
						'</div>'].join(''), function () {
							_$('#poppy ul span.rule').each(function (i) {
								this.className += ' type-' + ds[i][1][0];
							});
							
							_$('#poppy #auto-new').click(function () {
								padd.time = 0.2;
								new Poppy(left, off.top + 8, padd);
							}).siblings('#auto-restore').click(function () {
								for (var b = 0; b < ds.length; b++) {
									if (ds[b][1][0] < 0)
										self.rules.add(self.host, ds[b][0], ds[b][1][0] * -1, false, true);
									else
										self.rules.remove(self.host, ds[b][0], true);
								}

								new Poppy();
								safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
							});
						});
					
					return false;
				}
			}
			
			new Poppy(left, off.top + 8, padd);
		});
		
		$(this.popover).on('dblclick', '#allowed-script-urls ul li span',  url_display);

		$(this.popover).on('click', '#blocked-script-urls ul input', function (e) {
			var me = $(this),
					m = !me.parents('div').attr('id').match(/blocked/),
					off = me.offset(),
					left = off.left + me.outerWidth() / 2,
					url = me.parent().data('script');
			
			if (self.simpleMode) return self.add_rule_host(me, url, left, off.top, !$(this).parents('#allowed-script-urls').length);
			else if (!self.donationVerified) return false;
			
			var to_delete = self.rules.remove_matching_URL(self.host, url, false, m),
					d,
					rs = [],
					vs = $([
							'<div>',
								'<p>', _('The following rule(s) would be deleted or disabled:'), '</p>',
								'<ul class="rules-wrapper"></ul>',
								'<p>', self.simpleMode ? '' : _('This may inadvertently affect other scripts.'), '</p>',
								'<p>', self.simpleMode ? '' : _('You can also create a new rule to affect just this one.'), '</p>',
								'<div class="inputs">',
									'<input type="button" value="', _('New Rule'), '" id="new-rule" /> ',
									'<input type="button" value="', _('Continue'), '" id="delete-continue" />',
								'</div>',
							'</div>'].join('')),
					wrapper = vs.find('ul.rules-wrapper');
			
			for (d in to_delete) {
				wrapper.append(self.rules.view(d, url, true).find('> li').find('input').remove().end());

				rs.push(to_delete[d][0]);
			}
					
			$('li.domain-name', vs).removeClass('hidden').addClass('no-disclosure');
			
			var newHigh = function (time) {
				var url = me.parent().data('script')[0],
						page_parts = self.utils.domain_parts(self.utils.active_host(_$('#page-list').val())),
						padd = self.poppies.add_rule.call({
							url: '^' + self.utils.escape_regexp(url) + '$',
							domain: self.host,
							header: _('Adding a Rule For {1}', [Template.create('tmpl_domain_picker', { page_parts: page_parts, no_label: true })])
						}, self);
				
				padd.time = time ? undefined : 0.2;
				padd.callback2 = function () {
					_$('#select-type-allow').click();
				};
				
				new Poppy(left, off.top + 8, padd);
			};
			
			if (rs.length === 0) {
				new Poppy();
				newHigh(true);
			} else
				new Poppy(left, off.top + 8, vs, function () {
					_$('#poppy #delete-continue').click(function () {
						self.rules.remove_matching_URL(self.host, url, true, m);
						safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
						new Poppy();
					}).siblings('#new-rule').click(newHigh);
				});
		});
		
		$(this.popover).on('dblclick', '#blocked-script-urls ul li span', url_display);
	
		$(this.popover).on('click', '#unblocked-script-urls ul input', function() {
			var t = $(this).siblings('span').text();
			
			function do_highlight (t, no_zoom) {
				_$('#misc-content pre').remove();
				
				$('<pre></pre>').append('<code class="javascript"></code>').find('code')
						.text(t).end().appendTo(_$('#misc-content'));
				if (!no_zoom) self.utils.zoom(_$('#misc').find('.misc-header').html(_('Unblocked Script')).end(), _$('#main'));
				var p = _$('#misc-content pre code');
				p.data('unhighlighted', p.html());
				self.hljs.highlightBlock(p[0]);
			}
			
			_$('#misc .info-container #beautify-script').remove();
			
			$('<input type="button" value="' + _('Beautify Script') + '" id="beautify-script" />')
					.appendTo(_$('#misc .info-container')).click(function () {
						t = js_beautify(t, {
							indent_size: 2
						});
						
						do_highlight(t, true);
					});
			
			do_highlight(t);
		});
		
		var toggle_find_bar = function (show_only) {
			var f = _$('#find-bar'),
					v = f.is(':visible');
			
			if (v && show_only) return false;
			
			var	h = 24,
					a = v ? f.show() : f.hide(),
					m = (f.slideToggle(200 * self.speedMultiplier).toggleClass('visible').hasClass('visible')) ? '-' : '+',
					mM = m === '-' ? '+' : '-';
			
			_$('#main, #rules-list, #misc, #setup').animate({
				height: m + '=' + h,
				top: mM + '=' + h
			}, 200 * self.speedMultiplier);
			
			if (v) $('#find-bar-search', f).blur();
			
			return true;
		}
		
		$(this.popover.body).keydown(function (e) {
			if (e.which === 16) self.speedMultiplier = !self.useAnimations ? 0.001 : 10;
			else if ((e.which === 93 || e.which === 91) ||
					(window.navigator.platform.match(/Win/) && e.which === 17)) self.commandKey = true;
			else if (e.which === 70 && self.commandKey) {
				e.preventDefault();
				
				setTimeout(function (self) {
					var b = _$('#find-bar #find-bar-search').focus();
					b[0].selectionStart = 0;
					b[0].selectionEnd = b[0].value.length;
				}, 10, self);
				
				if (toggle_find_bar(true)) return false;
			} else if (e.which === 27 && _$('#find-bar #find-bar-search').is(':focus')) {
				e.preventDefault();
				_$('#find-bar #find-bar-done').click();
			}
		}).keyup(function (e) {
			if (e.which === 16) self.speedMultiplier = !self.useAnimations ? 0.001 : 1;
			else if ((e.which === 93 || e.which === 91) ||
					(window.navigator.platform.match(/Win/) && e.which === 17)) self.commandKey = false;
		});
		
		_$('#find-bar #find-bar-done').click(function() {
			toggle_find_bar();
			
			self.utils.timer.timeout('hide_results', function () {
				var b = _$('#find-bar-search'),
						s = b.val();
					
				b.val('').trigger('search');
			
				self.utils.timer.timeout('set_back_find', function (b, s) {
					b.val(s);
				}, 3000, [b, s]);
			}, 200 * self.speedMultiplier);
		}).siblings('#find-bar-search').bind('search', function () {
			if (self.finding) return false;
			var s = $(this).val(),
					matches = 0,
					removedEm = false;
						
			_$('.find-scroll').remove();
			
			_$('#main, #rules-list, #misc, #setup').find('*').each(function () {
				self.utils.zero_timeout(function (e) {
					if (e.data('orig_html'))
						e.html(e.data('orig_html')).removeData('orig_html');
				}, [$(this)]);
			});
					
			if (s.length === 0) {
				_$('#find-bar-matches').html('');
				return false;
			}
			
			self.busy = 1;
			self.finding = true;
			
			var visible = _$('#main, #rules-list, #misc, #setup').filter(':visible'),
					offset = _$('header').outerHeight() + _$('#find-bar').outerHeight(),
					oST = oST = visible.scrollTop(),
					end_find = function (self, visible, oST) {
						visible[0].scrollTop = oST;
						self.busy = 0;
						self.finding = false;
					}
			
			var js = visible.find('code.javascript:visible'), x;
			if (js.length && !js.hasClass('unhighlighted')) {
				var cloned, parent;
				// This is an ugly work aroundaround for js.html(js.data('unhighlighted'));
				// For some reason the above code is extremely slow--the UI freezes for about 30 seconds
				// on a very long script string.
				cloned = $('<code />').addClass('javascript unhighlighted').html(js.data('unhighlighted'));
				parent = js.parent();
				js.remove();
				cloned.appendTo(parent);
			}
			
			x = visible.find('*:visible');
					
			x.each(function (index) {
				if (!this.className.match(/link\-button/) && ['MARK', 'OPTION', 'SCRIPT'].indexOf(this.nodeName.toUpperCase()) === -1 && this.innerHTML && this.innerHTML.length)
					self.utils.zero_timeout(function (self, e, s) {
						var $e = $(e),
								t = $('<div>').text($e.text()).html(),
								s = $('<div>').text(s).html(),
								h = $e.html(),
								r = new RegExp('(' + s + ')', 'ig');

						if (t.length && t === h) {
							$e.data('orig_html', h).html(h.replace(r, '<mark>$1</mark>'));
														
							var nOne, dOne, dTwo, nTwo, off;
							
							$('mark', $e).each(function (i) {
								matches++;
								
								if (matches < 499) {
									self.utils.zero_timeout(function (visible, self, ss, offset, oST, matches, end_find) {
										visible[0].scrollTop = 0;
														
										nOne = ss.offset().top;
							
										dOne = visible[0].scrollHeight;
							
										dTwo = visible.outerHeight();
										nTwo = dTwo * (nOne / dOne);
							
										self.utils.zero_timeout(function (self, nTwo, offset) {
											$('<div class="find-scroll" />').appendTo(self.popover.body).css({
												top: Math.round(nTwo + offset) - 2
											});
										}, [self, nTwo, offset]);
									
										self.utils.timer.timeout('end_find', end_find, 100, [self, visible, oST]);
									}, [visible, self, $(this), offset, oST, matches, end_find]);
								} else {
									self.utils.zero_timeout(function (self, visible, oST, end_find, removedEm) {
								//		self.utils.timer.timeout('end_find', end_find, 100, [self, visible, oST]);
									}, [self, visible, oST, end_find, removedEm]);
								}
							});
						}
					}, [self, this, self.utils.escape_regexp(s)]);
					
					self.utils.zero_timeout(function (index, matches, end_find, self, visible, oST) {
						if (index === x.length - 1 && matches === 0)
							self.utils.timer.timeout('end_find', end_find, 100, [self, visible, oST]);
					}, [index, matches, end_find, self, visible, oST]);
			});
			
			self.utils.zero_timeout(function (self) {
				_$('#find-bar-matches').html(_('{1} matches', [matches]));
				
				if (matches > 499)
					self.utils.zero_timeout(function (self) {
						self.utils.timer.timeout('over_fivehundred', function (self) {
							_$('.find-scroll').remove();
						}, 50, [self]);
					}, [self]);
			}, [self]);
		});
	
		_$('#block-domain, #allow-domain').click(function () {
			var page_parts = self.utils.domain_parts(self.utils.active_host(_$('#page-list').val())), n, off = $(this).offset(), me = this;
			
			new Poppy(off.left + $(this).outerWidth() / 2, off.top + 8, [
					self.donationVerified ? [
						'<p>',
							'<input id="domain-script-temporary" type="checkbox"', parseInt(window.localStorage.LastRuleWasTemporary) ? ' checked' : '', ' />',
							'<label for="domain-script-temporary">&thinsp;', _('Temporary rule'), '</label> ',
						'</p>'].join('') : '',
					'<p>',
						Template.create('tmpl_domain_picker', { page_parts: page_parts, no_all: true }),
						' <input id="domain-script-continue" type="button" value="', _('Continue'), '" />',
					'</p>'].join(''), function () {
						_$('#domain-script-continue').click(function () {
							var h = _$('#domain-picker').val();
								
							self.rules.remove(h, '.*(All Scripts)?');
							self.rules.add(h, '.*(All Scripts)?', me.id === 'block-domain' ? 0 : 1, true, _$('#domain-script-temporary').is(':checked'));
							safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
						});
					});
		});
		
		_$('#disable').click(function () {
			if (!self.methodAllowed || (!self.disabled && !self.utils.confirm_click(this))) return false;
		
			self.disabled = !self.disabled;
			
			this.value = _((self.disabled ? 'Enable' : 'Disable') + ' JavaScript Blocker');
			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
		}).siblings('#switch-interface').click(function () {
			self.simpleMode = !self.simpleMode;
			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePopover');
		});
		
		_$('#view-rules').click(function (e) {
			if (!self.methodAllowed) return false;
			
			var offset = $(this).offset(),
				left = offset.left + $(this).outerWidth() / 2,
				top = offset.top + 8;
			
			new Poppy(left, top, [
				self.donationVerified ? [
					'<p class="misc-info">', _('Active Temporary Rules'), '</p>',
					'<input type="button" value="', _('Make Permanent'), '" id="rules-make-perm" /> ',
					'<input type="button" value="', _('Revoke'), '" id="rules-remove-temp" /> ',
					'<input type="button" value="', _('Show'), '" id="rules-show-temp" />',
					'<div class="divider" style="margin:7px 0 6px;"></div>'].join('') : '',
				'<input type="button" value="', _('Show All'), '" id="view-all" /> ',
				'<input type="button" value="', _('Show Active'), '" id="view-domain" /> ',
				self.donationVerified ?
					['<input type="button" value="', _('Backup'), '" id="rules-backup" />'].join('') : ''].join(''), function () {
				_$('#view-domain').click(function () {
					self.busy = 1;
					
					var parts = self.domain_parts(self.active_host(_$('#page-list').val())),
							x = parts.slice(0, 1),
							y = parts.slice(1);

					x.push(x[0]);

					parts = x.concat(y);
					parts = parts.slice(0, -1);
						
					_$('#view-all').click();
					
					_$('#domain-filter').val('^' + parts.join('$|^.') + '|^' + _('All Domains') + '$');
				}).siblings('#view-all').click(function (event) {
					_$('#filter-state-all').click();
					
					self.busy = 1;
					
					_$('#edit-domains').removeClass('edit-mode').html(_('Edit'));
					
					new Poppy(left, top, '<p>' + _('Loading rules') + '</p>', $.noop, function () {
						var ul = _$('#rules-list #data > ul#rules-list-rules').html(''),
								s = self.utils.sort_object(self.rules.rules), domain,
			 					i = 0, filter = _$('#domain-filter'), rs = [];
						
						if ('srcElement' in event)
							filter.val('');
						
						function appendrules (ul, domain, self) {
							ul.append($('> li', self.rules.view(domain)));
							self.utils.zero_timeout(function (self) {
								self.utils.timer.timeout('filter_bar_click', function (self) {
									_$('.filter-bar li.selected').click();
								}, 10, [self]);
							}, [self]);
						}
						
						for (domain in s)
							self.utils.zero_timeout(appendrules, [ul, domain, self]);
							
						function remove_domain (event) {
							event.stopPropagation();
							if (!self.utils.confirm_click(this)) return false;
							
							self.rules.remove_domain($(this.parentNode).data('domain'));
							
							var rs = $(this.parentNode).next();
							
							$(this.parentNode).remove();
							rs.remove();
							
							_$('#domain-filter').trigger('search');
						}
							
						self.utils.zero_timeout(function (ul) {
							$('.domain-name', ul).prepend('<div class="divider"></div><input type="button" value="' + _('Remove') + '" />')
									.find('input').click(remove_domain);
						}, [ul]);
						
						self.utils.zero_timeout(function (self) {
							self.utils.zero_timeout(function (self) {
								self.busy = 0;
								new Poppy();
								var l = _$('#rules-list');
								if (!l.is(':visible')) {
									self.utils.zoom(l, _$('#main'));
								}
							}, [self]);
						}, [self]);
					}, 0.1);
				}).siblings('#rules-backup').click(function () {
					new Poppy(left, top, [
						'<p class="misc-info">', _('Backup'), '</p>',
						'<input type="button" value="', _('Export'), '" id="backup-e"> ',
						'<input type="button" value="', _('Import'), '" id="backup-i">'].join(''), function () {
							_$('#backup-e').click(function () {
								new Poppy(left, top, [
									'<textarea id="backup-export" readonly="readonly">' + self.rules.export() + '</textarea>',
									'<p>', _('Copy above'), '</p>'].join(''), function () {
									var t = _$('#poppy textarea');
									t[0].selectionStart = 0;
									t[0].selectionEnd = t.val().length;
								});
							}).siblings('#backup-i').click(function () {
								new Poppy(left, top, [
									'<textarea id="backup-import"></textarea>',
									'<p>', _('Paste your backup'), '</p>',
									'<dlv class="inputs">',
										'<input type="button" value="', _('Restore'), '" id="backup-restore" />',
									'</dlv>'].join(''), function () {
									_$('#backup-import').focus();
									_$('#backup-restore').click(function () {
										if (!self.rules.import(_$('#backup-import').val()))
											new Poppy(left, top, _('Error importing'));
										else {
											new Poppy();
											safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
										}
									});
								});
							});
					});
				}).siblings('#rules-make-perm, #rules-remove-temp').click(function () {
					var rules = self.rules.for_domain(self.utils.active_host(_$('#page-list').val())), domain, rule;

					for (domain in rules)
						for (rule in rules[domain])
							if (rules[domain][rule][1]) {
								if (this.id === 'rules-make-perm')
									self.rules.add(domain, rule, rules[domain][rule][0], true, false);
								else
									self.rules.remove(domain, rule);
							}

					if (this.id === 'rules-remove-temp')
						safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
					else
						new Poppy();
				}).siblings('#rules-show-temp').click(function () {
					_$('#view-domain').click();
					_$('#filter-temporary').click();
				});
			});
		});

		_$('#rules-list #rules-list-back').click(function () {
			if (_$('#rules-list').hasClass('zoom-window-open'))
				self.utils.zoom(_$('#rules-list'), _$('#main'), function () {
					_$('#rules-list #data ul#rules-list-rules').html('');
				});
		});
		
		_$('#misc-close').click(function() {
			if (_$('#misc').hasClass('zoom-window-open'))
				self.utils.zoom(_$('#misc'), _$('#main'), function () {
					_$('#misc-content, p.misc-header').html('');
				});
		});
		
		_$('.allowed-label, .blocked-label, .unblocked-label').click(function () {
			var $this = $(this), which = this.className.substr(0, this.className.indexOf('-')), e = _$('#' + which + '-script-urls ul');
			
			if (e.is(':animated')) return false;
						
			if ($this.hasClass('hidden')) {
				window.localStorage.setItem(which + 'IsCollapsed', 0);
				$this.removeClass('hidden');
				e.show().css('marginTop', -e.height()).animate({
					marginTop: 0
				}, 200 * self.speedMultiplier).removeClass('was-hidden');
			} else {
				window.localStorage.setItem(which + 'IsCollapsed', 1);
				$this.addClass('hidden');
				e.css('marginTop', 0).animate({
					marginTop: -e.height()
				}, 200 * self.speedMultiplier, function () {
					e.hide();
				}).addClass('was-hidden');
			}
			
			self.utils.timer.timeout('label_search', function (self) {
				_$('#find-bar-search:visible').trigger('search');
			}, 400 * self.speedMultiplier, [self]);
		});
		
		_$('#collapse-all, #expand-all').click(function () {
			self.busy = 1;
						
			var is_collapse = this.id === 'collapse-all', d = _$('#rules-list .domain-name:visible');
			
			if (!is_collapse && _$('#edit-domains').hasClass('edit-mode')) return self.busy = 0;
			
			if (is_collapse) d = d.not('.hidden');
			else d = d.filter('.hidden');
			
			d.toggleClass('hidden');
			
			self.collapsedDomains($.map(_$('#rules-list .domain-name'), function (e) {
				return e.className.match(/hidden/) ? $('span', e).html() : null;
			}));
			
			if (is_collapse) _$('#rules-filter-bar li#filter-collapsed').click();
			else _$('#rules-filter-bar li#filter-expanded').click();
			
			self.busy = 0;
		});
		
		_$('#edit-domains').click(function () {
			$(this).toggleClass('edit-mode');
			
			this.innerHTML = this.className.match(/edit\-mode/) ? _('Done Editing') : _('Edit');
			
			var ul = _$('#rules-list-rules');
			
			$('.domain-name', ul).toggleClass('no-disclosure').toggleClass('editing')
					.find('.divider').css('visibility', 'visible').filter(':visible:first').css('visibility', 'hidden');
		}).siblings('#reinstall-pre').click(function () {
			var off = $(this).offset();
			self.rules.reinstall_predefined();
			new Poppy(off.left + $(this).width() / 2, off.top, '<p>' + _('Whitelist and blacklist rules have been reinstalled.') + '</p>');
		});
		
		_$('#make-temp-perm').click(function () {
			var off = $(this).offset();
			
			if (!self.donationVerified) return new Poppy(off.left + $(this).width() / 2, off.top, _('Donation Required'));
			
			for (var domain in self.rules.rules) {
				var rules = self.rules.for_domain(domain, true), rule;
			
				if (domain in rules)
					for (rule in rules[domain])
						if (rules[domain][rule][1])
							self.rules.add(domain, rule, rules[domain][rule][0], false, false);
			}
			
			var l = _$('#rules-list-rules');
			
			if (l.is(':visible'))
				l.find('span.temporary').removeClass('temporary');

			_$('#filter-type-state li.selected').click();
			
			new Poppy(off.left + $(this).width() / 2, off.top, '<p>' + _('All temporary rules are now permanent.') + '</p>');
		});
		
		_$('#remove-all-temp').click(function () {
			var off = $(this).offset();
			
			if (!self.donationVerified) return new Poppy(off.left + $(this).width() / 2, off.top, _('Donation Required'));
			
			for (var domain in self.rules.rules) {
				var rules = self.rules.for_domain(domain, true), rule;
			
				if (domain in rules)
					for (rule in rules[domain])
						if (rules[domain][rule][1])
							self.rules.remove(domain, rule, true);
			}
			
			var l = _$('#rules-list-rules');
			
			if (l.is(':visible'))
				l.find('span.temporary:not(.type-2)').removeClass('temporary').siblings('input').click().click();

			_$('#filter-type-state li.selected').click();
			
			new Poppy(off.left + $(this).width() / 2, off.top, '<p>' + _('All temporary rules have been removed.') + '</p>');
		});
		
		var counter = function (self) {
			var d = _$('#rules-list .domain-name:visible').length,
				r = _$('#rules-list .domain-name:visible + li > ul li span.rule:not(.hidden)').length;
						
			_$('#rules-list .misc-info').html(
					_('{1} domain' + (d === 1 ? '' : 's') + ', {2} rule' + (r === 1 ? '' : 's'), [d, r])
			).removeData('orig_html');
		}
		
		_$('#domain-filter').bind('search', function () {
			var d = _$('.domain-name:not(.filter-hidden) span'), v;
			
			try {
				v = new RegExp(this.value, 'i');
			} catch (e) {
				v = /.*/;
			}
						
			d.each(function () {
				$(this.parentNode).toggleClass('not-included', !v.test(this.innerHTML));
			});
			
			var d = _$('#rules-list .domain-name:visible').length,
				r = _$('#rules-list .domain-name:visible + li > ul li span.rule:not(.hidden)').length;
						
			counter(self);
			
			_$('#rules-list .domain-name .divider').css('visibility', 'visible').filter(':visible:first').css('visibility', 'hidden');
		});
		
		_$('#rules-filter-bar #filter-type-collapse li').not('.label').click(function () {
			$(this).siblings('li').removeClass('selected').end().addClass('selected');
			
			self.utils.zero_timeout(function (self, that) {
				var x = _$('#rules-list .domain-name');
				
				x.filter('.filter-hidden').removeClass('filter-hidden');
				
				switch(that.id) {
					case 'filter-collapsed':
						x.not('.hidden').addClass('filter-hidden'); break;
					case 'filter-expanded':
						x.filter('.hidden').addClass('filter-hidden'); break;
				}
				
				_$('#domain-filter').trigger('search');
			}, [self, this]);
		});
		
		_$('#rules-filter-bar #filter-type-state li:not(.filter-divider)').not('.label').click(function () {
			self.busy = 1;
			
			var that = this;
			
			$(this).siblings('li').removeClass('selected').end().addClass('selected');
			
			var fix_dividers = function (self, that) {
				var d = _$('#rules-list-rules ul li .divider').css('visibility', 'visible').parent().parent();

				if (that.id === 'filter-state-all')
					d.find('.divider:last').css('visibility', 'hidden');
				else
					d.find('li:not(.none) .divider:last').css('visibility', 'hidden');
			}
			
			switch (this.id) {
				case 'filter-state-all':
					_$('.rule').removeClass('hidden').parent().removeClass('none');
					fix_dividers(self, that);
					break;
				case 'filter-enabled':
					self.utils.zero_timeout(function (self) {
						_$('.rule').removeClass('hidden').not('.rule.type--2').parent().removeClass('none');
					}, [self]);
					self.utils.zero_timeout(function (self, fix_dividers) {
						_$('.rule.type--2').addClass('hidden').parent().addClass('none');
						fix_dividers(self, that);
					}, [self, fix_dividers]);
					break;
				case 'filter-disabled':
					self.utils.zero_timeout(function (self) {
						_$('.rule').removeClass('hidden').parent().removeClass('none');
					}, [self]);
					self.utils.zero_timeout(function (self, fix_dividers) {
						_$('.rule').not('.type--2').addClass('hidden').parent().addClass('none');
						fix_dividers(self, that);
					}, [self, fix_dividers]); 
					break;
				case 'filter-temporary':
					self.utils.zero_timeout(function (self) {
						_$('.rule').removeClass('hidden').parent().removeClass('none');
					}, [self]);
					self.utils.zero_timeout(function (self, fix_dividers) {
						_$('.rule').not('.temporary').addClass('hidden').parent().addClass('none');
						fix_dividers(self, that);
					}, [self, fix_dividers]);
					break;
			}
			
			_$('li.domain-name').next().each(function () {
				self.utils.zero_timeout(function (t) {
					$(t).prev().toggleClass('state-hidden', $('ul li.none', t).length === $('ul li', t).length);
				}, [this]);
			});
			
			self.utils.zero_timeout(counter, [self]);
			self.utils.zero_timeout(function (self) {
				self.busy = 0;
				_$('#rules-list .domain-name .divider').css('visibility', 'visible').filter(':visible:first').css('visibility', 'hidden');
			}, [self]);
		});
		
		$(this.popover).on('click', 'a.outside', function (e) {
			e.preventDefault();
			self.utils.open_url(this.href);
		});
		
		_$('#unlock').click(function () {
			var o = $(this).offset(), l = o.left + $(this).outerWidth() / 2, t = o.top + 8;
			
			if (self.donationVerified) return new Poppy(l, t, _('All features are already unlocked.'));
			
			new Poppy(l, t, self.poppies.verify_donation.call([l, t], self));
		});
		
		_$('#js-help').click(function () {
			self.utils.open_url('http://javascript-blocker.toggleable.com/help');
		}).siblings('#js-project').click(function () {
			self.utils.open_url('http://javascript-blocker.toggleable.com/');
		});
	},
	
	/**
	 * Creates the list of rules in the main window
	 *
	 * @param {string} text One of: blocked, allowed, or unblocked.
	 * @param {string} button Text to appear on the button to create or delete a rule
	 * @param {Object} jsblocker Information about scripts allowed, blocked, or unblocked and frames.
	 */
	make_list: function (text, button, jsblocker) {
		if (_$('#poppy-content #new-rule').is(':visible')) new Poppy();
		
		var self = this, ul = _$('#' + text + '-script-urls ul'), li, use_url, protocol, poopy,
				shost_list = { 'http': {}, 'https': {}, 'file': {}, 'safari-extension': {}, 'data': {} },
				lab = _$('#' + text + '-scripts-count');
		
		function append_url(ul, use_url, script, button, protocol) {
			return ul.append('<li><span></span> <small></small><input type="button" value="" /><div class="divider"></div></li>').find('li:last')
					.attr('id', self.utils.id())
					.data('url', use_url).data('script', [script]).find('span')
					.text(use_url).addClass(protocol).siblings('input')
					.val(button).parent();
		}
			
		if (self.simpleMode && text !== 'unblocked')
			lab.html(jsblocker[text].hosts.length);
		else
			lab.html(jsblocker[text].count);
			
		for (var i = 0; i < jsblocker[text].urls.length; i++) {
			if (text !== 'unblocked' && this.simpleMode) {
				use_url = this.utils.active_host(jsblocker[text].urls[i]);
				protocol = this.utils.active_protocol(jsblocker[text].urls[i]);
				
				if (!(use_url in shost_list[protocol])) {
					li = append_url(ul, use_url, jsblocker[text].urls[i], button, protocol);
					shost_list[protocol][use_url] = [1, li.attr('id')];
				} else {
					shost_list[protocol][use_url][0]++;
					
					try {
						$('li#' + shost_list[protocol][use_url][1], ul).data('script').push(jsblocker[text].urls[i]);
					} catch (e) {
						return this.make_list(text, button, jsblocker);
					}
				}
			} else
				append_url(ul, jsblocker[text].urls[i], jsblocker[text].urls[i], button);
		}
		
		if (this.simpleMode && safari.extension.settings.showPerHost) {
			for (poopy in shost_list)
				for (use_url in shost_list[poopy])
					$('li#' + shost_list[poopy][use_url][1], ul).find('small')
							.html('<a href="javascript:void(0);" class="show-scripts">(' + shost_list[poopy][use_url][0] + ')</a>');
			
			_$('.show-scripts').click(function () {
				var off = $(this).offset();
				
				new Poppy(off.left + -1 + $(this).width() / 2, off.top + 2, [
					'<ul>',
						'<li><span><a href="javascript:void(0)">', $(this.parentNode.parentNode).data('script').join(['</a></span> ',
							'<div class="divider"></div>',
						'</li>',
						'<li><span><a href="javascript:void(0)">'].join('')), '</a></span></li>',
					'</ul>'].join(''), function () {
						_$('#poppy a').click(function (e) {
							e.preventDefault();
							self.utils.open_url($('<div />').html(this.innerHTML).text());
						}).parent().scrollLeft(88888);
					});
			});
		}
		
		var ref = safari.extension.settings.sourceCount, len = $('li', ul).length;

		if (len > ref && len - ref > 1) {
			$('li', ul).eq(ref - 1).after(['<li>',
						'<a href="javascript:void(1)" class="show-more">', _('Show {1} more', [len - ref]), '</a>',
					'</li>'].join('')).end().filter(':gt(' + (ref - 1) + ')').hide().addClass('show-more-hidden');
		}
		
		$('.divider:last', ul).css('visibility', 'hidden');

		$('.show-more', ul).click(function () {
			$(this).parent().siblings('li:hidden').slideDown(200 * self.speedMultiplier).end().slideUp(300  * self.speedMultiplier, function () {
				$(this).remove();
			});
			_$('#find-bar-search:visible').trigger('search');
		});
		
		if (window.localStorage[text + 'IsCollapsed'] === '1') {
			ul.addClass('was-hidden').hide();
			_$('.' + text + '-label').addClass('hidden');
		}
	},
	do_update_popover: function (event, index, badge_only) {
		if (!this.methodAllowed) return false;
		
		var self = this, jsblocker = event.message, toolbarItem = null;
		
		this.busy = 1;

		if (safari.application.activeBrowserWindow.activeTab.url === jsblocker.href) {
			var page_list = _$('#page-list'), frames_blocked_count = 0, frames_blocked_hosts_count = 0, frames_allowed_count = 0, frames_allowed_hosts_count = 0, frame, inline;
			
			page_list.find('optgroup:eq(1)').remove();
			
			if (jsblocker.href in this.frames) {
				var frame, inline, xx = this.frames[jsblocker.href], d;

				for (frame in xx) {
					if (page_list.find('optgroup').length == 1)
						inline = $('<optgroup label="' + _('Inline Frame Pages') + '"></optgroup>').appendTo(page_list);
					else
						inline = page_list.find('optgroup:eq(1)');
				
					frames_blocked_count += xx[frame].blocked.count;
					frames_blocked_hosts_count += xx[frame].blocked.hosts.length;
					
					frames_allowed_count += xx[frame].allowed.count;
					
					frames_allowed_hosts_count += xx[frame].allowed.hosts.length;
					
					d = ('display' in xx[frame]) ? xx[frame].display : xx[frame].href;
				
					$('<option></option>').addClass('frame-page').attr('value', xx[frame].href).text(d).appendTo(inline);
				}
			}
			
			var toolbarDisplay = safari.extension.settings.toolbarDisplay;
			
			for (var y = 0; y < safari.extension.toolbarItems.length; y++) {
				toolbarItem = safari.extension.toolbarItems[y];

				toolbarItem.image = this.disabled ? safari.extension.baseURI + 'images/toolbar-disabled.png' : safari.extension.baseURI + 'images/toolbar.png';
				
				if (!self.simpleMode)
					toolbarItem.badge = safari.extension.settings.toolbarDisplay === 'allowed' ?
							jsblocker.allowed.count + frames_allowed_count :
							(safari.extension.settings.toolbarDisplay === 'blocked' ? jsblocker.blocked.count + frames_blocked_count : 0);
				else
					toolbarItem.badge = safari.extension.settings.toolbarDisplay === 'allowed' ?
							jsblocker.allowed.hosts.length + frames_allowed_hosts_count :
							(safari.extension.settings.toolbarDisplay === 'blocked' ? jsblocker.blocked.hosts.length + frames_blocked_hosts_count : 0);
			}
			
			if (!badge_only) {
				page_list.find('optgroup:first option').attr('value', jsblocker.href).text(jsblocker.href);
			
				if (typeof index == 'number' && index > 0) {
					page_list[0].selectedIndex = index;
					jsblocker = this.frames[jsblocker.href][page_list.val()];
				}
						
				page_list.unbind('change').change(function () {
					self.do_update_popover(event, this.selectedIndex);
				});
			
				var host = this.active_host(page_list.val());
			
				_$('#allow-domain, #block-domain').show();

				if (jsblocker.blocked.count == 0) _$('#allow-domain').hide();
				if (jsblocker.allowed.count == 0) _$('#block-domain').hide();

				_$('#main ul').html('');

				this.make_list('blocked', _('Allow'), jsblocker);
				this.make_list('allowed', _('Block'), jsblocker);
				
				if (safari.extension.settings.showUnblocked) {
					_$('#unblocked-script-urls').show().prev().show();
					
					this.make_list('unblocked', _('View'), jsblocker);
				} else
					_$('#unblocked-script-urls').hide().prev().hide();
				
				
				_$('#unlock').parent().toggleClass('hidden', self.donationVerified);
				_$('#above-temporary').toggleClass('hidden', !self.donationVerified);
				_$('#filter-temporary').toggleClass('hidden', !self.donationVerified);
			}
		}
		
		this.busy = 0;
	},
	setting_changed: function (event) {
		if (event.key === 'language' || event.key === 'theme') {
			this.reloaded = false;
			
			if (event.key === 'theme' && event.newValue !== 'default' && !this.donationVerified) {
				safari.extension.settings.theme = 'default';
				
				alert('Using a theme other than Default is only available to donators.');
			}
		} else if (event.key === 'alwaysBlock') {
			var wd, i, b, bd, e, c, key, domain;
				
			var delete_automaticrules = function (self, key) {
				var rs, r;
			
				rs = self.rules.for_domain(key, true);
			
				if (key in rs) {
					for (r in rs[key]) {
						if (rs[key][r] === 2)
							self.rules.remove(key, r, true);
					}
				}
			}
			
			for (key in this.rules.rules)
				this.utils.zero_timeout(delete_automaticrules, [this, key, 2]);

			this.rules.reinstall_predefined();
		} else if (event.key === 'simpleMode' && event.newValue === false && !this.donationVerified) {
			safari.extension.settings.simpleMode = true;
				
			alert(_('You cannot use JavaScript Blocker'));
		} else if (event.key === 'blockReferrer' && event.newValue === true && !this.donationVerified) {
			safari.extension.settings.blockReferrer = false;
			
			alert(_('Donation Required'));
		}
	},
	anonymous: {
		pages: {},
		previous: {},
		cannot: {},
		newTab: {}
	},
	anonymize: function (event) {
		if (!this.donationVerified ||
				!safari.extension.settings.blockReferrer ||
				((event.target.url in this.anonymous.previous) && this.anonymous.previous[event.target.url] === event.url) ||
				((event.target.url in this.anonymous.pages) && this.anonymous.pages[event.target.url] === event.url) ||
				((event.target.url in this.anonymous.cannot) && this.anonymous.cannot[event.target.url].indexOf(event.url) > -1)) {
			delete this.anonymous.cannot[event.target.url];
			delete this.anonymous.pages[event.target.url];
			return true;
		}
		
		if (event.url && event.target.url && event.target.url.length && event.url.length) {
			event.preventDefault();
									
			if (event.target.url in this.anonymous.newTab) {
				delete this.anonymous.newTab[event.target.url];
				this.utils.open_url(event.url);
			} else {
				this.anonymous.pages[event.target.url] = event.url;
				this.anonymous.previous[event.url] = event.target.url;
				this.utils.zero_timeout(function (target, url) {
					target.url = url;
				}, [event.target, event.url]);
			}
		}
	},
	handle_message: function (event) {
		theSwitch:
		switch (event.name) {
			case 'canLoad':
				if (event.message === 'anonymize') {
					event.message = safari.extension.settings.blockReferrer;
					break;
				} else if (event.message === 'simpleReferrer') {
					event.message = safari.extension.settings.simpleReferrer;
					break;
				}
				
				if (this.disabled || !this.methodAllowed || this.installedBundle < this.bundleid) {
					event.message = 1;
					break theSwitch;
				}
				
				var rule_found = false,
						host = this.active_host(event.message[0]),
						domains = this.rules.for_domain(host), domain, rule,
						alwaysFrom = safari.extension.settings.alwaysBlock;
				
				domainFor:
				for (domain in domains) {
					ruleFor:
					for (rule in domains[domain]) {
						if (rule.length < 1 ||
								(safari.extension.settings.ignoreBlacklist && domains[domain][rule][0] === 4) ||
								(safari.extension.settings.ignoreWhitelist && domains[domain][rule][0] === 5)) continue;
						if ((new RegExp(rule)).test(event.message[1])) {
							rule_found = domains[domain][rule][0] < 0 ? true : domains[domain][rule][0] % 2;
							if (domains[domain][rule][0] >= 0 && (domains[domain][rule][0] < 2 || domains[domain][rule][0] > 5)) break domainFor;
						}
					}
				}
				
				if (typeof rule_found === 'number') {
					event.message = rule_found;
					break;
				}
				
				if (alwaysFrom !== 'nowhere' && rule_found !== true) {
					var sproto = this.utils.active_protocol(event.message[1]),
							aproto = this.utils.active_protocol(event.message[0]);
					
					if (!(safari.extension.settings.allowExtensions && sproto === 'safari-extension')) {
						var page_parts = this.domain_parts(host),
								script_parts = this.domain_parts(this.active_host(event.message[1]));
										
						if ((alwaysFrom === 'topLevel' && page_parts[0] !== script_parts[0]) ||
								(alwaysFrom === 'domain' && page_parts[page_parts.length - 2] !== script_parts[script_parts.length - 2]) ||
								(alwaysFrom === 'everywhere') ||
								(aproto === 'https' && (safari.extension.settings.secureOnly && sproto !== aproto))) {
							if (this.saveAutomatic && !this.simpleMode) {
								var rr, script = event.message[1];
								
								if (/^data:/.test(script))
									rr = '^' + this.utils.escape_regexp(script) + '$';
								else
									rr = '^' + this.utils.escape_regexp(script.substr(0, script.indexOf(script_parts[0]))) + (alwaysFrom === 'topLevel' ?
											'((?!' + this.utils.escape_regexp(page_parts[0]) + '\\/).*)$' :
											this.utils.escape_regexp(script_parts[0]) + '\\/.*$');

								this.rules.add(host, rr, 2, true, true);
							}
						
							event.message = 0
						
							break theSwitch;
						}
					}
				}
		
				event.message = 1;
			break;

			case 'updatePopover':
				if (event.target != safari.application.activeBrowserWindow.activeTab) break;
					
				this.utils.timer.timeout('update_popover', function (self) {
					self.do_update_popover(event, undefined, !self.popover_visible());
				}, 50, [this]);
			break;
			
			case 'updateReady':
				if (event.target != safari.application.activeBrowserWindow.activeTab) break;
				
				this.utils.timer.remove('timeout', 'update_failure');
			break;
			
			case 'addFrameData':
				if (!(event.target.url in this.frames) || typeof this.frames[event.target.url] === 'undefined')
					this.frames[event.target.url] = {};
				
				if (event.target.url === event.message[0] && event.message.length < 3) {
					event.target.page.dispatchMessage('validateFrame', event.message[0]);
					break;
				} else if (event.target.url === event.message[0] && event.message.length === 3)
					event.message[1].display = event.message[2] === -1 ? _('Custom Frame') : event.message[2];
					
				this.frames[event.target.url][event.message[0]] = event.message[1];
			
				try {
					safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePopover', event.message);
				} catch(e) {}
			break;
			
			case 'updateFrameData':
				try {
					this.frames[event.message[0]] = this.frames[event.message[2]];
				
					delete this.frames[event.message[2]];
				} catch(e) {}
			break;
			
			case 'unloadPage':
				try {
					delete this.frames[event.message];
					delete this.anonymous.newTab[event.message];
				} catch (e) { }
			break;

			case 'anonymousNewTab':
				if (!this.donationVerified) break;
			
				if (event.message)
					this.anonymous.newTab[event.target.url] = 1;
				else
					delete this.anonymous.newTab[event.target.url];
			break;
			
			case 'cannotAnonymize':
				if (!this.donationVerified) break;
				
				if (!(event.target.url in this.anonymous.cannot)) this.anonymous.cannot[event.target.url] = [];
				
				if (this.anonymous.cannot[event.target.url].indexOf(event.message) === -1)
					this.anonymous.cannot[event.target.url].push(event.message);
			break;
			
			case 'doNothing': break;
		}
	},
	open_popover: function (event) {
		if (typeof event !== 'undefined' && ('type' in event) && ['beforeNavigate', 'close'].indexOf(event.type) > -1) {
			try {
				if (event.type === 'beforeNavigate')
					event.target.page.dispatchMessage('unloadPage');
				else
					delete this.frames[event.target.url];
			} catch (e) {}
		}
		
		var self = this, s = _$('#setup');

		if (event && ('type' in event) && event.type == 'popover') {
			/**
			 * Fixes issues with mouse hover events not working
			 */
			if (!this.reloaded) {
				this.reloaded = true;
				this.load_language(false);
						
				safari.extension.toolbarItems[0].popover.contentWindow.location.reload();
							
				setTimeout(function (e, event) {
					e.load_language(true);
					self.open_popover(event);
				}, 500, this, event);
				
				return false;
			}

			_$('#find-bar-done:visible').click();
			
			new Poppy();
		} else if (!event || (event && ('type' in event) && ['beforeNavigate', 'close'].indexOf(event.type) > -1)) {
			new Poppy();
			
			try {
				if (event.target === safari.application.activeBrowserWindow.activeTab && event.type === 'beforeNavigate') {
					for (var y = 0; y < safari.extension.toolbarItems.length; y++)
						safari.extension.toolbarItems[y].badge = 0;
				}
			} catch (e) {}
		}
		
		if (!this.setupDone) {
			if (s.css('display') === 'block') return false;
						
			s.find('input[type="button"]').click(function (e) {
				self.setupDone = 1;
				
				self.installedBundle = self.bundleid;
				
				self.rules.reinstall_predefined();
				
				self.utils.zoom(s, _$('#main'));
				
				self.utils.send_installid();
									
				self.open_popover();
			}).end().find('#setup-simple').click(function () {
				self.simpleMode = this.checked;
			}).end().find('#block-manual').click(function () {
				safari.extension.settings.alwaysBlock = this.checked ? 'domain' : 'everywhere';
			}).end().find('#secure-only').click(function() {
				safari.extension.settings.secureOnly = this.checked;
			}).end().find('#use-large').click(function () {
				safari.extension.settings.largeFont = this.checked;
				self.set_theme(safari.extension.settings.theme);
			});
			
			setTimeout(function (self, s) {
				self.utils.zoom(s, _$('#main'));
			}, 100, self, s);
			
			return false;
		}
		
		setTimeout(function (self) {
			self.updater();
		}, 300, this);
		
		if (s.hasClass('zoom-window-open'))
			this.utils.zoom(s, _$('#main'));
		
		try {
			if (event.type === 'popover') {
				if (!this.methodAllowed) {
					safari.extension.toolbarItems[0].popover.contentWindow.location.reload();
		
					setTimeout(function (self) {
						new Poppy($(self.popover.body).width() / 2, 13, [
							'<p>', _('You cannot use JavaScript Blocker'), '</p>'].join(''), null, null, null, true);
					}, 300, self);
				} else {
					if (this.installedBundle === this.bundleid)
						this.utils.timer.timeout('update_failure', function () {
							for (var y = 0; y < safari.extension.toolbarItems.length; y++)
								safari.extension.toolbarItems[y].badge = 0;
					
							safari.extension.toolbarItems[0].popover.contentWindow.location.reload();
					
							self.reloaded = false;
					
							setTimeout(function (self) {
								new Poppy($(self.popover.body).width() / 2, 13, [
									'<p>', _('Update Failure'), '</p>'].join(''), null, null, null, true);
							}, 200, self);
						}, 1100);
					
					safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePopover');
				}
			}
		} catch(e) { }
	},
	popover_visible: function () {
		for (var y = 0; y < safari.extension.toolbarItems.length; y++)
			if (safari.extension.toolbarItems[y].popover.visible) return true;
		return false;
	},
	validate: function (event) {
		if (safari.extension.secureSettings.getItem('installID') === null)
			safari.extension.secureSettings.setItem('installID', this.utils.id() + '~' + this.displayv);
			
		this.speedMultiplier = this.useAnimations ? 1 : 0.001;
		
		if (!('cleanup' in this.utils.timer.timers.intervals))
			this.utils.timer.interval('cleanup', $.proxy(this._cleanup, this), 1000 * 60 * 5);
			
		try {
			this.popover = safari.extension.toolbarItems[0].popover.contentWindow.document;
			
			if (this.installedBundle < this.bundleid) this.utils.attention(1);
			
			this.set_theme(this.theme);
			this.examine._populate_cache();
			this.rules.clear_temporary();
			
			safari.extension.toolbarItems[0].popover.width = this.simpleMode ? 360 : 460;
			safari.extension.toolbarItems[0].popover.height = this.simpleMode ? 350 : 400;
			
			$(this.popover.body).toggleClass('simple', this.simpleMode);
				
			event.target.disabled = !event.target.browserWindow.activeTab.url;

			if (event.target.disabled)
				event.target.badge = 0;
			else if (!this.methodAllowed)
				event.target.badge = 999;
		} catch(e) { }
	}
};

JavaScriptBlocker.rules.__proto__ = JavaScriptBlocker;
JavaScriptBlocker.utils.__proto__ = JavaScriptBlocker;
JavaScriptBlocker.examine.__proto__ = JavaScriptBlocker;