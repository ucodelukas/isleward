define([
	'ui/uiBase',
	'js/system/events',
	'js/system/globals',
	'js/misc/tosAcceptanceValid'
], function (
	uiBase,
	events,
	globals,
	tosAcceptanceValid
) {
	const startupUis = [
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
	];

	return {
		uis: [],
		root: '',

		init: function (root, uiList = []) {
			if (root)
				this.root = root + '/';

			startupUis.push(...uiList);

			events.on('onEnterGame', this.onEnterGame.bind(this));
			events.on('onUiKeyDown', this.onUiKeyDown.bind(this));
			events.on('onResize', this.onResize.bind(this));
		},

		onEnterGame: function () {
			events.clearQueue();

			startupUis.forEach(function (u) {
				if (u.path)
					this.buildModUi(u);
				else
					this.build(u);
			}, this);
		},

		buildModUi: function (config) {
			const type = config.path.split('/').pop();

			this.build(type, {
				path: config.path
			});
		},

		build: function (type, options) {
			let className = 'ui' + type[0].toUpperCase() + type.substr(1);
			let el = $('.' + className);
			if (el.length > 0)
				return;

			this.getTemplate(type, options);
		},

		getTemplate: function (type, options) {
			let path = null;
			if (options && options.path)
				path = options.path + `\\${type}.js`;
			else
				path = this.root + 'ui/templates/' + type + '/' + type;

			require([path], this.onGetTemplate.bind(this, options));
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
			if (!globals.clientConfig.tos.required || tosAcceptanceValid()) {
				this.build('characters');

				return;
			}

			this.build('terms');
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
