define([

], function(

) {
	return {
		resources: {
			'Tiny Pumpkin': {
				type: 'herb',
				max: 3
			},
			Pumpkin: {
				type: 'herb',
				max: 2
			},
			'Giant Pumpkin': {
				type: 'herb',
				max: 1
			}
		},
		mobs: {
			'captain squash': {
				level: 25,
				walkDistance: 0,
				regular: {
					drops: {
						chance: 75,
						rolls: 1
					}
				},
				rare: {
					count: 0
				}
			},
			blabby: {
				walkDistance: 0,

				components: {
					cpnParticles: {
						simplify: function() {
							return {
								type: 'particles',
								blueprint: {
									color: {
										start: ['80f643', '80f643'],
										end: ['4ac441', '4ac441']
									},
									scale: {
										start: {
											min: 2,
											max: 10
										},
										end: {
											min: 0,
											max: 2
										}
									},
									speed: {
										start: {
											min: 4,
											max: 16
										},
										end: {
											min: 2,
											max: 8
										}
									},
									lifetime: {
										min: 1,
										max: 4
									},
									randomScale: true,
									randomSpeed: true,
									chance: 0.35,
									randomColor: true,
									spawnType: 'rect',
									spawnRect: {
										x: -15,
										y: 0,
										w: 30,
										h: 8
									}
								}
							}
						}
					}
				}
			}
		}
	};
});