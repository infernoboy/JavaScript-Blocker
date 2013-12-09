"use strict";

JB.updater = function () {
	var v = this.installedBundle, self = this;

	if (v === this.bundleid) return false;
	if (this.reload && v < this.bundleid) {
		if (~this.silent_updates.indexOf(this.bundleid) || (this.donationVerified && !Settings.getItem('updateNotify'))) {}
		else
			ToolbarItems.showPopover();
	}
	
	switch (true) {
		case v < 89: // 2.8.0
			this.clear_ui();
			
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info">Too Old</p>',
				'<p>You were using an extremely outdated version of JavaScript Blocker. You must uninstall it and reinstall the latest version manually; ',
					'updating will not work.</p>'].join(''), null, null, null, true);
		break;

		case v < 90: // 3.0.0
			if (SettingStore.getItem('alwaysBlock')) {
				Settings.setItem('allowDisablingSimplifiedRules', true);
				Settings.setItem('alwaysBlockscript', SettingStore.getItem('alwaysBlock'));
				Settings.removeItem('alwaysBlock');
				
				var simbefore = this.simpleMode, rulebefore = Settings.getItem('simplifiedRules'), kind;

				this.rules.reload();

				Settings.setItem('simpleMode', true);
				Settings.setItem('simplifiedRules', true);

				var rules = $.extend({}, this.rules.rules, true), kind, domain, rule, new_rule;

				for (kind in rules)
					for (domain in rules[kind])
						for (rule in rules[kind][domain]) {
							if (rules[kind][domain][rule][2] instanceof Array) {
								new_rule = rules[kind][domain][rule][2].join(',') + ':' + rule;
								rules[kind][domain][new_rule] = rules[kind][domain][rule];
								rules[kind][domain][new_rule].splice(2);
								delete rules[kind][domain][rule];
							} else
								rules[kind][domain][rule].splice(2);
						}

				Settings.setItem('SimpleRules', JSON.stringify(rules));
				Settings.setItem('simpleMode', simbefore);
				Settings.setItem('simplifiedRules', rulebefore);

				this.rules.reload();

				this.rules.snapshots.add(this.rules.rules);
			}

			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info"><a class="outside" href="http://javascript-blocker.toggleable.com/change-log/300/">Update 3.0.0</a></p>',
				'<p>Please see the change log by clicking the link above for more detailed information.</p>',
				'<p><b>New (Pay-for):</b> Snapshots. Rules will be automatically backed up any time they are modified so you never ',
					'have to worry about making accidental changes.',
				'<p><b>New:</b> Quick Add. Rules can be created with a single click of an item in the main window. This can be enabled this ',
					'under the User Interface settings.</p>',
				'<p><b>Changed:</b> Automatic rules will no longer be saved when Private Browsing is on unless the setting for it has been manually enabled.</p>',
				'<p><b>Changed:</b> The actions bar is now located statically at the top of the window for easier access.</p>',
				'<p><b>Changed:</b> The textual links that appeared at the top of the rule list have been condensed into an action bar with icons.</p>',
				'<p><b>Changed:</b> Disabling JS Blocker will now disable every aspect of it rather than just the resource blockers.</p>',
				'<p>',
					'<input type="button" id="rawr-ok" value="', _('Understood'), '" /> ',
				'</p>'
			].join(''), function () {
				$$('#rawr-ok').click(function () {
					self.installedBundle = 90
					self.updater();
				});
			}, null, null, true);
		break;

		case v < 94: // 3.0.4
			self.installedBundle = 94;
			self.updater();
		break;

		case v < 138: // 3.1.6
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info"><a class="outside" href="http://javascript-blocker.toggleable.com/change-log/316/">Update 3.1.6</a></p>',
				'<p><b>New:</b> Filter bars have been added to the rule list that allow you to show rules that either have or haven\'t been used ',
					'within a certain time. Because this is a new feature, all rules will be considered unused until used for the first time after ',
					'this update.',
				'<p><b>New:</b> You can turn off individual filter bars via the User Interface settings.</p>',
				'<p>',
					'<input type="button" id="rawr-ok" value="', _('Understood'), '" /> ',
				'</p>'
			].join(''), function () {
				$$('#rawr-ok').click(function () {
					self.installedBundle = 138;

					// $.post(self.baseURL + 'user.php', { id: Settings.getItem('installID') });

					self.updater();
				});
			}, null, null, true);
		break;

		case v < 139: // 3.2.0
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info"><a class="outside" href="http://javascript-blocker.toggleable.com/change-log/320a/">Update 3.2.0</a></p>',
				'<p><b>New:</b> Blacklist and whitelist has been completely overhauled and now utilizes the power of EasyList. It will be updated automatically every 5 days when Safari is restarted.',
				'<p><b>New:</b> In the main window, item headers (SCRIPTS, FRAMES, etc.) are now clickable. You can easily allow or block all of the items in the list with the option to exclude blacklisted or whitelisted items from being allowed or blocked.</p>',
				'<p>',
					'<input type="button" id="rawr-ok" value="', _('Understood'), '" /> ',
				'</p>'
			].join(''), function () {
				$$('#rawr-ok').click(function () {
					self.installedBundle = 139;

					self.rules.remove_all_predefined();

					self.updater();
				});
			}, null, null, true);
		break;

		case v < 151: // 3.2.9
			self.rules.remove_all_predefined();

			Settings.removeItem('EasyPrivacy');
			Settings.removeItem('EasyList');
			Settings.removeItem('EasyListLastUpdate');

			JB.rules.easylist();

			self.installedBundle = 151;

			self.updater();
		break;

		case v < 156: // 3.3.0
			// Repairs a bug where blacklist/whitelist rules were being added to a user's custom rule set.

			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info"><a class="outside" href="http://javascript-blocker.toggleable.com/change-log/330/">Update 3.3.0</a></p>',
				'<p><b>Imporant Fix:</b> Repairs rules to prevent Safari from hanging when loading the rule list.</p>',
				'<p><b>New:</b> Collapsing the allowed or blocked item lists will now expand the width the other column. You can ',
					'adjust this feature from the <a href="', ExtensionURL('settings.html#for-ui'), '" class="outside"><b>User Interface</b> settings</a>.',
				'<p><b>New:</b> You can now add regular expression rules directly from the main window even with expert features disabled. ',
					'To do this, click the number next to a blocked/allowed item to temporarily switch the view to expert mode. Close and ',
					'reopen the popover to switch back to simple view. A separate rule set is <b>not</b> required when adding a regular ',
					'expression rule in this manner. You will still need to have unlocked all of JavaScript Blocker\'s features for this ',
					'to work.',
				'</p>',
				'<p>If you want the classic list of items back, uncheck <b>Temporarily switch to expert mode when clicked</b> in the ',
				'<a href="', ExtensionURL('settings.html#for-ui'), '" class="outside"><b>User Interface</b> settings</a>.</p>',
				'<p>',
					'<input type="button" id="rawr-ok" value="', _('Continue'), '" /> ',
				'</p>'
			].join(''), function () {
				$$('#rawr-ok').click(function () {
					var sr = Settings.getItem('SimpleRules'),
							cr = Settings.getItem('Rules'),
							simple_rules = sr ? JSON.parse(sr) : self.rules.data_types,
							complex_rules = cr ? JSON.parse(cr) : self.rules.data_types,
							simple_rules = $.extend(self.rules.data_types, simple_rules),
							complex_rules = $.extend(self.rules.data_types, complex_rules),
							kind, domain, rule, ref;

					for (kind in self.rules.data_types) {
						for (domain in simple_rules[kind]) {
							for (rule in simple_rules[kind][domain]) {
								ref =  simple_rules[kind][domain][rule];

								if (ref[0] === 4 || ref[0] === 5)
									delete simple_rules[kind][domain][rule];
							}

							if ($.isEmptyObject(simple_rules[kind][domain]))
								delete simple_rules[kind][domain];
						}

						for (domain in complex_rules[kind]) {
							for (rule in complex_rules[kind][domain]) {
								ref =  complex_rules[kind][domain][rule];

								if (ref[0] === 4 || ref[0] === 3)
									delete complex_rules[kind][domain][rule];
							}

							if ($.isEmptyObject(complex_rules[kind][domain]))
								delete complex_rules[kind][domain];
						}
					}

					self.rules.reload();

					Settings.setItem('SimpleRules', JSON.stringify(simple_rules));
					Settings.setItem('Rules', JSON.stringify(complex_rules));

					self.installedBundle = 156;

					self.updater();
				});
			}, null, null, true);
		break;

		case v < 161: // 3.4.0
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

			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info">Update 3.4.0</p>',
				'<p><b>Important for expert users:</b> Automatic rule creation feature has been removed. Any existing temporary automatic rules ',
					'will be deleted. Disabled automatic rules will be converted into normal rules.</p>',
				'<p><b>New:</b> You can now create custom scripts to inject into webpages. This can be done from the ',
					'<a class="outside" href="', ExtensionURL('settings.html#for-custom'), '">Custom tab</a> of the settings page.</p>',
				'<p>Changed: The confirm dialogs other feature has been removed.</p>',
				'<p><input type="checkbox" id="submit-usage" checked> <a id="show-usage">Submit anonymous usage statistics</a></p>',
				'<textarea id="usage-stats" style="width:400px; height: 50px;display:none;" readonly>',
					'Beta: ', self.isBeta, "\n\n",
					'User Agent: ', navigator.userAgent, "\n\n",
					'Settings: ', JSON.stringify(e), "\n\n",
				'</textarea>',
				'<p><input type="button" id="rawr-ok" value="', _('Understood'), '" /></p>'
			].join(''), function () {
				$$('#show-usage').click(function () {
					$$('#usage-stats').toggle();
				});

				$$('#rawr-ok').click(function () {
					var submit = $$('#submit-usage').is(':checked');

					new Poppy();

					for (var domain in self.rules.rules.special)
						self.rules.remove('special', domain, 'confirm_dialogs');

					if (!self.simpleMode)
						for (var kind in self.rules.rules) {
							for (var domain in self.rules.rules[kind]) {
								for (var rule in self.rules.rules[kind][domain]) {
									if (self.rules.rules[kind][domain][rule][0] === 2 || self.rules.rules[kind][domain][rule][0] === 3)
										self.rules.remove(kind, domain, rule);
									else if (self.rules.rules[kind][domain][rule][0] < 0) {
										self.rules.remove(kind, domain, rule);
										self.rules.add(kind, domain, rule, 1);
									}
								}
							}
						}

					if (submit) $.post(self.baseURL + 'usage.php', { id: Settings.getItem('installID'), data: $$('#usage-stats').text() });

					self.installedBundle = 161;

					self.updater();
				});
			}, null, null, true);
		break;

		case v < 162: // 4.0.0
			var all = SettingStore.all(), setting, i;

			for (setting in all) {
				if (~(i = setting.indexOf('IsCollapsed'))) {
					if (all[setting] !== null) Settings.setItem(setting.substr(0, i) + 'Switch', all[setting]);
					Settings.removeItem(setting);
				}

				if (Settings.getItem(setting) === null) Settings.removeItem(setting);
			}

			Settings.removeItem('theme');

			if (Settings.getItem('simplifiedRules') === false) {
				self.update_attention_required = 162;

				new Poppy($(this.popover.body).width() / 2, 0, [
					'<p class="misc-info">Update 4.0.0 - Deprecation Notice</p>',
					'<p>You are using a deprecated version of rule storage. Your rules will be automatically converted to utilize ',
						'the current storage method. Unfortunately, this automatic conversion will not be able to convert all of your ',
						'rules. Please review the rule list once conversion is completed.</p>',
					'<p><input type="button" id="convert-rules" value="', _('Convert Rules'), '" /></p>'
				].join(''), function () {
					$$('#convert-rules').click(function () {
						var result = self.rules.convert();

						self.installedBundle = 162;

						self.updater();

						if (result !== true)
							new Poppy($(this.popover.body).width() / 2, 0, [
								'<p>Some rules could not be converted. This will be the only time those rules will be displayed. Be sure to copy ',
									'them if needed.</p>',
								'<textarea readonly="readonly">', result, '</textarea>'
							].join(''));
					});
				}, null, null, true);
			} else {
				self.installedBundle = 162;

				self.updater();
			}
		break;

		case v < 165: // 4.0.3
			Settings.removeItem('enablespecial');

			self.installedBundle = 165;

			self.updater();
		break;

		case v < 168: // 4.0.5
			if (Settings.getItem('enable_special_ajax_intercept'))
				Settings.setItem('alwaysBlockajax', 'ask');

			Settings.removeItem('enable_special_ajax_intercept');
			Settings.removeItem('expandColumns');
			Settings.removeItem('noExpandSimple');

			self.installedBundle = 168;

			self.updater();
		break;

		case v < 171: // 4.0.8
			var with_no_donation = Settings.getItem('simpleReferrer') && (!self.donationVerified || self.trial_active());

			if (!Settings.getItem('simpleReferrer')) Settings.setItem('enable_special_simple_referrer', false);

			Settings.removeItem('simpleReferrer')

			if (with_no_donation)
				new Poppy($(this.popover.body).width() / 2, 0, [
					'<p class="misc-info">The Referrer Update</p>',
					'<p>This update turns a feature you are using into one only obtainable by unlocking all features.</p>',
					'<p>Because you have not yet made a contribution, all features will be unlocked for <b>free</b>. Enjoy.</p>',
					'<p><input type="button" id="reload-popover" value="', _('Continue'), '" /></p>'
				].join(''), function () {
					$$('#reload-popover').click(function () {
						self.trialStart = -1;
						self.donationVerified = 777;
						Popover.window().location.reload();
					});
				}, null, null, true);
			else {
				this.installedBundle = 171;

				this.updater();
			}
		break;

		case v < 177: // 4.1.0
			var pre = JSON.parse(Settings.getItem('custompreScripts') || '{}'),
					post = JSON.parse(Settings.getItem('custompostScripts') || '{}'),
					all = $.extend({}, pre, post), test;

			if (!$.isEmptyObject(all)) {
				self.update_attention_required = self.update_attention_required <= 177 ? 177 : self.update_attention_required;

				new Poppy($(this.popover.body).width() / 2, 0, [
					'<p class="misc-info">The User Scripts Update</p>',
					'<p>This updates changes the way custom scripts work. Because you have custom scripts from a previous version of JavaScript Blocker, ',
					'they will have to be updated to be compatible. This process is completely automatic. If applicable, you should create a new backup ',
					'once this is done since backups containing the old custom scripts cannot be imported any longer.</p>',
					'<p><input type="button" id="rewrite-scripts" value="', _('Continue'), '" /></p>'
				].join(''), function () {
					$$('#rewrite-scripts').click(function () {
						for (var ns in all) {
							test = UserScript._parse(all[ns].func);

							if (!test.data.name || !test.data.namespace) {
								UserScript.add([
									'// ==UserScript==',
									'// @name ' + all[ns].name,
									'// @namespace ' + ns,
									~ns.indexOf('pre') ? '// @run-at document-start' : '',
									'// ==/UserScript==',
									' ', ' '
								].join("\n") + all[ns].func);
							} else
								UserScript.add(all[ns].func);
						}

						Settings.removeItem('custompostScripts');
						Settings.removeItem('custompreScripts');

						this.installedBundle = 177;

						this.updater();
					});
				}, null, null, true);
			} else {
				this.installedBundle = 177;

				this.updater();
			}
		break;

		case v < 178: // 4.1.1
			var all = $.extend({}, UserScript._all);

			for (var ns in all) {
				UserScript.remove(ns);
				UserScript.add(all[ns].script);
			}

			this.donate();

			// this.installedBundle = 177;

			// this.updater();
		break;


		case v < this.bundleid:
			this.donate();

		default:
		break;
	}
};
