define([

], function (

) {
	return {
		cbList: {},

		init: function () {
			for (var eventName in this.events) {
				var eventCb = this.events[eventName];

				this.cbList[eventName] = eventCb.bind(this);
				this.instance.eventEmitter.on(eventName, this.cbList[eventName]);
			}
		},

		destroy: function () {
			for (var e in this.cbList) {
				this.instance.eventEmitter.off(e, this.cbList[e]);
			}
		}
	};
});
