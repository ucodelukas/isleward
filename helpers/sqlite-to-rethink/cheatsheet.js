//Count the amount of permadead characters
r.db('test').table('character').filter({
	value: {
		permadead: true
	}
}).count();

//Count the amount of permadead characters per spirit
r.db('test').table('character')
	.filter({
		value: {
			permadead: true
		}
	})
	.group(row => {
		return row('value')('class');
	})
	.count();

//All players that are level 20
r.db('test').table('character')
	.filter(row => {
		return row('value')('components').contains(cpn => {
			return cpn('type').eq('stats').and(cpn('values')('level').ge(20));
		});
	});

//Group by mod action source,a ggregate and order by count
r.db('test').table('modLog')
	.group(r => r('value')('source')).count().ungroup().orderBy('reduction');
