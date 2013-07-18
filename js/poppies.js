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
				'<input type="button" value="', _('Continue'), '" id="donation-confirm" class="onenter" /></p>',
				'<p><a class="outside" href="http://javascript-blocker.toggleable.com/donate ">', _('Make a Donation'), '</a> <span class="label">￨</span> ',
				'<a id="unlock-free" href="javascript:void(0);">', _('Unlock Without Contributing'), '</a> <span class="label">￨</span> ',
				'<a class="outside" href="mailto:travis@toggleable.com?subject=I forgot my JavaScript Blocker activation information!&body=Help me out!">', _('Forgot'), '</a></p>'].join(''),
			onshowstart: function () {
				var did = $$('#donation-id');
				did.focus().val(zoo.me.length === 5 ? zoo.me[4] : '');
				did[0].selectionStart = 0;
				did[0].selectionEnd = did.val().length;
				
				$$('#donation-confirm').click(function (event) {
					var id = $$('#donation-id').val().substr(0, 100);
				
					$.get(zoo.url + encodeURIComponent(id) + '&install=' + encodeURIComponent(SettingStore.getItem('installID'))).success(function (data) {
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

							setTimeout(function () {
								try {
									Popover.window().location.reload();
								} catch (e) {}
							}, 3000);
						} else
							error = data;
						
						if (error)
							new Poppy(zoo.me[0], zoo.me[1], JB.poppies.verify_donation.call([zoo.me[0], zoo.me[1], zoo.me[2], error, id], main));
					}).error(function (req) {
						var text = (req.status === 0 || req.status === 404) ? 'Unable to connect to activation server at this time. The server may be down or your firewall may be blocking the connection. ' +
							'Please ensure outgoing connections to port 160 of lion.toggleable.com are allowed.' : req.statusText;

						new Poppy(zoo.me[0], zoo.me[1], JB.poppies.verify_donation.call([zoo.me[0], zoo.me[1], zoo.me[2], 'Error ' + req.status + ': ' + text, id], main));
					});
				}).siblings('#donation-id').keypress(function (e) {
					if (e.which === 13 || e.which === 3) $$('#donation-confirm').click();
				});

				$$('#unlock-free').click(function () {
					new Poppy(zoo.me[0], zoo.me[1], [
						'<p>', _('By clicking continue'), '</p>',
						'<div class="inputs">',
							'<input type="button" id="go-back" value="', _('Back'), '" /> ',
							'<input type="button" id="continue" value="', _('Continue'), '" /> ',
						'</div>'
					].join(''), function () {
						$$('#go-back').click(function () {
							$$('#unlock').click();
						}).siblings('#continue').click(function () {
							JB.donationVerified = 777;
							try {
								Popover.window().location.reload();
							} catch (e) {}
						});
					});
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
				onshowstart: $.noop,
				onshowend: $.noop,
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
						'<input id="select-type-block" type="radio" name="select-type" value="0" ', !this.hider ? (this.is_new || !(this.rtype % 2) ? 'checked' : '') : (!this.is_new ? 'disabled' : ''), '/>',
						'<label for="select-type-block"> ', _('Block'),' &nbsp;</label>',
						'<input id="select-type-allow" type="radio" name="select-type" value="1" ', this.hider && !this.is_new ? 'disabled' : (!this.hider &&  (this.is_new || this.rtype % 2) ? 'checked' : ''), '/>',
						'<label for="select-type-allow"> ', _('Allow'), ' &nbsp;</label>',
						'<input id="select-type-hide" type="radio" name="select-type" value="42" ', this.hider ? 'checked' : (!this.is_new ? 'disabled' : ''), '/>',
						'<label for="select-type-hide"> ', _('Hide'), '</label>',
					'</p>',
					'<p id="rules-temp">',
						'<input id="rule-temporary" type="checkbox"', main.collapsed('LastRuleWasTemporary') ? ' checked' : '', ' />',
						'<label for="rule-temporary">&thinsp;', _('Temporary rule'), '</label> ',
					'</p>',
					'<div class="inputs">',
						main.rules.simplified && !~this.li.data('kind').indexOf('special') ? '<textarea id="rule-proto-input" wrap="off" placeholder="Protocol" class="rule-input"></textarea> ' : '',
						'<textarea id="rule-input" wrap="off" placeholder="Rule"></textarea> ',
						'<input type="button" value="', _('Save'), '" id="rule-save" class="onenter" />',
					'</div>',
				'</div>'].join(''),
			save: function (no_refresh) {
				var n = parseInt(this.parent().prev().prev().find('input:checked').val(), 10), k = zoo.me.li.data('kind'),
						ed = $.trim($$('#domain-picker').val()), ru = $.trim(this.val()), proto = $.trim($$('#rule-proto-input').val()).toLowerCase(),
						proto = proto.length ? proto.replace(/ /g, ',') : false;

				if (!ru.length) return 0;

				if (!ed.length) ed = zoo.me.domain;
				else if (ed.toLowerCase() === _('All Domains').toLowerCase()) ed = '.*';

				main.rules.add((n === 42 && !~k.indexOf('hide_') ? 'hide_' : '') + zoo.me.li.data('kind'), ed, (proto && ru[0] !== '^' ? proto + ':' : '') + ru, n, true, $$('#rule-temporary').is(':checked'), proto.length ? proto.split(/, ?/) : false);

				if (!no_refresh) {
					Tabs.messageActive('reload');
					new Poppy();
				}
				
				return this.parent().prev().prev().find('input:checked').val();
			},
			onshowstart: function () {
				var i = $$('#poppy #rule-input').val(zoo.main.rules.with_protos(zoo.me.url).rule).focus(),
						protos = zoo.main.rules.with_protos(zoo.me.url).protos;
				
				$$('#poppy #rule-proto-input').val(protos instanceof Array ? protos.join(',') : undefined);

				$$('#poppy').keypress(function (e) {
					if (e.which === 13 || e.which === 3) {
						$(this).unbind('keypress');
						zoo.save.call(i);
						e.preventDefault();
					}
				}).find('#rule-save').click(function () {
					zoo.save.call(i);
					$(this).unbind('click');
				});
			}
		};
		
		return zoo;
	},
	current_snapshot: function (comparison) {
		var zoo = {
			me: this,
			content: [
				'<p class="misc-info">', _('Current ' + (comparison ? 'Comparison' : 'Snapshot')), '</p>',
				'<input type="button" value="', _('Merge With Current Rules'), '" id="snapshot-merge" /> ',
				'<input type="button" value="', _('Replace Current Rules'), '" id="snapshot-replace" /> ',
				!comparison ? [
					'<input type="button" value="', _('Keep'), '" id="snapshot-keep" /> ',
					'<input type="button" value="', _('Delete'), '" id="snapshot-delete" />'
				].join('') : '',
				'<div class="divider" style="margin:7px 0 6px;"></div>',
				'<input type="button" value="', _('Only in Snapshot'), '" id="compare-left" data-type="left" /> ',
				'<input type="button" value="', _('Only in My Rules'), '" id="compare-right" data-type="right" /> ',
				'<input type="button" value="', _('In Both'), '" id="compare-both" data-type="both" /> ',
				'<input type="button" value="', _('All in Snapshot'), '" id="all-rules" />',
				'<div class="divider" style="margin:7px 0 3px;"></div>',
				'<div class="inputs">',
					'<input type="button" value="', _('Close ' + (comparison ? 'Comparison' : 'Snapshot')), '" id="snapshots-current" /> ',
					'<input type="button" value="', _('Show Snapshots'), '" id="snapshots-show" />',
				'</div>'].join(''),
			onshowstart: function () {
				var kept = JB.rules.snapshots.kept(JB.rules.using_snapshot);

				$$('#snapshot-keep').val(kept ? 'Unkeep' : 'Keep');

				$$('#poppy input:not(#snapshot-delete,#snapshot-keep)').click(function () {
					new Poppy();
				});

				$$('#snapshot-replace').click(function () {
					Settings.setItem(JB.rules.which, JSON.stringify(JB.rules.rules));
					JB.rules.use_snapshot(0);

					if ($$('#rules-list').is(':visible'))
						JB.rules.show();
				}).siblings('#snapshot-merge').click(function () {
					var rules = JB.rules.current_rules;

					for (var kind in JB.rules.rules) {
						for (var domain in JB.rules.rules[kind]) {
							if (!(domain in rules[kind])) rules[kind][domain] = JB.rules.rules[kind][domain];
							else {
								for (var rule in JB.rules.rules[kind][domain])
									rules[kind][domain][rule] = JB.rules.rules[kind][domain][rule];
							}
						}
					}

					Settings.setItem(JB.rules.which, JSON.stringify(rules));
					JB.rules.use_snapshot(0);

					if ($$('#rules-list').is(':visible'))
						JB.rules.show();
				}).siblings('#snapshot-keep').click(function () {
					var id = JB.rules.using_snapshot;

					if (this.value === _('Keep'))
						JB.rules.snapshots.keep(JB.rules.using_snapshot);
					else
						if (!JB.utils.confirm_click(this)) return false;
						else JB.rules.snapshots.unkeep(JB.rules.using_snapshot);

					$$('#snapshots a[data-id="' + id + '"]').val(this.value === _('Keep') ? _('Unkeep') : _('Keep'));

					new Poppy();
				}).siblings('#snapshot-delete').click(function () {
					if (!JB.utils.confirm_click(this)) return;

					new Poppy();

					JB.rules.snapshots.remove(JB.rules.using_snapshot);
					JB.rules.use_snapshot(0);

					if ($$('#rules-list').is(':visible'))
						JB.rules.show();
				});

				$$('#compare-left, #compare-right, #compare-both').click(function () {
					new Poppy();

					var si = $$('.snapshot-info'),
							id = si.data('id'),
							compare = JB.rules.snapshots.compare(id, JB.rules.current_rules), dir = this.getAttribute('data-type'), mes,
							compare = $.extend(JB.rules.data_types, compare[dir]),
							cache_id = JB.rules.snapshots.add(compare, 1, 'Comparison Cache ' + +new Date()),
							fun = function () {
								JB.rules.show();
								JB.rules.snapshots.remove(cache_id);
							};

					JB.rules.use_snapshot(cache_id);

					if ($$('#main').is(':visible'))
						JB.utils.zoom($$('#rules-list'), null, fun);
					else
						fun();

					if (dir === 'left') mes = 'Rules Only in Snapshot: {1}';
					else if (dir === 'right') mes = 'Rules Not in Snapshot: {1}';
					else mes = 'Rules in Both Current Rules and Snapshot: {1}';

					si.show().html(_(mes, [JB.rules.snapshots.name_or_date(id)])).data('id', id);
				});

				$$('#all-rules').click(function () {
					function fun () {
						JB.rules.use_snapshot($$('.snapshot-info').data('id'));
						JB.rules.show();
					}

					if ($$('#main').is(':visible'))
						JB.utils.zoom($$('#rules-list'), null, fun);
					else
						fun();
				});

				$$('#snapshots-current').click(function () {
					JB.rules.use_snapshot(0);

					if ($$('#rules-list').is(':visible'))
						JB.rules.show();
				}).siblings('#snapshots-show').click(function () {
					$$('#time-machine').addClass('force-open').click();
				})
			}
		};

		return zoo;
	},
	backup: function (main) {
		if (!JB.donationVerified)
			return {
				content: _('Donation Required'),
				save: $.noop,
				onshowstart: $.noop,
				onshowend: $.noop,
				me: this,
				main: main
			};
		
		var zoo = {
			me: this,
			content: [
				'<p class="misc-info">', _('Backup'), '</p>',
				'<input type="button" value="', _('Export'), '" id="backup-e"> ',
				'<input type="button" value="', _('Import'), '" id="backup-i">'].join(''),
			onshowstart: function () {
				$$('#backup-e').click(function () {
					new Poppy(zoo.me.left, zoo.me.top, [
						'<textarea id="backup-export" readonly="readonly">' + JB.rules.export() + '</textarea>',
						'<p>', _('Copy above'), '</p>'].join(''), function () {
						var t = $$('#poppy textarea');
						t[0].selectionStart = 0;
						t[0].selectionEnd = t.val().length;
					});
				}).siblings('#backup-i').click(function () {
					if (JB.rules.using_snapshot) return new Poppy(zoo.me.left, zoo.me.top, _('Snapshot in use'));

					new Poppy(zoo.me.left, zoo.me.top, [
						'<textarea id="backup-import"></textarea>',
						'<p>', _('Paste your backup'), '</p>',
						'<dlv class="inputs">',
							'<input type="button" value="', _('Restore'), '" id="backup-restore" />',
						'</dlv>'].join(''), function () {
						$$('#backup-import').focus();
						$$('#backup-restore').click(function () {
							if (!JB.rules.import($$('#backup-import').val()))
								new Poppy(zoo.me.left, zoo.me.top, _('Error importing'));
							else {
								new Poppy();
								Tabs.messageActive('reload');
								$$('#rules-list-back:visible').click();
							}
						});
					});
				});
			}
		};
		
		return zoo;
	}
};
