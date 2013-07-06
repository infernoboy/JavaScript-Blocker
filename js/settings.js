"use strict";

var speedMultiplier = 1, firstLoad = true;
$.extend(Settings, {
	loaded: 0,
	tba: 0,
	bind_events: function () {
		var self = this;

		$(document).click(function (e) {
			if (e.target && e.target.nodeName === 'BODY')
				GlobalPage.message('closeSettings');
		}).on('click', '#toolbar li', function () {
			if ($(this).hasClass('selected')) return false;

			if (this.id === 'for-close') {
				GlobalPage.message('closeSettings');

				return;

			}

			if (self.tba)
				return setTimeout(function (self) {
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
					ph = c.height(),
					s = $('section').removeClass('active').filter('#' + sec).css('opacity', 0).addClass('active');
					
			if (sec !== 'about') {
				var ul = s.find('ul').empty();
			
				for (var setting in Settings.settings[sec])
					Settings.make_setting(sec, setting, Settings.settings[sec][setting], ul);
			}

			c.css('WebkitTransition', 'height ' + (.2 * speedMultiplier) + 's').addClass('no-transition');
			
			if (sec === 'search') $('#for-search input').trigger('search');
						
			var nh = c.height();

			c.height(ph);

			$('section').css({
				position: 'absolute',
				bottom: 30
			});

			ac.show();
	
			function end () {
				$('section').css({
					position: 'relative',
					bottom: 'auto'
				});
									
				ac.css({ display: '', opacity: 1 });
				
				c.addClass('no-transition').height('auto');
			}
			
			if (self.current_value('animations') && !firstLoad) c.removeClass('no-transition');
			
			ac.fadeTo(Settings.current_value('animations') && !firstLoad ? 200 * speedMultiplier : 0.001, 0);
			
			c.height(nh).one('webkitTransitionEnd', end);
							
			s.animate({
				opacity: 1
			}, Settings.current_value('animations') && !firstLoad ? 200 * speedMultiplier : 0.001, function () {
				self.tba = 0;
			});
			
			if (!self.current_value('animations') || firstLoad) end();

			firstLoad = false;

			c.css('opacity', 1);
		}).on('click', 'a', function (e) {
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
		}).on('change', 'section select, section input[type="checkbox"], section input[type="number"]', function () {
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

			if (this.getAttribute('type') === 'checkbox') {

				if (Settings.settings[group][setting].confirm && this.checked) {
					this.checked = false;
					this.checked = Settings.settings[group][setting].confirm();
				}

				if (Settings.settings[group][setting].ask && Settings.settings[group][setting].ask.checked === this.checked)
					if (confirm(_(Settings.settings[group][setting].ask.question)))
						Settings.settings[group][setting].ask.action();
			}

			Settings.set_value(setting, (this.type === 'checkbox') ? (Settings.settings[group][setting].opposite ? !this.checked : this.checked) : this.value);
		}).on('click', 'input[type="button"]', function () {
			if (!self.confirm_click(this)) return false;
			
			switch (this.id.substr('button-'.length)) {
				case 'resetSettings':
					Settings.clear();
				break;
				
				case 'removeRules':
					Settings.set_value('Rules', '{}');
					Settings.set_value('SimpleRules', '{}');
					alert(_('All rules have been removed.'), null, 1);
				break;

				case 'createBackup':
					if (Settings.extras_active()) {
						alert(_('Donation Required'), null, 1);
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
					}) + '</textarea>', _('Copy below'), 1);

					var ta = document.querySelector('.jsblocker-alert textarea');

					ta.focus();
					ta.selectionStart = 0;
					ta.selectionEnd = ta.value.length;
				break;

				case 'importBackup':
					if (Settings.extras_active()) {
						alert(_('Donation Required'), null, 1);
						break;
					}

					var inp = prompt(_('Paste your backup below'));

					if (!inp) break;

					try {
						var js = JSON.parse(inp);

						if (!('settings' in js) || !('rules' in js)) throw 'Invalid backup data.';

						Settings.clear();

						Settings.set_value('Rules', js.rules || '{}');
						Settings.set_value('SimpleRules', js.simpleRules || '{}');

						for (var setting in js.settings)
							Settings.set_value(setting, js.settings[setting], 1);

						alert(_('Your backup has been successfully restored.'), null, 1);
					} catch (e) {
						alert(e.toString(), _('Error importing backup'), 1);
					}
				break;

				case 'clearSnapshots':
					Settings.set_value('Snapshots', '{}');
					alert(_('All snapshots have been removed.'), null, 1);
				break;

				case 'convertRules':
					GlobalPage.message('convertRules');
				break;
			}
		}).on('search', '#search', function () {
			$('#for-search:not(.selected)').click();
			
			var val = $.trim(this.value), placed_headers = [],
					ul = $('#search ul').empty(), set, li = null, label, inp, ifed;
					
			Settings.make_setting('search', 'headerSearch', Settings.settings.search.headerSearch, ul);
						
			for (var section in Settings.settings)
				if (section !== 'misc')
					for (var setting in Settings.settings[section]) {
						set = $.extend({}, Settings.settings[section][setting]);

						if (set.if_setting && Settings.current_value(set.if_setting[0]) !== set.if_setting[1]) continue;
						
						if (typeof set.label === 'string' && val.length && ~set.label.toLowerCase().indexOf(val.toLowerCase())) {
							if (!~placed_headers.indexOf(section)) {
								placed_headers.push(section);
								set.header = _(Settings.toolbar_items[section]);
							}

							li = Settings.make_setting(section, setting, set, ul);
							li.attr('id', li.attr('id') + '-search-result');
							inp = li.find('input[type="checkbox"]').attr('id', li.attr('id') + '-search-result');
							li.find('label').attr('for', inp.attr('id'));
						}
					}

			var head = $('#setting-headerSearch .label').html(li ? _('Search Results') : _('No Results'));

			if (li) head.parent().hide()
			else head.parent().show();
			
			ul.find('.extras:gt(0)').remove().end().find('.description').remove().end().find('.divider').remove();
		}).keydown(function (e) {
			if (e.which === 16) speedMultiplier = !Settings.current_value('animations') ? 0.001 : 20;
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
		return (this._current[setting] !== undefined) ? this._current[setting] : (Settings.items && (setting in Settings.items) ? Settings.items[setting].default : null);
	},
	set_value: function (setting, v, no_reload) {
		GlobalPage.message('reloadPopover');

		v = v === 'false' ? false : (v === 'true' ? true : v);

		GlobalPage.message('setting_set', [setting, v]);
		
		this._current[setting] = v;
		
		for (var section in Settings.settings)
			if (section !== 'misc')
				for (var set in Settings.settings[section])
					if (Settings.settings[section][set].if_setting && setting === Settings.settings[section][set].if_setting[0])
						if (Settings.settings[section][set].if_setting[1] !== v)
							$('#setting-' + set).slideUp(this.current_value('animations') ? 150 : 0.001);
						else
							$('#setting-' + set).slideDown(this.current_value('animations') ? 150 : 0.001);
			
		if ($('#toolbar li.selected#for-search').length)
			$('#search').trigger('search');
		
		if (setting === 'largeFont')
			$(document.body).toggleClass('large', v);
		else if (setting === 'animations')
			speedMultiplier = 1;
		else if (setting === 'language' && !no_reload)
			window.location.reload();
	},
	clear: function () {
		GlobalPage.message('resetSettings');
		
		setTimeout(function () { window.location.reload(); }, 700);
	},
	trial_active: function () {
		return (+new Date() - this._current.trialStart < 1000 * 60 * 60 * 24 * 10);
	},
	extras_active: function () {
		return (!Settings.current_value('donationVerified') && !this.trial_active());
	},
	make_setting: function (group, setting, setting_item, sec) {
		var sec, setting_item, set, select, li, current, label, other = 0;
		
		current = Settings.current_value(setting);
		current = setting_item.opposite ? !current : current;
		
		if (setting_item.extras)
			$('<li class="extras" />').html('<div class="label">' + _('Donator-only features') + '</div><br style="clear:both;" />').appendTo(sec);

		if (setting_item.header)
			$('<li class="setting-header" />').html('<div class="label">' + _(setting_item.header) + '</div><br style="clear:both;" />').appendTo(sec);

		if (setting_item.description)
			$('<li class="description" />').html(setting !== 'header' ? _(setting_item.description) : setting_item.description).appendTo(sec).toggleClass('disabled', setting_item.extra ? this.extras_active() : false);

		li = $('<li />').attr({
			'data-setting': setting,
			'id': 'setting-' + setting,
		}).data('group', group)
			.toggleClass('disabled', setting_item.extra ? this.extras_active() : false)
			.toggleClass('indent', setting_item.indent === 1)
			.appendTo(sec);
		
		label = $('<div />').addClass('label').html(typeof setting_item.setting === 'boolean' ? '' : (setting_item.label ? _(setting_item.label) : '')).appendTo(li);
		set = $('<div />').addClass('setting').insertAfter(label);
					
		if (typeof setting_item.setting === 'boolean') {
			$('<input />').attr({
				'type': 'checkbox',
				'id': 'setting-check-' + setting,
				'checked': current,
				'disabled': (setting_item.extra && this.extras_active())
			}).appendTo(set);
			
			$('<label></label>').attr('for', 'setting-check-' + setting).html(' ' + _(setting_item.label)).appendTo(set);
		} else if (typeof setting_item.setting === 'string') {
			$('<input />').attr({
				'type': 'button',
				'id': 'button-' + setting,
				'value': _(setting_item.setting),
				'disabled': (setting_item.extra && this.extras_active())
			}).appendTo(set);
		} else if (typeof setting_item.setting === 'number' ) {
			var inp = $('<input />').attr({
				'type': 'number',
				'id': 'text-' + setting,
				'value': current,
				'min': setting_item.min,
				'max': setting_item.max,
				'disabled': (setting_item.extra && this.extras_active())
			}).appendTo(set);

			if (setting_item.label_after) inp.after($('<span />').addClass('label-after').html(_(setting_item.label_after)));
		} else if (setting_item.label && setting_item.setting) {
			select = $('<select />').attr('disabled', (setting_item.extra && this.extras_active())).appendTo(set);
			
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
					'disabled': (setting_item.extra && this.extras_active()),
					'value': setting_item.setting[i][0],
					'class': is_other ? 'other-option' : '',
					'selected': (typeof current === 'string' || typeof curent === 'string') && (current == setting_item.setting[i][0] || current.toString() === setting_item.setting[i][0])
				}).html(isNaN(parseInt(setting_item.setting[i][1])) ? (!other ? _(setting_item.setting[i][1]) : setting_item.setting[i][1]) : setting_item.setting[i][1]).appendTo(select);
			}

			if (other)
				setting_item.setting = setting_item.setting.slice(0, setting_item.setting.length - 1);
			if (setting_item.label_after) select.after($('<span />').addClass('label-after').html(_(setting_item.label_after)));
		}
		
		if (setting_item.divider)
			$('<li class="divider" />').appendTo(sec);
		
		if (setting_item.id)
			li.attr('id', setting_item.id);
		
		if (setting_item.classes)
			li.addClass(setting_item.classes);
			
		if (setting_item.help)
			$('<div class="help">?</div>').click(_(setting_item.help), function (event) {
				alert(event.data, setting, 1);
			}).appendTo(li);
			
		li.append('<br style="clear:both;" />')
		
		if (setting_item.if_setting && Settings.current_value(setting_item.if_setting[0]) != setting_item.if_setting[1])
			li.hide();
			
		if (setting_item.label === false)
			li.remove();
		
		return li;
	}
});

