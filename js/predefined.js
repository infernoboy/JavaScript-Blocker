/***************************************
 * @file js/predefined.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

/* ====================WHITELIST===================== */

var wld = {
	script: {
		'.*': [
			'www\\.readability\\.com',
			'seal\\.verisign\\.com',
			'api\\.solvemedia\\.com',
			's1\\.wp\\.com'
		],
		'.amazon.com': ['(ssl\\-)?images\\-amazon\\.com'],
		'.reddit.com': ['www\\.redditstatic\\.com'],
		'.paypal.com': ['www\\.paypalobjects\\.com'],
		'.google.com': ['gstatic\\.com'],
		'.youtube.com': ['ytimg\\.com', 'clients[0-9]+\\.google\\.com'],
		'.readability.com': ['cloudfront\\.net'],
		'.icloud.com': ['gstatic\\.com'],
		'.monster.com': ['monster\\.com'],
		'.ensighten.com': ['ensighten\\.com'],
		'.gorillanation.com': ['gorillanation\\.com'],
		'.digg.com': ['digg\\.com']
	},
	frame: {
		'.facebook.com': ['facebook\\.com'],
		'.stumbleupon.com': ['.*(All Frames)?']
	},
	embed: {
		'.youtube.com': ['ytimg\\.com']
	},
	image: {
		'.google.com': ['gstatic\\.com']
	},
	ajax_get: {
		'.digg.com': ['digg\\.com']
	}
};

$.extend(true, JB.rules.whitelist, {
	script: {
		'.*': {
			'^(Google hosted JavaScript frameworks)?https?:\\/\\/ajax\\.googleapis\\.com\\/ajax\\/libs\\/.*\\.js((\\?|#)+.*)?$': [5,false],
			'^(Google hosted JavaScript frameworks)?https?:\\/\\/www\\.google\\.com\\/jsapi((\\?|#)+.*)?$': [5,false],
			'^(Prototype, the JavaScript framework)?.*\\/prototype\\.js((\\?|#)+.*)?$': [5,false],
			'^(jQuery, the JavaScript framework)?.*\\/jquery(\\-ui)?\\-[1-9]\\.[0-9]+\\.[0-9]+(\\.min)?\\.js((\\?|#)+.*)?$': [5,false],
			'^(jQuery, the JavaScript framework)?.*\\/jquery\\.[^.\\/]+\\.js((\\?|#)+.*)?$': [5,false],
			'^(jQuery, the JavaScript framework)?.*\\/jquery\\.js((\\?|#)+.*)?$': [5,false],
			'^(jQuery UI, the JavaScript framework to make things pretty)?.*\\/jquery(\\-ui|\\.ui)(\\.[^.\\/]+)?\\.js$': [5,false],
			'^(reCAPTCHA)?https?:\\/\\/www\\.google\\.com\\/recaptcha\\/api\\/.*$': [5,false]
		},
		'.docs.google.com': {
			'^https?:\/\/docs\.google\.com\/static\/.*$': [5,false]
		}
	},
	embed: {
		'.*': {
			'https?:\\/\\/images\\.apple\\.com\\/apple\-events\\/includes\\/qtbutton\\.mov$': [5,false]
		}
	},
	image: {
		'.google.com': {
			'^data:.*$': [5,false]
		}
	}
});

for (var k in wld) {
	for (var d in wld[k]) {
		if (!(k in JB.rules.whitelist)) JB.rules.whitelist[k] = {};
		if (!(d in JB.rules.whitelist[k])) JB.rules.whitelist[k][d] = [];

		for (var i = 0; wld[k][d][i]; i++)
			JB.rules.whitelist[k][d][[
				'^', typeof wld[k][d][i] === 'object' ? '(' + wld[k][d][i][0] + ')?' : '',
				'https?:\\/\\/([^\\/]+\.)?', typeof wld[k][d][i] === 'object' ? wld[k][d][i][1] : wld[k][d][i], '\\/.*$'].join('')] = [5, false]	}
}

var wl = JB.rules.whitelist.script;

wl['.google.co.uk'] = wl['.google.com'];
wl['.google.de'] = wl['.google.com'];
wl['.amazon.de'] = wl['.amazon.com'];
wl['.amazon.co.uk'] = wl['.amazon.com'];

/* ====================BLACKLIST===================== */

