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
						
						if(!(e = JB.popover.getElementById(str))) return false;
				
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
	_d = function () {
		console.log.apply(console, arguments);
		
		if (JB.isBeta) {
			var un = _$('.console-unread').show(),
					unc = parseInt(un.html(), 10);
					
			un.html(' ' + (unc + 1));
				
			_$('#jsconsolelogger').append('<li class="jsoutputcode unread">' + $.makeArray(arguments).join(' ') + '<div class="divider"></div></li>')
				.find('.divider').css('visibility', 'visible').filter(':last').css('visibility', 'hidden');
		}
	},
	JB = {
	tab: null,
	updating: !1,
	finding: !1,
	reloaded: !1,
	caches: {
		redirects: {},
		domain_parts: {},
		active_host: {},
		collapsed_domains: null,
		_jsblocker_sample: {
			href: 'http://sample.data.url/page.html',
			allowed: {
				script: {
					all: ['http://sample.data.url/script.js', 'http://sample.data.url/script_two.js'],
					unique: ['sample.data.url']
				},
				embed: { all: [], unique: [] },
				image: { all: [], unique: [] },
				frame: { all: [], unique: [] },
				special: { all: [], unique: [] }
			},
			blocked: {
				script: {
					all: ['http://sample.external.data.url/script.js', 'http://sample.external_two.data.url/script_two.js'],
					unique: ['sample.external.data.url', 'sample.external_two.data.url']
				},
				embed: { all: [], unique: [] },
				image: { all: [], unique: [] },
				frame: { all: [], unique: [] },
				special: { all: [], unique: [] }
			},
			unblocked: {
				script: {
					all: ['var sample = 1;'],
					unique: []
				},
				embed: { all: [], unique: [] },
				image: { all: [], unique: [] },
				frame: { all: [], unique: [] },
				special: { all: [], unique: [] }
			}
		},
		jsblocker: {}
	},
	commandKey: !1,
	speedMultiplier: 1,
	disabled: !1,
	frames: {},
	displayv: '2.6.5',
	bundleid: 85,
	update_attention_required: 75,
	beta_attention_required: 0,
	baseURL: 'http://lion.toggleable.com:160/jsblocker/',
	longURL: 'http://api.longurl.org/v2/expand?user-agent=ToggleableJavaScriptBlocker&title=1&format=json&url=',
	
	set_theme: function (theme) {
		_$('#main-large-style').attr('href', Settings.getItem('largeFont') ? 'css/main.large.css' : '');
		
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
		
		if (!Settings.getItem('donationVerified'))
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
		else
			new Poppy($(this.popover.body).width() / 2, 13, [
				'<p>',
					_('Updated JavaScript Blocker {1}', ['<a class="outside" href="http://javascript-blocker.toggleable.com/change-log/' + this.displayv.replace(/\./g, '') + '">' + this.displayv + '</a>']),
				'</p>'].join(''));
		
		this.installedBundle = this.bundleid;
		
		if (this.isBeta && this.beta_attention_required) this.utils.open_url('http://javascript-blocker.toggleable.com/change-log/beta');
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
		
		var load_language = (Settings.getItem('language') !== 'Automatic') ?
				Settings.getItem('language') : window.navigator.language;
	
		if (css)
			this.utils.zero_timeout(set_popover_css, [this, load_language, set_popover_css]);
		else if (load_language !== 'en-us' && !(load_language in Strings))
			$.getScript('i18n/' + load_language + '.js', function (data, status) { });
	},
	special_enabled: function (special) {
		if (!this.donationVerified) return false;
		var s = Settings.getItem('enable_special_' + special);
		return s === '0' ? 0 : s;
	},
	enabled: function (kind) {
		if (!this.donationVerified && kind !== 'script') return false;

		if (kind === 'special') {
			for (var item in Settings.settings.other)
				if (~item.indexOf('enable_special_') && this.special_enabled(item.substr('enable_special_'.length)))
					return true;

			return false;
		}
		
		return Settings.getItem('enable' + kind);
	},
		
	/**
	 * Removes frames that no longer exist.
	 * Removes any empty rules.
	 * Removes any collapsed domains that no longer exist.
	 *
	 * @this {JB}
	 */
	_cleanup: function () {
		var i, b, j, c, key, domain, e, new_collapsed = [], new_frames = {}, new_jsblocker = {};
		
		for (i = 0, b = safari.application.browserWindows.length; i < b; i++)
			for (j = 0, c = safari.application.browserWindows[i].tabs.length; j < c; j++) {
				if (this.frames[safari.application.browserWindows[i].tabs[j].url])
					new_frames[safari.application.browserWindows[i].tabs[j].url] = this.frames[safari.application.browserWindows[i].tabs[j].url];
				
				if (this.caches.jsblocker[safari.application.browserWindows[i].tabs[j].url])
					new_jsblocker[safari.application.browserWindows[i].tabs[j].url] = this.caches.jsblocker[safari.application.browserWindows[i].tabs[j].url];
			}
		
		this.caches.jsblocker = new_jsblocker;
		this.frames = new_frames;
		this.anonymous.newTab = {};
		this.anonymous.previous = {};
		
		this.caches.active_host = {};
		this.caches.domain_parts = {};
		
		function clean_emptyruleset (domain, r) {
			if ($.isEmptyObject(r[domain]))
				delete r[domain];
		}
		
		for (key in this.rules.data_types)
			for (domain in this.rules.rules[key])
				this.utils.zero_timeout(clean_emptyruleset, [domain, this.rules.rules[key]]);
		
		this.utils.zero_timeout(function (rules) {
			rules.save()
		}, [this.rules]);

		var xx = this.collapsedDomains();
		
		if (typeof xx === 'object')
			for (var x = 0; x < xx.length; x++)
				if (xx[x] === _('All Domains') || (xx[x] in this.rules.rules.script) || (xx[x] in this.rules.rules.frame) || (xx[x] in this.rules.rules.embed))
					if (!~new_collapsed.indexOf(xx[x]))
						new_collapsed.push(xx[x]);
			
		this.collapsedDomains(new_collapsed);
	},
	isBeta: 0,
 	get simpleMode() {
		return Settings.getItem('simpleMode');
	},
	set simpleMode(value) {
		Settings.setItem('simpleMode', value);
	},
	get saveAutomatic() {
		return Settings.getItem('saveAutomatic');
	},
	get setupDone() {
		return parseInt(Settings.getItem('setupDone'), 10);
	},
	set setupDone(value) {
		Settings.setItem('setupDone', value);
	},
	get useAnimations() {
		return Settings.getItem('animations');
	},
	set theme(value) {
		Settings.setItem('theme', value);
	},
	get theme() {
		return Settings.getItem('theme');
	},
	get busy() {
		return $(this.popover.body).hasClass('busy');
	},
	set busy(value) {
		$(this.popover.body).toggleClass('busy', value === 1);
	},
	get installedBundle() {
		var id = Settings.getItem('installedBundle'),
				id_fixed = id ? parseInt(id, 10) : null;
		
		if (id_fixed && id_fixed > 0) return id_fixed;
		
		id = window.localStorage.getItem('InstalledBundleID');
		
		return id ? parseInt(id, 10) : id_fixed || null;
	},
	set installedBundle(value) {
		if (value === this.bundleid) this.utils.attention(-1);
		Settings.setItem('installedBundle', value);
	},
	get donationVerified() {
		return !!Settings.getItem('donationVerified') || this.trial_active();
	},
	set donationVerified(value) {
		Settings.setItem('donationVerified', value);
	},
	get methodAllowed() {
		if (this.simpleMode) return true;
		return this.donationVerified;
	},
	get trialStart() {
		return Settings.getItem('trialStart');
	},
	set trialStart(v) {
		Settings.setItem('trialStart', v);
	},
	trial_active: function () {
		return (+new Date - JB.trialStart < 1000 * 60 * 60 * 24 * 10);
	},
	trial_remaining: function () {
		var seconds = ((JB.trialStart + 1000 * 60 * 60 * 24 * 10) - +new Date) / 1000,
				units = {
					days: 24 * 60 * 60,
					hours: 60 * 60,
					minutes: 60
				},
				ret = [], conv, unit;
		
		for (unit in units) {
			if (seconds / units[unit] >= 1) {
				conv = Math.floor(seconds / units[unit]);
				ret.push(conv);
				seconds -= conv * units[unit];
			} else
				ret.push(0);
		};

		return ret;
	},
	get host() {
		return this.active_host(_$('#page-list').val());
	},
	collapsed: function (k, v) {
		if (typeof v !== 'undefined') Settings.setItem(k + 'IsCollapsed', v ? 1 : 0);
		else return Settings.getItem(k + 'IsCollapsed') == '1';
	},
	collapsedDomains: function (v) {
		if (!v) {
			var t = Settings.getItem('CollapsedDomains');
			return $.isEmptyObject(t) ? [] : JSON.parse(t).d;
		}
		
		Settings.setItem('CollapsedDomains', JSON.stringify({ d: v }));
	},
	serial: {
		_key: '&^39jJNz-1==92*2"1--112@$49z++=san#(@nMMjdsamnxcvDFKDSJFO93(##(%#&!@#%%(((((((nnSDISI99292938(((((SNAKjk!!@@!#@#$43354334---==/;;;n0193A988&441!!@@#__[]]..s.>><?}[11--__==AZdzzZ24--dsj__*#90])-NA92jx,TseReniTy4211&6^%23(2222(0xn././z"po[1=__1dZs931S]"))"',
		_map: ['Q','H','M','F','W','Z','P','X','C','A'],
		validate: function (i) {
			var m = this._map,
					o = 0,
					s = this._key.split('').map(function (v) { return o += v.charCodeAt(0) * 42; }),
					i = parseInt(i.split('').map(function (v) {
						v = v.toUpperCase();
						return m.indexOf(v);
					}).join(''), 10);
			
			return i / o === parseInt(i / o, 10);
		}
	},
	utils: {
		floater: function (scroller, to_float, related, off) {
			var sc = _$(scroller), self = this, fb = sc.data('floater_bound') || [];

			if (~fb.indexOf(to_float)) return false;
			
			fb.push(to_float);
			
			sc.data('floater_bound', fb);
			sc.data('offset', sc.offset().top);

			sc.scroll({ scroller: sc, to_float: to_float, related: related, off: off }, function (event) {
				if (!Settings.getItem('floaters')) return false;
				
				var d = event.data,
						off = typeof d.off === 'function' ? d.off.call(JB) : 0,
						s = d.scroller, soff = s.data('offset') + off + 25, stop = s.scrollTop(),
						eoff = parseInt(s.css('marginTop')),
						every = $('*', s),
						all = $(d.to_float, s).css({ top: 'auto', left: 'auto', opacity: 1 }).width('auto'), behind;
				
				behind = all.filter('.floater').remove().end().filter(function () {
					var th = $(this);

					return th.offset().top <= soff;
				});
				
				var current_header = behind.filter(':last'),
						next_header = all.eq(all.index(current_header) + 1);
						
				if (!current_header.length || next_header.hasClass('floater')) return false;
													
				var id = 'clone-' + (current_header.attr('id') || +new Date),
						current_header_clone = current_header.clone(true, true).insertBefore(current_header).attr('id', id).addClass('floater-clone'),
						top = off,
						related_push = 0, next_push = 0;
										
				related = d.related ? d.related.call(JB, every.slice(every.index(current_header))) : [];
								
				if (related.length) {
					var ooo = off + related.offset().top - soff + related.outerHeight() + 3;

					if (ooo < current_header_clone.outerHeight(true) + soff - eoff) {
						top = ooo - current_header_clone.outerHeight(true) - soff + off + eoff;
						related_push = 1;
					}
				}
				
				if (next_header.length && !related_push) {
					var ooo = next_header.offset().top - soff - next_header.outerHeight() - current_header_clone.outerHeight(true) - parseInt(next_header.css('marginTop'));

					if (ooo < 0) {
						top += ooo;
						next_push = 1;
					}
				}
					
				current_header_clone.css({
					top: top + _$('#find-bar:visible').outerHeight(true),
					zIndex: 999 - off
				}).width(current_header.width()).addClass('floater').append('<div class="divider floater-divider"></div>');
				
				current_header.css('opacity', 0);
			});
		},
		fill: function (string, args) {
			for (var i = 0; args[i]; i++)
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
			var t = 0.5 * this.speedMultiplier, self = this, start_value, end_value, start_hide_zoom, end_hide_zoom, c;

			if (e.is(':animated') || e.data('isAnimating')) return false;
							
			e.data('isAnimating', true).addClass('zoom-window-animating');
			
			hide = hide || $('<div />');
			cb = cb || $.noop;
			
			hide.addClass('zoom-window-animating');
			
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
				}).one('webkitTransitionEnd', { e: e, s: start_value, h: hide, c: cb }, function (event) {
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
					
					d.e.removeClass('zoom-window-animating').css('webkitTransform', '');
					d.h.removeClass('zoom-window-animating').css('webkitTransform', '');
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
			if (!safari.application.activeBrowserWindow)
				safari.application.openBrowserWindow().activeTab.url = url;
			else
				safari.application.activeBrowserWindow.openTab().url = url;
			safari.extension.toolbarItems[0].popover.hide();
		},
		send_installid: function () {
			$.get('http://lion.toggleable.com:160/jsblocker/installed.php?id=' + Settings.getItem('installID'));
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
						'us.com', 'uk.com', 'eu.com', 'de.com', 'co.jp', 'com.au'];
						
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
			return { script: {}, frame: {}, embed: {}, video: {}, image: {}, special: {} };
		},
		_loaded: false,
		get rules() {
			if (this._loaded) return this._rules;
		
			this._loaded = true;
			
			var c = Settings.getItem('Rules');
			
			this._rules = c ? JSON.parse(c) : this.data_types;
			this._rules = $.extend(this.data_types, this._rules);
		
			return this._rules;
		},
		save: function () {
			this.utils.timer.timeout('save_rules', function (rules) {
				try {
					Settings.setItem('Rules', JSON.stringify(rules));
				} catch (e) { }
			}, 1000, [this.rules]);
		},
		export: function () {
			if (!this.donationVerified) return '';
		
			return JSON.stringify(this.rules);
		},
		import: function (string) {
			this._loaded = false;
			
			for (var kind in this.data_types)
				this.cache[kind] = {};
		
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

				Settings.setItem('Rules', s);
			
				return true;
			} catch (e) {
				return false;
			}
		},
		temporary_cleared: [],
		clear_temporary: function (kind) {
			if (~this.temporary_cleared.indexOf(kind)) return false;
		
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
			if (kind === 'frame') {
				var frame_host;
				
				for (var frame in this.frames) {
					frame_host = this.utils.active_host(frame);
					
					if ((new RegExp(this.utils.escape_regexp(frame_host) + '$')).test(d))
						delete this.frames[frame];
				}
			}
			
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
		special_allowed: function (special, url) {
			if (!this.donationVerified || !this.special_enabled(special)) return 1;
			
			var host = this.active_host(url),
					domains = this.for_domain('special', host), domain, rule, spec;
			
			for (domain in domains)
				for (spec in domains[domain])
					if ((new RegExp(spec)).test(special))
						return domains[domain][spec][0];
					
			return 0;
		},
		allowed: function (kind, message) {
			if ((kind !== 'script' && !this.donationVerified) || !this.enabled(kind)) return [1, -1];
				
			var rule_found = false, the_rule = -1,
					host = this.active_host(message[1]),
					domains = this.for_domain(kind, host), domain, rule,
					alwaysFrom = kind === 'script' ? Settings.getItem('alwaysBlock') : Settings.getItem('alwaysBlock' + kind) || Settings.getItem('alwaysBlock');
			
			domainFor:
			for (domain in domains) {
				ruleFor:
				for (rule in domains[domain]) {
					if (rule.length < 1 ||
							(Settings.getItem('ignoreBlacklist') && domains[domain][rule][0] === 4) ||
							(Settings.getItem('ignoreWhitelist') && domains[domain][rule][0] === 5)) continue;
					if ((new RegExp(rule)).test(message[2])) {
						rule_found = domains[domain][rule][0] < 0 ? true : domains[domain][rule][0] % 2;
						the_rule = domains[domain][rule][0];
						break domainFor;
					}
				}
			}
							
			if (typeof rule_found === 'number')
				return [rule_found, the_rule];
							
			if (alwaysFrom !== 'nowhere' && rule_found !== true) {
				var sproto = this.utils.active_protocol(message[2]),
						aproto = this.utils.active_protocol(message[1]);
				
				if (!(Settings.getItem('allowExtensions') && sproto === 'safari-extension')) {
					var page_parts = this.domain_parts(host),
							script_parts = this.domain_parts(this.active_host(message[2]));
							
					if (script_parts[0] === 'blank' && alwaysFrom !== 'everywhere') return [1, -1];
					
					if ((alwaysFrom === 'topLevel' && page_parts[0] !== script_parts[0]) ||
							(alwaysFrom === 'domain' && page_parts[page_parts.length - 2] !== script_parts[script_parts.length - 2]) ||
							(alwaysFrom === 'everywhere') ||
							(aproto === 'https' && (Settings.getItem('secureOnly') && sproto !== aproto))) {
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
					
						return [0, this.saveAutomatic && !this.simpleMode ? 2 : -1];
					}
				}
			}
	
			return [1, -1];
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
			if (~domain.indexOf('data.url')) return new Poppy();
			
			if (kind !== 'script' && !this.donationVerified) return false;
			if (pattern.length === 0) return this.remove(kind, domain, pattern, true);
						
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
							.find('.domain-name:last').data('domain', domain).data('kind', kind).attr('data-value', domain === '.*' ? _('All Domains') : domain)
							.attr('id', this.utils.id()).end().find('li:last ul');
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
								(Settings.getItem('ignoreBlacklist') && rtype === 4) ||
								(Settings.getItem('ignoreWhitelist') && rtype === 5)) continue;
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
				opt = '<option value="{0}">{1}</option>';
				
		if (kind !== 'script' && !this.donationVerified)
			return new Poppy(left, top + 8, _('Donation Required'));
		
		if (kind === 'special')
			a.push(this.utils.fill(opt, ['^' + one_script[0] + '$', _(one_script[0])]));
		else if (hostname === 'blank')
			a.push(this.utils.fill(opt, ['^about:blank$', 'blank']));
		else if (hostname === 'Data URI')
			a.push(this.utils.fill(opt, ['^data:.*$', 'Data URI']));
		else if (hostname === 'JavaScript Protocol')
			a.push(this.utils.fill(opt, ['^javascript:.*$', 'JavaScript Protocol']));
		else
			for (var x = 0; x < parts.length - 1; x++)
				a.push(this.utils.fill(opt, ['^' + proto + ':\\/\\/' + (x === 0 ? self.utils.escape_regexp(parts[x]) :
					'([^\\/]+\\.)?' + self.utils.escape_regexp(parts[x])) + '\\/.*$', (x > 0 ? '.' : '') + parts[x]]));
			
		new Poppy(left, top + 8, [
				'<p class="misc-info">', _('Adding a ' + kind.charAt(0).toUpperCase() + kind.substr(1) + ' Rule'), '</p>',
				'<p>',
					'<input id="domain-script-temporary" type="checkbox"', self.collapsed('LastRuleWasTemporary') ? ' checked' : '', ' />',
					'<label for="domain-script-temporary">&thinsp;', _('Temporary rule'), '</label> ',
				'</p>',
				'<p>',
					Template.create('tmpl_domain_picker', { page_parts: page_parts }),
				'</p>',
				'<p>',
					'<label for="domain-script" class="no-disclosure ', allow ? 'allowed-' : 'blocked-', 'label">', allow ? _('Allow') : _('Block'), ':</label> ',
					'<select id="domain-script" class="', proto, ' kind-', kind, a.length === 1 ? ' single' : '', '">', a.join(''), '</select> ',
					'<input id="domain-script-continue" type="button" value="', _('Save'), '" />',
				'</p>'].join(''), function () {
					_$('#domain-script-continue').click(function () {
						var	h = _$('#domain-picker').val(),
								temp = _$('#domain-script-temporary').is(':checked');
						
						self.rules.add(kind, h, _$('#domain-script').val(), allow ? 1 : 0, true, temp);
							
						safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');

						_$('#page-list')[0].selectedIndex = 0;
					})
		});
	},
	bind_events: function(some, host) {
		var add_rule, remove_rule, self = this;
		
		if (Settings.getItem('showUnblocked'))
			_$('#unblocked-script-urls').show().prev().show();
		else
			_$('#unblocked-script-urls').hide().prev().hide();
			
		var ver = Settings.getItem('donationVerified');
		
		_$('#unlock-p').toggleClass('hidden', (ver === 1 || (typeof ver === 'string' && ver.length)));
		
		function url_display (e) {
			var me = $(this), t = $(this).siblings('span:first'), pa = t.parent(), off = t.offset(), kind = pa.data('kind'),
					kindP = kind.charAt(0).toUpperCase() + kind.substr(1), left = Math.floor(me.offset().left + me.outerWidth() / 2);
		
			function codeify(data) {
				function do_highlight (data, no_zoom) {
					_$('#misc-content pre').remove();
					
					$('<pre></pre>').append('<code class="javascript"></code>').find('code').text(data).end().appendTo(_$('#misc-content'));
					if (!no_zoom) self.utils.zoom(_$('#misc').find('.misc-header').text(t.text()).end(), _$('#main'));
					var p = _$('#misc-content pre code');
					p.data('unhighlighted', p.html());
					self.hljs.highlightBlock(p[0]);
				}
				
				_$('#beautify-script').remove();
				
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
				var host = encodeURI(self.simpleMode ? t.text() : self.utils.active_host(t.text()));
				
				new Poppy(left, off.top + 6, [
					'<p class="misc-info">', _('Safety Information for {1}', [host]), '</p>',
					'<p><a class="outside" href="https://www.mywot.com/en/scorecard/', host, '">WOT Scorecard</a></p>',
					'<div class="divider" style="margin-bottom: 2px;margin-top: 3px;"></div>',
					'<p><a class="outside" href="http://www.google.com/safebrowsing/diagnostic?site=', encodeURI(host), '">Google Safe Browsing Diagnostic</a></p>',
					'<div class="divider" style="margin-bottom: 3px;margin-top: 3px;"></div>',
					'<p><a class="outside" href="https://www.siteadvisor.com/sites/', encodeURI(host), '">McAfee SiteAdvisor&reg;</a></p>'
					].join(''));
			}
			
			if (kind === 'special') {
				var wh = t.parents('.urls-wrapper').is('#blocked-script-urls') ? 0 : 1,
						sp = t.parent().data('script')[0];
				new Poppy(left, off.top + 6, _(sp+ ':' + wh, [self.special_enabled(sp)]));
			} else if (self.simpleMode && !pa.hasClass('by-rule'))
				script_info();
			else 
				new Poppy(left, off.top + 6, [
					'<input type="button" value="', _('More Info'), '" id="script-info" /> ',
					self.simpleMode || kind === 'embed' ? '' : '<input type="button" value="' + _('View ' + kindP + ' Source') + '" id="view-script" /> ',
					pa.hasClass('by-rule') ? '<input type="button" value="' + _('Show Matched Rules') + '" id="matched-rules" />' : ''].join(''), function () {
						_$('#poppy #script-info').click(script_info);
						_$('#poppy #matched-rules').click(function () {
							var m = !me.parents('div').attr('id').match(/blocked/), rs = [],
									to_delete = self.rules.remove_matching_URL(pa.data('kind'), self.host, pa.data('script'), false, m), d,
									rs = [],
									con = $('<div />'),
									wrapper = $('<ul class="rules-wrapper" />').appendTo(con);
							
							con.prepend('<p class="misc-info">' + _('Matched ' + me.parents('.main-wrapper').attr('id').substr(14) + ' Rules') + '</p>');

							for (d in to_delete) {
								wrapper.append(self.rules.view(pa.data('kind'), d, pa.data('script'), true).find('> li').find('input').remove().end());

								rs.push(to_delete[d][0]);
							}

							$('li.domain-name', wrapper).removeClass('hidden').addClass('no-disclosure');

							new Poppy(left, off.top + 6, con);
						});
						_$('#poppy #view-script').click(function () {
							if (kind === 'image') {
								new Poppy();
								_$('#beautify-script').remove();
								_$('#misc-content').html('<img src="' + t.html() + '" />');
								self.utils.zoom(_$('#misc').find('.misc-header').text(t.text()).end(), _$('#main'));
								return false;
							}
							
							if (/^data/.test(t.text())) {
								var dd = t.text().match(/^data:(([^;]+);)?([^,]+),(.+)/), mime = ['text/javascript', 'text/html', 'text/plain'];

								if (dd && dd[4] && ((dd[2] && ~mime.indexOf(dd[2].toLowerCase())) ||
										(dd[3] && ~mime.indexOf(dd[3].toLowerCase())))) {
									codeify(unescape(dd[4]));
									new Poppy();
								} else
									new Poppy(left, off.top + 6, '<p>' + _('This data URI cannot be displayed.') + '</p>');
							} else {
								new Poppy(left, off.top + 6, '<p>' + _('Loading ' + kind) + '</p>', $.noop, function () {
									try {
										$.ajax({
											dataType: 'text',
											url: t.text(),
											success: function (data) {
												codeify(data);
												new Poppy();
											},
											error: function (req) {
												new Poppy(left, off.top + 6, '<p>' + req.statusText + '</p>');
											}
										});
									} catch (er) {
										new Poppy(left, off.top + 6, '<p>' + er + '</p>');
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
				li.animate({
					top: li.height() - parseInt(li.css('marginTop')),
					right: -li.outerWidth(),
					opacity: 0,
					padding: 0,
					marginTop: -li.height()
				}, 200 * self.speedMultiplier, function () {
					$(this).remove();
					
					$('.divider:last', parent).css('visibility', 'hidden');
					
					if ($('li', parent).length === 0) {
						parent.parent().prev().remove();
						parent.parent().remove();
					}
					
					_$('#domain-filter').trigger('search');
				});
			}
		});
		
		$(this.popover).on('click', 'ul.rules-wrapper li:not(.domain-name) span:not(.nodbl)', function (e) {
			var t = $(this), off = t.offset(), domain = t.parent().data('domain'), rule = t.parent().data('rule');
			
			new Poppy(e.pageX, off.top + 2, [t.hasClass('type-4') || t.hasClass('type-5') ?
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
					padd.save_orig = padd.save;
					padd.save = function () {
						var kind = padd.me.li.data('kind'), v;
						
						if (!is_new) padd.main.rules.remove(kind, padd.me.domain, rule);
						v = padd.save_orig.call(this, true);
						if (!is_new) {
							t.text(this.val()).removeClass('type-0 type-1 type-2 type--2 type-4 type-5 type-6 type-7 temporary').addClass('type-' + v).toggleClass('temporary', _$('#rule-temporary').is(':checked'))
									.siblings('input').val(_('Delete')).parent().data('rule', this.val()).data('type', v);
							new Poppy(e.pageX, off.top + 2, '<p>' + _('Rule succesfully edited.') + '</p>', $.noop, $.noop, 0.2);
						} else {
							new Poppy(e.pageX, off.top + 2,
									'<p>' + _('Rule succesfully added for {1}', [(padd.me.domain === '.*' ? _('All Domains') : padd.me.domain)]) + '</p>' +
									'<p>' + _('Changes will appear when you reload the rules list.') + '</p>');
						}
					};
					new Poppy(e.pageX, off.top + 2, padd);
				});
			});
		});
		
		$(this.popover).on('click', 'ul .domain-name', function () {
			if (this.className.match(/no\-disclosure/)) return false;
			
			var me = $(this), d = me.data('domain'), t = me.next(), x;
			
			if (d === '.*') d = _('All Domains');
						
			if (me.hasClass('floater')) {
				t = t.next();
				x = me.next();
			} else
				x = $('<div />');
				
			var ul = $('ul', t);
			
			if (ul.is(':animated')) return false;
			
			me.toggleClass('hidden');
			x.toggleClass('hidden');
			
			t.css('display', 'block');
			
			if (me.hasClass('floater') && !hid)
				x.css('opacity', 1).prev().remove();
			
			var c = self.collapsedDomains(),
					dex = c.indexOf(d),
					rulesList = _$('#rules-list'),
					hid = !me.hasClass('hidden'),
					o = t.outerHeight(true),
					h = t.height(),
					height;
										
			ul.css({ marginTop: hid ? -o : 0 }).animate({
				marginTop: hid ? 0 : -o
			}, {
				duration: 200 * self.speedMultiplier,
				complete: function () {
					if (!me.hasClass('hidden')) {
						if (dex > -1) c.splice(dex, 1);
					} else {
						if (dex === -1) c.push(d);
					}
				
					t.css('display', '');
					ul.css({ marginTop: 0 });
				
					self.collapsedDomains(c);
		
					rulesList.trigger('scroll');
				},
				step: function () {
					rulesList.trigger('scroll');
				}
			});
						
			if (!this.className.match(/hidden/)) {
				var offset = t.offset(),
					bottomView = offset.top + h - _$('header').height();
				
				if (bottomView > rulesList.height())
					rulesList.animate({
						scrollTop: rulesList.scrollTop() + bottomView - rulesList.height(),
					}, 200 * self.speedMultiplier);
			}
		});

		$(this.popover).on('click', '#allowed-script-urls ul li span', function (e) {
			if (self.disabled) return false;
			
			var butt = this,
				li = $(this).parent(),
				off = $(this).offset(),
				left = e.pageX,
				url = li.data('url'),
				script = li.data('script');
		
			if (self.simpleMode || $(butt).parent().data('kind') === 'special') return self.add_rule_host($(butt), script, e.pageX, off.top, !$(this).parents('#allowed-script-urls').length);
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
		
		$(this.popover).on('click', '#allowed-script-urls ul li .info-link',  url_display);

		$(this.popover).on('click', '#blocked-script-urls ul li span', function (e) {
			if (self.disabled) return false;
			
			var me = $(this),
					li = me.parent(),
					m = !me.parents('div').attr('id').match(/blocked/),
					off = me.offset(),
					left = e.pageX,
					url = li.data('script');
			
			if (self.simpleMode || me.parent().data('kind') === 'special') return self.add_rule_host(me, url, e.pageX, off.top, !$(this).parents('#allowed-script-urls').length);
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
			
			var newHigh = function () {
				var url = me.parent().data('script')[0],
						page_parts = self.utils.domain_parts(self.host),
						padd = self.poppies.add_rule.call({
							url: '^' + self.utils.escape_regexp(url) + '$',
							li: me.parent(),
							domain: self.host,
							header: _('Adding a Rule For {1}', [Template.create('tmpl_domain_picker', { page_parts: page_parts, no_label: true })])
						}, self);
				
				padd.callback2 = function () {
					_$('#select-type-allow').click();
				};
				
				new Poppy(left, off.top + 8, padd);
			};
			
			if (rs.length === 0) {
				new Poppy();
				newHigh();
			} else
				new Poppy(left, off.top + 8, vs, function () {
					_$('#poppy #delete-continue').click(function () {
						self.rules.remove_matching_URL(li.data('kind'), self.host, url, true, m);
						safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
						_$('#page-list')[0].selectedIndex = 0;
						new Poppy();
					}).siblings('#new-rule').click(newHigh);
				});
		});
		
		$(this.popover).on('click', '#blocked-script-urls ul li .info-link', url_display);
	
		$(this.popover).on('click', '#unblocked-script-urls ul li span', function() {
			var t = $(this).text();
			
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
				marginTop: mM + '=' + h
			}, {
				duration: 200 * self.speedMultiplier,
				easing: 'linear',
				step: function () {
					$(this).trigger('scroll');
				}
			});
			
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
					var b = _$('#find-bar #find-bar-search').focus().trigger('search');
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
				}, 210 * self.speedMultiplier, [b, s]);
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
					offset = _$('header:first').outerHeight() + _$('#find-bar').outerHeight(),
					end_find = function (self, visible) {
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
									self.utils.zero_timeout(function (visible, self, ss, offset, matches, end_find) {
										nOne = ss.offset().top + visible[0].scrollTop;
							
										dOne = visible[0].scrollHeight;
							
										dTwo = visible.outerHeight();
										nTwo = dTwo * (nOne / dOne);
							
										self.utils.zero_timeout(function (self, nTwo, offset) {
											$('<div class="find-scroll" />').appendTo(self.popover.body).css({
												top: Math.round(nTwo + offset) - 2
											});
										}, [self, nTwo, offset]);
									
										self.utils.timer.timeout('end_find', end_find, 100, [self, visible]);
									}, [visible, self, $(this), offset, matches, end_find]);
								}
							});
						}
					}, [self, this, self.utils.escape_regexp(s)]);
					
					self.utils.zero_timeout(function (index, matches, end_find, self, visible) {
						if (index === x.length - 1 && matches === 0)
							self.utils.timer.timeout('end_find', end_find, 100, [self, visible]);
					}, [index, matches, end_find, self, visible]);
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
					if (!Settings.getItem('enable' + kind)) continue;
				
					var ki = kind.charAt(0).toUpperCase() + kind.substr(1) + 's';
			
					kinds.push(['<input class="ba-kind" id="ba-kind-', kind, '" type="checkbox" ', (!self.collapsed(kind + 'Unchecked') ? 'checked' : ''), ' />',
							'<label for="ba-kind-', kind, '">&nbsp;', _(ki), '</label>'].join(''));
				}
			
			new Poppy(off.left + $(this).outerWidth() / 2, off.top + 8, [
					'<p class="misc-info">', this.value, '</p>',
					'<p>',
						'<input id="domain-script-temporary" type="checkbox"', self.collapsed('LastRuleWasTemporary') ? ' checked' : '', ' />',
						'<label for="domain-script-temporary">&nbsp;', _('Temporary rule'), '</label> ',
					'</p>',
					'<p>',
						kinds.join('<br />'),
					'</p>',
					'<p>',
						Template.create('tmpl_domain_picker', { page_parts: page_parts, no_all: true }),
						' <input id="domain-script-continue" type="button" value="', _('Save'), '" />',
					'</p>'].join(''), function () {
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
							_$('#page-list')[0].selectedIndex = 0;
						});
					});
		});
		
		_$('#disable').click(function () {
			if (!self.methodAllowed || (!self.disabled && !self.utils.confirm_click(this))) return false;
		
			self.disabled = !self.disabled;
			
			_$('body').toggleClass('disabled', self.disabled);
			
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
				'<p class="misc-info">', _('Active Temporary Rules'), '</p>',
				'<input type="button" value="', _('Make Permanent'), '" id="rules-make-perm" /> ',
				'<input type="button" value="', _('Revoke'), '" id="rules-remove-temp" /> ',
				'<input type="button" value="', _('Show'), '" id="rules-show-temp" />',
				'<div class="divider" style="margin:7px 0 6px;"></div>',
				'<input type="button" value="', _('Show All'), '" id="view-all" /> ',
				'<input type="button" value="', _('Show Active'), '" id="view-domain" /> ',
				self.donationVerified ? ['<input type="button" value="', _('Backup'), '" id="rules-backup" />'].join('') : ''].join(''), function () {
				_$('#view-domain').click(function () {
					self.busy = 1;
					
					var parts = self.domain_parts(self.active_host(_$('#page-list').val())),
							x = parts.slice(0, 1),
							y = parts.slice(1);

					x.push(x[0]);

					parts = x.concat(y);
					parts = parts.slice(0, -1);
						
					_$('#view-all').click();
					
					_$('#domain-filter').val('^' + parts.join('$|^.') + '|^' + _('All Domains') + '$').data('parts', parts);
				}).siblings('#view-all').click(function (event) {
					_$('#filter-state-all').click();
					
					self.busy = 1;
					
					_$('#edit-domains').removeClass('edit-mode').html(_('Edit'));
					
					var domain, i = 0, filter = _$('#domain-filter'), rs = [];
					
					if ('srcElement' in event)
						filter.val('').data('parts', []);
					
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
								ul = _$('#rules-list #data ul#rules-list-' + key + 's').empty().css({ marginTop: '-3px', marginBottom: '6px', opacity: 1 });

						for (domain in s)
							self.utils.zero_timeout(appendrules, [ul, domain, self, key]);
					}
					
					function remove_domain (event) {
						event.stopPropagation();
						
						var li = $(this.parentNode), d = li.data('domain');
						
						if (!self.utils.confirm_click(this) || li.is(':animated')) return false;
																			
						self.rules.remove_domain(li.data('kind'), d);
						
						li.animate({
							right: -li.outerWidth(),
							padding: 0,
							top: li.height() - parseInt(li.css('marginTop'), 10),
							marginTop: -li.outerHeight(true),
							marginBottom: 0,
							opacity: 0
						}, 200 * self.speedMultiplier, function () {
							$(this).next().remove();
							$(this).remove()
							_$('#domain-filter').trigger('search');
						});
						
					}
						
					self.utils.zero_timeout(function (ul) {
						_$('.rules-wrapper .domain-name').prepend('<div class="divider"></div><input type="button" value="' + _('Remove') + '" />')
								.find('input').click(remove_domain);
					}, [ul]);
					
					self.utils.zero_timeout(function (self) {
						self.utils.zero_timeout(function (self) {
							self.busy = 0;
							var l = _$('#rules-list');
							if (!l.is(':visible')) {
								self.utils.zoom(l, _$('#main'));
								
								self.utils.zero_timeout(function (self) {
									var parts = _$('#domain-filter').trigger('search').data('parts');
																	
									for (var i = 0; i < parts.length; i++)
										_$('.domain-name[data-value="' + (i > 0 ? '.' : '') + parts[i] + '"].hidden').click();
								}, [self]);
							}
						}, [self]);
					}, [self]);
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
					
					if (this.id === 'rules-remove-temp') {
						safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
						_$('#page-list')[0].selectedIndex = 0;
					} else
						new Poppy();
				}).siblings('#rules-show-temp').click(function () {
					_$('#view-domain').click();
					_$('#filter-temporary').click();
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
				});
			});
		});

		_$('#rules-list #rules-list-back').click(function () {
			if (_$('#rules-list').hasClass('zoom-window-open'))
				self.utils.zoom(_$('#rules-list'), _$('#main'), function () {
					_$('#rules-list #data ul.rules-wrapper').empty();
				});
		});
		
		_$('#misc-close').click(function() {
			if (_$('#misc').hasClass('zoom-window-open'))
				self.utils.zoom(_$('#misc'), _$('#main'), function () {
					_$('#misc-content, p.misc-header').html('');
				});
		});
		
		_$('.allowed-label, .blocked-label, .unblocked-label').click(function () {
			var $this = $(this), which = this.className.substr(0, this.className.indexOf('-')), e = _$('#' + which + '-script-urls .urls-inner');
			
			if (e.is(':animated')) return false;

			if ($this.hasClass('hidden')) {
				self.collapsed(which, 0);
				
				$this.removeClass('hidden');
								
				e.show().css('marginTop', -e.height()).animate({
					marginTop: 0
				}, {
					duration: 200 * self.speedMultiplier,
					complete: function () {
						$('.kind-header', e).addClass('visible');
					},
					step: function () {
						self.utils.zero_timeout(function () {
							_$('#main').trigger('scroll');
						});
					}
				}).removeClass('was-hidden');
			} else {
				self.collapsed(which, 1);
				
				$this.addClass('hidden');
				$('.kind-header', e).removeClass('visible').css('opacity', 1).filter('.floater').remove();
								
				e.css('marginTop', 0).animate({
					marginTop: -e.height()
				}, {
					duration: 200 * self.speedMultiplier,
					complete: function () {
						e.hide();
					},
					step: function () {
						self.utils.zero_timeout(function () {
							_$('#main').trigger('scroll');
						});
					}
				}).addClass('was-hidden');
			}
						
			if ($(this).parent().hasClass('floater')) $(this).parent().next().find('label').toggleClass('hidden');
			
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
			
			_$('#rules-list .rules-wrapper').each(function () {
				$('.domain-name:visible .divider', this).css('visibility', 'visible').filter(':visible:first').css('visibility', 'hidden');
			});
		}).siblings('#reinstall-pre').click(function () {
			var off = $(this).offset();
			
			for (var key in self.rules.data_types)
				self.rules.reinstall_predefined(key);
			new Poppy(off.left + $(this).width() / 2, off.top, '<p>' + _('Whitelist and blacklist rules have been reinstalled.') + '</p>');
		});
		
		_$('#make-temp-perm').click(function () {
			var off = $(this).offset();
						
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
				l.find('span.temporary').removeClass('temporary type-2').addClass('type-1').siblings('input').click().click();

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

			switch (this.value) {
				case 'reset-all-settings':
					var t = self.trialStart;
					safari.extension.settings.clear();
					self.trialStart = t;
					safari.extension.toolbarItems[0].popover.contentWindow.location.reload();
					return false;
				break;
			}
			
			try {
				v = new RegExp(this.value, 'i');
			} catch (e) {
				v = /.*/;
			}
						
			d.each(function () {
				$(this.parentNode).toggleClass('not-included', !v.test(this.innerHTML));
			});
			
			for (var key in self.rules.data_types) {
				var head = _$('#head-' + key + '-rules').show(), rs = _$('#rules-list-' + key + 's'), wrap = rs.parent().show(),
						a = self.collapsed(rs.attr('id'));
				
				if (a) head.find('a').html(_('Show'));
				
				if (!self.enabled(key) || !rs.find('.domain-name:visible').length) {
					head.hide();
					wrap.hide();
				}
				
				rs.css({ opacity: a ? 0 : 1, marginBottom: a ? 0 : '6px', marginTop: a ? -(rs.outerHeight() * 2) : -3 }).toggleClass('visible', !a);
			}
			
			var d = _$('#rules-list .domain-name:visible').length,
				r = _$('#rules-list .domain-name:visible + li > ul li span.rule:not(.hidden)').length;
						
			counter(self);
			
			_$('#rules-list .rules-wrapper').each(function () {
				$('.domain-name:visible .divider', this).css('visibility', 'visible').filter(':visible:first').css('visibility', 'hidden');
			});
		});
		
		_$('#rules-filter-bar #filter-type-collapse li').not('.label').click(function () {
			self.busy = 1;
			
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
				
				self.utils.zero_timeout(function (self) {
					self.busy = 0;

					_$('#rules-list .rules-header').each(function () {
						var kind = this.id.substring(5, this.id.indexOf('-', 5));

						if (!_$('#rules-list-' + kind + 's .domain-name:visible').length) $(this).hide();
						else $(this).show();
					});

					_$('#domain-filter').trigger('search');

					self.utils.zero_timeout(counter, [self]);
				}, [self]);
			}, [self, this]);
		});
		
		_$('#rules-filter-bar #filter-type-state li:not(.filter-divider)').not('.label').click(function () {
			self.busy = 1;
			
			var that = this;
			
			$(this).siblings('li').removeClass('selected').end().addClass('selected');
			
			var fix_dividers = function (self, that) {
				_$('#rules-list .rules-wrapper').each(function () {
					var d = $('ul li .divider', this).css('visibility', 'visible').parent().parent();

					if (that.id === 'filter-state-all')
						d.find('.divider:last').css('visibility', 'hidden');
					else
						d.find('li:not(.none) .divider:last').css('visibility', 'hidden');
				});
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
			
			self.utils.zero_timeout(function (self) {
				self.busy = 0;
				
				_$('#rules-list .rules-header').each(function () {
					var kind = this.id.substring(5, this.id.indexOf('-', 5));

					if (!_$('#rules-list-' + kind + 's .domain-name:visible').length) $(this).hide();
					else $(this).show();
				});
				
				_$('#domain-filter').trigger('search');
				
				self.utils.zero_timeout(counter, [self]);
			}, [self]);
		});
		
		$(this.popover).on('click', 'a.outside', function (e) {
			e.preventDefault();
			self.utils.open_url(this.href);
		});
		
		_$('#unlock').click(function () {
			var o = $(this).offset(), l = o.left + $(this).outerWidth() / 2, t = o.top + 8;
			
			if (self.donationVerified && !self.trial_active()) return new Poppy(l, t, _('All features are already unlocked.'));
			
			var pop = self.poppies.verify_donation.call([l, t, 0], self);
			
			new Poppy(l, t, pop);
		});
		
		_$('#js-help').click(function () {
			if (self.isBeta)
				self.utils.open_url('http://javascript-blocker.toggleable.com/change-log/beta');
			else
				self.utils.open_url('http://javascript-blocker.toggleable.com/help');
		}).siblings('#js-settings').click(function () {
			safari.extension.toolbarItems[0].popover.hide();

			if (safari.application.activeBrowserWindow.activeTab)
				safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('openSettings', safari.extension.baseURI + 'settings.html');
			else
				self.utils.open_url(safari.extension.baseURI + 'settings.html');
		});

		$(this.popover).on('click', '.toggle-rules', function () {
			var e = $(this).parent().nextAll('.rules-list-container:first').find('.rules-wrapper'),
					a = e.css('opacity') === '1',
					o = e.outerHeight(), oT = e.outerHeight(true);
										
			if (e.is(':animated')) return false;
										
			this.innerHTML = a ? _('Show') : _('Hide');
			
			if ($(this).parent().hasClass('floater')) $(this).parent().next().find('a').html(this.innerHTML);
					
			self.collapsed(e.attr('id'), a);
			
			e.find('li.domain-name:not(.floater)').toggleClass('header-hidden', a);
								
			e.css({ opacity: 1, marginTop: !a ? -o : -3 }).animate({
				marginTop: a ? -oT : -3,
				marginBottom: a ? 0 : '6px'
			}, {
				duration: 200 * self.speedMultiplier,
				complete: function () {
					this.style.opacity = a ? 0 : 1;
					this.style.marginTop = a ? -(oT * 2) + 'px' : -3;
				
					$(this).toggleClass('visible', !a);
					
					_$('#rules-list').trigger('scroll');
				},
				step: function (now) {
					_$('#rules-list').trigger('scroll');
				}
			});
		});
		
		$(this.popover).on('click', 'a.toggle-main', function (event) {
			var me = $(this),
					head = me.parent(),
					pos = me.hasClass('floater') ? me.next().attr('id') : this.id,
					e = me.parent().next().find('.main-wrapper');
			
			if (!e.length) e = me.parent().next().next().find('.main-wrapper');
			
			var o = e.outerHeight(), oT = e.outerHeight(true), a = e.css('opacity') === '1';
						
			if (e.is(':animated')) return false;
					
			this.innerHTML = a ? _('Show') : _('Hide');
						
			if (head.hasClass('floater')) head.next().find('a').html(this.innerHTML);
							
			self.collapsed(pos, a);
			
			if (!a) head.removeClass('collapsed');
			
			head.css('marginBottom', !a ? 3 : -3).animate({
				marginBottom: a ? 3 : -3
			}, 200 * self.speedMultiplier);

			e.css({ opacity: 1, marginTop: !a ? -o : 0 }).animate({
				marginTop: a ? -oT : 0
			}, {
				duration: 200 * self.speedMultiplier,
				complete: function () {
					this.style.opacity = a ? 0 : 1;
					this.style.marginTop = a ? -(oT * 2) + 'px' : 0;
				
					$(this).parent().prev().toggleClass('collapsed', a).css('opacity', 1);
					
					_$('#main').trigger('scroll');
				},
				step: function () {
					_$('#main').trigger('scroll');
				}
			});
		});
		
		_$('#page-lists-label').dblclick(function () {
			var l = $.extend({}, window.localStorage);
			delete l.Rules;
			delete l.CollapsedDomains;
			
			var e = $.extend({}, safari.extension.settings);
			delete e.Rules;
			delete e.CollapsedDomains;
			e.donationVerified = !!e.donationVerified;
			
			new Poppy($(self.popover.body).width() / 2, 13, [
				'<p>This data contains a copy of your settings and current webpage. It does NOT reveal your rules.</p>',
				'<textarea id="debug-info" readonly>',
					'Version', "\n", self.displayv, '-', self.bundleid, "\n\n",
					'Beta', "\n", self.isBeta, "\n\n",
					'Trial Start', "\n", self.trialStart, "\n\n",
					'Trial Remaining', "\n", self.trial_remaining(), "\n\n",
					'Trial Active', "\n", self.trial_active(), "\n\n",
					'User Agent', "\n", window.navigator.userAgent, "\n\n",
					'window.localStorage', "\n", JSON.stringify(l), "\n\n", 
					'Settings', "\n", JSON.stringify(e), "\n\n",
					'Webpage', "\n", safari.application.activeBrowserWindow.activeTab.url,
				'</textarea>'
			].join(''), function () {
				var t = _$('#debug-info')[0];
				t.selectionStart = 0;
				t.selectionEnd = t.innerHTML.length;
			});
		});
		
		_$('#next-frame, #previous-frame').click(function () {
			var page = _$('#page-list'), index = page[0].selectedIndex, max = $('option', page).length - 1;
			
			if (this.id === 'next-frame') {
				if (index < max)
					page[0].selectedIndex++;
			} else {
				if (index > 0)
					page[0].selectedIndex--;
			}
			
			page.trigger('change');
		});
				
		if (this.isBeta) {
			_$('header.main-header').dblclick(function () {
				new Poppy($(self.popover.body).width() / 2, 13, [
					'<ul id="jsoutput"></ul>',
					'<input id="clear-console" value="Clear" type="button" /> ',
					'<input id="mimic-upgrade" value="Mimic Upgrade From 84" type="button" />'
				].join(''), function () {
					var l = _$('#jsconsolelogger'), ol = _$('#jsoutput').html(l.hide().html());
					
					l.find('.unread').removeClass('unread');
					
					_$('.console-unread').html(' 0').hide();
					
					_$('#poppy-content').scrollTop(9999999999999);
					
					_$('#clear-console').click(function () {
						$('li:not(#console-header)', l).remove();
						_$('header.main-header').trigger('dblclick');
					}).siblings('#mimic-upgrade').click(function () {
						JB.installedBundle = 84;
						safari.extension.toolbarItems[0].popover.contentWindow.location.reload();
					});
				});
			});
		}
	},
	
	/**
	 * Creates the list of rules in the main window
	 *
	 * @param {string} text One of: blocked, allowed, or unblocked.
	 * @param {string} button Text to appear on the button to create or delete a rule
	 * @param {Object} jsblocker Information about scripts allowed, blocked, or unblocked and frames.
	 */
	make_list: function (text, button, jsblocker) {
		var self = this, el = _$('#' + text + '-script-urls .urls-inner'), use_url, test_url, protocol, poopy,
				shost_list = {}, lab = _$('#' + text + '-scripts-count'), cn = 0;

		for (var key in this.rules.data_types)
			shost_list[key] = { 'http': {}, 'https': {}, 'file': {}, 'safari-extension': {}, 'data': {}, 'javascript': {}, 'about': {} };
			
		function append_url(index, kind, ul, use_url, script, type, button, protocol) {
			return ul.append('<li>' + (text !== 'unblocked' ? '<div class="info-link">?</div>' : '') + '<span></span> <small></small><div class="divider"></div></li>').find('li:last')
					.attr('id', text.toLowerCase() + '-' + kind + '-' + index)
					.data('url', use_url).data('script', [script]).data('kind', kind).addClass('visible kind-' + kind)
					.toggleClass('by-rule', type > -1).toggleClass('rule-type-' + type, type > -1).find('span')
					.text(use_url).addClass(protocol).parent();
		}
		
		function add_item(index, kind, the_item) {
			var item = the_item[0];

			if (text !== 'unblocked' && self.simpleMode) {
				use_url = self.utils.active_host(item);
				protocol = self.utils.active_protocol(item);

				test_url = use_url + the_item[1];
									
				if (!(test_url in shost_list[kind][protocol])) {
					li = append_url(index, kind, ul, use_url, item, the_item[1], button, protocol);
					shost_list[kind][protocol][test_url] = [1, li.attr('id')];
				} else {
					shost_list[kind][protocol][test_url][0]++;
					
					try {
						$('li#' + shost_list[kind][protocol][test_url][1], ul).data('script').push(item);
					} catch (e) {
						return self.make_list(text, button, jsblocker);
					}
				}
			} else
				li = append_url(index, kind, ul, item, item, the_item[1], button);
			
			return li;
		}

		if (self.simpleMode && text !== 'unblocked') {
			cn = 0;
			
			for (var kind in jsblocker[text])
				if (self.enabled(kind))
					cn += jsblocker[text][kind].unique.length;
				
			lab.html(cn);
		} else {
			cn = 0;
			
			for (var kind in jsblocker[text])
				if (kind !== 'special' && self.enabled(kind))
					cn += jsblocker[text][kind].all.length;

			lab.html(cn);
		}
			
		for (var key in this.rules.data_types) {
			if (!this.enabled(key)) continue;
			
			var ki = _(key.charAt(0).toUpperCase() + key.substr(1) + 's'),
					do_hide = this.collapsed('toggle-' + key + '-' + text + '-items'),
					ul = _$('#' + text + '-items-' + key),
					li, ccheck, show_me = $('<div />');
			
			if (!ul.length)
				ul = $(Template.create('tmpl_main_wrapper', {
					local: ki,
					which: text,
					kind: key
				})).appendTo(el).filter('div').find('ul');
			
			ul.parent().prev().toggleClass('collapsed', do_hide).toggleClass('visible', !do_hide).find('.toggle-main').html(_(do_hide ? 'Show' : 'Hide'));;
			
			if (jsblocker[text][key].all.length) {
				ul.parent().prev().show();
				ul.parent().show();
					
				for (var i = 0, b = jsblocker[text][key].all.length; i < b; i++) {
					if (key === 'special' && !this.special_enabled(jsblocker[text][key].all[i])) continue;
					
					li = key === 'special' ? append_url(i, key, ul, _(jsblocker[text][key].all[i]), jsblocker[text][key].all[i], -1, button, key) :
							add_item(i, key, jsblocker[text][key].all[i]);
					ccheck = $('li:not(.show-me-more).kind-' + key, ul).length;
									
					if (ccheck > Settings.getItem('sourceCount')) {
						if (!$('.show-me-more', ul).length)
							show_me = $(['<li class="show-me-more visible kind-', key, '">',
									'<a href="javascript:void(1)" class="show-more"></a>',
									'<div class="divider" style="visibility:hidden;"></div>',
								'</li>'].join('')).insertBefore(li);
						
						li.addClass('show-more-hidden');
					}
				}
				
				if (ccheck - Settings.getItem('sourceCount') > 1)
					show_me.find('.show-more').html(_('Show {1} more', [ccheck - Settings.getItem('sourceCount')]));
				else
					show_me.nextAll().removeClass('show-more-hidden').end().remove();
				
				if (do_hide) ul.css({ marginTop: -999999, opacity: 0 }).removeClass('visible');
			} else {
				ul.parent().prev().hide();
				ul.parent().hide();
			}
				
			if (!$('li', ul).length) ul.parent().prev().hide();
				
			$('.divider:last', ul).css('visibility', 'hidden');
		
			if (this.simpleMode && Settings.getItem('showPerHost')) {
				ul.addClass('show-per-host');
				
				for (var kind in shost_list)
					for (poopy in shost_list[kind])
						for (use_url in shost_list[kind][poopy]) {
							$('#' + shost_list[kind][poopy][use_url][1], ul).find('small')
									.html('<a href="javascript:void(0);" class="show-scripts">' + shost_list[kind][poopy][use_url][0] + '</a>');
						}
				
				$('.show-scripts', ul).click(function () {
					var off = $(this).offset(), scripts = $(this.parentNode.parentNode).data('script').map(function (v) { return encodeURI(v); });

					new Poppy(off.left + -1 + $(this).width() / 2, off.top + 2, [
						'<ul>',
							'<li><span><a href="javascript:void(0)">', scripts.join(['</a></span> ',
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
		
			$('.show-more', ul).click(function () {
				$(this).parent().nextUntil('.kind-header').filter('.show-more-hidden')
						.slideDown(200 * self.speedMultiplier).removeClass('show-more-hidden').end().end()
						.slideUp(300  * self.speedMultiplier, function () {
					$(this).remove();
				});
				_$('#find-bar-search:visible').trigger('search');
			});
		
			if (self.collapsed(text)) {
				_$('.' + text + '-label:not(.hidden)').click();
				$('.kind-header', ul).removeClass('visible');
			}
		}
	},
	do_update_popover: function (event, index, badge_only) {
		if (!this.trial_active() && !this.donationVerified && !badge_only && this.trialStart > -1)
			return this.utils.timer.timeout('trial_expired', function (self) {
				new Poppy($(self.popover.body).width() / 2, 13, [
					'<p>', _('Free trial expired', ['JavaScript Blocker']), '</p>',
					'<p><input type="button" id="click-understood" value="', _('Understood'), '" /></p>'
				].join(''), function () {
					_$('#click-understood').click(function () {
						self.trialStart = -1;
						new Poppy();
						safari.extension.toolbarItems[0].popover.contentWindow.location.reload();
					});
				}, null, null, true);
			}, 1000, [this]);
		
		if (!this.methodAllowed) return false;
		
		if (_$('#poppy').is(':visible') && this.popover_visible()) return this.utils.timer.timeout('do_update_popover', function (self, event, index, badge_only) {
			self.do_update_popover(event, index, badge_only);
		}, 1500, [this, event, index, badge_only]);
		
		this.busy = 1;

		if (safari.application.activeBrowserWindow.activeTab.url === event.message.href || event.message.href === 'http://sample.data.url/page.html') {
			_$('#main:visible').trigger('scroll');
			
			var page_list = _$('#page-list'), frame_count = { blocked: 0, allowed: 0 }, frame,
					count = { blocked: 0, allowed: 0, unblocked: 0 }, self = this, jsblocker = event.message, toolbarItem = null,
					frames_blocked_item_count = 0, frames_allowed_item_count = 0;
					
			this.caches.jsblocker[event.message.href] = jsblocker;
					
			page_list.empty();

			$('<optgroup />').attr('label', _('Main Page')).appendTo(page_list).append('<option />').find('option')
				.attr('value', jsblocker.href).text(jsblocker.href);
			
			for (var act in jsblocker) {
				if (act === 'href') continue;
				for (var kind in jsblocker[act])
					if (kind !== 'special' && this.enabled(kind))
						count[act] += jsblocker[act][kind].all.length;
			}
						
			if (jsblocker.href in this.frames) {
				var frame, inline, xx = this.frames[jsblocker.href], d;

				for (frame in xx) {
					if (page_list.find('optgroup').length == 1)
						inline = $('<optgroup />').attr('label', _('Inline Frame Pages')).appendTo(page_list);
					else
						inline = page_list.find('optgroup:eq(1)');

					for (var act in xx[frame]) {
						if (act === 'href') continue;
						for (var kind in xx[frame][act])
							if (kind !== 'special' && this.enabled(kind))
								frame_count[act] += xx[frame][act][kind].all.length;
					}
					
					for (var key in xx[frame].blocked) {
						if (key === 'special' || !this.enabled(key)) continue;
						
						frames_blocked_item_count += xx[frame].blocked[key].unique.length;
						frames_allowed_item_count += xx[frame].allowed[key].unique.length;
					}
					
					d = ('display' in xx[frame]) ? xx[frame].display : xx[frame].href;
				
					$('<option />').addClass('frame-page').attr('value', xx[frame].href).text(d).appendTo(inline);
				}
			}
			
			var toolbarDisplay = Settings.getItem('toolbarDisplay');
			
			for (var y = 0; y < safari.extension.toolbarItems.length; y++) {
				toolbarItem = safari.extension.toolbarItems[y];

				toolbarItem.image = this.disabled ? safari.extension.baseURI + 'images/toolbar-disabled.png' : safari.extension.baseURI + 'images/toolbar.png';

				if (!self.simpleMode)
					toolbarItem.badge = Settings.getItem('toolbarDisplay') === 'allowed' ?
							count.allowed + frame_count.allowed :
							(Settings.getItem('toolbarDisplay') === 'blocked' ? count.blocked + frame_count.blocked : 0);
				else {
					var allowed_items = 0, blocked_items = 0;
					
					for (var kind in jsblocker.allowed) {
						if (kind === 'special' || !this.enabled(kind)) continue;
											
						allowed_items += jsblocker.allowed[kind].unique.length;
						blocked_items += jsblocker.blocked[kind].unique.length;
					}
																
					toolbarItem.badge = Settings.getItem('toolbarDisplay') === 'allowed' ?
							allowed_items + frames_allowed_item_count :
							(Settings.getItem('toolbarDisplay') === 'blocked' ? blocked_items + frames_blocked_item_count : 0);
				}
			}
			
			if (!badge_only) {				
				_$('#previous-frame, #next-frame, #frame-switcher .divider').removeClass('disabled').filter('#previous-frame').find('.text').html(_('Main page'));
				
				var max = $('option', page_list).length - 1;
			
				if (typeof index == 'number' && index > 0) {
					page_list[0].selectedIndex = index;
					
					if (index === 0)
						_$('#previous-frame').addClass('disabled');
					else if (index > 1)
						_$('#previous-frame .text').html(_('Prev. frame'));
						
					if (index === max)
						_$('#next-frame').addClass('disabled');
					
					jsblocker = this.frames[jsblocker.href][page_list.val()];
				} else
					_$('#previous-frame').addClass('disabled');
				
				if (max === 0)
					_$('#next-frame').addClass('disabled');
					
				if (_$('#next-frame.disabled, #previous-frame.disabled').length === 2)
					_$('#frame-switcher .divider').addClass('disabled');
				
				page_list.attr('title', page_list.val()).unbind('change').change(function () {
					new Poppy();
					self.do_update_popover(event, this.selectedIndex);
				});

				_$('#main ul').empty();

				this.make_list('blocked', _('Allow'), jsblocker);
				this.make_list('allowed', _('Block'), jsblocker);
				
				if (Settings.getItem('showUnblocked'))
					this.make_list('unblocked', _('View'), jsblocker);
			}
		}
		
		this.busy = 0;
	},
	setting_changed: function (event) {
		if (event.key === 'openSettings' && event.newValue) {
			Settings.setItem('openSettings', false);
			this.utils.open_url(safari.extension.baseURI + 'settings.html');
		} else if (event.key === 'language' || event.key === 'theme') {
			this.reloaded = false;

			if (event.key === 'theme' && event.newValue !== 'default' && !this.donationVerified)
				Settings.setItem('theme', 'default');
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
		}	else if (event.key === 'simpleMode' && !event.newValue && !this.donationVerified) {
			Settings.setItem('simpleMode', true);
		} else if (event.key === 'blockReferrer' && event.newValue && !this.donationVerified) {
			Settings.setItem('blockReferrer', false);
		} else if (event.key === 'floaters' && !event.newValue)
			_$('.floater').next().css({ top: 'auto', left: 'auto', opacity: 1 }).width('auto').prev().remove();
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
				!Settings.getItem('blockReferrer') ||
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
			case 'closeSettings':
				safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('closeSettings');
			break;

			case 'canLoad':
				if (event.message === 'parentURL') {
					event.message = event.target.url;
					break;
				} else if (event.message[0])
					typeSwitch:
					switch (event.message[0]) {
						case 'arbitrary':
							var al = ['displayv', 'bundleid', 'trial_remaining', 'trial_active', 'domain_parts'], r;
							
							if (~al.indexOf(event.message[1])) {
								r = this[event.message[1]];
								event.message = typeof r === 'function' ? r.call(JB, event.message[2]) : r;
							} else
								event.message = null;
						break theSwitch;
						
						case 'trial':
							event.message = this.trial_remaining();
						break theSwitch;
						
						case 'setting':
							event.message = Settings.getItem(event.message[1]);
						break theSwitch;
				
						case 'setting_set':
							var dl = ['donationVerified', 'trialStart', 'installID', 'installedBundle', 'enablespecial', 'setupDone'];
							
							if (event.message[2] === null)
								safari.extension.settings.removeItem(event.message[1]);
							else if (!~dl.indexOf(event.message[1]))
								Settings.setItem(event.message[1], event.message[2]);
							
							event.message = 1;
						break theSwitch;
						
						case 'special':
							event.message = this.disabled ? 1 : this.rules.special_allowed(event.message[1], event.message[2]);
						break theSwitch;

						case 'confirmShortURL':
							var re = this.handle_navigate({
								preventDefault: new Function (),
								target: {
									url: event.message[2]
								},
								url: event.message[1]
							});

							event.message = re;
						break theSwitch;

						case 'localize':
							event.message = _(event.message[1], event.message[2]);
						break theSwitch;
					}
				
				if (this.disabled ||
					(event.message[0] !== 'script' && !this.donationVerified)) {
					event.message = [1, -1];
					break theSwitch;
				} else if (this.installedBundle < this.update_attention_required || !this.methodAllowed) {
					event.message = this.enabled(event.message[0]) ? [0, -1] : [1, -1];
					break theSwitch;
				}

				event.message = this.rules.allowed(event.message[0], event.message);
			break;

			case 'updatePopover':
				if (event.target != safari.application.activeBrowserWindow.activeTab ||
						(this.popover_visible() && _$('#page-list')[0].selectedIndex > 0)) break;
					
				this.utils.timer.timeout('update_popover', function (event, self) {
					self.do_update_popover(event, undefined, !self.popover_visible());
				}, 10, [event, this]);
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
					this.caches.jsblocker[event.message[0]] = this.caches.jsblocker[event.message[2]];
				
					delete this.frames[event.message[2]];
					delete this.caches.jsblocker[event.message[1]];
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
				event.target.page.dispatchMessage('setting', [event.message, Settings.getItem(event.message)]);
			break;
			
			case 'reloadPopover':
				this.reloaded = false;
			break;
			
			case 'doNothing': break;
		}
	},
	_redirectors: {"0rz.tw":{"domain":"0rz.tw","regex":""},"1link.in":{"domain":"1link.in","regex":""},"1url.com":{"domain":"1url.com","regex":""},"2.gp":{"domain":"2.gp","regex":""},"2big.at":{"domain":"2big.at","regex":""},"2tu.us":{"domain":"2tu.us","regex":""},"3.ly":{"domain":"3.ly","regex":""},"307.to":{"domain":"307.to","regex":""},"4ms.me":{"domain":"4ms.me","regex":""},"4sq.com":{"domain":"4sq.com","regex":""},"4url.cc":{"domain":"4url.cc","regex":""},"6url.com":{"domain":"6url.com","regex":""},"7.ly":{"domain":"7.ly","regex":""},"a.gg":{"domain":"a.gg","regex":""},"a.nf":{"domain":"a.nf","regex":""},"aa.cx":{"domain":"aa.cx","regex":""},"abcurl.net":{"domain":"abcurl.net","regex":""},"ad.vu":{"domain":"ad.vu","regex":""},"adf.ly":{"domain":"adf.ly","regex":""},"adjix.com":{"domain":"adjix.com","regex":""},"afx.cc":{"domain":"afx.cc","regex":""},"all.fuseurl.com":{"domain":"all.fuseurl.com","regex":""},"alturl.com":{"domain":"alturl.com","regex":""},"amzn.to":{"domain":"amzn.to","regex":""},"ar.gy":{"domain":"ar.gy","regex":""},"arst.ch":{"domain":"arst.ch","regex":""},"atu.ca":{"domain":"atu.ca","regex":""},"azc.cc":{"domain":"azc.cc","regex":""},"b23.ru":{"domain":"b23.ru","regex":""},"b2l.me":{"domain":"b2l.me","regex":""},"bacn.me":{"domain":"bacn.me","regex":""},"bcool.bz":{"domain":"bcool.bz","regex":""},"binged.it":{"domain":"binged.it","regex":""},"bit.ly":{"domain":"bit.ly","regex":""},"bizj.us":{"domain":"bizj.us","regex":""},"bloat.me":{"domain":"bloat.me","regex":""},"bravo.ly":{"domain":"bravo.ly","regex":""},"bsa.ly":{"domain":"bsa.ly","regex":""},"budurl.com":{"domain":"budurl.com","regex":""},"canurl.com":{"domain":"canurl.com","regex":""},"chilp.it":{"domain":"chilp.it","regex":""},"chzb.gr":{"domain":"chzb.gr","regex":""},"cl.lk":{"domain":"cl.lk","regex":""},"cl.ly":{"domain":"cl.ly","regex":""},"clck.ru":{"domain":"clck.ru","regex":""},"cli.gs":{"domain":"cli.gs","regex":""},"cliccami.info":{"domain":"cliccami.info","regex":""},"clickthru.ca":{"domain":"clickthru.ca","regex":""},"clop.in":{"domain":"clop.in","regex":""},"conta.cc":{"domain":"conta.cc","regex":""},"cort.as":{"domain":"cort.as","regex":""},"cot.ag":{"domain":"cot.ag","regex":""},"crks.me":{"domain":"crks.me","regex":""},"ctvr.us":{"domain":"ctvr.us","regex":""},"cutt.us":{"domain":"cutt.us","regex":""},"dai.ly":{"domain":"dai.ly","regex":""},"decenturl.com":{"domain":"decenturl.com","regex":""},"dfl8.me":{"domain":"dfl8.me","regex":""},"digbig.com":{"domain":"digbig.com","regex":""},"digg.com":{"domain":"digg.com","regex":"http:\\\/\\\/digg\\.com\\\/(?!news)[^\\\/]+$"},"disq.us":{"domain":"disq.us","regex":""},"dld.bz":{"domain":"dld.bz","regex":""},"dlvr.it":{"domain":"dlvr.it","regex":""},"do.my":{"domain":"do.my","regex":""},"doiop.com":{"domain":"doiop.com","regex":""},"dopen.us":{"domain":"dopen.us","regex":""},"easyuri.com":{"domain":"easyuri.com","regex":""},"easyurl.net":{"domain":"easyurl.net","regex":""},"eepurl.com":{"domain":"eepurl.com","regex":""},"eweri.com":{"domain":"eweri.com","regex":""},"fa.by":{"domain":"fa.by","regex":""},"fav.me":{"domain":"fav.me","regex":""},"fb.me":{"domain":"fb.me","regex":""},"fbshare.me":{"domain":"fbshare.me","regex":""},"ff.im":{"domain":"ff.im","regex":""},"fff.to":{"domain":"fff.to","regex":""},"fire.to":{"domain":"fire.to","regex":""},"firsturl.de":{"domain":"firsturl.de","regex":""},"firsturl.net":{"domain":"firsturl.net","regex":""},"flic.kr":{"domain":"flic.kr","regex":""},"flq.us":{"domain":"flq.us","regex":""},"fly2.ws":{"domain":"fly2.ws","regex":""},"fon.gs":{"domain":"fon.gs","regex":""},"freak.to":{"domain":"freak.to","regex":""},"fuseurl.com":{"domain":"fuseurl.com","regex":""},"fuzzy.to":{"domain":"fuzzy.to","regex":""},"fwd4.me":{"domain":"fwd4.me","regex":""},"fwib.net":{"domain":"fwib.net","regex":""},"g.ro.lt":{"domain":"g.ro.lt","regex":""},"gizmo.do":{"domain":"gizmo.do","regex":""},"gl.am":{"domain":"gl.am","regex":""},"go.9nl.com":{"domain":"go.9nl.com","regex":""},"go.ign.com":{"domain":"go.ign.com","regex":""},"go.usa.gov":{"domain":"go.usa.gov","regex":""},"goo.gl":{"domain":"goo.gl","regex":""},"goshrink.com":{"domain":"goshrink.com","regex":""},"gurl.es":{"domain":"gurl.es","regex":""},"hex.io":{"domain":"hex.io","regex":""},"hiderefer.com":{"domain":"hiderefer.com","regex":""},"hmm.ph":{"domain":"hmm.ph","regex":""},"href.in":{"domain":"href.in","regex":""},"hsblinks.com":{"domain":"hsblinks.com","regex":""},"htxt.it":{"domain":"htxt.it","regex":""},"huff.to":{"domain":"huff.to","regex":""},"hulu.com":{"domain":"hulu.com","regex":""},"hurl.me":{"domain":"hurl.me","regex":""},"hurl.ws":{"domain":"hurl.ws","regex":""},"icanhaz.com":{"domain":"icanhaz.com","regex":""},"idek.net":{"domain":"idek.net","regex":""},"ilix.in":{"domain":"ilix.in","regex":""},"is.gd":{"domain":"is.gd","regex":""},"its.my":{"domain":"its.my","regex":""},"ix.lt":{"domain":"ix.lt","regex":""},"j.mp":{"domain":"j.mp","regex":""},"jijr.com":{"domain":"jijr.com","regex":""},"kl.am":{"domain":"kl.am","regex":""},"klck.me":{"domain":"klck.me","regex":""},"korta.nu":{"domain":"korta.nu","regex":""},"krunchd.com":{"domain":"krunchd.com","regex":""},"l9k.net":{"domain":"l9k.net","regex":""},"lat.ms":{"domain":"lat.ms","regex":""},"liip.to":{"domain":"liip.to","regex":""},"liltext.com":{"domain":"liltext.com","regex":""},"linkbee.com":{"domain":"linkbee.com","regex":""},"linkbun.ch":{"domain":"linkbun.ch","regex":""},"liurl.cn":{"domain":"liurl.cn","regex":""},"ln-s.net":{"domain":"ln-s.net","regex":""},"ln-s.ru":{"domain":"ln-s.ru","regex":""},"lnk.gd":{"domain":"lnk.gd","regex":""},"lnk.ms":{"domain":"lnk.ms","regex":""},"lnkd.in":{"domain":"lnkd.in","regex":""},"lnkurl.com":{"domain":"lnkurl.com","regex":""},"lru.jp":{"domain":"lru.jp","regex":""},"lt.tl":{"domain":"lt.tl","regex":""},"lurl.no":{"domain":"lurl.no","regex":""},"macte.ch":{"domain":"macte.ch","regex":""},"mash.to":{"domain":"mash.to","regex":""},"merky.de":{"domain":"merky.de","regex":""},"migre.me":{"domain":"migre.me","regex":""},"miniurl.com":{"domain":"miniurl.com","regex":""},"minurl.fr":{"domain":"minurl.fr","regex":""},"mke.me":{"domain":"mke.me","regex":""},"moby.to":{"domain":"moby.to","regex":""},"moourl.com":{"domain":"moourl.com","regex":""},"mrte.ch":{"domain":"mrte.ch","regex":""},"myloc.me":{"domain":"myloc.me","regex":""},"myurl.in":{"domain":"myurl.in","regex":""},"n.pr":{"domain":"n.pr","regex":""},"nbc.co":{"domain":"nbc.co","regex":""},"nblo.gs":{"domain":"nblo.gs","regex":""},"nn.nf":{"domain":"nn.nf","regex":""},"not.my":{"domain":"not.my","regex":""},"notlong.com":{"domain":"notlong.com","regex":""},"nsfw.in":{"domain":"nsfw.in","regex":""},"nutshellurl.com":{"domain":"nutshellurl.com","regex":""},"nxy.in":{"domain":"nxy.in","regex":""},"nyti.ms":{"domain":"nyti.ms","regex":""},"o-x.fr":{"domain":"o-x.fr","regex":""},"oc1.us":{"domain":"oc1.us","regex":""},"om.ly":{"domain":"om.ly","regex":""},"omf.gd":{"domain":"omf.gd","regex":""},"omoikane.net":{"domain":"omoikane.net","regex":""},"on.cnn.com":{"domain":"on.cnn.com","regex":""},"on.mktw.net":{"domain":"on.mktw.net","regex":""},"onforb.es":{"domain":"onforb.es","regex":""},"orz.se":{"domain":"orz.se","regex":""},"ow.ly":{"domain":"ow.ly","regex":""},"ping.fm":{"domain":"ping.fm","regex":""},"pli.gs":{"domain":"pli.gs","regex":""},"pnt.me":{"domain":"pnt.me","regex":""},"politi.co":{"domain":"politi.co","regex":""},"post.ly":{"domain":"post.ly","regex":""},"pp.gg":{"domain":"pp.gg","regex":""},"profile.to":{"domain":"profile.to","regex":""},"ptiturl.com":{"domain":"ptiturl.com","regex":""},"pub.vitrue.com":{"domain":"pub.vitrue.com","regex":""},"qlnk.net":{"domain":"qlnk.net","regex":""},"qte.me":{"domain":"qte.me","regex":""},"qu.tc":{"domain":"qu.tc","regex":""},"qy.fi":{"domain":"qy.fi","regex":""},"r.im":{"domain":"r.im","regex":""},"rb6.me":{"domain":"rb6.me","regex":""},"read.bi":{"domain":"read.bi","regex":""},"readthis.ca":{"domain":"readthis.ca","regex":""},"reallytinyurl.com":{"domain":"reallytinyurl.com","regex":""},"redir.ec":{"domain":"redir.ec","regex":""},"redirects.ca":{"domain":"redirects.ca","regex":""},"redirx.com":{"domain":"redirx.com","regex":""},"retwt.me":{"domain":"retwt.me","regex":""},"ri.ms":{"domain":"ri.ms","regex":""},"rickroll.it":{"domain":"rickroll.it","regex":""},"riz.gd":{"domain":"riz.gd","regex":""},"rt.nu":{"domain":"rt.nu","regex":""},"ru.ly":{"domain":"ru.ly","regex":""},"rubyurl.com":{"domain":"rubyurl.com","regex":""},"rurl.org":{"domain":"rurl.org","regex":""},"rww.tw":{"domain":"rww.tw","regex":""},"s4c.in":{"domain":"s4c.in","regex":""},"s7y.us":{"domain":"s7y.us","regex":""},"safe.mn":{"domain":"safe.mn","regex":""},"sameurl.com":{"domain":"sameurl.com","regex":""},"sdut.us":{"domain":"sdut.us","regex":""},"shar.es":{"domain":"shar.es","regex":""},"shink.de":{"domain":"shink.de","regex":""},"shorl.com":{"domain":"shorl.com","regex":""},"short.ie":{"domain":"short.ie","regex":""},"short.to":{"domain":"short.to","regex":""},"shortlinks.co.uk":{"domain":"shortlinks.co.uk","regex":""},"shorturl.com":{"domain":"shorturl.com","regex":""},"shout.to":{"domain":"shout.to","regex":""},"show.my":{"domain":"show.my","regex":""},"shrinkify.com":{"domain":"shrinkify.com","regex":""},"shrinkr.com":{"domain":"shrinkr.com","regex":""},"shrt.fr":{"domain":"shrt.fr","regex":""},"shrt.st":{"domain":"shrt.st","regex":""},"shrten.com":{"domain":"shrten.com","regex":""},"shrunkin.com":{"domain":"shrunkin.com","regex":""},"simurl.com":{"domain":"simurl.com","regex":""},"slate.me":{"domain":"slate.me","regex":""},"smallr.com":{"domain":"smallr.com","regex":""},"smsh.me":{"domain":"smsh.me","regex":""},"smurl.name":{"domain":"smurl.name","regex":""},"sn.im":{"domain":"sn.im","regex":""},"snipr.com":{"domain":"snipr.com","regex":""},"snipurl.com":{"domain":"snipurl.com","regex":""},"snurl.com":{"domain":"snurl.com","regex":""},"sp2.ro":{"domain":"sp2.ro","regex":""},"spedr.com":{"domain":"spedr.com","regex":""},"srnk.net":{"domain":"srnk.net","regex":""},"srs.li":{"domain":"srs.li","regex":""},"starturl.com":{"domain":"starturl.com","regex":""},"su.pr":{"domain":"su.pr","regex":""},"surl.co.uk":{"domain":"surl.co.uk","regex":""},"surl.hu":{"domain":"surl.hu","regex":""},"t.cn":{"domain":"t.cn","regex":""},"t.co":{"domain":"t.co","regex":""},"t.lh.com":{"domain":"t.lh.com","regex":""},"ta.gd":{"domain":"ta.gd","regex":""},"tbd.ly":{"domain":"tbd.ly","regex":""},"tcrn.ch":{"domain":"tcrn.ch","regex":""},"tgr.me":{"domain":"tgr.me","regex":""},"tgr.ph":{"domain":"tgr.ph","regex":""},"tighturl.com":{"domain":"tighturl.com","regex":""},"tiniuri.com":{"domain":"tiniuri.com","regex":""},"tiny.cc":{"domain":"tiny.cc","regex":""},"tiny.ly":{"domain":"tiny.ly","regex":""},"tiny.pl":{"domain":"tiny.pl","regex":""},"tinylink.in":{"domain":"tinylink.in","regex":""},"tinyuri.ca":{"domain":"tinyuri.ca","regex":""},"tinyurl.com":{"domain":"tinyurl.com","regex":""},"tk.":{"domain":"tk.","regex":""},"tl.gd":{"domain":"tl.gd","regex":""},"tmi.me":{"domain":"tmi.me","regex":""},"tnij.org":{"domain":"tnij.org","regex":""},"tnw.to":{"domain":"tnw.to","regex":""},"tny.com":{"domain":"tny.com","regex":""},"to.":{"domain":"to.","regex":""},"to.ly":{"domain":"to.ly","regex":""},"togoto.us":{"domain":"togoto.us","regex":""},"totc.us":{"domain":"totc.us","regex":""},"toysr.us":{"domain":"toysr.us","regex":""},"tpm.ly":{"domain":"tpm.ly","regex":""},"tr.im":{"domain":"tr.im","regex":""},"tra.kz":{"domain":"tra.kz","regex":""},"trunc.it":{"domain":"trunc.it","regex":""},"twhub.com":{"domain":"twhub.com","regex":""},"twirl.at":{"domain":"twirl.at","regex":""},"twitclicks.com":{"domain":"twitclicks.com","regex":""},"twitterurl.net":{"domain":"twitterurl.net","regex":""},"twitterurl.org":{"domain":"twitterurl.org","regex":""},"twiturl.de":{"domain":"twiturl.de","regex":""},"twurl.cc":{"domain":"twurl.cc","regex":""},"twurl.nl":{"domain":"twurl.nl","regex":""},"u.mavrev.com":{"domain":"u.mavrev.com","regex":""},"u.nu":{"domain":"u.nu","regex":""},"u76.org":{"domain":"u76.org","regex":""},"ub0.cc":{"domain":"ub0.cc","regex":""},"ulu.lu":{"domain":"ulu.lu","regex":""},"updating.me":{"domain":"updating.me","regex":""},"ur1.ca":{"domain":"ur1.ca","regex":""},"url.az":{"domain":"url.az","regex":""},"url.co.uk":{"domain":"url.co.uk","regex":""},"url.ie":{"domain":"url.ie","regex":""},"url360.me":{"domain":"url360.me","regex":""},"url4.eu":{"domain":"url4.eu","regex":""},"urlborg.com":{"domain":"urlborg.com","regex":""},"urlbrief.com":{"domain":"urlbrief.com","regex":""},"urlcover.com":{"domain":"urlcover.com","regex":""},"urlcut.com":{"domain":"urlcut.com","regex":""},"urlenco.de":{"domain":"urlenco.de","regex":""},"urli.nl":{"domain":"urli.nl","regex":""},"urls.im":{"domain":"urls.im","regex":""},"urlshorteningservicefortwitter.com":{"domain":"urlshorteningservicefortwitter.com","regex":""},"urlx.ie":{"domain":"urlx.ie","regex":""},"urlzen.com":{"domain":"urlzen.com","regex":""},"usat.ly":{"domain":"usat.ly","regex":""},"use.my":{"domain":"use.my","regex":""},"vb.ly":{"domain":"vb.ly","regex":""},"vgn.am":{"domain":"vgn.am","regex":""},"vl.am":{"domain":"vl.am","regex":""},"vm.lc":{"domain":"vm.lc","regex":""},"w55.de":{"domain":"w55.de","regex":""},"wapo.st":{"domain":"wapo.st","regex":""},"wapurl.co.uk":{"domain":"wapurl.co.uk","regex":""},"wipi.es":{"domain":"wipi.es","regex":""},"wp.me":{"domain":"wp.me","regex":""},"x.vu":{"domain":"x.vu","regex":""},"xr.com":{"domain":"xr.com","regex":""},"xrl.in":{"domain":"xrl.in","regex":""},"xrl.us":{"domain":"xrl.us","regex":""},"xurl.es":{"domain":"xurl.es","regex":""},"xurl.jp":{"domain":"xurl.jp","regex":""},"y.ahoo.it":{"domain":"y.ahoo.it","regex":""},"yatuc.com":{"domain":"yatuc.com","regex":""},"ye.pe":{"domain":"ye.pe","regex":""},"yep.it":{"domain":"yep.it","regex":""},"yfrog.com":{"domain":"yfrog.com","regex":""},"yhoo.it":{"domain":"yhoo.it","regex":""},"yiyd.com":{"domain":"yiyd.com","regex":""},"youtu.be":{"domain":"youtu.be","regex":""},"yuarel.com":{"domain":"yuarel.com","regex":""},"z0p.de":{"domain":"z0p.de","regex":""},"zi.ma":{"domain":"zi.ma","regex":""},"zi.mu":{"domain":"zi.mu","regex":""},"zipmyurl.com":{"domain":"zipmyurl.com","regex":""},"zud.me":{"domain":"zud.me","regex":""},"zurl.ws":{"domain":"zurl.ws","regex":""},"zz.gd":{"domain":"zz.gd","regex":""},"zzang.kr":{"domain":"zzang.kr","regex":""},"\u203a.ws":{"domain":"\u203a.ws","regex":""},"\u2729.ws":{"domain":"\u2729.ws","regex":""},"\u273f.ws":{"domain":"\u273f.ws","regex":""},"\u2765.ws":{"domain":"\u2765.ws","regex":""},"\u2794.ws":{"domain":"\u2794.ws","regex":""},"\u279e.ws":{"domain":"\u279e.ws","regex":""},"\u27a1.ws":{"domain":"\u27a1.ws","regex":""},"\u27a8.ws":{"domain":"\u27a8.ws","regex":""},"\u27af.ws":{"domain":"\u27af.ws","regex":""},"\u27b9.ws":{"domain":"\u27b9.ws","regex":""},"\u27bd.ws":{"domain":"\u27bd.ws","regex":""}},
	handle_navigate: function (event) {
		if (!Settings.getItem('confirmShortURL')) return 1;
		else if (!event.url || event.url.toLowerCase().indexOf('http') !== 0) return 1;

		var url = event.url, host = this.utils.active_host(url), re = 1, self = this, do_test = function (url, title, redirect) {
			if (!event.no_confirm)
				re = url !== redirect ? confirm(_('The short URL—{1}—is redirecting you to: {2} {3} Do you want to continue?', [url, title ? title.replace(/\n/g, ' ') : '', redirect])) : 1;
			else
				re = [url, title, redirect];

			if (!re) event.preventDefault();
		};

		if (host in this._redirectors) {
			if (event.url in this.caches.redirects)
				do_test(event.url, this.caches.redirects[event.url].title, this.caches.redirects[event.url]['long-url']);
			else if (!this._redirectors[host].regex.length ||
				(this._redirectors[host].regex && (new RegExp(this._redirectors[host].regex)).test(event.url))) {
				console.log('Request:', event.url)
				$.ajax({
					async: false,
					url: this.longURL + encodeURI(url),
					dataType: 'json'
				}).success(function (r) {
					self.caches.redirects[event.url] = r;

					do_test(event.url, r.title, r['long-url']);
				}).error(function (er) {
					if (er.status !== 400)
						alert(_('You cannot enable confirmShortURL'));
					re = 1;
				});
			} else
				re = 1;
		}

		return re;
	},
	open_popover: function (event) {
		var self = this, s = _$('#setup');

		if (event && ('type' in event) && event.type == 'popover') {
			/**
			 * Fixes issues with mouse hover events not working
			 */
			if (!this.reloaded) {
				this.reloaded = true;
				this.load_language(false);
					
				safari.extension.toolbarItems[0].popover.contentWindow.location.reload();
				
				return false;
			}

			_$('#find-bar-done:visible').click();

			new Poppy();
		} else if (!event || (event && ('type' in event) && ~['beforeNavigate', 'close'].indexOf(event.type))) {
			new Poppy();

			if (event.target.url === event.url || event.type === 'close')
				delete this.frames[event.target.url];

			if (event.type === 'close')
				delete this.caches.jsblocker[event.target.url];

			if (event.type === 'beforeNavigate') this.handle_navigate(event);
			
			setTimeout(function (self, event) {
				delete self.anonymous.newTab[event.target.url];
			}, 100, this, event);
			
			try {
				if (event.target === safari.application.activeBrowserWindow.activeTab && event.type === 'beforeNavigate') {
					for (var y = 0; y < safari.extension.toolbarItems.length; y++)
						safari.extension.toolbarItems[y].badge = 0;
				}
			} catch (e) {}
		}
		
		if (!this.setupDone) {
			this.collapsed('allowed-script-urls-image', 1);
			for (var key in this.rules.data_types)
				this.rules.reinstall_predefined(key);
			this.setupDone = 1;				
			this.installedBundle = self.bundleid;
			_$('#js-settings').click();
		}
		
		this.utils.timer.timeout('updater', function (self) {
			self.updater();
		}, 500, [this]);
		
		if (s.hasClass('zoom-window-open'))
			this.utils.zoom(s, _$('#main'));
		
		try {
			if (event.type === 'popover') {
				_$('#page-list')[0].selectedIndex = 0;
				_$('.whoop').scrollTop(0);

				var url = safari.application.activeBrowserWindow.activeTab.url || '';
				
				if (!this.methodAllowed) {
					Settings.setItem('simpleMode', true);

					setTimeout(function (self) {
						new Poppy($(self.popover.body).width() / 2, 13, [
							'<p>', _('You cannot use JavaScript Blocker'), '</p>'].join(''));
					}, 2000, self);
				} else {
					if (this.installedBundle === this.bundleid) {
						this.utils.timer.timeout('update_failure', function () {
							for (var y = 0; y < safari.extension.toolbarItems.length; y++)
								safari.extension.toolbarItems[y].badge = 0;

								if (url.indexOf('safari-extension://com.toggleable.JavaScriptBlocker') === 0) {
									self.do_update_popover({ message: self.caches.jsblocker.sample });
									return false;
								}
								
								setTimeout(function (self, url) {
									new Poppy($(self.popover.body).width() / 2, 13, [
										'<p>', _('Update Failure'), '</p>'].join(''), null, null, null, !(url in self.caches.jsblocker));
								
								if (url in self.caches.jsblocker)
									self.do_update_popover({ message: self.caches.jsblocker[url] });
							}, 300, self, url);
						}, 1000);
					
						safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePopover');
					}
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
		
		if (this.trialStart === 0)
			this.trialStart = +new Date;
			
		this.caches.jsblocker.sample = this.caches._jsblocker_sample;
		
		try {
			if (this.tab === null || this.tab !== safari.application.activeBrowserWindow.activeTab) {
				this.tab = safari.application.activeBrowserWindow.activeTab;
				safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePopoverNow');
			}
		} catch (e) {}
		
		if (!('cache' in this.rules)) this.rules.cache = this.rules.data_types;
		
		if (!Settings.getItem('installID'))
			Settings.setItem('installID', this.utils.id() + '~' + this.displayv);
			
		this.speedMultiplier = this.useAnimations ? 1 : 0.001;
		
		if (!('cleanup' in this.utils.timer.timers.intervals))
			this.utils.timer.interval('cleanup', $.proxy(this._cleanup, this), 1000 * 60 * 3);
			
		try {
			this.popover = safari.extension.toolbarItems[0].popover.contentWindow.document;
			
			if (this.installedBundle < this.update_attention_required) this.utils.attention(1);
			
			this.set_theme(this.theme);
			
			if (Settings.getItem('floaters')) {
				JB.utils.floater('#rules-list', '.rules-header:visible');
			
				JB.utils.floater('#rules-list', '.rules-wrapper.visible li.domain-name:visible:not(.hidden,.editing,.header-hidden)', function (every) {
					return every.filter('li:visible:first').next().find('ul');
				}, function () {
					return _$('#rules-list .rules-header.floater').outerHeight(true);
				});
			}
			
			for (var kind in this.rules.data_types)
				this.rules.clear_temporary(kind);
			
			safari.extension.toolbarItems[0].popover.width = this.simpleMode ? 460 : 560;
			safari.extension.toolbarItems[0].popover.height = this.simpleMode ? 350 : 400;
			
			$(this.popover.body).toggleClass('simple', this.simpleMode);
			$(this.popover.body).toggleClass('highlight-matched', Settings.getItem('highlight'));
				
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

var JavaScriptBlocker = JB;