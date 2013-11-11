/***************************************
 * @file i18n/en-us.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)

 * Any word or phrase preceded by "/*----" means it was already translated elsewhere in the file.
 * For example: "/*---- 'Show Active'"
 * This is not the same as "/***" or "/*--**", which is just a helper comment.
 ***************************************/

Strings['en-us'] = {
	'Safari extensions website': 'JavaScript Blocker has been successfully installed, but will not be able to run on the Safari Extensions ' +
		'Gallery website for security reasons.',
	'{1} cannot function when its toolbar icon is hidden.': '{1} cannot function when its toolbar icon is hidden.',
	'Thanks for using {1}': 'Thanks for using {1}!',
	'All Domains': 'All Domains',
	'?': '?', // Displayed next to an item to display further helpful information.
	'{1} matches': '{1} matches', // {1} = Number of items found using the find bar (Cmd+F)
	'Free trial expired':
		'Your free trial of JavaScript Blocker\'s extra features has expired. To see what what you\'ll be missing out on, browse around the ' +
		'<a class="outside" href="' + ExtensionURL('settings.html#for-other') + '">settings page</a>. You can make a contribution and have ' +
		'it verified to continue using those features.',
	'Updated JavaScript Blocker {1}': 'JavaScript Blocker has been updated to version {1}',
	'Please click the flashing toolbar icon to continue': 'Your attention is required in order for JavaScript Blocker to continue functioning properly. ' +
	 'All sources will be blocked by default until you click the flashing toolbar icon to complete the update',
	'Donation Required': 'A verified contribution is required to use that feature. Click <b>Unlock</b> at the top-left of the main window to do so.',
	'You cannot use JavaScript Blocker': 'You cannot use JavaScript Blocker with expert features enabled until you have made a contribution and had it verified.',
	'Either disable expert': 'Either disable expert features or click <b>{1}</b> below to verify your contribution.',

	'Thank you for your continued use': 'Thank you for your continued use of JavaScript Blocker!',
	'Please, if you can': 'Please, if you can, show your support by making a contribution of any amount. ' +
	 'It would be greatly appreciated and you will have unlimited access to all the extra features of JavaScript Blocker.',

	// Appears in the context menu of a webpage when elements have been blocked.
	'Load {1} Blocked Elements': 'Load {1} Blocked Elements',
	'Load {1} Blocked Element': 'Load {1} Blocked Element',

	'Donator-only Features': 'Extra Features',

	'Allow': 'Allow',
	'Block': 'Block',
	'View': 'View',
	'Delete': 'Delete',
	'Save': 'Save',
	'Close': 'Close',
	'Back': 'Back',
	'Continue': 'Continue',
	'Understood': 'Understood',
	'Done': 'Done',


	date: {
		days_short: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
		days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		days_full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		months_full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	},

	/*------ MAIN WINDOW ------
	/**/ 'Update Failure': 'Information about the current webpage is outdated or unavailable at this time. The webpage may not be fully loaded yet. If it is, reloading might resolve the issue.',
	/**/
	/**------ TOOLBAR ------
	/*--*/ 'Unlock': 'Unlock',
	/*--*/ 'Contribute': 'Contribute',
	/*--*/  'Donation Verification': 'Payment Verification',
	/*--*/  'An email address was not specified.': 'An email address was not specified.',
	/*--*/  'A donation with that email address was not found.': 'A contribution with that email address was not found.',
	/*--*/  'The maximum number': 'The maximum number of activations has been used for that email address.',
	/*--*/  'Your donation has been verified': 'Your payment has been verified and all features have been unlocked.',
	/*--*/  'Thanks for your support!': 'Thanks for your support!',
	/*--*/  'What donation?': 'What extra features are there?',
	/*--*/  'Trial remaining {1} days, {2} hours, and {3} minutes of the <b>{4}</b>': 'You have {1} days, {2} hours, and {3} minutes remaining in your trial of the {4}',
	/*--*/   'donator-only features.': 'extra features.', // Also appears on the About tab of the settings page.
	/*--*/  'To complete the unlocking': 'To unlock all features permanently, you must enter the email address you used to make your payment. Please note that ' +
	/*--*/   'it may take up to 24 hours for it to become active on the server.',
	/*--*/  'PayPal Email Address': 'PayPal Email Address',
	/*--*/  'Make a Donation': 'Make a Contribution',
	/*--*/  'Unlock Without Contributing': 'Unlock Without Contributing',
	/*--*/   'By clicking continue': 'By clicking continue, all features will be unlocked permanently. If in the future you want to ' +
	/*--*/   'make a donation, click <b>Contribute</b> (the <b>Unlock</b> button will be renamed) and then <b>Make a Contribution</b>.',
	/*--*/    'Unlocked without contributing': 'All features have been unlocked for free. If you would like to make a donation, you may do so ' +
	/*--*/     'from the <a class="outside" href="http://javascript-blocker.toggleable.com/donate">donation page</a>.',
	/*--*/  'Forgot': 'iForgot',
	/*--*/ 'Enable JavaScript Blocker': 'Enable',
	/*--*/ 'enable JavaScript Blocker': 'enable',
	/*--*/ 'Disable JavaScript Blocker': 'Disable',
	/*--*/ 'disable JavaScript Blocker': 'disable',
	/*--*/ 'Help': 'Help',
	/*--*/ 'Settings': 'Settings',
	/*--*/ 'Rules': 'Rules',
	/*--*/  'Active Temporary Rules': 'Active Temporary Rules', // A header for the 3 buttons below.
	/*--*/   'Make Permanent': 'Make Permanent',
	/*--*/   'Revoke': 'Revoke',
	/*--*/   'Show': 'Show',
	/*--*/  'Show All': 'Show All',
	/*--*/  'Show Active': 'Show Active',
	/*--*/  'Backup': 'Backup',
	/*--*/   'Export': 'Export',
	/*--*/    'Copy above': 'Copy the above and save it to a file to create a backup.',
	/*--*/   'Import': 'Import',
	/*--*/    'Restore': 'Restore',
	/*--*/    'Paste your backup': 'Paste the contents of your backup above and hit restore. All existing rules will be removed.',
	/*--*/    'Error importing': 'Error importing rules.',
	/*--*/  'Snapshot': 'Snapshot', // Appears only when a snapshot is active.
	/*--*/ 'Show Hidden': 'Show Hidden',
	/*--*/ 'JavaScript Blocker': 'JavaScript Blocker',
	/**-------- TOOLBAR */
	/**/
	/**/ 'Maybe Later': 'Maybe Later',
	/**/ 'I\'ve Donated!': 'I\'ve Contributed',
	/**/
	/**/ 'This view contains outdated information. Scroll to the top to have it updated.':
	/**/  'Outdated information might be displayed. <a id="scroll-to-top">Scroll to the top</a> to have it updated.',
	/**/
	/*** A label preceding a number determining the amount of items in a section.
	/**/ 'Allowed:': 'Allowed:',
	/**/ 'Blocked:': 'Blocked:',
	/**/ 'Unblocked:': 'Unblockable:',
	/**/
	/*** Displayed next to the hostname in the main window.
	/**/ 'Main host': 'Main',
	/**/ 'Frame host': 'Frame',
	/**/
	/**/ 'Disable': 'Disable',
	/**/ 'Enable': 'Enable',
	/**/
	/**/ 'JavaScript Blocker is disabled.': 'JavaScript Blocker is disabled.',
	/**/ 'JavaScript Blocker is disabled on this host.': 'JavaScript Blocker is disabled on this host.',
	/**/
	/*** Headers for the item groups. Displayed in all-caps via CSS transformation.
	/*** Also displayed when adding an All... rule as a list of checkboxes.
	/**/ 'Scripts': 'Scripts',
	/**/ 'Frames': 'Frames',
	/**/ 'Images': 'Images',
	/**/ 'Embeds': 'Embeds and objects',
	/**/ 'Videos': 'Videos',
	/**/ 'Specials': 'Other',
	/**/ 'Ajax_posts': 'XHR POSTs',
	/**/ 'Ajax_gets': 'XHR GETs',
	/**/ 'Ajax_puts': 'XHR PUTs',
	/**/
	/*** Appears in a poppy when clicking the ? to the left of a Blocked or Allowed item when expert
	/*** features are disabled.
	/**/ 'No information available.': 'No information available.',
	/**/ 'Meta Info': 'Metadata',
	/**/ 'More Info': 'Safety Info',
	/**/  'Safety Information for {1}': 'Safety Information for {1}', // {1} = domain (www.google.com)
	/**/ 'View script Source': 'View Script Source',
	/**/  'Beautify Script': 'Beautify Script', // Displayed when viewing the contents of a script. Also applies to unblockable scripts.
	/**/ 'View frame Source': 'View Frame Source',
	/**/ 'View image Source': 'View Image',
	/**/ 'View ajax_get Source': 'View Request Response',
	/**/ 'Show Matched Rules': 'Show Matched Rules',
	/**/  'Matched script Rules': 'Matched Script Rules',
	/**/  'Matched frame Rules': 'Matched Frame Rules',
	/**/  'Matched image Rules': 'Matched Image Rules',
	/**/  'Matched embed Rules': 'Matched Embed and Object Rules',
	/**/  'Matched video Rules': 'Matched Video Rules',
	/**/  'Matched special Rules': 'Matched Other Rules',
	/**/  'Matched ajax_get Rules': 'Matched XHR GET Rules',
	/**/  'Matched ajax_post Rules': 'Matched XHR POST Rules',
	/**/  'Matched ajax_put Rules': 'Matched XHR PUT Rules',
	/**/
	/**/ 'This data URI cannot be displayed.': 'This data URI cannot be displayed.',
	/**/ 'Loading script': 'Loading script...',
	/**/ 'Loading frame': 'Loading frame...',
	/**/ 'Loading embed': 'Loading embed...',
	/**/ 'Loading object': 'Loading object...',
	/**/ 'Loading image': 'Loading image...',
	/**/ 'Loading ajax_get': 'Loading request response...',
	/**/
	/**/ 'Show {1} more': 'Show {1} more', // {1} = number of hidden items in main window.
	/**/
	/**/ 'Unblocked Script': 'Unblockable Script', // A header in a window displaying the contents of an unblockable script.
	/**/
	/**------ RULE CREATION ------
	/*--*/ 'Apply Changes': 'Apply Changes',
	/*--*/ 'Clear Selection': 'Clear Selection',
	/*--*/ 'Closing the popover will apply changes.': 'Closing the popover will apply changes.',
	/*--*/ 'Press and hold for more options.': 'Press and hold for more options.',
	/*--*/
	/*--*/ 'Allow…': 'Allow/Hide',
	/*--*/ 'Block…': 'Block/Hide',
	/*--*/  'Allow/Hide': 'Allow or Hide',
	/*--*/  'Block/Hide': 'Block or Hide',
	/*--*/   'All': 'All',
	/*--*/    '{1} All': '{1} All', // [Allow/Block/Hide] All
	/*--*/   'Some': 'Some',
	/*--*/    'Make these temporary rules': 'Make these temporary rules', // Also appears when adding the above All... rule
	/*--*/    '{1} selected items': '{1} selected items',
	/*--*/
	/*--*/ 'On:': 'On:', // The domain in which a rule is to be created for (On: google.com)
	/*****  These are also used in a select box before a domain name (Allow google.com)
	/*****  and in a select box when adding an All... rule (Allow All)
	/*--*/  'Hide': 'Hide', 
	/*--*/  'Block': 'Block',
	/*--*/  'Allow': 'Allow',
	/*--*/
	/*--*/ 'Unblockable frame': 'This frame\'s source cannot be blocked because it\'s the result of a navigation event that occurred from ' +
	/*--*/  'the original URL. It may appear as "<span class="{1}">{2}</span>"; blocking that instead may work.',
	/*--*/
	/***------ RULE EXIST CHECK
	/*----*/ 'The following rule is allowing this item:': 'The following rule is allowing this item:',
	/*----*/ 'The following rules are allowing this item:': 'The following rules are allowing this item:',
	/*----*/ 'The following rule is blocking this item:': 'The following rule is blocking this item:',
	/*----*/ 'The following rules are blocking this item:': 'The following rules are blocking this item:',
	/*----*/ 'The following rule is affecting JavaScript Blocker on this host:': 'The following rule is affecting JavaScript Blocker on this host:',
	/*----*/ 'The following rules are affecting JavaScript Blocker on this host:': 'The following rules are affecting JavaScript Blocker on this host:',
	/*----*/
	/*----*/ 'Would you like to delete it, or add a new one?': 'Would you like to delete it, or add a new one?',
	/*----*/ 'Would you like to delete them, or add a new one?': 'Would you like to delete them, or add a new one?',
	/*----*/
	/*----*/ 'New Rule': 'New Rule',
	/*----*/ 'Delete Rule': 'Delete Rule',
	/*----*/ 'Delete Rules': 'Delete Rules',
	/***-------- RULE EXIST CHECK */
	/*--*/
	/*--*/ 'Adding a script Rule': 'Adding a Script Rule',
	/*--*/ 'Adding a frame Rule': 'Adding a Frame Rule',
	/*--*/ 'Adding a embed Rule': 'Adding an Embed and Object Rule',
	/*--*/ 'Adding a video Rule': 'Adding a Video Rule',
	/*--*/ 'Adding a image Rule': 'Adding an Image Rule',
	/*--*/ 'Adding a special Rule': 'Adding a Rule',
	/*--*/ 'Adding a disable Rule': 'Adding a Disable/Enable Rule',
	/*--*/ 'Adding a ajax_get Rule': 'Adding an XHR GET Rule',
	/*--*/ 'Adding a ajax_post Rule': 'Adding an XHR POST Rule',
	/*--*/ 'Adding a ajax_put Rule': 'Adding an XHR PUT Rule',
	/*--*/ 'Adding a hide_script Rule': 'Adding a Hide-Script Rule',
	/*--*/ 'Adding a hide_frame Rule': 'Adding a Hide-Frame Rule',
	/*--*/ 'Adding a hide_embed Rule': 'Adding a Hide-Embed-and-Object Rule',
	/*--*/ 'Adding a hide_video Rule': 'Adding a Hide-Video Rule',
	/*--*/ 'Adding a hide_image Rule': 'Adding a Hide-Image Rule',
	/*--*/ 'Adding a hide_special Rule': 'Adding a Hide-Other Rule',
	/*--*/ 'Adding a hide_ajax_get Rule': 'Adding a Hide-XHR-GET Rule',
	/*--*/ 'Adding a hide_ajax_post Rule': 'Adding a Hide-XHR-POST Rule',
	/*--*/ 'Adding a hide_ajax_put Rule': 'Adding a Hide-XHR-PUT Rule',
	/*--*/
	/***** Appears when clicking the the headers for the item groups such as SCRIPTS, FRAMES, etc.
	/*--*/ 'Allowed scripts': 'Allowed Scripts',
	/*--*/ 'Allowed frames': 'Allowed Frames',
	/*--*/ 'Allowed embeds': 'Allowed Embeds and Objects',
	/*--*/ 'Allowed videos': 'Allowed Videos',
	/*--*/ 'Allowed specials': 'Allowed Others',
	/*--*/ 'Allowed images': 'Allowed Images',
	/*--*/ 'Allowed ajax_gets': 'Allowed XHR GETs',
	/*--*/ 'Allowed ajax_posts': 'Allowed XHR POSTs',
	/*--*/ 'Allowed ajax_pus': 'Allowed XHR PUTs',
	/*--*/ 'Blocked scripts': 'Blocked Scripts',
	/*--*/ 'Blocked frames': 'Blocked Frames',
	/*--*/ 'Blocked embeds': 'Blocked Embeds and Objects',
	/*--*/ 'Blocked videos': 'Blocked Videos',
	/*--*/ 'Blocked specials': 'Blocked Others',
	/*--*/ 'Blocked images': 'Blocked Images',
	/*--*/ 'Blocked ajax_gets': 'Blocked XHR GETs',
	/*--*/ 'Blocked ajax_posts': 'Blocked XHR POSTs',
	/*--*/ 'Blocked ajax_puts': 'Blocked XHR PUTs',
	/*--*/
	/*--*/ 'Block These': 'Block These',
	/*--*/ 'Allow These': 'Allow These',
	/*--*/ 'Hide These': 'Hide These',
	/*--*/ 'Exclude whitelist': 'Exclude whitelisted items',
	/*--*/ 'Exclude blacklist': 'Exclude blacklisted items',
	/*--*/
	/*--*/ 'Temporary rule': 'Make this a temporary rule',
	/*--*/
	/*--*/ 'Options...': 'Options...', // Appears in the expert rule creation poppy.
	/**-------- RULE CREATION */
	/*-------- MAIN WINDOW */
	
	/*------ RULE WINDOW ------
	/**/ 'Close Rules List': 'Close Rules',
	/**/
	/*** {1} = number of domains in list, {2} = number of rules in list
	/**/ '{1} domain, {2} rule': '{1} domain, {2} rule',
	/**/ '{1} domain, {2} rules': '{1} domain, {2} rules',
	/**/ '{1} domains, {2} rule': '{1} domains, {2} rule',
	/**/ '{1} domains, {2} rules': '{1} domains, {2} rules',
	/**/
	/**------ FILTER BARS ------
	/*--*/ 'Filter:': 'Filter:',
	/*--*/  'Domains': 'Domains', // Used as the placeholder for the domain filter
	/*--*/
	/*--*/ 'Visibility:': 'Visibility:',
	/*--*/  'Any': 'Any',
	/*--*/  'Collapsed': 'Collapsed',
	/*--*/  'Expanded': 'Expanded',
	/*--*/
	/*--*/ 'Not Used Within:': 'Not Used In Past:', // If a rule has or hasn't been used in ...
	/*--*/ 'Used Within:': 'Used In Past:',
	/*--*/  'Past Hour': 'Hour',
	/*--*/  'Past Day': 'Day',
	/*--*/  'Past Week': 'Week',
	/*--*/  'Past Month': 'Month',
	/*--*/  'Past Year': 'Year',
	/**-------- FILTER BARS */
	/**/
	/**------ ACTIONS TOOLBAR (displayed in a tooltip when hovering over the appropriate item) ------
	/*--*/ 'Collapse All': 'Collapse All',
	/*--*/ 'Expand All': 'Expand All',
	/*---- 'Show Active'
	/*--*/ 'Show Temporary': 'Show Temporary',
	/*--*/ 'Edit': 'Edit', // Switch rule list to edit mode to delete entire domain rulesets
	/*--*/ 'Make Temporary Rules Permanent': 'Make Temporary Rules Permanent',
	/*--*/  'All temporary rules are now permanent.': 'All temporary rules are now permanent.',
	/*--*/ 'Remove Temporary Rules': 'Remove Temporary Rules',
	/*--*/  'All temporary rules have been removed.': 'All temporary rules have been removed.',
	/*--*/ 'Snapshots': 'Snapshots', // Also displayed as a header in the Snapshots window
	/*--*/ 'Reload Rules': 'Reload Rules',
	/**-------- ACTIONS TOOLBAR */
	/**/
	/**------ RULE LIST
	/*----*/ 'No rules exist for this domain.': 'No rules exist for this domain',
	/*----*/
	/***------ SIMPLE VIEW
	/******* Examples:
	/******* Temporarily allow secure scripts from google.com
	/******* Allow non-secure scripts from google.com
	/******* Allow non-secure scripts within google.com
	/******* Temporarily block secure scripts from google.com
	/******* Hide non-secure and secure scripts from google.com
	/******* Hide Safari extension, secure and non-secure scripts within google.com
	/******* Allow others matching ^window_resize$
	/******* Allow window resize fucntions
	/******* Block scripts matching ^http:\/\/google\.com\/.*$ 
	/*----*/ 'HTTP': 'non-secure',
	/*----*/ 'HTTPS': 'secure',
	/*----*/ 'SAFARI-EXTENSION': 'Safari extension',
	/*----*/ 'ABOUT': '',
	/*----*/ 'DATA': 'data URI',
	/*----*/ 'JAVASCRIPT': 'JavaScript URI',
	/*----*/ 'SPECIAL': 'other',
	/*----*/ 'FTP': 'file transfer protocol',
	/*----*/ 'Temporarily': 'Temporarily',
	/*----*/ 'allow': 'allow',
	/*----*/ 'block': 'block',
	/*----*/ 'hide': 'hide',
	/*----*/ 'within': 'within',
	/*----*/ 'to': 'to',
	/*----*/ 'from': 'from',
	/*----*/ 'matching': 'matching',
	/*----*/ 'others matching': 'others matching',
	/*----*/ 'all others': 'all others',
	/*----*/ 'and': 'and',
	/*----*/ 'all': 'all',
	/*----*/ 'scripts': 'scripts',
	/*----*/ 'frames': 'frames',
	/*----*/ 'images': 'images',
	/*----*/ 'embeds': 'embeds and objects',
	/*----*/ 'videos': 'videos',
	/*----*/ 'specials': 'other',
	/*----*/ 'ajax_gets': 'XHR GETs',
	/*----*/ 'ajax_posts': 'XHR POSTs',
	/*----*/ 'ajax_puts': 'XHR PUTs',
	/***-------- SIMPLE VIEW */
	/*--*/
	/***** These appear when viewing the rule list in expert mode.
	/*--*/ 'script:': 'Script:',
	/*--*/ 'frame:': 'Frame:',
	/*--*/ 'image:': 'Image:',
	/*--*/ 'embed:': 'Embed or object:',
	/*--*/ 'video:': 'Video:',
	/*--*/ 'special:': 'Other:',
	/*--*/ 'ajax_get:': 'XHR GET:',
	/*--*/ 'ajax_post:': 'XHR POST:',
	/*--*/ 'ajax_put:': 'XHR PUT:',
	/*--*/ 'hide_script:': 'Hide script:',
	/*--*/ 'hide_frame:': 'Hide frame:',
	/*--*/ 'hide_image:': 'Hide image:',
	/*--*/ 'hide_embed:': 'Hide embed or object:',
	/*--*/ 'hide_video:': 'Hide video:',
	/*--*/ 'hide_special:': 'Hide other:',
	/*--*/ 'hide_ajax_get:': 'Hide XHR GET:',
	/*--*/ 'hide_ajax_post:': 'Hide XHR POST:',
	/*--*/ 'hide_ajax_put:': 'Hide XHR PUT:',
	/**/
	/***------ RULE EDITING
	/******* This will appear anywhere a rule may be added or edited.
	/*----*/ 'Snapshot in use': 'You cannot modify rules while previewing or comparing a snapshot.',
	/*----*/ 'Predefined rules cannot be edited.': 'Predefined rules cannot be edited. ',
	/*----*/ 'Disable rules cannot be modified.': 'Disable/enable rules cannot be modified.',
	/*----*/
	/*----*/ 'Adding a simple rule help':
	/*----*/  '<p>If editing an existing rule, changing the domain will cause it to be moved, not copied.</p>' +
	/*----*/  '<p><b>Protocol</b> - Enter the protocols you want to affect separated by a comma (,). Leave this blank to affect all protocols. If adding a regular expression rule, this is ignored.</p>' +
	/*----*/  '<p><b>Rule</b> - Enter a domain, *, or a regular expression pattern. Placing a period (.) in front of a domain will match all sub-domains also. ' +
	/*----*/  'To add a regular expression rule, enter a pattern starting with <b>^</b> and ending with <b>$</b>.</p>',
	/*----*/ 'Adding an expert rule help':
	/*----*/  '<p>If editing an existing rule, changing the domain will cause it to be moved, not copied.</p>' +
	/*----*/  '<p><b>Rule</b> - Enter a regular expression pattern that matches the item you wish to allow/block. Click the <b>Options...</b> button to reveal some pre-defined patterns.</p>',
	/*----*/
	/*----*/ 'Rule removed.': 'Rule removed.',
	/*----*/
	/*******  {1} = domain name
	/*----*/ 'Edit Rule': 'Edit Rule',
	/*----*/  'Editing a script Rule For {1}': 'Editing a Script Rule For {1}',
	/*----*/  'Editing a frame Rule For {1}': 'Editing a Frame Rule For {1}',
	/*----*/  'Editing a embed Rule For {1}': 'Editing an Embed and Object Rule For {1}',
	/*----*/  'Editing a video Rule For {1}': 'Editing a Video Rule For {1}',
	/*----*/  'Editing a image Rule For {1}': 'Editing an Image Rule For {1}',
	/*----*/  'Editing a special Rule For {1}': 'Editing an Other Rule For {1}',
	/*----*/  'Editing a ajax_get Rule For {1}': 'Editing an XHR GET Rule For {1}',
	/*----*/  'Editing a ajax_post Rule For {1}': 'Editing an XHR POST Rule For {1}',
	/*----*/  'Editing a ajax_put Rule For {1}': 'Editing an XHR PUT Rule For {1}',
	/*----*/  'Editing a hide_script Rule For {1}': 'Editing a Hide-Script Rule For {1}',
	/*----*/  'Editing a hide_frame Rule For {1}': 'Editing a Hide-Frame Rule For {1}',
	/*----*/  'Editing a hide_embed Rule For {1}': 'Editing a Hide-Embed-and-Object Rule For {1}',
	/*----*/  'Editing a hide_video Rule For {1}': 'Editing a Hide-Video Rule For {1}',
	/*----*/  'Editing a hide_image Rule For {1}': 'Editing a Hide-Image Rule For {1}',
	/*----*/  'Editing a hide_special Rule For {1}': 'Editing a Hide-Other Rule For {1}',
	/*----*/  'Editing a hide_ajax_get Rule For {1}': 'Editing a Hide-XHR-GET Rule For {1}',
	/*----*/  'Editing a hide_ajax_post Rule For {1}': 'Editing an Hide-XHR-POST Rule For {1}',
	/*----*/  'Editing a hide_ajax_put Rule For {1}': 'Editing an Hide-XHR-PUT Rule For {1}',
	/*----*/
	/*----*/ 'Rule succesfully edited.': 'Rule succesfully edited.',
	/*----*/
	/*******  Indented strings also appear in the main window during rule creation in expert view.
	/*----*/ 'New script rule for {1}': 'New script rule for <b>{1}</b>',
	/*----*/  'Adding a script Rule For {1}': 'Adding a Script Rule For {1}',
	/*----*/ 'New frame rule for {1}': 'New frame rule for <b>{1}</b>',
	/*----*/  'Adding a frame Rule For {1}': 'Adding a Frame Rule For {1}',
	/*----*/ 'New embed rule for {1}': 'New embed and object rule for <b>{1}</b>',
	/*----*/  'Adding a embed Rule For {1}': 'Adding an Embed and Object Rule For {1}',
	/*----*/ 'New video rule for {1}': 'New video rule for <b>{1}</b>',
	/*----*/  'Adding a video Rule For {1}': 'Adding a Video Rule For {1}',
	/*----*/ 'New image rule for {1}': 'New image rule for <b>{1}</b>',
	/*----*/  'Adding a image Rule For {1}': 'Adding an Image Rule For {1}',
	/*----*/ 'New special rule for {1}': 'New other rule for <b>{1}</b>',
	/*----*/ 	'Adding a special Rule For {1}': 'Adding an Other Rule For {1}',
	/*----*/ 'New ajax_get rule for {1}': 'New XHR GET rule for <b>{1}</b>',
	/*----*/  'Adding a ajax_get Rule For {1}': 'Adding an XHR GET Rule For {1}',
	/*----*/ 'New ajax_post rule for {1}': 'New XHR POST rule for <b>{1}</b>',
	/*----*/  'Adding a ajax_post Rule For {1}': 'Adding an XHR POST Rule For {1}',
	/*----*/ 'New ajax_put rule for {1}': 'New XHR PUT rule for <b>{1}</b>',
	/*----*/  'Adding a ajax_put Rule For {1}': 'Adding an XHR PUT Rule For {1}',
	/*----*/ 'New hide_script rule for {1}': 'New hide-script rule for <b>{1}</b>',
	/*----*/  'Adding a hide_script Rule For {1}': 'Adding a Hide-Script Rule For {1}',
	/*----*/ 'New hide_frame rule for {1}': 'New hide-frame rule for <b>{1}</b>',
	/*----*/  'Adding a hide_frame Rule For {1}': 'Adding a Hide-Frame Rule For {1}',
	/*----*/ 'New hide_embed rule for {1}': 'New hide-embed-and-object rule for <b>{1}</b>',
	/*----*/  'Adding a hide_embed Rule For {1}': 'Adding a Hide-Embed-and-Object Rule For {1}',
	/*----*/ 'New hide_video rule for {1}': 'New hide-video rule for <b>{1}</b>',
	/*----*/  'Adding a hide_video Rule For {1}': 'Adding a Hide-Video Rule For {1}',
	/*----*/ 'New hide_image rule for {1}': 'New hide-image rule for <b>{1}</b>',
	/*----*/  'Adding a hide_image Rule For {1}': 'Adding a Hide-Image Rule For {1}',
	/*----*/ 'New hide_special rule for {1}': 'New hide-other rule for <b>{1}</b>',
	/*----*/  'Adding a hide_special Rule For {1}': 'Adding a Hide-Other Rule For {1}',
	/*----*/ 'New hide_ajax_get rule for {1}': 'New hide-XHR-GET rule for <b>{1}</b>',
	/*----*/  'Adding a hide_ajax_get Rule For {1}': 'Adding a Hide-XHR-GET Rule For {1}',
	/*----*/ 'New hide_ajax_post rule for {1}': 'New hide-XHR-POST rule for <b>{1}</b>',
	/*----*/  'Adding a hide_ajax_post Rule For {1}': 'Adding an Hide-XHR-POST Rule For {1}',
	/*----*/ 'New hide_ajax_put rule for {1}': 'New hide-XHR-PUT rule for <b>{1}</b>',
	/*----*/  'Adding a hide_ajax_put Rule For {1}': 'Adding an Hide-XHR-PUT Rule For {1}',
	/*----*/
	/*----*/ 'Rule succesfully added for {1}': 'Rule succesfully added for <b>{1}</b>',
	/*----*/ 'Rule succesfully moved to {1}': 'Rule succesfully moved to <b>{1}</b>',
	/***-------- RULE EDITING */
	/**-------- RULE LIST */
	/**/
	/**------ SNAPSHOTS
	/*--*/ 'Close Snapshots': 'Close Snapshots',
	/*--*/ 'Create Snapshot': 'Create Snapshot',
	/*--*/  'Snapshot created.': 'A new snapshot has been created.',
	/*--*/
	/*--*/ 'You have {1} snapshots using {2} of storage.': 'You have {1} snapshots using {2} of storage.',
	/*--*/
	/*--*/ 'Open Preview': 'Preview',
	/*--*/
	/*--*/ 'Keep': 'Keep',
	/*--*/ 'Unkeep': 'Unkeep',
	/*--*/ 'Name': 'Name',
	/*--*/ 'Kept': 'Kept',
	/*--*/ 'Unkept': 'Unkept',
	/*--*/ 'Compare': 'Compare',
	/*--*/  'Show Rules': 'Show Rules',
	/*--*/   'Only in Snapshot': 'Only in Snapshot',
	/*--*/   'Only in My Rules': 'Not in Snapshot',
	/*--*/   'In Both': 'In Both',
	/*--*/   'All in Snapshot': 'All in Snapshot',
	/*--*/ 
	/***------ SNAPSHOTS IN RULE LIST
	/******* Also appears in the main window when a snapshot is active.
	/*----*/ 'Snapshot Preview: {1}': 'Rules in Snapshot <b>{1}</b>',
	/*----*/ 'Rules Only in Snapshot: {1}': 'Rules Only in Snapshot <b>{1}</b>',
	/*----*/ 'Rules Not in Snapshot: {1}': 'Rules Not in Snapshot <b>{1}</b>',
	/*----*/ 'Rules in Both Current Rules and Snapshot: {1}': 'Rules in Both My Rules and Snapshot <b>{1}</b>',
	/*----*/ 
	/*----*/ 'Current Snapshot': 'Current Snapshot',
	/*----*/ 'Current Comparison': 'Current Comparison',
	/*----*/  'Merge With Current Rules': 'Merge Rules',
	/*----*/  'Replace Current Rules': 'Replace Rules',
	/*----*/  'Close Snapshot': 'Close Snapshot',
	/*----*/  'Close Comparison': 'Close Comparison',
	/*----*/  'Show Snapshots': 'Show Snapshots',
	/*----*/
	/*----*/ 'Recover': 'Recover',
	/*----*/  'Rule added to current rule set.': 'Rule added to current rule set.',
	/*----*/  'Merge': 'Merge',
	/*----*/   'Domain merged with current rule set.': 'Domain merged with current rule set.',
	/*----*/  'Replace': 'Replace',
	/*----*/   'Domain replaced in current rule set.': 'Domain replaced in current rule set.',
	/***-------- SNAPSHOTS IN RULE LIST */
	/**-------- SNAPSHOTS */
	/*-------- RULE WINDOW */
	
	/** SPECIALS (Other Features) **/
	'alert_dialogs': 'Modal alert popups',
		'alert_dialogs:0': 'Alerts will display within the webpage.',
		'alert_dialogs:1': 'Alerts will display normally.',
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
	'inline_scripts': 'Inline script execution',
		'inline_scripts:0': 'Inline scripts will not be executed.',
		'inline_scripts:1': 'Inline scripts will be executed.',
	'simple_referrer': 'Links sending referrers',
		'simple_referrer:0': 'Links will not send referrer information.',
		'simple_referrer:1': 'Links will be able to send referrer information.',

	'Injected pre Script: {1}': 'Before Load: {1}',
	'Injected post Script: {1}': 'After Load: {1}',
	/** /SPECIALS **/
	
	/** SETTINGS  **/
	// Toolbar items
	'User Interface': 'User Interface',
	'Keyboard': 'Keyboard',
	'Other Features': 'Other Features',
	'Custom': 'Custom',
	'Search': 'Search',
	'About': 'About',
	
	'Donator-only features': 'Extra features', // Header displayed above the section containing donator-only features.

	'Last EasyList/EasyPrivacy update was {1}': 'Last blacklist/whitelist update was {1}<br />Update is scheduled to run every 5 days.',
	'Rule List Filter Bars': 'Rule list',
	'JavaScript Blocker Settings': 'JavaScript Blocker Settings',
	
	'Language:': 'Language:',
	'Sources displayed by default:': 'Sources displayed by default:',
	'Toolbar badge shows number of:': 'Toolbar badge shows number of:',
	'Use animations': 'Use animations',
	'Use a large font': 'Use a large font',
	'Disabled mode persist across Safari restarts': 'Ensure disabled mode persist across Safari restarts',
	'Show scripts that can\'t be blocked': 'Show scripts that can\'t be blocked',
	'Hide injected helper scripts': 'Hide injected helper and custom scripts',
	'Temporarily switch to expert mode when clicked': 'Temporarily switch to expert view upon clicking number of allowed/blocked hosts',
	'Enable expert features to block individual items instead of full hosts': 'Enable expert mode to allow/block items using regexp',
	'A different rule set will be used in this mode.': 'A different rule set will be used in this mode. Would you like to convert your existing rules ' +
		'to be compatible? Some rules may not be able to be converted automatically.',

	'Ignore whitelist rules': 'Ignore whitelist rules',
	'Ignore blacklist rules': 'Ignore blacklist rules',
	'Resources on secure sites must also be secure': 'Block insecure resources on secure websites<br/><span class="aside">This will only affect items that have a blocker enabled.</span>',
	'Automatically allow resources from other extensions': 'Allow resources from other extensions',
	'Automatically block scripts from:': 'Block scripts from:',
	'Enable script blocker': 'Enable script blocker',
	'Enable frame blocker': 'Enable frame blocker',
	'Show a placeholder for blocked frames': 'Show a placeholder for blocked frames',
	'Automatically block frames from:': 'Block frames from:',
	'Enable embed and object blocker': 'Enable embed and object blocker',
	'Show a placeholder for blocked embeds and objects': 'Show a placeholder for blocked embeds and objects',
	'Automatically block embeds and objects from:': 'Block embeds and objects from:',
	'Enable video blocker': 'Enable video blocker',
	'Show a placeholder for blocked videos': 'Show a placeholder for blocked videos',
	'Automatically block videos from:': 'Block videos from:',
	'Enable DOM image blocker': 'Enable image hider',
	'Show a placeholder for blocked images': 'Show a placeholder for hidden images',
	'Automatically block images from:': 'Hide images from:',
	'Enable XHR request blocker': 'Enable XHR blocker',
	'Automatically block XHRs to:': 'Block XHRs to:',

	'Once any of these features are active,':
		'When active, the following features will appear in the main window as a blocked item under <b>OTHER</b>, but will not count towards the amount of blocked/allowed resources. ' + 
		'You can create rules for them just as you would any other item.',

	'Prevent links on webpages from sending referers': 'Prevent links on webpages from sending referrers<br/><span class="aside">Links sending referrers</span>',
	'Display alert() messages within the webpage instead of a popup dialog': 'Prevent alerts from displaying in a modal popup<br/><span class="aside">Modal alert popups</span>', // alert() is a function in javascript; do not localize.
	'Disable confirm() popup dialogs and confirm actions automatically': 'Disable confirm() modal popups and confirm actions automatically<br/><span class="aside">Confirm dialogs</span>', // confirm() is a function in javascript; do not localize.
	'Prevent webpages from disabling or using a custom context menu and prevent other extensions from creating menu items': 'Prevent webpages from disabling or using a custom context menu and prevent other extensions from creating menu items<br/><span class="aside">Context menu overrides</span>',
	'Prevent webpages from resizing the window and creating new windows with a custom size': 'Prevent webpages from resizing the window and creating new windows with a custom size<br/><span class="aside">Window resize functions</span>',
	'Prevent webpages from disabling autocomplete': 'Prevent webpages from disabling autocomplete<br/><span class="aside">Autocomplete disablers</span>',
	'Prevent inline scripts from being executed': 'Prevent inline scripts from being executed<br/><span class="aside">Inline script execution</span>',
	'Custom zoom level for webpages:': 'Custom zoom level for webpages:',
	'Custom font for webpages:': 'Custom font for webpages:',

	'custom helper description': 'This section allows you to create custom scripts that are injected into a webpage. They will appear ' +
		'under the <b>OTHER</b> section of the main window. Once a new script is created, you can create rules ' +
		'to enable it on a per-site basis or create a rule to enable it everywhere.',
	'before load description': 'These scripts will be injected into the webpage before the DOM and other scripts are loaded.',
	'after load description': 'These scripts will be injected once the content of the webpage is ready to be manipulated.',

	'Enter a name for the script.': 'Enter a name to use for the script. This will be displayed in the popover under allowed/blocked.',
	'Enter the contents of the script.': 'Enter the contents of the script. You can use option+return to make a new line.',
	'User Defined Scripts': 'User Defined Scripts',
	'No User Defined Scripts': 'No User Defined Scripts',
	'Create a custom injected script:': 'Create a custom injected script:',
	'Create Script...': 'Create Script...',
	'Create Script': 'Create Script',
	'Before Load': 'Before Load',
	'After Load': 'After Load',

	'The short URL—{1}—is redirecting you to: {2} {3} Do you want to continue?':
		"The short URL—{1}—is redirecting you to:\n\n{2}\n{3}\n\nDo you want to continue?",

	'Search Results': 'Search Results', // Header displayed in the search panel.
	'No Results': 'No Results',
	
	'Other…': 'Other…', // Generic option

	// Quick Add
	'Enable Quick Add': 'Enable Quick Add',
	'only in simple view': 'only in simple view',
	'Use quicker Quick Add': 'Use quicker Quick Add',
	'Quick-add rules are temporary': 'Make Quick Added rules temporary',
	'Create Quick Add rules for:': 'Create Quick Add rules for:',
	'Same hostname as page host': 'Same domain as page host',
	'Least domain of page host': 'Root domain of page host',
	
	// Zoom
	'Default webpage zoom level': '<span class="aside">Default webpage zoom level</span>',
	'Webpage default': 'Webpage default',
	'Enter a custom zoom level to use.': 'Enter a custom zoom level to use. Do not include the % symbol.', // Pops up when "Other..." is clicked
	
	// Langauge selection
	'Automatic': 'Automatic',
	'US English': 'US English',
	'Deutsch': 'Deutsch',
	
	'All of them': 'All of them', // The amount of sources displayed in the main window by default.
	
	// Toolbar badge shows number of...
	'Blocked items': 'Blocked items',
	'Allowed items': 'Allowed items',
	'Neither': 'Neither',

	'Show "Not Used In Past" filter bar': 'Show "Not Used In Past" filter bar',
	'Show "Used In Past" filter bar': 'Show "Used In Past" filter bar',
	
	// Font selection
	'Default webpage font': '<span class="aside">Default webpage font</span>',
	'Helvetica': 'Helvetica', // do not localize
	'Arial': 'Arial', // do not localize
	'Times': 'Times', // do not localize
	'Comic Sans MS': 'Comic Sans MS', // do not localize
	'Enter a custom font to use.': 'Enter a custom font to use.', // Pops up when "Other..." is clicked
	
	// Automatically block items from...
	'Different hostnames': 'Different hostnames',
	'Different hosts &amp; subdomains': 'Different hosts &amp; subdomains',
	'Nowhere': 'Nowhere',
	'Blacklist only': 'Blacklist only',
	'Anywhere': 'Anywhere',
	'Ask when neccessary': 'Ask when neccessary',

	 // Snapshots
	 'Snapshots description': 'Snapshots keeps track of all changes made to your rules. It lets you easily revert to different ' +
	 	 'rule sets, or recover just a few. You\'ll never have to worry about messing up your rules again.',
	 'Snapshots disabled': 'Rule snapshots is currently disabled. You can enable it from the <a href="' + ExtensionURL('settings.html#for-snapshots') + '" class="outside">Snapshots tab</a> of the settings page.',
	 'Enable rule snapshots': 'Enable rule snapshots',
	 'Do you want to remove snapshots that exist?': 'Do you want to remove all existing snapshots?',
	 'Create a snapshot when rules are modified': 'Create a snapshot when rules are modified',
	 'Ignore temporary rules when creating new snapshots': 'Ignore temporary rules when creating new snapshots',
	 'Store only': 'Store up to',
	 'unkept snapshots': 'unkept snapshots',

	 // Keyboard
	'Keyboard navigation helps you get around JavaScript Blocker using only the keyboard.':
	 'Keyboard navigation helps you get around JavaScript Blocker using just the keyboard. ' +
	 'Use the arrow keys and enter/return to select items. Use the tab key to traverse through ' +
	 'normal input and select elements. Hiting the tab key while on a selected ' +
	 'item will focus its closest input or select element. Press escape to cancel a selection or ' +
	 'to unfocus an element.<br /><br />Traverse through the following items:',
	'Main window actions bar': 'Main window actions bar',
	'Main window allowed/blocked/unblockable items': 'Main window allowed/blocked/unblockable items',
	'Rule list filter bar': 'Rule list filter bar',
	'Rule list domains': 'Rule list domains',
	'Rule list rules': 'Rule list rules',
	'Holding option rule': 'Holding alt/option while hitting enter/return will trigger the standard add-a-rule UI if Quick Add is enabled.',
	
	'EXPERIMENTAL: Enable full referer blocking':
		'EXPERIMENTAL: Enable full referrer blocking',
	'blockReferrer help': 'This will only work on GET requests in the main window. Inline frames will not ' +
		'have referrer headers blocked due to a limitation of Safari. This setting may cause a loop when trying to navigate back/forward. ' +
		'It may also break any extensions that modify link or tab behavior. If you are experiencing any unexpected behavior, turn this ' +
		'feature off.',
	'When a new tab opens, make it active': 'When a new tab opens, make it active',

	// Short URL stuff
	'Confirm short URL redirects before they occur': 'Show a confirmation dialog before navigating to a shortened URL',
	'confirmShortURL confirm': 'Before navigating to a short URL, it will be sent to LongURL.org to determine where it will redirect to. ' +
		'This cannot be done in JavaScript. No identifiable information is sent; just the URL ' +
		'that needs to be examined. You may view their privacy policy at: http://longurl.org/privacy-policy' +
		"\n\nAre you sure you want to enable this feature?",
	'You cannot enable confirmShortURL': 'Your computer seems to be having problems connecting to the server needed for URL examination. ' +
		'Please check your firewall and/or Little Snitch settings and try again. If everything seems okay, the server itself may be down temporarily.',

	'These actions are permanent and cannot be undone. If you have a verified donation, backup your rules before proceeding.':
		'These actions are permanent and cannot be undone. If you can, create a backup before proceeding.',

	'Update lists now:': 'Update lists now:',
	'Update Now': 'Update Now',
	'Updating...': 'Updating...',
	
	'Reset all settings to their default values:': 'Reset settings to their default values:', // label
	'Reset Settings': 'Reset Settings', // button

	'Show welcome:': 'Show welcome page:',
	'Show Welcome': 'Show Welcome',
	
	'Remove all rules:': 'Remove all rules:', // label
	'Remove Rules': 'Remove Rules', // button
	'All rules have been removed.': 'All rules have been removed.', // popup
	'All snapshots have been removed.': 'All snapshots have been removed.', // popup

	'Convert Rules': 'Convert Rules',
	'Rules converted.': 'All rules have been successfully converted. Please review the newly created rules.',
	'Some rules could not be converted {1}': 'Some rules could not be converted {1} Please review the newly created rules.',

	'Full backup description': 'Creating a full backup will <b>not</b> include the donation verification. You may have to re-verify ' + 
		'after importing a backup. All existing settings and rules will be removed when importing a backup.',
	'Create a full backup:': 'Create a full backup:',
	'Import a full backup:': 'Import a full backup:',
	'Delete all snapshots:': 'Delete all snapshots:',
	'Create Backup': 'Create Backup',
	 'Copy below': 'Copy the below and save it to a file to create a backup.',
	'Import Backup': 'Import Backup',
	'Delete Snapshots': 'Delete Snapshots',
	'Error importing backup': 'Error importing backup',
	'Paste your backup below': 'Paste the contents of your backup and click OK. Current settings and rules will be replaced and you ' +
		'may have to re-verify your donation if applicable.',
	'Your backup has been successfully restored.': 'Your backup has been successfully restored.',
	
	'contextmenu_overrides help': 'Other extensions not being able to create custom menu items is an unfortunate side effect and cannot be prevented.',
	'inline_scripts help': 'Injects the following meta tag into the webpage:<br/><br/><code>&lt;meta http-equiv="content-security-policy" content="default-src *; script-src *; style-src * \'unsafe-inline\'; object-src *" /&gt;</code><br/><br/>' +
		'This does <b>not</b> guarantee that all scripts will be prevented from executing. For example: a webpage may send a header that overrides the meta tag, though this is highly unlikely to allow inline scripts. ' +
		'This feature is available in Safari 6.1 or greater.',
	'showUnblocked help': 'Some scripts on webpages are embedded in the page itself rather than loaded from an external resource. These scripts cannot be blocked and will always execute.',
	'alwaysBlock help': [
		'<p>If you visit "www.example.com"…</p>',
		'<p><b>Different hostnames</b> will allow "dif.example.com", ',
				'"www.example.com", and "example.com".</p>',
		'<p><b>Different hosts & subdomains</b> will allow only "www.example.com".</p>',
		'<p><b>Blacklist only</b> will allow anything not blocked by the blacklist.</p>',
		'<p><b>Nowhere</b> will allow everything.</p>',
		'<p><b>Anywhere</b> will allow nothing.</p>',
		'<p><b>Ask when neccessary</b> will ask you to allow or deny the item if a rule was not found.</p>'].join(''),
	
	'simpleMode help': 'When enabled, a different rule set will be used.',
	'simpleReferrer help': 'Adds the attribute <b>rel="noreferrer"</b> to anchor tags.', // <b>rel="noreferrer"</b> = do not localize.
	'enableimage help': 'This will <b>not</b> prevent the network request from being made on images. It will only hide it in the DOM. ' +
		'This is a Safari limitation and there is nothing that can be done to prevent it from loading.',
	'simplifiedRules help': 'Rules will be displayed in the rule list in plain English without the complexity of regular expressions. ' +
		'Because rules are saved differently when this option is enabled, existing rules must be converted before they can be used. ' +
		'This can be done from the About tab and choosing Convert Rules.'
	/** /SETTINGS **/
};