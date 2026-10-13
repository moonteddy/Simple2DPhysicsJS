
import { Body } from './Body.js';
import { Vector } from './Vector.js';
import { add, sub, scale, upVector, rotateAngleAxis, polygonCentroid } from './Utils.js';

export class Polygon extends Body {
	points = [];  // vertices

	constructor(position, vertexCount = 3, size = 50, mass = 1, bounciness = 0.5) {
		super(position, mass, bounciness);
		this.isCircle = false;

		// Array of points directly passed or generated regular polygon
		if (Array.isArray(position)) {
			this.points = position.map(p => p.clone ? p.clone() : new Vector(p.x, p.y));
			this.centerOfMass();
			return;
		}

		var angle = 360 / vertexCount;
		var firstPoint = add(position, scale(upVector(), size));
		this.points.push(firstPoint);

		for (var i = 1; i < vertexCount; i++) {
			var nextPoint = rotateAngleAxis(this.position, this.points[i - 1], angle);
			this.points.push(nextPoint);
		}
		
		this.centerOfMass();
	}

	setCustomPoint(coordinate) {
		this.points.length = 0; // array clear
		for (var i = 0; i < coordinate.length; i++) {
			this.points.push(add(this.position, coordinate[i]));
		}
	}

	addPosition(movement) {
		super.addPosition(movement);

		for (var i = 0; i < this.points.length; i++) {
			this.points[i] = add(this.points[i], movement);
		}
	}

	setPosition(position) {
		let movement = sub(position, this.position);
		this.addPosition(movement);
	}

	// Backward compatibility alias
	setPositon(position) {
		this.setPosition(position);
	}

	updatePosition() {
		if (this.physicsEnable === false)
			return;

		this.centerOfMass();

		for (var i = 0; i < this.points.length; i++) {
			this.points[i] = add(this.points[i], this.velocity);
		}
	}

	addRotation(addRotationVal) {
		super.addRotation(addRotationVal);

		for (var i = 0; i < this.points.length; i++) {
			this.points[i] = rotateAngleAxis(this.position, this.points[i], addRotationVal);
		}
	}

	updateRotation() {
		if (this.physicsEnable === false)
			return;

		super.updateRotation();
		this.addRotation(this.torque);
	}

	isInside(point) {
		var inside = false;

		for (var i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
			var xi = this.points[i].x, yi = this.points[i].y;
			var xj = this.points[j].x, yj = this.points[j].y;
			
			var intersect = ((yi > point.y) !== (yj > point.y))
				&& (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

			if (intersect) inside = !inside;
		}
		
		return inside;
	}

	centerOfMass() {
		if (this.points.length < 3)
			return;

		this.position = polygonCentroid(this.points);
	}

	setBoundingBox() {
		if (this.points.length === 0) return;

		let minX = this.points[0].x;
		let maxX = this.points[0].x;
		let minY = this.points[0].y;
		let maxY = this.points[0].y;

		for (var i = 1; i < this.points.length; i++) {
			const px = this.points[i].x;
			const py = this.points[i].y;
			if (px < minX) minX = px;
			if (px > maxX) maxX = px;
			if (py < minY) minY = py;
			if (py > maxY) maxY = py;
		}

		this.boundingBox.minX = minX;
		this.boundingBox.minY = minY;
		this.boundingBox.maxX = maxX;
		this.boundingBox.maxY = maxY;
	}
}