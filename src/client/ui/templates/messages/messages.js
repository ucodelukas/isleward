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

		currentChannel: 'global',
		currentSubChannel: null,

		privateChannels: [],
		lastPrivateChannel: null,
		customChannels: [],
		lastCustomChannel: null,

		postRender: function () {
			[
				'onGetMessages',
				'onDoWhisper',
				'onJoinChannel',
				'onLeaveChannel',
				'onClickFilter',
				'onGetCustomChatChannels',
				'onToggleLastChannel',
				'onKeyDown',
				'onKeyUp'
			].forEach(e => this.onEvent(e, this[e].bind(this)));

			//This whole hoverFilter business is a filthy hack
			this.find('.channelPicker, .channelOptions, .filter:not(.channel)')
				.on('mouseover', this.onFilterHover.bind(this, true))
				.on('mouseleave', this.onFilterHover.bind(this, false));

			this.find('.channelPicker').on('click', this.onShowChannelOptions.bind(this, null));

			this.find('.filter:not(.channel)').on('click', this.onClickFilter.bind(this));

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
			channels.forEach(c => this.onJoinChannel(c));
		},

		onJoinChannel: function (channel) {
			this.customChannels.push(channel);

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
			this.customChannels.spliceWhere(c => c === channel);

			this.find('.filters div[filter="' + channel + '"]').remove();
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

			this.currentChannel = 'direct';
			this.currentSubChannel = charName;

			this.find('.channelPicker').html(charName);

			const elInput = this.find('input')
				.val('message')
				.focus();

			elInput[0].setSelectionRange(0, 7);
		},

		//Remember private and custom channels used
		trackHistory: function (msg) {
			const { subType, source, target, channel } = msg;

			if (subType === 'privateIn' || subType === 'privateOut') {
				const list = this.privateChannels;
				list.spliceWhere(l => l === source || l === target);

				//Newest sources are always at the end
				list.push(source || target);

				if (list.length > 5)
					list.splice(0, list.length - 5);

				if (subType === 'privateOut' && config.rememberChatChannel)
					this.lastPrivateChannel = target;
			} else if (subType === 'custom' && config.rememberChatChannel)
				this.lastCustomChannel = channel;
		},

		onGetMessages: function (e) {
			let messages = e.messages;
			if (!messages.length)
				messages = [messages];

			let container = this.find('.list');

			messages.forEach(m => {
				this.trackHistory(m);

				let message = m.message;

				if (m.source) {
					if (window.player.social.isPlayerBlocked(m.source))
						return;
				}

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
			if (isFake && this.hoverFilter)
				return;

			input.resetKeys();

			this.el.removeClass('typing');

			let textbox = this.find('input');

			if (show) {
				this.el.addClass('typing');

				this.find('.channelPicker').html(this.currentSubChannel || this.currentChannel);
				textbox.focus();
				this.find('.list').scrollTop(9999999);
			} else {
				this.find('.channelOptions').removeClass('active');
				textbox.val('');
				this.el.removeClass('picking');

				if (['direct', 'custom'].includes(this.currentChannel) && (!this.currentSubChannel || ['join new', 'leave'].includes(this.currentSubChannel))) {
					this.currentSubChannel = null;
					this.currentChannel = 'global';
				}
			}

			if (e)
				e.stopPropagation();
		},

		processChat: function (msgConfig) {
			const { message, event: keyboardEvent } = msgConfig;
			const { key } = keyboardEvent;

			if (message.length) {
				if (this.el.hasClass('picking')) 
					msgConfig.cancel = true;
				
				return;
			}
			
			if (key === 'Enter') {
				const selectedSubPick = this.find('.channelOptions .option.selected');
				if (selectedSubPick.length) {
					this.onPickSubChannel(selectedSubPick.html(), this.currentChannel);
					return;
				}
			}

			//If we're busy picking a sub channel, we can use keyboard nav
			const isPicking = this.el.hasClass('picking');
			const optionContainer = this.find('.channelOptions');
			const currentSelection = optionContainer.find('.option.selected');
			if (isPicking && currentSelection.length) {
				const delta = {
					ArrowUp: -1,
					ArrowDown: 1
				}[key];

				if (delta) {
					const options = optionContainer.find('.option');
					const currentIndex = currentSelection.eq(0).index();
					let nextIndex = (currentIndex + delta) % options.length;
					currentSelection.removeClass('selected');
					options.eq(nextIndex).addClass('selected');
				}
			}

			const pick = {
				'%': 'party',
				'!': 'global',
				$: 'custom',
				'@': 'direct'
			}[key];

			if (!pick) {
				if (this.el.hasClass('picking'))
					msgConfig.cancel = true;

				return;
			}

			if (this.currentChannel === pick) {
				if (pick === 'direct')
					this.lastPrivateChannel = null;
				else if (pick === 'custom')
					this.lastCustomChannel = null;
			}

			this.onPickChannel(pick, true);
			msgConfig.cancel = true;
		},

		sendChat: function (e) {
			let textbox = this.find('input');
			let msgConfig = {
				success: true,
				message: textbox.val(),
				event: e,
				cancel: false
			};

			if (this.el.hasClass('picking')) {
				this.processChat(msgConfig);
				return false;
			}

			if (e.which === 27) {
				this.toggle(false);
				return;
			} else if (e.which === 9) {
				e.preventDefault();
				let textfield = this.find('input');
				textfield.val(`${textfield.val()}    `);
				return;
			} else if (e.which !== 13) {
				this.processChat(msgConfig);

				const result = msgConfig.cancel === true ? false : null;

				return result;
			}

			if (!this.el.hasClass('typing')) {
				this.toggle(true);
				return;
			}

			events.emit('onBeforeChat', msgConfig);

			let val = msgConfig.message
				.split('<')
				.join('&lt;')
				.split('>')
				.join('&gt;');
		
			if (!msgConfig.success)
				return;

			if (val.trim() === '')
				return;

			client.request({
				cpn: 'social',
				method: 'chat',
				data: {
					message: val,
					type: this.currentChannel,
					subType: this.currentSubChannel
				}
			});

			this.toggle();
		},

		onToggleLastChannel: function (isOn) {
			if (isOn)
				return;

			this.lastPrivateChannel = null;
			this.lastCustomChannel = null;
			this.currentChannel = null;
			this.currentSubChannel = null;
		},

		onPickChannel: function (channel, autoPickSub) {
			this.currentChannel = channel;
			this.currentSubChannel = null;

			const showSubChannels = (
				['direct', 'custom'].includes(channel) &&
				(
					!autoPickSub ||
					(
						channel === 'direct' &&
						!this.lastPrivateChannel
					) ||
					(
						channel === 'custom' &&
						!this.lastCustomChannel
					)
				)
			);

			if (!showSubChannels) {
				this.find('.channelOptions').removeClass('active');

				let showValue = {
					direct: this.lastPrivateChannel,
					custom: this.lastCustomChannel
				}[channel];

				if (channel === 'direct' || channel === 'custom')
					this.currentSubChannel = showValue;

				showValue = showValue || channel;

				this.find('.channelPicker').html(showValue);

				this.find('input').focus();

				this.el.removeClass('picking');
			} else
				this.onShowChannelOptions(channel);
		},

		onPickSubChannel: function (subChannel, channel) {
			this.currentSubChannel = subChannel;
			this.find('.channelOptions').removeClass('active');
			this.find('.channelPicker').html(subChannel);

			const elInput = this.find('input');

			elInput.focus();

			if (channel === 'custom') {
				if (subChannel === 'join new') {
					elInput.val('/join channelName');
					elInput[0].setSelectionRange(6, 17);
				} else if (subChannel === 'leave') {
					elInput.val('/leave channelName');
					elInput[0].setSelectionRange(7, 18);
				}
			}

			this.el.removeClass('picking');
		},

		onShowChannelOptions: function (currentPick) {
			const optionContainer = this.find('.channelOptions')
				.addClass('active')
				.empty();

			const options = [];
			let handlerOnClick = this.onPickChannel;

			this.el.addClass('picking');

			if (!currentPick) {
				options.push('global', 'custom');

				if (this.privateChannels.length)
					options.push('direct');

				//Hack...surely we can find a more sane way to do this
				if ($('.uiParty .member').length)
					options.push('party');
			} else {
				handlerOnClick = this.onPickSubChannel;
				
				if (currentPick === 'direct')
					options.push(...this.privateChannels);
				else if (currentPick === 'custom')
					options.push(...this.customChannels, 'join new', 'leave');
			}

			if (!options.length) {
				this.onPickChannel('global');
				return;
			}
			
			let addSelectStyleTo = null;
			if (currentPick)
				addSelectStyleTo = this.currentSubChannel || options[0];
			options.forEach(o => {
				const html = `<div class='option'>${o}</div>`;

				const el = $(html)
					.appendTo(optionContainer)
					.on('click', handlerOnClick.bind(this, o, currentPick))
					.on('hover', this.stopKeyboardNavForOptions.bind(this));

				if (o === addSelectStyleTo)
					el.addClass('selected');
			});
		},

		stopKeyboardNavForOptions: function () {
			this.find('.channelOptions .option.selected').removeClass('selected');
		}
	};
});
