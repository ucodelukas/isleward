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
			if (sheetsConfig.roles) {
				this.update = function () {};
				this.onGetRows(null, sheetsConfig.roles);
				return;
			}

			this.doc = new googleSheets(sheetsConfig.sheetId);
			this.doc.useServiceAccountAuth(creds, this.onAuth.bind(this));
		},

		onAuth: function () {
			this.doc.getInfo(this.onGetInfo.bind(this));
		},

		onGetInfo: function () {
			if (!this.doc.worksheets) {
				setTimeout(this.onAuth.bind(this), 300000);
				return;
			}

			this.sheet = this.doc.worksheets[0];

			this.update();
		},

		getRecord: function (name) {
			return (this.records || []).find(r => (r.username == name));
		},

		onGetRows: function (err, rows) {
			if (rows) {
				try {
					var records = (rows || []).map(function (r) {
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

						if (typeof (o.items) == 'string')
							o.items = JSON.parse(o.items || "[]");
						if (typeof (o.skins) == 'string')
							o.skins = JSON.parse(o.skins || "[]");

						return o;
					});

					this.records = records;
				} catch (e) {
					console.log('Sheets in error state');
				}
			}

			setTimeout(this.update.bind(this), 300000)
		},

		update: function () {
			this.sheet.getRows({}, this.onGetRows.bind(this));
		}
	};
});
