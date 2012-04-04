/***************************************
 * @file js/poppy.js
 * @author Travis Roman (travis@toggleable.com)
 * @package JavaScript Blocker (http://javascript-blocker.toggleable.com)
 ***************************************/

"use strict";

/**
 * Creates the mini popover bubbles.
 *
 * @param {number} x The left position of poppy
 * @param {number} y The top position of poppy
 * @param {string|jQuery.Element} content Content to be displayed in poppy
 * @param {function|null|undefined} cb A callback called as soon as the content is placed in a poppy
 * @param {function|null|undefined} cb2 A callback called when the popover finishes displaying
 * @param {number|null|undefined} time Animation speed of popover in seconds
 */
var Poppy = function (x, y, content, cb, cb2, time, modal) {
	if (content !== null && typeof content === 'object' && ('content' in content)) {
		try {
			var temporary = content.content;
			cb = content.callback || $.noop;
			cb2 = content.callback2 || $.noop;
			time = typeof content.time === 'number' ? content.time : null;
			modal = content.modal || null;
		} catch (e) { }
		
		content = temporary;
	}
	
	this.removeOnly = $.makeArray(arguments).length === 0 || x === null;
	this.callback = (cb && typeof cb == 'function') ? cb : $.noop;
	this.callback2 = (cb2 && typeof cb2 == 'function') ? cb2 : $.noop;
	this.popover = safari.extension.toolbarItems[0].popover.contentWindow.document;
	this.p = $(this.popover.body);
	
	this._time = typeof time === 'number' ? time : 0.3;
	
	if (!this.removeOnly) {
		this.center = {
			x: x,
			y: y
		};
		this.content = content;	
	} else {
		this.center = { x: 0, y: 0 };
		this.content = '';
	}

	this.init();
	
	if (modal) _$('#modal').fadeIn(this._time * 1000);
	else _$('#modal').fadeOut(this._time * 1000);
	
	return this;
};

Poppy.prototype = {
	_dT: null,
	s: '#setup, #main, #rules-list, #misc',
	e: '#poppy',
	c: '#poppy-content',
	a: '#poppy-arrow',
	init: function () {
		this._time *= JavaScriptBlocker.speedMultiplier;

		if ($(this.e, this.p).length)
			return this.remove((this.removeOnly !== false) ? $.noop : this.create);

		return (this.removeOnly !== false) ? false : JavaScriptBlocker.utils.zero_timeout($.proxy(this.create, this));
	},
	remove: function (cb) {
		var self = this;

		this.p.find(this.e).css({
			opacity: 0.7,
			WebkitTransitionDuration: (this._time * .5) + 's',
			WebkitTransform: 'scale(0)'
		}).one('webkitTransitionEnd', { s: this, c: cb }, function (event) {
			var d = event.data;
			
			$(d.s.e, d.s.p).remove();
			
			JavaScriptBlocker.utils.zero_timeout($.proxy(d.c, d.s));
			
			if (d.s.removeOnly) {
				JavaScriptBlocker.utils.zero_timeout(d.s.callback);
				JavaScriptBlocker.utils.zero_timeout(d.s.callback2);
			}
		});
	},
	create: function () {
		if ($(this.e, this.p).length) $(this.e, this.p).remove();
		
		var self = this,
				eC = '<div id="' + this.e.substr(1) + '"></div>',
				cC = '<div id="' + this.c.substr(1) + '"></div>',
				aC = '<img id="' + this.a.substr(1) + '" src="images/arrow-mask' + (JavaScriptBlocker.theme.indexOf('default') !== 0 ? '-' + JavaScriptBlocker.theme : '') + '.png" alt=""/>';
		
		$(this.s, this.p).one('scroll', function () {
			new Poppy(null, null, null, null, null, 0.5);
		});
		
		var m = this.p.append(eC)
				.find(this.e).append(cC)
				.find(this.c).append(this.content)
				.end()
				.append(aC);
		
		this.callback.call($(this.e, this.p));
			
		var points = this.calcPoints(), left;
		
		if (points.arrow.bottom == 'auto') $(this.a, m).attr('src', 'images/arrow-mask-reverse' + (JavaScriptBlocker.theme !== 'default' ? '-' + JavaScriptBlocker.theme : '') + '.png');
		
		m.css({
			WebkitTransitionProperty: '-webkit-transform, opacity',
			WebkitTransitionDuration: '0s',
			WebkitTransitionTimingFunction: 'ease-in',
			WebkitTransform: 'scale(0)',
			WebkitTransformOrigin: (points.arrow.left + 15) + 'px ' + ((points.main.bottom === 'auto') ? '-5%' : '105%'),
			opacity: 0.3,
			left: points.main.left,
			bottom: points.main.bottom,
			top: points.main.top,
			width: m.width(),
			height: m.height()
		});
		
		JavaScriptBlocker.utils.zero_timeout(function (self, m, points) {
			m.css({
				WebkitTransitionDuration: [self._time, self._time * 1.4, self._time, self._time].join('s,') + 's',
				opacity: 1,
				WebkitTransform: JavaScriptBlocker.speedMultiplier < 1 ? 'scale(1)' : 'scale(1.15)'
			}).find(self.a).css({
				left: points.arrow.left,
				bottom: points.arrow.bottom,
				top: points.arrow.top
			});
			
			$('> *:not(#poppy):not(#modal)', self.p).one('click', function () {
				new Poppy();
			});
		}, [this, m, points]);

		m.one('webkitTransitionEnd', { s: self, m: m }, function (event) {
			var d = event.data;
			
			d.s.callback2.call($(d.s.e, d.s.p));
		
			d.m.css({
				WebkitTransform: 'scale(1)',
				WebkitTransitionDuration: d.s._time + 's',
				WebkitTransitionTimingFunction: 'ease'
			});
		});
	},
	calcPoints: function () {
		var o = {
					underflow: false,
					overflow: false,
					arrow: {
						left: 0,
						bottom: -$(this.a, this.p).height(),
						top: 'auto'
					},
					main: {
						left: 0,
						bottom: (this.p.height() - this.center.y) + $(this.a, this.p).height(),
						top: 'auto'
					}
				},
				max_width = this.p.width() + this.p.scrollLeft(),
				base_width = max_width - this.p.width(),

				max_height = this.p.height() + this.p.scrollTop(),
				base_height = max_height - this.p.height(),

				my_width = $(this.e, this.p).outerWidth(),
				my_height = $(this.e, this.p).outerHeight() + 15,

				half_arrow = $(this.a, this.p).outerWidth() / 2;
				
		if (this.center.x - my_width / 2 <= base_width) { // If overflow on left side
			o.main.left = base_width;
			o.arrow.left = this.center.x - half_arrow - base_width;
			
			if (o.arrow.left < half_arrow / 2) o.arrow.left = half_arrow - 10;
			
			o.underflow = true;
		} else if (this.center.x + my_width / 2 > max_width) { // If overflow on right side
			o.main.left = max_width - my_width;
			o.arrow.left = this.center.x - o.main.left - half_arrow;
				
			if (o.arrow.left >= my_width - half_arrow * 2) o.arrow.left = my_width - half_arrow * 2 - 5;
			
			o.overflow = true;
		} else { // If fits
			o.main.left = this.center.x - (my_width / 2);
			o.arrow.left = my_width / 2 - half_arrow;
		}
		
		if (this.center.y - my_height <= base_height) { // If overflow on top side
			o.main.bottom = 'auto';
			o.main.top = this.center.y + half_arrow + 3;
			o.arrow.top = o.arrow.bottom;
			o.arrow.bottom = 'auto';
		}
		
		return o;
	}
}