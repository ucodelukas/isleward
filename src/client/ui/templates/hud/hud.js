define([
	'js/system/events',
	'html!ui/templates/hud/template',
	'css!ui/templates/hud/styles'
], function(
	events,
	template,
	styles
) {
	return {
		tpl: template,

		stats: null,

		postRender: function() {			
			this.onEvent('onGetStats', this.onGetStats.bind(this));
			this.onEvent('onGetPortrait', this.onGetPortrait.bind(this));
		},

		onGetStats: function(stats) {
			this.stats = stats;
			this.build();
		},

		onGetPortrait: function(portrait) {
			var spritesheet = portrait.spritesheet || '../../../images/portraitIcons.png';

			var x = portrait.x * -64;
			var y = portrait.y * -64;

			this.find('.portrait')
				.css({
					background: 'url("' + spritesheet + '") ' + x + 'px ' + y + 'px',
					visibility: 'visible'
				});
		},

		build: function() {
			var stats = this.stats;

			var boxes = this.find('.statBox');

			[
				stats.hp / stats.hpMax,
				stats.mana / stats.manaMax,
				stats.xp / stats.xpMax
			].forEach(function(s, i) {
				boxes.eq(i).find('div:first-child').width(Math.max(0, Math.min(100, ~~(s * 100))) + '%');
			});

			boxes.eq(0).find('.text').html(Math.floor(stats.hp) + '/' + ~~stats.hpMax);
			boxes.eq(1).find('.text').html(Math.floor(stats.mana) + '/' + ~~stats.manaMax);
			boxes.eq(2).find('.text').html('level: ' + stats.level);
		}
	}
});