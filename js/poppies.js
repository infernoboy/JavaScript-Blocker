/***************************************
 * @file js/poppies.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

JB.poppies = {
	verify_donation: function (main) {
		var rem = main.trial_remaining();
		rem.push('<a class="outside" href="http://javascript-blocker.toggleable.com/donation_only">' + _('donator-only features.') + '</a>');
		var zoo = {
			url: main.baseURL + 'verify.php?id=',
			me: this,
			main: main,
			modal: this[2],
			content: [
				'<p class="misc-info">', _('Donation Verification'), '</p>',
				(this.length === 5) ? '<p class="error">' + this[3] + '</p>' : '',
				'<p>', main.trial_active() ? _('Trial remaining {1} days, {2} hours, and {3} minutes of the <b>{4}</b>', rem) :
					'<a class="outside" href="http://javascript-blocker.toggleable.com/donation_only">' + _('What donation?') + '</a>', '</p>',
				'<p>', _('To complete the unlocking'), '</p>',
				'<p><input type="text" placeholder="', _('PayPal Email Address'), '" id="donation-id" /> ',
				'<input type="button" value="', _('Continue'), '" id="donation-confirm" /></p>',
				'<p><a class="outside" href="http://javascript-blocker.toggleable.com/donate ">', _('Make a Donation'), '</a> <span class="label">￨</span> ',
				'<a class="outside" href="mailto:travis@toggleable.com?subject=I cannot donate to JavaScript Blocker, but want all the features!&body=Reason: ">', _('I can\'t donate'), '</a> <span class="label">￨</span> ',
				'<a class="outside" href="mailto:travis@toggleable.com?subject=I forgot my JavaScript Blocker activation information!&body=Help me out!">', _('Forgot'), '</a></p>'].join(''),
			callback: function () {
				var did = _$('#donation-id');
				did.focus().val(zoo.me.length === 5 ? zoo.me[4] : '');
				did[0].selectionStart = 0;
				did[0].selectionEnd = did.val().length;
				
				_$('#donation-confirm').click(function (event) {
					var id = _$('#donation-id').val().substr(0, 100);
				
					$.get(zoo.url + encodeURIComponent(id) + '&install=' + encodeURIComponent(safari.extension.settings.installID)).success(function (data) {
						var datai = parseInt(data, 10),
								error = null;
						
						if (datai < 0) {
							switch (datai) {
								case -3: error = _('An email address was not specified.'); break;
								case -2: error = _('A donation with that email address was not found.'); break;
								case -1: error = _('The maximum number'); break;

								default: error = data;
							}
						} else if (datai >= 0) {
							JB.donationVerified = id;
							JB.trialStart = -1;
							
							new Poppy(zoo.me[0], zoo.me[1], [
								'<p>', _('Your donation has been verified'), '</p>',
								'<p>', _('Thanks for your support!'), '</p>'].join(''));
						} else
							error = data;
						
						
						if (error)
							new Poppy(zoo.me[0], zoo.me[1], JB.poppies.verify_donation.call([zoo.me[0], zoo.me[1], zoo.me[2], error, id], main));
					}).error(function (req) {
						new Poppy(zoo.me[0], zoo.me[1], JB.poppies.verify_donation.call([zoo.me[0], zoo.me[1], zoo.me[2], 'Error ' + req.status + ': ' + req.statusText, id], main));
					});
				}).siblings('#donation-id').keypress(function (e) {
					if (e.keyCode == 13 || e.keyCode == 3) _$('#donation-confirm').click();
				});
			}
		}
		
		return zoo;
	},
	add_rule: function (main) {
		if (!JB.donationVerified)
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
						'<input id="select-type-block" type="radio" name="select-type" value="0" ', !this.hider ? 'checked' : (!this.is_new ? 'disabled' : ''), '/>',
						'<label for="select-type-block"> ', _('Block'),' &nbsp;</label>',
						'<input id="select-type-allow" type="radio" name="select-type" value="1" ', this.hider && !this.is_new ? 'disabled' : '', '/>',
						'<label for="select-type-allow"> ', _('Allow'), ' &nbsp;</label>',
						'<input id="select-type-hide" type="radio" name="select-type" value="42" ', this.hider ? 'checked' : (!this.is_new ? 'disabled' : ''), '/>',
						'<label for="select-type-hide"> ', _('Hide'), '</label>',
					'</p>',
					'<p id="rules-temp">',
						'<input id="rule-temporary" type="checkbox"', main.collapsed('LastRuleWasTemporary') ? ' checked' : '', ' />',
						'<label for="rule-temporary">&thinsp;', _('Temporary rule'), '</label> ',
					'</p>',
					'<div class="inputs">',
						main.rules.simplified ? '<textarea id="rule-proto-input" wrap="off" placeholder="Protocol" class="rule-input"></textarea> ' : '',
						'<textarea id="rule-input" wrap="off" placeholder="Rule"></textarea> ',
						'<input type="button" value="', _('Save'), '" id="rule-save" />',
					'</div>',
				'</div>'].join(''),
			save: function (no_refresh) {
				var n = parseInt(this.parent().prev().prev().find('input:checked').val(), 10), k = zoo.me.li.data('kind'),
						ed = $.trim(_$('#domain-picker').val()), ru = $.trim(this.val()), proto = $.trim(_$('#rule-proto-input').val()).toLowerCase(),
						swith = ru.charAt(0) === '^', ewith = ru.charAt(ru.length - 1) === '$', proto = proto.length ? proto : false;

				if (!ru.length) return 0;

				if (!ed.length) ed = zoo.me.domain;
				else if (ed.toLowerCase() === _('All Domains').toLowerCase()) ed = '.*';

				main.rules.add((n === 42 && !~k.indexOf('hide_') ? 'hide_' : '') + zoo.me.li.data('kind'), ed, ru, n, true, _$('#rule-temporary').is(':checked'), proto.length ? proto.split(/, ?/) : false);

				if (!no_refresh) {
					safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('reload');
					new Poppy();
				}
				
				return this.parent().prev().prev().find('input:checked').val();
			},
			callback: function () {
				var i = _$('#poppy #rule-input').val(zoo.me.url).focus();
				
				_$('#poppy #rule-proto-input').val(zoo.me.proto instanceof Array ? zoo.me.proto.join(',') : (zoo.me.proto ? zoo.me.proto : undefined)).keypress(function (e) {
					if (e.keyCode == 13 || e.keyCode == 3) {
						i.focus();
						e.preventDefault();
					}
				});

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
