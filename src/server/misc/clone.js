const oArray = '[object Array]';

let cloneRecursive = function (o, newO) {
	let i;
  
	if (typeof o !== 'object') 
		return o;
    
	if (!o) 
		return o;
 
	if (Object.prototype.toString.apply(o) === oArray) {
		if (!newO)
			newO = [];

		let oLen = o.length;
		for (i = 0; i < oLen; i++) {
			if (newO[i] === undefined)
				newO[i] = cloneRecursive(o[i]);
			else
				cloneRecursive(o[i], newO[i]);
		}
      
		return newO;
	}

 	if (!newO)
		newO = {};
	for (i in o) {
		if (o.hasOwnProperty(i)) {
			if (newO[i] === undefined)
				newO[i] = cloneRecursive(o[i]);
			else
				newO[i] = cloneRecursive(o[i], newO[i]);
		}
	}
	return newO;
};

let clone = function (o) {
	let aLen = arguments.length;
	for (let i = 1; i < aLen; i++) 
		cloneRecursive(arguments[i], o);

	return o;
};

module.exports = clone;
