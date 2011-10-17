"use strict";

var Poppy = function (x, y, content, cb) {
	this.removeOnly = $.makeArray(arguments).length === 0;
	this.callback = (cb && typeof cb == 'function') ? cb : $.noop;
	this.popover = safari.extension.toolbarItems[0].popover.contentWindow.document;
	this.p = $(this.popover.body);
	
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
	
	return this;
};

Poppy.prototype = {
	_time: 0.3,
	_dT: null,
	_cT: null,
	_sT: null,
	s: '#setup, #main, #rules-list',
	e: '#poppy',
	c: '#poppy-content',
	a: '#poppy-arrow',
	init: function () {
		this._time *= JavaScriptBlocker.speedMultiplier;
		var self = this;
		clearTimeout(this.cT);
		if ($(this.e, this.p).length)
			return this.remove((this.removeOnly !== false) ? $.noop : this.create);
		return (this.removeOnly !== false) ? false : setTimeout($.proxy(self.create, this), 1);
	},
	remove: function (cb) {
		var self = this;
		clearTimeout(this._dT);
		this.p.find(this.e).css({
			opacity: 0,
			WebkitTransitionDuration: (this._time / 2) + 's',
		});
		return (this._dT = setTimeout(function () {
			$(self.e, self.p).remove();
			setTimeout($.proxy(cb, self), 5);
		}, (this._time / 2) * 1000));
	},
	create: function () {
		if ($(this.e, this.p).length) $(this.e, this.p).remove();
		var self = this;
		
		var eC = '<div id="' + this.e.substr(1) + '"></div>',
			cC = '<div id="' + this.c.substr(1) + '"></div>',
			aC = '<img id="' + this.a.substr(1) + '" src="images/arrow-mask.png" alt=""/>';
		
		$(this.s, this.p).unbind('scroll').scroll(function () {
			new Poppy();
			$(self.s, self.p).unbind('scroll');
		});
		
		var m = this.p.append(eC)
			.find(this.e).append(cC)
			.find(this.c).append(this.content)
			.end()
			.append(aC);
			
		clearTimeout(this._cT);
		clearTimeout(this._sT);
		
		var points = this.calcPoints(), left;
		
		if (points.arrow.bottom == 'auto') $(this.a, m).attr('src', 'images/arrow-mask-reverse.png');
		
		this.callback.call($(this.e, this.p));
		
		if (points.overflow)
			left = points.main.left;
		else if (points.underflow)
			left = 10;
		else
			left = $(this.a, this.p).width() / 2 + ((points.main.left + points.arrow.left) - m.width() / 2) - 4;
		
		m.css({
			WebkitTransitionProperty: '-webkit-transform, opacity, bottom, left',
			WebkitTransitionDuration: '0s',
			WebkitTransitionTimingFunction: 'ease-in',
			WebkitTransform: 'scale(0)',
			WebkitTransformOrigin: (points.arrow.left + 15) + 'px ' + ((points.main.bottom === 'auto') ? '0%' : '100%'),
			opacity: 0.3,
			left: left,
			bottom: points.main.bottom, /*(points.main.bottom - $(self.a, self.p).outerHeight() * 2),*/
			top: points.main.top
		});
		
		this._cT = setTimeout(function () {
			m.css({
				bottom: points.main.bottom, /*(points.main.bottom - $(self.a, self.p).height() + m.outerHeight() / 2),*/
				top: points.main.top,
				WebkitTransitionDuration: [self._time, self._time * 1.4, self._time, self._time].join('s,') + 's',
				opacity: 1,
				WebkitTransform: 'scale(1.15)'
			}).find(self.a).css({
				left: points.arrow.left,
				bottom: points.arrow.bottom,
				top: points.arrow.top
			});
			
			$('> *:not(#poppy)', self.p).unbind('click').click(function () {
				new Poppy();
			});
		}, 10);
		
		JavaScriptBlocker.utils.timer.create('interval', 'poppy_view_finish', function () {
			if (parseFloat(m.css('opacity')) < 0.71) return false;
			
			JavaScriptBlocker.utils.timer.delete('interval', 'poppy_view_finish');
			
			m.css({
				bottom: points.main.bottom,
				top: points.main.top,
				left: points.main.left,
				WebkitTransform: 'scale(1)',
				WebkitTransitionDuration: self._time + 's',
				WebkitTransitionTimingFunction: 'ease',
				width: m.width(),
				height: m.height()
			});
		}, 1);
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
		};
		
		var max_width = this.p.width() + this.p.scrollLeft();
		var base_width = max_width - this.p.width();
		
		var max_height = this.p.height() + this.p.scrollTop();
		var base_height = max_height - this.p.height();
		
		var my_width = $(this.e, this.p).outerWidth();
		var my_height = $(this.e, this.p).outerHeight() + 15;
		
		var half_arrow = $(this.a, this.p).outerWidth() / 2;
				
		if (this.center.x - my_width / 2 <= base_width) { // If overflow on left side
			o.main.left = base_width;
			o.arrow.left = this.center.x - half_arrow - base_width
			
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