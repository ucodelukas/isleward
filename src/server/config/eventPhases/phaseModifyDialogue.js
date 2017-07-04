define([
	
], function(
	
) {
	return {
		init: function() {
			var mob = this.instance.objects.objects.find(m => (m.id == this.mobId));
			console.log(this.event.age);
		}
	};
});