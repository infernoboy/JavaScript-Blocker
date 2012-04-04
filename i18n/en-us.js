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
	'State:': 'State:', // NEW - Displayed in rules list. Label for if a rule is Enabled, Disabled, Temporary, or Any of those.
	'Visibility:': 'Visibility:', // NEW - Displayed in rules list. Label for if a domain is Collapsed or Expanded.
	'Page:': 'Page:',
	'Allowed:': 'Allowed:',
	'Blocked:': 'Blocked:',
	'Unblocked:': 'Unblockable:',
	'On:': 'On:', // NEW - The domain the new rule will be added to, e.g "On: google.com"
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
	'Block scripts manually': 'Allow scripts that originate from the same domain',
	'Scripts on secure sites must also be secure': 'Scripts on secure sites must also be secure',
	'Finish Setup': 'Finish Setup',
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
	'Show': 'Show', // NEW
	'Continue': 'Continue',
	'View Script': 'View Script',
	'New rule for {1}': 'New rule for <b>{1}</b>', // {1} = domain name
	'Any': 'Any',
	'Enabled': 'Enabled',
	'Disabled': 'Disabled',
	'Temporary': 'Temporary', // NEW - In rules list for State:.
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
	'Leave Settings Alone': 'Leave Settings Alone',
	'Make a Donation': 'Make a Donation',
	'Maybe Later': 'Maybe Later',
	'I\'ve Donated!': 'I\'ve Donated!',
	'Unblocked Script': 'Unblockable Script',
	'More Info': 'More Info', // NEW - Displayed when double clicking a script in the main window with expert features on.
	'Unlock': 'Unlock All Features', // NEW
	'Temporary rule': 'Make this a temporary rule', // NEW
	'Make Temporary Rules Permanent': 'Make Temporary Rules Permanent', // NEW
	'Remove Temporary Rules': 'Remove Temporary Rules', // NEW
	'Active Temporary Rules': 'Active Temporary Rules', // NEW
	'Make Permanent': 'Make Permanent', // NEW
	'Project Page': 'Project Page',
	/** /BUTTONS **/
	
	/** POPPIES **/
	'Whitelist and blacklist rules have been reinstalled.': 'Whitelist and blacklist rules have been reinstalled.',
	'All temporary rules are now permanent.': 'All temporary rules are now permanent.', // NEW
	'All temporary rules have been removed.': 'All temporary rules have been removed.', // NEW
	'Rule succesfully edited.': 'Rule succesfully edited.',
	'Rule succesfully added for {1}': 'Rule succesfully added for <b>{1}</b>', // {1} = domain name
	'Changes will appear when you reload the rules list.': 'Changes will appear when you reload the rules list.',
	'Loading script': 'Loading script&hellip;',
	'Loading rules': 'Loading rules&hellip;',
	/** /POPPIES **/
	
	/** ERRORS-ISH **/
	'This data URI cannot be displayed.': 'This data URI cannot be displayed.',	
	'Predefined rules cannot be edited.': 'Predefined rules cannot be edited. ',
	'Update Failure': 'Information about the current webpage is unavailable due to a bug with Safari. Reloading the page should resolve the issue.', // NEW?
	/** /ERRORS-ISH **/
	
	'Enter the pattern for the URL(s) you want to affect.': 'Enter the pattern for the URL(s) you want to affect.',
	'Adding a Rule For {1}': 'Adding a Rule For <b>{1}</b>', // {1} = domain name
	'Editing a Rule For {1}': 'Editing a Rule For <b>{1}</b>', // *
	
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
			
	/** DONATION STUFF - ALL NEW **/
	'Updated JavaScript Blocker {1}': 'JavaScript Blocker has been updated to version {1}',
	'Thank you for your continued use': 'Thank you for your continued use of JavaScript Blocker!',
	'Please, if you can': 'Please, if you can, show your support by making a donation of any amount. ' +
			'It would be greatly appreciated and will encourage me to create an even better product.',
	'Donation Verification': 'Donation Verification',
	'To complete the unlocking': 'To complete the unlocking process, you must have made a donation. Please note that ' +
			'it may take up to 24 hours for your PayPal email address to become active on the server.',
	'PayPal Email Address': 'PayPal Email Address',
	'An email address was not specified.': 'An email address was not specified.',
	'A donation with that email address was not found. ({1})': 'A donation with that email address was not found. ({1})',
	'The maximum number ({1})': 'The maximum number of activations has been used for that email address. ({1})',
	'Your donation has been verified': 'Your donation has been verified and all features have been unlocked.',
	'You may unlock {1}': 'You may unlock JavaScript Blocker on {1} more copies of Safari.',
	'Thanks for your support!': 'Thanks for your support!',
	'All features are already unlocked.': 'All features are already unlocked.',
	'Donation Required': 'A verified donation is required to use that feature. Click <b>Unlock All Features</b> from the main window to do so.',
	"I can't donate": "I can't donate",
	'What donation?': 'What donator-only features are there?',
	'You cannot use JavaScript Blocker': 'You cannot use JavaScript Blocker with expert features enabled until you have made a donation and had it verified.',
	'Either disable expert': 'Either disable expert features or click <b>{1}</b> below to verify your donation.',
	/** /DONATION **/
	
	/** SCRIPT INFO STUFF - ALL NEW **/
	'No information available.': 'No information available.',
	'Most likely not required for proper website functionality.': 'Most likely not required for proper website functionality.',
	'Probably required for proper website functionality.': 'Probably required for proper website functionality.',
	'Not known if required for proper website functionality.': 'Not know if required for proper website functionality.'
	/** /SCRIPT **/
};