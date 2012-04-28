/***************************************
 * @file js/predefined.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

JB.rules.whitelist = {
	script: {
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
			'^https?:\\/\\/([^\\/]+\\.)?(ssl\\-)?images\\-amazon\\.com\\/.*$'
		],
		'.reddit.com': [
			'^https?:\\/\\/www\\.redditstatic\\.com\\/.*$'
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
		],
		'.icloud.com': [
			'^https?:\\/\\/([^\\/]+\\.)?gstatic\\.com\\/.*$',
			'^https?:\\/\\/([^\\/]+\\.)?google\\.com\\/.*$'
		]
	},
	frame: {
		'.facebook.com': [
			'^https?:\\/\\/(.*\\.)?facebook\\.com\\/.*$'
		]
	},
	embed: {
		'.*': [
			'^https?:\\/\\/images\\.apple\\.com\\/apple-events\\/includes\\/qtbutton\\.mov$'
		],
		'.youtube.com': [
			'^http:\\/\\/([^\\/]+\\.)?ytimg\\.com\\/.*$',
		]
	}
};

var wl = JB.rules.whitelist.script;

wl['.google.co.uk'] = wl['.google.com'];
wl['.google.de'] = wl['.google.com'];
wl['.amazon.de'] = wl['.amazon.com'];
wl['.amazon.co.uk'] = wl['.amazon.com'];

delete wl;
wl = undefined;

JB.rules.blacklist = {
	script: {
		'.*': [
			// Modifies the text you copy on a webpage.
			'^https?:\\/\\/(.*\\.)?tynt\\.com\\/.*$',
		
			// Adds search links to random words on websites that may popup a box over the content if hovered on.
			'^https?:\\/\\/(.*\\.)?kontera\\.com\\/.*$', '^https?:\\/\\/(.*\\.)?snap\\.com\\/.*$',
		
			// Used for tracking purposes.
			'^https?:\\/\\/(ssl|www)\\.google\\-analytics\\.com\\/(ga|urchin)\\.js$', '^https?:\\/\\/edge\\.quantserve\\.com\\/.*$'
		]
	},
	frame: {
		'.*': [
			'^https?:\\/\\/(.*\\.)?facebook\\.com\\/.*$',
			'^https?:\\/\\/(.*\\.)?twitter\\.com\\/.*$',
			'^https?:\\/\\/(.*\\.)?plusone\\.google\\.(com|ca|co\\.uk)\\/.*$',
			'^https?:\\/\\/ads\\.[^\.]+\..*\\/.*$'
		]
	}
};