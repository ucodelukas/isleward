define([
	'ui/uiBase',
	'js/system/events'
], function (
	uiBase,
	events
) {
	return {
		uis: [],
		root: '',

		init: function (root) {
			if (root)
				this.root = root + '/';

			events.on('onEnterGame', this.onEnterGame.bind(this));
			events.on('onUiKeyDown', this.onUiKeyDown.bind(this));
			events.on('onResize', this.onResize.bind(this));
		},

		onEnterGame: function () {
			events.clearQueue();

			[
				'inventory',
				'equipment',
				'hud',
				'target',
				'menu',
				'spells',
				'messages',
				'online',
				'mainMenu',
				'context',
				'party',
				'help',
				'dialogue',
				'buffs',
				'tooltips',
				'tooltipInfo',
				'tooltipItem',
				'announcements',
				'quests',
				'events',
				'progressBar',
				'stash',
				'smithing',
				'talk',
				'trade',
				'overlay',
				'death',
				'leaderboard',
				'reputation',
				'mail',
				'wardrobe',
				'passives',
				'workbench',
				'middleHud',
				'options'
			].forEach(function (u) {
				this.build(u);
			}, this);
		},

		build: function (type, options) {
			//Don't make doubles?
			let className = 'ui' + type[0].toUpperCase() + type.substr(1);
			let el = $('.' + className);
			if (el.length > 0)
				return;

			this.getTemplate(type, options);
		},

		getTemplate: function (type, options) {
			require([this.root + 'ui/templates/' + type + '/' + type], this.onGetTemplate.bind(this, options));
		},

		onGetTemplate: function (options, template) {
			let ui = $.extend(true, {}, uiBase, template);
			ui.setOptions(options);

			requestAnimationFrame(this.renderUi.bind(this, ui));
		},

		renderUi: function (ui) {
			ui.render();
			ui.el.data('ui', ui);

			this.uis.push(ui);
		},

		onResize: function () {
			this.uis.forEach(function (ui) {
				if (ui.centered)
					ui.center();
				else if ((ui.centeredX) || (ui.centeredY))
					ui.center(ui.centeredX, ui.centeredY);
			}, this);
		},

		onUiKeyDown: function (keyEvent) {
			if (keyEvent.key === 'esc') {
				const closedUis = [];

				this.uis.forEach(u => {
					if (!u.modal || !u.shown)
						return;

					keyEvent.consumed = true;
					u.hide();

					closedUis.push(u);
				});
				
				$('.uiOverlay').hide();
				events.emit('onHideContextMenu');

				closedUis.forEach(c => {
					if (c.afterHide)
						c.afterHide();
				});
			} else if (['o', 'j', 'h', 'i'].indexOf(keyEvent.key) > -1)
				$('.uiOverlay').hide();
		},

		preload: function () {
			require([
				'death',
				'dialogue',
				'equipment',
				'events',
				'hud',
				'inventory',
				'overlay',
				'passives',
				'quests',
				'reputation',
				'smithing',
				'stash'
			].map(m => 'ui/templates/' + m + '/' + m), this.afterPreload.bind(this));
		},

		afterPreload: function () {
			this.build('characters', {});
		},

		update: function () {
			let uis = this.uis;
			let uLen = uis.length;
			for (let i = 0; i < uLen; i++) {
				let u = uis[i];
				if (u.update)
					u.update();
			}
		}
	};
});
