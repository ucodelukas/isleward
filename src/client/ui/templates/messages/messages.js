define([
	'js/system/events',
	'html!ui/templates/messages/template',
	'html!ui/templates/messages/tplTab',
	'css!ui/templates/messages/styles',
	'js/input',
	'js/system/client',
	'js/config'
], function (
	events,
	template,
	tplTab,
	styles,
	input,
	client,
	config
) {
	return {
		tpl: template,

		currentFilter: 'info',

		messages: [],
		maxTtl: 500,

		maxChatLength: 255,

		hoverItem: null,

		hoverFilter: false,

		lastChannel: null,

		postRender: function () {
			this.onEvent('onGetMessages', this.onGetMessages.bind(this));
			this.onEvent('onDoWhisper', this.onDoWhisper.bind(this));
			this.onEvent('onJoinChannel', this.onJoinChannel.bind(this));
			this.onEvent('onLeaveChannel', this.onLeaveChannel.bind(this));
			this.onEvent('onGetCustomChatChannels', this.onGetCustomChatChannels.bind(this));
			this.onEvent('onToggleLastChannel', this.onToggleLastChannel.bind(this));

			this
				.find('.filter:not(.channel):not(.btn)')
				.on('mouseover', this.onFilterHover.bind(this, true))
				.on('mouseleave', this.onFilterHover.bind(this, false))
				.on('click', this.onClickFilter.bind(this));

			if (isMobile) {
				this.kbUpper = 0;

				this.el.on('click', this.toggle.bind(this, true));
				this.renderKeyboard();

				$(tplTab)
					.appendTo(this.find('.filters'))
					.addClass('btnClose')
					.html('x')
					.on('click', this.toggle.bind(this, false, true));
			} else {
				this.find('input')
					.on('keydown', this.sendChat.bind(this))
					.on('input', this.checkChatLength.bind(this))
					.on('blur', this.toggle.bind(this, false, true));
			}

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onKeyUp', this.onKeyUp.bind(this));
		},

		update: function () {
			if (isMobile)
				return;
			
			if (this.el.hasClass('typing'))
				return;

			const time = new Date();
			let elTime = this.find('.time');
			const timeString = (
				'[ ' + 
				time.getUTCHours().toString().padStart(2, 0) + 
				':' + 
				time.getUTCMinutes().toString().padStart(2, 0) + 
				' ]'
			);
			if (elTime.html() !== timeString)
				elTime.html(timeString);
		},

		renderKeyboard: function () {
			this.find('.keyboard').remove();

			let container = $('<div class="keyboard"></div>')
				.appendTo(this.el);

			let keyboard = {
				0: 'qwertyuiop|asdfghjkl|zxcvbnm',
				1: 'QWERTYUIOP|ASDFGHJKL|ZXCVBNM',
				2: '1234567890|@#&*-+=()|_$"\';/'
			}[this.kbUpper].split('');

			//Hacky: Insert control characters in correct positions
			//Backspace goes after 'm'
			if (this.kbUpper === 0) {
				keyboard.splice(keyboard.indexOf('z'), 0, 'caps');
				keyboard.splice(keyboard.indexOf('m') + 1, 0, '<<');
			} else if (this.kbUpper === 1) {
				keyboard.splice(keyboard.indexOf('Z'), 0, 'caps');
				keyboard.splice(keyboard.indexOf('M') + 1, 0, '<<');
			} else if (this.kbUpper === 2) 
				keyboard.splice(keyboard.indexOf('/') + 1, 0, '<<');

			keyboard.push(...['|', '123', ',', 'space', '.', 'send']);

			let row = 0;
			keyboard.forEach(k => {
				if (k === '|') {
					row++;

					const postGapCount = row === 4 ? 0 : row - 1;
					for (let i = 0; i < postGapCount; i++) 
						$('<div class="gap" />').appendTo(container);
					
					$('<div class="newline" />').appendTo(container);
					
					const preGapCount = row === 3 ? 0 : row;
					for (let i = 0; i < preGapCount; i++) 
						$('<div class="gap" />').appendTo(container);

					return;	
				}

				let className = (k.length === 1) ? 'key' : 'key special';
				if (k === ' ') {
					k = '.';
					className = 'key hidden';
				}

				className += ' ' + k;

				let elKey = $(`<div class="${className}">${k}</div>`)
					.appendTo(container);

				if (!className.includes('hidden')) 	
					elKey.on('click', this.clickKey.bind(this, k));
			});
		},

		clickKey: function (key) {
			window.navigator.vibrate(20);

			let elInput = this.find('input');

			const handler = {
				caps: () => {
					this.kbUpper = (this.kbUpper + 1) % 2;
					this.renderKeyboard();
				},

				123: () => {
					this.kbUpper = (this.kbUpper === 2) ? 0 : 2;
					this.renderKeyboard();
				},

				space: () => {
					this.clickKey(' ');
				},

				'<<': () => {
					elInput.val(elInput.val().slice(0, -1));
					this.find('.input').html(elInput.val());
				},

				send: () => {
					this.sendChat({
						which: 13
					});
					this.find('.input').html('');
					this.find('input').val('');
				}
			}[key];
			if (handler) {
				handler();
				return;
			}

			elInput.val(elInput.val() + key);
			this.checkChatLength();

			this.find('.input').html(elInput.val());
		},

		checkChatLength: function () {
			let textbox = this.find('input');
			let val = textbox.val();

			if (val.length <= this.maxChatLength)
				return;

			val = val.substr(0, this.maxChatLength);
			textbox.val(val);
		},

		onGetCustomChatChannels: function (channels) {
			channels.forEach(function (c) {
				this.onJoinChannel(c);
			}, this);
		},

		onJoinChannel: function (channel) {
			this.find('[filter="' + channel.trim() + '"]').remove();

			let container = this.find('.filters');
			$(tplTab)
				.appendTo(container)
				.addClass('channel')
				.attr('filter', channel.trim())
				.html(channel.trim())
				.on('mouseover', this.onFilterHover.bind(this, true))
				.on('mouseleave', this.onFilterHover.bind(this, false))
				.on('click', this.onClickFilter.bind(this));
		},

		onLeaveChannel: function (channel) {
			this.find('.filters [filter="' + channel + '"]').remove();
		},

		onFilterHover: function (hover) {
			this.hoverFilter = hover;
		},

		onClickFilter: function (e) {
			let el = $(e.target);
			el.toggleClass('active');

			let filter = el.attr('filter');
			let method = (el.hasClass('active') ? 'show' : 'hide');

			if (method === 'show')
				this.find('.list').addClass(filter);
			else
				this.find('.list').removeClass(filter);

			if (el.hasClass('channel')) 
				this.find('.list .' + filter)[method]();
		},

		onKeyDown: function (key) {
			if (key === 'enter') {
				this.toggle(true);
				this.find('input').val(this.lastChannel || '');
			} else if (key === 'shift')
				this.showItemTooltip();
		},

		onKeyUp: function (key) {
			if (key === 'shift')
				this.showItemTooltip();
		},

		onDoWhisper: function (charName) {
			this.toggle(true);
			let toName = charName;
			if (charName.indexOf(' ') > -1)
				toName = "'" + toName + "'";

			this.find('input').val('@' + toName + ' ');
		},

		onGetMessages: function (e) {
			let messages = e.messages;
			if (!messages.length)
				messages = [messages];

			let container = this.find('.list');

			messages.forEach(m => {
				let message = m.message;

				if (m.source && window.player.social.isPlayerBlocked(m.source))
					return;

				if (m.item) {
					let source = message.split(':')[0];
					message = source + ': <span class="q' + (m.item.quality || 0) + '">' + message.replace(source + ': ', '') + '</span>';
				}

				let el = $('<div class="list-message ' + m.class + '">' + message + '</div>')
					.appendTo(container);

				if (m.has('type'))
					el.addClass(m.type);
				else
					el.addClass('info');

				if (m.item) {
					let clickHander = () => {};
					let moveHandler = this.showItemTooltip.bind(this, el, m.item);
					if (isMobile) 
						[clickHander, moveHandler] = [moveHandler, clickHander];

					el.find('span')
						.on('mousemove', moveHandler)
						.on('mousedown', clickHander)
						.on('mouseleave', this.hideItemTooltip.bind(this));
				}

				if (m.type) {
					let isChannel = (['info', 'chat', 'loot', 'rep'].indexOf(m.type) === -1);
					if (isChannel) {
						if (this.find('.filter[filter="' + m.type + '"]').hasClass('active'))
							el.show();
					}

					if (isMobile && m.type === 'loot') {
						events.emit('onGetAnnouncement', {
							msg: m.message
						});
					}
				}

				this.messages.push({
					ttl: this.maxTtl,
					el: el
				});
			});

			if (!this.el.hasClass('typing'))
				container.scrollTop(9999999);
		},

		hideItemTooltip: function () {
			if (this.dragEl) {
				this.hoverCell = null;
				return;
			}

			events.emit('onHideItemTooltip', this.hoverItem);
			this.hoverItem = null;
		},

		showItemTooltip: function (el, item, e) {
			if (item)
				this.hoverItem = item;
			else
				item = this.hoverItem;

			if (!item)
				return;

			let ttPos = null;
			if (el) {
				ttPos = {
					x: ~~(e.clientX + 32),
					y: ~~(e.clientY)
				};
			}

			let bottomAlign = !isMobile;

			events.emit('onShowItemTooltip', item, ttPos, true, bottomAlign);
		},

		toggle: function (show, isFake, e) {
			if ((isFake) && (this.hoverFilter))
				return;

			input.resetKeys();

			this.el.removeClass('typing');

			let textbox = this.find('input');

			if (show) {
				this.el.addClass('typing');
				textbox.focus();
				this.find('.list').scrollTop(9999999);
			} else 
				textbox.val('');

			if (e)
				e.stopPropagation();
		},

		sendChat: function (e) {
			if (e.which === 27) {
				this.toggle(false);
				return;
			} else if (e.which === 9) {
				e.preventDefault();
				let textfield = this.find('input');
				textfield.val(`${textfield.val()}    `);
				return;
			} else if (e.which !== 13)
				return; 

			if (!this.el.hasClass('typing')) {
				this.toggle(true);
				return;
			}

			let textbox = this.find('input');
			let msgConfig = {
				success: true,
				message: textbox.val()
			};

			events.emit('onBeforeChat', msgConfig);

			let val = msgConfig.message
				.split('<')
				.join('&lt;')
				.split('>')
				.join('&gt;');

			textbox.blur();
			
			if (!msgConfig.success)
				return;

			if (val.trim() === '')
				return;

			if (config.rememberChatChannel) {
				const firstChar = val[0];
				let lastChannel = null;
				if ('@$'.includes(firstChar)) {
					const firstSpace = val.indexOf(' ');
					if (firstSpace === -1)
						lastChannel = val + ' ';
					else
						lastChannel = val.substr(0, firstSpace) + ' ';
				} else if (firstChar === '%')
					lastChannel = '%';

				this.lastChannel = lastChannel;
			}

			client.request({
				cpn: 'social',
				method: 'chat',
				data: {
					message: val
				}
			});
		},

		onToggleLastChannel: function (isOn) {
			if (!isOn) 
				this.lastChannel = null;
		}
	};
});
