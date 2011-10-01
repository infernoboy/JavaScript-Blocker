var jsblocker = {
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
	href: window.location.href
};

function allowedScript(event) {
	if(event.target.nodeName == 'SCRIPT' && event.target.src.length > 0) {
		var isAllowed = safari.self.tab.canLoad(event, [jsblocker.href, event.target.src, !(window == window.top)]);

		if(!isAllowed) {
			if(typeof event.target.src == 'string' && event.target.src.length > 0) {
				jsblocker.blocked.count++;
				jsblocker.blocked.urls.push(event.target.src);
	
				event.preventDefault();
			}
		} else {
			jsblocker.allowed.count++;
			jsblocker.allowed.urls.push(event.target.src);
		}

		ready(event);
	} else if(event.target.nodeName == 'SCRIPT') {
		jsblocker.unblocked.count++;
		jsblocker.unblocked.urls.push(event.target.outerHTML);
		ready(event);
	}
}

function loaded(event) {
	ready(event);
	
	var frames = [], x = document.getElementsByTagName('iframe');

	for(var i = 0, b = x.length; i < b; i++)
		frames.push('Inline Frame Source: ' + x[i].src.toString());

	safari.self.tab.dispatchMessage('updateFrameData', [frames, jsblocker]);
}

function ready(event) {	
	try {
		safari.self.tab.dispatchMessage('updatePopover', jsblocker);
	} catch(e) {
		if(!window._jsblocker_user_warned) {
			window._jsblocker_user_warned = true;
			console.error('JavaScript blocker broke! This may be because of an issue with Safari itself. Reloading the page should resolve the issue.')
		}
	}
}

function messageHandler(event) {
	if(event.name == 'reload') window.location.reload();
	else if(event.name == 'updatePopover') ready(event);
}

function unloadHandler(event) {
	safari.self.tab.dispatchMessage('unloadPage', window.location.href);
}

function hashUpdate(event) {
	jsblocker.href = window.location.href;
	ready(event);
}

safari.self.addEventListener('message', messageHandler, true);
window.addEventListener('hashchange', hashUpdate, true);
window.addEventListener('focus', ready, true);
window.addEventListener('beforeunload', unloadHandler, true);
document.addEventListener('beforeload', allowedScript, true);
document.addEventListener('DOMNodeInserted', allowedScript, true);
document.addEventListener('DOMContentLoaded', loaded, true);