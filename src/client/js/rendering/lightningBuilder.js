define([
	'js/rendering/renderer'
], function(
	renderer
) {
	var scale = 40;
	var scaleMult = 5;

	return {
		build: function(config) {
			var obj = {
				lines: []
			};

			var divisions = 25;
			var maxDeviate = scale * 0.35;

			var fx = config.fromX * scale;
			var fy = config.fromY * scale;

			var tx = config.toX * scale;
			var ty = config.toY * scale;

			var angle = Math.atan2(ty - fy, tx - fx);
			var distance = Math.sqrt(Math.pow(tx - fx, 2) + Math.pow(ty - fy, 2));
			var divDistance = distance / divisions;

			var x = fx;
			var y = fy;

			for (var i = 0; i < divisions; i++) {
				var line = {
					sprites: []
				};

				var ntx = fx + (Math.cos(angle) * (divDistance * i)) + ~~(Math.random() * (maxDeviate * 2)) - maxDeviate;
				var nty = fy + (Math.sin(angle) * (divDistance * i)) + ~~(Math.random() * (maxDeviate * 2)) - maxDeviate;

				if (i == divisions - 1) {
					ntx = tx;
					nty = ty;
				}

				var nAngle = Math.atan2(nty - y, ntx - x);
				var steps = ~~(Math.sqrt(Math.pow(ntx - x, 2) + Math.pow(nty - y, 2)) / scaleMult);

				for (var j = 0; j < steps; j++) {
					var c = 105 + ~~(Math.random() * 150);
					line.sprites.push(renderer.buildRectangle({
						x: ~~(x / scaleMult) * scaleMult,
						y: ~~(y / scaleMult) * scaleMult,
						w: scaleMult,
						h: scaleMult,
						color: this.toHex(c, c, ~~(Math.random() * 100)),
						layerName: 'effects'
					}));

					line.sprites[line.sprites.length - 1].blendMode = PIXI.BLEND_MODES.ADD;

					x += Math.cos(nAngle) * scaleMult;
					y += Math.sin(nAngle) * scaleMult;
				}

				obj.lines.push(line);
			}

			return obj;
		},

		toHex: function rgbToHex(r, g, b) {
			var componentToHex = function(c) {
			    var hex = c.toString(16);
			    return hex.length == 1 ? '0' + hex : hex;
			};

			return '0x' + componentToHex(r) + componentToHex(g) + componentToHex(b);
		},

		update: function(obj) {

		},

		destroy: function(obj) {
			obj.lines.forEach(function(l) {
				l.sprites.forEach(function(s) {
					s.parent.removeChild(s);
				});
			});
		}
	};
});