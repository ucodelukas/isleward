define([
	'js/system/events',
	'html!ui/templates/target/template',
	'css!ui/templates/target/styles'
], function (
	events,
	template,
	styles
) {
	return {
		tpl: template,

		target: null,
		lastHp: null,
		lastMana: null,
		lastLevel: null,

		postRender: function () {
			this.onEvent('onSetTarget', this.onSetTarget.bind(this));
			this.onEvent('onDeath', this.onSetTarget.bind(this, null));
			this.onEvent('onGetTargetCasting', this.onGetCasting.bind(this));
		},

		onGetCasting: function (casting) {
			var box = this.el.find('.statBox')
				.eq(2);

			if ((casting == 0) || (casting == 1)) {
				box.hide();
				return;
			} else
				box.show();

			var w = ~~(casting * 100);
			box.find('[class^="stat"]').css('width', w + '%');
		},

		onContextMenu: function (e) {
			var target = this.target;
			//This is kind of a hack. We check if the target has a prophecies component since we can't check for
			// target.player (only the logged-in player has a player component)
			if ((e.button != 2) || (!target) || (!target.dialogue) || (target == window.player) || (target.prophecies))
				return;

			var context = [
				target.name,
				'----------', {
					text: 'talk',
					callback: this.onTalk.bind(this)
				}
			];

			events.emit('onContextMenu', context, e.event);

			e.event.preventDefault;
			return false;
		},

		onTalk: function () {
			window.player.dialogue.talk(this.target);
		},

		onSetTarget: function (target, e) {
			this.target = target;

			if (!this.target) {
				this.lastHp = null;
				this.lastMana = null;
				this.lastLevel = null;
				this.el.hide();
			} else {
				var el = this.el;
				el.find('.infoName').html(target.name);
				el.find('.infoLevel')
					.html('(' + target.stats.values.level + ')')
					.removeClass('high-level');

				var crushing = (target.stats.values.level - 5 >= window.player.stats.values.level);
				if (crushing)
					el.find('.infoLevel').addClass('high-level');

				el.show();
			}

			if ((e) && (e.button == 2) && (this.target))
				this.onContextMenu(e);
		},

		buildBar: function (barIndex, value, max) {
			var box = this.el.find('.statBox').eq(barIndex);

			var w = ~~((value / max) * 100);
			box.find('[class^="stat"]').css('width', w + '%');

			box.find('.text').html(Math.floor(value) + '/' + Math.floor(max));
		},

		update: function () {
			var target = this.target;

			if (!target)
				return;

			if (target.destroyed) {
				this.onSetTarget();
				return;
			}

			var stats = target.stats.values;

			if (stats.level != this.lastLevel) {
				this.el.find('.infoLevel')
					.html('(' + stats.level + ')')
					.removeClass('high-level');

				var crushing = (stats.level - 5 >= window.player.stats.level);
				if (crushing)
					this.el.find('.infoLevel').addClass('high-level');
			}

			if (stats.hp != this.lastHp) {
				this.buildBar(0, stats.hp, stats.hpMax);
				this.lastHp = stats.hp;
			}

			if (stats.mana != this.lastMana) {
				this.buildBar(1, stats.mana, stats.manaMax);
				this.lastMana = stats.mana;
			}
		}
	}
});