Settings.toolbar_items = {
	close: 'Close Settings',
	ui: 'User Interface',
	predefined: 'Rules',
	snapshots: 'Snapshots',
	keyboard: 'Keyboard',
	other: 'Other Features',
	about: 'About',
	search: '<input type="search" id="search" incremental="incremental" placeholder="' + 'Search' + '" results="10" autosave="setting_search" />'
};

if (window == window.top) delete Settings.toolbar_items.close;

appendScript(special_actions.alert_dialogs, true);

Events.addTabListener('message', function (event) {
	if (event.message) 
		try {
			event.message = JSON.parse(event.message);
		} catch (e) {}

	switch (event.name) {
		case 'gotAllSettings':
			for (var setting in Settings.items)
				Settings._current[setting] = event.message[setting];

			Settings._current.Rules = event.message.Rules;
			Settings._current.SimpleRules = event.message.SimpleRules;

			settingsReady();
		break;

		case 'aboutPage':
			var dv = event.message.displayv,
					bi = event.message.bundleid,
					rem = event.message.trial_remaining,
					lu = event.message.easylist_last_update,
					don = Settings.current_value('donationVerified');

			rem.push('<a class="outside" href="http://javascript-blocker.toggleable.com/donation_only" target="_top">' + _('donator-only features.') + '</a>');

			$('#easy-list-update').html('<p>' + _('Last EasyList/EasyPrivacy update was {1}', [lu ? new Date(lu) : 'never.']) + '</p>');

			$('#js-displayv').html(dv);
			$('#js-bundleid').html(bi);
						
			if (!don) {
				if (event.message.trial_active)
					$('#trial-remaining').html([
						'<p>', _('Trial remaining {1} days, {2} hours, and {3} minutes of the <b>{4}</b>', rem), '</p>'].join(''));
				else
					$('#trial-remaining').html([
						'<p>', _('Free trial expired', [_('JavaScript Blocker')]), '</p>',
						'<p><a href="http://javascript-blocker.toggleable.com/donation_only" target="_top">', _('What donation?'), '</a></p>'].join(''));
			} else if (don === 777)
				$('#trial-remaining').html([
					'<p>', _('Unlocked without contributing'), '</p>'].join(''));
			else
				$('#trial-remaining').html(_('Your donation has been verified') + ' ' + _('Thanks for your support!'));
		break;

		case 'convertRules':
			if (event.message === true) alert(_('Rules converted.'), 'convertRules', 1);
			else alert(_('Some rules could not be converted {1}', ['<textarea readonly>' + event.message + '</textarea>']), 'convertRules', 1);
		break;
	}
});

