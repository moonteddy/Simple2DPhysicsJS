import { Vector } from './Vector.js';

export class InputController {
	clickedBody = null;

	constructor() {
		const render = typeof window !== 'undefined' ? window.render : null;
		if (render && render.canvas) {
			render.canvas.onmousedown = (e) => this.mouseDown(e);
			render.canvas.onmousemove = (e) => this.mouseMove(e);
			render.canvas.onmouseup = (e) => this.mouseUp(e);
		}
	}

	mouseDown(event) {
		const render = typeof window !== 'undefined' ? window.render : null;
		const world = typeof window !== 'undefined' ? window.world : null;
		if (!render || !world) return;

		const rect = render.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		for (var i = 0; i < world.bodyArr.length; i++) {
			if (world.bodyArr[i].isInside(new Vector(x, y))) {
				this.clickedBody = world.bodyArr[i];
				this.clickedBody.queryOnly = true;
				this.clickedBody.addTorque(1);
				break;
			}
		}
	}

	mouseMove(event) {
		if (this.clickedBody) {
			this.clickedBody.addPosition(new Vector(event.movementX, event.movementY));
		}
	}

	mouseUp(event) {
		if (this.clickedBody) {
			this.clickedBody.queryOnly = false;
			this.clickedBody = null;	
		}
	}
}
