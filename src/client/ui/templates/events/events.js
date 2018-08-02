define([
	'js/system/client',
	'js/system/events',
	'html!ui/templates/events/template',
	'html!ui/templates/events/templateEvent',
	'css!ui/templates/events/styles'
], function (
	client,
	events,
	tpl,
	templateEvent,
	styles
) {
	return {
		tpl: tpl,

		list: [],

		container: '.right',

		postRender: function () {
			this.onEvent('onRezone', this.onRezone.bind(this));

			this.onEvent('onObtainEvent', this.onObtainEvent.bind(this));
			this.onEvent('onRemoveEvent', this.onRemoveEvent.bind(this));
			this.onEvent('onUpdateEvent', this.onUpdateEvent.bind(this));
			this.onEvent('onCompleteEvent', this.onCompleteEvent.bind(this));
		},

		onRezone: function () {
			this.list = [];
			this.el.find('.list').empty();
		},

		onRemoveEvent: function (id) {
			let l = this.list.spliceFirstWhere(function (l) {
				return (l.id == id);
			});

			if (l)
				l.el.remove();
		},

		onObtainEvent: function (event) {
			let exists = this.list.find(function (l) {
				return (l.id == event.id);
			});
			if (exists) {
				exists.el.find('.name').html(event.name);
				exists.el.find('.description').html(event.description);
				return;
			}

			let container = this.el.find('.list');

			let html = templateEvent
				.replace('$NAME$', event.name)
				.replace('$DESCRIPTION$', event.description);

			let el = $(html).appendTo(container);

			if (event.isReady)
				el.addClass('ready');

			this.list.push({
				id: event.id,
				el: el,
				event: event
			});

			var event = container.find('.event');

			event
				.sort(function (a, b) {
					a = $(a).hasClass('active') ? 1 : 0;
					b = $(b).hasClass('active') ? 1 : 0;
					return b - a;
				})
				.appendTo(container);
		},

		onUpdateEvent: function (event) {
			let e = this.list.find(function (l) {
				return (l.id == event.id);
			});

			e.event.isReady = event.isReady;

			e.el.find('.description').html(event.description);

			e.el.removeClass('ready');
			if (event.isReady) {
				e.el.removeClass('disabled');
				e.el.addClass('ready');
			}
		},

		onCompleteEvent: function (id) {
			let e = this.list.find(function (l) {
				return (l.id == id);
			});

			if (!e)
				return;

			e.el.remove();
			this.list.spliceWhere(function (l) {
				return (l.id == id);
			});
		}
	};
});
