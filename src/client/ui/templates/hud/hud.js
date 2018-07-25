define([
	'js/system/events',
	'html!ui/templates/hud/template',
	'css!ui/templates/hud/styles'
], function (
	events,
	template,
	styles
) {
	return {
		tpl: template,

		stats: null,

		postRender: function () {
			this.onEvent('onGetStats', this.onGetStats.bind(this));
			this.onEvent('onGetPortrait', this.onGetPortrait.bind(this));
		},

		onGetStats: function (stats) {
			this.stats = stats;
			this.build();
		},

		onGetPortrait: function (portrait) {
			let spritesheet = portrait.spritesheet || '../../../images/portraitIcons.png';

			let x = portrait.x * -64;
			let y = portrait.y * -64;

			this.find('.portrait')
				.css({
					background: 'url("' + spritesheet + '") ' + x + 'px ' + y + 'px',
					visibility: 'visible'
				});
		},

		build: function () {
			let stats = this.stats;

			let boxes = this.find('.statBox');

			[
				stats.hp / stats.hpMax,
				stats.mana / stats.manaMax,
				stats.xp / stats.xpMax
			].forEach(function (s, i) {
				boxes.eq(i).find('div:first-child').width(Math.max(0, Math.min(100, ~~(s * 100))) + '%');
			});

			this.find('.statManaReserve').width(Math.max(0, Math.min(100, ~~(stats.manaReservePercent * 100))) + '%');

			boxes.eq(0).find('.text').html(Math.floor(stats.hp) + '/' + ~~stats.hpMax);
			boxes.eq(1).find('.text').html(Math.floor(stats.mana) + '/' + ~~stats.manaMax);

			boxes.eq(2).find('.text').html('level: ' + stats.level);
		}
	};
});
