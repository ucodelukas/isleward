let config = require('./config/serverConfig');
let router = require('./security/router');

module.exports = {
	init: function (callback) {
		let app = require('express')();
		let server = require('http').createServer(app);
		global.io = require('socket.io')(server);

		app.use(function (req, res, next) {
			if ((req.url.indexOf('/server') != 0) && (req.url.indexOf('/mods') != 0))
				req.url = '/client/' + req.url;

			next();
		});

		let lessMiddleware = require('less-middleware');
		app.use(lessMiddleware('../', {
			force: true,
			render: {
				strictMath: true
			}
		}));

		app.get('/', this.requests.root.bind(this));
		app.get(/^(.*)$/, this.requests.default.bind(this));

		io.on('connection', this.listeners.onConnection.bind(this));

		let port = process.env.PORT || config.port || 4000;
		server.listen(port, function () {
			let message = config.startupMessage || 'Server: Ready';
			console.log(message);

			callback();
		});
	},
	listeners: {
		onConnection: function (socket) {
			socket.on('handshake', this.listeners.onHandshake.bind(this, socket));
			socket.on('disconnect', this.listeners.onDisconnect.bind(this, socket));
			socket.on('request', this.listeners.onRequest.bind(this, socket));

			socket.emit('handshake');
		},
		onHandshake: function (socket) {
			cons.onHandshake(socket);
		},
		onDisconnect: function (socket) {
			cons.onDisconnect(socket);
		},
		onRequest: function (socket, msg, callback) {
			msg.callback = callback;

			if (!msg.data)
				msg.data = {};

			if (msg.cpn) {
				if (!router.allowedCpn(msg))
					return;

				cons.route(socket, msg);
			} else {
				if (!router.allowedGlobal(msg))
					return;

				msg.socket = socket;
				global[msg.module][msg.method](msg);
			}
		}
	},
	requests: {
		root: function (req, res) {
			//let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			//if (ip != '::1')
			//	return;

			res.sendFile('index.html');
		},
		default: function (req, res, next) {
			let root = req.url.split('/')[1];
			let file = req.params[0];

			file = file.replace('/' + root + '/', '');

			res.sendFile(file, {
				root: '../' + root
			});
		}
	}
};
