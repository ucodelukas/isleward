let herbs = require('../config/herbs');

module.exports = {
	nodes: [],

	objects: null,
	syncer: null,
	zone: null,
	physics: null,
	map: null,

	cdMax: 50,

	init: function (instance) {
		this.objects = instance.objects;
		this.syncer = instance.syncer;
		this.zone = instance.zone;
		this.physics = instance.physics;
		this.map = instance.map;
		this.zone = instance.zone;
	},

	register: function (name, blueprint) {
		let exists = this.nodes.find(n => (n.blueprint.name === name));
		if (exists) {
			if (!exists.blueprint.positions) {
				exists.blueprint.positions = [{
					x: exists.blueprint.x,
					y: exists.blueprint.y,
					width: exists.blueprint.width,
					height: exists.blueprint.height
				}];
			}

			exists.blueprint.positions.push({
				x: blueprint.x,
				y: blueprint.y,
				width: blueprint.width,
				height: blueprint.height
			});

			return;
		}

		blueprint = extend(true, {}, blueprint, herbs[name], {
			name: name
		});

		let max = blueprint.max;
		delete blueprint.max;

		this.nodes.push({
			cd: 0,
			max: max,
			blueprint: blueprint,
			spawns: []
		});
	},

	spawn: function (node) {
		let blueprint = node.blueprint;

		//Get an accessible position
		let w = this.physics.width;
		let h = this.physics.height;

		let x = blueprint.x;
		let y = blueprint.y;

		let position = null;

		if (blueprint.type === 'herb') {
			x = ~~(Math.random() * w);
			y = ~~(Math.random() * h);

			if (this.physics.isTileBlocking(x, y))
				return false;

			let spawn = this.map.spawn[0];

			let path = this.physics.getPath(spawn, {
				x: x,
				y: y
			});

			let endTile = path[path.length - 1];
			if (!endTile)
				return false;
			else if ((endTile.x !== x) || (endTile.y !== y))
				return false;
			
				//Don't spawn in rooms or on objects/other resources
			let cell = this.physics.getCell(x, y);
			if (cell.length > 0)
				return false;
				
			blueprint.x = x;
			blueprint.y = y;
		} else if (blueprint.positions) {
			//Find all possible positions in which a node hasn't spawned yet
			position = blueprint.positions.filter(f => !node.spawns.some(s => ((s.x === f.x) && (s.y === f.y))));
			if (position.length === 0)
				return false;

			position = position[~~(Math.random() * position.length)];
		}

		let quantity = 1;
		if (blueprint.quantity)
			quantity = blueprint.quantity[0] + ~~(Math.random() * (blueprint.quantity[1] - blueprint.quantity[0]));

		let objBlueprint = extend(true, {}, blueprint, position);
		objBlueprint.properties = {
			cpnResourceNode: {
				nodeType: blueprint.type,
				ttl: blueprint.ttl,
				xp: this.zone.level * this.zone.level,
				blueprint: extend(true, {}, blueprint),
				quantity: quantity
			}
		};

		let obj = this.objects.buildObjects([objBlueprint]);
		delete obj.ttl;

		if (blueprint.type === 'herb') {
			this.syncer.queue('onGetObject', {
				x: obj.x,
				y: obj.y,
				components: [{
					type: 'attackAnimation',
					row: 0,
					col: 4
				}]
			}, -1);
		}

		let inventory = obj.addComponent('inventory');
		obj.layerName = 'objects';

		node.spawns.push(obj);

		let item = {
			material: true,
			type: node.type,
			sprite: node.blueprint.itemSprite,
			name: node.blueprint.name,
			quantity: (blueprint.type !== 'fish') ? 1 : null,
			quality: 0
		};

		if (blueprint.itemSheet)
			item.spritesheet = blueprint.itemSheet;

		if (blueprint.type === 'fish')
			item.noStack = true;

		inventory.getItem(item);

		return true;
	},

	update: function () {
		let nodes = this.nodes;
		let nLen = nodes.length;

		for (let i = 0; i < nLen; i++) {
			let node = nodes[i];

			let spawns = node.spawns;
			let sLen = spawns.length;

			if ((node.cd > 0) && (sLen < node.max))
				node.cd--;

			for (let j = 0; j < sLen; j++) {
				let o = spawns[j];
				if (o.destroyed) {
					spawns.splice(j, 1);
					j--;
					sLen--;
					continue;
				}
			}

			if ((sLen < node.max) && (node.cd === 0)) {
				if (this.spawn(node)) {
					node.cd = this.cdMax;
					break;
				}
			}
		}
	}
};
