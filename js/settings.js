"use strict";

var beforeLoad = {'url':'','returnValue':true,'timeStamp':1334608269228,'eventPhase':0,'target':null,'defaultPrevented':false,'srcElement':null,'type':'beforeload','cancelable':false,'currentTarget':null,'bubbles':false,'cancelBubble':false},
		speedMultiplier = 1,
		Settings = {
	loaded: 0,
	tba: 0,
	bind_events: function () {
		var self = this;

		$(document.body).click(function (e) {
			if (e.target && e.target.nodeName === 'BODY')
				safari.self.tab.dispatchMessage('closeSettings');
		});
		
		$('#toolbar').on('click', 'li', function () {
			if ($(this).hasClass('selected')) return false;
			if (self.tba) return setTimeout(function (self) {
				self.click();
			}, 600, $(this));

			window.location.hash = this.id;
			
			try {
				window.localStorage.setItem('tab', this.id);
			} catch (e) {}

			self.tba = 1;

			var c = $('#container'),
					ac = $('section.active'),
					sec = $(this).siblings('li').removeClass('selected').end().addClass('selected').attr('id').substr(4),
					ph = c.height();
					
			c.css('WebkitTransition', 'height ' + (.2 * speedMultiplier) + 's').addClass('no-transition');

			var s = $('section').removeClass('active').filter('#' + sec).addClass('active').css('opacity', 0);
					
			if (sec !== 'about') {
				var ul = s.find('ul').empty();
			
				for (var setting in Settings.settings[sec])
					Settings.make_setting(sec, setting, Settings.settings[sec][setting], ul);
			}
			
			if (sec === 'search') $('#for-search input').trigger('search');
						
			var nh = c.height();

			c.height(ph);
	
			zero_timeout(function (c, nh, s, self) {
				function end () {
					$('section').css({
						position: 'relative',
						bottom: 'auto'
					});
										
					ac.css({ display: '', opacity: 1 });
					
					c.addClass('no-transition').height('auto');
				}
				
				if (self.current_value('animations')) c.removeClass('no-transition');
				
				$('section').css({
					position: 'absolute',
					bottom: 30
				});
				
				ac.show().fadeTo(Settings.current_value('animations') ? 200 * speedMultiplier : 0.001, 0);
				
				c.height(nh).one('webkitTransitionEnd', end);
								
				s.animate({
					opacity: 1
				}, {
					duration: Settings.current_value('animations') ? 200 * speedMultiplier : 0.001,
					complete: function () {
						self.tba = 0;
					},
					step: function () {
						document.body.scrollTop = 0;
					}
				});
				
				if (!self.current_value('animations')) end();
			}, [c, nh, s, self]);
		});
		
		$(document).on('click', 'a', function (e) {
			e.stopImmediatePropagation();
			
			var h = this.getAttribute('href');
			
			if (h.charAt(0) === '#') {
				window.location.hash = h.substr(1);
				$(window.location.hash).click();
				return true;
			}

			switch (this.id) {
				case 'search-simple':
					$('#for-search input').val(_(Settings.settings.other.simpleReferrer.label)).trigger('search');
				break;
			}
		});
		
		$(document.body).on('change', 'section select, section input[type="checkbox"]', function () {
			var li = $(this).parents('li'),
					id = li.attr('id'),
					setting = li.attr('data-setting'),
					group = li.data('group');
			
			if (this.value === 'other') {
				var pr = prompt(Settings.settings[group][setting].prompt).replace(/"/g, ''),
						t = $('.other-option', this);
						
				if (!pr) return this.value = '0';

				$('option', this).attr('selected', null);

				if (t.length) {
					t.attr({ 'value': pr, 'selected': 'selected' });
					t.text(pr);
				} else {
					$('<optgroup />').attr('label', '----------').appendTo(this);
					$('<option />').addClass('other-option').attr({ 'value': pr, 'selected': 'selected' }).text(pr).appendTo(this);
				}
			}

			if (this.getAttribute('type') === 'checkbox' && Settings.settings[group][setting].confirm && this.checked)
				this.checked = Settings.settings[group][setting].confirm();

			Settings.set_value(group, setting, ('checked' in this) ? (Settings.settings[group][setting].opposite ? !this.checked : this.checked) : this.value);
		});
		
		$(document.body).on('click', 'input[type="button"]', function () {
			if (!self.confirm_click(this)) return false;
			
			switch (this.id.substr('button-'.length)) {
				case 'resetSettings':
					for (var section in Settings.settings)
						if (section !== 'misc')
							for (var setting in Settings.settings[section])
								Settings.set_value(section, setting, null);
					
					window.location.reload();
				break;
				
				case 'removeRules':
					Settings.set_value(null, 'Rules', '{}');
					Settings.set_value(null, 'SimpleRules', '{}');
					alert(_('All rules have been removed.'));
				break;

				case 'reinstallWLBL':
					safari.self.tab.dispatchMessage('reinstallWLBL');

					alert(_('Whitelist and blacklist rules have been reinstalled.'), 'reinstallWLBL');
				break;

				case 'createBackup':
					if (Settings.invalid_donation_setting()) {
						alert(_('Donation Required'));
						break;
					}

					var all_settings = $.extend({}, Settings.items), settings = {},
							ignore = ['donationVerified', 'trialStart', 'installID', 'installedBundle'];

					for (var setting in all_settings) {
						if (~ignore.indexOf(setting)) continue;

						settings[setting] = Settings.current_value(setting);
					}

					alert('<textarea readonly>' + JSON.stringify({
						settings: settings,
						rules: Settings.current_value('Rules') || '{}',
						simpleRules: Settings.current_value('SimpleRules') || '{}'
					}) + '</textarea>', _('Copy below'));

					var ta = document.querySelector('.jsblocker-alert textarea');

					ta.focus();
					ta.selectionStart = 0;
					ta.selectionEnd = ta.value.length;
				break;

				case 'importBackup':
					if (Settings.invalid_donation_setting()) {
						alert(_('Donation Required'));
						break;
					}

					var inp = prompt(_('Paste your backup below'));

					if (!inp) break;

					try {
						var js = JSON.parse(inp);

						if (!('settings' in js) || !('rules' in js)) throw 'Invalid backup data.';

						Settings.set_value(null, 'Rules', js.rules || '{}');
						Settings.set_value(null, 'SimpleRules', js.simpleRules || '{}');

						for (var setting in js.settings)
							Settings.set_value(null, setting, js.settings[setting], 1);

						alert(_('Your backup has been successfully restored.'));
					} catch (e) {
						alert(e.toString(), _('Error importing backup'));
					}
				break;

				case 'convertRules':
					var re = safari.self.tab.canLoad(beforeLoad, ['convert_rules']);

					if (re === true) alert(_('Rules converted.'), 'convertRules');
					else alert(_('Some rules could not be converted {1}', ['<textarea readonly>' + re + '</textarea>']), 'convertRules');
				break;
			}
		});
		
		$(document.body).on('search', '#search', function () {
			$('#for-search:not(.selected)').click();
			
			var val = $.trim(this.value),
					ul = $('#search ul').empty(), set, li, label, inp;
					
			Settings.make_setting('search', 'headerSearch', Settings.settings.search.headerSearch, ul);
			
			if (!val.length) return false;
			
			for (var section in Settings.settings)
				if (section !== 'misc')
					for (var setting in Settings.settings[section]) {
						set = Settings.settings[section][setting];
						
						if (typeof set.label === 'string' && ~set.label.toLowerCase().indexOf(val.toLowerCase())) {
							li = Settings.make_setting(section, setting, set, ul);
							li.attr('id', li.attr('id') + '-search-result');
							inp = li.find('input[type="checkbox"]').attr('id', li.attr('id') + '-search-result');
							li.find('label').attr('for', inp.attr('id'));
						}
					}
			
			ul.find('.donator:gt(0)').remove().end().find('.description').remove().end().find('.divider').remove();
		});
		
		$(document.body).keydown(function (e) {
			if (e.which === 16) speedMultiplier = !Settings.current_value('animations') ? 0.001 : 10;
		}).keyup(function (e) {
			if (e.which === 16) speedMultiplier = !Settings.current_value('animations') ? 0.001 : 1;
		});
	},
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
	_current: {},
	current_value: function (setting) {
		if (setting in this._current) return this._current[setting];
		this._current[setting] = safari.self.tab.canLoad(beforeLoad, ['setting', setting]);
		return this._current[setting];
	},
	set_value: function (group, setting, v, no_reload) {
		safari.self.tab.dispatchMessage('reloadPopover');
		
		v = v === 'false' ? false : (v === 'true' ? true : v);
		
		this._current[setting] = v;
		
		for (var section in Settings.settings)
			if (section !== 'misc')
				for (var set in Settings.settings[section])
					if (Settings.settings[section][set].if_setting && setting === Settings.settings[section][set].if_setting[0])
						if (Settings.settings[section][set].if_setting[1] !== v)
							$('#setting-' + set).slideUp(this.current_value('animations') ? 150 : 0.001);
						else
							$('#setting-' + set).slideDown(this.current_value('animations') ? 150 : 0.001);
		
		if (setting === 'language' && !no_reload)
			window.location.reload();
		else if (setting === 'largeFont')
			$(document.body).toggleClass('large', v);
			
		if ($('#toolbar li.selected#for-search').length) $('#search').trigger('search');
		
		safari.self.tab.canLoad(beforeLoad, ['setting_set', setting, v]);
	},
	invalid_donation_setting: function () {
		return (!Settings.current_value('donationVerified') && !safari.self.tab.canLoad(beforeLoad, ['arbitrary', 'trial_active']));
	},
	make_setting: function (group, setting, setting_item, sec) {
		var sec, setting_item, set, select, li, current, label, other = 0;
		
		current = Settings.current_value(setting);
		current = setting_item.opposite ? !current : current;
		
		if (setting_item.donator)
			$('<li class="donator" />').html('<div class="label">' + _('Donator-only features') + '</div><br style="clear:both;" />').appendTo(sec);

		if (setting_item.description)
			$('<li class="description" />').html(setting_item.description).appendTo(sec).toggleClass('disabled', setting_item.donator_only ? this.invalid_donation_setting() : false);

		li = $('<li />').attr({
			'data-setting': setting,
			'id': 'setting-' + setting,
		}).data('group', group).toggleClass('disabled', setting_item.donator_only ? this.invalid_donation_setting() : false).appendTo(sec);
		
		label = $('<div />').addClass('label').html(typeof setting_item.setting === 'boolean' ? '' : (setting_item.label ? _(setting_item.label) : '')).appendTo(li);
		set = $('<div />').addClass('setting').insertAfter(label);
					
		if (typeof setting_item.setting === 'boolean') {
			$('<input />').attr({
				'type': 'checkbox',
				'id': 'setting-check-' + setting,
				'checked': current,
				'disabled': (setting_item.donator_only && this.invalid_donation_setting())
			}).appendTo(set);
			
			$('<label></label>').attr('for', 'setting-check-' + setting).html(' ' + _(setting_item.label)).appendTo(set);
		} else if (typeof setting_item.setting === 'string') {
			$('<input />').attr({
				'type': 'button',
				'id': 'button-' + setting,
				'value': _(setting_item.setting),
				'disabled': (setting_item.donator_only && this.invalid_donation_setting())
			}).appendTo(set)
		} else if (setting_item.label && setting_item.setting) {
			select = $('<select />').attr('disabled', (setting_item.donator_only && this.invalid_donation_setting())).appendTo(set);
			
			for (var b = 0; setting_item.setting[b]; b++) {
				if ((typeof current === 'string' || typeof curent === 'number') && setting_item.setting[b][0].toString() === current.toString()) break;
				else if (b === setting_item.setting.length - 1) {
					other = 1;
					setting_item.setting.push([current, current]);
				
					break;
				}
			}
			
			for (var i = 0; setting_item.setting[i]; i++) {
				var is_other = other && i === setting_item.setting.length - 1;
				
				if (is_other)
					$('<optgroup />').attr('label', '----------').appendTo(select);
					
				$('<option />').attr({
					'disabled': (setting_item.donator_only && this.invalid_donation_setting()),
					'value': setting_item.setting[i][0],
					'class': is_other ? 'other-option' : '',
					'selected': (typeof current === 'string' || typeof curent === 'string') && (current == setting_item.setting[i][0] || current.toString() === setting_item.setting[i][0])
				}).html(isNaN(parseInt(setting_item.setting[i][1])) ? (!other ? _(setting_item.setting[i][1]) : setting_item.setting[i][1]) : setting_item.setting[i][1]).appendTo(select);
			}

			if (other)
				setting_item.setting = setting_item.setting.slice(0, setting_item.setting.length - 1);
		}
		
		if (setting_item.divider)
			$('<li class="divider" />').appendTo(sec);
		
		if (setting_item.id)
			li.attr('id', setting_item.id);
		
		if (setting_item.classes)
			li.addClass(setting_item.classes);
			
		if (setting_item.help)
			$('<div class="help">?</div>').click(setting_item.help, function (event) {
				alert(event.data, setting);
			}).appendTo(li);
			
		li.append('<br style="clear:both;" />')
		
		if (setting_item.if_setting && Settings.current_value(setting_item.if_setting[0]) != setting_item.if_setting[1])
			li.hide();
			
		if (setting_item.label === false)
			li.remove();
		
		return li;
	}
};

Settings.toolbar_items = {
	ui: 'User Interface',
	predefined: 'Rules',
	other: 'Other Features',
	about: 'About',
	search: '<input type="search" id="search" incremental="incremental" placeholder="' + _('Search') + '" results="10" autosave="setting_search" />'
};

appendScript(special_actions.alert_dialogs, true);

var lang = Settings.current_value('language'),
		load_language = (lang !== 'Automatic') ? lang : window.navigator.language;

if (load_language !== 'en-us' && !(load_language in Strings))
	$('<script></script>').attr('src', 'i18n/' + load_language + '.js').appendTo(document.head);

$(function () {
	$('#requirements').remove();
	
	Settings.bind_events();

	var section, sec, setting, setting_item, set, select, li, current;
	
	for (var section in Settings.settings)
		if (section !== 'misc')
			$('<section />').attr('id', section).appendTo('#content').append('<ul class="settings"></ul>');
	
	for (var setting in Settings.settings.about)
		Settings.make_setting('about', setting, Settings.settings.about[setting], $('#about ul'));
	
	for (var tool in Settings.toolbar_items) {
		$('<li />').attr('id', 'for-' + tool)
				.html('<div class="left"></div><span>' + (tool !== 'search' ? _(Settings.toolbar_items[tool]) : Settings.toolbar_items[tool]) + '</span><div class="right"></div>').appendTo('#toolbar');
	}
		
	if (window.location.hash.length > 1) $(window.location.hash).click();
	else if (window.localStorage.tab) $('#' + window.localStorage.tab).click();
	else $('#for-about').click();
	
	var dv = safari.self.tab.canLoad(beforeLoad, ['arbitrary', 'displayv']),
			bi = safari.self.tab.canLoad(beforeLoad, ['arbitrary', 'bundleid']),
			rem = safari.self.tab.canLoad(beforeLoad, ['arbitrary', 'trial_remaining']),
			don = Settings.current_value('donationVerified');

	rem.push('<a class="outside" href="http://javascript-blocker.toggleable.com/donation_only" target="_top">' + _('donator-only features.') + '</a>');

	$('#js-displayv').html(dv);
	$('#js-bundleid').html(bi);
	
	if (!don) {
		if (safari.self.tab.canLoad(beforeLoad, ['arbitrary', 'trial_active']))
			$('#trial-remaining').html(_('Trial remaining {1} days, {2} hours, and {3} minutes of the <b>{4}</b>', rem));
		else
			$('#trial-remaining').html([
				'<p>', _('Free trial expired', [_('JavaScript Blocker')]), '</p>',
				'<p><a href="http://javascript-blocker.toggleable.com/donation_only" target="_top">', _('What donation?'), '</a></p>'].join(''));
	} else
		$('#trial-remaining').html(_('Your donation has been verified') + ' ' + _('Thanks for your support!'));
		
	$(document.body).toggleClass('large', Settings.current_value('largeFont'));
	$(document.body).toggleClass('windows', /Win/.test(window.navigator.platform));
	
	document.title = _('JavaScript Blocker Settings');
});

window.zero = [];
window.zero_timeout = function (func, args) {
	window.zero.push([func, args]);
	window.postMessage('zero_timeout', '*');
};

window.addEventListener('message', function (e) {
	if (e.data === 'zero_timeout') {
		if (zero.length) {
			var o = zero.shift();
			if (typeof o[0] === 'function')
				o[0].apply(null, o[1]);
		}
	}
});
