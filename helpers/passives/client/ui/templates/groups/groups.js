define([
	'html!./template',
	'css!./styles',
	'js/generator',
	'js/client',
	'js/renderer',
	'js/input'
], function (
	template,
	styles,
	generator,
	client,
	renderer,
	input
) {
	return {
		tpl: template,

		postRender: function () {
			this.onEvent('onTreeLoaded', this.events.onTreeLoaded.bind(this));

			this.on('.btnAdd', 'click', this.actions.add.bind(this));
			this.on('.btnRename', 'click', this.events.onClickRename.bind(this));
			this.on('.btnRemove', 'click', this.events.onClickRemove.bind(this));
		},

		addGroup: function (groupName) {
			$('<div class="item">' + groupName + '</div>')
				.appendTo(this.find('.list'))
				.attr('group', groupName)
				.on('click', this.events.onClickGroup.bind(this, groupName));
		},

		actions: {
			add: function () {
				var selected = generator.nodes.filter(n => n.selected);
				var groupName = 'group-' + this.find('.list .item').length;

				selected.forEach(function (s) {
					if (!s.group)
						s.group = [];

					s.group.push(groupName)
				});

				this.addGroup(groupName);
			},

			rename: function (group) {

			},

			remove: function (group) {
				generator.nodes.forEach(function (g) {
					if ((g.group) && (g.group.indexOf(group) > -1))
						g.group.spliceWhere(g => (g == group));
				});

				this.find('.item[group="' + group + '"]').remove();
			}
		},

		events: {
			onClickRename: function (e) {
				this.find('.activeMode').removeClass('activeMode');
				this.find('.btnRename').addClass('activeMode');
			},

			onClickRemove: function (e) {
				this.find('.activeMode').removeClass('activeMode');
				this.find('.btnRemove').addClass('activeMode');
			},

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
						n.group.forEach(function (g) {
							if (groups.indexOf(g) > -1)
								return;

							this.addGroup(g);
							groups.push(g);
						}, this);
					}, this);
			},

			onClickGroup: function (group) {
				var mode = this.find('.activeMode').eq(0);
				if (mode) {
					if (mode.hasClass('btnRemove'))
						this.actions.remove.call(this, group);
					else if (mode.hasClass('btnRename'))
						this.actions.rename.call(this, group);

					this.find('.activeMode').removeClass('activeMode');
				}

				var pos = {
					x: 0,
					y: 0
				};

				var nodes = generator.nodes
					.filter(function (n) {
						if ((!n.group) || (n.group.indexOf(group) == -1))
							return false;

						pos.x += n.pos.x;
						pos.y += n.pos.y;

						return true;
					});

				pos.x /= nodes.length;
				pos.y /= nodes.length;

				generator.callAction('selectNode', nodes);

				if (input.isKeyDown('shift')) {
					renderer.center({
						pos: pos
					});
				}
				renderer.makeDirty();
			}
		}
	}
});
