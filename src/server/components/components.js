define([
	'misc/fileLister',
	'misc/events',
	'path'
], function(
	fileLister,
	events,
	pathUtilities
) {
	var onReady = null;

	var components = {
		components: {},
		waiting: [],

		init: function(callback) {
			onReady = callback;
			events.emit('onBeforeGetComponents', this.components);
			this.getComponentFolder();
		},

		getComponentFolder: function() {
			var files = fileLister.getFolder('./components/');
			files = files.filter(w => (
				(w.indexOf('components') == -1) &&
				(w.indexOf('cpnBase') == -1) &&
				(w.indexOf('projectile') == -1)
			));
			var fLen = files.length;
			for (var i = 0; i < fLen; i++) {
				this.getComponentFile(`./components/${files[i]}`);
			}
		},

		getComponentFile: function(path) {
			var fileName = pathUtilities.basename(path);
			fileName = fileName.replace('.js', '');
			this.waiting.push(fileName);
			require([ path ], this.onGetComponent.bind(this));
		},

		onGetComponent: function(template) {
			this.waiting.spliceWhere(w => w == template.type);

			this.components[template.type] = template;

			if (this.waiting.length == 0) {
				delete this.waiting;
				onReady();
			}
		}
	};

	return components;
});
