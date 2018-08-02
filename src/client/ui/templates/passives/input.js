define([
	'js/system/events'
], function (
	events
) {
	return {
		axes: {
			horizontal: {
				negative: ['left', 'a', 'q', 'z'],
				positive: ['right', 'd', 'e', 'c']
			},
			vertical: {
				negative: ['up', 'w', 'q', 'e'],
				positive: ['down', 's', 'x', 'z', 'c']
			}
		},

		mappings: {
			8: 'backspace',
			9: 'tab',
			13: 'enter',
			16: 'shift',
			17: 'ctrl',
			27: 'esc',
			37: 'left',
			38: 'up',
			39: 'right',
			40: 'down',
			46: 'del',

			//hacks for mac cmd key
			17: 'ctrl',
			224: 'ctrl',
			91: 'ctrl',
			93: 'ctrl'
		},

		mouse: {
			button: null,
			x: 0,
			y: 0
		},
		mouseRaw: null,

		keys: {},

		enabled: true,

		init: function (el) {
			el
				.on('mousedown', this.events.mouse.mouseDown.bind(this))
				.on('mouseup', this.events.mouse.mouseUp.bind(this))
				.on('mousemove', this.events.mouse.mouseMove.bind(this));
		},

		resetKeys: function () {
			for (let k in this.keys) 
				events.emit('onKeyUp', k);

			this.keys = {};
		},

		getMapping: function (charCode) {
			if (charCode >= 97)
				return (charCode - 96).toString();

			return (
				this.mappings[charCode] ||
				String.fromCharCode(charCode).toLowerCase()
			);
		},

		isKeyDown: function (key, noConsume) {
			let down = this.keys[key];
			if (down != null) {
				if (noConsume)
					return true;
				
				this.keys[key] = 2;
				return (down == 1);
			} return false;
		},
		getAxis: function (name) {
			let axis = this.axes[name];
			if (!axis)
				return 0;

			let result = 0;

			for (var i = 0; i < axis.negative.length; i++) {
				if (this.keys[axis.negative[i]]) {
					result--;
					break;
				}
			}

			for (var i = 0; i < axis.positive.length; i++) {
				if (this.keys[axis.positive[i]]) {
					result++;
					break;
				}
			}

			return result;
		},

		events: {
			keyboard: {
				keyDown: function (e) {
					if (!this.enabled)
						return;

					if (e.target != document.body)
						return true;
					if ((e.keyCode == 9) || (e.keyCode == 8) || (e.keyCode == 122))
						e.preventDefault();

					let key = this.getMapping(e.which);

					if (this.keys[key] != null)
						this.keys[key] = 2;
					else {
						this.keys[key] = 1;
						events.emit('onKeyDown', key);
					}

					if (key == 'backspace')
						return false;
					else if (e.key == 'F11')
						events.emit('onToggleFullscreen');
				},
				keyUp: function (e) {
					if (!this.enabled)
						return;

					if (e.target != document.body)
						return;

					let key = this.getMapping(e.which);

					delete this.keys[key];

					events.emit('onKeyUp', key);
				}
			},
			mouse: {
				mouseDown: function (e) {
					let el = $(e.target);
					if ((!el.hasClass('canvas')) || (el.hasClass('blocking')))
						return;

					let button = e.button;
					this.mouse.button = button;
					this.mouse.down = true;
					this.mouse.event = e;
					this.mouse.raw = e;

					events.emit('uiMouseDown', this.mouse);
				},
				mouseUp: function (e) {
					let el = $(e.target);
					if ((!el.hasClass('canvas')) || (el.hasClass('blocking')))
						return;

					let button = e.button;
					this.mouse.button = null;
					this.mouse.down = false;
					this.mouse.raw = e;

					events.emit('uiMouseUp', this.mouse);
				},
				mouseMove: function (e) {
					if (e)
						this.mouseRaw = e;
					else
						e = this.mouseRaw;

					if (!e)
						return;

					let el = $(e.target);
					if ((!el.hasClass('canvas')) || (el.hasClass('blocking')))
						return;

					this.mouse.x = e.offsetX;
					this.mouse.y = e.offsetY;

					this.mouse.raw = e;

					events.emit('uiMouseMove', this.mouse);
				}
			}
		}
	};
});
