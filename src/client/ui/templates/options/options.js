define([
	'js/system/events',
	'html!ui/templates/options/template',
	'css!ui/templates/options/styles',
	'js/rendering/renderer',
	'ui/factory',
	'js/objects/objects',
	'js/system/client',
	'js/sound/sound',
	'js/config'
], function (
	events,
	template,
	styles,
	renderer,
	factory,
	objects,
	client,
	sound,
	config
) {
	return {
		tpl: template,
		centered: true,

		modal: true,
		hasClose: true,

		postRender: function () {
			this.onEvent('onToggleOptions', this.toggle.bind(this));

			//Can only toggle fullscreen directly in a listener, not deferred the way jQuery does it
			this.find('.optionsItem.screen .name')[0].addEventListener('click', this.toggleScreen.bind(this));
			this.find('.optionsItem.nameplates .name').on('click', events.emit.bind(events, 'onUiKeyDown', { key: 'v' }));
			this.find('.optionsItem.quests .name').on('click', this.toggleQuests.bind(this));
			this.find('.optionsItem.events .name').on('click', this.toggleEvents.bind(this));
			this.find('.optionsItem.quality .name').on('click', this.toggleQualityIndicators.bind(this));
			this.find('.optionsItem.unusable .name').on('click', this.toggleUnusableIndicators.bind(this));
			this.find('.optionsItem.audio .name').on('click', this.toggleAudio.bind(this));
			this.find('.optionsItem.lastChannel .name').on('click', this.toggleLastChannel.bind(this));

			this.onEvent('onResize', this.onResize.bind(this));
			this.onEvent('onUiKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onToggleAudio', this.onToggleAudio.bind(this));
			this.onEvent('onToggleNameplates', this.onToggleNameplates.bind(this));
			this.onEvent('onToggleQualityIndicators', this.onToggleQualityIndicators.bind(this));
			this.onEvent('onToggleUnusableIndicators', this.onToggleUnusableIndicators.bind(this));
			this.onEvent('onToggleEventsVisibility', this.onToggleEventsVisibility.bind(this));
			this.onEvent('onToggleQuestsVisibility', this.onToggleQuestsVisibility.bind(this));
			this.onEvent('onToggleLastChannel', this.onToggleLastChannel.bind(this));
		},

		toggleUnusableIndicators: function () {
			config.toggle('unusableIndicators');

			if (config.unusableIndicators === 'background' && config.qualityIndicators === 'background') {
				config.toggle('qualityIndicators');
				events.emit('onToggleQualityIndicators', config.qualityIndicators);
			}

			events.emit('onToggleUnusableIndicators', config.unusableIndicators);
		},

		onToggleUnusableIndicators: function (state) {
			const newValue = state[0].toUpperCase() + state.substr(1);

			this.find('.optionsItem.unusable .value').html(newValue);
		},

		toggleQualityIndicators: function () {
			config.toggle('qualityIndicators');

			if (config.qualityIndicators === 'background' && config.unusableIndicators === 'background') {
				config.toggle('unusableIndicators');
				events.emit('onToggleUnusableIndicators', config.unusableIndicators);
			}

			events.emit('onToggleQualityIndicators', config.qualityIndicators);
		},

		onToggleQualityIndicators: function (state) {
			const newValue = state[0].toUpperCase() + state.substr(1);

			this.find('.optionsItem.quality .value').html(newValue);
		},

		toggleScreen: function () {
			const state = renderer.toggleScreen();
			const newValue = (state === 'Windowed') ? 'Off' : 'On';

			this.find('.optionsItem.screen .value').html(newValue);
		},

		toggleEvents: function () {
			config.toggle('showEvents');

			events.emit('onToggleEventsVisibility', config.showEvents);
		},

		toggleQuests: function () {
			config.toggle('showQuests');

			events.emit('onToggleQuestsVisibility', config.showQuests);
		},

		onToggleEventsVisibility: function (state) {
			const newValue = state ? 'On' : 'Off';

			this.find('.optionsItem.events .value').html(newValue);
		},

		onToggleQuestsVisibility: function (state) {
			const newValue = state[0].toUpperCase() + state.substr(1);

			this.find('.optionsItem.quests .value').html(newValue);
		},

		onResize: function () {
			let isFullscreen = (window.innerHeight === screen.height);
			const newValue = isFullscreen ? 'On' : 'Off';

			this.find('.optionsItem.screen .value').html(newValue);
		},

		onToggleNameplates: function (state) {
			const newValue = state ? 'On' : 'Off';

			this.find('.optionsItem.nameplates .value').html(newValue);
		},

		toggleAudio: function () {
			config.toggle('playAudio');

			events.emit('onToggleAudio', config.playAudio);
		},

		onToggleAudio: function (isAudioOn) {
			const newValue = isAudioOn ? 'On' : 'Off';

			this.find('.optionsItem.audio .value').html(newValue);
		},

		toggleLastChannel: function () {
			config.toggle('rememberChatChannel');

			events.emit('onToggleLastChannel', config.rememberChatChannel);
		},

		onToggleLastChannel: function (state) {
			const newValue = state ? 'On' : 'Off';

			this.find('.optionsItem.lastChannel .value').html(newValue);
		},

		build: function () {
			this.onToggleNameplates(config.showNames);
			this.onToggleAudio(config.playAudio);
			this.onToggleEventsVisibility(config.showEvents);
			this.onToggleQuestsVisibility(config.showQuests);
			this.onToggleQualityIndicators(config.qualityIndicators);
			this.onToggleUnusableIndicators(config.unusableIndicators);
			this.onToggleLastChannel(config.rememberChatChannel);
		},

		onAfterShow: function () {
			this.onResize();

			events.emit('onShowOverlay', this.el);

			this.build();
		},
        
		onKeyDown: function (keyEvent) {
			const { key } = keyEvent;
	
			if (key === 'v') {
				config.toggle('showNames');

				events.emit('onToggleNameplates', config.showNames);

				const newValue = config.showNames ? 'On' : 'Off';
				this.find('.optionsItem.nameplates .value').html(newValue);
			}
		},

		afterHide: function () {
			events.emit('onToggleMainMenu');
		}
	};
});
