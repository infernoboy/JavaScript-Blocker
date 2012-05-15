JB.updater = function () {
	var v = this.installedBundle, self = this;
				
	if (v === this.bundleid) return false;
	
	switch (true) {
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
			
			new Poppy($(this.popover.body).width() / 2, 13, [
				'<p class="misc-info">Update 2.3.0</p>',
				'<p>You can now enable the use of a larger display font.</p>',
				'<p>A new option will let you block some referer headers. This utilizes the \'rel="noreferrer"\' attribute of anchors.</p>',
				'<p><b>Donators only:</b> A more full-featured referrer blocker, including the ability to block even server-side redirect ones.</p>',
				'<p><b>Donators only:</b> You can now create a backup of your rules.</p>',
				'<p>Donations can now be made via Bitcoin! Send to: 1C9in5xaFcwi7aYLuK1soZ8mvJBiEN9MNA</p>',
				'<p><a class="outside" href="http://javascript-blocker.toggleable.com/donation_only">', _('What donation?'), '</a></p>',
				'<p><input type="button" id="rawr-continue" value="', _('Understood'), '" /></p>'].join(''), function () {
					_$('#rawr-continue').click(function () {
						self.installedBundle = 54;
						self.updater();
					});
			}, null, null, true);
		break;
		
		case v < 59:
			var x;
			
			if (x = safari.extension.secureSettings.installID) safari.extension.settings.setItem('installID', x);
			else if (!safari.extension.settings.installID) safari.extension.settings.setItem('installID', this.utils.id() + '~' + this.displayv);
						
			new Poppy($(this.popover.body).width() / 2, 13, [
				'<p class="misc-info">Important Donator Information</p>',
				'<p>', _('New donation method {1}', [_('Unlock')]), '</p>',
				'<p><input type="button" id="rawr-continue" value="', _('Understood'), '" /></p>'].join(''), function () {
					_$('#rawr-continue').click(function () {
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
			
			new Poppy($(this.popover.body).width() / 2, 13, [
				'<p class="misc-info">Update 2.4.0</p>',
				'<p>A new donator-only feature has been added!</p>',
				'<p>You can now block the loading of frames, embeds, objects, and videos.</p>',
				'<p>Open the extension settings to learn more.</p>',
				'<p>',
					'<input type="button" id="rawr-continue" value="', _('Understood'), '" /> ',
				'</p>'].join(''), function () {
					_$('#rawr-continue').click(function () {
						self.installedBundle = 60;
						self.updater();
					});
				}, $.noop, null, true);
		break;
		
		case v < 61:
			for (var key in this.rules.data_types)
				this.rules.reinstall_predefined(key);
			
			this.installedBundle = 61;
						
		case v < 64: // 2.4.3
			new Poppy($(this.popover.body).width() / 2, 13, [
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
				_$('#rawr-continue').click(function () {
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
		
			safari.extension.settings.setItem('installedBundle', v);
		
		case v < this.bundleid:
			this.donate();
	}
};