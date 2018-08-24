define([
	'js/system/events',
	'html!ui/templates/hud/template',
	'css!ui/templates/hud/styles',
	'js/system/client'
], function (
	events,
	template,
	styles,
	client
) {
	return {
		tpl: template,

		stats: null,
		items: null,

		postRender: function () {
			this.onEvent('onGetStats', this.events.onGetStats.bind(this));
			this.onEvent('onGetPortrait', this.events.onGetPortrait.bind(this));
			this.onEvent('onGetItems', this.events.onGetItems.bind(this));
			this.onEvent('onDestroyItems', this.events.onDestroyItems.bind(this));
			this.onEvent('onKeyDown', this.events.onKeyDown.bind(this));
		},

		build: function () {
			let stats = this.stats;

			let boxes = this.find('.statBox');

			[
				stats.hp / stats.hpMax,
				stats.mana / stats.manaMax,
				stats.xp / stats.xpMax
			].forEach((s, i) => boxes.eq(i).find('div:first-child').width(Math.max(0, Math.min(100, ~~(s * 100))) + '%'));

			this.find('.statManaReserve').width(Math.max(0, Math.min(100, ~~(stats.manaReservePercent * 100))) + '%');

			boxes.eq(0).find('.text').html(Math.floor(stats.hp) + '/' + ~~stats.hpMax);
			boxes.eq(1).find('.text').html(Math.floor(stats.mana) + '/' + ~~stats.manaMax);
			boxes.eq(2).find('.text').html('level: ' + stats.level);
		},

		useQuickItem: function () {
			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'equipment',
					method: 'useQuickSlot',
					data: {
						slot: 0
					}
				}
			});
		},

		events: {
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

			onDestroyItems: function (itemIds) {
				const quickItem = this.items.find(f => f.has('quickSlot'));
				if (!quickItem || itemIds.includes(quickItem.id)) {
					this.find('.quickItem')
						.hide()
						.find('.icon')
						.css('background', '');
				}
			},

			onGetItems: function (items) {
				this.items = items;

				const quickItem = items.find(f => f.has('quickSlot'));
				if (!quickItem) {
					this.find('.quickItem')
						.hide()
						.find('.icon')
						.css('background', '');
					return;
				}

				let spritesheet = quickItem.spritesheet || '../../../images/items.png';
				if (quickItem.type === 'consumable')
					spritesheet = '../../../images/consumables.png';

				let imgX = -quickItem.sprite[0] * 64;
				let imgY = -quickItem.sprite[1] * 64;

				let el = this.find('.quickItem').show();
				el
					.find('.icon')
					.css('background', 'url("' + spritesheet + '") ' + imgX + 'px ' + imgY + 'px');
			},

			onKeyDown: function (key) {
				if (key === 'r')
					this.useQuickItem();
			}
		}
	};
});
