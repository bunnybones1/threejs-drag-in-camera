var Pointers = require('input-unified-pointers');
var hitTest = require('threejs-hittest');

var DOWN = 0,
	UP = 1,
	DRAG = 2,
	MOVE = 3,
	HOVER = 4,
	SELECT = 5;

var _selected = [];

function InteractiveTransform(canvasElement, camera){
	this.camera = camera;
	this.dragableObjects = [];
	this.selectableObjects = [];
	this.onPointerDown = this.onPointerDown.bind(this);
	this.onPointerUp = this.onPointerUp.bind(this);
	this.onPointerSelect = this.onPointerSelect.bind(this);
	Pointers.onPointerDownSignal.add(this.onPointerDown);
	Pointers.onPointerUpSignal.add(this.onPointerUp);
	Pointers.onPointerSelectSignal.add(this.onPointerSelect);
}

InteractiveTransform.prototype = {
	processPointer: function (id, state, x, y, intersections) {
		switch(state) {
			case SELECT:
				if(intersections.length > 0) {
					_selected.push(intersections[0].object);
					intersections[0].object.__pointer_onSelect(intersections[0].object);
				} else {
					for (var i = _selected.length - 1; i >= 0; i--) {
						_selected[i].__pointer_onUnselect(_selected[i]);
						_selected.splice(i, 1);
					};
				}
				break;
			case DRAG:
				break;
			case MOVE:
				break;
			case DOWN:
				break;
			case UP:
				break;
			case HOVER:
				break;
		}
		console.log(id, state, intersections);
	},

	getIntersections: function (x, y, objects) {
		return hitTest(
			x / window.innerWidth * 2 - 1, 
			y / window.innerHeight * 2 - 1, 
			this.camera, 
			objects
		);
	},

	addSelectable: function(obj, selectCallback, unselectCallback) {
		this.selectableObjects.push(obj);
		obj.__pointer_onSelect = selectCallback;
		obj.__pointer_onUnselect = unselectCallback;
	},

	addDragable: function(obj) {
		this.dragableObjects.push(obj);
	},

	onPointerDown: function(x, y, id) {
		var intersections = this.getIntersections(x, y, this.selectableObjects);
		this.processPointer(id, DOWN, x, y, intersections);
	},

	onPointerSelect: function(x, y, id) {
		var intersections = this.getIntersections(x, y, this.selectableObjects);
		this.processPointer(id, SELECT, x, y, intersections);
	},

	onPointerUp: function(x, y, id) {
		this.processPointer(id, UP, x, y);
	},

};
module.exports = InteractiveTransform;