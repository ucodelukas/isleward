define([
	'config/passiveTree'
], function (
	passiveTree
) {
	return {
		type: 'passives',

		selected: [],
		points: 0,

		init: function (blueprint) {
			this.selected = ((blueprint || {}).selected || []);
			this.selected.spliceWhere(s => (passiveTree.nodes.some(n => ((n.id == s) && (n.spiritStart)))));

			this.selected.push(passiveTree.nodes.find(n => (n.spiritStart == this.obj.class)).id);

			var points = this.calcPoints();

			if (points < this.selected.length) {
				this.selected = [];
				this.selected.push(passiveTree.nodes.find(n => (n.spiritStart == this.obj.class)).id);
				blueprint.selected = this.selected;
				points = this.calcPoints();
			}

			this.points = points;
			blueprint.points = points;

			var stats = this.obj.stats;

			this.selected.forEach(function (id) {
				var node = passiveTree.nodes.find(n => (n.id == id));
				if (node) {
					for (var p in node.stats) {
						stats.addStat(p, node.stats[p]);
					}
				}
			});
		},

		calcPoints: function () {
			var level = this.obj.stats.values.level;
			var points = level - this.selected.length + 1;

			if (level < 20)
				points--;

			return points;
		},

		applyPassives: function () {
			var stats = this.obj.stats;
			this.selected.forEach(function (id) {
				var node = passiveTree.nodes.find(n => (n.id == id));
				if (node) {
					for (var p in node.stats) {
						stats.addStat(p, node.stats[p]);
					}
				}
			});
		},

		tickNode: function (msg) {
			if (this.points <= 0)
				return;
			else if (this.selected.some(s => (s == msg.nodeId)))
				return;

			var nodeId = msg.nodeId;
			var node = passiveTree.nodes.find(n => (n.id == nodeId));

			if (node.spiritStart)
				return;

			var linked = passiveTree.links.some(function (l) {
				if ((l.from.id != node.id) && (l.to.id != node.id))
					return false;

				return (
					(this.selected.indexOf(l.from.id) > -1) ||
					(this.selected.indexOf(l.to.id) > -1)
				);
			}, this);
			if (!linked)
				return;

			this.points--;
			this.obj.syncer.set(true, 'passives', 'points', this.points);

			this.selected.push(nodeId);
			this.obj.syncer.setArray(true, 'passives', 'tickNodes', nodeId);

			var stats = this.obj.stats;
			if (node) {
				for (var p in node.stats) {
					stats.addStat(p, node.stats[p]);
				}
			}

			this.obj.spellbook.calcDps();
		},

		untickNode: function (msg) {
			var stats = this.obj.stats;

			this.selected.forEach(function (s) {
				var node = passiveTree.nodes.find(n => (n.id == s));
				if (node.spiritStart)
					return;

				this.points++;
				this.obj.syncer.set(true, 'passives', 'points', this.points);

				this.obj.syncer.setArray(true, 'passives', 'untickNodes', node.id);

				if (node) {
					for (var p in node.stats) {
						stats.addStat(p, -node.stats[p]);
					}
				}
			}, this);

			this.selected.spliceWhere(s => (!s.spiritStart));

			this.obj.spellbook.calcDps();
		},

		/*untickNode: function (msg) {
			var nodeId = msg.nodeId;

			if (!this.selected.some(s => (s == msg.nodeId)))
				return;

			var node = passiveTree.nodes.find(n => (n.id == nodeId));

			if (node.spiritStart)
				return;

			this.points++;
			this.obj.syncer.set(true, 'passives', 'points', this.points);

			this.selected.spliceWhere(id => (id == nodeId));
			this.obj.syncer.setArray(true, 'passives', 'untickNodes', nodeId);

			var node = passiveTree.nodes.find(n => (n.id == nodeId));
			var stats = this.obj.stats;
			if (node) {
				for (var p in node.stats) {
					stats.addStat(p, -node.stats[p]);
				}
			}
		},*/

		simplify: function (self) {
			if (!self)
				return;

			return {
				type: 'passives',
				selected: this.selected,
				points: this.points
			};
		},

		events: {
			onLevelUp: function (level) {
				this.points = this.calcPoints();
				this.obj.syncer.set(true, 'passives', 'points', this.points);
			}
		}
	};
});
