"use strict";

var Settings = Settings || {};

Settings._alwaysBlockHelp = _('alwaysBlock help');
Settings._alwaysBlock = [['domain', 'Different hostnames'], ['topLevel', 'Different hosts &amp; subdomains'], ['nowhere', 'Nowhere'], ['everywhere', 'Anywhere']];
Settings.settings = {
	misc: {
		donationVerified: {
			default: false
		},
		enablespecial: {
			default: true
		},
		enablehide_script: {
			default: true
		},
		enablehide_embed: {
			default: true
		},
		enablehide_video: {
			default: true
		},
		enablehide_image: {
			default: true
		},
		enablehide_special: {
			default: true
		},
		enablehide_frame: {
			default: true
		},
		installID: {
			default: false
		},
		installedBundle: {
			default: 0
		},
		trialStart: {
			default: 0
		}
	},
	ui: {
		animations: {
			label: 'Use animations',
			setting: true,
			default: true
		},
	/*	floaters: {
			label: 'Use floating headers',
			setting: true,
			default: true
		},*/
		largeFont: {
			label: 'Use a large font',
			setting: false,
			default: false
		},
		simplifiedRules: {
			label: 'Use simplified rules',
			setting: false,
			if_setting: ['simpleMode', true],
			help: _('simplifiedRules help'),
			default: true
		},
		highlight: {
			label: 'Highlight items that matched a rule',
			setting: false,
			default: true,
			help: _('highlight help')
		},
		showPerHost: {
			label: 'Show the number of items blocked or allowed for each host',
			setting: false,
			if_setting: ['simpleMode', true],
			help: _('showPerHost help'),
			default: false
		},
		showUnblocked: {
			label: 'Show scripts that can\'t be blocked',
			setting: false,
			help: _('showUnblocked help'),
			default: false
		},
		showWLBLRules: {
			label: 'Show whitelist and blacklist rules in the rule list',
			setting: true,
			default: true,
			divider: 1
		},
		language: {
			label: 'Language:',
			setting: [['Automatic', 'Automatic'], ['en-us', 'US English'], ['de-de', 'Deutsch']],
			default: 'Automatic'
		},
		sourceCount: {
			label: 'Sources displayed by default:',
			setting: [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [99999999, 'All of them']],
			default: '99999999'
		},
		toolbarDisplay: {
			label: 'Toolbar badge shows number of:',
			setting: [['blocked', 'Blocked items'], ['allowed', 'Allowed items'], ['neither', 'Neither']],
			divider: 1,
			default: 'blocked'
		},
		theme: {
			label: 'Theme:',
			setting: [['default', 'Default'], ['metal', 'Textured Metal'], ['lion', 'OS X Lion'], ['linen', 'Blue Linen'], ['twilight', 'Twilight (Incomplete)']],
			donator: 1,
			divider: 1,
			default: 'default',
			donator_only: 1
		},
		simpleMode: {
			label: 'Enable expert features to block individual items instead of full hosts',
			setting: false,
			opposite: 1,
			default: true,
			donator_only: 1
		}
	},
	predefined: {
		ignoreWhitelist: {
			label: 'Ignore whitelist rules',
			setting: false,
			default: false
		},
		ignoreBlacklist: {
			label: 'Ignore blacklist rules',
			setting: false,
			default: false
		},
		saveAutomatic: {
			label: 'Create temporary rules for automatic actions',
			setting: false,
			if_setting: ['simpleMode', false],
			default: true,
			donator_only: 1
		},
		secureOnly: {
			label: 'Resources on secure sites must also be secure',
			setting: false,
			default: false
		},
		allowExtensions: {
			label: 'Automatically allow resources from other extensions',
			setting: true,
			divider: 1,
			default: true
		},
		enablescript: {
			label: 'Enable script blocker',
			setting: true,
			default: true
		},
		alwaysBlock: {
			label: 'Automatically block scripts from:',
			setting: Settings._alwaysBlock,
			divider: 1,
			if_setting: ['enablescript', true],
			help: Settings._alwaysBlockHelp,
			default: 'domain'
		},
		enableframe: {
			label: 'Enable frame blocker',
			setting: false,
			donator: 1,
			default: true,
			donator_only: 1
		},
		showPlaceholderframe: {
			label: 'Show a placeholder for blocked frames',
			setting: true,
			if_setting: ['enableframe', true],
			default: true,
			donator_only: 1
		},
		alwaysBlockframe: {
			label: 'Automatically block frames from:',
			setting: Settings._alwaysBlock,
			divider: 1,
			if_setting: ['enableframe', true],
			help: Settings._alwaysBlockHelp,
			default: 'domain',
			donator_only: 1
		},
		enableembed: {
			label: 'Enable embed and object blocker',
			setting: false,
			default: false,
			donator_only: 1
		},
		showPlaceholderembed: {
			label: 'Show a placeholder for blocked embeds and objects',
			setting: true,
			if_setting: ['enableembed', true],
			default: true,
			donator_only: 1
		},
		alwaysBlockembed: {
			label: 'Automatically block embeds and objects from:',
			setting: Settings._alwaysBlock,
			divider: 1,
			if_setting: ['enableembed', true],
			help: Settings._alwaysBlockHelp,
			default: 'everywhere',
			donator_only: 1
		},
		enablevideo: {
			label: 'Enable video blocker',
			setting: false,
			default: false,
			donator_only: 1
		},
		showPlaceholdervideo: {
			label: 'Show a placeholder for blocked videos',
			setting: true,
			if_setting: ['enablevideo', true],
			default: true,
			donator_only: 1
		},
		alwaysBlockvideo: {
			label: 'Automatically block videos from:',
			setting: Settings._alwaysBlock,
			divider: 1,
			if_setting: ['enablevideo', true],
			help: Settings._alwaysBlockHelp,
			default: 'everywhere',
			donator_only: 1
		},
		enableimage: {
			label: 'Enable DOM image blocker',
			setting: false,
			help: _('enableimage help'),
			default: false,
			donator_only: 1
		},
		showPlaceholderimage: {
			label: 'Show a placeholder for blocked images',
			setting: true,
			if_setting: ['enableimage', true],
			default: true,
			donator_only: 1
		},
		alwaysBlockimage: {
			label: 'Automatically block images from:',
			setting: Settings._alwaysBlock,
			if_setting: ['enableimage', true],
			help: Settings._alwaysBlockHelp,
			default: 'nowhere',
			donator_only: 1
		}
	},
	other: {
		simpleReferrer: {
			label: 'Prevent links on webpages from sending referrer information',
			setting: false,
			help: _('simpleReferrer help'),
			default: false
		},
		confirmShortURL: {
			label: 'Confirm short URL redirects before they occur',
			setting: false,
			default: false,
			divider: 1,
			confirm: function () {
				var u = 'http://api.longurl.org/v2/expand?format=json&url=http%3A%2F%2Fis.gd%2Fw', r;

				$.ajax({
					async: false,
					url: u,
					dataType: 'json'
				}).success(function (s) {
					r = s['long-url'] ? confirm(_('confirmShortURL confirm')) : alert(_('You cannot enable confirmShortURL'));
				}).error(function (er) {
					r = alert(_('You cannot enable confirmShortURL'));
				});

				return r;
			}
		},
		blockReferrer: {
			label: 'EXPERIMENTAL: Enable full referrer blocking',
			setting: false,
			donator: 1,
			divider: 1,
			default: false,
			donator_only: 1,
			help: _('blockReferrer help')
		},
		enable_special_alert_dialogs: {
			label: 'Display alert() messages within the webpage instead of a popup dialog',
			setting: false,
			description: _('Once any of these features are active, they can be disabled on a per-domain basis. They will appear in the main window under <b>OTHER</b> and will not count towards the amount of blocked/allowed resources.'),
			default: false,
			donator_only: 1
		},
		enable_special_confirm_dialogs: {
			label: 'Disable confirm() popup dialogs and confirm actions automatically',
			setting: false,
			default: false,
			donator_only: 1
		},
		enable_special_contextmenu_overrides: {
			label: 'Prevent webpages from disabling or using a custom context menu and prevent other extensions from creating menu items',
			setting: false,
			help: _('contextmenu_overrides help'),
			default: false,
			donator_only: 1
		},
		enable_special_window_resize: {
			label: 'Prevent webpages from resizing the window and creating new windows with a custom size',
			setting: false,
			default: false,
			donator_only: 1
		},
		enable_special_autocomplete_disabler: {
			label: 'Prevent webpages from disabling autocomplete',
			setting: false,
			default: false,
			donator_only: 1
		},
		enable_special_font: {
			label: 'Custom font for webpages:',
			prompt: 'Enter a custom font name to use.',
			setting: [[0, 'Webpage default'], ['Helvetica', 'Helvetica'], ['Arial', 'Arial'], ['Times', 'Times'], ['Comic Sans MS', 'Comic Sans MS'], ['other', 'Other…']],
			default: '0',
			donator_only: 1
		},
		enable_special_zoom: {
			label: 'Custom zoom level for webpages:',
			prompt: 'Enter a custom zoom level to use.',
			setting: [[0, 'Webpage default'], [60, '60%'], [80, '80%'], [100, '100%'], [120, '120%'], [140, '140%'], [160, '160%'], [180, '180%'], [200, '200%'], ['other', 'Other…']],
			default: '0',
			donator_only: 1
		}
	},
	about: {
		header: {
			label: false,
			description: [
				'<a href="http://javascript-blocker.toggleable.com/" target="_top">',
					'<img src="images/toggleable.png" alt="Toggleable" style="margin-left:-8px;" />',
					'<img src="Icon-32.png" alt="JavaScript Blocker" style="margin-bottom:5px;margin-left:5px;" />',
				'</a>',
				'<h4>JavaScript Blocker <span id="js-displayv"></span> (<span id="js-bundleid"></span>)</h4>'].join('')
		},
		trial: {
			id: 'trial-remaining',
			label: '',
			classes: 'description',
			divider: 1
		},
		reinstallWLBL: {
			label: 'Reinstall whitelist and blacklist rules:',
			setting: 'Reinstall',
			description: _('These actions are permanent and cannot be undone. If you have a verified donation, backup your rules before proceeding.')
		},
		resetSettings: {
			label: 'Reset all settings to their default values:',
			setting: 'Reset Settings'
		},
		removeRules: {
			label: 'Remove all rules:',
			setting: 'Remove Rules',
		},
		convertRules: {
			label: 'Convert non-simplified rules:',
			setting: 'Convert Rules',
			divider: 1,
			help: _('convertRules help')
		},
		createBackup: {
			label: 'Create a full backup:',
			setting: 'Create Backup',
			donator: 1,
			donator_only: 1,
			description: _('Full backup description')
		},
		importBackup: {
			label: 'Import a full backup:',
			setting: 'Import Backup',
			donator_only: 1
		}
	},
	search: {
		headerSearch: {
			classes: 'donator',
			label: 'Search Results',
			setting: null
		}
	}
};

Settings.items = {};

for (var section in Settings.settings) {
	if (section === 'about') continue;

	for (var setting in Settings.settings[section])
		Settings.items[setting] = {
			default: Settings.settings[section][setting].default,
			editable: section !== 'misc'
		}
}

Settings.getItem = function (setting) {
	var tes = safari.extension.settings ? safari.extension.settings.getItem(setting) : Settings.current_value(setting);
	return tes === null ? (Settings.items[setting] ? Settings.items[setting].default : false) : tes;
};

Settings.setItem = function (setting, v) {
	if (!safari.extension.settings) return null;
	safari.extension.settings.setItem(setting, v);
}
