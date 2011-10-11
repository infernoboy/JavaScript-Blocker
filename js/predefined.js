JavaScriptBlocker.rules.whitelist = {
	'Google Libraries API - A collection of JavaScript libraries hosted by Google.':
		['^https?:\\/\\/ajax\.googleapis\\.com\\/ajax\\/libs\\/.*\\.js(\\?.*)?$'],
	'jQuery - A JavaScript library used by many sites. Includes jQuery UI, an effects library to compliment jQuery.' :
		[
			'^https?:\\/\\/.*\\/jquery(\\-ui)?(\\.min)?\\.js(\\?.*)?$',
			'^https?:\\/\\/.*\\/jquery(\\-ui)?\\-[1-9]\\.[0-9]+\\.[0-9]+(\\.min)?\\.js(\\?.*)?$'
		],
	'Prototype - A JavaScript library used by some sites.':
		['^https?:\\/\\/.*\\/prototype\\.js(\\?.*)?$']
};

JavaScriptBlocker.rules.blacklist = {
	'Modifies the text you copy on a webpage.':
		['^https?:\\/\\/(.*\\.)?tynt\\.com\\/.*$'],
	'Adds search links to random words on websites that may popup a box over the content if hovered on.':
		['^https?:\\/\\/(.*\\.)?kontera\\.com\\/.*$', '^https?:\\/\\/(.*\\.)?snap\\.com\\/.*$'],
	'Used for tracking purposes.':
		['^https?:\\/\\/(ssl|www)\\.google\\-analytics\\.com\\/ga\\.js$']
};