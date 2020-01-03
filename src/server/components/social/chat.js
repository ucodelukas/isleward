let roles = require('../../config/roles');
let events = require('../../misc/events');
const profanities = require('../../misc/profanities');

module.exports = (cpnSocial, msg) => {
	if (!msg.data.message)
		return;

	const { obj } = cpnSocial;
	const sendMessage = cpnSocial.sendMessage.bind(cpnSocial);

	msg.data.message = msg.data.message
		.split('<')
		.join('&lt;')
		.split('>')
		.join('&gt;');

	if (!msg.data.message)
		return;

	if (msg.data.message.trim() === '')
		return;

	if (cpnSocial.muted) {
		sendMessage('You have been muted from talking', 'color-redA');
		return;
	}

	let messageString = msg.data.message;
	if (messageString.length > cpnSocial.maxChatLength)
		return;

	let history = cpnSocial.messageHistory;

	let time = +new Date();
	history.spliceWhere(h => ((time - h.time) > 5000));

	if (history.length > 0) {
		if (history[history.length - 1].msg === messageString) {
			sendMessage('You have already sent that message', 'color-redA');
			return;
		} else if (history.length >= 3) {
			sendMessage('You are sending too many messages', 'color-redA');
			return;
		}
	}

	cpnSocial.onBeforeChat(msg.data);
	if (msg.data.ignore)
		return;

	if (!msg.data.item && !profanities.isClean(messageString)) {
		sendMessage('Profanities detected in message. Blocked.', 'color-redA');
		return;
	}

	let playerLevel = obj.level;
	let playedTime = obj.stats.stats.played * 1000;
	let sessionStart = obj.player.sessionStart;
	let sessionDelta = time - sessionStart;

	if (playerLevel < 3 && playedTime + sessionDelta < 180000) {
		sendMessage('Your character needs to be played for at least 3 minutes or be at least level 3 to be able to send messages in chat.', 'color-redA');
		return;
	}

	history.push({
		msg: messageString,
		time: time
	});

	let charname = obj.auth.charname;

	let msgStyle = roles.getRoleMessageStyle(obj) || ('color-grayB');

	let msgEvent = {
		source: charname,
		msg: messageString
	};
	events.emit('onBeforeSendMessage', msgEvent);
	messageString = msgEvent.msg;
	if (messageString[0] === '@') 
		cpnSocial.sendPrivateMessage(messageString);
	else if (messageString[0] === '$') 
		cpnSocial.sendCustomChannelMessage(msg);
	else if (messageString[0] === '%') 
		cpnSocial.sendPartyMessage(msg);
	else {
		let prefix = roles.getRoleMessagePrefix(obj) || '';

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
	}
};
