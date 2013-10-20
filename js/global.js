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

var RULE_TOP_HOST = 1,
		RULE_FULL_HOST = 2,
		RULE_PATH = 4,
		RULE_QUERY = 8,
		RULE_HTTP = 16,
		RULE_HTTPS = 32,
		Template = {
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

				str = undefined;
	
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
	tab: {},
	updating: !1,
	finding: !1,
	reload: 1,
	caches: {
		redirects: {},
		domain_parts: {},
		active_host: {},
		collapsed_domains: null,
		jsblocker: {},
		messages: { 'false': {}, 'true': {} },
		rule_regexp: {},
		rule_actions: {}
	},
	commandKey: !1,
	optionKey: false,
	frames: {},
	displayv: null,
	bundleid: null,
	update_attention_required: 161,
	beta_attention_required: 1,
	baseURL: 'http://lion.toggleable.com:160/jsblocker/',
	longURL: 'http://api.longurl.org/v2/expand?user-agent=ToggleableJavaScriptBlocker&title=1&format=json&url=',
	
	set_theme: function () {
		$('#main-large-style', this.popover.head).attr('href', Settings.getItem('largeFont') ? 'css/main.large.css' : '');
	},

	donate: function () {
		var self = this, status = Settings.getItem('donationVerified');

		if (!status || status === 777)
			new Poppy($(this.popover.body).width() / 2, 2, [
				'<p>', _('Updated JavaScript Blocker {1}', ['<a class="outside" href="http://javascript-blocker.toggleable.com/change-log/' + this.displayv.replace(/\./g, '') + '">' + this.displayv + '</a>']), '</p>',
				'<p><div class="divider"></div></p>',
				'<p id="jsb-changes">Loading change log....</p>',
				'<p><div class="divider"></div></p>',
				'<p>', _('Thank you for your continued use'), '</p>',
				'<p>', _('Please, if you can'), '</p>',
				'<input type="button" value="', _('Make a Donation'), '" id="make-donation" /> ',
				'<input type="button" value="', _('Maybe Later'), '" id="no-donation" /> ',
				'<input type="button" value="', _('I\'ve Donated!'), '" id="already-donation" /> '
				].join(''), function () {
					var changes = $$('#jsb-changes');

					changes.load('http://javascript-blocker.toggleable.com/change-log/' + self.displayv.replace(/\./g, '') + ' #sites-canvas-main-content', function (responseText, textStatus, req) {
						if (textStatus !== 'success') changes.html('Unable to load change log: ' + req.status);
					});

					$$('#make-donation').click(function () {
						self.installedBundle = self.bundleid;

						self.utils.open_url('http://javascript-blocker.toggleable.com/donate');
					});
					$$('#no-donation').click(function () {
						self.installedBundle = self.bundleid;
						new Poppy();
						Tabs.messageActive('updatePopover');
					});
					$$('#already-donation').click(function () {
						$$('#unlock').click();
					});
				}, null, null, true);
		else {
			new Poppy($(this.popover.body).width() / 2, 2, [
				'<p>',
					_('Updated JavaScript Blocker {1}', ['<a class="outside" href="http://javascript-blocker.toggleable.com/change-log/' + this.displayv.replace(/\./g, '') + '">' + this.displayv + '</a>']),
				'</p>',
				'<p><div class="divider"></div></p>',
				'<p id="jsb-changes">Loading change log...</p>'
			].join(''), function () {
				var changes = $$('#jsb-changes');

				changes.load('http://javascript-blocker.toggleable.com/change-log/' + self.displayv.replace(/\./g, '') + ' #sites-canvas-main-content', function (responseText, textStatus, req) {

					if (textStatus !== 'success') changes.html('Unable to load change log: ' + req.status);
				});

				self.installedBundle = self.bundleid;
			});
		}
	},
	load_language: function (css) {
		function set_popover_css (self, load_language, css) {
			if (self.popover && $$('#lang-css-' + load_language).length === 0) {
				$('<link />').appendTo(self.popover.head).attr({
						href: 'i18n/' + load_language + '.css',
						type: 'text/css',
						rel: 'stylesheet',
						id: 'lang-css-' + load_language,
				}).addClass('language-css');
			}
		}
		
		var load_language = (Settings.getItem('language') !== 'Automatic') ?
				Settings.getItem('language') : window.navigator.language.toLowerCase();
	
		if (css)
			set_popover_css(this, load_language, css);
		else if (load_language !== 'en-us' && !(load_language in Strings))
			$.getScript('i18n/' + load_language + '.js', function (data, status) { });

		css = undefined;
	},
	special_enabled: function (special) {
		if (!this.donationVerified) return false;

		if (special.indexOf('customp') === 0) return 1;

		var s = Settings.getItem('enable_special_' + special);

		return s === '0' ? 0 : s;
	},
	enabled: function (kind) {
		if (!this.donationVerified && kind !== 'script') return false;

		return Settings.getItem('enable' + kind) || ~kind.indexOf('hide_');
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

		new_frames = new_jsblocker = undefined;
		
		for (key in this.rules.data_types) {
			use_tracker_cache[key] = [];

			for (domain in this.rules.rules[key])
				this.utils.zero_timeout(function (domain, kind, ruleSet, utc, self) {
					for (var rule in ruleSet[domain])
						utc[kind].push(domain + rule + ruleSet[domain][rule][0]);

					if ($.isEmptyObject(ruleSet[domain])) {
						delete ruleSet[domain];
						delete self.rules.cache[kind][domain];
						delete self.rules.cache_nowlbl[kind][domain];
					}
				}, [domain, key, this.rules.rules[key], use_tracker_cache, this]);

			for (var host in this.caches.rule_actions[key]) {
				for (var action_item in this.caches.rule_actions[key][host]) {
					if (this.caches.rule_actions[key][host][action_item].access < (Date.now() - 1000 * 60 * 20))
						delete this.caches.rule_actions[key][host][action_item];
				}

				if ($.isEmptyObject(this.caches.rule_actions[key][host]))
					delete this.caches.rule_actions[key][host];
			}
		}
		
		this.utils.zero_timeout(function (rules, utc, uc) {
			rules.save(1);

			for (var kind in uc._tracked) {
				for (var used in uc._tracked[kind])
					if (!~utc[kind].indexOf(used))
						delete uc._tracked[kind][used];

				if ($.isEmptyObject(uc._tracked[kind])) delete uc._tracked[kind];
			}

			uc.save();
		}, [this.rules, use_tracker_cache, this.rules.use_tracker]);

		if (!this.rules.using_snapshot) {
			var cd = this.collapsedDomains();
			
			if (cd instanceof Array) {
				var d;

				for (var i = 0; d = cd[i]; i++)
					for (var kind in self.rules.data_types)
						if ((d === _('All Domains') || (d in self.rules.rules[kind])) && !~new_collapsed.indexOf(d))
							new_collapsed.push(d);
			}
			
			this.collapsedDomains(new_collapsed);
		}

		use_tracker_cache = new_collapsed = undefined;
	},
	get isBeta() {
		Settings.getItem('isBeta');
	},
	set isBeta(v) {
		Settings.setItem('isBeta', v);
	},
	get speedMultiplier() {
		return this._speedMultiplier || 1;
	},
	set speedMultiplier(v) {
		this._speedMultiplier = v;

		$(this.popover.body).toggleClass('slow-animations', v > 1).toggleClass('no-animations', v < 1);
	},
	get temporaryExpertMode() {
		return this._temporaryExpertMode;
	},
	set temporaryExpertMode(v) {
		var prev = this._temporaryExpertMode;

		this._temporaryExpertMode = v;

		$(this.popover.body).toggleClass('simple', this.simpleMode && !v);

		this.utils.timer.timeout('set_tempexpert' + v.toString(), function (self, prev, v) {
			Popover.object().width = self.simpleMode && !v ? 460 : 560;
			Popover.object().height = self.simpleMode && !v ? Settings.getItem('popoverSimpleHeight') : Settings.getItem('popoverHeight');

			if (prev !== v)
				self.utils.timer.timeout('readjust_columns', function (self) {
					self.adjust_columns();
				}, 500, [self]);
		}, 120, [this, prev, v]);

		v = undefined;
	},
	get disabled() {
		return Settings.getItem('isDisabled');
	},
	set disabled(v) {
		Settings.setItem('isDisabled', v);
	},
	useSimpleMode: function () {
		return this.simpleMode && !this.temporaryExpertMode;
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
		return (Date.now() - JB.trialStart < 1000 * 60 * 60 * 24 * 10);
	},
	trial_remaining: function () {
		var seconds = ((JB.trialStart + 1000 * 60 * 60 * 24 * 10) - Date.now()) / 1000,
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
		if (v !== undefined) Settings.setItem(k + 'Switch', v ? 1 : 0);
		else return Settings.getItem(k + 'Switch') == '1';
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
		throttle: function (fn, delay, extra) {
			var timeout = null, last = 0

			return function () {
				var elapsed = Date.now() - last, args = $.merge($.makeArray(arguments), extra);

				var execute = function () {
					last = Date.now();
					fn.apply(this, args);
				}

				clearTimeout(timeout);

				if (elapsed > delay)
					execute.call(this)
				else
					timeout = setTimeout(execute.bind(this), delay - elapsed);
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

			return (Math.round(num * 100) / 100) + ' ' + power + (divisor === 1024 && power.length ? 'i' : '') + (power.length ? 'B' : ('byte' + (num === 1 ? '' : 's')));
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
			var m, i, o = {};

			for (i = 0; i < a.length; i++)
				o[a[i][0]] = a[i][1] instanceof Array && a[i][2] || !(a[i][1] instanceof Array) ? a[i][1] : this.make_object(a[i][1]);

			return o;
		},
		floater: function (scroller, to_float, related, off) {
			var sc = $$(scroller), self = this,
					fb = sc.data('floater_bound') || [];

			if (~fb.indexOf(to_float)) return false;
			
			fb.push(to_float);

			sc.data('floater_bound', fb)
				.scroll(self.utils.throttle(function (event, data) {
					var d = data, off = typeof d.off === 'function' ? d.off.call(JB) : d.off || 0,
							all = $(d.to_float, d.scroller).not('.floater'),
							find_offset = ($$('#find-bar:visible').outerHeight(true) || 0),
							current_header = all.filter(function () {
								return $(this).offset().top <= off + find_offset;
							}).filter(':last'),
							next_header = all.eq(all.index(current_header) + 1);

					$(d.to_float, d.scroller).remove('.floater');
					
					if (!current_header.length) return;

					var id = 'clone-' + (current_header.attr('id') || Date.now()),
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
						top: top + find_offset,
						zIndex: 999 - off,
						width: current_header.width()
					}).append('<div class="divider floater-divider"></div>');
			}, 50, [{ scroller: sc, to_float: to_float, related: related, off: off }]));
			
			scroller = to_float = related = off = undefined;
		},
		fill: function (string, args) {
			for (var i = 0; i < args.length; i++)
				string = string.replace(new RegExp('\\{' + i + '\\}', 'g'), args[i]);

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
			return text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
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
				j.data('confirm_timeout', setTimeout(function (j) {
					j.removeClass('confirm-click');
				}, 3000, j));

				j.addClass('confirm-click');

				j = undefined;

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
			new Poppy(null, null, null, (function (e, onshow, onstart, onhide) {
				var t = 0.43 * this.speedMultiplier, self = this,
						hide = e.is('.zoom-window-open') ? $$('.zoom-window-hidden:last') : $$('.whoop').filter(':visible'),
						start_value, end_value, start_hide_zoom, end_hide_zoom, c;

				if (e.data('isAnimating') || hide.data('isAnimating')) return false;

				e.data('isAnimating', true).addClass('zoom-window-animating').removeClass('zoom-window-hidden');

				(onstart || $.noop).call(JB);
				
				hide = hide || $('<div />');
				
				hide.addClass('zoom-window-animating zoom-window-hidden');

				hide.find('*:focus').blur();
				e.find('*:focus').blur();
				
				start_value = !e.hasClass('zoom-window') ? 0.85 : 1;
				end_value = start_value === 1 ? 0.85 : 1;
						
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
					WebkitTransitionTimingFunction: 'ease-' + (start_value & 1) ? 'out' : 'in'
				};
				
				e.css(c);
				hide.css(c);
						
				e.css({
					WebkitTransform: 'scale(' + (start_value) + ')',
					opacity: start_value & 1
				});
						
				hide.css({
					WebkitTransform: 'scale(' + start_hide_zoom + ')',
					opacity: end_value & 1,
					WebkitTransitionDuration: t + 's, ' + (t * 0.8) + 's, ' + t + 's'
				});
						
				if (start_value === 1) hide.scrollTop(hide.data('scrollTop'));	
				
				self.zero_timeout(function (hide, e, end_value, start_value, end_hide_zoom, onshow, t, onhide) {
					hide.css({
						WebkitTransform: 'scale(' + end_hide_zoom + ')',
						opacity: start_value & 1
					});
									
					e.css({
						WebkitTransform: 'scale(' + (end_value) + ')',
						opacity: (end_value & 1)
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

						$$('#find-bar-search:visible').trigger('search');

						d.e.data('isAnimating', false).removeClass('zoom-window-animating').css('webkitTransform', '');
						d.h.removeClass('zoom-window-animating').css('webkitTransform', '');
					});
				}, [hide, e, end_value, start_value, end_hide_zoom, onshow, t, onhide]);

				hide = e = end_value = start_value = end_hide_zoom = onshow = t = onhide = undefined;
			}).bind(this, e, onshow, onstart, onhide));

			e = onshow = onstart = onhide = undefined;
		},
		timer: {
			timers: { intervals: {}, timeouts: {} },
			interval: function () {
				return this.create.apply(this, ['interval'].concat($.makeArray(arguments)));
			},
			timeout: function () {
				return this.create.apply(this, ['timeout'].concat($.makeArray(arguments)));
			},
			_run_interval: function (interval) {
				if (!this.timers.intervals[interval]) return this.remove('run_interval_' + interval);

				this.timers.intervals[interval].script.apply(JB, this.timers.intervals[interval].args);

				this.timeout('run_interval_' + interval, this._run_interval.bind(this, interval), this.timers.intervals[interval].time);
			},
			create: function (type, name, script, time, args) {
				if (type != 'interval' && type != 'timeout') return false;
				
				if (typeof args !== 'object') args = [];

				this.remove(type, name);

				var timer_func = window.setTimeout.apply(null, [script, time].concat(args));

				if (type == 'timeout' && !name.match(/_auto_delete$/))
					this.create('timeout', name + '_auto_delete', function (self, type, name) {
						self.remove(type, name);
					}, time + 100, [this, type, name]);

				this.timers[type + 's'][name] = { name: name, timer: timer_func, args: args, time: time, script: script };

				if (type === 'interval') this._run_interval(name);

				type = name = script = time = args = undefined;
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
						}

						delete this.timers[type][name];
						delete this.timers[type][name + '_auto_delete'];
					} catch(e) { }
				}

				return true;
			}
		},
		id: function () {
			return (Date.now() + Math.random()).toString(36).replace(/\./, '');
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
				this.timer.timeout('toolbar_attention', function (self) {
					self._has_attention = false;
										
					ToolbarItems.image(self.disabled ? 'images/toolbar-disabled.png' : 'images/toolbar.png');
				}, 1100, [this]);

				self = mode = undefined;
				
				return false;
			}
			
			this._has_attention = 1;
			
			this.timer.interval('toolbar_attention', function () {
				self._attention = !self._attention;
								
				ToolbarItems
					.state(false)
					.image(self._attention ? 'images/toolbar-attn.png' : (self.disabled ? 'images/toolbar-disabled.png' : 'images/toolbar.png'))
					.badge(self._attention ? 1 : 0, null);
			}, 1000);

			self = mode = undefined;
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

	customScripts: {
		_pre: null,
		_post: null,
		add: function (type, id, name, script, edit) {
			var scripts = this[type]();

			if (edit && !(id in scripts)) return;

			this['_' + type] = null;

			scripts[id] = { name: name, func: script };

			Settings.setItem('custom' + type + 'Scripts', JSON.stringify(scripts));

			Strings['en-us'][id] = _('Injected ' + type + ' Script: {1}', [name]);
		},
		remove: function (type, id) {
			var scripts = this[type]();

			this['_' + type] = null;

			delete scripts[id];

			Settings.setItem('custom' + type + 'Scripts', JSON.stringify(scripts));

			delete Strings['en-us'][id];

			for (var domain in JB.rules.rules.special)
				JB.rules.remove('special', domain, id);
		},
		pre: function () {
			return this._pre || (this._pre = JSON.parse(Settings.getItem('custompreScripts')));
		},
		post: function() {
			return this._post || (this._post = JSON.parse(Settings.getItem('custompostScripts')));
		}
	},
	rules: {
		blacklist: {},
		whitelist: {},
		get simplified() {
			return this.simpleMode && !this.temporaryExpertMode;
		},
		get data_types() {
			return {
				disable: {}, script: {}, frame: {}, embed: {}, video: {}, image: {}, special: {},
				hide_disable: {}, hide_script: {}, hide_frame: {}, hide_embed: {}, hide_video: {}, hide_image: {}, hide_special: {},
				ajax_get: {}, ajax_post: {}, ajax_put: {}, hide_ajax_get: {}, hide_ajax_post: {}, hide_ajax_put: {}
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
			var c = Settings.getItem(this.which);
			return c ? $.extend(this.data_types, JSON.parse(c)) : this.data_types;
		},
		get which () {
			return this.simpleMode ? 'SimpleRules' : 'Rules';
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
				this._tracked[cat][key].lastUsed = Date.now();

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
			this.cache_nowlbl = this.data_types;

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

			this.cache = this.data_types;
			this.cache_nowlbl = this.data_types;
			this.caches.rule_actions = this.data_types;
		},
		show_snapshots: function () {
			this.busy = 1;

			var snapshots = this.snapshots.all(1), co = { '1': 0, '0': 0 },
					ul = $$('#current-snapshots'),
					ul_unkept = $$('#snapshots-list-unkept').empty(),
					ul_kept = $$('#snapshots-list-kept').empty(), self = this, compared;

			$$('#snapshots-info').html(_('You have {1} snapshots using {2} of storage.', [this.snapshots.count(), this.utils.bsize(this.snapshots.size())]));

			for (var id in snapshots) {
				$([
					'<li id="snapshot-', id, '" class="', id === this.using_snapshot ? 'using' : '', snapshots[id].keep ? ' kept ' : ' ', co[snapshots[id].keep ? '1' : '0']++ % 2 ? 'odd' : 'even', '">',
						'<a class="', Settings.getItem('traverseSnapshots') ? 'selectable' : '', ' snapshot-date" data-id="', id, '">', snapshots[id].name ? self.utils.escape_html(snapshots[id].name) : this.snapshots.date(id), '</a> ',
						'<input type="button" value="', self.using_snapshot === id ? _('Close Snapshot') : _('Open Preview'), '" class="preview-snapshot purple" /> ',
						'<div class="divider ', co[snapshots[id].keep ? '1' : '0'] % 2 ? 'even' : 'odd', '"></div>',
					'</li>'].join('')).appendTo(snapshots[id].keep ? ul_kept : ul_unkept);

				this.utils.zero_timeout(function (rules, id) {
					var compare = rules.snapshots.compare(id, rules.current_rules);
					$$('#snapshot-' + id).find('a').toggleClass('equal', compare.equal);
				}, [this, id]);
			}

			this.utils.zero_timeout(function (me) {
				me.busy = 0;
			}, [this]);

			ul_kept.find('.divider:last.even').addClass('invisible');
			ul_unkept.find('.divider:last.even').addClass('invisible');

			snapshots = ul = ul_unkept = ul_kept = self = compared = undefined;
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
					simbefore = this.simpleMode;

			this.reload();

			Settings.setItem('simpleMode', true);

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

			JB.reload = true;

			return has_unconvert ? JSON.stringify(un, null, 2) : true;
		},
		convertSimpleToExpert: function () {
			if (!this.donationVerified) return false;

			var self = this, from = JSON.parse(Settings.getItem('SimpleRules')), kind, domain, rule;

			Settings.setItem('simpleMode', false);

			this.reload();

			this.snapshots = new Snapshots('Rules', Settings.getItem('enableSnapshots') && this.donationVerified ? Settings.getItem('snapshotsLimit') : 0);

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

			JB.reload = true;

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
						}, [snapshots, filtered_rules, self]);
					}

					if (!self.using_snapshot)
						Settings.setItem(which, JSON.stringify(rules));

					rules = snapshots = which = self = no_snapshot = filtered_rules = kind = undefined;
				} catch (e) { }
			}, 1000, [this.rules, this.snapshots, this.which, this, no_snapshot]);

			no_snapshot = undefined;
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
					else this.recache(kind, domain);
				}

			this.save(1);
		},
		recache: function (kind, d) {			
			if (d === '.*') {
				this.caches.rule_actions = this.data_types;
				this.cache[kind] = {};
				this.cache_nowlbl[kind] = {};
			} else if (d.charAt(0) === '.') {
				var nodot = d.substr(1),
						full_regexp = new RegExp(this.utils.escape_regexp(d) + '$', 'i'),
						nodot_regexp = new RegExp(this.utils.escape_regexp(nodot) + '$', 'i');

				delete this.caches.rule_actions[kind][nodot];

				for (var ra in this.caches.rule_actions[kind])
					if (nodot_regexp.test(ra))
						delete this.caches.rule_actions[kind][ra];

				for (var c in this.cache[kind])
					if (full_regexp.test(c))
						delete this.cache[kind][c];

				for (var c in this.cache_nowlbl[kind])
					if (full_regexp.test(c))
						delete this.cache_nowlbl[kind][c];
			} else {
				delete this.caches.rule_actions[kind][d];
				delete this.cache[kind][d];
				delete this.cache_nowlbl[kind][d];
			}
		},
		_firstTwo: function (str) { return str[0] + str[1]; },
		_process_list: function (list) {
			var def = {}, split = list.split(/\n/),
					type_map = { script: 'script', image: 'image', object: 'embed' }, whole;

			JB.rules.rules.script['rawr'] = {};

			mainFor:
			for (var i = 0, b = split.length; i < b; i++) {
				var whole = split[i], fTwo = this._firstTwo(whole);

				if (fTwo === '##' || ~whole.indexOf('#@#')) continue;

				var mode = fTwo === '@@' ? 5 : 4,
						whole = mode === 5 ? whole.substr(2) : whole,
						dollar = whole.indexOf('$'),
						rule = whole.substr(0, ~dollar ? dollar : 999), regexp, $check = whole.split(/\$/),
						use_type = false, domains = ['.*'];

				if ($check[1]) {
					var args = $check[1].split(',');

					if (~args.indexOf('xmlhttprequest')) continue;

					for (var z = 0; z < args.length; z++) {
						if (args[z].match(/^domain=/)) domains = args[z].substr(7).split('|').map(function (v) { return '.' + v; });
						else if (args[z] in type_map) use_type = type_map[args[z]];
					}
				}

				if (whole[0] === '!' || whole[0] === '[' || ~whole.indexOf('##')) continue;

				rule = rule.replace(/\//g, '\\/')
					.replace(/\+/g, '\\+')
					.replace(/\?/g, '\\?')
					.replace(/\^/g, '([^a-zA-Z0-9_\.%-]+|$)')
					.replace(/\./g, '\\.')
					.replace(/\*/g, '.*');

				if (this._firstTwo(whole) === '||') rule = rule.replace('||', 'https?:\\/\\/([^\\/]+\\.)?');
				else if (whole[0] === '|') rule = rule.replace('|', '');
				else rule = '.*' + rule;

				if (rule.match(/\|[^$]/)) continue;

				rule = '^' + rule

				if (rule[rule.length - 1] === '|') rule = rule.substr(0, rule.length - 1) + '.*$';
				else rule += '.*$';

				rule = rule.replace(/\.\*\.\*/g, '.*');

				for (var s = 0; s < domains.length; s++) {
					if (this._firstTwo(domains[s]) === '.~') continue mainFor;

					var list = JB.rules[mode === 5 ? 'whitelist' : 'blacklist'];

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

			def = split = type_map = whole = fTwo =  mode = dollar = rule = regexp = $check = use_type = domains = args = z = list = i = b = undefined;
		}, 
		easylist: function (cb) {
			var fromSettings = function (which) {
				var el = Settings.getItem(which);

				if (el) JB.rules._process_list(el);

				JB.rules.cache = JB.rules.data_types;
				JB.rules.cache_nowlbl = JB.rules.data_types;
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

					if (!JB.setupDone) {
						Settings.setItem('alwaysBlockscript', 'nowhere');
						Settings.setItem('alwaysBlockframe', 'nowhere');
					}

					if (cb) cb();
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
			if (!this.donationVerified || !this.special_enabled(special)) return -1;
			
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

			special = url = host = domains = domain = rule = spec = undefined;
					
			return -2;
		},
		via_action_cache: function (kind, host, item) {
			if (PrivateBrowsing()) return null;

			if (host in this.caches.rule_actions[kind])
				return this.caches.rule_actions[kind][host][item];
			return null;
		},
		add_to_action_cache: function (kind, host, item, action) {
			if (PrivateBrowsing()) return;

			if (!(host in this.caches.rule_actions[kind])) this.caches.rule_actions[kind][host] = {};

			this.caches.rule_actions[kind][host][item] = {
				action: action,
				access: Date.now()
			};
		},
		disabled: function (url) {
			if (!url) return false;

			var host = this.active_host(url),
					action_cached = this.via_action_cache('disable', host, '*');

			if (action_cached) {
				action_cached.access = Date.now();

				return action_cached.action[0];
			}

			var domains = this.for_domain('disable', this.active_host(url), false, true);

			for (var domain in domains)
				for (var rule in domains[domain])
					if (domains[domain][rule][0] === 2 || domains[domain][rule][0] === 3) {
						this.add_to_action_cache('disable', host, '*', [!(domains[domain][rule][0] % 2), domains[domain][rule][0]]);

						return !(domains[domain][rule][0] % 2);
					}

			this.add_to_action_cache('disable', host, '*', [0, 2]);

			return false;
		},
		allowed: function (message) {
			var kind = message[0];

			if (kind.indexOf('hide_') === -1)
				if ((kind !== 'script' && !this.donationVerified) || !this.enabled(kind)) return [1, -84];

			var rule_found = false, the_rule = -1, do_break = 0, urule,
					host = this.active_host(message[1]),
					proto = this.utils.active_protocol(message[2]), protos,
					domains = this.for_domain(kind, host), action_cached = this.via_action_cache(kind, host, message[2]);

			if (action_cached) {
				action_cached.access = Date.now();

				return action_cached.action;
			}

			var domain, rule,
					alwaysFrom = Settings.getItem('alwaysBlock' + (~kind.indexOf('ajax') ? 'ajax' : kind)) || Settings.getItem('alwaysBlockscript'),
					hider = ~kind.indexOf('hide_'), ignoreBL = alwaysFrom === 'trueNowhere' || Settings.getItem('ignoreBlacklist'), ignoreWL = Settings.getItem('ignoreWhitelist'),
					sim = this.simplified || JB.temporaryExpertMode,
					catch_wl = null;

			domainFor:
			for (domain in domains) {
				ruleFor:
				for (rule in domains[domain]) {
					if ((ignoreBL && domains[domain][rule][0] === 4) ||
							(ignoreWL && domains[domain][rule][0] === 5)) continue;

					do_break = this.match(kind, rule, message[2], sim);

					if (do_break) {
						rule_found = domains[domain][rule][0] % 2;
						the_rule = domains[domain][rule][0];
						
						this.use_tracker.use(kind, domain, rule, the_rule);

						if (the_rule === 5) catch_wl = [rule_found, the_rule];
						if (the_rule !== 4 && the_rule !== 5) break domainFor;
					}
				}
			}

			if (rule_found !== false) {
				if (catch_wl && the_rule === 4) {
					rule_found = catch_wl[0];
					the_rule = catch_wl[1];
				}

				this.add_to_action_cache(kind, host, message[2], [rule_found, the_rule]);

				return [rule_found, the_rule];
			}

			if (alwaysFrom === 'trueNowhere') {
				this.add_to_action_cache(kind, host, message[2], [1, -1]);

				return [1, -1];
			}
							
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
						this.add_to_action_cache(kind, host, message[2], [0, -1]);
					
						return [0, -1];
					}
				}
			}

			this.add_to_action_cache(kind, host, message[2], [1, -1]);
	
			return [1, -1];
		},
		for_domain: function (kind, domain, one, hide_wlbl) {
			if (!(kind in this.rules) || (kind !== 'script' && !this.donationVerified)) return {};

			var cached = (hide_wlbl) ? this.cache_nowlbl : this.cache,
					append_lists = kind.indexOf('hide_') === -1 && kind !== 'special';

			if (!('.*' in cached[kind]))
				cached[kind]['.*'] = { '.*': $.extend(true, {},
					(append_lists && !hide_wlbl ? JB.rules.blacklist[kind]['.*'] || {} : {}),
					(append_lists && !hide_wlbl ? JB.rules.whitelist[kind]['.*'] || {} : {}),
					this.rules[kind]['.*'] || {}) };
					
			if (domain in cached[kind]) {
				var rules = {};
			
				if (one) {
					if (domain in cached[kind][domain] && typeof cached[kind][domain][domain] === 'object')
						rules[domain] = cached[kind][domain][domain];
					else
						rules[domain] = {};
				} else {
					rules = $.extend(true, {}, cached[kind][domain]);

					rules['.*'] = cached[kind]['.*']['.*'];
				}

				return rules;
			}
						
			var parts = this.utils.domain_parts(domain);
		
			if (parts.length === 1 && domain !== '.*') return this.for_domain(kind, '.*', one, hide_wlbl);
		
			var x = parts.slice(0, 1),
					y = parts.slice(1),
					o = {}, i, c, r;
		
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

			cached[kind][domain] = o;

			return this.for_domain(kind, domain, one, hide_wlbl);
		},
		match: function (kind, rule, url, simplified) {
			if (rule[0] !== '^' && simplified) {
				var rrule = this.with_protos(rule), parts = this.utils.domain_parts(this.utils.active_host(url));

				if (rrule.protos && !~rrule.protos.indexOf(this.utils.active_protocol(url))) return 0;

				return (rrule.rule === '*' ||
						(~kind.indexOf('special') && rrule.rule === url) ||
						(rrule.rule.indexOf('.') === 0 && ~parts.indexOf(rrule.rule.substr(1))) || 
						(parts[0] === rrule.rule))
			}

			var ref;

			return ((ref = this.caches.rule_regexp[rule]) ? ref : this.caches.rule_regexp[rule] = new RegExp(rule, 'i')).test(url);
		},
		with_protos: function (rule) {
			if (this.which === 'Rules' || rule.charAt(0) === '^') {
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

			JB.lockUpdate = false;

			this.collapsed('LastRuleWasTemporary', temporary);
		
			var rules = this.for_domain(kind, domain, true, true);

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
		remove: function (kind, domain, rule) {
			if ((kind !== 'script' && !this.donationVerified) || this.using_snapshot) return false;

			JB.lockUpdate = false;
			
			var rules = this.for_domain(kind, domain, false, true), key;

			if (!(domain in rules)) return false;
			
			this.recache(kind, domain);

			try {
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

				for (i = 0; matches[domain][i]; i++)
					this.remove(kind, domain, matches[domain][i][0]);
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

					if ((block_allow !== null && !!(rtype % 2) !== block_allow) ||
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
		generate: function (mode, url, smple) {
			var rule = ['^'], host = this.utils.active_host(url), parts = this.utils.domain_parts(host),
					parse = document.createElement('a');

			parse.href = url;

			switch (parse.protocol) {
				case 'data:':
				case 'javascript:':
					rule = simple ? [parse.protocol.toUpperCase(), '*'] : ['^', parse.protocol, '.*$'];
				break;

				default:
					if (mode & RULE_HTTP) rule.push('http');
					else if (mode & RULE_HTTPS) rule.push('https');
					else rule.push('https?');

					rule.push(':\\/\\/');

					if (mode & RULE_TOP_HOST) rule.push('([^\\/]+\\.)?', this.utils.escape_regexp(parts[parts.length - 2]));
					else if (mode & RULE_FULL_HOST) rule.push(this.utils.escape_regexp(parts[0]));

					if (mode & RULE_PATH) rule.push(this.utils.escape_regexp(parse.pathname), '((\\?|#)+.*)?');
					else if (mode & RULE_QUERY) rule.push(this.utils.escape_regexp(parse.pathname), this.utils.escape_regexp(parse.search), this.utils.escape_regexp(parse.hash))
					else rule.push('\\/.*');

					rule.push('$');
				break;
			}

			parse = undefined;

			return rule.join('');
		},
		make_message: function (kind, rule, rtype, temp, no_html) {
			var cache_check = [kind, rule, rtype, temp, no_html].join(), simp = this.simplified.toString();

			if (cache_check in this.caches.messages[simp]) return this.caches.messages[simp][cache_check];

			cache_check = undefined;

			var html = !no_html,
					mapper = function (v) {
				var tr = _(v);

				if (~tr.indexOf(':NOT_LOCALIZED')) tr = v;

				return html ? ('<span class="' + v + '">' + tr + '</span>') : tr;
			},	um = ~kind.indexOf('hide_') ? 'Hide' : (rtype % 2 ? 'Allow' : 'Block'),
					um = temp ? um.toLowerCase() : um,
					message = temp ? [_('Temporarily'), _(um)] : [_(um)],
					ukind = ~kind.indexOf('hide_') ? kind.substr(5) : kind,
					proto = this.simplified ? this.with_protos(rule).protos : false,
					rule = this.with_protos(rule).rule,
					unique = ['^.*$'];

			if (ukind === 'disable') {
				message = temp ? [_('Temporarily'), _((rtype % 2 ? 'Enable' : 'Disable') + ' JavaScript Blocker').toLowerCase()] : [_((rtype % 2 ? 'Enable' : 'Disable') + ' JavaScript Blocker')];
				message.push(_('JavaScript Blocker'));
			} else if (ukind === 'special') {
				if (rule.length) {
					if (rule === '^.*$' || rule === '*') message.push('all others')
					else {
						if (rule.charAt(0) === '^') message.push('others matching');
						message.push((html ? '<b>' : '') + this.utils.escape_html(rule.charAt(0) === '^' ? rule : _(rule, null, 1).toLowerCase()) + (html ? '</b>' : ''));
					}
				}
			} else {
				if (proto) {
					var mapper = function (v) {
								var tr = _(v);

								if (~tr.indexOf(':NOT_LOCALIZED')) tr = v;

								return html ? ('<span class="' + v + '">' + tr + '</span>') : tr;
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

				if (!~unique.indexOf(rule) && rule !== '*') {
					message.push(rule.charAt(0) === '.' ? 'within' : (rule.charAt(0) === '^' ? 'matching' : (~kind.indexOf('ajax_') ? 'to' : 'from')));
					message.push((html ? '<b>' : '') + this.utils.escape_html(rule.charAt(0) === '.' ? rule.substr(1) : rule) + (html ? '</b>' : ''));
				}
			}

			this.caches.messages[simp][cache_check] = message;

			simp = html = undefined;

			return message;
		},
		_remove_domain: function (event) {
			event.stopPropagation();
			
			var li = $(this.parentNode), d = li.data('domain');
		
			if (!JB.utils.confirm_click(this) || li.is(':animated')) return false;
																
			for (var kind in JB.rules.data_types)
				JB.rules.remove_domain(kind, d);
			
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
		},
		_recover_domain: function (event) {
			event.stopPropagation();

			var off = JB.utils.position_poppy(this, 0, 14), li;

			new Poppy(off.left, off.top, [
				'<p class="misc-info">', _('Recover')	, '</p>',
				'<input class="purple" type="button" id="recover-domain-merge" value="', _('Merge'), '" /> ',
				'<input class="purple" type="button" id="recover-domain-replace" value="', _('Replace'), '" />'].join(''), (function (li, domain, off, left, top) {
					$$('#recover-domain-merge').click((function (left, top, domain) {
						var current_rules = this.rules.current_rules;

						for (var kind in this.rules.data_types) {
							if (!(domain in current_rules[kind]))
								current_rules[kind][domain] = this.rules.rules[kind][domain];
							else
								for (var rule in this.rules.rules[kind][domain])
									current_rules[kind][domain][rule] = this.rules.rules[kind][domain][rule];
						}

						Settings.setItem(this.rules.which, JSON.stringify(current_rules));

						new Poppy(left, top, _('Domain merged with current rule set.'));
					}).bind(this, left, top, domain)).siblings('#recover-domain-replace').click((function (left, top, domain) {
						var current_rules = this.rules.current_rules;

						for (var kind in this.rules.data_types)
							current_rules[kind][domain] = this.rules.rules[kind][domain];

						Settings.setItem(this.rules.which, JSON.stringify(current_rules));

						new Poppy(left, top, _('Domain replaced in current rule set.'));
					}).bind(this, left, top, domain));

					li = kind = domain = off = left = top = undefined
			}).bind(JB, (li = $(this.parentNode)), li.data('domain'), off, off.left, off.top));

			li = off = event = undefined;
		},
		show: function () {
			var self = this;

			JB.temporaryExpertMode = false;

			this.busy = 1;
			
			$$('#show-temporary-rules').removeClass('using');
			$$('#edit-domains').removeClass('edit-mode');

			if (this.using_snapshot)
				$$('.snapshot-info').show();

			var ul = $$('#rule-container > .rules-wrapper').empty(), dul, cl = this.collapsedDomains(), rules;

			for (var kind in this.data_types) {
				if ((kind in this.rules) && this.enabled(kind)) {
					var sorted = this.utils.sort_object(this.rules[kind]);

					for (var domain in sorted) {
						rules = this.view(kind, domain, undefined, null, true);
						dul = $$('#rule-container li.domain-rules[data-value="' + domain + '"] ul');

						if (dul.length)
							dul.append(rules.find('.domain-rules ul').contents());
						else
							ul.append(rules.contents());
					}
				}
			}

			$$('#rule-container li.domain-rules[data-value=".*"]').prev().andSelf().prependTo(ul);
						
			$$('.rules-wrapper .domain-name')
				.prepend('<input type="button" value="' + (this.using_snapshot ? _('Recover') : _('Delete')) + '" class="' + (!this.using_snapshot ? 'delete' : 'purple' ) + '" />')
				.find('input').click(this.using_snapshot ? this._recover_domain : this._remove_domain);

			var visi = $$('#rules-list .domain-name');

			visi.filter(':odd').next().andSelf().addClass('odd');
			visi.filter(':even:not(:first)').next().andSelf().addClass('even');

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
						domain_name = domain === '.*' ? _('All Domains') : domain,
						settings = {
							ignoreBL: Settings.getItem('ignoreBlacklist'),
							ignoreWL: Settings.getItem('ignoreWhitelist')
						}, sim = this.simplified,
						_recover = _('Recover'), _delete = _('Delete');
			
				newul = ul.append(Template.create('rule_wrapper_inner', {
					selectable: Settings.getItem('traverseRulesDomains') ? 'selectable' : '',
					domain: domain,
					domain_display: self.utils.escape_html(domain_name)
				})).find('.domain-name').data({ domain: domain }).end().find('.domain-rules ul');
			
				for (rule in allowed) {
					rules++;
					rtype = allowed[rule][0];
					temp = allowed[rule][1];

					if (hide_wlbl && (rtype === 4 || rtype == 5)) continue;
					if (typeof match_rtype === 'number' && (rtype % 2) !== match_rtype) continue;

					if (url instanceof Array)
						for (i = 0; url[i]; i++)						
							if ((did_match = this.match(kind, rule, url[i], sim)))
								break;

					if ((url && !did_match) || 
							(settings.ignoreBL && rtype === 4) ||
							(settings.ignoreWL && rtype === 5)) continue;
					
					newul.append(Template.create('rule_item', {
						rtype: rtype,
						text: sim ? this.make_message(kind, rule, rtype, temp).join(' ') : self.utils.escape_html(rule),
						temp: temp,
						button: this.using_snapshot ? _recover : _delete,
						is_delete: !this.using_snapshot
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
	add_disable_rule: function (host, left, top, already, force_new) {
		if (this.rules.using_snapshot) return new Poppy(left, top, _('Snapshot in use'));

		var self = this, matches = this.rules.matching_URLs('disable', host, ['*'], !already), rs = [], wrapper = $('<div><ul class="rules-wrapper"></ul></div>');

		for (d in matches) {
			rs.push(matches[d].length);

			$('.rules-wrapper', wrapper).append(self.rules.view('disable', d, ['*'], true, false).find('> li').find('input').remove().end());
		}

		if (rs.length && !force_new) {		
			var d, para = _('Would you like to delete ' + (rs.length === 1 ? 'it' : 'them') + ', or add a new one?'),
					button = _('Delete Rule' + (rs.length === 1 ? '' : 's'));

			$('li.domain-name', wrapper).removeClass('hidden').addClass('no-disclosure');

			new Poppy(left, top, [
				'<p>', _('The following rule' + (rs.length === 1 ? ' is' : 's are') + ' affecting JavaScript Blocker on this host:'), '</p>',
				wrapper.html(),
				'<p>', para, '</p>',
				'<div class="inputs">',
					'<input class="orange" type="button" value="', _('New Rule'), '" id="auto-new" /> ',
					'<input class="delete" type="button" value="', button, '" id="auto-restore" />',
				'</div>'].join(''), function () {
					$$('#auto-new').click(function () {
						self.add_disable_rule(host, left, top, already, true);
					}).siblings('#auto-restore').click(function () {
						new Poppy();

						self.rules.remove_matches('disable', matches);

						Tabs.messageActive('reload');
					});
				});
			return;
		}

		new Poppy(left, top, [
			'<p class="misc-info">', _('Adding a disable Rule'), '</p>',
			'<p>',
				'<input id="domain-script-temporary" type="checkbox"', self.collapsed('LastRuleWasTemporary') ? ' checked' : '', ' />',
				'<label for="domain-script-temporary">&thinsp;', _('Temporary rule'), '</label> ',
			'</p>',
			'<p>',
				Template.create('domain_picker', { page_parts: this.utils.domain_parts(host) }),
			'</p>',
			'<p>',
				'<select id="which-type" class="', force_new ? 'allowed' : 'blocked', '-color">',
					'<option value="', force_new ? 3 : 2, '">', _((force_new ? 'Enable' : 'Disable') + ' JavaScript Blocker'), '</option>',
					'<option value="', force_new ? 2 : 3, '">', _((force_new ? 'Disable' : 'Enable') + ' JavaScript Blocker'), '</option>',
				'</select>',
				' <select id="domain-script" class="kind-disable single">',
					'<option>', _('JavaScript Blocker'), '</option>',
				'</select>',
				' <input class="orange" id="domain-script-continue" type="button" value="', _('Save'), '" />',
			'<p>'
		].join(''), function () {
			$$('#which-type').change(function () {
				$(this).toggleClass('blocked-color', this.value === '2');
				$(this).toggleClass('allowed-color', this.value === '3');
			}).siblings('#domain-script-continue').click(function () {
				new Poppy();

				self.rules.add('disable', $$('#domain-picker').val(), '*', $$('#which-type').val(), true,$$('#domain-script-temporary').is(':checked'));

				Tabs.messageActive('reload');
			});
		});
	},
	add_rule_host: function (me, url, left, top, allow, return_a) {
		var self = this,
				hostname = me.parent().data('url'), rule,
				one_script = me.parent().data('script'),
				kind = me.parent().data('kind'),
				proto = self.utils.active_protocol(one_script[0]),
				for_host = me.parents('.host-section').attr('data-host'),
				parts = ~['HTTP', 'HTTPS', 'FTP'].indexOf(proto) ? self.utils.domain_parts(hostname) : [hostname, '*'], a = [],
				page_parts = self.utils.domain_parts(for_host), n,
				opt = '<option value="{0}">{1}</option>';
				
		if (kind !== 'script' && !this.donationVerified)
			return new Poppy(left, top + 12, _('Donation Required'));
		
		if (~kind.indexOf('special'))
			a.push(this.utils.fill(opt, [one_script[0], hostname]));
		else {
			switch (hostname) {
				case 'blank':
					a.push(this.utils.fill(opt, ['ABOUT:blank', 'blank'])); break;
				case 'Data URI':
					a.push(this.utils.fill(opt, ['DATA:*', 'Data URI'])); break;
				case 'JavaScript Protocol':
					a.push(this.utils.fill(opt, ['JAVASCRIPT:*', 'JavaScript Protocol'])); break;
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
			'<option value="', allow ? 0 : 1, '">', allow ? _('Block') : _('Allow'), '</option>',
			'<option value="42">', _('Hide'), '</option>',
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
					'<input class="orange" id="domain-script-continue" type="button" value="', _('Save'), '" />',
				'</p>'].join(''), function () {
					$$('#domain-script-continue').click(function () {
						var	h = $$('#domain-picker').val(),
								temp = $$('#domain-script-temporary').is(':checked'),
								hider = $$('#which-type').val() === '42';
						
						self.rules.add((hider ? 'hide_' : '') + kind, h, $$('#domain-script').val(), hider ? 42 : (allow ? 1 : 0), true, temp, proto);
							
						Tabs.messageActive('reload');
					}).siblings('#which-type').change(function () {
						$(this).removeClass('blocked-color allowed-color');
						$(this).toggleClass('blocked-color', this.value === '0');
						$(this).toggleClass('allowed-color', this.value === '1');
					});
		});
	},
	clear_ui: function () {
		$$('.whoop').scrollTop(0);
		$$('.some-list, .pending').removeClass('some-list pending');
		$$('#host-sections').empty();
		$$('#toggle-hidden').addClass('disabled');
		this.lockUpdate = false;
	},
	adjust_columns: function (no_animation) {
		var self = this;

		if (this.simpleMode && !this.temporaryExpertMode) return;

		$(this.popover.body).toggleClass('no-animations', !!no_animation || this.speedMultiplier < 1);

		$$('.host-section').each(function () {
			var ac = $('.allowed-column', this), bc = $('.blocked-column', this);

			ac.toggleClass('column-collapsed', ac.hasClass('hidden'));
			bc.toggleClass('column-collapsed', bc.hasClass('hidden'));

			var collapsed = $('.column-collapsed', this);

			if (collapsed.length === 1)
				$('.column:not(.column-collapsed)', this).addClass('expanded');
			else if (collapsed.length === 2 || collapsed.length == 0)
				$('.column', this).removeClass('expanded');

			var expanded = $('.column.expanded', this), id = expanded.length ? (expanded.hasClass('blocked-column') ? 'blocked-column' : 'allowed-column') : null;

			$('.allowed-blocked-columns', this).removeClass('blocked-column-expanded allowed-column-expanded none-expanded').addClass((id || 'none') + '-expanded');

			setTimeout(function (bc, ac) {
				bc.css('minHeight', '');
				ac.css('minHeight', '');
			}, 405 * (no_animation ? 0.025 : self.speedMultiplier), bc, ac);

			self.utils.timer.timeout('remove_no_animation', function () {
				$(self.popover.body).removeClass('no-animations');
			}, 100);
		});
	},
	bind_events: function(some, host) {
		if (!this.popover) return;

		var add_rule, remove_rule, self = this,
				alblspan = '.allowed-script-urls ul li:not(.show-me-more) span, .blocked-script-urls ul li:not(.show-me-more) span';
		
		function toggle_find_bar (show_only) {
			var f = $$('#find-bar'),
					v = f.is(':visible');
			
			if (v && show_only) return false;
			
			var	h = 22,
					a = v ? f.show() : f.hide(),
					m = (f.slideToggle(200 * self.speedMultiplier).toggleClass('visible').hasClass('visible')) ? '-' : '+',
					mM = m === '-' ? '+' : '-';
			
			$$('.whoop').animate({
				height: m + '=' + h,
				marginTop: mM + '=' + h
			}, {
				duration: 200 * self.speedMultiplier,
				easing: 'swing',
				step: function () {
					$(this).trigger('scroll');
				},
				complete: function () {
					if (m === '+') $(this).css('height', '');
				}
			});
			
			if (v) $('#find-bar-search', f).blur();
			
			return true;
		}

		function url_display (e) {
			var me = $(this), t = $(this).siblings('span:first'), pa = t.parent(), off = t.offset(), kind = pa.data('kind'),
					left = Math.floor(me.offset().left + me.outerWidth() / 2);
		
			function codeify(data, force_script) {
				function do_highlight (data, no_zoom) {
					$$('#misc .misc-header').empty();
					$$('#misc-content pre').remove();

					if (force_script)
						$$('.misc-header').text(_(sp));
					else
						$$('<a />').attr('href', t.text()).addClass('outside').text(t.text()).appendTo($$('#misc .misc-header'));
					
					$('<pre />').append('<code class="javascript"></code>').find('code').text(data).end().appendTo($$('#misc-content'));
					if (!no_zoom) self.utils.zoom($$('#misc'));
					var p = $$('#misc-content pre code');
					p.data('unhighlighted', p.html());
					self.hljs.highlightBlock(p[0]);
				}
				
				$$('#beautify-script').remove();
				
				if (kind === 'script' || force_script)
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
				var host = encodeURI(self.useSimpleMode()? t.text() : self.utils.active_host(t.text()));
				
				new Poppy(left, off.top + 11, [
					'<p class="misc-info">', _('Safety Information for {1}', [host]), '</p>',
					'<p><a class="outside" href="https://www.mywot.com/en/scorecard/', host, '">WOT Scorecard</a></p>',
					'<div class="divider" style="margin-bottom: 2px;margin-top: 3px;"></div>',
					'<p><a class="outside" href="http://www.google.com/safebrowsing/diagnostic?site=', encodeURI(host), '">Google Safe Browsing Diagnostic</a></p>',
					'<div class="divider" style="margin-bottom: 3px;margin-top: 3px;"></div>',
					'<p><a class="outside" href="https://www.siteadvisor.com/sites/', encodeURI(host), '">McAfee SiteAdvisor&reg;</a></p>'
					].join(''));
			}
			
			if (kind === 'special') {
				var wh = t.parents('.urls-wrapper').is('.blocked-script-urls') ? 0 : 1,
						sp = t.parent().data('script')[0];

				if (~sp.indexOf('customp')) {
					var which = ~sp.indexOf('custompre') ? 'pre' : 'post';
					codeify(self.customScripts[which]()[sp].func, true);
					self.utils.zoom($$('#misc'));
				} else
					new Poppy(left, off.top + 11, _(sp + ':' + wh, [self.special_enabled(sp)]));
			} else if (self.useSimpleMode() && (!pa.hasClass('by-rule') || pa.hasClass('unblockable'))) {
				script_info();
			} else
				new Poppy(left, off.top + 11, [
					'<input type="button" value="', _('More Info'), '" id="script-info" /> ',
					self.useSimpleMode() || kind === 'embed' || kind === 'ajax_post' || kind === 'ajax_put' ? '' : '<input type="button" value="' + _('View ' + kind + ' Source') + '" id="view-script" /> ',
					pa.hasClass('by-rule') && !pa.hasClass('unblockable') ? '<input class="orange" type="button" value="' + _('Show Matched Rules') + '" id="matched-rules" />' : ''].join(''), function () {
						$$('#poppy').find('#script-info').click(script_info).end().find('#matched-rules').click(function () {
							var block_allow = !me.parents('.column').hasClass('blocked-column'),
									matches = self.rules.matching_URLs(pa.data('kind'), me.parents('.host-section').attr('data-host'), pa.data('script'), block_allow, true), d,
									con = $('<div />'),
									wrapper = $('<ul class="rules-wrapper" />').appendTo(con);
							
							con.prepend('<p class="misc-info">' + _('Matched ' + me.parents('.main-wrapper').attr('data-kind') + ' Rules') + '</p>');

							for (d in matches)
								wrapper.append(self.rules.view(pa.data('kind'), d, pa.data('script'), true, false, block_allow ? 1 : 0).find('> li').find('input').remove().end());

							$('li.domain-name', wrapper).removeClass('hidden').addClass('no-disclosure');

							new Poppy(left, off.top + 11, con);
						}).end().find('#view-script').click(function () {
							if (kind === 'image') {
								$$('#misc .misc-header').empty();
								$$('#beautify-script').remove();
								$$('#misc-content').html('<img src="' + t.html() + '" />');
								$$('<a />').attr('href', t.text()).addClass('outside').text(t.text()).appendTo($$('#misc .misc-header'));
								self.utils.zoom($$('#misc'));
								return false;
							}
							
							if (/^data/.test(t.text())) {
								var dd = t.text().match(/^data:(([^;]+);)?([^,]+),(.+)/), mime = ['text/javascript', 'text/html', 'text/plain'];

								if (dd && dd[4] && ((dd[2] && ~mime.indexOf(dd[2].toLowerCase())) ||
										(dd[3] && ~mime.indexOf(dd[3].toLowerCase())))) {
									codeify(unescape(dd[4]));
									new Poppy();
								} else
									new Poppy(left, off.top + 11, '<p>' + _('This data URI cannot be displayed.') + '</p>');
							} else {
								new Poppy(left, off.top + 11, '<p>' + _('Loading ' + kind) + '</p>', $.noop, function () {
									try {
										$.ajax({
											dataType: 'text',
											url: t.text(),
											success: function (data) {
												codeify(data);
												new Poppy();
											},
											error: function (req) {
												new Poppy(left, off.top + 11, '<p>' + req.statusText + '</p>');
											}
										});
									} catch (er) {
										new Poppy(left, off.top + 11, '<p>' + er + '</p>');
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

						if (!$$('#modal').is(':visible')) {
							new Poppy();
							new Poppy(true);
						}
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
					self.speedMultiplier = !self.useAnimations ? 0.001 : 20;

					self.utils.timer.timeout('no_more_shift', function () {
						self.speedMultiplier = !self.useAnimations ? 0.001 : 1;
					}, 3000);
				break;
			
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

			UP = DOWN = LEFT = RIGHT = undefined;
		}).keyup(function (e) {
			if (e.which === 17 || e.which === 18) self.optionKey = false;
			else if (e.which === 16) self.speedMultiplier = !self.useAnimations ? 0.001 : 1;
			else if ((e.which === 93 || e.which === 91) || (window.navigator.platform.match(/Win/) && e.which === 17)) self.commandKey = false;
		});

		$$('#main').scroll(function (e) {
			self.lockUpdate = this.scrollTop > 10;
		});

		$(Popover.window()).on('mousemove', function (event) {
			if (self.doResize) {
				var height = (event.pageY > self.resizeStartPosition) ? self.doResize + (event.pageY - self.resizeStartPosition) : self.doResize - (self.resizeStartPosition - event.pageY);

				height = Math.max(200, height);

				Popover.object().height = height;

				var sel = Popover.window().getSelection();
				sel.removeAllRanges();

				self.utils.timer.timeout('unset_resize', function (height) {
					self.doResize = false;

					Settings.setItem(self.useSimpleMode() ? 'popoverSimpleHeight' : 'popoverHeight', height);
				}, 400, [height]);
			}
		}).on('blur', function () {
			var lis = $$('#main li.pending');

			lis.each(function () {
				var li = $(this), lid = $.data(li[0]), rtype = li.parents('.urls-wrapper').is('.blocked-script-urls'),
						use_host = li.parents('.host-section').attr('data-host'),
						host_parts = self.utils.domain_parts(use_host);

				switch (Settings.getItem('quickAddType')) {
					case '0':
						use_host = host_parts[0]; break;
					case '1':
						use_host = (host_parts.length > 2 ? '.' : '') + host_parts[host_parts.length - 2]; break;
					case '2':
						use_host = '.*'; break;
				}

				self.rules.add(lid.kind, use_host, lid.pending_data, rtype ? 1 : 0, true, Settings.getItem('quickAddTemporary'));

				self.utils.timer.timeout('quick_add_reload', function (lis) {
					lis.addClass('allow-update').removeClass('pending');
					Tabs.messageActive('reload');
				}, 50, [lis]);
			});
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

			self.rules.remove(li.data('kind'), li.data('domain'), li.data('rule'));
						
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
					parent.parent().prev().hide(200 * self.speedMultiplier, function () {
						$(this).remove();
					});

					parent.parent().hide(200 * self.speedMultiplier, function () {
						$(this).remove();

						$$('#domain-filter').trigger('search');
					});
				}
				
				$$('#domain-filter').trigger('search');
			});
		}).on('click', '.rules-wrapper li:not(.domain-name) span:not(.nodbl).rule', function (e) {
			var t = $(this), off = t.offset();

			if (self.rules.using_snapshot) return new Poppy(e.pageX, off.top + 12, _('Snapshot in use'));

			new Poppy(e.pageX || 40, off.top + 12, t.hasClass('type-2') || t.hasClass('type-3') ? 
					_('Disable rules cannot be modified.') : ([t.hasClass('type-4') || t.hasClass('type-5') ?
					_('Predefined rules cannot be edited.') :
					!t.hasClass('type-900') ? '<input class="orange" type="button" value="' + _('Edit Rule') + '" id="rule-edit" /> ' : '',
					'<button class="orange" id="rule-new">' + _('New Rule') + '</button>'].join('')), function () {
				var domain = t.parent().data('domain'), dv = self.utils.escape_html(domain);
				$$('#poppy #rule-edit, #poppy #rule-new').filter('#rule-new')
						.html(_('New ' + t.parent().data('kind') + ' rule for {1}', [(domain === '.*' ? _('All Domains') : dv)])).end().click(function () {
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
										'class': 'domain-picker orange',
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
					
			t.css('display', 'block');
			
			if (me.hasClass('floater') && !hid)
				x.css('opacity', 1).prev().remove();
			
			var c = self.collapsedDomains(),
					dex = c.indexOf(d),
					rulesList = $$('#rules-list'),
					hid = me.hasClass('hidden'),
					o = t.outerHeight(true),
					h = t.height(),
					height;

			if (hid) {
				me.toggleClass('hidden');
				x.toggleClass('hidden');
			}
										
			ul.css({ marginTop: hid ? -o : 0 }).animate({
				marginTop: hid ? 0 : -o
			}, 200 * self.speedMultiplier, function () {
				if (!hid) {
					me.toggleClass('hidden');
					x.toggleClass('hidden');
				}

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
						
			if (hid) {
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
		}).on('click', '#apply-quick-add', function () {
			this.disabled = true;

			$$(Popover.window()).trigger('blur');
		}).on('click', '#clear-quick-add', function () {
			this.disabled = true;

			self.popover_current = null;
			self.lockUpdate = false;

			$$('li.pending').addClass('allow-update').removeClass('pending');

			$$('#quick-add-info').slideUp(200 * self.speedMultiplier);

			if (!$$('.some-list').length) Tabs.messageActive('updatePopover');
		}).on('mousedown', alblspan, function (e, t) {
			var span = $(this);

			e = t || e;

			if (e.which && e.which !== 1) return;

			span.removeClass('triggered').data('quick_add_ignore_timeout', setTimeout(function (span, e) {
				$$('#main li.pending').removeClass('pending').removeData('pending_index').each(function () {
					$('span', this).text($(this).data('url'));
				});

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

			if(!e.isTrigger) {
				e.stopImmediatePropagation();

				new Poppy(true);
			}

			e = t || e;
			
			var span = $(this),
					blocked = !$(this).parents('.urls-wrapper').is('.blocked-script-urls'),
					li = $(this).parent(),
					lid = $.data(li[0]),
					off = $(this).offset(),
					left = e.pageX,
					url = lid.url,
					script = lid.script,
					allow = li.parents('.column').is('.allowed-column');

			clearTimeout($(this).data('quick_add_ignore_timeout'));

			if (span.hasClass('triggered')) return span.removeClass('triggered');
			if (self.rules.using_snapshot) return new Poppy(left, off.top + 12, _('Snapshot in use'));
			if (li.hasClass('unblockable')) {
				var proto = self.utils.active_protocol(lid.unblockable),
						text = self.useSimpleMode() ? self.utils.active_host(lid.unblockable) : lid.unblockable;

				return new Poppy(left, off.top + 12, _('Unblockable ' + lid.kind, [proto, text]));
			}

			var	for_host = span.parents('.host-section').attr('data-host');

			if (Settings.getItem('quickAdd') && !li.hasClass('ignore-quick-add') && (self.useSimpleMode() || (!self.useSimpleMode() && !Settings.getItem('quickAddSimpleOnly')))) {
				var me = span, parts = self.utils.domain_parts(self.useSimpleMode() ? url : self.utils.active_host(url)),
						pi = 0, special = ~lid.kind.indexOf('special'), span = $('> span', li);

				parts.splice(-1);
				span.text(url);

				if (span.hasClass('SAFARI-EXTENSION')) parts = [parts[0]];

				parts = special || !self.simpleMode || self.temporaryExpertMode ? script : parts;

				if (!li.hasClass('pending') || Settings.getItem('quickAddQuicker')) {
					var ind;

					$$('#apply-quick-add, #clear-quick-add').prop('disabled', false);

					li.data('pending_index', (ind = li.data('pending_index')) !== undefined && Settings.getItem('quickAddQuicker') ? ind + 1 : 0);

					var rule, begin = $$('<span />'), select = $$('<select />').attr('id', 'quick-add-select'),
							begin_message = self.rules.make_message(lid.kind, self.useSimpleMode() ? (lid.kind === 'special' ? '' : (lid.protocol + ':' + '*')) : '^$', !allow, Settings.getItem('quickAddTemporary')),
							end_message;

					for (var rr = 0; parts[rr]; rr++) {
						end_message = [];
						rule = self.useSimpleMode() ? ((rr > 0 ? '.' : '') + parts[rr]) : '^' + self.utils.escape_regexp(parts[rr]) + (!special ? '((\\?|#)+.*)?$' : '$')

						if (self.rules.simplified && !special) {
							switch (lid.protocol) {
								case 'DATA':
								case 'JAVASCRIPT':
									rule = lid.protocol + ':*'
								break;

								case null:
								case undefined:
								case false:
									rule = ':' + rule;
								break;

								default:
									end_message.push(rr === 0 ? _(~lid.kind.indexOf('ajax_') ? 'to' : 'from') : _('within'), rr === 0 ? rule : rule.substr(1));
									rule = lid.protocol + ':' + rule
								break;
							}
						} else if (self.useSimpleMode() && special)
							end_message.push(_(rule).toLowerCase());
						else if (!self.useSimpleMode())
							begin_message[begin_message.length - 1] = self.utils.escape_html(rule);

						$('<option />')
							.val(rule)
							.attr('data-part', parts[rr])
							.text(end_message.join(' '))
							.appendTo(select)
					}

					begin.append(begin_message.join(' '));

					select.toggleClass('single', select.find('option').length === 1);
					
					if (!Settings.getItem('quickAddQuicker'))
						new Poppy(left, off.top + 12, [
							'<p class="quick-add-more">', _('Press and hold for more options.'), '</p>',
							'<p id="quick-add-rule"><span class="bubble bubble-', allow ? 0 : 1, Settings.getItem('quickAddTemporary') ? ' temporary' : '', '"></span>', begin[0].outerHTML, ' ', select[0].outerHTML, '</p>'].join(''), function () {
							$$('#quick-add-rule select').change(function () {
								li.data('pending_index', this.selectedIndex).data('pending_data', this.value);

								var to_do = $(this).find('option:selected').attr('data-part');

								span.html(url.replace(new RegExp((special ? url : self.utils.escape_regexp(to_do)) + '$', 'i'), '<mark class="quick-add">' + self.utils.escape_html(special ? url : to_do) + '</mark>'));
							})
						}, null, 0.15);

					var first = select.find('option:eq(' + li.data('pending_index') + ')'), to_do = first.attr('data-part');

					if (first.length) {
						new Poppy();
						
						li.addClass('pending')
							.data('pending_data', first.val());

						span.html(url.replace(new RegExp((special ? url : self.utils.escape_regexp(to_do)) + '$', 'i'), '<mark class="quick-add">' + self.utils.escape_html(special ? url : to_do) + '</mark>'));
					} else
						li.removeClass('pending').removeData('pending_index');

					if (!Settings.getItem('quickAddQuicker')) select = begin = null;
				} else {
					new Poppy();

					li.removeClass('pending').removeData('pending_index');
				}

				if ($$('li.pending').length) $$('#quick-add-info').slideDown(200 * self.speedMultiplier);
				else $$('#quick-add-info').slideUp(200 * self.speedMultiplier);

				return;
			}

			li.removeClass('ignore-quick-add');

			$$('#quick-add-info').slideUp(200 * self.speedMultiplier);
			
			var page_parts = self.utils.domain_parts(for_host), n,
					padd = self.poppies.add_rule.call({
						real_url: ~['HTTP', 'HTTPS', 'FTP'].indexOf(self.utils.active_protocol(script[0])) ? script[0] : null,
						url: '^' + (self.useSimpleMode() ? self.utils.escape_regexp(script[0].substr(0, script[0].indexOf(url))) : '') + self.utils.escape_regexp(url) + (self.useSimpleMode() ? '\\/.*' : '') + '$',
						e: $(this).siblings('span'),
						li: $(this).parent(),
						domain: for_host,
						is_new: 1,
						header: _('Adding a ' + lid.kind + ' Rule For {1}', [Template.create('domain_picker', { page_parts: page_parts, no_label: true })])
				}, self),
				matches = self.rules.matching_URLs(li.data('kind'), for_host, script, blocked);

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
					var para = _('Would you like to delete ' + (rs.length === 1 ? 'it' : 'them') + ', or add a new one?'),
							button = _('Delete Rule' + (rs.length === 1 ? '' : 's')),
							wrapper = $('<div><ul class="rules-wrapper"></ul></div>');

					for (d in matches)
						$('.rules-wrapper', wrapper).append(self.rules.view(li.data('kind'), d, script, true, false, blocked ? 1 : 0).find('> li').find('input').remove().end());

					$('li.domain-name', wrapper).removeClass('hidden').addClass('no-disclosure');

					new Poppy(left, off.top + 12, [
						'<p>', _('The following rule' + (rs.length === 1 ? ' is ' : 's are ') + (!blocked ? 'blocking' : 'allowing') + (' this item:')), '</p>',
						wrapper.html(),
						'<p>', para, '</p>',
						'<div class="inputs">',
							'<input class="orange" type="button" value="', _('New Rule'), '" id="auto-new" /> ',
							'<input class="delete" type="button" value="', button, '" id="auto-restore" />',
						'</div>'].join(''), function () {
							$$('#poppy #auto-new').click(function () {
								if ((self.useSimpleMode()) || ~li.data('kind').indexOf('special')) return self.add_rule_host(span, script, left, off.top, !blocked);
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

			if ((self.useSimpleMode()) || ~li.data('kind').indexOf('special')) return self.add_rule_host(span, script, left, off.top, !blocked);
			else if (!self.donationVerified) return false;
			
			new Poppy(left, off.top + 12, padd);
		}).on('click', '.allowed-script-urls .info-link, .blocked-script-urls .info-link', url_display)
			.on('click', '.unblocked-script-urls li:not(.show-me-more) span', function() {
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
		}).on('click', '.all-action-link', function () {
			var page_parts = self.utils.domain_parts($(this).parents('.host-section').attr('data-host')), n, off = self.utils.position_poppy(this, 0, 13),
					me = this, kinds = [], block = !~this.className.indexOf('block'),
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
								' <input class="orange" id="domain-script-continue" type="button" value="', _('Save'), '" />',
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
							});
						});	
					}
			
			if (self.donationVerified)
				for (var kind in self.rules.data_types) {
					if (!Settings.getItem('enable' + kind) || ~kind.indexOf('hide_') || kind === 'disable') continue;
							
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
								' <input type="button" class="save-some orange" id="save-some-', block ? 0 : 1, '" value="', _('Save'), '" />',
							'</p>',
							'<div class="divider"></div>',
						'</div>'
					].join('')).hide(), parent = ob.parent();

					parent.addClass('some-list');

					$$('#clear-quick-add:visible:not([disabled])').click();

					var isHidden = $$((block ? '.allowed' : '.blocked') + '-label.hidden').length;

					$$((block ? '.allowed' : '.blocked') + '-label.hidden:first').click();

					new Poppy();

					self.utils.timer.timeout('show_some_list', function (ob, parent) {
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
									((self.useSimpleMode()) || data.kind === 'special' ? [
										'<select class="', op.length === 1 ? 'single' : '', ' ', proto, '"', op.length === 1 ? ' tabindex="-1"' : '', '>', opts, '</select>'
									] : [
										'<textarea placeholder="Rule" wrap="off" class="rule-input orange">^', self.utils.escape_regexp(data.script[0]), '$</textarea>'
									]).join('')
								].join('')).hide().insertAfter(li).slideDown(200 * self.speedMultiplier)
									.attr('title', op.length === 1 ? $(op[0]).html() : null);
							}
						}

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
						});
					}, 450 * self.speedMultiplier * (isHidden ? 1 : 0), [ob, parent]);
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
		}).on('click', '#show-active-rules', function (event) {
			var hosts = $$('.host-toggler').map(function () { return this.getAttribute('data-host'); }), host, active = '', all_parts = [];

			if (!~this.className.indexOf('using')) {
				for (var i = 0; host = hosts[i]; i++) {
					var parts = self.domain_parts(host),
							x = parts.slice(0, 1),
							y = parts.slice(1);

					x.push(x[0]);

					parts = x.concat(y);
					parts = parts.slice(0, -1);

					$.merge(all_parts, parts);

					parts = parts.map(function (v) { return self.utils.escape_regexp(v); })

					active += '^' + parts.join('$|^\\.') + '$|';
				}

				active += '^' + _('All Domains') + '$';
			}
						
			var df = $$('#domain-filter').val(active).data({
				parts: all_parts,
				active: active.length ? active : false
			});

			if (!event.isTrigger) df.trigger('search');
		}).on('click', '#view-rules', function (e) {
			if (!self.methodAllowed) return false;
			
			var offset = self.utils.position_poppy(this, 0, 17),
					left = offset.left,
					top = offset.top;
			
			new Poppy(left, top, [
				'<p class="misc-info">', _('Active Temporary Rules'), '</p>',
				'<input class="orange" type="button" value="', _('Make Permanent'), '" id="rules-make-perm" /> ',
				'<input class="orange" type="button" value="', _('Revoke'), '" id="rules-remove-temp" /> ',
				'<input class="orange" type="button" value="', _('Show'), '" id="rules-show-temp" />',
				'<div class="divider" style="margin:7px 0 6px;"></div>',
				'<input class="orange" type="button" value="', _('Show All'), '" id="view-all" /> ',
				'<input class="orange" type="button" value="', _('Show Active'), '" id="view-domain" /> ',
				self.donationVerified ? ['<input class="orange" type="button" value="', _('Backup'), '" id="rules-backup" />'].join('') : '',
				self.rules.using_snapshot ? [
					' <input class="purple" type="button" value="', _('Snapshot'), '" id="current-snapshot" />'].join('') : ''
				].join(''), (function (left, top) {
				$$('#current-snapshot').click(function () {
					var pop = self.poppies.current_snapshot(!self.rules.snapshots.exist(self.rules.using_snapshot));

					new Poppy(left, top, pop);

					left = top = undefined;
				});

				$$('#view-domain').click(function () {
					this.disabled = 1;
					
					$$('#view-all').click();
					$$('#show-active-rules').removeClass('using').click();

					left = top = undefined;
				}).siblings('#view-all').click(function (event) {
					if (this.disabled) return false;

					this.disabled = 1;
					
					self.busy = 1;
															
					if ('srcElement' in event)
						$$('#domain-filter').val('').data('parts', []);

					self.rules.show();

					self.utils.zoom($$('#rules-list'), null, null, function() {
						var parts = $$('#domain-filter').trigger('search').data('parts') || [];
						
						for (var i = 0; i < parts.length; i++)
							$$('.domain-name[data-value="' + (i > 0 ? '.' : '') + parts[i] + '"].hidden').click();
					});

					left = top = undefined;
				}).siblings('#rules-make-perm, #rules-remove-temp').click(function () {
					if (self.rules.using_snapshot) {
						var off = self.utils.position_poppy(this, 0, 14);
						return new Poppy(off.left, off.top, _('Snapshot in use'), null, null, null, null, true);
					}

					$$('.host-section').each(function () {
						for (var key in self.rules.data_types) {
							var rules = self.rules.for_domain(key, this.getAttribute('data-host')), domain, rule, make_perm = this.id === 'rules-make-perm';

							for (domain in rules)
								for (rule in rules[domain])
									if (rules[domain][rule][1]) {
										if (make_perm)
											self.rules.add(key, domain, rule, rules[domain][rule][0], true, false);
										else
											self.rules.remove(key, domain, rule);
									}
						}
					});
					
					if (this.id === 'rules-remove-temp') {
						Tabs.messageActive('reload');
					} else
						new Poppy();

					left = top = undefined;
				}).siblings('#rules-show-temp').click(function () {
					$$('#view-domain').click();
					$$('#show-temporary-rules').click();

					left = top = undefined;
				}).siblings('#rules-backup').click(function () {
					new Poppy(left, top, self.poppies.backup.call({
							left: left,
							top: top
					}));

					left = top = undefined;
				});
			}).bind(this, left, top));

			left = top = e = undefined;
		}).on('click', '#rules-list-back', function () {
			self.popover_current = null;

			Tabs.messageActive('updatePopover');

			$$('.some-list, .pending').removeClass('some-list pending');

			var r = $$('#rules-list:not(.zoom-window-animating)');

			if (r.length)
				self.utils.zoom(r.addClass('zoom-window-open zoom-window'), function () {
					$$('#rules-list').find('.rules-wrapper').empty().end().find('.snapshot-info').hide();
				});
		}).on('click', '#misc-close', function() {
			self.utils.zoom($$('#misc'), function () {
				$$('#misc-content, p.misc-header').empty();
			});
		}).on('click', '.allowed-label, .blocked-label, .unblocked-label', function () {
			var me = $(this),  which = this.className.substr(0, this.className.indexOf('-')),
					e = $$('.' + which + '-script-urls .urls-inner'), column = $$('.' + which + '-column');
			
			if (e.is(':animated') || column.is(':animated')) return false;

			var adjuster = function (cb) {
				self.adjust_columns();

				if (cb) self.utils.timer.timeout('adjust_cb', cb, 200 * self.speedMultiplier * (self.useSimpleMode() ? 0 : 1));
			};

			if (me.hasClass('hidden')) {
				self.collapsed(which, 0);

				$$('.' + which + '-label').removeClass('hidden');
				
				me.removeClass('hidden');
				column.removeClass('hidden');
				
				adjuster(function () {
					e.show().css('marginTop', -e.height()).animate({
						marginTop: 0
					}, 200 * self.speedMultiplier);
				});
			} else {
				self.collapsed(which, 1);

				$$('.' + which + '-label').addClass('hidden');
				
				me.addClass('hidden');
				column.addClass('hidden');
								
				e.css('marginTop', 0).animate({
					marginTop: -e.height()
				}, 200 * self.speedMultiplier, function () {
					adjuster();
					e.hide();
				});
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
		}).on('click', '.host-toggler', function (event) {
			var pos = self.utils.position_poppy(this, 0, 14),
					parts = self.domain_parts(this.getAttribute('data-host')),
					x = parts.slice(0, 1),
					y = parts.slice(1), active;

			return self.add_disable_rule(this.getAttribute('data-host'), pos.left, pos.top, ~this.className.indexOf('disabled'));
		}).on('click', '#edit-domains', function () {
			$(this).toggleClass('edit-mode');
						
			var ul = $$('.rules-wrapper');
			
			$('.domain-name', ul).toggleClass('no-disclosure').toggleClass('editing')
			
			$$('#rules-list .rules-wrapper').each(function () {
				$('.domain-name:visible .divider', this).removeClass('invisible').filter(':visible:first').addClass('invisible');
			});
		}).on('click', '#time-machine', function (event) {
			var off = self.utils.position_poppy(this, 2, 12);

			if (!self.donationVerified) return new Poppy(off.left, off.top, _('Donation Required'));
			if (!Settings.getItem('enableSnapshots')) return new Poppy(off.left, off.top, _('Snapshots disabled'));

			if (self.rules.using_snapshot) {
				new Poppy(off.left, off.top, self.poppies.current_snapshot(!self.rules.snapshots.exist(self.rules.using_snapshot)));

				return;
			}

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

			$$('#filter-type-collapse li.selected').click();
			
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
								self.rules.remove(key, domain, rule);
				}
			
			var l = $$('.rules-wrapper');
			
			if (l.is(':visible'))
				l.find('span.temporary').removeClass('temporary type-2').addClass('type-1').siblings('input').click().click();

			$$('#filter-type-collapse li.selected').click();
			
			new Poppy(-2 + off.left + $(this).width() / 2, off.top + 12, '<p>' + _('All temporary rules have been removed.') + '</p>');
		}).on('search', '#domain-filter', function () {
			self.busy = 1;

			$$('#show-active-rules').toggleClass('using', $(this).data('active') === this.value);

			var d = $$('.domain-name:not(.visibility-hidden,.state-hidden,.visibility-hidden) span'), v;
			
			try {
				v = new RegExp(this.value, 'i');
			} catch (e) {
				v = /.*/;
			}
						
			d.each(function () {
				$(this.parentNode).toggleClass('domain-filter-hidden', !v.test(this.innerHTML));
			});
			
			$$('#rules-list .domain-rules').each(function () {
				$('li', this).find('.divider').removeClass('invisible').end()
					.not('.used-none, .old-none, .none').filter(':last')
					.find('.divider').addClass('invisible');
			});
			
			$$('li.domain-name').next().each(function () {
				$(this).prev().toggleClass('state-hidden', $('ul li.none, ul li.old-none, ul li.used-none', this).length === $('ul li', this).length);
			});

			var visi, d = (visi = $$('#rules-list .domain-name:visible')).length,
					r = $$('#rules-list .domain-name:visible + li > ul li:not(.none,.old-none,.used-none) span.rule:not(.hidden,.type-900)').length;

			$$('#rules-list li.odd, #rules-list li.even').removeClass('odd even');

			visi.filter(':odd').next().andSelf().addClass('odd');
			visi.filter(':even:not(:first)').next().andSelf().addClass('even');
			
			$$('#rule-counter').html(
					_('{1} domain' + (d === 1 ? '' : 's') + ', {2} rule' + (r === 1 ? '' : 's'), [d, r])
			).removeData('orig_html');

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
			
			if ($$('#rule-container').is(':visible')) $$('#domain-filter').trigger('search');
		}).on('click', '#show-temporary-rules', function () {
			self.busy = 1;
			
			var me = $(this);

			me.toggleClass('using');
						
			$$('.rule').removeClass('hidden').parent().removeClass('none');
			
			if (me.hasClass('using'))
				$$('.rule').not('.temporary').addClass('hidden').parent().addClass('none');
		
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

			var time = Date.now() - off;

			rules.each(function () {
				var uses = $.data(this).uses;

				if (uses && ((usedInPast && off > 0 && uses.lastUsed < time) || (!usedInPast && uses.lastUsed > time)))
					$(this).addClass(which);
			});
			
			if (usedInPast) $$('#filter-type-not-used .selected').click();
			else $$('#filter-type-collapse .selected').click();
		}).on('click', '.outside', function (e) {
			e.preventDefault();
			self.utils.open_url(this.href);
		}).on('click', '#scroll-to-top', function (event) {
			event.preventDefault();

			self.lockUpdate = false;

			$$('#main').scrollTop(0);
			$$('#update-warn').slideUp(200 * self.speedMultiplier);
		}).on('mousedown', '#resize-handler', function (event) {
			self.doResize = parseInt(Popover.object().height);
			self.resizeStartPosition = event.pageY;
		}).on('mouseup dblclick', '#resize-handler', function (event) {
			self.doResize = false;

			if (event.type === 'mouseup') return;

			Settings.removeItem('popoverHeight');
			Settings.removeItem('popoverSimpleHeight');

			self.temporaryExpertMode = self.temporaryExpertMode;
		}).on('click', '#unlock', function (event) {
			var off = self.utils.position_poppy(this, 1, 17),
					pop = self.poppies.verify_donation.call([off.left, off.top, event.isTrigger], self);
			
			new Poppy(off.left, off.top, pop);
		}).on('click', '#js-help', function () {
			self.utils.open_url(ExtensionURL('help/index.html'));
		}).on('click', '#js-settings', function () {
			Popover.hide();
			self.utils.open_url(ExtensionURL('settings.html'));
		}).on('click', '.toggle-main', function (event) {
			var pos = this.className.substr(0, this.className.indexOf(' ')),
					me = $$('.' + pos), head = me.parent(),
					e = me.parent().next().find('.main-wrapper').show();

			if (!e.length) e = me.parent().next().next().find('.main-wrapper');
			
			var o = e.outerHeight(), oT = e.outerHeight(true), a = e.css('opacity') === '1';
						
			if (e.is(':animated')) return false;
					
			me.text(a ? _('Show') : _('Hide'));
													
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
		}).on('dblclick', '.host-section:first-child .host-section-host .label', function () {
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
			
			new Poppy($(self.popover.body).width() / 2, 1, [
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
				t.focus();
				t.scrollTop = 0
			});
		}).on('dblclick', '#jsblocker-name', function () {
			var off = self.utils.position_poppy(this, 9, 14);

			new Poppy(off.left, off.top, [
				'<ul class="jsoutput"></ul>',
				'<div class="inputs">',
					'<input id="clear-rule-actions" value="Clear Actions Cache" type="button" /> ',
					'<input id="run-cleanup" value="Run Cleanup" type="button" /> ',
					'<input id="dump-cache-size" value="Cache Size" type="button" /> ',
					'<input id="clear-console" value="Clear" type="button" />',
				'</div>'
			].join(''), function () {
				var l = $$('#jsconsolelogger'), ol = $$('.jsoutput:first').html(l.hide().html());
				
				l.find('.unread').removeClass('unread');
				
				$$('.console-unread').html(' 0').hide();
				
				$$('.poppy-content:first').scrollTop(9999999999999);
				
				$$('#clear-console').click(function () {
					$('li:not(#console-header)', l).remove();
					$$('#jsblocker-name').trigger('dblclick');
				}).siblings('#dump-cache-size').click(function () {
					var c = JSON.stringify(JB.caches).length, b = JSON.stringify(JB.rules.cache).length;

					_d('General cache size:', JB.utils.bsize(c));
					_d('Rule cache size:', JB.utils.bsize(b))

					$$('#jsblocker-name').dblclick();
				}).siblings('#run-cleanup').click(function () {
					JB._cleanup();
				}).siblings('#clear-rule-actions').click(function () {
					JB.caches.rule_actions = JB.rules.data_types;
				});
			});
		}).on('click', '.show-scripts', function () {
			if (Settings.getItem('temporaryExpertSwitch') && (self.donationVerified || self.trial_active()) && !$$('.some-list').length) {
				$$('.show-scripts').hide();

				self.temporaryExpertMode = true;

				self.utils.timer.timeout('switch_to_expert', function () {
					self.popover_current = null;
					self.lockUpdate = false;

					Tabs.messageActive('updatePopover');
				}, 10);

				return;
			}

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
				'<input class="purple" type="button" value="', _('Name'), '" id="name-snapshot" /> ',
				'<input class="purple" type="button" value="', _('Compare'), '" id="compare-snapshot" /> ',
				'<input class="purple" type="button" value="', _(snapshots[id].keep ? 'Unkeep' : 'Keep'), '" id="keep-snapshot" /> ',
				'<input class="delete" type="button" value="', _('Delete'), '" id="delete-snapshot" />',
			].join(''), function () {
				$$('#name-snapshot').click(function () {
					new Poppy(left, top, [
						'<input class="purple" type="text" id="snapshot-name" value="', self.rules.snapshots.name(id), '" placeholder="', _('Name'), '" /> ',
						'<input type="button" id="save-name" value="', _('Save'), '" class="onenter purple" />'
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
						'<input class="purple" type="button" value="', _('Only in Snapshot'), '" id="compare-left" data-type="left" /> ',
						'<input class="purple" type="button" value="', _('Only in My Rules'), '" id="compare-right" data-type="right" /> ',
						'<input class="purple" type="button" value="', _('In Both'), '" id="compare-both" data-type="both" />'
					].join(''), function () {
						$$('#poppy input').click(function () {
							$$('#rules-list').addClass('zoom-window-hidden')

							var compare = self.rules.snapshots.compare(id, self.rules.current_rules), dir = this.getAttribute('data-type'), mes,
									compare = $.extend(self.rules.data_types, compare[dir]),
									cache_id = self.rules.snapshots.add(compare, 1, 'Comparison Cache ' + self.utils.id());

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
					else
						self.rules.snapshots.unkeep(id);

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
		}).on('click', 'body > *:not(#poppy,#poppy-secondary,#modal)', function (event) {
			if (event.isTrigger) return;
			new Poppy();
		}).on('click', 'body > *:not(#poppy-secondary,#modal)', function (event) {
			if (event.isTrigger) return;
			new Poppy(null, null, null, null, null, null, false, true);
		}).on('click', '.allowed-blocked-columns .urls-wrapper h3', function (event) {
			var split = this.className.split('-'),
					allowed = split[0] === 'allowed',
					kind = split[1],
					me = $(this), off = me.offset(), left = event.pageX, top = off.top + 12,
					page_parts = self.utils.domain_parts($(this).parents('.host-section').attr('data-host'));

			if (self.rules.using_snapshot) return new Poppy(event.pageX, off.top + 12, _('Snapshot in use'));

			new Poppy(left, top, [
				'<p class="misc-info">', _((allowed ? 'Allowed' : 'Blocked') + ' ' + kind + 's'), '</p>',
				'<p>',
					'<input type="checkbox" id="excluding-list" checked /> ',
					'<label for="excluding-list">', _('Exclude ' + (allowed ? 'whitelist' : 'blacklist')), '</label>',
				'</p><p>',
					'<input id="domain-script-temporary" type="checkbox"', self.collapsed('LastRuleWasTemporary') ? ' checked' : '', ' />',
					'<label for="domain-script-temporary">&nbsp;', _('Make these temporary rules'), '</label>',
				'</p>',
				'<p>', Template.create('domain_picker', { page_parts: page_parts }), '</p>',
				'<div class="inputs">',
					'<input class="orange" id="hide-these" type="button" value="', _('Hide These'), '" /> ',
					'<input class="orange" id="allow-these" type="button" value="', _((allowed ? 'Block' : 'Allow') +' These'), '" />',
				'</div>',
			].join(''), function () {
				$$('#allow-these, #hide-these').click(function () {
					var temp = $$('#domain-script-temporary').is(':checked'),
							hide = this.id === 'hide-these',
							host = $$('#domain-picker').val(), disallow_predefined = $$('#excluding-list').is(':checked');

					me.parent().next().find('li:visible').each(function () {
						if (disallow_predefined && ($(this).is('.rule-type-5') || $(this).is('.rule-type-4'))) return;

						var data = $.data(this), proto = self.utils.active_protocol(data.script[0]).toUpperCase(),
								ind = data.script[0].indexOf('?'), rr = (~kind.indexOf('special')) ? data.script[0] : '^' + self.utils.escape_regexp(~ind ? data.script[0].substr(0, data.script[0].indexOf('?')) : data.script[0]) + '((\\?|#)+.*)?$',
								rule = (self.useSimpleMode() && !~kind.indexOf('special')) ? proto + ':' + (~['DATA', 'JAVASCRIPT'].indexOf(proto) ? '*' : data.url) : rr;

						self.rules.add((hide ? 'hide_' : '') + kind, host, rule, hide ? 42 : (allowed ? 0 : 1), false, temp);
					});

					Tabs.messageActive('reload');
				});
			});
		});
	},

	merger: function (jsblocker, here) {
		var new_jsblocker = { allowed: {}, blocked: {}, unblocked: {} }, kind, frame, ref, sref, hold, holder, held, l;

		for (kind in this.rules.data_types) {
			if (~kind.indexOf('hide_')) continue;

			new_jsblocker.allowed[kind] = { all: [], hosts: [] };
			new_jsblocker.blocked[kind] = { all: [], hosts: [] };
			new_jsblocker.unblocked[kind] = { all: [], hosts: [] };

			for (frame in jsblocker) {
				ref = jsblocker[frame];
				sref = here && (ref.host === here.host || ref.host === 'blank') ? here : new_jsblocker;

				if (sref !== here) {
					sref.href = jsblocker[frame].href;
					sref.host = jsblocker[frame].host;
				}

				$.merge(sref.allowed[kind].all, ref.allowed[kind].all);
				$.merge(sref.blocked[kind].all, ref.blocked[kind].all);
				$.merge(sref.unblocked[kind].all, ref.unblocked[kind].all);

				$.merge(sref.allowed[kind].hosts, ref.allowed[kind].hosts);
				$.merge(sref.blocked[kind].hosts, ref.blocked[kind].hosts);
				$.merge(sref.unblocked[kind].hosts, ref.unblocked[kind].hosts);

				sref.allowed[kind].hosts = sref.allowed[kind].hosts.unique();
				sref.blocked[kind].hosts = sref.blocked[kind].hosts.unique();
				sref.unblocked[kind].hosts = sref.unblocked[kind].hosts.unique();

				if (kind === 'special') {
					hold = { allowed: {}, blocked: {}, unblocked: {} };

					for (holder in hold) {
						for (l = 0; l < sref[holder][kind].all.length; l++)
							hold[holder][sref[holder][kind].all[l][0]] = sref[holder][kind].all[l][1];

						sref[holder][kind].all = [];

						for (held in hold[holder])
							sref[holder][kind].all.push([held, hold[holder][held]]);
					}					
				}
			}
		}

		return new_jsblocker;
	},
	
	make_list: function (text, button, jsblocker, host_host, id) {
		var is_main = !!jsblocker.host;

		if (!is_main)
			jsblocker = this.merger(jsblocker);

		var self = this, sections = $$('#host-sections'), section = $$('#host-section-' + id), disabled = this.rules.disabled(jsblocker.href);

		if (!section.length)
			section = $(Template.create('host_section', {
				id: id,
				is_main: is_main,
				type: text,
				href: jsblocker.href,
				host: jsblocker.host,
				host_host: host_host,
				disabled: disabled
			})).appendTo(sections);

		if (disabled) return;
		
		var el = $('.' + text + '-script-urls .urls-inner', section).empty(), use_url, test_url, protocol, poopy,
				shost_list = {}, lab = $('.' + text + '-scripts-count', section), cn = 0, key;

		for (key in this.rules.data_types)
			shost_list[key] = {};
			
		function append_url(index, kind, ul, use_url, script, type, button, protocol, unblockable) {
			if (~use_url.indexOf('customp') && kind === 'special') use_url = 'Injected Script: ' + use_url;

			return ul.append('<li>' + (text !== 'unblocked' ? '<div class="info-link">?</div>' : '') + '<span></span> <small></small><div class="divider"></div></li>')
					.find('li:last').attr('id', text.toLowerCase() + '-' + kind + '-' + index + '-' + id)
					.data({
						url: use_url,
						script: [script],
						kind: kind,
						protocol: protocol,
						unblockable: unblockable
					}).addClass('visible kind-' + kind).toggleClass('selectable', Settings.getItem('traverseMainItems'))
					.toggleClass('by-rule', typeof type !== 'string' && type > -1)
					.toggleClass('rule-type-' + type, type > -1)
					.toggleClass('unblockable', kind !== 'special' && unblockable && text !== 'unblocked')
					.find('span').text(use_url).addClass(protocol)
					.attr('title', self.simpleMode && protocol && !self.temporaryExpertMode ? (_(protocol) + ' (' + protocol + ')') : '').parent();
		}
		
		function add_item(index, kind, the_item) {
			var item = the_item[0], protocol = null;

			if (text === 'unblocked') {
				the_item = [the_item, the_item, the_item];
				item = the_item[0];
			} else
				protocol = self.utils.active_protocol(item);

			if (text !== 'unblocked' && self.useSimpleMode()) {
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
						return self.make_list(text, button, jsblocker, host_host, id);
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
					li, ccheck, show_me = $('<div />'),
					ul = $(Template.create('main_wrapper', {
						local: ki,
						which: text,
						kind: key
					})).appendTo(el).filter('div').find('ul');
			
			ul.css('display', do_hide ? 'none' : 'block')
				.parent().prev().toggleClass('collapsed', do_hide).toggleClass('visible', !do_hide).find('.toggle-main').html(_(do_hide ? 'Show' : 'Hide'));;

			if (self.useSimpleMode() && text !== 'unblocked') {
				cn += jsblocker[text][key].hosts.length;
					
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

					if (key === 'special' && !this.special_enabled(jitem[0])) continue;
					
					li = ~key.indexOf('special') ? append_url(i, key, ul, _(jitem[0]), jitem[0], jitem[1], button, key.toUpperCase()) :
							add_item(i, key, jitem);

					if (text !== 'unblocked' && !~key.indexOf('hide_')) {
						var al = self.rules.allowed(['hide_' + key, jsblocker.href, jitem[0], false]);

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
		
			if (self.useSimpleMode()) {
				ul.addClass('show-per-host');
				
				for (var kind in shost_list)
					for (poopy in shost_list[kind])
						for (use_url in shost_list[kind][poopy]) {
							$('#' + shost_list[kind][poopy][use_url][1], ul).find('small')
									.html('<a href="javascript:void(0);" class="show-scripts">' + shost_list[kind][poopy][use_url][0] + '</a>');
						}				
			}
				
			if (self.collapsed(text)) {
				$$('.' + text + '-label,' + '.' + text + '-column').addClass('hidden');
				$$('.' + text + '-script-urls .urls-inner').hide();
				$('.kind-header', ul).removeClass('visible');				
			}
		}
	},
	lockUpdate: false,
	popover_current: null,
	do_update_popover: function (event) {
		if (event.message.href === 'reading-list://') return console.log('Reading list ignored.');

		var cached_jsblocker = JSON.stringify(this.caches.jsblocker[event.message.href]), 
				jshost = this.utils.active_host(event.message.href), badge_only = !Popover.visible();

		this.utils.timer.remove('timeout', 'deactivate_toolbar');

		if (!this.trial_active() && !this.donationVerified && !badge_only && this.trialStart > -1)
			return this.utils.timer.timeout('trial_expired', function (self) {
				new Poppy($(self.popover.body).width() / 2, 0, [
					'<p class="misc-info">', _('JavaScript Blocker'), '</p>',
					'<p>', _('Free trial expired', ['JavaScript Blocker']), '</p>',
					'<p><input type="button" id="click-understood" value="', _('Understood'), '" /></p>'
				].join(''), function () {
					$$('#click-understood').click(function () {
						self.trialStart = -1;

						$$('#unlock').click();
					});
				}, null, null, true);
			}, 1000, [this]);
		
		if (!this.methodAllowed || this.disabled) return false;

		if (this.lockUpdate && $$('#main').scrollTop() <= 10) this.lockUpdate = false;

		if (($$('.poppy').length || $$('.some-list').length || $$('li.pending:not(.allow-update)').length || (this.lockUpdate && this.popover_current)) && Popover.visible()) {
			if (this.lockUpdate && !$$('li.pending').length) $$('#update-warn').slideDown(200 * this.speedMultiplier);

			return this.utils.timer.timeout('do_update_popover', function (self, event) {
				self.do_update_popover(event);
			}, 1000, [this, event]);
		}

		$$('#update-warn, #quick-add-info').slideUp(200 * this.speedMultiplier);
		
		this.busy = 1;

		if ((this.tab.url === event.target.url && this.tab.url === event.message.href) || badge_only) {
			var jsblocker = event.message;

			if (cached_jsblocker === JSON.stringify(jsblocker) && this.popover_current === cached_jsblocker && !badge_only) {
				delete this.frames[jsblocker.href];

				this.busy = 0;

				return;
			}

			if (badge_only && this.temporaryExpertMode) this.temporaryExpertMode = false;

			if (!badge_only) this.popover_current = cached_jsblocker || JSON.stringify(jsblocker);

			var frame,
					frame_count = { blocked: 0, allowed: 0 },
					frame_items = { blocked: 0, allowed: 0 },
					count = { blocked: 0, allowed: 0, unblocked: 0 }, self = this, toolbarItem = null,
					main_items = { blocked: 0, allowed: 0 };
					
			this.caches.jsblocker[event.message.href] = jsblocker;
								
			for (var act in jsblocker) {
				if (act === 'href') continue;
				for (var kind in jsblocker[act])
					if (kind !== 'special' && this.enabled(kind))
						count[act] += jsblocker[act][kind].all.length;
			}

			if (this.useSimpleMode()) {
				for (var key in jsblocker.blocked) {
					if (key === 'special' || !this.enabled(key)) continue;
					
					main_items.blocked += jsblocker.blocked[key].hosts.length;
					main_items.allowed += jsblocker.allowed[key].hosts.length;
				}
			}

			if (!badge_only)
				$$('#host-sections').empty();

			if (jsblocker.href in this.frames) {
				var frame_host, frame, inline, frame, rel = this.frames[jsblocker.href], merged, d;

				for (frame_host in rel) {
					frame = this.merger(rel[frame_host]);
						
					var this_one = { blocked: 0, allowed: 0 };

					for (var act in frame) {
						if (act === 'href') continue;
						for (var kind in frame[act])
							if (kind !== 'special' && this.enabled(kind)) {
								frame_count[act] += frame[act][kind].all.length;

								if (!this.simpleMode || self.temporaryExpertMode)
									this_one[act] += frame[act][kind].all.length
							}
					}

					for (var key in frame.blocked) {
						if (key === 'special' || !this.enabled(key)) continue;

						frame_items.blocked += frame.blocked[key].hosts.length;
						frame_items.allowed += frame.allowed[key].hosts.length;

						if (this.useSimpleMode()) {
							this_one.blocked += frame.blocked[key].hosts.length;
							this_one.allowed += frame.allowed[key].hosts.length;
						}
					}
				}
			}
			
			var toolbarDisplay = Settings.getItem('toolbarDisplay');

			ToolbarItems.image(this.disabled ? 'images/toolbar-disabled.png' : 'images/toolbar.png');
			
			if (!self.simpleMode || self.temporaryExpertMode)
				ToolbarItems.badge(Settings.getItem('toolbarDisplay') === 'allowed' ?
						count.allowed + frame_count.allowed :
						(Settings.getItem('toolbarDisplay') === 'blocked' ? count.blocked + frame_count.blocked : 0), event.target);
			else {															
				ToolbarItems.badge(Settings.getItem('toolbarDisplay') === 'allowed' ?
						main_items.allowed + frame_items.allowed :
						(Settings.getItem('toolbarDisplay') === 'blocked' ? main_items.blocked + frame_items.blocked : 0), event.target);
			}

			if (!badge_only) {
				$$('#main:visible').scrollTop(0);
				$$('.some-helper').remove();
				$$('.column .info-container').show();
				$$('#toggle-hidden').addClass('disabled').removeClass('hidden-visible');
				$$('.column:not(.column-collapsed) .block-domain, .column:not(.column-collapsed) .allow-domain').show();

				var id = this.utils.id();

				if (this.frames[jsblocker.href] && (jsblocker.host in this.frames[jsblocker.href]))
					this.merger(this.frames[jsblocker.href][jsblocker.host], jsblocker);

				this.make_list('blocked', _('Allow'), jsblocker, null, id);
				this.make_list('allowed', _('Block'), jsblocker, null, id);
				
				if (Settings.getItem('showUnblocked'))
					this.make_list('unblocked', _('View'), jsblocker, null, id);

				if (this.frames[jsblocker.href]) {
					for (var host in this.frames[jsblocker.href]) {
						if (host === jsblocker.host || host === 'blank') continue;

						id = this.utils.id();

						this.make_list('blocked', _('Allow'), this.frames[jsblocker.href][host], jsblocker.host, id);
						this.make_list('allowed', _('Block'), this.frames[jsblocker.href][host], jsblocker.host, id);
						
						if (Settings.getItem('showUnblocked'))
							this.make_list('unblocked', _('View'), this.frames[jsblocker.href][host], jsblocker.host, id);
					}
				}

				this.adjust_columns(1);
			}
		}
		
		this.busy = 0;
	},
	setting_changed: function (event) {
		if (event.key === 'simpleMode') {
			this.utils.zero_timeout(function (rules) {
				rules.snapshots = new Snapshots(rules.which, Settings.getItem('enableSnapshots') && this.donationVerified ? Settings.getItem('snapshotsLimit') : 0);
			}, [this.rules]);

			this.rules.use_snapshot(0);
			this.rules.use_tracker.load();
		}

		if (event.key === 'openSettings' && event.newValue) {
			Settings.setItem('openSettings', false);
			this.utils.open_url(ExtensionURL('settings.html'));
		} else if (event.key === 'language')
			this.reload = true;
		else if (event.key === 'simpleMode' && !event.newValue && !this.donationVerified)
			Settings.setItem('simpleMode', true);
		else if (event.key === 'blockReferrer' && event.newValue && !this.donationVerified)
			Settings.setItem('blockReferrer', false);
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

				if (!Settings.getItem('focusNewTab')) event.target.activate();
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
							event.message = this.disabled || this.rules.disabled(event.message[1]);
						break theSwitch;

						case 'customScripts':
							event.message = { pre: this.customScripts.pre(), post: this.customScripts.post() };
						break theSwitch;

						case 'enabledSpecials':
							var specials = event.message[1], result = {}, enabled;

							for (var i = 0; i < specials.length; i++) {
								enabled = this.rules.special_enabled(specials[i]);

								result[specials[i]] = {
									value: enabled,
									allowed: enabled ? this.rules.special_allowed(specials[i], event.message[2]) : -2
								}
							}

							if (Settings.getItem('enableajax'))
								result.ajax_intercept = { exclude: 1, value: Settings.getItem('alwaysBlockajax') === 'ask' ? 1 : 2, allowed: 0 };

							event.message = result;
						break theSwitch;
					}
				
				if (this.disabled || (event.message[0] !== 'script' && !this.donationVerified)) {
					event.message = [1, -84];
					break theSwitch;
				} else if (this.installedBundle < this.update_attention_required || !this.methodAllowed) {
					if (this.installedBundle < this.update_attention_required) {
						setTimeout(function () {
							ToolbarItems.showPopover();
						}, 50);

						Tabs.messageActive('notification', [
							_('Please click the flashing toolbar icon to continue'),
							'JavaScript Blocker Update'
						]);
					}
					event.message = this.enabled(event.message[0]) ? [0, -84] : [1, -84];
					break theSwitch;
				}

				event.message = this.rules.allowed(event.message);
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
				var dl = ['donationVerified', 'trialStart', 'installID', 'installedBundle', 'enablespecial', 'enabledisable', 'setupDone'],
						swith = Settings.getItem('simpleMode');
				
				if (event.message[1] === null) {
					if (!~dl.indexOf(event.message[0]))
						SettingStore.removeItem(event.message[0]);
				} else if (event.message[0] === 'Rules') {
					Settings.setItem('simpleMode', false);
					this.rules.import(event.message[1]);
					Settings.setItem('simpleMode', swith);
				} else if (event.message[0] === 'SimpleRules') {
					Settings.setItem('simpleMode', true);
					this.rules.import(event.message[1]);
					Settings.setItem('simpleMode', swith);
				} else if (!~dl.indexOf(event.message[0]))
					Settings.setItem(event.message[0], event.message[1]);
			break;

			case 'resetSettings':
				var all = SettingStore.all();

				for (var key in all)
					if (!~['donationVerified', 'trialStart', 'installID', 'installedBundle', 'setupDone'].indexOf(key))
						SettingStore.removeItem(key);

				SettingStore.setItem('openSettings', false);
			break;

			case 'updateEasyLists':
				Settings.setItem('EasyListLastUpdate', 0);

				JB.rules.easylist(function () {
					Tabs.messageActive('easyListsUpdated');
				});
			break;

			case 'updatePopover':
				delete this.frames[event.target.url];
				MessageTarget(event, 'getFrameData');

				this.utils.timer.timeout('update_popover', function (event) {
					JB.do_update_popover(event);
				}, 120, [event]);
			break;

			case 'updateReady':
				if (event.target != this.tab) break;
					
				this.utils.timer.remove('timeout', 'update_failure');
			break;
			
			case 'addFrameData':
				var host = event.message[1].host;

				if (host === 'blank') host = this.utils.active_host(event.target.url);

				if (!(event.target.url in this.frames) || this.frames[event.target.url] === undefined)
					this.frames[event.target.url] = {};

				if (!(host in this.frames[event.target.url]))
					this.frames[event.target.url][host] = {}

				this.frames[event.target.url][host][event.message[1].href] = event.message[1];
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
				this.reload = true;
			break;

			case 'createCustomScript':
				this.customScripts.add(event.message[0], event.message[1], event.message[2], event.message[3]);
			break;

			case 'editCustomScript':
				this.customScripts.add(event.message[0], event.message[1], event.message[2], event.message[3], true);
			break;

			case 'removeCustomScript':
				this.customScripts.remove(event.message[0], event.message[1]);
			break;

			case 'notification':
				MessageTarget(event, 'notification', [event.message[0], event.message[1]]);
			break;

			case 'openPopover':
				ToolbarItems.showPopover();
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
			if (this.reload) {
				this.reload = false;

				Popover.window().location.reload();

				return this.open_popover(event);
			}

			this.popover_current = null;
			this.temporaryExpertMode = false;

			$$('#find-bar-done:visible').click();

			this.utils.zero_timeout(function () {
				new Poppy();
				new Poppy(true);

				self.utils.timer.timeout('start_updater', function () {
					self.updater();
				}, 100);
			});
		} else if (!event || (event && ('type' in event) && ~['beforeNavigate', 'close'].indexOf(event.type))) {
			if (event.type === 'close')
				delete this.frames[event.target.url];

			if (event.type === 'close')
				delete this.caches.jsblocker[event.target.url];

			if (event.type === 'beforeNavigate') {
				this.set_active_tab();
				this.handle_navigate(event);
			}
			
			setTimeout(function (self, event) {
				delete self.anonymous.newTab[event.target.url];
			}, 100, this, event);
			
			try {
				if (event.target === this.tab && event.type === 'beforeNavigate') {
					new Poppy();
					new Poppy(true);

					ToolbarItems.badge(0, event.target);
				}
			} catch (e) {}
		}

		try {
			if (event.type === 'popover') {
				this.speedMultiplier = this.useAnimations ? 1 : 0.001;

				this.clear_ui();

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
							ToolbarItems.badge(0, event.target);

							setTimeout(function (self, url) {
								var message;

								if (url === 'https://extensions.apple.com/')
									message = ['<p>', _('Safari extensions website'), '</p>'];
								else
									message = ['<p>', _('Update Failure'), '</p>'];

								if (url in self.caches.jsblocker) {
									new Poppy($(self.popover.body).width() / 2, 0, message.join(''));
									self.do_update_popover({ message: self.caches.jsblocker[url], target: { url: url } });
								} else {
									self.clear_ui();
									$$('#host-sections').html('<div style="padding:0 15px;">' + message.join('') + '</div>').hide().fadeIn(200 * self.speedMultiplier);
								}
							}, 500, self, url);
						}, 500);

						Tabs.messageActive('updatePopover');
					}
				}
			}
		} catch(e) { }
	},
	set_active_tab: function (callback) {
		var self = this;

		Tabs.active(function (tab) {
			if (self.tab !== tab[0])
				self.tab = tab.length ? tab[0] : {};

			if (typeof callback === 'function')
				callback.call(self, self.tab);
		});
	},
	validate: function (event) {
		if (!BrowserWindows.active() || (event && event.command && event.command !== 'jsBlockerMenu')) return;

		var self = this;

		this.utils.once('load', function () {
			if (!Settings.getItem('persistDisabled') && this.disabled) this.disabled = false;

			var cpre = this.customScripts.pre(), cpost = this.customScripts.post();

			for (var ipre in cpre)
				Strings['en-us'][ipre] = _('Injected pre Script: {1}', [cpre[ipre].name]);

			for (var ipost in cpost)
				Strings['en-us'][ipost] = _('Injected post Script: {1}', [cpost[ipost].name]);

			this.caches.rule_actions = this.rules.data_types;

			this.rules.use_tracker.load();
			this.rules.warm_caches();
			this.rules.snapshots = new Snapshots(this.rules.which, Settings.getItem('enableSnapshots') && this.donationVerified ? Settings.getItem('snapshotsLimit') : 0);

			if (!this.setupDone) {
				this.collapsed('allowed-script-urls-image', 1);

				this.rules.easylist();

				this.setupDone = 1;				
				this.installedBundle = self.bundleid;

				this.utils.open_url(ExtensionURL('settings.html#for-welcome'));

				if (this.trialStart === 0)
					this.trialStart = Date.now();

				if (Settings.getItem('enableSnapshots'))
					this.rules.snapshots.add(this.rules.rules);
			}
			
			if (this.rules.using_snapshot) this.rules.use_snapshot(this.rules.using_snapshot);

			this.rules.clear_temporary(1);

			this.utils.timer.interval('cleanup', this._cleanup.bind(this), 1000 * 60 * 5);

			if (!Settings.getItem('installID'))
					Settings.setItem('installID', this.utils.id() + '~' + this.displayv);

			var pop = Popover.window();

			if (pop.document && pop.document.body) {
				this.popover = pop.document;
				this.set_theme();

				this.utils.floater('#main', '.host-section-host', function (e) {
					return e.next();
				});

				$(this.popover.body)
					.toggleClass('simple', this.simpleMode)
					.toggleClass('highlight-matched', Settings.getItem('highlight'))
					.toggleClass('disabled', this.disabled);

				if (Settings.getItem('showUnblocked'))
					$$('.unblocked-script-urls').show().prev().show();
				else
					$$('.unblocked-script-urls').hide().prev().hide();
					
				var verc = Settings.getItem('donationVerified'),
						ver = (verc === 1 || verc === 777 || verc === true || (typeof verc === 'string' && verc.length));

				$$('#unlock').toggleClass('hidden', ver && verc !== 777).text(verc === 777 ? _('Contribute') : _('Unlock')).toggleClass('contribute', verc === 777);
				$$('#disable').toggleClass('divider', !ver || verc === 777).html(_((self.disabled ? 'Enable' : 'Disable') + ' JavaScript Blocker'));
				$$('#console-access').css('display', this.isBeta ? 'block' : 'none');

				$$('#main .actions-bar li:not(#jsblocker-name)').toggleClass('selectable', Settings.getItem('traverseMainActions'));
				$$('#rules-list .filter-bar:not(.actions-bar) li:not(.label,.li-text-filter)').toggleClass('selectable', Settings.getItem('traverseRulesFilter'));

				if (!Settings.getItem('filterBarAge')) $$('#filter-type-not-used').addClass('hidden').next().remove();
				if (!Settings.getItem('filterBarUsed')) $$('#filter-type-used').addClass('hidden').next().remove();

				var bar = $$('#rules-filter-bar').find('.divider:last').remove().end();

				if (bar.find('ul.hidden').length === 5) bar.hide();

				this.utils.zero_timeout(function () {
					self.updater();
				});
			} else
				this.utils.once_again('load');
		}, this);

		if (this.installedBundle < this.update_attention_required) this.utils.attention(1);
		if (this.disabled) ToolbarItems.image('images/toolbar-disabled.png');

		if (event && event.target) {
			BrowserWindows.all().forEach(function (browserWindow) {
				if (event.target.browserWindow === browserWindow) {
					if (!self.disabled) {
						event.target.disabled = !browserWindow.activeTab || !browserWindow.activeTab.page;
						
						if (event.target.disabled) {
							ToolbarItems.badge(0, browserWindow.activeTab);
							Popover.hide();
						}
					}

					if (!self.methodAllowed)
						ToolbarItems.badge(999, browserWindow.activeTab);
				}
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

JB.rules.blacklist = JB.rules.data_types;
JB.rules.whitelist = JB.rules.data_types;

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
Events.addApplicationListener('activate', function (event) {
	JB.set_active_tab(function (tab) {
		JB.popover_current = null;

		MessageTarget({ target: tab }, 'updatePopover');

		JB.utils.timer.timeout('deactivate_toolbar', function () {
			ToolbarItems.badge(0, JB.tab);
		}, 400);
	});
});
Events.addApplicationListener('navigate', function (event) {
	JB.set_active_tab(function (tab) {
		if (event.target === tab)
			MessageTarget(event, 'updatePopover');
	});
}, JB);
Events.addApplicationListener('beforeNavigate', JB.open_popover, JB);
Events.addApplicationListener('beforeNavigate', JB.anonymize, JB);
Events.addApplicationListener('popover', JB.open_popover, JB);
Events.addApplicationListener('validate', JB.validate, JB);
Events.addApplicationListener('message', JB.handle_message, JB);
Events.addSettingsListener(JB.setting_changed, JB);

Object.defineProperty(Array.prototype, 'unique', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function() {
		var a = this.concat();
		for(var i=0; i<a.length; ++i) {
			for(var j=i+1; j<a.length; ++j) {
				if(a[i] === a[j])
					a.splice(j--, 1);
			}
		}

	return a;
	}
});