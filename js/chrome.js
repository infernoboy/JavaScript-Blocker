if (window.chrome !== undefined) {
var CHROME = true, SAFARI = false,
		ToolbarItems = {
			badge: function (number) {
				chrome.browserAction.setBadgeText({ text: number === 0 ? '' : number.toString() });
			},
			image: function (path) {
				chrome.browserAction.setIcon({ path: path });
			},
			visible: function () {
				return true;
			}
		},

		Popover = {
			object: function () {
				return chrome.extension.getViews({
					type: "popup"
				})[0];
			},
			window: function () {
				return this.object();
			},
			hide: function () {
				/* NOT IMPLEMENTED */
			},
			visible: function () {
				/* NOT IMPLEMENTED */
				return true;
			}
		},

		BrowserWindows = {
			all: function (callback) {
				chrome.windows.getAll({ populate: true }, callback);
			},
			active: function (callback) {
				chrome.windows.getLastFocused({ populate: true}, callback);
			},
			open: function (callback) {
				chrome.windows.create({ focused: true }, callback);
			}
		},

		Tabs = {
			all: function (callback) {
				var tabs = [];

				BrowserWindows.all(function (browserWindows) {
					browserWindows.forEach(function (browserWindow) {
						if (browserWindow.type === 'normal')
							browserWindow.tabs.forEach(function (tab) {
								callback.call(browserWindow, tab);
							});
					});
				});
			},
			active: function (callback) {
				chrome.tabs.query({ currentWindow: true, active: true }, callback);
			},
			create: function (object) {
				BrowserWindows.active(function (w) {
					if (w)
						chrome.tabs.create({ windowId: w.id, url: object.url }, null);
					else {
						BrowserWindows.open();
						Tabs.create(object);
					}
				});
			},
			messageActive: function (message, data) {
				Tabs.active(function (tab) {
					if (tab.length)
						chrome.tabs.sendMessage(tab[0].id, { message: message, data: data });
				});
			}
		},

		GlobalPage = {
			page: function () {
				return chrome.extension.getBackgroundPage();
			},
			dispatchMessage: function (message, data) {
				this.page().receiveMessage({}, message, data);
			}
		},

		SettingStore = {
			available: function () {
				return true;
			},
			getItem: function (key) {
				return window.localStorage.getItem(key);
			},
			setItem: function (key, value) {
				window.localStorage.setItem(key, value);
			},
			removeItem: function (key) {
				window.localStorage.removeItem(key);
			},
			all: function () {
				return window.localStorage;	
			}
		},

		Events = {
			addApplicationListener: function (type, callback, thisValue) {
				switch (type) {
					case 'popover':
						chrome.browserAction.onClicked.addListener(callback.bind(thisValue));
					break;

					case 'close':
						chrome.tabs.onRemoved.addListener(callback.bind(thisValue));
					break;

					case 'beforeNavigate':
					break;

					case 'validate':
						setInterval(callback.bind(thisValue), 1000);
					break;

					case 'message':
						chrome.extension.onMessage.addListener(callback.bind(thisValue));
					break;
				}
			},
			addSettingsListener: function (callback, thisValue) {
				/* NOT IMPLEMENTED */
			},
			addTabListener: function (type, callback) {
				/* NOT IMPLEMENTED */
			}
		},

		PrivateBrowsing = function () {
			/* NOT IMPLEMENTED */
			return false;
		},

		ExtensionURL = function (path) {
			return chrome.extension.getURL(path);
		},

		ResourceCanLoad = function (beforeLoad, data) {
			return safari.self.tab.canLoad(beforeLoad, data);
		}
};
