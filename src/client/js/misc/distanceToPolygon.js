define([

], function (

) {
	return {
		distanceBetweenPoints: function (a, b) {
			return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
		},

		distanceToLine: function (p, la, lb) {
			var xD = lb[0] - la[0];
			var yD = lb[1] - la[1];

			var u = (((p[0] - la[0]) * xD) + ((p[1] - la[1]) * yD)) / ((xD * xD) + (yD * yD));

			var closestLine;
			if (u < 0)
				closestLine = [la[0], la[1]];
			else if (u > 1)
				closestLine = [lb[0], lb[1]];
			else
				closestLine = [la[0] + (u * xD), la[1] + (u * yD)];

			return this.distanceBetweenPoints(p, closestLine);
		},

		calculate: function (p, verts) {
			var minDistance = 9999;

			var vLen = verts.length;
			for (var i = 0, j = vLen - 1; i < vLen; j = i++) {
				var vi = verts[i];
				var vj = verts[j];

				var distance = this.distanceToLine(p, vi, vj);
				if (distance < minDistance)
					minDistance = distance;
			}

			return minDistance;
		}
	};
});
