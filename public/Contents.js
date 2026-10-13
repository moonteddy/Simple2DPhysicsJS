// game logic
import { Vector } from './Vector.js';
import { Polygon } from './Polygon.js';
import { Circle } from './Circle.js';
import { random } from './Utils.js';

export class Contents {
	imageCache = new Map();

	paddingRight = 100;

	// Held keys repeat on our own timer : OS key repeat only fires for the last pressed key.
	heldKeys = new Map();	// keyCode -> { key, timer }
	repeatDelay = 0.4;		// seconds before a held key starts repeating
	repeatInterval = 0.05;	// seconds between repeats per held key

	// New letters pass through other letters for a moment, otherwise a held key's stream
	// jams at the spawn point (collisions replace the launch velocity).
	spawnCollisionDelay = 0.3;

	// Spawn limits : stop spawning before the frame rate drops
	maxLetters = 150;		// hard cap on letters alive at once
	frameBudgetMs = 10;		// stop spawning while a frame's work (physics + render) takes longer
	frameMs = 0;			// smoothed frame work time
	isThrottled = false;
	letterCapacity = Infinity;	// learned : letters this machine runs within the frame budget

	constructor(maxLetters = 150, frameBudgetMs = 10) {
		this.maxLetters = maxLetters;
		this.frameBudgetMs = frameBudgetMs;
		this.preloadImages();
	}

	// called once per frame with how long that frame's work took
	reportFrameTime(ms) {
		this.frameMs += (ms - this.frameMs) * 0.1;	// smoothed, a single spike doesn't throttle

		// resume only once comfortably under budget, so spawning doesn't flicker on and off
		if (this.frameMs > this.frameBudgetMs) {
			// letters in flight keep the load rising after spawning stops,
			// so remember a capacity below the count that blew the budget
			if (!this.isThrottled) {
				this.letterCapacity = Math.max(10, Math.floor(this.getLetterCount() * 0.8));
			}
			this.isThrottled = true;
		} else if (this.frameMs < this.frameBudgetMs * 0.75) {
			this.isThrottled = false;

			// plenty of headroom : slowly allow more letters again
			if (this.frameMs < this.frameBudgetMs * 0.5) {
				this.letterCapacity += 0.1;
			}
		}
	}

	getLetterCount() {
		const world = typeof window !== 'undefined' ? window.world : null;
		return world ? world.bodyArr.length - world.wallBodies.length : 0;
	}

	canSpawn() {
		return !this.isThrottled && this.getLetterCount() < Math.min(this.maxLetters, this.letterCapacity);
	}

	preloadImages() {
		// Preload alphabet images A-Z (keyCodes 65 to 90)
		for (let keyCode = 65; keyCode <= 90; keyCode++) {
			const char = String.fromCharCode(keyCode).toLowerCase();
			const img = new Image();
			img.src = `resources/${char}.png`;
			this.imageCache.set(keyCode, img);
		}
	}

	tick(deltaTime) {
		this.repeatHeldKeys(deltaTime);
		this.checkRemove();
	}

	// Physical key -> keyCode 65~90 (-1 if not a letter key).
	// event.code ("KeyA") ignores IME / Shift / layout : with the Korean IME on,
	// keydown reports keyCode 229 and key "Process" instead of the letter.
	getLetterKeyCode(event) {
		const match = /^Key([A-Z])$/.exec(event.code || "");
		return match ? match[1].charCodeAt(0) : -1;
	}

	keyDown(event) {
		const keyCode = this.getLetterKeyCode(event);
		if (keyCode < 0)
			return;

		// ignore OS auto-repeat, held keys are repeated in tick()
		if (event.repeat || this.heldKeys.has(keyCode))
			return;

		const key = String.fromCharCode(keyCode).toLowerCase();
		this.heldKeys.set(keyCode, { key, timer: this.repeatDelay });
		this.spawnLetter(keyCode, key);
	}

	keyUp(event) {
		this.heldKeys.delete(this.getLetterKeyCode(event));
	}

	// keyup is never delivered once the window loses focus
	releaseAllKeys() {
		this.heldKeys.clear();
	}

	repeatHeldKeys(deltaTime) {
		for (const [keyCode, held] of this.heldKeys) {
			held.timer -= deltaTime;

			while (held.timer <= 0) {
				this.spawnLetter(keyCode, held.key);
				held.timer += this.repeatInterval;
			}
		}
	}

