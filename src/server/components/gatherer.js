define([
	'items/generators/quality'
], function(
	qualityGenerator
) {
	return {
		type: 'gatherer',

		nodes: [],
		gathering: null,
		gatheringTtl: 0,
		gatheringTtlMax: 7,
		defaultTtlMax: 7,

		gather: function() {
			if (this.gathering != null)
				return;

			var nodes = this.nodes;
			if (nodes.length == 0)
				return;

			var firstNode = nodes[0];

			this.gathering = firstNode;

			var ttlMax = firstNode.resourceNode.ttl || this.defaultTtlMax;

			if (firstNode.resourceNode.type == 'fish') {
				var rod = this.obj.equipment.eq.tool;
				rod = this.obj.inventory.findItem(rod);

				var statCatchSpeed = Math.min(150, rod.stats.catchSpeed || 0);
				ttlMax *= (1 - (statCatchSpeed / 200));
			}

			this.gatheringTtlMax = ttlMax;
			this.gatheringTtl = this.gatheringTtlMax;
		},

		update: function() {
			var gathering = this.gathering;

			if (!gathering)
				return;

			if (this.gatheringTtl > 0) {
				this.gatheringTtl--;

				var progress = 100 - ~~((this.gatheringTtl / this.gatheringTtlMax) * 100);
				this.obj.syncer.set(true, 'gatherer', 'progress', progress);
				if (gathering.resourceNode.type == 'fish')
					this.obj.syncer.set(true, 'gatherer', 'action', 'Fishing');

				return;
			}

			if (gathering.resourceNode.type == 'fish') {
				var rod = this.obj.equipment.eq.tool;
				rod = this.obj.inventory.findItem(rod);

				var catchChance = 30 + (rod.stats.catchChance || 0);
				if (~~(Math.random() * 100) >= catchChance) {
					process.send({
						method: 'events',
						data: {
							'onGetAnnouncement': [{
								obj: {
									msg: 'The fish got away'
								},
								to: [this.obj.serverId]
							}]
						}
					});

					this.gathering = null;

					return;
				}

				var blueprint = gathering.resourceNode.blueprint;

				gathering.inventory.items.forEach(function(g) {
					delete g.quantity;

					qualityGenerator.generate(g, {
						//100 x 2.86 = 2000 (chance for a common)
						bonusMagicFind: (rod.stats.fishRarity || 0) * 2.82
					});

					g.name = {
						'0': '',
						'1': 'Big ',
						'2': 'Giant ',
						'3': 'Trophy ',
						'4': 'Fabled '
					}[g.quality] + g.name;

					var statFishWeight = 1 + ((rod.stats.fishWeight || 0) / 100);
					var weight = ~~((blueprint.baseWeight + g.quality + (Math.random() * statFishWeight)) * 100) / 100;
					g.stats = {
						weight: weight
					};

					g.worth = ~~(weight * 10);
				});
			}

			this.nodes.spliceWhere(n => n == gathering);

			gathering.inventory.giveItems(this.obj, true);
			gathering.destroyed = true;

			this.obj.stats.getXp(gathering.resourceNode.xp);

			this.obj.fireEvent('afterGatherResource');

			this.gathering = null;
		},

		enter: function(node) {
			var nodeType = node.resourceNode.type;
			var msg = `Press G to $ (${node.name})`;
			msg = msg.replace('$', {
				herb: 'gather',
				fish: 'fish for'
			}[nodeType]);

			var success = true;
			if (nodeType == 'fish') {
				var rod = this.obj.equipment.eq.tool;
				if (rod == null) {
					success = false;
					msg = 'You need a fishing rod to fish'
				}
			}

			process.send({
				method: 'events',
				data: {
					'onGetAnnouncement': [{
						obj: {
							msg: msg
						},
						to: [this.obj.serverId]
					}]
				}
			});

			if (!success)
				return;

			this.nodes.spliceWhere(n => n == node);
			this.nodes.push(node);
		},

		exit: function(node) {
			this.nodes.spliceWhere(n => n == node);
		},

		events: {
			beforeMove: function() {
				if (!this.gathering)
					return;

				this.obj.syncer.set(true, 'gatherer', 'progress', 100);

				this.gathering = null;
			}
		}
	};
});