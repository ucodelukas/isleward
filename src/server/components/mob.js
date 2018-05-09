define([
	'items/generator'
], function (
	itemGenerator
) {
	var abs = Math.abs.bind(Math);
	var rnd = Math.random.bind(Math);
	var max = Math.max.bind(Math);

	return {
		type: 'mob',

		target: null,

		physics: null,

		originX: 0,
		originY: 0,

		walkDistance: 1,
		maxChaseDistance: 25,
		goHome: false,

		patrol: null,
		patrolTargetNode: 0,

		init: function (blueprint) {
			this.physics = this.obj.instance.physics;

			this.originX = this.obj.x;
			this.originY = this.obj.y;

			if (blueprint.patrol)
				this.patrol = blueprint.patrol;
		},

		update: function () {
			var obj = this.obj;

			var target = null;
			if (obj.aggro)
				target = obj.aggro.getHighest();

			//Have we reached home?
			if (this.goHome) {
				var distanceFromHome = Math.max(Math.abs(this.originX - obj.x), Math.abs(this.originY - obj.y));
				if (distanceFromHome < this.walkDistance)
					this.goHome = false;
			}

			//Are we too far from home?
			if ((!this.goHome) && (!obj.follower) && (target)) {
				if (!this.canChase(target)) {
					obj.clearQueue();
					obj.aggro.unAggro(target);
					target = obj.aggro.getHighest();
				}
			}

			if (!this.goHome) {
				//Are we in fight mode?
				if ((target) && (target != obj) && ((!obj.follower) || (obj.follower.master != target))) {
					this.fight(target);
					return;
				}
				//Is fight mode over?
				else if ((!target) && (this.target)) {
					this.target = null;
					obj.clearQueue();
					this.goHome = true;
				}
			}

			//If we're already going somewhere, don't calculate a new path
			if (obj.actionQueue.length > 0)
				return;

			//Unless we're going home, don't always move
			if ((!this.goHome) && (rnd() < 0.85) && (!this.patrol))
				return;

			//Don't move around if we're not allowed to, unless we're going home
			var walkDistance = this.walkDistance;
			if ((!this.goHome) && (walkDistance <= 0))
				return;

			var toX, toY;

			if (!this.patrol) {
				toX = this.originX + ~~(rnd() * (walkDistance * 2)) - walkDistance;
				toY = this.originY + ~~(rnd() * (walkDistance * 2)) - walkDistance;
			} else {
				console.log(this.patrol);
				while (true) {
					var toNode = this.patrol[this.patrolTargetNode];
					toX = toNode[0];
					toY = toNode[1];
					if ((toX - obj.x == 0) && (toY - obj.y == 0)) {
						this.patrolTargetNode++;
						if (this.patrolTargetNode >= this.patrol.length)
							this.patrolTargetNode = 0;
					} else
						break;
				}
			}

			if (!this.physics.isCellOpen(toX, toY))
				return;

			var path = this.physics.getPath({
				x: obj.x,
				y: obj.y
			}, {
				x: toX,
				y: toY
			}, false);

			var pLen = path.length;
			for (var i = 0; i < pLen; i++) {
				var p = path[i];

				obj.queue({
					action: 'move',
					data: {
						x: p.x,
						y: p.y
					}
				});
			}

			//We use goHometo force followers to follow us around but they should never stay in that state
			// since it messes with combat
			if (obj.follower)
				this.goHome = false;
		},
		fight: function (target) {
			if (this.target != target) {
				//Patrol mobs' home is wherever you initially aggroed them
				if ((this.patrol) && (!this.target)) {
					this.originX = this.obj.x;
					this.originY = this.obj.y;
				}

				this.obj.clearQueue();
				this.target = target;
			}
			//If the target is true, it means we can't reach the target and should wait for a new one
			if (this.target == true)
				return;

			var obj = this.obj;
			var x = obj.x;
			var y = obj.y;

			var tx = ~~target.x;
			var ty = ~~target.y;

			var distance = max(abs(x - tx), abs(y - ty));
			var furthestRange = obj.spellbook.getFurthestRange();
			var doesCollide = null;
			var hasLos = null;

			if (distance <= furthestRange) {
				doesCollide = this.physics.mobsCollide(x, y, obj);
				if (!doesCollide) {
					hasLos = this.physics.hasLos(x, y, tx, ty);
					if (hasLos) {
						if (((obj.follower) && (obj.follower.master.player)) || (rnd() < 0.65)) {
							var spell = obj.spellbook.getRandomSpell(target);
							var success = obj.spellbook.cast({
								spell: spell,
								target: target
							});
							//null means we don't have LoS
							if (success != null)
								return;
							else
								hasLos = false;
						} else
							return;
					}
				}
			}

			var targetPos = this.physics.getClosestPos(x, y, tx, ty, target);
			if (!targetPos) {
				//Find a new target
				obj.aggro.ignore(target);
				//TODO: Don't skip a turn
				return;
			}
			var newDistance = max(abs(targetPos.x - tx), abs(targetPos.y - ty));

			if ((newDistance >= distance) && (newDistance > furthestRange)) {
				if (hasLos == null)
					hasLos = this.physics.hasLos(x, y, tx, ty);
				if (hasLos) {
					if (doesCollide == null)
						doesCollide = this.physics.mobsCollide(x, y, obj);
					if (!doesCollide) {
						obj.aggro.ignore(target);
						return;
					}
				} else {
					if (doesCollide == null)
						doesCollide = this.physics.mobsCollide(x, y, obj);
					if (!doesCollide) {
						obj.aggro.ignore(target);
						return;
					}
				}
			}

			var path = this.physics.getPath({
				x: x,
				y: y
			}, {
				x: targetPos.x,
				y: targetPos.y
			});
			if (path.length == 0) {
				obj.aggro.ignore(target);
				//TODO: Don't skip a turn
				return;
			}

			var p = path[0];
			obj.queue({
				action: 'move',
				data: {
					x: p.x,
					y: p.y
				}
			});
		},

		canChase: function (obj) {
			var distanceFromHome = Math.max(Math.abs(this.originX - obj.x), Math.abs(this.originY - obj.y));
			return ((!this.goHome) && (distanceFromHome <= this.maxChaseDistance));
		}
	};
});
