/***************************************
 * @file js/global.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

"use strict";

jQuery.fn.reverse = [].reverse;

window.open = function (url, name, specs) {
	JB.utils.open_url(url);
};

var Template = {
			cache: { },
			create: function(str, data) {
				// Simple JavaScript Templating
				// John Resig - http://ejohn.org/ - MIT Licensed
		
				if(data !== false && typeof data !== 'object') data = {};
		
				if(!/\W/.test(str)) {
					str = 'tmpl_' + str;

					if(str in this.cache) var fn = this.cache[str];
					else {
						var e;
						
						if(!(e = JB.popover.getElementById(str))) return false;
				
						var fn = this.create($(e).text(), false);
					}
				} else
					var fn = this.cache[str] = new Function('self',
						"var p=[];p.push('" +
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
	$$ = function (s) {
		return $(s, JB.popover.body);
	},
	_d = function () {
		console.log.apply(console, arguments);
		
		if (JB.isBeta) {
			var un = $$('.console-unread').css('display', 'inline-block'),
					unc = parseInt(un.html(), 10);
					
			un.html(' ' + (unc + 1));
		}

		var args = $.makeArray(arguments).map(function (v) {
			return $.isPlainObject(v) ? JSON.stringify(v, null, 2) : v; 
		});

		$$('#jsconsolelogger').append('<li class="jsoutputcode unread">' + args.join(' ') + '<div class="divider"></div></li>')
			.find('.divider').removeClass('invisible').filter(':last').addClass('invisible');
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
		jsblocker: {},
		messages: { 'false': {}, 'true': {} },
		rule_regexp: {}
	},
	commandKey: !1,
	speedMultiplier: 1,
	optionKey: false,
	frames: {},
	displayv: null,
	bundleid: null,
	update_attention_required: 138,
	beta_attention_required: 1,
	baseURL: 'http://lion.toggleable.com:160/jsblocker/',
	longURL: 'http://api.longurl.org/v2/expand?user-agent=ToggleableJavaScriptBlocker&title=1&format=json&url=',
	
	set_theme: function (theme) {
		$('#main-large-style', this.popover.head).attr('href', Settings.getItem('largeFont') ? 'css/main.large.css' : '');
		
		if (!this.donationVerified) {
			if (theme !== 'default') {
				this.theme = 'default';
				this.set_theme(this.theme);
			}

			return;
		}
		
		var t = $('#poppy-theme-style', this.popover.head);
		
		if (!(new RegExp('\\.' + theme + '\\.')).test(t.attr('href'))) {
			t.attr('href', 'css/poppy.' + theme + '.css');
			$('#main-theme-style', this.popover.head).attr('href', 'css/main.' + theme + '.css');
		}
	},

	donate: function () {
		var self = this, status = Settings.getItem('donationVerified');
				
		if (!status || status === 777)
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p>', _('Updated JavaScript Blocker {1}', ['<a class="outside" href="http://javascript-blocker.toggleable.com/change-log/240">' + this.displayv + '</a>']), '</p>',
				'<p>', _('Thank you for your continued use'), '</p>',
				'<p>', _('Please, if you can'), '</p>',
				'<p>',
					'<input type="button" value="', _('Make a Donation'), '" id="make-donation" /> ',
					'<input type="button" value="', _('Maybe Later'), '" id="no-donation" /> ',
					'<input type="button" value="', _('I\'ve Donated!'), '" id="already-donation" /> ',
				'</p>'].join(''), function () {
					$$('#make-donation').click(function () {
						self.installedBundle = self.bundleid;

						self.utils.open_url('http://javascript-blocker.toggleable.com/donate');
					});
					$$('#no-donation').click(function () {
						self.installedBundle = self.bundleid;
						new Poppy();
					});
					$$('#already-donation').click(function () {
						self.installedBundle = self.bundleid;
						$$('#unlock').click();
					});
				}, null, null, true);
		else
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p>',
					_('Updated JavaScript Blocker {1}', ['<a class="outside" href="http://javascript-blocker.toggleable.com/change-log/' + this.displayv.replace(/\./g, '') + '">' + this.displayv + '</a>']),
				'</p>'].join(''));
		
		this.installedBundle = this.bundleid;		
	},
	load_language: function (css) {
		function set_popover_css (self, load_language, f) {
			if (self.popover && $$('#lang-css-' + load_language).length === 0) {
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
				Settings.getItem('language') : window.navigator.language.toLowerCase();
	
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
		var i, b, j, c, key, domain, e, new_collapsed = [], new_frames = {}, new_jsblocker = {}, self = this;

		Tabs.all(function (tab) {
			if (self.frames[tab.url])
				new_frames[tab.url] = self.frames[tab.url];
			if (self.caches.jsblocker[tab.url])
				new_jsblocker[tab.url] = self.caches.jsblocker[tab.url];
		});

		this.caches.jsblocker = new_jsblocker;
		this.frames = new_frames;
		this.anonymous.newTab = {};
		this.anonymous.previous = {};
		
		this.caches.active_host = {};
		this.caches.domain_parts = {};

		var use_tracker_cache = {};
		
		for (key in this.rules.data_types) {
			use_tracker_cache[key] = [];

			for (domain in this.rules.rules[key])
				this.utils.zero_timeout(function (domain, kind, ruleSet, utc, self) {
					for (var rule in ruleSet[domain])
						utc[kind].push(domain + rule + ruleSet[domain][rule][0]);

					if ($.isEmptyObject(ruleSet[domain])) {
						delete ruleSet[domain];
						delete self.rules.cache[kind][domain];
					}
				}, [domain, key, this.rules.rules[key], use_tracker_cache, this]);
		}
		
		this.utils.zero_timeout(function (rules, utc, uc) {
			rules.save(1);

			for (var kind in uc._tracked) {
				for (var used in uc._tracked[kind])
					if (!~use_tracker_cache[kind].indexOf(used))
						delete uc._tracked[kind][used];

				if ($.isEmptyObject(uc._tracked[kind])) delete uc._tracked[kind];
			}

			uc.save();
		}, [this.rules, use_tracker_cache, this.rules.use_tracker]);

		if (!this.rules.using_snapshot) {
			var cd = this.collapsedDomains();
			
			if (cd instanceof Array)
				cd.forEach(function (d) {
					if (d === _('All Domains') || (d in self.rules.rules.script) || (d in self.rules.rules.frame) || (d in self.rules.rules.embed) || (d in self.rules.rules.image))
						if (!~new_collapsed.indexOf(d))
							new_collapsed.push(d);
				});

			this.collapsedDomains(new_collapsed);
		}
	},
	isBeta: 0,
	get disabled() {
		return Settings.getItem('isDisabled');
	},
	set disabled(v) {
		Settings.setItem('isDisabled', v);
	},
 	get simpleMode() {
		return Settings.getItem('simpleMode');
	},
	set simpleMode(value) {
		Settings.setItem('simpleMode', value);
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
		return (+new Date() - JB.trialStart < 1000 * 60 * 60 * 24 * 10);
	},
	trial_remaining: function () {
		var seconds = ((JB.trialStart + 1000 * 60 * 60 * 24 * 10) - +new Date()) / 1000,
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
		return this.active_host($$('#page-list').val());
	},
	collapsed: function (k, v) {
		if (v !== undefined) Settings.setItem(k + 'IsCollapsed', v ? 1 : 0);
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
		throttle: function (fn, delay) {
			var timeout = null, last = 0

			return function () {
				var elapsed = Date.now() - last, args = arguments;

				var execute = function () {
					last = Date.now()
					fn.apply(JB, args);
				}

				clearTimeout(timeout);

				if (elapsed > delay)
					execute()
				else
					timeout = setTimeout(execute, delay - elapsed);
			};
		},
		_onces: {},
		once: function (key, callback, thisValue) {
			if (key in this._onces) return false;

			this._onces[key] = 1;

			callback.call(thisValue);
		},
		once_again: function (key) {
			delete this._onces[key];
		},

		position_poppy: function (e, xplus, yplus) {
			var offset = $(e).offset();

			return {
				left: (offset.left + $(e).outerWidth() / 2) + (xplus || 0),
				top: offset.top + (yplus || 0)
			};
		},
		bsize: function(num) {	
			var key, power, num = parseInt(num, 10),
					powers = ['', 'K', 'M', 'G', 'T', 'E', 'P'],
					divisor = /Mac/.test(navigator.platform) ? 1000 : 1024;

			for(key = 0; key < powers.length; key++) {
				power = powers[key];
				if(Math.abs(num) < divisor) break;
				num /= divisor;
			}

			return (Math.round(num * 100) / 100) + ' ' + power + (divisor === 1024 ? 'i' : '') + (power.length ? 'B' : ('byte' + (num === 1 ? '' : 's')));
		},
		date: function (date, type) {
			var h, m, s, time = '';

			date = typeof date === 'number' ? new Date(date) : date;

			for(var i = 0, x = type.length; i < x; i++) {
				switch(type[i]) {
					case '~':
						time += type[++i] || ''; break;
					case 'h':
						time += (((h = date.getHours()) > 12) ? h - 12 : (h == 0) ? 12 : h); break;
					case 'H':
						time += date.getHours(); break;
					case 'm':
						time += (((m = date.getMinutes()) < 10) ? '0' + m : m); break;
					case 's':
						time += (((s = date.getSeconds()) < 10) ? '0' + s : s); break;
					case 'Y':
						time += date.getFullYear(); break;
					case 'y':
						time += date.getFullYear().toString().substr(2); break;
					case 'l':
						time += Strings[Strings.getLanguage()].date.days[date.getDay()]; break;
					case 'L':
						time += Strings[Strings.getLanguage()].date.days_full[date.getDay()]; break;
					case 'f':
						time += Strings[Strings.getLanguage()].date.months[date.getMonth()]; break;
					case 'F':
						time += Strings[Strings.getLanguage()].date.months_full[date.getMonth()]; break;
					case 'd':
						time += date.getDate(); break;
					case 'u':
						time += date.getTime(); break;
					case 'c':
						var f = date.getTime() / 100;
						time += (f - Math.floor(f)).toString().replace(/^\d*\.|\d{13}$/, ''); break;
					case 'P':
						time += (date.getHours() > 12) ? 'PM' : 'AM'; break;
					case 'p':
						time += (date.getHours() > 12) ? 'pm' : 'pm'; break;
					case 'o':
					case 'O':
						var ord = (type[i] == 'o') ? ['th', 'st','nd','rd'] : ['TH', 'ST', 'ND', 'RD'];
						var val = date.getDate() % 100;
						time += (ord[(val - 20) % 10] || ord[val] || ord[0]); break;
					default:
						time += type[i]; break;
				}
			}

			return time;
		},
	/*[
			['A', 1],
			['B', 2],
			['C', [
				['AC', 1],
				['BC', 2],
				['CC', [
					['ACC', 1],
					['BCC', [1, 2], 1]
				]]
			]],
			['D', 3]
		]*/
		make_object: function (a) {
			var m, i, o = {}, self = this;

			if (a instanceof Array)
				a.forEach(function (m) {
					o[m[0]] = m[1] instanceof Array && m[2] || !(m[1] instanceof Array) ? m[1] : self.make_object(m[1]);
				});

			return o;
		},
		floater: function (scroller, to_float, related, off) {
			var sc = $$(scroller), self = this;

			if (!sc.length)
				return this.timer.timeout('floater_' + scroller + to_float, function (self, scroller, to_float, related, off) {
					self.floater(scroller, to_float, related, off);
				}, 5000, [self, scroller, to_float, related, off]);

			var fb = sc.data('floater_bound') || [];

			if (~fb.indexOf(to_float)) return false;
			
			fb.push(to_float);
			
			sc.data('floater_bound', fb)
				.scroll({ scroller: sc, to_float: to_float, related: related, off: off }, self.utils.throttle(function (event) {
					var d = event.data, off = typeof d.off === 'function' ? d.off.call(JB) : d.off || 0,
							all = $(d.to_float, d.scroller).not('.floater'),
							current_header = all.filter(function () {
								return $(this).offset().top <= off;
							}).filter(':last'),
							next_header = all.eq(all.index(current_header) + 1);

					$(d.to_float, d.scroller).remove('.floater');
					
					if (!current_header.length) return;

					var id = 'clone-' + (current_header.attr('id') || +new Date()),
							current_header_clone = current_header.clone(true, true).insertBefore(current_header).attr('id', id).addClass('floater floater-clone'),
							top = off,
							related_push = 0;
											
					related = d.related ? d.related.call(JB, current_header) : [];
									
					if (related.length) {
						var ooo = off + related.offset().top - off + related.outerHeight() + 3;

						if (ooo < current_header_clone.outerHeight(true) + off) {
							top = ooo - current_header_clone.outerHeight(true) - off;
							related_push = 1;
						}
					}
					
					if (next_header.length && !related_push) {
						var ooo = next_header.offset().top - off - next_header.outerHeight();

						if (ooo < 0) top += ooo;
					}

					current_header_clone.css({
						top: top + ($$('#find-bar:visible').outerHeight(true) || 0),
						zIndex: 999 - off,
						width: current_header.width()
					}).append('<div class="divider floater-divider"></div>');
			}, 300));
		},
		fill: function (string, args) {
			args.forEach(function (v, i) {
				string = string.replace(new RegExp('\\{' + i + '\\}', 'g'), v);
			});
			return string;
		},
		_zero_timeouts: [],
		zero_timeout: function(fn, args) {
			this._zero_timeouts.push([fn, args]);
			window.postMessage('zero-timeout', '*');
		},
		sort_object: function (o, rev) {
			var s = {}, k, b, a = [];
			for (k in o) {
				if (o.hasOwnProperty(k))
					a.push(k);
			}
			a.sort();
			if (rev) a.reverse();
			for (k = 0; a[k]; k++)
				s[a[k]] = o[a[k]];
			return s;
		},
		escape_html: function (text) {
			return text.replace(/</g, '&lt;');
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
			var j = $(e);

			if (!j.hasClass('confirm-click')) {
				j.data('confirm_timeout', setTimeout(function () {
					j.removeClass('confirm-click');
				}, 3000));

				j.addClass('confirm-click');

				return false;
			}

			clearTimeout(j.data('confirm_timeout'));

			j.removeClass('confirm-click');

			return true;
		},
		
		/**
		 * Creates a fancy zoom-in/out window effect.
		 *
		 * @param {jQuery.Element} e The element to be zoomed in or out.
		 * @param {jQuery.Element} hide The element to be hidden/revealed when e is zoomed in or out.
		 * @param {function} cb Callback function to call once zoom window execution is completed.
		 */
		zoom: function (e, onshow, onstart, onhide) {
			var t = 0.5 * this.speedMultiplier, self = this,
					hide = e.is('.zoom-window-open') ? $$('.zoom-window-hidden:last') : $$('.whoop').filter(':visible'),
					start_value, end_value, start_hide_zoom, end_hide_zoom, c;

			if (e.data('isAnimating') || hide.data('isAnimating')) return false;

			e.data('isAnimating', true).addClass('zoom-window-animating').removeClass('zoom-window-hidden');

			(onstart || $.noop).call(JB);
			
			hide = hide || $('<div />');
			
			hide.addClass('zoom-window-animating zoom-window-hidden');

			hide.find('*:focus').blur();
			e.find('*:focus').blur();
			
			start_value = !e.hasClass('zoom-window') ? 0.7 : 1;
			end_value = start_value === 1 ? 0.7 : 1;
					
			start_hide_zoom = start_value === 1 ? 1.2 : 1;
			end_hide_zoom = start_hide_zoom === 1 ? 1.2 : 1;
					
			if (start_value !== 1) {
				e.addClass('zoom-window').css('zIndex', 999);
				hide.data('scrollTop', hide.scrollTop());
			} else {
				hide.css('zIndex', 0).removeClass('zoom-window-hidden');
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
			
			this.zero_timeout(function (hide, e, end_value, start_value, end_hide_zoom, onshow, t, onhide) {
				hide.css({
					WebkitTransform: 'scale(' + end_hide_zoom + ')',
					opacity: start_value & 1
				});
								
				e.css({
					WebkitTransform: 'scale(' + (end_value & 1) + ')',
					opacity: (end_value & 1) === 0 ? end_value * 0.7 : end_value
				}).one('webkitTransitionEnd', { e: e, s: start_value, h: hide, onshow: onshow, onhide: onhide }, function (event) {
					this.scrollTop = 0;

					var d = event.data;
										
					if (d.s !== 1){
						d.h.hide().css('zIndex', 0);
						d.e.addClass('zoom-window-open');
						(d.onhide || $.noop).call(JB);
					} else {
						d.e.hide().removeClass('zoom-window zoom-window-open');
						d.h.css('zIndex', 999);
						(d.onshow || $.noop).call(JB);
					}

					d.e.data('isAnimating', false).removeClass('zoom-window-animating').css('webkitTransform', '');
					d.h.removeClass('zoom-window-animating').css('webkitTransform', '');
				});
			}, [hide, e, end_value, start_value, end_hide_zoom, onshow, t, onhide]);
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
				var args = $.makeArray(arguments), type = args[0] + 's', name;

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
			Tabs.create({ url: url });
			Popover.hide();
		},
		_attention: !1,
		_has_attention: 0,
		attention: function (mode) {
			var self = this;

			if (mode !== 1 && (this._has_attention || mode < 0)) {
				this.timer.remove('interval', 'toolbar_attention');
				this.timer.timeout('toolbar_attention', function () {
					self._has_attention = false;
										
					ToolbarItems.image(self.disabled ? 'images/toolbar-disabled.png' : 'images/toolbar.png');
				}, 1100);
				
				return false;
			}
			
			this._has_attention = 1;
			
			this.timer.interval('toolbar_attention', function () {
				self._attention = !self._attention;
								
				ToolbarItems
					.image(self._attention ? 'images/toolbar-attn.png' : (self.disabled ? 'images/toolbar-disabled.png' : 'images/toolbar.png'))
					.badge(self._attention ? 0 : 1);
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
		var r = /^([a-zA-Z0-9\-]+):(\/\/)?([^\/]+)\/?/;
		
		try {
			if (!url) url = this.tab.url;
		} catch (e) { return 'ERROR'; }
		
		if (url === 'about:blank') return 'blank';
		if (/^javascript:/.test(url)) return 'JavaScript Protocol';
		if (url in this.caches.active_host) return this.caches.active_host[url];
		if (/^data/.test(url)) return (this.caches.active_host[url] = 'Data URI');
		if (url.match(r) && url.match(r).length > 2) return (this.caches.active_host[url] = url.match(r)[3]);
		return url;
	},
	
	active_protocol: function (host) {
		try {
			return host.substr(0, host.indexOf(':')).toUpperCase();
		} catch (e) {
			console.error('Problem with host:', host);
		}
	},
	
	/**
	 * Separates a hostname into its subdomain parts.
	 *
	 * @param {string} domain The hostname to separate into pieces.
	 * @return {Array} Parts of the hostname, including itself and * (All Domains)
	 */
	domain_parts: function (domain) {
		if (domain in this.caches.domain_parts) return this.caches.domain_parts[domain].slice(0);
		if (domain === 'blank') return ['blank', '*'];

		var ip = /^([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})(:[0-9]{1,7})?$/,
				s = domain.split(/\./g).reverse(), t = s[0], p = ['*'], i, b,
				ex = ['co.uk', 'me.uk', 'org.uk', 'com.cn', 'org.cn', 'com.tw', 'org.tw', 'com.mx', 'co.nz', 'net.nz', 'org.nz',
						'us.com', 'uk.com', 'eu.com', 'de.com', 'co.jp', 'com.au'];
						
		if (ip.test(domain)) return [domain, '*'];
		
		for (i = 1; i < s.length; i++) {
			t = s[i] + '.' + t;
			if (!~ex.indexOf(t))
				p.push(t);
		}
			
		if (p.length === 1) p.push(domain);
		
		this.caches.domain_parts[domain] = p.reverse();
				
		return this.domain_parts(domain);
	},
	rules: {
		blacklist: {},
		whitelist: {},
		get quick() {
			return Settings.getItem('quickAdd');
		},
		get simplified() {
			return this.simpleMode && Settings.getItem('simplifiedRules');
		},
		get data_types() {
			return {
				script: {}, frame: {}, embed: {}, video: {}, image: {}, special: {},
				hide_script: {}, hide_frame: {}, hide_embed: {}, hide_video: {}, hide_image: {}, hide_special: {}
			};
		},
		_loaded: false,
		get rules() {
			if (this._loaded) return this._rules;
		
			this._loaded = true;
			
			var c = Settings.getItem(this.which);
			
			this._rules = c ? JSON.parse(c) : this.data_types;
			this._rules = $.extend(this.data_types, this._rules);
		
			return this._rules;
		},
		set rules(v) {
			this._rules = v;
			this.save();
		},
		get current_rules() {
			var c = Settings.getItem(this.which),
					rules = c ? JSON.parse(c) : this.data_types;
					rules = $.extend(this.data_types, rules);

			return rules;
		},
		get which () {
			return this.simplified ? 'SimpleRules' : 'Rules';
		},
		use_tracker: {
			_tracked: {},
			load: function () {
				var c = Settings.getItem(this.rules.which + 'UseTracker');

				try {
					this._tracked = c ? JSON.parse(c) : {};
				} catch (e) {}
			},
			save: function () {
				this.utils.timer.timeout('save_rules_use_tracker', function (tracked, self) {
					Settings.setItem(self.rules.which + 'UseTracker', JSON.stringify(tracked));
				}, 1000, [this._tracked, this]);
			},
			clear: function () {
				this._tracked = {};
				this.save();
			},
			use: function () {
				var args = $.makeArray(arguments),
						cat = args.shift(),
						key = args.join('');

				if (!(cat in this._tracked)) this._tracked[cat] = {};
				if (!(key in this._tracked[cat])) this._tracked[cat][key] = { uses: 0 };

				this._tracked[cat][key].uses++;
				this._tracked[cat][key].lastUsed = +new Date();

				this.save();

				return this._tracked[cat][key];
			},
			unuse: function () {
				var args = $.makeArray(arguments),
						cat = args.shift(),
						key = args.join('');

				if (!(cat in this._tracked)) return;
				if (key.length) delete this._tracked[cat][key];
				else delete this._tracked[cat];

				this.save();
			},
			uses: function () {
				var args = $.makeArray(arguments),
						cat = args.shift(),
						key = args.join('');

				if (!(cat in this._tracked) || !(key in this._tracked[cat])) return { uses: 0, lastUsed: 0 };
				
				return this._tracked[cat][key];
			}
		},
		warm_caches: function () {
			this.cache = this.data_types;

			return;

			for (var kind in this.rules)
				this.utils.zero_timeout(function (kind, rules) {
					for (var domain in rules)
						this.utils.zero_timeout(function (kind, domain) {
							this.for_domain(kind, domain, true);
						}.bind(this, kind, domain));
				}.bind(this, kind, this.rules[kind]));
		},
		reload: function (snapshot) {
			if (snapshot) return this.use_snapshot(snapshot, 1);

			this._loaded = false;

			for (var kind in this.data_types)
				this.cache[kind] = {};
		},
		show_snapshots: function () {
			this.busy = 1;

			var snapshots = this.snapshots.all(1),
					ul = $$('#current-snapshots'),
					ul_unkept = $$('#snapshots-list-unkept').empty(),
					ul_kept = $$('#snapshots-list-kept').empty(), self = this, compared;

			$$('#snapshots-info').html(_('You have {1} snapshots using {2} of storage.', [this.snapshots.count(), this.utils.bsize(this.snapshots.size())]));

			for (var id in snapshots) {
				$([
					'<li id="snapshot-', id, '" class="', id === this.using_snapshot ? 'using' : '', snapshots[id].keep ? ' kept' : '', '">',
						'<a class="', Settings.getItem('traverseSnapshots') ? 'selectable' : '', ' snapshot-date" data-id="', id, '">', snapshots[id].name ? self.utils.escape_html(snapshots[id].name) : this.snapshots.date(id), '</a> ',
						'<input type="button" value="', self.using_snapshot === id ? _('Close Snapshot') : _('Open Preview'), '" class="preview-snapshot" /> ',
						'<div class="divider"></div>',
					'</li>'].join('')).appendTo(snapshots[id].keep ? ul_kept : ul_unkept);

				this.utils.zero_timeout(function (rules, id) {
					var compare = rules.snapshots.compare(id, rules.current_rules);
					$$('#snapshot-' + id).find('a').toggleClass('equal', compare.equal);
				}, [this, id]);
			}

			this.utils.zero_timeout(function (me) {
				me.busy = 0;
			}, [this]);

			ul_kept.find('.divider:last').addClass('invisible');
			ul_unkept.find('.divider:last').addClass('invisible');
		},
		get using_snapshot() {
			return Settings.getItem('usingSnapshot');
		},
		set using_snapshot(v) {
			Settings.setItem('usingSnapshot', v);
		},
		use_snapshot: function (id, no_info_update) {
			this.reload();

			this.using_snapshot = 0;

			if (parseInt(id, 10)) {
				var snapshot = this.snapshots.load(id);

				if (snapshot) {
					if (!no_info_update)
						$$('.snapshot-info').show().html(_('Snapshot Preview: {1}', [this.snapshots.name_or_date(id)])).data('id', id);
					
					this._loaded = true;
					this.using_snapshot = id;
					this._rules = snapshot;
				}
			} else if(!no_info_update)
				$$('.snapshot-info').hide();

			try {
				Tabs.messageActive('updatePopover');
			} catch (e) {}
		},
		convert: function () {
			var from = JSON.parse(Settings.getItem('Rules')), kind, domain, rule, totest, conv, un = {}, has_unconvert = 0,
					simbefore = this.simpleMode, rulebefore = Settings.getItem('simplifiedRules');;

			this.reload();

			Settings.setItem('simpleMode', true);
			Settings.setItem('simplifiedRules', true);

			for (kind in from) {
				if (!(kind in un)) un[kind] = {};
				for (domain in from[kind]) {
					if (!(domain in un[kind])) un[kind][domain] = {};
					for (rule in from[kind][domain]) {
						if (from[kind][domain][rule][1] || from[kind][domain][rule][0] === 4 || from[kind][domain][rule][0] === 5) continue;

						if (~kind.indexOf('special')) {
							conv = rule.substr(1, rule.length - 2);
							this.add(kind, domain, conv, from[kind][domain][rule][0], false, false, false);
						} else if (rule === '.*' || rule.indexOf('^.*(All') === 0) {
							this.add(kind, domain, '^.*$', from[kind][domain][rule][0], false, false, false);
						} else if (rule === '^javascript:.*$') {
							this.add(kind, domain, 'javascript:^javascript:.*$', from[kind][domain][rule][0], false, false);
						}	else if (rule === '^data:.*$') {
							this.add(kind, domain, 'data:^data:.*$', from[kind][domain][rule][0], false, false);
						} else if (rule === '^about:blank$') {
							this.add(kind, domain, 'about:blank', from[kind][domain][rule][0], false, false);
						} else if (rule.indexOf(totest = '^http:\\/\\/([^\\/]+\\.)?') === 0) {
							conv = rule.substr(totest.length);
							conv = '.' + conv.substr(0, conv.length - 5).replace(/\\\./g, '.');
							this.add(kind, domain, 'http:' + conv, from[kind][domain][rule][0], false, false);
						} else if (rule.indexOf(totest = '^https:\\/\\/([^\\/]+\\.)?') === 0) {
							conv = rule.substr(totest.length);
							conv = '.' + conv.substr(0, conv.length - 5).replace(/\\\./g, '.');
							this.add(kind, domain, 'https:' + conv, from[kind][domain][rule][0], false, false);
						} else if (rule.indexOf(totest = '^https?:\\/\\/([^\\/]+.)?') === 0) {
							conv = rule.substr(totest.length);
							conv = '.' + conv.substr(0, conv.length - 5).replace(/\\\./g, '.');
							this.add(kind, domain, 'http,https:' + conv, from[kind][domain][rule][0], false, false);
						} else if (rule.indexOf(totest = '^http:\\/\\/') === 0) {
							conv = rule.substr(totest.length);
							conv = conv.substr(0, conv.length - 5).replace(/\\\./g, '.');

							if (~conv.indexOf('\\/'))
								this.add(kind, domain, rule, from[kind][domain][rule][0], false, false);
							else
								this.add(kind, domain, 'http:' + conv, from[kind][domain][rule][0], false, false);
						} else if (rule.indexOf(totest = '^https:\\/\\/') === 0) {
							conv = rule.substr(totest.length);
							conv = conv.substr(0, conv.length - 5).replace(/\\\./g, '.');

							if (~conv.indexOf('\\/'))
								this.add(kind, domain, rule, from[kind][domain][rule][0], false, false);
							else
								this.add(kind, domain, 'https:' + conv, from[kind][domain][rule][0], false, false);
						} else if (rule.indexOf('^') === 0) {
							this.add(kind, domain, rule, from[kind][domain][rule][0], false, false);
						} else {
							has_unconvert = 1;
							un[kind][domain][rule] = from[kind][domain][rule];
						}
					}

					if ($.isEmptyObject(un[kind][domain])) delete un[kind][domain];
				}

				if ($.isEmptyObject(un[kind])) delete un[kind];
			}

			Settings.setItem('simpleMode', simbefore);
			Settings.setItem('simplifiedRules', rulebefore);

			JB.reloaded = false;

			return has_unconvert ? JSON.stringify(un, null, 2) : true;
		},
		convertSimpleToExpert: function () {
			if (!this.donationVerified) return false;

			var self = this, from = JSON.parse(Settings.getItem('SimpleRules')), kind, domain, rule;

			Settings.setItem('simpleMode', false);

			this.reload();

			this.snapshots = new Snapshots('Rules', Settings.getItem('enableSnapshots') ? Settings.getItem('snapshotsLimit') : 0);

			this.snapshots.add(this.rules);

			for (kind in from) {
				for (domain in from[kind]) {
					for (rule in from[kind][domain]) {
						if (from[kind][domain][rule][1] || from[kind][domain][rule][0] === 4 || from[kind][domain][rule][0] === 5) continue;

						if (~kind.indexOf('special')) {
							this.add(kind, domain, '^' + rule + '$', from[kind][domain][rule][0], false, false, false);
						} else if (rule.charAt(0) === '^') {
							this.add(kind, domain, rule, from[kind][domain][rule][0], false, false, false);
						} else {
							var colonIndex = rule.indexOf(':'),
									protos = ~colonIndex ? rule.substr(0, colonIndex).split(',').map(function (v) { return self.utils.escape_regexp(v).toLowerCase(); }) : '*',
									newDomain = rule.substr(colonIndex + 1),
									newRule = '^(' + (protos === '*' ? '.+' : protos.join('|')) + '):\\/\\/' + (newDomain.charAt(0) !== '.' ? self.utils.escape_regexp(newDomain) :
										'([^\\/]+\\.)?' + self.utils.escape_regexp(newDomain.substr(1))) + '\\/.*$';

							if (newDomain.charAt(0) === '^') newRule = newDomain;
							else if (~protos.indexOf('about')) newRule = '^about:blank$';
							else if (~protos.indexOf('javascript')) newRule = '^javascript:' + self.utils.escape_regexp(newDomain.substr(1));
							else if (~protos.indexOf('data')) newRule = '^data:' + self.utils.escape_regexp(newDomain.substr(1));


							this.add(kind, domain, newRule, from[kind][domain][rule][0], false, false, false);
						}
					}
				}
			}

			JB.reloaded = false;

			if ($$('#rules-list').is(':visible')) this.show();

			return true;
		},
		save: function (no_snapshot) {
			if (this.using_snapshot) return false;

			this.utils.timer.timeout('save_rules', function (rules, snapshots, which, self, no_snapshot) {
				try {
					if (Settings.getItem('enableSnapshots') && Settings.getItem('autoSnapshots') && !no_snapshot && !self.using_snapshot) {
						if (Settings.getItem('snapshotIgnoreTemporaryRules')) {
							var filtered_rules = {};

							for (var kind in rules) {
								filtered_rules[kind] = {};

								for (var domain in rules[kind]) {
									filtered_rules[kind][domain] = {};

									for (var rule in rules[kind][domain])
										if (!rules[kind][domain][rule][1])
											filtered_rules[kind][domain][rule] = rules[kind][domain][rule];
								}
							}
						} else
							var filtered_rules = rules;

						self.utils.zero_timeout(function (snapshots, filtered_rules, self) {
							if (!snapshots.compare(snapshots.latest(), filtered_rules).equal) {
								snapshots.delayed_add(filtered_rules, null, 0, null, function (id, snapshot) {
									if ($$('#snapshots').is(':visible')) {
										new Poppy();
										self.show_snapshots();
									}
								});
							}
						}, [snapshots, filtered_rules, self])
					}

					if (!self.using_snapshot)
						Settings.setItem(which, JSON.stringify(rules));
				} catch (e) { }
			}, 1000, [this.rules, this.snapshots, this.which, this, no_snapshot]);
		},
		export: function () {
			if (!this.donationVerified) return '';
		
			return JSON.stringify(this.rules);
		},
		import: function (string) {
			this.reload();
		
			try {
				var r = JSON.parse(string);

				if ('settings' in r) throw 'Nope.';
				
				if (!('script' in r)) {
					var d = this.data_types;
					d.script = r;
					r = d;
				}
			
				if (typeof r === 'object')
					for (var key in r) {
						if (typeof r[key] !== 'object') {
							try {
								r[key] = JSON.parse(r[key]);
							} catch(e) {
								continue;
							}
						}

						for (var domain in r[key]) {
							for (var rule in r[key][domain]) {
								if (r[key][domain][rule].length === 3 && r[key][domain][rule][2]) {
									var nrule = r[key][domain][rule][2] + ':' + rule;
									r[key][domain][nrule] = r[key][domain][rule];
									r[key][domain][nrule].splice(2);
									delete r[key][domain][rule];
								}
							}
						}
					}
			
				var s = JSON.stringify(r);

				Settings.setItem(this.which, s);
			
				return true;
			} catch (e) {
				return false;
			}
		},
		_temporary_cleared: 0,
		clear_temporary: function (once) {
			if (once && this._temporary_cleared) return false;
		
			this._temporary_cleared = 1;

			var kind, domain, rule;
			
			for (kind in this.rules)
				for (domain in this.rules[kind]) {
					for (rule in this.rules[kind][domain]) {
						if (this.rules[kind][domain][rule][1])
							delete this.rules[kind][domain][rule];
					}

					if ($.isEmptyObject(this.rules[kind][domain])) this.remove_domain(kind, domain);
				}

			this.save(1);
		},
		recache: function (kind, d) {
			if (kind === 'frame') {
				var frame, frame_host;
				
				for (frame in this.frames) {
					frame_host = this.utils.active_host(frame);
					
					if ((new RegExp(this.utils.escape_regexp(frame_host) + '$', 'i')).test(d))
						delete this.frames[frame];
				}
			}
			
			if (d === '.*')
				this.cache[kind] = {};
			else if (d.charAt(0) === '.') {
				for (var c in this.cache[kind])
					if ((new RegExp(this.utils.escape_regexp(d) + '$', 'i')).test(c))
						delete this.cache[kind][c];
			} else
				delete this.cache[kind][d];
		},
		easylist: function () {
			var self = this, map = { '5': 'whitelist', '4': 'blacklist' },
					processList = function (list) {
				var def = {}, split = list.split(/\n/), firstTwo = function (str) { return str[0] + str[1]; },
						type_map = { script: 'script', image: 'image', object: 'embed' };

				var processItem = function (whole) {
					var fTwo = firstTwo(whole);

					if (fTwo === '##' || ~whole.indexOf('#@#')) return;

					var mode = fTwo === '@@' ? 5 : 4,
							whole = mode === 5 ? whole.substr(2) : whole,
							dollar = whole.indexOf('$'),
							rule = whole.substr(0, ~dollar ? dollar : 999), regexp, $check = whole.split(/\$/),
							use_type = false, domains = ['.*'];

					if ($check[1]) {
						var args = $check[1].split(',');

						for (var z = 0; z < args.length; z++) {
							if (args[z].match(/^domain=/)) domains = args[z].substr(7).split('|').map(function (v) { return '.' + v; });
							else if (args[z] in type_map) use_type = type_map[args[z]];
						}
					}

					if (whole[0] === '!' || whole[0] === '[' || ~whole.indexOf('##')) return;

					rule = rule.replace(/\//g, '\\/')
						.replace(/\+/g, '\\+')
						.replace(/\?/g, '\\?')
						.replace(/\^/g, '([^a-zA-Z0-9_\.%-]+|$)')
						.replace(/\./g, '\\.')
						.replace(/\*/g, '.*');

					if (firstTwo(whole) === '||') rule = rule.replace('||', 'https?:\\/\\/([^\\/]+\\.)?');
					else if (whole[0] === '|') rule = rule.replace('|', '');
					else rule = '.*' + rule;

					if (rule.match(/\|[^$]/)) return;

					rule = '^' + rule

					if (rule[rule.length - 1] === '|') rule = rule.substr(0, rule.length - 1) + '.*$';
					else rule += '.*$';

					rule = rule.replace(/\.\*\.\*/g, '.*');

					for (var s = 0; s < domains.length; s++) {
						if (firstTwo(domains[s]) === '.~') return;

						var list = JB.rules[map[mode]];

						if (use_type) {
							if (!(use_type in list)) list[use_type] = {};
							if (!(domains[s] in list[use_type])) list[use_type][domains[s]] = {};

							list[use_type][domains[s]][rule] = [mode, false];
						} else {
							for (var kind in JB.rules.data_types) {
								if (!(kind in list)) list[kind] = {};

								if (~kind.indexOf('hide_') || kind === 'special') continue;

								if (!(domains[s] in list[kind])) list[kind][domains[s]] = {};

								list[kind][domains[s]][rule] = [mode, false];
							}
						}
					}
				}

				for (var i = 0, b = split.length; i < b; i++)
					processItem(split[i]);
			};

			var fromSettings = function (which) {
				var el = Settings.getItem(which);

				if (el) processList(el);

				JB.rules.cache = JB.rules.data_types;
			}, lastUpdate = Settings.getItem('EasyListLastUpdate');

			if (lastUpdate && Date.now() - lastUpdate < 432000000) {
				fromSettings('EasyPrivacy');
				fromSettings('EasyList');
				return;
			}

			$.ajax({
				url: 'https://easylist-downloads.adblockplus.org/easyprivacy.txt',
				async: false
			}).success(function (easyprivacy) {
				Settings.setItem('EasyPrivacy', easyprivacy);

				fromSettings('EasyPrivacy');
				$.ajax({
					url: 'https://easylist-downloads.adblockplus.org/easylist.txt',
					async: false
				}).success(function (easylist) {
					Settings.setItem('EasyListLastUpdate', Date.now());
					Settings.setItem('EasyList', easylist);

					fromSettings('EasyList');

					if (!self.setupDone) {
						Settings.setItem('alwaysBlockscript', 'nowhere');
						Settings.setItem('alwaysBlockframe', 'nowhere');
					}
				}).error(function () {
					fromSettings('EasyList');
				});
			}).error(function () {
				fromSettings('EasyPrivacy');
			});
		},
		remove_all_predefined: function (cb) {
			var a, b, c, d, kind, rs = this.rules, k, e, r;

			for (kind in rs)
				for (e in rs[kind]) {
					for (r in rs[kind][e]) {
						if (rs[kind][e][r][0] === 4 || rs[kind][e][r][0] === 5)
							delete this.rules[kind][e][r];
					}

					if ($.isEmptyObject(this.rules[kind][e])) this.remove_domain(kind, e);
				}

			this.save();
		},
		special_allowed: function (special, url) {
			if (!this.donationVerified || !this.special_enabled(special)) return 1;
			
			var host = this.active_host(url),
					domains = this.for_domain('special', host), domain, rule, spec;
			
			for (domain in domains)
				for (spec in domains[domain])
					if ((new RegExp(spec, 'i')).test(special)) {
						this.utils.zero_timeout(function (self, domain, spec, rtype) {
							self.use_tracker.use('special', domain, spec, rtype);
						}, [this, domain, spec, domains[domain][spec][0]]);
						return domains[domain][spec][0];
					}
					
			return 0;
		},
		allowed: function (message) {
			var kind = message[0];

			if (kind.indexOf('hide_') === -1)
				if ((kind !== 'script' && !this.donationVerified) || !this.enabled(kind)) return [1, -84];

			var rule_found = false, the_rule = -1, do_break = 0, urule,
					host = this.active_host(message[1]),
					proto = this.utils.active_protocol(message[2]), protos,
					domains = this.for_domain(kind, host), domain, rule,
					alwaysFrom = Settings.getItem('alwaysBlock' + kind) || Settings.getItem('alwaysBlockscript'),
					hider = ~kind.indexOf('hide_'), ignoreBL = Settings.getItem('ignoreBlacklist'), ignoreWL = Settings.getItem('ignoreWhitelist'),
					sim = this.simplified;

			domainFor:
			for (domain in domains) {
				ruleFor:
				for (rule in domains[domain]) {
					if ((ignoreBL && domains[domain][rule][0] === 4) ||
							(ignoreWL && domains[domain][rule][0] === 5)) continue;

					do_break = this.match(kind, rule, message[2], sim);

					if (do_break) {
						rule_found = domains[domain][rule][0] < 0 ? ((domains[domain][rule][0] * -1) - 5) % 2 : domains[domain][rule][0] % 2;
						the_rule = domains[domain][rule][0];
						
						this.utils.zero_timeout(function (self, kind, domain, rule, rtype) {
							self.use_tracker.use(kind, domain, rule, rtype);
						}, [this, kind, domain, rule, the_rule]);

						break domainFor;
					}
				}
			}

			if (rule_found !== false)
				return [rule_found, the_rule];
							
			if (alwaysFrom !== 'nowhere') {
				var sproto = this.utils.active_protocol(message[2]),
						aproto = this.utils.active_protocol(message[1]);
				
				if (!(Settings.getItem('allowExtensions') && sproto === 'SAFARI-EXTENSION')) {
					var page_parts = this.domain_parts(host),
							script_parts = this.domain_parts(this.active_host(message[2]));
							
					if (script_parts[0] === 'blank' && alwaysFrom !== 'everywhere') return [1, -1];
					
					if ((alwaysFrom === 'topLevel' && page_parts[0] !== script_parts[0]) ||
							(alwaysFrom === 'domain' && page_parts[page_parts.length - 2] !== script_parts[script_parts.length - 2]) ||
							(alwaysFrom === 'everywhere') ||
							(aproto === 'HTTPS' && (Settings.getItem('secureOnly') && sproto !== aproto))) {
						if (Settings.getItem('saveAutomatic') && !this.simpleMode && !hider &&
								(!PrivateBrowsing() ||
									(PrivateBrowsing() && Settings.getItem('savePrivate')))) {
							var rule_added = 1, script = message[2], ind = script.indexOf('?'), rr = '^' + this.utils.escape_regexp(~ind ? script.substr(0, script.indexOf('?')) : script) + '(\\?.*)?$';
										
							this.add(kind, host, rr, 2, true, true);
							this.use_tracker.use(kind, host, rr, 2);
						} else
							var rule_added = 0;
					
						return [0, rule_added ? 2 : -1];
					}
				}
			}
	
			return [1, -1];
		},
		for_domain: function (kind, domain, one, hide_wlbl) {
			if (!(kind in this.rules) || (kind !== 'script' && !this.donationVerified)) return {};
					
			if (domain in this.cache[kind]) {
				var rules = {};
			
				if (one) {
					if (domain in this.cache[kind][domain] && typeof this.cache[kind][domain][domain] === 'object')
						rules[domain] = this.cache[kind][domain][domain];
					else
						rules[domain] = {};
				} else
					rules = this.cache[kind][domain];

				return rules;
			}
						
			var parts = this.utils.domain_parts(domain);
		
			if (parts.length === 1 && domain !== '.*') return this.for_domain(kind, '.*', one, hide_wlbl);
		
			var x = parts.slice(0, 1),
					y = parts.slice(1),
					o = {}, i, c, r, append_lists = kind.indexOf('hide_') === -1 && kind !== 'special';
		
			x.push(x[0]);
		
			parts = x.concat(y);
	
			for (i = 0; i < parts.length; i++) {
				c = (i > 0 ? '.' : '') + parts[i];
				if (c === '.*') continue;
				r = $.extend(true, {},
					(append_lists && !hide_wlbl && !Settings.getItem('ignoreBlacklist') ? JB.rules.blacklist[kind][c] || {} : {}),
					(append_lists && !hide_wlbl && !Settings.getItem('ignoreWhitelist') ? JB.rules.whitelist[kind][c] || {} : {}),
					this.rules[kind][c] || {});

				if ($.isEmptyObject(r)) continue;

				o[c] = r;
			}

			if (!('.*' in this.cache[kind]))
				this.cache[kind]['.*'] = { '.*': $.extend(true, {},
					(append_lists && !hide_wlbl ? JB.rules.blacklist[kind]['.*'] || {} : {}),
					(append_lists && !hide_wlbl ? JB.rules.whitelist[kind]['.*'] || {} : {}),
					this.rules[kind]['.*'] || {}) };

			o['.*'] = this.cache[kind]['.*']['.*'];

			this.cache[kind][domain] = o;

			return this.for_domain(kind, domain, one);
		},
		match: function (kind, rule, url, simplified) {
			if (rule[0] !== '^' && simplified) {
				var rrule = this.with_protos(rule), parts = this.utils.domain_parts(this.utils.active_host(url));

				if (rrule.protos && !~rrule.protos.indexOf(this.utils.active_protocol(url))) return 0;

				if ((~kind.indexOf('special') && rrule.rule === url) ||
						(rrule.rule.indexOf('.') === 0 && ~parts.indexOf(rrule.rule.substr(1))) || 
						(parts[0] === rrule.rule))
					return 1;
				return 0;
			}

			var ref, matcher = (ref = this.caches.rule_regexp[rule]) ? ref : this.caches.rule_regexp[rule] = new RegExp(rule, 'i');

			try {
				return matcher.test(url);
			} catch (e) {
				console.error('Error:', rule)
			}
		},
		with_protos: function (rule) {
			if (!this.simplified || rule.charAt(0) === '^') {
				return {
					rule: rule,
					protos: false
				};
			}

			var srule = rule.split(':'), ps;

			return {
				rule: srule.length === 1 ? srule[0] : srule.slice(1).join(':'),
				protos: srule.length === 1 || !srule[0].length ? false : ((ps = srule[0].toUpperCase().split(','))[0].length ? ps : false)
			};
		},
		add: function (kind, domain, pattern, action, add_to_beginning, temporary) {
			if (!pattern.length || (kind !== 'script' && !this.donationVerified) || this.using_snapshot) return false;

			this.collapsed('LastRuleWasTemporary', temporary);
		
			var rules = this.for_domain(kind, domain, true);

			action = parseInt(action, 10);

			if (!(domain in rules)) rules[domain] = {};
				
			if (!add_to_beginning)
				rules[domain][pattern] = [action, !!temporary];
			else {
				var new_rules = this.utils.make_object([[domain, [[pattern, [action, !!temporary], 1]]]]), e;
			
				if (domain in rules)
					for (e in rules[domain])
						if (e !== pattern)
							new_rules[domain][e] = rules[domain][e];
			
				rules = new_rules;
			}
		
			this.recache(kind, domain);

			this.rules[kind][domain] = rules[domain];
		
			this.save();
		},
		remove: function (kind, domain, rule, delete_automatic) {
			if ((kind !== 'script' && !this.donationVerified) || this.using_snapshot) return false;
			
			var rules = this.for_domain(kind, domain), key;

			if (!(domain in rules)) return false;
			
			this.recache(kind, domain);

			try {
				if (!delete_automatic && rules[domain][rule][0] > 1 && rules[domain][rule][0] < 4) {
					this.rules[kind][domain][rule][0] *= -1;
					this.rules[kind][domain][rule][1] = false;
				} else
					delete this.rules[kind][domain][rule];
			} catch(e) { }

			if ($.isEmptyObject(this.rules[kind][domain]))
				this.remove_domain(kind, domain);
			
			this.save();
		},
		remove_matches: function (kind, matches) {
			var domain, i, rule;

			for (domain in matches) {
				this.recache(kind, domain);

				for (i = 0; matches[domain][i]; i++) {
					rule = matches[domain][i];

					if ((rule[1][0] > 1 && rule[1][0] < 4) || rule[1][0] < 0) {
						this.rules[kind][domain][rule[0]][0] *= -1;
						this.rules[kind][domain][rule[0]][1] = rule[1][0] >= 1;
					} else if (rule[1][0] > -1)
						this.remove(kind, domain, rule[0]);
				}
			}

			this.save();
		},
		matching_URLs: function (kind, domain, urls, block_allow, show_wlbl) {
			if (kind !== 'script' && !this.donationVerified) return false;
			
			var rules = this.for_domain(kind, domain), matches = {}, match_tracker = {}, domain, rule, rtype, sim = this.simplified;
		
			for (domain in rules) {
				matches[domain] = [];
				match_tracker[domain] = [];

				for (rule in rules[domain]) {
					rtype = rules[domain][rule][0];
					rtype = rtype < 0 ? (rtype - 5) * -1 : rtype;

					if ((!!(rtype % 2) !== block_allow) ||
							(!show_wlbl && (rtype === 4 || rtype === 5))) continue;

					for (var i = 0; i < urls.length; i++) {		
						if (this.match(kind, rule, urls[i], sim) && !~match_tracker[domain].indexOf(rule)) {
							match_tracker[domain].push(rule);
							matches[domain].push([rule, rules[domain][rule]]);
						}
					}
				}

				if (!matches[domain].length) delete matches[domain];
			}

			return matches;
		},
		remove_domain: function (kind, domain) {
			this.recache(kind, domain);
			delete this.rules[kind][domain];
			this.save();
		},
		make_message: function (kind, rule, rtype, temp) {
			var cache_check = [kind, rule, rtype, temp].join(), simp = this.simplified.toString();

			if (cache_check in this.caches.messages[simp]) return this.caches.messages[simp][cache_check];

			var um = ~kind.indexOf('hide_') ? 'Hide' : (rtype % 2 ? 'Allow' : 'Block'),
					um = temp ? um.toLowerCase() : um,
					message = temp ? [_('Temporarily'), _(um)] : [_(um)],
					ukind = ~kind.indexOf('hide_') ? kind.substr(5) : kind,
					proto = this.simplified ? this.with_protos(rule).protos : false,
					rule = this.with_protos(rule).rule,
					unique = ['^data:.*$', '^javascript:.*$', '^.*$'];

			if (ukind === 'special') {
				if (rule === unique[2]) message.push('all others')
				else {
					if (rule.charAt(0) === '^') message.push('others matching');
					message.push('<b>' + (rule.charAt(0) === '^' ? rule : _(rule).toLowerCase()) + '</b>');
				}
			} else {
				if (proto) {
					var mapper = function (v) {
								var tr = _(v);

								if (~tr.indexOf(':NOT_LOCALIZED')) tr = v;

								return '<span class="' + v + '">' + tr + '</span>';
							},
							gfirst = proto.slice(0, proto.length - 1).map(mapper),
							glast = proto.slice(proto.length - 1).map(mapper),
							local_p = gfirst.length ? gfirst.join(', ') + (gfirst.length > 1 ? ', ' : ' ') + _('and') + ' ' + glast[0] : glast[0];
				} else
					var local_p = proto;

				if (local_p && (rule.charAt(0) !== '^' || ~unique.indexOf(rule))) message.push(local_p);

				var um = rtype % 2 ? 'Allow' : 'Block';
				um = temp ? um.toLowerCase() : um;

				if (rule === '^.*$' && !proto) message.push(_('all'));

				message.push(_(ukind + 's'));

				if (!~unique.indexOf(rule)) {
					message.push(rule.charAt(0) === '.' ? 'within' : (rule.charAt(0) === '^' ? 'matching' : 'from'));
					message.push('<b>' + (rule.charAt(0) === '.' ? rule.substr(1) : rule) + '</b>');
				}
			}

			this.caches.messages[simp][cache_check] = message;

			return message;
		},
		show: function () {
			var self = this;

			this.busy = 1;

			$$('#edit-domains').removeClass('edit-mode');

			if (this.using_snapshot)
				$$('.snapshot-info').show().data('id', this.using_snapshot);

			for (var kind in this.data_types) {
				if (!$$('#head-' + kind + '-rules').length)
					$$('#rule-container').append(Template.create('rule_wrapper', {
						kind: kind,
						local: _(kind + ' Rules')
					}));
				
				var head = $$('#head-' + kind + '-rules').show(), wrap = $$('#rules-list-' + kind + 's').parent().show();
				
				if (!this.enabled(kind)) {
					head.hide();
					wrap.hide();
				} else {
					head.show();
					wrap.show();
				}

				var ul = $$('#rules-list #data ul#rules-list-' + kind + 's').empty().css({ marginTop: '-3px', marginBottom: '6px', opacity: 1 });
				
				if (kind in this.rules) {
					var sorted = this.utils.sort_object(this.rules[kind]);

					ul.css({ marginTop: '-3px', marginBottom: '6px', opacity: 1 });

					for (var domain in sorted)
						ul.append($('> li', this.view(kind, domain, undefined, null, true)));
				}
			}
			
			function remove_domain (event) {
				event.stopPropagation();
				
				var li = $(this.parentNode), d = li.data('domain');
				
				if (!self.utils.confirm_click(this) || li.is(':animated')) return false;
																	
				self.remove_domain(li.data('kind'), d);
				
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
					$$('#domain-filter').trigger('search');
				});
			}

			function recover_domain(event) {
				event.stopPropagation();

				var li = $(this.parentNode), kind = li.data('kind'), domain = li.data('domain'),
						current_rules = self.current_rules, off = self.utils.position_poppy(this, 0, 14),
						left = off.left, top = off.top;

				new Poppy(left, top, [
					'<p class="misc-info">', _('Recover')	, '</p>',
					'<input type="button" id="recover-domain-merge" value="', _('Merge'), '" /> ',
					'<input type="button" id="recover-domain-replace" value="', _('Replace'), '" />'].join(''), function () {
						$$('#recover-domain-merge').click(function () {
							if (!(domain in current_rules[kind]))
								current_rules[kind][domain] = self.rules[kind][domain];
							else
								for (var rule in self.rules[kind][domain])
									current_rules[kind][domain][rule] = self.rules[kind][domain][rule];

							Settings.setItem(self.which, JSON.stringify(current_rules));

							new Poppy(left, top, _('Domain merged with current rule set.'));
						}).siblings('#recover-domain-replace').click(function () {
							current_rules[kind][domain] = self.rules[kind][domain];
							Settings.setItem(self.which, JSON.stringify(current_rules));

							new Poppy(left, top, _('Domain replaced in current rule set.'));
						});
				});
			}
			
			$$('.rules-wrapper .domain-name')
				.prepend('<div class="divider"></div><input type="button" value="' + (this.using_snapshot ? _('Recover') : _('Remove')) + '" />')
				.find('input').click(this.using_snapshot ? recover_domain : remove_domain);

			$$('#filter-state-all').siblings('li').removeClass('selected').end().addClass('selected');

			$$('#filter-type-used li.selected').click();

			this.busy = 0;
		},
	
		/**
		 * Creates a <ul> displaying rules with actions to affect them.
		 *
		 * @param {string} domain Domain to display rules for
		 * @param {string|Boolean} url A url the rule must match in order to be displayed
		 * @param {Boolean} no_dbl_click Wether or not to enable double clicking on a rule
		 */
		view: function (kind, domain, url, no_dbl_click, hide_wlbl, match_rtype) {
			var self = this, allowed = this.for_domain(kind, domain, true, hide_wlbl),
					ul = $('<ul class="rules-wrapper"></ul>'), newul,
					rules = 0, rule, urule, did_match = !1, rtype, artype, temp, proto;

			if (kind !== 'script' && !this.donationVerified && !~kind.indexOf('hide_')) return ul;
			
			if (domain in allowed) {
				allowed = allowed[domain];

				var i, j = this.collapsedDomains(),
						domain_name = (domain.charAt(0) === '.' && domain !== '.*' ? domain : (domain === '.*' ? _('All Domains') : domain)),
						settings = {
							ignoreBL: Settings.getItem('ignoreBlacklist'),
							ignoreWL: Settings.getItem('ignoreWhitelist')
						}, sim = this.simplified,
						_recover = _('Recover'), _restore = _('Restore'), _disable = _('Disable'), _delete = _('Delete');
			
				newul = ul.append(Template.create('rule_wrapper_inner', {
					selectable: Settings.getItem('traverseRulesDomains') ? 'selectable' : '',
					domain: self.utils.escape_html(domain_name),
					domain_display: domain === '.*' ? _('All Domains') : domain
				})).find('.domain-name').data({ domain: domain, kind: kind }).end().find('.domain-rules ul');
			
				for (rule in allowed) {
					rules++;
					rtype = allowed[rule][0];
					artype = rtype < 0 ? (rtype - 5) * -1 : rtype;
					temp = allowed[rule][1];

					if (hide_wlbl && (rtype === 4 || rtype == 5)) continue;
					if (typeof match_rtype === 'number' && (artype % 2) !== match_rtype) continue;

					if (url instanceof Array)
						for (i = 0; url[i]; i++)						
							if ((did_match = this.match(kind, rule, url[i], sim)))
								break;

					if ((url && !did_match) || 
							(settings.ignoreBL && rtype === 4) ||
							(settings.ignoreWL && rtype === 5)) continue;
					
					newul.append(Template.create('rule_item', {
						rtype: rtype,
						text: sim ? this.make_message(kind, rule, rtype, temp).join(' ') : rule,
						temp: temp,
						button: (this.using_snapshot ? _recover: (rtype < 0 ? _restore : (rtype === 2 ? _disable : _delete))),
					})).find('li:last').data({
						rule: rule,
						domain: domain,
						type: rtype,
						kind: kind,
						temp: temp,
						uses: this.use_tracker.uses(kind, domain, rule, rtype)
					});
				}

				if (!rules)
					newul.append(Template.create('rule_item', {
						rtype: 900,
						text: _('No rules exist for this domain.'),
						temp: false,
						button: null
					})).find('li:last').data({
						rule: '',
						domain: domain,
						type: 900,
						kind: kind,
						temp: false,
						uses: null
					});
			
				$('.divider:last', newul).addClass('invisible');
					
				if (j && ~j.indexOf(domain_name))
					newul.parent().prev().addClass('hidden');
							
				$('li span', ul).toggleClass('nodbl', no_dbl_click === true);

				if (!newul.find('li').length) ul.empty();
			}

			return ul;
		}
	},
	add_rule_host: function (me, url, left, top, allow, return_a) {
		var self = this,
				hostname = me.parent().data('url'), rule,
				one_script = me.parent().data('script'),
				kind = me.parent().data('kind'),
				proto = self.utils.active_protocol(one_script[0]),
				parts = ~['HTTP', 'HTTPS', 'FTP'].indexOf(proto) ? self.utils.domain_parts(hostname) : [hostname, '*'], a = [],
				page_parts = self.utils.domain_parts(self.host), n,
				opt = '<option value="{0}">{1}</option>';
				
		if (kind !== 'script' && !this.donationVerified)
			return new Poppy(left, top + 12, _('Donation Required'));
		
		if (~kind.indexOf('special'))
			a.push(this.utils.fill(opt, [(!this.simpleMode ? '^' : '') + one_script[0] + (!this.simpleMode ? '$' : ''), hostname]));
		else {
			switch (hostname) {
				case 'blank':
					a.push(this.utils.fill(opt, ['blank', 'blank'])); break;
				case 'Data URI':
					a.push(this.utils.fill(opt, ['^data:.*$', 'Data URI'])); break;
				case 'JavaScript Protocol':
					a.push(this.utils.fill(opt, ['^javascript:.*$', 'JavaScript Protocol'])); break;
				default:
					for (var x = 0; x < parts.length - 1; x++)
						if (this.rules.simplified)
							a.push(this.utils.fill(opt, [proto + ':' + (x > 0 ? '.' : '') + parts[x], (x > 0 ? '.' : '') + parts[x]]));
						else
							a.push(this.utils.fill(opt, ['^(' + proto.toLowerCase() + '):\\/\\/' + (x === 0 ? self.utils.escape_regexp(parts[x]) :
								'([^\\/]+\\.)?' + self.utils.escape_regexp(parts[x])) + '\\/.*$', (x > 0 ? '.' : '') + parts[x]]));
				break;
			}
		}

		if (return_a) return a;

		var cs = [
			'<option value="', allow ? 1 : 0, '">', allow ? _('Allow') : _('Block'), '</option>',
			'<option value="42">', _('Hide'), '</option>'
		];
			
		new Poppy(left, top + 12, [
				'<p class="misc-info">', _('Adding a ' + kind + ' Rule'), '</p>',
				'<p>',
					'<input id="domain-script-temporary" type="checkbox"', self.collapsed('LastRuleWasTemporary') ? ' checked' : '', ' />',
					'<label for="domain-script-temporary">&thinsp;', _('Temporary rule'), '</label> ',
				'</p>',
				'<p>',
					Template.create('domain_picker', { page_parts: page_parts }),
				'</p>',
				'<p>',
					'<select id="which-type" class="', allow ? 'allowed' : 'blocked', '-color">', cs.join(''), '</select> ',
					'<select id="domain-script" class="', proto, ' kind-', kind, a.length === 1 ? ' single' : '', '"', a.length === 1 ? ' tabindex="-1"' : '', '>', a.join(''), '</select> ',
					'<input id="domain-script-continue" type="button" value="', _('Save'), '" />',
				'</p>'].join(''), function () {
					$$('#domain-script-continue').click(function () {
						var	h = $$('#domain-picker').val(),
								temp = $$('#domain-script-temporary').is(':checked'),
								hider = $$('#which-type').val() === '42';
						
						self.rules.add((hider ? 'hide_' : '') + kind, h, $$('#domain-script').val(), hider ? 42 : (allow ? 1 : 0), true, temp, proto);
							
						Tabs.messageActive('reload');

						$$('#page-list')[0].selectedIndex = 0;
					}).siblings('#which-type').change(function () {
						$(this).toggleClass((allow ? 'allowed' : 'blocked') + '-color', this.value !== '42');
					});
		});
	},
	clear_ui: function () {
		$$('#toggle-hidden').addClass('disabled');
		$$('#main .urls-inner').empty();
		$$('#page-list').attr('title', null).removeData().find('optgroup').empty();
		$$('.column > .info-container label ~ span').text(0).next().hide();
	},
	bind_events: function(some, host) {
		if (!this.popover) return;

		var add_rule, remove_rule, self = this,
				alblspan = '#allowed-script-urls ul li:not(.show-me-more) span, #blocked-script-urls ul li:not(.show-me-more) span';
		
		function toggle_find_bar (show_only) {
			var f = $$('#find-bar'),
					v = f.is(':visible');
			
			if (v && show_only) return false;
			
			var	h = 25,
					a = v ? f.show() : f.hide(),
					m = (f.slideToggle(200 * self.speedMultiplier).toggleClass('visible').hasClass('visible')) ? '-' : '+',
					mM = m === '-' ? '+' : '-';
			
			$$('.whoop').animate({
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

		function url_display (e) {
			var me = $(this), t = $(this).siblings('span:first'), pa = t.parent(), off = t.offset(), kind = pa.data('kind'),
					left = Math.floor(me.offset().left + me.outerWidth() / 2);
		
			function codeify(data) {
				function do_highlight (data, no_zoom) {
					$$('#misc-content pre').remove();
					
					$('<pre />').append('<code class="javascript"></code>').find('code').text(data).end().appendTo($$('#misc-content'));
					if (!no_zoom) self.utils.zoom($$('#misc').find('.misc-header').text(t.text()).end());
					var p = $$('#misc-content pre code');
					p.data('unhighlighted', p.html());
					self.hljs.highlightBlock(p[0]);
				}
				
				$$('#beautify-script').remove();
				
				if (kind === 'script')
					$('<input type="button" value="' + _('Beautify Script') + '" id="beautify-script" />')
							.appendTo($$('#misc .info-container')).click(function () {
								data = js_beautify(data, {
									indent_size: 2
								});
								
								do_highlight(data, true);
							});
				
				do_highlight(data);
			}
			
			function script_info () {
				var host = encodeURI(self.simpleMode ? t.text() : self.utils.active_host(t.text()));
				
				new Poppy(left, off.top + 10, [
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
				new Poppy(left, off.top + 10, _(sp + ':' + wh, [self.special_enabled(sp)]));
			} else if (self.simpleMode && (!pa.hasClass('by-rule') || pa.hasClass('unblockable'))) {
				script_info();
			} else 
				new Poppy(left, off.top + 10, [
					'<input type="button" value="', _('More Info'), '" id="script-info" /> ',
					self.simpleMode || kind === 'embed' ? '' : '<input type="button" value="' + _('View ' + kind + ' Source') + '" id="view-script" /> ',
					pa.hasClass('by-rule') && !pa.hasClass('unblockable') ? '<input type="button" value="' + _('Show Matched Rules') + '" id="matched-rules" />' : ''].join(''), function () {
						$$('#poppy').find('#script-info').click(script_info).end().find('#matched-rules').click(function () {
							var block_allow = !me.parents('div').attr('id').match(/blocked/),
									matches = self.rules.matching_URLs(pa.data('kind'), self.host, pa.data('script'), block_allow, true), d,
									con = $('<div />'),
									wrapper = $('<ul class="rules-wrapper" />').appendTo(con);
							
							con.prepend('<p class="misc-info">' + _('Matched ' + me.parents('.main-wrapper').attr('id').substr(14) + ' Rules') + '</p>');

							for (d in matches)
								wrapper.append(self.rules.view(pa.data('kind'), d, pa.data('script'), true, false, block_allow ? 1 : 0).find('> li').find('input').remove().end());

							$('li.domain-name', wrapper).removeClass('hidden').addClass('no-disclosure');

							new Poppy(left, off.top + 10, con);
						}).end().find('#view-script').click(function () {
							if (kind === 'image') {
								new Poppy();
								$$('#beautify-script').remove();
								$$('#misc-content').html('<img src="' + t.html() + '" />');
								self.utils.zoom($$('#misc').find('.misc-header').text(t.text()).end());
								return false;
							}
							
							if (/^data/.test(t.text())) {
								var dd = t.text().match(/^data:(([^;]+);)?([^,]+),(.+)/), mime = ['text/javascript', 'text/html', 'text/plain'];

								if (dd && dd[4] && ((dd[2] && ~mime.indexOf(dd[2].toLowerCase())) ||
										(dd[3] && ~mime.indexOf(dd[3].toLowerCase())))) {
									codeify(unescape(dd[4]));
									new Poppy();
								} else
									new Poppy(left, off.top + 10, '<p>' + _('This data URI cannot be displayed.') + '</p>');
							} else {
								new Poppy(left, off.top + 10, '<p>' + _('Loading ' + kind) + '</p>', $.noop, function () {
									try {
										$.ajax({
											dataType: 'text',
											url: t.text(),
											success: function (data) {
												codeify(data);
												new Poppy();
											},
											error: function (req) {
												new Poppy(left, off.top + 10, '<p>' + req.statusText + '</p>');
											}
										});
									} catch (er) {
										new Poppy(left, off.top + 10, '<p>' + er + '</p>');
									}
								}, 0.1);
							}
						});
					});
		}

		$(this.popover.body).keydown(function (e) {
			var UP = 38, DOWN = 40, LEFT = 37, RIGHT = 39;

			switch (e.which) {
				case 9: // TAB
					if (!$$('.poppy').length)  {
						var current = $$('.current-selection:visible');

						if (current.length) {
							var sibs = current.siblings('input:not(:focus):visible:first'),
									children = current.children('input:not(:focus):visible:first');

							if (sibs.length) {
								e.preventDefault();
								sibs.focus();
							} else if (children.length) {
								e.preventDefault();
								children.focus();
							}
						}
					}
				break;

				case 27: // ESCAPE
					var focused = $$('*:focus');

					if ($$('#find-bar-search').is(':focus')) {
						e.preventDefault();
						$$('#find-bar-done').click();
					}

					if (focused.length) {
						e.preventDefault();
						e.stopPropagation();
						focused.blur();
					} else if ($$('.poppy').length) {
						e.preventDefault();
						e.stopPropagation();
						new Poppy();
						new Poppy(true);
					} else if ($$('.current-selection').length) {
						e.preventDefault();
						e.stopPropagation();
						$$('.current-selection').removeClass('current-selection');
					}
				break;

				case 3:
				case 13: // ENTER
					if (!$$('.poppy').length && !$$('input:focus, textarea:focus, select:focus').length) {
						e.preventDefault();
						$$('.whoop:not(#disabled):visible:first').find('.current-selection').trigger('enter');
					}
				break;

				case 17:
				case 18: // ALT/OPTION
					self.optionKey = true;
					self.utils.timer.timeout('no_optionkey', function (self) {
						self.optionKey = false;
					}, 1000, [self]);
				break;
			
				case 16: // SHIFT
					self.speedMultiplier = !self.useAnimations ? 0.001 : 20; break;
			
				case 93:
				case 91: // COMMAND/CONTROL
				case 17:
					if ((window.navigator.platform.match(/Win/) && e.which === 17) || !window.navigator.platform.match(/Win/)) {
						self.commandKey = true;
						self.utils.timer.timeout('no_commandkey', function (self) {
							self.commandKey = false;
						}, 1000, [self]);
					}
				break;

				case 70:  // F
					if (self.commandKey) {
						e.preventDefault();
						
						setTimeout(function (self) {
							var b = $$('#find-bar-search').focus().trigger('search');
							b[0].selectionStart = 0;
							b[0].selectionEnd = b[0].value.length;
						}, 210 * self.speedMultiplier, self);
						
						if (toggle_find_bar(true)) return false;
					}
				break;

				case 83: // S
					if (e.ctrlKey) {
						e.preventDefault();
						$$('#time-machine').click();
					}
				break;
			} 

			if (~[UP, DOWN, LEFT, RIGHT].indexOf(e.which) && !$$('.poppy').length) {
				var	which = $$('.whoop:not(#disabled):visible:first'),
						cs = which.find('.current-selection'),
						all = $('*', which),
						next = all.slice(all.index(cs) + 1).filter('.selectable:not(.disabled):visible:first'),
						prev = all.slice(0, all.index(cs)).filter('.selectable:not(.disabled):visible:last'),
						selected = [];

				if ($$('input:not([type="button"]):focus, textarea:focus, select:focus').length) return;

				e.preventDefault();

				if (!cs.length && !~[LEFT, RIGHT].indexOf(e.which))
					selected = which.find('.selectable:not(.disabled):visible:first').addClass('current-selection');
				else {
					cs.removeClass('current-selection');

					switch (e.which) {
						case UP:
							if (prev.length) {
								selected = prev.addClass('current-selection');
								break;
							}
						case RIGHT:
							selected = which.find('.selectable:not(.disabled):visible:last').addClass('current-selection');
						break;

						case DOWN:
							if (next.length) {
								selected = next.addClass('current-selection');
								break;
							}
						case LEFT:
							selected = which.find('.selectable:not(.disabled):visible:first').addClass('current-selection');
						break;
					}
				}

				if (selected.length) {
					which.find('input:focus, textarea:focus').blur();

					var off = selected.offset();

					if (off.top < selected.height()) {
						selected[0].scrollIntoView();
						which.scrollTop(which.scrollTop() - 25);
					} else if (off.top + selected.height() > which.height()) {
						selected[0].scrollIntoView(false);
						which.scrollTop(which.scrollTop() + 15);
					}
				}
			}
		}).keyup(function (e) {
			if (e.which === 17 || e.which === 18) self.optionKey = false;
			else if (e.which === 16) self.speedMultiplier = !self.useAnimations ? 0.001 : 1;
			else if ((e.which === 93 || e.which === 91) || (window.navigator.platform.match(/Win/) && e.which === 17)) self.commandKey = false;
		});
		
		$(this.popover).on('click', '.rules-wrapper li input', function () {	
			var me = $(this), li = me.parent(), parent = li.parent(), span = $('span.rule', li),
					is_automatic = $('span.rule.type-2, span.rule.type--2', li).length, data = $.data(li[0]);
			
			if (this.value === _('Recover')) {
				var off = self.utils.position_poppy(this, 0, 14),
						current_rules = self.rules.current_rules, current = current_rules[data.kind];

				if (!(data.domain in current)) current[data.domain] = {};

				current[data.domain][data.rule] = [data.type, data.temp];

				Settings.setItem(self.rules.which, JSON.stringify(current_rules));

				return new Poppy(off.left, off.top, _('Rule added to current rule set.'));
			}

			if (!self.utils.confirm_click(this)) return false;

			if (this.value === _('Restore')) {
				self.rules.add(li.data('kind'), li.data('domain'), li.data('rule'), li.data('type') * -1, false, true);
				this.value = _('Disable');
				span.addClass(span[0].className.substr(span[0].className.indexOf('type')).replace('--', '-'))
					.removeClass('type--2').addClass('temporary').siblings('.bubble').addClass('temporary bubble-2').removeClass('bubble--2');
			} else {
				self.rules.remove(li.data('kind'), li.data('domain'), li.data('rule'));
				
				if (is_automatic) {
					this.value = _('Restore');
					span.addClass(span[0].className.substr(span[0].className.indexOf('type')).replace('-', '--'))
						.removeClass('type-2 temporary').siblings('.bubble').removeClass('temporary bubble-2').addClass('bubble--2');
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
					
					$('.divider:last', parent).addClass('invisible');
					
					if ($('li', parent).length === 0) {
						parent.parent().prev().remove();
						parent.parent().remove();
					}
					
					$$('#domain-filter').trigger('search');
				});
			}
		}).on('click', '.rules-wrapper li:not(.domain-name) span:not(.nodbl).rule', function (e) {
			var t = $(this), off = t.offset();

			if (self.rules.using_snapshot) return new Poppy(e.pageX, off.top + 12, _('Snapshot in use'));

			new Poppy(e.pageX || 40, off.top + 12, [t.hasClass('type-4') || t.hasClass('type-5') ?
					_('Predefined rules cannot be edited.') :
					!t.hasClass('type-900') ? '<input type="button" value="' + _('Edit Rule') + '" id="rule-edit" /> ' : '',
					'<button id="rule-new">' + _('New Rule') + '</button>'].join(''), function () {
				var domain = t.parent().data('domain'), dv = self.utils.escape_html(domain);
				$$('#poppy #rule-edit, #poppy #rule-new').filter('#rule-new')
						.html(_('New rule for {1}', [(domain === '.*' ? _('All Domains') : dv)])).end().click(function () {
					var is_new = this.id === 'rule-new',
							hider = ~t.parent().data('kind').indexOf('hide_'),
							u = is_new ? '' : t.parent().data('rule'),
							pts = domain === '.*' ? [null, '*'] : self.utils.domain_parts(domain);

					if (domain.indexOf('.') === 0) pts[0] = null;

					var padd = self.poppies.add_rule.call({
							url: u,
							domain: domain,
							e: t,
							hider: hider,
							li: t.parent(),
							is_new: is_new,
							rtype: t.parent().data('type'),
							header: _((is_new ? 'Adding' : 'Editing') + ' a ' + t.parent().data('kind') + ' Rule For {1}', [Template.create('domain_picker', {
								page_parts: pts,
								no_label: true,
								show_other: true
							})])
					}, JB);
					
					padd.onshowend = function () {
						$$('#domain-picker').change(function () {
							if (this.value === 'custom.other') {
								var w = $(this).width(),
									a = $('<input />').attr({
										type: 'text',
										id: 'domain-picker',
										'class': 'domain-picker',
										placeholder: padd.me.domain === '.*' ? _('All Domains') : padd.me.domain
									}).width(w);

								this.parentNode.replaceChild(a[0], this);

								a.focus();
							}
						});
					};
					padd.save_orig = padd.save;
					padd.save = function () {
						var rule = padd.me.li.data('rule'), kind = padd.me.li.data('kind'), v, ed = $.trim($$('#domain-picker').val()),
								temp = $$('#rule-temporary').is(':checked'), proto = $$('#rule-proto-input').val(), proto = proto && proto.length ? proto.toLowerCase().replace(/ /g, ',') : false,
								nrule = $.trim(this.val()), nrule = proto && nrule.length && nrule[0] !== '^' ? proto + ':' + nrule : nrule;

						if (!ed.length) ed = padd.me.domain;
						else if (ed.toLowerCase() === _('All Domains').toLowerCase()) ed = '.*';
						
						if (!is_new) padd.main.rules.remove(kind, padd.me.domain, rule);

						v = padd.save_orig.call(this, true);

						if ((is_new || (!is_new && padd.me.domain !== ed)) && v === 0) return new Poppy();

						if (!$.trim(nrule).length) {
							t.html('<i>' + _('Rule removed.') + '</i>');
							return new Poppy();
						}

						if (!is_new && padd.me.domain === ed) {
							t[padd.main.rules.simplified ? 'html' : 'text'](padd.main.rules.simplified ? padd.main.rules.make_message(kind, nrule, v, temp).join(' ') : nrule).removeClass('type-0 type-1 type-2 type--2 type-4 type-5 type-6 type-7 temporary').addClass('type-' + v).toggleClass('temporary', temp)
									.prev()
									.removeClass('bubble-0 bubble-1 bubble-2')
									.addClass('bubble-' + v)
									.toggleClass('temporary', temp)
									.siblings('input').val(_('Delete')).parent().data({ rule: nrule, type: v} );

							new Poppy(e.pageX || 40, off.top + 12, '<p>' + _('Rule succesfully edited.') + '</p>', $.noop, $.noop, 0.2);
						} else {
							self.rules.show();
							new Poppy(e.pageX || 40, off.top + 12, [
									'<p>', _('Rule succesfully ' + (!is_new && padd.me.domain !== ed ? 'moved to' : 'added for') + ' {1}', [self.utils.escape_html(ed === '.*' ? _('All Domains') : ed)]), '</p>'].join(''));
						}
					};
					new Poppy(e.pageX || 40, off.top + 12, padd);
				});
			});
		}).on('click', '.domain-name', function () {
			if (~this.className.indexOf('no-disclosure')) return;
			
			var me = $(this), d = me.data('domain'), t = me.next(), x;
			
			if (d === '.*') d = _('All Domains');
						
			if (me.hasClass('floater')) {
				t = t.next();
				x = me.next();
			} else
				x = $('<div />');
				
			var ul = $('ul', t);
			
			if (ul.is(':animated')) return;
			
			me.toggleClass('hidden');
			x.toggleClass('hidden');
			
			t.css('display', 'block');
			
			if (me.hasClass('floater') && !hid)
				x.css('opacity', 1).prev().remove();
			
			var c = self.collapsedDomains(),
					dex = c.indexOf(d),
					rulesList = $$('#rules-list'),
					hid = !me.hasClass('hidden'),
					o = t.outerHeight(true),
					h = t.height(),
					height;
										
			ul.css({ marginTop: hid ? -o : 0 }).animate({
				marginTop: hid ? 0 : -o
			}, 200 * self.speedMultiplier, function () {
				if (!me.hasClass('hidden')) {
					if (dex > -1) c.splice(dex, 1);
				} else {
					if (dex === -1) c.push(d);
				}
			
				t.css('display', '');
				ul.css('marginTop', 0);
			
				self.collapsedDomains(c);
	
				rulesList.trigger('scroll');
			});
						
			if (!~this.className.indexOf('hidden')) {
				var offset = t.offset(),
						bottomView = offset.top + h;
				
				if (bottomView > rulesList.height())
					rulesList.animate({
						scrollTop: rulesList.scrollTop() + bottomView - rulesList.height(),
					}, 200 * self.speedMultiplier);
			}
		}).on('mousedown click', 'select.single', function (e) {
			e.preventDefault();
		}).on('enter', '.urls-wrapper li', function (e) {
			self.utils.timer.timeout('trigger_span', function (me, e) {
				var span = me.find('span'), off = me.offset();

				e.pageX = off.left + 30;

				if (me.is('.show-me-more')) {
					var next = me.next();
					span.find('a').click();
					next.addClass('current-selection');
				} else if (!self.optionKey)
					span.trigger('click', e);
				else
					span.trigger('mousedown', e);
			}, 50, [$(this), e]);
		}).on('enter', '.domain-name', function (e) {
			$(this).click();
		}).on('enter', '#next-frame, #previous-frame', function (e) {
			$(this).click().toggleClass('current-selection', !~this.className.indexOf('disabled'));
		}).on('enter', '#main .actions-bar li', function (e) {
			self.utils.timer.timeout('trigger_action', function (me) {
				me.trigger('click', 1);
			}, 50, [$(this)]);
		}).on('enter', '#rules-list .filter-bar li', function (e) {
			$(this).click();
		}).on('enter', '.snapshot-date', function (e) {
			$(this).trigger('click', { pageX: 30 });
		}).on('enter', '.rules-wrapper span', function (e) {
			$(this).trigger('click', { pageX: 30 });
		}).on('mousedown', alblspan, function (e, t) {
			var span = $(this);

			e = t || e;

			if (e.which && e.which !== 1) return;

			span.removeClass('triggered').data('quick_add_ignore_timeout', setTimeout(function (span, e) {
				$$('#main li.pending').removeClass('pending').removeData('pending_index').each(function () {
					$('span', this).text($(this).data('url'));
				}).find('.info-link').text('?');

				var li = span.parents('li:first');

				if (li.hasClass('unblockable') || self.rules.using_snapshot) return;

				li.addClass('ignore-quick-add').end()
					.trigger('click', e).text(li.data('url'));

				span.addClass('triggered');
			}, 300, span, e));
		}).on('mouseout', alblspan, function (e) {
			clearTimeout($(this).data('quick_add_ignore_timeout'));
		}).on('click', alblspan, function (e, t) {
			if (self.disabled) return false;

			e = t || e;
			
			var span = $(this),
					blocked = !$(this).parents('.urls-wrapper').is('#blocked-script-urls'),
					li = $(this).parent(),
					lid = $.data(li[0]),
					off = $(this).offset(),
					left = e.pageX,
					url = lid.url,
					script = lid.script;

			clearTimeout($(this).data('quick_add_ignore_timeout'));

			if (span.hasClass('triggered')) return span.removeClass('triggered');
			if (self.rules.using_snapshot) return new Poppy(left, off.top + 12, _('Snapshot in use'));
			if (li.hasClass('unblockable')) return new Poppy(left, off.top + 12, _('Unblockable ' + lid.kind));

			if (self.rules.quick && !li.hasClass('ignore-quick-add')) {
				var me = span, parts = self.utils.domain_parts(self.simpleMode ? url : self.utils.active_host(url)),
						pi = 0, to_do = null, to_do_clean, special = ~lid.kind.indexOf('special'), span = $('> span', li),
						host_parts = self.utils.domain_parts(self.host), use_host = self.host;

				switch (Settings.getItem('quickAddType')) {
					case '0':
						use_host = host_parts[0]; break;
					case '1':
						use_host = (host_parts.length > 2 ? '.' : '') + host_parts[host_parts.length - 2]; break;
					case '2':
						use_host = '.*'; break;
				}

				parts.splice(-1);
				span.text(url);

				if (span.hasClass('SAFARI-EXTENSION')) parts = [parts[0]];

				if (li.hasClass('pending')) {
					if (self.simpleMode && !special) {
						pi = lid.pending_index + 1;

						if (pi < parts.length) {
							li.data('pending_index', pi);

							to_do = parts[pi];
						}
					}
				} else
					to_do = special || !self.simpleMode ? script[0] : parts[0];

				if (to_do) {
					to_do_clean = self.utils.escape_regexp(to_do);

					var rule = self.simpleMode ? ((pi > 0 ? '.' : '') + to_do) : '^' + to_do_clean + (!special ? '(\\?.*)?$' : '$');
					rule = self.rules.simplified && !special ? (lid.protocol || '') + ':' + rule : rule;

					li.addClass('pending')
						.data('pending_index', pi)
						.data('pending_data', rule)
						.find('.info-link').text('+');

					span.html(url.replace(new RegExp((pi > 0 ? '\\.' : '') + (special ? url : to_do_clean) + '$', 'i'), '<mark class="quick-add">' + (pi > 0 ? '.' : '') + (special ? url : to_do) + '</mark>'));
				} else
					li.removeClass('pending').removeData('pending_index').find('.info-link').text('?');

				self.utils.timer.timeout('quick_add', function (self, host) {
					var lis = $$('#main li.pending');

					lis.each(function () {
						var li = $(this), lid = $.data(li[0]), rtype = li.parents('.urls-wrapper').is('#blocked-script-urls');

						self.rules.add(lid.kind, host, lid.pending_data, rtype ? 1 : 0, true, Settings.getItem('quickAddTemporary'));

						self.utils.timer.timeout('quick_add_reload', function (lis) {
							lis.addClass('allow-update');
							$$('#page-list')[0].selectedIndex = 0;
							Tabs.messageActive('reload');
						}, 200, [lis]);
					});
				}, 1200, [self, use_host]);

				return;
			}

			li.removeClass('ignore-quick-add');
			
			var page_parts = self.utils.domain_parts(self.host), n,
					padd = self.poppies.add_rule.call({
						url: '^' + (self.simpleMode ? self.utils.escape_regexp(script[0].substr(0, script[0].indexOf(url))) : '') + self.utils.escape_regexp(url) + (self.simpleMode ? '\\/.*' : '') + '$',
						e: $(this).siblings('span'),
						li: $(this).parent(),
						domain: self.host,
						is_new: 1,
						header: _('Adding a Rule For {1}', [Template.create('domain_picker', { page_parts: page_parts, no_label: true })])
				}, self),
				matches = self.rules.matching_URLs(li.data('kind'), self.host, script, blocked);

			padd.onshowend = function () {
				$$('#select-type-' + (blocked ? 'block' : 'allow')).click();
			};

			if (!$.isEmptyObject(matches)) {
				var d, rs = [], ds = [], i, rtype;

				for (d in matches)
					matches[d].forEach(function (match) {
						rtype = match[1][0];

						if (rtype === 4 || rtype === 5) return;

						rs.push(rtype);
						ds.push([d, match]);
					});
				
				if (rs.length) {
					var has_automatic_rule = false, has_standard_rule = false;
					
					for (var x = 0; x < ds.length; x++) {
						if (ds[x][1][1][0] < 0 || ds[x][1][1][0] === 2 || ds[x][1][1][0] === 3) {
							has_automatic_rule = true;
							if (has_standard_rule) break;
						} else {
							has_standard_rule = true;
							if (has_automatic_rule) break;
						}
					}
					
					var para, button, restore_disable = blocked ? 'restore' : 'disable';
					
					if (has_automatic_rule && has_standard_rule) {
						para = _('Would you like to ' + restore_disable + '/delete them, or add a new one?');
						button = _('Restore/Delete Rules');
					} else if (has_standard_rule) {
						para = _('Would you like to delete ' + (rs.length === 1 ? 'it' : 'them') + ', or add a new one?');
						button = _('Delete Rule' + (rs.length === 1 ? '' : 's'));
					} else if (has_automatic_rule) {
						para = _('Would you like to ' + restore_disable + ' ' + (rs.length === 1 ? 'it' : 'them') + ', or add a new one?');
						button = _(restore_disable + ' Rule' + (rs.length === 1 ? '' : 's'));
					} else {
						para = 'If you\'re reading this, something went horribly wrong.';
						button = 'Hmph!';
					}

					var wrapper = $('<div><ul class="rules-wrapper"></ul></div>');

					for (d in matches)
						$('.rules-wrapper', wrapper).append(self.rules.view(li.data('kind'), d, script, true, false, blocked ? 1 : 0).find('> li').find('input').remove().end());

					$('li.domain-name', wrapper).removeClass('hidden').addClass('no-disclosure');

					new Poppy(left, off.top + 12, [
						'<p>', _('The following rule' + (rs.length === 1 ? ' is ' : 's are ') + (!blocked ? 'blocking' : 'allowing') + (' this item:')), '</p>',
						wrapper.html(),
						'<p>', para, '</p>',
						'<div class="inputs">',
							'<input type="button" value="', _('New Rule'), '" id="auto-new" /> ',
							'<input type="button" value="', button, '" id="auto-restore" />',
						'</div>'].join(''), function () {
							$$('#poppy #auto-new').click(function () {
								if (self.simpleMode || ~li.data('kind').indexOf('special')) return self.add_rule_host(span, script, left, off.top, !blocked);
								else if (!self.donationVerified) return false;

								new Poppy(left, off.top + 12, padd);
							}).siblings('#auto-restore').click(function () {
								self.rules.remove_matches(li.data('kind'), matches);
								Tabs.messageActive('reload');

								new Poppy();
							});
						});
					
					return false;
				}
			}

			if (self.simpleMode || ~li.data('kind').indexOf('special')) return self.add_rule_host(span, script, left, off.top, !blocked);
			else if (!self.donationVerified) return false;
			
			new Poppy(left, off.top + 12, padd);
		}).on('click', '#allowed-script-urls .info-link, #blocked-script-urls .info-link', url_display)
			.on('click', '#unblocked-script-urls li:not(.show-me-more) span', function() {
			var t = $(this).text();
			
			function do_highlight (t, no_zoom) {
				$$('#misc-content pre').remove();
				
				$('<pre></pre>').append('<code class="javascript"></code>').find('code')
						.text(t).end().appendTo($$('#misc-content'));
				if (!no_zoom) self.utils.zoom($$('#misc').find('.misc-header').html(_('Unblocked Script')).end());
				var p = $$('#misc-content pre code');
				p.data('unhighlighted', p.html());
				self.hljs.highlightBlock(p[0]);
			}
			
			$$('#misc .info-container #beautify-script').remove();
			
			$('<input type="button" value="' + _('Beautify Script') + '" id="beautify-script" />')
					.appendTo($$('#misc .info-container')).click(function () {						
						do_highlight(js_beautify(t, {
							indent_size: 2
						}), true);
					});
			
			do_highlight(t);
		}).on('mousedown', 'body', function (e) {
			if (!e.isTrigger) $$('.current-selection').removeClass('current-selection');
		}).on('click', '#find-bar-done', function() {
			toggle_find_bar();
			
			self.utils.timer.timeout('hide_results', function () {
				var b = $$('#find-bar-search'),
						s = b.val();
					
				b.val('').trigger('search');
			
				self.utils.timer.timeout('set_back_find', function (b, s) {
					b.val(s);
				}, 210 * self.speedMultiplier, [b, s]);
			}, 200 * self.speedMultiplier * ($$('#find-bar-search').is(':visible') ? 0 : 1));
		}).on('search', '#find-bar-search', function () {
			if (self.finding) return false;
			
			var s = $(this).val(),
					matches = 0,
					removedEm = false;
						
			$$('.find-scroll').remove();
			
			$$('.whoop').find('*').each(function () {
				self.utils.zero_timeout(function (e) {
					if (e.data('orig_html'))
						e.html(e.data('orig_html')).removeData('orig_html');
				}, [$(this)]);
			});
					
			if (s.length === 0) {
				$$('#find-bar-matches').html('');
				return false;
			}
			
			self.busy = 1;
			self.finding = true;
			
			var visible = $$('.whoop').filter(':visible'),
					offset = $$('#find-bar').outerHeight(),
					end_find = function (self, visible) {
						self.busy = 0;
						self.finding = false;
					},
					js = visible.find('code.javascript:visible'), x;

			if (js.length && !js.hasClass('unhighlighted')) {
				var cloned, parent;
				// This is an ugly work around for js.html(js.data('unhighlighted'));
				// For some reason the above code is extremely slow--the UI freezes for about 30 seconds
				// on a very long script string.
				cloned = $('<code />').addClass('javascript unhighlighted').html(js.data('unhighlighted'));
				parent = js.parent();
				js.remove();
				cloned.appendTo(parent);
			}
			
			x = visible.find('*:visible');
					
			x.each(function (index) {
				if (!~this.className.indexOf('link-button') && ['MARK', 'OPTION', 'SCRIPT'].indexOf(this.nodeName.toUpperCase()) === -1 && this.innerHTML && this.innerHTML.length)
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
				$$('#find-bar-matches').html(_('{1} matches', [matches]));
				
				if (matches > 499)
					self.utils.zero_timeout(function (self) {
						self.utils.timer.timeout('over_fivehundred', function (self) {
							$$('.find-scroll').remove();
						}, 50, [self]);
					}, [self]);
			}, [self]);
		}).on('click', '#allow-domain, #block-domain', function () {
			var page_parts = self.utils.domain_parts(self.host), n, off = self.utils.position_poppy(this, 0, 14),
					me = this, kinds = [], block = this.id === 'block-domain',
					left = off.left, top = off.top;

			if (self.rules.using_snapshot) return new Poppy(left, top, _('Snapshot in use'));

			var all_poppy = function () {
						new Poppy(left, top, [
							'<p class="misc-info">',
								_('{1} All', [[
									'<select id="which-type" class="', !block ? 'allowed' : 'blocked', '-color">',
										'<option value="', !block ? 1 : 0, '">', !block ? _('Allow') : _('Block'), '</option>',
										'<option value="42">', _('Hide'), '</option>',
									'</select>'].join('')]),
							'</p>',
							'<p>',
								kinds.join('<br />'),
							'</p>',
							'<p>',
								'<input id="domain-script-temporary" type="checkbox"', self.collapsed('LastRuleWasTemporary') ? ' checked' : '', ' />',
								'<label for="domain-script-temporary">&nbsp;', _('Make these temporary rules'), '</label> ',
							'</p>',
							'<p>',
								Template.create('domain_picker', { page_parts: page_parts }),
								' <input id="domain-script-continue" type="button" value="', _('Save'), '" />',
							'</p>'].join(''), function () {
							$$('#which-type').change(function () {
								$(this).toggleClass((!block ? 'allowed' : 'blocked') + '-color', this.value !== '42');
							});

							$$('#domain-script-continue').click(function () {
								var h = $$('#domain-picker').val(), kind,
										block_kind = $$('.ba-kind:checked').map(function () {
											return this.id.substr(8);
										});
								
								for (kind in self.rules.data_types)
									if (!~$.makeArray(block_kind).indexOf(kind))
										self.collapsed(kind + 'Unchecked', 1);
															
								for (var i = 0; i < block_kind.length; i++) {
									self.collapsed(block_kind[i] + 'Unchecked', 0)

									var key = ($$('#which-type').val() === '42' ? 'hide_' : '') + block_kind[i];

									self.rules.remove(key, h, '^.*$');
									self.rules.add(key, h, '^.*$', $$('#which-type').val(), true, $$('#domain-script-temporary').is(':checked'));
								}
								
								Tabs.messageActive('reload');

								$$('#page-list')[0].selectedIndex = 0;
							});
						});	
					}
			
			if (self.donationVerified)
				for (var kind in self.rules.data_types) {
					if (!Settings.getItem('enable' + kind) || ~kind.indexOf('hide_')) continue;
							
					kinds.push(['<input class="ba-kind" id="ba-kind-', kind, '" type="checkbox" ', (!self.collapsed(kind + 'Unchecked') ? 'checked' : ''), ' />',
							'<label for="ba-kind-', kind, '">&nbsp;', _(kind.charAt(0).toUpperCase() + kind.substr(1) + 's'), '</label>'].join(''));
				}

			var at_least_one = 0, ob = $(me).parents('.column').find('.urls-inner').children();

			for (var x = 0; ob[x]; x++)
				if (~ob[x].className.indexOf('kind-header') && ob[x].style.display !== 'none') {
					at_least_one = 1;
					break;
				}

			if (!at_least_one) return all_poppy();

			new Poppy(left, top, [
				'<p class="misc-info">', block ? _('Block/Hide') : _('Allow/Hide'), '</p>',
				'<input type="button" id="do-some" value="', _('Some'), '" /> ',
				'<input type="button" id="do-all" value="', _('All'), '" /> ',
			].join(''), function () {
				$$('#do-all').click(all_poppy).siblings('#do-some').click({ pp: page_parts }, function (e) {
					if (ob.parent().hasClass('some-list')) return false;

					var c = $([
						'<div class="some-helper">',
							'<p>',
								'<input class="domain-script-temporary" id="domain-script-temporary-', block ? 0 : 1, '" type="checkbox" /> ',
								'<label for="domain-script-temporary-', block ? 0 : 1, '">', _('Make these temporary rules'), '</label>',
							'</p>',
							'<p>',
								Template.create('domain_picker', { page_parts: e.data.pp, id: block ? 0 : 1 }),
							'</p>',
							'<p>',
								_('{1} selected items', [[
									'<select class="which-type ', block ? 'blocked' : 'allowed', '-color">',
										'<option value="', block ? 0 : 1, '">', block ? _('Block') : _('Allow'), '</option>',
										'<option value="42">', _('Hide'), '</option>',
									'</select>'].join('')]),
								' <input type="button" class="save-some" id="save-some-', block ? 0 : 1, '" value="', _('Save'), '" />',
							'</p>',
							'<div class="divider"></div>',
						'</div>'
					].join('')).hide(), parent = ob.parent();

					parent.addClass('some-list');

					$$((block ? '.allowed' : '.blocked') + '-label.hidden').click();

					for (var i = 0; ob[i]; i++) {
						if (i % 2) continue;

						var head = $(ob[i]), hosts = head.next().find('.main-wrapper > li'), li;

						if (head.css('display') === 'none') continue;

						for (var b = 0; (li = hosts[b]); b++) {
							if (~li.className.indexOf('show-me-more') ||
									(~li.className.indexOf('hidden-by-rule') && !~li.className.indexOf('show-for-now'))) {
								$(li).remove();
								continue;
							}

							var data = $.data(li), proto = self.utils.active_protocol(data.script[0]),
									page_parts = data.kind === 'special' ? [data.url] : self.utils.domain_parts(data.url),
									opts = self.add_rule_host($(li).find('*:first'), null, null, null, null, true), op = $(opts),
									cl = $(li).clone(true).addClass('some-thing'), $li = $(li);

							$li.show().slideUp(200 * self.speedMultiplier, function () {
								$li.remove();
							});

							cl.html([
								'<input type="checkbox" class="some-checkbox" /> ',
								(self.simpleMode || data.kind === 'special' ? [
									'<select class="', op.length === 1 ? 'single' : '', ' ', proto, '"', op.length === 1 ? ' tabindex="-1"' : '', '>', opts, '</select>'
								] : [
									'<textarea placeholder="Rule" wrap="off" class="rule-input">^', self.utils.escape_regexp(data.script[0]), '$</textarea>'
								]).join('')
							].join('')).hide().insertAfter(li).slideDown(200 * self.speedMultiplier)
								.attr('title', op.length === 1 ? $(op[0]).html() : null);
						}
					}

					new Poppy();

					parent.prepend(c).parent().prev().slideUp(200 * self.speedMultiplier);
					c.slideDown(200 * self.speedMultiplier);

					parent.find('.which-type').change(function () {
						$(this).toggleClass((block ? 'blocked' : 'allowed') + '-color', this.value !== '42');
					}).end().find('select').mousedown(function () {
						var ele = $(this).prev(), checked = ele.prop('checked');

						ele.prop('checked', true);

						if (checked && $(this).hasClass('single')) ele.prop('checked', false);
					}).end().find('.save-some').click(function () {
						var som = $('.main-wrapper li.some-thing', parent), item;

						this.disabled = 1;

						for (var c = 0; som[c]; c++) {
							item = $(som[c]);

							if (!item.find('input:checked').length) continue;

							var rule = item.find('select, textarea').val(), kind = ($('.which-type', parent).val() === '42' ? 'hide_' : '') + item.data('kind');

							self.rules.add(kind, $('.domain-picker', parent).val(), rule, $('.which-type', parent).val(), true, $('.domain-script-temporary', parent).is(':checked'));
						}

						$$('.some-list').removeClass('some-list');

						Tabs.messageActive('reload');

						$$('#page-list')[0].selectedIndex = 0;
					})
				});
			});
		}).on('click', '#disable', function (event, ignore) {
			if (!self.methodAllowed) return false;

			self.disabled = !self.disabled;
			
			$(self.popover.body).toggleClass('disabled', self.disabled);

			if (self.disabled && !event.isTrigger)
				self.clear_ui();

			this.innerHTML = _((self.disabled ? 'Enable' : 'Disable') + ' JavaScript Blocker');

			if (!event.isTrigger || ignore)
				Tabs.messageActive('reload');
		}).on('click', '#toggle-hidden', function (e) {
			if ($$('.some-list').length) return;

			var hid = $$('#main .urls-wrapper li.hidden-by-rule'),
					visi = hid.toggleClass('show-for-now').hasClass('show-for-now'),
					pos = self.utils.position_poppy(this, 0, 14);

			$(this).toggleClass('hidden-visible', visi);
			
			if (!hid.length) return new Poppy(pos.left, pos.top, _('Nothing is hidden'));

			$$('#main .show-me-more .show-more').click();

			$$('#main .main-wrapper').each(function () {
				var all = $('li', this), some = $('li.hidden-by-rule', this);

				all.find('.divider').removeClass('invisible');

				if (visi)
					all.filter(':last').find('.divider').addClass('invisible');
				else
					all.filter(':not(.hidden-by-rule):last').find('.divider').addClass('invisible');

				if (all.length === some.length && some.length)
					if (visi)
						$(this).parent().show().prev().show();
					else
						$(this).parent().hide().prev().hide();
			});
		}).on('click', '#view-rules', function (e) {
			if (!self.methodAllowed) return false;
			
			var offset = self.utils.position_poppy(this, 0, 14),
					left = offset.left,
					top = offset.top;
			
			new Poppy(left, top, [
				'<p class="misc-info">', _('Active Temporary Rules'), '</p>',
				'<input type="button" value="', _('Make Permanent'), '" id="rules-make-perm" /> ',
				'<input type="button" value="', _('Revoke'), '" id="rules-remove-temp" /> ',
				'<input type="button" value="', _('Show'), '" id="rules-show-temp" />',
				'<div class="divider" style="margin:7px 0 6px;"></div>',
				'<input type="button" value="', _('Show All'), '" id="view-all" /> ',
				'<input type="button" value="', _('Show Active'), '" id="view-domain" /> ',
				self.donationVerified ? ['<input type="button" value="', _('Backup'), '" id="rules-backup" />'].join('') : '',
				self.rules.using_snapshot ? [
					' <input type="button" value="', _('Snapshot'), '" id="current-snapshot" />'].join('') : ''
				].join(''), function () {
				$$('#current-snapshot').click(function () {
					var pop = self.poppies.current_snapshot(!self.rules.snapshots.exist(self.rules.using_snapshot));

					pop.onshowend = function () {
						$$('#snapshots-show').off('click').on('click', function () {
							new Poppy();

							self.utils.zoom($$('#snapshots'));

							self.rules.show_snapshots();
						});
					};
					new Poppy(left, top, pop);
				});

				$$('#view-domain').click(function () {
					this.disabled = 1;
					
					$$('#view-all').click();
					$$('#show-active-rules').removeClass('using').click();
				}).siblings('#view-all').click(function (event) {
					if (this.disabled) return false;

					this.disabled = 1;
					
					self.busy = 1;
															
					if ('srcElement' in event)
						$$('#domain-filter').val('').data('parts', []);

					self.rules.show();

					new Poppy();

					self.utils.zoom($$('#rules-list'), null, null, function () {
						var parts = $$('#domain-filter').trigger('search').data('parts');
							
						parts.forEach(function (part, i) {
							$$('.domain-name[data-value="' + (i > 0 ? '.' : '') + part + '"].hidden').click();
						});
					});		
				}).siblings('#rules-make-perm, #rules-remove-temp').click(function () {
					if (self.rules.using_snapshot) {
						var off = self.utils.position_poppy(this, 0, 14);
						return new Poppy(off.left, off.top, _('Snapshot in use'), null, null, null, null, true);
					}

					for (var key in self.rules.data_types) {
						var rules = self.rules.for_domain(key, self.host), domain, rule, make_perm = this.id === 'rules-make-perm';

						for (domain in rules)
							for (rule in rules[domain])
								if (rules[domain][rule][1]) {
									if (make_perm)
										self.rules.add(key, domain, rule, rules[domain][rule][0], true, false);
									else
										self.rules.remove(key, domain, rule);
								}
					}
					
					if (this.id === 'rules-remove-temp') {
						Tabs.messageActive('reload');
						$$('#page-list')[0].selectedIndex = 0;
					} else
						new Poppy();
				}).siblings('#rules-show-temp').click(function () {
					$$('#view-domain').click();
					$$('#filter-temporary').click();
				}).siblings('#rules-backup').click(function () {
					new Poppy(left, top, self.poppies.backup.call({
							left: left,
							top: top
					}));
				});
			});
		}).on('click', '#rules-list-back', function () {
			var r = $$('#rules-list:not(.zoom-window-animating)');

			if (r.length)
				self.utils.zoom(r.addClass('zoom-window-open zoom-window'), function () {
					$$('#rules-list').find('.rules-wrapper').empty().end().find('.snapshot-info').hide();
				});
		}).on('click', '#misc-close', function() {
			self.utils.zoom($$('#misc'), function () {
				$$('#misc-content, p.misc-header').html('');
			});
		}).on('click', '.allowed-label, .blocked-label, .unblocked-label', function () {
			var me = $(this), which = this.className.substr(0, this.className.indexOf('-')), e = $$('#' + which + '-script-urls .urls-inner');
			
			if (e.is(':animated')) return false;

			if (me.hasClass('hidden')) {
				self.collapsed(which, 0);
				
				me.removeClass('hidden');
								
				e.show().css('marginTop', -e.height()).animate({
					marginTop: 0
				}, 200 * self.speedMultiplier, function () {
					$('.kind-header', e).addClass('visible');
				}).removeClass('was-hidden');
			} else {
				self.collapsed(which, 1);
				
				me.addClass('hidden');
				$('.kind-header', e).removeClass('visible').css('opacity', 1).filter('.floater').remove();
								
				e.css('marginTop', 0).animate({
					marginTop: -e.height()
				}, 200 * self.speedMultiplier, function () {
					e.hide();
				}).addClass('was-hidden');
			}
							
			self.utils.timer.timeout('label_search', function (self) {
				$$('#find-bar-search:visible').trigger('search');
			}, 400 * self.speedMultiplier, [self]);
		}).on('click', '#collapse-all, #expand-all', function () {
			self.busy = 1;
						
			var col = this.id === 'collapse-all';
			
			if (!col && $$('#edit-domains.edit-mode').length) return self.busy = 0;
		
			$$('#rules-list .domain-name:visible').toggleClass('hidden', col);
			
			if (!self.rules.using_snapshot)
				self.collapsedDomains($.map($$('#rules-list .domain-name'), function (e) {
					var d = $.data(e).domain, d = d === '.*' ? _('All Domains') : d;
					return ~e.className.indexOf('hidden') ? d : null;
				}));
			
			self.busy = 0;
		}).on('click', '#show-active-rules', function () {
			var parts = self.domain_parts(self.host),
					x = parts.slice(0, 1),
					y = parts.slice(1), active;

			x.push(x[0]);

			parts = x.concat(y);
			parts = parts.slice(0, -1);

			active = ~this.className.indexOf('using') ? '' : '^' + parts.join('$|^.') + '$|^' + _('All Domains') + '$';
						
			$$('#domain-filter').val(active).data('parts', parts).data('active', active.length ? active : null).trigger('search');
		}).on('click', '#edit-domains', function () {
			$(this).toggleClass('edit-mode');
						
			var ul = $$('.rules-wrapper');
			
			$('.domain-name', ul).toggleClass('no-disclosure').toggleClass('editing')
			
			$$('#rules-list .rules-wrapper').each(function () {
				$('.domain-name:visible .divider', this).removeClass('invisible').filter(':visible:first').addClass('invisible');
			});
		}).on('click', '#time-machine', function () {
			var off = self.utils.position_poppy(this, 2, 12);

			if (!Settings.getItem('enableSnapshots')) return new Poppy(off.left, off.top, _('Snapshots disabled'));

			if (self.rules.using_snapshot && !~this.className.indexOf('force-open')) {
				new Poppy(off.left, off.top, self.poppies.current_snapshot(!self.rules.snapshots.exist(self.rules.using_snapshot)));

				return;
			}

			$(this).removeClass('force-open');

			self.utils.zoom($$('#snapshots'));

			self.rules.show_snapshots();
		}).on('click', '#reload-rules', function () {
			self.rules.show();
		}).on('click', '#close-snapshots', function () {		
			$$('#rules-list').find('.snapshot-info').hide();
			
			self.utils.zoom($$('#snapshots'), $.noop, function () {
				if (self.rules.using_snapshot && !self.rules.snapshots.exist(self.rules.using_snapshot))
					self.rules.use_snapshot(0);
				if ($$('.zoom-window-hidden:last').is('#rules-list'))
					self.utils.zero_timeout(function () {
						self.rules.show();
					});
			});
		}).on('click', '#create-snapshot', function () {
			var off = self.utils.position_poppy(this, 0, 14);

			self.rules.snapshots.add(self.rules.rules, 1, 0);

			if ($$('#snapshots').is(':visible'))
				self.utils.timer.timeout('show_snapshots', function (rules) {
					rules.show_snapshots();
				}, 1000, [self.rules]);

			new Poppy(off.left, off.top, _('Snapshot created.'));
		}).on('click', '#make-temp-perm', function () {
			if (self.rules.using_snapshot) return;

			var off = $(this).offset();
						
			for (var key in self.rules.data_types)
				for (var domain in self.rules.rules[key]) {
					var rules = self.rules.for_domain(key, domain, true), rule;
					
					if (domain in rules)
						for (rule in rules[domain])
							if (rules[domain][rule][1])
								self.rules.add(key, domain, rule, rules[domain][rule][0], false, false);
				}
			
			$$('.rules-wrapper').find('span.temporary, .bubble.temporary').removeClass('temporary');

			$$('#filter-type-state li.selected').click();
			
			new Poppy(2 + off.left + $(this).width() / 2, off.top + 12, '<p>' + _('All temporary rules are now permanent.') + '</p>');
		}).on('click', '#remove-all-temp', function () {
			if (self.rules.using_snapshot) return;

			var off = $(this).offset();
						
			for (var key in self.rules.data_types)
				for (var domain in self.rules.rules[key]) {
					var rules = self.rules.for_domain(key, domain, true), rule;
			
					if (domain in rules)
						for (rule in rules[domain])
							if (rules[domain][rule][1])
								self.rules.remove(key, domain, rule, true);
				}
			
			var l = $$('.rules-wrapper');
			
			if (l.is(':visible'))
				l.find('span.temporary').removeClass('temporary type-2').addClass('type-1').siblings('input').click().click();

			$$('#filter-type-state li.selected').click();
			
			new Poppy(-2 + off.left + $(this).width() / 2, off.top + 12, '<p>' + _('All temporary rules have been removed.') + '</p>');
		}).on('search', '#domain-filter', function () {
			self.busy = 1;

			$$('#show-active-rules').toggleClass('using', $(this).data('active') === this.value);

			var d = $$('.domain-name:not(.visibility-hidden,.state-hidden,.visibility-hidden) span'), v;

			switch (this.value) {
				case 'mimic-upgrade-89':
					self.installedBundle = 89;
					self.reloaded = false;
				break;
			}
			
			try {
				v = new RegExp(this.value, 'i');
			} catch (e) {
				v = /.*/;
			}
						
			d.each(function () {
				$(this.parentNode).toggleClass('domain-filter-hidden', !v.test(this.innerHTML));
			});
			
			for (var key in self.rules.data_types) {
				var head = $$('#head-' + key + '-rules').show(), rs = $$('#rules-list-' + key + 's'), wrap = rs.parent().show(),
						a = self.collapsed(rs.attr('id'));
				
				if (a) head.find('a').html(_('Show'));
				
				if (!self.enabled(key) || !rs.find('.domain-name:not(.domain-filter-hidden,.state-hidden,.visibility-hidden)').length) {
					head.hide();
					wrap.hide();
				}
				
				rs.css({
					opacity: a ? 0 : 1,
					marginBottom: a ? 0 : '6px',
					marginTop: a ? -(rs.outerHeight() * 2) : -3,
					display: a ? 'none' : 'block'
				}).toggleClass('visible', !a);
			}

			var d = $$('#rules-list .domain-name:visible').length,
					r = $$('#rules-list .domain-name:visible + li > ul li:not(.none,.old-none,.used-none) span.rule:not(.hidden,.type-900)').length;
			
			$$('#rule-counter').html(
					_('{1} domain' + (d === 1 ? '' : 's') + ', {2} rule' + (r === 1 ? '' : 's'), [d, r])
			).removeData('orig_html');		

			$$('.rules-wrapper').each(function () {
				$('.domain-name:not(.state-hidden,.domain-filter-hidden,.visibility-hidden) .divider', this).removeClass('invisible').filter(':visible:first').addClass('invisible');
			});

			self.busy = 0;
		}).on('click', '#filter-type-collapse li:not(.label)', function () {
			self.busy = 1;
			
			$(this).siblings('li').removeClass('selected').end().addClass('selected');
			
			var x = $$('#rules-list .domain-name');
			
			x.filter('.visibility-hidden').removeClass('visibility-hidden');
			
			switch(this.id) {
				case 'filter-collapsed':
					x.not('.hidden').addClass('visibility-hidden');
				break;
				
				case 'filter-expanded':
					x.filter('.hidden').addClass('visibility-hidden');
				break;
			}
			
			$$('#domain-filter').trigger('search');
		}).on('click', '#filter-type-state li:not(.label)', function () {
			self.busy = 1;
			
			var me = this;
			
			$(this).siblings('li').removeClass('selected').end().addClass('selected');
			
			$$('.rule').removeClass('hidden').parent().removeClass('none');
			
			switch (this.id) {
				case 'filter-state-all':
				break;
				
				case 'filter-enabled':
					$$('.rule').removeClass('hidden').not('.rule.type--2').parent().removeClass('none');
					$$('.rule.type--2').addClass('hidden').parent().addClass('none');
				break;
				
				case 'filter-disabled':
					$$('.rule').not('.type--2').addClass('hidden').parent().addClass('none');
				break;
				
				case 'filter-temporary':
					$$('.rule').not('.temporary').addClass('hidden').parent().addClass('none');
				break;
			}

			$$('#rules-list .domain-rules').each(function () {
				$('li', this).find('.divider').removeClass('invisible').end()
					.not('.used-none, .old-none, .none').filter(':last')
					.find('.divider').addClass('invisible');
			});
			
			$$('li.domain-name').next().each(function () {
				$(this).prev().toggleClass('state-hidden', $('ul li.none, ul li.old-none, ul li.used-none', this).length === $('ul li', this).length);
			});
			
			$$('#domain-filter').trigger('search');
		}).on('click', '.age-filter li:not(.label)', function () {
			self.busy = 1;
						
			$(this).siblings('li').removeClass('selected').end().addClass('selected');
			
			var usedInPast = $(this).parents('ul').attr('id') === 'filter-type-used',
					which = usedInPast ? 'used-none' : 'old-none',
					filter = usedInPast ? 'filter-only-' : 'filter-age-',
					rules = $$('.domain-rules li').removeClass(which),
					off;

			switch (this.id) {
				case filter + 'all':
					off = 0;
				break;

				case filter + 'hour':
					off = 1000 * 60 * 60;
				break;
				
				case filter + 'day':
					off = 1000 * 60 * 60 * 24;
				break;
				
				case filter + 'week':
					off = 1000 * 60 * 60 * 24 * 7;
				break;
				
				case filter + 'month':
					off = 1000 * 60 * 60 * 24 * 30;
				break;

				case filter + 'year':
					off = 1000 * 60 * 60 * 24 * 365;
				break;
			}

			var time = +new Date() - off;

			rules.each(function () {
				var uses = $.data(this).uses;

				if (uses && ((usedInPast && off > 0 && uses.lastUsed < time) || (!usedInPast && uses.lastUsed > time)))
					$(this).addClass(which);
			});
			
			if (usedInPast) $$('#filter-type-not-used .selected').click();
			else $$('#filter-type-state .selected').click();
		}).on('click', '.outside', function (e) {
			e.preventDefault();
			self.utils.open_url(this.href);
		}).on('click', '#unlock', function () {
			var off = self.utils.position_poppy(this, 1, 14),
					pop = self.poppies.verify_donation.call([off.left, off.top, 0], self);
			
			new Poppy(off.left, off.top, pop);
		}).on('click', '#js-help', function () {
			self.utils.open_url('http://javascript-blocker.toggleable.com/help');
		}).on('click', '#js-settings', function () {
			Popover.hide();
			self.utils.open_url(ExtensionURL('settings.html'));
		}).on('click', '.toggle-rules', function () {
			var e = $(this).parent().nextAll('.rules-list-container:first').find('.rules-wrapper').show(),
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
					this.style.display = a ? 'none' : 'block';
					this.style.opacity = a ? 0 : 1;
					this.style.marginTop = a ? -(oT * 2) + 'px' : -3;
				
					$(this).toggleClass('visible', !a);
					
					$$('#rules-list').trigger('scroll');

					setTimeout(function () {
						$$('#filter-type-used .selected').click();
					}, 100);
				},
				step: function (now) {
					$$('#rules-list').trigger('scroll');
				}
			});
		}).on('click', '.toggle-main', function (event) {
			var me = $(this),
					head = me.parent(),
					pos = me.hasClass('floater') ? me.next().attr('id') : this.id,
					e = me.parent().next().find('.main-wrapper').show();
			
			if (!e.length) e = me.parent().next().next().find('.main-wrapper');
			
			var o = e.outerHeight(), oT = e.outerHeight(true), a = e.css('opacity') === '1';
						
			if (e.is(':animated')) return false;
					
			this.innerHTML = a ? _('Show') : _('Hide');
						
			if (head.hasClass('floater')) head.next().find('a').html(this.innerHTML);
							
			self.collapsed(pos, a);
			
			if (!a) head.removeClass('collapsed');
			
			head.css('marginBottom', !a ? 3 : 0).animate({
				marginBottom: a ? 3 : 0
			}, 200 * self.speedMultiplier);

			e.css({ opacity: 1, marginTop: !a ? -o : 0 }).animate({
				marginTop: a ? -oT : 0
			}, 200 * self.speedMultiplier, function () {
				this.style.display = a ? 'none' : 'block';
				this.style.opacity = a ? 0 : 1;
				this.style.marginTop = a ? -(oT * 2) + 'px' : 0;
			
				$(this).parent().prev().toggleClass('collapsed', a).css('opacity', 1);
			});
		}).on('click', '.toggle-snapshots', function () {
			var e = $(this).parent().parent().next().find('ul').show(),
					a = e.css('opacity') === '1',
					o = e.outerHeight(), oT = e.outerHeight(true);
										
			if (e.is(':animated')) return false;
										
			this.innerHTML = a ? _('Show') : _('Hide');
								
			e.css({ opacity: 1, marginTop: !a ? -o : -3 }).animate({
				marginTop: a ? -oT : -3,
				marginBottom: a ? 0 : '6px'
			}, 200 * self.speedMultiplier, function () {
				this.style.display = a ? 'none' : 'block';
				this.style.opacity = a ? 0 : 1;
				this.style.marginTop = a ? -(oT * 2) + 'px' : -3;
			});
		}).on('dblclick', '#page-lists-label', function () {
			var l = $.extend({}, window.localStorage);
			delete l.Rules;
			delete l.CollapsedDomains;
			
			var e = $.extend({}, SettingStore.all());
			delete e.Rules;
			delete e.SimpleRules;
			delete e.CollapsedDomains;
			delete e.Snapshots;
			delete e.RulesUseTracker;
			delete e.SimpleRulesUseTracker;
			delete e.EasyList;
			delete e.EasyPrivacy;
			e.donationVerified = !!e.donationVerified;
			
			new Poppy($(self.popover.body).width() / 2, 0, [
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
					'Webpage', "\n", self.tab.url,
				'</textarea>'
			].join(''), function () {
				var t = $$('#debug-info')[0];
				t.selectionStart = 0;
				t.selectionEnd = t.innerHTML.length;
			});
		}).on('click', '#next-frame, #previous-frame', function () {
			var page = $$('#page-list'), index = page[0].selectedIndex, max = $('option', page).length - 1;
			
			if (this.id === 'next-frame') {
				if (index < max)
					page[0].selectedIndex++;
			} else {
				if (index > 0)
					page[0].selectedIndex--;
			}
			
			page.trigger('change');
		}).on('dblclick', '#jsblocker-name', function () {
			var off = self.utils.position_poppy(this, 9, 14);

			new Poppy(off.left, off.top, [
				'<ul class="jsoutput"></ul>',
				'<div class="inputs"><input id="clear-console" value="Clear" type="button" /></div>'
			].join(''), function () {
				var l = $$('#jsconsolelogger'), ol = $$('.jsoutput').html(l.hide().html());
				
				l.find('.unread').removeClass('unread');
				
				$$('.console-unread').html(' 0').hide();
				
				$$('.poppy-content').scrollTop(9999999999999);
				
				$$('#clear-console').click(function () {
					$('li:not(#console-header)', l).remove();
					$$('#jsblocker-name').trigger('dblclick');
				});
			});
		}).on('click', '.show-scripts', function () {
			var off = $(this).offset(), scripts = $(this.parentNode.parentNode).data('script').map(function (v) { return encodeURI(v); });

			new Poppy(off.left + 2 + $(this).width() / 2, off.top + 10, [
				'<ul>',
					'<li><span><a href="javascript:void(0)">', scripts.join(['</a></span> ',
						'<div class="divider"></div>',
					'</li>',
					'<li><span><a href="javascript:void(0)">'].join('')), '</a></span></li>',
				'</ul>'].join(''), function () {
					$$('#poppy a').click(function (e) {
						e.preventDefault();
						self.utils.open_url($('<div />').html(this.innerHTML).text());
					}).parent().scrollLeft(88888);
				});
		}).on('click', '.show-more', function () {
			$(this).parent().parent().nextUntil('.kind-header').filter('.show-more-hidden:not(.hidden-by-rule)')
					.show().removeClass('show-more-hidden').end().end()
					.remove()
			$$('#find-bar-search:visible').trigger('search');
		}).on('click', '.snapshot-date', function (event, t) {
			var snapshots = self.rules.snapshots.all(1),
					using = $(this).parents('li:first').hasClass('using'),
					me = $(this), off = me.offset(), left = t ? t.pageX : event.pageX, top = off.top + 12,
					li = me.parents('li:first'),
					id = me.attr('data-id');

			new Poppy(left, top, [
				'<input type="button" value="', _('Name'), '" id="name-snapshot" /> ',
				'<input type="button" value="', _('Compare'), '" id="compare-snapshot" /> ',
				'<input type="button" value="', _(snapshots[id].keep ? 'Unkeep' : 'Keep'), '" id="keep-snapshot" /> ',
				'<input type="button" value="', _('Delete'), '" id="delete-snapshot" />',
			].join(''), function () {
				$$('#name-snapshot').click(function () {
					new Poppy(left, top, [
						'<input type="text" id="snapshot-name" value="', self.rules.snapshots.name(id), '" /> ',
						'<input type="button" id="save-name" value="', _('Save'), '" class="onenter" />'
					].join(''), function () {
						$$('#snapshot-name').focus().keypress(function (e) {
							if (e.which === 13 || e.which === 3) $$('#save-name').click();
						}).siblings('#save-name').click(function () {
							var v = $.trim($(this).siblings('#snapshot-name').val()), v = v.length ? v : null,
									cname = self.rules.snapshots.name(id);
							
							if (self.rules.snapshots.name(id, v) === false && self.rules.snapshots.name(id) !== v) {
								$$('#poppy').toggleClass('slow', self.speedMultiplier > 1).addClass('shake').one('webkitAnimationEnd', function () {
									$(this).removeClass('shake slow');
								}).find('#snapshot-name').focus();
							} else {
								new Poppy();

								self.utils.timer.timeout('show_snapshots', function (self, id) {
									if (id === self.using_snapshot)
										self.rules.use_snapshot(id);

									self.rules.show_snapshots();
								}, 200, [self, id]);
							}
						});
					});
				}).siblings('#compare-snapshot').click(function () {
					new Poppy(left, top, [
						'<p class="misc-info">', _('Show Rules'), '</p>',
						'<input type="button" value="', _('Only in Snapshot'), '" id="compare-left" data-type="left" /> ',
						'<input type="button" value="', _('Only in My Rules'), '" id="compare-right" data-type="right" /> ',
						'<input type="button" value="', _('In Both'), '" id="compare-both" data-type="both" />'
					].join(''), function () {
						$$('#poppy input').click(function () {
							new Poppy();

							$$('#rules-list').addClass('zoom-window-hidden')

							var compare = self.rules.snapshots.compare(id, self.rules.current_rules), dir = this.getAttribute('data-type'), mes,
									cache_id = self.rules.snapshots.add(compare[dir], 1, 'Comparison Cache (' + +new Date() + ')');

							self.rules.use_snapshot(cache_id);

							self.utils.zoom($$('#snapshots'), null, function () {
								self.utils.zero_timeout(function () {
									self.rules.show();
								});
								self.rules.snapshots.remove(cache_id);
							});

							if (dir === 'left') mes = 'Rules Only in Snapshot: {1}';
							else if (dir === 'right') mes = 'Rules Not in Snapshot: {1}';
							else mes = 'Rules in Both Current Rules and Snapshot: {1}';

							$$('.snapshot-info').show().html(_(mes, [self.rules.snapshots.name_or_date(id)])).data('id', id);
						});
					});
				}).siblings('#keep-snapshot').click(function () {
					if (this.value === _('Keep'))
						self.rules.snapshots.keep(id);
					else {
						if (!self.utils.confirm_click(this)) return false;

						self.rules.snapshots.unkeep(id);
					}

					self.rules.show_snapshots();

					new Poppy();
				}).siblings('#delete-snapshot').click(function () {
					if (!self.utils.confirm_click(this)) return false;

					new Poppy();

					self.rules.snapshots.remove(id);

					if (id === self.rules.using_snapshot) self.rules.use_snapshot(0);

					li.animate({
						top: li.height() - parseInt(li.css('marginTop')),
						right: -li.outerWidth(),
						opacity: 0,
						padding: 0,
						marginTop: -li.height()
					}, 200 * self.speedMultiplier, function () {
						$(this).remove();
						
						self.utils.timer.timeout('show_snapshots', function (self) {
							self.rules.show_snapshots();
						}, 1000, [self]);
					});
				});
			});
		}).on('click', '.preview-snapshot', function () {
			new Poppy();

			var id = $(this).prev().attr('data-id'), me = this;

			$$('#rules-list').addClass('zoom-window-hidden');

			self.utils.zoom($$('#snapshots'), null, function () {
				self.rules.use_snapshot(me.value === _('Close Snapshot') ? 0 : id);
				self.utils.zero_timeout(function () {
					self.rules.show();
				});
			}, function () {
				var parts = $$('#domain-filter').trigger('search').data('parts');
												
				for (var i = 0; i < parts.length; i++)
					$$('.domain-name[data-value="' + (i > 0 ? '.' : '') + parts[i] + '"].hidden').click();
			});
		}).on('mousedown', 'body > *:not(#poppy,#poppy-secondary,#modal)', function (event) {
			if (event.isTrigger) return;
			new Poppy();
		}).on('mousedown', 'body > *:not(#poppy-secondary,#modal)', function (event) {
			if (event.isTrigger) return;
			new Poppy(null, null, null, null, null, null, false, true);
		}).on('click', '.urls-inner h3', function (event) {
			var split = this.id.split('-'),
					allowed = split[0] === 'allowed',
					kind = split[1],
					me = $(this), off = me.offset(), left = event.pageX, top = off.top + 12,
					page_parts = self.utils.domain_parts(self.host);

			new Poppy(left, top, [
				'<p class="misc-info">', _((allowed ? 'Allowed' : 'Blocked') + ' ' + kind + 's'), '</p>',
				'<p>',
					'<input type="checkbox" id="excluding-list" checked /> ',
					'<label for="excluding-list">Excluding ', allowed ? 'whitelist' : 'blacklist', 'ed items</label>',
				'</p><p>',
					'<input id="domain-script-temporary" type="checkbox"', self.collapsed('LastRuleWasTemporary') ? ' checked' : '', ' />',
					'<label for="domain-script-temporary">&nbsp;', _('Make these temporary rules'), '</label>',
				'</p>',
				'<p>', Template.create('domain_picker', { page_parts: page_parts, no_all: true }), '</p>',
				'<div class="inputs"><input id="allow-these" type="button" value="', _((allowed ? 'Block' : 'Allow') +' These'), '" /></div>',
			].join(''), function () {
				$$('#allow-these, #temporary-these').click(function () {
					var temp = $$('#domain-script-temporary').is(':checked'),
							host = $$('#domain-picker').val(), disallow_predefined = $$('#excluding-list').is(':checked');

					$$('#' + (allowed ? 'allowed' : 'blocked') + '-items-' + kind).find('li').each(function () {
						if (disallow_predefined && ($(this).is('.rule-type-5') || $(this).is('.rule-type-4'))) return;

						var data = $.data(this), proto = self.utils.active_protocol(data.script[0]).toUpperCase(),
								rule = self.simpleMode && kind !== 'special' ? proto + ':' + data.url : data.script[0];

						self.rules.add(kind, host, rule, allowed ? 0 : 1, false, temp);
					});

					Tabs.messageActive('reload');
				});
			});
		});
	},
	
	make_list: function (text, button, jsblocker) {
		var self = this, el = $$('#' + text + '-script-urls .urls-inner').empty(), use_url, test_url, protocol, poopy,
				shost_list = {}, lab = $$('#' + text + '-scripts-count'), cn = 0, key;

		for (key in this.rules.data_types)
			shost_list[key] = {};
			
		function append_url(index, kind, ul, use_url, script, type, button, protocol, unblockable) {
			return ul.append('<li>' + (text !== 'unblocked' ? '<div class="info-link">?</div>' : '') + '<span></span> <small></small><div class="divider"></div></li>')
					.find('li:last').attr('id', text.toLowerCase() + '-' + kind + '-' + index)
					.data({
						url: use_url,
						script: [script],
						kind: kind,
						protocol: protocol
					}).addClass('visible kind-' + kind).toggleClass('selectable', Settings.getItem('traverseMainItems'))
					.toggleClass('by-rule', typeof type !== 'string' && type !== -1)
					.toggleClass('rule-type-' + type, type > -1)
					.toggleClass('unblockable', kind !== 'special' && unblockable && text !== 'unblocked')
					.find('span').text(use_url).addClass(protocol)
					.attr('title', self.simpleMode && protocol ? (_(protocol) + ' (' + protocol + ')') : '').parent();
		}
		
		function add_item(index, kind, the_item) {
			var item = the_item[0], protocol = null;

			if (text === 'unblocked') {
				the_item = [the_item, the_item, the_item];
				item = the_item[0];
			} else
				protocol = self.utils.active_protocol(item);

			if (text !== 'unblocked' && self.simpleMode) {
				use_url = self.utils.active_host(item);
				test_url = use_url + the_item[1];

				if (!(protocol in shost_list[kind])) shost_list[kind][protocol] = {};

				if (!(test_url in shost_list[kind][protocol])) {
					li = append_url(index, kind, ul, use_url, item, the_item[1], button, protocol, the_item[2]);
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
				li = append_url(index, kind, ul, item, item, the_item[1], button, protocol, the_item[2]);
			
			return li;
		}

		var cn = 0;
			
		for (var key in this.rules.data_types) {
			if (!this.enabled(key) || ~key.indexOf('hide_')) continue;
			
			var ki = _(key + 's'),
					do_hide = this.collapsed('toggle-' + key + '-' + text + '-items'),
					ul = $$('#' + text + '-items-' + key),
					li, ccheck, show_me = $('<div />');
			
			if (!ul.length)
				ul = $(Template.create('main_wrapper', {
					local: ki,
					which: text,
					kind: key
				})).appendTo(el).filter('div').find('ul');
			
			ul.css('display', do_hide ? 'none' : 'block')
				.parent().prev().toggleClass('collapsed', do_hide).toggleClass('visible', !do_hide).find('.toggle-main').html(_(do_hide ? 'Show' : 'Hide'));;

			if (self.simpleMode && text !== 'unblocked') {		
				cn += jsblocker[text][key].unique.length;
					
				lab.html(cn);
			} else {				
				if (key !== 'special')
					cn += jsblocker[text][key].all.length;

				lab.html(cn);
			}
				
			if (jsblocker[text][key].all.length) {
				ul.parent().show().prev().show();
					
				for (var i = 0, b = jsblocker[text][key].all.length; i < b; i++) {
					var jitem = jsblocker[text][key].all[i];

					if (key === 'special' && !this.special_enabled(jitem)) continue;
					
					li = ~key.indexOf('special') ? append_url(i, key, ul, _(jitem), jitem, -1, button, key.toUpperCase()) :
							add_item(i, key, jitem);

					if (text !== 'unblocked' && !~key.indexOf('hide_')) {
						var al = self.rules.allowed(['hide_' + key, jsblocker.href, key === 'special' ? jitem : jitem[0], false]);

						if (al[1] === 42) {
							li.addClass('hidden-by-rule');
							$$('#toggle-hidden').removeClass('disabled');
						}
					}

					ccheck = $('li:not(.show-me-more,.hidden-by-rule).kind-' + key, ul).length;
									
					if (ccheck > Settings.getItem('sourceCount')) {
						if (!$('.show-me-more', ul).length)
							show_me = $(['<li class="', Settings.getItem('traverseMainItems') ? 'selectable' : '', ' show-me-more visible kind-', key, '">',
									'<span><a href="javascript:void(1)" class="show-more"></a></span>',
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
			}
				
			if (!$('li:not(.hidden-by-rule)', ul).length || !jsblocker[text][key].all.length)
				ul.parent().hide().prev().hide();
				
			$('li .divider:last', ul).addClass('invisible');

			if ($('li:last', ul).is('.hidden-by-rule'))
				$('li:not(.hidden-by-rule):last .divider', ul).addClass('invisible');
		
			if (this.simpleMode && Settings.getItem('showPerHost')) {
				ul.addClass('show-per-host');
				
				for (var kind in shost_list)
					for (poopy in shost_list[kind])
						for (use_url in shost_list[kind][poopy]) {
							$('#' + shost_list[kind][poopy][use_url][1], ul).find('small')
									.html('<a href="javascript:void(0);" class="show-scripts">' + shost_list[kind][poopy][use_url][0] + '</a>');
						}				
			}
				
			if (self.collapsed(text)) {
				$$('.' + text + '-label:not(.hidden)').click();
				$('.kind-header', ul).removeClass('visible');
			}
		}
	},	
	do_update_popover: function (event, index, badge_only) {
		if (!this.trial_active() && !this.donationVerified && !badge_only && this.trialStart > -1)
			return this.utils.timer.timeout('trial_expired', function (self) {
				new Poppy($(self.popover.body).width() / 2, 0, [
					'<p>', _('Free trial expired', ['JavaScript Blocker']), '</p>',
					'<p><input type="button" id="click-understood" value="', _('Understood'), '" /></p>'
				].join(''), function () {
					$$('#click-understood').click(function () {
						self.trialStart = -1;
						new Poppy();
						Popover.window().location.reload();
					});
				}, null, null, true);
			}, 1000, [this]);
		
		if (!this.methodAllowed || this.disabled) return false;

		if (($$('.poppy').is(':visible') || $$('.some-list').length || $$('li.pending:not(.allow-update)').length) && Popover.visible())
			return this.utils.timer.timeout('do_update_popover', function (self, event, index, badge_only) {
				self.do_update_popover(event, index, badge_only);
			}, 1500, [this, event, index, badge_only]);
		
		this.busy = 1;

		if (this.tab.url === event.target.url) {			
			var frame_count = { blocked: 0, allowed: 0 }, frame,
					count = { blocked: 0, allowed: 0, unblocked: 0 }, self = this, jsblocker = event.message, toolbarItem = null,
					frame_items = { blocked: 0, allowed: 0 }, main_items = { blocked: 0, allowed: 0 };
					
			this.caches.jsblocker[event.message.href] = jsblocker;
								
			for (var act in jsblocker) {
				if (act === 'href') continue;
				for (var kind in jsblocker[act])
					if (kind !== 'special' && this.enabled(kind))
						count[act] += jsblocker[act][kind].all.length;
			}

			if (this.simpleMode) {
				for (var key in jsblocker.blocked) {
					if (key === 'special' || !this.enabled(key)) continue;
					
					main_items.blocked += jsblocker.blocked[key].unique.length;
					main_items.allowed += jsblocker.allowed[key].unique.length;
				}
			}

			if (!badge_only) {
				var page_list = $$('#page-list').empty().blur();

				$('<optgroup />').attr('label', _('Main Page')).appendTo(page_list).append('<option />').find('option')
					.attr('value', jsblocker.href)
					.text(jsblocker.href)
					.append(Settings.getItem('showPageListCount') ? ' — ' + _('{1} allowed, {2} blocked', [this.simpleMode ? main_items.allowed : count.allowed, this.simpleMode ? main_items.blocked : count.blocked]) : '');
			}

			if (jsblocker.href in this.frames) {
				var frame, inline, xx = this.frames[jsblocker.href], d;

				for (frame in xx) {
					var this_one = { blocked: 0, allowed: 0 };

					if (!badge_only) {
						if (page_list.find('optgroup').length == 1)
							inline = $('<optgroup />').attr('label', _('Inline Frame Pages')).appendTo(page_list);
						else
							inline = page_list.find('optgroup:eq(1)');
					}

					for (var act in xx[frame]) {
						if (act === 'href') continue;
						for (var kind in xx[frame][act])
							if (kind !== 'special' && this.enabled(kind)) {
								frame_count[act] += xx[frame][act][kind].all.length;

								if (!this.simpleMode)
									this_one[act] += xx[frame][act][kind].all.length
							}
					}
					
					for (var key in xx[frame].blocked) {
						if (key === 'special' || !this.enabled(key)) continue;
						
						frame_items.blocked += xx[frame].blocked[key].unique.length;
						frame_items.allowed += xx[frame].allowed[key].unique.length;

						if (this.simpleMode) {
							this_one.blocked += xx[frame].blocked[key].unique.length;
							this_one.allowed += xx[frame].allowed[key].unique.length;
						}
					}
					
					d = ('display' in xx[frame]) ? xx[frame].display : xx[frame].href;
				
					if (!badge_only)
						$('<option />').addClass('frame-page').attr('value', xx[frame].href)
							.text(d).appendTo(inline)
							.append(Settings.getItem('showPageListCount') ? ' - ' + _('{1} allowed, {2} blocked', [this_one.allowed, this_one.blocked]) : '');
				}
			}
			
			var toolbarDisplay = Settings.getItem('toolbarDisplay');

			ToolbarItems.image(this.disabled ? 'images/toolbar-disabled.png' : 'images/toolbar.png');
			
			if (!self.simpleMode)
				ToolbarItems.badge(Settings.getItem('toolbarDisplay') === 'allowed' ?
						count.allowed + frame_count.allowed :
						(Settings.getItem('toolbarDisplay') === 'blocked' ? count.blocked + frame_count.blocked : 0));
			else {															
				ToolbarItems.badge(Settings.getItem('toolbarDisplay') === 'allowed' ?
						main_items.allowed + frame_items.allowed :
						(Settings.getItem('toolbarDisplay') === 'blocked' ? main_items.blocked + frame_items.blocked : 0));
			}
			
			if (!badge_only) {
				$$('#main:visible').scrollTop(0);
				$$('.some-helper').remove();
				$$('.column .info-container').show();
				$$('#toggle-hidden').addClass('disabled').removeClass('hidden-visible');	
				$$('#previous-frame, #next-frame, #frame-switcher .divider').removeClass('disabled').filter('#previous-frame').find('.text').html(_('Main page'));
				$$('#block-domain, #allow-domain').show();
				
				var max = $('option', page_list).length - 1;
			
				if (typeof index == 'number' && index > 0) {
					page_list[0].selectedIndex = index;
					
					if (index === 0)
						$$('#previous-frame').addClass('disabled').removeClass('current-selection');
					else if (index > 1)
						$$('#previous-frame .text').html(_('Prev. frame'));
					
					try {
						jsblocker = this.frames[jsblocker.href][page_list.val()];
					} catch (e) {}
				} else
					$$('#previous-frame').addClass('disabled').removeClass('current-selection');
				
				if ($$('#next-frame').toggleClass('disabled', max === 0 || index === max).hasClass('current-selection'))
					$$('#next-frame').toggleClass('current-selection', !(max === 0 || index === max))

				$$('#frame-switcher .divider').toggleClass('disabled', $$('#next-frame.disabled, #previous-frame.disabled').length === 2);
				
				page_list.attr('title', page_list.val()).off('change').one('change', function () {
					new Poppy();
					$$('.some-list').removeClass('some-list');
					self.do_update_popover(event, this.selectedIndex);
				});

				this.make_list('blocked', _('Allow'), jsblocker);
				this.make_list('allowed', _('Block'), jsblocker);
				
				if (Settings.getItem('showUnblocked'))
					this.make_list('unblocked', _('View'), jsblocker);
			}
		}
		
		this.busy = 0;
	},
	setting_changed: function (event) {
		if (event.key === 'simpleMode' || event.key === 'simplifiedRules') {
			this.utils.zero_timeout(function (rules) {
				rules.snapshots = new Snapshots(rules.which, Settings.getItem('enableSnapshots') ? Settings.getItem('snapshotsLimit') : 0);
			}, [this.rules]);

			this.rules.use_snapshot(0);
			this.rules.use_tracker.load();
		}

		if (event.key === 'openSettings' && event.newValue) {
			Settings.setItem('openSettings', false);
			this.utils.open_url(ExtensionURL('settings.html'));
		} else if (event.key === 'language' || event.key === 'theme')
			this.reloaded = false;
		else if (event.key === 'theme' && event.newValue !== 'default' && !this.donationVerified)
			Settings.setItem('theme', 'default');
		else if (event.key === 'simpleMode' && !event.newValue && !this.donationVerified)
			Settings.setItem('simpleMode', true);
		else if (event.key === 'blockReferrer' && event.newValue && !this.donationVerified)
			Settings.setItem('blockReferrer', false);
		else if (event.key === 'simplifiedRules')
			this.rules.reload();
		else if (event.key === 'snapshotsLimit' && event.newValue > 999)
			Settings.setItem('snapshotsLimit', 999);
		else if (event.key === 'snapshotsLimit' && event.newValue < 1 && event.newValue)
			Settings.setItem('snapshotsLimit', 1);
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
		var self = this;

		theSwitch:
		switch (event.name) {
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
						
						case 'setting':
							event.message = Settings.getItem(event.message[1]);
						break theSwitch;
						
						case 'special':
							event.message = this.disabled ? 84 : this.rules.special_allowed(event.message[1], event.message[2]);
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

						case 'disabled':
							event.message = this.disabled;
						break theSwitch;
					}
				
				if (this.disabled || (event.message[0] !== 'script' && !this.donationVerified)) {
					event.message = [1, -84];
					break theSwitch;
				} else if (this.installedBundle < this.update_attention_required || !this.methodAllowed) {
					if (this.installedBundle < this.update_attention_required)
						Tabs.messageActive('notification', [
							'Your attention is required in order for JavaScript Blocker to continue functioning properly. ' +
								'Please click the flashing toolbar icon to open the popover to continue.',
							'JavaScript Blocker Update'
						]);
					event.message = this.enabled(event.message[0]) ? [0, -84] : [1, -84];
					break theSwitch;
				}

				event.message = this.rules.allowed(event.message);
			break;

			case 'setActiveTab':
				this.set_active_tab();
			break;

			case 'convertRules':
				Tabs.messageActive('convertRules', this.rules.convert());
			break;

			case 'convertSimpleToExpert':
				Tabs.messageActive('convertSimpleToExpert', this.rules.convertSimpleToExpert());
			break;

			case 'closeSettings':
				Tabs.messageActive('closeSettings');
			break;

			case 'getAllSettings':
				Tabs.messageActive('gotAllSettings', $.extend({}, SettingStore.all()));
			break;

			case 'aboutPage':
				Tabs.messageActive('aboutPage', {
					displayv: this.displayv,
					trial_active: this.trial_active(),
					trial_remaining: this.trial_remaining(),
					bundleid: this.bundleid,
					easylist_last_update: Settings.getItem('EasyListLastUpdate') || 0
				});
			break;

			case 'setting_set':
				var dl = ['donationVerified', 'trialStart', 'installID', 'installedBundle', 'enablespecial', 'setupDone'],
						swith = Settings.getItem('simplifiedRules');
				
				if (event.message[1] === null) {
					if (!~dl.indexOf(event.message[0]))
						SettingStore.removeItem(event.message[0]);
				} else if (event.message[0] === 'Rules') {
					Settings.setItem('simplifiedRules', false);
					this.rules.import(event.message[1]);
					Settings.setItem('simplifiedRules', swith);
				} else if (event.message[0] === 'SimpleRules') {
					Settings.setItem('simplifiedRules', true);
					this.rules.import(event.message[1]);
					Settings.setItem('simplifiedRules', swith);
				} else if (!~dl.indexOf(event.message[0]))
					Settings.setItem(event.message[0], event.message[1]);
			break;

			case 'resetSettings':
				var all = SettingStore.all();

				for (var key in all)
					if (!~['donationVerified', 'trialStart', 'installID', 'installedBundle', 'enablespecial', 'setupDone'].indexOf(key))
						SettingStore.removeItem(key);

				SettingStore.setItem('openSettings', false);
			break;

			case 'updatePopover':
				Tabs.active(function (tab) {
					if (tab[0].url !== event.message.href ||
							(Popover.visible() && $$('#page-list')[0].selectedIndex > 0)) return;
						
					self.utils.timer.timeout('update_popover', function (event, self) {
						self.do_update_popover(event, undefined, !Popover.visible());
					}, 10, [event, self]);
				});
			break;
			
			case 'updateReady':
				if (event.target != this.tab) break;
					
				this.utils.timer.remove('timeout', 'update_failure');
			break;
			
			case 'addFrameData':
				if (!(event.target.url in this.frames) || this.frames[event.target.url] === undefined)
					this.frames[event.target.url] = {};
				
				if (event.target.url === event.message[0] && event.message.length < 3) {
					MessageTarget(event, 'validateFrame', JSON.stringify(event.message[0]));
					break;
				} else if (event.target.url === event.message[0] && event.message.length === 3)
					event.message[1].display = event.message[2] === -1 ? _('Custom Frame') : event.message[2];
					
				this.frames[event.target.url][event.message[0]] = event.message[1];
			
				try {
					Tabs.messageActive('updatePopover', event.message);
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
				MessageTarget(event, 'setting', JSON.stringify([event.message, Settings.getItem(event.message)]));
			break;
			
			case 'reloadPopover':
				this.reloaded = false;
			break;
			
			case 'doNothing': break;
		}
	},
	_redirectors: {"0rz.tw":{"domain":"0rz.tw","regex":""},"1link.in":{"domain":"1link.in","regex":""},"1url.com":{"domain":"1url.com","regex":""},"2.gp":{"domain":"2.gp","regex":""},"2big.at":{"domain":"2big.at","regex":""},"2tu.us":{"domain":"2tu.us","regex":""},"3.ly":{"domain":"3.ly","regex":""},"307.to":{"domain":"307.to","regex":""},"4ms.me":{"domain":"4ms.me","regex":""},"4sq.com":{"domain":"4sq.com","regex":""},"4url.cc":{"domain":"4url.cc","regex":""},"6url.com":{"domain":"6url.com","regex":""},"7.ly":{"domain":"7.ly","regex":""},"a.gg":{"domain":"a.gg","regex":""},"a.nf":{"domain":"a.nf","regex":""},"aa.cx":{"domain":"aa.cx","regex":""},"abcurl.net":{"domain":"abcurl.net","regex":""},"ad.vu":{"domain":"ad.vu","regex":""},"adf.ly":{"domain":"adf.ly","regex":""},"adjix.com":{"domain":"adjix.com","regex":""},"afx.cc":{"domain":"afx.cc","regex":""},"all.fuseurl.com":{"domain":"all.fuseurl.com","regex":""},"alturl.com":{"domain":"alturl.com","regex":""},"amzn.to":{"domain":"amzn.to","regex":""},"ar.gy":{"domain":"ar.gy","regex":""},"arst.ch":{"domain":"arst.ch","regex":""},"atu.ca":{"domain":"atu.ca","regex":""},"azc.cc":{"domain":"azc.cc","regex":""},"b23.ru":{"domain":"b23.ru","regex":""},"b2l.me":{"domain":"b2l.me","regex":""},"bacn.me":{"domain":"bacn.me","regex":""},"bcool.bz":{"domain":"bcool.bz","regex":""},"binged.it":{"domain":"binged.it","regex":""},"bit.ly":{"domain":"bit.ly","regex":""},"bizj.us":{"domain":"bizj.us","regex":""},"bloat.me":{"domain":"bloat.me","regex":""},"bravo.ly":{"domain":"bravo.ly","regex":""},"bsa.ly":{"domain":"bsa.ly","regex":""},"budurl.com":{"domain":"budurl.com","regex":""},"canurl.com":{"domain":"canurl.com","regex":""},"chilp.it":{"domain":"chilp.it","regex":""},"chzb.gr":{"domain":"chzb.gr","regex":""},"cl.lk":{"domain":"cl.lk","regex":""},"cl.ly":{"domain":"cl.ly","regex":""},"clck.ru":{"domain":"clck.ru","regex":""},"cli.gs":{"domain":"cli.gs","regex":""},"cliccami.info":{"domain":"cliccami.info","regex":""},"clickthru.ca":{"domain":"clickthru.ca","regex":""},"clop.in":{"domain":"clop.in","regex":""},"conta.cc":{"domain":"conta.cc","regex":""},"cort.as":{"domain":"cort.as","regex":""},"cot.ag":{"domain":"cot.ag","regex":""},"crks.me":{"domain":"crks.me","regex":""},"ctvr.us":{"domain":"ctvr.us","regex":""},"cutt.us":{"domain":"cutt.us","regex":""},"dai.ly":{"domain":"dai.ly","regex":""},"decenturl.com":{"domain":"decenturl.com","regex":""},"dfl8.me":{"domain":"dfl8.me","regex":""},"digbig.com":{"domain":"digbig.com","regex":""},"digg.com":{"domain":"digg.com","regex":"http:\\\/\\\/digg\\.com\\\/[^\\\/]+$"},"disq.us":{"domain":"disq.us","regex":""},"dld.bz":{"domain":"dld.bz","regex":""},"dlvr.it":{"domain":"dlvr.it","regex":""},"do.my":{"domain":"do.my","regex":""},"doiop.com":{"domain":"doiop.com","regex":""},"dopen.us":{"domain":"dopen.us","regex":""},"easyuri.com":{"domain":"easyuri.com","regex":""},"easyurl.net":{"domain":"easyurl.net","regex":""},"eepurl.com":{"domain":"eepurl.com","regex":""},"eweri.com":{"domain":"eweri.com","regex":""},"fa.by":{"domain":"fa.by","regex":""},"fav.me":{"domain":"fav.me","regex":""},"fb.me":{"domain":"fb.me","regex":""},"fbshare.me":{"domain":"fbshare.me","regex":""},"ff.im":{"domain":"ff.im","regex":""},"fff.to":{"domain":"fff.to","regex":""},"fire.to":{"domain":"fire.to","regex":""},"firsturl.de":{"domain":"firsturl.de","regex":""},"firsturl.net":{"domain":"firsturl.net","regex":""},"flic.kr":{"domain":"flic.kr","regex":""},"flq.us":{"domain":"flq.us","regex":""},"fly2.ws":{"domain":"fly2.ws","regex":""},"fon.gs":{"domain":"fon.gs","regex":""},"freak.to":{"domain":"freak.to","regex":""},"fuseurl.com":{"domain":"fuseurl.com","regex":""},"fuzzy.to":{"domain":"fuzzy.to","regex":""},"fwd4.me":{"domain":"fwd4.me","regex":""},"fwib.net":{"domain":"fwib.net","regex":""},"g.ro.lt":{"domain":"g.ro.lt","regex":""},"gizmo.do":{"domain":"gizmo.do","regex":""},"gl.am":{"domain":"gl.am","regex":""},"go.9nl.com":{"domain":"go.9nl.com","regex":""},"go.ign.com":{"domain":"go.ign.com","regex":""},"go.usa.gov":{"domain":"go.usa.gov","regex":""},"goo.gl":{"domain":"goo.gl","regex":""},"goshrink.com":{"domain":"goshrink.com","regex":""},"gurl.es":{"domain":"gurl.es","regex":""},"hex.io":{"domain":"hex.io","regex":""},"hiderefer.com":{"domain":"hiderefer.com","regex":""},"hmm.ph":{"domain":"hmm.ph","regex":""},"href.in":{"domain":"href.in","regex":""},"hsblinks.com":{"domain":"hsblinks.com","regex":""},"htxt.it":{"domain":"htxt.it","regex":""},"huff.to":{"domain":"huff.to","regex":""},"hulu.com":{"domain":"hulu.com","regex":""},"hurl.me":{"domain":"hurl.me","regex":""},"hurl.ws":{"domain":"hurl.ws","regex":""},"icanhaz.com":{"domain":"icanhaz.com","regex":""},"idek.net":{"domain":"idek.net","regex":""},"ilix.in":{"domain":"ilix.in","regex":""},"is.gd":{"domain":"is.gd","regex":""},"its.my":{"domain":"its.my","regex":""},"ix.lt":{"domain":"ix.lt","regex":""},"j.mp":{"domain":"j.mp","regex":""},"jijr.com":{"domain":"jijr.com","regex":""},"kl.am":{"domain":"kl.am","regex":""},"klck.me":{"domain":"klck.me","regex":""},"korta.nu":{"domain":"korta.nu","regex":""},"krunchd.com":{"domain":"krunchd.com","regex":""},"l9k.net":{"domain":"l9k.net","regex":""},"lat.ms":{"domain":"lat.ms","regex":""},"liip.to":{"domain":"liip.to","regex":""},"liltext.com":{"domain":"liltext.com","regex":""},"linkbee.com":{"domain":"linkbee.com","regex":""},"linkbun.ch":{"domain":"linkbun.ch","regex":""},"liurl.cn":{"domain":"liurl.cn","regex":""},"ln-s.net":{"domain":"ln-s.net","regex":""},"ln-s.ru":{"domain":"ln-s.ru","regex":""},"lnk.gd":{"domain":"lnk.gd","regex":""},"lnk.ms":{"domain":"lnk.ms","regex":""},"lnkd.in":{"domain":"lnkd.in","regex":""},"lnkurl.com":{"domain":"lnkurl.com","regex":""},"lru.jp":{"domain":"lru.jp","regex":""},"lt.tl":{"domain":"lt.tl","regex":""},"lurl.no":{"domain":"lurl.no","regex":""},"macte.ch":{"domain":"macte.ch","regex":""},"mash.to":{"domain":"mash.to","regex":""},"merky.de":{"domain":"merky.de","regex":""},"migre.me":{"domain":"migre.me","regex":""},"miniurl.com":{"domain":"miniurl.com","regex":""},"minurl.fr":{"domain":"minurl.fr","regex":""},"mke.me":{"domain":"mke.me","regex":""},"moby.to":{"domain":"moby.to","regex":""},"moourl.com":{"domain":"moourl.com","regex":""},"mrte.ch":{"domain":"mrte.ch","regex":""},"myloc.me":{"domain":"myloc.me","regex":""},"myurl.in":{"domain":"myurl.in","regex":""},"n.pr":{"domain":"n.pr","regex":""},"nbc.co":{"domain":"nbc.co","regex":""},"nblo.gs":{"domain":"nblo.gs","regex":""},"nn.nf":{"domain":"nn.nf","regex":""},"not.my":{"domain":"not.my","regex":""},"notlong.com":{"domain":"notlong.com","regex":""},"nsfw.in":{"domain":"nsfw.in","regex":""},"nutshellurl.com":{"domain":"nutshellurl.com","regex":""},"nxy.in":{"domain":"nxy.in","regex":""},"nyti.ms":{"domain":"nyti.ms","regex":""},"o-x.fr":{"domain":"o-x.fr","regex":""},"oc1.us":{"domain":"oc1.us","regex":""},"om.ly":{"domain":"om.ly","regex":""},"omf.gd":{"domain":"omf.gd","regex":""},"omoikane.net":{"domain":"omoikane.net","regex":""},"on.cnn.com":{"domain":"on.cnn.com","regex":""},"on.mktw.net":{"domain":"on.mktw.net","regex":""},"onforb.es":{"domain":"onforb.es","regex":""},"orz.se":{"domain":"orz.se","regex":""},"ow.ly":{"domain":"ow.ly","regex":""},"ping.fm":{"domain":"ping.fm","regex":""},"pli.gs":{"domain":"pli.gs","regex":""},"pnt.me":{"domain":"pnt.me","regex":""},"politi.co":{"domain":"politi.co","regex":""},"post.ly":{"domain":"post.ly","regex":""},"pp.gg":{"domain":"pp.gg","regex":""},"profile.to":{"domain":"profile.to","regex":""},"ptiturl.com":{"domain":"ptiturl.com","regex":""},"pub.vitrue.com":{"domain":"pub.vitrue.com","regex":""},"qlnk.net":{"domain":"qlnk.net","regex":""},"qte.me":{"domain":"qte.me","regex":""},"qu.tc":{"domain":"qu.tc","regex":""},"qy.fi":{"domain":"qy.fi","regex":""},"r.im":{"domain":"r.im","regex":""},"rb6.me":{"domain":"rb6.me","regex":""},"read.bi":{"domain":"read.bi","regex":""},"readthis.ca":{"domain":"readthis.ca","regex":""},"reallytinyurl.com":{"domain":"reallytinyurl.com","regex":""},"redir.ec":{"domain":"redir.ec","regex":""},"redirects.ca":{"domain":"redirects.ca","regex":""},"redirx.com":{"domain":"redirx.com","regex":""},"retwt.me":{"domain":"retwt.me","regex":""},"ri.ms":{"domain":"ri.ms","regex":""},"rickroll.it":{"domain":"rickroll.it","regex":""},"riz.gd":{"domain":"riz.gd","regex":""},"rt.nu":{"domain":"rt.nu","regex":""},"ru.ly":{"domain":"ru.ly","regex":""},"rubyurl.com":{"domain":"rubyurl.com","regex":""},"rurl.org":{"domain":"rurl.org","regex":""},"rww.tw":{"domain":"rww.tw","regex":""},"s4c.in":{"domain":"s4c.in","regex":""},"s7y.us":{"domain":"s7y.us","regex":""},"safe.mn":{"domain":"safe.mn","regex":""},"sameurl.com":{"domain":"sameurl.com","regex":""},"sdut.us":{"domain":"sdut.us","regex":""},"shar.es":{"domain":"shar.es","regex":""},"shink.de":{"domain":"shink.de","regex":""},"shorl.com":{"domain":"shorl.com","regex":""},"short.ie":{"domain":"short.ie","regex":""},"short.to":{"domain":"short.to","regex":""},"shortlinks.co.uk":{"domain":"shortlinks.co.uk","regex":""},"shorturl.com":{"domain":"shorturl.com","regex":""},"shout.to":{"domain":"shout.to","regex":""},"show.my":{"domain":"show.my","regex":""},"shrinkify.com":{"domain":"shrinkify.com","regex":""},"shrinkr.com":{"domain":"shrinkr.com","regex":""},"shrt.fr":{"domain":"shrt.fr","regex":""},"shrt.st":{"domain":"shrt.st","regex":""},"shrten.com":{"domain":"shrten.com","regex":""},"shrunkin.com":{"domain":"shrunkin.com","regex":""},"simurl.com":{"domain":"simurl.com","regex":""},"slate.me":{"domain":"slate.me","regex":""},"smallr.com":{"domain":"smallr.com","regex":""},"smsh.me":{"domain":"smsh.me","regex":""},"smurl.name":{"domain":"smurl.name","regex":""},"sn.im":{"domain":"sn.im","regex":""},"snipr.com":{"domain":"snipr.com","regex":""},"snipurl.com":{"domain":"snipurl.com","regex":""},"snurl.com":{"domain":"snurl.com","regex":""},"sp2.ro":{"domain":"sp2.ro","regex":""},"spedr.com":{"domain":"spedr.com","regex":""},"srnk.net":{"domain":"srnk.net","regex":""},"srs.li":{"domain":"srs.li","regex":""},"starturl.com":{"domain":"starturl.com","regex":""},"su.pr":{"domain":"su.pr","regex":""},"surl.co.uk":{"domain":"surl.co.uk","regex":""},"surl.hu":{"domain":"surl.hu","regex":""},"t.cn":{"domain":"t.cn","regex":""},"t.co":{"domain":"t.co","regex":""},"t.lh.com":{"domain":"t.lh.com","regex":""},"ta.gd":{"domain":"ta.gd","regex":""},"tbd.ly":{"domain":"tbd.ly","regex":""},"tcrn.ch":{"domain":"tcrn.ch","regex":""},"tgr.me":{"domain":"tgr.me","regex":""},"tgr.ph":{"domain":"tgr.ph","regex":""},"tighturl.com":{"domain":"tighturl.com","regex":""},"tiniuri.com":{"domain":"tiniuri.com","regex":""},"tiny.cc":{"domain":"tiny.cc","regex":""},"tiny.ly":{"domain":"tiny.ly","regex":""},"tiny.pl":{"domain":"tiny.pl","regex":""},"tinylink.in":{"domain":"tinylink.in","regex":""},"tinyuri.ca":{"domain":"tinyuri.ca","regex":""},"tinyurl.com":{"domain":"tinyurl.com","regex":""},"tk.":{"domain":"tk.","regex":""},"tl.gd":{"domain":"tl.gd","regex":""},"tmi.me":{"domain":"tmi.me","regex":""},"tnij.org":{"domain":"tnij.org","regex":""},"tnw.to":{"domain":"tnw.to","regex":""},"tny.com":{"domain":"tny.com","regex":""},"to.":{"domain":"to.","regex":""},"to.ly":{"domain":"to.ly","regex":""},"togoto.us":{"domain":"togoto.us","regex":""},"totc.us":{"domain":"totc.us","regex":""},"toysr.us":{"domain":"toysr.us","regex":""},"tpm.ly":{"domain":"tpm.ly","regex":""},"tr.im":{"domain":"tr.im","regex":""},"tra.kz":{"domain":"tra.kz","regex":""},"trunc.it":{"domain":"trunc.it","regex":""},"twhub.com":{"domain":"twhub.com","regex":""},"twirl.at":{"domain":"twirl.at","regex":""},"twitclicks.com":{"domain":"twitclicks.com","regex":""},"twitterurl.net":{"domain":"twitterurl.net","regex":""},"twitterurl.org":{"domain":"twitterurl.org","regex":""},"twiturl.de":{"domain":"twiturl.de","regex":""},"twurl.cc":{"domain":"twurl.cc","regex":""},"twurl.nl":{"domain":"twurl.nl","regex":""},"u.mavrev.com":{"domain":"u.mavrev.com","regex":""},"u.nu":{"domain":"u.nu","regex":""},"u76.org":{"domain":"u76.org","regex":""},"ub0.cc":{"domain":"ub0.cc","regex":""},"ulu.lu":{"domain":"ulu.lu","regex":""},"updating.me":{"domain":"updating.me","regex":""},"ur1.ca":{"domain":"ur1.ca","regex":""},"url.az":{"domain":"url.az","regex":""},"url.co.uk":{"domain":"url.co.uk","regex":""},"url.ie":{"domain":"url.ie","regex":""},"url360.me":{"domain":"url360.me","regex":""},"url4.eu":{"domain":"url4.eu","regex":""},"urlborg.com":{"domain":"urlborg.com","regex":""},"urlbrief.com":{"domain":"urlbrief.com","regex":""},"urlcover.com":{"domain":"urlcover.com","regex":""},"urlcut.com":{"domain":"urlcut.com","regex":""},"urlenco.de":{"domain":"urlenco.de","regex":""},"urli.nl":{"domain":"urli.nl","regex":""},"urls.im":{"domain":"urls.im","regex":""},"urlshorteningservicefortwitter.com":{"domain":"urlshorteningservicefortwitter.com","regex":""},"urlx.ie":{"domain":"urlx.ie","regex":""},"urlzen.com":{"domain":"urlzen.com","regex":""},"usat.ly":{"domain":"usat.ly","regex":""},"use.my":{"domain":"use.my","regex":""},"vb.ly":{"domain":"vb.ly","regex":""},"vgn.am":{"domain":"vgn.am","regex":""},"vl.am":{"domain":"vl.am","regex":""},"vm.lc":{"domain":"vm.lc","regex":""},"w55.de":{"domain":"w55.de","regex":""},"wapo.st":{"domain":"wapo.st","regex":""},"wapurl.co.uk":{"domain":"wapurl.co.uk","regex":""},"wipi.es":{"domain":"wipi.es","regex":""},"wp.me":{"domain":"wp.me","regex":""},"x.vu":{"domain":"x.vu","regex":""},"xr.com":{"domain":"xr.com","regex":""},"xrl.in":{"domain":"xrl.in","regex":""},"xrl.us":{"domain":"xrl.us","regex":""},"xurl.es":{"domain":"xurl.es","regex":""},"xurl.jp":{"domain":"xurl.jp","regex":""},"y.ahoo.it":{"domain":"y.ahoo.it","regex":""},"yatuc.com":{"domain":"yatuc.com","regex":""},"ye.pe":{"domain":"ye.pe","regex":""},"yep.it":{"domain":"yep.it","regex":""},"yfrog.com":{"domain":"yfrog.com","regex":""},"yhoo.it":{"domain":"yhoo.it","regex":""},"yiyd.com":{"domain":"yiyd.com","regex":""},"youtu.be":{"domain":"youtu.be","regex":""},"yuarel.com":{"domain":"yuarel.com","regex":""},"z0p.de":{"domain":"z0p.de","regex":""},"zi.ma":{"domain":"zi.ma","regex":""},"zi.mu":{"domain":"zi.mu","regex":""},"zipmyurl.com":{"domain":"zipmyurl.com","regex":""},"zud.me":{"domain":"zud.me","regex":""},"zurl.ws":{"domain":"zurl.ws","regex":""},"zz.gd":{"domain":"zz.gd","regex":""},"zzang.kr":{"domain":"zzang.kr","regex":""},"\u203a.ws":{"domain":"\u203a.ws","regex":""},"\u2729.ws":{"domain":"\u2729.ws","regex":""},"\u273f.ws":{"domain":"\u273f.ws","regex":""},"\u2765.ws":{"domain":"\u2765.ws","regex":""},"\u2794.ws":{"domain":"\u2794.ws","regex":""},"\u279e.ws":{"domain":"\u279e.ws","regex":""},"\u27a1.ws":{"domain":"\u27a1.ws","regex":""},"\u27a8.ws":{"domain":"\u27a8.ws","regex":""},"\u27af.ws":{"domain":"\u27af.ws","regex":""},"\u27b9.ws":{"domain":"\u27b9.ws","regex":""},"\u27bd.ws":{"domain":"\u27bd.ws","regex":""}},
	handle_navigate: function (event) {
		if (!Settings.getItem('confirmShortURL')) return 1;
		else if (!event.url || event.url.toLowerCase().indexOf('http') !== 0) return 1;

		var url = event.url, host = this.utils.active_host(url), re = 1, self = this, do_test = function (url, title, redirect) {
			re = url !== redirect ? confirm(_('The short URL—{1}—is redirecting you to: {2} {3} Do you want to continue?', [url, title ? title.replace(/\n/g, ' ') : '', redirect])) : 1;

			if (re && event.type === 'beforeNavigate')
				self.caches.redirects[url].allowSecond = 1;

			if (!re) event.preventDefault();
		};

		if (host in this._redirectors) {
			if (event.url in this.caches.redirects) {
				if (this.caches.redirects[event.url].allowSecond)
					this.caches.redirects[event.url].allowSecond = 0;
				else
					do_test(event.url, this.caches.redirects[event.url].title, this.caches.redirects[event.url]['long-url']);
			} else if (
					!this._redirectors[host].regex.length ||
					(this._redirectors[host].regex && (new RegExp(this._redirectors[host].regex, 'i')).test(event.url))
				) {
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
		var self = this;

		if (event && ('type' in event) && event.type == 'popover') {
			/**
			 * Fixes issues with mouse hover events not working
			 */
			if (!this.reloaded) {
				this.rules.use_snapshot(0);

				if (this.popover) {
					this.reloaded = true;
					this.load_language(false);
					
					Popover.window().location.reload();
				}
				
				return false;
			}

			$$('#find-bar-done:visible').click();

			new Poppy();
		} else if (!event || (event && ('type' in event) && ~['beforeNavigate', 'close'].indexOf(event.type))) {
			new Poppy();
			new Poppy(true)

			if (event.target.url === event.url || event.type === 'close')
				delete this.frames[event.target.url];

			if (event.type === 'close')
				delete this.caches.jsblocker[event.target.url];

			if (event.type === 'beforeNavigate') this.handle_navigate(event);
			
			setTimeout(function (self, event) {
				delete self.anonymous.newTab[event.target.url];
			}, 100, this, event);
			
			try {
				if (event.target === this.tab && event.type === 'beforeNavigate')
					ToolbarItems.badge(0);
			} catch (e) {}
		}
		
		this.utils.timer.timeout('updater', function (self) {
			self.updater();
		}, 500, [this]);
		
		try {
			if (event.type === 'popover') {
				$$('#page-list')[0].selectedIndex = 0;
				$$('.whoop').scrollTop(0);
				$$('.some-list, .pending').removeClass('some-list pending');

				var url = this.tab.url || '';
				
				if (!this.methodAllowed) {
					Settings.setItem('simpleMode', true);

					setTimeout(function (self) {
						new Poppy($(self.popover.body).width() / 2, 0, [
							'<p>', _('You cannot use JavaScript Blocker'), '</p>'].join(''));
					}, 2000, self);
				} else {
					if (this.installedBundle === this.bundleid && !this.disabled) {
						this.utils.timer.timeout('update_failure', function () {
							ToolbarItems.badge(0);

							setTimeout(function (self, url) {
								var message;

								if (url === 'https://extensions.apple.com/')
									message = ['<p>', _('Safari extensions website'), '</p>'];
								else
									message = ['<p>', _('Update Failure'), '</p>'];

								new Poppy($(self.popover.body).width() / 2, 0, message.join(''));

								if (url in self.caches.jsblocker)
										self.do_update_popover({ message: self.caches.jsblocker[url], target: { url: url } });
								else
									self.clear_ui();
							}, 300, self, url);
						}, 1000);
					
						Tabs.messageActive('updatePopover');
					}
				}
			}
		} catch(e) { }
	},
	set_active_tab: function (callback) {
		var self = this;

		Tabs.active(function (tab) {
			if (self.tab !== tab[0]) {
				self.tab = tab.length ? tab[0] : {};

				if (typeof callback === 'function') callback.call(self);
			}
		});
	},
	validate: function (event) {
		if (event && event.command && event.command !== 'jsBlockerMenu') return;

		var self = this;

		this.set_active_tab(function () {
			Tabs.messageActive('updatePopoverNow');
		});

		this.utils.once('load', function () {
			if (!Settings.getItem('persistDisabled') && this.disabled) this.disabled = false;

			this.rules.use_tracker.load();
			this.rules.warm_caches();
			this.rules.snapshots = new Snapshots(this.rules.which, Settings.getItem('enableSnapshots') ? Settings.getItem('snapshotsLimit') : 0);

			if (!this.setupDone) {
				this.collapsed('allowed-script-urls-image', 1);

				this.setupDone = 1;				
				this.installedBundle = self.bundleid;

				this.utils.open_url(ExtensionURL('settings.html#for-about'));

				if (this.trialStart === 0)
					this.trialStart = +new Date();

				if (Settings.getItem('enableSnapshots'))
					this.rules.snapshots.add(this.rules.rules);
			}
			
			if (this.rules.using_snapshot) this.rules.use_snapshot(this.rules.using_snapshot);

			this.rules.clear_temporary(1);

			this.utils.timer.interval('cleanup', this._cleanup.bind(this), 1000 * 60 * 5);

			if (!Settings.getItem('installID'))
					Settings.setItem('installID', this.utils.id() + '~' + this.displayv);

			var pop = Popover.window();

			if (pop) {
				this.popover = pop.document;
				this.set_theme(this.theme);
				this.utils.floater('#rules-list', '.rules-header:visible');

				if (SAFARI) {
					Popover.object().width = this.simpleMode ? 460 : 560;
					Popover.object().height = this.simpleMode ? 350 : 400;
				}

				$(this.popover.body)
					.toggleClass('simple', this.simpleMode)
					.toggleClass('simplified', this.rules.simplified)
					.toggleClass('highlight-matched', Settings.getItem('highlight'))
					.toggleClass('disabled', this.disabled);

				if (Settings.getItem('showUnblocked'))
					$$('#unblocked-script-urls').show().prev().show();
				else
					$$('#unblocked-script-urls').hide().prev().hide();
					
				var verc = Settings.getItem('donationVerified'),
						ver = (verc === 1 || verc === 777 || verc === true || (typeof verc === 'string' && verc.length));

				$$('#unlock').toggleClass('hidden', ver && verc !== 777).text(verc === 777 ? _('Contribute') : _('Unlock')).toggleClass('contribute', verc === 777);
				$$('#disable').toggleClass('divider', !ver || verc === 777).html(_((self.disabled ? 'Enable' : 'Disable') + ' JavaScript Blocker'));
				$$('#console-access').css('display', this.isBeta ? 'block' : 'none');

				$$('#main .actions-bar li:not(#jsblocker-name)').toggleClass('selectable', Settings.getItem('traverseMainActions'));
				$$('#rules-list .filter-bar:not(.actions-bar) li:not(.label,.li-text-filter)').toggleClass('selectable', Settings.getItem('traverseRulesFilter'));
				$$('#previous-frame, #next-frame').toggleClass('selectable', Settings.getItem('traverseMainItems'));

				if (!Settings.getItem('filterBarVisibility')) $$('#filter-type-collapse').addClass('hidden').next().remove();
				if (!Settings.getItem('filterBarState')) $$('#filter-type-state').addClass('hidden').next().remove();
				if (!Settings.getItem('filterBarAge')) $$('#filter-type-not-used').addClass('hidden').next().remove();
				if (!Settings.getItem('filterBarUsed')) $$('#filter-type-used').addClass('hidden').next().remove();
				if (!Settings.getItem('filterBarDomain')) $$('#filter-type-domain').addClass('hidden').next().remove();

				var bar = $$('#rules-filter-bar').find('.divider:last').remove().end();

				if (bar.find('ul.hidden').length === 5) bar.hide();
			} else
				this.utils.once_again('load');
		}, this);

		this.speedMultiplier = this.useAnimations ? 1 : 0.001;

		if (this.installedBundle < this.update_attention_required) this.utils.attention(1);
		if (this.disabled) ToolbarItems.image('images/toolbar-disabled.png');

		if (event && event.target) {
			Tabs.active(function (tab) {
				if (!self.disabled) {
					event.target.disabled = (!tab.length || !tab[0].page);
					
					if (event.target.disabled) {
						ToolbarItems.badge(0);
						Popover.hide();
					}
				}
				if (!self.methodAllowed)
					ToolbarItems.badge(999);
			});
		}
	},
	command: function (event) {
		if (event.command === 'loadElementsOnce')
			Tabs.messageActive('loadElementsOnce');
	},
	contextmenu: function (event) {		
		if (event.userInfo > 0)
			event.contextMenu.appendContextMenuItem('loadElementsOnce', _('Load {1} Blocked Element' + (event.userInfo === 1 ? '' : 's'), [event.userInfo]));
	}
};

JB.rules.__proto__ = JB;
JB.rules.use_tracker.__proto__ = JB;
JB.utils.__proto__ = JB;

for (var kind in JB.rules.data_types) {
	JB.rules.blacklist[kind] = {};
	JB.rules.whitelist[kind] = {};
}

$.ajax({
	url: 'Info.plist',
	async: false
}).success(function (xml) {
	var $xml = $(xml);

	JB.bundleid = parseInt($xml.find('key:contains("CFBundleVersion")').next().text(), 10),
	JB.displayv = $xml.find('key:contains("CFBundleShortVersionString")').next().text();
});

JB.rules.easylist();

window.receiveMessage = function (target, message, data) {
	JB.handle_message({
		type: message,
		message: message,
		target: target
	});
};

document.addEventListener('DOMContentLoaded', function () {
	JB.load_language();
	JB.validate();
});

window.addEventListener('message', function (event) {
	if (event.data === 'zero-timeout') {
		event.stopPropagation();

		if (JB.utils._zero_timeouts.length) {
			var o = JB.utils._zero_timeouts.shift();

			if (typeof o[0] === 'function')
				o[0].apply(JB, o[1]);
		}
	}
});

window.onerror = function (d, p, l, c) {
	_d(d + ', ' + p + ', ' + l);
};

Events.addApplicationListener('contextmenu', JB.contextmenu, JB);
Events.addApplicationListener('command', JB.command, JB);
Events.addApplicationListener('close', JB.open_popover, JB);
Events.addApplicationListener('beforeNavigate', JB.open_popover, JB);
Events.addApplicationListener('beforeNavigate', JB.anonymize, JB);
Events.addApplicationListener('popover', JB.open_popover, JB);
Events.addApplicationListener('validate', JB.validate, JB);
Events.addApplicationListener('message', JB.handle_message, JB);
Events.addSettingsListener(JB.setting_changed, JB);
