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

		hoverNode: null,

		postRender: function () {
			input.init(this.el);

			this.data.nodes = temp.nodes;
			this.data.links = temp.links;

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

			this.find('.btnReset').on('click', this.events.onReset.bind(this));

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('uiMouseMove', this.events.onPan.bind(this));
			this.onEvent('uiMouseDown', this.events.onPanStart.bind(this));
			this.onEvent('uiMouseUp', this.events.onPanEnd.bind(this));
			this.onEvent('onGetPassives', this.events.onGetPassives.bind(this));
			this.onEvent('onGetPassivePoints', this.events.onGetPassivePoints.bind(this));
			this.onEvent('onShowPassives', this.toggle.bind(this));
		},

		renderNodes: function () {
			if (!this.shown)
				return;

			this.renderers.clear.call(this);

			var links = this.data.links;
			var nodes = this.data.nodes;

			links.forEach(function (l) {
				var linked = (
					nodes.find(function (n) {
						return (n.id == l.from.id);
					}).selected &&
					nodes.find(function (n) {
						return (n.id == l.to.id);
					}).selected
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
				//Calculate midpoint
				var start = this.data.nodes.find(function (n) {
					return (n.spiritStart == window.player.class);
				});

				this.pos.x = start.pos.x * constants.gridSize;
				this.pos.y = start.pos.y * constants.gridSize;

				this.pos.x -= ~~(this.canvas.width / 2);
				this.pos.y -= ~~(this.canvas.height / 2);

				this.show();
				this.renderNodes();
			} else
				this.hide();

			events.emit('onHideTooltip', this.el[0]);
		},

		beforeHide: function () {
			events.emit('onHideTooltip', this.el[0]);
			events.emit('onHideTooltip', this.el[0]);
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
				if (((!node.stats) || (Object.keys(node.stats).length == 0)) && (!node.spiritStart))
					color = 0;

				if (node.spiritStart) {
					color = 8;
					node.size = 1;
				}

				this.ctx.fillStyle = ([
					'#69696e',
					'#c0c3cf',
					'#3fa7dd',
					'#4ac441',
					'#d43346',
					'#a24eff',
					'#faac45',
					'#44cb95',
					'#fafcfc'
				])[color];
				var size = ([
					constants.blockSize,
					constants.blockSize * 2,
					constants.blockSize * 3
				])[node.size];
				var x = (node.pos.x * constants.gridSize) - ((size - constants.blockSize) / 2) - this.pos.x;
				var y = (node.pos.y * constants.gridSize) - ((size - constants.blockSize) / 2) - this.pos.y;

				var linked = this.data.links.some(function (l) {
					if ((l.from.id != node.id) && (l.to.id != node.id))
						return false;

					return this.data.nodes.some(function (n) {
						return (
							((n.id == l.from.id) && (n.selected)) ||
							((n.id == l.to.id) && (n.selected))
						);
					});
				}, this);

				if (!linked)
					this.ctx.globalAlpha = 0.25;

				this.ctx.fillRect(x, y, size, size);

				if (linked) {
					this.ctx.strokeStyle = ([
						'#69696e',
						'#69696e',
						'#42548d',
						'#386646',
						'#763b3b',
						'#533399',
						'#d07840',
						'#3f8d6d',
						'#fafcfc'
					])[color];
					this.ctx.strokeRect(x, y, size, size);

					if (node.selected) {
						this.ctx.strokeStyle = '#fafcfc';
						this.ctx.strokeRect(x, y, size, size);
					}
				}

				if (!linked)
					this.ctx.globalAlpha = 1;

			},

			line: function (fromNode, toNode, linked) {
				var ctx = this.ctx;
				var halfSize = constants.blockSize / 2;

				fromNode = this.data.nodes.find(function (n) {
					return (n.id == fromNode.id);
				});

				toNode = this.data.nodes.find(function (n) {
					return (n.id == toNode.id);
				});

				var fromX = (fromNode.pos.x * constants.gridSize) + halfSize - this.pos.x;
				var fromY = (fromNode.pos.y * constants.gridSize) + halfSize - this.pos.y;

				var toX = (toNode.pos.x * constants.gridSize) + halfSize - this.pos.x;
				var toY = (toNode.pos.y * constants.gridSize) + halfSize - this.pos.y;

				if ((!linked) && (!fromNode.selected) && (!toNode.selected))
					this.ctx.globalAlpha = 0.25;

				ctx.strokeStyle = linked ? '#fafcfc' : '#69696e';
				ctx.beginPath();
				ctx.moveTo(fromX, fromY);
				ctx.lineTo(toX, toY);
				ctx.closePath();
				ctx.stroke();

				if ((!linked) && (!fromNode.selected) && (!toNode.selected))
					this.ctx.globalAlpha = 1;
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

				var node = this.hoverNode = this.data.nodes.find(function (n) {
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
							var statName = statTranslations.translate(s);
							var statValue = node.stats[s];
							var negative = ((statValue + '')[0] == '-');
							if (percentageStats.indexOf(s) > -1)
								statValue += '%';

							return ((negative ? '' : '+') + statValue + ' ' + statName);
						})
						.join('<br />');

					if (node.spiritStart == window.player.class)
						text = 'Your starting node';
					else if (node.spiritStart)
						text = 'Starting node for ' + node.spiritStart + ' spirits';

					var pos = {
						x: input.mouse.raw.clientX + 15,
						y: input.mouse.raw.clientY
					};

					events.emit('onShowTooltip', text, this.el[0], pos);
				} else
					events.emit('onHideTooltip', this.el[0]);
			},

			onPanStart: function (e) {
				if (this.hoverNode) {
					this.events.onTryClickNode.call(this, this.hoverNode);
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
			},

			onTryClickNode: function (node) {
				if ((node.spiritStart) || (node.selected))
					return;

				client.request({
					cpn: 'player',
					method: 'performAction',
					data: {
						cpn: 'passives',
						method: node.selected ? 'untickNode' : 'tickNode',
						data: {
							nodeId: node.id
						}
					}
				});
			},

			onGetPassives: function (selected) {
				this.data.nodes.forEach(function (n) {
					n.selected = selected.some(function (s) {
						return (s == n.id);
					});
				});

				this.renderNodes();
			},

			onGetPassivePoints: function (points) {
				var el = this.find('.points')
					.html('Points Available: ' + points);
			},

			onReset: function () {
				client.request({
					cpn: 'player',
					method: 'performAction',
					data: {
						cpn: 'passives',
						method: 'untickNode',
						data: {
							nodeId: node.id
						}
					}
				});
			}
		}
	}
});
