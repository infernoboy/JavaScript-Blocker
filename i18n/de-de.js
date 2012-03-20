/***************************************
 * @file i18n/en-us.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

Strings['de-de'] = {
	'JavaScript Blocker': 'JavaScript Blocker',
	'Thanks for using {1}': 'Vielen Dank für das verwenden {1}!',
	'Setup:Simple Mode': 'Zeige Hostnamen statt individuellen Scripten, vergleichbar mit ' +
			'<a href="http://noscript.net/">NoScript</a> für Firefox',
	'Setup:Simple Desc': 'Diese Option deaktiviert die erweiterten Funktionen von {1}, dafür wird die Benutzung aber einfacher. Möchtest du mit ' +
			'die erweiteten Funktionen benutzen, aktiviere einfach den Expertenmodus über die Einstellungen dieses Plugins.',
	'All Domains': 'Alle Domains',
	'Page:': 'Seite:',
	'Add rule for': 'Regel hinzufügen für…',
	'Main Page': 'Startseite',
	'Inline Frame Pages': 'Seiten mit eingebauten Frame',
	'Custom Frame': '(Nicht-URL basierender Frame)',
	'Allowed:': 'Erlaubt:',
	'Blocked:': 'Blockiert:',
	'Unblocked:': 'Unblockierbar:',
	'Disclaimer.': 'Hinweis: Diese Erweiterung blockiert nur Scripte, wenn sie von eine externen Datei oder oder einer Daten URI geladen wird. ' +
		'Damit ist gemeint das Scripte die innerhalb der selben Seite geladen werden, weiterhin funktionieren. ' +
		'Dies ist eine Beschränkung die den Richtlinen der Plugingestaltung von Safari unterliegen und somit nicht von mir ausgeht.',
	
	/** BUTTONS & LABELS **/
	'?': '?',
	'Edit': 'Bearbeiten',
	'Done Editing': 'Fertig',
	'Remove': 'Entfernen',
	'Beautify Script': 'Script verschönern',
	'Done': 'Fertig',
	'{1} matches': '{1} Treffer',
	'Allow': 'Erlauben',
	'Allow All': 'Alle erlauben',
	'Block All': 'Alle blockieren',
	'Block': 'Blockieren',
	'Block scripts manually': 'Scripte zulassen, welche von der selben Domain stammen',
	'Finish Setup': 'Einstellungen beenden',
	'View': 'Zeige',
	'Disable': 'Deaktivieren',
	'Delete': 'Löschen',
	'Restore': 'Wiederherstellen',
	'Save': 'Sichern',
	'Show Rules': 'Regeln zeigen',
	'Edit Rule': 'Regeln bearbeiten',
	'New Rule': 'Neue Regel',
	'Restore/Delete Rules': 'Regeln wiederherstellen/löschen',
	'Restore Rule': 'Regel wiederherstellen',
	'Restore Rules': 'Regeln wiederherstellen',
	'Delete Rule': 'Regel löschen',
	'Delete Rules': 'Regeln löschen',
	'Remove Rules For {1}': 'Regeln löschen für <b>{1}</b>',
	'Do you want to completely remove all rules for this domain?': 'Möchtest du wirklich alle vorhandenen Regeln für diese Domain löschen?',
	'Keep in mind that if automatic rules are enabled, rules will be recreated if you visit the webpage again.':
			'Bedenke: Automatische Regeln sind aktiv. Die Regeln werden erneut erstellt, sobald du die Internetseite erneut aufrufst.',
	'Close Rules List': 'Schließe',
	'Close': 'Schließen',
	'Reinstall Whitelist & Blacklist': 'Whitelist & Blacklist erneut installieren',
	'Whitelist and blacklist rules have been reinstalled.': 'Whitelist und Blacklist Regeln wurden erneut installiert.',
	'Color Key': 'Schlüsselfarbe',
	'All Rules': 'Alle Regeln',
	'Active Rules': 'Aktive Regeln',
	'Continue': 'Fortsetzen',
	'View Script': 'Zeige Script',
	'New rule for {1}': 'Neue Regel für <b>{1}</b>', // {1} = domain name
	'All': 'Alle',
	'State:': 'Regel-Zustand:',
	'Any': 'Beliebig',
	'Enabled': 'Aktiviert',
	'Disabled': 'Deaktiviert',
	'Collapsed': 'Gekürzt',
	'Expanded': 'Erweitert',
	'Collapse All': 'Gekürzte Ansicht',
	'Expand All': 'Erweiterte Ansicht',
	'Enable JavaScript Blocker': 'Aktiviere JavaScript Blocker',
	'Disable JavaScript Blocker': 'Deaktiviere JavaScript Blocker',
	'Show {1} more': 'Zeige {1} mehr', // {1} = number of hidden items
	'Help': 'Hilfe',
	'Project Page': 'Projektseite',
	'Understood': 'Verstanden',
	'Reset JS Blocker': 'JS Blocker zurücksetzen',
	'Leave Settings Alone': 'Einstellungen alleinstehend lassen',
	
	'Normal Block': 'Normales blockieren',
	'High-priority Block': 'Geblockt nach hoher Priorität',
	'High-priority Allow': 'Erlaubt nach hoher Priorität',
	/** /BUTTONS & LABELS */
	
	/** ERRORS-ISH **/
	'This data URI cannot be displayed.': 'Diese Daten URI konnte nicht angezeigt werden.',	
	'Predefined rules cannot be edited.': 'Vordefinierte Regeln können nicht bearbeitet werden. ',
	/** /ERRORS-ISH **/
	
	/** RULE TYPES **/
	'Normal Blocking Rule': 'Benutzerdefinierte Regel&mdash;Bemessen nach Farbe der Kopfzeile',
	'Automatic Blocking Rule': 'Automatisches blockieren von Regeln',
	'Disabled Automatic Blocking Rule': 'Deaktiviere automatisches blockieren von Regeln',
	'Automatic Allowing Rule': 'Automatisches erlauben von Regeln',
	'Disabled Automatic Allowing Rule': 'Deaktiviere automatisches erlauben von Regeln',
	'Blacklist/High-priority Block Rule': 'Blacklist/High-priority Block Rule',
	'Whitelist/High-priority Allow Rule': 'Whitelist/High-priority Allow Rule',
	'The last 2 rule types will override any other rule.': 'Die letzten beiden Regelkonfigurationen überschreiben alle anderen Regeln.',
	/** /RULE TYPES **/
	
	'Enter the pattern for the URL(s) you want to affect.': 'Gebe ein Muster für URL\'s ein, das angewendet werden soll.',
	'Adding a Rule For {1}': 'Hinzufügen einer Regel für <b>{1}</b>', // {1} = domain name
	'Editing a Rule For {1}': 'Bearbeiten einer Regel für <b>{1}</b>', // *
	'Rule succesfully edited.': 'Regel erfolgreich bearbeitet.',
	'Rule succesfully added for {1}': 'Regel erfolgreich hinzugefügt für <b>{1}</b>', // {1} = domain name
	'Changes will appear when you reload the rules list.': 'Änderungen werden erscheinen, wenn du die Regelliste erneut lädst.',
	'Loading script': 'Lade Script&hellip;',
	'Loading rules': 'Lade Regeln&hellip;',
	'Submitting': 'Übermittel&hellip;',
	'Domains': 'Domains',
	
	/** MISC HEADERS **/
	'{1} domain, {2} rule': '{1} Domain, {2} Regel', // {1} = number of domains in list, {2} = number of rules in list
	'{1} domain, {2} rules': '{1} Domain, {2} Regeln', // *
	'{1} domains, {2} rule': '{1} Domains, {2} Regel', // *
	'{1} domains, {2} rules': '{1} Domains, {2} Regeln', // *
	'Unblockable Script': 'Unblockierbares Script',
	/** /MISC HEADERS **/
	
	'The following rule is blocking this item:': 'Die folgende Regel blockiert dieses Objekt:',
	'The following rules are blocking this item:': 'Die folgenden Regelen blockieren dieses Objekt:',
	'The following rule is allowing this item:': 'Die folgende Regel erlaubt dieses Objekt:',
	'The following rules are allowing this item:': 'Die folgenden Regeln erlauben dieses Objekt:',
	
	'Would you like to delete it, or add a new one?': 'Möchtest du dies löschen oder ergänzen?',
	'Would you like to delete them, or add a new one?': 'Möchtest du diese löschen oder ergänzen?',
	'Would you like to restore it, or add a new one?': 'Möchtest du dies wiederherstellen oder ergänzen?',
	'Would you like to restore them, or add a new one?': 'Möchtest du diese wiederherstellen oder ergänzen?',
	'Would you like to restore/delete them, or add a new one?': 'Möchtest du diese wiederherstellen/löschen oder ergänzen?',
	'Automatic rules will be restored instead of deleted.': 'Automatische Regeln werden nach dem löschen wiederhergestellt.',
	
	'The following rule(s) would be deleted or disabled:': 'Die folgende(n) Regel(n) werden gelöscht oder deaktiviert:',
	'This may inadvertently affect other scripts.': 'Dies kann negative Auswirkungen auf andere Scripte haben.',
	'You can also create a high-priority rule to affect just this one.': 'Du kannst auch eine Regel mit hoher Priorität anlegen, welche sich nur auf diese auswirkt.',
	'Would you like to reset JavaScript Blocker to its default settings?': 'Möchtest du den JavaScript Blocker zum Originalzustand zurück setzen?',
	'Caution: This will remove all rules!': '<b>Achtung:</b> Dies wird <b>alle</b> Regeln löschen!',
	
	'Restart Safari': 'Es wird empfohlen Safari neu zustarten, damit alle Änderungen korrekt funktionieren.',
	
	/** DONATION STUFF **/
	'Donation Verification': 'Nachweis der Spende',
	'Your donation has been verified': 'Ihre Spende wurde überprüft und alle Funktionen wurden entsperrt.',
	'Thanks for your support!': 'Ihre Spende wurde überprüft und alle Funktionen wurden entsperrt.',
	'Unlock': 'Alle Funktionen freizuschalten',
	'To complete the unlocking': 'Um die Freischaltung abzuschließen, müssen Sie eine Spende gemacht haben. Bitte beachten Sie, dass es dauern kann bis zu 24 Stunden für Ihre Spende auf dem Server angezeigt werden.',
	"I can't donate": 'Ich kann nicht spenden',
};