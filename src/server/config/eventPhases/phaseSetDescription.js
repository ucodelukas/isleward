module.exports = {
	desc: null,

	init: function (event) {
		event.events.setEventDescription(event.config.name, this.desc);

		this.end = true;
	}
};