	// returns the new letter, or null when spawning is limited
	spawnLetter(keyCode, key) {
		const world = typeof window !== 'undefined' ? window.world : null;
		if (!world || !this.canSpawn()) return null;

		var startPosX = this.getKeyPos(key);
		var startPosY = window.innerHeight;

		var newBody = this.getAlphabatObj(keyCode, new Vector(startPosX, startPosY));
		newBody.setImage(this.getAlphabatImage(keyCode));
		newBody.setCustomPoint(this.getAlphabatShape(keyCode));
		newBody.setImageOffset(this.getAlphabatOffset(keyCode));
		
		newBody.name = key;
		newBody.collisionDelay = this.spawnCollisionDelay;
		world.addBody(newBody);

		newBody.addForce(new Vector(random(-6, 6), random(-55, -30)));
		newBody.addTorque(random(-1, 1));
		return newBody;
	}

	getAlphabatObj(keyCode, position) {
		switch (keyCode) {
			case 65 : return new Polygon(position, 3, 50);
			case 66 : return new Polygon(position, 3, 50);
			case 67 : return new Circle(position, 50);
			case 68 : return new Polygon(position, 3, 50);
			case 69 : return new Circle(position, 45);
			case 70 : return new Polygon(position, 3, 50);
			case 71 : return new Polygon(position, 50);
			case 72 : return new Polygon(position, 50);
			case 73 : return new Polygon(position, 3, 50);
			case 74 : return new Polygon(position, 3, 50);
			case 75 : return new Polygon(position, 3, 50);
			case 76 : return new Polygon(position, 3, 50);
			case 77 : return new Polygon(position, 3, 50);
			case 78 : return new Polygon(position, 3, 50);
			case 79 : return new Circle(position, 45);
			case 80 : return new Polygon(position, 3, 50);
			case 81 : return new Polygon(position, 3, 50);
			case 82 : return new Polygon(position, 3, 50);
			case 83 : return new Polygon(position, 3, 50);
			case 84 : return new Polygon(position, 3, 50);
			case 85 : return new Polygon(position, 3, 50);
			case 86 : return new Polygon(position, 3, 50);
			case 87 : return new Polygon(position, 3, 50);
			case 88 : return new Polygon(position, 3, 50);
			case 89 : return new Polygon(position, 3, 50);
			case 90 : return new Polygon(position, 3, 50);
		}
	}

	getAlphabatImage(keyCode) {
		if (this.imageCache.has(keyCode)) {
			return this.imageCache.get(keyCode);
		}
		const char = String.fromCharCode(keyCode).toLowerCase();
		return `resources/${char}.png`;
	}

	getAlphabatShape(keyCode) {
		switch (keyCode) {
			case 65 : return [new Vector(-39, 45), new Vector(35, 45), new Vector(30, -45), new Vector(-37, -45)];
			case 66 : return [new Vector(-45, -52), new Vector(-20, -52), new Vector(20, -20), new Vector(24, 47), new Vector(-45, 47)];
			case 67 : return [];
			case 68 : return [new Vector(20, -50), new Vector(40, -50), new Vector(40, 50), new Vector(-25, 50), new Vector(-25, -20)];
			case 69 : return [];
			case 70 : return [new Vector(-25, -50), new Vector(25, -50), new Vector(15, 50), new Vector(-15, 50)];
			case 71 : return [new Vector(-30, -50), new Vector(30, -50), new Vector(30, 50), new Vector(-30, 50)];
			case 72 : return [new Vector(-35, -55), new Vector(-20, -55), new Vector(30, -20), new Vector(30, 50), new Vector(-35, 50)];
			case 73 : return [new Vector(-10, -50), new Vector(10, -50), new Vector(10, 50), new Vector(-10, 50)];
			case 74 : return [new Vector(-15, -55), new Vector(15, -55), new Vector(15, 55), new Vector(-15, 55)];
			case 75 : return [new Vector(-42, -60), new Vector(-30, -60), new Vector(40, -30), new Vector(40, 60), new Vector(-42, 60)];
			case 76 : return [new Vector(-10, -50), new Vector(10, -50), new Vector(10, 50), new Vector(-10, 50)];
			case 77 : return [new Vector(-50, -38), new Vector(50, -38), new Vector(50, 38), new Vector(-50, 38)];
			case 78 : return [new Vector(-30, -38), new Vector(30, -38), new Vector(30, 38), new Vector(-30, 38)];
			case 79 : return [];
			case 80 : return [new Vector(-42, -55), new Vector(24, -55), new Vector(24, 0), new Vector(-20, 50), new Vector(-42, 50)];
			case 81 : return [new Vector(-42, -55), new Vector(24, -55), new Vector(24, 50), new Vector(0, 50), new Vector(-42, 0)];
			case 82 : return [new Vector(-40, -45), new Vector(20, -45), new Vector(20, -25), new Vector(-20, 45), new Vector(-40, 45)];
			case 83 : return [new Vector(-30, -45), new Vector(30, -45), new Vector(30, 45), new Vector(-30, 45)];
			case 84 : return [new Vector(-30, -53), new Vector(30, -53), new Vector(30, 53), new Vector(-30, 53)];
			case 85 : return [new Vector(-35, -45), new Vector(35, -45), new Vector(35, 45), new Vector(-35, 45)];
			case 86 : return [new Vector(-40, -45), new Vector(40, -45), new Vector(10, 45), new Vector(-10, 45)];
			case 87 : return [new Vector(-50, -38), new Vector(50, -38), new Vector(30, 38), new Vector(-30, 38)];
			case 88 : return [new Vector(-40, -45), new Vector(40, -45), new Vector(40, 45), new Vector(-40, 45)];
			case 89 : return [new Vector(-40, -50), new Vector(30, -50), new Vector(-10, 50), new Vector(-40, 50)];
			case 90 : return [new Vector(-35, -45), new Vector(35, -45), new Vector(35, 45), new Vector(-35, 45)];
		}
	}

