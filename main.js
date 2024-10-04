

window.onload = function(){

// -------------------------- make a better world.

	// define a world gravity, width and height here.
	world = new World(new Vector(0, 9.8)/*, 800, 1000*/);
	physics = new Physics();
	render = new Render(document.getElementById("canvas"));
	inputController = new InputController();
	contents = new Contents();


//---------------------------- Updating physics and rendering  
	let fps = 0;
	const maxFps = 60;  // max limit fps.
	let fpsSum = 0;
	let averageFps = [];
	let averagefpsText = 0;

	// display fps
 	//fps_text = document.getElementsByClassName("fps-text")[0];

	const tickInterval =  1 / maxFps * 1000;
	let lastUpdate = Date.now();

	function tick() {
	    var now = Date.now();
	    var deltaTime = now - lastUpdate;
	    deltaTime /= 1000; // millisecond
	    lastUpdate = now;

	    physics.tick(deltaTime); // physics update first.
	    render.tick(deltaTime);
	    contents.tick(deltaTime);  // type your game logic "Contents.js"

		fps = Math.floor(1 / deltaTime);

		averageFps.push(fps);
		fpsSum += fps;
		if (60 < averageFps.length) {
			averagefpsText = Math.floor(fpsSum / averageFps.length);
			averageFps = [];
			fpsSum = 0;
		}
		

   		//fps_text.innerText = "FPS : " + fps + ",  " + averagefpsText;

		setTimeout(tick, tickInterval);	
	}

	// loop
	tick();
}


// Keyboard key press event
window.addEventListener("keydown", (e) => {
	contents.keyDown(e)
})


