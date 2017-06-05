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
		type: 'lightPatch',

		color: 'f7ffb2',
		sprites: [],

		init: function(blueprint) {
			this.blueprint = this.blueprint || {};

			var obj = this.obj;

			var x = obj.x;
			var y = obj.y;

			var maxDistance = Math.sqrt(Math.pow(obj.width / 2, 2) + Math.pow(obj.height / 2, 2));
			for (var i = 0; i < obj.width; i++) {
				for (var j = 0; j < obj.height; j++) {
					var distance = maxDistance - Math.sqrt(Math.pow((obj.width / 2) - i, 2) + Math.pow((obj.width / 2) - i, 2));
					var alpha = distance / maxDistance;

					var sprite = renderer.buildObject({
						x: (x + i),
						y: (y + j),
						sheetName: 'white',
						cell: 0,
						layerName: 'lightPatches'
					});
					sprite.alpha = (0.2 + (Math.random() * 1)) * alpha;
					sprite.tint = '0x' + this.color;

					sprite.blendMode = PIXI.BLEND_MODES.OVERLAY;
					sprite.pluginName = 'picture';

					this.sprites.push(sprite);
				}
			}

			var rCount = (obj.width * obj.height) / 11;
			for (var i = 0; i < rCount; i++) {
				var nx = x + ~~(Math.random() * obj.width) + 2;
				var ny = y + ~~(Math.random() * obj.height) - (obj.height / 3);
				var w = 1 + ~~(Math.random() * 2);
				var h = (obj.height / 2) + ~~(Math.random() * obj.height * 7);

				var ray = renderer.buildObject({
					x: nx,
					y: ny,
					cell: 0,
					sheetName: 'ray',
					layerName: 'lightBeams'
				});
				ray.alpha = 0.1 + (Math.random() * 0.2);
				ray.width = w * scaleMult;
				ray.height = h * scaleMult;	
				//ray.position = new PIXI.Point((nx * scale), (ny * scale));
				ray.pivot = new PIXI.Point(0.5, 0.5);
				ray.rotation = 0.5;
				ray.tint = 0xffeb38;

				ray.blendMode = PIXI.BLEND_MODES.ADD;
				sprite.pluginName = 'picture';

				this.sprites.push(ray);
			}
		},

		update: function() {

		},

		destroy: function() {
			this.sprites.forEach(function(s) {
				s.parent.removeChild(s);
			});
			this.sprites = [];
		}
	};
});