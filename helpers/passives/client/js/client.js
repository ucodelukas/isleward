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

		load: function (fileName, callback) {
			this.socket.emit('request', {
				fileName: fileName,
				action: 'load'
			}, callback);
		},

		save: function (fileName, data, callback) {
			this.socket.emit('request', {
				fileName: fileName,
				action: 'save',
				data: data
			}, callback);
		},

		onConnected: function (onReady) {
			onReady();
		}
	};
});
