/***************************************
 * @file js/global.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 * @version 1.2.7-1
 ***************************************/

"use strict";

var JavaScriptBlocker = {
	finding: false,
	reloaded: false,
	caches: {
		domain_parts: {},
		active_host: {},
		collapsed_domains: null
	},
	commandKey: false,
	speedMultiplier: 1,
	disabled: false,
	noDeleteWarning: false,
	frames: {},
	
	load_language: function (css) {
		function set_popover_css (self, load_language, f) {
			if (self.popover && $('#lang-css-' + load_language, self.popover).length === 0) {
				$('<link />').appendTo(self.popover.head).attr({
						href: 'i18n/' + load_language + '.css',
						type: 'text/css',
						rel: 'stylesheet',
						id: 'lang-css-' + load_language,
				}).addClass('language-css');
			} else
				self.utils.zero_timeout(f, [self, load_language, f]);
		}
		
		var load_language = (safari.extension.settings.language !== 'Automatic') ? safari.extension.settings.language : window.navigator.language;
	
		if (css)
			this.utils.zero_timeout(set_popover_css, [this, load_language, set_popover_css]);
		else if (load_language !== 'en-us' && !(load_language in Strings))
			$.getScript('i18n/' + load_language + '.js', function (data, status) { });
	},
	
	/**
	 * Removes frames that no longer exist.
	 * Removes any empty rules.
	 * Removes any collapsed domains that no longer exist.
	 *
	 * @this {JavaScriptBlocker}
	 */
	_cleanup: function () {
		Behaviour.action('Clean up code started');
		
		var i, b, j, c, key, e, new_collapsed = [], new_frames = {}, removed_frames = 0, timed = Behaviour.timer('Clean up');
		for (i = 0, b = safari.application.browserWindows.length; i < b; i++) {
			for (j = 0, c = safari.application.browserWindows[i].tabs.length; j < c; j++) {
				if (this.frames[safari.application.browserWindows[i].tabs[j].url])
					new_frames[safari.application.browserWindows[i].tabs[j].url] = this.frames[safari.application.browserWindows[i].tabs[j].url];
				else
					removed_frames++;
			}
		}
		
		Behaviour.log('Number of frames cleaned up:', removed_frames);
	
		this.frames = new_frames;
		this.caches.active_host = {};
		this.caches.domain_parts = {};
		
		function clean_empty_ruleset (key) {
			if (window.localStorage[key] === '{}') {
				Behaviour.action('Empty rule deleted');
				window.localStorage.removeItem(key);
			}
		}
	
		for (key in window.localStorage) {
			if (window.localStorage.hasOwnProperty(key)) {
				this.utils.zero_timeout(clean_empty_ruleset, [key]);
			}
		}
		
		if (typeof this.collapsedDomains === 'object') {
			for (var x = 0; x < this.collapsedDomains.length; x++) {
				if (this.collapsedDomains[x] === _('All Domains') || (this.collapsedDomains[x] in window.localStorage))
					new_collapsed.push(this.collapsedDomains[x]);
				else
					Behaviour.action('A collapsed domain was removed');
			}
		}
		
		this.collapsedDomains = new_collapsed;
		
		Behaviour.timerEnd(timed);
	},
	_d: function () {
		console.log.apply(console, arguments);
	},
	get allowMode() {
		return safari.extension.settings.allowMode;
	},
	set allowMode(value) {
		safari.extension.settings.allowMode = value;
	},
	get setupDone() {
		return parseInt(safari.extension.settings.setupDone, 10);
	},
	set setupDone(value) {
		safari.extension.settings.setupDone = value;
	},
	get collapsedDomains() {
		if (this.caches.collapsed_domains) return this.caches.collapsed_domains;
		
		var t = window.localStorage.getItem('CollapsedDomains');
		
		return t === null ? (this.caches.collapsed_domains = []) : (this.caches.collapsed_domains = JSON.parse(t));
	},
	set collapsedDomains(value) {
		this.caches.collapsed_domains = value;
		window.localStorage.setItem('CollapsedDomains', JSON.stringify(value));
	},
	get busy() {
		return $('body', this.popover).hasClass('busy');
	},
	set busy(value) {
		$('body', this.popover).toggleClass('busy', value === 1);
	},
	animate_badge: function(start) {
		if (start === false) return this.utils.timer.remove('interval', 'badge_animation');
		var the_i = 0;
		this.utils.timer.interval('badge_animation', function() {
			safari.extension.toolbarItems[0].badge = 0;
			the_i += 1;
			safari.extension.toolbarItems[0].image = safari.extension.baseURI + 'images/toolbar-animated-' + (the_i) + '.png';
			if (the_i === 4) the_i = 0;
		}, 150);
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
		sleep: function (ms) {
			var a = +new Date() + ms, b;
			while (+new Date() < a)
				b = 1;
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

			if (e.className.indexOf('confirm-click') === -1) {
				$e.data('confirm_timeout', setTimeout(function () {
					$e.removeClass('confirm-click');
				}, 3000));

				e.className += ' confirm-click';

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
			
			if (!hide) hide = $('<div />');
			if (!cb) cb = $.noop;
			
			start_value = e.hasClass('zoom-window') ? 1 : 0.3;
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
				
				setTimeout(function () {
					e.data('isAnimating', false);
					if (start_value !== 1){
						hide.hide().css('zIndex', 0);
						e.addClass('zoom-window-open');
					} else {
						e.hide().removeClass('zoom-window zoom-window-open');
						hide.css('zIndex', 999);
						cb.call(JavaScriptBlocker);
					}
				}, t * 1000);
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

				if (args[1] == null) {
					for (name in this.timers[type]) {
						if (!this.timers[type][name]) continue;

						if (args[0] == 'timeout')
							clearTimeout(this.timers[type][name].timer);
						else if (args[0] == 'interval')
							clearInterval(this.timers[type][name].timer);

						delete this.timers[type][name];
						delete this.timers[type][name + '_auto_delete'];
					}

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
		}
	},
	_active_host_cache: {},
	
	/**
	 * Retrieves the hostname of the currently active tab or of the passed in url.
	 *
	 * @param {string}(optional) url An optional url to retrieve a hostname from.
	 * @return {string} The hostname of a url, either from the passed in argument or active tab.
	 */
	active_host: function (url) {
		if (url && (url in this.caches.active_host)) return this.caches.active_host[url];
		var r = /^(https?|file):\/\/([^\/]+)\//;
		if (url) return /^data/.test(url) ? (this.caches.active_host[url] = 'DataURI') : (this.caches.active_host[url] = url.match(r)[2]);

		try {
			return (this.caches.active_host[url] = safari.application.activeBrowserWindow.activeTab.url.match(r)[2]);
		} catch(e) {
			return 'ERROR';
		}
	},
	
	/**
	 * Separates a hostname into its subdomain parts.
	 *
	 * @param {string} domain The hostname to separate into pieces.
	 * @return {Array} Parts of the hostname, including itself and * (All Domains)
	 */
	domain_parts: function (domain) {
		if (domain in this.caches.domain_parts) return this.caches.domain_parts[domain];
		var s = domain.split(/\./g).reverse(), t = s[0], p = ['*'], i, b;
		for (i = 1, b = s.length; i < b; i++)
			p.push(t = (s[i] + '.' + t));
		this.caches.domain_parts[domain] = p.reverse();
		return this.caches.domain_parts[domain];
	},
	rules: {
		cache: {},
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

			for (i = 0, b = parts.length; i < b; i++) {
				c = (i > 0 ? '.' : '') + parts[i];
				r = window.localStorage.getItem(c);
				if (r == null) continue;
				if (c === '.*') {
					if (!(c in this.cache)) this.cache[c] = { '.*': this.utils.parse_JSON(r) };
					o[c] = this.cache[c][c];
					continue;
				} 
				
				o[c] = this.utils.parse_JSON(r);
			}
	
			this.cache[domain] = o;

			return this.for_domain(domain, one);
		},
		add: function (domain, pattern, action, add_to_beginning) {
			if (pattern.length === 0) return this.remove(domain, pattern, true);
			
			var current_rules = this.for_domain(domain, true);
			
			action = parseInt(action, 10);
					
			if (!add_to_beginning) {
				if (!(domain in current_rules)) current_rules[domain] = {};
				else if (pattern in current_rules[domain] && current_rules[domain][pattern] === action) return false;
			}
			
			if (add_to_beginning) {
				var new_rules = {}, e;
				new_rules[domain] = {};
				new_rules[domain][pattern] = action;
				
				if (domain in current_rules)
					for (e in current_rules[domain])
						new_rules[domain][e] = current_rules[domain][e];
				
				current_rules = new_rules;
			} else
				current_rules[domain][pattern] = action;
			
			delete this.cache[domain];

			return window.localStorage.setItem(domain, JSON.stringify(current_rules[domain]));
		},
		remove: function (domain, rule, delete_automatic) {
			var current_rules = this.for_domain(domain), key;
			if (!(domain in current_rules)) return false;
			
			delete this.cache[domain];

			try {
				if (!delete_automatic && current_rules[domain][rule] > 1 && current_rules[domain][rule] < 4)
					current_rules[domain][rule] *= -1;
				else
					delete current_rules[domain][rule];
			} catch(e) { }

			return $.isEmptyObject(current_rules[domain]) ?
					window.localStorage.removeItem(domain) : window.localStorage.setItem(domain, JSON.stringify(current_rules[domain]));
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
		remove_matching_URL: function (domain, url, confirmed, block_allow, allow_disabled) {
			var current_rules = this.for_domain(domain), to_delete = {}, sub, rule;

			for (sub in current_rules) {
				to_delete[sub] = [];

				for (rule in current_rules[sub]) {
					if (!!(current_rules[sub][rule] % 2) !== block_allow || (!allow_disabled && current_rules[sub][rule] < 0)) continue;
									
					if ((new RegExp(rule)).test(url)) {
						if (confirmed) {
							delete this.cache[sub];
							
							if (current_rules[sub][rule] > 1 && current_rules[sub][rule] < 4) {
								current_rules[sub][rule] *= -1;
							} else
								delete current_rules[sub][rule];
						} else to_delete[sub].push([rule, current_rules[sub][rule]]);
					}
				}

				if (!confirmed) {
					if (!to_delete[sub].length) delete to_delete[sub];
				} else
			 		window.localStorage.setItem(sub, JSON.stringify(current_rules[sub]));
			}

			return confirmed ? 1 : to_delete;
		},
		remove_domain: function (domain) {
			delete this.cache[domain];
			return window.localStorage.removeItem(domain);
		},
		
		/**
		 * Creates a <ul> displaying rules with actions to affect them.
		 *
		 * @param {string} domain Domain to display rules for
		 * @param {string|Boolean} url A url the rule must match in order to be displayed
		 * @param {Boolean} no_dbl_click Wether or not to enable double clicking on a rule
		 */
		view: function (domain, url, no_dbl_click) {
			var self = this, allowed = this.for_domain(domain, true), ul = $('<ul class="rules-wrapper"></ul>'), newul, rules, rule;			
						
			if (domain in allowed) {
				allowed = allowed[domain];

				if (!$.isEmptyObject(allowed)) {
					var j = this.collapsedDomains,
							domain_name = (domain.charAt(0) === '.' && domain !== '.*' ? domain : (domain === '.*' ? _('All Domains') : domain));
					
					newul = ul.append('<li class="domain-name"><span>' + domain_name + '</span></li><li><ul></ul></li>')
							.find('.domain-name:last').data('domain', domain).end().find('li:last ul');
					rules = 0;
					
					for (rule in allowed) {
						if ((url && (allowed[rule] < 0 || !(new RegExp(rule)).test(url))) ||
								(safari.extension.settings.ignoreBlacklist && allowed[rule] === 4) ||
								(safari.extension.settings.ignoreWhitelist && allowed[rule] === 5) ||
								(!!(allowed[rule] % 2) === this.allowMode && allowed[rule] < 4)) continue;
						rules++;
						newul.append([
								'<li>',
									'<span class="rule type-', allowed[rule], '">', rule, '</span> ',
											'<input type="button" value="', (allowed[rule] < 0 ?
													_('Restore') : (allowed[rule] === 2 || allowed[rule] === 3 ? _('Disable') : _('Delete'))) + '" />',
									'<div class="divider"></div>',
								'</li>'].join(''))
								.find('li:last').data('rule', rule).data('domain', domain).data('type', allowed[rule]);
					}
					
					$('.divider:last', newul).css('visibility', 'hidden');
					
					if (rules === 0) return $('<ul class="rules-wrapper"></ul>');
					
					if (j && j.indexOf(domain_name) > -1)
						newul.parent().prev().addClass('hidden');
				}
				
				$('.domain-name', ul).click(function () {
					if (this.className.indexOf('no-disclosure') > -1) return false;
					
					Behaviour.action('Expanding or collapsing a domain');
				
					var d = $('span', this).html(), t = $(this).next();
				
					if (t.is(':animated')) return false;
				
					var dex = self.collapsedDomains.indexOf(d), height, sTop, rulesList;
					
					rulesList = $('#rules-list', self.popover);
					
					sTop = rulesList.scrollTop();
							
					if (!$(this).toggleClass('hidden').hasClass('hidden')) {
						if (dex > -1) self.collapsedDomains.splice(dex, 1);
					} else {
						if (dex === -1) self.collapsedDomains.push(d);
					}
					
					t.toggle();
					
					height = t.height();
					
					t.slideToggle(300 * self.speedMultiplier, function () {
						this.style.display = null;
					});
					
					rulesList.scrollTop(sTop);
					
					if (this.className.indexOf('hidden') === -1) {
						var offset = t.offset(),
							bottomView = offset.top + height - $('header', self.popover).height();
						
						if (bottomView > rulesList.height())
							rulesList.animate({
								scrollTop: rulesList.scrollTop() + bottomView - rulesList.height(),
							}, 300 * self.speedMultiplier);
					}
				});

				var sss = $('li input', ul).click(function () {
					if (!self.utils.confirm_click(this)) return false;
			
					var $this = $(this), li = $this.parent(), parent = li.parent(), span = $('span.rule', li),
							is_automatic = $('span.rule.type-2, span.rule.type-3', li).length;
					
					if (this.value === _('Restore')) {
						Behaviour.action('Restoring a rule');
						
						self.remove(li.data('domain'), li.data('rule'));
						self.add(li.data('domain'), li.data('rule'), li.data('type') * -1);
						this.value = _('Disable');
						span.addClass(span[0].className.substr(span[0].className.indexOf('type')).replace('--', '-')).removeClass('type--2 type--3');
					} else {
						Behaviour.action('Deleting a rule: rules list');
						
						self.remove(li.data('domain'), li.data('rule'));
						
						if (is_automatic) {
							this.value = _('Restore');
							span.addClass(span[0].className.substr(span[0].className.indexOf('type')).replace('-', '--')).removeClass('type-2 type-3');
						} else {
							li.remove();
				
							$('.divider:last', parent).css('visibility', 'hidden');

							if ($('li', parent).length === 0) {
								parent.parent().prev().remove();
								parent.parent().remove();
							}
						}
					}
					
					$('#domain-filter', self.popover).trigger('search');
				}).siblings('span');
				
				if (!no_dbl_click)
					sss.dblclick(function (e) {
						Behaviour.action('Double clicked a rule');
					
						var t = $(this), off = t.offset(), domain = t.parent().data('domain'), rule = t.parent().data('rule');
					
						new Poppy(e.pageX, off.top - 2, [t.hasClass('type-4') || t.hasClass('type-5') ?
								_('Predefined rules cannot be edited.') :
								'<input type="button" value="' + _('Edit Rule') + '" id="rule-edit" /> ',
								'<button id="rule-new">' + _('New Rule') + '</button>'].join(''), function () {
							$('#poppy #rule-edit, #poppy #rule-new', self.popover).filter('#rule-new')
									.html(_('New rule for {1}', [(domain === '.*' ? _('All Domains') : domain)])).end().click(function () {
								var is_new = this.id === 'rule-new',
									u = is_new ? '' : t.html(),
									padd = self.poppies.add_rule.call({
											url: u,
											domain: domain,
											e: t,
											header: _((is_new ? 'Adding' : 'Editing') + ' a Rule For {1}', [domain === '.*' ? _('All Domains') : domain])
									}, self);
								
								Behaviour.action('Double click action: ' + this.id);
							
								padd.time = 0.2;
								padd.save_orig = padd.save;
								padd.save = function () {
									if (!is_new) padd.main.rules.remove(padd.me.domain, rule);
									var v = padd.save_orig.call(this, true);
									if (!is_new) {
										Behaviour.action('Rule edited');
									
										t.text(this.val()).removeClass('type-0 type-1 type-2 type-3 type--2 type--3 type-4 type-5 type-6 type-7').addClass('type-' + v)
												.siblings('input').val(_('Delete')).parent().data('rule', this.val()).data('type', v);
										new Poppy(e.pageX, off.top - 2, '<p>' + _('Rule succesfully edited.') + '</p>', $.noop, $.noop, 0.2);
									} else {
										Behaviour.action('Rule added');
									
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
	bind_events: function(some, host) {
		var add_rule, remove_rule, self = this;
		
		function url_display (e) {
			var t = $(this), off = t.offset();
			
			function codeify(data) {
				function do_highlight (data, no_zoom) {
					$('#misc-content pre', self.popover).remove();
					
					$('<pre></pre>').append('<code class="javascript"></code>').find('code').text(data).end().appendTo($('#misc-content', self.popover));
					if (!no_zoom) self.utils.zoom($('#misc', self.popover).find('.misc-info').text(t.text()).end(), $('#main', self.popover));
					var p = $('#misc-content pre code', self.popover);
					p.data('unhighlighted', p.html());
					self.hljs.highlightBlock(p[0]);
				}
				
				$('#misc .info-container #beautify-script', self.popover).remove();
				
				$('<input type="button" value="' + _('Beautify Script') + '" id="beautify-script" />')
						.appendTo($('#misc .info-container', self.popover)).click(function () {
							data = js_beautify(data, {
								indent_size: 2
							});
								
							do_highlight(data, true);
						});
				
				do_highlight(data);
			}
			
			new Poppy(e.pageX, off.top - 2, [
				'<input type="button" value="', _('View Script'), '" id="view-script" />'].join(''), function () {
					$('#poppy #view-script', self.popover).click(function () {
						Behaviour.action('Viewed URL script');
						
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
							}, 0.0);
						}
					});
				});
		}

		if (some) {
			if (!this.allowMode) {
				add_rule = '#blocked';
				remove_rule = '#allowed';
			} else {
				add_rule = '#allowed';
				remove_rule = '#blocked';
			}

			add_rule += '-script-urls ul input';
			remove_rule += '-script-urls ul input';

			$(add_rule, this.popover).click(function (e) {
				Behaviour.action('Adding a rule via main window');
				
				var off = $(this).offset(),
					left = off.left + $(this).outerWidth() / 2,
					o = $('.domain-options:visible', self.popover)[0].value,
					store = $('.domain-options:visible option[value="' + o + '"]', self.popover).data('store'),
					url = $(this).parent().data('url'),
					padd = self.poppies.add_rule.call({
							url: '^' + self.utils.escape_regexp(url) + '$',
							domain: store,
							header: _('Adding a Rule For {1}', [(store === '.*' ? _('All Domains') : store)])
					}, self),
					auto_test = self.rules.remove_matching_URL(store, url, false, !self.allowMode, true);
				
				if (!$.isEmptyObject(auto_test)) {
					var d, rs = [], ds = [], i;
					for (d in auto_test) {
						for (i = 0; i < auto_test[d].length; i++) {
							if (auto_test[d][i][1] < 0) {
								rs.push(auto_test[d][i][0]);
								ds.push(auto_test[d][i]);
							}
						}
					}
					
					if (rs.length) {
						Behaviour.action('Automatic rule restore prompt');
						
						new Poppy(left, off.top + 8, [
							'<p>', _('The following automatic rules were disabled, thus ' + (self.allowMode ? 
								'allowing' : 'blocking') + ' this script:'), '</p>',
							'<ul class="rules-wrapper">',
								'<li class="domain-name no-disclosure">', store, '</li>',
								'<li>',
									'<ul>',
										'<li><span class="rule">',
											rs.join('</span><div class="divider"></div></li><li><span class="rule">'),
										'</span><div class="divider" style="visibility:hidden;"></div></li>',
									'</ul>',
								'</li>',
							'</ul>',
							'<p>', _('Would you like to re-enable the above rule' + (rs.length === 1 ? '' : 's') + ' or add a new one?'), '</p>',
							'<div class="inputs">',
								'<input type="button" value="', _('New Rule'), '" id="auto-new" /> ',
								'<input type="button" value="', _('Restore Rules'), '" id="auto-restore" />',
							'</div>'].join(''), function () {
								var b;
								
								$('#poppy ul span.rule', self.popover).each(function (i) {
									this.className += ' type-' + (ds[i][1] * -1);
								});
								
								$('#poppy #auto-new', self.popover).click(function () {
									Behaviour.action('New rule instead of restore');
									
									padd.time = 0.2;
									new Poppy(left, off.top + 8, padd);
								}).siblings('#auto-restore').val(_('Restore Rule' + (rs.length === 1 ? '' : 's'))).click(function () {
									Behaviour.action('Restored automatic rule(s)');
									
									for (b = 0; b < ds.length; b++)
										self.rules.add(store, ds[b][0], ds[b][1] * -1);
								//	new Poppy(off.left + 22, off.top + 8,
								//			rs.length === 1 ? 'The d' : 'D') + 'isabled rule' + (rs.length === 1 ? ' ' : 's ') +
								//			(self.allowMode ? 'to block' : 'to allow') + ' this script ' + (rs.length === 1 ? 'has' : 'have') +
								//			' been restored.');
									new Poppy();
									safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
								});
							});
						
						return false;
					}
				}
		
				new Poppy(left, off.top + 8, padd);
			}).siblings('span').dblclick(url_display);

			$(remove_rule, this.popover).click(function (e) {
				Behaviour.action('Removing a rule via main window');
				
				var m = $(this).parents('div').attr('id').indexOf('blocked') === -1,
						off = $(this).offset(),
						left = off.left + $(this).outerWidth() / 2,
						url = $(this).parent().data('url'),
						to_delete = self.rules.remove_matching_URL(host, url, false, m),
						d,
						rs = [],
						vs = $([
								'<div>',
									'<p>', _('The following rule(s) will be deleted or disabled:'), '</p>',
									'<ul class="rules-wrapper"></ul>',
									'<p>', _('This may inadvertently affect other scripts.'), '</p>',
									'<div class="inputs">',
										'<input type="button" value="', _('Continue'), '" id="delete-continue" />',
									'</div>',
								'</div>'].join('')),
						wrapper = vs.find('ul.rules-wrapper');

				for (d in to_delete) {
					wrapper.append(self.rules.view(d, url, true).find('> li').find('input').remove().end());
					rs.push(to_delete[d][0]);
				}
						
				$('li.domain-name', vs).removeClass('hidden').addClass('no-disclosure');
			
				if (self.noDeleteWarning)
					self.rules.remove_matching_URL(host, url, true, m);
				else {
					new Poppy(left, off.top + 8, vs, function () {
						$('#poppy #delete-continue', self.popover).click(function () {
							Behaviour.action('Removed a rule via main window');
							
							self.rules.remove_matching_URL(host, url, true, m);
							safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
							new Poppy();
						});
					});
				}
			}).siblings('span').dblclick(url_display);
		
			$('#unblocked-script-urls ul input', this.popover).click(function() {
				Behaviour.action('Viewed unblocked script contents');
				
				var t = $(this).siblings('span').text();
				
				function do_highlight (t, no_zoom) {
					$('#misc-content pre', self.popover).remove();
					
					$('<pre></pre>').append('<code class="javascript"></code>').find('code')
							.text(t).end().appendTo($('#misc-content', self.popover));
					if (!no_zoom) self.utils.zoom($('#misc', self.popover).find('.misc-info').html(_('Unblocked Script')).end(), $('#main', self.popover));
					var p = $('#misc-content pre code', self.popover);
					p.data('unhighlighted', p.html());
					self.hljs.highlightBlock(p[0]);
				}
				
				$('#misc .info-container #beautify-script', self.popover).remove();
				
				$('<input type="button" value="' + _('Beautify Script') + '" id="beautify-script" />')
						.appendTo($('#misc .info-container', self.popover)).click(function () {
							t = js_beautify(t, {
								indent_size: 2
							});
							
							do_highlight(t, true);
						});
				
				do_highlight(t);
			});
			
			return false;
		}
		
		var toggle_find_bar = function (show_only) {
			var f = $('#find-bar', self.popover),
					v = f.is(':visible');
			
			if (v && show_only) return false;
			
			var	h = 24,
					a = v ? f.show() : f.hide(),
					m = (f.slideToggle(300 * self.speedMultiplier).toggleClass('visible').hasClass('visible')) ? '-' : '+',
					mM = m === '-' ? '+' : '-';
			
			$('#main, #rules-list, #misc, #setup', self.popover).animate({
				height: m + '=' + h,
				top: mM + '=' + h
			}, 300 * self.speedMultiplier);
			
			if (v) $('#find-bar-search', f).blur();
			
			return true;
		}
		
		$(this.popover.body).unbind('keydown').keydown(function (e) {
			if (e.which === 16) self.speedMultiplier = 10;
			else if ((e.which === 93 || e.which === 91) ||
					(window.navigator.platform.indexOf('Win') > -1 && e.which === 17)) self.commandKey = true;
			else if (e.which === 70 && self.commandKey) {
				e.preventDefault();
				
				setTimeout(function (self) {
					var b = $('#find-bar #find-bar-search', self.popover).focus();
					b[0].selectionStart = 0;
					b[0].selectionEnd = b[0].value.length;
				}, 10, self);
				
				if (toggle_find_bar(true)) return false;
			} else if (e.which === 27 && $('#find-bar #find-bar-search', self.popover).is(':focus')) {
				e.preventDefault();
				toggle_find_bar();
			}
		}).keyup(function (e) {
			if (e.which === 16) self.speedMultiplier = 1;
			else if ((e.which === 93 || e.which === 91) ||
					(window.navigator.platform.indexOf('Win') > -1 && e.which === 17)) self.commandKey = false;
		});
		
		$('#find-bar #find-bar-done', this.popover).unbind('click').click(function() {
			toggle_find_bar();
			
			self.utils.timer.timeout('hide_results', function () {
				var b = $('#find-bar-search', self.popover),
						s = b.val();
					
				b.val('').trigger('search');
			
				self.utils.timer.timeout('set_back_find', function (b, s) {
					b.val(s);
				}, 3000, [b, s]);
			}, 300 * self.speedMultiplier);
		}).siblings('#find-bar-search').bind('search', function () {
			if (self.finding) return false;
			var s = $(this).val(),
					matches = 0,
					removedEm = false;
						
			$('.find-scroll', self.popover).remove();
			
			$('#main, #rules-list, #misc, #setup', self.popover).find('*').each(function () {
				self.utils.zero_timeout(function (e) {
					if (e.data('orig_html'))
						e.html(e.data('orig_html')).removeData('orig_html');
				}, [$(this)]);
			});
					
			if (s.length === 0) {
				$('#find-bar-matches', self.popover).html('');
				return false;
			}
			
			self.busy = 1;
			self.finding = true;
			
			var visible = $('#main, #rules-list, #misc, #setup', self.popover).filter(':visible'),
					offset = $('header', self.popover).outerHeight() + $('#find-bar', self.popover).outerHeight(),
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
				if (['MARK', 'OPTION', 'SCRIPT'].indexOf(this.nodeName.toUpperCase()) === -1 && this.innerHTML && this.innerHTML.length)
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
				$('#find-bar-matches', self.popover).html(_('{1} matches', [matches]));
				
				if (matches > 499)
					self.utils.zero_timeout(function (self) {
						self.utils.timer.timeout('over_fivehundred', function (self) {
							$('.find-scroll', self.popover).remove();
						}, 50, [self]);
					}, [self]);
			}, [self]);
		});
	
		$('#block-domain, #allow-domain', this.popover).unbind('click').click(function () {
			if (!self.utils.confirm_click(this)) return false;
			
			Behaviour.action(this.id + ' clicked');
			
			var c = $('.domain-options:visible', self.popover),
				o = c.length ? c[0].value : $('.domain-options', self.popover)[0].value,
				store = $('.domain-options option[value="' + o + '"]', self.popover).data('store');
								
			self.rules.remove_domain(store);
			self.rules.add(store, '.*(All Scripts)?', self.allowMode ? 6 : 7);

			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
		});
		
		$('#disable', this.popover).unbind('click').click(function () {
			if (!self.disabled && !self.utils.confirm_click(this)) return false;
		
			self.disabled = !self.disabled;
			
			Behaviour.action('JavaScript Blocker: ' + (self.disabled ? 'disabled' : 'enabled'));

			this.value = _((self.disabled ? 'Enable' : 'Disable') + ' JavaScript Blocker');
			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
		});
		
		$('#view-rules', this.popover).unbind('click').click(function (e) {
			Behaviour.action('View Rules');
			
			var offset = $(this).offset(),
				left = offset.left + $(this).outerWidth() / 2,
				top = offset.top + 8;
			
			new Poppy(left, top, [
				'<input type="button" value="', _('Color Key'), '" id="rules-color" /> ',
				'<input type="button" value="', _('All Rules'), '" id="view-all" /> ',
				'<input type="button" value="', _('Active Rules'), '" id="view-domain" />'].join(''), function () {
				$('#rules-color', self.popover).click(function() {
					Behaviour.action('Color Key');
					
					new Poppy(left, top, [
						'<p>',
							'<span class="rule">', _('User Defined Rule'), '</span><br />',
							'<span class="rule type-2">', _('Automatic Blocking Rule'), '</span><br />',
							'<span class="rule type-3">', _('Automatic Allowing Rule'), '</span><br />',
							'<span class="rule type-4">', _('Blacklist/High-priority Block Rule'), '</span><br />',
							'<span class="rule type-5">', _('Whitelist/High-priority Allow Rule'), '</span>',
						'</p><br />',
						'<p>', _('The last 2 rule types will override any other rule.'), '</p>'].join(''), $.noop, $.noop, 0.2);
				}).siblings('#view-domain').click(function () {
					Behaviour.action('View rules for domain');
					self.busy = 1;
					
					var parts = self.domain_parts(self.active_host($('#page-list', self.popover).val())), x;
									
					parts = parts.map(function (v, i) {
						x = self.utils.escape_regexp(v);
						if (i > 0) return '\\.' + x;
						return x;
					});
					
					parts[parts.length - 1] = _('All Domains');
					
					$('#view-all', self.popover).click();
					
					$('#domain-filter', self.popover).val('^' + parts.join('$|^') + '$');
				}).siblings('#view-all').click(function (event) {
					self.busy = 1;
					
					$('#edit-domains', self.popover).removeClass('edit-mode').html(_('Edit'));
					
					new Poppy(left, top, '<p>' + _('Loading rules') + '</p>', $.noop, function () {
						var ul = $('#rules-list #data > ul#rules-list-rules', self.popover).html(''),
								s = self.utils.sort_object(window.localStorage), domain,
			 					i = 0, filter = $('#domain-filter', self.popover), rs = [];
						
						if ('srcElement' in event) {
							Behaviour.action('View all rules');
							filter.val('');
						}
						
						function append_rules (ul, domain, self) {
							ul.append($('> li', self.rules.view(domain)));
							self.utils.zero_timeout(function (self) {
								self.utils.timer.timeout('filter_bar_click', function (self) {
									$('.filter-bar li.selected', self.popover).click();
								}, 10, [self]);
							}, [self]);
						}
						
						for (domain in s)
							self.utils.zero_timeout(append_rules, [ul, domain, self]);
							
						function remove_domain (event) {
							event.stopPropagation();
							if (!self.utils.confirm_click(this)) return false;
							
							self.rules.remove_domain($(this.parentNode).data('domain'));
							
							var rs = $(this.parentNode).next();
							
							$(this.parentNode).remove();
							rs.remove();
							
							$('#domain-filter', self.popover).trigger('search');
						}
							
						self.utils.zero_timeout(function (ul) {
							$('.domain-name', ul).prepend('<div class="divider"></div><input type="button" value="' + _('Remove') + '" />')
									.find('input').click(remove_domain);
						}, [ul]);
						
						self.utils.zero_timeout(function (self) {
							self.utils.zero_timeout(function (self) {
								self.busy = 0;
								new Poppy();
								self.utils.zoom($('#rules-list', self.popover), $('#main', self.popover));
							}, [self]);
						}, [self]);
					}, 0.0);
				});
			});
		});

		$('#rules-list #rules-list-back', this.popover).unbind('click').click(function () {
			Behaviour.action('Close rules list');
			
			if ($('#rules-list', self.popover).hasClass('zoom-window-open'))
				self.utils.zoom($('#rules-list', self.popover), $('#main', self.popover), function () {
					$('#rules-list #data ul#rules-list-rules', self.popover).html('');
				});
		});
		
		$('#misc-close', self.popover).unbind('click').click(function() {
			Behaviour.action('Close misc window');
			
			if ($('#misc', self.popover).hasClass('zoom-window-open'))
				self.utils.zoom($('#misc', self.popover), $('#main', self.popover), function () {
					$('#misc-content', self.popover).html('');
				});
		});
		
		$('.allowed-label, .blocked-label, .unblocked-label', this.popover).click(function () {
			var $this = $(this), which = this.className.substr(0, this.className.indexOf('-')), e = $('#' + which + '-script-urls ul', self.popover);
			
			if (e.is(':animated')) return false;
			
			Behaviour.action(this.className + ' clicked');
			
			if ($this.hasClass('hidden')) {
				window.localStorage.setItem(which + 'IsCollapsed', 0);
				$this.removeClass('hidden');
				e.slideDown(300 * self.speedMultiplier).removeClass('was-hidden');
			} else {
				window.localStorage.setItem(which + 'IsCollapsed', 1);
				$this.addClass('hidden');
				e.slideUp(300 * self.speedMultiplier).addClass('was-hidden');
			}
			
			self.utils.timer.timeout('label_search', function (self) {
				$('#find-bar-search:visible', self.popover).trigger('search');
			}, 400 * self.speedMultiplier, [self]);
		});
		
		$('#reset-domain', this.popover).unbind('click').click(function () {
			if (!self.utils.confirm_click(this)) return false;
			
			Behaviour.action('Delete expanded rules');
			
			function double_clicker(e) {
				e.click().click();
			}
			
			$('#rules-list ul#rules-list-rules li:visible input', self.popover).each(function (i) {
				if (this.value === _('Disable') || this.value === _('Delete')) {
					var t = $(this);
					self.utils.zero_timeout(double_clicker, [t]);
				}
			});

			self.do_update_popover(event);

			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');	
		});
		
		$('#collapse-all, #expand-all', this.popover).unbind('click').click(function () {
			self.busy = 1;
			
			Behaviour.action(this.id + ' clicked');
			
			var is_collapse = this.id === 'collapse-all', d = $('#rules-list .domain-name:visible', self.popover);
			
			if (!is_collapse && $('#edit-domains', self.popover).hasClass('edit-mode')) return self.busy = 0;
			
			if (is_collapse) d = d.not('.hidden');
			else d = d.filter('.hidden');
			
			d.toggleClass('hidden');
			
			self.collapsedDomains = $.map($('#rules-list .domain-name', self.popover), function (e) {
				return e.className.indexOf('hidden') > -1 ? $('span', e).html() : null;
			});
			
			if (is_collapse) $('#rules-filter-bar li#filter-collapsed', self.popover).click();
			else $('#rules-filter-bar li#filter-expanded', self.popover).click();
			
			self.busy = 0;
		});
		
		$('#edit-domains', this.popover).unbind('click').click(function () {
			$(this).toggleClass('edit-mode');
			
			this.innerHTML = this.className.indexOf('edit-mode') > -1 ? _('Done Editing') : _('Edit');
			
			var ul = $('#rules-list-rules', self.popover);
					
			$('.domain-name', ul).toggleClass('no-disclosure').toggleClass('editing');
		});
		
		var counter = function (self) {
			var d = $('#rules-list .domain-name:visible', self.popover).length,
				r = $('#rules-list .domain-name:visible + li > ul li span.rule:not(.hidden)', self.popover).length;
						
			$('#rules-list .misc-info', self.popover).html(
					_('{1} domain' + (d === 1 ? '' : 's') + ', {2} rule' + (r === 1 ? '' : 's'), [d, r])
			).removeData('orig_html');
		}
		
		$('#domain-filter', this.popover).unbind('search').bind('search', function () {
			var d = $('.domain-name:not(.filter-hidden) span', self.popover), v;
			
			try {
				v = new RegExp(this.value, 'i');
			} catch (e) {
				v = /.*/;
			}
						
			d.each(function () {
				$(this.parentNode).toggleClass('not-included', !v.test(this.innerHTML));
			});
			
			var d = $('#rules-list .domain-name:visible', self.popover).length,
				r = $('#rules-list .domain-name:visible + li > ul li span.rule:not(.hidden)', self.popover).length;
						
			counter(self);
		});
		
		$('#rules-filter-bar #filter-type-collapse li:not(#li-domain-filter)', this.popover).unbind('click').click(function () {
			Behaviour.action(this.id + ' clicked');
			
			$(this).siblings('li').removeClass('selected').end().addClass('selected');
			
			self.utils.zero_timeout(function (self, that) {
				var x = $('#rules-list .domain-name', self.popover);
				
				x.filter('.filter-hidden').removeClass('filter-hidden');
				
				switch(that.id) {
					case 'filter-collapsed':
						x.not('.hidden').addClass('filter-hidden'); break;
					case 'filter-expanded':
						x.filter('.hidden').addClass('filter-hidden'); break;
				}
				
				$('#domain-filter', self.popover).trigger('search');
			}, [self, this]);
		});
		
		$('#rules-filter-bar #filter-type-state li:not(.filter-divider)', this.popover).unbind('click').click(function () {
			Behaviour.action(this.id + ' clicked');
			self.busy = 1;
			
			var that = this;
			
			$(this).siblings('li').removeClass('selected').end().addClass('selected');
			
			var fix_dividers = function (self, that) {
				var d = $('#rules-list-rules ul li .divider', self.popover).css('visibility', 'visible').parent().parent();

				if (that.id === 'filter-state-all')
					d.find('.divider:last').css('visibility', 'hidden');
				else
					d.find('li:not(.none) .divider:last').css('visibility', 'hidden');
			}
			
			switch (this.id) {
				case 'filter-state-all':
					$('.rule', self.popover).removeClass('hidden').parent().removeClass('none');
					fix_dividers(self, that);
					break;
				case 'filter-enabled':
					self.utils.zero_timeout(function (self) {
						$('.rule', self.popover).removeClass('hidden').not('.rule.type--2, .rule.type--3').parent().removeClass('none');
					}, [self]);
					self.utils.zero_timeout(function (self, fix_dividers) {
						$('.rule.type--2, .rule.type--3', self.popover).addClass('hidden').parent().addClass('none');
						fix_dividers(self, that);
					}, [self, fix_dividers]);
					break;
				case 'filter-disabled':
					self.utils.zero_timeout(function (self) {
						$('.rule', self.popover).removeClass('hidden').parent().removeClass('none');
					}, [self]);
					self.utils.zero_timeout(function (self, fix_dividers) {
						$('.rule', self.popover).not('.type--2, .type--3').addClass('hidden').parent().addClass('none');
						fix_dividers(self, that);
					}, [self, fix_dividers]); 
					break;
			}
			
			$('li.domain-name', self.popover).next().each(function () {
				self.utils.zero_timeout(function (t) {
					$(t).prev().toggleClass('state-hidden', $('ul li.none', t).length === $('ul li', t).length);
				}, [this]);
			});
			
			self.utils.zero_timeout(counter, [self]);
			self.utils.zero_timeout(function (self) {
				self.busy = 0;
			}, [self]);
		});
		
		$('#submit-information', this.popover).unbind('click').click(function () {
			var offset = $(this).offset(),
					left = offset.left + $(this).outerWidth() / 2,
					top = offset.top + 8;
			
			if ((+new Date - 1000 * 60 * 10) < Behaviour.last_submit)
				new Poppy(left, top, '<p>' + _('Usage information can be submitted only once every 10 minutes.') + '</p>');
			else {
				new Poppy(left, top, '<p>' + _('Submitting') + '</p>');
			
				Behaviour.submit(function (r) {
					new Poppy(left, top, '<p>' + _('Usage information successfully submited.') + '</p>');
				}, function (error) {
					new Poppy(left, top, '<p>' + _('Error occurred while submitting usage information. Please try again later.') + '</p>' +
							'<p>' + _('Error Code: {1}', [error]) + '</p>');
				});
			}
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
		var self = this, ul = $('#' + text + '-script-urls ul', self.popover);
		
		$('#' + text + '-scripts-count', self.popover).html(jsblocker[text].count);

		for (var i = 0; i < jsblocker[text].urls.length; i++)
			ul.append('<li><span></span><input type="button" value="" /><div class="divider"></div></li>').find('li:last')
					.data('url', jsblocker[text].urls[i]).find('span').text(jsblocker[text].urls[i]).siblings('input').val(button);

		if (jsblocker[text].count > 3 && jsblocker[text].count - 3 > 1) {
			$('li', ul).eq(2).after(['<li>',
						'<a href="javascript:void(1)" class="show-more">', _('Show {1} more', [jsblocker[text].count - 3]), '</a>',
					'</li>'].join('')).end().filter(':gt(2)').hide().addClass('show-more-hidden');
		}
		
		$('.divider:last', ul).css('visibility', 'hidden');

		$('.show-more', ul).click(function () {
			$(this).parent().siblings('li:hidden').slideDown(300 * self.speedMultiplier).end().slideUp(300  * self.speedMultiplier, function () {
				$(this).remove();
			});
			$('#find-bar-search:visible', self.popover).trigger('search');
		});
		
		if (window.localStorage[text + 'IsCollapsed'] === '1') {
			ul.addClass('was-hidden').hide();
			$('.' + text + '-label', self.popover).addClass('hidden');
		}
	},
	do_update_popover: function (event, index) {
		var self = this, jsblocker = event.message;
	
		if (safari.application.activeBrowserWindow.activeTab.url == jsblocker.href) {
			$('#container', this.popover).addClass('loading');
			
			var page_list = $('#page-list', this.popover), frames_blocked_count = 0, frames_allowed_count = 0, frame, inline, c, c0;
			
			c = (!this.allowMode ? 'allowing' : 'blocking');
			c0 = (this.allowMode ? 'allowing' : 'blocking');
			
			$(this.popover.body).addClass(c + '-mode').removeClass(c0 + '-mode');
			
			page_list.find('optgroup:eq(1)').remove();
	
/*			for (frame in jsblocker.frames) {
				if (page_list.find('optgroup').length == 1) inline = $('<optgroup label="Inline Frame Pages"></optgroup>').appendTo(page_list);
				else inline = page_list.find('optgroup:eq(1)');
			
				if (typeof index == 'undefined') {
					frames_blocked_count += jsblocker.frames[frame].blocked.count;
					frames_allowed_count += jsblocker.frames[frame].allowed.count;
					frames_allowed_count += jsblocker.frames[frame].unblocked.count;
				}
				
				$('<option></option>').addClass('frame-page').attr('value', jsblocker.frames[frame].href)
						.html(jsblocker.frames[frame].href).appendTo(inline);
			}
*/

			if (jsblocker.href in this.frames) {
				var frame, inline, xx;

				for (frame in this.frames[jsblocker.href]) {
					xx = this.frames[jsblocker.href];
					
					if (page_list.find('optgroup').length == 1)
						inline = $('<optgroup label="' + _('Inline Frame Pages') + '"></optgroup>').appendTo(page_list);
					else
						inline = page_list.find('optgroup:eq(1)');
				
					if (typeof index === 'undefined') {
						frames_blocked_count += xx[frame].blocked.count;
						frames_allowed_count += xx[frame].allowed.count;
						frames_allowed_count += xx[frame].unblocked.count;
					}
				
					$('<option></option>').addClass('frame-page').attr('value', xx[frame].href).text(xx[frame].href).appendTo(inline);
				}
			}
			
			page_list.find('optgroup:first option').attr('value', jsblocker.href).text(jsblocker.href);
			
			if (typeof index == 'number' && index > 0) {
				page_list[0].selectedIndex = index;
			//	jsblocker = jsblocker.frames[page_list.val()];
				jsblocker = this.frames[jsblocker.href][page_list.val()];
			}
						
			page_list.unbind('change').change(function () {
				self.do_update_popover(event, this.selectedIndex);
			});
			
			var host = this.active_host(page_list.val()), toolbarItem = safari.extension.toolbarItems[0];

			toolbarItem.image = this.disabled ? safari.extension.baseURI + 'images/toolbar-disabled.png' : safari.extension.baseURI + 'images/toolbar.png';
			toolbarItem.badge = safari.extension.settings.toolbarDisplay === 'allowed' ?
					jsblocker.allowed.count + jsblocker.unblocked.count + frames_allowed_count :
					(safari.extension.settings.toolbarDisplay === 'blocked' ? jsblocker.blocked.count + frames_blocked_count : 0);

			$('.domain-options, #allow-domain, #block-domain', this.popover).show();

			if (jsblocker.blocked.count == 0) $('#allow-domain', this.popover).hide();
			if (jsblocker.allowed.count == 0) $('#block-domain', this.popover).hide();

			if (jsblocker.blocked.count == 0 || this.allowMode) $('#allow-options', this.popover).hide();
			if (jsblocker.allowed.count == 0 || !this.allowMode) $('#block-options', this.popover).hide();

			toolbarItem.popover.contentWindow.active_tab_url = safari.application.activeBrowserWindow.activeTab.url;

			$('#main ul', this.popover).html('');

			this.make_list('blocked', _('Allow'), jsblocker);
			this.make_list('allowed', _('Block'), jsblocker);
			this.make_list('unblocked', _('View'), jsblocker);
			
			var domains = this.domain_parts(host), optgroups = $('.domain-options', this.popover).find('optgroup').html('');

			for (var i = 0, b = domains.length; i < b; i++) {
				if (domains[i] == host) continue;

				optgroups.append('<option value="' + i + '">' + (domains[i] === '*' ? _('All Domains') : '.' + domains[i]) + '</option>');
				$('option:last', optgroups).data('store', '.' + domains[i]);
			}

			optgroups.prepend('<option value="0">' + host + '</option>');
			$('option:first', optgroups).data('store', host);
			
			this.bind_events(true, host);
			
			$('#container', this.popover).removeClass('loading');
		}
	},
	setting_changed: function (event) {
		Behaviour.action(['Setting changed:', event.key + ',', 'New value:', event.newValue].join(' '));
		
		if (event.key === 'language')
			this.reloaded = false;
		else if (['alwaysBlock', 'alwaysAllow', 'allowMode'].indexOf(event.key) > -1) {
			var wd, i, b, bd, e, c, mode, key, domain, m = event.key === 'allowMode' ? parseInt(event.newValue, 10) : this.allowMode;
				
			if (['alwaysAllow', 'alwaysBlock'].indexOf(event.key) > -1) {
				mode = m ? 2 : 3;
				
				var delete_automatic_rules = function (self, key, mode) {
					var rs, r;
				
					rs = self.rules.for_domain(key, true);
				
					if (key in rs) {
						for (r in rs[key]) {
							if (rs[key][r] === mode)
								self.rules.remove(key, r, true);
						}
					}
				}
				
				for (key in window.localStorage) {
					if (window.localStorage.hasOwnProperty(key)) {
						this.utils.zero_timeout(delete_automatic_rules, [this, key, mode]);
					}
				}
			}
			
			for (wd in this.rules.whitelist)
				for (i = 0, b = this.rules.whitelist[wd].length; i < b; i++)
					this.rules.add('.*', this.rules.whitelist[wd][i], 5);
		
			for (bd in this.rules.blacklist)
				for (e = 0, c = this.rules.blacklist[bd].length; e < c; e++)
					this.rules.add('.*', this.rules.blacklist[bd][e], 4);
		}
	},
	handle_message: function (event) {
		theSwitch:
		switch (event.name) {
			case 'canLoad':
				if (this.disabled) {
					event.message = true;
					break theSwitch;
				}
				
				var rule_found = false,
					host = this.active_host(event.message[0]),
					domains = this.rules.for_domain(host), domain, rule,
					alwaysFrom = this.allowMode ? safari.extension.settings.alwaysBlock : safari.extension.settings.alwaysAllow,
					to_test;
				
				domainFor:
				for (domain in domains) {
					ruleFor:
					for (rule in domains[domain]) {
						if (rule.length < 1 ||
								(safari.extension.settings.ignoreBlacklist && domains[domain][rule] === 4) ||
								(safari.extension.settings.ignoreWhitelist && domains[domain][rule] === 5) ||
								(domains[domain][rule] < 4 && domains[domain][rule] > -1 && domains[domain][rule] % 2 == this.allowMode)) continue;
						if ((new RegExp(rule)).test(event.message[1])) {
							rule_found = domains[domain][rule] < 0 ? true : domains[domain][rule] % 2;
							if (domains[domain][rule] >= 0 && (domains[domain][rule] < 2 || domains[domain][rule] > 5)) break domainFor;
						}
					}
				}
								
				if (typeof rule_found === 'number') {
					event.message = rule_found;
					break;
				}
								
				if (alwaysFrom !== 'nowhere' && rule_found !== true) {
					var page_parts = this.domain_parts(host),
						script_parts = this.domain_parts(this.active_host(event.message[1])),
						rr;
					
					if (/^data:/.test(event.message[1]))
						rr = '^' + this.utils.escape_regexp(event.message[1]) + '$';
					else
						rr = '^https?:\\/\\/' + (alwaysFrom === 'topLevel' ?
								('([^\\/]+\\.' + this.utils.escape_regexp(script_parts[script_parts.length - 2]) + '|' +
										this.utils.escape_regexp(script_parts[script_parts.length - 2]) + ')') :
								this.utils.escape_regexp(script_parts[0])) + '\\/.*$';
					
					if (this.allowMode) {
						if ((alwaysFrom === 'topLevel' && page_parts[0] !== script_parts[0]) ||
								(alwaysFrom === 'domain' && page_parts[page_parts.length - 2] !== script_parts[script_parts.length - 2])) {
							event.message = 0;
							this.rules.add(host, rr, 2, true);
							break theSwitch;
						}
					} else {
						if (page_parts[0] === script_parts[0] ||
								(alwaysFrom === 'topLevel' && page_parts[page_parts.length - 2] === script_parts[script_parts.length - 2])) {
							event.message = 1;
							this.rules.add(host, rr, 3, true);
							break theSwitch;
						}
					}
				}
		
				event.message = this.allowMode;
			break;

			case 'updatePopover':
				if (event.target != safari.application.activeBrowserWindow.activeTab) break;
			
				var self = this;
				if (this.updatePopoverTimeout) clearTimeout(this.updatePopoverTimeout);
				this.updatePopoverTimeout = setTimeout(function () {
					self.do_update_popover(event);
				}, 100);
			break;
			
			case 'addFrameData':
				try {
					delete this.frames[event.message[2]];
				} catch (e) {}
				
				if (!(event.target.url in this.frames)) this.frames[event.target.url] = {};
				
				this.frames[event.target.url][event.message[0]] = event.message[1];
				
				safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePopover');
			break;
			
			case 'updateFrameData':
				try {
					this.frames[event.message[0]] = this.frames[event.message[1]];
					delete this.frames[event.message[1]];
				} catch(e) {}
			break;
			
			case 'unloadPage':
				try {
					Behaviour.action('A page was unloaded');
					delete this.frames[event.message];
				} catch (e) { }
			break;
		}
	},
	open_popover: function (event) {
		if (typeof event !== 'undefined' && ('type' in event) && ['beforenavigate', 'close'].indexOf(event.type) > -1) {
			try {
				safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('unloadPage');
			} catch (e) {}
		}
		
		var self = this, s = $('#setup', this.popover);
		
		if (!('BehaviourIdentifier' in window.localStorage))
			window.localStorage.setItem('BehaviourIdentifier', (Math.random() + Math.random() + Math.random()) * 10000000000000000);
		
		if (event && ('type' in event) && event.type == 'popover') {
			Behaviour.action('Opened JavaScript Blocker');

			/**
			 * Fixes issues with mouse hover events not working
			 */
			if (!this.reloaded) {
				this.reloaded = true;
				this.load_language(false);
				
				safari.extension.toolbarItems[0].popover.contentWindow.location.reload();
							
				setTimeout(function (e) {
					e.load_language(true);
					e.open_popover(event);
				}, 500, this);
				
				if (!this.setupDone)
					return false;
			}

			$('#rules-list-back:visible, #misc-close:visible, #find-bar-done:visible', this.popover).click();
		} else if (!event || (event && ('type' in event) && ['beforeNavigate', 'close'].indexOf(event.type) > -1))
			new Poppy();
		
		if (!this.setupDone) {
			if (s.css('display') === 'block') return false;
		
			Behaviour.installed();
			
			Behaviour.action('Setup');
			var setupTime = Behaviour.timer('Setup timer');
					
			s.find('input').click(function (e) {
				Behaviour.timerEnd(setupTime);
				
				self.allowMode = !$(this).is('#setup-block');
				self.setupDone = 1;
				
				Behaviour.action('Setup in allowMode: ' + self.allowMode);
        
				var wd, bd, i, b, e, c;

				for (wd in self.rules.whitelist)
					for (i = 0, b = self.rules.whitelist[wd].length; i < b; i++)
						self.rules.add('.*', self.rules.whitelist[wd][i], 5);
			
				for (bd in self.rules.blacklist)
					for (e = 0, c = self.rules.blacklist[bd].length; e < c; e++)
						self.rules.add('.*', self.rules.blacklist[bd][e], 4);
									
				self.open_popover();
			});
			
			this.utils.zoom(s, $('#main', this.popover));
			
			return false;
		}
		
		if (s.hasClass('zoom-window-open'))
			this.utils.zoom(s, $('#main', this.popover));
		
		try {
			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePopover');
		} catch(e) { }
	},
	validate: function (event) {
		if (!('cleanup' in this.utils.timer.timers.intervals))
			this.utils.timer.interval('cleanup', $.proxy(this._cleanup, this), 1000 * 60 * 5);
			
		try {
			this.popover = safari.extension.toolbarItems[0].popover.contentWindow.document;
			
			event.target.disabled = !event.target.browserWindow.activeTab.url;

			if (event.target.disabled)
				event.target.badge = 0;
		} catch(e) { }
	}
};

JavaScriptBlocker.rules.__proto__ = JavaScriptBlocker;
JavaScriptBlocker.utils.__proto__ = JavaScriptBlocker;