/***************************************
 * @file js/blocker.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

var beforeLoad = JSON.parse('{"url":"","returnValue":true,"timeStamp":1334608269228,"eventPhase":0,"target":null,"defaultPrevented":false,"srcElement":null,"type":"beforeload","cancelable":false,"currentTarget":null,"bubbles":false,"cancelBubble":false}'),
		random = +new Date,
		blank = window.location.href === 'about:blank',
		parentURL = (window !== window.top && blank) ? (safari.self.tab.canLoad(beforeLoad, 'parentURL') + '&about:blank:' + random) : false;

function pageHost(not_real) {
	if (parentURL) return parentURL;

	switch(window.location.protocol) {
		case 'http:':
		case 'https:':
		case 'file:':
			var base = window.location.origin + (bv[0] >= 535 ?
					window.location.pathname : escape(window.location.pathname)) + window.location.search;
			if (window.location.hash.length > 0 && !sans_hash) return base + window.location.hash;
			else if (window.location.href.substr(-1) === '#') return base + '#';
			else return base;
		break;
		
		default:
			return window.location.href;
		break;
	}
}

var bv = window.navigator.appVersion.split('Safari/')[1].split('.'),
		jsblocker = {
			allowed: {
				hosts: [],
				count: 0,
				urls: []
			},
			blocked: {
				hosts: [],
				count: 0,
				urls: []
			},
			unblocked: {
				hosts: [],
				count: 0,
				urls: []
			},
			href: pageHost()
		}, readyTimeout = [null, null], lastAddedFrameData = false, jsonBlocker = false, zero = [],
		settings = {}, settings_called = {};

if (window !== window.top && blank)
	jsblocker.display = 'about:blank (' + random + ')';
	
function zero_timeout(fn, args) {
	zero.push([fn, args]);
	window.postMessage('zero-timeout', '*');
}
	
function if_setting(setting, value, cb, args) {
	if (!(setting in settings))
		settings[setting] = safari.self.tab.canLoad(beforeLoad, ['setting', setting]);
	
	if (settings[setting] === value)
		cb.apply(window, args);
}

function activeHost(url) {
	var r = /^(https?|file|safari\-extension):\/\/([^\/]+)\//;
	if (url) {
		if (/^data/.test(url)) return 'Data URI';
		else if (url.match(r) && url.match(r).length > 2) return url.match(r)[2];
		else return 'ERROR';
	}
}
function allowedScript(event) {
	if (event.target.nodeName.toUpperCase() === 'SCRIPT' && event.target.src.length > 0 && event.type !== 'DOMNodeInserted') {
		var isAllowed = safari.self.tab.canLoad(event, [jsblocker.href, event.target.src, !(window == window.top)]),
				host = activeHost(event.target.src);

		if (!isAllowed) {
			if (typeof event.target.src === 'string' && event.target.src.length > 0) {
				jsblocker.blocked.count++;
				jsblocker.blocked.urls.push(event.target.src);
						
				if (!~jsblocker.blocked.hosts.indexOf(host)) jsblocker.blocked.hosts.push(host);

				event.preventDefault();
			}
		} else {
			jsblocker.allowed.count++;
			jsblocker.allowed.urls.push(event.target.src);
		
			if (!~jsblocker.allowed.hosts.indexOf(host)) jsblocker.allowed.hosts.push(host);
		}
	} else if (event.target.nodeName.toUpperCase() === 'SCRIPT' && event.target.src.length === 0 && event.type === 'DOMNodeInserted') {
		jsblocker.unblocked.count++;
		jsblocker.unblocked.urls.push(event.target.innerHTML);
	} else if (event.target.nodeName.toUpperCase() === 'A' && event.target.href.length) {

	}

	if (window !== window.top || event.type === 'DOMNodeInserted')
		ready(event);
}

function ready(event) {
	safari.self.tab.dispatchMessage('updateReady');
	
	var t = event.type === 'DOMContentLoaded' ? 1 : 0;
	
	clearTimeout(readyTimeout[t]);
		
	readyTimeout[t] = setTimeout(function (event) {
		if (event.type === 'DOMContentLoaded') {
			var script_tags = document.getElementsByTagName('script'), i, b;
			for (i = 0, b = script_tags.length; i < b; i++) {
				if (!script_tags[i].src || (script_tags[i].src && script_tags[i].src.length > 0 && /^data/.test(script_tags[i].src))) {
					jsblocker.unblocked.count++;
					jsblocker.unblocked.urls.push(script_tags[i].innerHTML);
				}
			}
		}
		if (window == window.top && event.type === 'DOMContentLoaded')
			safari.self.tab.dispatchMessage('setPopoverClass');
		else if (window !== window.top && lastAddedFrameData !== (jsonBlocker = JSON.stringify(jsblocker))) {
			lastAddedFrameData = jsonBlocker;
			safari.self.tab.dispatchMessage('addFrameData', [jsblocker.href, jsblocker]);
		}
		
		try {
			if (window === window.top)
				safari.self.tab.dispatchMessage('updatePopover', jsblocker);
		} catch(e) {
			if (!window._jsblocker_user_warned) {
				window._jsblocker_user_warned = true;
				console.error('JavaScript blocker broke! This is an issue with Safari itself. ' +
						'Reloading the page should fix things.')
			}
		}
	}, (event.type === 'focus') ? 100 : 300, event);
}

function messageHandler(event) {
	switch (event.name) {
		case 'reload': window.location.reload(); break;
		case 'updatePopover': ready(event); break;
		case 'validateFrame':
			var a = [pageHost(), jsblocker];

			function validateFrame(f) {
				for (var y = 0; y < f.length; y++) {
					if (!('src' in f[y]) || f[y].src.length < 1) continue;
					else if (f[y].src === event.message) {
						a.push(f[y].src);
						break;
					}
				}
			}
			
			validateFrame(document.getElementsByTagName('iframe'));
			
			if (a.length < 3) {
				validateFrame(document.getElementsByTagName('frame'));
				
				if (a.length < 3) a.push(-1);
			}
				
			safari.self.tab.dispatchMessage('addFrameData', a);
		break;
		case 'setting':
			settings[event.message[0]] = event.message[1];
		break;
	}
}

function hashUpdate(event) {
	var ohref = jsblocker.href.toString();
	
	jsblocker.href = pageHost();
	
	safari.self.tab.dispatchMessage('updateFrameData', [jsblocker.href, jsblocker, ohref])
	
	ready(event);
}

function prepareAnchors(event, anchors, forms) {
	var a = anchors || document.getElementsByTagName('a'),
			f = forms || document.getElementsByTagName('form');
	
	for (var x = 0; x < a.length; x++)
		if (a[x].getAttribute('href') && a[x].href !== '#')
			zero_timeout(function (an, i) {
				prepareAnchor(an, i);
			}, [a[x], x]);
	for (var y = 0; y < f.length; y++)
		zero_timeout(function (fo) {
			if (fo.method && fo.method.toLowerCase() === 'post') {
				var ac = fo.getAttribute('action');
			
				if (ac && ac.length) {
					if (!(/^https?:/i.test(ac)))
						ac = window.location.origin + (ac.charAt(0) !== '/' ? '/' : '') + ac;
			
					safari.self.tab.dispatchMessage('cannotAnonymize', ac);
				}
			}
		}, [f[y]]);
}

function prepareAnchor(anchor, i) {
	var type = !anchor.target;
	anchor = !type ? anchor.target : anchor;
	
	if (!type && anchor.nodeName && anchor.nodeName.toUpperCase() !== 'A') {
		if (anchor.querySelectorAll)
			prepareAnchors(null, anchor.querySelectorAll('a', anchor), []);
		
		return false;
	}

	if (anchor.nodeName && anchor.nodeName.toUpperCase() === 'A') {
		if_setting('simpleReferrer', true, function (anchor) {
			if ((!anchor.getAttribute('rel') || !anchor.getAttribute('rel').length)) anchor.setAttribute('rel', 'noreferrer');
		}, [anchor]);
		
		anchor.addEventListener('mousedown', function (e) {
			var k = (window.navigator.platform.match(/Win/)) ? e.ctrlKey : e.metaKey;
			
			safari.self.tab.dispatchMessage('anonymousNewTab', k ? 1 : 0);
			
			setTimeout(function () {
				safari.self.tab.dispatchMessage('anonymousNewTab', 0);
			}, 1000);
		}, true);
	}
}

function windowMessenger(event) {
	if (event.source === window && event.data === 'zero-timeout') {
		event.stopPropagation();
		if (zero.length) {
			var o = zero.shift();
			if (typeof o[0] === 'function')
				o[0].apply(window, o[1]);
		}
	}
}

safari.self.addEventListener('message', messageHandler, true);
window.addEventListener('hashchange', hashUpdate, true);
window.addEventListener('message', windowMessenger);

if (window === window.top)
	window.addEventListener('focus', ready, true);
	
document.addEventListener('DOMContentLoaded', ready, false);
document.addEventListener('DOMContentLoaded', prepareAnchors, false);
document.addEventListener('beforeload', allowedScript, true);
document.addEventListener('DOMNodeInserted', allowedScript, true);
document.addEventListener('DOMNodeInserted', prepareAnchor, true);
document.addEventListener('DOMNodeElementChanged', prepareAnchor, false);