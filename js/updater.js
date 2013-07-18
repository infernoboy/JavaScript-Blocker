"use strict";

JB.updater = function () {
	var v = this.installedBundle, self = this;
				
	if (v === this.bundleid && !this.isBeta) return false;
	
	switch (true) {
		case v < 53: // Too Old
			this.clear_ui();
			
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info">Too Old</p>',
				'<p>You are using an extremely outdated version of JavaScript Blocker. You must uninstall it and reinstall the latest version manually; ',
					'updating will not work.'].join(''), null, null, null, true);
		break;

		case v < 54: // 2.3.0
			if (!('Rules' in window.localStorage)) {
				window.localStorage.removeItem('CollapsedDomains');
				window.localStorage.removeItem('InstallID');
			
				var ex = ['CollapsedDomains', 'ExamineUpdateTime', 'InstalledBundleID', 'LastRuleWasTemporary', 'ERROR', 'Rules',
						'allowedIsCollapsed', 'blockedIsCollapsed', 'unblockedIsCollapsed'], key, n = {};
			
				for (key in window.localStorage) {
					if (~ex.indexOf(key)) continue;
				
					try {
						n[key] = JSON.parse(window.localStorage[key]);
					} catch (e) {
						continue;
					} finally {
						window.localStorage.removeItem(key);
					}
				}
			
				window.localStorage.setItem('Rules', JSON.stringify(n));
			}
			
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info">Update 2.3.0</p>',
				'<p>You can now enable the use of a larger display font.</p>',
				'<p>A new option will let you block some referer headers. This utilizes the \'rel="noreferrer"\' attribute of anchors.</p>',
				'<p><b>Donators only:</b> A more full-featured referrer blocker, including the ability to block even server-side redirect ones.</p>',
				'<p><b>Donators only:</b> You can now create a backup of your rules.</p>',
				'<p>Donations can now be made via Bitcoin! Send to: 1C9in5xaFcwi7aYLuK1soZ8mvJBiEN9MNA</p>',
				'<p><input type="button" id="rawr-continue" value="', _('Understood'), '" /></p>'].join(''), function () {
					$$('#rawr-continue').click(function () {
						self.installedBundle = 54;
						self.updater();
					});
			}, null, null, true);
		break;
		
		case v < 59:
			var x;
			
			SettingStore.setItem('installID', this.utils.id() + '~' + this.displayv);
						
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info">Important Donator Information</p>',
				'<p>', _('New donation method {1}', [_('Unlock')]), '</p>',
				'<p><input type="button" id="rawr-continue" value="', _('Understood'), '" /></p>'].join(''), function () {
					$$('#rawr-continue').click(function () {
						self.installedBundle = 59;
						self.updater();
					});
				}, $.noop, null, true);
		break;
		
		case v < 60:
			var test = window.localStorage.getItem('Rules');
			
			try {
				test = JSON.parse(test);
				
				if (!('script' in test))
					window.localStorage.setItem('Rules', JSON.stringify({
						script: JSON.parse(window.localStorage.getItem('Rules')),
						frame: {},
						embed: {},
						image: {}
					}));
			} catch (e) {}
			
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info">Update 2.4.0</p>',
				'<p>A new donator-only feature has been added!</p>',
				'<p>You can now block the loading of frames, embeds, objects, and videos.</p>',
				'<p>Open the extension settings to learn more.</p>',
				'<p>',
					'<input type="button" id="rawr-continue" value="', _('Understood'), '" /> ',
				'</p>'].join(''), function () {
					$$('#rawr-continue').click(function () {
						self.installedBundle = 60;
						self.updater();
					});
				}, $.noop, null, true);
		break;
		
		case v < 61:
			this.installedBundle = 61;
						
		case v < 64: // 2.4.3
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info">Update 2.4.3</p>',
				'<p><b>New:</b> You can now click on an item in the main window to find out safety information about the host.</p>',
				'<p><b>New for Donators:</b> A new theme called Linen.</p>',
				'<p><b>Important:</b> The image blocker function is now disabled by default because WebKit does <b>not</b> ',
						'prevent images from loading; it merely hides them from the DOM. This is a limitation of Safari, not JavaScript Blocker. ',
						'Please be aware that any extension that claims to block tracking companies that use images to track users does <b>not</b> ',
						'work. I do not want to give anyone a false sense of security so I have disabled the feature by default and have removed the blacklist ',
						'rules for tracker images.</p>',
				'<p><input type="button" id="rawr-continue" value="', _('Understood'), '" /></p>'
			].join(''), function () {
				$$('#rawr-continue').click(function () {
					self.installedBundle = 64;
					self.updater();
				});
			}, $.noop, null, true);
		break;
		
		case v < 70: // 2.4.9
			if ('Rules' in window.localStorage) {
				this.rules.import(window.localStorage.getItem('Rules'));
				window.localStorage.removeItem('Rules');
			}
		
			SettingStore.setItem('installedBundle', v);
		
		case v < 75: // 2.5.0
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info">Update 2.5.0</p>',
				'<p>If you have not made a donation before, you will receive a 10-day free trial of all JavaScript Blocker has to offer.</p>',
				'<p><a class="outside" href="http://javascript-blocker.toggleable.com/donation_only">', _('What donation?'), '</a></p>',
				'<p><input type="button" id="rawr-ok" value="', _('Understood'), '" /></p>'].join(''), function () {
					$$('#rawr-ok').click(function () {
						window.localStorage.clear();
						
						self.trialStart = SettingStore.getItem('donationVerified') ? -1 : +new Date();

						self.installedBundle = 75;
						self.updater();
					});
				}, null, null, true);
		break;
		
		case v < 79: // 2.6.0
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info"><a class="outside" href="http://javascript-blocker.toggleable.com/change-log/260/">Update 2.6.0</a></p>',
				'<p><b>New:</b> A two-column makes it even easier to see what\'s been allowed or blocked. To improve the look and feel of this ',
				'layout, the Allow and Block buttons have been removed. All you have to do is click on the allowed or blocked item for the ',
				'same behavior. A "?" appears next to an item to bring up the poppy that originally appeared when clicking on an item.',
				'<p><small>If you hate this new two-column layout, please do not hesitate to let me know!</small></p>',
				'<p><b>New:</b> All settings have been moved to their own dedicated page which can be reached by clicking the <b>Settings</b> button at ',
				'the bottom of this popover.</p>',
				'<p><b>New:</b> The script blocker can now be disabled.</p>',
				'<p><i>Changed:</i> The video blocker is now separate from the embed and object blocker. Existing embed, object, and video rules will be imported ',
				'as video rules automatically.</p>',
				'<p><b>New for Donators:</b> A new "other" feature to prevent webpages from disabling autocomplete.</p>',
				'<p><b>New for Donators:</b> A new "other" feature to allow users to use a custom font for webpages.</p>',
				'<p><input type="button" id="rawr-ok" value="', _('Understood'), '" /> <input type="button" id="rawr-settings" value="', _('Settings'), '" /></p>'].join(''), function () {
					$$('#rawr-ok').click(function () {
						if (Settings.getItem('enableembed')) Settings.setItem('enablevideo', 1);

						for (var d in self.rules.rules.embed)
							for (var r in self.rules.rules.embed[d])
								self.rules.add('video', d, r, self.rules.rules.embed[d][r][0], self.rules.rules.embed[d][r][1]);

						self.installedBundle = 79;
						self.updater();
					}).siblings('#rawr-settings').click(function () {
						$$('#js-settings').click();
					});
				}, null, null, true);
		break;

		case v < 83: // 2.6.3
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info"><a class="outside" href="http://javascript-blocker.toggleable.com/change-log/263/">Update 2.6.3</a></p>',
				'<p><b>New:</b> A feature to ask for confirmation before navigating to short URLs has been added. This uses the LongURL.org service. It can be enabled from the Settings page under "Other Features".</p>',
				'<p><input type="button" id="rawr-ok" value="', _('Understood'), '" /> <input type="button" id="rawr-settings" value="', _('Settings'), '" /></p>'].join(''), function () {
					$$('#rawr-ok').click(function () {
						self.installedBundle = 83;
						self.updater();
					}).siblings('#rawr-settings').click(function () {
						$$('#js-settings').click();
					});
			}, null, null, true);
		break;

		case v < 85: // 2.6.5
			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info"><a class="outside" href="http://javascript-blocker.toggleable.com/change-log/263/">Update 2.6.5</a></p>',
				'<p><b>New:</b> Items in the main window affected by the blacklist will have a red background, by the whitelist a green one, and a standard rule gray. ',
					'This may be disabled from the <b>User Interface</b> section on the settings page.</p>',
				'<p><b>New:</b> Clicking the "?" next to a blocked or allowed item affected by a rule will let you view the matched rules.</p>',
				'<p><input type="button" id="rawr-ok" value="', _('Understood'), '" /> <input type="button" id="rawr-settings" value="', _('Settings'), '" /></p>'].join(''), function () {
					$$('#rawr-ok').click(function () {
						self.installedBundle = 85;
						self.updater();
					}).siblings('#rawr-settings').click(function () {
						$$('#js-settings').click();
					});;
			}, null, null, true);
		break;

		case v < 89: // 2.8.0
			Settings.setItem('allowDisablingSimplifiedRules', true);

			new Poppy($(this.popover.body).width() / 2, 0, [
				'<p class="misc-info"><a class="outside" href="http://javascript-blocker.toggleable.com/change-log/280/">Update 2.8.0</a></p>',
				'<p><b>New:</b> A new UI has been added that makes managing rules even easier. In the rule list, rules will appear in plain English ',
					'without complex regular expressions. This UI is the default for new installations, but because it requires a new rule set, ',
					'existing installations will not be upgraded automatically. You must manually update them by clicking Convert Rules. This ',
					'can also be done from the settings page. To turn on the new rule display, open the settings page and check ',
					'<b>Use simplified rules</b> under the User Interface tab. The setting will be visible only if expert features are disabled.</p>',
				'<p>',
					'<input type="button" id="rawr-ok" value="', _('Understood'), '" /> ',
					'<input type="button" id="convert-rules" value="', _('Convert Rules'), '" /> ',
					'<input type="button" id="rawr-settings" value="', _('Settings'), '" />',
				'</p>'].join(''), function () {
					$$('#rawr-ok').click(function () {
						Settings.setItem('simplifiedRules', false);
						self.installedBundle = 89;
						self.updater();
					}).siblings('#rawr-settings').click(function () {
						$$('#js-settings').click();
					}).siblings('#convert-rules').click(function () {
						var re = self.rules.convert(), message = null;

						if (re === true) message = _('Rules converted.');
						else message = _('Some rules could not be converted {1}', ['<textarea readonly>' + re + '</textarea>']);

						new Poppy($(self.popover.body).width() / 2, 0, [
							'<p>', message, '</p>',
							'<p>',
								'<input type="button" id="rawr-ok" value="', _('Understood'), '" /> ',
								'<input type="button" id="rawr-settings" value="', _('Settings'), '" />',
							'</p>'].join(''), function () {
								$$('#rawr-ok').click(function () {
									Settings.setItem('simplifiedRules', false);
									self.installedBundle = 89;
									self.updater();
								}).siblings('#rawr-settings').click(function () {
									$$('#js-settings').click();
								});
						}, null, null, true);
					});
			}, null, null, true);
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

					// self.installedBundle = 156;

					self.donate();
				});
			}, null, null, true);
		break;

		case v < this.bundleid:
			this.donate();

		default:
		break;
	}
};
