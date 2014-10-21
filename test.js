var onReady = function() {
	var View = require('threejs-managed-view').View;
	var InteractiveTransform = require('./');
	var Touch = require('input-touch');
	var view = new View({

	})

	var totalHandles = 4;
	var interactiveTransform = new InteractiveTransform(view.canvas, view.camera);

	function onSelect(object) {
		if(!object.material.colorBackup) {
			object.material.colorBackup = object.material.color.clone();
		}
		object.material.color.r = object.material.colorBackup.r + .2;
		object.material.color.g = object.material.colorBackup.g + .2;
		object.material.color.b = object.material.colorBackup.b + .2;
	};

	function onUnselect(object) {
		if(object.material.colorBackup) {
			object.material.color.copy(object.material.colorBackup);
		}

	}

	for (var i = 0; i < totalHandles; i++) {
		var handle = new THREE.Mesh(
			new THREE.SphereGeometry(1, 32, 16)
		)
		interactiveTransform.addSelectable(handle, onSelect, onUnselect);
		handle.position.x = i / totalHandles * 10;
		handle._touchstart = function(x, y) {
			console.log(x, y);
		}
		view.scene.add(handle);
		// interactiveTransform.drag(handle);
	};
	
	var testCoords = {
		x: window.innerWidth * .5, 
		y: window.innerHeight * .5
	}
	Touch.testStart(testCoords.x, testCoords.y, 0);
	Touch.testMove(testCoords.x + 200, testCoords.y + 100, 0);
	Touch.testEnd(testCoords.x + 200, testCoords.y + 100, 0);
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
