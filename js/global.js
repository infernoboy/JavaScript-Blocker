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
		return $(s, JB.popover);
	},
	JB = {
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
	displayv: '2.4.2',
	bundleid: 62,
	donation_url: 'http://lion.toggleable.com:160/jsblocker/verify.php?id=',
	
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
	
	verify_donation: function (id, cb) {
		$.get(this.donation_url + escape(id) +
				'&install=' + escape(safari.extension.settings.installID)).success(function (data) {
				var datai = parseInt(data, 10),
						error = null;
				
				switch (datai) {
					case -3: error = _('An email address was not specified.'); break;
					case -2: error = _('A donation with that email address was not found.'); break;
					case -1: error = _('The maximum number'); break;
					case 0:
					case 1:
					case 2:
						JB.donationVerified = id;
					break;
					
					default: error = data;
				}
				
				cb.call(JB, error);
		});
	},

	donate: function () {
		var self = this;
		
		this.utils.send_installid();
		
		if (!self.donationVerified)
			new Poppy($(this.popover.body).width() / 2, 13, [
				'<p>', _('Updated JavaScript Blocker {1}', ['<a class="outside" href="http://javascript-blocker.toggleable.com/change-log/240">' + this.displayv + '</a>']), '</p>',
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
			new Poppy($(this.popover.body).width() / 2, 13, [
				'<p>',
					_('Updated JavaScript Blocker {1}', ['<a class="outside" href="http://javascript-blocker.toggleable.com/change-log/' + this.displayv.replace(/\./g, '') + '">' + this.displayv + '</a>']),
				'</p>'].join(''));
			this.installedBundle = this.bundleid;
		}
	},
	
	updater: function () {
		var v = this.installedBundle, self = this;
		
		if (v === this.bundleid) return false;
		else if (v < 54) {
			if (!self.RulesWereUpgraded2) {
				self.RulesWereUpgraded2 = true;
				
				window.localStorage.removeItem('CollapsedDomains');
				window.localStorage.removeItem('InstallID');
				
				var ex = ['CollapsedDomains', 'ExamineUpdateTime', 'InstalledBundleID', 'LastRuleWasTemporary', 'ERROR', 'Rules',
						'allowedIsCollapsed', 'blockedIsCollapsed', 'unblockedIsCollapsed'], key, n = {};
				
				for (key in window.localStorage) {
					if (~ex.indexOf(key)) continue;
					
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
					_$('#rawr-continue').click(function () {
						self.installedBundle = 54;
						self.updater();
					});
			}, null, null, true);
		} else if (v < 59) {
			var x;
			
			if (x = safari.extension.secureSettings.installID) safari.extension.settings.setItem('installID', x);
			else safari.extension.settings.setItem('installID', this.utils.id() + '~' + this.displayv);
			
			if (safari.extension.settings.donationVerified) return this.donate();
			
			new Poppy($(this.popover.body).width() / 2, 13, [
				'<p class="misc-info">Important Donator Information</p>',
				'<p>', _('New donation method {1}', [_('Unlock')]), '</p>',
				'<p><input type="button" id="rawr-continue" value="', _('Understood'), '" /></p>'].join(''), function () {
					_$('#rawr-continue').click(function () {
						self.installedBundle = 59;
						self.updater();
					});
				}, $.noop, null, true);
		} else if (v < 60) {
			if (!self.RulesWereUpgraded3) {
				self.RulesWereUpgraded3 = true;
				
				var test = window.localStorage.getItem('Rules');
				
				try {
					test = JSON.parse(test);
					if (!('script' in test))
						window.localStorage.setItem('Rules', JSON.stringify({
							script: JSON.parse(window.localStorage.getItem('Rules')),
							frame: {}
						}));
				} catch (e) {}
			}
			
			this.rules.reinstall_predefined('frame');
			this.rules.reinstall_predefined('embed');
			
			new Poppy($(this.popover.body).width() / 2, 13, [
				'<p class="misc-info">Update 2.4.0</p>',
				'<p>A new donator-only feature has been added!</p>',
				'<p>You can now block the loading of frames, embeds, objects, and videos.</p>',
				'<p>',
					'<input type="button" id="rawr-continue" value="', _('Understood'), '" /> ',
					'<input type="button" id="rawr-setup" value="', _('Show Setup'), '" />',
				'</p>'].join(''), function () {
					_$('#rawr-continue').click(function () {
						self.updater();
					}).siblings('#rawr-setup').click(function () {
						new Poppy();
						self.setupDone = 0;
						self.open_popover({});
						self.setupDone = 1;
						
						for (var key in self.rules.data_types)
							self.rules.reinstall_predefined(key);
						
						var ss = safari.extension.settings;
						
						_$('#setup input[type="checkbox"]').attr('checked', null);
						
						if (ss.largeFont) _$('#use-large').attr('checked', 'checked');
						if (ss.alwaysBlock === 'domain') _$('#block-manual').attr('checked', 1);
						if (ss.secureOnly) _$('#secure-only').attr('checked', 1);
						if (ss.enableframe) _$('#block-frames').attr('checked', 1);
						if (ss.enableembed) _$('#block-embeds').attr('checked', 1);
					});
				}, $.noop, null, true);
		} else if (v < 61) {
			for (var key in this.rules.data_types)
				this.rules.reinstall_predefined(key);
				
			this.donate();
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
	
	enabled: function (kind) {
		if (!this.donationVerified && kind !== 'script') return false;
		
		return safari.extension.settings.getItem('enable' + kind);
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
	 * @this {JB}
	 */
	_cleanup: function () {
		var i, b, j, c, key, domain, e, new_collapsed = [], new_frames = {};
		
		for (i = 0, b = safari.application.browserWindows.length; i < b; i++)
			for (j = 0, c = safari.application.browserWindows[i].tabs.length; j < c; j++)
				if (this.frames[safari.application.browserWindows[i].tabs[j].url])
					new_frames[safari.application.browserWindows[i].tabs[j].url] = this.frames[safari.application.browserWindows[i].tabs[j].url];
					
		this.frames = new_frames;
		this.anonymous.newTab = {};
		this.anonymous.previous = {};
		
		this.caches.active_host = {};
		this.caches.domain_parts = {};
		
		function clean_emptyruleset (domain, r) {
			if ($.isEmptyObject(r[domain]))
				delete r[domain];
		}
		
		window.localStorage.removeItem('ERROR');
	
		for (key in this.rules.data_types)
			for (domain in this.rules.rules[key])
				this.utils.zero_timeout(clean_emptyruleset, [domain, this.rules.rules[key]]);
		
		this.utils.zero_timeout(function (rules) {
			rules.save()
		}, [this.rules]);
		
		var xx = this.collapsedDomains();
		
		if (typeof xx === 'object')
			for (var x = 0; x < xx.length; x++)
				if (xx[x] === _('All Domains') || (xx[x] in this.rules.rules.script) || (xx[x] in this.rules.rules.frame))
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
		return safari.extension.settings.getItem('donationVerified');
	},
	set donationVerified(value) {
		safari.extension.settings.setItem('donationVerified', value);
	},
	get methodAllowed() {
		if (this.simpleMode) return true;
		return this.donationVerified;
	},
	get host() {
		return this.active_host(_$('#page-list').val());
	},
	collapsed: function (k, v) {
		if (typeof v !== 'undefined') window.localStorage.setItem(k + 'IsCollapsed', v ? 1 : 0);
		else return window.localStorage.getItem(k + 'IsCollapsed') == '1';
	},
	collapsedDomains: function (v) {
		if (!v) {
			var t = window.localStorage.getItem('CollapsedDomains');
			return $.isEmptyObject(t) ? [] : JSON.parse(t).d;
		}
		
		window.localStorage.setItem('CollapsedDomains', JSON.stringify({ d: v }));
	},
	utils: {
		fill: function (string, args) {
			for (var i = 0; i < args.length; i++)
				string = string.replace(new RegExp('\\{' + i + '\\}', 'g'), args[i]);
			return string;
		},
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
						d.c.call(JB);
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
			$.get('http://lion.toggleable.com:160/jsblocker/installed.php?id=' + safari.extension.settings.getItem('installID'));
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
		var r = /^(https?|file|safari\-extension):\/\/([^\/]+)\//;
		
		try {
			if (!url) url = safari.application.activeBrowserWindow.activeTab.url;
		} catch (e) { return 'ERROR'; }
		
		if (url === 'about:blank') return 'blank';
		if (/^javascript:/.test(url)) return 'JavaScript Protocol';
		if (url in this.caches.active_host) return this.caches.active_host[url];
		if (/^data/.test(url)) return (this.caches.active_host[url] = 'Data URI');
		if (url.match(r) && url.match(r).length > 2) return (this.caches.active_host[url] = url.match(r)[2]);
		return 'ERROR';
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
		
		var ip = /^([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})$/,
				s = domain.split(/\./g).reverse(), t = s[0], p = ['*'], i, b,
				ex = ['co.uk', 'me.uk', 'org.uk', 'com.cn', 'org.cn', 'com.tw', 'org.tw', 'com.mx', 'co.nz', 'net.nz', 'org.nz',
						'us.com', 'uk.com', 'eu.com', 'de.com', 'co.jp'];
						
		if (ip.test(domain)) return [domain, '*'];
		
		for (i = 1, b = s.length; i < b; i++) {
			t = s[i] + '.' + t;
			if (!~ex.indexOf(t))
				p.push(t);
		}
			
		if (p.length === 1) p.push(domain);
		
		this.caches.domain_parts[domain] = p.reverse();
		
		return this.caches.domain_parts[domain];
	},
	rules: {
		get data_types() {
			return { script: {}, frame: {}, embed: {}, image: {} };
		},
		_loaded: false,
		get rules() {
			if (!this.cache) this.cache = this.data_types;
			if (this._loaded) return this._rules;
		
			this._loaded = true;
			
			var c = window.localStorage.getItem('Rules');
			
			this._rules = c ? JSON.parse(c) : this.data_types;
			this._rules = $.extend(this.data_types, this._rules);
		
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
			this.cache.script = {};
			this.cache.frame = {};
		
			try {
				var r = JSON.parse(string);
				
				if (!('script' in r)) {
					var d = this.data_types;
					d.script = r;
					r = d;
				}
			
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
		temporary_cleared: [],
		clear_temporary: function (kind) {
			if (~this.temporary_cleared.indexOf(kind) || !this.donationVerified) return false;
		
			this.temporary_cleared.push(kind);
			
			for (var domain in this.rules[kind]) {
				var rules = this.for_domain(kind, domain, true), rule;
					
				if (domain in rules)
					for (rule in rules[domain])
						if (rules[domain][rule][1])
							this.remove(kind, domain, rule, true);
			}
		},
		recache: function (kind, d) {
			if (d === '.*')
				this.cache[kind] = {};
			else if (d.match(/^\..*$/)) {
				for (var c in this.cache[kind])
					if (c.match(new RegExp('.*' + this.utils.escape_regexp(d) + '$')))
						delete this.cache[kind][c];
			} else
				delete this.cache[kind][d];
		},
		reinstall_predefined: function (kind) {
			var a, b, c, d;
		
			for (a in this.whitelist[kind])
				for (b = 0; b < this.whitelist[kind][a].length; b++)
					this.add(kind, a, this.whitelist[kind][a][b], 5);
		
			for (c in this.blacklist[kind])
				for (d = 0; d < this.blacklist[kind][c].length; d++)
					this.add(kind, c, this.blacklist[kind][c][d], 4);
		},
		allowed: function (kind, message) {
			if ((kind !== 'script' && !this.donationVerified) || !this.enabled(kind)) return 1;
			
			var rule_found = false,
					host = this.active_host(message[1]),
					domains = this.for_domain(kind, host), domain, rule,
					alwaysFrom = kind === 'script' ? safari.extension.settings.alwaysBlock : safari.extension.settings.getItem('alwaysBlock' + kind) || safari.extension.settings.alwaysBlock;
			
			domainFor:
			for (domain in domains) {
				ruleFor:
				for (rule in domains[domain]) {
					if (rule.length < 1 ||
							(safari.extension.settings.ignoreBlacklist && domains[domain][rule][0] === 4) ||
							(safari.extension.settings.ignoreWhitelist && domains[domain][rule][0] === 5)) continue;
					if ((new RegExp(rule)).test(message[2])) {
						rule_found = domains[domain][rule][0] < 0 ? true : domains[domain][rule][0] % 2;
						break domainFor;
					}
				}
			}
			
			if (typeof rule_found === 'number')
				return rule_found;
							
			if (alwaysFrom !== 'nowhere' && rule_found !== true) {
				var sproto = this.utils.active_protocol(message[2]),
						aproto = this.utils.active_protocol(message[1]);
				
				if (!(safari.extension.settings.allowExtensions && sproto === 'safari-extension')) {
					var page_parts = this.domain_parts(host),
							script_parts = this.domain_parts(this.active_host(message[2]));
							
					if (script_parts[0] === 'blank' && alwaysFrom !== 'everywhere') return 1;
					
					if ((alwaysFrom === 'topLevel' && page_parts[0] !== script_parts[0]) ||
							(alwaysFrom === 'domain' && page_parts[page_parts.length - 2] !== script_parts[script_parts.length - 2]) ||
							(alwaysFrom === 'everywhere') ||
							(aproto === 'https' && (safari.extension.settings.secureOnly && sproto !== aproto))) {
						if (this.saveAutomatic && !this.simpleMode) {
							var rr, script = message[2];
										
							if (/^data:/.test(script))
								rr = '^' + this.utils.escape_regexp(script) + '$';
							else
								rr = '^' + this.utils.escape_regexp(script.substr(0, script.indexOf(script_parts[0]))) + (alwaysFrom === 'topLevel' ?
										'((?!' + this.utils.escape_regexp(page_parts[0]) + '\\/).*)$' :
										this.utils.escape_regexp(script_parts[0]) + (/^(https?|safari\-extension)/.test(sproto) ? '\\/' : '') + '.*$');
										
							this.add(kind, host, rr, 2, true, true);
						}
					
						return 0;
					}
				}
			}
	
			return 1;
		},
		for_domain: function (kind, domain, one) {
			if (kind !== 'script' && !this.donationVerified) return {};
			
			if (domain in this.cache[kind]) {
				var temp = {};
			
				if (one) {
					if (domain in this.cache[kind][domain] && typeof this.cache[kind][domain][domain] === 'object')
						temp[domain] = this.cache[kind][domain][domain];
					else
						temp[domain] = {};
				} else
					temp = this.cache[kind][domain];
				
				return temp;
			}
						
			var parts = this.utils.domain_parts(domain), o = {}, i, b, c, r;
		
			if (parts.length === 1 && domain !== '.*') return this.for_domain(kind, '.*', true);
		
			var x = parts.slice(0, 1),
					y = parts.slice(1);
		
			x.push(x[0]);
		
			parts = x.concat(y);
	
			for (i = 0, b = parts.length; i < b; i++) {
				c = (i > 0 ? '.' : '') + parts[i];
				r = this.rules[kind][c];
				if (r === null || r === undefined) continue;
				if (c === '.*') {
					if (!(c in this.cache[kind])) this.cache[kind][c] = { '.*': r };
					o[c] = this.cache[kind][c][c];
					continue;
				} 
			
				o[c] = r;
			}

			this.cache[kind][domain] = o;

			return this.for_domain(kind, domain, one);
		},
		add: function (kind, domain, pattern, action, add_to_beginning, temporary) {
			if (kind !== 'script' && !this.donationVerified) return false;
			
			if (pattern.length === 0) return this.remove(kind, domain, pattern, true);
		
			if (!this.donationVerified) temporary = false;
		
			this.collapsed('LastRuleWasTemporary', temporary ? 1 : 0);
		
			var crules = this.for_domain(kind, domain, true);
		
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
		
			this.recache(kind, domain);

			this.rules[kind][domain] = crules[domain];
		
			this.save();
		},
		remove: function (kind, domain, rule, delete_automatic) {
			if (kind !== 'script' && !this.donationVerified) return false;
			
			var crules = this.for_domain(kind, domain), key;
			if (!(domain in crules)) return false;
		
			this.recache(kind, domain);

			try {
				if (!delete_automatic && crules[domain][rule][0] > 1 && crules[domain][rule][0] < 4) {
					crules[domain][rule][0] *= -1;
					crules[domain][rule][1] = false;
				} else
					delete crules[domain][rule];
			} catch(e) { }

			if ($.isEmptyObject(crules[domain]))
				delete this.rules[kind][domain];
			else
				this.rules[kind][domain] = crules[domain];
			
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
		remove_matching_URL: function (kind, domain, urls, confirmed, block_allow, allow_disabled) {
			if (kind !== 'script' && !this.donationVerified) return false;
			
			var crules = this.for_domain(kind, domain), to_delete = {}, being_deleted = {}, sub, rule, url, rtype, temp;
		
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
								delete this.cache[kind][sub];
											
								if (!(rule in crules[sub])) continue;
						
								if (rtype > 1 && rtype < 4) {
									crules[sub][rule][0] *= -1;
									crules[sub][rule][1] = false;
								} else if (rtype > -1)
									delete crules[sub][rule];
							} else {
								if (~being_deleted[sub].indexOf(rule))
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
			 		this.rules[kind][sub] = crules[sub];
				}
			}
				
			return confirmed ? 1 : to_delete;
		},
		remove_domain: function (kind, domain) {
			delete this.cache[kind][domain];
			delete this.rules[kind][domain];
			this.save();
		},
	
		/**
		 * Creates a <ul> displaying rules with actions to affect them.
		 *
		 * @param {string} domain Domain to display rules for
		 * @param {string|Boolean} url A url the rule must match in order to be displayed
		 * @param {Boolean} no_dbl_click Wether or not to enable double clicking on a rule
		 */
		view: function (kind, domain, url, no_dbl_click) {
			var self = this, allowed = this.for_domain(kind, domain, true),
					ul = $('<ul class="rules-wrapper"></ul>'), newul,
					rules, rule, did_match = !1, rtype, temp;
			
			if (kind !== 'script' && !this.donationVerified) return ul;
			
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
								.find('li:last').data('rule', rule).data('domain', domain).data('type', rtype).data('kind', kind);
					}
				
					$('.divider:last', newul).css('visibility', 'hidden');

					if (rules === 0) return $('<ul class="rules-wrapper"></ul>');
						
					if (j && ~j.indexOf(domain_name))
						newul.parent().prev().addClass('hidden');
				}
							
				if (no_dbl_click) $('li span', ul).addClass('nodbl');
			}
	
			return ul;
		}
	},
	add_rule_host: function (me, url, left, top, allow) {
		var self = this,
				hostname = me.parent().data('url'), rule,
				one_script = me.parent().data('script'),
				kind = me.parent().data('kind'),
				proto = self.utils.active_protocol(one_script[0]),
				parts = proto === 'http' || proto === 'https' ? self.utils.domain_parts(hostname) : [hostname, '*'], a = [],
				page_parts = self.utils.domain_parts(self.utils.active_host(_$('#page-list').val())), n,
				opt = '<option value="^{0}$">{1}</option>';
				
		if (kind !== 'script' && !this.donationVerified)
			return new Poppy(left, top + 8, _('Donation Required'));
		
		if (hostname === 'blank')
			a.push(this.utils.fill(opt, ['about:blank', 'blank']));
		else if (hostname === 'Data URI')
			a.push(this.utils.fill(opt, ['data:.*', 'Data URI']));
		else if (hostname === 'JavaScript Protocol')
			a.push(this.utils.fill(opt, ['javascript:.*', 'JavaScript Protocol']));
		else
			for (var x = 0; x < parts.length - 1; x++)
				a.push(this.utils.fill(opt, [proto + ':\\/\\/' + (x === 0 ? self.utils.escape_regexp(parts[x]) :
					'([^\\/]+\\.)?' + self.utils.escape_regexp(parts[x])) + '\\/.*', (x > 0 ? '.' : '') + parts[x]]));
			
		new Poppy(left, top + 8, [
				'<p class="misc-info">', _('Adding a ' + kind.charAt(0).toUpperCase() + kind.substr(1) + ' Rule'), '</p>',
				this.donationVerified ? [
					'<p>',
						'<input id="domain-script-temporary" type="checkbox"', self.collapsed('LastRuleWasTemporary') ? ' checked' : '', ' />',
						'<label for="domain-script-temporary">&thinsp;', _('Temporary rule'), '</label> ',
					'</p>'].join('') : '',
				'<p>',
					Template.create('tmpl_domain_picker', { page_parts: page_parts }),
				'</p>',
				'<p>',
					'<label for="domain-script" class="no-disclosure ', allow ? 'allowed-' : 'blocked-', 'label">', allow ? _('Allow') : _('Block'), ':</label> ',
					'<select id="domain-script" class="', proto, ' kind-', kind, '">', a.join(''), '</select> ',
					'<input id="domain-script-continue" type="button" value="', _('Continue'), '" />',
				'</p>'].join(''), function () {
					_$('#domain-script-continue').click(function () {
						var	h = _$('#domain-picker').val(),
								temp = _$('#domain-script-temporary').is(':checked');
						
						self.rules.add(kind, h, _$('#domain-script').val(), allow ? 1 : 0, true, temp);
							
						safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
					})
		});
	},
	bind_events: function(some, host) {
		var add_rule, remove_rule, self = this;
			
		function url_display (e) {
			var t = $(this), pa = t.parent(), off = t.offset(), kind = pa[0].className.substr(5),
					kindP = kind.charAt(0).toUpperCase() + kind.substr(1);
					
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
				
				if (kind === 'script')
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
					'<input type="button" value="', _('View ' + kindP + ' Source'), '" id="view-script" />'].join(''), function () {
						_$('#poppy #script-info').click(script_info).siblings('#view-script').click(function () {
							if (kind === 'embed') return new Poppy(e.pageX, off.top - 2, '<p>' + _('Unable to view source of embedded items.') + '</p>');
							
							if (/^data/.test(t.text())) {
								var dd = t.text().match(/^data:(([^;]+);)?([^,]+),(.+)/);

								if (dd && dd[4] && ((dd[2] && dd[2].toLowerCase() === 'text/javascript') ||
										(dd[3] && dd[3].toLowerCase() === 'text/javascript'))) {
									codeify(unescape(dd[4]));
									new Poppy();
								} else
									new Poppy(e.pageX, off.top - 2, '<p>' + _('This data URI cannot be displayed.') + '</p>');
							} else {
								new Poppy(e.pageX, off.top - 2, '<p>' + _('Loading ' + kind) + '</p>', $.noop, function () {
									try {
										$.ajax({
											dataType: 'text',
											url: t.text(),
											success: function (data) {
												codeify(data);
												new Poppy();
											},
											error: function (req) {
												new Poppy(e.pageX, off.top - 2, '<p>' + req.statusText + '</p>');
											}
										});
									} catch (er) {
										new Poppy(e.pageX, off.top - 2, '<p>' + er + '</p>');
									}
								}, 0.1);
							}
						});
					});
		}
		
		$(this.popover).on('click', 'ul.rules-wrapper li input', function () {
			if (!self.utils.confirm_click(this)) return false;
	
			var $this = $(this), li = $this.parent(), parent = li.parent(), span = $('span.rule', li),
					is_automatic = $('span.rule.type-2, span.rule.type--2', li).length;
			
			if (this.value === _('Restore')) {
				self.rules.add(li.data('kind'), li.data('domain'), li.data('rule'), li.data('type') * -1, false, true);
				this.value = _('Disable');
				span.addClass(span[0].className.substr(span[0].className.indexOf('type')).replace('--', '-')).removeClass('type--2').addClass('temporary');
			} else {
				self.rules.remove(li.data('kind'), li.data('domain'), li.data('rule'));
				
				if (is_automatic) {
					this.value = _('Restore');
					span.addClass(span[0].className.substr(span[0].className.indexOf('type')).replace('-', '--')).removeClass('type-2 temporary');
				}
			}
			
			if (!is_automatic) {
				li.remove();
	
				$('.divider:last', parent).css('visibility', 'hidden');

				if ($('li', parent).length === 0) {
					parent.parent().prev().remove();
					parent.parent().remove();
				}
			}
			
			_$('#domain-filter').trigger('search');
		});
		
		$(this.popover).on('dblclick', 'ul.rules-wrapper li span:not(.nodbl)', function (e) {
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
								li: t.parent(),
								header: _((is_new ? 'Adding' : 'Editing') + ' a Rule For {1}', [Template.create('tmpl_domain_picker', {
									page_parts: [domain === '.*' ? null : domain, '*'],
									no_label: true,
									no_all: domain !== '.*'
								})])
						}, JB);

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
						var kind = padd.me.li.data('kind'), v;
						
						if (!is_new) padd.main.rules.remove(kind, padd.me.domain, rule);
						v = padd.save_orig.call(this, true);
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
		
		$(this.popover).on('click', 'ul .domain-name', function () {
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

		$(this.popover).on('click', '#allowed-script-urls ul input', function (e) {
			var butt = this,
				li = $(this).parent(),
				off = $(this).offset(),
				left = off.left + $(this).outerWidth() / 2,
				url = li.data('url'),
				script = li.data('script');
		
			if (self.simpleMode) return self.add_rule_host($(butt), script, left, off.top, !$(this).parents('#allowed-script-urls').length);
			else if (!self.donationVerified) return false;
			
			var page_parts = self.utils.domain_parts(self.host), n,
					padd = self.poppies.add_rule.call({
						url: '^' + (self.simpleMode ? self.utils.escape_regexp(script[0].substr(0, script[0].indexOf(url))) : '') + self.utils.escape_regexp(url) + (self.simpleMode ? '\\/.*' : '') + '$',
						e: $(this).siblings('span'),
						li: $(this).parent(),
						domain: self.host,
						header: _('Adding a Rule For {1}', [Template.create('tmpl_domain_picker', { page_parts: page_parts, no_label: true })])
				}, self),
				auto_test = self.rules.remove_matching_URL(li.data('kind'), self.host, script, false, true, true);
					
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
										self.rules.add(li.data('kind'), self.host, ds[b][0], ds[b][1][0] * -1, false, true);
									else
										self.rules.remove(li.data('kind'), self.host, ds[b][0], true);
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
					li = me.parent(),
					m = !me.parents('div').attr('id').match(/blocked/),
					off = me.offset(),
					left = off.left + me.outerWidth() / 2,
					url = li.data('script');
			
			if (self.simpleMode) return self.add_rule_host(me, url, left, off.top, !$(this).parents('#allowed-script-urls').length);
			else if (!self.donationVerified) return false;			
						
			var to_delete = self.rules.remove_matching_URL(li.data('kind'), self.host, url, false, m),
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
				wrapper.append(self.rules.view(li.data('kind'), d, url, true).find('> li').find('input').remove().end());

				rs.push(to_delete[d][0]);
			}
			
			$('li.domain-name', vs).removeClass('hidden').addClass('no-disclosure');
			
			var newHigh = function (time) {
				var url = me.parent().data('script')[0],
						page_parts = self.utils.domain_parts(self.host),
						padd = self.poppies.add_rule.call({
							url: '^' + self.utils.escape_regexp(url) + '$',
							li: me.parent(),
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
						self.rules.remove_matching_URL(li.data('kind'), self.host, url, true, m);
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
					(window.navigator.platform.match(/Win/) && e.which === 17)) {
						self.commandKey = true;
						self.utils.timer.timeout('no_commandkey', function (self) {
							self.commandKey = false;
						}, 1000, [self]);
					}
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
			var page_parts = self.utils.domain_parts(self.utils.active_host(_$('#page-list').val())), n, off = $(this).offset(), me = this, kinds =[];
			
			if (self.donationVerified)
				for (var kind in self.rules.data_types) {
					if (!safari.extension.settings.getItem('enable' + kind)) continue;
					
					var ki = kind.charAt(0).toUpperCase() + kind.substr(1) + 's';
				
					kinds.push('<input class="ba-kind" id="ba-kind-' + kind + '" type="checkbox" ' + (!self.collapsed(kind + 'Unchecked') ? 'checked' : '') + '>' +
							'<label for="ba-kind-' + kind + '">&nbsp;' + _(ki) + '</label>&nbsp;&nbsp;&nbsp;');
				}
			
			new Poppy(off.left + $(this).outerWidth() / 2, off.top + 8, [
					self.donationVerified ? [
						'<p>',
							'<input id="domain-script-temporary" type="checkbox"', self.collapsed('LastRuleWasTemporary') ? ' checked' : '', ' />',
							'<label for="domain-script-temporary">&thinsp;', _('Temporary rule'), '</label> ',
						'</p>'].join('') : '',
					'<p>',
						kinds.join(''),
					'</p>',
					'<div class="inputs">',
						Template.create('tmpl_domain_picker', { page_parts: page_parts, no_all: true }),
						' <input id="domain-script-continue" type="button" value="', _('Continue'), '" />',
					'</div>'].join(''), function () {
						_$('#domain-script-continue').click(function () {
							var h = _$('#domain-picker').val(), kind,
									block_kind = _$('.ba-kind:checked').map(function () {
										return this.id.substr(8);
									});
							
							for (kind in self.rules.data_types)
								if (!~$.makeArray(block_kind).indexOf(kind))
									self.collapsed(kind + 'Unchecked', 1);
														
							for (var i = 0; i < block_kind.length; i++) {
								self.collapsed(block_kind[i] + 'Unchecked', 0)
								var key = block_kind[i], ki = key.charAt(0).toUpperCase() + key.substr(1) + 's';
								self.rules.remove(key, h, '.*(All ' + ki + ')?');
								self.rules.add(key, h, '.*(All ' + ki + ')?', me.id === 'block-domain' ? 0 : 1, true, _$('#domain-script-temporary').is(':checked'));
							}
							
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
						var domain, i = 0, filter = _$('#domain-filter'), rs = [];
						
						if ('srcElement' in event)
							filter.val('');
						
						function appendrules (ul, domain, self, type) {
							ul.append($('> li', self.rules.view(type, domain)));
							
							self.utils.zero_timeout(function (self) {
								self.utils.timer.timeout('filter_bar_click', function (self) {
									_$('.filter-bar li.selected').click();
								}, 10, [self]);
							}, [self]);
						}
						
						for (var key in self.rules.data_types) {
							if (!_$('#head-' + key + '-rules').length)
								_$('#rule-container').append(Template.create('tmpl_rule_wrapper', {
									kind: key,
									local: _(key.charAt(0).toUpperCase() + key.substr(1) + ' Rules')
								}));
							
							var head = _$('#head-' + key + '-rules'), wrap = _$('#rules-list-' + key + 's').parent();
							
							if (!self.enabled(key)) {
								head.hide();
								wrap.hide();
							} else {
								head.show();
								wrap.show();
							}
							
							var s = self.utils.sort_object(self.rules.rules[key]),
									ul = _$('#rules-list #data ul#rules-list-' + key + 's').html('');

							for (domain in s)
								self.utils.zero_timeout(appendrules, [ul, domain, self, key]);
						}
					
						function remove_domain (event) {
							event.stopPropagation();
							if (!self.utils.confirm_click(this)) return false;
							
							var li = $(this.parentNode), d = li.data('domain');
							
							self.rules.remove_domain(li.data('kind'), d);
							
							var rs = $(this.parentNode).next();
							
							$(this.parentNode).remove();
							rs.remove();
							
							_$('#domain-filter').trigger('search');
						}
							
						self.utils.zero_timeout(function (ul) {
							_$('.rules-wrapper .domain-name').prepend('<div class="divider"></div><input type="button" value="' + _('Remove') + '" />')
									.find('input').click(remove_domain);
						}, [ul]);
						
						self.utils.zero_timeout(function (self) {
							self.utils.zero_timeout(function (self) {
								self.busy = 0;
								new Poppy();
								var l = _$('#rules-list');
								if (!l.is(':visible')) {
									self.utils.zoom(l, _$('#main'));
									
									self.utils.zero_timeout(function (self) {
										self.speedMultiplier = 0.001;
										
										for (var key in self.rules.data_types)
											if (self.collapsed('rules-list-' + key + 's') &&
												_$('#rules-list #data ul#rules-list-' + key + 's').css('opacity') === '1')
													_$('#toggle-' + key + '-rules').click();
										
										self.speedMultiplier = self.useAnimations ? 1 : 0.001;
									}, [self]);
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
					for (var key in self.rules.data_types) {
						var rules = self.rules.for_domain(key, self.host), domain, rule;

						for (domain in rules)
							for (rule in rules[domain])
								if (rules[domain][rule][1]) {
									if (this.id === 'rules-make-perm')
										self.rules.add(key, domain, rule, rules[domain][rule][0], true, false);
									else
										self.rules.remove(key, domain, rule);
								}
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
					_$('#rules-list #data ul.rules-wrapper').html('');
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
				self.collapsed(which, 0);
				$this.removeClass('hidden');
				e.show().css('marginTop', -e.height()).animate({
					marginTop: 0
				}, 200 * self.speedMultiplier).removeClass('was-hidden');
			} else {
				self.collapsed(which, 1);
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
			
			var ul = _$('.rules-wrapper');
			
			$('.domain-name', ul).toggleClass('no-disclosure').toggleClass('editing')
					.find('.divider').css('visibility', 'visible');
			
			for (var kind in self.rules.data_types)
				ul.filter('#rules-list-' + kind + 's').find('.domain-name .divider').filter(':visible:first').css('visibility', 'hidden');
				
			
		}).siblings('#reinstall-pre').click(function () {
			var off = $(this).offset();
			
			for (var key in self.rules.data_types)
				self.rules.reinstall_predefined(key);
			new Poppy(off.left + $(this).width() / 2, off.top, '<p>' + _('Whitelist and blacklist rules have been reinstalled.') + '</p>');
		});
		
		_$('#make-temp-perm').click(function () {
			var off = $(this).offset();
			
			if (!self.donationVerified) return new Poppy(off.left + $(this).width() / 2, off.top, _('Donation Required'));
			
			for (var key in self.rules.data_types)
				for (var domain in self.rules.rules[key]) {
					var rules = self.rules.for_domain(key, domain, true), rule;
					
					if (domain in rules)
						for (rule in rules[domain])
							if (rules[domain][rule][1])
								self.rules.add(key, domain, rule, rules[domain][rule][0], false, false);
				}
			
			_$('.rules-wrapper').find('span.temporary').removeClass('temporary');

			_$('#filter-type-state li.selected').click();
			
			new Poppy(off.left + $(this).width() / 2, off.top, '<p>' + _('All temporary rules are now permanent.') + '</p>');
		});
		
		_$('#remove-all-temp').click(function () {
			var off = $(this).offset();
			
			if (!self.donationVerified) return new Poppy(off.left + $(this).width() / 2, off.top, _('Donation Required'));
			
			for (var key in self.rules.data_types)
				for (var domain in self.rules.rules[key]) {
					var rules = self.rules.for_domain(key, domain, true), rule;
			
					if (domain in rules)
						for (rule in rules[domain])
							if (rules[domain][rule][1])
								self.rules.remove(key, domain, rule, true);
				}
			
			var l = _$('.rules-wrapper');
			
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
			
			for (var key in self.rules.data_types) {
				var head = _$('#head-' + key + '-rules').show(), wrap = _$('#rules-list-' + key + 's').parent().show();
				
				if (!_$('#rules-list-' + key + 's .domain-name:visible').length) {
					head.hide();
					head.hide();
				}
			}
			
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
				var d = _$('.rules-wrapper ul li .divider').css('visibility', 'visible').parent().parent();

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
				
				_$('#rules-list .rules-header').each(function () {
					var kind = this.id.substring(5, this.id.indexOf('-', 5));

					if (!_$('#rules-list-' + kind + 's .domain-name:visible').length) $(this).hide();
					else $(this).show();
				});
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

		$(this.popover).on('click', '.toggle-rules', function () {
			var e = $(this).parent().next().find('.rules-wrapper'),
					a = e.css('opacity') === '1';
					
			if (e.is(':animated')) return false;
					
			this.innerHTML = a ? _('Show') : _('Hide');
					
			self.collapsed(e.attr('id'), a);
						
			e.css({ opacity: 1, marginBottom: a ? 0 : '6px', marginTop: !a ? -e.outerHeight() : 0 }).animate({
				marginTop: a ? -e.outerHeight() : 0
			}, 200 * self.speedMultiplier, function () {
				this.style.opacity = a ? 0 : 1;
				this.style.marginTop = a ? -(e.outerHeight() * 2) + 'px' : 0;
			});
		});
		
		$(this.popover).on('click', 'a.toggle-main', function (event) {
			var me = $(this),
					pos = me.parents('.main-wrapper').parent().attr('id'),
					e = me.parent().parent().nextUntil('li.kind-header'),
					a = e.css('opacity') === '1';
					
			if (e.is(':animated')) return false;

			this.innerHTML = a ? _('Show') : _('Hide');
		
			self.collapsed(pos + '-' + me[0].className.substr(17), a);

			e.css({ opacity: 1 }).animate({
				height: 'toggle',
				margin: 'toggle',
				padding: 'toggle'
			}, 200 * self.speedMultiplier, function () {
				this.style.opacity = a ? 0 : 1;
			});
		});
		
		_$('#page-lists-label').dblclick(function () {
			var l = $.extend({}, window.localStorage);
			delete l.Rules;
			delete l.CollapsedDomains;
			
			new Poppy($(self.popover.body).width() / 2, 13, [
				'<p>This data contains a copy of your settings and current webpage. It does NOT reveal your rules.</p>',
				'<textarea id="debug-info" readonly>',
					'Version', "\n", self.displayv, '-', self.bundleid, "\n\n",
					'window.localStorage', "\n", JSON.stringify(l), "\n\n", 
					'Settings', "\n", JSON.stringify(safari.extension.settings), "\n\n",
					'Webpage', "\n", safari.application.activeBrowserWindow.activeTab.url,
				'</textarea>'
			].join(''), function () {
				var t = _$('#debug-info')[0];
				t.selectionStart = 0;
				t.selectionEnd = t.innerHTML.length;
			});
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
		var self = this, el = _$('#' + text + '-script-urls'), ul = _$('#' + text + '-script-urls ul'), li, use_url, protocol, poopy,
				shost_list = {}, lab = _$('#' + text + '-scripts-count');
		
		for (var key in this.rules.data_types)
			shost_list[key] = { 'http': {}, 'https': {}, 'file': {}, 'safari-extension': {}, 'data': {}, 'javascript': {}, 'about': {} };
			
		function append_url(index, kind, ul, use_url, script, button, protocol) {
			return ul.append('<li><span></span> <small></small><input type="button" value="" /><div class="divider"></div></li>').find('li:last')
					.attr('id', text.toLowerCase() + '-' + kind + '-' + index)
					.data('url', use_url).data('script', [script]).data('kind', kind).addClass('kind-' + kind).find('span')
					.text(use_url).addClass(protocol).siblings('input')
					.val(button).parent();
		}
		
		function add_item(index, kind, item, do_hide) {
			if (text !== 'unblocked' && self.simpleMode) {
				use_url = self.utils.active_host(item);
				protocol = self.utils.active_protocol(item);
								
				if (!(use_url in shost_list[kind][protocol])) {
					li = append_url(index, kind, ul, use_url, item, button, protocol);
					shost_list[kind][protocol][use_url] = [1, li.attr('id')];
				} else {
					shost_list[kind][protocol][use_url][0]++;
					
					try {
						$('li#' + shost_list[kind][protocol][use_url][1], ul).data('script').push(item);
					} catch (e) {
						return self.make_list(text, button, jsblocker);
					}
				}
			} else
				li = append_url(index, kind, ul, item, item, button);
		}
			
		if (self.simpleMode && text !== 'unblocked') {
			var cn = 0;
			
			for (var kind in jsblocker[text].items)
				cn += jsblocker[text].items[kind].unique.length;
				
			lab.html(cn);
		} else
			lab.html(jsblocker[text].count);
			
		for (var key in this.rules.data_types) {
			if (!this.enabled(key)) continue;
			
			var ki = _(key.charAt(0).toUpperCase() + key.substr(1) + 's'),
					do_hide = _$('#main').is(':visible') && this.collapsed(el.attr('id') + '-' + key);
			
			if (jsblocker[text].items[key].all.length) {
				ul.append([
					'<li class="kind-header kind-', key, '">',
						'<header>',
							'<h3>' + ki + '</h3>',
							'<a class="toggle-main kind-', key, '">', do_hide ? _('Show') : _('Hide'), '</a>',
							'<br style="clear:both;" />',
						'</header>',
					'</li>'].join(''));
			
				for (var i = 0; i < jsblocker[text].items[key].all.length; i++)
					add_item(i, key, jsblocker[text].items[key].all[i], do_hide);
				
				if (do_hide)
					$('li.kind-header:last', ul).nextAll().animate({ opacity: 0, height: 'toggle', margin: 'toggle', padding: 'toggle' }, 0);
			}
		}
		
		if (this.simpleMode && safari.extension.settings.showPerHost) {
			for (var kind in shost_list)
				for (poopy in shost_list[kind])
					for (use_url in shost_list[kind][poopy]) {
						$('li#' + shost_list[kind][poopy][use_url][1], ul).find('small')
								.html('<a href="javascript:void(0);" class="show-scripts">(' + shost_list[kind][poopy][use_url][0] + ')</a>');
					}
			
			_$('.show-scripts', ul).click(function () {
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
		
		var ref = safari.extension.settings.sourceCount, len = $('li:not(.kind-header)', ul).length;

		if (len > ref && len - ref > 1) {
			$('li:not(.kind-header)', ul).eq(ref - 1).after(['<li class="show-me-more">',
					'<a href="javascript:void(1)" class="show-more">', _('Show {1} more', [len - ref]), '</a>',
				'</li>'].join(''));
			$('li.show-me-more', ul).nextAll().hide().addClass('show-more-hidden')
		}
		
		$('li.kind-header', ul).each(function () {
			$('.divider', $(this).nextUntil('.kind-header')).filter(':last').css('visibility', 'hidden');
		});

		$('.show-more', ul).click(function () {
			$(this).parent().siblings('li:hidden').slideDown(200 * self.speedMultiplier).end().slideUp(300  * self.speedMultiplier, function () {
				$(this).remove();
			});
			_$('#find-bar-search:visible').trigger('search');
		});
		
		if (self.collapsed(text)) {
			ul.addClass('was-hidden').hide();
			_$('.' + text + '-label').addClass('hidden');
		}
	},
	do_update_popover: function (event, index, badge_only) {
		if (!this.methodAllowed) return false;
		if (_$('#domain-picker').is(':visible') && this.popover_visible()) return this.utils.timer.timeout('do_update_popover', function (self, event, index, badge_only) {
			self.do_update_popover(event, index, badge_only);
		}, 1500, [this, event, index, badge_only]);
		
		var self = this, jsblocker = event.message, toolbarItem = null;
		
		this.busy = 1;

		if (safari.application.activeBrowserWindow.activeTab.url === jsblocker.href) {
			var page_list = _$('#page-list'), frames_blocked_count = 0, frames_blocked_item_count = 0, frames_allowed_count = 0, frames_allowed_item_count = 0, frame;
			
			page_list.find('optgroup:eq(1)').remove();
			
			if (jsblocker.href in this.frames) {
				var frame, inline, xx = this.frames[jsblocker.href], d, frames_blocked_item_count = 0, frames_allowed_item_count = 0;

				for (frame in xx) {
					if (page_list.find('optgroup').length == 1)
						inline = $('<optgroup label="' + _('Inline Frame Pages') + '"></optgroup>').appendTo(page_list);
					else
						inline = page_list.find('optgroup:eq(1)');
				
					frames_blocked_count += xx[frame].blocked.count;
					frames_allowed_count += xx[frame].allowed.count;
					
					for (var key in xx[frame].blocked.items) {
						frames_blocked_item_count += xx[frame].blocked.items[key].unique.length;
						frames_allowed_item_count += xx[frame].allowed.items[key].unique.length;
					}
					
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
				else {
					var allowed_items = 0, blocked_items = 0;
					
					for (var kind in jsblocker.allowed.items) {
						allowed_items += jsblocker.allowed.items[kind].unique.length;
						blocked_items += jsblocker.blocked.items[kind].unique.length;
					}
							
					toolbarItem.badge = safari.extension.settings.toolbarDisplay === 'allowed' ?
							allowed_items + frames_allowed_item_count :
							(safari.extension.settings.toolbarDisplay === 'blocked' ? blocked_items + frames_blocked_item_count : 0);
				}
			}
			
			if (!badge_only) {
				page_list.find('optgroup:first option').attr('value', jsblocker.href).text(jsblocker.href);
			
				if (typeof index == 'number' && index > 0) {
					page_list[0].selectedIndex = index;
					jsblocker = this.frames[jsblocker.href][page_list.val()];
				}
						
				page_list.unbind('change').change(function () {
					new Poppy();
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
				
				_$('#unlock-p').toggleClass('hidden', !(self.donationVerified === false || self.donationVerified === null || self.donationVerified === undefined));
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
		} else if (~event.key.indexOf('alwaysBlock')) {
				var wd, i, b, bd, e, c, key, domain;

				var delete_automaticrules = function (self, key, domain) {
					var rs, r;
		
					rs = self.rules.for_domain(key, domain, true);

					if (key in rs) {
						for (r in rs[domain]) {
							if (rs[domain][r] === 2)
								self.rules.remove(key, domain, r, true);
						}
					}
				}

				for (key in this.rules.data_types) {
					for (domain in this.rules.rules[key])
						this.utils.zero_timeout(delete_automaticrules, [this, key, domain, 2]);

					this.rules.reinstall_predefined(key);
				}
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
				this.disabled ||
				!safari.extension.settings.blockReferrer ||
				((event.target.url in this.anonymous.previous) && this.anonymous.previous[event.target.url] === event.url) ||
				((event.target.url in this.anonymous.pages) && this.anonymous.pages[event.target.url] === event.url) ||
				((event.target.url in this.anonymous.cannot) && ~this.anonymous.cannot[event.target.url].indexOf(event.url))) {
			delete this.anonymous.cannot[event.target.url];
			delete this.anonymous.pages[event.target.url];
			return true;
		}
						
		if (event.url && event.target.url && event.target.url.length && event.url.length) {
			if (~event.url.indexOf('#')) {
				var target_test = event.target.url.substr(0, event.target.url.indexOf('/', 9)),
						dest_test = event.url.substr(0, event.url.indexOf('/', 9));

				if (target_test === dest_test) return true;
			}
			
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
				} else if (event.message === 'parentURL') {
					event.message = event.target.url;
					break;
				} else if (event.message[0] && event.message[0] === 'setting') {
					event.message = safari.extension.settings.getItem(event.message[1]);
					break;
				}
				
				if (this.disabled ||
						(event.message[0] !== 'script' && !this.donationVerified)) {
					event.message = 1;
					break theSwitch;
				} else if (this.installedBundle < this.bundleid || !this.methodAllowed) {
					event.message = 0;
					break theSwitch;
				}

				event.message = this.rules.allowed(event.message[0], event.message);
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
				
				if (!~this.anonymous.cannot[event.target.url].indexOf(event.message))
					this.anonymous.cannot[event.target.url].push(event.message);
			break;
			
			case 'setting':
				event.target.page.dispatchMessage('setting', [event.message, safari.extension.settings.getItem(event.message)]);
			break;
			
			case 'doNothing': break;
		}
	},
	open_popover: function (event) {
		if (typeof event !== 'undefined' && ('type' in event) && ~['beforeNavigate', 'close'].indexOf(event.type)) {
			delete this.frames[event.target.url];
			setTimeout(function (self, event) {
				delete self.anonymous.newTab[event.target.url];
			}, 100, this, event);
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
		} else if (!event || (event && ('type' in event) && ~['beforeNavigate', 'close'].indexOf(event.type))) {
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
				
				for (var key in self.rules.data_types)
					self.rules.reinstall_predefined(key);
				
				self.utils.zoom(s, _$('#main'));
				
				self.utils.send_installid();
									
				self.open_popover();
			}).end().find('#setup-simple').click(function () {
				self.simpleMode = this.checked;
			}).end().find('#block-manual').click(function () {
				safari.extension.settings.alwaysBlock = this.checked ? 'domain' : 'everywhere';
			}).end().find('#block-frames').click(function () {
				safari.extension.settings.enableframe = this.checked;
			}).end().find('#block-embeds').click(function () {
				safari.extension.settings.enableembed = this.checked;
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
					safari.extension.settings.simpleMode = true;
					
					safari.extension.toolbarItems[0].popover.contentWindow.location.reload();
		
					setTimeout(function (self) {
						new Poppy($(self.popover.body).width() / 2, 13, [
							'<p>', _('You cannot use JavaScript Blocker'), '</p>'].join(''));
					}, 1000, self);
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
		var self = this;
		
		if (safari.extension.settings.getItem('installID') === null)
			safari.extension.settings.setItem('installID', this.utils.id() + '~' + this.displayv);
			
		this.speedMultiplier = this.useAnimations ? 1 : 0.001;
		
		if (!('cleanup' in this.utils.timer.timers.intervals))
			this.utils.timer.interval('cleanup', $.proxy(this._cleanup, this), 1000 * 60 * 5);
			
		try {
			this.popover = safari.extension.toolbarItems[0].popover.contentWindow.document;
			
			if (this.installedBundle < this.bundleid) this.utils.attention(1);
			
			if (this.donationVerified && !this.donationReverified) {
				this.donationReverified = true;
				
				this.verify_donation(this.donationVerified, function (error) {
					if (error && isNaN(error) && !(/^Error/.test(error))) {
						self.donationVerified = false;
						
						setTimeout(function (self) {
							new Poppy($(self.popover.body).width() / 2, 13, _('JavaScript Blocker') +
									' has been deactivated. Please don\'t steal.');
						}, 1300, self);
					}
				});
			}
			
			this.set_theme(this.theme);
			this.examine._populate_cache();
			
			for (var kind in this.rules.data_types)
				this.rules.clear_temporary(kind);

			if (!this.rules.cache) this.rules.cache = this.rules.data_types;
			
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

JB.rules.__proto__ = JB;
JB.utils.__proto__ = JB;
JB.examine.__proto__ = JB;

var JavaScriptBlocker = JB;