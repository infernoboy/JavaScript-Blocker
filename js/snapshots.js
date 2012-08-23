"use strict";

var Snapshots = function (store, purge) {
	this.purge = typeof purge === 'number' ? purge : 10;

	var snapshots = Settings.getItem('Snapshots');

	this.snapshots = JSON.parse(snapshots)

	if (store && !(store in this.snapshots)) this.snapshots[store] = {};

	this.store = this.snapshots[store];

	return this;
};

Snapshots.prototype = {
	_save_throttle: null,
	_save: function () {
		clearTimeout(this._save_throttle);

		this._save_throttle = setTimeout(function (snapshots) {
			Settings.setItem('Snapshots', JSON.stringify(snapshots));
		}, 1000, this.snapshots);
	},
	_periodic: null,
	periodic: function (time, get_data, args, callback) {
		if (this._periodic) clearInterval(this._periodic[0]);

		this._periodic = [setInterval(function (self, get_data, args, callback) {
			self.add(get_data.apply(self, args), 0, 0, callback);
		}, time, this, get_data, args, callback), get_data, args, callback];

		return this;
	},
	now: function () {
		if (!this._periodic) return false;

		this.add(this._periodic[1].apply(self, this._periodic[2]), 0, 0, this._periodic[3]);

		return this;
	},
	exist: function (id) {
		return this.store.hasOwnProperty(id);
	},
	keep: function (id) {
		if (!this.exist(id)) return;

		this.store[id].keep = 1;

		this._save();

		return this;
	},
	unkeep: function (id) {
		if (!this.exist(id)) return;

		this.store[id].keep = 0;

		this._save();

		return this;
	},
	kept: function (id) {
		if (!this.exist(id)) return false;

		return !!this.store[id].keep;
	},
	name: function (id, name) {
		if (!this.exist(id)) return;
		if (typeof name === 'undefined') return this.store[id].name;
		if (name !== null && this.named(name) !== null) return false;

		this.store[id].name = name;

		this._save();

		return name;
	},
	name_or_date: function (id) {
		if (!this.exist(id)) return;
		return this.store[id].name || this.date(id);
	},
	date: function (id) {
		id = parseInt(id, 10);
		var ytn = JB.utils.date(new Date, 'y'),
				ytt = JB.utils.date(id, 'y');

		return JB.utils.date(parseInt(id, 10), 'L, F d' + (ytn !== ytt ? ', \'y' : '') + ', h:m P');
	},
	_remove_timeouts: {},
	remove_after: function (id, time_or_callback) {
		if (!this.exist(id)) return false;

		clearTimeout(this._remove_timeouts[id]);

		this._remove_timeouts[id] = setTimeout(function (self, id, callback) {
			if (typeof callback === 'function') {
				if (!callback.call(self)) return;

				clearTimeout(self._remove_timeouts[id]);
			}

			self.remove(id);
		}, typeof time === 'number' ? time : 1000, this, id, time_or_callback);
	},
	add: function (data, keep, name, callback) {
		if (this._paused) return false;

		var id = +new Date(), keys = [];

		for (var cid in this.store)
			if (!this.store[cid].keep)
				keys.push(cid);

		keys.sort();
		keys.splice(-(this.purge - 1));

		for (var i = 0; keys[i]; i++)
			delete this.store[keys[i]];

		this.store[id] = {
			data: data,
			keep: 0,
			name: null
		};

		if (keep) this.keep(id);
		if (typeof name === 'string' && name.length) this.name(id, name);
		if (typeof callback === 'function') callback.call(this, id, this.store[id]);
		
		this._save();

		return id;
	},
	_delayed: null,
	delayed_add: function (data, delay, keep, name, callback) {
		clearTimeout(this._delayed);

		this._delayed = setTimeout(function (self, data, keep, name, callback) {
			self.add(data, keep, name, callback);
		}, delay || 15000, this, data, keep, name, callback);

		return this;
	},
	load: function (id) {
		return this.exist(id) ? this.store[id].data : null;
	},
	latest: function () {
		var all = this.all(1);

		for (var id in all)
			return this.load(id);
		return false;
	},
	named: function (name) {
		for (var id in this.store)
			if (this.store[id].name === name)
				return this.load(id);
		return null;
	},
	count: function (store) {
		var c = 0;

		for (var id in this.store) c++;

		return c;
	},
	remove: function (id) {
		delete this.store[id];
		this._save();
		return this;
	},
	remove_all: function (store) {
		this.store = {};
		this._save();
		return this;
	},
	all: function (reverse) {
		return reverse ? JB.utils.sort_object(this.store, 1) : JB.utils.sort_object(this.store);
	},
	size: function (id) {
		return typeof id !== 'undefined' ? JSON.stringify(this.store[id] || {}).length : JSON.stringify(this.snapshots).length;
	},
	compare: function (left, right) {
		var cleft = left in this.store ? this.store[left].data : left, cright = right in this.store ? this.store[right].data : right,
				dleft, dright, both, empty = $.isEmptyObject, lscore = 0, rscore = 0;

		if (cleft instanceof Array) dleft = [];
		else if (cleft instanceof Object) dleft = {};
		else dleft = null;

		if (cright instanceof Array) dright = [];
		else if (cright instanceof Object) dright = {};
		else dright = null;

		if (JSON.stringify(dleft) !== JSON.stringify(dright)) return false;

		if (dleft instanceof Object) {
			both = {};

			for (var kleft in cleft)
				if (!(kleft in cright)) {
					dleft[kleft] = cleft[kleft];
					lscore++;
				} else if (cleft[kleft] instanceof Object) {
					var cp = this.compare(cleft[kleft], cright[kleft]);

					lscore += cp.left_score;
					rscore += cp.right_score;

					if (!empty(cp.left)) dleft[kleft] = cp.left;
					if (!empty(cp.right))	dright[kleft] = cp.right;
					if (!empty(cp.both)) both[kleft] = cp.both;
				} else if (cleft[kleft] instanceof Array) {
					for (var l = 0; l < cleft[kleft].length; l++) {
						var ref = cleft[kleft][l];

						if (ref instanceof Array || ref instanceof Object) {
							var cp = this.compare(ref, cright[kleft][l]);

							lscore += cp.left_score;
							rscore += cp.right_score;

							dleft.push(cp.left);
							dright.push(cp.right);
							both.push(cp.both);
						} else {
							if (ref === cright[kleft][l]) {
								both.push(ref);
								lscore++;
							} else {
								dleft.push(ref);
								lscore++;
							}
						}
					}
				} else if (cleft[kleft] !== cright[kleft]) {
					dleft[kleft] = cleft[kleft];
					lscore++;
				} else {
					both[kleft] = cleft[kleft];
					lscore++;
				}

			for (var kright in cright)
				if (!(kright in cleft)) {
					dright[kright] = cright[kright];
					rscore++;
				} else if (cright[kright] instanceof Object) {
					var cp = this.compare(cleft[kright], cright[kright]);

					lscore += cp.left_score;
					rscore += cp.right_score;

					if (!empty(cp.left)) dleft[kright] = cp.left;
					if (!empty(cp.right))	dright[kright] = cp.right;
					if (!empty(cp.both)) both[kright] = cp.both;
				} else if (cright[kright] instanceof Array) {
					for (var l = 0; l < cright[kright].length; l++) {
						var ref = cright[kright][l];

						if (ref instanceof Array || ref instanceof Object) {
							var cp = this.compare(ref, cleft[kright][l]);

							lscore += cp.left_score;
							rscore += cp.right_score;

							dleft.push(cp.left);
							dright.push(cp.right);
							both.push(cp.both);
						} else {
							if (ref === cleft[kright][l]) {
								both.push(ref);
								rscore++;
							} else {
								dright.push(ref);
								rscore++;
							}
						}
					}
				} else if (cleft[kright] !== cright[kright]) {
					dright[kright] = cright[kright];
					rscore++;
				} else {
					both[kright] = cright[kright];
					rscore++;
				}
		} else if (dleft instanceof Array) {
			both = [];

			for (var l = 0; l < cleft.length; l++) {
				var ref = cleft[l];

				if (ref instanceof Array || ref instanceof Object) {
					var cp = this.compare(ref, cright[l]);

					lscore += cp.left_score;
					rscore += cp.right_score;

					dleft.push([cp.left]);
					dright.push([cp.right]);
					both.push([cp.both]);
				} else {
					if (ref === cright[l]) {
						both.push(ref);
						lscore++;
					} else {
						dleft.push(ref);
						lscore++;
					}
				}
			}

			for (var l = 0; l < cright.length; l++) {
				var ref = cright[l];

				if (ref instanceof Array || ref instanceof Object) {
					var cp = this.compare(ref, cleft[l]);

					lscore += cp.left_score;
					rscore += cp.right_score;

					dleft.push([cp.left]);
					dright.push([cp.right]);
					both.push([cp.both]);
				} else {
					if (ref === cleft[l]) {
						both.push(ref);
						rscore++;
					} else {
						dright.push(ref);
						rscore++;
					}
				}
			}
		}

		return { left: dleft, right: dright, both: both, left_score: lscore, right_score: rscore, equal: lscore === rscore };
	},
	_paused: 0,
	pause: function (store) {
		this._paused = 1;
		return this;
	},
	resume: function (store) {
		this._paused = 0;
		return this;
	}
};
