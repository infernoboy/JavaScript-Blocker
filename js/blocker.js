/***************************************
 * @file js/blocker.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

var beforeLoad = {'url':'','returnValue':true,'timeStamp':1334608269228,'eventPhase':0,'target':null,'defaultPrevented':false,'srcElement':null,'type':'beforeload','cancelable':false,'currentTarget':null,'bubbles':false,'cancelBubble':false},
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
			if (window.location.hash.length > 0) return base + window.location.hash;
			else if (window.location.href.substr(-1) === '#') return base + '#';
			else return base;
		break;
		
		default:
			return window.location.href;
		break;
	}
}

function setCSS(st, pr, pl) {
	for (var i = 0; i < pr.length; i++)
		pl.style.setProperty(pr[i], st.getPropertyValue(pr[i]), 'important');
}

function fitFont(e, f) {
	var fs = 19, maxH = e.offsetHeight, maxW = e.offsetWidth - 10, text = e.querySelector(f),
			wr = e.querySelector('.jsblocker-node-wrap'), tH, tW;
	
	text.style.setProperty('opacity', '0.4', 'important')
	
	do {
		if (fs < 11) text.style.setProperty('opacity', '0.9', 'important');
		text.style.setProperty('font-size', fs + 'pt', 'important');
		wr.style.setProperty('margin-top', '-' + (text.offsetHeight / 2) + 'px', 'important');
		tH = text.offsetHeight;
		tW = text.offsetWidth;
		fs -= 1;
	} while ((tH > maxH || tW > maxW) && fs > 8);
}

function createPlaceholder(e, host, url) {
	if (!e.parentNode || !url) return false;
		
	if (host === 'blank') {
		host = 'about:blank';
		url = 'about:blank';
	}

	var pl, st, pl, i, p, w, t, o, proto = activeProtocol(host),
			pa = url.substr(host.length).replace(/\//g, '/<wbr />').replace(/\?/g, '?<wbr />').replace(/&/g, '&<wbr />').replace(/=/g, '=<wbr />'),
			pr = ['top', 'right', 'bottom', 'left', 'z-index', 'clear', 'float', 'vertical-align', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', '-webkit-margin-before-collapse', '-webkit-margin-after-collapse'];

	pl = document.createElement('div');	
	pw = document.createElement('div');	
	p = document.createElement('p');
	pB = document.createElement('p');
	p2 = document.createElement('p');
	
	p.className = 'jsblocker-node';
	pw.className = 'jsblocker-node-wrap';
	pB.className = 'jsblocker-node-two';
	p2.className = 'jsblocker-url';
	p2.title = url;
	p.title = p2.title;
	pB.title = p.title;
	
	pa = (host === 'blank' ? '' : (pa.charAt(0) === '/' ? p.substr(1) : pa));
	
	host = host.substr(proto.length);
	
	if (host.substr(0, 3) === '://') {
		proto = proto + host.substr(0, 3);
		host = host.substr(3);
	}
		
	p.innerHTML = e.nodeName.toLowerCase();
	pB.innerHTML = p.innerHTML;
	p2.innerHTML = '<span class="jsblocker-protocol">' + proto + '</span>' +
			'<span class="jsblocker-host">' + host.replace(/\./g, '.<wbr />') + '<wbr /></span>' + 
			'<span class="jsblocker-path">' + pa + '</span>';
	
	pw.appendChild(p);
	pw.appendChild(pB);
	pl.appendChild(pw);
	pl.appendChild(p2);
	
	var	w = e.offsetWidth <= 12 ? e.offsetWidth : e.offsetWidth - 12,
			h = e.offsetHeight <= 12 ? e.offsetHeight : e.offsetHeight - 12;
	
	pl.className = 'jsblocker-placeholder';
	pl.style.setProperty('display', 'inline-block', 'important');
	pl.style.setProperty('width', w + 'px', 'important');
	pl.style.setProperty('height', h + 'px', 'important');
	pl.style.setProperty('padding', '6px', 'important');
	
	if ((e.offsetWidth - 12) <= 0) {
		pl.style.setProperty('padding-left', '0px', 'important');
		pl.style.setProperty('padding-right', '0px', 'important');
	}
	
	if ((e.offsetHeight - 12) <= 0) {
		pl.style.setProperty('padding-top', '0px', 'important');
		pl.style.setProperty('padding-bottom', '0px', 'important');
	}
	
	st = window.getComputedStyle(e, null);
		
	if(st.getPropertyValue('position') === 'static')
		pl.style.setProperty('position', 'relative', 'important');
	else
		pr.push('position');
	
	setCSS(st, pr, pl);
		
	e.parentNode.replaceChild(pl, e);
	
	fitFont(pl, '.jsblocker-node');
	fitFont(pl, '.jsblocker-node-two');

	pl.addEventListener('click', function (ev) {
		ev.preventDefault();
		ev.stopImmediatePropagation();
		e.allowedToLoad = true;
		pl.parentNode.replaceChild(e, pl);
	});
}

var bv = window.navigator.appVersion.split('Safari/')[1].split('.'),
		kinds = {
			script: [{ SCRIPT: 'src' }],
			frame: [{ FRAME: 'src', IFRAME: 'src' }, function (allowed, host, url) {
				var t = this;
				if (!allowed)
					if_setting('showPlaceholderframe', true, function () {
						createPlaceholder(t, host, url);
					}, function () {
						t.style.setProperty('display', 'none', 'important');
					});
			}],
			embed: [{ EMBED: 'src', OBJECT: 'data', VIDEO: 'src' }, function (allowed, host, url) {
				var t = this;
				if (!allowed)
					if_setting('showPlaceholderembed', true, function () {
						createPlaceholder(t, host, url);
					}, function () {
						t.style.setProperty('display', 'none', 'important');
					});
			}],
			image: [{ IMG: 'src' }, function (allowed, host, url) {
				var t = this;
				if (!allowed)
					if_setting('showPlaceholderimage', true, function () {
						createPlaceholder(t, host, url);
					}, function () {
						t.style.setProperty('display', 'none', 'important');
					});
			}],
		},
		jsblocker = {
			allowed: {
				count: 0,
				items: {}
			},
			blocked: {
				count: 0,
				items: {}
			},
			unblocked: {
				count: 0,
				items: {}
			},
			href: pageHost()
		}, readyTimeout = [null, null], lastAddedFrameData = false, jsonBlocker = false, zero = [], settings = {};
		
for (var kind in kinds) {
	jsblocker.allowed.items[kind] = { all: [], unique: [] }
	jsblocker.blocked.items[kind] = { all: [], unique: [] }
	jsblocker.unblocked.items[kind] = { all: [], unique: [] }
}

if (window !== window.top && blank)
	jsblocker.display = 'about:blank (' + random + ')';

function zero_timeout(fn, args) {
	zero.push([fn, args]);
	window.postMessage('zero-timeout', '*');
}
	
function if_setting(setting, value, cb, cb2, args) {
	var s = setting.split('|');
		
	for (var i = 0; i < s.length; i++) {
		if (!(s[i] in settings))
			settings[s[i]] = safari.self.tab.canLoad(beforeLoad, ['setting', s[i]]);
	
		if (settings[s[i]] === value) {
			cb.apply(window, args);
			break;
		} else if (i === (s.length -1) && typeof cb2 === 'function')
			cb2.apply(window, args);
	}
}

function activeHost(url) {
	var r = /^(https?|file|safari\-extension):\/\/([^\/]+)\//;

	if (url === 'about:blank') return 'blank';
	if (/^javascript:/.test(url)) return 'JavaScript Protocol';
	if (/^data:/.test(url)) return 'Data URI';
	if (url.match(r) && url.match(r).length > 2) return url.match(r)[1] + '://' + url.match(r)[2] + '/';
	return 'ERROR';
}

function activeProtocol(url) {
	return url.substr(0, url.indexOf(':'));
}

function canLoad(event) {
	var node = event.target.nodeName.toUpperCase(), source, pathname, host, at, arr;
	
	if (event.target.allowedToLoad) return true;
	
	for (var kind in kinds) {
		if ((node in kinds[kind][0]) && event.type !== 'DOMNodeInserted') {
			at = kinds[kind][0][node];
			source = event.target.getAttribute(at);
						
			if (source && source.length && !event.target.getAttribute('data-jsblocker_load'))
				var use_source = event.target[at], host = activeHost(event.target[at]);
			else if (node !== 'OBJECT')
				var use_source = 'about:blank', host = 'blank';
			else
				continue;
				
			var isAllowed = safari.self.tab.canLoad(event, [kind, jsblocker.href, use_source, !(window == window.top)]),
					mo = isAllowed ? 'allowed' : 'blocked';
			
			if (!isAllowed) event.preventDefault();
			
			jsblocker[mo].count++;
			jsblocker[mo].items[kind].all.push(use_source);
		
			if (!~jsblocker[mo].items[kind].unique.indexOf(host)) jsblocker[mo].items[kind].unique.push(host);
			if (kinds[kind][1]) kinds[kind][1].call(event.target, isAllowed, host, use_source);
		} else if ((node in kinds[kind][0]) && (!source || source.length === 0) && event.type === 'DOMNodeInserted') {
			jsblocker.unblocked.count++;
			jsblocker.unblocked.items[kind].all.push(event.target.innerHTML);
			
			if (kinds[kind][1]) kinds[kind][1].call(event.target, isAllowed);
		}
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
					jsblocker.unblocked.items.script.all.push(script_tags[i].innerHTML);
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
		}, null, [anchor]);
		
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
document.addEventListener('beforeload', canLoad, true);
document.addEventListener('DOMNodeInserted', canLoad, true);
document.addEventListener('DOMNodeInserted', prepareAnchor, true);
document.addEventListener('DOMNodeElementChanged', prepareAnchor, false);