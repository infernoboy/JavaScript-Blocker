"use strict";

var Behaviour = {
	last_submit: 0,
	url: 'http://lion.toggleable.com:160/jsblocker/',
	logger: {
		actions: {},
		timers: []
	},
	_times: [],
	timer: function (data) {
		return this._times.push([data, +new Date]) - 1;
	},
	timerEnd: function (index) {
		var item = this._times.splice(index, 1)[0],
			time = +new Date - item[1];
		
		this.logger.timers.push([item[0], time]);
		
		return time;
	},
	action: function (data) {
		var p;
		if (data in this.logger.actions) p = this.logger.actions[data];
		else p = 0;
		this.logger.actions[data] = p + 1;
	},
	installed: function () {
		$.ajax({
			url: 'http://lion.toggleable.com:160/jsblocker/installed.php',
			dataType: 'text',
			data: {
				identifier: window.localStorage.getItem('BehaviourIdentifier')
			},
			success: function (data) { },
			error: function (data) { }
		});
	},
	submit: function (cb_success, cb_fail) {
		this.last_submit = +new Date;
		
		$.ajax({
			url: 'http://lion.toggleable.com:160/jsblocker/submit.php',
			dataType: 'text',
			type: 'POST',
			data: {
				identifier: window.localStorage.getItem('BehaviourIdentifier'),
				data: JSON.stringify(this.logger, null, "\t")
			},
			success: function (data) { data === '1' ? cb_success.call(this, data) : cb_fail.call(this, data); },
			error: function (data) { cb_fail.call(this, data.status); }
		});
	}
};