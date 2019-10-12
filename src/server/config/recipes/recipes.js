let events = require('../../misc/events');

const recipesAlchemy = require('./alchemy');
const recipesCooking = require('./cooking');
const recipesEtching = require('./etching');

let recipes = {
	alchemy: [
		...recipesAlchemy
	],
	cooking: [
		...recipesCooking
	],
	etching: [
		...recipesEtching
	]
};

module.exports = {
	init: function () {
		events.emit('onBeforeGetRecipes', recipes);
	},

	getList: function (type) {
		return (recipes[type] || [])
			.map(r => r.name);
	},

	getRecipe: function (type, name) {
		let recipe = (recipes[type] || []).find(r => r.name === name);
		return recipe;
	}
};
