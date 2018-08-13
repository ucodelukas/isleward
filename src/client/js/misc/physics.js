define([
	'js/misc/pathfinder'
], function (
	pathfinder
) {
	let sqrt = Math.sqrt.bind(Math);
	let ceil = Math.ceil.bind(Math);
	let random = Math.random.bind(Math);

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

		addRegion: function (obj) {
			let lowX = obj.x;
			let lowY = obj.y;
			let highX = lowX + obj.width;
			let highY = lowY + obj.height;
			let cells = this.cells;

			for (let i = lowX; i <= highX; i++) {
				let row = cells[i];
				for (let j = lowY; j <= highY; j++) 
					row[j].push(obj);
			}
		},

		addObject: function (obj, x, y, fromX, fromY) {
			let row = this.cells[x];

			if (!row)
				return;

			let cell = row[y];

			if (!cell)
				return;

			let cLen = cell.length;
			for (let i = 0; i < cLen; i++) {
				let c = cell[i];

				//If we have fromX and fromY, check if the target cell doesn't contain the same obj (like a notice area)
				if ((c.width) && (fromX)) {
					if ((fromX < c.x) || (fromY < c.y) || (fromX >= c.x + c.width) || (fromY >= c.y + c.height)) {
						c.collisionEnter(obj);
						obj.collisionEnter(c);
					}
				} else {
					c.collisionEnter(obj);
					obj.collisionEnter(c);
				}
			}

			cell.push(obj);
			return true;
		},
		removeObject: function (obj, x, y, toX, toY) {
			let row = this.cells[x];

			if (!row)
				return;

			let cell = row[y];

			if (!cell)
				return;

			let oId = obj.id;
			let cLen = cell.length;
			for (let i = 0; i < cLen; i++) {
				let c = cell[i];

				if (c.id !== oId) {
					//If we have toX and toY, check if the target cell doesn't contain the same obj (like a notice area)
					if ((c.width) && (toX)) {
						if ((toX < c.x) || (toY < c.y) || (toX >= c.x + c.width) || (toY >= c.y + c.height)) {
							c.collisionExit(obj);
							obj.collisionExit(c);
						}
					} else {
						c.collisionExit(obj);
						obj.collisionExit(c);
					}
				} else {
					cell.splice(i, 1);
					i--;
					cLen--;
				}
			}
		},

		isValid: function (x, y) {
			let row = this.cells[x];

			if ((!row) || (row.length <= y) || (!this.graph.grid[x][y]))
				return false;
			return true;
		},

		getCell: function (x, y) {
			let row = this.cells[x];

			if (!row)
				return [];

			let cell = row[y];

			if (!cell)
				return [];

			return cell;
		},
		getArea: function (x1, y1, x2, y2, filter) {
			let width = this.width;
			let height = this.height;

			x1 = ~~x1;
			y1 = ~~y1;

			x2 = ~~x2;
			y2 = ~~y2;

			if (x1 < 0)
				x1 = 0;
			else if (x2 >= width)
				x2 = width - 1;
			if (y1 < 0)
				y1 = 0;
			else if (y2 >= height)
				y2 = height - 1;

			let cells = this.cells;
			let grid = this.graph.grid;

			let result = [];
			for (let i = x1; i <= x2; i++) {
				let row = cells[i];
				let gridRow = grid[i];
				for (let j = y1; j <= y2; j++) {
					if (!gridRow[j])
						continue;

					let cell = row[j];
					let cLen = cell.length;
					for (let k = 0; k < cLen; k++) {
						let c = cell[k];

						if (filter) {
							if (filter(c))
								result.push(c);
						} else
							result.push(c);
					}
				}
			}

			return result;
		},

		getOpenCellInArea: function (x1, y1, x2, y2) {
			let width = this.width;
			let height = this.height;

			x1 = ~~x1;
			y1 = ~~y1;

			x2 = ~~x2;
			y2 = ~~y2;

			if (x1 < 0)
				x1 = 0;
			else if (x2 >= width)
				x2 = width - 1;
			if (y1 < 0)
				y1 = 0;
			else if (y2 >= height)
				y2 = height - 1;

			let cells = this.cells;
			let grid = this.graph.grid;

			let result = [];
			for (let i = x1; i <= x2; i++) {
				let row = cells[i];
				let gridRow = grid[i];
				for (let j = y1; j <= y2; j++) {
					if (!gridRow[j])
						continue;

					let cell = row[j];
					if (cell.length === 0) {
						return {
							x: i,
							y: j
						};
					}
				}
			}

			return result;
		},

		getPath: function (from, to) {
			let graph = this.graph;
			let grid = graph.grid;

			if (!to) {
				to = {
					x: ~~(random() * grid.length),
					y: ~~(random() * grid[0].length)
				};
			}

			let fromX = ~~from.x;
			let fromY = ~~from.y;

			if ((!grid[fromX]) || (grid[fromX].length <= fromY) || (fromX < 0) || (fromY < 0))
				return [];

			let toX = ~~to.x;
			let toY = ~~to.y;

			if ((!grid[toX]) || (grid[toX].length <= toY) || (toX < 0) || (toY < 0))
				return [];

			let path = pathfinder.astar.search(graph, {
				x: fromX,
				y: fromY
			}, {
				x: toX,
				y: toY
			}, {
				closest: true
			});

			return path;
		},
		isTileBlocking: function (x, y, mob, obj) {
			if ((x < 0) || (y < 0) || (x >= this.width) | (y >= this.height))
				return true;

			x = ~~x;
			y = ~~y;

			let node = this.graph.grid[x][y];

			return ((!node) || (node.weight === 0));
		},
		isCellOpen: function (x, y) {
			if ((x < 0) || (y < 0) || (x >= this.width) | (y >= this.height))
				return true;

			return (this.cells[x][y].length === 0);
		},
		hasLos: function (fromX, fromY, toX, toY) {
			if ((fromX < 0) || (fromY < 0) || (fromX >= this.width) | (fromY >= this.height) || (toX < 0) || (toY < 0) || (toX >= this.width) | (toY >= this.height))
				return false;

			let graphGrid = this.graph.grid;

			if ((!graphGrid[fromX][fromY]) || (!graphGrid[toX][toY]))
				return false;

			let dx = toX - fromX;
			let dy = toY - fromY;

			let distance = sqrt((dx * dx) + (dy * dy));

			dx /= distance;
			dy /= distance;

			fromX += 0.5;
			fromY += 0.5;

			distance = ceil(distance);

			let x = 0;
			let y = 0;

			for (let i = 0; i < distance; i++) {
				fromX += dx;
				fromY += dy;

				x = ~~fromX;
				y = ~~fromY;

				if (!graphGrid[x][y])
					return false;
				else if ((x === toX) && (y === toY))
					return true;
			}

			return true;
		},

		getClosestPos: function (fromX, fromY, toX, toY, target) {
			let tried = {};

			let hasLos = this.hasLos.bind(this, toX, toY);

			let width = this.width;
			let height = this.height;

			let collisionMap = this.collisionMap;
			let cells = this.cells;

			let reverseX = (fromX > toX);
			let reverseY = (fromY > toY);

			for (let c = 1; c <= 10; c++) {
				let x1 = toX - c;
				let y1 = toY - c;
				let x2 = toX + c;
				let y2 = toY + c;

				let lowX, lowY, highX, highY, incX, incY;

				if (reverseX) {
					incX = -1;
					lowX = x2;
					highX = x1 - 1;
				} else {
					incX = 1;
					lowX = x1;
					highX = x2 + 1;
				}

				if (reverseY) {
					incY = -1;
					lowY = y2;
					highY = y1 - 1;
				} else {
					incY = 1;
					lowY = y1;
					highY = y2 + 1;
				}

				for (let i = lowX; i !== highX; i += incX) {
					if ((i < 0) || (i >= width))
						continue;

					let row = collisionMap[i];
					let cellRow = cells[i];

					let t = tried[i];
					if (!t) 
						t = tried[i] = {};

					for (let j = lowY; j !== highY; j += incY) {
						if (t[j])
							continue;

						t[j] = 1;

						if (
							((i === toX) && (j === toY)) ||
							((j < 0) || (j >= height)) ||
							(row[j])
						)
							continue;

						let cell = cellRow[j];
						let cLen = cell.length;
						let blocking = false;
						for (let k = 0; k < cLen; k++) {
							let aggro = cell[k].aggro;
							if (aggro) {
								blocking = aggro.list.some(a => a.obj === target);
								if (blocking)
									break;
							}
						}
						if (blocking)
							continue;
						else if (!hasLos(i, j))
							continue;

						return {
							x: i,
							y: j
						};
					}
				}
			}
		},

		mobsCollide: function (x, y, obj) {
			if ((x < 0) || (y < 0) || (x >= this.width) | (y >= this.height))
				return true;

			let cell = this.cells[x][y];
			let cLen = cell.length;

			if (cLen === 1)
				return false;

			let found = false;
			for (let i = 0; i < cLen; i++) {
				let c = cell[i];
				if (c.aggro) {
					if ((!found) && (c === obj))
						found = true;
					else
						return true;
				}
			}

			return false;
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
		}
	};
});
