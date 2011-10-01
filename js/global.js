var JavaScriptBlocker = {	
	popover: safari.extension.toolbarItems[0].popover.contentWindow.document,
	disabled: false,
	noDeleteWarning: false,
	frames: {},
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
	active_host: function(url) {
		var r = /^(https?|file):\/\/([^\/]+)\//;
	
		if(url) return url.match(r);

		try {
			return safari.application.activeBrowserWindow.activeTab.url.match(r);
		} catch(e) {
			return ['ERROR','ERROR','ERROR'];
		}
	},
	domain_parts: function(domain) {
		var s = domain.split(/\./g).reverse(), t = s[0], p = ['*'], i, b;
		for(i = 1, b = s.length; i < b; i++)
			p.push(t = (s[i] + '.' + t));
		return p.reverse();
	},
	rules: {
		cache: {},
		for_domain: function(domain, one) {
			if(domain in this.cache && this.cache[domain].expires > +new Date) return this.cache[domain].rules;

			var parts = JavaScriptBlocker.domain_parts(domain), o = {}, i, b, c, r;

			if(one) parts = [parts[0]];

			for(i = 0, b = parts.length; i < b; i++) {
				c = ((i > 0) ? '.' : '') + parts[i];
				r = window.localStorage.getItem(c);
				if(r == null) continue;
				o[c] = JavaScriptBlocker.utils.parse_JSON(r);
			}

			this.cache[domain] = {
				expires: +new Date + 3000,
				rules: o
			};

			return o;
		},
		add: function(domain, pattern, action) {
			var current_rules = this.for_domain(domain);
			if(!(domain in current_rules)) current_rules[domain] = {};
			current_rules[domain][pattern] = action;

			return window.localStorage.setItem(domain, JSON.stringify(current_rules[domain]));
		},
		remove: function(domain, rule) {
			var current_rules = this.for_domain(domain), test = 0, key;
			if(!(domain in current_rules)) return false;

			try {
				delete current_rules[domain][rule];
			} catch(e) { }

			for(key in current_rules[domain]) {
				test++;
				break;
			}

			return (!test) ? window.localStorage.removeItem(domain) : window.localStorage.setItem(domain, JSON.stringify(current_rules[domain]));
		},
		remove_matching_URL: function(domain, url, confirmed) {
			var current_rules = this.for_domain(domain), to_delete = {}, sub, rule;

			for(sub in current_rules) {
				to_delete[sub] = [];

				for(rule in current_rules[sub]) {
					if((new RegExp(rule)).test(url)) {
						if(confirmed) delete current_rules[sub][rule];
						else to_delete[sub].push(rule);
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
					newul = ul.append('<li class="domain-name">' + ((domain[0] == '.' && domain != '.*') ? '*' + domain : (domain == '.*' ? '*. (All Domains)' : domain)) + '</li><li><ul></ul></li>').find('li:last ul');

					rules = 0;

					for(rule in allowed) {
						if((url && !(new RegExp(rule)).test(url)) || !!allowed[rule] === JavaScriptBlocker.allowMode) continue;
						rules++;
						append = newul.append('<li><span class="rule">' + rule + '</span> <input type="button" value="Delete" /><div class="divider"></div></li>');
						$('li:last', append).data('rule', rule).data('domain', domain);
					}

					$('.divider:last', newul).css('visibility', 'hidden');

					if(!rules) return $('<ul></ul>');

					$('#reset-domain', JavaScriptBlocker.popover).unbind('click').click(function() {
						if(!JavaScriptBlocker.utils.confirm_click(this)) return false;

						$('input[value="Delete"]', newul).click().click();

						JavaScriptBlocker.do_update_popover(event);

						safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
					});
				}

				$('li input', ul).click(function() {
					if(!JavaScriptBlocker.utils.confirm_click(this)) return false;

					var li = $(this).parent(), parent = li.parent();

					self.remove(li.data('domain'), li.data('rule'));

					li.remove();

					if($('li', parent).size() == 0) {
						parent.parent().prev().remove();
						parent.remove();
					}
				});
			}

			return ul;
		}
	},
	do_update_popover: function(event) {
		var self = this, jsblocker = event.message;

		if(jsblocker.href in this.frames) {
			if(safari.extension.settings.allowFrames) {
				jsblocker.unblocked.count = this.frames[jsblocker.href].length;
	 			jsblocker.unblocked.urls = jsblocker.unblocked.urls.concat(this.frames[jsblocker.href]);
			}
		}
		
		if(safari.application.activeBrowserWindow.activeTab.url == jsblocker.href) {
			var host = this.active_host(), toolbarItem = safari.extension.toolbarItems[0];
			
			$('#page-href-real', this.popover).html(safari.application.activeBrowserWindow.activeTab.url);

			toolbarItem.image = (this.disabled) ? safari.extension.baseURI + 'images/toolbar-disabled.png' : safari.extension.baseURI + 'images/toolbar.png';
			toolbarItem.badge = (safari.extension.settings.toolbarAllowed) ? jsblocker.allowed.count + jsblocker.unblocked.count : jsblocker.blocked.count;

			$('.domain-options, #allow-domain, #block-domain', JavaScriptBlocker.popover).show();

			if(jsblocker.blocked.count == 0) $('#allow-domain', JavaScriptBlocker.popover).hide();
			if(jsblocker.allowed.count == 0) $('#block-domain', JavaScriptBlocker.popover).hide();

			if(jsblocker.blocked.count == 0 || this.allowMode) $('#allow-options', JavaScriptBlocker.popover).hide();
			if(jsblocker.allowed.count == 0 || !this.allowMode) $('#block-options', JavaScriptBlocker.popover).hide();

			toolbarItem.popover.contentWindow.active_tab_url = safari.application.activeBrowserWindow.activeTab.url;

			$('#main ul', JavaScriptBlocker.popover).html('');

			var makeList = function(text, button) {
				$('#' + text + '-scripts-count', JavaScriptBlocker.popover).html(jsblocker[text].count);

				for(var i = 0; i < jsblocker[text].urls.length; i++) {
					var clean = jsblocker[text].urls[i].replace(/</g, '&lt;').replace(/>/g, '&gt;');
					var append = $('#' + text + '-script-urls ul', JavaScriptBlocker.popover).append('<li><span>' + clean + '</span></li>');
					$('li:last', append).data('url', jsblocker[text].urls[i]);
				}

				var lis = $('#' + text + '-script-urls ul', JavaScriptBlocker.popover).find('li');

				if(jsblocker[text].count > 0) lis.append('<input type="button" value="' + button + '" /><div class="divider"></div>');

				if(text == 'unblocked') $('input', lis).remove();

				if(jsblocker[text].count > 3 && jsblocker[text].count - 3 > 1) {
					$('#' + text + '-script-urls ul li:eq(2)', JavaScriptBlocker.popover).after('<li><a href="#" id="' + text + '-show-more">Show ' + (jsblocker[text].count - 3) + ' more&hellip;</a></li>');
					$('#' + text + '-script-urls ul li:gt(3)', JavaScriptBlocker.popover).hide();
				}

				$('#' + text + '-script-urls ul li .divider:last', JavaScriptBlocker.popover).css('visibility', 'hidden');

				$('#' + text + '-show-more', JavaScriptBlocker.popover).click(function() {
					$(this).parent().siblings('li').slideDown(300);
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

			$(add_rule, JavaScriptBlocker.popover).click(function(e) {
				var off = $(this).offset();
				var o = $('#allow-options', JavaScriptBlocker.popover)[0].value, store = $('#allow-options option[value="' + o + '"]', JavaScriptBlocker.popover).data('store');
				var url = $(this).parent().data('url');
			
				new Poppy(off.left + 22, off.top + 8, '<p>Rules use standard JavaScript regular expressions.<br/>Enter the pattern for the URL(s) you want to affect.</p><div class="inputs"><input type="text" id="rule-input" value="^' + self.utils.escape_regexp(url.replace(/"/g, '&quot;')) + '$"/> <input type="button" value="Save" id="rule-save" /></div>', function() {
					function save() {
						self.rules.add(store, this.val(), (self.allowMode) ? 0 : 1);

						safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');

						new Poppy(0,0,false);
					}

					var i = $('#poppy #rule-input', JavaScriptBlocker.popover).focus();

					i.keypress(function(e) {
						if(e.keyCode == 13 || e.keyCode == 3) save.call(i);
					}).siblings('#rule-save').click(save.bind(i));
				});
			});

			$(remove_rule, JavaScriptBlocker.popover).click(function(e) {
				var off = $(this).offset(), url = $(this).parent().data('url'), to_delete = self.rules.remove_matching_URL(host[2], url, false);
				var ds = [], rs = [], vs = [];

				for(d in to_delete) {
					vs.push(self.rules.view(d, url).find('input').remove().end().html());
					ds.push(d);
					rs.push(to_delete[d]);
				}

				if(self.noDeleteWarning)
					self.rules.remove_matching_URL(host[2], url, true);
				else {
					var view = vs.join('');

					new Poppy(off.left + 22, off.top + 8, 'The following rules will be deleted:<ul>' + view + '</ul>This may inadvertently affect other scripts also. <input type="button" value="Continue" id="delete-continue" />', function() {
						$('#poppy #delete-continue', JavaScriptBlocker.popover).click(function() {
							self.rules.remove_matching_URL(host[2], url, true);
							safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
							new Poppy(0,0,false);
						});
					});
				}
			});

			$((!this.allowMode) ? '#block-domain' : '#allow-domain', JavaScriptBlocker.popover).unbind('click').click(function() {
				if(!self.utils.confirm_click(this)) return false;

				self.noDeleteWarning = true;

				$(remove_rule, JavaScriptBlocker.popover).click();

				self.noDeleteWarning = false;

				safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
			});

			$((this.allowMode) ? '#block-domain' : '#allow-domain', JavaScriptBlocker.popover).unbind('click').click(function() {
				if(!self.utils.confirm_click(this)) return false;

				var o = $('.domain-options:visible', JavaScriptBlocker.popover)[0].value;
				var store = $('.domain-options:visible option[value="' + o + '"]', JavaScriptBlocker.popover).data('store');
				self.rules.remove_domain(store);
				self.rules.add(store, '.*', (self.allowMode) ? 0 : 1);
				safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
			});

			var domains = this.domain_parts(host[2]), optgroups = $('.domain-options', JavaScriptBlocker.popover).find('optgroup').html('');

			for(var i = 0, b = domains.length; i < b; i++) {
				if(domains[i] == host[2]) continue;

				optgroups.append('<option value="' + i + '">*.' + ((domains[i] == '*') ? ' (All Domains)' : domains[i]) + '</option>');
				$('option:last', optgroups).data('store', '.' + domains[i]);
			}

			optgroups.prepend('<option value="0">' + host[2] + '</option>');
			$('option:first', optgroups).data('store', host[2]);

			$('#disable', JavaScriptBlocker.popover).unbind('click').click(function() {
				if(!self.disabled)
					if(!self.utils.confirm_click(this)) return false;

				self.disabled = !self.disabled;

				this.value = ((self.disabled) ? 'Enable' : 'Disable') + ' JavaScript Blocker';

				self.do_update_popover(event);

				safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
			});

			$('#view-domain', JavaScriptBlocker.popover).unbind('click').click(function() {
				$('#rules-list', JavaScriptBlocker.popover).show();
				$('#container', JavaScriptBlocker.popover).addClass('double');

				$('#rules-list #data > ul', JavaScriptBlocker.popover).html('');

				var parts = self.domain_parts(host[2]), view;
				
				for(var i = 0, b = parts.length; i < b; i++) {
	 				view = self.rules.view(((i > 0) ? '.' : '') + parts[i]);
					$('#rules-list #data > ul', JavaScriptBlocker.popover).append($('> *', view));
				}

				if($('#rules-list #data > ul li', JavaScriptBlocker.popover).length == 0)
					$('#rules-list #data > ul', JavaScriptBlocker.popover).append('<li>No rules exist for ' + host[2] + '</li>');

				$('body', JavaScriptBlocker.popover).animate({
					scrollLeft: $('body', JavaScriptBlocker.popover).width()
				}, 250, 'swing', function() {
					$('#main', JavaScriptBlocker.popover).hide();
					$('#container', JavaScriptBlocker.popover).removeClass('double');
				});
			});

			$('#view-all', JavaScriptBlocker.popover).unbind('click').click(function() {
				$('#rules-list', JavaScriptBlocker.popover).show();
				$('#container', JavaScriptBlocker.popover).addClass('double');
				
				var ul = $('#rules-list #data > ul', JavaScriptBlocker.popover);

				ul.html('');

				var s = self.utils.sort_object(window.localStorage), domain, view;
				
				for(domain in s) {
					view = self.rules.view(domain);
					ul.append($('> *', view));
				}

				if($('li', ul).length == 0)
					ul.append('<li>You haven\'t created any rules yet.</li>');

				$('body', JavaScriptBlocker.popover).animate({
					scrollLeft: $('body', JavaScriptBlocker.popover).width()
				}, 250, 'swing', function() {
					$('#main', JavaScriptBlocker.popover).hide();
					$('#container', JavaScriptBlocker.popover).removeClass('double');
				});
			});

			$('#rules-list #rules-list-back', JavaScriptBlocker.popover).unbind('click').click(function() {
				$('#container', JavaScriptBlocker.popover).addClass('double');
				$('body', JavaScriptBlocker.popover).scrollLeft($('body', JavaScriptBlocker.popover).width());
				$('#main', JavaScriptBlocker.popover).show();

				$('body', JavaScriptBlocker.popover).animate({
					scrollLeft: 0
				}, 250, 'swing', function() {
					$('#rules-list', JavaScriptBlocker.popover).hide();
					$('#container', JavaScriptBlocker.popover).removeClass('double');
				});
			});
		}
	},
	handle_message: function(event) {
		theSwitch:
		switch(event.name) {
			case 'canLoad':
				var allowFrames = safari.extension.settings.allowFrames;

				if(this.disabled || (allowFrames && event.message[2])) {
					event.message = true;
					break theSwitch;
				}

				var host = this.active_host(event.message[0]), domains = this.rules.for_domain(host[2]), domain, rule;
	
				for(domain in domains)
					for(rule in domains[domain]) {
						if(rule.length < 1 || domains[domain][rule] == this.allowMode) continue;
						if((new RegExp(rule)).test(event.message[1])) {
							event.message = domains[domain][rule];
							break theSwitch;
						}
					}

				event.message = this.allowMode;
			break;

			case 'updatePopover':
				var self = this;
				if(this.updatePopoverTimeout) clearTimeout(this.updatePopoverTimeout);
				this.updatePopoverTimeout = setTimeout(function() {
					self.do_update_popover(event);
				}, 100);
			break;

			case 'updateFrameData':
				this.frames[event.message[1].href] = event.message[0];
			break;

			case 'unloadPage':
				try {
					delete _framesCache[event.message];
				} catch (e) { }
			break;
		}
	},
	open_popover: function(event) {
		if(!this.setupDone) {
			var self = this;
			$('#setup', JavaScriptBlocker.popover).css('display', 'block').find('input').click(function(e) {
				self.allowMode = !$(this).is('#setup-block');
				
				new Poppy(e.pageX, e.pageY, '<p>Would you like to install a predefined ' + (self.allowMode ? 'blacklist' : 'whitelist') + ' of "' + (self.allowMode ? 'bad' : 'safe') + '" scripts? After installing the list, you can manually delete entries you don\'t want by clicking Show All Rules.</p><div class="inputs"><input type="button" value="No Thanks" id="setup-no" /><input type="button" value="View ' + (self.allowMode ? 'Blacklist' : 'Whitelist') + '" id="setup-view" /><input type="button" value="Install ' + (self.allowMode ? 'Blacklist' : 'Whitelist') + '" id="setup-install" /></div>', function() {
					var list = (self.allowMode ? JavaScriptBlockerBlacklist : JavaScriptBlockerWhitelist);
					
					$('#setup-view', self.popover).click(function() {
						var ele = $('<div><ul></ul><div class="inputs"></div></div>'), ul = ele.find('ul'), name, rule;
						
						$('.inputs', ele).append($('#poppy-content .inputs', self.popover).find('#setup-no, #setup-install'));
						
						for(name in list) {
							var newul = ul.append('<li class="domain-name">' + name + '</li><li><ul></ul></li>').find('li:last ul');
							
							for(var i = 0, b = list[name].length; i < b; i++) {
								rule = list[name];
								newul.append('<li><span class="rule">' + rule + '</span><div class="divider"></div></li>')
							}
							
							$('.divider:last', newul).css('visibility', 'hidden');
						}
						
						new Poppy(e.pageX, e.pageY, ele);
					});
					
					$('#setup-install', self.popover).click(function() {
						self.setupDone = 1;
						
						var name;
						
						for(name in list)
							for(var i = 0, b = list[name].length; i < b; i++)
								self.rules.add('.*', list[name][i], (self.allowMode ? 0 : 1));
						
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
		
		$('#setup', JavaScriptBlocker.popover).hide(350);

		try {
			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updateToolbar');
		} catch(e) { }

		if(event && event.type && event.type == 'popover')
			$('#rules-list-back', this.popover).click();
		else if(event && event.type && ['navigate', 'close'].indexOf(event.type) > -1)
			new Poppy(0,0,false);
	},
	validate: function(event) {
		try {
			event.target.disabled = !event.target.browserWindow.activeTab.url;

			if(event.target.disabled)
				event.target.badge = 0;
		} catch(e) { }
	}
};

if(!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if(typeof this !== 'function')
			throw new TypeError('Function.prototype.bind - what is trying to be fBound is not callable');

		var aArgs = Array.prototype.slice.call(arguments, 1), 
			fToBind = this, 
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));		
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
  };
}