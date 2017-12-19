 define([
 	'misc/events'
 ], function (
 	events
 ) {
 	var list = {

 	};

 	return {
 		init: function () {
 			events.emit('onBeforeGetItemEffectList', list);
 		},

 		get: function (name) {
 			var res = list[name];

 			if (!res)
 				return 'config/itemEffects/' + name;

 			return res;
 		}
 	};
 });
