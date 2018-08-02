define([
	
], function (
	
) {
	return {
		list: [],
		particles: [],
		fog: [],

		register: function (cpn) {
			this.list.push(cpn);
		},
		unregister: function (cpn) {
			let list = this.list;
			let lLen = list.length;

			for (let i = 0; i < lLen; i++) {
				let l = list[i];

				if (l === cpn) {
					list.splice(i, 1);
					return;
				}
			}
		},

		render: function () {
			let list = this.list;
			let lLen = list.length;

			for (let i = 0; i < lLen; i++) {
				let l = list[i];

				if ((l.destroyed) || (!l.obj) || (l.obj.destroyed)) {
					if (((l.destroyManual) && (!l.destroyManual())) || (!l.destroyManual)) {
						list.splice(i, 1);
						i--;
						lLen--;

						continue;
					}
				}

				l.renderManual();
			}
		}
	};
});
