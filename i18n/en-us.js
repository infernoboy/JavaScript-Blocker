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
	'Page:': 'Page:',
	'Add rule for': 'Add rule for…',
	'Main Page': 'Main Page',
	'Inline Frame Pages': 'Inline Frame Pages',
	'Custom Frame': '(Non-URL Based Frame)',
	'Allowed:': 'Allowed:',
	'Blocked:': 'Blocked:',
	'Unblocked:': 'Unblockable:',
	'Disclaimer.': 'This tool only blocks scripts when they are loaded from an external file or a data URI. ' +
		'What this means is that any scripts that are within the page itself can still run. ' +
		'Unfortunately this is a limitation of the Safari extension design, not mine.',
	
	/** BUTTONS & LABELS **/
	'?': '?',
	'Edit': 'Edit',
	'Done Editing': 'Done',
	'Remove': 'Remove',
	'Beautify Script': 'Beautify Script',
	'Done': 'Done',
	'{1} matches': '{1} matches',
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
	'Show Rules': 'Show Rules',
	'Edit Rule': 'Edit Rule',
	'New Rule': 'New Rule',
	'Restore/Delete Rules': 'Restore/Delete Rules',
	'Restore Rule': 'Restore Rule',
	'Restore Rules': 'Restore Rules',
	'Delete Rule': 'Delete Rule',
	'Delete Rules': 'Delete Rules',
	'Remove Rules For {1}': 'Remove Rules For <b>{1}</b>',
	'Do you want to completely remove all rules for this domain?': 'Do you want to completely remove all rules for this domain?',
	'Keep in mind that if automatic rules are enabled, rules will be recreated if you visit the webpage again.':
			'Keep in mind that if automatic rules are enabled, rules will be recreated if you visit the webpage again.',
	'Close Rules List': 'Close Rules',
	'Close': 'Close',
	'Reinstall Whitelist & Blacklist': 'Reinstall Whitelist & Blacklist',
	'Whitelist and blacklist rules have been reinstalled.': 'Whitelist and blacklist rules have been reinstalled.',
	'Color Key': 'Color Key',
	'All Rules': 'All Rules',
	'Active Rules': 'Active Rules',
	'Continue': 'Continue',
	'View Script': 'View Script',
	'New rule for {1}': 'New rule for <b>{1}</b>', // {1} = domain name
	'All': 'All',
	'State:': 'Rule State:',
	'Any': 'Any',
	'Enabled': 'Enabled',
	'Disabled': 'Disabled',
	'Collapsed': 'Collapsed',
	'Expanded': 'Expanded',
	'Collapse All': 'Collapse All',
	'Expand All': 'Expand All',
	'Enable JavaScript Blocker': 'Enable JavaScript Blocker',
	'Disable JavaScript Blocker': 'Disable JavaScript Blocker',
	'Show {1} more': 'Show {1} more', // {1} = number of hidden items
	'Help': 'Help',
	'Project Page': 'Project Page',
	'Understood': 'Understood',
	'Reset JS Blocker': 'Reset JS Blocker',
	'Leave Settings Alone': 'Leave Settings Alone',
	'Make a Donation': 'Make a Donation',
	'Maybe Later': 'Maybe Later',
	'I\'ve Donated!': 'I\'ve Donated!',
	'Unblocked Script': 'Unblockable Script',
	
	'Normal Block': 'Normal block',
	'High-priority Block': 'High-priority block',
	'High-priority Allow': 'High-priority allow',
	/** /BUTTONS & LABELS */
	
	/** ERRORS-ISH **/
	'This data URI cannot be displayed.': 'This data URI cannot be displayed.',	
	'Predefined rules cannot be edited.': 'Predefined rules cannot be edited. ',
	/** /ERRORS-ISH **/
	
	/** RULE TYPES **/
	'User Defined Rule': 'User Defined Rule&mdash;Determined by color of header',
	'Automatic Blocking Rule': 'Automatic Blocking Rule',
	'Disabled Automatic Blocking Rule': 'Disabled Automatic Blocking Rule',
	'Automatic Allowing Rule': 'Automatic Allowing Rule',
	'Disabled Automatic Allowing Rule': 'Disabled Automatic Allowing Rule',
	'Blacklist/High-priority Block Rule': 'Blacklist/High-priority Block Rule',
	'Whitelist/High-priority Allow Rule': 'Whitelist/High-priority Allow Rule',
	'The last 2 rule types will override any other rule.': 'The last 2 rule types will override any other rule.',
	/** /RULE TYPES **/
	
	'On:': 'On:',
	'Enter the pattern for the URL(s) you want to affect.': 'Enter the pattern for the URL(s) you want to affect.',
	'Adding a Rule For {1}': 'Adding a Rule For <b>{1}</b>', // {1} = domain name
	'Editing a Rule For {1}': 'Editing a Rule For <b>{1}</b>', // *
	'Rule succesfully edited.': 'Rule succesfully edited.',
	'Rule succesfully added for {1}': 'Rule succesfully added for <b>{1}</b>', // {1} = domain name
	'Changes will appear when you reload the rules list.': 'Changes will appear when you reload the rules list.',
	'Loading script': 'Loading script&hellip;',
	'Loading rules': 'Loading rules&hellip;',
	'Submitting': 'Submitting&hellip;',
	'Domains': 'Domains',
	
	/** MISC HEADERS **/
	'{1} domain, {2} rule': '{1} domain, {2} rule', // {1} = number of domains in list, {2} = number of rules in list
	'{1} domain, {2} rules': '{1} domain, {2} rules', // *
	'{1} domains, {2} rule': '{1} domains, {2} rule', // *
	'{1} domains, {2} rules': '{1} domains, {2} rules', // *
	'Unblockable Script': 'Unblockable Script',
	/** /MISC HEADERS **/
	
	'The following rule is blocking this item:': 'The following rule is blocking this item:',
	'The following rules are blocking this item:': 'The following rules are blocking this item:',
	'The following rule is allowing this item:': 'The following rule is allowing this item:',
	'The following rules are allowing this item:': 'The following rules are allowing this item:',
	
	'Would you like to delete it, or add a new one?': 'Would you like to delete it, or add a new one?',
	'Would you like to delete them, or add a new one?': 'Would you like to delete them, or add a new one?',
	'Would you like to restore it, or add a new one?': 'Would you like to restore it, or add a new one?',
	'Would you like to restore them, or add a new one?': 'Would you like to restore them, or add a new one?',
	'Would you like to restore/delete them, or add a new one?': 'Would you like to restore/delete them, or add a new one?',
	'Automatic rules will be restored instead of deleted.': 'Automatic rules will be restored instead of deleted.',
	
	'The following rule(s) would be deleted or disabled:': 'The following rule(s) would be deleted or disabled:',
	'This may inadvertently affect other scripts.': 'This may inadvertently affect other scripts.',
	'You can also create a high-priority rule to affect just this one.': 'You can also create a high-priority rule to affect just this one.',
	'Would you like to reset JavaScript Blocker to its default settings?': 'Would you like to reset JavaScript Blocker to its default settings?',
	'Caution: This will remove all rules!': '<b>Caution:</b> This will remove <b>all</b> rules!',
	
	'Restart Safari': 'You might have to restart Safari for all changes to propagate correctly.',
	
	'Update Failure': 'Information about the current webpage is unavailable due to a bug with Safari. Reloading the page should resolve the issue.',
	
	'Thank you for your continued use': 'Thank you for your continued use of JavaScript Blocker!',
	'Please, if you can': 'Please, if you can, show your support by making a donation of any amount. ' +
			'It would be greatly appreciated and will encourage me to create an even better product.',
};