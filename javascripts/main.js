(function() {

	var camera, scene, renderer;
	var materials = new Array(30);
	var current = 0;
	var maxMaterial = 0;

	var fov = 70,
		texture_placeholder,
		isUserInteracting = false,
		onMouseDownMouseX = 0,
		onMouseDownMouseY = 0,
		lon = 0,
		onMouseDownLon = 0,
		lat = 0,
		onMouseDownLat = 0,
		phi = 0,
		theta = 0,
		deltaLon = 0,
		deltaLat = 0;

	init();
	animate();

	function init() {

		var container, mesh;

		container = document.getElementById('container');

		camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 1100);
		camera.target = new THREE.Vector3(0, 0, 0);

		scene = new THREE.Scene();

		var geometry = new THREE.SphereGeometry(500, 60, 40);
		geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

		$.ajaxSetup({async: false});
		$.getJSON("./javascripts/config.json", function(data) {
			maxMaterial = data.length;
			for(var i = 0; i < maxMaterial; i++){
				materials[i] = new THREE.MeshBasicMaterial({
					map: THREE.ImageUtils.loadTexture('./images/textures/' + data[i])
				});
			}
		});
		$.ajaxSetup({async: true});

		mesh = new THREE.Mesh(geometry, materials[0]);
		scene.add(mesh);

		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		document.addEventListener('mousedown', onDocumentMouseDown, false);
		document.addEventListener('mousemove', onDocumentMouseMove, false);
		document.addEventListener('mouseup', onDocumentMouseUp, false);
		document.addEventListener('mousewheel', onDocumentMouseWheel, false);
		document.addEventListener('keydown', onDocumentKeyDown, false);
		document.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);

		//

		window.addEventListener('resize', onWindowResize, false);

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	}

	function onDocumentMouseDown(event) {

		event.preventDefault();

		isUserInteracting = true;

		onPointerDownPointerX = event.clientX;
		onPointerDownPointerY = event.clientY;

		onPointerDownLon = lon;
		onPointerDownLat = lat;

	}

	function onDocumentMouseMove(event) {

		deltaLonMax = 0.1;
		w = window.innerWidth;
		if( event.clientX < w / 4 ){
			deltaLon = (deltaLonMax * event.clientX) / (w/4) - deltaLonMax;
		} else if( event.clientX > w-(w/4)) {
			deltaLon = (deltaLonMax * event.clientX) / (w/4) - deltaLonMax*3;
		} else {
			deltaLon = 0.0;
		}

		deltaLatMax = 0.07;
		h = window.innerHeight;
		if( event.clientY < h / 4 ){
			deltaLat = -1 * ( (deltaLatMax * event.clientY) / (h/4) - deltaLatMax );
		} else if( event.clientY > h-(h/4)) {
			deltaLat = -1 * ( (deltaLatMax * event.clientY) / (h/4) - deltaLatMax*3 );
		} else {
			deltaLat = 0.0;
		}

		//now = new Date();
		//console.log(now.toISOString()+","+event.clientX + "," + event.clientY);


		if (isUserInteracting) {
			lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
			lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
		}
	}

	function onDocumentMouseUp(event) {

		isUserInteracting = false;

	}

	function onDocumentMouseWheel(event) {

		// WebKit

		if (event.wheelDeltaY) {
			fov -= event.wheelDeltaY * 0.05;
			// Opera / Explorer 9
		} else if (event.wheelDelta) {
			fov -= event.wheelDelta * 0.05;
			// Firefox
		} else if (event.detail) {
			fov += event.detail * 1.0;
		}

		camera.projectionMatrix.makePerspective(fov, window.innerWidth / window.innerHeight, 1, 1100);
		render();

	}

	function onDocumentKeyDown(event){
		var keycode = event.keyCode;
		switch(keycode){
			case 38 :
			current--;
			if( current >= 0 ){
				scene.overrideMaterial = materials[current];
			} else {
				current = maxMaterial-1;
				console.log(maxMaterial);
				scene.overrideMaterial = materials[current];
			}
			break;
			case 40 :
			current++;
			if( current < maxMaterial ){
				scene.overrideMaterial = materials[current];
			} else {
				current = 0;
				scene.overrideMaterial = materials[current];
			}
			break;
		}
	}

	function animate() {
		requestAnimationFrame(animate);
		render();
	}

	function render() {
		lat = Math.max(-85, Math.min(85, lat));
		phi = THREE.Math.degToRad(90 - lat);
		theta = THREE.Math.degToRad(lon);

		camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
		camera.target.y = 500 * Math.cos(phi);
		camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
		camera.lookAt(camera.target);

		renderer.render(scene, camera);

		lon += deltaLon;
		lat += deltaLat;

	}

})();
