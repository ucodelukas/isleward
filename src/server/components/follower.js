define([

], function(

) {
	return {
		type: 'follower',

		master: null,

		lifetime: -1,
		maxDistance: 10,

		fGetHighest: {
			inCombat: null,
			outOfCombat: null
		},

		bindEvents: function() {
			this.fGetHighest.inCombat = this.master.aggro.getHighest.bind(this.master.aggro);
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

			var maxDistance = this.maxDistance;

			var doMove = (
				(Math.abs(obj.x - master.x) >= maxDistance) ||
				(Math.abs(obj.y - master.y) >= maxDistance)
			);

			if (doMove) {
				if (obj.aggro.getHighest == this.fGetHighest.inCombat)
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