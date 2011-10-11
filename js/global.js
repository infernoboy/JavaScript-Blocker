var JavaScriptBlocker = {
	disabled: false,
	noDeleteWarning: false,
	frames: {},
	_deletedAutomaticRulesCache: null,
	_cleanup: setInterval($.proxy(function() {
		var new_frames = {}, i, b, j, c;
		for(i = 0, b = safari.application.browserWindows.length; i < b; i++) {
			for(j = 0, c = safari.application.browserWindows[i].tabs.length; j < c; j++) {
				if(this.frames[safari.application.browserWindows[i].tabs[j].url])
					new_frames[safari.application.browserWindows[i].tabs[j].url] = this.frames[safari.application.browserWindows[i].tabs[j].url];
			}
		}
		
		
		this.frames = new_frames;
		
		var key, i = 1;
		for(key in window.localStorage) {
			if(!window.localStorage.hasOwnProperty(key)) continue;
			
			setTimeout($.proxy(function() {
				if(window.localStorage[this[0]] === '{}')
					window.localStorage.removeItem(this[0]);
			}, [key]), 10 * i++);
		}
	}, JavaScriptBlocker), 1000 * 60 * 5),
	_d: function() {
		if(this.debug) console.log.apply(console, arguments);
	},
	get allowMode() {
		return safari.extension.settings.allowMode;
	},
	set allowMode(mode) {
		safari.extension.settings.allowMode = mode;
	},
	get setupDone() {
		return parseInt(safari.extension.settings.setupDone);
	},
	set setupDone(done) {
		safari.extension.settings.setupDone = done;
	},
	get deletedAutomaticRules() {
		if(this._deletedAutomaticRulesCache !== null) return this._deletedAutomaticRulesCache;
		this._deletedAutomaticRulesCache = JSON.parse(window.localStorage.getItem('DeletedAutomaticRules'));
		return this._deletedAutomaticRulesCache;
	},
	set deletedAutomaticRules(rules) {
		this._deletedAutomaticRulesCache = null;
		window.localStorage.setItem('DeletedAutomaticRules', JSON.stringify(rules));
	},
	get debug() {
		return safari.extension.settings.debug;
	},
	set debug(i) {
		safari.extension.settings.debug = i;
	},
	utils: {
		sort_object: function(o) {
			var s = {}, k, b, a = [];
			for(k in o) {
				if(o.hasOwnProperty(k))
					a.push(k);
			}
			a.sort();
			for(k = 0, b = a.length; k < b; k++)
				s[a[k]] = o[a[k]];
			return s;
		},
		parse_JSON: function(s) {
			try {
				return JSON.parse(s);
			} catch(e) { return false; }
		},
		escape_regexp: function(text) {
			if(!text || !text.length) return text;
			return text.replace(new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '$', '^', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')', 'g'), '\\$1');
		},
		confirm_click: function(e) {
			var $e = $(e);

			if(e.className.indexOf('confirm-click') == -1) {
				$e.data('confirm_timeout', setTimeout(function() {
					$e.removeClass('confirm-click');
				}, 3000));

				e.className += ' confirm-click';

				return false;
			}

			clearTimeout($e.data('confirm_timeout'));

			$e.removeClass('confirm-click');

			return true;
		}
	},
	_active_host_cache: {},
	active_host: function(url) {
		if(url in this._active_host_cache) return this._active_host_cache[url];
		var r = /^(https?|file):\/\/([^\/]+)\//;	
		if(url) return (/^data/.test(url)) ? (this._active_host_cache[url] = [null, 'DataURI', null]) : (this._active_host_cache[url] = url.match(r));

		try {
			return (this._active_host_cache[url] = safari.application.activeBrowserWindow.activeTab.url.match(r));
		} catch(e) {
			return ['ERROR','ERROR','ERROR'];
		}
	},
	_domain_parts_cache: {},
	domain_parts: function(domain) {
		var x;
		if(domain in this._domain_parts_cache) return this._domain_parts_cache[domain];
		var s = domain.split(/\./g).reverse(), t = s[0], p = ['*'], i, b;
		for(i = 1, b = s.length; i < b; i++)
			p.push(t = (s[i] + '.' + t));
		this._domain_parts_cache[domain] = p.reverse();
		return this._domain_parts_cache[domain];
	},
	rules: {
		cache: {},
		for_domain: function(domain, one) {
			if((domain in this.cache) && this.cache[domain].expires > +new Date) return this.cache[domain].rules;
			
			var parts = this.__proto__.domain_parts(domain), o = {}, i, b, c, r;

			if(one) parts = [parts[0]];

			for(i = 0, b = parts.length; i < b; i++) {
				c = ((i > 0) ? '.' : '') + parts[i];
				r = window.localStorage.getItem(c);
				if(r == null) continue;
				o[c] = this.__proto__.utils.parse_JSON(r);
			}

			this.cache[domain] = {
				expires: +new Date + 5000,
				rules: o
			};

			return o;
		},
		add: function(domain, pattern, action, add_to_beginning) {
			var current_rules = this.for_domain(domain);
			if(!add_to_beginning) {
				if(!(domain in current_rules)) current_rules[domain] = {};
				else if(pattern in current_rules[domain]) return false;
			}
			
			if(add_to_beginning) {
				var new_rules = {};
				new_rules[domain] = {};
				new_rules[domain][pattern] = action;
				
				var e;
				if(domain in current_rules)
					for(e in current_rules[domain])
						new_rules[domain][e] = current_rules[domain][e];
				
				current_rules = new_rules;
			} else
				current_rules[domain][pattern] = action;
			
			delete this.cache[domain];

			return window.localStorage.setItem(domain, JSON.stringify(current_rules[domain]));
		},
		deleted_automatic_rule: function(sub, rule) {
			var current_rules = this.__proto__.deletedAutomaticRules;
			if(current_rules === null) current_rules = {};
			if(!(sub in current_rules)) current_rules[sub] = [];
			if(current_rules[sub].indexOf(rule) > -1) return false;
			
			current_rules[sub].push(rule);
			
			this.__proto__.deletedAutomaticRules = current_rules;
		},
		remove: function(domain, rule) {
			var current_rules = this.for_domain(domain), key;
			if(!(domain in current_rules)) return false;

			try {
				delete current_rules[domain][rule];
			} catch(e) { }

			return ($.isEmptyObject(current_rules[domain])) ? window.localStorage.removeItem(domain) : window.localStorage.setItem(domain, JSON.stringify(current_rules[domain]));
		},
		remove_matching_URL: function(domain, url, confirmed) {
			var current_rules = this.for_domain(domain), to_delete = {}, sub, rule;

			for(sub in current_rules) {
				to_delete[sub] = [];

				for(rule in current_rules[sub]) {
					if((new RegExp(rule)).test(url)) {
						if(confirmed) {
							if(current_rules[sub][rule] > 1) this.deleted_automatic_rule(sub, rule);
							delete current_rules[sub][rule];
						} else to_delete[sub].push(rule);
					}
				}

				if(!confirmed) {
					if(!to_delete[sub].length) delete to_delete[sub];
				} else
			 		window.localStorage.setItem(sub, JSON.stringify(current_rules[sub]));
			}

			return (confirmed) ? 1 : to_delete;
		},
		remove_domain: function(domain) {
			return window.localStorage.removeItem(domain);
		},
		remove_all: function() {
			return window.localStorage.clear();
		},
		view: function(domain, url) {
			var self = this, allowed = this.for_domain(domain, true), ul = $('<ul></ul>'), newul, rules, rule, append;
			
			if(domain in allowed) {
				allowed = allowed[domain];

				if('{}' != JSON.stringify(allowed)) {
					newul = ul.append('<li class="domain-name">' + ((domain[0] == '.' && domain != '.*') ? '*' + domain : (domain == '.*' ? 'All Domains' : domain)) + '</li><li><ul></ul></li>').find('li:last ul');
					rules = 0;

					for(rule in allowed) {
						if((url && !(new RegExp(rule)).test(url)) || (!!(allowed[rule] % 2) === this.allowMode && allowed[rule] < 4)) continue;
						rules++;
						append = newul.append('<li><span class="rule type-' + allowed[rule] + '">' + rule + '</span> <input type="button" value="Delete" /><div class="divider"></div></li>');
						$('li:last', append).data('rule', rule).data('domain', domain);
					}
					
					if(!rules) return $('<ul></ul>');

					$('.divider:last', newul).css('visibility', 'hidden');

					$('#reset-domain', this.__proto__.popover).unbind('click').click(function() {
						if(!self.__proto__.utils.confirm_click(this)) return false;

						$('input[value="Delete"]', newul).click().click();

						self.__proto__.do_update_popover(event);

						safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
					});
				}

				$('li input', ul).click(function() {
					if(!self.__proto__.utils.confirm_click(this)) return false;

					var li = $(this).parent(), parent = li.parent();
				
					self.remove(li.data('domain'), li.data('rule'));

					li.remove();
					
					if(li.is(':last')) $('.divider:last', parent).css('visibility', 'hidden');

					if($('li', parent).size() == 0) {
						parent.parent().prev().remove();
						parent.remove();
					}
				});
			}

			return ul;
		}
	},
	do_update_popover: function(event, index) {
		var self = this, jsblocker = event.message;
	
		if(safari.application.activeBrowserWindow.activeTab.url == jsblocker.href) {
			var page_list = $('#page-list', this.popover), frames_blocked_count = 0, frames_allowed_count = 0, frame, inline, c, c0;
			
			c = (!this.allowMode ? 'allowing' : 'blocking');
			c0 = (this.allowMode ? 'allowing' : 'blocking');
			
			$('#container', this.popover).addClass(c + '-mode').removeClass(c0 + '-mode');
			
			page_list.find('optgroup:eq(1)').remove();
	
/*			for(frame in jsblocker.frames) {
				if(page_list.find('optgroup').length == 1) inline = $('<optgroup label="Inline Frame Pages"></optgroup>').appendTo(page_list);
				else inline = page_list.find('optgroup:eq(1)');
			
				if(typeof index == 'undefined') {
					frames_blocked_count += jsblocker.frames[frame].blocked.count;
					frames_allowed_count += jsblocker.frames[frame].allowed.count;
					frames_allowed_count += jsblocker.frames[frame].unblocked.count;
				}
				
				$('<option></option>').addClass('frame-page').attr('value', jsblocker.frames[frame].href).html(jsblocker.frames[frame].href).appendTo(inline);
			}
*/

			if(jsblocker.href in this.frames) {
				var frame, inline, xx;

				for(frame in this.frames[jsblocker.href]) {
					xx = this.frames[jsblocker.href];
					
					if(page_list.find('optgroup').length == 1) inline = $('<optgroup label="Inline Frame Pages"></optgroup>').appendTo(page_list);
					else inline = page_list.find('optgroup:eq(1)');
				
					if(typeof index === 'undefined') {
						frames_blocked_count += xx[frame].blocked.count;
						frames_allowed_count += xx[frame].allowed.count;
						frames_allowed_count += xx[frame].unblocked.count;
					}
				
					$('<option></option>').addClass('frame-page').attr('value', xx[frame].href).html(xx[frame].href).appendTo(inline);
				}
			}
			
			page_list.find('optgroup:first option').attr('value', jsblocker.href).html(jsblocker.href);
			
			if(typeof index == 'number' && index > 0) {
				page_list[0].selectedIndex = index;
			//	jsblocker = jsblocker.frames[page_list.val()];
				jsblocker = this.frames[jsblocker.href][page_list.val()];
			}
						
			page_list.unbind('change').change(function() {
				self.do_update_popover(event, this.selectedIndex);
			});
			
			var host = this.active_host(page_list.val()), toolbarItem = safari.extension.toolbarItems[0];

			toolbarItem.image = (this.disabled) ? safari.extension.baseURI + 'images/toolbar-disabled.png' : safari.extension.baseURI + 'images/toolbar.png';
			toolbarItem.badge = (safari.extension.settings.toolbarDisplay === 'allowed') ? jsblocker.allowed.count + jsblocker.unblocked.count + frames_allowed_count : (safari.extension.settings.toolbarDisplay === 'blocked' ? jsblocker.blocked.count + frames_blocked_count : 0);

			$('.domain-options, #allow-domain, #block-domain', this.popover).show();

			if(jsblocker.blocked.count == 0) $('#allow-domain', this.popover).hide();
			if(jsblocker.allowed.count == 0) $('#block-domain', this.popover).hide();

			if(jsblocker.blocked.count == 0 || this.allowMode) $('#allow-options', this.popover).hide();
			if(jsblocker.allowed.count == 0 || !this.allowMode) $('#block-options', this.popover).hide();

			toolbarItem.popover.contentWindow.active_tab_url = safari.application.activeBrowserWindow.activeTab.url;

			$('#main ul', this.popover).html('');

			var makeList = function(text, button) {
				var ul = $('#' + text + '-script-urls ul', self.popover);
				
				$('#' + text + '-scripts-count', self.popover).html(jsblocker[text].count);

				for(var i = 0; i < jsblocker[text].urls.length; i++)
					ul.append('<li><span>' + jsblocker[text].urls[i].replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span><input type="button" value="' + button + '" /><div class="divider"></div></li>').find('li:last').data('url', jsblocker[text].urls[i]);

				if(text === 'unblocked') $('li input', ul).remove();

				if(jsblocker[text].count > 3 && jsblocker[text].count - 3 > 1) {
					$('li:eq(2)', ul).after('<li><a href="javascript:void(1)" class="show-more">Show ' + (jsblocker[text].count - 3) + ' more&hellip;</a></li>');
					$('li:gt(3)', ul).hide();
				}

				$('.divider:last', ul).css('visibility', 'hidden');

				$('.show-more', ul).click(function() {
					$(this).parent().siblings('li:hidden').slideDown(300);
					$(this).parent().remove();
				});
			}

			makeList('blocked', 'Allow');
			makeList('allowed', 'Block');
			makeList('unblocked', 'Sorry');

			var add_rule, remove_rule;

			if(!this.allowMode) {
				add_rule = '#blocked';
				remove_rule = '#allowed';
			} else {
				add_rule = '#allowed';
				remove_rule = '#blocked';
			}

			add_rule += '-script-urls ul input';
			remove_rule += '-script-urls ul input';

			$(add_rule, this.popover).click(function(e) {
				var off = $(this).offset(),
					o = $('#allow-options', self.popover)[0].value,
					store = $('#allow-options option[value="' + o + '"]', self.popover).data('store'),
					url = $(this).parent().data('url');
			
				new Poppy(off.left + 22, off.top + 8, '<p>Rules use standard JavaScript regular expressions.<br/>Enter the pattern for the URL(s) you want to affect.</p><div class="inputs"><input type="text" id="rule-input" value="^' + self.utils.escape_regexp(url.replace(/"/g, '&quot;')) + '$"/> <input type="button" value="Save" id="rule-save" /></div>', function() {
					function save() {
						self.rules.add(store, this.val(), (self.allowMode) ? 0 : 1);

						safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');

						new Poppy();
					}

					var i = $('#poppy #rule-input', self.popover).focus();

					i.keypress(function(e) {
						if(e.keyCode == 13 || e.keyCode == 3) save.call(i);
					}).siblings('#rule-save').click($.proxy(save, i));
				});
			});

			$(remove_rule, this.popover).click(function(e) {
				var off = $(this).offset(),
					url = $(this).parent().data('url'),
					to_delete = self.rules.remove_matching_URL(host[2], url, false),
					ds = [], rs = [], vs = [];

				for(d in to_delete) {
					vs.push(self.rules.view(d, url).find('input').remove().end().html());
					ds.push(d);
					rs.push(to_delete[d]);
				}

				if(self.noDeleteWarning)
					self.rules.remove_matching_URL(host[2], url, true);
				else {
					var view = vs.join('');

					new Poppy(off.left + 22, off.top + 8, 'The following rule(s) will be deleted:<ul class="' + (!self.allowMode ? 'allowing' : 'blocking') + '-mode">' + view + '</ul>This may inadvertently affect other scripts. <input type="button" value="Continue" id="delete-continue" />', function() {
						$('#poppy #delete-continue', self.popover).click(function() {
							self.rules.remove_matching_URL(host[2], url, true);
							safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
							new Poppy();
						});
					});
				}
			});

			$((!this.allowMode) ? '#block-domain' : '#allow-domain', this.popover).unbind('click').click(function() {
				if(!self.utils.confirm_click(this)) return false;

				self.noDeleteWarning = true;

				$(remove_rule, self.popover).click();

				self.noDeleteWarning = false;

				safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
			});

			$((this.allowMode) ? '#block-domain' : '#allow-domain', this.popover).unbind('click').click(function() {
				if(!self.utils.confirm_click(this)) return false;

				var o = $('.domain-options:visible', self.popover)[0].value,
					store = $('.domain-options:visible option[value="' + o + '"]', self.popover).data('store');
				self.rules.remove_domain(store);
				self.rules.add(store, '.*', (self.allowMode) ? 0 : 1);
				safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
			});

			var domains = this.domain_parts(host[2]), optgroups = $('.domain-options', this.popover).find('optgroup').html('');

			for(var i = 0, b = domains.length; i < b; i++) {
				if(domains[i] == host[2]) continue;

				optgroups.append('<option value="' + i + '">' + ((domains[i] == '*') ? 'All Domains' : '*.' + domains[i]) + '</option>');
				$('option:last', optgroups).data('store', '.' + domains[i]);
			}

			optgroups.prepend('<option value="0">' + host[2] + '</option>');
			$('option:first', optgroups).data('store', host[2]);

			$('#disable', this.popover).unbind('click').click(function() {
				if(!self.disabled && !self.utils.confirm_click(this)) return false;

				self.disabled = !self.disabled;

				this.value = ((self.disabled) ? 'Enable' : 'Disable') + ' JavaScript Blocker';

				self.do_update_popover(event);

				safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
			});
			
			$('#view-rules', this.popover).unbind('click').click(function(e) {
				new Poppy(e.pageX, e.pageY, '<input type="button" value="All Rules" id="view-all" /> <input type="button" value="Active Rules" id="view-domain" />', function() {
					$('#view-domain', self.popover).click(function() {
						new Poppy();
						
						$('#rules-list', self.popover).show().parents('#container').addClass('double');
						
						var ul = $('#rules-list #data > ul', self.popover).html(''), parts = self.domain_parts(host[2]);
				
						for(var i = 0, b = parts.length; i < b; i++)
							ul.append($('> *', self.rules.view(((i > 0) ? '.' : '') + parts[i])));

						if($('li', ul).length == 0)
							ul.append('<li>No rules exist for ' + host[2] + '</li>');

						$('body', self.popover).animate({
							scrollLeft: $('body', self.popover).width()
						}, 250, 'swing', function() {
							$('#main', self.popover).hide().parents('#container').removeClass('double');
						});
					}).siblings('#view-all').click(function() {
						new Poppy();
						
						$('#rules-list', self.popover).show().parents('#container').addClass('double');
				
						var ul = $('#rules-list #data > ul', self.popover), s = self.utils.sort_object(window.localStorage), domain;

						ul.html('');
						
						for(domain in s)
							ul.append($('> *', self.rules.view(domain)));

						if($('li', ul).length == 0)
							ul.append('<li>No rules have been created.</li>');

						$('body', self.popover).animate({
							scrollLeft: $('body', self.popover).width()
						}, 250, 'swing', function() {
							$('#main', self.popover).hide().parents('#container').removeClass('double');
						});
					});
				});
			});
			
			$('#reset-always', this.popover).unbind('click').click(function(e) {
				new Poppy(e.pageX, e.pageY, '<input type="button" value="For All Domains" id="dynamic-all" /> <input type="button" value="For ' + host[2].replace(/"/g, '&quot;') + '" id="dynamic-domain" />', function() {
					$('#dynamic-all', this).click(function() {
						self.deletedAutomaticRules = null;
						new Poppy(e.pageX, e.pageY, 'All automatic rules have been restored.');
					}).siblings('#dynamic-domain').click(function() {
						var c = self.deletedAutomaticRules;
						
						if(c !== null && (host[2] in c)) delete c[host[2]];
						
						self.deletedAutomaticRules = c;
						
						new Poppy(e.pageX, e.pageY, 'Automatic rules have been restored for ' + host[2]);
					});
				});
			});

			$('#rules-list #rules-list-back', this.popover).unbind('click').click(function() {
				$('#container', self.popover).addClass('double')
					.parents('body').scrollLeft($('body', self.popover).width())
					.find('#main').show()
					.parents('body').animate({
							scrollLeft: 0
						}, 250, 'swing', function() {
							$('#rules-list', self.popover).hide();
							$('#container', self.popover).removeClass('double');
						});
					});
		}
	},
	setting_changed: function(event) {
		if(['alwaysBlock', 'alwaysAllow', 'allowMode'].indexOf(event.key) > -1) {
			var key, rules, rule, n;
			
			if(event.key === 'allowMode')	n = (event.newValue === false) ? 3 : 2;
			else n = (event.key === 'alwaysBlock') ? 5 : 4;
			
			window.localStorage.removeItem('DeletedAutomaticRules');
			
			var is_nowhere = ((((event.key === 'allowMode') ? safari.extension.settings.alwaysBlock : safari.extension.settings.alwaysAllow) === 'nowhere') || event.newValue == 'nowhere');
			
			if(event.key === 'allowMode')
				if(this.allowMode || event.newValue === false)
					safari.extension.settings.alwaysBlock = 'nowhere';
				else
					safari.extension.settings.alwaysAllow = 'nowhere';
			
			for(key in window.localStorage) {
				if(window.localStorage.hasOwnProperty(key)) {
					rules = JSON.parse(window.localStorage[key], function(rule, action) {
						if(rule === '') return action;
						if(!(action > 1 && ((is_nowhere && action > 3 && action % 2 !== n % 2) || (action % 2 == n % 2))))
							return action;
						return undefined;
					});
					window.localStorage.setItem(key, JSON.stringify(rules));
				}
			}
				
			if(event.newValue !== 'nowhere' || event.key === 'allowMode') {
				var str = (event.key === 'alwaysBlock' || event.newValue === false) ? 'Would you like to install a predefined whitelist of "safe" scripts to never block?' : 'Would you like to install a predefined blacklist of "bad" scripts to never allow?';
				var c = confirm(str);
			
				if(c) {
					var name, i, b, list = (event.key === 'alwaysBlock' || event.newValue === false) ? this.rules.whitelist : this.rules.blacklist;

					for(name in list)
						for(i = 0, b = list[name].length; i < b; i++)
							this.rules.add('.*', list[name][i], n);
						
					alert('List installed.');
				}
			}
		}
	},
	handle_message: function(event) {
		theSwitch:
		switch(event.name) {
			case 'canLoad':
				if(this.disabled) {
					event.message = true;
					break theSwitch;
				}
				
				var rule_found = false,
					host = this.active_host(event.message[0]),
					domains = this.rules.for_domain(host[2]), domain, rule;
					alwaysFrom = (this.allowMode) ? safari.extension.settings.alwaysBlock : safari.extension.settings.alwaysAllow;
				
				domainFor:
				for(domain in domains) {
					for(rule in domains[domain]) {
						if(rule.length < 1 || (domains[domain][rule] < 4 && domains[domain][rule] % 2 == this.allowMode) || (domains[domain][rule] >= 4 && domains[domain][rule] % 2 != this.allowMode)) continue;
						if((new RegExp(rule)).test(event.message[1])) {
							rule_found = domains[domain][rule] % 2;
							if(domains[domain][rule] < 2) break domainFor;
						}
					}
				}
								
				if(rule_found !== false) {
					event.message = rule_found;
					break;
				}
								
				if(alwaysFrom !== 'none') {
					var page_parts = this.domain_parts(host[2]),
						script_parts = this.domain_parts(this.active_host(event.message[1])[2]),
						rr = '^https?:\\/\\/' + (alwaysFrom === 'topLevel' ? ('([^\\/]+\\.' + script_parts[script_parts.length - 2] + '|' + script_parts[script_parts.length - 2] + ')') : script_parts[0]) + '\\/.*$';
					
					if(!(this.deletedAutomaticRules !== null && (host[2] in this.deletedAutomaticRules) && this.deletedAutomaticRules[host[2]].indexOf(rr) > -1)) {
						if(this.allowMode) {
							if((alwaysFrom === 'topLevel' && page_parts[0] !== script_parts[0]) || (alwaysFrom === 'domain' && page_parts[page_parts.length - 2] !== script_parts[script_parts.length - 2])) {
								event.message = 0;
								this.rules.add(host[2], rr, 2, true);
								break theSwitch;
							}
						} else {
							if(page_parts[0] === script_parts[0] || (alwaysFrom === 'topLevel' && page_parts[page_parts.length - 2] === script_parts[script_parts.length - 2])) {
								event.message = 1;
								this.rules.add(host[2], rr, 3, true);
								break theSwitch;
							}
						}
					}
				}
		
				event.message = this.allowMode;
			break;

			case 'updatePopover':
				if(event.target != safari.application.activeBrowserWindow.activeTab) break;
			
				var self = this;
				if(this.updatePopoverTimeout) clearTimeout(this.updatePopoverTimeout);
				this.updatePopoverTimeout = setTimeout(function() {
					self.do_update_popover(event);
				}, 100);
			break;
			
			case 'addFrameData':
				try {
					delete this.frames[event.message[2]];
				} catch (e) {}
				
				if(!(event.target.url in this.frames)) this.frames[event.target.url] = {};
				
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
	open_popover: function(event) {
		if(typeof event !== 'undefined' && ('type' in event) && ['beforenavigate', 'close'].indexOf(event.type) > -1) safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('unloadPage');
		
		if(!this.setupDone) {
			var self = this;
			$('#setup', this.popover).css('display', 'block').find('input').click(function(e) {
				self.allowMode = !$(this).is('#setup-block');
				
				new Poppy(e.pageX, e.pageY, '<p>Would you like to install a predefined ' + (self.allowMode ? 'blacklist' : 'whitelist') + ' of "' + (self.allowMode ? 'bad' : 'safe') + '" scripts? After installing the list, you can manually delete entries you don\'t want by clicking Show Rules > All Rules.</p><div class="inputs"><input type="button" value="No Thanks" id="setup-no" /><input type="button" value="View ' + (self.allowMode ? 'Blacklist' : 'Whitelist') + '" id="setup-view" /><input type="button" value="Install ' + (self.allowMode ? 'Blacklist' : 'Whitelist') + '" id="setup-install" /></div>', function() {
					var list = (self.allowMode ? self.rules.blacklist : self.rules.whitelist);
					
					$('#setup-view', self.popover).click(function() {
						var ele = $('<div class="' + (!self.allowMode ? 'allowing' : 'blocking') + '-mode"><ul></ul><div class="inputs"></div></div>'), ul = ele.find('ul'), name, rule;
						
						$('.inputs', ele).append($('#poppy-content .inputs', self.popover).find('#setup-no, #setup-install'));
						
						for(name in list) {
							var newul = ul.append('<li class="domain-name">' + name + '</li><li><ul></ul></li>').find('li:last ul');
							
							for(var i = 0, b = list[name].length; i < b; i++)
								newul.append('<li><span class="rule">' + list[name][i] + '</span><div class="divider"></div></li>')
							
							$('.divider:last', newul).css('visibility', 'hidden');
						}
						
						new Poppy(e.pageX, e.pageY, ele);
					});
					
					$('#setup-install', self.popover).click(function() {
						self.setupDone = 1;
						
						var name, i, b;
						
						for(name in list)
							for(i = 0, b = list[name].length; i < b; i++)
								self.rules.add('.*', list[name][i], (self.allowMode ? 2 : 3));
						
						new Poppy(e.pageX, e.pageY, '<p>The ' + (self.allowMode ? 'blacklist' : 'whitelist') + ' has been successfully installed.</p><div class="inputs"><input type="button" value="Continue" id="setup-continue" /></div>', function() {
							$('#setup-continue', self.popover).click(function() {
								self.open_popover();
							})
						});
					});
					
					$('#setup-no', self.popover).click(function() {
						self.setupDone = 1;
						self.open_popover();
					});
				});
			});
			
			return false;
		}
		
		$('#setup', this.popover).hide(350);

		try {
			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePopover');
		} catch(e) { }

		if(event && ('type' in event) && event.type == 'popover')
			$('#rules-list-back', this.popover).click();
		else if(!event || (event && ('type' in event) && ['navigate', 'close'].indexOf(event.type) > -1))
			new Poppy();
	},
	validate: function(event) {
		try {
			this.popover = safari.extension.toolbarItems[0].popover.contentWindow.document;
			
			event.target.disabled = !event.target.browserWindow.activeTab.url;

			if(event.target.disabled)
				event.target.badge = 0;
		} catch(e) { }
	}
};

JavaScriptBlocker.rules.__proto__ = JavaScriptBlocker;