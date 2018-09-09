module.exports = {
	type: 'mounted',

	oldCell: null,
	oldSheetName: null,

	init: function () {
		let obj = this.obj;

		this.oldCell = obj.cell;
		this.oldSheetName = obj.sheetName;

		obj.cell = 35;
		obj.sheetName = 'mobs';

		let syncer = obj.syncer;
		syncer.set(false, null, 'cell', obj.cell);
		syncer.set(false, null, 'sheetName', obj.sheetName);
	},

	simplify: function () {
		return {
			type: 'mounted',
			ttl: this.ttl
		};
	},

	destroy: function () {
		let obj = this.obj;

		obj.cell = this.oldCell;
		obj.sheetName = this.oldSheetName;

		let syncer = obj.syncer;
		syncer.set(false, null, 'cell', obj.cell);
		syncer.set(false, null, 'sheetName', obj.sheetName);
	},

	events: {
		onBeforeTryMove: function (moveEvent) {
			moveEvent.sprintChance = 200;
		}
	}
};
