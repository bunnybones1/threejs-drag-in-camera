var Pointers = require('input-unified-pointers');
var hitTest = require('threejs-hittest');

var DOWN = 0,
	UP = 1,
	DRAG = 2,
	MOVE = 3,
	HOVER = 4,
	SELECT = 5;

var maxPointers = 21;
var onlyDragTheTopOne = true;

var worldCameraPosition = new THREE.Vector3(),
	offset = new THREE.Vector3(),
	cameraVector = new THREE.Vector3(),
	projector = new THREE.Projector();


function InteractiveTransform(canvasElement, camera){
	this.camera = camera;
	this.selected = [];
	this.draggedByPointer = [];
	for (var i = 0; i < maxPointers; i++) {
		this.draggedByPointer[i] = [];
	};
	this.dragableObjects = [];
	this.objectsBeingDragged = [];
	this.selectableObjects = [];
	this.onPointerDown = this.onPointerDown.bind(this);
	this.onPointerUp = this.onPointerUp.bind(this);
	this.onPointerDrag = this.onPointerDrag.bind(this);
	this.onPointerSelect = this.onPointerSelect.bind(this);
	Pointers.onPointerDownSignal.add(this.onPointerDown);
	Pointers.onPointerUpSignal.add(this.onPointerUp);
	Pointers.onPointerDragSignal.add(this.onPointerDrag);
	Pointers.onPointerSelectSignal.add(this.onPointerSelect);
}

InteractiveTransform.prototype = {
	updateCameraVector: function(x, y) {
		//flip y, just cuz
		cameraVector.set( x, -y, 0.5 );
		projector.unprojectVector( cameraVector, this.camera );
		worldCameraPosition.copy(this.camera.position);
		this.camera.parent.localToWorld(worldCameraPosition);
		cameraVector.sub( worldCameraPosition ).normalize();
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
		var intersections = this.getIntersections(x, y, this.dragableObjects);
		//drag
		for (var i = 0; i < intersections.length; i++) {
			var intersection = intersections[i];
			var object = intersection.object;
			if(this.objectsBeingDragged.indexOf(object) != -1) continue;
			this.objectsBeingDragged.push(object);
			intersection.dragOffset = object.parent.worldToLocal( intersection.point ).sub(object.position);
			this.draggedByPointer[id].push(intersection);
			if(onlyDragTheTopOne) return;
		};
	},

	onPointerUp: function(x, y, id) {
		var draggedIntersections = this.draggedByPointer[id];
		for (var i = draggedIntersections.length - 1; i >= 0; i--) {
			var intersection = draggedIntersections[i];
			var object = intersection.object;
			var index = this.objectsBeingDragged.indexOf(object);
			if(index !== -1) this.objectsBeingDragged.splice(index, 1);
		};
		draggedIntersections.splice(0, draggedIntersections.length);
	},

	onPointerSelect: function(x, y, id) {
		var intersections = this.getIntersections(x, y, this.selectableObjects);
		//select
		for (var i = this.selected.length - 1; i >= 0; i--) {
			this.selected[i].__pointer_onUnselect(this.selected[i]);
			this.selected.splice(i, 1);
		};
		if(intersections.length > 0) {
			this.selected.push(intersections[0].object);
			intersections[0].object.__pointer_onSelect(intersections[0].object);
		}
	},

	onPointerDrag: function(x, y, id) {
		var draggedIntersections = this.draggedByPointer[id];
		for (var i = 0; i < draggedIntersections.length; i++) {
			var intersection = draggedIntersections[i];
			this.updateCameraVector(x/window.innerWidth * 2 - 1, y/window.innerHeight * 2 - 1);
			cameraVector.multiplyScalar(intersection.distance).add(worldCameraPosition);
			var position = intersection.object.parent.worldToLocal(cameraVector);
			intersection.object.position.copy(position).sub(intersection.dragOffset);
		};
	},

};
module.exports = InteractiveTransform;