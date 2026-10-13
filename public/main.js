import { Vector } from './Vector.js';
import { World } from './World.js';
import { Physics } from './Physics.js';
import { Render } from './Render.js';
import { InputController } from './InputController.js';
import { Contents } from './Contents.js';

const GRAVITY = 9.8;		// earth gravity, keep constant
const GRAVITY_SCALE = 6;	// tune fall speed here (also live via world.gravityScale in devtools)

// letter vs letter collision (also live via physics.collisionForceScale / collisionTorqueScale)
const COLLISION_FORCE_SCALE = 1;	// how hard overlapping letters push apart (0.3 ~ 2 recommended)
const COLLISION_TORQUE_SCALE = 0.5;	// how much a polygon hit spins letters (0 = no spin)

// spawn limits (also live via contents.maxLetters / frameBudgetMs)
const MAX_LETTERS = 150;		// letters alive at once
const FRAME_BUDGET_MS = 10;		// stop spawning while physics + render take longer than this per frame

let world;
let physics;
let render;
let inputController;
let contents;

function init() {
	const canvas = document.getElementById("canvas");

	// Initialize world, physics engine, renderer, input and content logic
	world = new World(new Vector(0, GRAVITY), window.innerWidth, window.innerHeight, GRAVITY_SCALE);
	physics = new Physics(COLLISION_FORCE_SCALE, COLLISION_TORQUE_SCALE);
	render = new Render(canvas);
	contents = new Contents(MAX_LETTERS, FRAME_BUDGET_MS);
	inputController = new InputController();

	// Side walls only : letters launch above the screen and fall out of the bottom to be removed.
	// The walls extend above the screen so letters can't escape sideways while airborne.
	world.makeWorldEdges({ top: false, bottom: false, overhang: 2000, thickness: 1000 });

	// Expose globally for devtools & backward compatibility
	window.world = world;
	window.physics = physics;
	window.render = render;
	window.inputController = inputController;
	window.contents = contents;

	// Handle window resize dynamically
	window.addEventListener("resize", () => {
		world.resize(window.innerWidth, window.innerHeight);
	});

	// Fixed timestep loop (60 physics ticks per second)
	const FIXED_STEP = 1 / 60;
	let accumulator = 0;
	let lastTime = performance.now();

	function frame(currentTime) {
		const workStart = performance.now();

		let deltaTime = (currentTime - lastTime) / 1000;
		lastTime = currentTime;

		// Prevent spiraling of death if browser tab was inactive or lag spike occurred
		deltaTime = Math.min(deltaTime, 0.1);
		accumulator += deltaTime;

		// Fixed timestep updates for physics & game logic
		while (accumulator >= FIXED_STEP) {
			physics.tick(FIXED_STEP);
			contents.tick(FIXED_STEP);
			accumulator -= FIXED_STEP;
		}

		// Rendering synchronized with screen refresh rate
		render.tick(deltaTime);

		contents.reportFrameTime(performance.now() - workStart);

		requestAnimationFrame(frame);
	}

	requestAnimationFrame(frame);
}

// Keyboard key press event
window.addEventListener("keydown", (e) => {
	if (contents) {
		contents.keyDown(e);
	}
});

window.addEventListener("keyup", (e) => {
	if (contents) {
		contents.keyUp(e);
	}
});

// Keys held while the window loses focus never get a keyup
window.addEventListener("blur", () => {
	if (contents) {
		contents.releaseAllKeys();
	}
});

// Start when DOM is loaded
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
