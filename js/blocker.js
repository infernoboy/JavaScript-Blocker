/***************************************
 * @file js/blocker.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

function pageHost() {
	switch(window.location.protocol) {
		case 'http:':
		case 'https:':
		case 'file:':
			var base = window.location.origin + (bv >= 535185 ?
					window.location.pathname : escape(window.location.pathname)) + window.location.search;
			if (window.location.hash.length > 0) return base + window.location.hash;
			else if (window.location.href.substr(-1) === '#') return base + '#';
			else return base;
		break;
		
		default:
			return window.location.href; break;
	}
}

var bv = parseInt(window.navigator.appVersion.split('Safari/')[1].replace(/\./g, '')),
		jsblocker = {
			javascript_blocker_1: 1,
			allowed: {
				count: 0,
				urls: []
			},
			blocked: {
				count: 0,
				urls: []
			},
			unblocked: {
				count: 0,
				urls: []
			},
			href: pageHost()
		}, readyTimeout = false, lastAddedFrameData = false, jsonBlocker = false;

function allowedScript(event) {
	if (event.target.nodeName.toUpperCase() === 'SCRIPT' && event.target.src.length > 0 && event.type !== 'DOMNodeInserted') {
		var isAllowed = safari.self.tab.canLoad(event, [jsblocker.href, event.target.src, !(window == window.top)]);

		if (!isAllowed) {
			if (typeof event.target.src === 'string' && event.target.src.length > 0) {
				jsblocker.blocked.count++;
				jsblocker.blocked.urls.push(event.target.src);
	
				event.preventDefault();
			}
		} else {
			jsblocker.allowed.count++;
			jsblocker.allowed.urls.push(event.target.src);
		}
	} else if (event.target.nodeName.toUpperCase() === 'SCRIPT' && event.target.src.length === 0 && event.type === 'DOMNodeInserted') {
		jsblocker.unblocked.count++;
		jsblocker.unblocked.urls.push(event.target.innerHTML);
	}
	
	if (window !== window.top) {
		clearTimeout(readyTimeout);
		readyTimeout = setTimeout(ready, 200, event);
	}	
}

function ready(event) {
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
		safari.self.tab.dispatchMessage('addFrameData', [pageHost(), jsblocker]);
	}
		
	clearTimeout(readyTimeout);
		
	readyTimeout = setTimeout(function () {
		try {
			if (window === window.top)
				safari.self.tab.dispatchMessage('updatePopover', jsblocker);
		} catch(e) {
			if (!window._jsblocker_user_warned) {
				window._jsblocker_user_warned = true;
				console.error('JavaScript blocker broke! This is an issue with Safari itself. ' +
						'Reloading the page should resolve the problem.')
			}
		}
	}, (event.type === 'focus') ? 10 : 300);
}

function messageHandler(event) {
	switch (event.name) {
		case 'reload': window.location.reload(); break;
		case 'updatePopover': ready(event); break;
		case 'unloadPage': unloadHandler(event); break;
		case 'validateFrame':
			var f = document.getElementsByTagName('iframe'), a = [pageHost(), jsblocker];
			
			for (var y = 0; y < f.length; y++) {
				if (!('src' in f[y]) || f[y].src.length < 1) continue;
				else if (f[y].src === event.message) {
					a.push(f[y].src);
					break;
				}
			}
			
			if (a.length < 3) a.push(-1);
			
			safari.self.tab.dispatchMessage('addFrameData', a);
		break;
	}
}

function unloadHandler(event) {
	try {
		if (window == window.top)
			safari.self.tab.dispatchMessage('unloadPage', pageHost());
	} catch(e) { /* Exception occurs when closing a page sometimes. */ }
}

function hashUpdate(event) {
	var ohref = jsblocker.href.toString();
	
	jsblocker.href = pageHost();
	
	safari.self.tab.dispatchMessage('updateFrameData', [pageHost(), jsblocker, ohref])
	
	ready(event);
}

safari.self.addEventListener('message', messageHandler, true);
window.addEventListener('hashchange', hashUpdate, true);

if (window === window.top)
	window.addEventListener('focus', ready, true);

document.addEventListener('DOMContentLoaded', ready, false);
document.addEventListener('beforeload', allowedScript, true);
document.addEventListener('DOMNodeInserted', allowedScript, true);