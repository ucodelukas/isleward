let events = require('../../misc/events');

const recipesAlchemy = require('./alchemy');
const recipesCooking = require('./cooking');

let recipes = {
	alchemy: [
		...recipesAlchemy
	],
	cooking: [
		...recipesCooking
	]
};

module.exports = {
	init: function () {
		events.emit('onBeforeGetRecipes', recipes);
	},

	getList: function (type, unlocked = []) {
		return (recipes[type] || [])
			.filter(r => {
				let hasUnlocked = (r.default !== false);
				if (!hasUnlocked)
					hasUnlocked = unlocked.some(u => u.profession === type && u.teaches === r.id);

				return hasUnlocked;
			})
			.map(r => r.name);
	},

	getRecipe: function (type, name) {
		let recipe = (recipes[type] || []).find(r => r.name === name);
		return recipe;
	}
};
