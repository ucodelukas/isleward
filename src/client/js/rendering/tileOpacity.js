define([
	'js/system/globals'
], function (
	globals
) {
	return {
		//Set by renderer
		atlasTextureDimensions: {},

		tilesNoFlip: [
			//Stairs
			171, 179
		],
		wallsNoFlip: [
			//Ledges
			156, 158, 162, 163, 167, 168,
			//Wall Sign
			189, 
			//Stone Ledges
			195, 196, 197, 198, 199, 200, 201, 202, 203, 
			//Ship Edges
			204, 205, 206, 207, 214, 215, 220, 221, 222, 223,
			//Gray wall sides and corners
			230, 231, 238, 239
		],
		objectsNoFlip: [
			//Clotheslines
			96, 101, 
			//Table Sides
			103, 110, 118, 126,
			//Wall-mounted plants
			120, 122, 140, 
			//Ship oars
			140, 143, 
			//Ship Cannons
			141, 142 
		],

		getSheetNum: function (tile) {
			if (tile < 224)
				return 0;
			else if (tile < 480)
				return 1;
			return 2;
		},

		map: function (tile) {
			const { clientConfig: { atlasTextures, tileOpacities } } = globals;
			const { atlasTextureDimensions } = this;

			let offset = 0;
			let sheetName = null;

			let aLen = atlasTextures.length;
			for (let i = 0; i < aLen; i++) {
				sheetName = atlasTextures[i];

				const dimensions = atlasTextureDimensions[sheetName];
				const spriteCount = dimensions.w * dimensions.h;

				if (offset + spriteCount > tile)
					break;

				offset += spriteCount;
			}

			tile -= offset;

			const opacityConfig = tileOpacities[sheetName] || tileOpacities.default;

			let alpha = (opacityConfig[tile] || opacityConfig.default);
			if (opacityConfig.max !== null) {
				alpha = alpha + (Math.random() * (alpha * 0.2));
				alpha = Math.min(1, alpha);
			}

			return alpha;
		},

		canFlip: function (tile) {
			let sheetNum;

			if (tile < 224)
				sheetNum = 0;
			else if (tile < 480) {
				tile -= 224;
				sheetNum = 1;
			} else {
				tile -= 480;
				sheetNum = 2;
			}

			let tilesheet = [this.tilesNoFlip, this.wallsNoFlip, this.objectsNoFlip][sheetNum];
			return (tilesheet.indexOf(tile) === -1);
		}
	};
});
