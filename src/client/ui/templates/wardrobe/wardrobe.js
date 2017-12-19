define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/wardrobe/template',
	'css!ui/templates/wardrobe/styles'
], function (
	events,
	client,
	template,
	styles
) {
	return {
		tpl: template,

		centered: true,

		modal: true,

		skin: null,
		wardrobeId: null,

		postRender: function () {
			this.onEvent('onGetWardrobeSkins', this.onGetWardrobeSkins.bind(this));
			this.onEvent('onCloseWardrobe', this.hide.bind(this));

			this.on('.btnCancel', 'click', this.hide.bind(this));
			this.on('.btnApply', 'click', this.apply.bind(this));
		},

		onGetWardrobeSkins: function (msg) {
			var list = msg.skins;
			this.wardrobeId = msg.id;

			var container = this.find('.list').empty();

			list.forEach(function (l) {
				var html = '<div class="skinName">' + l.name + '</div>';

				var el = $(html)
					.appendTo(container);

				el.on('click', this.setPreview.bind(this, l, el));

				if (l.id == window.player.skinId) {
					el.addClass('current');
					this.setPreview(l, el);
				}
			}, this);

			this.show();
		},

		setPreview: function (skin, el) {
			this.find('.active').removeClass('active');

			el.addClass('active');

			this.skin = skin;

			var costume = skin.sprite.split(',');
			var spirteX = -costume[0] * 8;
			var spriteY = -costume[1] * 8;

			var spritesheet = skin.spritesheet || '../../../images/characters.png';

			this.find('.sprite')
				.css('background', 'url("' + spritesheet + '") ' + spirteX + 'px ' + spriteY + 'px');
		},

		apply: function () {
			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					targetId: this.wardrobeId,
					cpn: 'wardrobe',
					method: 'apply',
					data: {
						skinId: this.skin.id
					}
				}
			});
		}
	}
});
