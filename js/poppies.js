/***************************************
 * @file js/poppies.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

JavaScriptBlocker.poppies = {
	verify_donation: function (main) {
		var zoo = {
			url: 'http://lion.toggleable.com:160/jsblocker/submit.php?id=',
			me: this,
			main: main,
			content: [
				'<p class="misc-info">', _('Donation Verification'), '</p>',
				(this.length === 3) ? '<p class="error">' + this[2] + '</p>' : '',
				'<p><a class="outside" href="http://javascript-blocker.toggleable.com/donation_only">', _('What donation?'), '</a></p>',
				'<p>', _('To complete the unlocking'), '</p>',
				'<input type="text" placeholder="', _('PayPal Email Address'), '" id="donation-id" /> ',
				'<input type="button" value="', _('Continue'), '" id="donation-confirm" /> ',
				'<a class="outside" href="mailto:travis@toggleable.com?subject=I cannot donate to JavaScript Blocker, but want all the features!&body=Reason: ">', _('I can\'t donate'), '</a>'].join(''),
			callback: function () {
				_$('#donation-id').focus();
				
				_$('#donation-confirm').click(function (event) {
					var id = _$('#donation-id').val().substr(0, 100);
				
					$.get(zoo.url + escape(id)).success(function (data) {
						data = parseInt(data, 10);
									
						var error = null;
						
						switch (data) {
							case -3: error = _('An email address was not specified.'); break;
							case -2: error = _('A donation with that email address was not found. ({1})', [id.replace(/</g, '&lt;')]); break;
							case -1: error = _('The maximum number ({1})', [id.replace(/</g, '&lt;')]); break;
							case 0:
							case 1:
							case 2:
								JavaScriptBlocker.donationVerified = true;
								
								new Poppy(zoo.me[0], zoo.me[1], [
									'<p>', _('Your donation has been verified'), '</p>',
									'<p>', _('You may unlock {1}', [data]), '</p>',
									'<p>', _('Thanks for your support!'), '</p>'].join(''));
							break;
							
							default: error = data;
						}
						
						if (error)
							new Poppy(zoo.me[0], zoo.me[1], JavaScriptBlocker.poppies.verify_donation.call([zoo.me[0], zoo.me[1], error], main));
					}).error(function (req) {
						new Poppy(zoo.me[0], zoo.me[1], JavaScriptBlocker.poppies.verify_donation.call([zoo.me[0], zoo.me[1], 'Error ' + req.status + ': ' + req.statusText], main));
					});
				}).siblings('#donation-id').keypress(function (e) {
					if (e.keyCode == 13 || e.keyCode == 3) _$('#donation-confirm').click();
				});
			}
		}
		
		return zoo;
	},
	add_rule: function (main) {
		if (!JavaScriptBlocker.donationVerified)
			return {
				content: _('Donation Required'),
				save: $.noop,
				callback: $.noop,
				callback2: $.noop,
				me: this,
				main: main
			};
		
		var zoo = {
			me: this,
			main: main,
			content: [
				'<div>',
					'<p class="misc-info">', this.header, '</p>',
					'<p id="rules-radios">',
						'<input id="select-type-block" type="radio" name="select-type" value="0" checked />',
						'<label for="select-type-block"> ', _('Block'),' &nbsp;</label>',
						'<input id="select-type-allow" type="radio" name="select-type" value="1" />',
						'<label for="select-type-allow"> ', _('Allow'), '</label>',
					'</p>',
					main.donationVerified ? [
						'<p id="rules-temp">',
							'<input id="rule-temporary" type="checkbox"', parseInt(window.localStorage.LastRuleWasTemporary) ? ' checked' : '', ' />',
							'<label for="rule-temporary">&thinsp;', _('Temporary rule'), '</label> ',
						'</p>'].join('') : '',
					'<div class="inputs">',
						'<textarea id="rule-input" wrap="off" placeholder="RegExp"></textarea> ',
						'<input type="button" value="', _('Save'), '" id="rule-save" />',
					'</div>',
				'</div>'].join(''),
			save: function (no_refresh) {
				main.rules.add(_$('#domain-picker').val(), this.val(), this.parent().prev().prev().find('input:checked').val(), true, _$('#rule-temporary').is(':checked'));

				if (!no_refresh) {
					safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
					new Poppy();
				}
				
				return this.parent().prev().prev().find('input:checked').val();
			},
			callback: function () {
				var i = _$('#poppy #rule-input').val(zoo.me.url).focus();
		
				i.keypress(function (e) {
					if (e.keyCode == 13 || e.keyCode == 3) {
						zoo.save.call(i);
						e.preventDefault();
					}
				}).siblings('#rule-save').click(function () {
					zoo.save.call(i);
				});
			}
		};
		
		return zoo;
	}
};