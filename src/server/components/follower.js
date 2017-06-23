define([

], function(

) {
	return {
		type: 'follower',

		master: null,

		lifetime: -1,
		maxDistance: 10,

		lastMasterPos: {
			x: 0,
			y: 0
		},

		fGetHighest: {
			inCombat: null,
			outOfCombat: null
		},

		bindEvents: function() {
			var master = this.master;
			this.lastMasterPos.x = master.x;
			this.lastMasterPos.y = master.y;

			this.obj.aggro.faction = master.aggro.faction;

			this.fGetHighest.inCombat = master.aggro.getHighest.bind(master.aggro);
			this.fGetHighest.outOfCombat = this.returnNoAggro.bind(this);
		},

		returnNoAggro: function() {
			var master = this.master;
			var obj = this.obj;
			var mob = obj.mob;

			mob.originX = master.x + ~~((Math.random() * 2) * 2) - 1;
			mob.originY = master.y + ~~((Math.random() * 2) * 2) - 1;

			return null;
		},

		despawn: function() {
			var obj = this.obj;

			obj.destroyed = true;
			this.obj.instance.syncer.queue('onGetObject', {
				x: obj.x,
				y: obj.y,
				components: [{
					type: 'attackAnimation',
					row: 0,
					col: 4
				}]
			});
		},

		teleport: function() {
			var obj = this.obj;
			var physics = obj.instance.physics;
			var syncer = obj.syncer;
			var master = this.master;

			var newPosition = physics.getOpenCellInArea(master.x - 1, master.y - 1, master.x + 1, master.y + 1);
			
			physics.removeObject(obj, obj.x, obj.y);

			obj.x = newPosition.x;
			obj.y = newPosition.y;

			syncer.o.x = obj.x;
			syncer.o.y = obj.y;

			physics.addObject(obj, obj.x, obj.y);

			obj.instance.syncer.queue('onGetObject', {
				x: obj.x,
				y: obj.y,
				components: [{
					type: 'attackAnimation',
					row: 0,
					col: 4
				}]
			});
		},

		update: function() {
			if (this.lifetime > 0) {
				this.lifetime--;
				if (this.lifetime <= 0) {
					this.despawn();
					return;
				}
			}

			var obj = this.obj;
			var master = this.master;

			if (master.destroyed) {
				this.despawn();
				return;
			}

			var attacker = this.fGetHighest.inCombat();
			var maxDistance = this.maxDistance;
			var distance = Math.max(Math.abs(obj.x - master.x), Math.abs(obj.y - master.y));

			var doMove = (distance >= maxDistance);
			//When we're too far, just teleport
			if ((!attacker) && (distance >= maxDistance * 2)) {
				this.teleport();
				return;
			}

			var doMove = false;
			//If we're not too far from the master but the master is not in combat, move anyway
			if (!attacker) {
				var lastMasterPos = this.lastMasterPos;

				if ((master.x != lastMasterPos.x) || (master.y != lastMasterPos.y)) {
					doMove = true;
					lastMasterPos.x = master.x;
					lastMasterPos.y = master.y;
				}
			}

			if (doMove) {
				this.obj.clearQueue();
				obj.mob.target = obj;
			}

			obj.aggro.getHighest = doMove ? this.fGetHighest.outOfCombat : this.fGetHighest.inCombat;
		},

		simplify: function() {
			return {
				type: 'follower',
				master: this.master.id
			};
		}
	};
});