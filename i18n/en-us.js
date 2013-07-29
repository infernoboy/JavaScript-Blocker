/***************************************
 * @file i18n/en-us.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)

 * Any word or phrase preceded by "/*----" means it was already translated elsewhere in the file.
 * For example: "/*---- 'Show Active'"
 * This is not the same as "/***" or "/*--**", which is just a helper comment.
 ***************************************/

Strings['en-us'] = {
	'Thanks for using {1}': 'Thanks for using {1}!',
	'All Domains': 'All Domains',
	'?': '?', // Displayed next to an item to display further helpful information.
	'{1} matches': '{1} matches', // {1} = Number of items found using the find bar (Cmd+F)


	/*------ MAIN WINDOW ------
	/**/ 'Done': 'Done',
	/**------ TOOLBAR ------
	/*--*/ 'Unlock': 'Unlock',
	/*--*/ 'Contribute': 'Contribute',
	/*--*/ 'Enable JavaScript Blocker': 'Enable',
	/*--*/ 'Disable JavaScript Blocker': 'Disable',
	/*--*/ 'Help': 'Help',
	/*--*/ 'Settings': 'Settings',
	/*--*/ 'Rules': 'Rules',
	/*--*/ 'Show Hidden': 'Show Hidden',
	/*--*/ 'JavaScript Blocker': 'JavaScript Blocker',
	/**--------*/
	/**/
	/**/ 'Page:': 'Host:', // Label for page selector
	/***** Navigation on the right of the page selector.
	/****/ 'Main page': 'Main host',
	/****/ 'Prev. frame': 'Prev. host',
	/****/ 'Next frame': 'Next host',
	/**/
	/*** Displayed in the page selector as an optgroup.
	/**/ 'Main Page': 'Main Host',
	/**/ 'Inline Frame Pages': 'Inline Frame Hosts',
	/**/
	/*** Displayed in the page selector when a frame does not have a URL.
	/**/ 'Custom Frame': '(Non-URL Based Frame)',
	/**/
	/*** A label preceding a number determining the amount of items in a section.
	/**/ 'Allowed:': 'Allowed:',
	/**/ 'Blocked:': 'Blocked:',
	/**/ 'Unblocked:': 'Unblockable:',
	/**/
	/*** Headers for the item groups. Displayed in all-caps via CSS transformation.
	/*** Also displayed when adding an All... rule as a list of checkboxes.
	/**/ 'Scripts': 'Scripts',
	/**/ 'Frames': 'Frames',
	/**/ 'Images': 'Images',
	/**/ 'Embeds': 'Embeds & objects',
	/**/ 'Videos': 'Videos',
	/**/ 'Specials': 'Other',
	/**/
	/*** Appears in a poppy when clicking the ? to the left of a Blocked or Allowed item when expert
	/*** features are disabled.
	/**/ 'No information available.': 'No information available.',
	/**/ 'More Info': 'Safety Info',
	/****/ 'Safety Information for {1}': 'Safety Information for {1}', // {1} = domain (www.google.com)
	/**/ 'View script Source': 'View Script Source',
	/****/ 'Beautify Script': 'Beautify Script', // Displayed when viewing the contents of a script. Also applies to unblockable scripts.
	/**/ 'View frame Source': 'View Frame Source',
	/**/ 'View image Source': 'View Image',
	/**/ 'Show Matched Rules': 'Show Matched Rules',
	/***** These appear as a header in the poppy.
	/****/ 'Matched script Rules': 'Matched Script Rules',
	/****/ 'Matched frame Rules': 'Matched Frame Rules',
	/****/ 'Matched image Rules': 'Matched Image Rules',
	/****/ 'Matched embed Rules': 'Matched Embed & Object Rules',
	/****/ 'Matched video Rules': 'Matched Video Rules',
	/****/ 'Matched special Rules': 'Matched Other Rules',
	/**/
	/**/ 'Unblocked Script': 'Unblockable Script', // A header in a window displaying the contents of an unblockable script.
	/**/
	/*** Appears as buttons in a poppy when clicking the Rules toolbar item.
	/**/ 'Active Temporary Rules': 'Active Temporary Rules', // A header for the 3 buttons below.
	/****/ 'Make Permanent': 'Make Permanent',
	/****/ 'Revoke': 'Revoke',
	/****/ 'Show': 'Show',
	/**/ 'Show All': 'Show All',
	/**/ 'Show Active': 'Show Active',
	/**/ 'Backup': 'Backup',
	/****/ 'Export': 'Export',
	/******/ 'Copy above': 'Copy the above and save it to a file to create a backup.',
	/****/ 'Import': 'Import',
	/******/ 'Restore': 'Restore',
	/******/ 'Paste your backup': 'Paste the contents of your backup above and hit restore. All existing rules will be removed.',
	/********/ 'Error importing': 'Error importing rules.',
	/**/
	/**------ RULE CREATION ------
	/*--*/ 'Allow…': 'Allow or Hide',
	/*--*/ 'Block…': 'Block or Hide',
	/*----*/ 'All.': 'All…',
	/*------*/ 'All': 'All', // [Allow/Block/Hide] All
	/*----*/ 'Some': 'Some',
	/*------*/ 'Make these temporary rules': 'Make these temporary rules', // Also appears when adding the above All... rule
	/*------*/ '{1} selected items': '{1} selected items',
	/*--*/
	/*--*/ 'On:': 'On:', // The domain in which a rule is to be created for (On: google.com)
	/******* These are also used in a select box before a domain name (Allow google.com)
	/******* and in a select box when adding an All... rule (Allow All)
	/*----*/ 'Hide': 'Hide', 
	/*----*/ 'Block': 'Block',
	/*----*/ 'Allow': 'Allow',
	/**--------*/
	/*-----------*/
	
	/*------ RULE WINDOW ------
	/**/ 'Close Rules List': 'Close Rules',
	/**/
	/*** {1} - number of domains in list, {2} - number of rules in list
	/**/ '{1} domain, {2} rule': '{1} domain, {2} rule',
	/**/ '{1} domain, {2} rules': '{1} domain, {2} rules',
	/**/ '{1} domains, {2} rule': '{1} domains, {2} rule',
	/**/ '{1} domains, {2} rules': '{1} domains, {2} rules',
	/**/
	/**------ FILTER BARS ------
	/*--*/ 'Filter:': 'Filter:',
	/*----*/ 'Domains': 'Domains', // Used as the placeholder for the domain filter
	/*--*/
	/*--*/ 'State:': 'State:',
	/*----*/ 'Any': 'Any',
	/*----*/ 'Enabled': 'Enabled',
	/*----*/ 'Disabled': 'Disabled',
	/*----*/ 'Temporary': 'Temporary',
	/*--*/
	/*--*/ 'Visibility:': 'Visibility:',
	/*------ 'Any'
	/*----*/ 'Collapsed': 'Collapsed',
	/*----*/ 'Expanded': 'Expanded',
	/*--*/
	/*--*/ 'Not Used Within:': 'Not Used In Past:', // If a rule has or hasn't been used in ...
	/*--*/ 'Used Within:': 'Used In Past:',
	/*----*/ 'Past Hour': 'Hour',
	/*----*/ 'Past Day': 'Day',
	/*----*/ 'Past Week': 'Week',
	/*----*/ 'Past Month': 'Month',
	/*----*/ 'Past Year': 'Year',
	/**--------*/
	/**/
	/**------ ACTIONS TOOLBAR (displayed in a tooltip when hovering over the appropriate item) ------
	/*--*/ 'Collapse All': 'Collapse All',
	/*--*/ 'Expand All': 'Expand All',
	/*---- 'Show Active'
	/*--*/ 'Edit': 'Edit', // Switch rule list to edit mode to delete entire domain rulesets
	/*--*/ 'Make Temporary Rules Permanent': 'Make Temporary Rules Permanent',
	/*--*/ 'Remove Temporary Rules': 'Remove Temporary Rules',
	/*--*/ 'Snapshots': 'Snapshots', // Also displayed as a header in the Snapshots window
	/*--*/ 'Reload Rules': 'Reload Rules',
	/**--------*/
	/**/
	/**------ RULE LISTING ------
	/*--** Headers for the groups of rules. Displayed in all-caps via CSS transformation.
	/*--*/ 'frame Rules': 'Frame Rules',
	/*--*/ 'script Rules': 'Script Rules',
	/*--*/ 'embed Rules': 'Embed & Object Rules',
	/*--*/ 'video Rules': 'Video Rules',
	/*--*/ 'image Rules': 'Image Rules',
	/*--*/ 'special Rules': 'Other Rules',
	/*--*/ 'hide_script Rules': 'Hide-Script Rules',
	/*--*/ 'hide_frame Rules': 'Hide-Frame Rules',
	/*--*/ 'hide_embed Rules': 'Hide-Embed-&-Object Rules',
	/*--*/ 'hide_video Rules': 'Hide-Video Rules',
	/*--*/ 'hide_image Rules': 'Hide-Image Rules',
	/*--*/ 'hide_special Rules': 'Hide-Other Rules',

	'Nothing has been allowed.': 'No Items Allowed',
	'Nothing has been blocked.': 'No Items Blocked',

	'Remove': 'Remove',
	'Allow': 'Allow',
	'Allow/Hide': 'Allow or Hide',
	'Block': 'Block',
	'Block/Hide': 'Block or Hide',
	'All in Snapshot': 'All in Snapshot',
	'{1} All': '{1} All',
	'Webpage default': 'Webpage default',
	'The following features will appear as <b>{1}</b>.': 'The following features will appear as <b>{1}</b>. They will not count towards the amount of blocked/allowed resources.',
	'Finish Setup': 'Finish Setup',
	'Show Setup': 'Show Setup',
	'View': 'View',
	'Disable': 'Disable',
	'Delete': 'Delete',
	'Recover': 'Recover',
	'Merge': 'Merge',
	'Replace': 'Replace',
	'Save': 'Save',
	'Edit Rule': 'Edit Rule',
	'New Rule': 'New Rule',
	'Restore/Delete Rules': 'Restore/Delete Rules',
	'Disable/Delete Rules': 'Disable/Delete Rules',
	'restore Rule': 'Restore Rule',
	'disable Rule': 'Disable Rule',
	'restore Rules': 'Restore Rules',
	'disable Rules': 'Disable Rules',
	'Delete Rule': 'Delete Rule',
	'Delete Rules': 'Delete Rules',
	'Do you want to completely remove all rules for this domain?': 'Do you want to completely remove all rules for this domain?',
	'Keep in mind that if automatic rules are enabled, rules will be recreated if you visit the webpage again.':
			'Keep in mind that if automatic rules are enabled, rules will be recreated if you visit the webpage again.',
	'Close Snapshots': 'Close Snapshots',
	'Close': 'Close',
	'Reinstall whitelist and blacklist rules:': 'Reinstall whitelist and blacklist rules:', // CHANGED
	'Reinstall Whitelist and Blacklist': 'Reinstall Whitelist and Blacklist',
	'Back': 'Back',
	'Continue': 'Continue',
	'New rule for {1}': 'New rule for <b>{1}</b>', // {1} = domain name
	'Show {1} more': 'Show {1} more', // {1} = number of hidden items in main window.
	'Understood': 'Understood',
	'Reset JS Blocker': 'Reset JS Blocker',
	'Leave Settings Alone': 'Leave Settings Alone', // TO BE DELETED
	'Make a Donation': 'Make a Contribution',
	'Maybe Later': 'Maybe Later',
	'I\'ve Donated!': 'I\'ve Contributed',
	'Temporary rule': 'Make this a temporary rule',
	'Options...': 'Options...',
	'Use large font': 'Use large font',
	'Allowed scripts': 'Allowed Scripts',
	'Allowed frames': 'Allowed Frames',
	'Allowed embeds': 'Allowed Embeds & Objects',
	'Allowed videos': 'Allowed Videos',
	'Allowed specials': 'Allowed Others',
	'Allowed images': 'Allowed Images',
	'Blocked scripts': 'Blocked Scripts',
	'Blocked frames': 'Blocked Frames',
	'Blocked embeds': 'Blocked Embeds & Objects',
	'Blocked videos': 'Blocked Videos',
	'Blocked specials': 'Blocked Others',
	'Blocked images': 'Blocked Images',
	'Block These': 'Block These',
	'Allow These': 'Allow These',
	'Exclude whitelist': 'Exclude whitelisted items',
	'Exclude blacklist': 'Exclude blacklisted items',

	'This view contains outdated information. Scroll to the top to have it updated.': 'Outdated information might be displayed. Scroll to the top to have it updated.',

	'scripts': 'scripts',
	'frames': 'frames',
	'images': 'images',
	'embeds': 'embeds and objects',
	'videos': 'videos',
	'specials': 'other',
	'Forgot': 'iForgot',
	'Current Snapshot': 'Current Snapshot',
	'Current Comparison': 'Current Comparison',
	'Create Snapshot': 'Create Snapshot',
	'Snapshot': 'Snapshot',
	'Show Snapshots': 'Show Snapshots',
	'Close Snapshot': 'Close Snapshot',
	'Close Comparison': 'Close Comparison',
	'Merge With Current Rules': 'Merge Rules',
	'Replace Current Rules': 'Replace Rules',
	'Keep': 'Keep',
	'Unkeep': 'Unkeep',
	'Name': 'Name',
	'Kept': 'Kept',
	'Unkept': 'Unkept',
	'Open Preview': 'Preview',
	'Compare': 'Compare',
	'Only in Snapshot': 'Only in Snapshot',
	'Only in My Rules': 'Only in My Rules',
	'In Both': 'In Both',
	'Show Rules': 'Show Rules',
	'Snapshot Preview: {1}': 'Rules in Snapshot <b>{1}</b>',
	'Rules Only in Snapshot: {1}': 'Rules Only in Snapshot <b>{1}</b>',
	'Rules Not in Snapshot: {1}': 'Rules Not in Snapshot <b>{1}</b>',
	'Rules in Both Current Rules and Snapshot: {1}': 'Rules in Both My Rules and Snapshot <b>{1}</b>',
	'Load {1} Blocked Elements': 'Load {1} Blocked Elements',
	'Load {1} Blocked Element': 'Load {1} Blocked Element',
	'{1} allowed, {2} blocked': '{1} allowed, {2} blocked',
	/** /BUTTONS **/
	
	/** POPPIES **/
	'Whitelist and blacklist rules have been reinstalled.': 'Whitelist and blacklist rules have been reinstalled.',
	'All temporary rules are now permanent.': 'All temporary rules are now permanent.',
	'All temporary rules have been removed.': 'All temporary rules have been removed.',
	'Rule succesfully edited.': 'Rule succesfully edited.',
	'Rule succesfully added for {1}': 'Rule succesfully added for <b>{1}</b>', // {1} = domain name
	'Rule succesfully moved to {1}': 'Rule succesfully moved to <b>{1}</b>', // {1} = domain name NEW
	'Changes will appear when you <a id="reload-rules" href="#">reload the rules list</a>.': 'Changes will appear when you <a id="reload-rules" href="#">reload the rule list</a>.',
	'Loading script': 'Loading script&hellip;',
	'Loading frame': 'Loading frame&hellip;',
	'Loading embed': 'Loading embed&hellip;',
	'Loading object': 'Loading object&hellip;',
	'Loading image': 'Loading image&hellip;',
	'Loading Rules': 'Loading Rules…',
	'Copy below': 'Copy the below and save it to a file to create a backup.',
	
	'The rule allowing this item will be removed.': 'The rule allowing this item will be removed.',
	'The rule blocking this item will be removed.': 'The rule blocking this item will be removed.',

	'Nothing is hidden': 'Nothing is hidden.',

	'Snapshot in use': 'You cannot modify rules while previewing or comparing a snapshot.',
	'Domain replaced in current rule set.': 'Domain replaced in current rule set.',
	'Domain merged with current rule set.': 'Domain merged with current rule set.',
	'Rule added to current rule set.': 'Rule added to current rule set.',
	'Snapshot created.': 'A new snapshot has been created.',
	'You have {1} snapshots using {2} of storage.': 'You have {1} snapshots using {2} of storage.',

	'By clicking continue': 'By clicking continue, all features will be unlocked permanently. If in the future you want to ' +
		'make a donation, click <b>Contribute</b> (the <b>Unlock</b> button will be renamed) and then <b>Make a Contribution</b>.',
	/** /POPPIES **/
	
	/** ERRORS-ISH **/
	'Safari extensions website': 'JavaScript Blocker has been successfully installed, but will not be able to run on the Safari Extensions ' +
		'Gallery website for security reasons.',
	'This data URI cannot be displayed.': 'This data URI cannot be displayed.',	
	'Predefined rules cannot be edited.': 'Predefined rules cannot be edited. ',
	'Update Failure': 'Information about the current webpage is outdated or unavailable at this time. The webpage may not be fully loaded yet. If it is, reloading might resolve the issue.',
	'Unable to view source of embedded items.': 'Unable to view source of embedded items.',

	'Unblockable frame': 'This frame\'s source cannot be blocked because it is the result of a navigation event that occurred from ' +
		'the original URL. The original URL may appear as "blank" or "about:blank", though not always; blocking that instead may work.',
	'{1} cannot function when its toolbar icon is hidden.': '{1} cannot function when its toolbar icon is hidden.',
	'No rules exist for this domain.': 'No rules exist for this domain',
	'Please click the flashing toolbar icon to continue': 'Your attention is required in order for JavaScript Blocker to continue functioning properly. ' +
		'Please click the flashing toolbar icon to open the popover for more details.',
	/** /ERRORS-ISH **/
	
	'Enter the pattern for the URL(s) you want to affect.': 'Enter the pattern for the URL(s) you want to affect.',
	'Adding a Rule For {1}': 'Adding a Rule For {1}', // {1} = domain name
	'Editing a Rule For {1}': 'Editing a Rule For {1}', // *
	'Adding a script Rule': 'Adding a Script Rule',
	'Adding a frame Rule': 'Adding a Frame Rule',
	'Adding a embed Rule': 'Adding an Embed & Object Rule',
	'Adding a video Rule': 'Adding a Video Rule',
	'Adding a image Rule': 'Adding an Image Rule',
	'Adding a special Rule': 'Adding a Rule',
	'Adding a hide_script Rule': 'Adding a Hide-Script Rule',
	'Adding a hide_frame Rule': 'Adding a Hide-Frame Rule',
	'Adding a hide_embed Rule': 'Adding a Hide-Embed-&-Object Rule',
	'Adding a hide_video Rule': 'Adding a Hide-Video Rule',
	'Adding a hide_image Rule': 'Adding a Hide-Image Rule',
	'Adding a hide_special Rule': 'Adding a Hide-Other Rule',

	'Adding a script Rule For {1}': 'Adding a Script Rule For {1}',
	'Adding a frame Rule For {1}': 'Adding a Frame Rule For {1}',
	'Adding a embed Rule For {1}': 'Adding an Embed & Object Rule For {1}',
	'Adding a video Rule For {1}': 'Adding a Video Rule For {1}',
	'Adding a image Rule For {1}': 'Adding an Image Rule For {1}',
	'Adding a special Rule For {1}': 'Adding an Other Rule For {1}',
	'Adding a hide_script Rule For {1}': 'Adding a Hide-Script Rule For {1}',
	'Adding a hide_frame Rule For {1}': 'Adding a Hide-Frame Rule For {1}',
	'Adding a hide_embed Rule For {1}': 'Adding a Hide-Embed-&-Object Rule For {1}',
	'Adding a hide_video Rule For {1}': 'Adding a Hide-Video Rule For {1}',
	'Adding a hide_image Rule For {1}': 'Adding a Hide-Image Rule For {1}',
	'Adding a hide_special Rule For {1}': 'Adding a Hide-Other Rule For {1}',

	'Editing a script Rule For {1}': 'Editing a Script Rule For {1}',
	'Editing a frame Rule For {1}': 'Editing a Frame Rule For {1}',
	'Editing a embed Rule For {1}': 'Editing an Embed & Object Rule For {1}',
	'Editing a video Rule For {1}': 'Editing a Video Rule For {1}',
	'Editing a image Rule For {1}': 'Editing an Image Rule For {1}',
	'Editing a special Rule For {1}': 'Editing an Other Rule For {1}',
	'Editing a hide_script Rule For {1}': 'Editing a Hide-Script Rule For {1}',
	'Editing a hide_frame Rule For {1}': 'Editing a Hide-Frame Rule For {1}',
	'Editing a hide_embed Rule For {1}': 'Editing a Hide-Embed-&-Object Rule For {1}',
	'Editing a hide_video Rule For {1}': 'Editing a Hide-Video Rule For {1}',
	'Editing a hide_image Rule For {1}': 'Editing a Hide-Image Rule For {1}',
	'Editing a hide_special Rule For {1}': 'Editing a Hide-Other Rule For {1}',

	/** MISC HEADERS **/
	'JavaScript Blocker is disabled.': 'JavaScript Blocker is disabled.',
	/** /MISC **/
	
	/** INFO ABOUT REMOVING RULES **/
	'The following rule is allowing this item:': 'The following rule is allowing this item:',
	'The following rules are allowing this item:': 'The following rules are allowing this item:',
	'The following rule is blocking this item:': 'The following rule is blocking this item:',
	'The following rules are blocking this item:': 'The following rules are blocking this item:',
	
	'Would you like to delete it, or add a new one?': 'Would you like to delete it, or add a new one?',
	'Would you like to delete them, or add a new one?': 'Would you like to delete them, or add a new one?',
	'Would you like to restore it, or add a new one?': 'Would you like to restore it, or add a new one?',
	'Would you like to disable it, or add a new one?': 'Would you like to disable it, or add a new one?',
	'Would you like to restore them, or add a new one?': 'Would you like to restore them, or add a new one?',
	'Would you like to disable them, or add a new one?': 'Would you like to disable them, or add a new one?',
	'Would you like to restore/delete them, or add a new one?': 'Would you like to restore/delete them, or add a new one?',
	'Would you like to disable/delete them, or add a new one?': 'Would you like to disable/delete them, or add a new one?',
	
	'The following rule(s) would be deleted or disabled:': 'The following rule(s) would be deleted or disabled:',
	'This may inadvertently affect other scripts.': 'This may inadvertently affect other scripts.',
	'You can also create a new rule to affect just this one.': 'You can also create a new rule to affect just this one.',
	/** /INFO **/

	/** RULE STUFF - NEW **/
	'HTTP': 'non-secure',
	'HTTPS': 'secure',
	'SAFARI-EXTENSION': 'Safari extension',
	'ABOUT': '',
	'DATA': 'data URI',
	'JAVASCRIPT': 'JavaScript URI',
	'SPECIAL': 'other',
	'FTP': 'file transfer protocol',
	'Temporarily': 'Temporarily',
	'allow': 'allow',
	'block': 'block',
	'hide': 'hide',
	'within': 'within',
	'from': 'from',
	'matching': 'matching',
	'others matching': 'others matching',
	'all others': 'all others',
	'and': 'and',
	'all': 'all',

/*Temporarily allow secure scripts from google.com
	Allow non-secure scripts from google.com
	Allow non-secure scripts within google.com
	Temporarily block secure scripts from google.com
	Hide non-secure and secure scripts from google.com
	Hide Safari extension, secure and non-secure scripts within google.com
	Allow others matching ^window_resize$
	Allow window resize fucntions
	Block scripts matching ^http:\/\/google\.com\/.*$ */
	
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
	'rel_referer': 'Referer on navigation',
		'rel_referer:1': 'Referer information will be sent. Anchor tags are unchanged.',
		'rel_referer:0': 'Referer information will try to be hidden. Anchor tags are modified with "rel=noreferrer".',

	'Injected pre Script: {1}': 'Before Load: {1}',
	'Injected post Script: {1}': 'After Load: {1}',

	/** /SPECIALS **/
			
	/** DONATION STUFF **/
	'Donator-only Features': 'Extra Features',
	'Trial remaining {1} days, {2} hours, and {3} minutes': 'You have {1} days, {2} hours, and {3} minutes remaining in your free trial.', // TO BE DELETED
	'Trial remaining {1} days, {2} hours, and {3} minutes of the <b>{4}</b>': 'You have {1} days, {2} hours, and {3} minutes remaining in your trial of the {4}',
		'donator-only features.': 'extra features.',
	'Free trial expired': 'Your free trial has expired. You can make a contribution and have it verified to continue using the extra features of {1}.',
	'Remember for free': 'If you are unable to make a contribution (or just don\'t want to), click <b>Unlock</b> in the JavaScript Blocker popup, then <b>Unlock Without Contributing</b>. ' +
		'You will then have access to all of the extra features for free.',
	'Updated JavaScript Blocker {1}': 'JavaScript Blocker has been updated to version {1}',
	'Thank you for your continued use': 'Thank you for your continued use of JavaScript Blocker!',
	'Please, if you can': 'Please, if you can, show your support by making a contribution of any amount. ' +
			'It would be greatly appreciated and you will have unlimited access to all the extra features of JavaScript Blocker.',
	'Donation Verification': 'Payment Verification',
	'To complete the unlocking': 'To unlock all features permanently, you must enter the email address you used to make your payment. Please note that ' +
			'it may take up to 24 hours for it to become active on the server.',
	'PayPal Email Address': 'PayPal Email Address',
	'An email address was not specified.': 'An email address was not specified.',
	'A donation with that email address was not found.': 'A contribution with that email address was not found.',
	'The maximum number': 'The maximum number of activations has been used for that email address.',
	'Your donation has been verified': 'Your payment has been verified and all features have been unlocked.',
	'Unlocked without contributing': 'All features have been unlocked for free. If you would like to make a donation, you may do so ' +
		'from the <a class="outside" href="http://javascript-blocker.toggleable.com/donate">donation page</a>.',
	'You may unlock {1}': 'You may unlock JavaScript Blocker on {1} more copies of Safari.',
	'Thanks for your support!': 'Thanks for your support!',
	'All features are already unlocked.': 'All features are already unlocked.',
	'Donation Required': 'A verified contribution is required to use that feature. Click "Unlock All Features Permanently" from the main window to do so.',
	"Unlock Without Contributing": "Unlock Without Contributing",
	'What donation?': 'What extra features are there?',
	'You cannot use JavaScript Blocker': 'You cannot use JavaScript Blocker with expert features enabled until you have made a contribution and had it verified.',
	'Either disable expert': 'Either disable expert features or click <b>{1}</b> below to verify your contribution.',
	'New donation method {1}': 'Due to many complaints about features not remaining unlocked, a new payment verification system has been created. Please click <b>{1}</b> to verify your payment one final time.',
	/** /DONATION **/
	
	/** SETTINGS - NEW **/
	'Last EasyList/EasyPrivacy update was {1}': 'Last blacklist/whitelist update was {1}<br />Update is scheduled to run every 5 days.',
	'Rule List Filter Bars': 'Rule list filter bars',
	'JavaScript Blocker Settings': 'JavaScript Blocker Settings',
	'Once any of these features are active,':
		'When active, the following features will appear in the main window as a blocked item under <b>OTHER</b>, but will not count towards the amount of blocked/allowed resources. ' + 
		'You can create rules for them just as you would any other item.',
	
	// Toolbar items
	'User Interface': 'User Interface',
	'Keyboard': 'Keyboard',
	'Other Features': 'Other Features',
	'Custom': 'Custom',
	'Search': 'Search',
	'About': 'About',
	
	'Donator-only features': 'Extra features', // Header displayed above the section containing donator-only features.
	
	'Language:': 'Language:',
	'Sources displayed by default:': 'Sources displayed by default:',
	'Toolbar badge shows number of:': 'Toolbar badge shows number of:',
	'Use animations': 'Use animations',
	'Use floating headers': 'Use floating headers',
	'Use a large font': 'Use a large font',
	'Use simplified rules': 'Use simplified rules',
	'Highlight items that matched a rule': 'Highlight items that matched a rule',
	'Show scripts that can\'t be blocked': 'Show scripts that can\'t be blocked',
	'Hide donator-only features': 'Hide extra features',
	'Show the number of items blocked or allowed for each host': 'Show number of items blocked/allowed per host',
	'Temporarily switch to expert mode when clicked': 'Temporarily switch to expert view upon clicking number of allowed/blocked hosts',
	'Resize blocked and allowed columns': 'Resize blocked and allowed item lists when collapsed',
	'Resize blocked and allowed columns only in expert view': 'only in expert view',
	'Show blocked and allowed resources in page list': 'Show number of blocked and allowed resources in page selector',
	'Show whitelist and blacklist rules in the rule list': 'Show whitelist and blacklist rules in the rule list',
	'Theme:': 'Theme:',
	'Enable expert features to block individual items instead of full hosts': 'Enable expert mode to allow/block items using regexp',
	'A different rule set will be used in this mode.': 'A different rule set will be used in this mode. Would you like to convert your existing rules ' +
		'to be compatible? Some rules may not be able to be converted automatically.',
	'Ignore whitelist rules': 'Ignore whitelist rules',
	'Ignore blacklist rules': 'Ignore blacklist rules',
	'Resources on secure sites must also be secure': 'Resources on secure sites must also be secure<br/><span class="aside">This will only affect items that have a blocker enabled.</span>',
	'Automatically allow resources from other extensions': 'Allow resources from other extensions',
	'Prevent links on webpages from sending referer information': 'Prevent links on webpages from sending referer information',
	'Automatically block scripts from:': 'Block scripts from:',
	'Create temporary rules for automatic actions': 'Create temproary rules for automatic actions',
	'…even if Private Browsing is enabled': 'even if Private Browsing is enabled',
	'Enable script blocker': 'Enable script blocker',
	'Enable frame blocker': 'Enable frame blocker',
	'Show a placeholder for blocked frames': 'Show a placeholder for blocked frames',
	'Automatically block frames from:': 'Block frames from:',
	'Enable embed and object blocker': 'Enable embed and object blocker',
	'Show a placeholder for blocked embeds and objects': 'Show a placeholder for blocked embeds & objects',
	'Automatically block embeds and objects from:': 'Block embeds & objects from:',
	'Enable video blocker': 'Enable video blocker',
	'Show a placeholder for blocked videos': 'Show a placeholder for blocked videos',
	'Automatically block videos from:': 'Block videos from:',
	'Enable DOM image blocker': 'Enable DOM image blocker',
	'Show a placeholder for blocked images': 'Show a placeholder for blocked images',
	'Automatically block images from:': 'Block images from:',
	'Display alert() messages within the webpage instead of a popup dialog': 'Display alert() messages within the webpage instead of a popup dialog<br/><span class="aside">Modal alert dialogs</span>', // alert() is a function in javascript; do not localize.
	'Disable confirm() popup dialogs and confirm actions automatically': 'Disable confirm() popup dialogs and confirm actions automatically<br/><span class="aside">Confirm dialogs</span>', // confirm() is a function in javascript; do not localize.
	'Prevent webpages from disabling or using a custom context menu and prevent other extensions from creating menu items': 'Prevent webpages from disabling or using a custom context menu and prevent other extensions from creating menu items<br/><span class="aside">Context menu overrides</span>',
	'Prevent webpages from resizing the window and creating new windows with a custom size': 'Prevent webpages from resizing the window and creating new windows with a custom size<br/><span class="aside">Window resize functions</span>',
	'Prevent webpages from disabling autocomplete': 'Prevent webpages from disabling autocomplete<br/><span class="aside">Autocomplete disablers</span>',
	'Custom zoom level for webpages:': 'Custom zoom level for webpages:',
	'Custom font for webpages:': 'Custom font for webpages:',
	'Disabled mode persist across Safari restarts': 'Disabled mode persist across Safari restarts',

	'Enter a name for the script.': 'Enter a name to use for the script. This will be displayed in the popover under allowed/blocked.',
	'Enter the contents of the script.': 'Enter the contents of the script. You can use option+return to make a new line.',
	'User Defined Scripts': 'User Defined Scripts',
	'No User Defined Scripts': 'No User Defined Scripts',
	'Create a custom injected script:': 'Create a custom injected script:',
	'Create Script...': 'Create Script...',
	'Create Script': 'Create Script',
	'Before Load': 'Before Load',
	'After Load': 'After Load',

	'Enable custom injected scripts': 'Enable custom injected scripts',

	'custom helper description': 'This section allows you to create custom scripts that are injected into a webpage. They will appear ' +
		'under the <b>OTHER</b> section of the main window and rule list. Once a new script is created, you can create rules ' +
		'to enable it on a per-site basis or create a rule to enable it everywhere.',
	'before load description': 'These scripts will be injected into the webpage before the DOM and other scripts are loaded.',
	'after load description': 'These scripts will be injected once the content of the webpage is ready to be manipulated.',

	'The short URL—{1}—is redirecting you to: {2} {3} Do you want to continue?':
		"The short URL—{1}—is redirecting you to:\n\n{2}\n{3}\n\nDo you want to continue?",

	'Search Results': 'Search Results', // Header displayed in the search panel.
	'No Results': 'No Results',
	
	'Other…': 'Other…', // Generic option

	// Quick Add
	'Enable Quick Add—lets you add rules with a single click': 'Enable Quick Add—allow/block items with one click',
		'Quick-add rules are temporary': 'Quick Add rules are temporary',
	'Create Quick Add rules for:': 'Create Quick Add rules for:',
	'Same hostname as page host': 'Same domain as page host',
	'Least domain of page host': 'Root domain of page host',
	
	// Zoom
	'Default webpage zoom level': '<span class="aside">Default webpage zoom level</span>',
	'Enter a custom zoom level to use.': 'Enter a custom zoom level to use. Do not include the % symbol.', // Pops up when "Other..." is clicked
	
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
	'Twilight (Incomplete)': 'Twilight (Incomplete)',

	'Show visibility filter bar': 'Show visibility filter bar',
	'Show state filter bar': 'Show state filter bar',
	'Show "Not Used In Past" filter bar': 'Show "Not Used In Past" filter bar',
	'Show "Used In Past" filter bar': 'Show "Used In Past" filter bar',
	'Show domain filter bar': 'Show domain filter bar',
	
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
	'Nowhere': 'Blacklist only',
	'Anywhere': 'Anywhere',

	 // Snapshots
	 'Snapshots description': 'Snapshots keeps track of all changes made to your rules. It lets you easily revert to different ' +
	 		'rule sets, or recover just a few. You\'ll never have to worry about messing up your rules again.',
	 'Snapshots disabled': 'Snapshots are disabled.',
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
		'EXPERIMENTAL: Enable full referer blocking',
	'blockReferrer help': 'This will only work on GET requests in the main window. Inline frames will not ' +
		'have referer headers blocked due to a limitation of Safari. This setting may cause a loop when trying to navigate back/forward. ' +
		'It may also break any extensions that modify link or tab behavior. If you are experiencing any unexpected behavior, turn this ' +
		'feature off.',

	// Short URL stuff - NEW
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
	
	'Remove all rules:': 'Remove all rules:', // label
	'Remove Rules': 'Remove Rules', // button
	'All rules have been removed.': 'All rules have been removed.', // popup
	'All snapshots have been removed.': 'All snapshots have been removed.', // popup
	'Rule removed.': 'Rule removed.',

	'Reinstall': 'Reinstall', // reinstall WL and BL

	'Include whitelist and blacklist rules': 'Include whitelist and blacklist rules (can take a few minutes to load)',

	'Convert non-simplified rules:': 'Convert non-simplified rules:',
	'Convert Rules': 'Convert Rules',
	'Rules converted.': 'All rules have been successfully converted. Please review the newly created rules.',
	'Some rules could not be converted {1}': 'Some rules could not be converted {1} Please review the newly created rules.',

	'Full backup description': 'Creating a full backup will <b>not</b> include the donation verification. You may have to re-verify ' + 
		'after importing a backup. All existing settings and rules will be removed when importing a backup.',
	'Create a full backup:': 'Create a full backup:',
	'Import a full backup:': 'Import a full backup:',
	'Delete all snapshots:': 'Delete all snapshots:',
	'Create Backup': 'Create Backup',
	'Import Backup': 'Import Backup',
	'Delete Snapshots': 'Delete Snapshots',
	'Error importing backup': 'Error importing backup',
	'Paste your backup below': 'Paste the contents of your backup and click OK. Current settings and rules will be replaced and you ' +
		'may have to re-verify your donation if applicable.',
	'Your backup has been successfully restored.': 'Your backup has been successfully restored.',
	
	'highlight help': 'Whitelist matches appear in green, blacklist matches in red, and standard rules in gray.',
	'contextmenu_overrides help': 'Other extensions not being able to create custom menu items is an unfortunate side effect and cannot be prevented.',
	'showUnblocked help': 'Some scripts on webpages are embedded in the page itself rather than loaded from an external resource. These scripts cannot be blocked and will always execute.',
	'alwaysBlock help': [
		'<p>If you visit "www.example.com"…</p>',
		'<p><b>Different hostnames</b> will allow "dif.example.com", ',
				'"www.example.com", and "example.com".</p>',
		'<p><b>Different hosts & subdomains</b> will allow only "www.example.com".</p>',
		'<p><b>Blacklist only</b> will allow anything not blocked by the blacklist.</p>',
		'<p><b>Anywhere</b> will allow nothing.</p>'].join(''),
	
	'quickAdd help': 'Quick Add lets you add rules with a single click. Successive clicks with expert features disabled will select different parts of the host. ' +
		'You will have a second to click multiple items or multiple times until you reach your desired result. You can press-and-hold on an item ' +
		'to bypass Quick Add and bring up the standard rule creator.',
	'simpleMode help': 'When enabled, a different rule set will be used.',
	'simpleReferrer help': 'Adds the attribute <b>rel="noreferrer"</b> to anchor tags.', // <b>rel="noreferrer"</b> = do not localize.
	'enableimage help': 'This will <b>not</b> prevent the network request from being made on images. It will only hide it in the DOM. ' +
		'This is a Safari limitation and there is nothing that can be done to prevent it from loading.',
	'simplifiedRules help': 'Rules will be displayed in the rule list in plain English without the complexity of regular expressions. ' +
		'Because rules are saved differently when this option is enabled, existing rules must be converted before they can be used. ' +
		'This can be done from the About tab and choosing Convert Rules.',
	'convertRules help': 'This will attempt to convert rules created using the non-expert UI (with simplified rules disabled) into simplified ones. Any custom or edited rules may not be converted ' +
		'and will have to be re-added manually when using the simplified rules UI. Any existing rules will remain untouched.',

	date: {
		days_short: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
		days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		days_full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		months_full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	}
	/** /SETTINGS **/
};