GlobalPage.message('getAllSettings');

$(function () {
	$('#requirements').remove();
	$('#container').css('opacity', 0);
	Settings.bind_events();
});

function settingsReady() {
	var section, sec, setting, setting_item, set, select, li, current, tool, load_language = Strings.getLanguage();

	if (load_language !== 'en-us' && !(load_language in Strings))
		$('<script />').attr('src', 'i18n/' + load_language + '.js').appendTo(document.head);
	
	for (section in Settings.settings)
		if (section !== 'misc')
			$('<section />').attr('id', section).appendTo('#content').append('<ul class="settings"></ul>');
	
	for (setting in Settings.settings.about)
		Settings.make_setting('about', setting, Settings.settings.about[setting], $('#about ul'));
	
	for (tool in Settings.toolbar_items) {
		$('<li />').attr('id', 'for-' + tool)
				.html('<div class="left"></div><span>' + (tool !== 'search' ? _(Settings.toolbar_items[tool]) : Settings.toolbar_items[tool]) + '</span><div class="right"></div>').appendTo('#toolbar');
	}
		
	if (window.location.hash.length > 1) $(window.location.hash).click();
	else if (window.localStorage.tab) $('#' + window.localStorage.tab).click();
	else $('#for-about').click();

	GlobalPage.message('aboutPage');
		
	$(document.body).toggleClass('large', Settings.current_value('largeFont')).toggleClass('windows', /Win/.test(window.navigator.platform));
	
	document.title = _('JavaScript Blocker Settings');
};

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
