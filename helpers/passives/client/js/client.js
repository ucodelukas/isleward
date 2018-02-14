define([
	'socket'
], function (
	io
) {
	return {
		socket: null,

		init: function (onReady) {
			var tType = 'websocket';
			this.socket = io({
				transports: [tType]
			});

			this.socket.on('connect', this.onConnected.bind(this, onReady));
		},

		load: function (callback) {
			this.socket.emit('request', {
				action: 'load'
			}, callback);
		},

		save: function (data, callback) {
			this.socket.emit('request', {
				action: 'save',
				data: data
			}, callback);
		},

		onConnected: function (onReady) {
			onReady();
		}
	};
});
