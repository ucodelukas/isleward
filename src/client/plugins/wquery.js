const sq = {
	default: function (q) {
		const type = typeof(q);
		if (type === 'string') {
			if (q[0] === '<')
				return this.build(q);
			return sq.find(q);
		} else if (type === 'object')
			return sq.wrap([q]);

		document.addEventListener('DOMContentLoaded', q, false);
	},

	build: function (tpl) {
		let el = document.createElement('template');
		el.innerHTML = tpl.trim();
		return sq.wrap([el.content.firstChild]);
	},

	find: function (queryString) {
		const el = (this[0] || document).querySelectorAll(queryString);
		return sq.wrap(el);
	},

	children: function () {
		return sq.wrap(this[0].children);
	},

	parent: function () {
		return sq.wrap([this[0].parentElement]);
	},

	on: function (event, fn) {
		this.each(el => el.addEventListener(event, e => {
			e.target = el;
			fn(e);
		}));

		return this;
	},

	each: function (fn) {
		const len = this.length;
		for (let i = 0; i < len; i++) 
			fn(this[i]);
	},

	appendTo: function (el) {
		if (typeof(el) === 'string')
			el = sq.find(el)[0];
		else
			el = el.on ? el[0] : el;

		this.each(c => el.appendChild(c));
		return this;
	},

	prependTo: function (el) {
		el[0].insertBefore(this[0], el.children()[0]);
		return this;
	},

	remove: function () {
		this.each(el => el.remove());	
	},

	addClass: function (classNames) {
		classNames.split(' ').forEach(c => this.each(el => el.classList.add(c)));
		return this;
	},

	removeClass: function (classNames) {
		classNames.split(' ').forEach(c => this.each(el => el.classList.remove(c)));
		return this;
	},

	hasClass: function (className) {
		return this[0].classList.contains(className);
	},

	toggleClass: function (className) {
		this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
	},

	show: function () {
		this.each(el => el.attributeStyleMap.set('display', 'block'));
		return this;
	},

	hide: function () {
		this.each(el => el.attributeStyleMap.set('display', 'none'));
		return this;	
	},

	css: function (property, value) {
		let config = property;
		let aLen = arguments.length;

		if (aLen === 1 && typeof(property) === 'string')
			return (this[0].attributeStyleMap.get(property) || {}).value;
		else if (aLen === 2) {
			config = {
				[property]: value
			};
		}

		Object.keys(config).forEach(c => {
			let val = config[c];
			if (['left', 'top', 'width', 'height'].includes(c) && (!val.indexOf || val.indexOf('%') === -1))
				val += 'px';

			this.each(el => val ? el.attributeStyleMap.set(c, val) : el.attributeStyleMap.delete(c));
		});
		return this;
	},

	empty: function () {
		let node = this[0];
		while (node.firstChild)
		    node.removeChild(node.firstChild);

		return this;
	},

	is: function (state) {
		return (this.width() && this.height());
	},

	html: function (val) {
		if (!arguments.length)
			return this[0].innerHTML;

		this[0].innerHTML = val;
		return this;
	},

	click: function () {
		this[0].click();
		return this;
	},

	next: function () {
		return sq.wrap([this[0].nextSibling]);
	},

	scrollTop: function (value) {
		if (!arguments.length)
			return this[0].scrollTop;
		
		this[0].scrollTop = value;
	},

	val: function (val) {
		if (!arguments.length)
			return this[0].value;

		this[0].value = val;
		return this;
	},

	attr: function (property, value) {
		if (arguments.length === 1)
			return this[0].getAttribute(property);

		this[0].setAttribute(property, value);
		return this;
	},

	insertAfter: function (el) {
		el[0].parentNode.insertBefore(this[0], el[0].nextSibling);
		return this;
	},

	insertBefore: function (el) {
		el[0].parentNode.insertBefore(this[0], el[0]);
		return this;
	},

	index: function () {
		let el = this[0];
		return Array.prototype.indexOf.call(el.parentElement.children, el);
	},

	offset: function () {
		return this[0].getBoundingClientRect();
	},

	data: function (property, value) {
		if (!this.dataSet)
			this.dataSet = {};

		if (arguments.length === 1)
			return this.dataSet[property];

		this.dataSet[property] = value;

		return this;
	},

	removeData: function (property) {
		if (this.dataSet)
			delete this.dataSet[property];
	},

	wrap: function (els) {
		let res = {
			length: els.length
		};

		Object.keys(sq)
			.forEach(k => res[k] = sq[k].bind(res));

		for (let i = 0; i < els.length; i++) 
			res[i] = els[i];

		return res;
	},

	width: function () {
		return this[0].offsetWidth;
	},

	height: function () {
		return this[0].offsetHeight;
	},

	eq: function (index) {
		return sq.wrap([this[index]]);
	},

	focus: function () {
		this[0].focus();
		return this;
	},

	cloneRecursive: function (o, newO) {
		if (typeof o !== 'object') 
			return o;
	    
		if (!o) 
			return o;
	 
		if (o instanceof Array) {
			if (!newO || !newO.push)
				newO = [];

			for (let i = 0; i < o.length; i++) 
				newO[i] = sq.cloneRecursive(o[i], newO[i]);
	      
			return newO;
		}

		if (!newO)
			newO = {};
		for (let i in o) {
			if (o.hasOwnProperty(i)) 
				newO[i] = sq.cloneRecursive(o[i], newO[i]);
		}
		return newO;
	},

	extend: function (temp, o) {
		let aLen = arguments.length;
		for (let i = 2; i < aLen; i++) 
			sq.cloneRecursive(arguments[i], o);

		return o;
	}
};

window.$ = sq.default.bind(sq);

Object.keys(sq).forEach(k => window.$[k] = sq[k].bind(sq));
