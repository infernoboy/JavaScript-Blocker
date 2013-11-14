"use strict";

var Snapshots = function (store, purge) {
	this.purge = purge ? purge : 10;

	if (this.purge > 0) --this.purge;

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
	hash_table: {},
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

		return JB.utils.date(parseInt(id, 10), 'L, F d' + (ytn !== ytt ? ', Y' : '') + ', h:m P');
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
			keep: !!keep,
			name: null
		};

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
		var left_str = JSON.stringify(left), right_str = JSON.stringify(right),
				compare = {
					left: left in this.store ? this.store[left].data : left,
					right: right in this.store ? this.store[right].data : right
				}, swap = { left: 'right', right: 'left' },
				diff = {}, both, empty = $.isEmptyObject,
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
					} else if (compare[side][key] instanceof Object) {
						cp = this.compare(compare.left[key], compare.right[key]);

						if (!empty(cp.left)) diff.left[key] = cp.left;
						if (!empty(cp.right))	diff.right[key] = cp.right;
						if (!empty(cp.both)) both[key] = cp.both;
					} else if (compare[side][key] instanceof Array) {
						var l, ref, cp;

						for (l = 0; l < compare[side][key].length; l++) {
							ref = compare[side][key][l];

							if (ref instanceof Array || ref instanceof Object) {
								cp = this.compare(ref, compare[opp][key][l]);

								diff.left.push(cp.left);
								diff.right.push(cp.right);

								both.push(cp.both);
							} else {
								if (ref === compare[opp][key][l]) {
									both.push(ref);
								} else {
									diff[side].push(ref);
								}
							}
						}
					} else if (compare.left[key] === compare.right[key]) {
						both[key] = compare[side][key];
					} else {
						diff[side][key] = compare[side][key];
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

						diff.left.push([cp.left]);
						diff.right.push([cp.right]);

						both.push([cp.both]);
					} else {
						if (ref === compare[opp][l]) {
							both.push(ref);
						} else {
							diff[side].push(ref);
						}
					}
				}
			}
		}

		var result = { left: diff.left, right: diff.right, both: both, equal: $.isEmptyObject(diff.left) && $.isEmptyObject(diff.right) };
		
		return result;
	}
};
