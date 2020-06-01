const roles = require('../../config/roles');
const events = require('../../misc/events');
const profanities = require('../../misc/profanities');
const canChat = require('./canChat');

const sendRegularMessage = ({ obj }, msg) => {
	let charname = obj.auth.charname;

	let prefix = roles.getRoleMessagePrefix(obj) || '';
	let msgStyle = roles.getRoleMessageStyle(obj) || 'color-grayB';

	cons.emit('event', {
		event: 'onGetMessages',
		data: {
			messages: [{
				class: msgStyle,
				message: prefix + charname + ': ' + msg.data.message,
				item: msg.data.item,
				type: 'chat',
				source: obj.name
			}]
		}
	});
};

const sendPartyMessage = ({ party, obj }, msg) => {
	if (!party) {
		obj.socket.emit('events', {
			onGetMessages: [{
				messages: [{
					class: 'color-redA',
					message: 'you are not in a party',
					type: 'info'
				}]
			}]
		});

		return;
	}

	let charname = obj.auth.charname;
	let message = msg.data.message.substr(1);

	party.forEach(p => {
		let player = cons.players.find(c => c.id === p);

		player.socket.emit('events', {
			onGetMessages: [{
				messages: [{
					class: 'color-tealC',
					message: '(party: ' + charname + '): ' + message,
					type: 'chat',
					source: obj.name
				}]
			}]
		});
	});
};

const sendCustomChannelMessage = (cpnSocial, msg) => {
	const { obj } = cpnSocial;

	let pList = cons.players;
	let pLen = pList.length;
	let origMessage = msg.data.message.substr(1);

	let channel = origMessage.split(' ')[0];
	let message = origMessage.substr(channel.length);

	if ((!channel) || (!message)) {
		obj.socket.emit('events', {
			onGetMessages: [{
				messages: [{
					class: 'color-redA',
					message: 'syntax: $channel message',
					type: 'info'
				}]
			}]
		});
		return;
	} else if (!cpnSocial.isInChannel(obj, channel)) {
		obj.socket.emit('events', {
			onGetMessages: [{
				messages: [{
					class: 'color-redA',
					message: 'you are not currently in channel: ' + channel,
					type: 'info'
				}]
			}]
		});
		return;
	} else if (pLen > 0) {
		for (let i = 0; i < pLen; i++) {
			if (cpnSocial.isInChannel(pList[i], channel)) {
				pList[i].socket.emit('events', {
					onGetMessages: [{
						messages: [{
							class: 'color-grayB',
							message: '[' + channel + '] ' + obj.auth.charname + ': ' + message,
							type: channel.trim(),
							source: obj.name
						}]
					}]
				});
			}
		}
	}
};

const sendPrivateMessage = ({ obj: { name: sourcePlayerName, socket } }, msg) => {
	let message = msg.data.message.substr(1);

	let playerName = '';
	//Check if there's a space in the name
	if (message[0] === "'")
		playerName = message.substring(1, message.indexOf("'", 1));
	else
		playerName = message.substring(0, message.indexOf(' '));

	message = message.substr(playerName.length);

	if (playerName === sourcePlayerName)
		return;

	let target = cons.players.find(p => p.name === playerName);
	if (!target)
		return;

	socket.emit('event', {
		event: 'onGetMessages',
		data: {
			messages: [{
				class: 'color-yellowB',
				message: '(you to ' + playerName + '): ' + message,
				type: 'chat',
				subType: 'privateOut',
				source: sourcePlayerName
			}]
		}
	});

	target.socket.emit('event', {
		event: 'onGetMessages',
		data: {
			messages: [{
				class: 'color-yellowB',
				message: '(' + sourcePlayerName + ' to you): ' + message,
				type: 'chat',
				subType: 'privateIn',
				source: sourcePlayerName
			}]
		}
	});
};

const sendErrorMsg = (cpnSocial, msgString) => {
	cpnSocial.sendMessage(msgString, 'color-redA');
};

module.exports = (cpnSocial, msg) => {
	const { data: msgData } = msg;

	if (!msgData.message)
		return;

	const { obj, muted, maxChatLength, messageHistory } = cpnSocial;
	const sendError = sendErrorMsg.bind(null, cpnSocial);

	msgData.message = msgData.message
		.split('<')
		.join('&lt;')
		.split('>')
		.join('&gt;');

	if (!msgData.message)
		return;

	if (msgData.message.trim() === '')
		return;

	if (muted) {
		sendError('You have been muted from talking');

		return;
	}

	let messageString = msgData.message;
	if (messageString.length > maxChatLength)
		return;

	let time = +new Date();
	messageHistory.spliceWhere(h => ((time - h.time) > 5000));

	if (messageHistory.length) {
		if (messageHistory[messageHistory.length - 1].msg === messageString) {
			sendError('You have already sent that message');

			return;
		} else if (messageHistory.length >= 3) {
			sendError('You are sending too many messages');

			return;
		}
	}

	cpnSocial.onBeforeChat(msgData);
	if (msgData.ignore)
		return;

	if (!msgData.item && !profanities.isClean(messageString)) {
		sendError('Profanities detected in message. Blocked.');

		return;
	}

	if (!canChat(obj, time)) {
		sendError('Your character needs to be played for at least 3 minutes or be at least level 3 to be able to send messages in chat.');

		return;
	}

	messageHistory.push({
		msg: messageString,
		time: time
	});

	let msgEvent = {
		source: obj.auth.charname,
		msg: messageString
	};
	events.emit('onBeforeSendMessage', msgEvent);

	const firstChar = messageString[0];

	const messageHandler = {
		$: sendCustomChannelMessage,
		'@': sendPrivateMessage,
		'%': sendPartyMessage
	}[firstChar] || sendRegularMessage;

	messageHandler(cpnSocial, msg);
};
