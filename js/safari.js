if (typeof safari !== 'undefined') {
var SAFARI = true, CHROME = false,
		ToolbarItems = {
			badge: function (number) {
				safari.extension.toolbarItems.forEach(function (toolbarItem) {
					toolbarItem.badge = number;
				});
			},
			image: function (path) {
				safari.extension.toolbarItems.forEach(function (toolbarItem) {
					toolbarItem.image = ExtensionURL(path);
				});
			},
			visible: function () {
				return safari.extension.toolbarItems.length > 0;
			},
			state: function (enabled) {
				safari.extension.toolbarItems.forEach(function (toolbarItem) {
					toolbarItem.disabled = enabled;
				});
			}
		},

		Popover = {
			object: function () {
				return ToolbarItems.visible() ? safari.extension.toolbarItems[0].popover : false;
			},
			window: function () {
				return this.object().contentWindow;
			},
			hide: function () {
				var popover = this.object();

				if (popover) popover.hide();
			},
			visible: function () {
				var visible = false;

				safari.extension.toolbarItems.forEach(function (toolbarItem) {
					if (toolbarItem.popover && toolbarItem.popover.visible)
						visible = true;
				});

				return visible;
			}
		},

		BrowserWindows = {
			all: function () {
				return safari.application.browserWindows;
			},
			active: function () {
				return safari.application.activeBrowserWindow;
			},
			open: function () {
				return safari.application.openBrowserWindow();
			}
		},

		Tabs = {
			all: function (callback) {
				BrowserWindows.all().forEach(function (browserWindow) {
					browserWindow.tabs.forEach(function (tab) {
						callback.call(window, tab);
					});
				});
			},
			active: function (callback) {
				var activeWindow = BrowserWindows.active();

				callback.call(this, activeWindow ? [activeWindow.activeTab] : []);
			},
			create: function (object) {
				var activeWindow = BrowserWindows.active();

				if (activeWindow) activeWindow.openTab().url = object.url;
				else BrowserWindows.open().activeTab.url = object.url;
			},
			dispatchToActive: function (message, data) {
				this.active(function (tab) {
					if (tab.length && tab[0].page) tab[0].page.dispatchMessage(message, data);
				});
			}
		},

		GlobalPage = {
			page: function () {
				return safari.extension.globalPage.contentWindow;
			},
			dispatchMessage: function (message, data) {
				safari.self.tab.dispatchMessage(message, data);
			}
		},

		SettingStore = {
			available: function () {
				return !!(safari && safari.extension && safari.extension.settings);
			},
			getItem: function (key) {
				return safari.extension.settings.getItem(key);
			},
			setItem: function (key, value) {
				safari.extension.settings.setItem(key, value);
			},
			all: function () {
				return safari.extension.settings;	
			}
		},

		Events = {
			addApplicationListener: function (type, callback, thisValue) {
				safari.application.addEventListener(type, callback.bind(thisValue), true);
			},
			addSettingsListener: function (callback, thisValue) {
				safari.extension.settings.addEventListener('change', callback.bind(thisValue));
			},
			addTabListener: function (type, callback) {
				safari.self.addEventListener(type, callback, true);
			}
		},

		PrivateBrowsing = function () {
			return safari.application.privateBrowsing && safari.application.privateBrowsing.enabled;
		},

		ExtensionURL = function (path) {
			return safari.extension.baseURI + (path || '');
		}
};
