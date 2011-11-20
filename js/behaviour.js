/***************************************
 * @file js/behaviour.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 * @version 1.2.7-1
 ***************************************/

"use strict";

var Behaviour = {
	last_submit: 0,
	url: 'http://lion.toggleable.com:160/jsblocker/',
	logger: {
		log: [],
		actions: {},
		timers: {}
	},
	_times: [],
	timer: function (data) {
		return this._times.push([data, +new Date]) - 1;
	},
	timerEnd: function (index) {
		var item = this._times.splice(index, 1)[0],
			time = +new Date - item[1];
			
		this.logger.timers[item[0] + '--' + JavaScriptBlocker.utils.id()] = time;
		
		return time;
	},
	action: function (data) {
		this.logger.actions[data] = (data in this.logger.actions) ? this.logger.actions[data] + 1 : 1;
	},
	log: function () {
		this.logger.log.push($.makeArray(arguments).join(' '));
	},
	
	/**
	 * Tracks number of installs
	 */
	installed: function () {
		$.ajax({
			url: this.url + 'installed.php',
			dataType: 'text',
			timeout: 10000,
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
			url: this.url + 'submit.php',
			dataType: 'text',
			type: 'POST',
			timeout: 10000,
			data: {
				identifier: window.localStorage.getItem('BehaviourIdentifier'),
				data: JSON.stringify(this.logger, null, "\t")
			},
			success: function (data) { data === '1' ? cb_success.call(this, data) : cb_fail.call(this, data); },
			error: function (data) { cb_fail.call(this, data.status); }
		});
	}
};