var onReady = function() {
	var View = require('threejs-managed-view').View;
	var DragInCamera = require('./');
	var view = new View({
		stats: true
	})

	var totalHandles = 4;
	var dragInCamera = new DragInCamera(view.canvas, view.camera);

	var geometry = new THREE.SphereGeometry(1, 32, 16)
	for (var i = 0; i < totalHandles; i++) {
		var handle = new THREE.Mesh( geometry)
		dragInCamera.addDragable(handle);
		handle.position.x = i / totalHandles * 8;
		view.scene.add(handle);
	};
	
	//phantom touch test
	setTimeout(function() {

		var testCoords = {
			x: window.innerWidth * .5,
			y: window.innerHeight * .5
		}

		dragInCamera.pointers.touch.testStart(testCoords.x, testCoords.y, 0);
		dragInCamera.pointers.touch.testMove(testCoords.x + 200, testCoords.y + 100, 0);
		dragInCamera.pointers.touch.testEnd(testCoords.x + 200, testCoords.y + 100, 0);
	}, 500)
}

var loadAndRunScripts = require('loadandrunscripts');
loadAndRunScripts(
	[
		'bower_components/three.js/three.js',
		'lib/stats.min.js',
		'lib/threex.rendererstats.js',
	],
	onReady
);
