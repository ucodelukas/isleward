define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/equipment/template',
	'css!ui/templates/equipment/styles'
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

		stats: null,
		equipment: null,

		hoverItem: null,
		hoverEl: null,
		hoverCompare: null,
		shiftDown: false,

		postRender: function () {
			this.onEvent('onGetStats', this.onGetStats.bind(this));
			this.onEvent('onGetItems', this.onGetItems.bind(this));

			this.onEvent('onShowEquipment', this.toggle.bind(this));

			this.find('.tab').on('click', this.onTabClick.bind(this));

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onKeyUp', this.onKeyUp.bind(this));
		},

		toggle: function (show) {
			this.shown = !this.el.is(':visible');

			if (this.shown) {
				this.find('.itemList').hide();
				this.show();
				this.onGetStats();
				this.onGetItems();
			} else {
				this.find('.itemList').hide();
				this.hide();
			}

			this.onHoverItem(null, null, null);
		},

		onKeyDown: function (key) {
			if (key == 'j')
				this.toggle();
			else if (key == 'shift') {
				this.shiftDown = true;
				if (this.hoverItem)
					this.onHoverItem(this.hoverEl, this.hoverItem, this.hoverCompare);
			}
		},
		onKeyUp: function (key) {
			if (key == 'shift') {
				this.shiftDown = false;
				if (this.hoverItem)
					this.onHoverItem(this.hoverEl, this.hoverItem, null);
			}
		},

		onTabClick: function (e) {
			this.find('.tab.selected').removeClass('selected');

			$(e.currentTarget).addClass('selected');

			this.onGetStats(this.stats);
		},

		onGetItems: function (items) {
			items = items || this.items;
			this.items = items;

			if (!this.shown)
				return;

			this.find('.slot').addClass('empty');

			let skipSpellId = 0;

			this.find('[slot]')
				.removeData('item')
				.addClass('empty show-default-icon')
				.find('.info')
				.html('')
				.parent()
				.find('.icon')
				.off()
				.css('background-image', '')
				.css('background-position', '')
				.on('click', this.buildSlot.bind(this));

			this.find('[slot]').toArray().forEach(function (el) {
				el = $(el);
				let slot = el.attr('slot');
				let newItems = window.player.inventory.items.some(function (i) {
					let checkSlot = slot;
					if (slot.indexOf('finger') == 0)
						slot = 'finger';
					else if (slot == 'oneHanded')
						return ((['oneHanded', 'twoHanded'].indexOf(slot) > -1) && (i.isNew));

					return ((i.slot == slot) && (i.isNew));
				});

				if (newItems)
					el.find('.info').html('new');
			});

			items
				.filter(function (item) {
					let runeSlot = item.runeSlot;
					if ((runeSlot != null) && (item.slot))
						skipSpellId = runeSlot;

					return ((item.eq) && ((item.slot) || (item.runeSlot != null)));
				}, this)
				.forEach(function (item) {
					let imgX = -item.sprite[0] * 64;
					let imgY = -item.sprite[1] * 64;

					let slot = item.slot;
					if (!slot) {
						let runeSlot = item.runeSlot;
						if (runeSlot > skipSpellId)
							runeSlot--;
						slot = 'rune-' + runeSlot;
					}

					let spritesheet = item.spritesheet || '../../../images/items.png';

					slot = item.equipSlot || slot;

					let elSlot = this.find('[slot="' + slot + '"]');
					elSlot
						.data('item', item)
						.removeClass('empty show-default-icon')
						.find('.icon')
						.css('background', 'url("' + spritesheet + '") ' + imgX + 'px ' + imgY + 'px')
						.off()
						.on('mousemove', this.onHoverItem.bind(this, elSlot, item, null))
						.on('mouseleave', this.onHoverItem.bind(this, null, null))
						.on('click', this.buildSlot.bind(this, elSlot));
				}, this);
		},

		buildSlot: function (el) {
			if (el.currentTarget)
				el = $(el.currentTarget).parent();

			let slot = el.attr('slot');
			let isRune = (slot.indexOf('rune') == 0);

			let container = this.find('.itemList')
				.empty()
				.show();

			this.hoverCompare = el.data('item');

			let items = this.items
				.filter(function (item) {
					if (isRune)
						return ((!item.slot) && (item.spell) && (!item.eq));
					
					let checkSlot = (slot.indexOf('finger') == 0) ? 'finger' : slot;
					if (slot == 'oneHanded')
						return ((!item.eq) && ((item.slot == 'oneHanded') || (item.slot == 'twoHanded')));

					return ((item.slot == checkSlot) && (!item.eq));
				}, this);
			items.splice(0, 0, {
				name: 'None',
				slot: this.hoverCompare ? this.hoverCompare.slot : null,
				id: this.hoverCompare ? this.hoverCompare.id : null,
				empty: true
			});
			if (this.hoverCompare)
				items.splice(1, 0, this.hoverCompare);

			items
				.forEach(function (item) {
					let sprite = item.sprite || [7, 0];

					let spriteSheet = item.empty ? '../../../images/uiIcons.png' : item.spritesheet || '../../../images/items.png';
					let imgX = -sprite[0] * 64;
					let imgY = -sprite[1] * 64;

					let el = $('<div class="slot"><div class="icon"></div></div>')
						.appendTo(container);

					el
						.find('.icon')
						.css('background', 'url("' + spriteSheet + '") ' + imgX + 'px ' + imgY + 'px')
						.on('mousemove', this.onHoverItem.bind(this, el, item, null))
						.on('mouseleave', this.onHoverItem.bind(this, null, null))
						.on('click', this.equipItem.bind(this, item, slot));

					if (item == this.hoverCompare)
						el.find('.icon').addClass('eq');
					else if (item.isNew)
						el.find('.icon').addClass('new');
				}, this);

			if (items.length == 0)
				container.hide();
		},

		equipItem: function (item, slot) {
			let isNew = window.player.inventory.items.some(function (i) {
				return ((i.equipSlot == slot) && (i.isNew));
			});
			if (!isNew)
				this.find('[slot="' + slot + '"] .info').html('');

			if (item == this.hoverCompare) {
				this.find('.itemList').hide();
				return;
			}

			let cpn = 'equipment';
			let method = 'equip';
			let data = item.id;

			if (item.empty)
				method = 'unequip';

			if (!item.slot) {
				cpn = 'inventory';
				method = 'learnAbility';
				data = {
					itemId: item.id,
					slot: ~~slot.replace('rune-', '') + 1
				};

				if (item.empty) {
					if (!this.hoverCompare) {
						this.find('.itemList').hide();
						return;
					} 
					method = 'unlearnAbility';
					data.itemId = this.hoverCompare.id;
				}
			} else if (item.slot == 'finger') {
				data = {
					itemId: item.id,
					slot: slot
				};
			}

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: cpn,
					method: method,
					data: data
				}
			});

			this.find('.itemList').hide();
		},

		onHoverItem: function (el, item, compare, e) {
			if (el) {
				this.hoverItem = item;
				this.hoverEl = el;

				if ((item.isNew) && (!item.eq)) {
					delete item.isNew;
					el.find('.icon').removeClass('new');
				}

				let ttPos = null;
				if (e) {
					ttPos = {
						x: ~~(e.clientX + 32),
						y: ~~(e.clientY)
					};
				}

				events.emit('onShowItemTooltip', item, ttPos, this.hoverCompare, false, this.shiftDown);
			} else {
				events.emit('onHideItemTooltip', this.hoverItem);
				this.hoverItem = null;
			}
		},

		onGetStats: function (stats) {
			if (stats)
				this.stats = stats;

			stats = this.stats;

			if (!this.shown)
				return;

			let container = this.el.find('.stats');

			container
				.children('*:not(.tabs)')
				.remove();

			let xpRemaining = (stats.xpMax - stats.xp).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

			let newStats = {
				basic: {
					level: stats.level,
					'next level': xpRemaining + 'xp',
					gap1: '',
					gold: window.player.trade.gold,
					gap2: '',
					hp: ~~stats.hp + '/' + ~~stats.hpMax,
					mana: ~~stats.mana + '/' + ~~stats.manaMax,
					'hp regen': stats.regenHp,
					'mana regen': ~~stats.regenMana + '%',
					gap3: '',
					str: stats.str,
					int: stats.int,
					dex: stats.dex,
					vit: stats.vit
				},
				offense: {
					'global crit chance': (~~(stats.critChance * 10) / 10) + '%',
					'global crit multiplier': (~~(stats.critMultiplier * 10) / 10) + '%',
					'attack crit chance': (~~((stats.critChance + stats.attackCritChance) * 10) / 10) + '%',
					'attack crit multiplier': (~~((stats.critMultiplier + stats.attackCritMultiplier) * 10) / 10) + '%',
					'spell crit chance': (~~((stats.critChance + stats.spellCritChance) * 10) / 10) + '%',
					'spell crit multiplier': (~~((stats.critMultiplier + stats.spellCritMultiplier) * 10) / 10) + '%',
					gap1: '',
					'arcane increase': stats.elementArcanePercent + '%',
					'fire increase': stats.elementFirePercent + '%',
					'frost increase': stats.elementFrostPercent + '%',
					'holy increase': stats.elementHolyPercent + '%',
					'poison increase': stats.elementPoisonPercent + '%',
					'physical increase': stats.physicalPercent + '%',
					gap2: '',
					'spell increase': stats.spellPercent + '%',
					gap3: '',
					'attack speed': (100 + stats.attackSpeed) + '%',
					'cast speed': (100 + stats.castSpeed) + '%'
				},
				defense: {
					armor: stats.armor,
					'chance to block attacks': stats.blockAttackChance + '%',
					'chance to block spells': stats.blockSpellChance + '%',
					gap1: '',
					'chance to dodge attacks': (~~(stats.dodgeAttackChance * 10) / 10) + '%',
					'chance to dodge spells': (~~(stats.dodgeSpellChance * 10) / 10) + '%',
					gap2: '',
					'arcane resist': stats.elementArcaneResist,
					'fire resist': stats.elementFireResist,
					'frost resist': stats.elementFrostResist,
					'holy resist': stats.elementHolyResist,
					'poison resist': stats.elementPoisonResist,
					gap3: '',
					'all resist': stats.elementAllResist
				},
				misc: {
					'item quality': stats.magicFind,
					'item quantity': stats.itemQuantity + '%',
					gap1: '',
					'sprint chance': (stats.sprintChance || 0) + '%',
					gap2: '',
					'xp increase': stats.xpIncrease + '%'
				}
			}[this.find('.tab.selected').html()];

			for (let s in newStats) {
				let label = s + ': ';
				let value = newStats[s];

				let isGap = false;
				if (label.indexOf('gap') == 0) {
					isGap = true;
					label = '';
					value = '';
				}

				let row = $('<div class="stat"><font class="q0">' + label + '</font><font color="#999">' + value + '</font></div>')
					.appendTo(container);

				if (s == 'gold')
					row.addClass('gold');
				else if ((s == 'level') || (s == 'next level'))
					row.addClass('blueText');

				if (isGap)
					row.addClass('empty');
			}
		}
	};
});
