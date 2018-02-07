define([

], function (

) {
	var empty = [];
	var regular = ['1.0', '1.2', '1.6'];

	var mtx = [
		['10.0', '10.1', '10.2', '10.3', '10.4'],
		['11.0', '11.1', '11.2', '11.3', '11.4']
	];
	var pA = [];
	var pB = [];
	var pC = [];
	var pD = [];

	mtx.forEach(function (m) {
		m.forEach(function (s, i) {
			var has = [pD];
			if (i <= 2)
				has.push(pC);
			if (i <= 1)
				has.push(pB);
			if (i == 0)
				has.push(pA);

			has.forEach(function (h) {
				h.push(s);
			});
		});
	});

	return [
		//Regular Player
		empty.concat(...regular), [],
		[],
		[],
		[],
		//Moderator
		empty.concat(...regular),
		//Patron Level 1
		empty.concat(...regular, ...pA),
		//Patron Level 2
		empty.concat(...regular, ...pB),
		//Patron Level 3
		empty.concat(...regular, ...pC),
		//Patron Level 4
		empty.concat(...regular, ...pD),
		//Admin
		['*']
	];
});
