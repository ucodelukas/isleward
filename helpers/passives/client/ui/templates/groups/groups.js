define([
	'html!./template',
	'css!./styles',
	'js/generator',
	'js/client',
	'js/renderer'
], function (
	template,
	styles,
	generator,
	client,
	renderer
) {
	return {
		tpl: template,

		postRender: function () {
			this.onEvent('onTreeLoaded', this.events.onTreeLoaded.bind(this));

			this.on('.btnAdd', 'click', this.actions.add.bind(this));
			this.on('.btnRename', 'click', this.actions.rename.bind(this));
			this.on('.btnRemove', 'click', this.actions.remove.bind(this));
		},

		addGroup: function (groupName) {
			$('<div class="item">' + groupName + '</div>')
				.appendTo(this.find('.list'))
				.on('click', this.events.onClickGroup.bind(this, groupName));
		},

		actions: {
			add: function () {
				var selected = generator.nodes.filter(n => n.selected);
				var groupName = 'group-' + this.find('.list .item').length;

				selected.forEach(s => (s.group = groupName));

				this.addGroup(groupName);
			},

			rename: function () {

			},

			remove: function () {

			}
		},

		events: {
			onTreeLoaded: function (tree) {
				var container = this.find('.list').empty();
				var groups = [];

				tree.nodes
					.filter(n => !!n.group)
					.sort(function (a, b) {
						if (a.group < b.group)
							return -1;
						else if (b.group < a.group)
							return 1;
					})
					.forEach(function (n) {
						if (groups.indexOf(n.group) > -1)
							return;

						this.addGroup(n.group);
						groups.push(n.group);
					}, this);
			},

			onClickGroup: function (group) {
				var nodes = generator.nodes
					.filter(n => (n.group == group));

				generator.callAction('selectNode', nodes);
				renderer.makeDirty();
			}
		}
	}
});
