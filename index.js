var Pointers = require('input-unified-pointers');
var hitTest = require('threejs-hittest');


var worldCameraPosition = new THREE.Vector3(),
	cameraVector = new THREE.Vector3(),
	projector = new THREE.Projector();


function InteractiveTransform(targetElement, camera){

	this.maxPointers = 21;
	this.onlyDragTheTopOne = true;
	this.pointerLock = false;
	this.camera = camera;
	this.targetElement = targetElement;
	this.draggedByPointer = [];
	for (var i = 0; i < this.maxPointers; i++) {
		this.draggedByPointer[i] = [];
	}
	this.dragableObjects = [];
	this.objectsBeingDragged = [];
	this.onPointerDown = this.onPointerDown.bind(this);
	this.onPointerUp = this.onPointerUp.bind(this);
	this.onPointerDrag = this.onPointerDrag.bind(this);
	var pointers = this.pointers = new Pointers(targetElement);
	pointers.onPointerDownSignal.add(this.onPointerDown);
	pointers.onPointerUpSignal.add(this.onPointerUp);
	pointers.onPointerDragSignal.add(this.onPointerDrag);
	if(targetElement.offsetWidth == 0 || targetElement.offsetWidth === undefined) throw new Error('target element has no offsetWidth. Reconsider implementation.');
}

InteractiveTransform.prototype = {
	updateCameraVector: function(x, y) {
		//flip y, just cuz
		cameraVector.set( x, -y, 0.5 );
		this.camera.updateMatrixWorld();
		cameraVector.unproject( this.camera );
		worldCameraPosition.copy(this.camera.position);
		this.camera.parent.localToWorld(worldCameraPosition);
		cameraVector.sub( worldCameraPosition ).normalize();
	},

	getIntersections: function (x, y, objects) {
		return hitTest(
			x / this.targetElement.offsetWidth * 2 - 1, 
			y / this.targetElement.offsetHeight * 2 - 1, 
			this.camera, 
			objects
		);
	},

	addObject: function(obj) {
		this.dragableObjects.push(obj);
	},

	onPointerDown: function(x, y, id) {
		this.dragableObjects.forEach(function(obj) {
			obj.updateMatrix();
			obj.updateMatrixWorld();
		});

		hitTest.testGrid(x, y, this.camera, this.dragableObjects);

		if(this.pointerLock && id === this.pointers.mouseID) {
			x = this.targetElement.offsetWidth * .5;
			y = this.targetElement.offsetHeight * .5;

		}
		var intersections = this.getIntersections(x, y, this.dragableObjects);
		//drag
		for (var i = 0; i < intersections.length; i++) {
			var intersection = intersections[i];
			var object = intersection.object;
			if(this.objectsBeingDragged.indexOf(object) != -1) continue;
			this.objectsBeingDragged.push(object);
			intersection.dragOffset = object.parent.worldToLocal( intersection.point ).sub(object.position);
			this.draggedByPointer[id].push(intersection);
			if(this.onlyDragTheTopOne) return;
		}
	},

	onPointerUp: function(x, y, id) {
		if(this.pointerLock && id === this.pointers.mouseID) {
			x = this.targetElement.offsetWidth * .5;
			y = this.targetElement.offsetHeight * .5;
		}
		var draggedIntersections = this.draggedByPointer[id];
		for (var i = draggedIntersections.length - 1; i >= 0; i--) {
			var intersection = draggedIntersections[i];
			var object = intersection.object;
			var index = this.objectsBeingDragged.indexOf(object);
			if(index !== -1) this.objectsBeingDragged.splice(index, 1);
		}
		draggedIntersections.splice(0, draggedIntersections.length);
	},

	onPointerDrag: function(x, y, id) {
		if(this.pointerLock && id === this.pointers.mouseID) {
			x = this.targetElement.offsetWidth * .5;
			y = this.targetElement.offsetHeight * .5;
			// debugger;
		}
		var draggedIntersections = this.draggedByPointer[id];
		for (var i = 0; i < draggedIntersections.length; i++) {
			var intersection = draggedIntersections[i];
			this.updateCameraVector(x / this.targetElement.offsetWidth * 2 - 1, y / this.targetElement.offsetHeight * 2 - 1);
			cameraVector.multiplyScalar(intersection.distance).add(worldCameraPosition);
			var position = intersection.object.parent.worldToLocal(cameraVector);
			intersection.object.position.copy(position).sub(intersection.dragOffset);
		}
	},

	setPointerLock: function(value) {
		this.pointerLock = value;
	}

};
module.exports = InteractiveTransform;