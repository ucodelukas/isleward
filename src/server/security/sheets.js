define([
	'google-spreadsheet',
	'./creds'
], function (
	googleSheets,
	creds
) {
	return {
		doc: null,
		sheet: null,

		records: null,

		init: function () {
			this.doc = new googleSheets('1PhNFF8IbNX7uecFeWkFsoTZgDfLF-zWVibOTuutNy8c');
			this.doc.useServiceAccountAuth(creds, this.onAuth.bind(this));
		},

		onAuth: function () {
			this.doc.getInfo(this.onGetInfo.bind(this));
		},

		onGetInfo: function () {
			this.sheet = this.doc.worksheets[0];

			this.update();
		},

		getRecord: function (name) {
			return (this.records || []).find(r => (r.username == name));
		},

		onGetRows: function (err, rows) {
			this.records = rows.map(function (r) {
				var o = {};
				Object.keys(r).forEach(function (p) {
					if (['id', 'app:edited', '_links', '_xml', 'save', 'del'].indexOf(p) > -1)
						return;

					o[p] = r[p];
				});

				o.items = JSON.parse(o.items || "{}");
				o.skins = JSON.parse(o.skins || "[]");

				return o;
			});

			setTimeout(this.update.bind(this), 10000)
		},

		update: function () {
			this.sheet.getRows({}, this.onGetRows.bind(this));
		}
	};
});
