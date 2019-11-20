module.exports = {
	type: 'ambush',

	cdMax: 40,
	manaCost: 10,
	range: 9,

	damage: 1,
	speed: 70,
	isAttack: true,

	stunDuration: 20,
	needLos: true,

	cast: function (action) {
		let obj = this.obj;
		let target = action.target;

		let x = obj.x;
		let y = obj.y;

		let dx = target.x - x;
		let dy = target.y - y;

		//We need to stop just short of the target
		let offsetX = 0;
		if (dx !== 0)
			offsetX = dx / Math.abs(dx);

		let offsetY = 0;
		if (dy !== 0)
			offsetY = dy / Math.abs(dy);

		let targetPos = {
			x: target.x,
			y: target.y
		};

		let physics = obj.instance.physics;
		//Check where we should land
		if (!this.isTileValid(physics, x, y, targetPos.x - offsetX, targetPos.y - offsetY)) {
			if (!this.isTileValid(physics, x, y, targetPos.x - offsetX, targetPos.y)) 
				targetPos.y -= offsetY;
			else 
				targetPos.x -= offsetX;
		} else {
			targetPos.x -= offsetX;
			targetPos.y -= offsetY;
		}

		let targetEffect = target.effects.addEffect({
			type: 'stunned',
			ttl: this.stunDuration
		});

		if (targetEffect) {
			this.obj.instance.syncer.queue('onGetDamage', {
				id: target.id,
				event: true,
				text: 'stunned'
			}, -1);
		}

		if (this.animation) {
			this.obj.instance.syncer.queue('onGetObject', {
				id: this.obj.id,
				components: [{
					type: 'animation',
					template: this.animation
				}]
			}, -1);
		}

		physics.removeObject(obj, obj.x, obj.y);
		physics.addObject(obj, targetPos.x, targetPos.y);

		this.reachDestination(target, targetPos);

		return true;
	},

	reachDestination: function (target, targetPos) {
		if (this.obj.destroyed)
			return;

		let obj = this.obj;

		obj.x = targetPos.x;
		obj.y = targetPos.y;

		let syncer = obj.syncer;
		syncer.o.x = targetPos.x;
		syncer.o.y = targetPos.y;

		obj.instance.physics.addObject(obj, obj.x, obj.y);

		this.obj.aggro.move();

		let damage = this.getDamage(target);
		target.stats.takeDamage(damage, this.threatMult, obj);
	},

	isTileValid: function (physics, fromX, fromY, toX, toY) {
		if (physics.isTileBlocking(toX, toY))
			return false;
		return physics.hasLos(fromX, fromY, toX, toY);
	}
};
