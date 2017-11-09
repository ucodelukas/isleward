$(function () {
	var items = [{
		name: `Infernal Bite`,
		type: 'Curved Sword',
		quality: 4,
		stats: {
			Dexterity: '[200 - 300]',
			'Increased Crit Multiplier': '[40% - 65%]',
			'Your hits always critically hit': null,
			'50% of your damage is converted to fire damage': null,
			'You take [2% - 5%] of all damage you deal yourself': null
		},
		spritesheet: '../../src/client/images/items.png',
		sprite: [9, 9],
		level: 25
	}, {

	}];

	for (var i = 0; i < items.length - 1; i++) {
		$('.tooltip:first-child').clone().appendTo('body');
	}

	items.forEach(function (item, i) {
		var div = $('.tooltip').eq(i);

		for (var p in item) {
			var val = item[p];

			div.find('.' + p).html(val);
		}

		var stats = item.stats;
		if (stats) {
			var val = '';
			for (var s in stats) {
				var v = s;
				if (stats[s])
					v = stats[s] + ' ' + s;
				val += '<div class="stat">' + v + '</div>';
			}
			div.find('.stats').html(val);
		}

		div.find('.sprite')
			.css({
				background: 'url(' + item.spritesheet + ') ' + (-item.sprite[0] * 64) + 'px ' + (-item.sprite[1] * 64) + 'px'
			})
			.html('');

		div.find('.name').addClass('q' + item.quality);
	});
});
