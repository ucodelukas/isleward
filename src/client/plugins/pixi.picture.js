let __extends = (this && this.__extends) || (function () {
	let extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) {
        	d.__proto__ = b; 
        }) ||
        function (d, b) {
        	for (let p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; 
        };
	return function (d, b) {
		extendStatics(d, b);
		function __ () {
			this.constructor = d; 
		}
		d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
})();
var pixi_picture;
(function (pixi_picture) {
	function filterManagerMixin (fm) {
		if (fm.prepareBackdrop)
			return;
		fm.pushFilter = pushFilter;
		fm.popFilter = popFilter;
		fm.syncUniforms = syncUniforms;
		fm.prepareBackdrop = prepareBackdrop;
	}
	pixi_picture.filterManagerMixin = filterManagerMixin;
	function pushFilter (target, filters) {
		let renderer = this.renderer;
		let filterData = this.filterData;
		if (!filterData) {
			filterData = this.renderer._activeRenderTarget.filterStack;
			let filterState = new FilterState();
			filterState.sourceFrame = filterState.destinationFrame = this.renderer._activeRenderTarget.size;
			filterState.renderTarget = renderer._activeRenderTarget;
			this.renderer._activeRenderTarget.filterData = filterData = {
				index: 0,
				stack: [filterState]
			};
			this.filterData = filterData;
		}
		let currentState = filterData.stack[++filterData.index];
		let renderTargetFrame = filterData.stack[0].destinationFrame;
		if (!currentState) 
			currentState = filterData.stack[filterData.index] = new FilterState();
        
		let fullScreen = target.filterArea
            && target.filterArea.x === 0
            && target.filterArea.y === 0
            && target.filterArea.width === renderer.screen.width
            && target.filterArea.height === renderer.screen.height;
		let resolution = filters[0].resolution;
		let padding = filters[0].padding | 0;
		let targetBounds = fullScreen ? renderer.screen : (target.filterArea || target.getBounds(true));
		let sourceFrame = currentState.sourceFrame;
		let destinationFrame = currentState.destinationFrame;
		sourceFrame.x = ((targetBounds.x * resolution) | 0) / resolution;
		sourceFrame.y = ((targetBounds.y * resolution) | 0) / resolution;
		sourceFrame.width = ((targetBounds.width * resolution) | 0) / resolution;
		sourceFrame.height = ((targetBounds.height * resolution) | 0) / resolution;
		if (!fullScreen) {
			if (filterData.stack[0].renderTarget.transform) {
			} else if (filters[0].autoFit) 
				sourceFrame.fit(renderTargetFrame);
            
			sourceFrame.pad(padding);
		}
		for (let i = 0; i < filters.length; i++) {
			let backdrop = null;
			if (filters[i].backdropUniformName) {
				if (backdrop === null) 
					backdrop = this.prepareBackdrop(sourceFrame);
                
				filters[i]._backdropRenderTarget = backdrop;
			}
		}
		destinationFrame.width = sourceFrame.width;
		destinationFrame.height = sourceFrame.height;
		let renderTarget = this.getPotRenderTarget(renderer.gl, sourceFrame.width, sourceFrame.height, resolution);
		currentState.target = target;
		currentState.filters = filters;
		currentState.resolution = resolution;
		currentState.renderTarget = renderTarget;
		renderTarget.setFrame(destinationFrame, sourceFrame);
		renderer.bindRenderTarget(renderTarget);
		renderTarget.clear(filters[filters.length - 1].clearColor);
	}
	function popFilter () {
		let filterData = this.filterData;
		let lastState = filterData.stack[filterData.index - 1];
		let currentState = filterData.stack[filterData.index];
		this.quad.map(currentState.renderTarget.size, currentState.sourceFrame).upload();
		let filters = currentState.filters;
		if (filters.length === 1) {
			filters[0].apply(this, currentState.renderTarget, lastState.renderTarget, false, currentState);
			this.freePotRenderTarget(currentState.renderTarget);
		} else {
			let flip = currentState.renderTarget;
			let flop = this.getPotRenderTarget(this.renderer.gl, currentState.sourceFrame.width, currentState.sourceFrame.height, currentState.resolution);
			flop.setFrame(currentState.destinationFrame, currentState.sourceFrame);
			flop.clear();
			var i = 0;
			for (i = 0; i < filters.length - 1; ++i) {
				filters[i].apply(this, flip, flop, true, currentState);
				let t = flip;
				flip = flop;
				flop = t;
			}
			filters[i].apply(this, flip, lastState.renderTarget, false, currentState);
			this.freePotRenderTarget(flip);
			this.freePotRenderTarget(flop);
		}
		currentState.clear();
		let backdropFree = false;
		for (var i = 0; i < filters.length; i++) {
			if (filters[i]._backdropRenderTarget) {
				if (!backdropFree) {
					this.freePotRenderTarget(filters[i]._backdropRenderTarget);
					backdropFree = true;
				}
				filters[i]._backdropRenderTarget = null;
			}
		}
		filterData.index--;
		if (filterData.index === 0) 
			this.filterData = null;
	}
	function syncUniforms (shader, filter) {
		let renderer = this.renderer;
		let gl = renderer.gl;
		let uniformData = filter.uniformData;
		let uniforms = filter.uniforms;
		let textureCount = 1;
		let currentState;
		if (shader.uniforms.filterArea) {
			currentState = this.filterData.stack[this.filterData.index];
			let filterArea = shader.uniforms.filterArea;
			filterArea[0] = currentState.renderTarget.size.width;
			filterArea[1] = currentState.renderTarget.size.height;
			filterArea[2] = currentState.sourceFrame.x;
			filterArea[3] = currentState.sourceFrame.y;
			shader.uniforms.filterArea = filterArea;
		}
		if (shader.uniforms.filterClamp) {
			currentState = currentState || this.filterData.stack[this.filterData.index];
			let filterClamp = shader.uniforms.filterClamp;
			filterClamp[0] = 0;
			filterClamp[1] = 0;
			filterClamp[2] = (currentState.sourceFrame.width - 1) / currentState.renderTarget.size.width;
			filterClamp[3] = (currentState.sourceFrame.height - 1) / currentState.renderTarget.size.height;
			shader.uniforms.filterClamp = filterClamp;
		}
		for (let i in uniformData) {
			if (!shader.uniforms.data[i]) 
				continue;
            
			if (i === filter.backdropUniformName) {
				let rt = filter._backdropRenderTarget;
				shader.uniforms[i] = textureCount;
				renderer.boundTextures[textureCount] = renderer.emptyTextures[textureCount];
				gl.activeTexture(gl.TEXTURE0 + textureCount);
				gl.bindTexture(gl.TEXTURE_2D, rt.texture.texture);
				textureCount++;
				continue;
			}
			let type = uniformData[i].type;
			if (type === 'sampler2d' && uniforms[i] !== 0) {
				if (uniforms[i].baseTexture) 
					shader.uniforms[i] = this.renderer.bindTexture(uniforms[i].baseTexture, textureCount);
                
				else {
					shader.uniforms[i] = textureCount;
					let gl_1 = this.renderer.gl;
					renderer.boundTextures[textureCount] = renderer.emptyTextures[textureCount];
					gl_1.activeTexture(gl_1.TEXTURE0 + textureCount);
					uniforms[i].texture.bind();
				}
				textureCount++;
			} else if (type === 'mat3') {
				if (uniforms[i].a !== undefined) 
					shader.uniforms[i] = uniforms[i].toArray(true);
                
				else 
					shader.uniforms[i] = uniforms[i];
			} else if (type === 'vec2') {
				if (uniforms[i].x !== undefined) {
					let val = shader.uniforms[i] || new Float32Array(2);
					val[0] = uniforms[i].x;
					val[1] = uniforms[i].y;
					shader.uniforms[i] = val;
				} else 
					shader.uniforms[i] = uniforms[i];
			} else if (type === 'float') {
				if (shader.uniforms.data[i].value !== uniformData[i]) 
					shader.uniforms[i] = uniforms[i];
			} else 
				shader.uniforms[i] = uniforms[i];
		}
	}
	function prepareBackdrop (bounds) {
		let renderer = this.renderer;
		let renderTarget = renderer._activeRenderTarget;
		if (renderTarget.root) 
			return null;
        
		let resolution = renderTarget.resolution;
		let fr = renderTarget.sourceFrame || renderTarget.destinationFrame;
		bounds.fit(fr);
		let x = (bounds.x - fr.x) * resolution;
		let y = (bounds.y - fr.y) * resolution;
		let w = (bounds.width) * resolution;
		let h = (bounds.height) * resolution;
		let gl = renderer.gl;
		let rt = this.getPotRenderTarget(gl, w, h, 1);
		renderer.boundTextures[1] = renderer.emptyTextures[1];
		gl.activeTexture(gl.TEXTURE0 + 1);
		gl.bindTexture(gl.TEXTURE_2D, rt.texture.texture);
		if (!rt.rebound) {
			renderer._activeRenderTarget = null;
			renderer.bindRenderTarget(renderTarget);
			rt.rebound = true;
		}
		gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, x, y, w, h);
		return rt;
	}
	var FilterState = (function () {
		function FilterState () {
			this.renderTarget = null;
			this.target = null;
			this.resolution = 1;
			this.sourceFrame = new PIXI.Rectangle();
			this.destinationFrame = new PIXI.Rectangle();
			this.filters = [];
		}
		FilterState.prototype.clear = function () {
			this.filters = null;
			this.target = null;
			this.renderTarget = null;
		};
		return FilterState;
	})();
	let BackdropFilter = (function (_super) {
		__extends(BackdropFilter, _super);
		function BackdropFilter () {
			let _this = _super !== null && _super.apply(this, arguments) || this;
			_this.backdropUniformName = null;
			_this._backdropRenderTarget = null;
			_this.clearColor = null;
			return _this;
		}
		return BackdropFilter;
	})(PIXI.Filter);
	pixi_picture.BackdropFilter = BackdropFilter;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
	let shaderLib = [
		{
			vertUniforms: '',
			vertCode: 'vTextureCoord = aTextureCoord;',
			fragUniforms: 'uniform vec4 uTextureClamp;',
			fragCode: 'vec2 textureCoord = clamp(vTextureCoord, uTextureClamp.xy, uTextureClamp.zw);'
		},
		{
			vertUniforms: 'uniform mat3 uTransform;',
			vertCode: 'vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;',
			fragUniforms: '',
			fragCode: 'vec2 textureCoord = vTextureCoord;'
		},
		{
			vertUniforms: 'uniform mat3 uTransform;',
			vertCode: 'vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;',
			fragUniforms: 'uniform mat3 uMapCoord;\nuniform vec4 uClampFrame;\nuniform vec2 uClampOffset;',
			fragCode: 'vec2 textureCoord = mod(vTextureCoord - uClampOffset, vec2(1.0, 1.0)) + uClampOffset;' +
                '\ntextureCoord = (uMapCoord * vec3(textureCoord, 1.0)).xy;' +
                '\ntextureCoord = clamp(textureCoord, uClampFrame.xy, uClampFrame.zw);'
		}
	];
	let PictureShader = (function (_super) {
		__extends(PictureShader, _super);
		function PictureShader (gl, vert, frag, tilingMode) {
			let _this = this;
			let lib = shaderLib[tilingMode];
			_this = _super.call(this, gl, vert.replace(/%SPRITE_UNIFORMS%/gi, lib.vertUniforms)
				.replace(/%SPRITE_CODE%/gi, lib.vertCode), frag.replace(/%SPRITE_UNIFORMS%/gi, lib.fragUniforms)
				.replace(/%SPRITE_CODE%/gi, lib.fragCode)) || this;
			_this.bind();
			_this.tilingMode = tilingMode;
			_this.tempQuad = new PIXI.Quad(gl);
			_this.tempQuad.initVao(_this);
			_this.uniforms.uColor = new Float32Array([1, 1, 1, 1]);
			_this.uniforms.uSampler = [0, 1];
			return _this;
		}
		PictureShader.blendVert = '\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\nuniform mat3 mapMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vMapCoord;\n%SPRITE_UNIFORMS%\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    %SPRITE_CODE%\n    vMapCoord = (mapMatrix * vec3(aVertexPosition, 1.0)).xy;\n}\n';
		return PictureShader;
	})(PIXI.Shader);
	pixi_picture.PictureShader = PictureShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
	let overlayFrag = '\nvarying vec2 vTextureCoord;\nvarying vec2 vMapCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler[2];\nuniform vec4 uColor;\n%SPRITE_UNIFORMS%\n\nvoid main(void)\n{\n    %SPRITE_CODE%\n    vec4 source = texture2D(uSampler[0], textureCoord) * uColor;\n    vec4 target = texture2D(uSampler[1], vMapCoord);\n\n    //reverse hardlight\n    if (source.a == 0.0) {\n        gl_FragColor = vec4(0, 0, 0, 0);\n        return;\n    }\n    //yeah, premultiplied\n    vec3 Cb = source.rgb/source.a, Cs;\n    if (target.a > 0.0) {\n        Cs = target.rgb / target.a;\n    }\n    vec3 multiply = Cb * Cs * 2.0;\n    vec3 Cs2 = Cs * 2.0 - 1.0;\n    vec3 screen = Cb + Cs2 - Cb * Cs2;\n    vec3 B;\n    if (Cb.r <= 0.5) {\n        B.r = multiply.r;\n    } else {\n        B.r = screen.r;\n    }\n    if (Cb.g <= 0.5) {\n        B.g = multiply.g;\n    } else {\n        B.g = screen.g;\n    }\n    if (Cb.b <= 0.5) {\n        B.b = multiply.b;\n    } else {\n        B.b = screen.b;\n    }\n    vec4 res;\n    res.xyz = (1.0 - source.a) * Cs + source.a * B;\n    res.a = source.a + target.a * (1.0-source.a);\n    gl_FragColor = vec4(res.xyz * res.a, res.a);\n}\n';
	let HardLightShader = (function (_super) {
		__extends(HardLightShader, _super);
		function HardLightShader (gl, tilingMode) {
			return _super.call(this, gl, pixi_picture.PictureShader.blendVert, overlayFrag, tilingMode) || this;
		}
		return HardLightShader;
	})(pixi_picture.PictureShader);
	pixi_picture.HardLightShader = HardLightShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
	function mapFilterBlendModesToPixi (gl, array) {
		if (array === void 0) array = []; 
		array[PIXI.BLEND_MODES.OVERLAY] = [new pixi_picture.OverlayShader(gl, 0), new pixi_picture.OverlayShader(gl, 1), new pixi_picture.OverlayShader(gl, 2)];
		array[PIXI.BLEND_MODES.HARD_LIGHT] = [new pixi_picture.HardLightShader(gl, 0), new pixi_picture.HardLightShader(gl, 1), new pixi_picture.HardLightShader(gl, 2)];
		array[PIXI.BLEND_MODES.SOFT_LIGHT] = [new pixi_picture.SoftLightShader(gl, 0), new pixi_picture.SoftLightShader(gl, 1), new pixi_picture.SoftLightShader(gl, 2)];
		return array;
	}
	pixi_picture.mapFilterBlendModesToPixi = mapFilterBlendModesToPixi;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
	let normalFrag = '\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler[2];\nuniform vec4 uColor;\n%SPRITE_UNIFORMS%\n\nvoid main(void)\n{\n    %SPRITE_CODE%\n\n    vec4 sample = texture2D(uSampler[0], textureCoord);\n    gl_FragColor = sample * uColor;\n}\n';
	let normalVert = '\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n%SPRITE_UNIFORMS%\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    %SPRITE_CODE%\n}\n';
	let NormalShader = (function (_super) {
		__extends(NormalShader, _super);
		function NormalShader (gl, tilingMode) {
			return _super.call(this, gl, normalVert, normalFrag, tilingMode) || this;
		}
		return NormalShader;
	})(pixi_picture.PictureShader);
	pixi_picture.NormalShader = NormalShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
	let overlayFrag = '\nvarying vec2 vTextureCoord;\nvarying vec2 vMapCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler[2];\nuniform vec4 uColor;\n%SPRITE_UNIFORMS%\n\nvoid main(void)\n{\n    %SPRITE_CODE%\n    vec4 source = texture2D(uSampler[0], textureCoord) * uColor;\n    vec4 target = texture2D(uSampler[1], vMapCoord);\n\n    //reverse hardlight\n    if (source.a == 0.0) {\n        gl_FragColor = vec4(0, 0, 0, 0);\n        return;\n    }\n    //yeah, premultiplied\n    vec3 Cb = source.rgb/source.a, Cs;\n    if (target.a > 0.0) {\n        Cs = target.rgb / target.a;\n    }\n    vec3 multiply = Cb * Cs * 2.0;\n    vec3 Cb2 = Cb * 2.0 - 1.0;\n    vec3 screen = Cb2 + Cs - Cb2 * Cs;\n    vec3 B;\n    if (Cs.r <= 0.5) {\n        B.r = multiply.r;\n    } else {\n        B.r = screen.r;\n    }\n    if (Cs.g <= 0.5) {\n        B.g = multiply.g;\n    } else {\n        B.g = screen.g;\n    }\n    if (Cs.b <= 0.5) {\n        B.b = multiply.b;\n    } else {\n        B.b = screen.b;\n    }\n    vec4 res;\n    res.xyz = (1.0 - source.a) * Cs + source.a * B;\n    res.a = source.a + target.a * (1.0-source.a);\n    gl_FragColor = vec4(res.xyz * res.a, res.a);\n}\n';
	let OverlayShader = (function (_super) {
		__extends(OverlayShader, _super);
		function OverlayShader (gl, tilingMode) {
			return _super.call(this, gl, pixi_picture.PictureShader.blendVert, overlayFrag, tilingMode) || this;
		}
		return OverlayShader;
	})(pixi_picture.PictureShader);
	pixi_picture.OverlayShader = OverlayShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
	let WRAP_MODES = PIXI.WRAP_MODES;
	function nextPow2 (v) {
		v += (v === 0) ? 1 : 0;
		--v;
		v |= v >>> 1;
		v |= v >>> 2;
		v |= v >>> 4;
		v |= v >>> 8;
		v |= v >>> 16;
		return v + 1;
	}
	let PictureRenderer = (function (_super) {
		__extends(PictureRenderer, _super);
		function PictureRenderer (renderer) {
			return _super.call(this, renderer) || this;
		}
		PictureRenderer.prototype.onContextChange = function () {
			pixi_picture.filterManagerMixin(this.renderer.filterManager);
			let gl = this.renderer.gl;
			this.drawModes = pixi_picture.mapFilterBlendModesToPixi(gl);
			this.normalShader = [new pixi_picture.NormalShader(gl, 0), new pixi_picture.NormalShader(gl, 1), new pixi_picture.NormalShader(gl, 2)];
			this._tempClamp = new Float32Array(4);
			this._tempColor = new Float32Array(4);
			this._tempRect = new PIXI.Rectangle();
			this._tempRect2 = new PIXI.Rectangle();
			this._tempRect3 = new PIXI.Rectangle();
			this._tempMatrix = new PIXI.Matrix();
			this._tempMatrix2 = new PIXI.Matrix();
			this._bigBuf = new Uint8Array(1 << 20);
			this._renderTexture = new PIXI.BaseRenderTexture(1024, 1024);
		};
		PictureRenderer.prototype.start = function () {
		};
		PictureRenderer.prototype.flush = function () {
		};
		PictureRenderer.prototype._getRenderTexture = function (minWidth, minHeight) {
			if (this._renderTexture.width < minWidth ||
                this._renderTexture.height < minHeight) {
				minWidth = nextPow2(minWidth);
				minHeight = nextPow2(minHeight);
				this._renderTexture.resize(minWidth, minHeight);
			}
			return this._renderTexture;
		};
		PictureRenderer.prototype._getBuf = function (size) {
			let buf = this._bigBuf;
			if (buf.length < size) {
				size = nextPow2(size);
				buf = new Uint8Array(size);
				this._bigBuf = buf;
			}
			return buf;
		};
		PictureRenderer.prototype.render = function (sprite) {
			if (!sprite.texture.valid) 
				return;
            
			let tilingMode = 0;
			if (sprite.tileTransform) 
				tilingMode = this._isSimpleSprite(sprite) ? 1 : 2;
            
			let blendShader = this.drawModes[sprite.blendMode];
			if (blendShader) 
				this._renderBlend(sprite, blendShader[tilingMode]);
            
			else 
				this._renderNormal(sprite, this.normalShader[tilingMode]);
		};
		PictureRenderer.prototype._renderNormal = function (sprite, shader) {
			let renderer = this.renderer;
			renderer.bindShader(shader);
			renderer.state.setBlendMode(sprite.blendMode);
			this._renderInner(sprite, shader);
		};
		PictureRenderer.prototype._renderBlend = function (sprite, shader) {
			let renderer = this.renderer;
			let spriteBounds = sprite.getBounds();
			let renderTarget = renderer._activeRenderTarget;
			let matrix = renderTarget.projectionMatrix;
			let flipX = matrix.a < 0;
			let flipY = matrix.d < 0;
			let resolution = renderTarget.resolution;
			let screen = this._tempRect;
			let fr = renderTarget.sourceFrame || renderTarget.destinationFrame;
			screen.x = 0;
			screen.y = 0;
			screen.width = fr.width;
			screen.height = fr.height;
			let bounds = this._tempRect2;
			let fbw = fr.width * resolution, fbh = fr.height * resolution;
			bounds.x = (spriteBounds.x + matrix.tx / matrix.a) * resolution + fbw / 2;
			bounds.y = (spriteBounds.y + matrix.ty / matrix.d) * resolution + fbh / 2;
			bounds.width = spriteBounds.width * resolution;
			bounds.height = spriteBounds.height * resolution;
			if (flipX) 
				bounds.y = fbw - bounds.width - bounds.x;
            
			if (flipY) 
				bounds.y = fbh - bounds.height - bounds.y;
            
			let screenBounds = this._tempRect3;
			let x_1 = Math.floor(Math.max(screen.x, bounds.x));
			let x_2 = Math.ceil(Math.min(screen.x + screen.width, bounds.x + bounds.width));
			let y_1 = Math.floor(Math.max(screen.y, bounds.y));
			let y_2 = Math.ceil(Math.min(screen.y + screen.height, bounds.y + bounds.height));
			let pixelsWidth = x_2 - x_1;
			let pixelsHeight = y_2 - y_1;
			if (pixelsWidth <= 0 || pixelsHeight <= 0) 
				return;
            
			let rt = this._getRenderTexture(pixelsWidth, pixelsHeight);
			renderer.bindTexture(rt, 1, true);
			let gl = renderer.gl;
			if (renderer.renderingToScreen && renderTarget.root) {
				let buf = this._getBuf(pixelsWidth * pixelsHeight * 4);
				gl.readPixels(x_1, y_1, pixelsWidth, pixelsHeight, gl.RGBA, gl.UNSIGNED_BYTE, this._bigBuf);
				gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, pixelsWidth, pixelsHeight, gl.RGBA, gl.UNSIGNED_BYTE, this._bigBuf);
			} else 
				gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, x_1, y_1, pixelsWidth, pixelsHeight);
            
			renderer.bindShader(shader);
			renderer.state.setBlendMode(PIXI.BLEND_MODES.NORMAL);
			if (shader.uniforms.mapMatrix) {
				let mapMatrix = this._tempMatrix;
				mapMatrix.a = bounds.width / rt.width / spriteBounds.width;
				if (flipX) {
					mapMatrix.a = -mapMatrix.a;
					mapMatrix.tx = (bounds.x - x_1) / rt.width - (spriteBounds.x + spriteBounds.width) * mapMatrix.a;
				} else 
					mapMatrix.tx = (bounds.x - x_1) / rt.width - spriteBounds.x * mapMatrix.a;
                
				mapMatrix.d = bounds.height / rt.height / spriteBounds.height;
				if (flipY) {
					mapMatrix.d = -mapMatrix.d;
					mapMatrix.ty = (bounds.y - y_1) / rt.height - (spriteBounds.y + spriteBounds.height) * mapMatrix.d;
				} else 
					mapMatrix.ty = (bounds.y - y_1) / rt.height - spriteBounds.y * mapMatrix.d;
                
				shader.uniforms.mapMatrix = mapMatrix.toArray(true);
			}
			this._renderInner(sprite, shader);
		};
		PictureRenderer.prototype._renderInner = function (sprite, shader) {
			let renderer = this.renderer;
			if (shader.tilingMode > 0) 
				this._renderWithShader(sprite, shader.tilingMode === 1, shader);
            
			else 
				this._renderSprite(sprite, shader);
		};
		PictureRenderer.prototype._renderWithShader = function (ts, isSimple, shader) {
			let quad = shader.tempQuad;
			let renderer = this.renderer;
			renderer.bindVao(quad.vao);
			let vertices = quad.vertices;
			let _width = ts._width;
			let _height = ts._height;
			let _anchorX = ts._anchor._x;
			let _anchorY = ts._anchor._y;
			let w0 = _width * (1 - _anchorX);
			let w1 = _width * -_anchorX;
			let h0 = _height * (1 - _anchorY);
			let h1 = _height * -_anchorY;
			let wt = ts.transform.worldTransform;
			let a = wt.a;
			let b = wt.b;
			let c = wt.c;
			let d = wt.d;
			let tx = wt.tx;
			let ty = wt.ty;
			vertices[0] = (a * w1) + (c * h1) + tx;
			vertices[1] = (d * h1) + (b * w1) + ty;
			vertices[2] = (a * w0) + (c * h1) + tx;
			vertices[3] = (d * h1) + (b * w0) + ty;
			vertices[4] = (a * w0) + (c * h0) + tx;
			vertices[5] = (d * h0) + (b * w0) + ty;
			vertices[6] = (a * w1) + (c * h0) + tx;
			vertices[7] = (d * h0) + (b * w1) + ty;
			vertices = quad.uvs;
			vertices[0] = vertices[6] = -ts.anchor.x;
			vertices[1] = vertices[3] = -ts.anchor.y;
			vertices[2] = vertices[4] = 1.0 - ts.anchor.x;
			vertices[5] = vertices[7] = 1.0 - ts.anchor.y;
			quad.upload();
			let tex = ts._texture;
			let lt = ts.tileTransform.localTransform;
			let uv = ts.uvTransform;
			let mapCoord = uv.mapCoord;
			let uClampFrame = uv.uClampFrame;
			let uClampOffset = uv.uClampOffset;
			let w = tex.width;
			let h = tex.height;
			let W = _width;
			let H = _height;
			let tempMat = this._tempMatrix2;
			tempMat.set(lt.a * w / W, lt.b * w / H, lt.c * h / W, lt.d * h / H, lt.tx / W, lt.ty / H);
			tempMat.invert();
			if (isSimple) 
				tempMat.append(mapCoord);
            
			else {
				shader.uniforms.uMapCoord = mapCoord.toArray(true);
				shader.uniforms.uClampFrame = uClampFrame;
				shader.uniforms.uClampOffset = uClampOffset;
			}
			shader.uniforms.uTransform = tempMat.toArray(true);
			let color = this._tempColor;
			let alpha = ts.worldAlpha;
			PIXI.utils.hex2rgb(ts.tint, color);
			color[0] *= alpha;
			color[1] *= alpha;
			color[2] *= alpha;
			color[3] = alpha;
			shader.uniforms.uColor = color;
			renderer.bindTexture(tex, 0, true);
			quad.vao.draw(this.renderer.gl.TRIANGLES, 6, 0);
		};
		PictureRenderer.prototype._renderSprite = function (sprite, shader) {
			let renderer = this.renderer;
			let quad = shader.tempQuad;
			renderer.bindVao(quad.vao);
			let uvs = sprite.texture._uvs;
			let vertices = quad.vertices;
			let vd = sprite.vertexData;
			for (let i = 0; i < 8; i++) 
				quad.vertices[i] = vd[i];
            
			quad.uvs[0] = uvs.x0;
			quad.uvs[1] = uvs.y0;
			quad.uvs[2] = uvs.x1;
			quad.uvs[3] = uvs.y1;
			quad.uvs[4] = uvs.x2;
			quad.uvs[5] = uvs.y2;
			quad.uvs[6] = uvs.x3;
			quad.uvs[7] = uvs.y3;
			quad.upload();
			let frame = sprite.texture.frame;
			let base = sprite.texture.baseTexture;
			let clamp = this._tempClamp;
			let eps = 0.5 / base.resolution;
			clamp[0] = (frame.x + eps) / base.width;
			clamp[1] = (frame.y + eps) / base.height;
			clamp[2] = (frame.x + frame.width - eps) / base.width;
			clamp[3] = (frame.y + frame.height - eps) / base.height;
			shader.uniforms.uTextureClamp = clamp;
			let color = this._tempColor;
			PIXI.utils.hex2rgb(sprite.tint, color);
			let alpha = sprite.worldAlpha;
			color[0] *= alpha;
			color[1] *= alpha;
			color[2] *= alpha;
			color[3] = alpha;
			shader.uniforms.uColor = color;
			renderer.bindTexture(base, 0, true);
			quad.vao.draw(this.renderer.gl.TRIANGLES, 6, 0);
		};
		PictureRenderer.prototype._isSimpleSprite = function (ts) {
			let renderer = this.renderer;
			let tex = ts._texture;
			let baseTex = tex.baseTexture;
			let isSimple = baseTex.isPowerOfTwo && tex.frame.width === baseTex.width && tex.frame.height === baseTex.height;
			if (isSimple) {
				if (!baseTex._glTextures[renderer.CONTEXT_UID]) {
					if (baseTex.wrapMode === WRAP_MODES.CLAMP) 
						baseTex.wrapMode = WRAP_MODES.REPEAT;
				} else 
					isSimple = baseTex.wrapMode !== WRAP_MODES.CLAMP;
			}
			return isSimple;
		};
		return PictureRenderer;
	})(PIXI.ObjectRenderer);
	pixi_picture.PictureRenderer = PictureRenderer;
	PIXI.WebGLRenderer.registerPlugin('picture', PictureRenderer);
	//PIXI.CanvasRenderer.registerPlugin('picture', PIXI.CanvasSpriteRenderer);
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
	let softLightFrag = '\nvarying vec2 vTextureCoord;\nvarying vec2 vMapCoord;\nvarying vec4 vColor;\n \nuniform sampler2D uSampler[2];\nuniform vec4 uColor;\n%SPRITE_UNIFORMS%\n\nvoid main(void)\n{\n    %SPRITE_CODE%\n    vec4 source = texture2D(uSampler[0], textureCoord) * uColor;\n    vec4 target = texture2D(uSampler[1], vMapCoord);\n\n    if (source.a == 0.0) {\n        gl_FragColor = vec4(0, 0, 0, 0);\n        return;\n    }\n    vec3 Cb = source.rgb/source.a, Cs;\n    if (target.a > 0.0) {\n        Cs = target.rgb / target.a;\n    }\n    \n    vec3 first = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);\n\n    vec3 B;\n    vec3 D;\n    if (Cs.r <= 0.5)\n    {\n        B.r = first.r;\n    }\n    else\n    {\n        if (Cb.r <= 0.25)\n        {\n            D.r = ((16.0 * Cb.r - 12.0) * Cb.r + 4.0) * Cb.r;    \n        }\n        else\n        {\n            D.r = sqrt(Cb.r);\n        }\n        B.r = Cb.r + (2.0 * Cs.r - 1.0) * (D.r - Cb.r);\n    }\n    if (Cs.g <= 0.5)\n    {\n        B.g = first.g;\n    }\n    else\n    {\n        if (Cb.g <= 0.25)\n        {\n            D.g = ((16.0 * Cb.g - 12.0) * Cb.g + 4.0) * Cb.g;    \n        }\n        else\n        {\n            D.g = sqrt(Cb.g);\n        }\n        B.g = Cb.g + (2.0 * Cs.g - 1.0) * (D.g - Cb.g);\n    }\n    if (Cs.b <= 0.5)\n    {\n        B.b = first.b;\n    }\n    else\n    {\n        if (Cb.b <= 0.25)\n        {\n            D.b = ((16.0 * Cb.b - 12.0) * Cb.b + 4.0) * Cb.b;    \n        }\n        else\n        {\n            D.b = sqrt(Cb.b);\n        }\n        B.b = Cb.b + (2.0 * Cs.b - 1.0) * (D.b - Cb.b);\n    }   \n\n    vec4 res;\n\n    res.xyz = (1.0 - source.a) * Cs + source.a * B;\n    res.a = source.a + target.a * (1.0-source.a);\n    gl_FragColor = vec4(res.xyz * res.a, res.a);\n}\n';
	let SoftLightShader = (function (_super) {
		__extends(SoftLightShader, _super);
		function SoftLightShader (gl, tilingMode) {
			return _super.call(this, gl, pixi_picture.PictureShader.blendVert, softLightFrag, tilingMode) || this;
		}
		return SoftLightShader;
	})(pixi_picture.PictureShader);
	pixi_picture.SoftLightShader = SoftLightShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
	let Sprite = (function (_super) {
		__extends(Sprite, _super);
		function Sprite (texture) {
			let _this = _super.call(this, texture) || this;
			_this.pluginName = 'picture';
			return _this;
		}
		return Sprite;
	})(PIXI.Sprite);
	pixi_picture.Sprite = Sprite;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
	let TilingSprite = (function (_super) {
		__extends(TilingSprite, _super);
		function TilingSprite (texture) {
			let _this = _super.call(this, texture) || this;
			_this.pluginName = 'picture';
			return _this;
		}
		return TilingSprite;
	})(PIXI.extras.TilingSprite);
	pixi_picture.TilingSprite = TilingSprite;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
	PIXI.picture = pixi_picture;
})(pixi_picture || (pixi_picture = {}));
//# sourceMappingURL=pixi-picture.js.map
