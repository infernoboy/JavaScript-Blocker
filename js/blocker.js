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

var frames = [], frameDataAdded = false;

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
	} else if(event.target.nodeName == 'IFRAME') ready(event);
}

function ready(event) {
	if(window !== window.top && !frameDataAdded) {
		frameDataAdded = true;
		safari.self.tab.dispatchMessage('addFrameData', [window.location.href, jsblocker])
	}

	try {
		if(window == window.top)
			safari.self.tab.dispatchMessage('updatePopover', jsblocker);
	} catch(e) {
		if(!window._jsblocker_user_warned) {
			window._jsblocker_user_warned = true;
			console.error('JavaScript blocker broke! This may be because of an issue with Safari itself. Reloading the page should resolve the issue.')
		}
	}
}

function updateFrames(event) {
	if(frames.indexOf(event.message[0]) > -1) return false;
	
	frames.push(event.message[0]);
			
	jsblocker.frames[event.message[1].href] = event.message[1];
}

function messageHandler(event) {
	if(event.name == 'reload') window.location.reload();
	else if(event.name == 'updatePopover') ready(event);
	else if(event.name == 'updateFrames') updateFrames(event);
}

function unloadHandler(event) {
	safari.self.tab.dispatchMessage('unloadPage', window.location.href);
}

function hashUpdate(event) {
	var ohref = jsblocker.href.toString();
	
	jsblocker.href = window.location.href;
	
	safari.self.tab.dispatchMessage('addFrameData', [window.location.href, jsblocker, ohref])
	
	ready(event);
}

safari.self.addEventListener('message', messageHandler, true);
window.addEventListener('hashchange', hashUpdate, true);
window.addEventListener('focus', ready, true);
window.addEventListener('beforeunload', unloadHandler, true);
document.addEventListener('beforeload', allowedScript, true);
document.addEventListener('DOMNodeInserted', allowedScript, true);
document.addEventListener('DOMContentLoaded', ready, true);