define([
	'config/herbs'
], function(
	herbs
) {
	return {
		nodes: [],

		objects: null,
		syncer: null,
		zone: null,
		physics: null,
		map: null,

		cdMax: 2,

		init: function(instance) {
			this.objects = instance.objects;
			this.syncer = instance.syncer;
			this.zone = instance.zone;
			this.physics = instance.physics;
			this.map = instance.map;
		},

		register: function(name, blueprint) {
			var exists = this.nodes.find(n => (n.blueprint.name == name));
			if (exists) {
				if (!exists.blueprint.positions)
					exists.blueprint.positions = [{
						x: exists.blueprint.x,
						y: exists.blueprint.y,
						width: exists.blueprint.width,
						height: exists.blueprint.height
					}];

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

			var max = blueprint.max;
			delete blueprint.max;

			this.nodes.push({
				cd: 0,
				max: max,
				blueprint: blueprint,
				spawns: []
			});
		},

		spawn: function(node) {
			var blueprint = node.blueprint;

			//Get an accessible position
			var w = this.physics.width;
			var h = this.physics.height;

			var x = blueprint.x;
			var y = blueprint.y;

			var position = null;

			if (blueprint.type == 'herb') {
				x = ~~(Math.random() * w)
				y = ~~(Math.random() * h)

				if (this.physics.isTileBlocking(x, y))
					return false;

				var spawn = this.map.spawn[0];

				var path = this.physics.getPath(spawn, {
					x: x,
					y: y
				});

				var endTile = path[path.length - 1];
				if (!endTile)
					return false;
				else if ((endTile.x != x) || (endTile.y != y))
					return false;
				else {
					//Don't spawn in rooms
					var cell = this.physics.getCell(x, y);
					if (cell.some(c => c.notice))
						return false;
					else {
						blueprint.x = x;
						blueprint.y = y;
					}
				}
			} else if (blueprint.positions) {
				//Find all possible positions in which a node hasn't spawned yet
				position = blueprint.positions.filter(f => !node.spawns.some(s => ((s.x == f.x) && (s.y == f.y))));
				if (position.length == 0)
					return false;

				position = position[~~(Math.random() * position.length)];
			}

			var quantity = 1;
			if (blueprint.quantity)
				quantity = blueprint.quantity[0] + ~~(Math.random() * (blueprint.quantity[1] - blueprint.quantity[0]));

			var objBlueprint = extend(true, {}, blueprint, position);
			objBlueprint.properties = {
				cpnResourceNode: {
					nodeType: blueprint.type,
					ttl: blueprint.ttl,
					xp: this.map.zone.level * this.map.zone.level,
					blueprint: extend(true, {}, blueprint),
					quantity: quantity
				}
			};

			var obj = this.objects.buildObjects([objBlueprint]);

			if (blueprint.type == 'herb') {
				this.syncer.queue('onGetObject', {
					x: obj.x,
					y: obj.y,
					components: [{
						type: 'attackAnimation',
						row: 0,
						col: 4
					}]
				});
			}

			var inventory = obj.addComponent('inventory');
			obj.layerName = 'objects';

			node.spawns.push(obj);

			var item = {
				material: true,
				type: node.type,
				sprite: node.blueprint.itemSprite,
				name: node.blueprint.name,
				quantity: (blueprint.type != 'fish') ? 1 : null,
				quality: 0
			};

			if (blueprint.type == 'fish')
				item.noStack = true;

			inventory.getItem(item);

			return true;
		},

		update: function() {
			var nodes = this.nodes;
			var nLen = nodes.length;

			for (var i = 0; i < nLen; i++) {
				var node = nodes[i];

				var spawns = node.spawns;
				var sLen = spawns.length;

				if ((node.cd > 0) && (sLen < node.max))
					node.cd--;

				for (var j = 0; j < sLen; j++) {
					var o = spawns[j];
					if (o.destroyed) {
						spawns.splice(j, 1);
						j--;
						sLen--;
						continue;
					}
				}

				if ((sLen < node.max) && (node.cd == 0)) {
					if (this.spawn(node)) {
						node.cd = this.cdMax;
						break;
					}
				}
			}
		}
	};
});