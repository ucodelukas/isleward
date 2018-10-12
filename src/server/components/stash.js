module.exports = {
	type: 'stash',

	active: false,
	items: [],
	changed: false,

	init: function (blueprint) {
		let items = blueprint.items || [];
		let iLen = items.length;
		for (let i = 0; i < iLen; i++) 
			this.getItem(items[i]);

		delete blueprint.items;

		this.blueprint = blueprint;
	},

	getItem: function (item) {
		//Material?
		let exists = false;
		if (((item.material) || (item.quest) || (item.quantity)) && (!item.noStack) && (!item.uses)) {
			let existItem = this.items.find(i => i.name === item.name);
			if (existItem) {
				exists = true;
				if (!existItem.quantity)
					existItem.quantity = 1;
				existItem.quantity += item.quantity;

				//We modify the old object because it gets sent to the client
				item.id = existItem.id;
				item.quantity = existItem.quantity;

				item = existItem;
			}
		}

		//Get next id
		if (!exists) {
			let id = 0;
			let items = this.items;
			let iLen = items.length;
			for (let i = 0; i < iLen; i++) {
				let fItem = items[i];
				if (fItem.id >= id) 
					id = fItem.id + 1;
			}
			item.id = id;
		}

		if (!exists)
			this.items.push(item);
	},

	deposit: function (item) {
		if (!this.active)
			return;
		else if (this.items.length >= 50) {
			this.obj.instance.syncer.queue('onGetMessages', {
				id: this.obj.id,
				messages: [{
					class: 'color-redA',
					message: 'You do not have room in your stash to deposit that item',
					type: 'info'
				}]
			}, [this.obj.serverId]);

			return;
		}

		this.getItem(item);

		this.obj.syncer.setArray(true, 'stash', 'getItems', item);

		this.changed = true;

		return true;
	},

	destroyItem: function (id) {
		let item = this.items.find(i => i.id === id);
		if (!item)
			return;

		this.items.spliceWhere(i => i === item);

		this.obj.syncer.setArray(true, 'stash', 'destroyItems', id);

		this.changed = true;
	},

	withdraw: function (id) {
		if (!this.active)
			return;

		let item = this.items.find(i => i.id === id);
		if (!item)
			return;
		else if (!this.obj.inventory.hasSpace(item)) {
			this.obj.instance.syncer.queue('onGetMessages', {
				id: this.obj.id,
				messages: [{
					class: 'color-redA',
					message: 'You do not have room in your inventory to withdraw that item',
					type: 'info'
				}]
			}, [this.obj.serverId]);
			
			return;
		}

		this.obj.inventory.getItem(item);
		this.items.spliceWhere(i => i === item);

		this.obj.syncer.setArray(true, 'stash', 'destroyItems', id);

		this.changed = true;
	},

	setActive: function (active) {
		this.active = active;
		this.obj.syncer.set(true, 'stash', 'active', this.active);

		if (this.active && this.items.length > 50) {
			this.obj.instance.syncer.queue('onGetMessages', {
				id: this.obj.id,
				messages: [{
					class: 'color-redA',
					message: 'You have more than 50 items in your stash. In the next version (v0.3.1) you will lose all items that put you over the limit',
					type: 'info'
				}]
			}, [this.obj.serverId]);
		}
	},

	simplify: function (self) {
		if (!self)
			return null;

		return {
			type: 'stash',
			active: this.active,
			items: this.items
		};
	},

	serialize: function () {
		return this.items;
	}
};
