define([
	'google-spreadsheet',
	'./creds',
	'./sheetsConfig'
], function (
	googleSheets,
	creds,
	sheetsConfig
) {
	return {
		doc: null,
		sheet: null,

		records: null,

		init: function () {
			this.doc = new googleSheets(sheetsConfig.sheetId);
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
			if (rows) {
				this.records = (rows || []).map(function (r) {
					var o = {};
					Object.keys(r).forEach(function (p) {
						if (['id', 'app:edited', '_links', '_xml', 'save', 'del'].indexOf(p) > -1)
							return;

						o[p] = r[p];
					});

					o.messageStyle = o.messagestyle;
					delete o.messagestyle;
					o.messagePrefix = o.messageprefix;
					delete o.messageprefix;

					o.items = JSON.parse(o.items || "[]");
					o.skins = JSON.parse(o.skins || "[]");

					return o;
				});

				console.log(this.records);
			}

			setTimeout(this.update.bind(this), 10000)
		},

		update: function () {
			this.sheet.getRows({}, this.onGetRows.bind(this));
		}
	};
});
