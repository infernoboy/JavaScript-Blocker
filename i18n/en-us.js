/***************************************
 * @file i18n/en-us.js
 * @author Travis Roman (travis@toggleable.com)
 * @project JavaScript Blocker (http://javascript-blocker.toggleable.com)
 * @version 1.2.6-3
 ***************************************/

Strings['en-us'] = {
	'JavaScript Blocker': 'JavaScript Blocker',
	'Thanks for using {1}': 'Thanks for using {1}!',
	'Which mode would you like to run in?': 'Which mode would you like to run in? ' +
			'This setting can be changed at any time from the extensions pane ofthe Safari preferences.',
	'All Domains': 'All Domains',
	'Page:': 'Page:',
	'Allow on': 'Allow on…',
	'Block on': 'Block on…',
	'Main Page': 'Main Page',
	'Inline Frame Pages': 'Inline Frame Pages',
	'Allowed:': 'Allowed:',
	'Blocked:': 'Blocked:',
	'Unblocked:': 'Unblocked:',
	'Disclaimer.': 'This tool only blocks scripts when they are loaded from an external file or a data URI. ' +
		'What this means is that any scripts that are within the page itself can still run. ' +
		'Unfortunately this is a limitation of the Safari extension design, not mine.',
	
	/** BUTTONS & LABELS **/
	'Edit': 'Edit',
	'Done Editing': 'Done Editing',
	'Remove': 'Remove',
	'Beautify Script': 'Beautify Script',
	'Done': 'Done',
	'{1} matches': '{1} matches',
	'Allow': 'Allow',
	'Allowing Mode': 'Allowing Mode',
	'Allow All': 'Allow All',
	'Block All': 'Block All',
	'Block': 'Block',
	'Blocking Mode': 'Blocking Mode',
	'View': 'View',
	'Disable': 'Disable',
	'Delete': 'Delete',
	'Restore': 'Restore',
	'Save': 'Save',
	'Show Rules': 'Show Rules',
	'Edit Rule': 'Edit Rule',
	'New Rule': 'New Rule',
	'Restore Rules': 'Restore Rules',
	'Restore Rule': 'Restore Rule',
	'Remove Rules For {1}': 'Remove Rules For <b>{1}</b>',
	'Do you want to completely remove all rules for this domain?': 'Do you want to completely remove all rules for this domain?',
	'Keep in mind that if automatic rules are enabled, rules will be recreated if you visit the webpage again.':
			'Keep in mind that if automatic rules are enabled, rules will be recreated if you visit the webpage again.',
	'Close Rules List': 'Close Rules List',
	'Close': 'Close',
	'Delete Expanded Rules': 'Delete Expanded Rules',
	'Color Key': 'Color Key',
	'All Rules': 'All Rules',
	'Active Rules': 'Active Rules',
	'Continue': 'Continue',
	'View Script': 'View Script',
	'New rule for {1}': 'New rule for <b>{1}</b>', // {1} = domain name
	'All': 'All',
	'Collapsed': 'Collapsed',
	'Expanded': 'Expanded',
	'Collapse All': 'Collapse All',
	'Expand All': 'Expand All',
	'Enable JavaScript Blocker': 'Enable JavaScript Blocker',
	'Disable JavaScript Blocker': 'Disable JavaScript Blocker',
	'Show {1} more': 'Show {1} more', // {1} = number of hidden items
	'Submit Anonymous Usage Information': 'Submit Anonymous Usage Information',
	
	'Normal Block': 'Normal block',
	'Normal Allow': 'Normal allow',
	'High-priority Block': 'High-priority block',
	'High-priority Allow': 'High-priority allow',
	/** /BUTTONS & LABELS */
	
	/** ERRORS-ISH **/
	'This data URI cannot be displayed.': 'This data URI cannot be displayed.',	
	'Predefined rules cannot be edited.': 'Predefined rules cannot be edited. ',
	/** /ERRORS-ISH **/
	
	/** RULE TYPES **/
	'User Defined Rule': 'User Defined Rule&mdash;Determined by color of domain header',
	'Automatic Blocking Rule': 'Automatic Blocking Rule',
	'Automatic Allowing Rule': 'Automatic Allowing Rule',
	'Blacklist/High-priority Block Rule': 'Blacklist/High-priority Block Rule',
	'Whitelist/High-priority Allow Rule': 'Whitelist/High-priority Allow Rule',
	'The last 2 rule types will override any other rule.': 'The last 2 rule types will override any other rule.',
	/** /RULE TYPES **/
	
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
	'Unblocked Script': 'Unblocked Script',
	/** /MISC HEADERS **/
	
	'The following automatic rules were disabled, thus blocking this script:': 'The following automatic rules were disabled, thus blocking this script:',
	'The following automatic rules were disabled, thus allowing this script:': 'The following automatic rules were disabled, thus allowing this script:',
	
	'Would you like to re-enable the above rule or add a new one?': 'Would you like to re-enable the above rule or add a new one?',
	'Would you like to re-enable the above rules or add a new one?': 'Would you like to re-enable the above rules or add a new one?',
	
	'The following rule(s) will be deleted or disabled:': 'The following rule(s) will be deleted or disabled:',
	'This may inadvertently affect other scripts.': 'This may inadvertently affect other scripts.',
	
	'Usage information can be submitted only once every 10 minutes.': 'Usage information can be submitted only once every 10 minutes.',
	'Usage information successfully submited.': 'Usage information successfully submited.',
	'Error occurred while submitting usage information. Please try again later.': 'Error occurred while submitting usage information. Please try again later.',
	'Error Code: {1}': 'Error Code: {1}' // {1} = reason why submission failed
};