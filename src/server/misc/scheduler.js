define([
	
], function(
	
) {
	return {
		cd: 1000,

		lastTime: null,

		init: function() {
			this.lastTime = this.getTime();
		},

		update: function() {
			this.lastTime = this.getTime();
		},

		shouldRun: function(c) {
			var cron = c.cron.split(' ');
			if (cron.length != 5) {
				console.log('Invalid Cron Format: ' + cron.join(' '));
				return false;
			}

			var lastTime = this.lastTime;
			var time = this.getTime();

			var lastRun = c.lastRun;
			if (lastRun) {
				if (Object.keys(lastRun).every(e => (lastRun[e] == time[e])))
					return false;
			}

			var timeOverflows = [60, 24, 32, 12, 7];

			var run = ['minute', 'hour', 'day', 'month', 'weekday'].every(function(t, i) {
				var tCheck = cron[i];

				if (tCheck == '*')
					return true;
				else {
					var overflow = timeOverflows[i];
					var timeT = time[t];
					var lastTimeT = lastTime[t];
					if (timeT < lastTimeT)
						timeT += overflow;
					else if (timeT > lastTimeT)
						lastTimeT++;

					tCheck = tCheck.split(',');

					return Array
						.apply(null, Array(1 + timeT - lastTimeT))
						.map((i, j) => (j + lastTimeT))
						.some(function(s) {
							var useTime = (s >= overflow) ? (s - overflow) : s;

							return tCheck.some(function(f) {
								f = f.split('-');
								if (f.length == 1) {
									f = f[0].split('/');
									if (f.length == 1)
										return (useTime == f[0]);
									else
										return ((useTime % f[1]) == 0);
								}
								else 
									return ((useTime >= f[0]) && (useTime <= f[1]));
							});
						});
				}
			});

			if (run)
				c.lastRun = time;

			return run;
		},

		getTime: function() {
			var time = new Date();

			return {
				minute: time.getMinutes(),
				hour: time.getHours(),
				day: time.getDate(),
				month: time.getMonth(),
				weekday: time.getDay()
			};
		},

		daysInMonth: function(month) {
			var year = (new Date()).getYear();

			return new Date(year, month, 0).getDate();
		}
	};
});