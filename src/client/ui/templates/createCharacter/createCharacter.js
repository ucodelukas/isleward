define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/createCharacter/template',
	'css!ui/templates/createCharacter/styles',
	'ui/factory'
], function (
	events,
	client,
	template,
	styles,
	uiFactory
) {
	return {
		tpl: template,
		centered: true,

		classSprites: null,
		class: null,
		costume: 0,
		skinId: null,

		prophecies: [],

		postRender: function () {
			this.getSkins();

			uiFactory.build('tooltips');

			this.find('.txtClass')
				.on('click', this.changeClass.bind(this))
				.on('mousemove', this.onClassHover.bind(this))
				.on('mouseleave', this.onClassUnhover.bind(this));

			this.find('.txtCostume').on('click', this.changeCostume.bind(this));

			this.find('.btnBack').on('click', this.back.bind(this));
			this.find('.btnCreate').on('click', this.create.bind(this));

			this.find('.prophecy')
				.on('click', this.onProphecyClick.bind(this))
				.on('mousemove', this.onProphecyHover.bind(this))
				.on('mouseleave', this.onProphecyUnhover.bind(this));
		},

		getSkins: function () {
			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'getSkins',
				data: {

				},
				callback: this.onGetSkins.bind(this)
			});
		},

		onGetSkins: function (result) {
			this.el.removeClass('disabled');

			this.classSprites = result;

			this.costume = -1;

			this.class = 'owl';
			this.find('.txtClass').html('Owl');

			this.changeCostume({
				target: this.find('.txtCostume')
			});
		},

		onProphecyHover: function (e) {
			var el = $(e.currentTarget);

			var pos = {
				x: e.clientX + 25,
				y: e.clientY
			};

			var text = el.attr('tooltip');

			events.emit('onShowTooltip', text, el[0], pos);
			$('.uiTooltips .tooltip').addClass('bright');
		},
		onProphecyUnhover: function (e) {
			var el = $(e.currentTarget);
			events.emit('onHideTooltip', el[0]);
		},
		onProphecyClick: function (e) {
			var el = $(e.currentTarget);
			var pName = el.attr('prophecy');

			if (el.hasClass('active')) {
				this.prophecies.spliceWhere(function (p) {
					return (p == pName);
				});
				el.removeClass('active');
			} else {
				this.prophecies.push(pName);
				el.addClass('active');
			}
		},

		clear: function () {
			this.prophecies = [];
			this.find('.prophecy').removeClass('active');
		},

		back: function () {
			this.clear();

			this.el.remove();

			uiFactory.build('characters', {});
		},

		create: function () {
			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'createCharacter',
				data: {
					name: this.find('.txtName').val(),
					class: this.class,
					skinId: this.skinId,
					prophecies: this.prophecies
				},
				callback: this.onCreate.bind(this)
			});
		},
		onCreate: function (result) {
			this.el.removeClass('disabled');

			if (!result) {
				this.clear();
				this.el.remove();
				events.emit('onEnterGame');
			} else
				this.el.find('.message').html(result);
		},

		onClassHover: function (e) {
			var el = $(e.currentTarget);

			var pos = {
				x: e.clientX + 25,
				y: e.clientY
			};

			var text = ({
				owl: `The wise Owl guides you; granting you the focus needed to cast spells. <br /><br />Upon level up, you gain 1 Intellect.`,
				bear: `The towering Bear strenghtens you; lending force to your blows. <br /><br />Upon level up, you gain 1 Strength.`,
				lynx: `The nimble Lynx hastens you; allowing your strikes to land true. <br /><br />Upon level up, you gain 1 Dexterity.`
			})[this.class];

			events.emit('onShowTooltip', text, el[0], pos, 200);
			$('.uiTooltips .tooltip').addClass('bright');
		},
		onClassUnhover: function (e) {
			var el = $(e.currentTarget);
			events.emit('onHideTooltip', el[0]);
		},
		changeClass: function (e) {
			var el = $(e.target);
			var classes = ['owl', 'bear', 'lynx'];
			var nextIndex = (classes.indexOf(this.class) + 1) % classes.length;

			var newClass = classes[nextIndex];

			var newCostume = this.classSprites.firstIndex(function (c) {
				return (c.defaultSpirit == newClass);
			});
			if (newCostume > -1) {
				this.costume = newCostume;
				this.skinId = this.classSprites[newCostume].id;
				this.find('.txtCostume').html(this.classSprites[this.costume].name);
				this.setSprite();
			}

			el.html(newClass[0].toUpperCase() + newClass.substr(1));

			this.class = newClass;

			this.onClassHover(e);
		},

		changeCostume: function (e) {
			var el = $(e.target);

			var spriteList = this.classSprites;
			if (!spriteList)
				return;

			this.costume = (this.costume + 1) % spriteList.length;
			this.skinId = spriteList[this.costume].id;

			el.html(spriteList[this.costume].name);

			this.setSprite();
		},

		setSprite: function () {
			var classSprite = this.classSprites[this.costume];
			var costume = classSprite.sprite.split(',');
			var spirteX = -costume[0] * 8;
			var spriteY = -costume[1] * 8;

			var spritesheet = classSprite.spritesheet || '../../../images/characters.png';

			this.find('.sprite')
				.css('background', 'url("' + spritesheet + '") ' + spirteX + 'px ' + spriteY + 'px');
		}
	};
});