	getAlphabatOffset(keyCode) { // Image offset from the polygon centroid (area-weighted)
		switch (keyCode) {
			case 65 : return new Vector(0, 0);
			case 66 : return new Vector(1, -5);
			case 67 : return new Vector(-10, 0);
			case 68 : return new Vector(-3, -7);
			case 69 : return new Vector(0, 0);
			case 70 : return new Vector(-1, 3);
			case 71 : return new Vector(0, 0);
			case 72 : return new Vector(0, -6);
			case 73 : return new Vector(0, 0);
			case 74 : return new Vector(0, 0);
			case 75 : return new Vector(3, -5);
			case 76 : return new Vector(0, 0);
			case 77 : return new Vector(0, 0);
			case 78 : return new Vector(0, 0);
			case 79 : return new Vector(0, 0);
			case 80 : return new Vector(3, 3);
			case 81 : return new Vector(-5, 6);
			case 82 : return new Vector(5, 6);
			case 83 : return new Vector(0, 0);
			case 84 : return new Vector(0, 0);
			case 85 : return new Vector(0, 0);
			case 86 : return new Vector(-1, 7);
			case 87 : return new Vector(-2, 2);
			case 88 : return new Vector(0, 0);
			case 89 : return new Vector(7, 4);
			case 90 : return new Vector(0, 0);
		}
	}

	getKeyPos(key) {
		const xPos = (window.innerWidth - this.paddingRight) * 0.1;
		const keyGapMiddle = xPos * 0.3;
		const keyGapBottom = xPos * 0.7;

		if (key === 'q') return xPos * 1;
		if (key === 'w') return xPos * 2;
		if (key === 'e') return xPos * 3;
		if (key === 'r') return xPos * 4;
		if (key === 't') return xPos * 5;
		if (key === 'y') return xPos * 6;
		if (key === 'u') return xPos * 7;
		if (key === 'i') return xPos * 8;
		if (key === 'o') return xPos * 9;
		if (key === 'p') return xPos * 10;

		if (key === 'a') return xPos * 1 + keyGapMiddle;
		if (key === 's') return xPos * 2 + keyGapMiddle;
		if (key === 'd') return xPos * 3 + keyGapMiddle;
		if (key === 'f') return xPos * 4 + keyGapMiddle;
		if (key === 'g') return xPos * 5 + keyGapMiddle;
		if (key === 'h') return xPos * 6 + keyGapMiddle;
		if (key === 'j') return xPos * 7 + keyGapMiddle;
		if (key === 'k') return xPos * 8 + keyGapMiddle;
		if (key === 'l') return xPos * 9 + keyGapMiddle;

		if (key === 'z') return xPos * 1 + keyGapBottom;
		if (key === 'x') return xPos * 2 + keyGapBottom;
		if (key === 'c') return xPos * 3 + keyGapBottom;
		if (key === 'v') return xPos * 4 + keyGapBottom;
		if (key === 'b') return xPos * 5 + keyGapBottom;
		if (key === 'n') return xPos * 6 + keyGapBottom;
		if (key === 'm') return xPos * 7 + keyGapBottom;

		return xPos * 5;
	}

	// Safely clean up bodies that left the bottom of the screen
	checkRemove() {
		const world = typeof window !== 'undefined' ? window.world : null;
		if (!world) return;

		const bottomLimit = window.innerHeight + 150; // buffer margin so newly spawned bodies aren't prematurely removed
		for (let i = world.bodyArr.length - 1; i >= 0; i--) {
			const body = world.bodyArr[i];
			if (body.position.y > bottomLimit) {
				world.removeBody(body);
			}
		}
	}
}
