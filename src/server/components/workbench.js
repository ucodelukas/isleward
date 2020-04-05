const recipes = require('../config/recipes/recipes');
const generator = require('../items/generator');

const { applyItemStats } = require('./equipment/helpers');

const buildRecipe = require('./workbench/buildRecipe');
const buildMaterials = require('./workbench/buildMaterials');
const buildPickedItems = require('./workbench/buildPickedItems');

module.exports = {
	type: 'workbench',

	craftType: null,

	init: function (blueprint) {
		this.craftType = blueprint.type;

		this.obj.instance.objects.buildObjects([{
			properties: {
				x: this.obj.x - 1,
				y: this.obj.y - 1,
				width: 3,
				height: 3,
				cpnNotice: {
					actions: {
						enter: {
							cpn: 'workbench',
							method: 'enterArea',
							targetId: this.obj.id,
							args: []
						},
						exit: {
							cpn: 'workbench',
							method: 'exitArea',
							targetId: this.obj.id,
							args: []
						}
					}
				}
			}
		}]);
	},

	exitArea: function (obj) {
		if (!obj.player)
			return;

		obj.syncer.setArray(true, 'serverActions', 'removeActions', {
			key: 'u',
			action: {
				targetId: this.obj.id,
				cpn: 'workbench',
				method: 'access'
			}
		});

		this.obj.instance.syncer.queue('onCloseWorkbench', null, [obj.serverId]);
	},

	enterArea: function (obj) {
		if (!obj.player)
			return;

		let msg = `Press U to access the ${this.obj.name}`;

		obj.syncer.setArray(true, 'serverActions', 'addActions', {
			key: 'u',
			name: 'access workbench',
			action: {
				targetId: this.obj.id,
				cpn: 'workbench',
				method: 'open'
			}
		});

		this.obj.instance.syncer.queue('onGetAnnouncement', {
			src: this.obj.id,
			msg: msg
		}, [obj.serverId]);
	},

	open: async function (msg) {
		if (!msg.has('sourceId'))
			return;

		let obj = this.obj.instance.objects.objects.find(o => o.serverId === msg.sourceId);
		if ((!obj) || (!obj.player))
			return;

		let thisObj = this.obj;
		if ((Math.abs(thisObj.x - obj.x) > 1) || (Math.abs(thisObj.y - obj.y) > 1))
			return;

		const unlocked = await io.getAsync({
			key: obj.name,
			table: 'recipes',
			isArray: true
		});

		this.obj.instance.syncer.queue('onOpenWorkbench', {
			workbenchId: this.obj.id,
			name: this.obj.name,
			recipes: recipes.getList(this.craftType, unlocked)
		}, [obj.serverId]);
	},

	getRecipe: function (msg) {
		let obj = this.obj.instance.objects.objects.find(o => o.serverId === msg.sourceId);
		if ((!obj) || (!obj.player))
			return;

		const sendRecipe = buildRecipe(this.craftType, obj, msg);

		this.resolveCallback(msg, sendRecipe);
	},

	craft: function (msg) {
		const { craftType, obj: { instance: { objects: { objects } } } } = this;
		const { name: recipeName, sourceId } = msg;

		const crafter = objects.find(o => o.serverId === sourceId);
		if (!crafter || !crafter.player)
			return;

		const recipe = recipes.getRecipe(craftType, recipeName);
		if (!recipe)
			return;

		const { needItems } = recipe;
		const { syncer, inventory, equipment, spellbook } = crafter;

		const materials = buildMaterials(crafter, recipe, msg);
		const pickedItems = buildPickedItems(crafter, recipe, msg);
		
		const canCraft = (
			!materials.some(m => m.noHaveEnough) &&
			pickedItems.length === needItems.length &&
			!pickedItems.some(i => !i)
		);
		if (!canCraft)
			return;

		materials.forEach(m => inventory.destroyItem(m.id, m.needQuantity));

		let resultMsg = null;

		if (recipe.craftAction) {
			pickedItems.forEach(p => {
				if (p.eq)
					applyItemStats(crafter, p, false);
			});

			const oldSlots = pickedItems.map(p => p.slot);
			resultMsg = recipe.craftAction(crafter, pickedItems);

			pickedItems.forEach((p, i) => {
				if (!p.eq)
					return;

				applyItemStats(crafter, p, true);

				if (p.slot !== oldSlots[i])
					equipment.unequip(p.id);

				spellbook.calcDps();

				pickedItems.forEach(item => syncer.setArray(true, 'inventory', 'getItems', inventory.simplifyItem(item)));
			});

			equipment.unequipAttrRqrGear();
		}

		if (recipe.item || recipe.items) {
			const outputItems = recipe.item ? [ recipe.item ] : recipe.items;
			outputItems.forEach(itemBpt => {
				let item = null;
				if (itemBpt.generate)
					item = generator.generate(itemBpt);
				else
					item = extend({}, itemBpt);
				
				if (item.description)
					item.description += `<br /><br />(Crafted by ${crafter.name})`;
				else
					item.description = `<br /><br />(Crafted by ${crafter.name})`;
				
				const quantity = item.quantity;
				if (quantity && quantity.push)
					item.quantity = quantity[0] + ~~(Math.random() * (quantity[1] - quantity[0]));

				crafter.inventory.getItem(item);
			});
		}

		this.resolveCallback(msg, {
			resultMsg,
			recipe: buildRecipe(craftType, crafter, msg)
		});
	},

	resolveCallback: function (msg, result) {
		let callbackId = (msg.has('callbackId')) ? msg.callbackId : msg;
		result = result || [];

		if (!callbackId)
			return;

		process.send({
			module: 'atlas',
			method: 'resolveCallback',
			msg: {
				id: callbackId,
				result: result
			}
		});
	}
};
