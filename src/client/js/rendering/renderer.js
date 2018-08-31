define([
	'js/resources',
	'js/system/events',
	'js/misc/physics',
	'js/rendering/effects',
	'js/rendering/tileOpacity',
	'js/rendering/particles',
	'js/rendering/shaders/outline',
	'js/rendering/spritePool',
	'picture'
], function (
	resources,
	events,
	physics,
	effects,
	tileOpacity,
	particles,
	shaderOutline,
	spritePool,
	picture
) {
<<<<<<< HEAD
	let pixi = PIXI;

	return {
		stage: null,
		layers: {
			objects: null,
			mobs: null,
			characters: null,
			attacks: null,
			effects: null,
			particles: null,
			lightPatches: null,
			lightBeams: null,
			tileSprites: null,
			hiders: null
		},

		titleScreen: false,

		width: 0,
		height: 0,

		showTilesW: 0,
		showTilesH: 0,

		pos: {
			x: 0,
			y: 0
		},
		moveTo: null,
		moveSpeed: 0,
		moveSpeedMax: 1.50,
		moveSpeedInc: 0.5,

		lastUpdatePos: {
			x: 0,
			y: 0
		},

		zoneId: null,

		textures: {},
		textureCache: {},

		sprites: [],

		lastTick: null,

		hiddenRooms: null,

		init: function () {
			PIXI.GC_MODES.DEFAULT = PIXI.GC_MODES.AUTO;
			PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

			events.on('onGetMap', this.onGetMap.bind(this));
			events.on('onToggleFullscreen', this.toggleScreen.bind(this));

			this.width = $('body').width();
			this.height = $('body').height();

			this.showTilesW = Math.ceil((this.width / scale) / 2) + 3;
			this.showTilesH = Math.ceil((this.height / scale) / 2) + 3;

			this.renderer = pixi.autoDetectRenderer(this.width, this.height, {
				backgroundColor: '0x2d2136'
			});

			window.onresize = this.onResize.bind(this);

			$(this.renderer.view)
				.appendTo('.canvasContainer');

			this.stage = new pixi.Container();

			let layers = this.layers;
			Object.keys(layers).forEach(function (l) {
				if (l === 'tileSprites') {
					layers[l] = new pixi.Container();
					layers[l].layer = 'tiles';
				} else {
					layers[l] = new pixi.Container();
					layers[l].layer = l;
				}

				this.stage.addChild(layers[l]);
			}, this);

			let spriteNames = ['tiles', 'mobs', 'bosses', 'animBigObjects', 'bigObjects', 'objects', 'characters', 'attacks', 'auras', 'walls', 'ui', 'animChar', 'animMob', 'animBoss', 'white', 'ray'];
			resources.spriteNames.forEach(function (s) {
				if (s.indexOf('.png') > -1)
					spriteNames.push(s);
			});

			spriteNames.forEach(function (t) {
				this.textures[t] = new pixi.BaseTexture(resources.sprites[t].image);
				this.textures[t].scaleMode = pixi.SCALE_MODES.NEAREST;
			}, this);

			particles.init({
				r: this,
				renderer: this.renderer,
				stage: this.layers.particles
			});

			this.buildSpritesTexture();
		},

		buildSpritesTexture: function () {
			let container = new pixi.Container();

			let totalHeight = 0;
			['tiles', 'walls', 'objects'].forEach(function (t) {
				let texture = this.textures[t];
				let tile = new pixi.Sprite(new pixi.Texture(texture));
				tile.width = texture.width;
				tile.height = texture.height;
				tile.x = 0;
				tile.y = totalHeight;

				container.addChild(tile);

				totalHeight += tile.height;
			}, this);

			let renderTexture = pixi.RenderTexture.create(this.textures.tiles.width, totalHeight);
			this.renderer.render(container, renderTexture);

			this.textures.sprites = renderTexture;
			this.textures.scaleMult = pixi.SCALE_MODES.NEAREST;
		},

		toggleScreen: function () {
			let screenMode = 0;

			let isFullscreen = (window.innerHeight === screen.height);
			if (isFullscreen)
				screenMode = 0;
			else
				screenMode = 1;

			if (screenMode === 0) {
				(document.cancelFullscreen || document.msCancelFullscreen || document.mozCancelFullscreen || document.webkitCancelFullScreen).call(document);
				return 'Windowed';
			} else if (screenMode === 1) {
				let el = $('body')[0];
				(el.requestFullscreen || el.msRequestFullscreen || el.mozRequestFullscreen || el.webkitRequestFullscreen).call(el);
				return 'Fullscreen';
			}
		},

		buildTitleScreen: function () {
			this.titleScreen = true;

			this.setPosition({
				x: 0,
				y: 0
			}, true);

			let w = Math.ceil(this.width / scale) + 1;
			let h = Math.ceil(this.height / scale) + 1;

			let container = this.layers.tileSprites;

			for (let i = 0; i < w; i++) {
				for (let j = 0; j < h; j++) {
					let ii = i / 10;
					let alpha = Math.sin(((j * 0.2) % 5) + Math.cos(ii % 8));
					let tile = 5;
					if (j < 7)
						tile = 5;
					else if (alpha < -0.2)
						tile = 3;
					else if (alpha < 0.2)
						tile = 4;
					else if ((alpha < 0.5) && (j > 7))
						tile = 53;

					alpha = Math.random();

					if (tile === 5)
						alpha *= 2;
					else if (tile === 3)
						alpha *= 1;
					else if (tile === 4)
						alpha *= 1;
					else if (tile === 53)
						alpha *= 2;

					alpha = Math.min(Math.max(0.15, alpha), 0.65);

					if (Math.random() < 0.35) {
						tile = {
							2: 7,
							5: 6,
							3: 0,
							4: 1,
							53: 54
						}[tile];
					}

					let sprite = new pixi.Sprite(this.getTexture('sprites', tile));

					sprite.alpha = alpha;
					sprite.position.x = i * scale;
					sprite.position.y = j * scale;
					sprite.width = scale;
					sprite.height = scale;

					if (Math.random() < 0.5) {
						sprite.position.x += scale;
						sprite.scale.x = -scaleMult;
					}

					container.addChild(sprite);
				}
			}
		},

		onResize: function () {
			let zoom = window.devicePixelRatio;

			this.width = $('body').width() * zoom;
			this.height = $('body').height() * zoom;

			this.showTilesW = Math.ceil((this.width / scale) / 2) + 3;
			this.showTilesH = Math.ceil((this.height / scale) / 2) + 3;

			this.renderer.resize(this.width, this.height);
			if (window.player) {
				this.setPosition({
					x: (window.player.x - (this.width / (scale * 2))) * scale,
					y: (window.player.y - (this.height / (scale * 2))) * scale
				}, true);
			}

			if (this.titleScreen) {
				this.clean();
				this.buildTitleScreen();
			}

			events.emit('onResize');
		},

		getTexture: function (baseTex, cell, size) {
			size = size || 8;
			let textureName = baseTex + '_' + cell;

			let textureCache = this.textureCache;

			let cached = textureCache[textureName];

			if (!cached) {
				let y = ~~(cell / 8);
				let x = cell - (y * 8);
				cached = new pixi.Texture(this.textures[baseTex], new pixi.Rectangle(x * size, y * size, size, size));
				textureCache[textureName] = cached;
			}

			return cached;
		},

		clean: function () {
			this.stage.removeChild(this.layers.hiders);
			this.layers.hiders = new pixi.Container();
			this.layers.hiders.layer = 'hiders';
			this.stage.addChild(this.layers.hiders);

			let container = this.layers.tileSprites;
			this.stage.removeChild(container);

			this.layers.tileSprites = container = new pixi.Container();
			container.layer = 'tiles';
			this.stage.addChild(container);

			this.stage.children.sort(function (a, b) {
				if (a.layer === 'hiders')
					return 1;
				else if (b.layer === 'hiders')
					return -1;
				else if (a.layer === 'tiles')
					return -1;
				else if (b.layer === 'tiles')
					return 1;
				return 0;
			}, this);
		},

		onGetMapCustomization: function (msg) {
			if (!msg.collide) {
				let children = this.layers.tiles.children;
				let cLen = children.length;
				let x = msg.x * scale;
				let y = msg.y * scale;
				for (let i = cLen - 1; i >= 0; i--) {
					let c = children[i];
					let cx = c.x;
					if (c.scale.x < 0)
						cx -= scale;
					if ((cx === x) && (c.y === y)) {
						c.parent.removeChild(c);
						break;
					}
				}
			}

			let tile = new pixi.Sprite(this.getTexture('sprites', msg.tile));

			tile.alpha = tileOpacity.map(msg.tile);
			tile.position.x = msg.x * scale;
			tile.position.y = msg.y * scale;
			tile.width = scale;
			tile.height = scale;

			if (Math.random() < 0.5) {
				tile.position.x += scale;
				tile.scale.x = -scaleMult;
			}

			this.layers.tiles.addChild(tile);

			physics.collisionMap[msg.x][msg.y] = msg.collide;
			physics.graph.grid[msg.x][msg.y] = !msg.collide;
		},

		buildTile: function (c, i, j) {
			let alpha = tileOpacity.map(c);
			let canFlip = tileOpacity.canFlip(c);

			let tile = new pixi.Sprite(this.getTexture('sprites', c));

			tile.alpha = alpha;
			tile.position.x = i * scale;
			tile.position.y = j * scale;
			tile.width = scale;
			tile.height = scale;

			if (canFlip) {
				if (Math.random() < 0.5) {
					tile.position.x += scale;
					tile.scale.x = -scaleMult;
				}
			}

			return tile;
		},

		onGetMap: function (msg) {
			this.titleScreen = false;
			physics.init(msg.collisionMap);

			let map = this.map = msg.map;
			let w = this.w = map.length;
			let h = this.h = map[0].length;

			this.clean();
			spritePool.clean();

			this.stage.filters = [new PIXI.filters.VoidFilter()];
			this.stage.filterArea = new PIXI.Rectangle(0, 0, w * scale, h * scale);

			this.buildHiddenRooms(msg);

			this.sprites = _.get2dArray(w, h, 'array');

			this.stage.children.sort(function (a, b) {
				if (a.layer === 'tiles')
					return -1;
				else if (b.layer === 'tiles')
					return 1;
				return 0;
			}, this);

			if (this.zoneId !== null)
				events.emit('onRezone', this.zoneId);
			this.zoneId = msg.zoneId;

			msg.clientObjects.forEach(function (c) {
				c.zoneId = this.zoneId;
				events.emit('onGetObject', c);
			}, this);
		},

		buildHiddenRooms: function (msg) {
			let hiddenWalls = msg.hiddenWalls;
			let hiddenTiles = msg.hiddenTiles;

			this.hiddenRooms = msg.hiddenRooms;
			this.hiddenRooms.forEach(function (h) {
				h.container = new pixi.Container();
				this.layers.hiders.addChild(h.container);
				this.buildRectangle({
					x: h.x * scale,
					y: h.y * scale,
					w: h.width * scale,
					h: h.height * scale,
					color: 0x2d2136,
					parent: h.container
				});
				for (let i = h.x; i < h.x + h.width; i++) {
					for (let j = h.y; j < h.y + h.height; j++) {
						[hiddenTiles, hiddenWalls].forEach(function (k) {
							let cell = k[i][j];
							if (cell === 0)
								return;

							let tile = this.buildTile(cell - 1, i, j);
							tile.width = scale;
							tile.height = scale;
							h.container.addChild(tile);
						}, this);
					}
				}
			}, this);
		},
		hideHiders: function () {
			let player = window.player;
			if (!player)
				return;

			let x = player.x;
			let y = player.y;

			let hiddenRooms = this.hiddenRooms;
			let hLen = hiddenRooms.length;
			for (let i = 0; i < hLen; i++) {
				let h = hiddenRooms[i];
				h.container.visible = (
					(x < h.x) ||
                    (x >= h.x + h.width) ||
                    (y < h.y) ||
                    (y >= h.y + h.height)
				);
			}
		},

		setPosition: function (pos, instant) {
			pos.x += 16;
			pos.y += 16;

			this.hideHiders();

			if (instant) {
				this.moveTo = null;
				this.pos = pos;
				this.stage.x = -~~this.pos.x;
				this.stage.y = -~~this.pos.y;
			} else
				this.moveTo = pos;

			this.updateSprites();
		},

		isVisible: function (x, y) {
			let stage = this.stage;
			let sx = -stage.x;
			let sy = -stage.y;

			let sw = this.width;
			let sh = this.height;

			return (!((x < sx) || (y < sy) || (x >= sx + sw) || (y >= sy + sh)));
		},

		updateSprites: function () {
			if (this.titleScreen)
				return;

			let player = window.player;
			if (!player)
				return;

			let w = this.w;
			let h = this.h;

			let x = ~~((-this.stage.x / scale) + (this.width / (scale * 2)));
			let y = ~~((-this.stage.y / scale) + (this.height / (scale * 2)));

			this.lastUpdatePos.x = this.stage.x;
			this.lastUpdatePos.y = this.stage.y;

			let sprites = this.sprites;
			let map = this.map;
			let container = this.layers.tileSprites;

			let sw = this.showTilesW;
			let sh = this.showTilesH;

			let lowX = Math.max(0, x - sw + 1);
			let lowY = Math.max(0, y - sh + 2);
			let highX = Math.min(w, x + sw - 2);
			let highY = Math.min(h, y + sh - 2);

			let addedSprite = false;

			for (let i = lowX; i < highX; i++) {
				for (let j = lowY; j < highY; j++) {
					let cell = map[i][j];
					if (!cell)
						continue;

					let rendered = sprites[i][j];
					if (rendered.length > 0)
						continue;
					else if (!cell.split)
						cell += '';
					cell = cell.split(',');
					for (let k = 0; k < cell.length; k++) {
						let c = cell[k];
						if (c === '0')
							continue;

						c--;

						let flipped = '';
						if (tileOpacity.canFlip(c)) {
							if (Math.random() < 0.5)
								flipped = 'flip';
						}

						let tile = spritePool.getSprite(flipped + c);
						if (!tile) {
							tile = this.buildTile(c, i, j);
							container.addChild(tile);
							tile.type = c;
							tile.sheetNum = tileOpacity.getSheetNum(c);
							addedSprite = true;
						} else {
							tile.position.x = i * scale;
							tile.position.y = j * scale;
							if (flipped !== '')
								tile.position.x += scale;
							tile.visible = true;
						}

						rendered.push(tile);
					}
				}
			}

			lowX = Math.max(0, lowX - 10);
			lowY = Math.max(0, lowY - 10);
			highX = Math.min(w - 1, highX + 10);
			highY = Math.min(h - 1, highY + 10);

			for (let i = lowX; i < highX; i++) {
				let outside = ((i >= x - sw) && (i < x + sw));
				for (let j = lowY; j < highY; j++) {
					if ((outside) && (j >= y - sh) && (j < y + sh))
						continue;

					let list = sprites[i][j];
					let lLen = list.length;
					for (let k = 0; k < lLen; k++) {
						let sprite = list[k];
						sprite.visible = false;
						spritePool.store(sprite);
					}
					sprites[i][j] = [];
				}
			}

			//Reorder
			if (addedSprite) {
				container.children.sort(function (a, b) {
					return (a.sheetNum - b.sheetNum);
				});
			}
		},

		update: function () {
			let time = +new Date();

			if (this.moveTo) {
				let deltaX = this.moveTo.x - this.pos.x;
				let deltaY = this.moveTo.y - this.pos.y;

				if ((deltaX !== 0) || (deltaY !== 0)) {
					let moveSpeed = this.moveSpeed;
					let distance = Math.max(Math.abs(deltaX), Math.abs(deltaY));

					let moveSpeedMax = this.moveSpeedMax;
					if (distance > 100)
						moveSpeedMax *= 1.75;
					if (this.moveSpeed < moveSpeedMax)
						this.moveSpeed += this.moveSpeedInc;

					let elapsed = time - this.lastTick;
					moveSpeed *= (elapsed / 16.67);

					if (moveSpeed > distance)
						moveSpeed = distance;

					deltaX = (deltaX / distance) * moveSpeed;
					deltaY = (deltaY / distance) * moveSpeed;

					this.pos.x = this.pos.x + (deltaX);
					this.pos.y = this.pos.y + (deltaY);
				} else {
					this.moveSpeed = 0;
					this.moveTo = null;
				}

				let stage = this.stage;
				stage.x = -~~this.pos.x;
				stage.y = -~~this.pos.y;

				let halfScale = scale / 2;
				if ((Math.abs(stage.x - this.lastUpdatePos.x) > halfScale) || (Math.abs(stage.y - this.lastUpdatePos.y) > halfScale))
					this.updateSprites();

				events.emit('onSceneMove');
			}

			this.lastTick = time;
		},

		buildContainer: function (obj) {
			let container = new pixi.Container();
			this.layers[obj.layerName || obj.sheetName].addChild(container);

			return container;
		},

		buildRectangle: function (obj) {
			let graphics = new pixi.Graphics();

			let alpha = obj.alpha;
			if (obj.has('alpha'))
				graphics.alpha = alpha;

			let fillAlpha = obj.fillAlpha;
			if (obj.has('fillAlpha'))
				fillAlpha = 1;

			graphics.beginFill(obj.color || '0x48edff', fillAlpha);

			if (obj.strokeColor)
				graphics.lineStyle(scaleMult, obj.strokeColor);

			graphics.drawRect(0, 0, obj.w, obj.h);

			graphics.endFill();

			(obj.parent || this.layers[obj.layerName || obj.sheetName]).addChild(graphics);

			graphics.position.x = obj.x;
			graphics.position.y = obj.y;

			return graphics;
		},

		moveRectangle: function (obj) {
			obj.sprite.position.x = obj.x;
			obj.sprite.position.y = obj.y;
			obj.sprite.width = obj.w;
			obj.sprite.height = obj.h;
		},

		buildObject: function (obj) {
			let w = 8;
			let h = 8;
			if (obj.w) {
				w = obj.w / scaleMult;
				h = obj.h / scaleMult;
			}

			let bigSheets = ['bosses', 'bigObjects', 'animBigObjects'];
			if ((bigSheets.indexOf(obj.sheetName) > -1) || (obj.sheetName.indexOf('bosses') > -1)) {
				obj.layerName = 'mobs';
				w = 24;
				h = 24;
				obj.w = w * scaleMult;
				obj.h = h * scaleMult;
			}

			let sprite = new pixi.Sprite(this.getTexture(obj.sheetName, obj.cell, w));
			sprite.x = obj.x * scale;
			sprite.y = obj.y * scale;
			sprite.width = obj.w || scale;
			sprite.height = obj.h || scale;
			sprite.visible = obj.has('visible') ? obj.visible : true;

			if ((bigSheets.indexOf(obj.sheetName) > -1) || (obj.sheetName.indexOf('bosses') > -1)) {
				sprite.x -= scale;
				sprite.y -= (scale * 2);
			}

			if (obj.flipX) {
				sprite.scale.x *= -1;
				if (bigSheets.indexOf(obj.sheetName) > -1)
					sprite.x += (scale * 2);
				else
					sprite.x += scale;
			}

			(obj.parent || this.layers[obj.layerName || obj.sheetName] || this.layers.objects).addChild(sprite);

			return sprite;
		},

		addFilter: function (sprite) {
			let thickness = 16;
			if (sprite.width > scale)
				thickness = 8;

			let filter = new shaderOutline(this.renderer.width, this.renderer.height, thickness, '0xffffff');

			if (!sprite.filters)
				sprite.filters = [filter];
			else
				sprite.filters.push();

			return filter;
		},

		removeFilter: function (sprite, filter) {
			if (!sprite.filters)
				return;

			sprite.filters = null;
		},

		buildText: function (obj) {
			let textSprite = new pixi.Text(obj.text, {
				fontFamily: 'bitty',
				fontSize: (obj.fontSize || 14),
				fill: obj.color || 0xF2F5F5,
				stroke: 0x2d2136,
				strokeThickness: 4,
				align: 'center'
			});

			textSprite.x = obj.x - (textSprite.width / 2);
			textSprite.y = obj.y;

			let parentSprite = obj.parent || this.layers[obj.layerName];
			parentSprite.addChild(textSprite);

			return textSprite;
		},

		buildEmitter: function (config) {
			return particles.buildEmitter(config);
		},

		destroyEmitter: function (emitter) {
			particles.destroyEmitter(emitter);
		},

		setSprite: function (obj) {
			obj.sprite.texture = this.getTexture(obj.sheetName, obj.cell, obj.sprite.width / scaleMult);
		},

		reorder: function (sprite) {
			let mobLayer = this.layers.mobs;
			let mobs = mobLayer.children;
			mobs.sort(function (a, b) {
				return (b.y - a.y);
			});
		},

		destroyObject: function (obj) {
			if (!obj.sprite.parent)
				return;
			obj.sprite.parent.removeChild(obj.sprite);
		},

		render: function () {
			if (!this.stage)
				return;

			effects.render();
			particles.update();

			this.renderer.render(this.stage);
		}
	};
=======
    var scale = 40;
    var scaleMult = 5;
    var pixi = PIXI;

    var mRandom = Math.random.bind(Math);

    return {
        stage: null,
        layers: {
            objects: null,
            mobs: null,
            characters: null,
            attacks: null,
            effects: null,
            particles: null,
            lightPatches: null,
            lightBeams: null,
            tileSprites: null,
            hiders: null
        },

        titleScreen: false,

        width: 0,
        height: 0,

        showTilesW: 0,
        showTilesH: 0,

        pos: {
            x: 0,
            y: 0
        },
        moveTo: null,
        moveSpeed: 0,
        moveSpeedMax: 1.50,
        moveSpeedInc: 0.5,

        lastUpdatePos: {
            x: 0,
            y: 0
        },

        zoneId: null,

        textures: {},
        textureCache: {},

        sprites: [],

        lastTick: null,

        hiddenRooms: null,

        init: function () {
            PIXI.GC_MODES.DEFAULT = PIXI.GC_MODES.AUTO;
            PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

            events.on('onGetMap', this.onGetMap.bind(this));
            events.on('onToggleFullscreen', this.toggleScreen.bind(this));

            this.width = $('body').width();
            this.height = $('body').height();

            this.showTilesW = Math.ceil((this.width / scale) / 2) + 3;
            this.showTilesH = Math.ceil((this.height / scale) / 2) + 3;

            this.renderer = pixi.autoDetectRenderer(this.width, this.height, {
                backgroundColor: '0x2d2136'
            });

            window.onresize = this.onResize.bind(this);

            $(this.renderer.view)
                .appendTo('.canvasContainer');

            this.stage = new pixi.Container();

            var layers = this.layers;
            Object.keys(layers).forEach(function (l) {
                if (l == 'tileSprites') {
                    layers[l] = new pixi.Container();
                    layers[l].layer = 'tiles';
                } else {
                    layers[l] = new pixi.Container();
                    layers[l].layer = l;
                }

                this.stage.addChild(layers[l])
            }, this);

            var spriteNames = ['tiles', 'mobs', 'bosses', 'animBigObjects', 'bigObjects', 'objects', 'characters', 'attacks', 'auras', 'walls', 'ui', 'animChar', 'animMob', 'animBoss', 'white', 'ray'];
            resources.spriteNames.forEach(function (s) {
                if (s.indexOf('.png') > -1)
                    spriteNames.push(s);
            });

            spriteNames.forEach(function (t) {
                this.textures[t] = new pixi.BaseTexture(resources.sprites[t].image);
                this.textures[t].scaleMode = pixi.SCALE_MODES.NEAREST;
            }, this);

            particles.init({
                r: this,
                renderer: this.renderer,
                stage: this.layers.particles
            });

            this.buildSpritesTexture();
        },

        buildSpritesTexture: function () {
            var container = new pixi.Container();

            var totalHeight = 0;
            ['tiles', 'walls', 'objects'].forEach(function (t) {
                var texture = this.textures[t];
                var tile = new pixi.Sprite(new pixi.Texture(texture));
                tile.width = texture.width;
                tile.height = texture.height;
                tile.x = 0;
                tile.y = totalHeight;

                container.addChild(tile);

                totalHeight += tile.height;
            }, this);

            var renderTexture = pixi.RenderTexture.create(this.textures.tiles.width, totalHeight);
            this.renderer.render(container, renderTexture);

            this.textures.sprites = renderTexture;
            this.textures.scaleMult = pixi.SCALE_MODES.NEAREST;
        },

        toggleScreen: function () {
            var screenMode = 0;

            var isFullscreen = (window.innerHeight == screen.height);
            if (isFullscreen)
                screenMode = 0;
            else
                screenMode = 1;

            if (screenMode == 0) {
                (document.cancelFullscreen || document.msCancelFullscreen || document.mozCancelFullscreen || document.webkitCancelFullScreen).call(document);
                return 'Windowed';
            } else if (screenMode == 1) {
                var el = $('body')[0];
                (el.requestFullscreen || el.msRequestFullscreen || el.mozRequestFullscreen || el.webkitRequestFullscreen).call(el);
                return 'Fullscreen';
            }
        },

        buildTitleScreen: function () {
            this.titleScreen = true;

            this.setPosition({
                x: 0,
                y: 0
            }, true);

            var w = Math.ceil(this.width / scale) + 1;
            var h = Math.ceil(this.height / scale) + 1;

            var container = this.layers.tileSprites;

            for (var i = 0; i < w; i++) {
                for (var j = 0; j < h; j++) {
                    var ii = i / 10;
                    var alpha = Math.sin(((j * 0.2) % 5) + Math.cos(ii % 8));
                    var tile = 5;
                    if (j < 7)
                        tile = 5;
                    else if (alpha < -0.2)
                        tile = 3;
                    else if (alpha < 0.2)
                        tile = 4;
                    else if ((alpha < 0.5) && (j > 7))
                        tile = 53;

                    alpha = Math.random();

                    if (tile == 5)
                        alpha *= 2;
                    else if (tile == 3)
                        alpha *= 1;
                    else if (tile == 4)
                        alpha *= 1;
                    else if (tile == 53)
                        alpha *= 2;

                    alpha = Math.min(Math.max(0.15, alpha), 0.65);

                    if (Math.random() < 0.35) {
                        tile = {
                            '2': 7,
                            '5': 6,
                            '3': 0,
                            '4': 1,
                            '53': 54
                        }[tile];
                    }

                    var tile = new pixi.Sprite(this.getTexture('sprites', tile));

                    tile.alpha = alpha;
                    tile.position.x = i * scale;
                    tile.position.y = j * scale;
                    tile.width = scale;
                    tile.height = scale;

                    if (Math.random() < 0.5) {
                        tile.position.x += scale;
                        tile.scale.x = -scaleMult;
                    }

                    container.addChild(tile);
                }
            }
        },

        onResize: function () {
            var zoom = window.devicePixelRatio;

            this.width = $('body').width() * zoom;
            this.height = $('body').height() * zoom;

            this.showTilesW = Math.ceil((this.width / scale) / 2) + 3;
            this.showTilesH = Math.ceil((this.height / scale) / 2) + 3;

            this.renderer.resize(this.width, this.height);
            if (window.player) {
                this.setPosition({
                    x: (window.player.x - (this.width / (scale * 2))) * scale,
                    y: (window.player.y - (this.height / (scale * 2))) * scale
                }, true);
            }

            if (this.titleScreen) {
                this.clean();
                this.buildTitleScreen();
            }

            events.emit('onResize');
        },

        getTexture: function (baseTex, cell, size) {
            size = size || 8;
            var name = baseTex + '_' + cell;

            var textureCache = this.textureCache;

            var cached = textureCache[name];

            if (!cached) {
                var y = ~~(cell / 8);
                var x = cell - (y * 8);
                cached = new pixi.Texture(this.textures[baseTex], new pixi.Rectangle(x * size, y * size, size, size));
                textureCache[name] = cached;
            }

            return cached;
        },

        clean: function () {
            this.stage.removeChild(this.layers.hiders);
            this.layers.hiders = new pixi.Container();
            this.layers.hiders.layer = 'hiders';
            this.stage.addChild(this.layers.hiders);

            var container = this.layers.tileSprites;
            this.stage.removeChild(container);

            this.layers.tileSprites = container = new pixi.Container();
            container.layer = 'tiles';
            this.stage.addChild(container);

            this.stage.children.sort(function (a, b) {
                if (a.layer == 'hiders')
                    return 1;
                else if (b.layer == 'hiders')
                    return -1;
                else if (a.layer == 'tiles')
                    return -1;
                else if (b.layer == 'tiles')
                    return 1;
                else
                    return 0;
            }, this);
        },

        onGetMapCustomization: function (msg) {
            if (!msg.collide) {
                var children = this.layers.tiles.children;
                var cLen = children.length;
                var x = msg.x * scale;
                var y = msg.y * scale;
                for (var i = cLen - 1; i >= 0; i--) {
                    var c = children[i];
                    var cx = c.x;
                    if (c.scale.x < 0)
                        cx -= scale;
                    if ((cx == x) && (c.y == y)) {
                        c.parent.removeChild(c);
                        break;
                    }
                }
            }

            var tile = new pixi.Sprite(this.getTexture('sprites', msg.tile))

            tile.alpha = tileOpacity.map(msg.tile);
            tile.position.x = msg.x * scale;
            tile.position.y = msg.y * scale;
            tile.width = scale;
            tile.height = scale;

            if (Math.random() < 0.5) {
                tile.position.x += scale;
                tile.scale.x = -scaleMult;
            }

            this.layers.tiles.addChild(tile);

            physics.collisionMap[msg.x][msg.y] = msg.collide;
            physics.graph.grid[msg.x][msg.y] = !msg.collide;
        },

        buildTile: function (c, i, j) {
            var alpha = tileOpacity.map(c);
            var canFlip = tileOpacity.canFlip(c);

            var tile = new pixi.Sprite(this.getTexture('sprites', c));

            tile.alpha = alpha;
            tile.position.x = i * scale;
            tile.position.y = j * scale;
            tile.width = scale;
            tile.height = scale;

            if (canFlip) {
                if (Math.random() < 0.5) {
                    tile.position.x += scale;
                    tile.scale.x = -scaleMult;
                }
            }

            return tile;
        },

        onGetMap: function (msg) {
            this.titleScreen = false;
            physics.init(msg.collisionMap);

            var map = this.map = msg.map;
            var w = this.w = map.length;
            var h = this.h = map[0].length;

            for (var i = 0; i < w; i++) {
                for (var j = 0; j < h; j++) {
                    if (!map[i][j].split)
                        map[i][j] += '';

                    map[i][j] = map[i][j].split(',');
                }
            }

            this.clean();
            spritePool.clean();

            this.stage.filters = [new PIXI.filters.VoidFilter()];
            this.stage.filterArea = new PIXI.Rectangle(0, 0, w * scale, h * scale);

            this.hiddenRooms = msg.hiddenRooms;

            this.sprites = _.get2dArray(w, h, 'array');

            this.stage.children.sort(function (a, b) {
                if (a.layer == 'tiles')
                    return -1;
                else if (b.layer == 'tiles')
                    return 1;
                else
                    return 0;
            }, this);

            if (this.zoneId != null)
                events.emit('onRezone', this.zoneId);
            this.zoneId = msg.zoneId;

            msg.clientObjects.forEach(function (c) {
                c.zoneId = this.zoneId;
                events.emit('onGetObject', c);
            }, this);
        },

        setPosition: function (pos, instant) {
            pos.x += 16;
            pos.y += 16;

            var player = window.player;
            if (player) {
                var px = player.x;
                var py = player.y;

                var hiddenRooms = this.hiddenRooms;
                var hLen = hiddenRooms.length;
                for (var i = 0; i < hLen; i++) {
                    var h = hiddenRooms[i];
                    if (!h.discoverable)
                        continue;

                    if (
                        (
                            (px < h.x) ||
                            (px >= h.x + h.width) ||
                            (py < h.y) ||
                            (py >= h.y + h.height)
                        ) ||
                        (!physics.isInPolygon(px, py, h.area))
                    )
                        continue;

                    h.discovered = true;
                }
            }

            if (instant) {
                this.moveTo = null;
                this.pos = pos;
                this.stage.x = -~~this.pos.x;
                this.stage.y = -~~this.pos.y;
            } else
                this.moveTo = pos;

            this.updateSprites();
        },

        isVisible: function (x, y) {
            var stage = this.stage;
            var sx = -stage.x;
            var sy = -stage.y;

            var sw = this.width;
            var sh = this.height;

            return (!((x < sx) || (y < sy) || (x >= sx + sw) || (y >= sy + sh)));
        },

        isHidden: function (x, y) {
            var hiddenRooms = this.hiddenRooms;
            var hLen = hiddenRooms.length;
            if (hLen == 0)
                return false;

            var player = window.player;
            var px = player.x;
            var py = player.y;

            var hidden = false;
            for (var i = 0; i < hLen; i++) {
                var h = hiddenRooms[i];

                var outsideHider = (
                    (x < h.x) ||
                    (x >= h.x + h.width) ||
                    (y < h.y) ||
                    (y >= h.y + h.height)
                );

                if (outsideHider)
                    continue;

                var inHider = physics.isInPolygon(x, y, h.area);

                if (!inHider)
                    continue;

                if (h.discovered)
                    return false;

                outsideHider = (
                    (px < h.x) ||
                    (px >= h.x + h.width) ||
                    (py < h.y) ||
                    (py >= h.y + h.height)
                );

                if (outsideHider) {
                    hidden = true;
                    continue;
                }

                inHider = physics.isInPolygon(px, py, h.area);

                if (inHider)
                    return false;
                else
                    hidden = true;
            }

            return hidden;
        },

        updateSprites: function () {
            if (this.titleScreen)
                return;

            var player = window.player;
            if (!player)
                return;

            var w = this.w;
            var h = this.h;

            var x = ~~((-this.stage.x / scale) + (this.width / (scale * 2)));
            var y = ~~((-this.stage.y / scale) + (this.height / (scale * 2)));

            this.lastUpdatePos.x = this.stage.x;
            this.lastUpdatePos.y = this.stage.y;

            var sprites = this.sprites;
            var map = this.map;
            var container = this.layers.tileSprites;

            var sw = this.showTilesW;
            var sh = this.showTilesH;

            var lowX = Math.max(0, x - sw + 1);
            var lowY = Math.max(0, y - sh + 2);
            var highX = Math.min(w, x + sw - 2);
            var highY = Math.min(h, y + sh - 2);

            var addedSprite = false;

            var isHidden = this.isHidden.bind(this);

            var newVisible = [];
            var newHidden = [];

            for (var i = lowX; i < highX; i++) {
                var mapRow = map[i];
                var spriteRow = sprites[i];
                for (var j = lowY; j < highY; j++) {
                    cell = mapRow[j];
                    if (!cell)
                        continue;
                    var cLen = cell.length;
                    if (!cLen)
                        return;

                    var rendered = spriteRow[j];
                    var isHidden = this.isHidden(i, j);
                    if (rendered.length > 0) {
                        if (!isHidden)
                            continue;
                        else {
                            newHidden.push({
                                x: i,
                                y: j
                            });

                            var rLen = rendered.length;
                            for (var k = 0; k < rLen; k++) {
                                var sprite = rendered[k];
                                sprite.visible = false;
                                spritePool.store(sprite);
                            }
                            spriteRow[j] = [];

                            continue;
                        }
                    } else if (isHidden)
                        continue;

                    newVisible.push({
                        x: i,
                        y: j
                    });

                    for (var k = 0; k < cLen; k++) {
                        var c = cell[k];
                        if (c == 0)
                            continue;

                        c--;

                        var flipped = '';
                        if (tileOpacity.canFlip(c)) {
                            if (mRandom() < 0.5)
                                flipped = 'flip';
                        }

                        var tile = spritePool.getSprite(flipped + c);
                        if (!tile) {
                            tile = this.buildTile(c, i, j);
                            container.addChild(tile);
                            tile.type = c;
                            tile.sheetNum = tileOpacity.getSheetNum(c);
                            addedSprite = true;
                        } else {
                            tile.position.x = i * scale;
                            tile.position.y = j * scale;
                            if (flipped != '')
                                tile.position.x += scale;
                            tile.visible = true;
                        }

                        tile.z = k;

                        rendered.push(tile);
                    }
                }
            }

            lowX = Math.max(0, lowX - 10);
            lowY = Math.max(0, lowY - 10);
            highX = Math.min(w - 1, highX + 10);
            highY = Math.min(h - 1, highY + 10);

            for (var i = lowX; i < highX; i++) {
                var spriteRow = sprites[i];
                var outside = ((i >= x - sw) && (i < x + sw));
                for (var j = lowY; j < highY; j++) {
                    if ((outside) && (j >= y - sh) && (j < y + sh))
                        continue;

                    var list = spriteRow[j];
                    var lLen = list.length;
                    for (var k = 0; k < lLen; k++) {
                        var sprite = list[k];
                        sprite.visible = false;
                        spritePool.store(sprite);
                    }
                    spriteRow[j] = [];
                }
            }

            events.emit('onTilesVisible', newVisible, true);
            events.emit('onTilesVisible', newHidden, false);

            if (addedSprite) {
                container.children.sort(function (a, b) {
                    return (a.z - b.z);
                });
            }
        },

        update: function () {
            var time = +new Date;

            if (this.moveTo) {
                var deltaX = this.moveTo.x - this.pos.x;
                var deltaY = this.moveTo.y - this.pos.y;

                if ((deltaX != 0) || (deltaY != 0)) {
                    var moveSpeed = this.moveSpeed;
                    var distance = Math.max(Math.abs(deltaX), Math.abs(deltaY));

                    var moveSpeedMax = this.moveSpeedMax;
                    if (distance > 100)
                        moveSpeedMax *= 1.75;
                    if (this.moveSpeed < moveSpeedMax)
                        this.moveSpeed += this.moveSpeedInc;

                    var elapsed = time - this.lastTick;
                    moveSpeed *= (elapsed / 16.67);

                    if (moveSpeed > distance)
                        moveSpeed = distance;

                    deltaX = (deltaX / distance) * moveSpeed;
                    deltaY = (deltaY / distance) * moveSpeed;

                    this.pos.x = this.pos.x + (deltaX);
                    this.pos.y = this.pos.y + (deltaY);
                } else {
                    this.moveSpeed = 0;
                    this.moveTo = null;
                }

                var stage = this.stage;
                stage.x = -~~this.pos.x;
                stage.y = -~~this.pos.y;

                var halfScale = scale / 2;
                if ((Math.abs(stage.x - this.lastUpdatePos.x) > halfScale) || (Math.abs(stage.y - this.lastUpdatePos.y) > halfScale))
                    this.updateSprites();

                events.emit('onSceneMove');
            }

            this.lastTick = time;
        },

        buildContainer: function (obj) {
            var container = new pixi.Container;
            this.layers[obj.layerName || obj.sheetName].addChild(container);

            return container;
        },

        buildRectangle: function (obj) {
            var graphics = new pixi.Graphics;

            var alpha = obj.alpha;
            if (alpha != null)
                graphics.alpha = alpha;

            var fillAlpha = obj.fillAlpha;
            if (fillAlpha == null)
                fillAlpha = 1;

            graphics.beginFill(obj.color || '0x48edff', fillAlpha);

            if (obj.strokeColor)
                graphics.lineStyle(scaleMult, obj.strokeColor);

            graphics.drawRect(0, 0, obj.w, obj.h);

            graphics.endFill();

            (obj.parent || this.layers[obj.layerName || obj.sheetName]).addChild(graphics);

            graphics.position.x = obj.x;
            graphics.position.y = obj.y;

            return graphics;
        },

        moveRectangle: function (obj) {
            obj.sprite.position.x = obj.x;
            obj.sprite.position.y = obj.y;
            obj.sprite.width = obj.w;
            obj.sprite.height = obj.h;
        },

        buildObject: function (obj) {
            var w = 8;
            var h = 8;
            if (obj.w) {
                w = obj.w / scaleMult;
                h = obj.h / scaleMult;
            }

            var bigSheets = ['bosses', 'bigObjects', 'animBigObjects'];
            if ((bigSheets.indexOf(obj.sheetName) > -1) || (obj.sheetName.indexOf('bosses') > -1)) {
                obj.layerName = 'mobs';
                w = 24;
                h = 24;
                obj.w = w * scaleMult;
                obj.h = h * scaleMult;
            }

            var sprite = new pixi.Sprite(this.getTexture(obj.sheetName, obj.cell, w))
            sprite.x = obj.x * scale;
            sprite.y = obj.y * scale;
            sprite.width = obj.w || scale;
            sprite.height = obj.h || scale;

            if ((bigSheets.indexOf(obj.sheetName) > -1) || (obj.sheetName.indexOf('bosses') > -1)) {
                sprite.x -= scale;
                sprite.y -= (scale * 2);
            }

            if (obj.flipX) {
                sprite.scale.x *= -1;
                if (bigSheets.indexOf(obj.sheetName) > -1)
                    sprite.x += (scale * 2);
                else
                    sprite.x += scale;
            }

            (obj.parent || this.layers[obj.layerName || obj.sheetName] || this.layers.objects).addChild(sprite);

            return sprite;
        },

        addFilter: function (sprite) {
            var thickness = 16;
            if (sprite.width > scale)
                thickness = 8;

            var filter = new shaderOutline(this.renderer.width, this.renderer.height, thickness, '0xffffff');

            if (!sprite.filters)
                sprite.filters = [filter];
            else
                sprite.filters.push();

            return filter;
        },

        removeFilter: function (sprite, filter) {
            if (!sprite.filters)
                return;

            sprite.filters = null;
        },

        buildText: function (obj) {
            var textSprite = new pixi.Text(obj.text, {
                fontFamily: 'bitty',
                fontSize: (obj.fontSize || 14),
                fill: obj.color || 0xF2F5F5,
                stroke: 0x2d2136,
                strokeThickness: 4,
                align: 'center'
            });

            textSprite.x = obj.x - (textSprite.width / 2);
            textSprite.y = obj.y;

            var parent = obj.parent || this.layers[obj.layerName]
            parent.addChild(textSprite);

            return textSprite;
        },

        buildEmitter: function (config) {
            var emitter = particles.buildEmitter(config);

            return emitter;
        },

        destroyEmitter: function (emitter) {
            particles.destroyEmitter(emitter);
        },

        setSprite: function (obj) {
            var cell = obj.cell;
            var y = ~~(cell / 8);
            var x = cell - (y * 8);

            var baseTex = this.textures[obj.sheetName];
            obj.sprite.texture = this.getTexture(obj.sheetName, obj.cell, obj.sprite.width / scaleMult);
        },

        reorder: function (sprite) {
            var mobLayer = this.layers.mobs;
            var mobs = mobLayer.children;
            mobs.sort(function (a, b) {
                return (b.y - a.y);
            });
        },

        destroyObject: function (obj) {
            if (!obj.sprite.parent)
                return;
            obj.sprite.parent.removeChild(obj.sprite);
        },

        render: function () {
            if (!this.stage)
                return;

            effects.render();
            particles.update();

            this.renderer.render(this.stage);
        }
    };
>>>>>>> 555-new-dungeon
});
