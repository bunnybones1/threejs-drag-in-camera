var onReady = function() {
	var View = require('threejs-managed-view').View;
	var FirstPersonController = require('threejs-camera-controller-first-person-desktop');
	var DragInCamera = require('./');
	var view = new View({
		stats: true
	});

	var totalHandles = 4;
	var dragInCamera = new DragInCamera(view.canvas, view.camera);

	var geometry = new THREE.SphereGeometry(1, 32, 16);
	for (var i = 0; i < totalHandles; i++) {
		var handle = new THREE.Mesh( geometry);
		dragInCamera.addObject(handle);
		handle.position.x = i / totalHandles * 8;
		view.scene.add(handle);
	}
	
	//phantom touch test
	setTimeout(function() {

		var testCoords = {
			x: window.innerWidth * .75,
			y: window.innerHeight * .5
		};

		// view.camera.updateMatrix();
		// view.camera.updateMatrixWorld();
		// view.camera.updateProjectionMatrix();

		dragInCamera.pointers.onPointerDownSignal.add(function(){
			console.log('down')
			dragInCamera.objectsBeingDragged.forEach(function(obj) {
				obj.material.color.set(0xffffff);
			})

		})
		dragInCamera.pointers.onPointerUpSignal.add(function(){
			console.log('up')
			dragInCamera.dragableObjects.forEach(function(obj) {
				obj.material.color.set(0x7f7f7f);
			})
		})

		dragInCamera.pointers.mouse.testMove(testCoords.x, testCoords.y);
		dragInCamera.pointers.mouse.testDown(testCoords.x, testCoords.y);
		view.camera.position.x += 1;
		dragInCamera.pointers.mouse.testMove(testCoords.x, testCoords.y);
		dragInCamera.pointers.mouse.testUp(testCoords.x, testCoords.y);
		dragInCamera.setPointerLock(true);
		// dragInCamera.pointers.mouse.testMove(testCoords.x, testCoords.y);
		// dragInCamera.pointers.mouse.testDown(testCoords.x, testCoords.y);
		// // // view.camera.position.y -= .1;
		// // // view.camera.position.z -= .1;
		// dragInCamera.pointers.mouse.testMove(testCoords.x + 2, testCoords.y + 1);
		// dragInCamera.pointers.mouse.testUp(testCoords.x + 2, testCoords.y + 1);
		var fpsController = new FirstPersonController(view.camera, view.canvas);

		view.renderManager.onEnterFrame.add(function() {
			fpsController.update();
			dragInCamera.update();
		})

	}, 500)
};

var loadAndRunScripts = require('loadandrunscripts');
loadAndRunScripts(
	[
		'bower_components/three.js/three.js',
		'lib/stats.min.js',
		'lib/threex.rendererstats.js'
	],
	onReady
);
