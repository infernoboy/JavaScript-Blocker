/***************************************
 * @file js/predefined.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

JavaScriptBlocker.rules.whitelist = {
	'.*': [
		// Google Libraries API - A collection of JavaScript libraries hosted by Google.
		'^https?:\\/\\/ajax\\.googleapis\\.com\\/ajax\\/libs\\/.*\\.js(\\?.*)?$',
		'^https?:\\/\\/www\\.google\\.com\\/jsapi(\\?.*)?$',

		// jQuery - A JavaScript library used by many sites. Includes jQuery UI, an effects library to compliment jQuery.
		'^https?:\\/\\/.*\\/jquery(\\-ui)?(\\.min)?\\.js(\\?.*)?$',
		'^https?:\\/\\/.*\\/jquery(\\-ui)?\\-[1-9]\\.[0-9]+\\.[0-9]+(\\.min)?\\.js(\\?.*)?$',

		// Prototype - A JavaScript library used by some sites.
		'^https?:\\/\\/.*\\/prototype\\.js(\\?.*)?$',
		
		// Readability
		'^https?:\\/\\/www\\.readability\\.com\\/.*$'
	],
	'.amazon.com': [
		'^http:\\/\\/([^\\/]+\\.)?images\\-amazon\\.com\\/.*$'
	],
	'.reddit.com': [
		'^http:\\/\\/www\\.redditstatic\\.com\\/.*$'
	],
	'.paypal.com': [
		'^https:\\/\\/www\\.paypalobjects\\.com\\/.*$'
	],
	'.google.com': [
		'^https?:\\/\\/([^\\/]+\.)?gstatic\\.com\\/.*$'
	],
	'.youtube.com': [
		'^https?:\\/\\/([^\\/]+\.)?ytimg\\.com\\/.*$',
		'^https?:\\/\\/clients[0-9]+\\.google\\.com\\/.*$',
	],
	'.readability.com': [
		'^https?:\\/\\/([^\\/]+\\.)?cloudfront\\.net\\/.*$'
	]
};

JavaScriptBlocker.rules.blacklist = {
	'.*': [
		// Modifies the text you copy on a webpage.
		'^https?:\\/\\/(.*\\.)?tynt\\.com\\/.*$',
		
		// Adds search links to random words on websites that may popup a box over the content if hovered on.
		'^https?:\\/\\/(.*\\.)?kontera\\.com\\/.*$', '^https?:\\/\\/(.*\\.)?snap\\.com\\/.*$',
		
		// Used for tracking purposes.
		'^https?:\\/\\/(ssl|www)\\.google\\-analytics\\.com\\/(ga|urchin)\\.js$', '^https?:\\/\\/edge\\.quantserve\\.com\\/.*$'
	]
};