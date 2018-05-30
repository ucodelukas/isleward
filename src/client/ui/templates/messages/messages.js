define([
	'js/system/events',
	'html!ui/templates/messages/template',
	'html!ui/templates/messages/tplTab',
	'css!ui/templates/messages/styles',
	'js/input',
	'js/system/client'
], function (
	events,
	template,
	tplTab,
	styles,
	input,
	client
) {
	return {
		tpl: template,

		currentFilter: 'info',

		messages: [],
		maxTtl: 500,

		maxChatLength: 255,

		shiftDown: false,
		hoverItem: null,

		hoverFilter: false,

		postRender: function () {
			this.onEvent('onGetMessages', this.onGetMessages.bind(this));
			this.onEvent('onDoWhisper', this.onDoWhisper.bind(this));
			this.onEvent('onJoinChannel', this.onJoinChannel.bind(this));
			this.onEvent('onLeaveChannel', this.onLeaveChannel.bind(this));
			this.onEvent('onGetCustomChatChannels', this.onGetCustomChatChannels.bind(this));

			this.find('input')
				.on('keydown', this.sendChat.bind(this))
				.on('input', this.checkChatLength.bind(this))
				.on('blur', this.toggle.bind(this, false, true));

			this
				.find('.filter:not(.channel)')
				.on('mouseover', this.onFilterHover.bind(this, true))
				.on('mouseleave', this.onFilterHover.bind(this, false))
				.on('click', this.onClickFilter.bind(this));

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
		},

		checkChatLength: function () {
			var textbox = this.find('input');
			var val = textbox.val();

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

			var container = this.find('.filters');
			var newFilter = $(tplTab)
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
			var el = $(e.currentTarget);
			el.toggleClass('active');

			var filter = el.attr('filter');
			var method = (el.hasClass('active') ? 'show' : 'hide');

			if (method == 'show')
				this.find('.list').addClass(filter);
			else
				this.find('.list').removeClass(filter);

			if (el.hasClass('channel')) {
				this.find('.list .' + filter)[method]();
			}
		},

		onKeyDown: function (key, state) {
			if (key == 'enter')
				this.toggle(true);
		},

		onDoWhisper: function (charName) {
			this.toggle(true);
			var toName = charName;
			if (charName.indexOf(' ') > -1)
				toName = "'" + toName + "'";

			this.find('input').val('@' + toName + ' ');
		},

		onGetMessages: function (e) {
			var messages = e.messages;
			if (!messages.length)
				messages = [messages];

			var container = this.find('.list');

			messages.forEach(function (m) {
				var message = m.message;
				if (m.item) {
					var source = message.split(':')[0] + ': ';
					message = source + '<span class="q' + (m.item.quality || 0) + '">' + message.replace(source, '') + '</span>';
				}

				var el = $('<div class="list-message ' + m.class + '">' + message + '</div>')
					.appendTo(container);

				if (m.type != null)
					el.addClass(m.type);
				else
					el.addClass('info');

				if (m.item) {
					el.find('span')
						.on('mousemove', this.showItemTooltip.bind(this, el, m.item))
						.on('mouseleave', this.hideItemTooltip.bind(this));
				}

				if (m.type) {
					var isChannel = (['info', 'chat', 'loot', 'rep'].indexOf(m.type) == -1);
					if (isChannel) {
						if (this.find('.filter[filter="' + m.type + '"]').hasClass('active'))
							el.show();
					}
				}

				this.messages.push({
					ttl: this.maxTtl,
					el: el
				});
			}, this);

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

			var ttPos = null;
			if (el) {
				ttPos = {
					x: ~~(e.clientX + 32),
					y: ~~(e.clientY)
				};
			}

			events.emit('onShowItemTooltip', item, ttPos, null, true);
		},

		toggle: function (show, isFake) {
			if ((isFake) && (this.hoverFilter))
				return;

			input.resetKeys();

			this.el.removeClass('typing');

			var textbox = this.find('input');

			if (show) {
				this.el.addClass('typing');
				textbox.focus();
				this.find('.list').scrollTop(9999999);
			} else {
				textbox.val('');
			}
		},

		sendChat: function (e) {
			if (e.which == 27)
				this.toggle(false);

			if (e.which != 13)
				return;

			if (!this.el.hasClass('typing')) {
				this.toggle(true);
				return;
			}

			var textbox = this.find('input');
			var val = textbox.val()
				.split('<')
				.join('&lt;')
				.split('>')
				.join('&gt;');

			textbox.blur();

			if (val.trim() == '')
				return;

			client.request({
				cpn: 'social',
				method: 'chat',
				data: {
					message: val
				}
			});
		}
	}
});
