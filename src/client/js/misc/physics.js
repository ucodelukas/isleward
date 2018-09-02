define([
	'js/misc/pathfinder',
	'js/misc/distanceToPolygon'

], function (
	pathfinder,
	distanceToPolygon
) {
	return {
		graph: null,

		collisionMap: null,
		cells: [],
		width: 0,
		height: 0,

		init: function (collisionMap) {
			this.collisionMap = collisionMap;

			this.width = collisionMap.length;
			this.height = collisionMap[0].length;

			this.cells = _.get2dArray(this.width, this.height, 'array');

			this.graph = new pathfinder.Graph(collisionMap, {
				diagonal: true
			});
		},

		isTileBlocking: function (x, y, mob, obj) {
			if ((x < 0) || (y < 0) || (x >= this.width) | (y >= this.height))
				return true;

			x = ~~x;
			y = ~~y;

			let node = this.graph.grid[x][y];

			return ((!node) || (node.weight === 0));
		},

		setCollision: function (config) {
			const x = config.x;
			const y = config.y;
			const collides = config.collides;

			const grid = this.graph.grid;

			let node = grid[x][y];
			if (!node) 
				node = grid[x][y] = new pathfinder.gridNode(x, y, collides ? 0 : 1);

			node.weight = collides ? 0 : 1;
		},

		isInPolygon: function (x, y, verts) {
			let inside = false;

			let vLen = verts.length;
			for (let i = 0, j = vLen - 1; i < vLen; j = i++) {
				let vi = verts[i];
				let vj = verts[j];

				let xi = vi[0];
				let yi = vi[1];
				let xj = vj[0];
				let yj = vj[1];

				let doesIntersect = (
					((yi > y) !== (yj > y)) &&
					(x < ((((xj - xi) * (y - yi)) / (yj - yi)) + xi))
				);

				if (doesIntersect)
					inside = !inside;
			}

			return inside;
		},

		distanceToPolygon: function (p, verts) {
			return distanceToPolygon.calculate(p, verts);
		}
	};
});
