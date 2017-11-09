$(function () {
	var item = {
		name: `Thunder's Bite`,
		type: 'Dagger',
		quality: 3,
		stats: {
			Dexterity: '[200 - 300]',
			'Increased Crit Multiplier': '[40% - 65%]',
			'Your hits always critically hit': null,
			'You take [2% - 5%] of all damage you deal yourself': null
		},
		spritesheet: '../../src/client/images/items.png',
		sprite: [0, 0],
		level: 25
	};

	for (var p in item) {
		var val = item[p];

		$('.' + p).html(val);
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
		$('.stats').html(val);
	}

	$('.sprite')
		.css({
			background: 'url(' + item.spritesheet + ') ' + (item.sprite[0] * 64) + 'px ' + (item.sprite[1] * 64) + 'px'
		})
		.html('');

	$('.name').addClass('q' + item.quality);
});
