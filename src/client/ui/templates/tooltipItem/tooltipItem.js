define([
	'js/system/events',
	'css!ui/templates/tooltipItem/styles',
	'html!ui/templates/tooltipItem/template',
	'html!ui/templates/tooltipItem/templateTooltip',
	'js/misc/statTranslations'
], function (
	events,
	styles,
	template,
	tplTooltip,
	statTranslations
) {
	let percentageStats = [
		'addCritChance',
		'addCritMultiplier',
		'addAttackCritChance',
		'addAttackCritMultiplier',
		'addSpellCritChance',
		'addSpellCritMultiplier',
		'sprintChance',
		'xpIncrease',
		'blockAttackChance',
		'blockSpellChance',
		'dodgeAttackChance',
		'dodgeSpellChance',
		'attackSpeed',
		'castSpeed',
		'itemQuantity',
		'magicFind',
		'catchChance',
		'catchSpeed',
		'fishRarity',
		'fishWeight',
		'fishItems'
	];

	return {
		tpl: template,
		type: 'tooltipItem',

		tooltip: null,
		item: null,

		postRender: function () {
			this.tooltip = this.el.find('.tooltip');

			this.onEvent('onShowItemTooltip', this.onShowItemTooltip.bind(this));
			this.onEvent('onHideItemTooltip', this.onHideItemTooltip.bind(this));
		},

		onHideItemTooltip: function (item) {
			if (
				(!this.item) ||
				(
					(this.item !== item) &&
					(this.item.refItem) &&
					(this.item.refItem !== item)
				)
			)
				return;

			this.item = null;
			this.tooltip.hide();
		},

		onShowItemTooltip: function (item, pos, compare, bottomAlign, shiftDown) {
			this.item = item;

			let tempStats = $.extend(true, {}, item.stats);
			let enchantedStats = item.enchantedStats || {};

			if ((compare) && (shiftDown)) {
				if (!item.eq) {
					let compareStats = compare.stats;
					for (let s in tempStats) {
						if (compareStats[s]) {
							let delta = tempStats[s] - compareStats[s];
							if (delta > 0)
								tempStats[s] = '+' + delta;
							else if (delta < 0)
								tempStats[s] = delta;
						} else
							tempStats[s] = '+' + tempStats[s];
					}
					for (let s in compareStats) {
						if (!tempStats[s]) 
							tempStats[s] = -compareStats[s];
					}
				}
			} else {
				Object.keys(tempStats).forEach(function (s) {
					if (enchantedStats[s]) {
						tempStats[s] -= enchantedStats[s];
						if (tempStats[s] <= 0)
							delete tempStats[s];

						tempStats['_' + s] = enchantedStats[s];
					}
				});
			}

			let stats = Object.keys(tempStats)
				.map(function (s) {
					let isEnchanted = (s[0] === '_');
					let statName = s;
					if (isEnchanted)
						statName = statName.substr(1);

					statName = statTranslations.translate(statName);
					let value = tempStats[s];

					if (percentageStats.indexOf(s) > -1)
						value += '%';
					else if ((s.indexOf('element') === 0) && (s.indexOf('Resist') === -1))
						value += '%';

					let row = value + ' ' + statName;
					let rowClass = '';

					if (compare) {
						if (row.indexOf('-') > -1)
							rowClass = 'loseStat';
						else if (row.indexOf('+') > -1)
							rowClass = 'gainStat';
					}
					if (isEnchanted)
						rowClass += ' enchanted';

					row = '<div class="' + rowClass + '">' + row + '</div>';

					return row;
				}, this)
				.sort(function (a, b) {
					return (a.replace(' enchanted', '').length - b.replace(' enchanted', '').length);
				})
				.sort(function (a, b) {
					if ((a.indexOf('enchanted') > -1) && (b.indexOf('enchanted') === -1))
						return 1;
					else if ((a.indexOf('enchanted') === -1) && (b.indexOf('enchanted') > -1))
						return -1;
					return 0;
				})
				.join('');

			let implicitStats = (item.implicitStats || []).map(function (s) {
				let stat = s.stat;
				let statName = statTranslations.translate(stat);
				let value = s.value;

				if (percentageStats.indexOf(stat) > -1)
					value += '%';
				else if ((stat.indexOf('element') === 0) && (stat.indexOf('Resist') === -1))
					value += '%';

				let row = value + ' ' + statName;
				let rowClass = '';
				row = '<div class="' + rowClass + '">' + row + '</div>';

				return row;
			}).join('');

			let itemName = item.name;
			if (item.quantity > 1)
				itemName += ' x' + item.quantity;

			let level = null;
			if (item.level)
				level = item.level.push ? item.level[0] + ' - ' + item.level[1] : item.level;

			let html = tplTooltip
				.replace('$NAME$', itemName)
				.replace('$QUALITY$', item.quality)
				.replace('$TYPE$', item.type)
				.replace('$SLOT$', item.slot)
				.replace('$IMPLICITSTATS$', implicitStats)
				.replace('$STATS$', stats)
				.replace('$LEVEL$', level);

			if (item.requires) {
				html = html
					.replace('$ATTRIBUTE$', item.requires[0].stat)
					.replace('$ATTRIBUTEVALUE$', item.requires[0].value);
			}

			if (item.power)
				html = html.replace('$POWER$', ' ' + (new Array(item.power + 1)).join('+'));

			if ((item.spell) && (item.spell.values)) {
				let abilityValues = '';
				for (let p in item.spell.values) {
					if ((compare) && (shiftDown)) {
						let delta = item.spell.values[p] - compare.spell.values[p];
						// adjust by EPSILON to handle float point imprecision, otherwise 3.15 - 2 = 1.14 or 2 - 3.15 = -1.14
						// have to move away from zero by EPSILON, not a simple add
						if (delta >= 0) 
							delta += Number.EPSILON;
						else 
							delta -= Number.EPSILON;
						
						delta = ~~((delta) * 100) / 100;
						let rowClass = '';
						if (delta > 0) {
							rowClass = 'gainDamage';
							delta = '+' + delta;
						} else if (delta < 0) 
							rowClass = 'loseDamage';
						
						abilityValues += '<div class="' + rowClass + '">' + p + ': ' + delta + '</div>';
					} else 
						abilityValues += p + ': ' + item.spell.values[p] + '<br/>';
				}
				if (!item.ability)
					abilityValues = abilityValues;
				html = html.replace('$DAMAGE$', abilityValues);
			}

			this.tooltip.html(html);

			if (!item.level)
				this.tooltip.find('.level').hide();
			else
				this.tooltip.find('.level').show();

			if (!item.implicitStats)
				this.tooltip.find('.implicitStats').hide();
			else
				this.tooltip.find('.implicitStats').show();

			if (!item.requires) {
				if (!item.level)
					this.tooltip.find('.requires').hide();
				else
					this.tooltip.find('.requires .stats').hide();
			} else
				this.tooltip.find('.requires .stats').show();

			if ((!item.stats) || (!Object.keys(item.stats).length))
				this.tooltip.children('.stats').hide();

			if ((!item.type) || (item.type === item.name))
				this.tooltip.find('.type').hide();
			else {
				this.tooltip.find('.type')
					.html(item.type)
					.show();
			}

			if (item.power)
				this.tooltip.find('.power').show();

			let equipErrors = window.player.inventory.equipItemErrors(item);
			equipErrors.forEach(function (e) {
				this.tooltip.find('.requires').addClass('high-level');
				this.tooltip.find('.requires .' + e).addClass('high-level');
			}, this);

			if ((item.material) || (item.quest)) {
				this.tooltip.find('.level').hide();
				this.tooltip.find('.info').hide();

				if (item.material)
					this.tooltip.find('.material').show();
				else if (item.quest)
					this.tooltip.find('.quest').show();
			} else if (item.eq)
				this.tooltip.find('.info').hide();

			if (!item.ability) 
				this.tooltip.find('.damage').hide();
			else
				this.tooltip.find('.info').hide();

			if (item.spell) {
				this.tooltip.find('.spellName')
					.html(item.spell.name)
					.addClass('q' + item.spell.quality)
					.show();
				this.tooltip.find('.damage')
					.show();
				if (item.ability)
					this.tooltip.find('.spellName').hide();
			} else
				this.tooltip.find('.spellName').hide();

			this.tooltip.find('.worth').html(item.worthText ? ('<br />value: ' + item.worthText) : '');

			if (item.effects && item.effects[0].text && item.type !== 'mtx') {
				let htmlEffects = '';

				item.effects.forEach(function (e, i) {
					htmlEffects += e.text;
					if (i < item.effects.length - 1)
						htmlEffects += '<br />';
				});

				this.find('.effects')
					.html(htmlEffects)
					.show();
			} else if (item.description) {
				this.find('.effects')
					.html(item.description)
					.show();
			} else
				this.find('.effects').hide();

			if (item.type === 'Reward Card') {
				this.find('.spellName')
					.html('Set Size: ' + item.setSize)
					.show();
			}

			if (item.factions) {
				let htmlFactions = '';

				item.factions.forEach(function (f, i) {
					let htmlF = f.name + ': ' + f.tierName;
					if (f.noEquip)
						htmlF = '<font class="color-red">' + htmlF + '</font>';

					htmlFactions += htmlF;
					if (i < item.factions.length - 1)
						htmlFactions += '<br />';
				});

				this.find('.faction')
					.html(htmlFactions)
					.show();
			} else
				this.find('.faction').hide();

			if ((shiftDown) || (!compare))
				this.tooltip.find('.info').hide();

			if (item.cd) {
				this.tooltip.find('.info')
					.html('cooldown: ' + item.cd)
					.show();
			} else if (item.uses) {
				this.tooltip.find('.info')
					.html('uses: ' + item.uses)
					.show();
			}

			this.tooltip
				.show();

			if (pos) {
				if (bottomAlign)
					pos.y -= this.tooltip.height();

				this.tooltip.css({
					left: pos.x,
					top: pos.y
				});
			}

			events.emit('onBuiltItemTooltip', this.tooltip);
		},

		showWorth: function (canAfford) {
			this.tooltip.find('.worth').show();

			if (!canAfford)
				this.tooltip.find('.worth').addClass('no-afford');
		}
	};
});
