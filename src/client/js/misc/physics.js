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

			var node = this.graph.grid[x][y];

			return ((!node) || (node.weight == 0));
		},

		isInPolygon: function (x, y, verts) {
			var inside = false;

			var vLen = verts.length;
			for (var i = 0, j = vLen - 1; i < vLen; j = i++) {
				var vi = verts[i];
				var vj = verts[j];

				var xi = vi[0];
				var yi = vi[1];
				var xj = vj[0];
				var yj = vj[1];

				var doesIntersect = (
					((yi > y) != (yj > y)) &&
					(x < ((((xj - xi) * (y - yi)) / (yj - yi)) + xi))
				);

				if (doesIntersect)
					inside = !inside
			}

			return inside;
		},

		distanceToPolygon: function (p, verts) {
			return distanceToPolygon.calculate(p, verts);
		}
	};
});
