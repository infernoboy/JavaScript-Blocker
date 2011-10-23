/***************************************
 * @file js/behaviour.js
 * @author Travis Roman (travis@toggleable.com)
 * @project JavaScript Blocker (http://javascript-blocker.toggleable.com)
 * @version 1.2.4
 ***************************************/

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
	
	/**
	 * Tracks number of installs
	 */
	installed: function () {
		$.ajax({
			url: this.url + 'installed.php',
			dataType: 'text',
			data: {
				identifier: window.localStorage.getItem('BehaviourIdentifier')
			},
			success: function (data) { },
			error: function (data) { }
		});
	},
	
	/**
	 * Submits anonymous usage information about JS Blocker
	 *
	 * @param {function} cb_success Callback to call if submission was successful, not necessarily completed
	 * @param {function} cb_fail Callback called when submission fails
	 */
	submit: function (cb_success, cb_fail) {
		this.last_submit = +new Date;
		
		$.ajax({
			url: this.url + '/submit.php',
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