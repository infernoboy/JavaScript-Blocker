var Strings = {};
var Localize = function (string, args) {
	var s;
	if (Strings[window.navigator.language])
		s = (string in Strings[window.navigator.language]) ? Strings[window.navigator.language][string] : Strings['en-us'][string] || string + '_NOT_LOCALIZED';
	s = Strings['en-us'][string] || string + '_NOT_LOCALIZED';
	
	if (args) {
		for(var i = 1; i <= args.length; i++) {
			var new_string = (typeof args[i - 1] != 'undefined') ? ((args[i - 1] === false) ? 'false' : args[i - 1]) : 'undefined';

			if(new_string instanceof Array) new_string = '[' + new_string.join(', ') + ']';
			else if(typeof new_string == 'number') new_string = new_string.toString();

			s = s.replace(new RegExp('\\{' + i + '\\}', 'g'), new_string);
		}
	}
	
	return s;
};