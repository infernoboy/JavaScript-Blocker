"use strict";

var Snapshots = function (store, purge) {
	this.purge = purge ? purge : 10;

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
		if (name === undefined) return this.store[id].name;
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

		var id = +new Date(), keys = [], cid, i;

		for (cid in this.store)
			if (!this.store[cid].keep)
				keys.push(cid);

		keys.sort();
		keys.splice(-this.purge);

		for (i = 0; keys[i]; i++)
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
		var all = this.all(1), id;

		for (id in all)
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
		var c = 0, id;

		for (id in this.store) c++;

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
		return id !== undefined ? JSON.stringify(this.store[id] || {}).length : JSON.stringify(this.snapshots).length;
	},
	compare: function (left, right) {
		var compare = {
					left: left in this.store ? this.store[left].data : left,
					right: right in this.store ? this.store[right].data : right
				}, swap = { left: 'right', right: 'left' },
				diff = {}, both, empty = $.isEmptyObject, score = { left: 0, right: 0 },
				side, key, lr;

		for (lr in compare) {
			if (compare[lr] instanceof Array) diff[lr] = [];
			else if (compare[lr] instanceof Object) diff[lr] = {};
			else diff[lr] = null;
		}

		if (JSON.stringify(diff.left) !== JSON.stringify(diff.right)) return false;

		if (diff.left instanceof Object) {
			both = {};

			for (side in compare) {
				var opp = swap[side], cp;

				for (key in compare[side]) {
					if (!(key in compare[opp])) {
						diff[side][key] = compare[side][key];
						score[side]++;
					} else if (compare[side][key] instanceof Object) {
						cp = this.compare(compare.left[key], compare.right[key]);

						score.left += cp.score.left;
						score.right += cp.score.right;

						if (!empty(cp.left)) diff.left[key] = cp.left;
						if (!empty(cp.right))	diff.right[key] = cp.right;
						if (!empty(cp.both)) both[key] = cp.both;
					} else if (compare[side][key] instanceof Array) {
						var l, ref, cp;

						for (l = 0; l < compare[side][key].length; l++) {
							ref = compare[side][key][l];

							if (ref instanceof Array || ref instanceof Object) {
								cp = this.compare(ref, compare[opp][key][l]);

								score.left += cp.score.left;
								score.right += cp.score.right;

								diff.left.push(cp.left);
								diff.right.push(cp.right);
								both.push(cp.both);
							} else {
								if (ref === compare[opp][key][l]) {
									both.push(ref);
									score[side]++;
								} else {
									diff[side].push(ref);
									score[side]++;
								}
							}
						}
					} else if (compare.left[key] === compare.right[key]) {
						both[key] = compare[side][key];
						score[side]++;
					} else {
						diff[side][key] = compare[side][key];
						score[side]++;
					}
				}
			}
		} else if (diff.left instanceof Array) {
			both = [];

			for (side in compare) {
				var opp = swap[side], l, ref, cp;

				for (l = 0; l < compare[side].length; l++) {
					ref = compare[side][l];

					if (ref instanceof Array || ref instanceof Object) {
						cp = this.compare(ref, compare[opp][l]);

						score.left += cp.score.left;
						score.right += cp.score.right;

						diff.left.push([cp.left]);
						diff.right.push([cp.right]);
						both.push([cp.both]);
					} else {
						if (ref === compare[opp][l]) {
							both.push(ref);
							score[side]++;
						} else {
							diff[side].push(ref);
							score[side]++;
						}
					}
				}
			}
		}

		return { left: diff.left, right: diff.right, both: both, score: score, equal: score.left === score.right };
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
