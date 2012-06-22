/***************************************
 * @file i18n/en-us.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

Strings['en-us'] = {
	'JavaScript Blocker': 'JavaScript Blocker',
	'Thanks for using {1}': 'Thanks for using {1}!',
	'Setup:Simple Mode': 'Show hostnames instead of individual scripts, similar to ' +
			'<a href="http://noscript.net/">NoScript</a> for Firefox',
	'Setup:Simple Desc': 'This option will disable the more advanced features of {1}, but will make it easier to use. Should you ' +
			'want to start making more sophisticated rules later on, just enable expert features from the preferences.',
	'All Domains': 'All Domains',
	'Main Page': 'Main Page',
	'Inline Frame Pages': 'Inline Frame Pages',
	'Custom Frame': '(Non-URL Based Frame)',
	'Disclaimer.': 'This tool only blocks scripts when they are loaded from an external file or a data URI. ' +
		'What this means is that any scripts that are within the page itself can still run. ' +
		'Unfortunately this is a limitation of the Safari extension design, not mine.',
	
	/** BUTTONS & LABELS **/
	'Domains': 'Domains',
	'State:': 'State:',
	'Visibility:': 'Visibility:',
	'Page:': 'Page:',
	'Allowed:': 'Allowed:',
	'Blocked:': 'Blocked:',
	'Unblocked:': 'Unblockable:',
	'On:': 'On:',
	'?': '?',
	'Edit': 'Edit',
	'Done Editing': 'Done',
	'Remove': 'Remove',
	'Revoke': 'Revoke',
	'Beautify Script': 'Beautify Script',
	'Done': 'Done',
	'{1} matches': '{1} matches', // {1} = Number of items found using the find bar (Cmd+F)
	'Allow': 'Allow',
	'Allow All': 'Allow All',
	'Block All': 'Block All',
	'Block': 'Block',
	'Block scripts manually': 'Allow scripts that originate within the same domain',
	'Block frames unless': 'Block inline frames not originating within the same domain',
	'Enable embed blocker': 'Enable embed, object, and video blocker',
	'Items on secure sites must also be secure': 'Items on secure sites must also be secure',
	'Enable alert blocker': 'Display alert() messages within the webpage instead of a dialog', // NEW
	'Enable confirm blocker': 'Disable confirm() dialogs and confirm actions automatically', // NEW
	'Enable context menu override blocker': 'Block webpages from using a custom context menu and prevent other extensions from creating menu items', // NEW
	'Enable window resize blocker': 'Prevent webpages from resizing the window and creating new windows with a custom size', // NEW
	'Custom zoom for webpages:': 'Custom zoom for webpages:', // NEW
	'You can enable these now': 'You can enable these options now, but they will remain inactive until you verify your donation. ' +
			'Each feature can be blocked on a per-domain basis once enabled.', // NEW
	'Webpage default': 'Webpage default', // NEW
	'The following features will appear as <b>{1}</b>.': 'The following features will appear as <b>{1}</b>. They will not count towards the amount of blocked/allowed resources.',
	'Finish Setup': 'Finish Setup',
	'Show Setup': 'Show Setup',
	'View': 'View',
	'Disable': 'Disable',
	'Delete': 'Delete',
	'Restore': 'Restore',
	'Save': 'Save',
	'Rules': 'Rules',
	'Edit Rule': 'Edit Rule',
	'New Rule': 'New Rule',
	'Restore/Delete Rules': 'Restore/Delete Rules',
	'Restore Rule': 'Restore Rule',
	'Restore Rules': 'Restore Rules',
	'Delete Rule': 'Delete Rule',
	'Delete Rules': 'Delete Rules',
	'Do you want to completely remove all rules for this domain?': 'Do you want to completely remove all rules for this domain?',
	'Keep in mind that if automatic rules are enabled, rules will be recreated if you visit the webpage again.':
			'Keep in mind that if automatic rules are enabled, rules will be recreated if you visit the webpage again.',
	'Close Rules List': 'Close Rules',
	'Close': 'Close',
	'Reinstall Whitelist & Blacklist': 'Reinstall Whitelist & Blacklist',
	'Show All': 'Show All',
	'Show Active': 'Show Active',
	'Show': 'Show',
	'Hide': 'Hide',
	'Continue': 'Continue',
	'View Script Source': 'View Script Source',
	'View Frame Source': 'View Frame Source',
	'View Image Source': 'View Image',
	'New rule for {1}': 'New rule for <b>{1}</b>', // {1} = domain name
	'Any': 'Any',
	'Enabled': 'Enabled',
	'Disabled': 'Disabled',
	'Temporary': 'Temporary',
	'Collapsed': 'Collapsed',
	'Expanded': 'Expanded',
	'Collapse All': 'Collapse All',
	'Expand All': 'Expand All',
	'Enable JavaScript Blocker': 'Enable JavaScript Blocker',
	'Disable JavaScript Blocker': 'Disable JavaScript Blocker',
	'Show {1} more': 'Show {1} more', // {1} = number of hidden items in main window.
	'Help': 'Help',
	'Understood': 'Understood',
	'Reset JS Blocker': 'Reset JS Blocker',
	'Leave Settings Alone': 'Leave Settings Alone', // TO BE DELETED
	'Make a Donation': 'Make a Contribution', // UPDATED
	'Maybe Later': 'Maybe Later',
	'I\'ve Donated!': 'I\'ve Paid!', // UPDATED
	'Unblocked Script': 'Unblockable Script',
	'More Info': 'Safety Info',
	'Unlock': 'Unlock All Features Permanently',
	'Temporary rule': 'Make this a temporary rule',
	'Make Temporary Rules Permanent': 'Make Temporary Rules Permanent',
	'Remove Temporary Rules': 'Remove Temporary Rules',
	'Active Temporary Rules': 'Active Temporary Rules',
	'Make Permanent': 'Make Permanent',
	'Settings': 'Settings',
	'Export': 'Export',
	'Import': 'Import',
	'Backup': 'Backup',
	'Use large font': 'Use large font',
	'Scripts': 'Scripts',
	'Frames': 'Frames',
	'Images': 'Images',
	'Embeds': 'Embeds & objects',
	'Videos': 'Videos', // NEW
	'Specials': 'Other',
	'Frame Rules': 'Frame Rules',
	'Script Rules': 'Script Rules',
	'Embed Rules': 'Embed & Object Rules',
	'Video Rules': 'Video Rules', // NEW
	'Image Rules': 'Image Rules',
	'Special Rules': 'Other Rules',
	'Forgot': 'iForgot',
	'Main page': 'Main page', // NEW
	'Prev. frame': 'Prev. frame', // NEW
	'Next frame': 'Next frame', // NEW
	'Show Matched Rules': 'Show Matched Rules', // NEW
	/** /BUTTONS **/
	
	/** POPPIES **/
	'Whitelist and blacklist rules have been reinstalled.': 'Whitelist and blacklist rules have been reinstalled.',
	'All temporary rules are now permanent.': 'All temporary rules are now permanent.',
	'All temporary rules have been removed.': 'All temporary rules have been removed.',
	'Rule succesfully edited.': 'Rule succesfully edited.',
	'Rule succesfully added for {1}': 'Rule succesfully added for <b>{1}</b>', // {1} = domain name
	'Changes will appear when you reload the rules list.': 'Changes will appear when you reload the rules list.',
	'Loading script': 'Loading script&hellip;',
	'Loading frame': 'Loading frame&hellip;',
	'Loading embed': 'Loading embed&hellip;',
	'Loading object': 'Loading object&hellip;',
	'Loading image': 'Loading image&hellip;',
	'Copy above': 'Copy the above and save it to a file to create a backup.',
	'Paste your backup': 'Paste the contents of your backup above and hit restore. All existing rules will be removed.',
	'Error importing': 'Error importing rules.',
	
	'The rule allowing this item will be removed.': 'The rule allowing this item will be removed.',
	'The rule blocking this item will be removed.': 'The rule blocking this item will be removed.',
	'The temporary rule allowing this item will be removed.': 'The temporary rule allowing this item will be removed.',
	'The temporary rule blocking this item will be removed.': 'The temporary rule blocking this item will be removed.',
	
	'Safety Information for {1}': 'Safety Information for {1}',
	'Matched script Rules': 'Matched Script Rules', // NEW
	'Matched frame Rules': 'Matched Frame Rules', // NEW
	'Matched image Rules': 'Matched Image Rules', // NEW
	'Matched embed Rules': 'Matched Embed & Object Rules', // NEW
	'Matched video Rules': 'Matched Video Rules', // NEW
	'Matched special Rules': 'Matched Other Rules', // NEW
	/** /POPPIES **/
	
	/** ERRORS-ISH **/
	'This data URI cannot be displayed.': 'This data URI cannot be displayed.',	
	'Predefined rules cannot be edited.': 'Predefined rules cannot be edited. ',
	'Update Failure': 'Information about the current webpage is outdated or unavailable, possibly due to a bug with Safari. Reloading the page may resolve the issue.', // UPDATED
	'Unable to view source of embedded items.': 'Unable to view source of embedded items.',
	/** /ERRORS-ISH **/
	
	'Enter the pattern for the URL(s) you want to affect.': 'Enter the pattern for the URL(s) you want to affect.',
	'Adding a Rule For {1}': 'Adding a Rule For <b>{1}</b>', // {1} = domain name
	'Editing a Rule For {1}': 'Editing a Rule For <b>{1}</b>', // *
	'Adding a Script Rule': 'Adding a Script Rule',
	'Adding a Frame Rule': 'Adding a Frame Rule',
	'Adding a Embed Rule': 'Adding an Embed & Object Rule', // UPDATED
	'Adding a Video Rule': 'Adding a Video Rule', // NEW
	'Adding a Image Rule': 'Adding an Image Rule',
	'Adding a Special Rule': 'Adding a Rule', 
	
	/** MISC HEADERS **/
	'{1} domain, {2} rule': '{1} domain, {2} rule', // {1} = number of domains in list, {2} = number of rules in list
	'{1} domain, {2} rules': '{1} domain, {2} rules', // *
	'{1} domains, {2} rule': '{1} domains, {2} rule', // *
	'{1} domains, {2} rules': '{1} domains, {2} rules', // *
	'Unblockable Script': 'Unblockable Script',
	/** /MISC **/
	
	/** INFO ABOUT REMOVING RULES **/
	'The following rule is allowing this item:': 'The following rule is allowing this item:',
	'The following rules are allowing this item:': 'The following rules are allowing this item:',
	
	'Would you like to delete it, or add a new one?': 'Would you like to delete it, or add a new one?',
	'Would you like to delete them, or add a new one?': 'Would you like to delete them, or add a new one?',
	'Would you like to restore it, or add a new one?': 'Would you like to restore it, or add a new one?',
	'Would you like to restore them, or add a new one?': 'Would you like to restore them, or add a new one?',
	'Would you like to restore/delete them, or add a new one?': 'Would you like to restore/delete them, or add a new one?',
	
	'The following rule(s) would be deleted or disabled:': 'The following rule(s) would be deleted or disabled:',
	'This may inadvertently affect other scripts.': 'This may inadvertently affect other scripts.',
	'You can also create a new rule to affect just this one.': 'You can also create a new rule to affect just this one.',
	/** /INFO **/
	
	/** SPECIALS (Other Features) **/
	'alert_dialogs': 'Modal alert dialogs',
		'alert_dialogs:0': 'Alert dialogs will display within the webpage.',
		'alert_dialogs:1': 'Alert dialogs will display normally.',
	'confirm_dialogs': 'Confirm dialogs',
		'confirm_dialogs:0': 'Confirm dialogs will not be displayed. Actions will be confirmed automatically.',
		'confirm_dialogs:1': 'Confirm dialogs will display normally.',
	'contextmenu_overrides': 'Context menu overrides',
		'contextmenu_overrides:0': 'The context menu is the standard browser menu. Any menu items created by other extensions will not be displayed.',
		'contextmenu_overrides:1': 'The context menu may be blocked or replaced with a custom menu.',
	'zoom': 'Default webpage zoom level',
		'zoom:0': 'Custom zoom level is set to {1}%',
		'zoom:1': 'Zoom level is 100% or whatever the webpage specifies.',
	'window_resize': 'Window resize functions',
		'window_resize:0': 'Window resize functions are disabled. This includes specs for window.open()', // window.open() is a javascript function; do not localize.
		'window_resize:1': 'Window resize functions are allowed.',
	'autocomplete_disabler': 'Autocomplete disablers',
		'autocomplete_disabler:0': 'Forms will always be able to autocomplete.',
		'autocomplete_disabler:1': 'Forms may be blocked from being autocompleted.',
	'font': 'Default webpage font',
		'font:0': 'Custom font is set to {1}',
		'font:1': 'Webpage will use its own font.',

	/** /SPECIALS **/
			
	/** DONATION STUFF **/
	'Donator-only Features': 'Pay-for Features', // NEW
	'Trial remaining {1} days, {2} hours, and {3} minutes': 'You have {1} days, {2} hours, and {3} minutes remaining in your free trial.', // TO BE DELETED
	'Trial remaining {1} days, {2} hours, and {3} minutes of the <b>{4}</b>': 'You have {1} days, {2} hours, and {3} minutes remaining in your trial of the <b>{4}</b>', // UPDATED
		'donator-only features.': 'pay-for features.',
	'Free trial expired': 'Your free trial has expired. You must make a contribution and have it verified in order to continue using the pay-for features of {1}.', // NEW
	'Updated JavaScript Blocker {1}': 'JavaScript Blocker has been updated to version {1}',
	'Thank you for your continued use': 'Thank you for your continued use of JavaScript Blocker!',
	'Please, if you can': 'Please, if you can, show your support by making a contribution of any amount. ' +
			'It would be greatly appreciated and will encourage me to create an even better product.', // UPDATED
	'Donation Verification': 'Payment Verification', // UPDATED
	'To complete the unlocking': 'To unlock all features permanently, you must enter the email address you used to make your payment. Please note that ' +
			'it may take up to 24 hours for it to become active on the server.', // UPDATED
	'PayPal Email Address': 'PayPal Email Address',
	'An email address was not specified.': 'An email address was not specified.',
	'A donation with that email address was not found.': 'A contribution with that email address was not found.', // UPDATED
	'The maximum number': 'The maximum number of activations has been used for that email address.',
	'Your donation has been verified': 'Your payment has been verified and all features have been unlocked.', // UPDATED
	'You may unlock {1}': 'You may unlock JavaScript Blocker on {1} more copies of Safari.',
	'Thanks for your support!': 'Thanks for your support!',
	'All features are already unlocked.': 'All features are already unlocked.',
	'Donation Required': 'A verified contribution is required to use that feature. Click "Unlock All Features Permanently" from the main window to do so.', // UPDATED
	"I can't donate": "I can't contribute", // UPDATED
	'What donation?': 'What pay-for features are there?', // UPDATED
	'You cannot use JavaScript Blocker': 'You cannot use JavaScript Blocker with expert features enabled until you have made a contribution and had it verified.', // UPDATED
	'Either disable expert': 'Either disable expert features or click <b>{1}</b> below to verify your contribution.', // UPDATED
	'New donation method {1}': 'Due to many complaints about features not remaining unlocked, a new payment verification system has been created. Please click <b>{1}</b> to verify your payment one final time.', // UPDATED
	/** /DONATION **/
	
	/** SETTINGS - NEW **/
	'JavaScript Blocker Settings': 'JavaScript Blocker Settings',
	'Once any of these features are active, they can be disabled on a per-domain basis. They will appear in the main window under <b>OTHER</b> and will not count towards the amount of blocked/allowed resources.':
		'Once any of the following features are active, they can be disabled on a per-domain basis. They will appear in the main window under <b>OTHER</b> and will not count towards the amount of blocked/allowed resources.',
	
	// Toolbar items
	'User Interface': 'User Interface',
	'Other Features': 'Other Features',
	'Search': 'Search',
	'About': 'About',
	
	'Donator-only features': 'Pay-for features', // Header displayed above the section containing donator-only features.
	
	'Language:': 'Language:',
	'Sources displayed by default:': 'Sources displayed by default:',
	'Toolbar badge shows number of:': 'Toolbar badge shows number of:',
	'Use animations': 'Use animations',
	'Use floating headers': 'Use floating headers',
	'Use a large font': 'Use a large font',
	'Highlight items that matched a rule': 'Highlight items that matched a rule', // NEW
	'Show scripts that can\'t be blocked': 'Show scripts that can\'t be blocked',
	'Hide donator-only features': 'Hide pay-for features', // NEW
	'Show the number of items blocked or allowed for each host': 'Show the number of items blocked or allowed for each host',
	'Theme:': 'Theme:',
	'Enable expert features to block individual items instead of full hosts': 'Enable expert features to block individual items instead of full hosts',
	'Ignore whitelist rules': 'Ignore whitelist rules',
	'Ignore blacklist rules': 'Ignore blacklist rules',
	'Resources on secure sites must also be secure': 'Resources on secure sites must also be secure',
	'Automatically allow resources from other extensions': 'Automatically allow resources from other extensions',
	'Prevent links on webpages from sending referrer information': 'Prevent links on webpages from sending referrer information',
	'Automatically block scripts from:': 'Automatically block scripts from:',
	'Create temporary rules for automatic actions': 'Create temproary rules for automatic actions',
	'Enable script blocker': 'Enable script blocker',
	'Enable frame blocker': 'Enable frame blocker',
	'Show a placeholder for blocked frames': 'Show a placeholder for blocked frames',
	'Automatically block frames from:': 'Automatically block frames from:',
	'Enable embed and object blocker': 'Enable embed and object blocker', // UPDATED
	'Show a placeholder for blocked embeds and objects': 'Show a placeholder for blocked embeds & objects', // UPDATED
	'Automatically block embeds and objects from:': 'Automatically block embeds & objects from:', // UPDATED
	'Enable video blocker': 'Enable video blocker', // NEW
	'Show a placeholder for blocked videos': 'Show a placeholder for blocked videos', // NEW
	'Automatically block videos from:': 'Automatically block videos from', // NEW
	'Enable DOM image blocker': 'Enable DOM image blocker',
	'Show a placeholder for blocked images': 'Show a placeholder for blocked images',
	'Automatically block images from:': 'Automatically block images from:',
	'Display alert() messages within the webpage instead of a popup dialog': 'Display alert() messages within the webpage instead of a popup dialog', // alert() is a function in javascript; do not localize.
	'Disable confirm() popup dialogs and confirm actions automatically': 'Disable confirm() popup dialogs and confirm actions automatically', // confirm() is a function in javascript; do not localize.
	'Prevent webpages from disabling or using a custom context menu and prevent other extensions from creating menu items': 'Prevent webpages from disabling or using a custom context menu and prevent other extensions from creating menu items',
	'Prevent webpages from resizing the window and creating new windows with a custom size': 'Prevent webpages from resizing the window and creating new windows with a custom size',
	'Prevent webpages from disabling autocomplete': 'Prevent webpages from disabling autocomplete', // NEW
	'Custom zoom level for webpages:': 'Custom zoom level for webpages:',
	'Custom font for webpages:': 'Custom font for webpages:',

	'The short URL—{1}—is redirecting you to: {2} {3} Do you want to continue?':
		"The short URL—{1}—is redirecting you to:\n\n{2}\n{3}\n\nDo you want to continue?", // NEW

	'Search Results': 'Search Results', // Header displayed in the search panel.
	
	'Other…': 'Other…', // Generic option
	
	// Zoom
	'Enter a custom zoom level to use.': 'Enter a custom zoom level to use. Do not include the % symbol.', // When "Other..."
	
	// Font size
	'Normal': 'Normal',
	'Large': 'Large',
	
	// Langauge selection
	'Automatic': 'Automatic',
	'US English': 'US English',
	'Deutsch': 'Deutsch',
	
	'All of them': 'All of them', // The amount of sources displayed in the main window by default.
	
	// Toolbar badge shows number of...
	'Blocked items': 'Blocked items',
	'Allowed items': 'Allowed items',
	'Neither': 'Neither',
	
	// Theme name
	'Default': 'Default',
	'Textured Metal': 'Textured Metal',
	'OS X Lion': 'OS X Lion',
	'Blue Linen': 'Blue Linen',
	
	// Font selection
	'Helvetica': 'Helvetica', // do not localize
	'Arial': 'Arial', // do not localize
	'Times': 'Times', // do not localize
	'Comic Sans MS': 'Comic Sans MS', // do not localize
	'Enter a custom font to use.': 'Enter a custom font to use.', // When "Other..."
	
	// Automatically block items from...
	'Different hostnames': 'Different hostnames',
	'Different hosts &amp; subdomains': 'Different hosts &amp; subdomains',
	'Nowhere': 'Nowhere',
	'Anywhere': 'Anywhere',
	
	'EXPERIMENTAL: Enable full referrer blocking':
		'EXPERIMENTAL: Enable full referrer blocking. This will only work on GET requests in the main window. Inline frames will not ' +
		'have referrer headers blocked due to a limitation of Safari. You can <b><a href="javascript:void(0);" id="search-simple">enable simple referrer blocking</a></b> to help ' +
		'block some in these cases. This setting may cause a loop when trying to navigate back/forward.',

	// Short URL stuff - NEW
	'Confirm short URL redirects before they occur': 'Show a confirmation dialog before navigating to a short URL', // NEW
	'confirmShortURL confirm': 'Before navigating to a short URL, it will be sent to LongURL.org to determine where it will redirect to. ' +
		'This cannot be done in JavaScript. No identifiable information is sent; just the URL ' +
		'that needs to be examined. You may view their privacy policy at: http://longurl.org/privacy-policy' +
		"\n\nAre you sure you want to enable this feature?", // NEW
	'You cannot enable confirmShortURL': 'Your computer seems to be having problems connecting to the server needed for URL examination. ' +
		'Please check your firewall and/or Little Snitch settings and try again. If everything seems okay, the server itself may be down temporarily.', // NEW

	'These actions are permanent and cannot be undone. If you have a verified donation, backup your rules before proceeding.':
		'These actions are permanent and cannot be undone. If you are a paid user, backup your rules before proceeding.',
	
	'Reset all settings to their default values:': 'Reset all settings to their default values:', // label
	'Reset Settings': 'Reset Settings', // button
	
	'Remove all rules:': 'Remove all rules:', // label
	'Remove Rules': 'Remove Rules', // button
	'All rules have been removed.': 'All rules have been removed.', // popup
	
	'highlight help': 'Whitelist matches appear in green, blacklist matches in red, and standard rules in gray.', // NEW
	'contextmenu_overrides help': 'Other extensions not being able to create custom menu items is an unfortunate side effect and cannot be prevented.', // NEW
	'showPerHost help': 'With this option enabled, you will be able to click on the number next to the host to show each item associated with it.',
	'showUnblocked help': 'Some scripts on webpages are embedded in the page itself rather than loaded from an external resource. These scripts cannot be blocked and will always execute.',
	'alwaysBlock help': [
		'<p>If you visit "www.example.com"…</p>',
		'<p><b>Different hostnames</b> will allow "dif.example.com", ',
				'"www.example.com", and "example.com".</p>',
		'<p><b>Different hosts & subdomains</b> will allow only "www.example.com".</p>',
		'<p><b>Nowhere</b> will allow everything.</p>',
		'<p><b>Anywhere</b> will allow nothing.</p>'].join(''),
		
	'simpleReferrer help': 'Adds the attribute <b>rel="noreferrer"</b> to anchor tags.', // <b>rel="noreferrer"</b> = do not localize.
	'enableimage help': 'This will <b>not</b> prevent the network request from being made on images. It will only hide it in the DOM. ' +
		'This is a Safari limitation and there is nothing that can be done to prevent it from loading.'
	/** /SETTINGS **/
};