"use strict";

var JavaScriptBlocker = {
	reloaded: false,
	caches: {
		domain_parts: {},
		active_host: {},
		collapsed_domains: null
	},
	speedMultiplier: 1,
	disabled: false,
	noDeleteWarning: false,
	frames: {},
	_cleanup: function () {
		var new_frames = {}, i, b, j, c, key, e;
		for (i = 0, b = safari.application.browserWindows.length; i < b; i++) {
			for (j = 0, c = safari.application.browserWindows[i].tabs.length; j < c; j++) {
				if (this.frames[safari.application.browserWindows[i].tabs[j].url])
					new_frames[safari.application.browserWindows[i].tabs[j].url] = this.frames[safari.application.browserWindows[i].tabs[j].url];
			}
		}
	
		this.frames = new_frames;
		this.caches.active_host = {};
		this.caches.domain_parts = {};
	
		for (key in window.localStorage) {
			if (window.localStorage.hasOwnProperty(key)) {
				this.utils.zero_timeout(function (key) {
					if (window.localStorage[key] === '{}')
						window.localStorage.removeItem(key);
				}, [key]);
			}
		}
		
		var collapsed = JSON.parse(window.localStorage.getItem('CollapsedDomains')), new_collapsed = [];
		
		if (typeof this.collapsedDomains === 'object') {
			for(var x = 0; x < this.collapsedDomains.length; x++) {
				if (this.collapsedDomains[x] === 'All Domains' || (this.collapsedDomains[x] in window.localStorage)) new_collapsed.push(this.collapsedDomains[x]);
			}
		}
		
		this.collapsedDomains = new_collapsed;
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
		return $('#container', this.popover).hasClass('busy');
	},
	set busy(value) {
		if (value === 1) $('#container', this.popover).addClass('busy');
		else $('#container', this.popover).removeClass('busy');
	},
	animate_badge: function(start) {
		if(start === false) return this.utils.timer.delete('interval', 'badge_animation')
		var the_i = 0;
		this.utils.timer.interval('badge_animation', function() {
			safari.extension.toolbarItems[0].badge = 0;
			the_i += 1;
			safari.extension.toolbarItems[0].image = safari.extension.baseURI + 'images/toolbar-animated-' + (the_i) + '.png';
			if(the_i === 4) the_i = 0;
		}, 150)
	},
	utils: {
		_zero_timeouts: [],
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
			return text.replace(new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '$', '^', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')', 'g'), '\\$1');
		},
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
		zoom: function (e, hide, cb) {
			var t = 0.6 * this.speedMultiplier, self = this, start_value, end_value, start_hide_zoom, end_hide_zoom, c;
			
			if (e.is(':animated') || e.data('isAnimating')) return false;
					
			e.data('isAnimating', true);
			
			if (!hide) hide = $('<div></div>');
			if (!cb) cb = $.noop;
			
			start_value = (e.hasClass('zoom-window')) ? 1 : 0.3;
			end_value = (start_value === 1) ? 0.3 : 1;
					
			start_hide_zoom = (start_value === 1) ? 1.2 : 1;
			end_hide_zoom = (start_hide_zoom === 1) ? 1.2 : 1;
					
			if (start_value !== 1) {
				e.addClass('zoom-window').css('zIndex', 999);
				hide.data('scrollTop', hide.scrollTop());
			} else {
				hide.css('zIndex', 0);
				e.removeClass('zoom-window-open');
			}
			
			c = {
				display: 'block',
				WebkitTransitionProperty: '-webkit-transform, opacity, background-color',
				WebkitTransitionDuration: t + 's',
				WebkitTransitionTimingFunction: 'ease'
			};
			
			e.css(c);
			hide.css(c);
					
			e.css({
				WebkitTransform: 'scale(' + (start_value & 1) + ')',
				opacity: start_value,
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
					opacity: (end_value & 1) === 0 ? end_value * 0.5 : end_value,
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

				this.delete(type, name);

				var ww = (type == 'interval') ? window.setInterval : window.setTimeout,
					timer_func = ww.apply(null, [script, time].concat(args));

				if (type == 'timeout' && !name.match(/_auto_delete$/))
					this.create('timeout', name + '_auto_delete', function () {
						self.delete(type, name);
					}, time + 100);

				this.timers[type + 's'][name] = { name: name, timer: timer_func, script: script, time: time };

				return this.timers[type + 's'][name];
			},
			delete: function () {
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
			},
		}
	},
	_active_host_cache: {},
	active_host: function (url) {
		if (url in this.caches.active_host) return this.caches.active_host[url];
		var r = /^(https?|file):\/\/([^\/]+)\//;
		if (url) return (/^data/.test(url)) ? (this.caches.active_host[url] = 'DataURI') : (this.caches.active_host[url] = url.match(r)[2]);

		try {
			return (this.caches.active_host[url] = safari.application.activeBrowserWindow.activeTab.url.match(r)[2]);
		} catch(e) {
			return 'ERROR';
		}
	},
	domain_parts: function (domain) {
		var x;
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
			if (domain in this.cache) return this.cache[domain];
			
			var parts = this.domain_parts(domain), o = {}, i, b, c, r;

			if (one) parts = [parts[0]];

			for (i = 0, b = parts.length; i < b; i++) {
				c = ((i > 0) ? '.' : '') + parts[i];
				r = window.localStorage.getItem(c);
				if (r == null) continue;
				o[c] = this.utils.parse_JSON(r);
			}

			this.cache[domain] = o;

			return o;
		},
		add: function (domain, pattern, action, add_to_beginning) {
			var current_rules = this.for_domain(domain, true);
			
			action = parseInt(action, 10);
					
			if (!add_to_beginning) {
				if (!(domain in current_rules)) current_rules[domain] = {};
				else if (pattern in current_rules[domain] && current_rules[domain][pattern] === action) return false;
			}
			
			if (add_to_beginning) {
				var new_rules = {};
				new_rules[domain] = {};
				new_rules[domain][pattern] = action;
				
				var e;
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

			return ($.isEmptyObject(current_rules[domain])) ? window.localStorage.removeItem(domain) : window.localStorage.setItem(domain, JSON.stringify(current_rules[domain]));
		},
		remove_matching_URL: function (domain, url, confirmed, block_allow) {
			var current_rules = this.for_domain(domain), to_delete = {}, sub, rule;

			for (sub in current_rules) {
				to_delete[sub] = [];

				for (rule in current_rules[sub]) {
					if(!!(current_rules[sub][rule] % 2) !== block_allow) continue;
									
					if ((new RegExp(rule)).test(url)) {
						if (confirmed) {
							delete this.cache[sub];
							
							if (current_rules[sub][rule] > 1 && current_rules[sub][rule] < 4) {
								current_rules[sub][rule] *= -1;
							} else
								delete current_rules[sub][rule];
						} else to_delete[sub].push(rule);
					}
				}

				if (!confirmed) {
					if (!to_delete[sub].length) delete to_delete[sub];
				} else
			 		window.localStorage.setItem(sub, JSON.stringify(current_rules[sub]));
			}

			return (confirmed) ? 1 : to_delete;
		},
		remove_domain: function (domain) {
			delete this.cache[domain];
			return window.localStorage.removeItem(domain);
		},
		view: function (domain, url) {
			var self = this, allowed = this.for_domain(domain, true), ul = $('<ul class="rules-wrapper"></ul>'), newul, rules, rule, append;
			
			if (domain in allowed) {
				allowed = allowed[domain];

				if ('{}' != JSON.stringify(allowed)) {
					var j = this.collapsedDomains, domain_name = ((domain[0] == '.' && domain != '.*') ? domain : (domain == '.*' ? 'All Domains' : domain));
					
					newul = ul.append('<li class="domain-name">' + domain_name + '</li><li><ul></ul></li>').find('li:last ul');
					rules = 0;
		
					for (rule in allowed) {
						if ((url && !(new RegExp(rule)).test(url)) || (safari.extension.settings.ignoreBlacklist && allowed[rule] === 4) || (safari.extension.settings.ignoreWhitelist && allowed[rule] === 5) || (!!(allowed[rule] % 2) === this.allowMode && allowed[rule] < 4)) continue;
						rules++;
						append = newul.append('<li><span class="rule type-' + allowed[rule] + '">' + rule + '</span> <input type="button" value="' + (allowed[rule] < 0 ? 'Restore' : 'Delete') + '" /><div class="divider"></div></li>');
						$('li:last', append).data('rule', rule).data('domain', domain).data('type', allowed[rule]);
					}
					
					if (!rules) return $('<ul class="rules-wrapper"></ul>');
					
					if (j && j.indexOf(domain_name) > -1)
						newul.parent().prev().addClass('hidden');

					$('.divider:last', newul).css('visibility', 'hidden');
				}
				
				$('.domain-name', ul).click(function () {
					var d = this.innerHTML, t = $(this).next();
					
					if (t.is(':animated')) return false;
					
					var dex = self.collapsedDomains.indexOf(d);
					
					$(this).toggleClass('hidden');
					
					if (this.className.indexOf('hidden') === -1) {
						if (dex > -1) self.collapsedDomains.splice(dex, 1);
					} else {
						if (dex === -1) self.collapsedDomains.push(d);
					}
					
					t.toggle().slideToggle(300 * self.speedMultiplier, function () {
						this.style.display = null;
					});
				});

				$('li input', ul).click(function () {
					if (!self.utils.confirm_click(this)) return false;
			
					var $this = $(this), li = $this.parent(), parent = li.parent(), span = $('span.rule', li), is_automatic = $('span.rule.type-2, span.rule.type-3', li).length;
					
					if(this.value === 'Restore') {
						self.remove(li.data('domain'), li.data('rule'));
						self.add(li.data('domain'), li.data('rule'), li.data('type') * -1);
						this.value = 'Delete';
						span.addClass(span[0].className.substr(span[0].className.indexOf('type')).replace('--', '-')).removeClass('type--2 type--3');
					} else {
						self.remove(li.data('domain'), li.data('rule'));
						
						if (is_automatic) {
							this.value = 'Restore';
							span.addClass(span[0].className.substr(span[0].className.indexOf('type')).replace('-', '--')).removeClass('type-2 type-3');
						} else {
							li.remove();
				
							if (li.is(':last')) $('.divider:last', parent).css('visibility', 'hidden');

							if ($('li', parent).length === 0) {
								parent.parent().prev().remove();
								parent.parent().remove();
							}
						}
					}
					
					$('#domain-filter', self.popover).trigger('search');
				}).siblings('span').dblclick(function (e) {
					var t = $(this), off = t.offset(), domain = t.parent().data('domain'), rule = t.parent().data('rule');
					
					new Poppy(e.pageX, off.top - 2, [
						(t.hasClass('type-4') || t.hasClass('type-5') ? 'Predefined rules cannot be edited. ' : '<input type="button" value="Edit Rule" id="rule-edit" /> '),
						'<button id="rule-new">New Rule</button>'].join(''), function () {
						$('#poppy #rule-edit, #poppy #rule-new', self.popover).filter('#rule-new').html('New rule for <b>' + (domain === '.*' ? 'All Domains' : domain) + '</b>').end().click(function () {
							var is_new = this.id === 'rule-new',
								u = is_new ? '' : t.html(),
								padd = self.poppies.add_rule.call({ url: u, domain: domain, e: t, header: (is_new ? 'Adding a Rule ' : 'Editing a Rule') + ' For <b>' + domain + '</b>' }, self);
							padd.save_orig = padd.save;
							padd.save = function () {
								if (!is_new) padd.main.rules.remove(padd.me.domain, rule);
								var v = padd.save_orig.call(this, true);
								if (!is_new) {
									t.text(this.val()).removeClass('type-0 type-1 type-2 type-3 type-4 type-5 type-6 type-7').addClass('type-' + v);
									new Poppy(e.pageX, off.top - 2, '<p>Rule succesfully edited.</p>');
								} else {
									new Poppy(e.pageX, off.top - 2, '<p>Rule succesfully added for <b>' + (padd.me.domain === '.*' ? 'All Domains' : padd.me.domain) + '</b></p><p>Changes will appear when you reload the rules list.</p>');
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
				$('<pre></pre>').append('<code class="javascript"></code>').find('code').text(data).end().appendTo($('#misc-content', self.popover));
				self.utils.zoom($('#misc', self.popover).find('.misc-info').text(t.text()).end(), $('#main', self.popover));
				self.hljs.highlightBlock($('#misc pre code', self.popover)[0]);
			}
			
			new Poppy(e.pageX, off.top - 2, [
				'<input type="button" value="View Script" id="view-script" />'].join(''), function () {
					$('#poppy #view-script', self.popover).click(function () {
						if (/^data/.test(t.text())) {
							new Poppy(e.pageX, off.top - 2, '<p>Data URIs cannot be displayed.', $.noop, $.noop, 0.0);
						} else {
							new Poppy(e.pageX, off.top - 2, '<p>Loading script&hellip;</p>', $.noop, function () {
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
				var off = $(this).offset(),
					o = $('.domain-options:visible', self.popover)[0].value,
					store = $('.domain-options:visible option[value="' + o + '"]', self.popover).data('store'),
					url = $(this).parent().data('url'),
					padd = self.poppies.add_rule.call({ url: '^' + self.utils.escape_regexp(url) + '$', domain: store, header: 'Adding a Rule For <b>' + (store === '.*' ? 'All Domains' : store) + '</b>' }, self);
		
				new Poppy(off.left + 22, off.top + 8, padd);
			}).siblings('span').dblclick(url_display);

			$(remove_rule, this.popover).click(function (e) {
				var m = $(this).parents('div').attr('id').indexOf('blocked') === -1,
					off = $(this).offset(),
					url = $(this).parent().data('url'),
					to_delete = self.rules.remove_matching_URL(host, url, false, m),
					d, ds = [], rs = [], vs = $('<div>The following rule(s) will be deleted:<ul class="rules-wrapper"></ul>This may inadvertently affect other scripts. <input type="button" value="Continue" id="delete-continue" /></div>');
			
				for (d in to_delete) {
					$('> ul.rules-wrapper', vs).append(self.rules.view(d, url).find('> li').find('input').remove().end());
					ds.push(d);
					rs.push(to_delete[d]);
				}
						
				$('ul', vs).addClass((!self.allowMode ? 'allowing' : 'blocking') + '-mode');
				$('li.domain-name', vs).filter('.hidden').removeClass('hidden').unbind('click').addClass('no-disclosure');
			
				if (self.noDeleteWarning)
					self.rules.remove_matching_URL(host, url, true, m);
				else {
					new Poppy(off.left + 22, off.top + 8, vs, function () {
						$('#poppy #delete-continue', self.popover).click(function () {
							self.rules.remove_matching_URL(host, url, true, m);
							safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
							new Poppy();
						});
					});
				}
			}).siblings('span').dblclick(url_display);
		
			$('#unblocked-script-urls ul input', this.popover).click(function() {
				$('<pre></pre>').append('<code class="javascript"></code>').find('code').html($(this).siblings('span').html()).end().appendTo($('#misc-content', self.popover));
				self.utils.zoom($('#misc', self.popover).find('.misc-info').html('Unblocked Script').end(), $('#main', self.popover));
				self.hljs.highlightBlock($('#misc pre code', self.popover)[0]);
			});
			
			return false;
		}
		
		$(this.popover.body).unbind('keydown').keydown(function (e) {
			if (e.keyCode === 16) self.speedMultiplier = 10;
		}).keyup(function (e) {
			if (e.keyCode === 16) self.speedMultiplier = 1;
		});
	
		$('#block-domain, #allow-domain', this.popover).unbind('click').click(function () {
			if (!self.utils.confirm_click(this)) return false;
			
			var c = $('.domain-options:visible', self.popover),
				o = (c.length) ? c[0].value : $('.domain-options', self.popover)[0].value,
				store = $('.domain-options option[value="' + o + '"]', self.popover).data('store'),
				tvalue = this.id === 'allow-domain' ? 7 : 6,
				fvalue = tvalue === 7 ? 6 : 7;
								
			self.rules.remove_domain(store);
			self.rules.add(store, '.*(All Scripts)?', (self.allowMode) ? tvalue : fvalue);

			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
		});
		
		$('#disable', this.popover).unbind('click').click(function () {
			if (!self.disabled && !self.utils.confirm_click(this)) return false;

			self.disabled = !self.disabled;

			this.value = ((self.disabled) ? 'Enable' : 'Disable') + ' JavaScript Blocker';
			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
		});
		
		$('#view-rules', this.popover).unbind('click').click(function (e) {
			new Poppy(e.pageX, e.pageY, [
				'<input type="button" value="Color Key" id="rules-color" /> ',
				'<input type="button" value="All Rules" id="view-all" /> ',
				'<input type="button" value="Active Rules" id="view-domain" />'].join(''), function () {
				$('#rules-color', self.popover).click(function() {
					new Poppy(e.pageX, e.pageY, [
						'<p>',
							'<span class="rule">User Defined Rule&mdash;Determined by color of domain header</span><br />',
							'<span class="rule type-2">Automatic Blocking Rule</span><br />',
							'<span class="rule type-3">Automatic Allowing Rule</span><br />',
							'<span class="rule type-4">Blacklist/High-priority Block Rule</span><br />',
							'<span class="rule type-5">Whitelist/High-priority Allow Rule</span>',
						'</p><br />',
						'<p>The last 2 rule types will override any other rule.</p>'].join(''), $.noop, $.noop, 0.2);
				}).siblings('#view-domain').click(function () {
					self.busy = 1;
					
					var parts = self.domain_parts(self.active_host($('#page-list', self.popover).val())), x;
									
					parts = parts.map(function (v, i) {
						x = self.utils.escape_regexp(v);
						if (i > 0) return '\\.' + x;
						return x;
					});
					
					parts[parts.length - 1] = 'All Domains';
					
					$('#view-all', self.popover).click();
					
					$('#domain-filter', self.popover).val('^' + parts.join('$|^') + '$');
				}).siblings('#view-all').click(function (event) {
					self.busy = 1;
					
					new Poppy(e.pageX, e.pageY, '<p>Loading rules&hellip;</p>', $.noop, function () {
						var ul = $('#rules-list #data > ul#rules-list-rules', self.popover).html(''), s = self.utils.sort_object(window.localStorage), domain;
				
						var i = 0, filter = $('#domain-filter', self.popover);
						
						if ('srcElement' in event) filter.val('');
				
						for (domain in s) {
							self.utils.zero_timeout(function (ul, domain, self) {
								ul.append($('> *', self.rules.view(domain)));
								self.utils.zero_timeout(function (self) {
									$('#rules-filter-bar li.selected', self.popover).click();
								}, [self]);
							}, [ul, domain, self]);
						}
				
						self.busy = 0;
						new Poppy();
						self.utils.zoom($('#rules-list', self.popover), $('#main', self.popover));
					}, 0.0);
				}).andSelf().click(function () {
					var d = $('#rules-list .domain-name', self.popover).length, r = $('#rules-list span.rule', self.popover).length;
					$('#rules-list .misc-info', self.popover).html(d + ' domain' + ((d === 1) ? '' : 's') + ', ' + r + ' rule' + ((r === 1) ? '' : 's'));
				});
			});
		});

		$('#rules-list #rules-list-back', this.popover).unbind('click').click(function () {
			if ($('#rules-list', self.popover).hasClass('zoom-window-open'))
				self.utils.zoom($('#rules-list', self.popover), $('#main', self.popover), function () {
					$('#rules-list #data ul#rules-list-rules', self.popover).html('');
				});
		});
		
		$('#misc-close', self.popover).unbind('click').click(function() {
			if ($('#misc', self.popover).hasClass('zoom-window-open'))
				self.utils.zoom($('#misc', self.popover), $('#main', self.popover), function () {
					$('#misc-content', self.popover).html('');
				});
		});
		
		$('.allowed-label, .blocked-label, .unblocked-label', this.popover).click(function () {
			var $this = $(this), which = this.className.substr(0, this.className.indexOf('-'));
			
			if ($this.hasClass('hidden')) {
				window.localStorage.setItem(which + 'IsCollapsed', 0);
				$this.removeClass('hidden');
				$('#' + which + '-script-urls ul', self.popover).slideDown(300 * self.speedMultiplier).removeClass('was-hidden');
			} else {
				window.localStorage.setItem(which + 'IsCollapsed', 1);
				$this.addClass('hidden');
				$('#' + which + '-script-urls ul', self.popover).slideUp(300 * self.speedMultiplier).addClass('was-hidden');
			}
		});
		
		$('#reset-domain', this.popover).unbind('click').click(function () {
			if (!self.utils.confirm_click(this)) return false;
			
			$('#rules-list ul#rules-list-rules li:visible input[value="Delete"]', self.popover).each(function (i) {
				var $this = $(this);
				self.utils.zero_timeout(function (e) {
					e.click().click();
				}, [$this]);
			});

			self.do_update_popover(event);

			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
		});
		
		$('#collapse-all, #expand-all', this.popover).unbind('click').click(function () {
			self.busy = 1;
			
			var is_collapse = this.id === 'collapse-all', d = $('#rules-list .domain-name:visible', self.popover);
			
			if (is_collapse) d = d.not('.hidden');
			else d = d.filter('.hidden');
			
			d.toggleClass('hidden');
			
			self.collapsedDomains = $.map($('#rules-list .domain-name', self.popover), function (e) {
				return e.className.indexOf('hidden') > -1 ? e.innerHTML : null;
			});
			
			if (is_collapse) $('#rules-filter-bar li#filter-collapsed', self.popover).click();
			else $('#rules-filter-bar li#filter-expanded', self.popover).click();
			
			self.busy = 0;
		});
		
		$('#domain-filter', this.popover).unbind('search').bind('search', function () {
			var d = $('.domain-name:not(.filter-hidden)', self.popover), v = this.value;
						
			d.each(function () {
				var e = $(this);
				if (!(new RegExp(v, 'i')).test(this.innerHTML))
					e.addClass('not-included');
				else
					e.removeClass('not-included');
			});
			
			var d = $('#rules-list .domain-name:visible', self.popover).length,
				r = $('#rules-list .domain-name:visible + li > ul li span.rule', self.popover).length;
						
			$('#rules-list .misc-info', self.popover).html(d + ' domain' + ((d === 1) ? '' : 's') + ', ' + r + ' rule' + ((r === 1) ? '' : 's'));
		});
		
		$('#rules-filter-bar li:not(#li-domain-filter)', this.popover).unbind('click').click(function () {
			$(this).siblings('li').removeClass('selected').end().addClass('selected');
			
			var x = $('#rules-list .domain-name', self.popover);

			x.filter('.filter-hidden').removeClass('filter-hidden');

			switch(this.innerHTML) {
				case 'Collapsed':
					x.not('.hidden').addClass('filter-hidden'); break;
				case 'Expanded':
					x.filter('.hidden').addClass('filter-hidden'); break;
			}
			
			$('#domain-filter', self.popover).trigger('search');
		});
	},
	make_list: function (text, button, jsblocker) {
		var self = this, ul = $('#' + text + '-script-urls ul', self.popover);
		
		$('#' + text + '-scripts-count', self.popover).html(jsblocker[text].count);

		for (var i = 0; i < jsblocker[text].urls.length; i++)
			ul.append('<li><span></span><input type="button" value="" /><div class="divider"></div></li>').find('li:last').data('url', jsblocker[text].urls[i]).find('span').text(jsblocker[text].urls[i]).siblings('input').val(button);

		if (jsblocker[text].count > 3 && jsblocker[text].count - 3 > 1) {
			$('li:eq(2)', ul).after('<li><a href="javascript:void(1)" class="show-more">Show ' + (jsblocker[text].count - 3) + ' more&hellip;</a></li>');
			$('li:gt(3)', ul).hide().addClass('show-more-hidden');
		}

		$('.divider:last', ul).css('visibility', 'hidden');

		$('.show-more', ul).click(function () {
			$(this).parent().siblings('li:hidden').slideDown(300 * self.speedMultiplier).end().slideUp(300  * self.speedMultiplier, function () {
				$(this).remove();
			});
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
			
			$('#container', this.popover).addClass(c + '-mode').removeClass(c0 + '-mode');
			
			page_list.find('optgroup:eq(1)').remove();
	
/*			for (frame in jsblocker.frames) {
				if (page_list.find('optgroup').length == 1) inline = $('<optgroup label="Inline Frame Pages"></optgroup>').appendTo(page_list);
				else inline = page_list.find('optgroup:eq(1)');
			
				if (typeof index == 'undefined') {
					frames_blocked_count += jsblocker.frames[frame].blocked.count;
					frames_allowed_count += jsblocker.frames[frame].allowed.count;
					frames_allowed_count += jsblocker.frames[frame].unblocked.count;
				}
				
				$('<option></option>').addClass('frame-page').attr('value', jsblocker.frames[frame].href).html(jsblocker.frames[frame].href).appendTo(inline);
			}
*/

			if (jsblocker.href in this.frames) {
				var frame, inline, xx;

				for (frame in this.frames[jsblocker.href]) {
					xx = this.frames[jsblocker.href];
					
					if (page_list.find('optgroup').length == 1) inline = $('<optgroup label="Inline Frame Pages"></optgroup>').appendTo(page_list);
					else inline = page_list.find('optgroup:eq(1)');
				
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

			toolbarItem.image = (this.disabled) ? safari.extension.baseURI + 'images/toolbar-disabled.png' : safari.extension.baseURI + 'images/toolbar.png';
			toolbarItem.badge = (safari.extension.settings.toolbarDisplay === 'allowed') ? jsblocker.allowed.count + jsblocker.unblocked.count + frames_allowed_count : (safari.extension.settings.toolbarDisplay === 'blocked' ? jsblocker.blocked.count + frames_blocked_count : 0);

			$('.domain-options, #allow-domain, #block-domain', this.popover).show();

			if (jsblocker.blocked.count == 0) $('#allow-domain', this.popover).hide();
			if (jsblocker.allowed.count == 0) $('#block-domain', this.popover).hide();

			if (jsblocker.blocked.count == 0 || this.allowMode) $('#allow-options', this.popover).hide();
			if (jsblocker.allowed.count == 0 || !this.allowMode) $('#block-options', this.popover).hide();

			toolbarItem.popover.contentWindow.active_tab_url = safari.application.activeBrowserWindow.activeTab.url;

			$('#main ul', this.popover).html('');

			this.make_list('blocked', 'Allow', jsblocker);
			this.make_list('allowed', 'Block', jsblocker);
			this.make_list('unblocked', 'View', jsblocker);
			
			var domains = this.domain_parts(host), optgroups = $('.domain-options', this.popover).find('optgroup').html('');

			for (var i = 0, b = domains.length; i < b; i++) {
				if (domains[i] == host) continue;

				optgroups.append('<option value="' + i + '">' + ((domains[i] == '*') ? 'All Domains' : '.' + domains[i]) + '</option>');
				$('option:last', optgroups).data('store', '.' + domains[i]);
			}

			optgroups.prepend('<option value="0">' + host + '</option>');
			$('option:first', optgroups).data('store', host);
			
			this.bind_events(true, host);
			
			$('#container', this.popover).removeClass('loading');
		}
	},
	setting_changed: function (event) {
		if (['alwaysBlock', 'alwaysAllow', 'allowMode'].indexOf(event.key) > -1) {
			var wd, i, b, bd, e, c, mode, key, domain, new_rules, m = event.key === 'allowMode' ? parseInt(event.newValue, 10) : this.allowMode;
				
			if (['alwaysAllow', 'alwaysBlock'].indexOf(event.key) > -1) {
				mode = m ? 2 : 3;
				
				for (key in window.localStorage) {
					if (window.localStorage.hasOwnProperty(key)) {
						this.utils.zero_timeout(function (self, key, mode) {
							var rs, r, new_rules;
						
							rs = self.rules.for_domain(key, true);
						
							if (key in rs) {
								new_rules = {};
								for (r in rs[key]) {
									if (rs[key][r] === mode)
										self.rules.remove(key, r, true);
								}
							}
						}, [this, key, mode]);
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
					alwaysFrom = (this.allowMode) ? safari.extension.settings.alwaysBlock : safari.extension.settings.alwaysAllow,
					to_test;
				
				domainFor:
				for (domain in domains) {
					ruleFor:
					for (rule in domains[domain]) {
						if (rule.length < 1 || (safari.extension.settings.ignoreBlacklist && domains[domain][rule] === 4) || (safari.extension.settings.ignoreWhitelist && domains[domain][rule] === 5) || (domains[domain][rule] < 4 && domains[domain][rule] > -1 && domains[domain][rule] % 2 == this.allowMode)) continue;
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
						rr = '^https?:\\/\\/' + (alwaysFrom === 'topLevel' ? ('([^\\/]+\\.' + this.utils.escape_regexp(script_parts[script_parts.length - 2]) + '|' + this.utils.escape_regexp(script_parts[script_parts.length - 2]) + ')') : this.utils.escape_regexp(script_parts[0])) + '\\/.*$';
					
					if (this.allowMode) {
						if ((alwaysFrom === 'topLevel' && page_parts[0] !== script_parts[0]) || (alwaysFrom === 'domain' && page_parts[page_parts.length - 2] !== script_parts[script_parts.length - 2])) {
							event.message = 0;
							this.rules.add(host, rr, 2, true);
							break theSwitch;
						}
					} else {
						if (page_parts[0] === script_parts[0] || (alwaysFrom === 'topLevel' && page_parts[page_parts.length - 2] === script_parts[script_parts.length - 2])) {
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
			break;
			
			case 'updateFrameData':
				try {
					this.frames[event.message[0]] = this.frames[event.message[1]];
					delete this.frames[event.message[1]];
				} catch(e) {}
			break;
			
			case 'unloadPage':
				try {
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
		
		var self = this;
		
		var s = $('#setup', this.popover);
		
		if (!this.setupDone) {
			if (s.css('display') === 'block') return false;
			
			s.css('display', 'block').find('input').click(function (e) {
				self.allowMode = !$(this).is('#setup-block');
				self.setupDone = 1;
				
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
		
		try {
			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePopover');
		} catch(e) { }

		if (event && ('type' in event) && event.type == 'popover') {
			if (!this.reloaded) {
				this.reloaded = true;
				safari.extension.toolbarItems[0].popover.contentWindow.location.reload();
			}
			
			$('#rules-list-back:visible, #misc-close:visible', this.popover).click();
		} else if (!event || (event && ('type' in event) && ['navigate', 'close'].indexOf(event.type) > -1))
			new Poppy();
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