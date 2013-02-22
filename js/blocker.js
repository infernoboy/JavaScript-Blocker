/***************************************
 * @file js/blocker.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

"use strict";

var beforeLoad = {'url':'','returnValue':true,'timeStamp':1334608269228,'eventPhase':0,'target':null,'defaultPrevented':false,'srcElement':null,'type':'beforeload','cancelable':false,'currentTarget':null,'bubbles':false,'cancelBubble':false},
		random = +new Date(),
		blank = window.location.href === 'about:blank',
		allowedToLoad = 'al' + Math.random() * 1000000000000000000,
		parentURL = (window !== window.top && blank) ? (ResourceCanLoad(beforeLoad, 'parentURL') + '&about:blank:' + random) : false,
		disabled = ResourceCanLoad(beforeLoad, ['disabled']);

function pageHost(not_real) {
	if (parentURL) return parentURL;

	switch(window.location.protocol) {
		case 'http:':
		case 'https:':
		case 'file:':
			var base = window.location.origin + (bv[0] >= 535 ?
					window.location.pathname : encodeURI(window.location.pathname)) + window.location.search;
			if (window.location.hash.length > 0) return base + window.location.hash;
			else if (window.location.href.substr(-1) === '#') return base + '#';
			else if (/\?$/.test(window.location.href)) return base + '?';
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

function setCSSs(e, p, not_important) {
	for (var prop in p)
		e.style.setProperty(prop, p[prop], not_important ? '' : 'important');
}

function fitFont(e, f) {
	var fs = 22, maxH = e.offsetHeight, maxW = e.offsetWidth - 10, text = e.querySelector('.jsblocker-node'),
			text2 = e.querySelector('.jsblocker-node-two'), wr = e.querySelector('.jsblocker-node-wrap'), tH, tW;
	
	text.style.setProperty('opacity', '0.5', 'important')
	text2.style.setProperty('opacity', '0.5', 'important')
	
	do {
		text.style.setProperty('font-size', fs + 'pt', 'important');
		text2.style.setProperty('font-size', fs + 'pt', 'important');
		wr.style.setProperty('margin-top', '-' + ((text.offsetHeight / 2) - 3) + 'px', 'important');
		text2.style.setProperty('margin-left', '-' + Math.round(text.offsetWidth / 2) + 'px', 'important');
		tH = text.offsetHeight;
		tW = text.offsetWidth;
		fs -= 1;
	} while ((tH + 3 > maxH || tW + 3 > maxW) && fs > 4);

	setCSSs(text, {
		position: 'absolute',
		top: 'auto',
		left: '50%',
		'margin-left': '-' + Math.round(tW / 2) + 'px'
	});
}

function createPlaceholder(e, host, url) {
	if (!e.parentNode || !url) return false;
		
	var pl, st, pl, i, p, w, pw, pB, p2, t, o, proto = activeProtocol(url), ex = /^https?/.test(proto) ? 3 : 1,
			pr = ['top', 'right', 'bottom', 'left', 'z-index', 'clear', 'float', 'vertical-align', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', '-webkit-margin-before-collapse', '-webkit-margin-after-collapse'],
			pa = url.substr(proto.length + host.length + ex).replace(/</g, '&lt;').replace(/\//g, '/<wbr />').replace(/\?/g, '?<wbr />').replace(/&(?!lt;)/g, '&<wbr />').replace(/=/g, '=<wbr />'),
			proto = proto + (ex === 3 ? '://' : ':'),
			place =  [
				'<div class="jsblocker-node-wrap">',
					'<p class="jsblocker-node">', e.nodeName.toLowerCase(), '</p>',
					'<p class="jsblocker-node-two">', e.nodeName.toLowerCase(), '</p>',
				'</div>',
				'<p class="jsblocker-url">',
					'<span class="jsblocker-protocol">', proto, '</span>',
					'<span class="jsblocker-host">', host.replace(/\./g, '.<wbr />'), '<wbr /></span>',
					'<span class="jsblocker-path">', pa, '</span>',
				'</p>'].join(''),
			pl = document.createElement('div');	

	pl.innerHTML = place;

	var pw = pl.querySelector('.jsblocker-node-wrap'),
			p = pl.querySelector('.jsblocker-node'),
			pB = pl.querySelector('.jsblocker-node-two'),
			p2 = pl.querySelector('.jsblocker-url');
	
	p2.title = e.nodeName.toLowerCase() + ' - ' + url;
	p.title = p2.title;
	pB.title = p.title;

	var	w = e.offsetWidth <= 12 ? e.offsetWidth : e.offsetWidth - 12,
			h = e.offsetHeight <= 12 ? e.offsetHeight : e.offsetHeight - 12;
	
	pl.className = 'jsblocker-placeholder';
	pl.id = 'placeholder-' + +new Date();

	setCSSs(pl, {
		display: 'inline-block',
		width: w + 'px',
		height: h + 'px',
		padding: '6px'
	});
	
	if ((e.offsetWidth - 12) <= 0)
		setCSSs(pl, { 'padding-left': '0px', 'padding-right': '0px' });
	
	if ((e.offsetHeight - 12) <= 0)
		setCSSs(pl, { 'padding-top': '0px', 'padding-bottom': '0px' });
	
	st = window.getComputedStyle(e, null);
		
	if(st.getPropertyValue('position') === 'static')
		pl.style.setProperty('position', 'relative', 'important');
	else
		pr.push('position');
	
	setCSS(st, pr, pl);
		
	e.parentNode.replaceChild(pl, e);
	
	fitFont(pl);

	pl.addEventListener('click', function (ev) {
		if (!ev.isTrigger) {
			ev.preventDefault();
			ev.stopImmediatePropagation();
			e[allowedToLoad] = true;
			pl.parentNode.replaceChild(e, pl);
		}
	});
}

var bv = window.navigator.appVersion.split('Safari/')[1].split('.'),
		alwaysAllow = [],
		kinds = {
			special: ['special']
		},
		jsblocker = {
			allowed: {},
			blocked: {},
			unblocked: {},
			href: pageHost()
		}, readyTimeout = [null, null], lastAddedFrameData = false, jsonBlocker = false, zero = [], settings = {},
		ph = function (kind, allowed, host, url) {
			if (!allowed)
				if_setting('showPlaceholder' + kind, true, function (t) {
					createPlaceholder(t, host, url);
				}, function (t) {
					if (t.parentNode) t.parentNode.removeChild(t);
				}, [this]);
		};

kinds.SCRIPT = ['script', ph];
kinds.FRAME = ['frame', ph];
kinds.IFRAME = ['frame', ph];
kinds.EMBED = ['embed', ph];
kinds.OBJECT = ['embed', ph];
kinds.VIDEO = ['video', ph];
kinds.IMG = ['image', ph];

for (var kind in kinds) {
	jsblocker.allowed[kinds[kind][0]] = { all: [], unique: [] }
	jsblocker.blocked[kinds[kind][0]] = { all: [], unique: [] }
	jsblocker.unblocked[kinds[kind][0]] = { all: [], unique: [] }
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
			settings[s[i]] = ResourceCanLoad(beforeLoad, ['setting', s[i]]);
	
		if (settings[s[i]] === value) {
			if (typeof cb === 'function') cb.apply(window, args);
			break;
		} else if (i === (s.length -1) && typeof cb2 === 'function')
			cb2.apply(window, args);
	}
	
	return settings[s[--i]];
}

function activeHost(url, real) {
	var r = /^(https?|file|safari\-extension):\/\/([^\/]+)\//;

	if (url === 'about:blank') return '';
	if (/^javascript:/.test(url)) return real ? 'javascript': '';
	if (/^data:/.test(url)) return real ? 'data' : '';
	if (url.match(r) && url.match(r).length > 2) return url.match(r)[2];
	return 'ERROR';
}

function activeProtocol(url) {
	return url.substr(0, url.indexOf(':'));
}

function getAbsoluteURL(url) {
	if (!url) return '';
	
	var a = document.createElement('a');
	a.href = url;
	return a.href;
}

function canLoad(event) {
	var el = event.target ? event.target : event,
			node = el.nodeName.toUpperCase();

	if (!(node in kinds)) return 1;

	var source = getAbsoluteURL(event.url), pathname, host, at, arr, use_source, did_something = 0, kind = kinds[node][0];

	if (!el[allowedToLoad]) {
		if (~alwaysAllow.indexOf(kind)) return 1;
		else if (event.target) {									
			if (source && source.length)
				use_source = source, host = activeHost(source, 1);
			else if (node !== 'OBJECT')
				use_source = 'about:blank', host = 'blank';
			else
				return 1;

			var allo = ResourceCanLoad(event, [kind, jsblocker.href, use_source, !(window == window.top)]),
					isAllowed = allo[0],
					mo = isAllowed || !event.preventDefault ? 'allowed' : 'blocked';

			if (allo[1] === -84) {
				alwaysAllow.push(kind);
				return 1;
			}

			did_something = 1;

			if (!isAllowed && event.preventDefault)	event.preventDefault();
			
			jsblocker[mo][kind].all.push([use_source, allo[1], !!event.unblockable]);
		
			if (!~jsblocker[mo][kind].unique.indexOf(host)) jsblocker[mo][kind].unique.push(host);

			if (kinds[node][1] && event.preventDefault) kinds[node][1].call(event.target, kind, isAllowed, host, use_source);
		} else if ((!source || source.length === 0) && !event.target) {
			if (el.innerHTML.length && !el.getAttribute('data-jsblocker_added')) {
				did_something = 1;

				el.setAttribute('data-jsblocker_added', 1);

				jsblocker.unblocked[kind].all.push(el.innerHTML);
			
				if (kinds[node][1]) kinds[node][1].call(el, kind, 1);
			}
		}
	}

	if (did_something)
		ready(event);
}

function ready(event) {
	if (disabled) return false;

	if (window === window.top)
		GlobalPage.message('updateReady');
		
	var t = event.type === 'DOMContentLoaded' ? 1 : 0;
	
	clearTimeout(readyTimeout[t]);
		
	readyTimeout[t] = setTimeout(function (event) {
		if (event.type === 'DOMContentLoaded') {
			var script_tags = document.getElementsByTagName('script'), i, b = script_tags.length;
			for (i = 0; i < b; i++) {
				if (!script_tags[i].getAttribute('data-jsblocker_added')) {
					if (!script_tags[i].getAttribute('src') || (script_tags[i].src && script_tags[i].src.length > 0 && /^data/.test(script_tags[i].src))) {
						script_tags[i].setAttribute('data-jsblocker_added', 1);
						jsblocker.unblocked.script.all.push(script_tags[i].innerHTML);

						kinds.SCRIPT[1].call(script_tags[i], 'script', 1);
					}
				}
			}
		}

		if (window !== window.top && lastAddedFrameData !== (jsonBlocker = JSON.stringify(jsblocker))) {
			lastAddedFrameData = jsonBlocker;
			GlobalPage.message('addFrameData', [jsblocker.href, jsblocker]);
		}
			
		try {
			if (window === window.top)
				GlobalPage.message('setActiveTab', jsblocker),
				GlobalPage.message('updatePopover', jsblocker);
		} catch(e) {
			if (!window._jsblocker_user_warned) {
				window._jsblocker_user_warned = true;
				console.error('JavaScript blocker broke! This is an issue with Safari itself. ' +
						'Reloading the page should fix things.')
			}
		}
	}, (event.name && event.name === 'updatePopoverNow') ? 100 : 300, event);
}

function messageHandler(event) {
	if (event.message)
		try {
			event.message = JSON.parse(event.message);
		} catch (e) {}

	switch (event.name) {
		case 'reload': window.location.reload(); break;
		case 'updatePopover': ready(event); break;
		case 'updatePopoverNow': ready(event); break;
		case 'validateFrame':
			var validateFrame = function (f) {
				for (var y = 0; y < f.length; y++) {
					if (f[y].src === event.message) {
						a.push(f[y].src);
						break;
					}
				}
			};

			var a = [pageHost(), jsblocker], sr;
			
			validateFrame(document.getElementsByTagName('iframe'));
			
			if (a.length < 3) {
				validateFrame(document.getElementsByTagName('frame'));
				
				if (a.length < 3) a.push(-1);
			}
				
			GlobalPage.message('addFrameData', a);
		break;

		case 'setting':
			settings[event.message[0]] = event.message[1];
		break;

		case 'openSettings':
			if (document.getElementById('jsblocker-settings') || window !== window.top) break;

			var fr = document.createElement('iframe');
			fr.id = 'jsblocker-settings';
			fr.src = event.message;

			setCSSs(fr, {
				visibility: 'hidden',
				width: '100%',
				height: '100%',
				position: 'fixed',
				top: '0px',
				'z-index': +new Date(),
				border: 'none'
			});

			document.documentElement.appendChild(fr);

			fr.onload = function () {
				fr.style.setProperty('visibility', 'visible', 'important');
			};
		break;

		case 'closeSettings':
			var fr = document.getElementById('jsblocker-settings');

			if (fr) fr.parentNode.removeChild(fr);
		break;

		case 'notification':
			if (window === window.top) {
				if (event.message[1] === 'JavaScript Blocker Update') {
					if (window.showedUpdateNotification) break;
					else window.showedUpdateNotification = 1;
				}

				special_actions.alert_dialogs(1, [1])(event.message[0], event.message[1], 1);
			}
		break;

		case 'loadElementsOnce':
			var pls = document.querySelectorAll('.jsblocker-placeholder');
	
			for (var i = 0; pls[i]; i++) {
				var ev = document.createEvent('MouseEvents');
				
				ev.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

				pls[i].dispatchEvent(ev);
			}
		break;
	}
}

function hashUpdate(event) {
	var ohref = jsblocker.href.toString();
	
	jsblocker.href = pageHost();
		
	GlobalPage.message('updateFrameData', [jsblocker.href, jsblocker, ohref]);
	
	ready(event);
}

function prepareAnchors(event, anchors, forms) {
	var a = anchors || document.getElementsByTagName('a'),
			f = forms || document.getElementsByTagName('form');

	for (var x = 0; x < a.length; x++)
		if (a[x].getAttribute('href'))
			prepareAnchor(a[x], x);
	for (var y = 0; y < f.length; y++)
		if (f[y].getAttribute('method') && f[y].getAttribute('method').toLowerCase() === 'post')
			GlobalPage.message('cannotAnonymize', getAbsoluteURL(f[y].getAttribute('action')));
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
			if (anchor.getAttribute('href') && anchor.getAttribute('href').length && anchor.getAttribute('href').charAt(0) !== '#')
				if ((!anchor.getAttribute('rel') || !anchor.getAttribute('rel').length))
					anchor.setAttribute('rel', 'noreferrer');
		}, null, [anchor]);

		if (window !== window.top)
			if_setting('confirmShortURL', true, function (anchor) {
				anchor.addEventListener('click', function (ev) {
					var target = this.getAttribute('target');

					if (target !== '_blank' && target !== '_top')
						if (!ResourceCanLoad(beforeLoad, ['confirmShortURL', this.href, jsblocker.href])) {
							ev.preventDefault();
							ev.stopPropagation();
						}
				});
			}, null, [anchor]);
		
		if (anchor.getAttribute('href') && anchor.getAttribute('href').charAt(0) === '#')
			GlobalPage.message('cannotAnonymize', getAbsoluteURL(anchor.getAttribute('href')));
		else	
			anchor.addEventListener('mousedown', function (e) {
				var k = (window.navigator.platform.match(/Win/)) ? e.ctrlKey : e.metaKey;
			
				GlobalPage.message('anonymousNewTab', k ? 1 : 0);
			
				setTimeout(function () {
					GlobalPage.message('anonymousNewTab', 0);
				}, 1000);
			}, true);
	}
}

function prepareFrames() {
	var iframes = document.getElementsByTagName('iframe'),
			frames = document.getElementsByTagName('frame');

	for (var i = 0; iframes[i]; i++)
		prepareFrame(iframes[i]);
	for (var i = 0; frames[i]; i++)
		prepareFrame(frames[i]);
}

function prepareFrame(frame) {
	var fr = frame.target ? frame.target : frame;

	if (!~['FRAME', 'IFRAME'].indexOf(fr.nodeName.toUpperCase())) return false;

	if (!fr.getAttribute('id')) fr.setAttribute('id', 'frame-' + +new Date());

	fr.setAttribute('data-jsblocker_url', fr.src);

	fr.addEventListener('load', function () {
		this.contentWindow.postMessage('mayIPleaseKnowYourURL:' + this.id, '*');
	}, false);
}

function windowMessenger(event) {
	var mayI = 'mayIPleaseKnowYourURL:', sure = 'theURLFor:';

	if (typeof event.data !== 'string') return;

	if (event.data === 'history-state-change')
		jsblocker.href = pageHost();
	else if (event.data === 'zero-timeout') {
		event.stopPropagation();
		if (zero.length) {
			var o = zero.shift();
			if (typeof o[0] === 'function')
				o[0].apply(window, o[1]);
		}
	} else if (event.data.indexOf(mayI) === 0) {
		var id = event.data.substr(mayI.length);
		window.top.postMessage(sure + id + '#' + encodeURI(jsblocker.href), '*');
	} else if (event.data.indexOf(sure) === 0) {
		var off = event.data.substr(sure.length),
				id = off.substr(0, off.indexOf('#')),
				url = decodeURI(off.substr(id.length + 1)),
				fr = document.getElementById(id);

		if (!fr) return;

		var old = fr.getAttribute('data-jsblocker_url');

		fr[allowedToLoad] = 0;

		if (old !== url) {
			var t = beforeLoad;
			t.target = fr;
			t.url = url;
			t.unblockable = 1;
			canLoad(t);
			fr.setAttribute('data-jsblocker_url', url);
		}
	}
}

function contextmenu(event) {
	Events.setContextMenuEventUserInfo(event, document.querySelectorAll('.jsblocker-placeholder').length);
}

Events.addTabListener('message', messageHandler, true);

if (!disabled) {
	window.addEventListener('hashchange', hashUpdate, true);
	window.addEventListener('message', windowMessenger, true);

	if (parseInt(bv[0], 10) >= 536) {
		var observer = new WebKitMutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.type === 'childList') {
					var node, i;

					for (i = 0; i < mutation.addedNodes.length; i++) {
						node = mutation.addedNodes[i];

						if (node.nodeName === 'A')
							prepareAnchor(node);
						else if (node.nodeName in kinds) {
							if (node.nodeName === 'IFRAME' || node.nodeName === 'FRAME')
								prepareFrame(node);

							canLoad(node);
						}
					}
				}
			});
		});

		observer.observe(document, { childList: true, subtree: true });
	} else {
		document.addEventListener('DOMNodeInserted', canLoad, true);
		document.addEventListener('DOMNodeInserted', prepareFrame, true);
		document.addEventListener('DOMNodeInserted', prepareAnchor, true);
	}

	document.addEventListener('contextmenu', contextmenu, false);
	document.addEventListener('DOMContentLoaded', ready, true);
	document.addEventListener('DOMContentLoaded', prepareAnchors, true);
	document.addEventListener('DOMContentLoaded', prepareFrames, true);
	document.addEventListener('beforeload', canLoad, true);
}

window.postMessage = function (one, two, three) {
	if (one !== 'zero-timeout')
		GlobalPage.message('postMessage', [one,two,three]);
};
