let fileLister = require('../misc/fileLister');
let events = require('../misc/events');
let pathUtilities = require('path');

let onReady = null;

module.exports = {
	components: {},

	init: function (callback) {
		onReady = callback;
		events.emit('onBeforeGetComponents', this.components);
		this.getComponentFolder();
	},

	getComponentFolder: function () {
		let files = fileLister.getFolder('./components/');
		files = files.filter(w => (
			(w.indexOf('components') == -1) &&
			(w.indexOf('cpnBase') == -1) &&
			(w.indexOf('projectile') == -1)
		));
		let fLen = files.length;
		for (let i = 0; i < fLen; i++) 
			this.getComponentFile(`./${files[i]}`);

		onReady();
	},

	getComponentFile: function (path) {
		let fileName = pathUtilities.basename(path);
		fileName = fileName.replace('.js', '');

		let cpn = require(path);
		this.onGetComponent(cpn);
	},

	onGetComponent: function (template) {
		this.components[template.type] = template;
	}
};
