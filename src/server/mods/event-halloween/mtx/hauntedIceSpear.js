module.exports = {
	events: {
		beforeSpawnProjectile: function (item, spell, projectileConfig) {
			if (spell.name.toLowerCase() != 'ice spear')
				return;

			let cpnProjectile = projectileConfig.components.find(c => (c.type == 'projectile'));
			cpnProjectile.particles = {
				color: {
					start: ['51fc9a', '48edff'],
					end: ['48edff', '51fc9a']
				},
				scale: {
					start: {
						min: 2,
						max: 12
					},
					end: {
						min: 0,
						max: 6
					}
				},
				lifetime: {
					min: 2,
					max: 4
				},
				alpha: {
					start: 0.7,
					end: 0
				},
				speed: {
					start: {
						min: 4,
						max: 24
					},
					end: {
						min: 0,
						max: 12
					}
				},
				startRotation: {
					min: 0,
					max: 360
				},
				rotationSpeed: {
					min: 0,
					max: 360
				},
				randomScale: true,
				randomColor: true,
				randomSpeed: true,
				chance: 0.55,
				spawnType: 'circle',
				spawnCircle: {
					x: 0,
					y: 0,
					r: 8
				}
			};
		}
	}
};
