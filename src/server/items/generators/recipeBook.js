module.exports = {
	generate: function (item, { profession, teaches, sprite = [0, 5] }) {
		item.sprite = sprite;
		item.spritesheet = '';

		item.recipe = {
			profession,
			teaches
		};		
	}
};
