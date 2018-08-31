module.exports = {
	type: 'chest',

	ownerId: -1,

	ttl: -1,

<<<<<<< HEAD
	init: function (blueprint) {
		if (blueprint.ownerId)
			this.ownerId = blueprint.ownerId;
=======
		ownerName: null,
>>>>>>> 555-new-dungeon

		if (blueprint.ttl)
			this.ttl = blueprint.ttl;
	},

<<<<<<< HEAD
	simplify: function (self) {
		return {
			type: 'chest',
			ownerId: this.ownerId
		};
	},
=======
		init: function (blueprint) {
			if (blueprint.ownerName != null)
				this.ownerName = blueprint.ownerName;
>>>>>>> 555-new-dungeon

	update: function () {
		if (this.ttl > 0) {
			this.ttl--;

<<<<<<< HEAD
			if (this.ttl === 0)
				this.obj.destroyed = true;
		}
	},
=======
		simplify: function (self) {
			return {
				type: 'chest',
				ownerName: this.ownerName
			};
		},

		update: function () {
			if (this.ttl > 0) {
				this.ttl--;

				if (this.ttl == 0)
					this.obj.destroyed = true;
			}
		},
>>>>>>> 555-new-dungeon

	collisionEnter: function (obj) {
		if (!obj.player)
			return;

<<<<<<< HEAD
		let ownerId = this.ownerId;
		if (ownerId !== -1) {
			if (ownerId instanceof Array) {
				if (ownerId.indexOf(obj.serverId) === -1)
=======
			var ownerName = this.ownerName;
			if (ownerName) {
				if (ownerName instanceof Array) {
					if (ownerName.indexOf(obj.name) == -1)
						return;
				} else if (ownerName != obj.name)
>>>>>>> 555-new-dungeon
					return;
			} else if (ownerId !== obj.serverId)
				return;
		}

		//Make sure the player took all the items
		// since maybe he doesn't have enough space for everything
		if (this.obj.inventory.giveItems(obj))
			this.obj.destroyed = true;
	}
};
