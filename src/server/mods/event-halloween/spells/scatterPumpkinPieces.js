define([

], function (

) {
	var cpnPumpkinChunk = {
		type: 'pumpkinChunk',

		collisionEnter: function (o) {
			if (!o.aggro)
				return;

			var isPlayer = !!this.caster.player;
			var isTargetPlayer = !!o.player;

			if ((!this.caster.aggro.canAttack(o)) && (isPlayer == isTargetPlayer))
				return;

			this.contents.push(o);
		}
	};

	return {
		type: 'scatterPumpkinPieces',

		cdMax: 5,
		manaCost: 0,

		cast: function (action) {
			//Shoot Chunk

			//Make Chunk Lootable

			//	
		}
	};
});
