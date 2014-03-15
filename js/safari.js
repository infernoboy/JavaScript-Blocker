if (window.safari !== undefined) {
var SAFARI = true,
		beforeLoad = {'url':'','returnValue':true,'timeStamp':1334608269228,'eventPhase':0,'target':null,'defaultPrevented':false,'srcElement':null,'type':'beforeload','cancelable':false,'currentTarget':null,'bubbles':false,'cancelBubble':false},
		ToolbarItems = {
			badge: function (number, tab) {
				safari.extension.toolbarItems.forEach(function (toolbarItem) {
					if (!toolbarItem.browserWindow) return;
					
					if (tab === null || tab === toolbarItem.browserWindow.activeTab)
						toolbarItem.badge = number;
				});
				return this;
			},
			image: function (path) {
				safari.extension.toolbarItems.forEach(function (toolbarItem) {
					toolbarItem.image = ExtensionURL(path);
				});
				return this;
			},
			visible: function () {
				return safari.extension.toolbarItems.length > 0;
			},
			state: function (enabled) {
				safari.extension.toolbarItems.forEach(function (toolbarItem) {
					toolbarItem.disabled = enabled;
				});
				return this;
			},
			showPopover: function () {
				safari.extension.toolbarItems.forEach(function (toolbarItem) {
					if (!toolbarItem.browserWindow) return;
					
					if (toolbarItem.browserWindow === BrowserWindows.active())
						toolbarItem.showPopover();
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

				if (callback) callback.call(this, activeWindow ? [activeWindow.activeTab] : []);
				else return activeWindow ? activeWindow.activeTab : null;
			},
			create: function (object) {
				var activeWindow = BrowserWindows.active();

				if (activeWindow) activeWindow.openTab().url = object.url;
				else BrowserWindows.open().activeTab.url = object.url;
			},
			messageActive: function (message, data) {
				this.active(function (tab) {
					if (tab.length && tab[0].page) tab[0].page.dispatchMessage(message, JSON.stringify(data));
				});
			},
			messageAll: function (message, data) {
				this.all(function (tab) {
					MessageTarget({ target: tab }, message, data);
				});
			}
		},

		GlobalPage = {
			page: function () {
				try {
					return safari.extension.globalPage.contentWindow;
				} catch (e) {
					return null;
				}
			},
			message: function (message, data) {
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
			removeItem: function (key) {
				safari.extension.settings.removeItem(key);
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
			},
			setContextMenuEventUserInfo: function (event, data) {
				safari.self.tab.setContextMenuEventUserInfo(event, data);
			}
		},

		MessageTarget = function (event, name, data) {
			if (event.target.page) event.target.page.dispatchMessage(name, data);
		},

		PrivateBrowsing = function () {
			return safari.application.privateBrowsing && safari.application.privateBrowsing.enabled;
		},

		ExtensionURL = function (path) {
			return safari.extension.baseURI + (path || '');
		},

		ResourceCanLoad = function (beforeLoad, data) {
			return safari.self.tab.canLoad(beforeLoad, data);
		}
} else {
	console.error('safari object is unavailable in a frame on this page. This is a bug with Safari that has existed ever since extentions were available. If you\'re an extension developer, you can file a bug report at http://bugreport.apple.com/ The issue occurs when a frame\'s source is not originally a document, such as when it is javascript:"". Changing the source of the frame causes the newly loaded webpage to not have access to the safari object.')
}