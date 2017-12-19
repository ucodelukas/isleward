define([
	'misc/events'
], function (
	events
) {
	return {
		cbList: {},

		init: function () {
			for (var eventName in this.events) {
				var eventCb = this.events[eventName];

				this.cbList[eventName] = eventCb.bind(this);
				events.on(eventName, this.cbList[eventName]);
			}
		},

		destroy: function () {
			for (var e in this.cbList) {
				events.off(e, this.cbList[e]);
			}
		}
	};
});
