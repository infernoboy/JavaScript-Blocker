"use strict";

var speedMultiplier = 1, firstLoad = true;

window._ = function (str, args) {
	return ResourceCanLoad(beforeLoad, ['_', str, args]);
};

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

			if ($('#toolbar li.selected').is('#for-user-script-edit') && $('#button-user-script-save').is(':not(:disabled)')) {
				if (!confirm(_('Confirm user script navigate away'))) return;
			}

			if (self.tba)
				return setTimeout(function (self) {
					self.click();
				}, 600, $(this));
			
			if (this.id !== 'for-user-script-edit') {
				window.location.hash = this.id;

				Settings.set_value('settingsPageTab', this.id);
			} else {
				window.location.hash = 'user-script';

				$('#button-user-script-save').prop('disabled', false).val(_('Save'));
			}

			self.tba = 1;

			var c = $('#container'),
					ac = $('section.active'),
					sec = $(this).siblings('li').removeClass('selected').end().addClass('selected').attr('id').substr(4),
					ph = c.height(),
					s = $('section').removeClass('active').filter('#' + sec).css('opacity', 0).addClass('active');
					
			if (sec !== 'about') {
				var ul = s.find('ul.settings').empty();
			
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
		}).on('change', 'section select, section input[type="checkbox"], section input[type="radio"], section input[type="number"]', function () {
			if (~this.className.indexOf('private')) return;

			var li = $(this).parents('li.setting-li'),
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
					$('<option />').prop('disabled', true).text('―――――――――').appendTo(this);
					$('<option />').addClass('other-option').attr({ 'value': pr, 'selected': 'selected' }).text(pr).appendTo(this);
				}
			}

			if (this.type === 'checkbox') {

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
			if (!$(this).parents('li').hasClass('single-click') && !~this.className.indexOf('single-click') && !self.confirm_click(this)) return false;

			if (~this.className.indexOf('edit-custom')) {
				var li = $(this).parent(),
						scripts = JSON.parse(b64_to_utf8(Settings.current_value('userScripts')));

				$('#user-script-content').val(scripts[li.data('ns')].script);

				$('#for-user-script-edit').click();

				$('#button-user-script-save').prop('disabled', true).val(_('Saved'));
			} else if (~this.className.indexOf('remove-custom')) {
				var li = $(this).parent();

				li.animate({
					marginLeft: li.width(),
					height: 0,
					opacity: 0
				}, {
					duration: 250,
					complete: function () {
						$(this).remove();
					}
				});

				GlobalPage.message('removeUserScript', li.data('ns'));
				GlobalPage.message('getAllSettings');

				setTimeout(function () { Settings.set_value(); }, 300);
			}

			switch (this.id.substr('button-'.length)) {
				case 'switchCustomTab':
					$('#for-custom').click();
				break;

				case 'createUserScript':
					var c = $('#user-script-content');

					c.val([
						'// ==UserScript==',
						'// @name My User Script',
						'// @namespace ' + Date.now(),
						'// @version 0.1',
						'// @updateURL ',
						'// @downloadURL ',
						'// ==/UserScript==',
						' ', ' '
					].join("\n"));

					$('#for-user-script-edit').click();

					$('#button-user-script-save').prop('disabled', false).val(_('Save'));

					c.focus();

					c[0].selectionStart = c.val().length;
				break;

				case 'resetSettings':
					Settings.clear();
				break;

				case 'showWelcome':
					$('#for-welcome').click();
				break;
				
				case 'removeRules':
					Settings.set_value('Rules', '{}');
					Settings.set_value('SimpleRules', '{}');
					alert(_('All rules have been removed.'), null, 1);
				break;

				case 'easyListNow':
					this.disabled = true;
					this.value = _('Updating...');

					GlobalPage.message('updateEasyLists');
				break;

				case 'userScriptNow':
					this.disabled = true;
					this.value = _('Updating...');

					GlobalPage.message('updateUserScripts');
				break;

				case 'userScriptRedownload':
					this.disabled = true;
					this.value = _('Downloading...');

					GlobalPage.message('updateUserScripts', 1);
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

					var ta = document.querySelector('.jsb-alert textarea');

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

						GlobalPage.message('backupImported');

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

				case 'user-script-save':
					this.disabled = true;
					this.value = _('Saved');

					GlobalPage.message('addUserScript', $('#user-script-content').val());

					Settings.set_value('settingsPageTab', 'for-custom');

					GlobalPage.message('getAllSettings');
				break;
			}
		}).on('input', '#user-script-content', function () {
			$('#button-user-script-save').prop('disabled', false).val(_('Save'));
		}).on('search', '#search', function () {
			$('#for-search:not(.selected)').click();
			
			var val = $.trim(this.value), placed_headers = [],
					ul = $('#search ul').empty(), set, li = null, label, inp, ifed;
					
			Settings.make_setting('search', 'headerSearch', Settings.settings.search.headerSearch, ul);
						
			for (var section in Settings.settings)
				if (section !== 'misc') {
					settingLoop:
					for (var setting in Settings.settings[section]) {
						set = $.extend({}, Settings.settings[section][setting]);

						if (set.if_setting)
							for (var mustSet in set.if_setting)
								if( Settings.current_value(mustSet) !== set.if_setting[mustSet])
									continue settingLoop;
						
						if (typeof set.label === 'string' && val.length && ~set.label.toLowerCase().indexOf(val.toLowerCase())) {
							if (!~placed_headers.indexOf(section)) {
								placed_headers.push(section);
								set.header = _(Settings.toolbar_items[section]);
								set.search_result = 1;
							}

							li = Settings.make_setting(section, setting, set, ul);
							li.attr('id', li.attr('id') + '-search-result');
							inp = li.find('input[type="checkbox"]').attr('id', li.attr('id') + '-search-result');
							li.find('label').attr('for', inp.attr('id'));
						}
					}
				}

			if (~val.indexOf(':')) {
				var s = val.split(':');

				switch (s[0].toLowerCase()) {
					case 'getvalue':
						li =  $('<li />').text(s[1] + ' = ' + Settings.current_value(s[1])).appendTo(ul);
					break;
				}
			}

			var head = $('#setting-headerSearch .label').html(li ? _('Search Results') : _('No Results'));

			if (li) head.parent().hide()
			else head.parent().show();
			
			ul.find('.extras:gt(0)').remove().end().find('.description').remove().end().find('.divider:not(.search-divider)').remove().end().find('.search-divider:first').remove();
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
		if (setting) {
			GlobalPage.message('reloadPopover');

			v = v === 'false' ? false : (v === 'true' ? true : v);

			GlobalPage.message('setting_set', [setting, v]);
			
			this._current[setting] = v;
				
			if ($('#toolbar li.selected#for-search').length)
				$('#search').trigger('search');
			
			if (setting === 'largeFont')
				$(document.body).toggleClass('large', v);
			else if (setting === 'animations')
				speedMultiplier = 1;
			else if (setting === 'language' && !no_reload)
				window.location.reload();
		}

		if ($('#toolbar li.selected').is('#for-search'))
			$('#search-box').trigger('search');
		else {
			var ul = $('section.active').find('ul.settings').empty(),
					sec = ul.end().attr('id');
			
			for (var setting in Settings.settings[sec])
				Settings.make_setting(sec, setting, Settings.settings[sec][setting], ul);
		}
		
		GlobalPage.message('aboutPage');
	},
	clear: function () {
		GlobalPage.message('resetSettings');
		
		setTimeout(function () { window.location.reload(); }, 700);
	},
	trial_active: function () {
		return (Date.now() - this._current.trialStart < 1000 * 60 * 60 * 24 * 10);
	},
	extras_active: function () {
		return (!Settings.current_value('donationVerified') && !this.trial_active());
	},
	make_setting: function (group, setting, setting_item, sec) {
		var sec, setting_item, set, select, li, current, label, other = 0;
		
		current = Settings.current_value(setting);
		current = setting_item.opposite ? !current : current;

		if (setting_item.search_result)
			$('<li class="divider search-divider" />').appendTo(sec);

		if (setting_item.extras)
			$('<li class="extras" />').html('<div class="label">' + _('Donator-only features') + '</div><br style="clear:both;" />').appendTo(sec);

		if (setting_item.header)
			$('<li class="setting-header" />').html('<div class="label">' + _(setting_item.header) + '</div><br style="clear:both;" />').appendTo(sec);

		if (setting_item.description)
			$('<li class="description" />').html(setting !== 'header' ? _(setting_item.description) : setting_item.description).appendTo(sec).toggleClass('disabled', setting_item.extra ? this.extras_active() : false);

		li = $('<li />').attr({
			'data-setting': setting,
			'id': 'setting-' + setting,
			'class': 'setting-li'
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
			select = $('<' + (setting_item.radio ? 'ul' : 'select') + ' />').toggleClass('radio', !!setting_item.radio).attr('disabled', (setting_item.extra && this.extras_active())).appendTo(set);
			
			for (var b = 0; setting_item.setting[b]; b++) {
				if ((typeof current === 'string' || typeof curent === 'number') && setting_item.setting[b][0].toString() === current.toString()) break;
				else if (b === setting_item.setting.length - 1) {
					other = 1;
					setting_item.setting.push([current, current]);
				
					break;
				}
			}
			
			for (var i = 0; setting_item.setting[i]; i++) {
				var is_other = other && i === setting_item.setting.length - 1,
						id = 'choice-' + Math.random().toString(36),
						str = isNaN(parseInt(setting_item.setting[i][1])) ? (!other ? _(setting_item.setting[i][1]) : setting_item.setting[i][1]) : setting_item.setting[i][1],
						selected = (typeof current === 'string' || typeof curent === 'string') && (current == setting_item.setting[i][0] || current.toString() === setting_item.setting[i][0]);
				
				if (is_other && !setting_item.radio)
					$('<option />').prop('disabled', true).text('―――――――――').appendTo(select);
				
				if (setting_item.radio) {
					var radio_li = $('<li />');

					$('<input />').attr({
						type: 'radio',
						id: id,
						'name': 'radio-' + setting,
						'disabled': (setting_item.extra && this.extras_active()),
						'value': setting_item.setting[i][0],
						'class': is_other ? 'other-option' : '',
						'checked': selected
					}).appendTo(radio_li);

					$('<label />').attr('for', id).html(' ' + str).appendTo(radio_li);

					radio_li.appendTo(select);
				} else
					$('<option />').attr({
						'disabled': (setting_item.extra && this.extras_active()),
						'value': setting_item.setting[i][0],
						'class': is_other ? 'other-option' : '',
						'selected': selected
					}).html(str).appendTo(select);
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
		
		if (setting_item.if_setting)
			for (var mustSet in setting_item.if_setting)
				if (Settings.current_value(mustSet) !== setting_item.if_setting[mustSet]) {
					li.hide();
					break;
				}
			
		if (setting_item.label === false)
			li.remove();

		if (setting === 'userScriptsContainer') {
			var scripts = JSON.parse(b64_to_utf8(Settings.current_value('userScripts'))),
					ul = $('.setting', li).html('<ul class="small" />').find('ul'), has = !$.isEmptyObject(scripts), i = 0, canUpdate;

			$([
				'<li class="custom-header">',
					_((has ? '' : 'No ') + 'User Defined Scripts'),
				'</li>'
			].join('')).appendTo(ul);

			for (var key in scripts) {
				i++;

				canUpdate = scripts[key].meta.updateURL && (scripts[key].meta.downloadURL || scripts[key].meta.installURL);

				var str = [
					'<li>',
						'<input type="button" class="remove-custom delete" value="', _('Delete'), '" /> <input type="button" class="edit-custom single-click" value="', _('Edit'), '" />',
						'<img class="user-script-icon" width="48" height="48" src="', encodeURI(scripts[key].meta.icon || scripts[key].meta.icon64 || 'images/null.gif'), '" /> ',
						'<span class="user-script-name">', scripts[key].meta.name.replace(/&/g, '&amp;').replace(/</g, '&lt;'), '</span> ',
						'<div class="user-script-toggles">',
							'<input ', !canUpdate ? 'disabled="disabled"' : '', ' class="user-script-auto-update private" id="user-script-update-', i, '" type="checkbox" ', scripts[key].autoUpdate ? 'checked' : '', '/> <label for="user-script-update-', i, '">', _('Enable automatic updating'), '</label><br />',
							'<input ', !canUpdate ? 'disabled="disabled"' : '', ' class="user-script-developer private" id="user-script-developer-', i, '" type="checkbox" ', scripts[key].developerMode ? 'checked' : '', '/> <label for="user-script-developer-', i, '">', _('Enable developer mode'), '</label>',
							!canUpdate ? '<span class="aside">This script does not contain an @updateURL, @downloadURL, or @version directive.</span>' : '',
						'</div>',
						'<div class="divider small"></div>',
					'</li>'
				].join('');

				$(str).data({
					ns: key
				}).appendTo(ul).find('.user-script-developer').change(function () {
					GlobalPage.message('setUserScriptDeveloperMode', [$(this).parents('li').data('ns'), this.checked]);
					GlobalPage.message('getAllSettings');

					setTimeout(function () { Settings.set_value(); }, 300);
				}).end().find('.user-script-auto-update').change(function () {
					GlobalPage.message('setUserScriptAutoUpdate', [$(this).parents('li').data('ns'), this.checked]);
					GlobalPage.message('getAllSettings');

					setTimeout(function () { Settings.set_value(); }, 300);
				});
			}

			ul.find('.divider:last').remove();
		}
		
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
	custom: 'Custom',
	about: 'About',
	welcome: 'Show Welcome',
	'user-script-edit': 'Edit User Script',
	search: '<input autocomplete="off" type="search" id="search" incremental="incremental" placeholder="' + 'Search' + '" results="10" autosave="setting_search" />'
};

if (window == window.top) delete Settings.toolbar_items.close;

Events.addTabListener('message', function (event) {
	if (event.message) 
		try {
			event.message = JSON.parse(event.message);
		} catch (e) {}

	switch (event.name) {
		case 'userScriptsUpdated':
		case 'easyListsUpdated':
			window.location.reload();
		break;

		case 'gotAllSettings':
			for (var setting in Settings.items)
				Settings._current[setting] = event.message[setting];

			Settings._current.Rules = event.message.Rules;
			Settings._current.SimpleRules = event.message.SimpleRules;

			if (firstLoad) settingsReady();
		break;

		case 'aboutPage':
			var dv = event.message.displayv,
					bi = event.message.bundleid,
					rem = event.message.trial_remaining,
					lu = event.message.easylist_last_update,
					us = event.message.user_script_last_update,
					don = Settings.current_value('donationVerified');

			rem.push('<a class="outside" href="http://javascript-blocker.toggleable.com/donation_only" target="_top">' + _('donator-only features.') + '</a>');

			$('#easy-list-update').html('<p>' + _('Last EasyList/EasyPrivacy update was {1}', [lu ? new Date(lu) : 'never.']) + '</p>');
			$('#user-script-update').html('<p>' + _('Last user scripts update was {1}', [us ? new Date(us) : 'never.']) + '</p>');

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
	appendScript(special_actions.alert_dialogs, 'alert_dialogs', true);

	$('#requirements').remove();
	$('#container').css('opacity', 0);
	
	Settings.bind_events();
});

function settingsReady() {
	var section, sec, setting, setting_item, set, select, li, current, tool, load_language = Strings.getLanguage();

	if (load_language !== 'en-us' && !(load_language in Strings))
		$('<script />').attr('src', 'i18n/' + load_language + '.js').appendTo(document.head);
	
	for (section in Settings.settings)
		if (section !== 'misc' && section !== 'welcome')
			$('<section />').attr('id', section).appendTo('#content').append('<ul class="settings"></ul>');
	
	for (setting in Settings.settings.about)
		Settings.make_setting('about', setting, Settings.settings.about[setting], $('#about ul'));
	
	for (tool in Settings.toolbar_items)
		$('<li />').attr('id', 'for-' + tool)
				.html('<div class="left"></div>' + 
					(tool === 'search' ? Settings.toolbar_items[tool] : ('<input class="single-click" type="button" value="' +  _(Settings.toolbar_items[tool]) + '" />')) + 
					'<div class="right"></div>').appendTo('#toolbar');

	var ref, cu = $('#' + Settings.current_value('settingsPageTab'));
	
	if (window.location.hash.length > 1 && (ref = $(window.location.hash)).length) ref.click();
	else if ((ref = $('#' + Settings.current_value('settingsPageTab'))).length) ref.click();
	else $$('#for-welcome').click();

	GlobalPage.message('aboutPage');
		
	$(document.body).toggleClass('large', Settings.current_value('largeFont')).toggleClass('windows', /Win/.test(window.navigator.platform));
	
	document.title = _('JavaScript Blocker Settings');
};

function b64_to_utf8 (str) {
	try {
		return decodeURIComponent(escape(window.atob(str)));
	} catch (e) {
		return str;
	}
};

function utf8_to_b64 (str) {
	return window.btoa(unescape(encodeURIComponent(str)));
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

window.addEventListener('hashchange', function () {
	$(window.location.hash).click();
});

window.onerror = function (d, p, l, c) {
	if (~p.indexOf('JavaScriptBlocker'))
		GlobalPage.message('errorOccurred', d + ', ' + p + ', ' + l);
};