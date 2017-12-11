define([
	'bcrypt-nodejs',
	'security/io',
	'misc/messages',
	'security/connections',
	'leaderboard/leaderboard',
	'config/skins',
	'config/roles',
	'misc/profanities'
], function (
	bcrypt,
	io,
	messages,
	connections,
	leaderboard,
	skins,
	roles,
	profanities
) {
	return {
		type: 'auth',

		username: null,
		charname: null,
		characters: {},
		characterList: [],
		stash: null,

		customChannels: [],

		play: function (data) {
			if (this.username == null)
				return;

			var character = this.characters[data.data.name];
			if (!character)
				return;

			if (character.permadead)
				return;

			character.stash = this.stash;
			character.account = this.username;

			this.charname = character.name;

			this.obj.player.sessionStart = +new Date;
			this.obj.player.spawn(character, data.callback);

			var prophecies = this.obj.prophecies ? this.obj.prophecies.simplify().list : [];
			leaderboard.setLevel(character.name, this.obj.stats.values.level, prophecies);
		},

		doSave: function (extensionObj) {
			var simple = this.obj.getSimple(true, true);
			simple.components.spliceWhere(c => c.type == 'stash');

			var stats = simple.components.find(c => c.type == 'stats');
			stats.values = extend(true, {}, stats.values);

			var social = simple.components.find(c => c.type == 'social');
			delete social.party;
			delete social.customChannelsl

			var statKeys = Object.keys(stats.values);
			var sLen = statKeys.length;
			for (var i = 0; i < sLen; i++) {
				var s = statKeys[i];
				if (
					(
						(s.indexOf('xp') > -1) &&
						(s != 'xpIncrease')
					) ||
					(s == 'level') ||
					(s == 'hp') ||
					(s == 'mana')
				)
					continue;

				delete stats.values[s];
			}

			//Calculate and store the ttl for effects
			var time = +new Date;
			simple.components.find(e => e.type == 'effects').effects.forEach(function (e) {
				if (e.expire)
					return;

				e.expire = time + (e.ttl * 350);
			});

			var callback = null;
			if (extensionObj) {
				callback = extensionObj.callback;
				delete extensionObj.callback;
			}

			extend(true, simple, extensionObj);

			io.set({
				ent: this.charname,
				field: 'character',
				value: JSON.stringify(simple).split(`'`).join('`'),
				callback: callback
			});

			//Save stash
			io.set({
				ent: this.username,
				field: 'stash',
				value: JSON.stringify(this.obj.stash.items)
			});
		},

		simplify: function () {
			return {
				type: 'auth',
				username: this.username,
				charname: this.charname,
				skins: this.skins
			};
		},

		getCharacterList: function (data) {
			if (this.username == null)
				return;

			io.get({
				ent: this.username,
				field: 'characterList',
				callback: this.onGetCharacterList.bind(this, data)
			});
		},
		onGetCharacterList: function (data, result) {
			var characters = JSON.parse(result || '[]');
			this.characterList = characters;

			var result = characters
				.map(c => ({
					name: c.name ? c.name : c,
					level: leaderboard.getLevel(c.name ? c.name : c)
				}));

			data.callback(result);
		},

		getCharacter: function (data) {
			io.get({
				ent: data.data.name,
				field: 'character',
				callback: this.onGetCharacter.bind(this, data)
			});
		},
		onGetCharacter: function (data, result) {
			if (result) {
				result = result.split('`').join(`'`);
				result = result.replace(/''+/g, '\'');
			}

			var character = JSON.parse(result || '{}');
			//Hack for old characters
			if (!character.skinId) {
				character.skinId = character.class + ' 1';
			}
			character.cell = skins.getCell(character.skinId);
			character.sheetName = skins.getSpritesheet(character.skinId);

			this.characters[data.data.name] = character;

			this.getCustomChannels(data, character);
		},

		getCustomChannels: function (data, character) {
			io.get({
				ent: character.name,
				field: 'customChannels',
				callback: this.onGetCustomChannels.bind(this, data, character)
			});
		},

		onGetCustomChannels: function (data, character, result) {
			this.customChannels = JSON
				.parse(result || '[]')
				.filter(c => (typeof (c) == 'string'))
				.map(c => c.split(' ').join(''))
				.filter(c => (c.length > 0));

			this.customChannels = this.customChannels
				.filter((c, i) => (this.customChannels.indexOf(c) == i));

			var social = character.components.find(c => (c.type == 'social'));
			if (social)
				social.customChannels = this.customChannels;

			this.getStash(data, character);
		},

		getStash: function (data, character) {
			io.get({
				ent: this.username,
				field: 'stash',
				callback: this.onGetStash.bind(this, data, character)
			});
		},

		onGetStash: function (data, character, result) {
			this.stash = JSON.parse(result || '[]');

			if (this.skins != null)
				data.callback(character);
			else {
				data.callback = data.callback.bind(null, character);
				this.getSkins(data);
			}
		},

		getSkins: function (msg) {
			io.get({
				ent: this.username,
				field: 'skins',
				callback: this.onGetSkins.bind(this, msg)
			});
		},

		onGetSkins: function (msg, result) {
			this.skins = JSON.parse(result || '[]');
			var list = [...this.skins, ...roles.getSkins(this.username)];
			var skinList = skins.getSkinList(list);

			msg.callback(skinList);
		},

		saveSkin: function (skinId) {
			if (!this.skins) {
				this.getSkins({
					callback: this.saveSkin.bind(this, skinId)
				});

				return;
			}

			this.skins.push(skinId);

			io.set({
				ent: this.username,
				field: 'skins',
				value: JSON.stringify(this.skins),
				callback: this.onSaveSkin.bind(this)
			});
		},

		onSaveSkin: function () {

		},

		doesOwnSkin: function (skinId) {
			return this.skins.some(s => s == skinId);
		},

		login: function (msg) {
			var credentials = msg.data;

			if ((credentials.username == '') | (credentials.password == '')) {
				msg.callback(messages.login.allFields);
				return;
			}

			this.username = credentials.username;

			io.get({
				ent: credentials.username,
				field: 'login',
				callback: this.onHashCompare.bind(this, msg)
			});
		},
		onHashCompare: function (msg, storedPassword) {
			var credentials = msg.data;

			bcrypt.compare(credentials.password, storedPassword, this.onLogin.bind(this, msg, storedPassword));
		},
		onLogin: function (msg, storedPassword, err, compareResult) {
			if (!storedPassword)
				msg.callback(messages.login.incorrect);
			else {
				if (compareResult) { //If stored password matches the hashed password entered by the user, log them in directly
					this.onLoginVerified(msg);
				} else if (msg.data.password == storedPassword) { //If the stored password matches a plaintext password entered by the user; In that case the password gets hashed for the future
					this.onUnhashedLogin(msg);
				} else
					msg.callback(messages.login.incorrect);
			}
		},
		onUnhashedLogin: function (msg) {
			bcrypt.hash(msg.data.password, null, null, this.onPasswordHashed.bind(this, msg));
		},
		onPasswordHashed: function (msg, err, hashedPassword) {
			io.set({
				ent: msg.data.username,
				field: 'login',
				value: hashedPassword,
				callback: this.onLoginVerified.bind(this, msg)
			});
		},
		onLoginVerified: function (msg) {
			this.username = msg.data.username;
			connections.logOut(this.obj);
			msg.callback();
		},

		register: function (msg) {
			var credentials = msg.data;

			if ((credentials.username == '') || (credentials.password == '')) {
				msg.callback(messages.login.allFields);
				return;
			}

			var illegal = ["'", '"', '/', '(', ')', '[', ']', '{', '}', ':', ';', '<', '>'];
			for (var i = 0; i < illegal.length; i++) {
				if ((credentials.username.indexOf(illegal[i]) > -1) || (credentials.password.indexOf(illegal[i]) > -1)) {
					msg.callback(messages.login.illegal);
					return;
				}
			}

			if (!profanities.isClean(credentials.username)) {
				msg.callback(messages.login.invalid);
				return;
			}

			io.get({
				ent: credentials.username,
				field: 'login',
				callback: this.onCheckExists.bind(this, msg)
			});
		},
		onCheckExists: function (msg, result) {
			if (result) {
				msg.callback(messages.login.exists);
				return;
			}

			var credentials = msg.data;

			bcrypt.hash(credentials.password, null, null, this.onHashGenerated.bind(this, msg));
		},
		onHashGenerated: function (msg, err, hashedPassword) {
			io.set({
				ent: msg.data.username,
				field: 'login',
				value: hashedPassword,
				callback: this.onRegister.bind(this, msg)
			});
		},
		onRegister: function (msg, result) {
			io.set({
				ent: msg.data.username,
				field: 'characterList',
				value: '[]',
				callback: this.onCreateCharacterList.bind(this, msg)
			});
		},
		onCreateCharacterList: function (msg, result) {
			this.username = msg.data.username;
			connections.logOut(this.obj);
			msg.callback();
		},

		createCharacter: function (msg) {
			var data = msg.data;

			if ((data.name.length < 3) || (data.name.length > 12)) {
				msg.callback(messages.createCharacter.nameLength);
				return;
			}

			if (!profanities.isClean(data.name)) {
				msg.callback(messages.login.invalid);
				return;
			} else {
				var name = data.name;

				if (name.indexOf('  ') > -1) {
					msg.callback(messages.login.invalid);
					return;
				}

				var nLen = name.length;
				for (var i = 0; i < nLen; i++) {
					var char = name[i].toLowerCase();
					var valid = [
						'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
					];

					if (valid.indexOf(char) == -1) {
						msg.callback(messages.login.invalid);
						return;
					}
				}
			}

			io.get({
				ent: data.name,
				field: 'character',
				callback: this.onCheckCharacterExists.bind(this, msg)
			});
		},
		onCheckCharacterExists: function (msg, result) {
			if (result) {
				msg.callback(messages.login.charExists);
				return;
			}

			var data = msg.data;

			this.obj.name = data.name;
			this.obj.skinId = data.skinId;
			this.obj.class = data.class;

			this.obj.cell = skins.getCell(this.obj.skinId);
			this.obj.sheetName = skins.getSpritesheet(this.obj.skinId);

			var simple = this.obj.getSimple(true);
			simple.components.push({
				type: 'prophecies',
				list: data.prophecies || []
			});

			io.set({
				ent: data.name,
				field: 'character',
				value: JSON.stringify(simple),
				callback: this.onCreateCharacter.bind(this, msg)
			});
		},
		onCreateCharacter: function (msg, result) {
			var name = msg.data.name;

			var simple = this.obj.getSimple(true);
			simple.components.push({
				type: 'prophecies',
				list: msg.data.prophecies || []
			});
			simple.components.push({
				type: 'social',
				customChannels: this.customChannels
			});

			this.characters[name] = simple;
			this.characterList.push(name);
			io.set({
				ent: this.username,
				field: 'characterList',
				value: JSON.stringify(this.characterList),
				callback: this.onAppendList.bind(this, msg)
			});
		},

		deleteCharacter: function (msg) {
			var data = msg.data;

			if ((!data.name) || (!this.username))
				return;

			if (!this.characterList.some(c => ((c.name == data.name) || (c == data.name)))) {
				msg.callback([]);
				return;
			}

			io.delete({
				ent: data.name,
				field: 'character',
				callback: this.onDeleteCharacter.bind(this, msg)
			});
		},
		onDeleteCharacter: function (msg, result) {
			this.characterList.spliceWhere(c => ((c.name == msg.data.name) || (c == msg.data.name)));
			var characterList = this.characterList
				.map(c => ({
					name: c.name ? c.name : c,
					level: leaderboard.getLevel(c.name ? c.name : c)
				}));

			io.set({
				ent: this.username,
				field: 'characterList',
				value: JSON.stringify(characterList),
				callback: this.onRemoveFromList.bind(this, msg)
			});

			leaderboard.deleteCharacter(msg.data.name);
		},
		onRemoveFromList: function (msg, result) {
			msg.callback(this.characterList);
		},

		onAppendList: function (msg, result) {
			this.play({
				data: {
					name: msg.data.name
				},
				callback: msg.callback
			});
		},

		permadie: function () {
			this.obj.permadead = true;

			this.doSave({
				permadead: true,
				callback: this.onPermadie.bind(this)
			});
		},

		onPermadie: function () {
			process.send({
				method: 'object',
				serverId: this.obj.serverId,
				obj: {
					dead: true
				}
			});
		}
	};
});
