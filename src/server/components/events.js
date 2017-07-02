define([

], function(

) {
	return {
		type: 'events',

		list: [],

		simplify: function(self) {
			if (!self)
				return;

			var result = {
				type: 'events'
			};

			if (this.list.length > 0) {
				result.list = this.list.map(l => ({
					id: l.id,
					name: l.config.name,
					description: l.config.description
				}));
			}

			return result;
		},

		save: function() {
			return null;
		},

		unregisterEvent: function(event) {
			this.list.spliceWhere(l => (l == event));

			this.obj.syncer.setArray(true, 'events', 'removeList', {
				id: event.id
			});
		},

		events: {
			afterMove: function() {
				var events = this.obj.instance.events;
				var closeEvents = events.getCloseEvents(this.obj);
				if (!closeEvents)
					return;

				closeEvents.forEach(function(c) {
					this.list.push(c);

					this.obj.syncer.setArray(true, 'events', 'updateList', {
						id: c.id,
						name: c.config.name,
						description: c.config.description
					});
				}, this);
			}
		}
	};
});