define([
	'js/rendering/renderer',
	'picture'
], function(
	renderer,
	picture
) {
	var scale = 40;
	var scaleMult = 5;

	return {
		build: function(config) {
			var obj = {
				lines: []
			};

			var divisions = 20;
			var maxDeviate = scale * 0.3;

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

				var patches = {};

				for (var j = 0; j < steps; j++) {
					var c = [0xffeb38, 0xfaac45, 0xfafcfc][~~(Math.random() * 3)];
					line.sprites.push(renderer.buildRectangle({
						x: ~~(x / scaleMult) * scaleMult,
						y: ~~(y / scaleMult) * scaleMult,
						w: scaleMult,
						h: scaleMult,
						color: c,
						layerName: 'effects'
					}));

					var xx = x;
					var yy = y;
					if (!patches[xx + '-' + yy]) {
						patches[xx + '-' + yy] = 1;

						var lightPatch = renderer.buildObject({
							sheetName: 'white',
							x: 0,
							y: 0,
							cell: 0,
							layerName: 'lightPatches'
						});
						lightPatch.alpha = Math.random() * 0.5;
						lightPatch.tint = '0xffffff';
						lightPatch.x = ~~((xx - scaleMult) / scaleMult) * scaleMult;
						lightPatch.y = ~~((yy - scaleMult) / scaleMult) * scaleMult;
						lightPatch.width = scaleMult * 3;
						lightPatch.height = scaleMult * 3;

						lightPatch.blendMode = PIXI.BLEND_MODES.OVERLAY;
						lightPatch.pluginName = 'picture';

						line.sprites.push(lightPatch);
					}

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