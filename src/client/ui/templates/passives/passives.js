define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/passives/template',
	'css!ui/templates/passives/styles',
	'ui/templates/passives/constants',
	'ui/templates/passives/temp',
	'ui/templates/passives/input',
	'js/misc/statTranslations'
], function (
	events,
	client,
	tpl,
	styles,
	constants,
	temp,
	input,
	statTranslations
) {
	return {
		tpl: tpl,

		modal: true,
		centered: true,

		canvas: null,
		size: {},
		ctx: null,

		mouse: {
			x: 0,
			y: 0
		},

		currentZoom: 1,
		pos: {
			x: 0,
			y: 0
		},
		oldPos: null,

		panOrigin: null,

		data: {
			nodes: null,
			links: null
		},

		postRender: function () {
			input.init(this.el);

			var data = JSON.parse(temp.json);
			this.data.nodes = data.nodes;
			this.data.links = data.links;

			//We need to be able to determine the size of elements
			this.el.css({
				visibility: 'hidden',
				display: 'block'
			});

			this.canvas = this.find('.canvas')[0];
			this.size.w = this.canvas.width = this.find('.bottom').width();
			this.size.h = this.canvas.height = this.find('.bottom').height();
			this.ctx = this.canvas.getContext('2d');

			//Reset styles after determining size
			this.el.css({
				visibility: 'visible',
				display: 'none'
			});

			this.ctx.lineWidth = constants.lineWidth;

			$(this.canvas)
				.on('contextmenu', function () {
					return false;
				});

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('uiMouseMove', this.events.onPan.bind(this));
			this.onEvent('uiMouseDown', this.events.onPanStart.bind(this));
			this.onEvent('uiMouseUp', this.events.onPanEnd.bind(this));

			//Calculate midpoint
			this.data.nodes.forEach(function (n) {
				this.pos.x += n.pos.x;
				this.pos.y += n.pos.y;
			}, this);

			this.pos.x = ~~(this.pos.x / this.data.nodes.length) * constants.gridSize;
			this.pos.y = ~~(this.pos.y / this.data.nodes.length) * constants.gridSize;

			this.pos.x -= ~~(this.canvas.width / 2);
			this.pos.y -= ~~(this.canvas.height / 2);
		},

		renderNodes: function () {
			this.renderers.clear.call(this);

			var links = this.data.links;
			var nodes = this.data.nodes;

			links.forEach(function (l) {
				var linked = (
					nodes.find(n => (n.id == l.from.id)).selected &&
					nodes.find(n => (n.id == l.to.id)).selected
				);
				this.renderers.line.call(this, l.from, l.to, linked);
			}, this);

			nodes.forEach(function (n) {
				this.renderers.node.call(this, n, n.pos.x, n.pos.y);
			}, this);
		},

		toggle: function (show) {
			this.shown = !this.el.is(':visible');

			if (this.shown) {
				this.show();
				this.renderNodes();
			} else
				this.hide();
		},

		onKeyDown: function (key) {
			if (key == 'p')
				this.toggle();
		},

		renderers: {
			clear: function () {
				var pos = this.oldPos || this.pos;

				this.ctx.clearRect(0, 0, this.size.w, this.size.h);

				delete this.oldPos;
			},

			node: function (node) {
				var color = (node.color >= 0) ? (node.color + 1) : -1;
				if ((!node.stats) || (Object.keys(node.stats).length == 0))
					color = 0;

				this.ctx.fillStyle = ([
					'#69696e',
					'#c0c3cf',
					'#3fa7dd',
					'#4ac441',
					'#d43346',
					'#a24eff'
				])[color];
				var size = ([
					constants.blockSize,
					constants.blockSize * 2,
					constants.blockSize * 3
				])[node.size];
				var x = (node.pos.x * constants.gridSize) - ((size - constants.blockSize) / 2) - this.pos.x;
				var y = (node.pos.y * constants.gridSize) - ((size - constants.blockSize) / 2) - this.pos.y;

				this.ctx.fillRect(x, y, size, size);

				this.ctx.strokeStyle = ([
					'#69696e',
					'#69696e',
					'#42548d',
					'#386646',
					'#763b3b',
					'#533399'
				])[color];
				this.ctx.strokeRect(x, y, size, size);

				if (node.selected) {
					this.ctx.strokeStyle = '#fafcfc';
					this.ctx.strokeRect(x, y, size, size);
				}
			},

			line: function (fromNode, toNode, linked) {
				var ctx = this.ctx;
				var halfSize = constants.blockSize / 2;

				var fromX = (fromNode.pos.x * constants.gridSize) + halfSize - this.pos.x;
				var fromY = (fromNode.pos.y * constants.gridSize) + halfSize - this.pos.y;

				var toX = (toNode.pos.x * constants.gridSize) + halfSize - this.pos.x;
				var toY = (toNode.pos.y * constants.gridSize) + halfSize - this.pos.y;

				ctx.strokeStyle = linked ? '#fafcfc' : '#69696e';
				ctx.beginPath();
				ctx.moveTo(fromX, fromY);
				ctx.lineTo(toX, toY);
				ctx.closePath();
				ctx.stroke();
			}
		},

		events: {
			onMouseMove: function (pos) {
				if ((this.mouse.x == pos.x) && (this.mouse.y == pos.y))
					return;

				this.mouse = {
					x: pos.x,
					y: pos.y
				};

				var cell = {
					x: ~~((this.pos.x + this.mouse.x) / constants.gridSize),
					y: ~~((this.pos.y + this.mouse.y) / constants.gridSize)
				};

				var node = this.data.nodes.find(function (n) {
					return (
						(n.pos.x == cell.x) &&
						(n.pos.y == cell.y)
					);
				});

				if (node) {
					var percentageStats = [
						'addCritChance',
						'addCritMultiplier',
						'sprintChance',
						'dmgPercent',
						'xpIncrease',
						'blockAttackChance',
						'blockSpellChance',
						'attackSpeed',
						'castSpeed',
						'itemQuantity',
						'catchChance',
						'catchSpeed',
						'fishRarity',
						'fishWeight',
						'fishItems'
					];

					var text = Object.keys(node.stats)
						.map(function (s) {
							console.log(s);
							var statName = statTranslations.translate(s);
							var statValue = node.stats[s];
							if (percentageStats.indexOf(s) > -1)
								statValue += '%';

							return ('+' + statValue + ' ' + statName);
						})
						.join('<br />');

					events.emit('onShowTooltip', text, this.el[0], this.mouse);
				} else
					events.emit('onHideTooltip', this.el[0]);
			},

			onPanStart: function (e) {
				var cell = {
					x: ~~((this.pos.x + e.raw.offsetX) / constants.gridSize),
					y: ~~((this.pos.y + e.raw.offsetY) / constants.gridSize)
				};

				var node = this.data.nodes.find(function (n) {
					return (
						(n.pos.x == cell.x) &&
						(n.pos.y == cell.y)
					);
				});

				if (node) {
					node.selected = !node.selected;
					this.renderNodes();
					return;
				}

				this.panOrigin = {
					x: e.raw.clientX,
					y: e.raw.clientY
				};
			},

			onPan: function (e) {
				if (!this.panOrigin) {
					this.events.onMouseMove.call(this, e);
					return;
				}

				if (!this.oldPos) {
					this.oldPos = {
						x: this.pos.x,
						y: this.pos.y
					};
				}

				var zoomPanMultiplier = this.currentZoom;
				var scrollSpeed = constants.scrollSpeed / zoomPanMultiplier;

				this.pos.x += (this.panOrigin.x - e.raw.clientX) * scrollSpeed;
				this.pos.y += (this.panOrigin.y - e.raw.clientY) * scrollSpeed;

				this.panOrigin = {
					x: e.raw.clientX,
					y: e.raw.clientY
				};

				this.renderNodes();
			},

			onPanEnd: function (e) {
				this.panOrigin = null;
			}
		}
	}
});
