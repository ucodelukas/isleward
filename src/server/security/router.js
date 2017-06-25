define([
	
], function(
	
) {
	return {
		allowedCpn: function(msg) {
			var allowed = {
				player: ['performAction', 'queueAction', 'move'],
				auth: ['login', 'register', 'play', 'getCharacterList', 'getCharacter', 'deleteCharacter', 'getSkins', 'createCharacter'],
				social: ['chat', 'getInvite', 'acceptInvite', 'declineInvite', 'removeFromParty', 'leaveParty']
			};

			var valid = ((allowed[msg.cpn]) && (allowed[msg.cpn].indexOf(msg.method) > -1));
			if (!valid)
				return false;

			if (!msg.data.cpn)
				return true;

			var secondaryAllowed = {
				dialogue: ['talk'],
				gatherer: ['gather'],
				quests: ['complete'],
				inventory: ['moveItem', 'enchantItem', 'getEnchantMaterials', 'learnAbility', 'unlearnAbility', 'dropItem', 'destroyItem', 'salvageItem', 'stashItem', ''],
				equipment: ['equip', 'unequip'],
				stash: ['withdraw'],
				trade: ['buySell' ],
				door: ['lock', 'unlock']
			};

			return ((secondaryAllowed[msg.data.cpn]) && (secondaryAllowed[msg.data.cpn].indexOf(msg.data.method) > -1));
		},

		allowedGlobal: function(msg) {
			var allowed = {
				clientConfig: ['getResourcesList'],
				leaderboard: ['requestList'],
				cons: ['unzone']
			};

			return ((allowed[msg.module]) && (allowed[msg.module].indexOf(msg.method) > -1));
		}
	};
});