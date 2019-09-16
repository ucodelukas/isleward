define([
	'js/rendering/renderer'/*,
	'picture'*/
], function (
	renderer/*,
	picture*/
) {
	const frag = `
	varying vec2 vTextureCoord;
	uniform sampler2D uSampler;
	uniform vec4 targetColor;
	void main(void)
	{
	    vec4 source = texture2D(uSampler, vTextureCoord);

	    //reverse hardlight
	    if (source.a == 0.0) {
	        gl_FragColor = vec4(0, 0, 0, 0);
	        return;
	    }
		
	    //yeah, premultiplied
	    vec3 Cb = source.rgb/source.a, Cs;
	    if (targetColor.a > 0.0) {
	        Cs = targetColor.rgb / targetColor.a;
	    }
	    vec3 multiply = Cb * Cs * 2.0;
	    vec3 Cb2 = Cb * 2.0 - 1.0;
	    vec3 screen = Cb2 + Cs - Cb2 * Cs;
	    vec3 B;
	    if (Cs.r <= 0.5) {
	        B.r = 0.0;
	    } else {
	        B.r = screen.r;
	    }
	    if (Cs.g <= 0.5) {
	        B.g = 0.0;
	    } else {
	        B.g = screen.g;
	    }
	    if (Cs.b <= 0.5) {
	        B.b = 0.0;
	    } else {
	        B.b = screen.b;
	    }
	    vec4 res;
	    res.xyz = (1.0 - source.a) * Cs + source.a * B;
	    res.a = source.a + targetColor.a * (1.0-source.a);
	    gl_FragColor = vec4(res.xyz * res.a, res.a);

	}`;

	return {
		type: 'lightPatch',

		color: 'f7ffb2',
		patches: [],
		rays: [],

		init: function (blueprint) {
			this.blueprint = this.blueprint || {};

			let obj = this.obj;

			let x = obj.x;
			let y = obj.y;

			let maxDistance = Math.sqrt(Math.pow(obj.width / 2, 2) + Math.pow(obj.height / 2, 2));
			for (let i = 0; i < obj.width; i++) {
				for (let j = 0; j < obj.height; j++) {
					let distance = maxDistance - Math.sqrt(Math.pow((obj.width / 2) - i, 2) + Math.pow((obj.width / 2) - i, 2));
					let alpha = distance / maxDistance;

					let sprite = renderer.buildObject({
						x: (x + i),
						y: (y + j),
						sheetName: 'white',
						cell: 0,
						layerName: 'lightPatches'
					});
					sprite.alpha = (0.2 + (Math.random() * 1)) * alpha;
					//sprite.tint = '0x' + this.color;

					//We assume that target alpha is 1.0 always
					let overlayFilter = new PIXI.Filter(undefined, frag, {
						targetColor: [0.0, 0.0, 0.0, 1.0]
					});

					//assign the color to rgb array

					//sprite.blendMode = PIXI.BLEND_MODES.OVERLAY;
					//sprite.pluginName = 'picture';

					sprite.filters = [overlayFilter];
					this.patches.push(sprite);
				}
			}

			let rCount = ((obj.width * obj.height) / 10) + ~~(Math.random() + 2);
			for (let i = 0; i < rCount; i++) {
				let nx = x + 3 + ~~(Math.random() * (obj.width - 1));
				let ny = y - 4 + ~~(Math.random() * (obj.height));
				let w = 1 + ~~(Math.random() * 2);
				let h = 6 + ~~(Math.random() * 13);
				let hm = 2;

				let rContainer = renderer.buildContainer({
					layerName: 'lightBeams'
				});
				this.rays.push(rContainer);

				for (let j = 0; j < h; j++) {
					let ray = renderer.buildObject({
						x: nx,
						y: ny,
						cell: 0,
						sheetName: 'white',
						parent: rContainer
					});
					ray.x = ~~((nx * scale) - (scaleMult * j));
					ray.y = (ny * scale) + (scaleMult * j * hm);
					ray.alpha = ((1.0 - (j / h)) * 0.4);
					ray.width = w * scaleMult;
					ray.height = scaleMult * hm;
					ray.tint = 0xffeb38;
					ray.blendMode = PIXI.BLEND_MODES.ADD;
				}
			}
		},

		update: function () {
			let rays = this.rays;
			let rLen = rays.length;
			for (let i = 0; i < rLen; i++) {
				let r = rays[i];

				r.alpha += (Math.random() * 0.03) - 0.015;
				if (r.alpha < 0.3)
					r.alpha = 0.3;
				else if (r.alpha > 1)
					r.alpha = 1;
			}
		},

		setVisible: function (visible) {
			this.patches.forEach(function (p) {
				p.visible = visible;
			});

			this.rays.forEach(function (r) {
				r.visible = visible;
			});
		},

		destroy: function () {
			this.patches.forEach(function (p) {
				p.parent.removeChild(p);
			});
			this.patches = [];

			this.rays.forEach(function (r) {
				r.parent.removeChild(r);
			});
			this.rays = [];
		}
	};
});
