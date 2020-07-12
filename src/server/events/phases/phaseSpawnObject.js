const buildMob = (objects, mobConfig) => {
	const { id, sheetName, cell, name, properties, pos: { x, y } } = mobConfig;

	let obj = objects.buildObjects([{
		x,
		y,
		sheetName: sheetName || 'objects',
		cell,
		name,
		properties
	}]);

	obj.id = id;

	return obj;
};

const spawnAnimation = (syncer, { x, y }) => {
	syncer.queue('onGetObject', {
		x: x,
		y: y,
		components: [{
			type: 'attackAnimation',
			row: 0,
			col: 4
		}]
	}, -1);
};

module.exports = {
	spawnRect: null,
	mobs: null,

	init: function () {
		const { instance: { objects, syncer } } = this;

		if (!this.objs.push)
			this.objs = [this.objs];

		this.objs.forEach(l => {
			const obj = buildMob(objects, l);

			this.event.objects.push(obj);
			obj.event = this.event;

			spawnAnimation(syncer, obj);
		});

		if (!this.endMark)
			this.end = true;
	}
};
