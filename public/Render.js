

import { Vector } from './Vector.js';
import { add, degreeToRadian } from './Utils.js';

// Draw debug renderer
export class Render {
	ctx;
	canvas;

	// debug draw options
	isDrawWorldbase = true;
	isDrawDebug = true;

	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
	}

	// render options...
	settings(isDrawWorldbase, isDrawDebug) {
		this.isDrawWorldbase = isDrawWorldbase;
		this.isDrawDebug = isDrawDebug;
	}

	tick(deltaTime) {
		const world = typeof window !== 'undefined' ? window.world : null;
		if (!world) return;

		// clear canvas every frame
		this.ctx.clearRect(0, 0, world.width, world.height);

		//this.drawWorldBase();
		this.drawAllBodies();
		//this.debugDraw();
		//this.drawDot(physics.A);
	}

	drawWorldBase() {
		if (false === this.isDrawWorldbase)
			return;

		const world = typeof window !== 'undefined' ? window.world : null;
		const physics = typeof window !== 'undefined' ? window.physics : null;
		if (!world || !physics) return;

		// draw a border of world .
		this.drawPolygon(world.points, "gray");

		// draw a cross hair.
		this.drawLine(new Vector(0, physics.crosshairPosition.y), new Vector(world.width, physics.crosshairPosition.y), "gray");
		this.drawLine(new Vector(physics.crosshairPosition.x, 0), new Vector(physics.crosshairPosition.x, world.height), "gray");
	}

	drawAllBodies() {
		const world = typeof window !== 'undefined' ? window.world : null;
		if (!world) return;

		// draw all bodies.
		for (var i = 0; i < world.bodyArr.length; i++) {
			var body = world.bodyArr[i];

			if (body.isImageLoaded) {
				var offset = add(body.position, body.imageOffset);
				this.drawImage(body.image, offset, degreeToRadian(body.rotation));
			}
		}
	}

	drawCircle(center, radius) {
		this.ctx.strokeStyle = "gray";
		this.ctx.beginPath();
		this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
		this.ctx.stroke();
	}

	drawPolygon(points, color = "gray", fill = false) {
		if (points.length < 2)
			return;

		this.ctx.strokeStyle = color;
		this.ctx.beginPath();
		this.ctx.moveTo(points[0].x, points[0].y);

		for (var i = 1; i < points.length; i++) {
			this.ctx.lineTo(points[i].x, points[i].y);
		}

		this.ctx.lineTo(points[0].x, points[0].y);

		if (fill)
			this.ctx.fill();
		else
			this.ctx.stroke();
	}

	drawDot(position, color = "red") {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(position.x - 1, position.y - 1, 2, 2);
	}

	drawLine(start, end, color = "orange", thickness = 1) {
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = thickness;
		this.ctx.beginPath();
		this.ctx.moveTo(start.x, start.y);
		this.ctx.lineTo(end.x, end.y);
		this.ctx.stroke();
	}

	drawText(text, position, font = "16px serif") {
		this.ctx.font = font;
		this.ctx.fillText(text, position.x, position.y);
	}

	drawImage(img, pos, rot) {
		this.ctx.save();
		this.ctx.translate(pos.x, pos.y);
		this.ctx.rotate(rot);
		this.ctx.drawImage(img, -img.width / 2, -img.height / 2);
		this.ctx.restore();
	}

	debugDraw() {
		if (false === this.isDrawDebug)
			return;

		const physics = typeof window !== 'undefined' ? window.physics : null;
		if (!physics) return;

		// draw minkowski diff points
		for (var i = 0; i < physics.minkowskiDiffArr.length; i++) {
			this.drawDot(add(physics.minkowskiDiffArr[i], physics.crosshairPosition), "black");
		}

		this.drawPolygon(physics.epaArr, "green");
		this.drawLine(physics.dsitLineA, physics.dsitLineB, "blue");

		for (var i = 0; i < physics.hitPointsArr.length; i++) {
			this.drawCircle(physics.hitPointsArr[i], 5);
		}

		if (physics.hitLine.length > 0)
			this.drawLine(physics.hitLine[0], physics.hitLine[1]);

		// clear arr
		physics.minkowskiDiffArr = [];
		physics.convexHullArr = [];
		physics.epaArr = [];
		physics.hitPointsArr = [];
		physics.hitLine = [];
	}
}