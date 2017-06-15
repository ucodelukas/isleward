module.exports = {
	name: 'estuary',
	level: 20,
	addLevel: 0,
	resources: {},
	mobs: {
		default: {
			faction: 2,
			grantRep: {
				gaekatla: 3
			},

			regular: {
				dmgMult: 8,

				drops: {
					chance: 45,
					rolls: 1,
					magicFind: 70
				}
			}
		},

		'crystal slug': {
			level: 3,
			spells: [{
				type: 'melee'
			}, {
				type: 'smokeBomb',
				radius: 1,
				duration: 3,
				selfCast: 0.25,
				statMult: 1,
				damage: 0.25,
				element: 'poison',
				cdMax: 5,
				particles: {
					scale: {
						start: {
							min: 4,
							max: 14
						},
						end: {
							min: 2,
							max: 8
						}
					},
					opacity: {
						start: 0.01,
						end: 0
					},
					lifetime: {
						min: 1,
						max: 2
					},
					speed: {
						start: 4,
						end: 0
					},
					color: {
						start: ['fc66f7', 'a24eff'],
						end: ['933159', '393268']
					},
					chance: 0.085,
					randomColor: true,
					randomScale: true,
					blendMode: 'add',
					spawnType: 'rect',
					spawnRect: {
						x: -15,
						y: -15,
						w: 30,
						h: 30
					}
				}
			}]
		},

		'overloaded slug': {
			level: 3,
			spells: [{
				type: 'melee'
			}],

			regular: {
				drops: {
					chance: 20,
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						name: 'Digested Crystal',
						quality: 0,
						quest: true,
						sprite: [1, 1]
					}]
				}
			}
		},

		pockshell: {
			level: 3,

			regular: {
				hpMult: 1000,
				dmgMult: 99.000000001
			},

			mobile: false,
			spells: [{
				type: 'projectile',
				particles: {
					scale: {
						start: {
							min: 6,
							max: 18
						},
						end: {
							min: 2,
							max: 8
						}
					},
					color: {
						start: ['fc66f7', 'a24eff'],
						end: ['393268', '933159']
					},
					chance: 0.65,
					randomScale: true,
					randomColor: true,
				}
			}, {
				type: 'smokeBomb',
				radius: 2,
				repeat: 3,
				duration: 8,
				randomPos: true,
				range: 6,
				statMult: 1,
				damage: 0.25,
				element: 'arcane',
				cdMax: 8,
				particles: {
					scale: {
						start: {
							min: 6,
							max: 18
						},
						end: {
							min: 4,
							max: 10
						}
					},
					opacity: {
						start: 0.01,
						end: 0
					},
					lifetime: {
						min: 1,
						max: 3
					},
					speed: {
						start: 2,
						end: 0
					},
					color: {
						start: ['ff4252', 'd43346'],
						end: ['802343', 'a82841']
					},
					chance: 0.03,
					randomColor: true,
					randomScale: true,
					blendMode: 'add',
					spawnType: 'rect',
					spawnRect: {
						x: -15,
						y: -15,
						w: 30,
						h: 30
					}
				}
			}, {
				type: 'summonConsumableFollower'
			}]
		},

		'cultist': {
			level: 13
		},
		'cultist biorn': {
			level: 14,
			walkDistance: 0
		},
		'cultist veleif': {
			level: 14,
			walkDistance: 0
		},

		'zealot': {
			level: 10
		},
		'cult leader': {
			level: 15,
			walkDistance: 0,

			deathRep: -15,
			rare: {
				count: 0
			},

			properties: {
				cpnTrade: {
					items: {
						min: 5,
						max: 10,
						extra: []
					},
					faction: {
						id: 'akarei',
						tier: 0
					},
					markup: {
						buy: 0.25,
						sell: 10
					}
				}
			}
		}
	},
	objects: {
		redwall: {
			components: {
				cpnBlocker: {
					init: function() {
						this.obj.instance.physics.setCollision(this.obj.x, this.obj.y, true);
					}
				}
			}
		},
		bigportal: {
			components: {
				cpnAttackAnimation: {
					simplify: function() {
						return {
							type: 'attackAnimation',
							spriteSheet: 'animBigObjects',
							row: 1,
							col: 0,
							frames: 6,
							frameDelay: 7,
							loop: -1,
							hideSprite: true
						};
					}
				}
			}
		},
		pinktile: {
			components: {
				cpnParticles: {
					simplify: function() {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['fc66f7', 'a24eff'],
									end: ['933159', '393268']
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
								chance: 0.04,
								randomColor: true,
								spawnType: 'rect',
								spawnRect: {
									x: -20,
									y: -20,
									w: 60,
									h: 60
								}
							}
						}
					}
				}
			}
		},
		walltrigger: {
			components: {
				cpnParticles: {
					simplify: function() {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['fff4252', 'ff6942'],
									end: ['802343', 'f953f36']
								},
								scale: {
									start: {
										min: 2,
										max: 6
									},
									end: {
										min: 0,
										max: 2
									}
								},
								speed: {
									start: {
										min: 0,
										max: 4
									},
									end: {
										min: 0,
										max: 0
									}
								},
								lifetime: {
									min: 1,
									max: 2
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.2,
								randomColor: true,
								spawnType: 'rect',
								spawnRect: {
									x: -20,
									y: -20,
									w: 40,
									h: 40
								}
							}
						}
					}
				},
				cpnTrigger: {
					init: function() {
						this.obj.instance.triggerPuzzle = {
							activated: []
						};
					},
					collisionEnter: function(o) {
						if (!o.player)
							return;

						var order = this.obj.order;
						var triggerPuzzle = this.obj.instance.triggerPuzzle;
						var activated = triggerPuzzle.activated;

						if (this.obj.forceOpen) {
							triggerPuzzle.activated = [];
							this.activate();
							return;
						}						

						activated.push(order);
						var valid = true;
						for (var i = 0; i < activated.length; i++) {
							if (activated[i] != i) {
								valid = false;
								break;
							}
						}

						if (!valid) {
							triggerPuzzle.activated = [];

							process.send({
								method: 'events',
								data: {
									'onGetAnnouncement': [{
										obj: {
											msg: 'nothing happens'
										},
										to: [o.serverId]
									}]
								}
							});

							return;
						}
						else if (activated.length == 4) {
							triggerPuzzle.activated = [];
							this.activate();
						}

						process.send({
							method: 'events',
							data: {
								'onGetAnnouncement': [{
									obj: {
										msg: this.obj.message
									},
									to: [o.serverId]
								}]
							}
						});
					},
					activate: function() {
						var syncer = this.obj.instance.syncer;
						var physics = this.obj.instance.physics;
						var walls = this.obj.instance.objects.objects.filter(o => (o.name == 'redwall'));
						walls.forEach(function(w) {
							w.destroyed = true;
							physics.setCollision(w.x, w.y, false);

							syncer.queue('onGetObject', {
								x: w.x,
								y: w.y,
								components: [{
									type: 'attackAnimation',
									row: 0,
									col: 4
								}]
							});
						});
					}
				}
			}
		},
		gas: {
			components: {
				cpnParticles: {
					simplify: function() {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['c0c3cf', '929398'],
									end: ['69696e', '69696e']
								},
								scale: {
									start: {
										min: 32,
										max: 18
									},
									end: {
										min: 16,
										max: 8
									}
								},
								speed: {
									start: {
										min: 2,
										max: 6
									},
									end: {
										min: 0,
										max: 4
									}
								},
								lifetime: {
									min: 4,
									max: 16
								},
								alpha: {
									start: 0.2,
									end: 0
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.02,
								randomColor: true,
								spawnType: 'rect',
								blendMode: 'screen',
								spawnRect: {
									x: -80,
									y: -80,
									w: 160,
									h: 160
								}
							}
						}
					}
				}
			}
		},
		bubbles: {
			components: {
				cpnParticles: {
					simplify: function() {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['48edff', '3fa7dd'],
									end: ['69696e', '42548d']
								},
								scale: {
									start: {
										min: 2,
										max: 8
									},
									end: {
										min: 2,
										max: 4
									}
								},
								speed: {
									start: {
										min: 2,
										max: 6
									},
									end: {
										min: 0,
										max: 4
									}
								},
								lifetime: {
									min: 1,
									max: 3
								},
								alpha: {
									start: 0.5,
									end: 0
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.2,
								randomColor: true,
								spawnType: 'rect',
								blendMode: 'screen',
								spawnRect: {
									x: -20,
									y: -20,
									w: 60,
									h: 60
								}
							}
						}
					}
				}
			}
		},

		shopcultleader: {
			properties: {
				cpnNotice: {
					actions: {
						enter: {
							cpn: 'dialogue',
							method: 'talk',
							args: [{
								targetName: 'cult leader'
							}]
						},
						exit: {
							cpn: 'dialogue',
							method: 'stopTalk'
						}
					}
				}
			}
		}
	}
};