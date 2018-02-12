define([
	'js/events',
	'js/renderer',
	'js/constants'
], function (
	events,
	renderer,
	constants
) {
	return {
		mappings: {
			'8': 'backspace',
			'9': 'tab',
			'13': 'enter',
			'16': 'shift',
			'17': 'ctrl',
			'27': 'esc',
			'37': 'left',
			'38': 'up',
			'39': 'right',
			'40': 'down',
			'46': 'del'
		},

		mouse: {
			button: null,
			x: 0,
			y: 0
		},
		mouseRaw: null,

		keys: {},

		init: function () {
			$(window).on('keydown', this.events.keyboard.onKeyDown.bind(this));
			$(window).on('keyup', this.events.keyboard.onKeyUp.bind(this));

			$('canvas')
				.on('mousedown', this.events.mouse.onMouseDown.bind(this))
				.on('mouseup', this.events.mouse.onMouseUp.bind(this))
				.on('mousemove', this.events.mouse.onMouseMove.bind(this));
		},

		resetKeys: function () {
			for (var k in this.keys) {
				events.emit('onKeyUp', k);
			}

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
			var down = this.keys[key];
			if (down != null) {
				if (noConsume)
					return true;
				else {
					this.keys[key] = 2;
					return (down == 1);
				}
			} else
				return false;
		},

		events: {
			keyboard: {
				onKeyDown: function (e) {
					if (e.target != document.body)
						return true;
					if ((e.keyCode == 9) || (e.keyCode == 8) || (e.keyCode == 122))
						e.preventDefault();

					var key = this.getMapping(e.which);

					if (this.keys[key] != null)
						this.keys[key] = 2;
					else {
						this.keys[key] = 1;
						events.emit('onKeyDown', key);
					}

					if (key == 'backspace')
						return false;
				},

				onKeyUp: function (e) {
					if (e.target != document.body)
						return;

					var key = this.getMapping(e.which);

					delete this.keys[key];

					events.emit('onKeyUp', key);
				}
			},

			mouse: {
				onMouseDown: function (e) {
					var el = $(e.target);
					if ((!el.hasClass('canvas')) || (el.hasClass('blocking')))
						return;

					var button = e.button;
					this.mouse.button = button;
					this.mouse.down = true;
					this.mouse.event = e;

					events.emit('onMouseDown', this.mouse);
				},

				onMouseUp: function (e) {
					var el = $(e.target);
					if ((!el.hasClass('canvas')) || (el.hasClass('blocking')))
						return;

					var button = e.button;
					this.mouse.button = null;
					this.mouse.down = false;

					events.emit('onMouseUp', this.mouse);
				},

				onMouseMove: function (e) {
					if (e)
						this.mouseRaw = e;
					else
						e = this.mouseRaw;

					if (!e)
						return;

					var el = $(e.target);
					if ((!el.hasClass('canvas')) || (el.hasClass('blocking')))
						return;

					this.mouse.x = ~~((e.offsetX + renderer.pos.x + 40) / constants.gridSize)
					this.mouse.y = ~~((e.offsetY + renderer.pos.y + 40) / constants.gridSize)

					events.emit('onMouseMove', this.mouse);
				}
			}
		}
	};
});
