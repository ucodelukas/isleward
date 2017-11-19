 define([
 	'misc/events'
 ], function (
 	events
 ) {
 	var list = {

 	};

 	return {
 		init: function () {
 			events.emit('onBeforeGetMtxList', list);
 		},

 		get: function (name) {
 			return list[name];
 		}
 	};
 });
