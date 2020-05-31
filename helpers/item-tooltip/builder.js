/*let items = [{
	name: 'Bronze Hilt',
	type: 'Material',
	quality: 0,
	stats: { '10% chance to roll [2 - 5] Strength': null },
	spritesheet: './IWD_Stuff.png',
	sprite: [10, 15]
}, {
	name: 'Bronze Hilt',
	type: 'Material',
	quality: 1,
	stats: {
		'10% chance to roll [2 - 5] Strength': null,
		'10% chance to roll [1 - 4] Vitality': null
	},
	spritesheet: './IWD_Stuff.png',
	sprite: [10, 15]
}, {
	name: 'Bronze Hilt',
	type: 'Material',
	quality: 1,
	stats: { '20% chance to roll [2 - 5] Dexterity': null },
	spritesheet: './IWD_Stuff.png',
	sprite: [10, 15]
}, {
	name: 'Iron Blade',
	type: 'Material',
	quality: 0,
	stats: {
		'5% chance to roll [1% - 3%] Attack Speed': null,
		'5% chance to roll [2% - 4%] Attack Crit Chance': null
	},
	spritesheet: './IWD_Stuff.png',
	sprite: [11, 16]
}, {
	name: 'Iron Blade',
	type: 'Material',
	quality: 1,
	stats: { '20% chance to roll [10% - 20%] Attack Crit Multiplier': null },
	spritesheet: './IWD_Stuff.png',
	sprite: [11, 16]
}, {
	name: 'Iron Blade',
	type: 'Material',
	quality: 2,
	stats: { '30% chance to roll [1% - 3%] Attack Speed': null },
	spritesheet: './IWD_Stuff.png',
	sprite: [11, 16]
}, {
	name: 'Infernal Bite',
	type: 'Curved Sword',
	rqr: {
		level: 25,
		dex: 200
	},
	quality: 4,
	stats: {
		Dexterity: '[200 - 300]',
		'Increased Crit Multiplier': '[40% - 65%]',
		'Your hits always critically hit': null,
		'50% of your damage is converted to fire damage': null,
		'You take [2% - 5%] of all damage you deal yourself': null
	},
	spritesheet: '../../src/client/images/items.png',
	sprite: [9, 9]
}, {
	name: 'Cowl of Obscurity',
	type: 'Silk Cowl',
	rqr: {
		level: 20,
		dex: 150
	},
	quality: 4,
	stats: {
		Vitality: '[20 - 35]',
		Dexterity: '[150 - 220]',
		'Critical hits heal you for [1% - 3%] of your maximum health': null,
		'Your hits have a 50% chance to miss': null
	},
	spritesheet: '../../src/client/images/items.png',
	sprite: [0, 4]
}];*/

//Mining
const items2 = [
	{ text: 'Reach Level 5' },
	{ text: 'Train Mining' },
	{ text: 'Buy Basic Mining Pick' },
	{
		name: 'Iron Mining Pick',
		type: 'Tool',
		quality: 0,
		spritesheet: './IWD_Stuff.png',
		sprite: [4, 12]
	},
	{ text: 'Mine Iron Ore' },
	{
		name: 'Iron Ore',
		type: 'Material',
		quality: 0,
		spritesheet: './IWD_Stuff.png',
		sprite: [4, 11]
	},
	{ text: 'Gain Mining Skill' },
	{ text: 'Craft Iron Bars' },
	{
		name: 'Iron Bar',
		type: 'Material',
		quality: 0,
		spritesheet: './IWD_Stuff.png',
		sprite: [0, 11]
	},
	{ text: 'Gain Mining Skill' }
];

//Blacksmithing
const items = [
	{ text: 'Reach Level 5' },
	{ text: 'Train Blacksmithing' },
	{ text: 'Buy Hammer' },
	{
		name: 'Iron Blacksmith\'s Hammer',
		type: 'Tool',
		quality: 0,
		spritesheet: './IWD_Stuff.png',
		sprite: [0, 12]
	},
	{ text: 'Train Glove Plate Recipe' },
	{
		name: 'Iron Glove Plate',
		type: 'Recipe',
		quality: 0,
		spritesheet: '../../src/client/images/consumables.png',
		sprite: [0, 5]
	},
	{ text: 'Obtain Iron Bars' },
	{ text: 'Craft Plates' },
	{
		name: 'Iron Glove Plate',
		type: 'Material',
		quality: 0,
		spritesheet: './IWD_Stuff.png',
		sprite: [13, 14]
	},
	{ text: 'Gain Skill' },
	{ text: 'Train Iron Gloves Recipe' },
	{ text: 'Craft Iron Bars' },
	{
		name: 'Iron Gloves',
		type: 'Recipe',
		quality: 0,
		spritesheet: '../../src/client/images/consumables.png',
		sprite: [0, 5]
	},
	{ text: 'Craft Gloves' },
	{
		name: 'Iron Gloves',
		type: 'Recipe',
		quality: 0,
		spritesheet: '../../src/client/images/items.png',
		sprite: [3, 0]
	},
	{ text: 'Gain Skill' }
];

const htmlItem = `
<div class="tooltip">
	<div class="sprite-box">
		<div class="sprite"></div>
	</div>
	<div class="name"></div>
	<div class="type"></div>
	<div class="rqr"></div>
	<div class="stats"></div>
	<div class="description"></div>
</div>`;

const buildItem = item => {
	const div = $(htmlItem).appendTo('body');

	for (let p in item)
		div.find('.' + p).html(item[p]);

	let stats = item.stats;
	if (stats) {
		let val = '';
		for (let s in stats) {
			let v = s;
			if (stats[s])
				v = stats[s] + ' ' + s;
			val += '<div class="stat">' + v + '</div>';
		}
		div.find('.stats').html(val);
	}

	let rqr = item.rqr;
	if (rqr) {
		let val = 'Requires: ';
		for (let s in rqr) {
			val += rqr[s] + ' ' + s;
			if (Object.keys(rqr).indexOf(s) < Object.keys(rqr).length - 1)
				val += ', ';
		}
		div.find('.rqr').html(val);
	}

	const bg = `url('${item.spritesheet}') ${(-item.sprite[0] * 64)}px ${(-item.sprite[1] * 64)}px`;
	div.find('.sprite')
		.css({ background: bg })
		.html('');

	div.find('.name').addClass('q' + item.quality);
};

const htmlText = '<div class=\'text\'></div>';

const buildText = ({ text }) => {
	const div = $(htmlText)
		.appendTo('body')
		.html(text);
};

$(function () {
	items.forEach(item => {
		if (item.text)
			buildText(item);
		else
			buildItem(item);
	});
});