$.extend(true, JB.rules.blacklist, {
	script: {
		'.*': {
			'^.*google\\.[^\\/]+\\/.*\\/plusone\\.js((\\?|#)+.*)?$': [4,false],
			'^https?:\\/\\/platform\.stumbleupon\\.com\\/.*\\/widgets\\.js((\\?|#)+.*)?$': [4,false],
			'^https?:\\/\\/widgets\\.getpocket\\.com\\/.*\\/btn.js((\\?|#)+.*)?$': [4,false],
			'^https?:\\/\\/assets\\.pinterest\\.com\\/js\\/pinit.js((\\?|#)+.*)?$': [4,false],
			'^https?:\\/\\/([^\\/]+\\.)?platform\\.linkedin\\.com\\/in\\.js.*((\\?|#)+.*)?$': [4,false]
		},
		'.thepiratebay.sx': {
			'^https?:\\/\\/([^\\/]+\\.)?thepiratebay\\.sx\\/static\\/js\\/((?!tpb).)*\\.js((\\?|#)+.*)?$': [4,false]
		}
	}
});

var bld = {
	script: {
		'.*': [
			['Blocks copy and paste on websites', 'tynt\\.com'],
			['Turns words on webpages into clickable ads', 'kontera\\.com'],
			['Makes a popup appear over a link when hovered on', 'snap\\.com'],
			['User tracking and advertising', '(edge|pixel)\\.quantserve\\.com'],
			['Advertisements', 'pagead[0-9]+\\.googlesyndication\\.com'],
			['Advertisements', 'blogads\\.com'],
			['Advertisements', 'admeld\\.com'],
			['Tracks users', 'scorecardresearch\\.com'],
			['Social media tracking', 'connect\\.facebook\\.(com|net)'],
			['Social media tracking', 'platform\\.twitter\\.com'],
			['Advertisements', 'engine\\.carbonads\\.com'],
			['Adds a "tweet-this" button on webpages', 'widgets\\.twimg\\.com'],
			['Tracks users', 'media6degrees\\.com'],
			['Tracks users', '(ssl|www)\\.google\\-analytics\\.com'],
			['User tracking and advertisements', '(ad|stats)\.([a-z]+\\.)?doubleclick\.net'],
			['Tracks users', 'getclicky\\.com'],
			['Advertisements', 'infolinks\\.com'],
			['Tracks users', 'clicktale\\.(net|com)'],
			['User tracking and advertisements', 'zedo\\.com'],
			['Tracks users', 'monster\\.com'],
			['Tracks users', 'ensighten\\.com'],
			['User tracking and advertisements', 'gorillanation\\.com'],
			['Tracks users', 'bizographics\\.com'],
			['Adds a "digg-this" button on webpages', 'widgets\\.digg\\.com'],
			['Tracks users', 'chartbeat\\.com'],
			['Adds a "reddit-this" button on webpages', 'redditstatic.s3.amazonaws.com'],
			['Adds a "reddit-this" button on webpages', 'reddit.com'],
			['Tracks users', 'verticalacuity\\.com'],
			['Tracks users', 'sail\\-horizon\\.com'],
			['Tracks users', 'kissmetrics\\.com'],
			['Advertisements', 'legolas\\-media\\.com'],
			['Advertisements', 'adzerk\\.(com|net)'],
			['Advertisements', 'adtechus\\.com'],
			['Marketing', 'skimlinks\\.com'],
			['Marketing', 'visualwebsiteoptimizer\\.com'],
			['Marketing', 'marketo\\.(net|com)'],
			['Tracks users', 'coremetrics\\.com'],
			['Tracks users', 'serving\\-sys\\.com'],
			['Advertisements', 'insightexpressai\\.com'],
			['Advertisements', 'googletagservices.com'],
			['Layers', 'live.spokenlayer.com'],
			['Tracks users', 'linksalpha.com'],
			['ShareThis', 'sharethis.com'],
			['AddThis', 'AddThis.com']
		]
	},
	frame: {
		'.*': [
			['Facebook social media tracking', 'facebook\\.com'],
			['Twitter social media tracking', 'twitter\\.com'],
			['Google social media tracking', 'plusone\\.google\\.(com|ca|co\\.uk)'],
			'ads\\.[^\\.]+\\..*',
			['Tracks users', 'mediaplex\\.com'],
			['Advertisements', 'legolas\\-media\\.com'],
			['Adds a "reddit-this" button on webpages', 'reddit.com'],
			['Tracks users', 'linksalpha.com']
		]
	}
};

for (var k in bld) {
	if (!(k in JB.rules.blacklist)) JB.rules.blacklist[k] = {};

	for (var d in bld[k]) {
		if (!(d in JB.rules.blacklist[k])) JB.rules.blacklist[k][d] = {};

		for (var i = 0; bld[k][d][i]; i++)
			JB.rules.blacklist[k][d][[
				'^', typeof bld[k][d][i] === 'object' ? '(' + bld[k][d][i][0] + ')?' : '',
				'https?:\\/\\/([^\\/]+\.)?', typeof bld[k][d][i] === 'object' ? bld[k][d][i][1] : bld[k][d][i], '\\/.*$'].join('')] = [4, false];
	}
}

delete wl;
wl = undefined;

delete wld;
wld = undefined;

delete bld;
bld = undefined;
